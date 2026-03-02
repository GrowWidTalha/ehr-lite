# EHR Lite - PowerShell Startup Script
# Run this script to start backend and frontend in background

$ErrorActionPreference = "Stop"

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "EHR Lite - Production Launcher" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install from: https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

# ==============================================================================
# 1. Dependencies
# ==============================================================================
Write-Host "[1/4] Checking dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "  Installing backend dependencies..."
    Set-Location backend
    npm install --silent --no-audit --no-fund
    Set-Location ..
}
Write-Host "  Backend dependencies OK." -ForegroundColor Green

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "  Installing frontend dependencies..."
    Set-Location frontend
    npm install --silent --no-audit --no-fund
    Set-Location ..
}
Write-Host "  Frontend dependencies OK." -ForegroundColor Green

# ==============================================================================
# 2. Setup Directories
# ==============================================================================
Write-Host ""
Write-Host "[2/4] Setting up directories..." -ForegroundColor Yellow
$null = New-Item -ItemType Directory -Force -Path "data"
$null = New-Item -ItemType Directory -Force -Path "data\patient-images"
$null = New-Item -ItemType Directory -Force -Path "logs"
Write-Host "  Directories ready." -ForegroundColor Green

# ==============================================================================
# 3. Build Frontend
# ==============================================================================
Write-Host ""
Write-Host "[3/4] Checking frontend build..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path ".next")) {
    Write-Host "  Building frontend..."
    npm run build
}
Set-Location $ScriptDir
Write-Host "  Frontend build OK." -ForegroundColor Green

# ==============================================================================
# 4. Start Services (Hidden Background)
# ==============================================================================
Write-Host ""
Write-Host "[4/4] Starting services in background..." -ForegroundColor Yellow
Write-Host ""

# Function to start a background process
function Start-BackgroundService {
    param(
        [string]$Name,
        [string]$WorkingDir,
        [string]$Command,
        [string]$LogFile
    )

    # Get absolute paths
    $WorkingDir = Resolve-Path $WorkingDir
    $LogFile = Resolve-Path $LogFile

    # Create the process start info
    $ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
    $ProcessInfo.FileName = "cmd.exe"
    $ProcessInfo.Arguments = "/c `"$Command`" 2>&1 | Out-File -FilePath `"$LogFile`" -Encoding ascii"
    $ProcessInfo.WorkingDirectory = $WorkingDir
    $ProcessInfo.UseShellExecute = $false
    $ProcessInfo.RedirectStandardOutput = $true
    $ProcessInfo.RedirectStandardError = $true
    $ProcessInfo.CreateNoWindow = $true
    $ProcessInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden

    # Start the process
    $Process = [System.Diagnostics.Process]::Start($ProcessInfo)

    Write-Host "  Started $Name" -ForegroundColor Green

    return $Process.Id
}

# Start backend
Write-Host "Starting backend on port 4000..." -ForegroundColor Cyan
$BackendPid = Start-BackgroundService -Name "Backend" -WorkingDir "backend" -Command "npm run dev" -LogFile "logs\backend.log"

# Wait for backend to start
Write-Host "  Waiting for backend..." -ForegroundColor Gray
Start-Sleep -Seconds 6

# Start frontend
Write-Host "Starting frontend on port 3000..." -ForegroundColor Cyan
Set-Location frontend
$FrontendPid = Start-BackgroundService -Name "Frontend" -WorkingDir "frontend" -Command "npm run start" -LogFile "logs\frontend.log"
Set-Location $ScriptDir

# Wait for frontend to start
Write-Host "  Waiting for frontend..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Save PIDs for stopping later
$BackendPid | Out-File -FilePath ".backend.pid" -Encoding ascii
$FrontendPid | Out-File -FilePath ".frontend.pid" -Encoding ascii

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "                      EHR Lite - RUNNING" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services running in background:" -ForegroundColor White
Write-Host "  Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Logs:" -ForegroundColor White
Write-Host "  Backend:  logs\backend.log" -ForegroundColor Gray
Write-Host "  Frontend: logs\frontend.log" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop: run stop-app.ps1" -ForegroundColor Yellow
Write-Host ""

# Check services
Write-Host "Checking services..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $null = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -TimeoutSec 3
    Write-Host "  [OK] Backend responding" -ForegroundColor Green
} catch {
    Write-Host "  [WAIT] Backend starting..." -ForegroundColor Yellow
}

try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3
    Write-Host "  [OK] Frontend responding" -ForegroundColor Green
} catch {
    Write-Host "  [WAIT] Frontend starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Services are running! You can close this window." -ForegroundColor Green
Write-Host "Press Enter to exit..."
Read-Host
