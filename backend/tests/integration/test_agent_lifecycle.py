"""Integration tests for complete agent lifecycle."""

import pytest
from fastapi import status


class TestAgentLifecycle:
    """Test complete agent lifecycle from registration to deletion."""

    @pytest.mark.asyncio
    async def test_full_agent_lifecycle(self, client, test_user, user_token, test_admin, admin_token):
        """Test complete agent lifecycle: register -> get -> update -> delete."""
        # Step 1: Register agent
        agent_card = {
            "name": "lifecycle-test-agent",
            "url": "http://localhost:9000",
            "description": "Agent for lifecycle testing",
            "version": "1.0.0",
            "capabilities": ["chat", "search"],
        }

        register_response = client.post(
            "/api/v1/agents",
            json=agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert register_response.status_code == status.HTTP_201_CREATED

        # Step 2: Verify agent appears in list
        list_response = client.get("/api/v1/agents")
        assert list_response.status_code == status.HTTP_200_OK
        agents = list_response.json()["agents"]
        assert any(agent["name"] == "lifecycle-test-agent" for agent in agents)

        # Step 3: Get specific agent
        get_response = client.get("/api/v1/agents/lifecycle-test-agent")
        assert get_response.status_code == status.HTTP_200_OK
        agent_data = get_response.json()
        assert agent_data["name"] == "lifecycle-test-agent"
        assert agent_data["agent_card"]["description"] == "Agent for lifecycle testing"

        # Step 4: Update agent
        updated_card = agent_card.copy()
        updated_card["description"] = "Updated lifecycle test agent"
        updated_card["version"] = "1.1.0"

        update_response = client.put(
            "/api/v1/agents/lifecycle-test-agent",
            json=updated_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert update_response.status_code == status.HTTP_200_OK
        updated_data = update_response.json()
        assert updated_data["agent_card"]["description"] == "Updated lifecycle test agent"
        assert updated_data["agent_card"]["version"] == "1.1.0"

        # Step 5: Verify update persisted
        verify_response = client.get("/api/v1/agents/lifecycle-test-agent")
        verify_data = verify_response.json()
        assert verify_data["agent_card"]["description"] == "Updated lifecycle test agent"

        # Step 6: Check health status exists
        health_response = client.get("/api/v1/health/lifecycle-test-agent")
        assert health_response.status_code == status.HTTP_200_OK

        # Step 7: Delete agent (as admin)
        delete_response = client.delete(
            "/api/v1/agents/lifecycle-test-agent",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert delete_response.status_code == status.HTTP_200_OK

        # Step 8: Verify agent is deleted
        final_get_response = client.get("/api/v1/agents/lifecycle-test-agent")
        assert final_get_response.status_code == status.HTTP_404_NOT_FOUND

        # Step 9: Verify agent not in list
        final_list_response = client.get("/api/v1/agents")
        final_agents = final_list_response.json()["agents"]
        assert not any(agent["name"] == "lifecycle-test-agent" for agent in final_agents)


class TestMultipleAgents:
    """Test managing multiple agents simultaneously."""

    @pytest.mark.asyncio
    async def test_register_multiple_agents(self, client, test_user, user_token):
        """Test registering and managing multiple agents."""
        agents = [
            {
                "name": f"agent-{i}",
                "url": f"http://localhost:{9000 + i}",
                "description": f"Test agent {i}",
                "capabilities": ["chat"] if i % 2 == 0 else ["search"],
            }
            for i in range(5)
        ]

        # Register all agents
        for agent in agents:
            response = client.post(
                "/api/v1/agents",
                json=agent,
                headers={"Authorization": f"Bearer {user_token}"},
            )
            assert response.status_code == status.HTTP_201_CREATED

        # Verify all agents in list
        list_response = client.get("/api/v1/agents")
        assert list_response.status_code == status.HTTP_200_OK
        data = list_response.json()
        assert data["count"] >= 5

        # Test search functionality
        search_response = client.get("/api/v1/agents/search?q=agent-2")
        assert search_response.status_code == status.HTTP_200_OK
        search_results = search_response.json()
        assert len(search_results["agents"]) >= 1


class TestAgentHealthIntegration:
    """Test integration between agent registration and health monitoring."""

    @pytest.mark.asyncio
    async def test_health_created_on_registration(self, client, test_user, user_token):
        """Test that health status is automatically created when agent is registered."""
        agent_card = {
            "name": "health-test-agent",
            "url": "http://localhost:9100",
            "description": "Agent for health testing",
        }

        # Register agent
        register_response = client.post(
            "/api/v1/agents",
            json=agent_card,
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert register_response.status_code == status.HTTP_201_CREATED

        # Immediately check health status
        health_response = client.get("/api/v1/health/health-test-agent")
        assert health_response.status_code == status.HTTP_200_OK
        health_data = health_response.json()
        assert health_data["agent_name"] == "health-test-agent"
        assert "status" in health_data

    @pytest.mark.asyncio
    async def test_health_deleted_with_agent(self, client, test_admin, admin_token):
        """Test that health status is deleted when agent is deleted."""
        agent_card = {
            "name": "health-delete-test",
            "url": "http://localhost:9200",
            "description": "Agent for health deletion testing",
        }

        # Register agent
        client.post(
            "/api/v1/agents",
            json=agent_card,
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        # Verify health exists
        health_response = client.get("/api/v1/health/health-delete-test")
        assert health_response.status_code == status.HTTP_200_OK

        # Delete agent
        client.delete(
            "/api/v1/agents/health-delete-test",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        # Verify health is also deleted
        final_health_response = client.get("/api/v1/health/health-delete-test")
        assert final_health_response.status_code == status.HTTP_404_NOT_FOUND


class TestAuthenticationFlow:
    """Test complete authentication flow."""

    @pytest.mark.asyncio
    async def test_register_login_access_protected_resource(self, client):
        """Test complete flow: register -> login -> access protected resource."""
        # Step 1: Register new user
        register_response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "flowtest",
                "email": "flowtest@example.com",
                "password": "flowpass123",
            },
        )
        assert register_response.status_code == status.HTTP_201_CREATED

        # Step 2: Login
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "flowtest",
                "password": "flowpass123",
            },
        )
        assert login_response.status_code == status.HTTP_200_OK
        token = login_response.json()["access_token"]

        # Step 3: Access protected resource (get current user)
        me_response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_response.status_code == status.HTTP_200_OK
        user_data = me_response.json()
        assert user_data["username"] == "flowtest"

        # Step 4: Register an agent using the token
        agent_card = {
            "name": "flowtest-agent",
            "url": "http://localhost:9300",
            "description": "Agent registered in flow test",
        }

        agent_response = client.post(
            "/api/v1/agents",
            json=agent_card,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert agent_response.status_code == status.HTTP_201_CREATED
