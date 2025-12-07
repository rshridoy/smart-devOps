# AI DevOps Monitor 🔍

An open-source AI-powered DevOps monitoring system with intelligent anomaly detection, failure prediction, and automated root cause analysis.

## Features

- **Real-time Log Ingestion**: Collect logs from multiple services via REST API
- **Anomaly Detection**: ML-powered detection using Isolation Forest and sentence embeddings
- **Failure Prediction**: XGBoost-based predictive analytics for service failures
- **AI Root Cause Analysis**: LLM-powered analysis using Mistral 7B for intelligent insights
- **Interactive Dashboard**: Streamlit-based UI with real-time metrics and visualizations
- **Smart Alerts**: Automated notifications via Slack and email
- **Scalable Storage**: OpenSearch for efficient log indexing and search

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Log Sources   │─────▶│  FastAPI Backend │─────▶│   OpenSearch    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ Anomaly  │ │Predictor │ │   LLM    │
              │ Detector │ │ (XGBoost)│ │(Mistral) │
              └──────────┘ └──────────┘ └──────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │    Dashboard    │
                        │   (Streamlit)   │
                        └─────────────────┘
```

## Tech Stack

- **Backend**: FastAPI, Python 3.11
- **Log Storage**: OpenSearch 2.11
- **ML Models**: 
  - PyOD (Isolation Forest) for anomaly detection
  - XGBoost for failure prediction
  - SentenceTransformers for log embeddings
- **LLM**: Mistral 7B via Ollama
- **Dashboard**: 
  - Streamlit with Plotly (classic UI)
  - React 18 + TailwindCSS (modern UI)
- **Deployment**: Docker & Docker Compose
- **Alerts**: Slack webhooks, SMTP email

## Quick Start

### Prerequisites

- Docker and Docker Compose
- 8GB+ RAM recommended
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-devops-monitor.git
cd ai-devops-monitor
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings (Slack webhook, email config, etc.)
```

3. **Start services**
```bash
docker-compose up -d
```

This will start:
- OpenSearch (port 9200)
- Ollama with Mistral (port 11434)
- FastAPI Backend (port 8000)
- Streamlit Dashboard (port 8501)

4. **Pull Mistral model** (first time only)
```bash
docker exec -it ollama ollama pull mistral
```

5. **Access the dashboards**

**Streamlit Dashboard (Classic)**
```
http://localhost:8501
```

**React Dashboard (Modern)**
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:3000
```

6. **API Documentation**
```
http://localhost:8000/docs
```

## Usage

### Ingest Logs

Send logs to the API:

```bash
curl -X POST "http://localhost:8000/logs/" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "ERROR",
    "service": "payment-service",
    "message": "Connection timeout to database"
  }'
```

### Ingest Sample Logs

```bash
# Load sample logs
cat data/sample_logs.json | jq -c '.[]' | while read log; do
  curl -X POST "http://localhost:8000/logs/" \
    -H "Content-Type: application/json" \
    -d "$log"
done
```

### API Endpoints

**Logs**
- `POST /logs/` - Ingest a log entry
- `GET /logs/` - Retrieve logs (with optional filters)
- `GET /logs/search?query=error` - Search logs

**Analysis**
- `GET /analysis/anomalies` - Get detected anomalies
- `GET /analysis/predict?service=payment-service` - Predict failures
- `POST /analysis/rca` - AI-powered root cause analysis
- `POST /analysis/batch-analyze` - Run full analysis pipeline

**Alerts**
- `POST /alerts/test` - Send test alert
- `POST /alerts/send` - Send custom alert
- `POST /alerts/anomaly` - Send anomaly alert
- `POST /alerts/failure` - Send failure prediction alert

### Dashboard Features

#### Streamlit Dashboard (Classic)

1. **Overview Tab**
   - Real-time metrics (total logs, errors, warnings)
   - Log level distribution pie chart
   - Logs by service bar chart
   - Recent logs table with filtering

2. **Anomalies Tab**
   - Detected anomalies with scores
   - Anomaly score distribution
   - Detailed anomaly information

3. **Predictions Tab**
   - Service-specific failure prediction
   - Risk level gauge (low/medium/high)
   - Probability and confidence metrics
   - Prediction features

4. **AI Analysis Tab**
   - Select error logs for analysis
   - LLM-powered root cause analysis
   - Actionable recommendations
   - Context-aware insights

#### React Dashboard (Modern)

1. **Dashboard Page**
   - Live system metrics and stats
   - Interactive charts (Chart.js & Recharts)
   - Service health monitoring
   - Recent anomalies preview
   - Real-time updates via WebSocket

2. **Logs Page**
   - Searchable log table with filters
   - Level-based color coding
   - Auto-refresh every 10 seconds
   - Export logs to JSON
   - Service and level filtering

3. **Anomalies Page**
   - Severity-based cards (Low/Medium/High/Critical)
   - Anomaly score visualization
   - Statistics overview
   - Timestamp and service info
   - Refresh button

4. **Predict & RCA Page**
   - Service-specific failure prediction
   - Risk gauge with recommendations
   - AI-powered root cause analysis
   - Select multiple logs for analysis
   - Context input for better insights

5. **Settings Page**
   - Slack webhook configuration
   - SMTP email setup
   - Test alert functionality
   - Save configuration via API

**Tech Stack**: React 18, Vite, TailwindCSS, React Router, Chart.js, Recharts, Axios, Lucide Icons

See [frontend/README.md](frontend/README.md) for detailed setup instructions.

## Configuration

### Environment Variables

```bash
# OpenSearch
OPENSEARCH_HOST=opensearch
OPENSEARCH_PORT=9200
OPENSEARCH_USER=admin
OPENSEARCH_PASSWORD=admin

# LLM
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=mistral

# Slack Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email Alerts
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=devops@example.com
ALERT_EMAIL_RECIPIENTS=admin@example.com,ops@example.com
```

### Slack Webhook Setup

1. Go to https://api.slack.com/apps
2. Create a new app
3. Enable Incoming Webhooks
4. Create a webhook URL
5. Add URL to `.env` file

### Email Setup

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the app password in `SMTP_PASSWORD`

## Model Training

### Train Anomaly Detector

```python
from app.services.anomaly_detector import anomaly_detector
from app.services.opensearch_client import opensearch_client

# Get historical logs
logs = opensearch_client.search_logs(limit=10000)

# Train model
anomaly_detector.train(logs)
```

### Train Failure Predictor

```python
from app.services.predictor import predictor
import numpy as np

# Prepare training data (features, labels)
X = np.array([...])  # Feature matrix
y = np.array([...])  # Labels (0=normal, 1=failure)

# Train model
predictor.train(X, y)
```

## Development

### Project Structure

```
ai-devops-monitor/
├── app/
│   ├── main.py                 # FastAPI app
│   ├── routes/
│   │   ├── logs.py            # Log ingestion endpoints
│   │   ├── analysis.py        # Analysis endpoints
│   │   └── alerts.py          # Alert endpoints
│   ├── services/
│   │   ├── opensearch_client.py   # OpenSearch integration
│   │   ├── anomaly_detector.py    # ML anomaly detection
│   │   ├── predictor.py           # Failure prediction
│   │   ├── llm_agent.py           # LLM-based RCA
│   │   └── notifier.py            # Alert notifications
│   ├── utils/
│   │   ├── config.py          # Configuration
│   │   └── preprocess.py      # Log preprocessing
│   └── models/                # Trained ML models
├── dashboard/
│   └── app.py                 # Streamlit dashboard
├── frontend/                  # React dashboard
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # API client
│   │   ├── App.jsx           # Main app
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── data/
│   └── sample_logs.json       # Sample log data
├── docker-compose.yml         # Docker services
├── Dockerfile                 # Backend container
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
└── README.md                 # This file
```

### Running Locally (without Docker)

1. **Install dependencies**
```bash
pip install -r requirements.txt
```

2. **Start OpenSearch** (or use external instance)
```bash
docker run -d -p 9200:9200 -e "discovery.type=single-node" \
  opensearchproject/opensearch:2.11.0
```

3. **Start Ollama**
```bash
ollama serve
ollama pull mistral
```

4. **Run backend**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. **Run dashboard**
```bash
# Streamlit (Classic)
cd dashboard
streamlit run app.py

# React (Modern)
cd frontend
npm install
npm run dev
```

## Monitoring & Operations

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# OpenSearch health
curl http://localhost:9200/_cluster/health

# Ollama health
curl http://localhost:11434/api/tags
```

### Logs

```bash
# View backend logs
docker logs -f backend

# View dashboard logs
docker logs -f dashboard

# View OpenSearch logs
docker logs -f opensearch
```

### Performance Tuning

- **OpenSearch**: Adjust `OPENSEARCH_JAVA_OPTS` for memory
- **Ollama**: Use GPU for faster inference (add GPU config to docker-compose)
- **Backend**: Scale with multiple workers: `--workers 4`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: https://github.com/yourusername/ai-devops-monitor/issues
- **Discussions**: https://github.com/yourusername/ai-devops-monitor/discussions

## Roadmap

- [ ] Multi-tenant support
- [ ] Kubernetes deployment templates
- [ ] Grafana integration
- [ ] Custom alerting rules engine
- [ ] ML model auto-retraining
- [ ] Plugin system for custom detectors
- [ ] Mobile app for alerts

## Acknowledgments

- OpenSearch for scalable log storage
- Ollama for easy LLM deployment
- FastAPI for excellent API framework
- Streamlit for rapid dashboard development

---

**Built with ❤️ for the DevOps community**
