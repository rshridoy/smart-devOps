#!/bin/bash

# Load sample logs into the system

BACKEND_URL="http://localhost:8000"

echo "📥 Loading sample logs..."

# Check if backend is running
if ! curl -s "${BACKEND_URL}/health" > /dev/null 2>&1; then
    echo "❌ Backend is not running. Please start it first with: docker-compose up -d"
    exit 1
fi

# Load each log from sample_logs.json
cat data/sample_logs.json | jq -c '.[]' | while read -r log; do
    echo "Sending log..."
    curl -X POST "${BACKEND_URL}/logs/" \
        -H "Content-Type: application/json" \
        -d "$log" \
        -s -o /dev/null
done

echo ""
echo "✅ Sample logs loaded successfully!"
echo "📊 View them in the React dashboard: http://localhost:5173 (run 'npm run dev' in frontend/)"
