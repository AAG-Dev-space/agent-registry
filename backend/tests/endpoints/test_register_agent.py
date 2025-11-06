"""Test POST /api/v1/agents endpoint (legacy registration)."""

import pytest
from fastapi import status


@pytest.fixture
def sample_agent():
    """Sample agent card."""
    return {
        "protocolVersion": "0.3.0",
        "name": "test-agent",
        "url": "http://localhost:8080",
        "description": "Test agent",
        "version": "1.0.0",
        "preferredTransport": "JSONRPC",
        "capabilities": {"streaming": False},
        "defaultInputModes": ["text/plain"],
        "defaultOutputModes": ["text/plain"],
        "skills": [{"id": "test", "name": "Test"}]
    }


@pytest.mark.asyncio
async def test_register_agent_success(client, sample_agent):
    """Test successful agent registration."""
    response = client.post("/api/v1/agents", json=sample_agent)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "test-agent"
    assert data["url"] == "http://localhost:8080"


@pytest.mark.asyncio
async def test_register_agent_updates_existing(client, sample_agent):
    """Test registering same agent updates it."""
    # Register first time
    client.post("/api/v1/agents", json=sample_agent)

    # Register again with updated data
    updated = sample_agent.copy()
    updated["description"] = "Updated description"

    response = client.post("/api/v1/agents", json=updated)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["description"] == "Updated description"


@pytest.mark.asyncio
async def test_register_agent_invalid_data(client):
    """Test registration with missing required fields."""
    invalid = {"name": "test"}  # Missing required fields

    response = client.post("/api/v1/agents", json=invalid)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
