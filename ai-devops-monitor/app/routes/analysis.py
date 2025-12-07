from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.anomaly_detector import anomaly_detector
from app.services.predictor import predictor
from app.services.llm_agent import llm_agent
from app.services.opensearch_client import opensearch_client

router = APIRouter()

class AnalysisRequest(BaseModel):
    log_ids: List[str]
    context: str = ""

@router.post("/rca")
async def root_cause_analysis(request: AnalysisRequest):
    """
    Perform LLM-based root cause analysis on selected logs
    """
    try:
        # Fetch logs from OpenSearch
        logs = []
        for log_id in request.log_ids:
            log = opensearch_client.get_log_by_id(log_id)
            if log:
                logs.append(log)
        
        if not logs:
            raise HTTPException(status_code=404, detail="No logs found")
        
        # Run LLM analysis
        analysis = llm_agent.analyze_logs(logs, context=request.context)
        
        return {
            "status": "success",
            "analysis": analysis,
            "logs_analyzed": len(logs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/anomalies")
async def get_anomalies(limit: int = 100):
    """
    Detect and return anomalies in recent logs
    """
    try:
        # Get recent logs
        logs = opensearch_client.search_logs(limit=limit)
        
        # Detect anomalies
        anomalies = []
        for log in logs:
            is_anomaly, score = anomaly_detector.detect_anomaly(log)
            if is_anomaly:
                anomalies.append({
                    "log": log,
                    "anomaly_score": score
                })
        
        return {
            "status": "success",
            "total_logs": len(logs),
            "anomalies_detected": len(anomalies),
            "anomalies": anomalies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@router.get("/predict")
async def predict_failure(service: str = None):
    """
    Predict failure likelihood based on recent logs
    """
    try:
        # Get recent logs for service
        logs = opensearch_client.search_logs(limit=100, service=service)
        
        if not logs:
            return {
                "status": "success",
                "prediction": "insufficient_data",
                "probability": 0.0
            }
        
        # Run prediction
        prediction = predictor.predict_failure(logs)
        
        return {
            "status": "success",
            "service": service,
            "prediction": prediction["prediction"],
            "probability": prediction["probability"],
            "confidence": prediction["confidence"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/batch-analyze")
async def batch_analyze():
    """
    Run full analysis pipeline on recent logs
    """
    try:
        logs = opensearch_client.search_logs(limit=200)
        
        # Detect anomalies
        anomalies = []
        for log in logs:
            is_anomaly, score = anomaly_detector.detect_anomaly(log)
            if is_anomaly:
                anomalies.append({"log": log, "score": score})
        
        # Predict failures
        prediction = predictor.predict_failure(logs)
        
        # Generate insights if anomalies found
        insights = None
        if anomalies:
            top_anomalies = sorted(anomalies, key=lambda x: x["score"], reverse=True)[:5]
            insights = llm_agent.analyze_logs([a["log"] for a in top_anomalies])
        
        return {
            "status": "success",
            "logs_analyzed": len(logs),
            "anomalies_found": len(anomalies),
            "failure_prediction": prediction,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")
