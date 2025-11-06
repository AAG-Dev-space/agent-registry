"""Test POST /api/v1/agents/{id}/sync endpoint."""

import pytest
from fastapi import status
from unittest.mock import patch


@pytest.fixture
def sample_agent():
    """Sample agent card with URL."""
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
        "skills": [{"id": "test", "name": "Test"}],
        "agent_card_url": "http://example.com/.well-known/agent-card.json"
    }


@pytest.mark.asyncio
async def test_sync_agent_success(client, sample_agent):
    """Test syncing agent card from URL."""
    # Register agent
    client.post("/api/v1/agents", json=sample_agent)

    # Mock sync
    with patch("backend.app.services.agent_service.AgentService.sync_agent_card") as mock:
        updated = sample_agent.copy()
        updated["version"] = "2.0.0"

        mock.return_value = {
            "success": True,
            "agent": {"name": "test-agent", "version": "2.0.0", "agent_card": updated},
            "response_time_ms": 50
        }

        response = client.post("/api/v1/agents/test-agent/sync")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "test-agent"


@pytest.mark.asyncio
async def test_sync_agent_not_found(client):
    """Test syncing non-existent agent."""
    with patch("backend.app.services.agent_service.AgentService.sync_agent_card") as mock:
        mock.return_value = {
            "success": False,
            "error": "Agent not found: nonexistent"
        }

        response = client.post("/api/v1/agents/nonexistent/sync")

        assert response.status_code == status.HTTP_404_NOT_FOUND
