"""Application settings accessor re-exported under app.core.config."""

from app.config import Settings, get_settings

__all__ = ["Settings", "get_settings"]
