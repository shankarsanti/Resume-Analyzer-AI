#!/bin/bash

echo "🚂 Railway Backend Deployment"
echo "=============================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in backend directory"
    echo "Run: cd packages/backend"
    exit 1
fi

echo "✅ In backend directory"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "Installing Railway CLI..."
    npm i -g @railway/cli
fi

echo "✅ Railway CLI ready"
echo ""

# Step 1: Login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Login to Railway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will open your browser. Log in with GitHub."
echo ""
read -p "Press Enter to continue..."

railway login

if [ $? -ne 0 ]; then
    echo "❌ Login failed"
    exit 1
fi

echo ""
echo "✅ Logged in successfully"
echo ""

# Step 2: Initialize project
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Initialize Railway Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

railway init

if [ $? -ne 0 ]; then
    echo "❌ Project initialization failed"
    exit 1
fi

echo ""
echo "✅ Project initialized"
echo ""

# Step 3: Deploy
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Deploy to Railway"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Deploying your backend..."
echo ""

railway up

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    echo "Check logs with: railway logs"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""

# Step 4: Generate domain
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Generate Public Domain"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

railway domain

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Copy the Railway URL shown above"
echo ""
echo "2. Set environment variables in Railway:"
echo "   railway open"
echo "   → Go to Variables tab"
echo "   → Add: NODE_ENV = production"
echo "   → Add: FRONTEND_URL = https://your-frontend.vercel.app"
echo ""
echo "3. Update Vercel environment variables:"
echo "   → Go to Vercel Dashboard"
echo "   → Settings → Environment Variables"
echo "   → Update VITE_API_URL with your Railway URL"
echo ""
echo "4. Redeploy frontend in Vercel"
echo ""
echo "5. Test your backend:"
echo "   curl https://your-railway-url.up.railway.app/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
