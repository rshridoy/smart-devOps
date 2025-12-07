#!/bin/bash

# AI DevOps Monitor - Quick Start Script

echo "🚀 Starting AI DevOps Monitor..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if Ollama is running
echo "🤖 Checking Ollama..."
if docker exec ollama ollama list > /dev/null 2>&1; then
    echo "✅ Ollama is running"
    
    # Check if Mistral model is available
    if ! docker exec ollama ollama list | grep -q mistral; then
        echo "📥 Downloading Mistral model (this may take a few minutes)..."
        docker exec ollama ollama pull mistral
    else
        echo "✅ Mistral model is available"
    fi
else
    echo "⚠️  Ollama is starting, please wait..."
fi

# Display status
echo ""
echo "✨ AI DevOps Monitor is starting up!"
echo ""
echo "📊 Dashboard:     http://localhost:8501"
echo "🔌 API:           http://localhost:8000"
echo "📖 API Docs:      http://localhost:8000/docs"
echo "🔍 OpenSearch:    http://localhost:9200"
echo ""
echo "📝 To ingest sample logs, run:"
echo "   curl -X POST http://localhost:8000/logs/ -H 'Content-Type: application/json' -d @data/sample_logs.json"
echo ""
echo "🛑 To stop: docker-compose down"
echo "📋 View logs: docker-compose logs -f"
