"""Test POST /api/v1/agents/verify endpoint."""

import pytest
from fastapi import status
from unittest.mock import patch


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
async def test_verify_agent_card_url_success(client, sample_agent):
    """Test verifying a valid AgentCard URL."""
    with patch("backend.app.services.agent_service.AgentService.verify_agent_card_url") as mock:
        mock.return_value = {
            "success": True,
            "agent_card": sample_agent,
            "response_time_ms": 80
        }

        response = client.post(
            "/api/v1/agents/verify",
            json={"url": "http://example.com/.well-known/agent-card.json"}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert data["agent_card"]["name"] == "test-agent"


@pytest.mark.asyncio
async def test_verify_agent_card_url_failure(client):
    """Test verifying an invalid AgentCard URL."""
    with patch("backend.app.services.agent_service.AgentService.verify_agent_card_url") as mock:
        mock.return_value = {
            "success": False,
            "error": "Failed to fetch URL"
        }

        response = client.post(
            "/api/v1/agents/verify",
            json={"url": "http://invalid.invalid/agent-card.json"}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is False
        assert "error" in data
