@echo off
REM ================================================================================
REM EHR Lite Service Stopper (Windows)
REM Stops backend and frontend services
REM ================================================================================

setlocal EnableDelayedExpansion

echo ================================================================================
echo Stopping EHR Lite Services
echo ================================================================================
echo.

set SERVICES_STOPPED=0

REM Stop Node.js processes (backend and frontend)
echo Stopping all Node.js processes...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    taskkill /F /IM node.exe >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo   Stopped Node.js processes (backend/frontend)
        set SERVICES_STOPPED=1
    )
)

REM Also stop any cmd windows that might be running our services
echo Checking for background service windows...
wmic process where "name='cmd.exe' and commandline like '%%npm%%'" delete 2>nul >nul
if %ERRORLEVEL% EQU 0 (
    echo   Stopped background service windows
    set SERVICES_STOPPED=1
)

REM Wait a moment for processes to terminate
timeout /t 2 /nobreak >nul

REM Double check - make sure they're stopped
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo   Forcefully terminating remaining processes...
    taskkill /F /IM node.exe >nul 2>&1
    taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq npm*" >nul 2>&1
    set SERVICES_STOPPED=1
)

echo.
if %SERVICES_STOPPED%==0 (
    echo No services were found running
) else (
    echo ================================================================================
    echo All services stopped successfully
    echo ================================================================================
)
echo.

REM Optional: Clear logs if services were stopped
echo NOTE: Logs are preserved in logs\ directory
echo       To clear logs, delete files in logs\ folder manually
echo.

timeout /t 2 /nobreak >nul
exit /b 0
