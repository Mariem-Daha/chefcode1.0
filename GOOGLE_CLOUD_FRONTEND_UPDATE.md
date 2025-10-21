# 🔄 Update Frontend for Google Cloud Deployment

After deploying to Google Cloud Run, you need to update your frontend to use the new backend URL.

---

## 🎯 Quick Update (Windows)

### **Step 1: Deploy to Google Cloud**
```bash
gcloud run deploy chefcode --source . --region us-central1 --allow-unauthenticated
```

### **Step 2: Get Your URL**
Google Cloud will give you a URL like:
```
https://chefcode-xxxxx-uc.a.run.app
```

### **Step 3: Update Frontend**
```bash
# Run the update script
UPDATE_FRONTEND_URL.bat
```

Or manually update these files:

---

## 📝 Manual Update

### **1. Update `frontend/mobile/assets/config.js`**
```javascript
// Change this line:
const PRODUCTION_API_URL = 'https://chefcode-xxxxx-uc.a.run.app';

// To your actual URL:
const PRODUCTION_API_URL = 'https://chefcode-abc123-uc.a.run.app';
```

### **2. Update `frontend/shared/config.js` (if exists)**
```javascript
export const API_BASE_URL = 'https://chefcode-abc123-uc.a.run.app/api';
```

### **3. Update `frontend/mobile/src/BackendConfig.js` (if exists)**
```javascript
export const BACKEND_URL = 'https://chefcode-abc123-uc.a.run.app';
```

---

## 🔍 Find Your Google Cloud URL

### **Method 1: From Deployment Output**
When you run `gcloud run deploy`, it shows the URL:
```
Service URL: https://chefcode-abc123-uc.a.run.app
```

### **Method 2: From Google Cloud Console**
1. Go to: https://console.cloud.google.com/run
2. Click on your `chefcode` service
3. Copy the URL from the service details

### **Method 3: Using gcloud CLI**
```bash
gcloud run services describe chefcode --region us-central1 --format="value(status.url)"
```

---

## ✅ Test Your Frontend

After updating the URL:

1. **Open your frontend** (mobile app or web)
2. **Check the console** for:
   ```
   🔧 ChefCode Config: Object
   ✅ API Key configured
   ```
3. **Test API calls** - they should now go to your Google Cloud URL
4. **Check health endpoint**: `https://your-url.run.app/health`

---

## 🐛 Troubleshooting

### **Frontend still shows old URL:**
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Check all config files are updated

### **API calls failing:**
- Verify your Google Cloud URL is correct
- Check that your backend is deployed and running
- Test health endpoint: `https://your-url.run.app/health`

### **CORS errors:**
- Set `ALLOWED_ORIGINS=*` in Google Cloud Run environment variables
- Or set specific domains: `ALLOWED_ORIGINS=https://your-frontend.com`

---

## 📱 Update Mobile App

If you're using React Native:

1. **Update `frontend/mobile/src/BackendConfig.js`:**
   ```javascript
   export const BACKEND_URL = 'https://your-google-cloud-url.run.app';
   ```

2. **Rebuild your app:**
   ```bash
   cd frontend/mobile
   npm run android  # or npm run ios
   ```

---

## 🌐 Update Web App

If you're using the web version:

1. **Update `frontend/shared/config.js`:**
   ```javascript
   export const API_BASE_URL = 'https://your-google-cloud-url.run.app/api';
   ```

2. **Refresh your browser** or redeploy your web app

---

## 🎯 Quick Commands

```bash
# Deploy to Google Cloud
gcloud run deploy chefcode --source . --region us-central1 --allow-unauthenticated

# Get your URL
gcloud run services describe chefcode --region us-central1 --format="value(status.url)"

# Update frontend (Windows)
UPDATE_FRONTEND_URL.bat

# Test health endpoint
curl https://your-url.run.app/health
```

---

## ✨ Benefits of Google Cloud

✅ **Reliable** - Much more stable than Render  
✅ **Fast** - Global CDN and edge locations  
✅ **Scalable** - Auto-scales from 0 to thousands  
✅ **Free Tier** - 2 million requests/month free!  
✅ **HTTPS** - Automatic SSL certificates  
✅ **Monitoring** - Built-in logging and metrics  

---

Your frontend will now connect to your Google Cloud deployment instead of the old Render URL! 🚀
