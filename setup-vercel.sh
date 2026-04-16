#!/bin/bash

echo "🚀 Vercel Deployment Setup & Fix Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify local build works
echo "📦 Step 1: Testing local build..."
if npm run build:frontend; then
    echo -e "${GREEN}✅ Local build successful!${NC}"
else
    echo -e "${RED}❌ Local build failed. Fix errors before deploying.${NC}"
    exit 1
fi

# Step 2: Verify dist folder exists
echo ""
echo "📁 Step 2: Verifying dist folder..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ dist folder created successfully${NC}"
    echo "   Contents:"
    ls -lh dist/
else
    echo -e "${RED}❌ dist folder not found or incomplete${NC}"
    exit 1
fi

# Step 3: Check Vercel CLI
echo ""
echo "🔧 Step 3: Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm i -g vercel
fi

if command -v vercel &> /dev/null; then
    echo -e "${GREEN}✅ Vercel CLI ready${NC}"
    vercel --version
else
    echo -e "${RED}❌ Failed to install Vercel CLI${NC}"
    exit 1
fi

# Step 4: Commit changes
echo ""
echo "💾 Step 4: Committing configuration changes..."
git add .vercelignore vercel.json .env.production
git commit -m "Fix Vercel deployment configuration" || echo "No changes to commit"

# Step 5: Push to GitHub
echo ""
echo "📤 Step 5: Pushing to GitHub..."
git push origin main

# Step 6: Instructions for Vercel Dashboard
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📋 NEXT STEPS - Do this in Vercel Dashboard:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Go to: Deployments tab"
echo "4. Cancel any running builds"
echo "5. Click '...' on any deployment → 'Redeploy'"
echo "6. In the modal:"
echo "   ✅ CHECK 'Use latest commit from Git'"
echo "   ❌ UNCHECK 'Use existing Build Cache'"
echo "7. Click 'Redeploy'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}⚙️  ENVIRONMENT VARIABLES - Set in Vercel:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Go to: Settings → Environment Variables"
echo ""
echo "Add these variables:"
echo "  VITE_API_URL = https://your-backend-url.com"
echo "  VITE_NODE_ENV = production"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Alternative: Deploy directly via CLI${NC}"
echo "Run: vercel --prod"
echo ""
