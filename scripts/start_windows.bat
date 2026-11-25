@echo off
title CampusConnect One-Click Launcher
echo Starting CampusConnect (MySQL, Backend API, Frontend)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0ensure_running.ps1" -OpenBrowser
echo.
echo CampusConnect is live at http://localhost (and http://localhost:5001/api/health)
pause
