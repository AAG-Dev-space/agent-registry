"""Test POST /api/v1/agents/register-by-url endpoint."""

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
async def test_register_by_url_success(client, sample_agent):
    """Test registering agent by URL."""
    url = "http://example.com/.well-known/agent-card.json"

    with patch("backend.app.services.agent_service.AgentService.verify_agent_card_url") as mock:
        mock.return_value = {
            "success": True,
            "agent_card": sample_agent,
            "response_time_ms": 100
        }

        response = client.post(
            "/api/v1/agents/register-by-url",
            json={"agent_card_url": url}
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "test-agent"


@pytest.mark.asyncio
async def test_register_by_url_fetch_failure(client):
    """Test register-by-url with unreachable URL."""
    url = "http://unreachable.invalid/.well-known/agent-card.json"

    with patch("backend.app.services.agent_service.AgentService.verify_agent_card_url") as mock:
        mock.return_value = {
            "success": False,
            "error": "Failed to fetch AgentCard"
        }

        response = client.post(
            "/api/v1/agents/register-by-url",
            json={"agent_card_url": url}
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
