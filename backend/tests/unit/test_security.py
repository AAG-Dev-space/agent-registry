"""Unit tests for security module."""

import pytest
from datetime import timedelta
from jose import jwt

from backend.app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    role_config,
)
from backend.app.core.config import get_settings


class TestPasswordHashing:
    """Test password hashing and verification."""

    def test_password_hash_and_verify(self):
        """Test that password can be hashed and verified."""
        password = "testpassword123"
        hashed = get_password_hash(password)

        assert hashed != password
        assert verify_password(password, hashed)

    def test_wrong_password_fails(self):
        """Test that wrong password fails verification."""
        password = "correct_password"
        wrong_password = "wrong_password"
        hashed = get_password_hash(password)

        assert not verify_password(wrong_password, hashed)

    def test_different_hashes_for_same_password(self):
        """Test that same password generates different hashes (salt)."""
        password = "samepassword"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        assert hash1 != hash2
        assert verify_password(password, hash1)
        assert verify_password(password, hash2)


class TestJWTTokens:
    """Test JWT token creation and validation."""

    def test_create_access_token(self):
        """Test JWT access token creation."""
        settings = get_settings()
        data = {"sub": "testuser", "role": "user"}
        token = create_access_token(data)

        assert token is not None

        # Decode and verify
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == "testuser"
        assert payload["role"] == "user"
        assert "exp" in payload

    def test_create_token_with_custom_expiry(self):
        """Test token creation with custom expiration."""
        settings = get_settings()
        data = {"sub": "testuser"}
        expires_delta = timedelta(minutes=15)
        token = create_access_token(data, expires_delta)

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert "exp" in payload


class TestRoleConfig:
    """Test role configuration."""

    def test_role_permissions(self):
        """Test that roles have correct permissions."""
        assert "agent:read" in role_config.roles["user"]["permissions"]
        assert "agent:register" in role_config.roles["user"]["permissions"]
        assert "agent:delete" in role_config.roles["admin"]["permissions"]
        assert "agent:health_check" in role_config.roles["admin"]["permissions"]

    def test_default_users_exist(self):
        """Test that default users are configured."""
        assert len(role_config.default_users) > 0
        admin_users = [u for u in role_config.default_users if u["role"] == "admin"]
        assert len(admin_users) > 0
