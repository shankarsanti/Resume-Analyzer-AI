# Vercel Configuration Fix

## The Problem
Vercel build completes successfully but can't find the output directory:
```
Error: No Output Directory named "dist" found after the Build completed.
```

## Root Cause
Vercel is looking for `dist` in the root, but the build creates `packages/frontend/dist` in a monorepo structure.

## Solution Options

### Option 1: Configure in Vercel Dashboard (Recommended)

This is the most reliable approach for monorepos.

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to **Settings** → **General**

2. **Set Root Directory**
   - Find "Root Directory" setting
   - Click **Edit**
   - Set to: `packages/frontend`
   - Click **Save**

3. **Update Build Settings**
   - Build Command: `npm run build` (or leave empty for auto-detect)
   - Output Directory: `dist` (or leave empty for auto-detect)
   - Install Command: `npm install` (or leave empty)

4. **Delete or Simplify vercel.json**
   
   Use this minimal config:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

5. **Redeploy**
   ```bash
   git add .
   git commit -m "Simplify Vercel config"
   git push origin main
   ```

### Option 2: Use Vercel CLI with Root Directory

```bash
# From project root
vercel --prod --cwd packages/frontend
```

Or add to package.json:
```json
{
  "scripts": {
    "deploy": "vercel --prod --cwd packages/frontend"
  }
}
```

### Option 3: Restructure for Vercel

If you want to keep everything in vercel.json, you need to ensure the paths are correct:

**Current vercel.json:**
```json
{
  "version": 2,
  "buildCommand": "npm run build:frontend",
  "outputDirectory": "packages/frontend/dist",
  "installCommand": "npm install"
}
```

**Alternative - Use builds array:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/packages/frontend/dist/index.html"
    }
  ]
}
```

But this requires adding a build script to `packages/frontend/package.json`:
```json
{
  "scripts": {
    "vercel-build": "npm run build"
  }
}
```

### Option 4: Copy dist to Root (Workaround)

Modify the build command to copy files to root:

**Update package.json:**
```json
{
  "scripts": {
    "build:frontend": "npm run build --workspace=packages/frontend && npm run copy:dist",
    "copy:dist": "cp -r packages/frontend/dist ./dist"
  }
}
```

**Update vercel.json:**
```json
{
  "version": 2,
  "buildCommand": "npm run build:frontend",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

## Recommended Approach

**Use Option 1** - Configure Root Directory in Vercel Dashboard. This is:
- ✅ Most reliable for monorepos
- ✅ Easier to maintain
- ✅ Works with Vercel's auto-detection
- ✅ No complex build scripts needed

## Step-by-Step: Option 1 Implementation

1. **Update vercel.json to minimal config:**
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. **Commit and push:**
   ```bash
   git add vercel.json
   git commit -m "Simplify Vercel config for dashboard setup"
   git push origin main
   ```

3. **Configure in Vercel Dashboard:**
   - Settings → General → Root Directory → `packages/frontend`
   - Settings → General → Framework Preset → `Vite`
   - Settings → General → Build Command → (leave empty or `npm run build`)
   - Settings → General → Output Directory → (leave empty or `dist`)

4. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

## Verification

After redeploying, check:

1. **Build Logs** should show:
   ```
   ✓ built in X.XXs
   Build Completed
   ```

2. **No errors** about missing output directory

3. **Deployment succeeds** and shows "Ready"

4. **Visit your site** - should load without errors

## Still Having Issues?

If Option 1 doesn't work, try Option 4 (copy dist to root) as it's the most compatible with Vercel's expectations.

## Next Steps After Deployment Works

1. Set environment variables (see QUICK_FIX.md)
2. Deploy backend (see DEPLOYMENT.md)
3. Test the full application
