# 🚀 Google Cloud Deployment Guide for ChefCode

Your ChefCode app is now ready to deploy on **Google Cloud Run** - a fully managed, scalable platform.

---

## 📋 Prerequisites

1. **Google Cloud Account**
   - Sign up at: https://cloud.google.com
   - New users get $300 free credits!

2. **Google Cloud CLI (gcloud)**
   - Download: https://cloud.google.com/sdk/docs/install
   - Or use Cloud Shell (built into Google Cloud Console)

---

## 🎯 Quick Deployment (3 Steps)

### **Step 1: Setup Google Cloud Project**

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create chefcode-app --name="ChefCode"

# Set the project
gcloud config set project chefcode-app

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### **Step 2: Set Environment Variables (Optional)**

Create environment variables in Cloud Run:
- `API_KEY` - Your secure API key (generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- `ENVIRONMENT` - Set to `production`
- `ALLOWED_ORIGINS` - Set to `*` or your frontend URL
- `OPENAI_API_KEY` - Your OpenAI API key (if using AI features)

### **Step 3: Deploy to Cloud Run**

```bash
# Build and deploy in one command
gcloud run deploy chefcode \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

That's it! Google Cloud will:
1. ✅ Build your Docker image
2. ✅ Push it to Container Registry
3. ✅ Deploy to Cloud Run
4. ✅ Give you a public HTTPS URL

---

## 🔧 Alternative: Manual Docker Build

If you prefer to build Docker image manually:

```bash
# Build the image
docker build -t chefcode .

# Test locally
docker run -p 8080:8080 -e PORT=8080 chefcode

# Tag for Google Container Registry
docker tag chefcode gcr.io/chefcode-app/chefcode

# Push to GCR
docker push gcr.io/chefcode-app/chefcode

# Deploy to Cloud Run
gcloud run deploy chefcode \
  --image gcr.io/chefcode-app/chefcode \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated
```

---

## 🌐 Setting Environment Variables

### **Using gcloud CLI:**

```bash
gcloud run services update chefcode \
  --set-env-vars "API_KEY=your-secure-key,ENVIRONMENT=production,ALLOWED_ORIGINS=*" \
  --region us-central1
```

### **Using Google Cloud Console:**

1. Go to Cloud Run: https://console.cloud.google.com/run
2. Click on your `chefcode` service
3. Click "EDIT & DEPLOY NEW REVISION"
4. Go to "Variables & Secrets" tab
5. Add environment variables:
   - `API_KEY` = your-generated-key
   - `ENVIRONMENT` = production
   - `ALLOWED_ORIGINS` = *
   - `OPENAI_API_KEY` = your-openai-key (optional)
6. Click "DEPLOY"

---

## 🔍 Verify Deployment

Once deployed, Google Cloud Run will give you a URL like:
```
https://chefcode-xxxxx-uc.a.run.app
```

### **Test your endpoints:**

1. **Health Check:**
   ```bash
   curl https://your-app-url.run.app/health
   ```
   Should return: `{"status": "ok"}`

2. **API Documentation:**
   Visit: `https://your-app-url.run.app/docs`

3. **Root Endpoint:**
   Visit: `https://your-app-url.run.app/`

---

## 📊 Monitoring & Logs

### **View Logs:**
```bash
gcloud run services logs read chefcode --region us-central1
```

Or view in console:
https://console.cloud.google.com/run

### **View Metrics:**
- Requests, latency, errors
- Memory and CPU usage
- Auto-scaling activity

---

## 💰 Cost Estimate

**Cloud Run Pricing (Free Tier Included!):**
- First 2 million requests/month: FREE
- First 360,000 GB-seconds: FREE
- First 180,000 vCPU-seconds: FREE

For a small app, you'll likely stay **completely free**!

Full pricing: https://cloud.google.com/run/pricing

---

## 🔄 Continuous Deployment

### **Option 1: Connect GitHub (Automatic)**

1. Go to Cloud Run Console
2. Click "SET UP CONTINUOUS DEPLOYMENT"
3. Connect your GitHub repository: `Mariemdaha/chefcode1.0`
4. Select branch: `main`
5. Every push to `main` will auto-deploy!

### **Option 2: Use Cloud Build (Manual)**

```bash
# Submit build
gcloud builds submit --config cloudbuild.yaml
```

The included `cloudbuild.yaml` will:
- Build Docker image
- Push to Container Registry
- Deploy to Cloud Run

---

## 🛠️ Update Deployment

To update your app after changes:

```bash
# Rebuild and redeploy
gcloud run deploy chefcode \
  --source . \
  --region us-central1
```

---

## 🎯 What's Included

Your deployment includes:
- ✅ **Dockerfile** - Optimized Python 3.11 container
- ✅ **.dockerignore** - Excludes unnecessary files
- ✅ **cloudbuild.yaml** - Automated build configuration
- ✅ **Health check** endpoint at `/health`
- ✅ **Auto-scaling** from 0 to 100+ instances
- ✅ **HTTPS** enabled by default
- ✅ **Global CDN** for fast response times

---

## 🔐 Security Best Practices

1. **Generate Secure API Key:**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Set CORS Properly:**
   - Development: `ALLOWED_ORIGINS=*`
   - Production: `ALLOWED_ORIGINS=https://your-frontend.com`

3. **Use Secret Manager:**
   ```bash
   # Store secrets securely
   echo -n "your-api-key" | gcloud secrets create api-key --data-file=-
   
   # Use in Cloud Run
   gcloud run services update chefcode \
     --set-secrets API_KEY=api-key:latest \
     --region us-central1
   ```

---

## 📱 Update Frontend

After deployment, update your frontend's backend URL:

### **Mobile App (`frontend/mobile/src/BackendConfig.js`):**
```javascript
export const BACKEND_URL = 'https://your-app-url.run.app';
```

### **Web App (`frontend/shared/config.js`):**
```javascript
export const API_BASE_URL = 'https://your-app-url.run.app/api';
```

---

## 🆘 Troubleshooting

### **Container fails to start:**
```bash
# Check logs
gcloud run services logs read chefcode --region us-central1 --limit 50
```

### **Port not found:**
- Cloud Run sets `PORT` environment variable automatically
- Dockerfile uses: `CMD cd Backend && uvicorn main:app --host 0.0.0.0 --port ${PORT}`

### **Health check fails:**
- Ensure `/health` endpoint returns 200 OK
- Check: `curl https://your-app-url.run.app/health`

### **Import errors:**
- Dockerfile changes to Backend directory before running
- All relative imports in Backend/main.py work correctly

---

## 🎉 Advantages of Google Cloud Run

✅ **Zero Infrastructure Management** - No servers to manage  
✅ **Auto-Scaling** - From 0 to thousands of instances  
✅ **Pay Per Use** - Only pay when requests are being handled  
✅ **Fast Cold Starts** - Usually < 1 second  
✅ **Built-in HTTPS** - Free SSL certificates  
✅ **Global Load Balancing** - Fast worldwide  
✅ **Easy Rollbacks** - One-click rollback to previous versions  
✅ **Generous Free Tier** - 2M requests/month free!  

---

## 📚 Additional Resources

- **Cloud Run Docs:** https://cloud.google.com/run/docs
- **Pricing Calculator:** https://cloud.google.com/products/calculator
- **Best Practices:** https://cloud.google.com/run/docs/best-practices
- **Troubleshooting:** https://cloud.google.com/run/docs/troubleshooting

---

## ✨ Ready to Deploy!

Your ChefCode app is fully configured for Google Cloud Run. Just run:

```bash
gcloud run deploy chefcode --source . --region us-central1 --allow-unauthenticated
```

**That's it! Your app will be live in minutes! 🚀**

