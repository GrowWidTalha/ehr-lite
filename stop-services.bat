@echo off
REM ================================================================================
REM EHR Lite Service Stopper (Windows)
REM Stops backend and frontend services
REM ================================================================================

setlocal EnableDelayedExpansion

echo Stopping EHR Lite services...
echo.

set STOPPED=0

REM Function to stop processes on a specific port
echo Stopping backend service ^(port 4000^)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000') do (
    set BACKEND_PID=%%a
    taskkill /F /PID !BACKEND_PID! >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo   ✓ Backend stopped ^(PID: !BACKEND_PID!^)
        set STOPPED=1
    )
)

echo Stopping frontend service ^(port 3000^)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    set FRONTEND_PID=%%a
    taskkill /F /PID !FRONTEND_PID! >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo   ✓ Frontend stopped ^(PID: !FRONTEND_PID!^)
        set STOPPED=1
    )
)

REM Also use PowerShell to find and stop any node processes
echo Checking for remaining node processes...
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -eq '' -or $_.MainWindowTitle -eq $null} | Stop-Process -Force" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✓ Background node processes stopped
    set STOPPED=1
)

echo.
if %STOPPED%==0 (
    echo No services were found running
) else (
    echo ================================================================================
    echo All services stopped successfully
    echo ================================================================================
)

echo.
timeout /t 2 /nobreak >nul
exit /b 0
