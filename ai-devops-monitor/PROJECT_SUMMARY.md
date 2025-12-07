# AI DevOps Monitor - Project Summary

## 🎉 Project Successfully Created!

Your complete AI DevOps Monitoring System has been generated with all components ready to use.

## 📁 Project Structure

```
ai-devops-monitor/
│
├── app/                           # Backend application
│   ├── main.py                   # FastAPI application entry point
│   ├── routes/                   # API endpoints
│   │   ├── logs.py              # Log ingestion and retrieval
│   │   ├── analysis.py          # Anomaly detection, prediction, RCA
│   │   └── alerts.py            # Alert management
│   ├── services/                 # Business logic layer
│   │   ├── opensearch_client.py # OpenSearch integration
│   │   ├── anomaly_detector.py  # ML-based anomaly detection (PyOD)
│   │   ├── predictor.py         # Failure prediction (XGBoost)
│   │   ├── llm_agent.py         # LLM-based RCA (Mistral via Ollama)
│   │   └── notifier.py          # Slack & email notifications
│   ├── utils/                    # Utility functions
│   │   ├── config.py            # Configuration management
│   │   └── preprocess.py        # Log preprocessing
│   └── models/                   # ML model storage
│       ├── anomaly_model.pkl    # Trained anomaly detection model
│       └── predictor_model.pkl  # Trained prediction model
│
├── dashboard/                    # Frontend dashboard
│   └── app.py                   # Streamlit dashboard with 4 tabs
│
├── data/                         # Sample data
│   └── sample_logs.json         # Example log entries
│
├── docker-compose.yml            # Multi-container Docker setup
├── Dockerfile                    # Backend container image
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore rules
├── LICENSE                       # MIT License
├── README.md                     # Comprehensive documentation
├── CONTRIBUTING.md               # Contribution guidelines
├── start.sh / start.bat         # Quick start scripts
└── load_sample_logs.sh/.bat     # Sample data loader
```

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your settings

# 2. Start all services
docker-compose up -d

# 3. Wait for services to initialize (30-60 seconds)

# 4. Pull Mistral model
docker exec ollama ollama pull mistral

# 5. Load sample data
# Windows: load_sample_logs.bat
# Linux/Mac: chmod +x load_sample_logs.sh && ./load_sample_logs.sh
```

## 🌐 Access Points

- **Dashboard**: http://localhost:8501
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **OpenSearch**: http://localhost:9200

## 🔧 Key Components

### 1. FastAPI Backend (Port 8000)

**Endpoints:**

- **Logs**
  - `POST /logs/` - Ingest logs
  - `GET /logs/` - Retrieve logs
  - `GET /logs/search?query=error` - Search logs

- **Analysis**
  - `GET /analysis/anomalies` - Get anomalies
  - `GET /analysis/predict` - Predict failures
  - `POST /analysis/rca` - AI root cause analysis
  - `POST /analysis/batch-analyze` - Full analysis

- **Alerts**
  - `POST /alerts/test` - Test alert
  - `POST /alerts/send` - Custom alert

### 2. Streamlit Dashboard (Port 8501)

**Tabs:**
- **Overview**: Metrics, charts, log table
- **Anomalies**: Detected anomalies with scores
- **Predictions**: Failure prediction with risk gauge
- **AI Analysis**: LLM-powered root cause analysis

### 3. ML Components

**Anomaly Detection:**
- Algorithm: Isolation Forest (PyOD)
- Features: Sentence embeddings + log metadata
- Output: Binary classification + anomaly score

**Failure Prediction:**
- Algorithm: XGBoost
- Features: Error rate, keyword frequency, time series
- Output: Risk level (low/medium/high) + probability

**LLM Agent:**
- Model: Mistral 7B via Ollama
- Task: Root cause analysis
- Input: Error logs + context
- Output: Summary, causes, recommendations

### 4. Storage

**OpenSearch:**
- Index: `devops-logs`
- Features: Full-text search, aggregations
- Retention: Configurable

## 📊 Usage Examples

### Ingest a Log

```bash
curl -X POST "http://localhost:8000/logs/" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "ERROR",
    "service": "payment-service",
    "message": "Database connection timeout after 30s"
  }'
```

### Get Anomalies

```bash
curl "http://localhost:8000/analysis/anomalies"
```

### Predict Failures

```bash
curl "http://localhost:8000/analysis/predict?service=payment-service"
```

### AI Root Cause Analysis

```bash
curl -X POST "http://localhost:8000/analysis/rca" \
  -H "Content-Type: application/json" \
  -d '{
    "log_ids": ["log-id-1", "log-id-2"],
    "context": "After recent deployment"
  }'
```

## 🔔 Alerts Configuration

### Slack

1. Create webhook: https://api.slack.com/apps
2. Add to `.env`: `SLACK_WEBHOOK_URL=https://hooks.slack.com/...`

### Email

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_EMAIL_RECIPIENTS=admin@example.com,ops@example.com
```

## 🎯 Next Steps

1. **Configure Alerts**: Set up Slack/email in `.env`
2. **Ingest Real Logs**: Connect your services to the API
3. **Train Models**: Use historical data to train ML models
4. **Customize Dashboard**: Modify `dashboard/app.py` for your needs
5. **Scale**: Add more workers, use load balancer

## 🔍 Monitoring

```bash
# View logs
docker-compose logs -f

# Check health
curl http://localhost:8000/health

# Container status
docker-compose ps

# Resource usage
docker stats
```

## 🛑 Stop Services

```bash
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

## 📈 Performance Tips

1. **OpenSearch**: Adjust heap size in docker-compose.yml
2. **Ollama**: Add GPU support for faster inference
3. **Backend**: Scale with multiple workers
4. **Models**: Retrain periodically with fresh data

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]
```

### Mistral Not Working
```bash
# Verify Ollama is running
docker exec ollama ollama list

# Pull model again
docker exec ollama ollama pull mistral
```

### OpenSearch Issues
```bash
# Check health
curl http://localhost:9200/_cluster/health

# Restart
docker-compose restart opensearch
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - See [LICENSE](LICENSE)

## 🎓 Learning Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [OpenSearch Guide](https://opensearch.org/docs/latest/)
- [PyOD Documentation](https://pyod.readthedocs.io/)
- [LangChain Docs](https://python.langchain.com/)
- [Streamlit Guide](https://docs.streamlit.io/)

## 🌟 Features Roadmap

- [ ] Kubernetes deployment
- [ ] Multi-tenant support
- [ ] Advanced alerting rules
- [ ] ML model auto-retraining
- [ ] Mobile app
- [ ] Grafana integration
- [ ] Custom detector plugins

---

**Happy Monitoring! 🎉**

If you encounter any issues, check the logs or create an issue on GitHub.
