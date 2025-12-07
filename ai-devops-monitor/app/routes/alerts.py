from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.notifier import notifier

router = APIRouter()

class AlertMessage(BaseModel):
    title: str
    message: str
    severity: str = "info"
    service: Optional[str] = None

@router.post("/test")
async def send_test_alert():
    """
    Send a test alert via configured channels
    """
    try:
        alert = {
            "title": "Test Alert",
            "message": "This is a test alert from AI DevOps Monitor",
            "severity": "info"
        }
        
        results = notifier.send_alert(alert)
        
        return {
            "status": "success",
            "message": "Test alert sent",
            "channels": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send alert: {str(e)}")

@router.post("/send")
async def send_alert(alert: AlertMessage):
    """
    Send custom alert via configured channels
    """
    try:
        results = notifier.send_alert(alert.dict())
        
        return {
            "status": "success",
            "message": "Alert sent successfully",
            "channels": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send alert: {str(e)}")

@router.post("/anomaly")
async def send_anomaly_alert(log_id: str, anomaly_score: float):
    """
    Send alert for detected anomaly
    """
    try:
        alert = {
            "title": "Anomaly Detected",
            "message": f"Anomaly detected in log {log_id} with score {anomaly_score:.2f}",
            "severity": "warning"
        }
        
        results = notifier.send_alert(alert)
        
        return {
            "status": "success",
            "message": "Anomaly alert sent",
            "channels": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send anomaly alert: {str(e)}")

@router.post("/failure")
async def send_failure_alert(service: str, probability: float):
    """
    Send alert for predicted failure
    """
    try:
        alert = {
            "title": "Failure Prediction Alert",
            "message": f"Service '{service}' has {probability*100:.1f}% probability of failure",
            "severity": "critical" if probability > 0.7 else "warning",
            "service": service
        }
        
        results = notifier.send_alert(alert)
        
        return {
            "status": "success",
            "message": "Failure alert sent",
            "channels": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send failure alert: {str(e)}")
