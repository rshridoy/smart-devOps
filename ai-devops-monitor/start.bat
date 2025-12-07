@echo off
REM AI DevOps Monitor - Quick Start Script for Windows

echo Starting AI DevOps Monitor...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker first.
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please edit .env file with your configuration
)

REM Start services
echo Starting Docker containers...
docker-compose up -d

REM Wait for services
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check Ollama
echo Checking Ollama...
docker exec ollama ollama list >nul 2>&1
if %errorlevel% equ 0 (
    echo Ollama is running
    
    REM Check if Mistral model is available
    docker exec ollama ollama list | find "mistral" >nul
    if %errorlevel% neq 0 (
        echo Downloading Mistral model (this may take a few minutes)...
        docker exec ollama ollama pull mistral
    ) else (
        echo Mistral model is available
    )
) else (
    echo Ollama is starting, please wait...
)

REM Display status
echo.
echo AI DevOps Monitor is starting up!
echo.
echo Dashboard:     http://localhost:8501
echo API:           http://localhost:8000
echo API Docs:      http://localhost:8000/docs
echo OpenSearch:    http://localhost:9200
echo.
echo To stop: docker-compose down
echo View logs: docker-compose logs -f
