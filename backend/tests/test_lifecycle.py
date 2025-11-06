"""Test complete agent lifecycle flows."""

import pytest
from fastapi import status
from unittest.mock import patch


@pytest.fixture
def sample_agent():
    """Sample agent card."""
    return {
        "protocolVersion": "0.3.0",
        "name": "lifecycle-agent",
        "url": "http://localhost:9000",
        "description": "Lifecycle test agent",
        "version": "1.0.0",
        "preferredTransport": "JSONRPC",
        "capabilities": {"streaming": False},
        "defaultInputModes": ["text/plain"],
        "defaultOutputModes": ["text/plain"],
        "skills": [{"id": "test", "name": "Test"}]
    }


@pytest.mark.asyncio
async def test_full_lifecycle(client, sample_agent):
    """Test: Register -> List -> Get -> Update -> Delete."""

    # 1. Register agent
    register_response = client.post("/api/v1/agents", json=sample_agent)
    assert register_response.status_code == status.HTTP_201_CREATED
    assert register_response.json()["name"] == "lifecycle-agent"

    # 2. Verify in list with health_status
    list_response = client.get("/api/v1/agents")
    assert list_response.status_code == status.HTTP_200_OK
    agents = list_response.json()["agents"]
    assert len(agents) == 1
    assert agents[0]["name"] == "lifecycle-agent"
    assert "health_status" in agents[0]

    # 3. Get specific agent
    get_response = client.get("/api/v1/agents/lifecycle-agent")
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["name"] == "lifecycle-agent"
    assert "health_status" in get_response.json()

    # 4. Update agent (re-register with new data)
    updated = sample_agent.copy()
    updated["description"] = "Updated description"
    update_response = client.post("/api/v1/agents", json=updated)
    assert update_response.status_code == status.HTTP_201_CREATED
    assert update_response.json()["description"] == "Updated description"

    # 5. Verify update persisted
    verify_response = client.get("/api/v1/agents/lifecycle-agent")
    assert verify_response.json()["description"] == "Updated description"

    # 6. Delete agent
    sample_agent["agent_card_url"] = "http://example.com/.well-known/agent-card.json"
    sample_agent["x-registry"] = {"allowDelete": True}
    client.post("/api/v1/agents", json=sample_agent)

    with patch("backend.app.services.verification.verify_delete_permission") as mock:
        mock.return_value = (True, "Deletion allowed")
        delete_response = client.delete("/api/v1/agents/lifecycle-agent")
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    # 7. Verify deletion
    final_response = client.get("/api/v1/agents/lifecycle-agent")
    assert final_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_lifecycle_with_url_registration(client, sample_agent):
    """Test: Register by URL -> Sync -> Delete."""

    url = "http://example.com/.well-known/agent-card.json"
    sample_agent["agent_card_url"] = url

    # 1. Register by URL
    with patch("backend.app.services.agent_service.AgentService.verify_agent_card_url") as mock:
        mock.return_value = {
            "success": True,
            "agent_card": sample_agent,
            "response_time_ms": 100
        }

        register_response = client.post(
            "/api/v1/agents/register-by-url",
            json={"agent_card_url": url}
        )
        assert register_response.status_code == status.HTTP_201_CREATED

    # 2. Verify health_status created
    get_response = client.get("/api/v1/agents/lifecycle-agent")
    assert get_response.status_code == status.HTTP_200_OK
    assert "health_status" in get_response.json()

    # 3. Sync agent
    with patch("backend.app.services.agent_service.AgentService.sync_agent_card") as mock:
        updated = sample_agent.copy()
        updated["version"] = "2.0.0"

        mock.return_value = {
            "success": True,
            "agent": {"name": "lifecycle-agent", "version": "2.0.0", "agent_card": updated},
            "response_time_ms": 50
        }

        sync_response = client.post("/api/v1/agents/lifecycle-agent/sync")
        assert sync_response.status_code == status.HTTP_200_OK

    # 4. Delete
    sample_agent["x-registry"] = {"allowDelete": True}
    with patch("backend.app.services.verification.verify_delete_permission") as mock:
        mock.return_value = (True, "Deletion allowed")
        delete_response = client.delete("/api/v1/agents/lifecycle-agent")
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.asyncio
async def test_health_status_lifecycle(client, sample_agent):
    """Test health status throughout agent lifecycle."""

    # 1. Register without agent_card_url -> health_status = "unknown"
    register_response = client.post("/api/v1/agents", json=sample_agent)
    assert register_response.status_code == status.HTTP_201_CREATED

    get_response = client.get("/api/v1/agents/lifecycle-agent")
    health = get_response.json()["health_status"]
    assert health["status"] == "unknown"
    assert health["failure_count"] == 0

    # 2. Delete agent -> health_status also deleted
    sample_agent["agent_card_url"] = "http://example.com/.well-known/agent-card.json"
    sample_agent["x-registry"] = {"allowDelete": True}
    client.post("/api/v1/agents", json=sample_agent)

    with patch("backend.app.services.verification.verify_delete_permission") as mock:
        mock.return_value = (True, "Deletion allowed")
        client.delete("/api/v1/agents/lifecycle-agent")

    final_response = client.get("/api/v1/agents/lifecycle-agent")
    assert final_response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_multiple_agents_lifecycle(client):
    """Test managing multiple agents."""

    # Register multiple agents
    for i in range(3):
        agent = {
            "protocolVersion": "0.3.0",
            "name": f"agent-{i}",
            "url": f"http://localhost:{9000 + i}",
            "description": f"Agent {i}",
            "version": "1.0.0",
            "preferredTransport": "JSONRPC",
            "capabilities": {"streaming": False},
            "defaultInputModes": ["text/plain"],
            "defaultOutputModes": ["text/plain"],
            "skills": [{"id": f"skill-{i}", "name": f"Skill {i}"}]
        }
        response = client.post("/api/v1/agents", json=agent)
        assert response.status_code == status.HTTP_201_CREATED

    # Verify all in list
    list_response = client.get("/api/v1/agents")
    data = list_response.json()
    assert data["count"] == 3
    assert len(data["agents"]) == 3

    # All should have health_status
    for agent in data["agents"]:
        assert "health_status" in agent


@pytest.mark.asyncio
async def test_delete_ownership_verification(client, sample_agent):
    """Test delete ownership verification."""

    sample_agent["agent_card_url"] = "http://example.com/.well-known/agent-card.json"

    # 1. Delete allowed
    sample_agent["x-registry"] = {"allowDelete": True}
    client.post("/api/v1/agents", json=sample_agent)

    with patch("backend.app.services.verification.verify_delete_permission") as mock:
        mock.return_value = (True, "Deletion allowed")
        response = client.delete("/api/v1/agents/lifecycle-agent")
        assert response.status_code == status.HTTP_204_NO_CONTENT

    # 2. Delete blocked (re-register first)
    sample_agent["x-registry"] = {"allowDelete": False}
    client.post("/api/v1/agents", json=sample_agent)

    with patch("backend.app.services.verification.verify_delete_permission") as mock:
        mock.return_value = (False, "AgentCard does not allow deletion")
        response = client.delete("/api/v1/agents/lifecycle-agent")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    # Agent should still exist
    get_response = client.get("/api/v1/agents/lifecycle-agent")
    assert get_response.status_code == status.HTTP_200_OK
