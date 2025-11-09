"""
Fear & Greed Index Backend API
FastAPI server for scraping CNN Fear & Greed Index data
"""
import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api.fear_greed import router as fear_greed_router
from utils.cache import cache
from datetime import datetime

# Ensure logs directory exists
os.makedirs('logs', exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/backend.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting Fear & Greed Index API server")
    yield
    logger.info("Shutting down Fear & Greed Index API server")


# Initialize FastAPI app
app = FastAPI(
    title="Fear & Greed Index API",
    description="API for fetching CNN Fear & Greed Index data",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Electron app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Will be restricted to Electron app origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(fear_greed_router)


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    Returns service status and basic info
    """
    cache_stats = cache.get_stats()

    return {
        "status": "healthy",
        "service": "Fear & Greed Index API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "cache": cache_stats
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Fear & Greed Index API",
        "health_check": "/health",
        "api_endpoint": "/api/v1/fear-greed"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
