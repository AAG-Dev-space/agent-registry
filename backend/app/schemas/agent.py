"""Agent API schemas (Pydantic models for request/response validation)."""

from typing import Any

from pydantic import BaseModel, Field


class AgentCard(BaseModel):
    """Agent card schema matching A2A protocol."""

    name: str
    description: str | None = None
    url: str
    version: str | None = None
    protocol_version: str | None = None
    preferred_transport: str | None = None
    capabilities: list[str] | None = None
    extensions: list[dict[str, Any]] | None = None
    skills: list[dict[str, Any]] | None = None

    model_config = {"extra": "allow"}  # Allow additional fields


class AgentResponse(BaseModel):
    """Agent response schema."""

    name: str
    description: str | None = None
    url: str
    version: str | None = None
    protocol_version: str | None = None
    preferred_transport: str | None = None
    agent_card: dict[str, Any]
    created_at: str | None = None
    updated_at: str | None = None


class AgentListResponse(BaseModel):
    """Agent list response schema."""

    agents: list[AgentResponse]
    count: int


class AgentSearchRequest(BaseModel):
    """Agent search request schema."""

    query: str | None = None
    tags: list[str] | None = None
    limit: int = Field(default=20, le=100)


class HealthCheckRequest(BaseModel):
    """Health check verification request schema."""

    url: str = Field(..., description="Health check URL to verify")


class HealthCheckResponse(BaseModel):
    """Health check verification response schema."""

    success: bool
    response_time_ms: int | None = None
    status_code: int | None = None
    agent_data: dict[str, Any] | None = None
    error: str | None = None
