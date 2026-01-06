@echo off
:: Fynd AI Feedback System - Startup Script
:: Double-click this file to start the application

echo.
echo ==============================================
echo   Fynd AI Feedback System
echo   Starting Backend and Frontend Servers
echo ==============================================
echo.

:: Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"

pause
