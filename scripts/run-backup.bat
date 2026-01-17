@echo off
REM Firestore Backup Script - Run every 3 days via Task Scheduler
REM Setup: Create a scheduled task in Windows Task Scheduler

cd /d "%~dp0.."
echo Running Firestore backup...
echo Date: %date% %time%
echo.

call npm run backup

echo.
echo Backup completed!
pause
