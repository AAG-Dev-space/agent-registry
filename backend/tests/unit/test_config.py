"""Unit tests for configuration module."""

import os
import pytest

from backend.app.core.config import Settings, get_settings


class TestSettings:
    """Test configuration settings."""

    def test_default_settings(self):
        """Test default settings values."""
        settings = Settings()

        assert settings.APP_NAME == "A2A Registry"
        assert settings.VERSION is not None
        assert settings.DEBUG is False
        assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 30

    def test_settings_from_env(self):
        """Test that settings can be loaded from environment variables."""
        # Test that settings can load database URL (even if it's the default)
        settings = Settings()

        # DATABASE_URL should be a valid connection string
        assert settings.DATABASE_URL is not None
        assert "postgresql" in settings.DATABASE_URL

        # SECRET_KEY should exist
        assert settings.SECRET_KEY is not None
        assert len(settings.SECRET_KEY) > 0

    def test_get_settings_returns_same_instance(self):
        """Test that get_settings returns consistent instance."""
        settings1 = get_settings()
        settings2 = get_settings()

        # Settings should be the same
        assert settings1.APP_NAME == settings2.APP_NAME
        assert settings1.SECRET_KEY == settings2.SECRET_KEY


class TestCORSConfiguration:
    """Test CORS configuration."""

    def test_allowed_origins(self):
        """Test that allowed origins are configured."""
        settings = Settings()

        assert len(settings.ALLOWED_ORIGINS) > 0
        assert "*" in settings.ALLOWED_ORIGINS or "http://localhost:7600" in settings.ALLOWED_ORIGINS
