"""Agent Workbench API endpoints."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.deps import get_db
from backend.app.schemas.workbench import (
    CreateSessionRequest,
    DeleteSessionResponse,
    MessageResponse,
    SendMessageRequest,
    SessionHistoryResponse,
    SessionResponse,
)
from backend.app.services.workbench_service import WorkbenchService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/workbench", tags=["workbench"])


@router.post("/sessions", status_code=status.HTTP_201_CREATED, response_model=SessionResponse)
async def create_session(
    request: CreateSessionRequest,
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    """Create a new chat session for an agent.

    Args:
        request: CreateSessionRequest with agent_name
        db: Database session

    Returns:
        SessionResponse with session details

    Raises:
        404: Agent not found
        500: Internal server error
    """
    service = WorkbenchService(db)

    try:
        session = await service.create_session(request.agent_name)

        return SessionResponse(
            session_id=session.session_id,
            agent_name=session.agent_name,
            created_at=session.created_at.isoformat(),
            last_message_at=session.last_message_at.isoformat(),
            message_count=0,
        )

    except ValueError as e:
        logger.error(f"Agent not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session",
        )


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    """Get a chat session by ID.

    Args:
        session_id: Session ID
        db: Database session

    Returns:
        SessionResponse with session details

    Raises:
        404: Session not found
    """
    service = WorkbenchService(db)
    session = await service.get_session(session_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found",
        )

    return SessionResponse(
        session_id=session.session_id,
        agent_name=session.agent_name,
        created_at=session.created_at.isoformat(),
        last_message_at=session.last_message_at.isoformat(),
        message_count=len(session.messages) if session.messages else 0,
    )


@router.post("/sessions/{session_id}/messages", status_code=status.HTTP_201_CREATED, response_model=list[MessageResponse])
async def send_message(
    session_id: str,
    request: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
) -> list[MessageResponse]:
    """Send a message to an agent and get response.

    Args:
        session_id: Session ID
        request: SendMessageRequest with message content
        db: Database session

    Returns:
        List of MessageResponse (user message + agent response)

    Raises:
        404: Session not found
        500: Internal server error
    """
    service = WorkbenchService(db)

    try:
        user_msg, agent_msg = await service.send_message(
            session_id=session_id,
            content=request.content,
        )

        return [
            MessageResponse(
                message_id=user_msg.message_id,
                session_id=user_msg.session_id,
                role=user_msg.role,
                content=user_msg.content,
                created_at=user_msg.created_at.isoformat(),
            ),
            MessageResponse(
                message_id=agent_msg.message_id,
                session_id=agent_msg.session_id,
                role=agent_msg.role,
                content=agent_msg.content,
                created_at=agent_msg.created_at.isoformat(),
            ),
        ]

    except ValueError as e:
        logger.error(f"Session not found: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message",
        )


@router.get("/sessions/{session_id}/history", response_model=SessionHistoryResponse)
async def get_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> SessionHistoryResponse:
    """Get chat history for a session.

    Args:
        session_id: Session ID
        db: Database session

    Returns:
        SessionHistoryResponse with all messages

    Raises:
        404: Session not found
    """
    service = WorkbenchService(db)
    session = await service.get_session(session_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found",
        )

    messages = [
        MessageResponse(
            message_id=msg.message_id,
            session_id=msg.session_id,
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at.isoformat(),
        )
        for msg in (session.messages or [])
    ]

    return SessionHistoryResponse(
        session_id=session.session_id,
        agent_name=session.agent_name,
        messages=messages,
        created_at=session.created_at.isoformat(),
        last_message_at=session.last_message_at.isoformat(),
    )


@router.delete("/sessions/{session_id}", response_model=DeleteSessionResponse)
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> DeleteSessionResponse:
    """Delete a chat session.

    Args:
        session_id: Session ID
        db: Database session

    Returns:
        DeleteSessionResponse with deletion status

    Raises:
        404: Session not found
    """
    service = WorkbenchService(db)
    deleted = await service.delete_session(session_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found",
        )

    return DeleteSessionResponse(
        session_id=session_id,
        deleted=True,
    )
