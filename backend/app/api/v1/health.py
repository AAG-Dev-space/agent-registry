"""Health check API endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.deps import get_current_active_user, get_db
from backend.app.models.user import UserModel
from backend.app.schemas.health import HealthStatusResponse
from backend.app.services.health_service import HealthService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/agents/{agent_name}", response_model=HealthStatusResponse)
async def get_agent_health_status(
    agent_name: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get health status for a specific agent.

    Public endpoint - no authentication required.
    """
    try:
        service = HealthService(db)
        health = await service.get_agent_health(agent_name)

        if not health:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Health status not found for agent: {agent_name}"
            )

        return HealthStatusResponse(**health)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get health status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get health status"
        )


@router.get("/statuses", response_model=list[HealthStatusResponse])
async def list_all_health_statuses(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[UserModel, Depends(get_current_active_user)],
):
    """List all health statuses.

    Requires authentication.
    """
    try:
        service = HealthService(db)
        statuses = await service.list_all_health_statuses()

        return [HealthStatusResponse(**status) for status in statuses]

    except Exception as e:
        logger.error(f"Failed to list health statuses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list health statuses"
        )
