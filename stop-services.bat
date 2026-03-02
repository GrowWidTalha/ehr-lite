@echo off
REM Wrapper to run PowerShell stop script
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0stop-app.ps1"
