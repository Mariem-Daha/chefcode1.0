# 🚂 Railway Deployment Guide for ChefCode

## ✅ Deployment Ready!

Your ChefCode app is now configured for Railway deployment. All necessary fixes have been applied.

## 🔧 Configuration Files Fixed

### 1. railway.json
- ✅ Updated start command to use uvicorn directly
- ✅ Added restart policy for better reliability
- ✅ Changed to: `cd Backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

### 2. Procfile
- ✅ Updated for compatibility with multiple platforms

## 📋 Required Environment Variables for Railway

Set these in your Railway project settings:

### Essential Variables (⚠️ CRITICAL!):
```bash
# API Key for backend authentication (REQUIRED!)
API_KEY=your-secure-random-key-here

# Python Environment
ENVIRONMENT=production

# Port (Railway sets this automatically)
PORT=8000

# CORS (Important!)
ALLOWED_ORIGINS=*

# OpenAI API (if using AI features)
OPENAI_API_KEY=your_openai_api_key_here
```

### 🔑 Generate API_KEY:
Before deploying, run this locally:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copy the output and set it as `API_KEY` in Railway variables.

### Optional Variables (for enhanced features):
```bash
# Google Cloud Services (for OCR)
GOOGLE_APPLICATION_CREDENTIALS=/app/Backend/google-service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id

# Database (Railway can auto-provision PostgreSQL)
DATABASE_URL=postgresql://... (Railway will set this if you add PostgreSQL)
```

## 🚀 Deployment Steps

1. **Generate API Key (CRITICAL FIRST STEP!)**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   Save the output - you'll need it in step 4.

2. **Connect your repository to Railway**
   - Go to Railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your ChefCode repository

3. **Railway will automatically:**
   - Detect Python project
   - Install dependencies from `requirements.txt`
   - Run the start command from `railway.json`

4. **Set Environment Variables (BEFORE DEPLOYING!):**
   - Go to your project → Variables tab
   - **REQUIRED**: Add `API_KEY` with your generated key
   - **REQUIRED**: Add `ENVIRONMENT=production`
   - **REQUIRED**: Add `ALLOWED_ORIGINS=*`
   - Optional: Add `OPENAI_API_KEY` for AI features

5. **Deploy:**
   - Railway deploys automatically on push to main/master
   - Or click "Deploy" in Railway dashboard

## 📊 Monitoring Your Deployment

### View Logs:
- Go to Railway dashboard → Your service → "Logs" tab
- Look for: `🚀 ChefCode Backend is starting up...`
- Confirm: `✅ Application startup complete`

### Health Check:
Once deployed, test your endpoint:
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "ChefCode Backend"
}
```

### API Documentation:
Visit: `https://your-app.railway.app/docs`

## 🔍 Troubleshooting

### If deployment fails:

1. **Check Logs** in Railway dashboard
2. **Verify Environment Variables** are set correctly
3. **Check Build Logs** for dependency issues

### Common Issues:

#### Port Binding Error:
- Railway automatically sets `$PORT` variable
- Our config uses it correctly: `--port $PORT`

#### Import Errors:
- Fixed by using `cd Backend` before running uvicorn
- This ensures all relative imports work correctly

#### Missing API_KEY (Most Common!):
- **Symptom**: Crash with RuntimeError or import error
- **Fix**: Generate API_KEY and add to Railway variables
- **Note**: Backend now auto-generates temporary key, but set a real one!

#### CORS Errors:
- Set `ALLOWED_ORIGINS=*` for testing
- For production, set specific domains: `https://your-frontend.com,https://app.com`

#### Database Issues:
- Default: SQLite (file-based, persists in Railway volume)
- Upgrade: Add PostgreSQL plugin in Railway for better performance

## 📱 Frontend Configuration

After backend is deployed, update your frontend's backend URL:

### For Mobile App:
Edit `frontend/mobile/src/BackendConfig.js`:
```javascript
export const BACKEND_URL = 'https://your-app.railway.app';
```

### For Web App:
Edit `frontend/shared/config.js`:
```javascript
export const API_BASE_URL = 'https://your-app.railway.app/api';
```

## 🎯 Performance Tips

1. **Add PostgreSQL**: Railway offers free PostgreSQL - better than SQLite for production
2. **Environment Variables**: Never commit API keys - always use Railway variables
3. **Monitoring**: Enable Railway's built-in monitoring for uptime tracking
4. **Scaling**: Railway can auto-scale based on traffic

## ✨ What's Fixed

- ✅ Start command optimized for Railway
- ✅ Port binding uses Railway's $PORT variable
- ✅ Working directory properly set to Backend/
- ✅ Restart policy configured for automatic recovery
- ✅ Logging enhanced for better debugging
- ✅ CORS configured for frontend access
- ✅ Health check endpoint ready
- ✅ Both SQLite and PostgreSQL supported

## 🎉 Next Steps

1. Push your changes to GitHub
2. Railway will auto-deploy
3. Set environment variables in Railway dashboard
4. Test the `/health` endpoint
5. Update frontend with new backend URL
6. Enjoy your deployed ChefCode app!

---

**Need Help?** Check Railway logs or Railway documentation at: https://docs.railway.app

