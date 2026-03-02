# EHR Lite - PowerShell Stop Script
# Run this script to stop backend and frontend services

$ErrorActionPreference = "Continue"

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Stopping EHR Lite Services" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

$Stopped = $false

# Stop by PID if we have saved PIDs
if (Test-Path ".backend.pid") {
    $BackendPid = Get-Content ".backend.pid" -Raw
    if ($BackendPid -match "\d+") {
        $Pid = [int]$Matches[0]
        try {
            Stop-Process -Id $Pid -Force -ErrorAction Stop
            Write-Host "  Stopped backend (PID: $Pid)" -ForegroundColor Green
            $Stopped = $true
        } catch {
            Write-Host "  Backend process not found" -ForegroundColor Gray
        }
    }
    Remove-Item ".backend.pid" -ErrorAction SilentlyContinue
}

if (Test-Path ".frontend.pid") {
    $FrontendPid = Get-Content ".frontend.pid" -Raw
    if ($FrontendPid -match "\d+") {
        $Pid = [int]$Matches[0]
        try {
            Stop-Process -Id $Pid -Force -ErrorAction Stop
            Write-Host "  Stopped frontend (PID: $Pid)" -ForegroundColor Green
            $Stopped = $true
        } catch {
            Write-Host "  Frontend process not found" -ForegroundColor Gray
        }
    }
    Remove-Item ".frontend.pid" -ErrorAction SilentlyContinue
}

# Also kill any remaining node processes (fallback)
Write-Host ""
Write-Host "Checking for remaining Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    Write-Host "  Stopped Node.js process (PID: $($_.Id))" -ForegroundColor Green
    $Stopped = $true
}

Write-Host ""
if ($Stopped) {
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "All services stopped" -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Cyan
} else {
    Write-Host "No services were running" -ForegroundColor Gray
}
Write-Host ""

Start-Sleep -Seconds 2
