# Deployment Guide for Resume Analyzer

## Current Issue
Your deployment is failing because the frontend expects a backend API at `localhost:3001`, which doesn't exist in production.

## Solution Options

### Option 1: Frontend-Only Deployment (Current Setup)

**Best for**: When deploying backend separately (Railway, Render, another Vercel project)

1. **Deploy Backend First** (choose a platform):
   - Vercel (separate project)
   - Railway
   - Render
   - Heroku
   
2. **Configure Vercel Environment Variables**:
   ```bash
   # In Vercel Dashboard → Your Project → Settings → Environment Variables
   VITE_API_URL=https://your-backend-url.com
   VITE_NODE_ENV=production
   ```

3. **Redeploy**:
   ```bash
   git push origin main
   ```

### Option 2: Full-Stack Deployment on Vercel

**Note**: Vercel serverless functions have limitations for file uploads and processing.

1. **Rename configuration**:
   ```bash
   mv vercel.json vercel-frontend-only.json
   mv vercel-fullstack.json vercel.json
   ```

2. **Update backend for serverless**:
   - Create `packages/backend/api/analyze.ts` as a serverless function
   - Modify file upload handling for Vercel's limits

3. **Set environment variables in Vercel**:
   ```bash
   VITE_API_URL=/api
   VITE_NODE_ENV=production
   ```

### Option 3: Deploy Backend on Railway (Recommended)

Railway is better suited for file processing and has generous free tier.

1. **Create Railway Project**:
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Create new project
   railway init
   ```

2. **Configure Railway**:
   - Set root directory: `packages/backend`
   - Build command: `npm run build`
   - Start command: `npm start`
   - Add environment variables (if using Firebase)

3. **Deploy Backend**:
   ```bash
   railway up
   ```

4. **Get Railway URL** and add to Vercel:
   ```bash
   # In Vercel Dashboard
   VITE_API_URL=https://your-app.railway.app
   VITE_NODE_ENV=production
   ```

## Quick Fix for Current Deployment

To get your current deployment working immediately:

1. **Go to Vercel Dashboard**
2. **Navigate to**: Your Project → Settings → Environment Variables
3. **Add**:
   - `VITE_API_URL` = `https://your-backend-url.com` (or temporary mock API)
   - `VITE_NODE_ENV` = `production`
4. **Redeploy**: Deployments → Click "..." → Redeploy

## Environment Variables Reference

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
VITE_NODE_ENV=production
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
# Add Firebase credentials if using
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

## Troubleshooting

### Build Succeeds but App Doesn't Work
- Check browser console for CORS errors
- Verify `VITE_API_URL` is set correctly
- Ensure backend is deployed and accessible

### File Upload Fails
- Check backend file size limits
- Verify CORS configuration in backend
- Ensure backend has proper file handling middleware

### API Calls Return 404
- Verify backend routes match frontend API calls
- Check backend is running on correct port
- Ensure environment variables are set

## Next Steps

1. Choose deployment strategy (Option 1 recommended)
2. Deploy backend to Railway or similar platform
3. Configure Vercel environment variables
4. Test deployment thoroughly
5. Set up monitoring and error tracking

## Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
