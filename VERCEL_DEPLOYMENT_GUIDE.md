# Vercel Deployment Guide

## Environment Configuration

This project uses separate `.env` files for frontend and backend:

- **`packages/frontend/.env`** - Frontend environment variables (git-ignored)
- **`packages/frontend/.env.example`** - Frontend template (committed)
- **`packages/backend/.env`** - Backend environment variables (git-ignored)
- **`packages/backend/.env.example`** - Backend template (committed)
- **`.env.production`** - Production reference (committed)

## Quick Deployment Steps

### 1. Deploy Backend First

Deploy your backend to Railway, Render, or another platform:

```bash
# Example: Deploy to Railway
cd packages/backend
railway login
railway init
railway up
```

Get your backend URL (e.g., `https://your-app.railway.app`)

### 2. Configure Vercel Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.railway.app` | Production |
| `VITE_NODE_ENV` | `production` | Production |

### 3. Deploy to Vercel

```bash
# Push to trigger deployment
git add .
git commit -m "Configure for production"
git push origin main
```

Or use Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

## Local Development

1. Copy the templates:
```bash
# Frontend
cp packages/frontend/.env.example packages/frontend/.env

# Backend
cp packages/backend/.env.example packages/backend/.env
```

2. The default values are already set for local development:

**Frontend** (`packages/frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
VITE_NODE_ENV=development
```

**Backend** (`packages/backend/.env`):
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. Start development servers:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## Vercel Configuration

The `vercel.json` is already configured for frontend-only deployment:

- ✅ Builds only the frontend package
- ✅ Outputs to `packages/frontend/dist`
- ✅ Handles SPA routing
- ✅ Optimizes asset caching

## Troubleshooting

### Build fails on Vercel
- Check that environment variables are set in Vercel Dashboard
- Verify `VITE_API_URL` doesn't have trailing slash

### API calls fail in production
- Ensure backend is deployed and accessible
- Check CORS configuration in backend allows your Vercel domain
- Verify `VITE_API_URL` in Vercel matches your backend URL

### Environment variables not working
- Vercel requires `VITE_` prefix for client-side variables
- Redeploy after changing environment variables
- Clear build cache if needed

## Backend CORS Configuration

Ensure your backend allows requests from Vercel:

```typescript
// In packages/backend/src/server.ts
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-vercel-app.vercel.app'
];
```

## Next Steps

1. ✅ Deploy backend to Railway/Render
2. ✅ Get backend URL
3. ✅ Set environment variables in Vercel
4. ✅ Deploy frontend to Vercel
5. ✅ Test the deployed application
6. ✅ Update backend CORS if needed

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
