"""Configuration settings for A2A Registry."""

import os
from functools import lru_cache


class Settings:
    """Application settings."""

    # App settings
    APP_NAME: str = "A2A Registry"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Development mode
    DEV_MODE: bool = os.getenv("A2A_REGISTRY_DEV_MODE", "true").lower() == "true"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://a2a_user:a2a_password@localhost:5432/a2a_registry"
    )

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )

    # Extension verification
    REQUIRE_EXTENSION_VERIFICATION: bool = (
        os.getenv("A2A_REGISTRY_REQUIRE_EXTENSION_VERIFICATION", "false").lower()
        == "true"
    )
    REQUIRE_DOMAIN_VERIFICATION: bool = (
        os.getenv("A2A_REGISTRY_REQUIRE_DOMAIN_VERIFICATION", "false").lower()
        == "true"
    )
    REQUIRE_SIGNATURE_VERIFICATION: bool = (
        os.getenv("A2A_REGISTRY_REQUIRE_SIGNATURE_VERIFICATION", "false").lower()
        == "true"
    )

    # Extension allowlist
    allowlist_str = os.getenv("A2A_REGISTRY_EXTENSION_ALLOWLIST", "")
    EXTENSION_ALLOWLIST: set[str] = {
        uri.strip() for uri in allowlist_str.split(",") if uri.strip()
    }

    # Default trust level
    DEFAULT_DEV_TRUST_LEVEL: str = os.getenv(
        "A2A_REGISTRY_DEFAULT_DEV_TRUST_LEVEL", "TRUST_LEVEL_UNVERIFIED"
    )

    # CORS
    ALLOWED_ORIGINS: list[str] = os.getenv(
        "ALLOWED_ORIGINS", "*"
    ).split(",")

    @property
    def is_production_mode(self) -> bool:
        """Check if registry is running in production mode."""
        return not self.DEV_MODE

    def is_extension_allowed(self, uri: str) -> bool:
        """Check if an extension URI is allowed based on current mode."""
        if self.DEV_MODE:
            return True

        if not self.REQUIRE_EXTENSION_VERIFICATION:
            return True

        return uri in self.EXTENSION_ALLOWLIST

    def get_default_trust_level(self) -> str:
        """Get default trust level based on mode."""
        if self.DEV_MODE:
            return self.DEFAULT_DEV_TRUST_LEVEL
        return "TRUST_LEVEL_UNVERIFIED"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
