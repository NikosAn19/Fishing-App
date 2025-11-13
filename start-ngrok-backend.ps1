# Start ngrok tunnel for backend API
# Run this BEFORE starting Expo in tunnel mode

Write-Host "Starting ngrok tunnel for backend API (port 3000)..." -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is running
$ngrokProcess = Get-Process -Name ngrok -ErrorAction SilentlyContinue
if ($ngrokProcess) {
    Write-Host "ngrok is already running. Stopping existing instance..." -ForegroundColor Yellow
    Stop-Process -Name ngrok -Force
    Start-Sleep -Seconds 2
}

# Start ngrok in background
Write-Host "Starting ngrok..." -ForegroundColor Yellow
Start-Process -FilePath "ngrok" -ArgumentList "http","3000" -WindowStyle Minimized

Write-Host ""
Write-Host "Waiting 8 seconds for ngrok to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Get ngrok URL
try {
    $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    $httpsTunnel = $tunnels.tunnels | Where-Object { $_.proto -eq "https" -and $_.config.addr -like "*:3000*" }
    
    if ($httpsTunnel) {
        $ngrokUrl = $httpsTunnel.public_url
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "ngrok tunnel is ACTIVE!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your ngrok URL:" -ForegroundColor Cyan
        Write-Host "$ngrokUrl" -ForegroundColor Yellow -BackgroundColor Black
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Open a NEW PowerShell terminal" -ForegroundColor White
        Write-Host "2. Run these commands:" -ForegroundColor White
        Write-Host "   cd FishingApp" -ForegroundColor Cyan
        Write-Host "   `$env:EXPO_PUBLIC_API_BASE=`"$ngrokUrl`"" -ForegroundColor Cyan
        Write-Host "   npx expo start --tunnel" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "No HTTPS tunnel found for port 3000" -ForegroundColor Red
        Write-Host "Open http://localhost:4040 in your browser to check ngrok status" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "Could not connect to ngrok API yet." -ForegroundColor Red
    Write-Host "This might mean ngrok is still starting up." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Open http://localhost:4040 in your browser" -ForegroundColor White
    Write-Host "2. Look for the HTTPS URL (should start with https://)" -ForegroundColor White
    Write-Host "3. Copy that URL and use it in the next step" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Monitor ngrok at: http://localhost:4040" -ForegroundColor Cyan
