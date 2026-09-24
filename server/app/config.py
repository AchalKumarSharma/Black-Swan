"""Configuration settings for Black Swan backend using Pydantic Settings."""

from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


from pathlib import Path

_SERVER_DIR = Path(__file__).resolve().parent.parent
_ENV_FILES = (
    str(_SERVER_DIR / ".env"),
    str(_SERVER_DIR / ".env.local"),
    ".env",
    ".env.local",
)


class Settings(BaseSettings):
    """Application settings and environment configuration."""

    GEMINI_API_KEY: str = Field(
        default="",
        description="Google Gemini / Antigravity ADK API key",
    )
    GEMINI_MODEL: str = Field(
        default="gemini-2.5-flash",
        description="Default Gemini model for FP&A agents",
    )
    SUPABASE_URL: str = Field(
        default="",
        description="Supabase instance URL",
    )
    SUPABASE_ANON_KEY: str = Field(
        default="",
        description="Supabase public anonymous key",
    )
    SUPABASE_SERVICE_ROLE_KEY: str = Field(
        default="",
        description="Supabase service role secret key",
    )
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        description="Allowed CORS origins for Next.js frontend",
    )
    ENVIRONMENT: str = Field(
        default="development",
        description="Application environment: development | staging | production",
    )

    model_config = SettingsConfigDict(
        env_file=_ENV_FILES,
        env_file_encoding="utf-8",
        extra="ignore",
    )



@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
