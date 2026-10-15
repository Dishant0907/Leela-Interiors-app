@echo off
title Leela Interiors Server
cd /d "%~dp0"

rem Open the browser once the server answers on port 3000
start "" /min powershell -NoProfile -WindowStyle Hidden -Command "while(-not (Test-NetConnection localhost -Port 3000 -InformationLevel Quiet)){Start-Sleep 1}; Start-Process 'http://localhost:3000'"

call npm run dev
pause
