@echo off
REM Wrapper to run PowerShell startup script
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0start-app.ps1"
