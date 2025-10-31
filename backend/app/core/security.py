"""Security utilities for authentication and authorization."""

import logging
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import yaml
from jose import JWTError, jwt
from passlib.context import CryptContext

from backend.app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Password hashing context
# Use pbkdf2_sha256 for better compatibility
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


class RoleConfig:
    """Role-based access control configuration."""

    def __init__(self, config_path: str | None = None):
        """Initialize role configuration."""
        if config_path is None:
            # Default to config/roles.yaml
            config_path = str(
                Path(__file__).parent.parent.parent.parent / "config" / "roles.yaml"
            )

        self.config_path = config_path
        self.roles: dict[str, dict] = {}
        self.default_users: list[dict] = []
        self._load_config()

    def _load_config(self) -> None:
        """Load role configuration from YAML file."""
        try:
            if not Path(self.config_path).exists():
                logger.warning(
                    f"Role config file not found: {self.config_path}. Using defaults."
                )
                self._set_defaults()
                return

            with open(self.config_path, encoding="utf-8") as f:
                config = yaml.safe_load(f)

            if not config:
                self._set_defaults()
                return

            self.roles = config.get("roles", {})
            self.default_users = config.get("default_users", [])

            logger.info(f"Loaded role config from {self.config_path}")

        except Exception as e:
            logger.error(f"Failed to load role config: {e}")
            self._set_defaults()

    def _set_defaults(self) -> None:
        """Set default configuration."""
        self.roles = {
            "admin": {
                "permissions": [
                    "agent:register",
                    "agent:read",
                    "agent:delete",
                    "agent:health_check",
                ]
            },
            "user": {"permissions": ["agent:register", "agent:read"]},
        }
        self.default_users = [
            {
                "username": "admin",
                "password": "admin123",
                "role": "admin",
                "email": "admin@example.com",
            },
            {
                "username": "user",
                "password": "user123",
                "role": "user",
                "email": "user@example.com",
            },
        ]

    def has_permission(self, role: str, permission: str) -> bool:
        """Check if a role has a specific permission."""
        if role not in self.roles:
            return False
        return permission in self.roles[role].get("permissions", [])


# Global role config instance
role_config = RoleConfig()


# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    password_bytes = plain_password.encode('utf-8')[:72]
    return pwd_context.verify(password_bytes.decode('utf-8', errors='ignore'), hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    password_bytes = password.encode('utf-8')[:72]
    return pwd_context.hash(password_bytes.decode('utf-8', errors='ignore'))


# JWT utilities
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Decode and verify a JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"Failed to decode JWT token: {e}")
        return None
