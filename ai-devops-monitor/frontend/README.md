# AI DevOps Monitor - React Frontend

Modern React frontend for AI DevOps Monitor with real-time monitoring, anomaly detection visualization, and AI-powered root cause analysis.

## Features

- 📊 **Real-time Dashboard** - Live metrics and system health monitoring
- 📝 **Log Viewer** - Search, filter, and export logs with color-coded levels
- ⚠️ **Anomaly Detection** - ML-detected anomalies with severity indicators
- 🔮 **Failure Prediction** - XGBoost-powered failure risk assessment
- 🤖 **AI Root Cause Analysis** - Mistral LLM-powered intelligent analysis
- 🔔 **Alert Configuration** - Slack and email notification setup
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Chart.js** - Data visualization
- **Axios** - API client
- **Lucide React** - Icons

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend running on `http://localhost:8000`

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx      # Top navigation bar
│   │   ├── Sidebar.jsx     # Mobile sidebar
│   │   ├── LogTable.jsx    # Log display table
│   │   ├── AnomalyCard.jsx # Anomaly visualization
│   │   ├── PredictionChart.jsx  # Failure prediction gauge
│   │   └── RCABox.jsx      # AI analysis interface
│   │
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Logs.jsx        # Log viewer
│   │   ├── Anomalies.jsx   # Anomaly list
│   │   ├── Predict.jsx     # Prediction & RCA
│   │   └── Settings.jsx    # Configuration
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useFetch.js    # Generic API fetch hook
│   │   ├── useLogs.js     # Log management hook
│   │   └── useWebSocket.js # WebSocket connection
│   │
│   ├── utils/
│   │   └── api.js          # API client & endpoints
│   │
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
│
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

The frontend connects to these backend endpoints:

### Logs
- `GET /logs/` - Fetch logs with filters
- `POST /logs/` - Ingest new log
- `GET /logs/search` - Search logs

### Analysis
- `GET /analysis/anomalies` - Get detected anomalies
- `GET /analysis/predict` - Predict failures
- `POST /analysis/rca` - AI root cause analysis

### Alerts
- `POST /alerts/test` - Send test alert
- `POST /alerts/send` - Send custom alert

## Configuration

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

## Features Guide

### Dashboard
- Overview of system metrics
- Real-time log statistics
- Service health status
- Recent anomalies preview

### Logs
- **Search**: Filter logs by keyword
- **Filter**: By log level and service
- **Export**: Download logs as JSON
- **Auto-refresh**: Updates every 10 seconds

### Anomalies
- Color-coded severity (Low/Medium/High/Critical)
- Anomaly score visualization
- Timestamp and service info
- Full log message display

### Predictions
- Service-specific failure prediction
- Risk gauge (Low/Medium/High)
- Probability and confidence metrics
- Actionable recommendations
- AI-powered root cause analysis with log selection

### Settings
- Slack webhook configuration
- SMTP email setup
- Test alert functionality
- Save configuration

## Customization

### Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ },
      danger: { /* your colors */ },
      // ...
    }
  }
}
```

### Auto-refresh Interval

Edit `useLogs` hook in `src/hooks/useLogs.js`:

```javascript
const { logs } = useLogs(true, 5000); // 5 seconds
```

## Development

### Add New Page

1. Create component in `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`
3. Add navigation item in `src/components/Navbar.jsx`

### Add New API Endpoint

Edit `src/utils/api.js`:

```javascript
export const yourAPI = {
  getData: () => api.get('/your-endpoint'),
};
```

## Troubleshooting

### CORS Issues

If you see CORS errors, ensure your backend allows requests from `http://localhost:3000`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Connection Failed

1. Check backend is running on port 8000
2. Verify API_URL in `.env`
3. Check browser console for errors

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Performance

- Components use React.memo for optimization
- useMemo for expensive computations
- Debounced search inputs
- Lazy loading for charts
- Pagination for large datasets (coming soon)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 14+

## License

MIT License

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/ai-devops-monitor/issues)
- Documentation: [README.md](../README.md)
