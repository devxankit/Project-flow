# Vercel Deployment Fix - Environment Variables

## Issue
The frontend is trying to connect to `localhost:5000` instead of the deployed Render backend, causing `net::ERR_CONNECTION_REFUSED` errors.

## Root Cause
The issue was with environment variable configuration:
1. `import.meta.env.VITE_API_URL` is the CORRECT way for Vite
2. `prod.env.VITE_API_URL` is NOT how Vite works
3. The backend URL was incorrect in the code

## Solution

### 1. Update Vercel Environment Variables

You need to set the environment variable in your Vercel dashboard:

1. Go to your Vercel dashboard
2. Select your project (`project-flow-gilt`)
3. Go to Settings → Environment Variables
4. Add a new environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://project-flow-hyas.onrender.com/api`
   - **Environment**: Production (and Preview if needed)

### 2. Redeploy

After setting the environment variable:
1. Go to the Deployments tab
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger a new deployment

### 3. Verify the Fix

After redeployment, check:
1. Open browser developer tools
2. Go to the Network tab
3. Try to login
4. Verify that API calls are going to `https://projectflow-backend.onrender.com/api` instead of `localhost:5000`

## Alternative: Quick Fix via Code

I've already updated the code to use the Render backend URL as the default fallback, so even without setting the environment variable in Vercel, it should work. However, setting the environment variable is the proper way to handle this.

## Backend URL

The backend is deployed at: `https://project-flow-hyas.onrender.com`

✅ **Backend Status**: CONFIRMED WORKING (tested health endpoint - returns 200 OK)

## Testing

After the fix:
1. Try logging in from the deployed Vercel frontend
2. Check that all API calls work properly
3. Verify that the application functions normally

## Files Modified

- `frontend/src/utils/api.js` - Updated default API URL
- `frontend/env.production` - Updated production environment template
