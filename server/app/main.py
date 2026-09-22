"""Black Swan FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.health import router as health_router
from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Black Swan - Autonomous FP&A Multi-Agent API",
    description="Backend API powering Black Swan's autonomous 4-agent FP&A team (M, Q, Eve, 007).",
    version="0.1.0",
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routes
app.include_router(health_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root() -> dict:
    """Root metadata endpoint."""
    return {
        "message": "Black Swan Autonomous FP&A API is operational",
        "stage": 0,
        "docs": "/docs",
    }
