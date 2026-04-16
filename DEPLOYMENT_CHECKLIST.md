# ✅ Deployment Checklist

## Current Status
- ✅ Frontend build configuration is correct
- ✅ Backend CORS updated to support production
- ✅ Vercel.json configured for SPA routing
- ❌ Environment variables not set in Vercel
- ❌ Backend not deployed

## What I Fixed

### 1. Updated `vercel.json`
- Added security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Maintained SPA routing for React Router

### 2. Updated Backend CORS (`packages/backend/src/server.ts`)
- Now supports multiple origins including Vercel preview deployments
- Automatically allows all `*.vercel.app` domains
- Supports environment-based configuration

### 3. Created Documentation
- `QUICK_FIX.md` - Immediate steps to fix deployment
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `DEPLOYMENT_CHECKLIST.md` - This file

## Immediate Action Required

### Step 1: Deploy Backend (Choose One Platform)

#### Option A: Railway (Recommended)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Navigate to backend
cd packages/backend

# Deploy
railway init
railway up

# Get URL
railway domain
# Example output: https://resume-analyzer-backend.railway.app
```

**Set these environment variables in Railway:**
- `PORT` = `3001` (or Railway will auto-assign)
- `NODE_ENV` = `production`
- `FRONTEND_URL` = `https://your-frontend.vercel.app`

#### Option B: Render
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - **Root Directory**: `packages/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-frontend.vercel.app`

#### Option C: Vercel (Separate Project)
```bash
cd packages/backend

# Create vercel.json for backend
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
EOF

# Deploy
vercel --prod
```

### Step 2: Configure Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.com` | Production, Preview, Development |
| `VITE_NODE_ENV` | `production` | Production |
| `VITE_NODE_ENV` | `preview` | Preview |
| `VITE_NODE_ENV` | `development` | Development |

**Example:**
- If Railway: `VITE_API_URL` = `https://resume-analyzer-backend.railway.app`
- If Render: `VITE_API_URL` = `https://resume-analyzer-backend.onrender.com`

### Step 3: Redeploy Frontend

```bash
# Option A: Trigger from Git
git add .
git commit -m "Configure production environment"
git push origin main

# Option B: From Vercel Dashboard
# Go to Deployments → Click "..." → Redeploy
```

## Verification Steps

### 1. Check Backend Health
```bash
curl https://your-backend-url.com/health
# Expected: {"status":"ok","timestamp":"2026-04-16T..."}
```

### 2. Check Frontend Build
- Go to Vercel Dashboard → Deployments
- Latest deployment should show "Ready"
- Build logs should show no errors

### 3. Test Frontend
1. Visit your Vercel URL
2. Open browser DevTools → Console (should have no errors)
3. Open Network tab
4. Try uploading a resume
5. Check API calls go to correct backend URL

### 4. Test File Upload
1. Upload a PDF or DOCX resume
2. Should see analysis results
3. Check for any CORS errors in console

## Common Issues & Solutions

### Issue: "Failed to fetch" or CORS errors
**Solution:**
1. Verify backend is running: `curl https://your-backend-url.com/health`
2. Check backend environment variable `FRONTEND_URL` matches your Vercel URL
3. Ensure backend CORS allows your frontend domain

### Issue: Build succeeds but app shows blank page
**Solution:**
1. Check browser console for errors
2. Verify `VITE_API_URL` is set in Vercel
3. Check that environment variables are set for "Production" environment

### Issue: API returns 404
**Solution:**
1. Verify backend routes are correct
2. Check `VITE_API_URL` doesn't have trailing slash
3. Ensure backend is deployed and running

### Issue: File upload fails
**Solution:**
1. Check file size (max 10MB)
2. Verify file type (PDF or DOCX only)
3. Check backend logs for errors

## Environment Variables Reference

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend-url.com
VITE_NODE_ENV=production
```

### Backend (Railway/Render/Vercel)
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

## Post-Deployment

### Monitor
- Set up error tracking (Sentry, LogRocket)
- Monitor API response times
- Check Vercel Analytics

### Optimize
- Enable Vercel Edge Network
- Add caching headers
- Optimize bundle size

### Security
- Add rate limiting to backend
- Implement file scanning for malware
- Add authentication if needed

## Need Help?

1. Check `QUICK_FIX.md` for immediate solutions
2. Read `DEPLOYMENT.md` for detailed guides
3. Check Vercel build logs for specific errors
4. Check backend logs on your hosting platform

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
