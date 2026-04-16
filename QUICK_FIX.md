# 🚀 Quick Fix for Vercel Deployment

## The Problem
Your build is completing, but the app won't work because:
1. Frontend expects backend at `localhost:3001` (doesn't exist in production)
2. No environment variables set in Vercel
3. Backend is not deployed

## Immediate Solution (5 minutes)

### Step 1: Set Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.com` | Production |
| `VITE_NODE_ENV` | `production` | Production |

**Don't have a backend yet?** Use a temporary placeholder:
- `VITE_API_URL` = `https://api.example.com` (app will load but features won't work)

### Step 2: Redeploy

Option A - From Vercel Dashboard:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

Option B - From Git:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

## Deploy Backend (Choose One)

### Option A: Railway (Recommended - Free Tier)

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Navigate to backend
cd packages/backend

# 4. Initialize Railway project
railway init

# 5. Deploy
railway up

# 6. Get your URL
railway domain
# Copy the URL (e.g., https://your-app.railway.app)

# 7. Update Vercel environment variable
# VITE_API_URL = https://your-app.railway.app
```

### Option B: Render (Free Tier)

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: resume-analyzer-backend
   - **Root Directory**: `packages/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **"Create Web Service"**
6. Copy the URL and add to Vercel as `VITE_API_URL`

### Option C: Separate Vercel Project

```bash
# 1. Create new Vercel project for backend
cd packages/backend

# 2. Create vercel.json
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

# 3. Deploy
vercel --prod

# 4. Copy the URL and add to frontend Vercel project
```

## Verify Deployment

After setting environment variables and redeploying:

1. **Check Build Logs**: Should complete without errors
2. **Visit Site**: Should load without console errors
3. **Test Upload**: Try uploading a resume
4. **Check Network Tab**: API calls should go to correct backend URL

## Common Issues

### ❌ "Failed to fetch" errors
**Fix**: Backend not deployed or CORS not configured

Add to `packages/backend/src/server.ts`:
```typescript
app.use(cors({
  origin: ['https://your-frontend-url.vercel.app'],
  credentials: true
}));
```

### ❌ Build succeeds but app shows blank page
**Fix**: Check browser console for errors, likely missing env vars

### ❌ "Cannot read properties of undefined"
**Fix**: Frontend trying to access backend data that doesn't exist
- Ensure backend is running
- Check API URL is correct
- Verify backend routes match frontend calls

## Next Steps

1. ✅ Set environment variables in Vercel
2. ✅ Deploy backend (Railway recommended)
3. ✅ Update `VITE_API_URL` with backend URL
4. ✅ Redeploy frontend
5. ✅ Test thoroughly

## Need Help?

Check the full `DEPLOYMENT.md` guide for detailed instructions.
