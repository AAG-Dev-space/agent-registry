"""Health monitoring scheduler for A2A Registry."""

import asyncio
import logging
from datetime import UTC, datetime

import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .storage import storage

logger = logging.getLogger(__name__)


class HealthScheduler:
    """Scheduler for periodic health checks of registered agents."""

    def __init__(self, check_interval_minutes: int = 5):
        """Initialize health scheduler.

        Args:
            check_interval_minutes: How often to run health checks (default: 5 minutes)
        """
        self.check_interval_minutes = check_interval_minutes
        self.scheduler = AsyncIOScheduler()
        self._running = False

    async def check_agent_health(self, agent_id: str, health_config: dict) -> bool:
        """Check health of a single agent.

        Args:
            agent_id: Agent identifier
            health_config: Health check configuration with 'url', 'expected_status', etc.

        Returns:
            True if agent is healthy, False otherwise
        """
        health_url = health_config.get("url")
        expected_status = health_config.get("expected_status", 200)
        timeout = health_config.get("timeout", 10)

        if not health_url:
            logger.warning(f"Agent {agent_id} has no health check URL configured")
            return False

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(health_url)
                is_healthy = response.status_code == expected_status

                if is_healthy:
                    logger.debug(
                        f"Health check passed for {agent_id} ({health_url}): {response.status_code}"
                    )
                else:
                    logger.warning(
                        f"Health check failed for {agent_id} ({health_url}): "
                        f"expected {expected_status}, got {response.status_code}"
                    )

                return is_healthy

        except httpx.TimeoutException:
            logger.warning(f"Health check timeout for {agent_id} ({health_url})")
            return False
        except httpx.RequestError as e:
            logger.warning(
                f"Health check request error for {agent_id} ({health_url}): {e}"
            )
            return False
        except Exception as e:
            logger.error(
                f"Unexpected error during health check for {agent_id} ({health_url}): {e}"
            )
            return False

    async def run_health_checks(self) -> None:
        """Run health checks for all agents that have health_check configured."""
        logger.info("Starting health check cycle...")

        agents_to_check = await storage.get_agents_for_health_check()

        if not agents_to_check:
            logger.debug("No agents with health check configuration found")
            return

        logger.info(f"Checking health of {len(agents_to_check)} agents")

        for agent_id, health_config in agents_to_check:
            # Get current health status
            current_status = await storage.get_agent_health_status(agent_id)
            if not current_status:
                current_status = {
                    "status": "active",
                    "failure_count": 0,
                    "last_check_at": None,
                }

            # Perform health check
            is_healthy = await self.check_agent_health(agent_id, health_config)
            now = datetime.now(UTC)

            if is_healthy:
                # Agent is healthy - reset failure count and set status to active
                await storage.update_agent_health_status(
                    agent_id, status="active", last_check_at=now
                )
                # Reset failure count
                current_status["failure_count"] = 0
                logger.debug(f"Agent {agent_id} is healthy")

            else:
                # Agent is unhealthy - increment failure count
                failure_count = current_status.get("failure_count", 0) + 1

                # After 3 consecutive failures, mark as inactive
                if failure_count >= 3:
                    await storage.update_agent_health_status(
                        agent_id, status="inactive", last_check_at=now
                    )
                    logger.warning(
                        f"Agent {agent_id} marked as inactive after {failure_count} failures"
                    )
                else:
                    # Still active but failing
                    await storage.update_agent_health_status(
                        agent_id, status="active", last_check_at=now
                    )
                    logger.warning(
                        f"Agent {agent_id} health check failed ({failure_count}/3)"
                    )

                # Update failure count in storage
                current_status["failure_count"] = failure_count

        logger.info("Health check cycle completed")

    def start(self) -> None:
        """Start the health check scheduler."""
        if self._running:
            logger.warning("Health scheduler is already running")
            return

        logger.info(
            f"Starting health scheduler (interval: {self.check_interval_minutes} minutes)"
        )

        # Add the health check job
        self.scheduler.add_job(
            self.run_health_checks,
            trigger="interval",
            minutes=self.check_interval_minutes,
            id="health_check_job",
            name="Agent Health Check",
            replace_existing=True,
        )

        # Start the scheduler
        self.scheduler.start()
        self._running = True

        logger.info("Health scheduler started successfully")

    def stop(self) -> None:
        """Stop the health check scheduler."""
        if not self._running:
            logger.warning("Health scheduler is not running")
            return

        logger.info("Stopping health scheduler...")
        self.scheduler.shutdown(wait=False)
        self._running = False
        logger.info("Health scheduler stopped")

    async def run_immediate_check(self) -> None:
        """Run an immediate health check cycle (useful for testing)."""
        logger.info("Running immediate health check...")
        await self.run_health_checks()


# Global scheduler instance
health_scheduler = HealthScheduler(check_interval_minutes=5)
