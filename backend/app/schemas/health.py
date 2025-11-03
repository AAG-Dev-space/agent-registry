"""Health status API schemas."""

from typing import Any

from pydantic import BaseModel, Field


class HealthStatusResponse(BaseModel):
    """Health status response schema."""

    agent_name: str
    status: str  # active/inactive/deprecated
    last_check_at: str | None = None
    last_response_time_ms: int | None = None
    failure_count: int = 0
    last_error: str | None = None
    created_at: str | None = None
    updated_at: str | None = None


class HealthCheckVerifyRequest(BaseModel):
    """Health check URL verification request schema."""

    url: str = Field(..., description="Health check URL to verify")


class HealthCheckVerifyResponse(BaseModel):
    """Health check URL verification response schema."""

    success: bool
    response_time_ms: int | None = None
    status_code: int | None = None
    agent_data: dict[str, Any] | None = None
    error: str | None = None
