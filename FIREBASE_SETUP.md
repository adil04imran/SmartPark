# Firebase Setup Guide

## Issue: Invalid API Key Error

You're seeing the error `auth/api-key-not-valid.-please-pass-a-valid-api-key.` because your Firebase configuration is using placeholder values.

## How to Fix

### Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `parking-slot-allocation-a41a1`
3. Click on the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. If you don't have a web app, click "Add app" and select the web icon (</>)
7. You'll see your Firebase SDK configuration

### Step 2: Create Your `.env` File

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and replace the placeholder values with your actual Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=parking-slot-allocation-a41a1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=parking-slot-allocation-a41a1
VITE_FIREBASE_STORAGE_BUCKET=parking-slot-allocation-a41a1.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Step 3: Enable Google Sign-In

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click on "Sign-in method" tab
3. Click on "Google" provider
4. Toggle "Enable" to ON
5. Add your support email
6. Click "Save"

### Step 4: Restart Your Development Server

After updating your `.env` file:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 5: Clear Browser Storage

1. Open Developer Tools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Clear:
   - Local Storage
   - Session Storage
   - Cookies

### Step 6: Test Google Sign-In

Now try clicking the Google Sign-In button again. It should work!

## Security Notes

- **NEVER** commit your `.env` file to Git (it's already in `.gitignore`)
- **NEVER** share your API keys publicly
- The `.env.example` file should only contain placeholder values

## Troubleshooting

### Still getting "Invalid API Key" error?
- Double-check that you copied the API key correctly (no extra spaces)
- Make sure you restarted the dev server after updating `.env`
- Verify that your Firebase project exists and is active

### "Popup blocked" error?
- Allow popups for localhost in your browser settings
- Try using a different browser

### "Too many requests" error?
- Clear your session storage (see Step 5)
- Wait 15 minutes before trying again
- Or manually clear the rate limit by running this in the browser console:
  ```javascript
  sessionStorage.removeItem('signInAttempts');
  sessionStorage.removeItem('lastSignInAttempt');
  ```

## Need Help?

If you're still having issues, check:
1. Browser console for detailed error messages
2. Firebase Console > Authentication > Users (to see if users are being created)
3. Network tab in DevTools to see the actual API requests
