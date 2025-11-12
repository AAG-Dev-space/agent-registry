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

        # Check if agent with same name already exists
        result = await self.db.execute(
            select(AgentModel).where(AgentModel.name == agent_id)
        )
        existing = result.scalar_one_or_none()

        # Check if another agent with the same URL already exists
        url_result = await self.db.execute(
            select(AgentModel).where(
                AgentModel.agent_card['url'].astext == agent_url
            )
        )
        existing_by_url = url_result.scalar_one_or_none()

        # If an agent with the same URL exists and it's not the same agent, reject
        if existing_by_url and existing_by_url.name != agent_id:
            raise ValueError(f"An agent with URL '{agent_url}' already exists (agent name: '{existing_by_url.name}')")

        if existing:
            # Update existing agent
            existing.agent_card = agent_card
            existing.agent_card_url = agent_card.get("agent_card_url")
            existing.updated_at = utc_now()

            await self.db.commit()
            await self.db.refresh(existing)

            logger.info(f"Updated existing agent: {agent_id}")

            # If agent_card_url exists, verify it to update health status
            agent_card_url = agent_card.get("agent_card_url")
            if agent_card_url:
                logger.info(f"Verifying AgentCard URL for updated agent: {agent_id}")
                verification = await self.verify_agent_card_url(agent_card_url)
                await self._update_health_status(
                    agent_name=agent_id,
                    success=verification["success"],
                    response_time_ms=verification.get("response_time_ms"),
                    error=verification.get("error"),
                )

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

            # If agent_card_url exists, verify it immediately to set proper health status
            agent_card_url = agent_card.get("agent_card_url")
            if agent_card_url:
                logger.info(f"Verifying AgentCard URL for newly registered agent: {agent_id}")
                verification = await self.verify_agent_card_url(agent_card_url)
                await self._update_health_status(
                    agent_name=agent_id,
                    success=verification["success"],
                    response_time_ms=verification.get("response_time_ms"),
                    error=verification.get("error"),
                )

            return agent_model.to_dict()

    async def get_agent(self, agent_id: str) -> dict | None:
        """Get agent by ID with health status.

        Args:
            agent_id: Agent name/ID

        Returns:
            Agent dictionary with health info or None if not found
        """
        result = await self.db.execute(
            select(AgentModel).where(AgentModel.name == agent_id)
        )
        agent = result.scalar_one_or_none()

        if agent:
            agent_dict = agent.to_dict()

            # Add health status
            health_result = await self.db.execute(
                select(HealthStatusModel).where(HealthStatusModel.agent_name == agent_id)
            )
            health = health_result.scalar_one_or_none()

            if health:
                agent_dict["health_status"] = {
                    "status": health.status,
                    "last_check_at": health.last_check_at.isoformat() if health.last_check_at else None,
                    "last_response_time_ms": health.last_response_time_ms,
                    "failure_count": health.failure_count,
                    "last_error": health.last_error,
                }
            else:
                agent_dict["health_status"] = {
                    "status": "unknown",
                    "last_check_at": None,
                    "last_response_time_ms": None,
                    "failure_count": 0,
                    "last_error": None,
                }

            return agent_dict
        return None

    async def list_agents(self, limit: int = 100, offset: int = 0) -> tuple[list[dict], int]:
        """List all agents with pagination and health status.

        Args:
            limit: Maximum number of agents to return
            offset: Number of agents to skip

        Returns:
            Tuple of (agent list with health info, total count)
        """
        # Get total count
        count_result = await self.db.execute(select(AgentModel))
        total_count = len(count_result.scalars().all())

        # Get paginated results
        result = await self.db.execute(
            select(AgentModel).limit(limit).offset(offset)
        )
        agents = result.scalars().all()

        # Add health status to each agent
        agents_with_health = []
        for agent in agents:
            agent_dict = agent.to_dict()

            # Get health status
            health_result = await self.db.execute(
                select(HealthStatusModel).where(HealthStatusModel.agent_name == agent.name)
            )
            health = health_result.scalar_one_or_none()

            if health:
                agent_dict["health_status"] = {
                    "status": health.status,
                    "last_check_at": health.last_check_at.isoformat() if health.last_check_at else None,
                    "last_response_time_ms": health.last_response_time_ms,
                    "failure_count": health.failure_count,
                    "last_error": health.last_error,
                }
            else:
                agent_dict["health_status"] = {
                    "status": "unknown",
                    "last_check_at": None,
                    "last_response_time_ms": None,
                    "failure_count": 0,
                    "last_error": None,
                }

            agents_with_health.append(agent_dict)

        return agents_with_health, total_count

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
            async with httpx.AsyncClient(
                timeout=10.0,
                follow_redirects=True,
                trust_env=False, 
                proxy=None, 
            ) as client:
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
                validation_errors = []

                # Check basic required fields
                basic_required_fields = {
                    "name": "Agent name",
                    "description": "Agent description",
                    "url": "Agent endpoint URL",
                    "preferredTransport": "Transport protocol (JSONRPC, REST, gRPC)"
                }

                for field, field_name in basic_required_fields.items():
                    if not agent_card.get(field):
                        validation_errors.append(f"Missing required field: {field_name} ({field})")

                # Check skills (must have at least one)
                skills = agent_card.get("skills", [])
                if not skills or not isinstance(skills, list) or len(skills) == 0:
                    validation_errors.append("Missing required field: At least one skill is required (skills)")

                # Check x-registry extension fields
                x_registry = agent_card.get("x-registry", {})
                if not x_registry or not isinstance(x_registry, dict):
                    validation_errors.append("Missing required field: x-registry extension object")
                else:
                    x_registry_required_fields = {
                        "contact": "Contact email",
                        "owner": "Owner ID",
                        "department": "Department",
                        "homepage": "Agent homepage URL",
                        "usageDescription": "Usage description",
                        "allowDelete": "Delete permission flag"
                    }

                    for field, field_name in x_registry_required_fields.items():
                        if field not in x_registry:
                            validation_errors.append(f"Missing required field: {field_name} (x-registry.{field})")

                # Validate preferredTransport value
                if agent_card.get("preferredTransport"):
                    valid_transports = ["JSONRPC", "REST", "gRPC"]
                    if agent_card["preferredTransport"] not in valid_transports:
                        validation_errors.append(f"Invalid preferredTransport value: '{agent_card['preferredTransport']}'. Must be one of: {', '.join(valid_transports)}")

                if validation_errors:
                    return {
                        "success": False,
                        "error": "AgentCard validation failed:\n• " + "\n• ".join(validation_errors),
                        "validation_errors": validation_errors,
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

    async def _update_health_status(
        self,
        agent_name: str,
        success: bool,
        response_time_ms: int | None = None,
        error: str | None = None
    ) -> None:
        """Update health status for an agent based on AgentCard fetch result.

        Args:
            agent_name: Agent name/ID
            success: Whether the fetch was successful
            response_time_ms: Response time in milliseconds
            error: Error message if failed
        """
        # Get or create health status
        result = await self.db.execute(
            select(HealthStatusModel).where(HealthStatusModel.agent_name == agent_name)
        )
        health = result.scalar_one_or_none()

        now = utc_now()

        if not health:
            # Create new health status
            health = HealthStatusModel(
                agent_name=agent_name,
                status="active" if success else "inactive",
                last_check_at=now,
                last_response_time_ms=response_time_ms,
                failure_count=0 if success else 1,
                last_error=error,
            )
            self.db.add(health)
        else:
            # Update existing health status
            health.last_check_at = now
            health.last_response_time_ms = response_time_ms
            health.last_error = error
            health.updated_at = now

            if success:
                health.status = "active"
                health.failure_count = 0
            else:
                health.failure_count += 1
                # Mark as deprecated after 3 consecutive failures
                if health.failure_count >= 3:
                    health.status = "deprecated"
                else:
                    health.status = "inactive"

        await self.db.commit()
        logger.info(f"Health status updated for {agent_name}: {health.status} (failures: {health.failure_count})")

    async def sync_agent_card(self, agent_id: str) -> dict:
        """Sync agent's AgentCard from its URL and update health status.

        Args:
            agent_id: Agent name/ID

        Returns:
            Dictionary with sync result:
            {
                "success": bool,
                "agent": dict | None,
                "error": str | None,
                "response_time_ms": int | None
            }
        """
        # Get agent
        agent = await self.get_agent(agent_id)
        if not agent:
            return {
                "success": False,
                "error": f"Agent not found: {agent_id}",
            }

        agent_card_url = agent.get("agent_card_url")
        if not agent_card_url:
            return {
                "success": False,
                "error": "Agent does not have agent_card_url configured",
            }

        # Fetch AgentCard
        verification = await self.verify_agent_card_url(agent_card_url)

        # Update health status
        await self._update_health_status(
            agent_name=agent_id,
            success=verification["success"],
            response_time_ms=verification.get("response_time_ms"),
            error=verification.get("error"),
        )

        if not verification["success"]:
            return {
                "success": False,
                "error": verification["error"],
                "response_time_ms": verification.get("response_time_ms"),
            }

        # Update agent card in database
        result = await self.db.execute(
            select(AgentModel).where(AgentModel.name == agent_id)
        )
        agent_model = result.scalar_one_or_none()

        if agent_model:
            agent_model.agent_card = verification["agent_card"]
            agent_model.updated_at = utc_now()
            await self.db.commit()
            await self.db.refresh(agent_model)

            logger.info(f"AgentCard synced for: {agent_id}")
            return {
                "success": True,
                "agent": agent_model.to_dict(),
                "response_time_ms": verification.get("response_time_ms"),
            }

        return {
            "success": False,
            "error": "Failed to update agent in database",
        }

    async def sync_all_agents(self) -> dict:
        """Sync all agents' AgentCards and update health statuses.

        This method should be called by the scheduler (daily).

        Returns:
            Dictionary with sync summary:
            {
                "total": int,
                "success": int,
                "failed": int,
                "results": list[dict]
            }
        """
        # Get all agents
        result = await self.db.execute(select(AgentModel))
        agents = result.scalars().all()

        total = len(agents)
        success_count = 0
        failed_count = 0
        results = []

        logger.info(f"Starting sync for {total} agents...")

        for agent in agents:
            sync_result = await self.sync_agent_card(agent.name)

            if sync_result["success"]:
                success_count += 1
            else:
                failed_count += 1

            results.append({
                "agent_name": agent.name,
                "success": sync_result["success"],
                "error": sync_result.get("error"),
                "response_time_ms": sync_result.get("response_time_ms"),
            })

        logger.info(f"Sync completed: {success_count}/{total} successful, {failed_count}/{total} failed")

        return {
            "total": total,
            "success": success_count,
            "failed": failed_count,
            "results": results,
        }
