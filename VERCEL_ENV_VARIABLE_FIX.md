# Vercel Environment Variable Fix

## 🚨 Issue Identified
The Vercel deployed frontend is still using `localhost:5000` instead of the Render backend URL, causing `net::ERR_CONNECTION_REFUSED` errors.

## ✅ What I've Fixed

### 1. Smart API URL Detection
Updated `frontend/src/utils/api.js` with intelligent URL detection:

```javascript
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If we're in production (deployed on Vercel), use Render backend
  if (import.meta.env.PROD || window.location.hostname.includes('vercel.app')) {
    return 'https://project-flow-hyas.onrender.com/api';
  }
  
  // For local development, use localhost
  return 'http://localhost:5000/api';
};
```

### 2. Debug Logging
Added console logs to help debug the issue:
- Shows which API URL is being used
- Shows the environment mode
- Shows the hostname

## 🔧 How to Fix in Vercel Dashboard

### Option 1: Set Environment Variable (Recommended)
1. Go to your Vercel dashboard
2. Select your project (`project-flow-gilt`)
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://project-flow-hyas.onrender.com/api`
   - **Environment**: Production (and Preview if needed)
5. Click **Save**
6. Go to **Deployments** tab
7. Click **Redeploy** on the latest deployment

### Option 2: The Code Fix (Already Deployed)
The code fix I made should automatically detect when the app is deployed on Vercel and use the correct backend URL. This should work without setting environment variables.

## 🧪 How to Test the Fix

### Step 1: Wait for Deployment
Vercel should automatically redeploy after the git push (2-3 minutes).

### Step 2: Check Browser Console
1. Open your Vercel frontend
2. Open browser developer tools (F12)
3. Go to Console tab
4. Look for these log messages:
   ```
   🌐 API Base URL: https://project-flow-hyas.onrender.com/api
   🔍 Environment: production
   🏠 Hostname: project-flow-gilt.vercel.app
   ```

### Step 3: Test Login
1. Try to login
2. Check Network tab in developer tools
3. Verify that requests are going to `https://project-flow-hyas.onrender.com/api`
4. The "Network error" should be gone

## 🔍 Troubleshooting

### If Still Getting localhost Errors
1. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
2. **Check Console Logs**: Look for the API URL being used
3. **Check Network Tab**: See which URL the requests are going to

### If Environment Variable Not Working
1. **Verify in Vercel**: Check that `VITE_API_URL` is set correctly
2. **Redeploy**: Manually trigger a new deployment
3. **Check Build Logs**: Look for any environment variable errors

### If Code Detection Not Working
The fallback detection should work, but if not:
1. Check that the hostname contains `vercel.app`
2. Check that `import.meta.env.PROD` is true
3. Look at the console logs to see what's being detected

## 📱 Expected Result

After the fix:
- ✅ **Local Development**: Uses `http://localhost:5000/api`
- ✅ **Vercel Production**: Uses `https://project-flow-hyas.onrender.com/api`
- ✅ **Mobile Devices**: Should work properly
- ✅ **All Devices**: Login should work without network errors

## 🚀 Quick Test

To verify the fix is working:
1. Open your Vercel frontend
2. Open browser console
3. Look for: `🌐 API Base URL: https://project-flow-hyas.onrender.com/api`
4. Try to login - it should work!

---

**The fix is now deployed!** Wait 2-3 minutes for Vercel to redeploy, then test the login. The console logs will show you exactly which API URL is being used.
