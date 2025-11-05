"""Agent business logic service."""

import asyncio
import logging
import time
from datetime import UTC, datetime

import httpx
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

        agent_url = agent_card.get("url")
        if not agent_url:
            raise ValueError("Agent URL is required")

        # Check if agent already exists
        result = await self.db.execute(
            select(AgentModel).where(AgentModel.name == agent_id)
        )
        existing = result.scalar_one_or_none()

        if existing:
            # Update existing agent
            existing.agent_card = agent_card
            existing.agent_card_url = agent_card.get("agent_card_url")
            existing.updated_at = utc_now()

            await self.db.commit()
            await self.db.refresh(existing)

            logger.info(f"Updated existing agent: {agent_id}")
            return existing.to_dict()

        else:
            # Create new agent
            agent_model = AgentModel(
                name=agent_id,
                agent_card=agent_card,
                agent_card_url=agent_card.get("agent_card_url"),
            )
            self.db.add(agent_model)

            # Initialize health status as unknown
            health_status = HealthStatusModel(
                agent_name=agent_id,
                status="unknown",
                last_check_at=utc_now(),
                last_response_time_ms=None,
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

    async def verify_agent_card_url(self, url: str) -> dict:
        """Verify and fetch AgentCard from a URL.

        Args:
            url: URL where the AgentCard JSON is hosted

        Returns:
            Dictionary with verification result:
            {
                "success": bool,
                "agent_card": dict | None,
                "error": str | None,
                "response_time_ms": int | None
            }
        """
        start_time = time.time()

        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(url)
                response_time_ms = int((time.time() - start_time) * 1000)

                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"HTTP {response.status_code}: {response.reason_phrase}",
                        "response_time_ms": response_time_ms,
                    }

                try:
                    agent_card = response.json()
                except Exception as e:
                    return {
                        "success": False,
                        "error": f"Invalid JSON response: {str(e)}",
                        "response_time_ms": response_time_ms,
                    }

                # Validate required fields
                required_fields = ["name", "description"]
                missing_fields = [field for field in required_fields if not agent_card.get(field)]

                if missing_fields:
                    return {
                        "success": False,
                        "error": f"Missing required fields: {', '.join(missing_fields)}",
                        "response_time_ms": response_time_ms,
                    }

                return {
                    "success": True,
                    "agent_card": agent_card,
                    "response_time_ms": response_time_ms,
                }

        except httpx.TimeoutException:
            response_time_ms = int((time.time() - start_time) * 1000)
            return {
                "success": False,
                "error": "Request timeout (>10s)",
                "response_time_ms": response_time_ms,
            }
        except Exception as e:
            response_time_ms = int((time.time() - start_time) * 1000)
            return {
                "success": False,
                "error": str(e),
                "response_time_ms": response_time_ms,
            }
