# 🚀 Quick Reference Card

## Start System
```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

## Access URLs
- React Dashboard: http://localhost:5173 (run 'npm run dev' in frontend/)
- API Docs: http://localhost:8000/docs
- API: http://localhost:8000
- OpenSearch: http://localhost:9200

## Common Commands

### Docker Management
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart [backend|opensearch|ollama]

# Check status
docker-compose ps
```

### Load Sample Data
```bash
# Windows
load_sample_logs.bat

# Linux/Mac
./load_sample_logs.sh
```

### API Examples

**Ingest Log**
```bash
curl -X POST http://localhost:8000/logs/ \
  -H "Content-Type: application/json" \
  -d '{"level":"ERROR","service":"api","message":"Connection failed"}'
```

**Get Logs**
```bash
curl http://localhost:8000/logs/?limit=50
```

**Search Logs**
```bash
curl "http://localhost:8000/logs/search?query=error&limit=20"
```

**Detect Anomalies**
```bash
curl http://localhost:8000/analysis/anomalies
```

**Predict Failures**
```bash
curl "http://localhost:8000/analysis/predict?service=payment-service"
```

**AI Analysis**
```bash
curl -X POST http://localhost:8000/analysis/rca \
  -H "Content-Type: application/json" \
  -d '{"log_ids":["id1","id2"],"context":"after deployment"}'
```

**Test Alert**
```bash
curl -X POST http://localhost:8000/alerts/test
```

### Health Checks
```bash
# Backend
curl http://localhost:8000/health

# OpenSearch
curl http://localhost:9200/_cluster/health

# Ollama
curl http://localhost:11434/api/tags
```

### Mistral Model
```bash
# List models
docker exec ollama ollama list

# Pull Mistral
docker exec ollama ollama pull mistral

# Test Mistral
docker exec ollama ollama run mistral "Hello"
```

## Configuration

### Environment (.env)
```bash
# Copy template
cp .env.example .env

# Edit configuration
# - SLACK_WEBHOOK_URL for Slack alerts
# - SMTP_* for email alerts
# - OPENSEARCH_* for custom OpenSearch setup
```

### Alert Configuration
- **Slack**: Get webhook from https://api.slack.com/apps
- **Email**: Use app password for Gmail (not regular password)

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
# Windows: netstat -ano | findstr :8000
# Linux: lsof -i :8000

# Change port in docker-compose.yml
```

### OpenSearch Won't Start
```bash
# Check Docker memory (needs 2GB+)
docker info | grep -i memory

# Increase Docker memory in Docker Desktop settings
```

### Mistral Not Responding
```bash
# Check if model is pulled
docker exec ollama ollama list

# Pull if missing
docker exec ollama ollama pull mistral

# Restart Ollama
docker-compose restart ollama
```

### Backend Import Errors
```bash
# Rebuild container
docker-compose build backend
docker-compose up -d backend
```

## Development

### Run Locally (without Docker)
```bash
# Install dependencies
pip install -r requirements.txt

# Start OpenSearch & Ollama
docker-compose up -d opensearch ollama

# Run backend
uvicorn app.main:app --reload --port 8000

# Run frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Test API
```bash
# Interactive docs
http://localhost:8000/docs

# ReDoc
http://localhost:8000/redoc
```

## File Locations

- **Config**: `.env`
- **Logs**: `docker-compose logs`
- **Models**: `app/models/*.pkl`
- **Sample Data**: `data/sample_logs.json`
- **Backend**: `app/`
- **Frontend**: `frontend/`

## Performance

### Scale Backend
```bash
# Edit docker-compose.yml
command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### OpenSearch Memory
```bash
# Edit docker-compose.yml
environment:
  - "OPENSEARCH_JAVA_OPTS=-Xms1g -Xmx1g"  # Adjust as needed
```

### Add GPU for Ollama
```bash
# Edit docker-compose.yml under ollama service
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## Support

- **Documentation**: README.md
- **Contributing**: CONTRIBUTING.md
- **Issues**: Create GitHub issue
- **Discussions**: GitHub Discussions

---

**Quick Tip**: Keep this card handy for daily operations!
