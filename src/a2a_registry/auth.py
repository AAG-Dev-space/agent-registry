"""Authentication and authorization utilities for A2A Registry."""

import logging
import os
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import yaml
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Models
class User(BaseModel):
    """User model."""

    username: str
    email: str | None = None
    role: str  # 'admin' or 'user'
    disabled: bool = False


class UserInDB(User):
    """User model with hashed password."""

    hashed_password: str


class Token(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Data extracted from JWT token."""

    username: str | None = None
    role: str | None = None


class RoleConfig:
    """Role-based access control configuration."""

    def __init__(self, config_path: str | None = None):
        """Initialize role configuration."""
        if config_path is None:
            # Default to config/roles.yaml relative to project root
            config_path = str(
                Path(__file__).parent.parent.parent / "config" / "roles.yaml"
            )

        self.config_path = config_path
        self.roles: dict[str, dict] = {}
        self.jwt_config: dict[str, Any] = {}
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

            self.roles = config.get("roles", {})
            self.jwt_config = config.get("jwt", {})
            self.default_users = config.get("default_users", [])

            # Expand environment variables in JWT secret_key
            if "secret_key" in self.jwt_config:
                secret_key = self.jwt_config["secret_key"]
                if secret_key.startswith("${") and ":" in secret_key:
                    # Format: ${ENV_VAR:default_value}
                    env_var, default = secret_key[2:-1].split(":", 1)
                    self.jwt_config["secret_key"] = os.getenv(env_var, default)

            logger.info(f"Loaded role configuration from {self.config_path}")
            logger.info(f"Configured roles: {list(self.roles.keys())}")

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
        self.jwt_config = {
            "secret_key": "your-secret-key-change-in-production",
            "algorithm": "HS256",
            "access_token_expire_minutes": 1440,
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

    def get_jwt_secret(self) -> str:
        """Get JWT secret key."""
        return self.jwt_config.get("secret_key", "your-secret-key-change-in-production")

    def get_jwt_algorithm(self) -> str:
        """Get JWT algorithm."""
        return self.jwt_config.get("algorithm", "HS256")

    def get_token_expire_minutes(self) -> int:
        """Get token expiration time in minutes."""
        return self.jwt_config.get("access_token_expire_minutes", 1440)


# Global role config instance
role_config = RoleConfig()


# Utility functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=role_config.get_token_expire_minutes()
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, role_config.get_jwt_secret(), algorithm=role_config.get_jwt_algorithm()
    )
    return encoded_jwt


def decode_access_token(token: str) -> TokenData | None:
    """Decode and verify a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            role_config.get_jwt_secret(),
            algorithms=[role_config.get_jwt_algorithm()],
        )
        username: str | None = payload.get("sub")
        role: str | None = payload.get("role")

        if username is None:
            return None

        return TokenData(username=username, role=role)

    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        return None


def check_permission(role: str, permission: str) -> bool:
    """Check if a role has a specific permission."""
    return role_config.has_permission(role, permission)
