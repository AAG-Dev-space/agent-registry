"""Pydantic schemas for Agent Workbench API."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class CreateSessionRequest(BaseModel):
    """Request to create a new chat session."""

    agent_name: str = Field(
        ...,
        description="Name of the agent to chat with",
    )


class SessionResponse(BaseModel):
    """Response containing session information."""

    session_id: str
    agent_name: str
    created_at: str
    last_message_at: str
    message_count: Optional[int] = Field(
        None,
        description="Number of messages in session",
    )


class SendMessageRequest(BaseModel):
    """Request to send a message to an agent."""

    content: str = Field(
        ...,
        description="Message text to send to the agent",
    )


class MessageResponse(BaseModel):
    """Response containing a single message."""

    message_id: str
    session_id: str
    role: str  # user, agent, system
    content: Dict[str, Any]  # Message content as JSON
    created_at: str


class SessionHistoryResponse(BaseModel):
    """Response containing session history."""

    session_id: str
    agent_name: str
    messages: List[MessageResponse]
    created_at: str
    last_message_at: str


class DeleteSessionResponse(BaseModel):
    """Response after deleting a session."""

    session_id: str
    deleted: bool
