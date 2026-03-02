@echo off
REM ================================================================================
REM EHR Lite Application Launcher (Windows) - Production Background Mode
REM Builds and runs both backend and frontend servers in background
REM ================================================================================

setlocal EnableDelayedExpansion

echo ================================================================================
echo EHR Lite - Production Launcher (Background Mode)
echo ================================================================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is required but not found.
    pause
    exit /b 1
)

REM Check if services are already running
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Select-Object -First 1" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo WARNING: Node.js processes are already running.
    echo Please run stop-services.bat to stop existing services first.
    echo.
    timeout /t 3 /nobreak >nul
    exit /b 1
)

REM ================================================================================
REM 1. Check and Install Node.js
REM ================================================================================
echo [1/7] Checking Node.js installation...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Attempting to install via winget...

    winget list OpenJS.NodeJS >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo Node.js is installed via winget but not in PATH. Please restart terminal.
        timeout /t 3 /nobreak >nul
        exit /b 1
    )

    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements -h
    if !ERRORLEVEL! EQU 0 (
        echo.
        echo ================================================================================
        echo Node.js installed successfully!
        echo IMPORTANT: Please CLOSE this window and open a NEW terminal,
        echo then run this script again.
        echo ================================================================================
        timeout /t 5 /nobreak >nul
        exit /b 0
    ) else (
        echo Failed to install Node.js. Install from: https://nodejs.org/
        timeout /t 3 /nobreak >nul
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo Node.js: !NODE_VER! ^| npm: !NPM_VER!

REM ================================================================================
REM 2. Check and Install Dependencies
REM ================================================================================
echo.
echo [2/7] Checking dependencies...

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
REM 3. Ensure Data Directory Exists
REM ================================================================================
echo.
echo [3/7] Setting up data directories...
if not exist "data" mkdir data
if not exist "data\patient-images" mkdir "data\patient-images"
if not exist "logs" mkdir logs
echo Data directories ready.

REM ================================================================================
REM 4. Initialize Database
REM ================================================================================
echo.
echo [4/7] Checking database...
cd backend
if not exist "..\data\database.db" (
    echo Creating database...
    call npm run init-db >nul 2>&1
    echo Database created.
) else (
    echo Database exists.
)
cd ..

REM ================================================================================
REM 5. Build Applications (Smart Build Detection)
REM ================================================================================
echo.
echo [5/7] Checking if rebuild is needed...

REM Check frontend build
echo Checking frontend...
cd frontend

set "NEedsBuild=0"

REM Check if .next directory exists
if not exist ".next" (
    set "NeedsBuild=1"
) else (
    REM Check if key source files are newer than .next\BUILD_ID
    if exist ".next\BUILD_ID" (
        REM Compare key files with build marker
        for %%f in (package.json next.config.js tsconfig.json tailwind.config.js app\layout.tsx app\page.tsx components\ui\button.tsx) do (
            if exist "%%~f" (
                powershell -Command "if ((Get-Item '%%~f').LastWriteTime -gt (Get-Item '.next\BUILD_ID').LastWriteTime) { exit 0 } else { exit 1 }" >nul 2>&1
                if !ERRORLEVEL! EQU 0 (
                    set "NeedsBuild=1"
                    goto :found_changed
                )
            )
        )
        :found_changed
    ) else (
        set "NeedsBuild=1"
    )
)

if "!NeedsBuild!"=="1" (
    echo   → Source changes detected. Rebuilding frontend...
    echo   → Running: npm run build

    REM Clean previous build for fresh start
    if exist ".next" rmdir /s /q .next 2>nul

    call npm run build
    if %ERRORLEVEL% NEQ 0 goto :error
    echo   Frontend built successfully.

    REM Create build marker
    echo %date% %time% > .next\BUILD_ID
) else (
    echo   Frontend build up to date.
)
cd ..

REM Check backend dependencies
echo Checking backend...
cd backend

if not exist "..\.backend_deps_installed" (
    date > "..\.backend_deps_installed"
)

if exist "package.json" (
    powershell -Command "if ((Get-Item 'package.json').LastWriteTime -gt (Get-Item '..\.backend_deps_installed').LastWriteTime) { exit 0 } else { exit 1 }" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo   → Dependencies changed. Reinstalling...
        call npm install --silent --no-audit --no-fund
        if %ERRORLEVEL% NEQ 0 goto :error
        echo   Backend dependencies updated.
        date > "..\.backend_deps_installed"
    ) else (
        echo   Backend dependencies up to date.
    )
)

cd ..

REM ================================================================================
REM 6. Start Iriun Webcam
REM ================================================================================
echo.
echo [6/7] Starting Iriun Webcam...

set "IRIUN_FOUND=0"

for %%p in (
    "C:\Program Files\IriunWebcam\IriunWebcam.exe"
    "C:\Program Files (x86)\IriunWebcam\IriunWebcam.exe"
    "%LOCALAPPDATA%\IriunWebcam\IriunWebcam.exe"
    "%USERPROFILE%\Desktop\IriunWebcam.exe"
    "%USERPROFILE%\Downloads\IriunWebcam.exe"
) do (
    if exist "%%~p" (
        set "IRIUN_PATH=%%~p"
        set "IRIUN_FOUND=1"
    )
)

tasklist /FI "IMAGENAME eq IriunWebcam.exe" 2>NUL | find /I /N "IriunWebcam.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Iriun Webcam already running.
) else (
    if "!IRIUN_FOUND!"=="1" (
        echo Starting Iriun Webcam...
        powershell -Command "Start-Process '!IRIUN_PATH!' -WindowStyle Hidden" >nul 2>&1
        timeout /t 2 /nobreak >nul
        echo Iriun Webcam started.
    ) else (
        echo Iriun Webcam not found ^(optional^).
    )
)

REM ================================================================================
REM 7. Start Services (Background)
REM ================================================================================
echo.
echo [7/7] Starting services in background...
echo.

REM Start backend using PowerShell (hidden window)
echo Starting backend on port 4000...
powershell -Command "Start-Process cmd -ArgumentList '/c cd backend && npm run dev >> ..\logs\backend.log 2>&1' -WindowStyle Hidden -NoNewWindow" >nul 2>&1
echo   Backend started in background...

REM Wait for backend
timeout /t 4 /nobreak >nul

REM Start frontend using PowerShell (hidden window)
echo Starting frontend on port 3000...
powershell -Command "Start-Process cmd -ArgumentList '/c cd frontend && set PORT=3000 && npm run start >> ..\logs\frontend.log 2>&1' -WindowStyle Hidden -NoNewWindow" >nul 2>&1
echo   Frontend started in background...

REM Wait for services to be ready
timeout /t 6 /nobreak >nul

echo.
echo ================================================================================
echo                       EHR Lite - RUNNING
echo ================================================================================
echo.
echo Services:
echo   • Backend:  http://localhost:4000 ^(background^)
echo   • Frontend: http://localhost:3000 ^(background^)
echo.
echo Logs:
echo   • Backend:  logs\backend.log
echo   • Frontend: logs\frontend.log
echo.
echo Commands:
echo   • View logs: type logs\backend.log or type logs\frontend.log
echo   • Stop all:  stop-services.bat
echo.

REM Verify services are running
echo Verifying services...
timeout /t 2 /nobreak >nul

powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:4000/api/patients' -TimeoutSec 2; Write-Host '   ✓ Backend is responding' } catch { Write-Host '   ✗ Backend not ready yet - check logs\backend.log' -ForegroundColor Red }" 2>nul
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 2; Write-Host '   ✓ Frontend is responding' } catch { Write-Host '   ✗ Frontend not ready yet - check logs\frontend.log' -ForegroundColor Red }" 2>nul

echo.

REM Open browser
echo Opening browser...
timeout /t 1 /nobreak >nul
start http://localhost:3000

echo.
echo EHR Lite is running in the background!
echo You can close this window - the app will keep running.
echo.
echo To stop the app later, run: stop-services.bat
echo.
timeout /t 3 /nobreak >nul

exit /b 0

:error
echo.
echo ERROR: An error occurred. Please check the output above.
echo.
echo Troubleshooting:
echo   • Make sure Node.js is installed: https://nodejs.org/
echo   • Check that ports 3000 and 4000 are available
echo   • Run as Administrator if needed
echo.
timeout /t 5 /nobreak >nul
exit /b 1
