#!/bin/bash

# Manual Deployment Script for Vercel
# Use this if Vercel isn't picking up Git commits

echo "🚀 Manual Vercel Deployment Script"
echo "===================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "📦 Building locally first to verify..."
npm run build:frontend

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    echo ""
    echo "🔐 Logging into Vercel..."
    vercel login
    
    echo ""
    echo "🚀 Deploying to production..."
    vercel --prod
else
    echo "❌ Local build failed. Fix errors before deploying."
    exit 1
fi
