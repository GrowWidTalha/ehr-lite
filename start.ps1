# EHR Lite Startup Script
# Run this script daily to start the backend and frontend servers

$ErrorActionPreference = "Continue"

# Configuration
$ProjectRoot = $PSScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Starting EHR Lite" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Function to check if port is in use
function Test-PortInUse {
    param([int]$Port)
    $Result = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty State -ErrorAction SilentlyContinue
    return $Result -eq "Established" -or $Result -eq "Listen"
}

# Check if servers are already running
Write-Host "[*] Checking for existing servers..." -ForegroundColor Yellow
$BackendRunning = Test-PortInUse -Port 4000
$FrontendRunning = Test-PortInUse -Port 3000

if ($BackendRunning) {
    Write-Host "  ! Backend already running on port 4000" -ForegroundColor DarkYellow
} else {
    Write-Host "  → Starting backend..." -ForegroundColor Cyan

    # Create logs directory
    $LogsDir = Join-Path $BackendDir "logs"
    New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null

    # Start backend in background
    $BackendLog = Join-Path $LogsDir "backend.log"
    $StartInfo = New-Object System.Diagnostics.ProcessStartInfo
    $StartInfo.FileName = "node"
    $StartInfo.Arguments = "src/server.js"
    $StartInfo.WorkingDirectory = $BackendDir
    $StartInfo.RedirectStandardOutput = $BackendLog
    $StartInfo.RedirectStandardError = $BackendLog
    $StartInfo.UseShellExecute = $false
    $StartInfo.CreateNoWindow = $true

    $BackendProcess = [System.Diagnostics.Process]::Start($StartInfo)

    # Save PID for later cleanup
    $BackendProcess.Id | Out-File -FilePath (Join-Path $LogsDir "backend.pid") -Force

    Write-Host "  ✓ Backend started (PID: $($BackendProcess.Id))" -ForegroundColor Green
    Write-Host "    Logs: $BackendLog" -ForegroundColor DarkGray
}

if ($FrontendRunning) {
    Write-Host "  ! Frontend already running on port 3000" -ForegroundColor DarkYellow
} else {
    Write-Host "  → Starting frontend..." -ForegroundColor Cyan

    # Create logs directory
    $LogsDir = Join-Path $FrontendDir "logs"
    New-Item -ItemType Directory -Force -Path $LogsDir | Out-Null

    # Start frontend in background
    $FrontendLog = Join-Path $LogsDir "frontend.log"
    $StartInfo = New-Object System.Diagnostics.ProcessStartInfo
    $StartInfo.FileName = "npm"
    $StartInfo.Arguments = "start"
    $StartInfo.WorkingDirectory = $FrontendDir
    $StartInfo.RedirectStandardOutput = $FrontendLog
    $StartInfo.RedirectStandardError = $FrontendLog
    $StartInfo.UseShellExecute = $false
    $StartInfo.CreateNoWindow = $true

    $FrontendProcess = [System.Diagnostics.Process]::Start($StartInfo)

    # Save PID for later cleanup
    $FrontendProcess.Id | Out-File -FilePath (Join-Path $LogsDir "frontend.pid") -Force

    Write-Host "  ✓ Frontend started (PID: $($FrontendProcess.Id))" -ForegroundColor Green
    Write-Host "    Logs: $FrontendLog" -ForegroundColor DarkGray
}

Write-Host ""

# Wait for servers to be ready
Write-Host "[*] Waiting for servers to be ready..." -ForegroundColor Yellow
$MaxWait = 15
$Waited = 0
$BackendReady = $false
$FrontendReady = $false

while ($Waited -lt $MaxWait) {
    if (-not $BackendReady -and (Test-PortInUse -Port 4000)) {
        $BackendReady = $true
        Write-Host "  ✓ Backend is ready" -ForegroundColor Green
    }
    if (-not $FrontendReady -and (Test-PortInUse -Port 3000)) {
        $FrontendReady = $true
        Write-Host "  ✓ Frontend is ready" -ForegroundColor Green
    }
    if ($BackendReady -and $FrontendReady) {
        break
    }
    Start-Sleep -Seconds 1
    $Waited++
}

Write-Host ""

# Display status
Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Application Status" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""

# Open browser
Write-Host "[*] Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"
Write-Host "  ✓ Browser opened" -ForegroundColor Green

Write-Host ""
Write-Host "To stop the servers, close this window or run:" -ForegroundColor DarkGray
Write-Host "  .\stop.ps1" -ForegroundColor Yellow
Write-Host ""

# Keep script running? Comment out the next line to close immediately
# Read-Host "Press Enter to exit (servers will continue running)"
