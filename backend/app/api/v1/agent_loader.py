"""Agent Loader API endpoints."""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.deps import get_db
from backend.app.schemas.agent_loader import (
    DeleteInstanceResponse,
    InstanceListResponse,
    InstanceLogsResponse,
    InstanceResponse,
    StartInstanceRequest,
    StopInstanceResponse,
)
from backend.app.services.agent_loader_service import AgentLoaderService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent-loader", tags=["agent-loader"])


@router.post("/start", response_model=InstanceResponse, status_code=status.HTTP_201_CREATED)
async def start_instance(
    request: StartInstanceRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Start a new agent instance.

    Pull Docker image and start container with specified configuration.

    Args:
        request: Start instance request
        db: Database session

    Returns:
        Created instance information
    """
    try:
        service = AgentLoaderService(db)
        instance = await service.pull_and_start(
            docker_image=request.docker_image,
            agent_name=request.agent_name,
            port=request.port,
            env_vars=request.env_vars,
            internal_port=request.internal_port,
        )

        return InstanceResponse(**instance)

    except ValueError as e:
        logger.warning(f"Validation error starting instance: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        logger.error(f"Runtime error starting instance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start instance: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error starting instance: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@router.get("/instances", response_model=InstanceListResponse)
async def list_instances(
    db: Annotated[AsyncSession, Depends(get_db)],
    agent_name: Optional[str] = Query(None, description="Filter by agent name"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
):
    """List agent instances.

    Get list of all agent instances with optional filtering by agent name and status.

    Args:
        db: Database session
        agent_name: Filter by agent name
        status_filter: Filter by status
        limit: Maximum results
        offset: Pagination offset

    Returns:
        List of instances and total count
    """
    try:
        service = AgentLoaderService(db)
        instances, total_count = await service.list_instances(
            agent_name=agent_name,
            status=status_filter,
            limit=limit,
            offset=offset,
        )

        return InstanceListResponse(
            instances=[InstanceResponse(**inst) for inst in instances],
            count=total_count,
        )

    except Exception as e:
        logger.error(f"Failed to list instances: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list instances",
        )


@router.get("/instances/{instance_id}", response_model=InstanceResponse)
async def get_instance(
    instance_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get instance details.

    Retrieve detailed information about a specific agent instance,
    including current Docker container status.

    Args:
        instance_id: Instance ID
        db: Database session

    Returns:
        Instance information
    """
    try:
        service = AgentLoaderService(db)
        instance = await service.get_instance(instance_id)

        return InstanceResponse(**instance)

    except ValueError as e:
        logger.warning(f"Instance not found: {instance_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get instance {instance_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get instance",
        )


@router.post("/instances/{instance_id}/stop", response_model=StopInstanceResponse)
async def stop_instance(
    instance_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Stop a running instance.

    Stop the Docker container and update instance status to 'stopped'.

    Args:
        instance_id: Instance ID
        db: Database session

    Returns:
        Updated instance status
    """
    try:
        service = AgentLoaderService(db)
        instance = await service.stop_instance(instance_id)

        return StopInstanceResponse(
            instance_id=instance["instance_id"],
            status=instance["status"],
            stopped_at=instance["stopped_at"],
        )

    except ValueError as e:
        logger.warning(f"Instance not found: {instance_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to stop instance {instance_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop instance",
        )


@router.delete("/instances/{instance_id}", response_model=DeleteInstanceResponse)
async def delete_instance(
    instance_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete an instance.

    Remove Docker container and delete instance record from database.

    Args:
        instance_id: Instance ID
        db: Database session

    Returns:
        Deletion confirmation
    """
    try:
        service = AgentLoaderService(db)
        await service.delete_instance(instance_id)

        return DeleteInstanceResponse(
            success=True,
            message=f"Instance {instance_id} deleted successfully",
        )

    except ValueError as e:
        logger.warning(f"Instance not found: {instance_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to delete instance {instance_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete instance",
        )


@router.get("/instances/{instance_id}/logs", response_model=InstanceLogsResponse)
async def get_instance_logs(
    instance_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    tail: int = Query(100, ge=1, le=10000, description="Number of log lines to return"),
):
    """Get container logs.

    Retrieve recent logs from the Docker container.

    Args:
        instance_id: Instance ID
        db: Database session
        tail: Number of lines to return

    Returns:
        Container logs
    """
    try:
        service = AgentLoaderService(db)
        logs = await service.get_instance_logs(instance_id, tail=tail)

        return InstanceLogsResponse(
            instance_id=instance_id,
            logs=logs,
        )

    except ValueError as e:
        logger.warning(f"Instance not found: {instance_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get logs for {instance_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get logs",
        )


@router.post("/instances/{instance_id}/sync", response_model=InstanceResponse)
async def sync_instance_status(
    instance_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Sync instance status with Docker.

    Update instance status in database to match actual Docker container status.

    Args:
        instance_id: Instance ID
        db: Database session

    Returns:
        Updated instance information
    """
    try:
        service = AgentLoaderService(db)
        instance = await service.sync_instance_status(instance_id)

        return InstanceResponse(**instance)

    except ValueError as e:
        logger.warning(f"Instance not found: {instance_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to sync instance {instance_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync instance status",
        )
