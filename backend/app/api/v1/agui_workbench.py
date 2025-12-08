"""AG-UI Protocol Workbench API endpoints."""

import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ag_ui.encoder import EventEncoder

from backend.app.core.deps import get_db
from backend.app.services.agui_bridge import A2AtoAGUIBridge
from backend.app.services.workbench_service import WorkbenchService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agui", tags=["agui-workbench"])


class AGUIMessage(BaseModel):
    """AG-UI Protocol message format."""

    role: str
    content: str | dict


class RunAgentRequest(BaseModel):
    """Request body for AG-UI /run endpoint."""

    thread_id: str = Field(description="Thread/session ID")
    run_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Run ID")
    messages: list[AGUIMessage] = Field(description="Conversation messages")


@router.post("/run")
async def agui_run_agent(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> StreamingResponse:
    """AG-UI Protocol endpoint for running agents.

    This endpoint accepts AG-UI format requests and streams AG-UI events back.
    It bridges to existing A2A Protocol agents via WorkbenchService.

    Args:
        request: FastAPI request (for Accept header and body)
        db: Database session

    Returns:
        StreamingResponse with AG-UI events (SSE format)

    Raises:
        404: Session not found
        500: Internal server error
    """
    # Parse request body manually to handle CopilotKit's format
    try:
        body = await request.json()
        print(f"[AG-UI DEBUG] Request URL: {request.url}", flush=True)
        print(f"[AG-UI DEBUG] Query params: {dict(request.query_params)}", flush=True)
        print(f"[AG-UI DEBUG] Request body: {body}", flush=True)
        logger.info(f"AG-UI request URL: {request.url}")
        logger.info(f"AG-UI request body: {body}")
    except Exception as e:
        print(f"[AG-UI DEBUG] Failed to parse: {e}", flush=True)
        logger.error(f"Failed to parse request body: {e}")
        body = {}

    # Extract fields from request body (CopilotKit format may vary)
    thread_id = body.get("thread_id") or body.get("threadId") or str(uuid.uuid4())
    run_id = body.get("run_id") or body.get("runId") or str(uuid.uuid4())
    messages = body.get("messages", [])

    # Extract agent_name from custom header, query parameter, or body
    agent_name = (
        request.headers.get("X-Agent-Name") or
        request.query_params.get("agent") or
        body.get("agent_name")
    )
    if not agent_name:
        raise HTTPException(
            status_code=400,
            detail="Missing agent name (X-Agent-Name header, 'agent' query param, or 'agent_name' in body)"
        )

    logger.info(f"[AG-UI ENDPOINT] Request for agent: {agent_name}, thread_id: {thread_id}, {len(messages)} messages")
    print(f"[AG-UI ENDPOINT] Request for agent: {agent_name}, thread_id: {thread_id}, {len(messages)} messages", flush=True)

    service = WorkbenchService(db)

    # Extract Accept header for encoder
    accept_header = request.headers.get("accept", "text/event-stream")
    encoder = EventEncoder(accept=accept_header)

    # Create bridge
    bridge = A2AtoAGUIBridge(
        thread_id=thread_id,
        run_id=run_id,
        encoder=encoder,
    )

    async def event_generator():
        """Generate AG-UI events from A2A agent interaction."""
        print(f"[EVENT_GENERATOR] Starting for thread_id={thread_id}, {len(messages)} messages", flush=True)
        logger.info(f"[EVENT_GENERATOR] Starting for thread_id={thread_id}, {len(messages)} messages")
        try:
            # Handle initial connection (empty messages)
            if not messages:
                logger.info("AG-UI initial connection (empty messages) - returning empty stream")
                # Just return without yielding any events - this is CopilotKit's connection test
                return

            # Extract user message content
            user_messages = [m for m in messages if m.get("role") == "user"]
            logger.info(f"[AG-UI] Found {len(user_messages)} user messages out of {len(messages)} total messages")

            if not user_messages:
                logger.warning(f"No user messages found in {len(messages)} messages")
                return

            last_user_msg = user_messages[-1]
            user_content = last_user_msg.get("content", "")
            logger.info(f"[AG-UI] Last user message content type: {type(user_content)}, value: {user_content}")

            # Handle different content formats
            if isinstance(user_content, dict):
                user_content = user_content.get("text", "")
            elif isinstance(user_content, list):
                # Handle array of content parts
                text_parts = [p.get("text", "") for p in user_content if p.get("type") == "text"]
                user_content = " ".join(text_parts)

            logger.info(f"[AG-UI] Processed user content: '{user_content}'")

            if not user_content or not user_content.strip():
                logger.warning(f"Empty user content after processing")
                return

            # Call A2A agent via WorkbenchService
            logger.info(
                f"AG-UI request: agent={agent_name}, session={thread_id}, message='{user_content[:50]}...'"
            )

            # Ensure session exists (create if needed)
            session = await service.get_session(thread_id)
            if not session:
                logger.info(f"Creating new session {thread_id} for agent {agent_name}")
                session = await service.create_session(agent_name=agent_name)
                # Use the provided thread_id instead of auto-generated one
                session.session_id = thread_id
                await db.commit()

            # Send message to agent (reuse existing service)
            user_msg, agent_msg = await service.send_message(
                session_id=thread_id,
                content=user_content,
            )

            # Stream AG-UI events
            async for event in bridge.stream_from_agent(
                user_msg_content=user_content,
                agent_msg_content=agent_msg.content,
            ):
                yield event

        except ValueError as e:
            logger.error(f"AG-UI validation error: {e}")
            from ag_ui.core.events import RunErrorEvent, EventType

            yield encoder.encode(
                RunErrorEvent(
                    type=EventType.RUN_ERROR,
                    message=str(e),
                    code="VALIDATION_ERROR",
                )
            )

        except HTTPException as e:
            logger.error(f"AG-UI HTTP error: {e.detail}")
            from ag_ui.core.events import RunErrorEvent, EventType

            yield encoder.encode(
                RunErrorEvent(
                    type=EventType.RUN_ERROR,
                    message=e.detail,
                    code=f"HTTP_{e.status_code}",
                )
            )

        except Exception as e:
            logger.error(f"AG-UI unexpected error: {e}", exc_info=True)
            from ag_ui.core.events import RunErrorEvent, EventType

            yield encoder.encode(
                RunErrorEvent(
                    type=EventType.RUN_ERROR,
                    message="Internal server error",
                    code="INTERNAL_ERROR",
                )
            )

    return StreamingResponse(
        event_generator(),
        media_type=encoder.get_content_type(),
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@router.get("/health")
async def agui_health() -> dict:
    """Health check endpoint for AG-UI service.

    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "protocol": "AG-UI",
        "version": "1.0.0",
    }
