"""Core modules for configuration, database, and security."""

from .config import Settings, get_settings
from .database import close_db, get_db, init_db
from .deps import get_current_active_user, get_current_user, require_admin, require_permission
from .security import (
    RoleConfig,
    create_access_token,
    decode_access_token,
    get_password_hash,
    role_config,
    verify_password,
)

__all__ = [
    # Config
    "Settings",
    "get_settings",
    # Database
    "get_db",
    "init_db",
    "close_db",
    # Security
    "RoleConfig",
    "role_config",
    "verify_password",
    "get_password_hash",
    "create_access_token",
    "decode_access_token",
    # Dependencies
    "get_current_user",
    "get_current_active_user",
    "require_permission",
    "require_admin",
]
