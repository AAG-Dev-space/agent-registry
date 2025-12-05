"""CopilotKit integration for A2A Agent Workbench."""

import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from copilotkit import CopilotKitSDK, Action as CopilotAction
from copilotkit.integrations.fastapi import add_fastapi_endpoint

from backend.app.core.deps import get_db
from backend.app.services.workbench_service import WorkbenchService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/copilotkit", tags=["copilotkit-workbench"])


# A2A Agent Action wrapper for CopilotKit
async def chat_with_agent(
    message: str,
    session_id: str | None = None,
    db: AsyncSession | None = None,
) -> dict[str, Any]:
    """
    Chat with an A2A agent through CopilotKit.

    Args:
        message: User message to send to the agent
        session_id: Optional session ID (will be created if not provided)
        db: Database session (injected by CopilotKit)

    Returns:
        Dictionary containing agent response
    """
    if db is None:
        raise ValueError("Database session is required")

    service = WorkbenchService(db)

    try:
        # If no session ID, we need to create one
        # For now, we'll use a default agent name (this should be configurable)
        if not session_id:
            # This is a limitation - we need to know which agent to use
            # We'll handle this by having the frontend pass the agent name
            logger.warning("No session_id provided, creating new session")
            raise ValueError("session_id is required")

        # Send message to agent
        user_msg, agent_msg = await service.send_message(
            session_id=session_id,
            content=message,
        )

        return {
            "response": agent_msg.content.get("text", ""),
            "session_id": session_id,
            "message_id": agent_msg.id,
        }

    except Exception as e:
        logger.error(f"Error in chat_with_agent: {e}", exc_info=True)
        raise


# CopilotKit Action definition
chat_action = CopilotAction(
    name="chatWithAgent",
    description="Send a message to the A2A agent and get a response",
    parameters=[
        {
            "name": "message",
            "type": "string",
            "description": "The message to send to the agent",
            "required": True,
        },
        {
            "name": "session_id",
            "type": "string",
            "description": "The session ID for the conversation",
            "required": False,
        },
    ],
    handler=chat_with_agent,
)


def create_copilotkit_sdk(db: AsyncSession) -> CopilotKitSDK:
    """
    Create a CopilotKit SDK instance with A2A agent actions.

    Args:
        db: Database session to inject into action handlers

    Returns:
        Configured CopilotKitSDK instance
    """
    # Inject database session into action handler
    async def chat_with_agent_wrapper(message: str, session_id: str | None = None) -> dict[str, Any]:
        return await chat_with_agent(message=message, session_id=session_id, db=db)

    # Create action with wrapped handler
    action = CopilotAction(
        name="chatWithAgent",
        description="Send a message to the A2A agent and get a response",
        parameters=[
            {
                "name": "message",
                "type": "string",
                "description": "The message to send to the agent",
                "required": True,
            },
            {
                "name": "session_id",
                "type": "string",
                "description": "The session ID for the conversation",
                "required": False,
            },
        ],
        handler=chat_with_agent_wrapper,
    )

    return CopilotKitSDK(actions=[action])


# We'll add the FastAPI endpoint in main.py since it needs special handling
# This router is just for organization
