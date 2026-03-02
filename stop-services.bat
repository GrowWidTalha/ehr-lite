@echo off
REM ================================================================================
REM EHR Lite Service Stopper
REM ================================================================================

echo ================================================================================
echo Stopping EHR Lite Services
echo ================================================================================
echo.

echo Stopping Node.js processes...

REM Kill by window title first (graceful)
taskkill /FI "WINDOWTITLE eq EHR Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq EHR Frontend*" /F >nul 2>&1

REM Then kill all node processes
taskkill /IM node.exe /F >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo Services stopped successfully.
) else (
    echo No services were running.
)

echo.
timeout /t 2 /nobreak >nul
