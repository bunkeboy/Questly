#!/bin/bash

# Questly Railway Deployment Script
echo "🚀 Deploying Questly to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging in to Railway..."
railway login

# Initialize Railway project (if not already initialized)
if [ ! -f "railway.toml" ]; then
    echo "🎯 Initializing Railway project..."
    railway init
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "📱 Your app should be available at your Railway URL"
echo "🔧 Don't forget to set your environment variables in the Railway dashboard"
echo "🗃️ MongoDB connection string (MONGODB_URI)"
echo "🔑 JWT secret (JWT_SECRET)"
echo "🌐 Frontend URL (FRONTEND_URL)"
echo "📡 API URL for frontend (REACT_APP_API_URL)" 