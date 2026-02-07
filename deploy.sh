#!/bin/bash

# Doppio Cloudflare Deployment Script
# This script deploys the app to Cloudflare Pages with KV storage

set -e

echo "🚀 Starting Doppio deployment to Cloudflare Pages..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare:"
    wrangler login
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Create KV namespaces if they don't exist
echo "💾 Setting up KV namespaces..."
USERS_KV_ID=$(wrangler kv namespace list --json | jq -r '.[] | select(.title=="USERS_KV") | .id' 2>/dev/null || echo "")
CAFES_KV_ID=$(wrangler kv namespace list --json | jq -r '.[] | select(.title=="CAFES_KV") | .id' 2>/dev/null || echo "")

if [ -z "$USERS_KV_ID" ]; then
    echo "Creating USERS_KV namespace..."
    USERS_KV_OUTPUT=$(wrangler kv namespace create "USERS_KV")
    USERS_KV_ID=$(echo "$USERS_KV_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
fi

if [ -z "$CAFES_KV_ID" ]; then
    echo "Creating CAFES_KV namespace..."
    CAFES_KV_OUTPUT=$(wrangler kv namespace create "CAFES_KV")
    CAFES_KV_ID=$(echo "$CAFES_KV_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
fi

# Update wrangler.toml with actual KV IDs
echo "📝 Updating wrangler.toml with KV namespace IDs..."
sed -i.bak "s/id = \"users_kv_namespace_id\"/id = \"$USERS_KV_ID\"/" wrangler.toml
sed -i.bak "s/id = \"cafes_kv_namespace_id\"/id = \"$CAFES_KV_ID\"/" wrangler.toml

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
wrangler pages deploy .next --project-name doppio

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Cloudflare Pages dashboard"
echo "2. Select your doppio project"
echo "3. Go to Settings → Functions"
echo "4. Add KV namespace bindings:"
echo "   - Variable name: USERS_KV → Namespace: $USERS_KV_ID"
echo "   - Variable name: CAFES_KV → Namespace: $CAFES_KV_ID"
echo "5. Add environment variable: JWT_SECRET (generate a strong random string)"
echo ""
echo "🎉 Your app should be live at your Cloudflare Pages domain!"
