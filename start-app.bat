@echo off
REM ================================================================================
REM EHR Lite Application Launcher (Windows) - Production Background Mode
REM ================================================================================

setlocal EnableDelayedExpansion

echo ================================================================================
echo EHR Lite - Production Launcher
echo ================================================================================
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed.
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)

REM Get the script directory
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM ================================================================================
REM 1. Install Dependencies
REM ================================================================================
echo [1/4] Checking dependencies...

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install --silent --no-audit --no-fund
    cd ..
    echo Backend dependencies installed.
) else (
    echo Backend dependencies OK.
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install --silent --no-audit --no-fund
    cd ..
    echo Frontend dependencies installed.
) else (
    echo Frontend dependencies OK.
)

REM ================================================================================
REM 2. Setup Directories
REM ================================================================================
echo.
echo [2/4] Setting up directories...
if not exist "data" mkdir data
if not exist "data\patient-images" mkdir "data\patient-images"
if not exist "logs" mkdir logs
echo Directories ready.

REM ================================================================================
REM 3. Build Frontend
REM ================================================================================
echo.
echo [3/4] Checking frontend build...
cd frontend

if not exist ".next" (
    echo   → Building frontend...
    call npm run build
    if %ERRORLEVEL% NEQ 0 goto :error
    echo   Frontend built successfully.
) else (
    echo   Frontend build up to date.
)
cd ..

REM ================================================================================
REM 4. Start Services in Background
REM ================================================================================
echo.
echo [4/4] Starting services...
echo.

REM Use PowerShell to start processes in background
REM This creates detached processes that will keep running
echo Starting backend on port 4000...
powershell -NoProfile -ExecutionPolicy Bypass -Command "^
$backendLog = Join-Path $PSScriptRoot 'logs\backend.log'; ^
$backendDir = Join-Path $PSScriptRoot 'backend'; ^
Start-Process -FilePath 'cmd' -ArgumentList '/c cd /d \"' + $backendDir + '\" && npm run dev 2>&1\"' -WindowStyle Minimized; ^
Write-Host 'Backend started (logs: logs\backend.log)';"

echo   Waiting for backend to start...
timeout /t 6 /nobreak >nul

echo Starting frontend on port 3000...
powershell -NoProfile -ExecutionPolicy Bypass -Command "^
$frontendLog = Join-Path $PSScriptRoot 'logs\frontend.log'; ^
$frontendDir = Join-Path $PSScriptRoot 'frontend'; ^
$env:PORT = '3000'; ^
Start-Process -FilePath 'cmd' -ArgumentList '/c cd /d \"' + $frontendDir + '\" && set PORT=3000 && npm run start 2>&1\"' -WindowStyle Minimized; ^
Write-Host 'Frontend started (logs: logs\frontend.log)';"

echo   Waiting for frontend to start...
timeout /t 8 /nobreak >nul

echo.
echo ================================================================================
echo                       EHR Lite - RUNNING
echo ================================================================================
echo.
echo Services:
echo   • Backend:  http://localhost:4000
echo   • Frontend: http://localhost:3000
echo.
echo Logs:
echo   • Backend:  logs\backend.log
echo   • Frontend: logs\frontend.log
echo.
echo Commands:
echo   • Stop all:  stop-services.bat
echo.
echo NOTE: Two minimized windows are running the services.
echo       Do NOT close them - they will stay minimized.
echo.

REM Verify services are responding
powershell -NoProfile -ExecutionPolicy Bypass -Command "^
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/health' -TimeoutSec 5;
    Write-Host '[OK] Backend is responding' -ForegroundColor Green;
} catch {
    Write-Host '[WARN] Backend still starting - check logs\backend.log' -ForegroundColor Yellow;
}
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5;
    Write-Host '[OK] Frontend is responding' -ForegroundColor Green;
} catch {
    Write-Host '[WARN] Frontend still starting - check logs\frontend.log' -ForegroundColor Yellow;
}"

echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start "" http://localhost:3000

echo.
echo Press any key to close this window (services will continue running)...
pause >nul

exit /b 0

:error
echo.
echo ================================================================================
echo ERROR: Startup failed. Check the error messages above.
echo ================================================================================
echo.
pause
exit /b 1
