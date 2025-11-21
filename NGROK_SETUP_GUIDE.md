# Guide: Running Fishing App with ngrok

## Prerequisites

- ✅ ngrok is installed (version 3.3.1)
- ✅ Backend server should be running on port 3000
- ✅ Expo CLI installed

## Step-by-Step Instructions

### Step 1: Start Your Backend Server

Open a PowerShell terminal and run:

```powershell
cd Server
npm start
```

Keep this terminal open - your backend should be running on `http://localhost:3000`

### Step 2: Start ngrok Tunnel

Open a NEW PowerShell terminal (keep the backend running) and run:

```powershell
cd "C:\Users\nikos\Desktop\Fishing App"
.\start-ngrok-backend.ps1
```

This will:

- Start ngrok tunnel for port 3000
- Display your public ngrok URL (e.g., `https://xxxx-xxxx-xxxx.ngrok-free.app`)
- Show you the next steps

**OR manually start ngrok:**

```powershell
ngrok http 3000
```

Then copy the HTTPS URL from the ngrok dashboard (opens at `http://localhost:4040`)

### Step 3: Configure Expo to Use ngrok URL

**Option A: Set Environment Variable (Temporary - for this session only)**

```powershell
cd FishingApp
$env:EXPO_PUBLIC_API_BASE="https://your-ngrok-url-here.ngrok-free.app"
```

**Option B: Create .env File (Permanent - recommended)**

1. Create a file named `.env` in the `FishingApp` directory
2. Add this line:

```
EXPO_PUBLIC_API_BASE=https://your-ngrok-url-here.ngrok-free.app
```

Replace `your-ngrok-url-here.ngrok-free.app` with your actual ngrok URL from Step 2

### Step 4: Start Expo in Tunnel Mode

In the same PowerShell terminal (where you set the environment variable), run:

```powershell
cd FishingApp
npx expo start --tunnel
```

### Step 5: Connect Your Phone

1. Open Expo Go app on your phone
2. Scan the QR code from the terminal
3. The app should connect and load

### Step 6: Verify It Works

- Open the app on your phone
- Check the console logs - you should see:
  - `🔧 API_BASE: https://your-ngrok-url.ngrok-free.app`
  - `🌊 API Config - Using tunnel/ngrok URL as-is`
- The forecast should load successfully!

## Troubleshooting

### If ngrok URL changes

Every time you restart ngrok, you get a new URL. Update your `.env` file or environment variable with the new URL.

### If you see "Network request failed"

- Make sure your backend server is running on port 3000
- Check that ngrok is running and tunnel is active
- Verify the ngrok URL in your `.env` file matches the current ngrok URL

### To check ngrok status

Open `http://localhost:4040` in your browser - you'll see the ngrok dashboard with:

- Active tunnels
- Request logs
- Your public URL

## Quick Reference Commands

```powershell
# Terminal 1: Start backend
cd Server
npm start

# Terminal 2: Start ngrok
cd "C:\Users\nikos\Desktop\Fishing App"
.\start-ngrok-backend.ps1

# Terminal 3: Start Expo (after setting env variable)
cd FishingApp
$env:EXPO_PUBLIC_API_BASE="https://your-ngrok-url.ngrok-free.app"
npx expo start --tunnel
```

## Notes

- Keep all 3 terminals running (backend, ngrok, Expo)
- ngrok free tier URLs change on restart
- For production, consider ngrok paid plan with fixed domain


