@echo off
REM ================================================================================
REM EHR Lite Application Launcher (Windows)
REM ================================================================================

setlocal EnableDelayedExpansion

echo ================================================================================
echo EHR Lite - Production Launcher
echo ================================================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed.
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)

REM Get script directory
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM ================================================================================
REM 1. Dependencies
REM ================================================================================
echo [1/4] Checking dependencies...

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install --silent --no-audit --no-fund
    cd ..
)
echo Backend dependencies OK.

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install --silent --no-audit --no-fund
    cd ..
)
echo Frontend dependencies OK.

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
    echo Building frontend...
    call npm run build
)
cd ..

REM ================================================================================
REM 4. Start Services
REM ================================================================================
echo.
echo [4/4] Starting services...
echo.

REM Create startup helper scripts
echo @echo off > start-backend-helper.bat
echo cd /d "%SCRIPT_DIR%backend" >> start-backend-helper.bat
echo npm run dev >> "%SCRIPT_DIR%logs\backend.log" 2>&1 >> start-backend-helper.bat

echo @echo off > start-frontend-helper.bat
echo cd /d "%SCRIPT_DIR%frontend" >> start-frontend-helper.bat
echo set PORT=3000 >> start-frontend-helper.bat
echo npm run start >> "%SCRIPT_DIR%logs\frontend.log" 2>&1 >> start-frontend-helper.bat

REM Start backend
echo Starting backend on port 4000...
start /min "EHR Backend" cmd /c "start-backend-helper.bat"
echo   Backend started...

REM Wait for backend
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting frontend on port 3000...
start /min "EHR Frontend" cmd /c "start-frontend-helper.bat"
echo   Frontend started...

REM Wait for services
timeout /t 8 /nobreak >nul

echo.
echo ================================================================================
echo                       EHR Lite - RUNNING
echo ================================================================================
echo.
echo Services:
echo   Backend:  http://localhost:4000
echo   Frontend: http://localhost:3000
echo.
echo Logs:
echo   Backend:  logs\backend.log
echo   Frontend: logs\frontend.log
echo.
echo To stop: run stop-services.bat
echo.

REM Check services
echo Checking services...
timeout /t 2 /nobreak >nul

powershell -Command "try{Invoke-WebRequest -Uri 'http://localhost:4000/api/health' -TimeoutSec 3|Out-Null;Write-Host '[OK] Backend responding'-ForegroundColor Green}catch{Write-Host '[WAIT] Backend starting...'-ForegroundColor Yellow}"

powershell -Command "try{Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3|Out-Null;Write-Host '[OK] Frontend responding'-ForegroundColor Green}catch{Write-Host '[WAIT] Frontend starting...'-ForegroundColor Yellow}"

echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start "" http://localhost:3000

echo.
echo Press any key to close this window...
echo (Services will continue running in background windows)
pause >nul

REM Cleanup helper files
del start-backend-helper.bat 2>nul
del start-frontend-helper.bat 2>nul

exit /b 0
