# Questly - Railway Deployment Guide

This guide will help you deploy your Questly full-stack application to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **MongoDB Database**: You'll need a MongoDB instance (Railway provides MongoDB, or use MongoDB Atlas)
3. **GitHub Repository**: Your code should be pushed to a GitHub repository

## Deployment Steps

### 1. Prepare Your Repository

Make sure your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Questly repository
5. Railway will automatically detect your Node.js project

### 3. Configure Environment Variables

In your Railway project dashboard, go to the "Variables" tab and add these environment variables:

#### Backend Variables:
- `PORT`: `5001` (or leave empty for Railway auto-assignment)
- `NODE_ENV`: `production`
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT tokens
- `FRONTEND_URL`: Your frontend URL (will be provided by Railway)

#### Optional Variables:
- `OPENAI_API_KEY`: Your OpenAI API key for AI features
- `FUB_API_KEY`: Your Follow Up Boss API key

#### Frontend Variables:
- `REACT_APP_API_URL`: Your backend API URL (will be provided by Railway)
- `REACT_APP_ENVIRONMENT`: `production`

### 4. Set Up MongoDB Database

#### Option A: Use Railway's MongoDB
1. In your Railway project, click "New Service"
2. Select "Database" → "MongoDB"
3. Railway will provide a connection string
4. Copy the connection string to your `MONGODB_URI` variable

#### Option B: Use MongoDB Atlas
1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Get your connection string
3. Add it to your `MONGODB_URI` variable

### 5. Configure Deployment

Railway should automatically detect your configuration files:
- `railway.json` - Railway-specific configuration
- `nixpacks.toml` - Build configuration
- `Procfile` - Process definition

### 6. Deploy

1. Railway will automatically build and deploy your application
2. You'll get two URLs:
   - Backend API: `https://your-project-name.railway.app`
   - Frontend: `https://your-project-name.railway.app` (if serving static files)

### 7. Update Environment Variables

Once deployed, update these variables with your actual Railway URLs:
- `FRONTEND_URL`: Your Railway frontend URL
- `REACT_APP_API_URL`: Your Railway backend URL + `/api`

### 8. Redeploy

After updating environment variables, trigger a new deployment:
1. Go to your Railway project
2. Click "Redeploy" or push a new commit to trigger automatic deployment

## Architecture

Your Railway deployment will include:
- **Backend**: Node.js/Express API server
- **Frontend**: React application served as static files
- **Database**: MongoDB (Railway or Atlas)

## Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage
- **Health Checks**: Automatic health monitoring

## Troubleshooting

### Common Issues:

1. **Port Issues**: Make sure your backend uses `process.env.PORT` or defaults to 5001
2. **CORS Errors**: Ensure `FRONTEND_URL` is set correctly in your backend environment
3. **Database Connection**: Verify your `MONGODB_URI` is correct and accessible
4. **Environment Variables**: Double-check all required variables are set

### Checking Logs:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# View logs
railway logs
```

## Cost Optimization

Railway offers:
- **Free Tier**: $5/month credit (perfect for testing)
- **Pro Plan**: $20/month for production apps
- **Pay-as-you-go**: Only pay for what you use

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic with Railway)
3. Set up monitoring and alerts
4. Configure automatic backups for MongoDB

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Railway Support: [railway.app/help](https://railway.app/help) 