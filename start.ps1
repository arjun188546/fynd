# Fynd AI Feedback System - Startup Script

Write-Host "==============================================`n" -ForegroundColor Cyan
Write-Host "  Fynd AI Feedback System`n" -ForegroundColor Cyan
Write-Host "  Starting Backend and Frontend Servers`n" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if backend/.env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "`n⚠️  Warning: backend\.env file not found" -ForegroundColor Yellow
    Write-Host "   Creating .env file with placeholders..." -ForegroundColor Yellow
    
    $envContent = @"
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secure_random_string_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
"@
    
    Set-Content -Path "backend\.env" -Value $envContent
    Write-Host "   Created backend\.env - Please update with your credentials" -ForegroundColor Yellow
    Write-Host "   See AUTHENTICATION_SETUP.md for details`n" -ForegroundColor Yellow
}

# Kill any processes on ports 3000 and 3001
Write-Host "`nCleaning up ports..." -ForegroundColor Cyan

$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "  Stopping process on port 3000..." -ForegroundColor Yellow
    Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
}

$port3001 = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($port3001) {
    Write-Host "  Stopping process on port 3001..." -ForegroundColor Yellow
    Stop-Process -Id $port3001.OwningProcess -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 1

# Start Backend
Write-Host "`n==============================================`n" -ForegroundColor Cyan
Write-Host "Starting Backend Server (Port 3001)..." -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "`n==============================================`n" -ForegroundColor Cyan
Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "`n==============================================`n" -ForegroundColor Green
Write-Host "✓ Servers Started Successfully!`n" -ForegroundColor Green
Write-Host "==============================================`n" -ForegroundColor Green

Write-Host "`n📍 Application URLs:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Cyan

Write-Host "`n🔐 Admin Credentials:" -ForegroundColor White
Write-Host "   Email:    admin@email.com" -ForegroundColor Cyan
Write-Host "   Password: admin@boo" -ForegroundColor Cyan

Write-Host "`n🚀 Quick Links:" -ForegroundColor White
Write-Host "   User Login:  http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "   Admin Login: http://localhost:3000/admin/login" -ForegroundColor Cyan

Write-Host "`n📚 Documentation:" -ForegroundColor White
Write-Host "   README.md                 - Main documentation" -ForegroundColor Cyan
Write-Host "   AUTHENTICATION_SETUP.md   - Auth setup guide" -ForegroundColor Cyan
Write-Host "   QUICK_REFERENCE.md        - Quick reference" -ForegroundColor Cyan

Write-Host "`n⚠️  Note:" -ForegroundColor Yellow
Write-Host "   - Update backend\.env with your API keys" -ForegroundColor Yellow
Write-Host "   - Google OAuth requires setup (see AUTHENTICATION_SETUP.md)" -ForegroundColor Yellow
Write-Host "   - Admin login works immediately with above credentials`n" -ForegroundColor Yellow

Write-Host "==============================================`n" -ForegroundColor Green
Write-Host "Press any key to open browser..." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

Start-Process "http://localhost:3000"

Write-Host "`nTo stop the servers, close both PowerShell windows.`n" -ForegroundColor Yellow
