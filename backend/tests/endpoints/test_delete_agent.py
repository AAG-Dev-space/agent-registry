"""Test DELETE /api/v1/agents/{id} endpoint."""

import pytest
from fastapi import status
from unittest.mock import patch


@pytest.fixture
def sample_agent():
    """Sample agent card with delete permission."""
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
        "agent_card_url": "http://example.com/.well-known/agent-card.json",
        "x-registry": {"allowDelete": True}
    }


@pytest.mark.asyncio
async def test_delete_agent_success(client, sample_agent):
    """Test deleting agent with proper verification."""
    # Register agent
    client.post("/api/v1/agents", json=sample_agent)

    # Mock verification to allow deletion
    with patch("backend.app.services.verification.verify_delete_permission") as mock:
        mock.return_value = (True, "Deletion allowed")

        response = client.delete("/api/v1/agents/test-agent")

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify deletion
        get_response = client.get("/api/v1/agents/test-agent")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_delete_agent_forbidden(client, sample_agent):
    """Test deletion blocked when allowDelete is false."""
    # Register agent
    client.post("/api/v1/agents", json=sample_agent)

    # Mock verification to deny deletion
    with patch("backend.app.services.verification.verify_delete_permission") as mock:
        mock.return_value = (False, "AgentCard does not allow deletion")

        response = client.delete("/api/v1/agents/test-agent")

        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_delete_agent_not_found(client):
    """Test deleting non-existent agent."""
    response = client.delete("/api/v1/agents/nonexistent")

    assert response.status_code == status.HTTP_404_NOT_FOUND
