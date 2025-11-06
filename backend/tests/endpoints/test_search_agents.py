"""Test POST /api/v1/agents/search endpoint."""

import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_search_agents_by_query(client):
    """Test searching agents by text query."""
    # Register agents
    agents = [
        {
            "protocolVersion": "0.3.0",
            "name": "chat-agent",
            "url": "http://localhost:9000",
            "description": "Agent for chatting",
            "version": "1.0.0",
            "preferredTransport": "JSONRPC",
            "capabilities": {"streaming": False},
            "defaultInputModes": ["text/plain"],
            "defaultOutputModes": ["text/plain"],
            "skills": [{"id": "chat", "name": "Chat"}]
        },
        {
            "protocolVersion": "0.3.0",
            "name": "search-agent",
            "url": "http://localhost:9001",
            "description": "Agent for searching",
            "version": "1.0.0",
            "preferredTransport": "JSONRPC",
            "capabilities": {"streaming": False},
            "defaultInputModes": ["text/plain"],
            "defaultOutputModes": ["text/plain"],
            "skills": [{"id": "search", "name": "Search"}]
        }
    ]

    for agent in agents:
        client.post("/api/v1/agents", json=agent)

    # Search for "chat"
    response = client.post("/api/v1/agents/search", json={"query": "chat"})

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["agents"]) >= 1
    assert any(agent["name"] == "chat-agent" for agent in data["agents"])


@pytest.mark.asyncio
async def test_search_agents_no_results(client):
    """Test searching with no matches."""
    response = client.post("/api/v1/agents/search", json={"query": "nonexistent"})

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["agents"] == []
    assert data["count"] == 0
