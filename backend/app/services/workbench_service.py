"""Workbench service for managing chat sessions and A2A communication."""

import logging
import uuid
from datetime import UTC, datetime
from typing import List, Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.models.agent import AgentModel
from backend.app.models.agent_instance import AgentInstanceModel
from backend.app.models.chat_session import ChatMessageModel, ChatSessionModel

logger = logging.getLogger(__name__)


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

            # Send message to agent via JSONRPC
            msg_id = str(uuid.uuid4())
            response = await self._invoke_agent_via_jsonrpc(agent_url, content, msg_id)

            # Save agent response
            agent_message = ChatMessageModel(
                message_id=str(uuid.uuid4()),
                session_id=session_id,
                role="agent",
                content={"text": response},
                created_at=datetime.now(UTC).replace(tzinfo=None),
            )
            self.db.add(agent_message)

        except Exception as e:
            logger.error(f"Error communicating with agent: {e}")
            # Save error message
            agent_message = ChatMessageModel(
                message_id=str(uuid.uuid4()),
                session_id=session_id,
                role="system",
                content={
                    "text": f"Error communicating with agent: {str(e)}",
                    "error": True,
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
        self, agent_url: str, message: str, message_id: str
    ) -> str:
        """Invoke remote ADK agent via JSONRPC protocol.

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

        Returns:
            str: Agent response text

        Raises:
            Exception: If JSONRPC call fails or response format is invalid
        """
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
            task_result = result["result"]

            # Check task status
            if "status" in task_result:
                status = task_result["status"]
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
                    return error_msg

                # Task succeeded - extract response message
                if "message" in status:
                    msg = status["message"]
                    if isinstance(msg, dict) and "parts" in msg:
                        # Combine all text parts
                        response_text = " ".join(
                            part.get("text", "") for part in msg["parts"]
                        )
                        return response_text if response_text else "No response"

            # Fallback: try to extract from history
            if "history" in task_result and task_result["history"]:
                history = task_result["history"]
                # Find last agent message
                for msg in reversed(history):
                    if msg.get("role") == "agent" and "parts" in msg:
                        response_text = " ".join(
                            part.get("text", "") for part in msg["parts"]
                        )
                        return response_text if response_text else "No response"

            # No valid response found
            return "Agent did not return a valid response"

        except httpx.HTTPError as e:
            logger.error(f"HTTP error invoking agent: {e}", exc_info=True)
            raise Exception(f"Failed to connect to agent: {str(e)}")
        except Exception as e:
            logger.error(f"Error invoking agent via JSONRPC: {e}", exc_info=True)
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
