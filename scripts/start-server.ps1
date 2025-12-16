# CraneAI Portfolio Server Launcher
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  CraneAI Portfolio Server" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting local server on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

Set-Location "$PSScriptRoot/.."
python -m http.server 8000

