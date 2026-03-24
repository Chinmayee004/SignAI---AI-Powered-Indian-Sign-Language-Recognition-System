# PowerShell script to run SignAI backend
# Usage: .\run-backend.ps1

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Navigate to project root and activate virtual environment
Set-Location $projectRoot
& "$projectRoot\.venv\Scripts\Activate.ps1"

# Navigate to backend and run server
Set-Location backend
Write-Host "Starting SignAI Backend Server..." -ForegroundColor Green
Write-Host "API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Docs available at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
