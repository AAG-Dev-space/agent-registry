"""Test GET /api/v1/agents endpoint."""

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
async def test_list_agents_empty(client):
    """Test listing agents when registry is empty."""
    response = client.get("/api/v1/agents")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["agents"] == []
    assert data["count"] == 0


@pytest.mark.asyncio
async def test_list_agents_with_data(client, sample_agent):
    """Test listing agents with registered agents."""
    # Register an agent
    client.post("/api/v1/agents", json=sample_agent)

    # List agents
    response = client.get("/api/v1/agents")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["agents"]) == 1
    assert data["count"] == 1
    assert data["agents"][0]["name"] == "test-agent"
    assert "health_status" in data["agents"][0]
