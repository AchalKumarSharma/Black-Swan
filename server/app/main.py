import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.health import router as health_router
from app.api.v1.data import router as data_router
from app.api.v1.agents import router as agents_router
from app.config import get_settings
from app.core.supabase_client import get_supabase_client

logger = logging.getLogger("blackswan.main")
settings = get_settings()

DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler ensuring default workspace exists on startup."""
    client = get_supabase_client()
    if client:
        try:
            res = client.table("workspaces").select("id").eq("id", DEFAULT_WORKSPACE_ID).execute()
            if not res.data:
                client.table("workspaces").insert({
                    "id": DEFAULT_WORKSPACE_ID,
                    "name": "Default Workspace",
                }).execute()
                logger.info("Default workspace seeded: %s", DEFAULT_WORKSPACE_ID)
            else:
                logger.info("Default workspace verified: %s", DEFAULT_WORKSPACE_ID)
        except Exception as e:
            logger.warning("Could not verify or seed default workspace: %s", e)
    yield


app = FastAPI(
    title="Black Swan - Autonomous FP&A Multi-Agent API",
    description="Backend API powering Black Swan's autonomous 4-agent FP&A team (M, Q, Eve, 007).",
    version="0.1.0",
    lifespan=lifespan,
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
app.include_router(data_router, prefix="/api/v1")
app.include_router(agents_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root() -> dict:
    """Root metadata endpoint."""
    return {
        "message": "Black Swan Autonomous FP&A API is operational",
        "stage": 3,
        "docs": "/docs",
    }

