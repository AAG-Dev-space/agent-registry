"""Workbench service for managing chat sessions and A2A communication."""

import logging
import time
import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any, Dict, List, Literal, Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.models.agent import AgentModel
from backend.app.models.agent_instance import AgentInstanceModel
from backend.app.models.chat_session import ChatMessageModel, ChatSessionModel

logger = logging.getLogger(__name__)


@dataclass
class TraceEvent:
    """Single trace event in agent execution flow.

    Captures execution events like agent start/end, LLM requests/responses,
    and tool calls/responses for observability and debugging.
    """

    event_id: str
    event_type: Literal[
        "agent_start",
        "agent_end",
        "llm_request",
        "llm_response",
        "tool_call",
        "tool_response",
        "error",
    ]
    timestamp: str  # ISO 8601 format
    duration_ms: Optional[int] = None  # For *_end/*_response events

    # Event-specific data
    agent_name: Optional[str] = None
    tool_name: Optional[str] = None
    tool_input: Optional[Dict[str, Any]] = None
    tool_output: Optional[str] = None
    llm_request: Optional[str] = None  # Prompt
    llm_response: Optional[str] = None  # Response
    error_message: Optional[str] = None

    # Metadata
    parent_id: Optional[str] = None  # For hierarchical traces
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "timestamp": self.timestamp,
            "duration_ms": self.duration_ms,
            "agent_name": self.agent_name,
            "tool_name": self.tool_name,
            "tool_input": self.tool_input,
            "tool_output": self.tool_output,
            "llm_request": self.llm_request,
            "llm_response": self.llm_response,
            "error_message": self.error_message,
            "parent_id": self.parent_id,
            "metadata": self.metadata,
        }


class WorkbenchService:
    """Service for managing chat sessions and A2A agent communication."""

    def __init__(self, db: AsyncSession):
        """Initialize service with database session."""
        self.db = db

    async def create_session(self, agent_name: str) -> ChatSessionModel:
        """Create a new chat session for an agent.

        Args:
            agent_name: Name of the agent to chat with

        Returns:
            ChatSessionModel: Created session

        Raises:
            ValueError: If agent not found
        """
        # Verify agent exists
        result = await self.db.execute(
            select(AgentModel).where(AgentModel.name == agent_name)
        )
        agent = result.scalar_one_or_none()
        if not agent:
            raise ValueError(f"Agent '{agent_name}' not found")

        # Create session
        session = ChatSessionModel(
            session_id=str(uuid.uuid4()),
            agent_name=agent_name,
            created_at=datetime.now(UTC).replace(tzinfo=None),
            last_message_at=datetime.now(UTC).replace(tzinfo=None),
        )

        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)

        logger.info(f"Created chat session {session.session_id} for agent '{agent_name}'")
        return session

    async def list_agent_sessions(self, agent_name: str) -> List[ChatSessionModel]:
        """List all chat sessions for an agent.

        Args:
            agent_name: Agent name

        Returns:
            List of ChatSessionModel

        Raises:
            ValueError: If agent not found
        """
        # Verify agent exists
        result = await self.db.execute(
            select(AgentModel).where(AgentModel.name == agent_name)
        )
        agent = result.scalar_one_or_none()
        if not agent:
            raise ValueError(f"Agent '{agent_name}' not found")

        # Get all sessions for this agent, ordered by last_message_at desc
        result = await self.db.execute(
            select(ChatSessionModel)
            .where(ChatSessionModel.agent_name == agent_name)
            .options(selectinload(ChatSessionModel.messages))
            .order_by(ChatSessionModel.last_message_at.desc())
        )
        return list(result.scalars().all())

    async def get_session(self, session_id: str) -> Optional[ChatSessionModel]:
        """Get a chat session by ID.

        Args:
            session_id: Session ID

        Returns:
            ChatSessionModel or None
        """
        result = await self.db.execute(
            select(ChatSessionModel)
            .where(ChatSessionModel.session_id == session_id)
            .options(selectinload(ChatSessionModel.messages))
        )
        return result.scalar_one_or_none()

    async def delete_session(self, session_id: str) -> bool:
        """Delete a chat session.

        Args:
            session_id: Session ID

        Returns:
            bool: True if deleted, False if not found
        """
        session = await self.get_session(session_id)
        if not session:
            return False

        await self.db.delete(session)
        await self.db.commit()

        logger.info(f"Deleted chat session {session_id}")
        return True

    async def send_message(
        self,
        session_id: str,
        content: str,
    ) -> tuple[ChatMessageModel, ChatMessageModel]:
        """Send a message to an agent and get response.

        Args:
            session_id: Session ID
            content: Message text from user

        Returns:
            tuple: (user_message, agent_response_message)

        Raises:
            ValueError: If session not found or agent instance not available
        """
        # Get session
        session = await self.get_session(session_id)
        if not session:
            raise ValueError(f"Session '{session_id}' not found")

        # Save user message
        user_message = ChatMessageModel(
            message_id=str(uuid.uuid4()),
            session_id=session_id,
            role="user",
            content={"text": content},
            created_at=datetime.now(UTC).replace(tzinfo=None),
        )
        self.db.add(user_message)

        # Get agent instance
        result = await self.db.execute(
            select(AgentInstanceModel)
            .where(AgentInstanceModel.agent_name == session.agent_name)
            .where(AgentInstanceModel.status == "running")
        )
        instance = result.scalar_one_or_none()

        if not instance:
            # No running instance - save error message
            error_message = ChatMessageModel(
                message_id=str(uuid.uuid4()),
                session_id=session_id,
                role="system",
                content={
                    "text": f"Agent '{session.agent_name}' is not currently running. Please start an instance first.",
                    "error": True,
                },
                created_at=datetime.now(UTC).replace(tzinfo=None),
            )
            self.db.add(error_message)
            await self.db.commit()
            await self.db.refresh(user_message)
            await self.db.refresh(error_message)
            return user_message, error_message

        # Connect to agent via JSONRPC (ADK A2A Protocol)
        try:
            agent_url = f"http://host.docker.internal:{instance.port}"
            logger.info(f"Connecting to agent at {agent_url}")

            # Send message to agent via JSONRPC and capture trace
            msg_id = str(uuid.uuid4())
            response, trace = await self._invoke_agent_via_jsonrpc(
                agent_url, content, msg_id, agent_name=session.agent_name
            )

            # Save agent response with trace data
            agent_message = ChatMessageModel(
                message_id=str(uuid.uuid4()),
                session_id=session_id,
                role="agent",
                content={"text": response, "trace": trace},
                created_at=datetime.now(UTC).replace(tzinfo=None),
            )
            self.db.add(agent_message)

        except Exception as e:
            logger.error(f"Error communicating with agent: {e}")
            # Save error message with error trace event
            error_trace = [
                {
                    "event_id": "1",
                    "event_type": "error",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "error_message": str(e),
                }
            ]
            agent_message = ChatMessageModel(
                message_id=str(uuid.uuid4()),
                session_id=session_id,
                role="system",
                content={
                    "text": f"Error communicating with agent: {str(e)}",
                    "error": True,
                    "trace": error_trace,
                },
                created_at=datetime.now(UTC).replace(tzinfo=None),
            )
            self.db.add(agent_message)

        # Update session last_message_at
        session.last_message_at = datetime.now(UTC).replace(tzinfo=None)

        await self.db.commit()
        await self.db.refresh(user_message)
        await self.db.refresh(agent_message)

        return user_message, agent_message

    async def _invoke_agent_via_jsonrpc(
        self, agent_url: str, message: str, message_id: str, agent_name: str = "unknown"
    ) -> tuple[str, List[Dict[str, Any]]]:
        """Invoke remote ADK agent via JSONRPC protocol with trace capture.

        Based on ADK's A2A protocol implementation, sends a JSONRPC request
        to the agent's endpoint with the message format:
        {
          "jsonrpc": "2.0",
          "method": "message/send",
          "params": {
            "message": {
              "messageId": "...",
              "role": "user",
              "parts": [{"text": "..."}]
            }
          },
          "id": "..."
        }

        Args:
            agent_url: Base URL of the agent (e.g., "http://localhost:8001")
            message: User message text
            message_id: Unique message ID
            agent_name: Name of the agent for trace events

        Returns:
            tuple[str, List[Dict]]: (response_text, trace_events)

        Raises:
            Exception: If JSONRPC call fails or response format is invalid
        """
        trace_events: List[TraceEvent] = []
        start_time = time.time()
        start_timestamp = datetime.now(UTC).isoformat()

        # Event 1: Agent Start
        agent_start_event = TraceEvent(
            event_id="1",
            event_type="agent_start",
            timestamp=start_timestamp,
            agent_name=agent_name,
        )
        trace_events.append(agent_start_event)

        try:
            jsonrpc_request = {
                "jsonrpc": "2.0",
                "method": "message/send",
                "params": {
                    "message": {
                        "messageId": message_id,
                        "role": "user",
                        "parts": [{"text": message}],
                    }
                },
                "id": message_id,
            }

            logger.info(f"Sending JSONRPC request to {agent_url}: {jsonrpc_request}")

            # Event 2: LLM Request (mock - we don't know exact timing, so we estimate)
            llm_request_time = time.time()
            llm_request_event = TraceEvent(
                event_id="2",
                event_type="llm_request",
                timestamp=datetime.now(UTC).isoformat(),
                llm_request=message,
                parent_id="1",
            )
            trace_events.append(llm_request_event)

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    agent_url,
                    json=jsonrpc_request,
                    headers={"Content-Type": "application/json"},
                )
                response.raise_for_status()
                result = response.json()

            logger.info(f"Received JSONRPC response: {result}")

            # Parse response
            if "error" in result:
                error_msg = result["error"].get("message", "Unknown error")
                raise Exception(f"Agent returned error: {error_msg}")

            if "result" not in result:
                raise Exception("Invalid JSONRPC response: missing 'result' field")

            # Extract agent response from result
            # ADK returns: {"result": {"status": {"message": {...}}, "history": [...]}}
            # OR with trace: {"result": {"status": "response text", "trace": [...]}}
            task_result = result["result"]
            response_text = "No response"

            # Check if agent provides real trace data (new format with observability)
            real_trace_events = None
            if isinstance(task_result, dict) and "trace" in task_result:
                real_trace_events = task_result["trace"]
                logger.info(f"✅ Received {len(real_trace_events)} real trace events from agent")

            # Extract response text
            if isinstance(task_result, dict):
                # New format: {"status": "response", "trace": [...]}
                if "status" in task_result:
                    status = task_result["status"]
                    if isinstance(status, str):
                        response_text = status
                    elif isinstance(status, dict):
                        # Old format: {"status": {"state": "...", "message": {...}}}
                        if status.get("state") == "failed":
                            # Task failed - extract error message
                            error_msg = "Agent task failed"
                            if "message" in status:
                                msg = status["message"]
                                if isinstance(msg, dict) and "parts" in msg:
                                    error_text = " ".join(
                                        part.get("text", "") for part in msg["parts"]
                                    )
                                    error_msg = f"Agent task failed: {error_text}"
                            response_text = error_msg

                        # Task succeeded - extract response message
                        elif "message" in status:
                            msg = status["message"]
                            if isinstance(msg, dict) and "parts" in msg:
                                # Combine all text parts
                                response_text = " ".join(
                                    part.get("text", "") for part in msg["parts"]
                                )
                                if not response_text:
                                    response_text = "No response"

                # Fallback: try to extract from history
                if response_text == "No response" and "history" in task_result and task_result["history"]:
                    history = task_result["history"]
                    # Find last agent message
                    for msg in reversed(history):
                        if msg.get("role") == "agent" and "parts" in msg:
                            response_text = " ".join(
                                part.get("text", "") for part in msg["parts"]
                            )
                            if response_text:
                                break

            # Use real trace if available, otherwise generate mock trace
            if real_trace_events:
                # Real trace from agent
                trace_dicts = real_trace_events
            else:
                # Mock trace (fallback for agents without observability)
                logger.info("⚠️ Agent does not provide trace, using mock trace")

                # Event 3: LLM Response (mock)
                llm_response_time = time.time()
                llm_duration = int((llm_response_time - llm_request_time) * 1000)
                llm_response_event = TraceEvent(
                    event_id="3",
                    event_type="llm_response",
                    timestamp=datetime.now(UTC).isoformat(),
                    duration_ms=llm_duration,
                    llm_response=response_text,
                    parent_id="2",
                )
                trace_events.append(llm_response_event)

                # Event 4: Agent End (mock)
                end_time = time.time()
                total_duration = int((end_time - start_time) * 1000)
                agent_end_event = TraceEvent(
                    event_id="4",
                    event_type="agent_end",
                    timestamp=datetime.now(UTC).isoformat(),
                    duration_ms=total_duration,
                    agent_name=agent_name,
                    parent_id="1",
                )
                trace_events.append(agent_end_event)

                # Convert trace events to dict format
                trace_dicts = [event.to_dict() for event in trace_events]

            return response_text, trace_dicts

        except httpx.HTTPError as e:
            logger.error(f"HTTP error invoking agent: {e}", exc_info=True)
            # Add error event
            error_event = TraceEvent(
                event_id=str(len(trace_events) + 1),
                event_type="error",
                timestamp=datetime.now(UTC).isoformat(),
                error_message=f"Failed to connect to agent: {str(e)}",
                parent_id="1",
            )
            trace_events.append(error_event)
            trace_dicts = [event.to_dict() for event in trace_events]
            raise Exception(f"Failed to connect to agent: {str(e)}")
        except Exception as e:
            logger.error(f"Error invoking agent via JSONRPC: {e}", exc_info=True)
            # Add error event if not already added
            if not any(ev.event_type == "error" for ev in trace_events):
                error_event = TraceEvent(
                    event_id=str(len(trace_events) + 1),
                    event_type="error",
                    timestamp=datetime.now(UTC).isoformat(),
                    error_message=str(e),
                    parent_id="1",
                )
                trace_events.append(error_event)
            raise

    async def get_history(
        self,
        session_id: str,
    ) -> Optional[List[ChatMessageModel]]:
        """Get chat history for a session.

        Args:
            session_id: Session ID

        Returns:
            List of messages or None if session not found
        """
        session = await self.get_session(session_id)
        if not session:
            return None

        # Messages are already loaded via selectinload
        return session.messages
