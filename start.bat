@echo off
cd /d "%~dp0"
start "" /b wscript //nologo "%~dp0launcher.vbs"
exit
