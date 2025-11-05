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
from backend.app.services.verification import fetch_agent_card, verify_delete_permission

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


@router.post("/{agent_id}/refresh", response_model=AgentResponse)
async def refresh_agent_card(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Manually refresh agent's AgentCard from its URL.

    Fetches the latest AgentCard and updates the database.

    Returns:
        Updated agent information

    Raises:
        404: Agent not found
        500: Failed to fetch or update
    """
    try:
        from sqlalchemy import update
        from backend.app.models.agent import AgentModel

        service = AgentService(db)

        # 1. Get existing agent
        agent = await service.get_agent(agent_id)
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent not found: {agent_id}"
            )

        # 2. Fetch latest AgentCard from stored URL
        agent_card_url = agent.get("agent_card_url")
        if not agent_card_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Agent does not have agent_card_url configured"
            )

        try:
            fresh_card = await fetch_agent_card(agent_card_url)
        except Exception as e:
            logger.error(f"Failed to fetch AgentCard from {agent_card_url}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch AgentCard: {str(e)}"
            )

        # 3. Update agent_card in database
        stmt = (
            update(AgentModel)
            .where(AgentModel.name == agent_id)
            .values(agent_card=fresh_card)
        )
        await db.execute(stmt)
        await db.commit()

        # 4. Return updated agent
        updated_agent = await service.get_agent(agent_id)
        logger.info(f"AgentCard refreshed for: {agent_id}")
        return AgentResponse(**updated_agent)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to refresh agent card: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh agent card"
        )


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete an agent with ownership verification.

    Verification process:
    1. Fetch the agent's current AgentCard from its registered URL
    2. Check if x-registry.allowDelete is true
    3. Only delete if verification passes

    Returns:
        204 No Content if successful

    Raises:
        404: Agent not found
        403: Delete not allowed (verification failed)
        500: Internal error
    """
    try:
        service = AgentService(db)

        # 1. Get agent to retrieve agent_card_url
        agent = await service.get_agent(agent_id)
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent not found: {agent_id}"
            )

        # 2. Verify ownership via AgentCard
        agent_card_url = agent.get("agent_card_url")
        if not agent_card_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Agent does not have agent_card_url configured"
            )

        is_allowed, reason = await verify_delete_permission(
            agent_card_url=agent_card_url
        )

        if not is_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Delete not allowed: {reason}"
            )

        # 3. Perform deletion
        deleted = await service.delete_agent(agent_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent not found: {agent_id}"
            )

        logger.info(f"Agent deleted after verification: {agent_id}")
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


