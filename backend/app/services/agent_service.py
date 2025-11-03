"""Agent business logic service."""

import logging
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.agent import AgentModel
from backend.app.models.health import HealthStatusModel

logger = logging.getLogger(__name__)


def utc_now():
    """Return timezone-naive datetime in UTC."""
    return datetime.now(UTC).replace(tzinfo=None)


class AgentService:
    """Service for agent business logic."""

    def __init__(self, db: AsyncSession):
        """Initialize agent service with database session."""
        self.db = db

    async def register_agent(self, agent_card: dict) -> dict:
        """Register a new agent or update existing one.

        Args:
            agent_card: Agent card dictionary

        Returns:
            Registered agent as dictionary

        Raises:
            ValueError: If agent_card is invalid
        """
        agent_id = agent_card.get("name")
        if not agent_id:
            raise ValueError("Agent name is required")

        if not agent_card.get("url"):
            raise ValueError("Agent URL is required")

        # Check if agent already exists
        result = await self.db.execute(
            select(AgentModel).where(AgentModel.name == agent_id)
        )
        existing = result.scalar_one_or_none()

        if existing:
            # Update existing agent
            existing.description = agent_card.get("description")
            existing.url = agent_card.get("url")
            existing.version = agent_card.get("version")
            existing.protocol_version = agent_card.get("protocol_version")
            existing.preferred_transport = agent_card.get("preferred_transport")
            existing.agent_card = agent_card
            existing.updated_at = utc_now()

            await self.db.commit()
            await self.db.refresh(existing)

            logger.info(f"Updated existing agent: {agent_id}")
            return existing.to_dict()

        else:
            # Create new agent
            agent_model = AgentModel(
                name=agent_id,
                description=agent_card.get("description"),
                url=agent_card.get("url"),
                version=agent_card.get("version"),
                protocol_version=agent_card.get("protocol_version"),
                preferred_transport=agent_card.get("preferred_transport"),
                agent_card=agent_card,
            )
            self.db.add(agent_model)

            # Initialize health status
            health_status = HealthStatusModel(
                agent_name=agent_id,
                status="active",
                last_check_at=utc_now(),
                failure_count=0,
            )
            self.db.add(health_status)

            await self.db.commit()
            await self.db.refresh(agent_model)

            logger.info(f"Registered new agent: {agent_id}")
            return agent_model.to_dict()

    async def get_agent(self, agent_id: str) -> dict | None:
        """Get agent by ID.

        Args:
            agent_id: Agent name/ID

        Returns:
            Agent dictionary or None if not found
        """
        result = await self.db.execute(
            select(AgentModel).where(AgentModel.name == agent_id)
        )
        agent = result.scalar_one_or_none()

        if agent:
            return agent.to_dict()
        return None

    async def list_agents(self, limit: int = 100, offset: int = 0) -> tuple[list[dict], int]:
        """List all agents with pagination.

        Args:
            limit: Maximum number of agents to return
            offset: Number of agents to skip

        Returns:
            Tuple of (agent list, total count)
        """
        # Get total count
        count_result = await self.db.execute(select(AgentModel))
        total_count = len(count_result.scalars().all())

        # Get paginated results
        result = await self.db.execute(
            select(AgentModel).limit(limit).offset(offset)
        )
        agents = result.scalars().all()

        return [agent.to_dict() for agent in agents], total_count

    async def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent.

        Args:
            agent_id: Agent name/ID

        Returns:
            True if deleted, False if not found
        """
        result = await self.db.execute(
            select(AgentModel).where(AgentModel.name == agent_id)
        )
        agent = result.scalar_one_or_none()

        if not agent:
            return False

        # Delete health status first (if exists)
        health_result = await self.db.execute(
            select(HealthStatusModel).where(HealthStatusModel.agent_name == agent_id)
        )
        health = health_result.scalar_one_or_none()
        if health:
            await self.db.delete(health)

        # Delete agent
        await self.db.delete(agent)
        await self.db.commit()

        logger.info(f"Deleted agent: {agent_id}")
        return True

    async def search_agents(self, query: str | None = None, tags: list[str] | None = None) -> list[dict]:
        """Search agents by query or tags.

        Args:
            query: Search query string
            tags: List of tags to filter by

        Returns:
            List of matching agents
        """
        # Get all agents (simple implementation)
        result = await self.db.execute(select(AgentModel))
        agents = result.scalars().all()

        # Filter by query if provided
        if query:
            query_lower = query.lower()
            agents = [
                agent for agent in agents
                if (agent.name and query_lower in agent.name.lower()) or
                   (agent.description and query_lower in agent.description.lower())
            ]

        # Filter by tags if provided (check in agent_card)
        if tags:
            filtered = []
            for agent in agents:
                agent_tags = agent.agent_card.get("tags", []) if agent.agent_card else []
                if any(tag in agent_tags for tag in tags):
                    filtered.append(agent)
            agents = filtered

        return [agent.to_dict() for agent in agents]
