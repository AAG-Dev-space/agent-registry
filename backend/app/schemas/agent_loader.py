"""Pydantic schemas for Agent Loader API."""

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class StartInstanceRequest(BaseModel):
    """Request to start an agent instance."""

    docker_image: str = Field(
        ...,
        description="Docker image to pull and run (e.g., localhost:5000/personalized-shopping:v1.4.1)",
    )
    agent_name: Optional[str] = Field(
        None,
        description="Optional agent name override (defaults to name from AgentCard)",
    )
    port: Optional[int] = Field(
        None,
        description="Host port to bind (auto-assign if not specified)",
        ge=1024,
        le=65535,
    )
    env_vars: Optional[Dict[str, str]] = Field(
        default_factory=dict,
        description="Environment variables for the container",
    )
    internal_port: int = Field(
        default=8000,
        description="Container internal port",
        ge=1,
        le=65535,
    )


class InstanceResponse(BaseModel):
    """Response containing instance information."""

    instance_id: str
    agent_name: str
    docker_image: str
    container_id: Optional[str]
    container_name: str
    port: int
    internal_port: int
    status: str
    env_vars: Dict[str, str]
    llm_model: Optional[str]
    llm_api_base: Optional[str]
    llm_api_key: Optional[str]  # Masked in response
    created_at: Optional[str]
    started_at: Optional[str]
    stopped_at: Optional[str]
    docker_status: Optional[str] = Field(
        None,
        description="Current Docker container status",
    )


class InstanceListResponse(BaseModel):
    """Response containing list of instances."""

    instances: List[InstanceResponse]
    count: int


class InstanceLogsResponse(BaseModel):
    """Response containing container logs."""

    instance_id: str
    logs: List[str]


class StopInstanceResponse(BaseModel):
    """Response after stopping an instance."""

    instance_id: str
    status: str
    stopped_at: Optional[str]


class DeleteInstanceResponse(BaseModel):
    """Response after deleting an instance."""

    success: bool
    message: str
