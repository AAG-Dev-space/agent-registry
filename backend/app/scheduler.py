"""Background scheduler for periodic tasks."""

import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from backend.app.core.database import async_session_maker
from backend.app.services.agent_service import AgentService

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler: AsyncIOScheduler | None = None


async def sync_all_agents_task():
    """Background task to sync all agents' AgentCards.

    This task runs daily at 3 AM and:
    1. Fetches each agent's AgentCard from its URL
    2. Updates the agent_card in database
    3. Updates health status based on fetch success/failure
    """
    logger.info("Starting daily agent sync task...")

    try:
        # Get database session
        async with async_session_maker() as db:
            service = AgentService(db)
            result = await service.sync_all_agents()

            logger.info(
                f"Daily sync completed: {result['success']}/{result['total']} successful, "
                f"{result['failed']}/{result['total']} failed"
            )

    except Exception as e:
        logger.error(f"Error in daily sync task: {e}", exc_info=True)


def start_scheduler():
    """Start the background scheduler."""
    global scheduler

    if scheduler is not None:
        logger.warning("Scheduler is already running")
        return

    scheduler = AsyncIOScheduler()

    # Add daily sync task at 3 AM
    scheduler.add_job(
        sync_all_agents_task,
        trigger=CronTrigger(hour=3, minute=0),  # Every day at 3:00 AM
        id="sync_all_agents",
        name="Sync all agent cards",
        replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler started successfully")


def stop_scheduler():
    """Stop the background scheduler."""
    global scheduler

    if scheduler is None:
        logger.warning("Scheduler is not running")
        return

    scheduler.shutdown()
    scheduler = None
    logger.info("Scheduler stopped successfully")


@asynccontextmanager
async def scheduler_lifespan():
    """Context manager for scheduler lifecycle."""
    start_scheduler()
    yield
    stop_scheduler()
