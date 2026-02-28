@echo off
REM ================================================================================
REM EHR Lite Service Stopper (Windows)
REM Stops backend and frontend services
REM ================================================================================

setlocal EnableDelayedExpansion

set "SUCCESS=[92m"
set "WARNING=[93m"
set "NC=[0m"

echo Stopping EHR Lite services...
echo.

set STOPPED=0

REM Stop backend (port 4000)
echo Checking backend...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000') do (
    set BACKEND_PID=%%a
    taskkill /F /PID !BACKEND_PID! >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo Backend stopped ^(PID: !BACKEND_PID!^)
        set STOPPED=1
    )
)

REM Stop frontend (port 3000)
echo Checking frontend...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    set FRONTEND_PID=%%a
    taskkill /F /PID !FRONTEND_PID! >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo Frontend stopped ^(PID: !FRONTEND_PID!^)
        set STOPPED=1
    )
)

REM Also kill any node processes on our ports as fallback
tasklist /FI "IMAGENAME eq node.exe" | findstr node.exe >nul
if %ERRORLEVEL% EQU 0 (
    echo Stopping remaining node processes...
    taskkill /F /IM node.exe >nul 2>&1
    set STOPPED=1
)

if %STOPPED%==0 (
    echo No services were running
) else (
    echo.
    echo All services stopped.
)

echo.
pause
