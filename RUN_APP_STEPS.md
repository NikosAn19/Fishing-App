# EXACT ORDER TO RUN THE APP WITH NGROK

## Step 1: Start Backend Server
Open PowerShell Terminal 1:
```powershell
cd "C:\Users\nikos\Desktop\Fishing App\Server"
npm start
```
✅ Wait until you see: "🐟 Fishing App Server running on 0.0.0.0:3000"
✅ Keep this terminal open!

---

## Step 2: Start ngrok Tunnel
Open PowerShell Terminal 2 (NEW terminal):
```powershell
cd "C:\Users\nikos\Desktop\Fishing App"
.\start-ngrok-backend.ps1
```
✅ Wait for it to show: "ngrok tunnel is active!"
✅ Copy the URL shown (e.g., https://xxxx-xxxx-xxxx.ngrok-free.app)
✅ Keep this terminal open!

---

## Step 3: Configure Expo with ngrok URL
Open PowerShell Terminal 3 (NEW terminal):
```powershell
cd "C:\Users\nikos\Desktop\Fishing App\FishingApp"
$env:EXPO_PUBLIC_API_BASE="PASTE_YOUR_NGROK_URL_HERE"
```
Replace `PASTE_YOUR_NGROK_URL_HERE` with the actual URL from Step 2

Example:
```powershell
$env:EXPO_PUBLIC_API_BASE="https://abc123-def456.ngrok-free.app"
```

---

## Step 4: Start Expo in Tunnel Mode
In the same Terminal 3 (where you set the env variable):
```powershell
npx expo start --tunnel
```
✅ Wait for QR code to appear
✅ Keep this terminal open!

---

## Step 5: Connect Your Phone
1. Open Expo Go app on your phone
2. Scan the QR code from Terminal 3
3. App should load!

---

## Quick Copy-Paste (All Commands):

**Terminal 1 - Backend:**
```powershell
cd "C:\Users\nikos\Desktop\Fishing App\Server"
npm start
```

**Terminal 2 - ngrok:**
```powershell
cd "C:\Users\nikos\Desktop\Fishing App"
.\start-ngrok-backend.ps1
```

**Terminal 3 - Expo:**
```powershell
cd "C:\Users\nikos\Desktop\Fishing App\FishingApp"
$env:EXPO_PUBLIC_API_BASE="https://YOUR-NGROK-URL-HERE.ngrok-free.app"
npx expo start --tunnel
```

---

## Important Notes:
- Keep all 3 terminals running
- If ngrok restarts, you'll get a new URL - update Terminal 3
- Check ngrok status at: http://localhost:4040
- Make sure backend shows it's running on port 3000 before starting ngrok



