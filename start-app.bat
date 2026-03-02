@echo off
REM ================================================================================
REM EHR Lite Application Launcher (Windows) - Production Background Mode
REM ================================================================================

setlocal EnableDelayedExpansion

echo ================================================================================
echo EHR Lite - Production Launcher (Background Mode)
echo ================================================================================
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if services are already running
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo WARNING: Node.js processes are already running.
    echo Please run stop-services.bat to stop existing services first.
    echo.
    timeout /t 3 /nobreak >nul
    exit /b 1
)

REM ================================================================================
REM 1. Install Dependencies (if needed)
REM ================================================================================
echo [1/4] Checking dependencies...

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install --silent --no-audit --no-fund
    if %ERRORLEVEL% NEQ 0 goto :error
    cd ..
    echo Backend dependencies installed.
) else (
    echo Backend dependencies OK.
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install --silent --no-audit --no-fund
    if %ERRORLEVEL% NEQ 0 goto :error
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
REM 3. Build Frontend (if needed)
REM ================================================================================
echo.
echo [3/4] Checking frontend build...
cd frontend

set "NEedsBuild=0"
if not exist ".next" set "NeedsBuild=1"

if "!NeedsBuild!"=="1" (
    echo   → Frontend build needed. Building...
    if exist ".next" rmdir /s /q .next 2>nul
    call npm run build
    if %ERRORLEVEL% NEQ 0 goto :error
    echo   Frontend built successfully.
    echo %date% %time% > .next\BUILD_ID
) else (
    echo   Frontend build up to date.
)
cd ..

REM ================================================================================
REM 4. Start Services in Background
REM ================================================================================
echo.
echo [4/4] Starting services in background...
echo.

REM Create helper scripts for background execution
echo @echo off > backend-start.bat
echo cd /d "%~dp0backend" >> backend-start.bat
echo npm run dev >> ..\logs\backend.log 2^>^&1 >> backend-start.bat

echo @echo off > frontend-start.bat
echo cd /d "%~dp0frontend" >> frontend-start.bat
echo set PORT=3000 >> frontend-start.bat
echo npm run start >> ..\logs\frontend.log 2^>^&1 >> frontend-start.bat

REM Start backend (minimized, new window)
echo Starting backend on port 4000...
start /min cmd /c "cd /d "%~cd%\backend" && npm run dev >> ..\logs\backend.log 2>&1"
echo   Backend started...

REM Wait for backend to initialize
echo   Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start frontend (minimized, new window)
echo Starting frontend on port 3000...
start /min cmd /c "cd /d "%~cd%\frontend" && set PORT=3000 && npm run start >> ..\logs\frontend.log 2>&1"
echo   Frontend started...

REM Wait for services to be ready
timeout /t 8 /nobreak >nul

REM Clean up helper scripts
del backend-start.bat 2>nul
del frontend-start.bat 2>nul

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
echo   • View logs: type logs\backend.log or type logs\frontend.log
echo.

REM Verify services
echo Verifying services...
timeout /t 2 /nobreak >nul

powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/health' -TimeoutSec 3; Write-Host '   Backend is responding' -ForegroundColor Green } catch { Write-Host '   Backend may still be starting... check logs\backend.log' -ForegroundColor Yellow }" 2>nul

powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3; Write-Host '   Frontend is responding' -ForegroundColor Green } catch { Write-Host '   Frontend may still be starting... check logs\frontend.log' -ForegroundColor Yellow }" 2>nul

echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start "" http://localhost:3000

echo.
echo ================================================================================
echo EHR Lite is now running in the background!
echo You can close this window - the app will continue running.
echo To stop the app later, run: stop-services.bat
echo ================================================================================
echo.
timeout /t 5 /nobreak >nul

exit /b 0

:error
echo.
echo ================================================================================
echo ERROR: An error occurred during startup.
echo ================================================================================
echo.
echo Troubleshooting:
echo   • Make sure Node.js is installed: https://nodejs.org/
echo   • Check that ports 3000 and 4000 are available
echo   • View error logs: type logs\backend.log or type logs\frontend.log
echo   • Run as Administrator if needed
echo.
pause
exit /b 1
