@echo off
REM Load sample logs into the system

set BACKEND_URL=http://localhost:8000

echo Loading sample logs...

REM Check if backend is running
curl -s %BACKEND_URL%/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Backend is not running. Please start it first with: docker-compose up -d
    exit /b 1
)

REM Load sample logs using PowerShell
powershell -Command "$logs = Get-Content 'data\sample_logs.json' | ConvertFrom-Json; foreach ($log in $logs) { $json = $log | ConvertTo-Json -Compress; Invoke-RestMethod -Uri '%BACKEND_URL%/logs/' -Method Post -Body $json -ContentType 'application/json' | Out-Null; Write-Host 'Log sent...' }"

echo.
echo Sample logs loaded successfully!
echo View them in the React dashboard: http://localhost:5173 (run 'npm run dev' in frontend/)
