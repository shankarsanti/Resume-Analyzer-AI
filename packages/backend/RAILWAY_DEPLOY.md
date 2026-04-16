# 🚂 Railway Backend Deployment Guide

## Prerequisites

✅ Railway CLI installed (you have this)  
✅ Backend code ready (you have this)  
✅ Built dist folder exists (you have this)

## Step-by-Step Deployment

### Step 1: Initialize Railway Project

Run these commands **one at a time** in your terminal:

```bash
# Navigate to backend directory
cd packages/backend

# Login to Railway (will open browser)
railway login
```

**Action**: When browser opens, log in with your GitHub account.

### Step 2: Create New Project

```bash
# Initialize new Railway project
railway init
```

**You'll be asked**:
- "Project name?" → Type: `resume-analyzer-backend` (or any name)
- Press Enter

### Step 3: Deploy

```bash
# Deploy the backend
railway up
```

**This will**:
- Upload your code to Railway
- Install dependencies
- Build the project
- Start the server

**Wait for**: "✓ Deployment successful"

### Step 4: Get Your URL

```bash
# Generate a public domain
railway domain
```

**You'll be asked**:
- "Generate a domain?" → Type: `y` and press Enter

**Copy the URL** that appears (e.g., `https://resume-analyzer-backend.up.railway.app`)

### Step 5: Set Environment Variables

```bash
# Open Railway dashboard
railway open
```

In the Railway dashboard:
1. Click on your service
2. Go to **"Variables"** tab
3. Add these variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-frontend.vercel.app` (your Vercel URL)
   - `PORT` = `3001` (optional, Railway auto-assigns if not set)

4. Click **"Deploy"** to restart with new variables

## Verification

### Test Backend Health

```bash
# Replace with your actual Railway URL
curl https://your-backend.up.railway.app/health
```

**Expected response**:
```json
{"status":"ok","timestamp":"2026-04-16T..."}
```

### Check Logs

```bash
railway logs
```

Should show:
```
Resume Analyzer API server running on port 3001
```

## Update Frontend

Now that backend is deployed:

1. **Go to Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Update** `VITE_API_URL`:
   - Value: `https://your-backend.up.railway.app` (your Railway URL)
4. **Redeploy** frontend

## Troubleshooting

### Issue: "railway: command not found"
**Solution**: Railway CLI not installed properly
```bash
npm i -g @railway/cli
```

### Issue: "No project found"
**Solution**: Run `railway init` first

### Issue: "Build failed"
**Solution**: Check logs with `railway logs`

### Issue: Backend returns 500 errors
**Solution**: 
1. Check environment variables are set
2. Check logs: `railway logs`
3. Verify `FRONTEND_URL` is correct

### Issue: CORS errors
**Solution**:
1. Verify `FRONTEND_URL` environment variable matches your Vercel URL exactly
2. Redeploy: `railway up`

## Useful Railway Commands

```bash
# View logs
railway logs

# Open dashboard
railway open

# Check status
railway status

# Redeploy
railway up

# Link to existing project
railway link

# Set environment variable
railway variables set KEY=value
```

## Alternative: Deploy via Railway Dashboard

If CLI doesn't work:

1. **Go to**: https://railway.app/new
2. **Click**: "Deploy from GitHub repo"
3. **Select**: `shankarsanti/Resume-Analyzer-AI`
4. **Configure**:
   - Root Directory: `packages/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. **Add environment variables** (same as above)
6. **Deploy**

## Cost

Railway offers:
- **Free tier**: $5 credit/month
- **Hobby plan**: $5/month for more resources

Your backend should fit in the free tier for development/testing.

## Next Steps

After backend is deployed:

1. ✅ Copy Railway URL
2. ✅ Update `VITE_API_URL` in Vercel
3. ✅ Redeploy frontend
4. ✅ Test full application

## Support

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
