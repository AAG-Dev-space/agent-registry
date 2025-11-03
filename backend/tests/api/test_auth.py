"""API tests for authentication endpoints."""

import pytest
from fastapi import status


class TestAuthLogin:
    """Test authentication login endpoint."""

    @pytest.mark.asyncio
    async def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "testpass123",
            },
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client, test_user):
        """Test login with wrong password."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "wrongpassword",
            },
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent",
                "password": "password",
            },
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_login_disabled_user(self, client, test_db, test_user):
        """Test login with disabled user."""
        # Disable the user
        test_user.disabled = True
        test_db.add(test_user)
        await test_db.commit()

        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "testuser",
                "password": "testpass123",
            },
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestAuthRegister:
    """Test user registration endpoint."""

    @pytest.mark.asyncio
    async def test_register_success(self, client):
        """Test successful user registration."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "newpass123",
            },
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert "id" in data

    @pytest.mark.asyncio
    async def test_register_duplicate_username(self, client, test_user):
        """Test registration with existing username."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "another@example.com",
                "password": "password123",
            },
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client):
        """Test registration with invalid email."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "invalid-email",
                "password": "password123",
            },
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestAuthMe:
    """Test current user endpoint."""

    @pytest.mark.asyncio
    async def test_get_current_user(self, client, test_user, user_token):
        """Test getting current user info."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_current_user_unauthorized(self, client):
        """Test getting current user without token."""
        response = client.get("/api/v1/auth/me")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
