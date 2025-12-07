from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.services.opensearch_client import opensearch_client
from app.utils.preprocess import preprocess_log

router = APIRouter()

class LogEntry(BaseModel):
    timestamp: Optional[str] = None
    level: str
    service: str
    message: str
    metadata: Optional[Dict[str, Any]] = None

@router.post("/")
async def ingest_log(log: LogEntry):
    """
    Ingest a log entry, preprocess it, and store in OpenSearch
    """
    try:
        # Add timestamp if not provided
        if not log.timestamp:
            log.timestamp = datetime.utcnow().isoformat()
        
        # Preprocess log
        processed_log = preprocess_log(log.dict())
        
        # Index in OpenSearch
        result = opensearch_client.index_log(processed_log)
        
        return {
            "status": "success",
            "log_id": result.get("_id"),
            "message": "Log ingested successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest log: {str(e)}")

@router.get("/")
async def get_logs(limit: int = 100, level: Optional[str] = None):
    """
    Retrieve logs from OpenSearch with optional filtering
    """
    try:
        logs = opensearch_client.search_logs(limit=limit, level=level)
        return {
            "status": "success",
            "count": len(logs),
            "logs": logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve logs: {str(e)}")

@router.get("/search")
async def search_logs(query: str, limit: int = 50):
    """
    Search logs by text query
    """
    try:
        logs = opensearch_client.search_logs(query=query, limit=limit)
        return {
            "status": "success",
            "query": query,
            "count": len(logs),
            "logs": logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
