"""Supabase client wrapper and accessor."""

from typing import Optional
from supabase import Client, create_client
from app.config import get_settings

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """Return an initialized Supabase client or None if credentials are not configured.

    Uses SUPABASE_SERVICE_ROLE_KEY if available for backend operations,
    falling back to SUPABASE_ANON_KEY.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    settings = get_settings()
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY

    if not settings.SUPABASE_URL or not key:
        return None

    _supabase_client = create_client(settings.SUPABASE_URL, key)
    return _supabase_client
