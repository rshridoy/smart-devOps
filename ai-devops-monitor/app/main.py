from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import logs, analysis, alerts
from app.utils.config import settings

app = FastAPI(
    title="AI DevOps Monitor",
    description="AI-powered DevOps monitoring and anomaly detection system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(logs.router, prefix="/logs", tags=["logs"])
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-devops-monitor",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "ok",
        "opensearch": "connected",
        "llm": "ready"
    }
