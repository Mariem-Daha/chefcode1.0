# ⚡ Google Cloud Quick Start - ChefCode

## 🎯 Deploy in 3 Commands

### **1. Setup (First Time Only)**
```bash
# Login
gcloud auth login

# Set project (replace with your project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable services
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

### **2. Deploy**
```bash
gcloud run deploy chefcode \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### **3. Set Environment Variables**
```bash
# Generate API key first
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Set variables (replace YOUR_API_KEY with generated key)
gcloud run services update chefcode \
  --set-env-vars "API_KEY=YOUR_API_KEY,ENVIRONMENT=production,ALLOWED_ORIGINS=*" \
  --region us-central1
```

---

## ✅ That's It!

Your app will be live at: `https://chefcode-xxxxx-uc.a.run.app`

Test it: `https://your-url.run.app/health`

---

## 🪟 Windows Users

Just run:
```bash
deploy-gcloud.bat
```

---

For full documentation, see: `GOOGLE_CLOUD_DEPLOYMENT.md`

