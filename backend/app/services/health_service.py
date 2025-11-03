"""Health check business logic service."""

import logging
import time
from datetime import UTC, datetime

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.health import HealthStatusModel

logger = logging.getLogger(__name__)


def utc_now():
    """Return timezone-naive datetime in UTC."""
    return datetime.now(UTC).replace(tzinfo=None)


class HealthService:
    """Service for health check business logic."""

    def __init__(self, db: AsyncSession):
        """Initialize health service with database session."""
        self.db = db

    async def get_agent_health(self, agent_name: str) -> dict | None:
        """Get health status for an agent.

        Args:
            agent_name: Agent name/ID

        Returns:
            Health status dictionary or None if not found
        """
        result = await self.db.execute(
            select(HealthStatusModel).where(HealthStatusModel.agent_name == agent_name)
        )
        health = result.scalar_one_or_none()

        if health:
            return health.to_dict()
        return None

    async def update_health_status(
        self,
        agent_name: str,
        status: str,
        response_time_ms: int | None = None,
        error: str | None = None,
    ) -> dict:
        """Update health status for an agent.

        Args:
            agent_name: Agent name/ID
            status: Health status (active/inactive/deprecated)
            response_time_ms: Response time in milliseconds
            error: Error message if any

        Returns:
            Updated health status dictionary
        """
        result = await self.db.execute(
            select(HealthStatusModel).where(HealthStatusModel.agent_name == agent_name)
        )
        health = result.scalar_one_or_none()

        if not health:
            # Create new health status
            health = HealthStatusModel(
                agent_name=agent_name,
                status=status,
                last_check_at=utc_now(),
                last_response_time_ms=response_time_ms,
                failure_count=1 if status == "inactive" else 0,
                last_error=error,
            )
            self.db.add(health)
        else:
            # Update existing health status
            health.status = status
            health.last_check_at = utc_now()
            health.last_response_time_ms = response_time_ms
            health.last_error = error
            health.updated_at = utc_now()

            # Increment failure count if inactive
            if status == "inactive":
                health.failure_count += 1
            else:
                health.failure_count = 0

        await self.db.commit()
        await self.db.refresh(health)

        logger.info(f"Updated health status for agent: {agent_name} -> {status}")
        return health.to_dict()

    async def get_agents_for_health_check(self) -> list[tuple[str, str]]:
        """Get all agents that need health checking.

        Returns:
            List of (agent_name, agent_url) tuples
        """
        from app.models.agent import AgentModel

        result = await self.db.execute(select(AgentModel))
        agents = result.scalars().all()

        return [(agent.name, agent.url) for agent in agents]

    async def list_all_health_statuses(self) -> list[dict]:
        """List all health statuses.

        Returns:
            List of health status dictionaries
        """
        result = await self.db.execute(select(HealthStatusModel))
        statuses = result.scalars().all()

        return [status.to_dict() for status in statuses]

    async def verify_url(self, url: str, timeout: float = 10.0) -> dict:
        """Verify a health check URL by making an HTTP request.

        This method bypasses proxy settings for internal/private network access.

        Args:
            url: Health check URL to verify
            timeout: Request timeout in seconds

        Returns:
            Dictionary with verification results:
            - success: bool
            - response_time_ms: int | None
            - status_code: int | None
            - agent_data: dict | None
            - error: str | None
        """
        start_time = time.time()

        try:
            # Create httpx client with no proxy (trust_env=False)
            # This allows health checks to internal/private IPs without proxy
            async with httpx.AsyncClient(
                timeout=timeout,
                trust_env=False,  # Bypass proxy settings
            ) as client:
                response = await client.get(
                    url,
                    headers={"Accept": "application/json"},
                    follow_redirects=True,
                )

                response_time = int((time.time() - start_time) * 1000)

                if response.status_code == 200:
                    # Health check endpoint: just verify it's alive (200 OK)
                    # Try to parse JSON if available, but don't require specific fields
                    agent_data = None
                    try:
                        agent_data = response.json()
                    except Exception:
                        # Non-JSON response is OK for health checks
                        pass

                    return {
                        "success": True,
                        "response_time_ms": response_time,
                        "status_code": response.status_code,
                        "agent_data": agent_data,
                        "error": None,
                    }
                else:
                    return {
                        "success": False,
                        "response_time_ms": response_time,
                        "status_code": response.status_code,
                        "agent_data": None,
                        "error": f"HTTP {response.status_code}",
                    }

        except httpx.TimeoutException:
            return {
                "success": False,
                "response_time_ms": None,
                "status_code": None,
                "agent_data": None,
                "error": f"Request timed out ({timeout}s)",
            }
        except httpx.ConnectError as e:
            return {
                "success": False,
                "response_time_ms": None,
                "status_code": None,
                "agent_data": None,
                "error": f"Connection error: {str(e)}",
            }
        except Exception as e:
            logger.error(f"Health check verification failed for {url}: {e}")
            return {
                "success": False,
                "response_time_ms": None,
                "status_code": None,
                "agent_data": None,
                "error": f"Verification failed: {str(e)}",
            }
