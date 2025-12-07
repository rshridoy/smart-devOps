import re
from typing import Dict, Any
from datetime import datetime

def preprocess_log(log: Dict[str, Any]) -> Dict[str, Any]:
    """
    Preprocess log entry before indexing
    """
    processed = log.copy()
    
    # Normalize timestamp
    if "timestamp" in processed:
        processed["timestamp"] = normalize_timestamp(processed["timestamp"])
    else:
        processed["timestamp"] = datetime.utcnow().isoformat()
    
    # Normalize level
    if "level" in processed:
        processed["level"] = processed["level"].upper()
    
    # Clean message
    if "message" in processed:
        processed["message"] = clean_message(processed["message"])
    
    # Extract additional fields from message
    processed["extracted_fields"] = extract_fields(processed.get("message", ""))
    
    return processed

def normalize_timestamp(timestamp: str) -> str:
    """Normalize timestamp to ISO format"""
    try:
        # Try parsing common formats
        formats = [
            "%Y-%m-%dT%H:%M:%S.%fZ",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%d/%b/%Y:%H:%M:%S",
        ]
        
        for fmt in formats:
            try:
                dt = datetime.strptime(timestamp, fmt)
                return dt.isoformat()
            except ValueError:
                continue
        
        # If all formats fail, return as-is
        return timestamp
    except Exception:
        return datetime.utcnow().isoformat()

def clean_message(message: str) -> str:
    """Clean and normalize log message"""
    # Remove excessive whitespace
    message = re.sub(r'\s+', ' ', message)
    
    # Trim
    message = message.strip()
    
    # Remove ANSI color codes
    message = re.sub(r'\x1b\[[0-9;]*m', '', message)
    
    return message

def extract_fields(message: str) -> Dict[str, Any]:
    """Extract structured fields from log message"""
    fields = {}
    
    # Extract IP addresses
    ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
    ips = re.findall(ip_pattern, message)
    if ips:
        fields["ip_addresses"] = ips
    
    # Extract URLs
    url_pattern = r'https?://[^\s]+'
    urls = re.findall(url_pattern, message)
    if urls:
        fields["urls"] = urls
    
    # Extract error codes
    error_code_pattern = r'\b[4-5]\d{2}\b'
    error_codes = re.findall(error_code_pattern, message)
    if error_codes:
        fields["http_status_codes"] = error_codes
    
    # Extract stack traces
    if "Traceback" in message or "Exception" in message:
        fields["has_stacktrace"] = True
    
    # Extract duration/latency
    duration_pattern = r'(\d+(?:\.\d+)?)\s*(ms|sec|seconds?|minutes?)'
    durations = re.findall(duration_pattern, message.lower())
    if durations:
        fields["durations"] = [f"{d[0]}{d[1]}" for d in durations]
    
    return fields
