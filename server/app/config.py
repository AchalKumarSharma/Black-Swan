"""Configuration settings for Black Swan backend using Pydantic Settings."""

from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings and environment configuration."""

    GEMINI_API_KEY: str = Field(
        default="",
        description="Google Gemini / Antigravity ADK API key",
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
        default=["http://localhost:3000"],
        description="Allowed CORS origins for Next.js frontend",
    )
    ENVIRONMENT: str = Field(
        default="development",
        description="Application environment: development | staging | production",
    )

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
