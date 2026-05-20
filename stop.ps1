# EHR Lite Stop Script
# Run this script to stop the backend and frontend servers

$ErrorActionPreference = "Continue"

# Configuration
$ProjectRoot = $PSScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Stopping EHR Lite" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Function to stop process by PID file
function Stop-ByPidFile {
    param([string]$PidFile, [string]$Name)

    if (Test-Path $PidFile) {
        try {
            $Pid = Get-Content $PidFile -ErrorAction SilentlyContinue
            $Process = Get-Process -Id $Pid -ErrorAction SilentlyContinue

            if ($Process) {
                Stop-Process -Id $Pid -Force -ErrorAction SilentlyContinue
                Write-Host "  ✓ Stopped $Name (PID: $Pid)" -ForegroundColor Green
                Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
                return $true
            }
        } catch {
            # Process not found, remove stale PID file
            Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
        }
    }
    return $false
}

# Stop servers using PID files
$Stopped = $false
$Stopped = $Stopped -or (Stop-ByPidFile (Join-Path $BackendDir "logs\backend.pid") "Backend")
$Stopped = $Stopped -or (Stop-ByPidFile (Join-Path $FrontendDir "logs\frontend.pid") "Frontend")

# Fallback: Stop by port
if (-not $Stopped) {
    Write-Host "[*] Stopping servers by port..." -ForegroundColor Yellow

    foreach ($Port in @(3000, 4000)) {
        $PortProcess = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue

        if ($PortProcess) {
            Stop-Process -Id $PortProcess -Force -ErrorAction SilentlyContinue
            $ServiceName = if ($Port -eq 4000) { "Backend" } else { "Frontend" }
            Write-Host "  ✓ Stopped $ServiceName on port $Port" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "✓ All servers stopped" -ForegroundColor Green
Write-Host ""
