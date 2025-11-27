# AlgoDeck Deployment Guide

This guide covers deploying the AlgoDeck application:
- **Backend**: Render.com
- **Frontend**: Vercel

---

## Prerequisites

1. GitHub repository with your AlgoDeck code
2. Accounts on:
   - [Render](https://render.com)
   - [Vercel](https://vercel.com)
   - [Google Cloud Console](https://console.cloud.google.com) (for OAuth)

---

## Part 1: Backend Deployment on Render

### Step 1: Prepare Backend for Production

1. Make sure your `backend/package.json` has a start script:
   ```json
   {
     "scripts": {
       "start": "node src/server.js"
     }
   }
   ```

### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `algodeck-backend` |
   | **Region** | Choose closest to your users |
   | **Branch** | `main` (or your default branch) |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (or paid for better performance) |

### Step 3: Set Environment Variables on Render

In the Render dashboard, go to your service → **Environment** tab and add:

```
MONGODB_URI=mongodb+srv://algodeck_user:sudhanshu_1234@algodeck-cluster.fdijxdo.mongodb.net/algodeck?retryWrites=true&w=majority
JWT_SECRET=your_production_jwt_secret_here_make_it_long_and_random
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=https://your-app-name.vercel.app
NODE_ENV=production
PORT=5000
```

> ⚠️ **Important**: Generate a new strong JWT_SECRET for production!

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete
3. Note your backend URL: `https://algodeck-backend.onrender.com`

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Prepare Frontend for Production

1. Update the API base URL in `frontend/src/services/api.js`:

   The API should detect the environment automatically. Update if needed:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
   ```

### Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

### Step 3: Set Environment Variables on Vercel

In Project Settings → Environment Variables, add:

```
VITE_API_URL=https://algodeck-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Note your frontend URL: `https://your-app-name.vercel.app`

---

## Part 3: Update Google OAuth Settings

### Step 1: Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project → **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Update the following:

**Authorized JavaScript Origins:**
```
https://your-app-name.vercel.app
https://algodeck-backend.onrender.com
```

**Authorized Redirect URIs:**
```
https://algodeck-backend.onrender.com/api/auth/google/callback
```

### Step 2: Update Backend Environment

On Render, update the `FRONTEND_URL` environment variable:
```
FRONTEND_URL=https://your-app-name.vercel.app
```

---

## Part 4: Verify Deployment

### Test Checklist

- [ ] Backend health check: `https://algodeck-backend.onrender.com/api/health`
- [ ] Frontend loads: `https://your-app-name.vercel.app`
- [ ] Google OAuth login works
- [ ] Create a note folder → saves to MongoDB
- [ ] Create a note → saves to MongoDB
- [ ] Create a question folder → saves to MongoDB
- [ ] Create a question → saves to MongoDB
- [ ] Refresh page → data persists

---

## Configuration Files

### render.yaml (Optional - Infrastructure as Code)

Create `render.yaml` in your repository root for automatic Render configuration:

```yaml
services:
  - type: web
    name: algodeck-backend
    runtime: node
    region: oregon
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: GOOGLE_CLIENT_ID
        sync: false
      - key: GOOGLE_CLIENT_SECRET
        sync: false
      - key: FRONTEND_URL
        sync: false
```

### vercel.json (Optional - Vercel Configuration)

Create `frontend/vercel.json` for custom Vercel settings:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

## Troubleshooting

### Backend Issues

**Problem: MongoDB connection fails**
- Check if your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allow all IPs)
- Verify the connection string in environment variables

**Problem: CORS errors**
- Ensure `FRONTEND_URL` is set correctly on Render
- Check that the backend CORS configuration includes the Vercel domain

**Problem: Google OAuth fails**
- Verify redirect URIs in Google Cloud Console match exactly
- Check that client ID and secret are correct in environment variables

### Frontend Issues

**Problem: API calls fail**
- Check browser console for CORS errors
- Verify `VITE_API_URL` is set correctly
- Make sure backend is running (check Render logs)

**Problem: Blank page after deploy**
- Check Vercel build logs for errors
- Verify the build output directory is `dist`

### Render Free Tier Notes

- Free instances spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- Consider upgrading to paid tier for production use

---

## Environment Variables Summary

### Backend (Render)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FRONTEND_URL` | Your Vercel frontend URL |
| `NODE_ENV` | Set to `production` |
| `PORT` | Server port (5000) |

### Frontend (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL on Render |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## Quick Deploy Commands

After initial setup, future deployments are automatic via Git push:

```bash
# Push to deploy both frontend and backend
git add .
git commit -m "Your commit message"
git push origin main
```

Both Render and Vercel will automatically rebuild and deploy on push to the main branch.
