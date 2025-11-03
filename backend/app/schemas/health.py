"""Health status API schemas."""

from pydantic import BaseModel


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
