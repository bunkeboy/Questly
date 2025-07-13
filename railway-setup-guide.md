# Railway Setup Completion Guide

## Current Status ✅
- ✅ Railway project created: "Questly"
- ✅ Service linked: "Questly"
- ✅ Environment variables set:
  - NODE_ENV=production
  - JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-secure-in-production
- ✅ Code uploaded and build initiated

## Next Steps (Manual)

### 1. Add MongoDB Database
Since the Railway CLI uses interactive prompts, you'll need to complete this manually:

```bash
railway add
```

When prompted:
- Select "Database"
- Choose "MongoDB"
- Railway will create a MongoDB instance and provide connection details

### 2. Set MongoDB Connection Variable
After the database is created, set the connection string:

```bash
railway variables --set "MONGODB_URI=mongodb://mongo:password@monorail.proxy.rlwy.net:port/database"
```

Note: Railway will provide the actual connection string in the dashboard.

### 3. Redeploy the Application
After setting the MongoDB URI:

```bash
railway up --detach
```

### 4. Get Your Application URL
Check the deployment status and get the URL:

```bash
railway status
railway domain
```

### 5. Set Frontend API URL
Once you have the Railway URL, set the frontend API URL:

```bash
railway variables --set "REACT_APP_API_URL=https://your-railway-url.railway.app/api"
```

### 6. Final Redeploy
After all variables are set:

```bash
railway up --detach
```

## Alternative: Use Railway Dashboard
You can also complete these steps in the Railway web dashboard:

1. Go to: https://railway.app/dashboard
2. Open your "Questly" project
3. Add a new service → Database → MongoDB
4. Set the environment variables in the Variables tab
5. Redeploy from the dashboard

## Verification
Once deployed, test these endpoints:
- Health check: `https://your-url.railway.app/health`
- Frontend: `https://your-url.railway.app`
- API: `https://your-url.railway.app/api`

## Troubleshooting
If deployment fails:
1. Check logs: `railway logs`
2. Verify all required variables are set: `railway variables`
3. Ensure MongoDB is running and accessible
4. Check build logs in the Railway dashboard 