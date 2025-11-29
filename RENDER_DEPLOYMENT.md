# Render Deployment Guide

This guide explains how to deploy the Task Manager application to Render.

## Architecture

- **Backend**: Node.js Web Service (Express API)
- **Frontend**: Static Site (React SPA)
- **Database**: MongoDB Atlas (already set up)

## Prerequisites

1. GitHub repository with latest code pushed
2. Render account (sign up at https://render.com)
3. MongoDB Atlas database (already configured)

---

## Part 1: Deploy Backend API

### Step 1: Create New Web Service

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `task-manager-monorepo`

### Step 2: Configure Web Service

Use these settings:

- **Name**: `task-manager-api`
- **Region**: Choose closest to you
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### Step 3: Add Environment Variables

Click **Advanced** → **Add Environment Variable** and add:

1. **NODE_ENV**
   - Value: `production`

2. **MONGODB_URL**
   - Value: `mongodb+srv://taskapp:fOGDSrphm5vUkHfs@portfolioprojects.uk6ho1y.mongodb.net/task-manager?retryWrites=true&w=majority&appName=PortfolioProjects`

3. **JWT_SECRET**
   - Value: `94dec75f3756d0ca15130c5879105d5674cd0592ab3459a9719dce1c131903ed`

### Step 4: Deploy

1. Click **Create Web Service**
2. Wait for deployment to complete (2-5 minutes)
3. Check logs for "✅ Connected to MongoDB"
4. Note your backend URL (e.g., `https://task-manager-api-xxxx.onrender.com`)

### Step 5: Test Backend

Test the API is working:

```bash
curl https://YOUR-BACKEND-URL.onrender.com
```

You should see:
```json
{
  "message": "Task Manager API",
  "version": "1.0.0",
  "endpoints": {
    "auth": { ... },
    "tasks": { ... }
  }
}
```

---

## Part 2: Deploy Frontend

### Step 1: Create New Static Site

1. Go to https://dashboard.render.com
2. Click **New +** → **Static Site**
3. Connect the same GitHub repository: `task-manager-monorepo`

### Step 2: Configure Static Site

Use these settings:

- **Name**: `task-manager-frontend`
- **Region**: Choose closest to you (same as backend)
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Step 3: Add Environment Variable

Click **Advanced** → **Add Environment Variable**:

- **Key**: `VITE_API_URL`
- **Value**: `https://task-manager-api-xxxx.onrender.com` (your backend URL from Part 1)

### Step 4: Deploy

1. Click **Create Static Site**
2. Wait for deployment to complete (2-5 minutes)
3. Note your frontend URL (e.g., `https://task-manager-frontend.onrender.com`)

---

## Part 3: Update Backend CORS

After frontend deploys, update backend to allow requests from frontend:

### Step 1: Update Backend Environment Variable

1. Go to your backend service in Render dashboard
2. Go to **Environment** tab
3. Add new environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://task-manager-frontend.onrender.com` (your frontend URL)
4. Click **Save Changes**

The backend will automatically redeploy with the new CORS settings.

---

## Testing the Application

1. Visit your frontend URL: `https://task-manager-frontend.onrender.com`
2. Click **Sign Up** and create an account
3. Log in and create some tasks
4. Verify everything works:
   - Sign up / Log in
   - Create tasks
   - Edit tasks
   - Delete tasks
   - Search and filter
   - Dark mode toggle

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Check `MONGODB_URL` is correct (no extra spaces/newlines)
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check Render logs for specific error messages

**API Returns 404**
- Verify `Root Directory` is set to `backend`
- Check `Start Command` is `npm start`
- Check logs for startup errors

### Frontend Issues

**API Requests Fail (CORS Error)**
- Verify `FRONTEND_URL` is set in backend environment variables
- Make sure URL doesn't have trailing slash
- Check browser console for specific CORS error

**Build Fails**
- Verify `Root Directory` is set to `frontend`
- Check `Build Command` is `npm install && npm run build`
- Check `Publish Directory` is `dist`

**Blank Page**
- Check browser console for errors
- Verify `VITE_API_URL` points to correct backend URL
- Check that backend is running and accessible

---

## Free Tier Limitations

Render's free tier has some limitations:

- **Web Services**: Spin down after 15 minutes of inactivity
  - First request after spin-down may take 30-60 seconds
- **Static Sites**: Always available (no spin-down)
- **Monthly Hours**: 750 hours per service (enough for one service 24/7)

To keep backend always awake (optional):
- Use a service like UptimeRobot to ping your API every 5 minutes
- Or upgrade to paid tier ($7/month)

---

## URLs to Save

After deployment, save these URLs:

- **Backend API**: `https://task-manager-api-xxxx.onrender.com`
- **Frontend App**: `https://task-manager-frontend.onrender.com`
- **Render Dashboard**: https://dashboard.render.com

---

## Auto-Deploy

Both services are configured to auto-deploy when you push to GitHub:

1. Make changes locally
2. Commit and push to GitHub
3. Render automatically detects changes and redeploys
4. Wait 2-5 minutes for deployment to complete

You can disable auto-deploy in the service settings if needed.
