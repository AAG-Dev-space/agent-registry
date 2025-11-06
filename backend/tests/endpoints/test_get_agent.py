"""Test GET /api/v1/agents/{id} endpoint."""

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
async def test_get_agent_success(client, sample_agent):
    """Test getting agent by name."""
    # Register agent
    client.post("/api/v1/agents", json=sample_agent)

    # Get agent
    response = client.get("/api/v1/agents/test-agent")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "test-agent"
    assert data["url"] == "http://localhost:8080"
    assert "health_status" in data


@pytest.mark.asyncio
async def test_get_agent_not_found(client):
    """Test getting non-existent agent returns 404."""
    response = client.get("/api/v1/agents/nonexistent")

    assert response.status_code == status.HTTP_404_NOT_FOUND
