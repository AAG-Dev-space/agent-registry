"""Agent API endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db, require_admin
from app.models.user import UserModel
from app.schemas.agent import AgentCard, AgentListResponse, AgentResponse, AgentSearchRequest
from app.services.agent_service import AgentService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agents", tags=["agents"])


@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def register_agent(
    agent_card: AgentCard,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[UserModel, Depends(get_current_active_user)],
):
    """Register a new agent or update existing one.

    Requires authentication. Any authenticated user can register agents.
    """
    try:
        service = AgentService(db)
        agent = await service.register_agent(agent_card.model_dump())

        return AgentResponse(**agent)

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to register agent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register agent"
        )


@router.get("", response_model=AgentListResponse)
async def list_agents(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = 100,
    offset: int = 0,
):
    """List all registered agents.

    Public endpoint - no authentication required.
    """
    try:
        service = AgentService(db)
        agents, total_count = await service.list_agents(limit=limit, offset=offset)

        return AgentListResponse(
            agents=[AgentResponse(**agent) for agent in agents],
            count=total_count
        )

    except Exception as e:
        logger.error(f"Failed to list agents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list agents"
        )


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get agent by ID.

    Public endpoint - no authentication required.
    """
    try:
        service = AgentService(db)
        agent = await service.get_agent(agent_id)

        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent not found: {agent_id}"
            )

        return AgentResponse(**agent)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get agent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get agent"
        )


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[UserModel, Depends(require_admin)],
):
    """Delete an agent.

    Requires admin role.
    """
    try:
        service = AgentService(db)
        deleted = await service.delete_agent(agent_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent not found: {agent_id}"
            )

        return None

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete agent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete agent"
        )


@router.post("/search", response_model=AgentListResponse)
async def search_agents(
    search_request: AgentSearchRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Search agents by query or tags.

    Public endpoint - no authentication required.
    """
    try:
        service = AgentService(db)
        agents = await service.search_agents(
            query=search_request.query,
            tags=search_request.tags
        )

        return AgentListResponse(
            agents=[AgentResponse(**agent) for agent in agents],
            count=len(agents)
        )

    except Exception as e:
        logger.error(f"Failed to search agents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search agents"
        )
