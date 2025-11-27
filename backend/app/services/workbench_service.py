"""Workbench service for managing chat sessions and A2A communication."""

import logging
import uuid
from datetime import UTC, datetime
from typing import List, Optional

from google.adk.agents.remote_a2a_agent import AGENT_CARD_WELL_KNOWN_PATH, RemoteA2aAgent
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

        # Connect to agent via RemoteA2aAgent
        try:
            agent_card_url = f"http://host.docker.internal:{instance.port}{AGENT_CARD_WELL_KNOWN_PATH}"
            logger.info(f"Connecting to agent at {agent_card_url}")

            remote_agent = RemoteA2aAgent(
                name=session.agent_name,
                description=f"Remote agent instance at port {instance.port}",
                agent_card=agent_card_url,
            )

            # Send message to agent (using ADK's invoke method)
            # Note: This is a simplified version - actual implementation may vary
            # based on ADK API
            response = await self._invoke_agent(remote_agent, content)

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

    async def _invoke_agent(self, remote_agent: RemoteA2aAgent, message: str) -> str:
        """Invoke remote agent and get response.

        Note: This is a placeholder implementation.
        The actual implementation depends on ADK's RemoteA2aAgent API.

        Args:
            remote_agent: RemoteA2aAgent instance
            message: User message

        Returns:
            str: Agent response text
        """
        # TODO: Implement actual ADK invocation
        # This might involve:
        # - Calling remote_agent.invoke() or similar method
        # - Handling JSONRPC protocol
        # - Processing agent response artifacts
        #
        # For now, return a placeholder
        logger.warning("_invoke_agent is not fully implemented - using placeholder")
        return f"[Placeholder response from {remote_agent.name}]"

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
