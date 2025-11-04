"""Agent API endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.deps import get_db
from backend.app.schemas.agent import (
    AgentCard,
    AgentListResponse,
    AgentResponse,
    AgentSearchRequest,
)
from backend.app.services.agent_service import AgentService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agents", tags=["agents"])


# Request/Response models for URL-based registration
class AgentCardUrlRequest(BaseModel):
    """Request to register agent by URL."""
    agent_card_url: HttpUrl


class AgentCardUrlVerifyRequest(BaseModel):
    """Request to verify AgentCard URL."""
    url: HttpUrl


class AgentCardUrlVerifyResponse(BaseModel):
    """Response from AgentCard URL verification."""
    success: bool
    agent_card: dict | None = None  # Changed from AgentCard to dict to avoid validation issues
    error: str | None = None
    response_time_ms: int | None = None


@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def register_agent(
    agent_card: AgentCard,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register a new agent or update existing one.

    Public endpoint - Agent URL ownership is the authentication.

    Args:
        agent_card: Agent card information
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
):
    """Delete an agent.

    Public endpoint - anyone can request deletion.
    Actual deletion should verify agent_card_url ownership.
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


@router.post("/verify", response_model=AgentCardUrlVerifyResponse)
async def verify_agent_card_url(
    request: AgentCardUrlVerifyRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Verify an AgentCard URL by fetching and validating it.

    Public endpoint - no authentication required.

    Args:
        request: Contains the AgentCard URL to verify

    Returns:
        Verification result with AgentCard data if successful
    """
    try:
        service = AgentService(db)
        result = await service.verify_agent_card_url(str(request.url))

        return AgentCardUrlVerifyResponse(**result)

    except Exception as e:
        logger.error(f"Failed to verify AgentCard URL: {e}")
        return AgentCardUrlVerifyResponse(
            success=False,
            error=f"Verification failed: {str(e)}"
        )


@router.post("/register-by-url", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def register_agent_by_url(
    request: AgentCardUrlRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Register an agent by providing the AgentCard URL.

    Public endpoint - Agent URL ownership is the authentication.
    The registry will fetch the AgentCard from the provided URL and register it.

    Args:
        request: Contains the AgentCard URL

    Returns:
        Registered agent information
    """
    try:
        service = AgentService(db)

        # First verify the URL
        verification = await service.verify_agent_card_url(str(request.agent_card_url))

        if not verification.get("success") or not verification.get("agent_card"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=verification.get("error", "Failed to fetch AgentCard from URL")
            )

        # Register the agent with the AgentCard URL
        agent_card_data = verification["agent_card"]
        agent_card_data["agent_card_url"] = str(request.agent_card_url)

        agent = await service.register_agent(agent_card_data)

        return AgentResponse(**agent)

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to register agent by URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register agent"
        )


