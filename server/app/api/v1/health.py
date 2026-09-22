"""Health check endpoint for Black Swan API."""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    """Stage 0 system health check."""
    return {
        "status": "healthy",
        "service": "black-swan-api",
        "stage": 0,
    }
