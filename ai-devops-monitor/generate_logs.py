import requests
import random
from datetime import datetime, timedelta
import json

# Configuration
BACKEND_URL = "http://localhost:8000"

# Sample data for generating realistic logs
SERVICES = [
    "api-gateway", "payment-service", "user-service", "auth-service",
    "database", "cache-service", "notification-service", "order-service",
    "inventory-service", "analytics-service", "search-service", "cdn-service"
]

LOG_LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
LEVEL_WEIGHTS = [10, 60, 20, 8, 2]  # Probability weights

ERROR_MESSAGES = [
    "Connection timeout to database at {ip}",
    "Payment processing failed: Gateway timeout",
    "Exception in {service}: {exception}",
    "Database query timeout after {ms}ms",
    "Failed to connect to Redis at {ip}:{port}",
    "HTTP 500 Internal Server Error",
    "Memory limit exceeded: {mb}MB used",
    "Disk space critical: {percent}% full",
    "API rate limit exceeded for user {user_id}",
    "Authentication failed for user {user_id}",
    "Service {service} is not responding",
    "Network error: Connection refused",
    "SSL certificate expired for {domain}",
    "Queue overflow: {count} messages pending",
    "Deadlock detected in transaction {tx_id}"
]

WARNING_MESSAGES = [
    "Database query slow: SELECT took {ms}ms",
    "Cache miss rate high: {percent}% in last 5 minutes",
    "API response time elevated: {ms}ms average",
    "Connection pool usage at {percent}%",
    "Memory usage at {percent}%",
    "Retry attempt {attempt} for {service}",
    "Rate limiting applied to user {user_id}",
    "Session timeout approaching for user {user_id}",
    "Deprecated API endpoint /v1/{endpoint} accessed",
    "Large payload detected: {size}MB"
]

INFO_MESSAGES = [
    "Request processed successfully - GET /api/{endpoint} - 200 OK - {ms}ms",
    "User authentication successful - user_id: {user_id}",
    "Health check passed - all services responding",
    "Cache hit - key: {key}",
    "Request rate: {rate} req/min - within normal limits",
    "Background job completed - job_id: {job_id}",
    "Database connection pool initialized with {count} connections",
    "Service started on port {port}",
    "Configuration loaded successfully",
    "Scheduled task executed - task: {task}"
]

DEBUG_MESSAGES = [
    "Processing request for endpoint /api/{endpoint}",
    "Cache lookup for key: {key}",
    "Database query: SELECT * FROM {table}",
    "Validating input parameters",
    "Loading configuration from {config}",
    "Initializing connection to {service}",
    "Parsing request body",
    "Executing middleware chain",
    "Serializing response data",
    "Cleaning up resources"
]

CRITICAL_MESSAGES = [
    "CRITICAL: Service {service} crashed - restarting",
    "CRITICAL: Database connection pool exhausted",
    "CRITICAL: Out of memory - cannot allocate",
    "CRITICAL: Disk space critical - operations halted",
    "CRITICAL: Security breach detected from IP {ip}",
    "CRITICAL: All worker nodes unresponsive",
    "CRITICAL: Data corruption detected in {table}",
    "CRITICAL: Primary database unavailable"
]

def generate_ip():
    """Generate random IP address"""
    return f"{random.randint(10, 192)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"

def generate_log(index, base_time):
    """Generate a single log entry"""
    level = random.choices(LOG_LEVELS, weights=LEVEL_WEIGHTS)[0]
    service = random.choice(SERVICES)
    
    # Select message template based on level
    if level == "CRITICAL":
        message_template = random.choice(CRITICAL_MESSAGES)
    elif level == "ERROR":
        message_template = random.choice(ERROR_MESSAGES)
    elif level == "WARNING":
        message_template = random.choice(WARNING_MESSAGES)
    elif level == "DEBUG":
        message_template = random.choice(DEBUG_MESSAGES)
    else:  # INFO
        message_template = random.choice(INFO_MESSAGES)
    
    # Fill in template variables
    message = message_template.format(
        ip=generate_ip(),
        port=random.randint(3000, 9999),
        ms=random.randint(50, 5000),
        mb=random.randint(100, 2048),
        percent=random.randint(60, 99),
        user_id=random.randint(10000, 99999),
        service=random.choice(SERVICES),
        exception=random.choice(["NullPointerException", "TimeoutException", "ConnectionException", "SQLException"]),
        domain=random.choice(["api.example.com", "cdn.example.com", "auth.example.com"]),
        count=random.randint(100, 10000),
        tx_id=f"TX{random.randint(100000, 999999)}",
        attempt=random.randint(1, 5),
        endpoint=random.choice(["users", "orders", "payments", "products", "analytics"]),
        key=f"cache_key_{random.randint(1000, 9999)}",
        rate=random.randint(500, 2000),
        job_id=f"JOB{random.randint(10000, 99999)}",
        table=random.choice(["users", "orders", "transactions", "products"]),
        config=random.choice(["app.yaml", "database.json", "redis.conf"]),
        task=random.choice(["cleanup", "backup", "sync", "index"]),
        size=random.randint(1, 50)
    )
    
    # Generate timestamp (spread over last 24 hours)
    time_offset = timedelta(seconds=index * 86.4)  # 86.4 seconds between logs for 1000 logs over 24h
    timestamp = (base_time - timedelta(hours=24) + time_offset).isoformat() + "Z"
    
    log = {
        "timestamp": timestamp,
        "level": level,
        "service": service,
        "message": message
    }
    
    # Add metadata for some logs
    if random.random() < 0.3:
        log["metadata"] = {
            "host": f"host-{random.randint(1, 10)}",
            "environment": random.choice(["production", "staging"]),
            "region": random.choice(["us-east-1", "eu-west-1", "ap-south-1"])
        }
    
    return log

def send_log(log, index):
    """Send log to backend API"""
    try:
        response = requests.post(
            f"{BACKEND_URL}/logs/",
            json=log,
            timeout=5
        )
        if response.status_code == 200:
            if (index + 1) % 50 == 0:
                print(f"✓ Sent {index + 1} logs...")
            return True
        else:
            print(f"✗ Failed to send log {index + 1}: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error sending log {index + 1}: {e}")
        return False

def main():
    print("🚀 Generating and sending 1000 test logs...")
    print(f"Backend URL: {BACKEND_URL}")
    print("-" * 60)
    
    base_time = datetime.utcnow()
    success_count = 0
    failed_count = 0
    
    for i in range(1000):
        log = generate_log(i, base_time)
        
        if send_log(log, i):
            success_count += 1
        else:
            failed_count += 1
        
        # Small delay to avoid overwhelming the server
        if i % 10 == 0:
            import time
            time.sleep(0.1)
    
    print("-" * 60)
    print(f"✅ Successfully sent: {success_count} logs")
    if failed_count > 0:
        print(f"❌ Failed to send: {failed_count} logs")
    print(f"📊 View logs in dashboard: http://localhost:8501")
    print(f"🔍 Check anomalies at: http://localhost:8000/analysis/anomalies")

if __name__ == "__main__":
    main()
