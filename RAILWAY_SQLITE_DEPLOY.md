# 🚀 Deploy ChefCode on Railway (Using SQLite)

## **Simplified Deployment Without PostgreSQL**

If Railway doesn't offer PostgreSQL or you want a simpler setup, ChefCode works perfectly with SQLite!

---

## **✅ What You Need**

Just these environment variables in Railway:

```
OPENAI_API_KEY = your_openai_key_here
API_KEY = chefcode-secret-key-2024
ENVIRONMENT = production
ALLOWED_ORIGINS = *
```

**That's it!** No DATABASE_URL needed - SQLite is the default.

---

## **📋 Step-by-Step Deployment**

### **1. Create Railway Project**
- Go to: https://railway.app
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Choose **`chefcode1.0`**

### **2. Add Environment Variables**
- Click on your service
- Go to **"Variables"** tab
- Click **"+ New Variable"** for each:

```
OPENAI_API_KEY
(paste your OpenAI API key)

API_KEY
chefcode-secret-key-2024

ENVIRONMENT
production

ALLOWED_ORIGINS
*
```

### **3. Wait for Build**
Railway will:
- ✅ Install Python dependencies
- ✅ Create SQLite database automatically
- ✅ Start the application
- ✅ Run health checks

### **4. Generate Domain**
- Go to **"Settings"** tab
- Scroll to **"Networking"** or **"Domains"**
- Click **"Generate Domain"**
- Copy your URL: `https://[your-app].up.railway.app`

### **5. Test Your App**
Visit your URL and you should see ChefCode! 🎉

---

## **⚠️ Important: SQLite Limitations on Railway**

### **Data Persistence Issue:**
- Railway's free tier uses **ephemeral storage**
- When Railway restarts your app, **SQLite data is lost**
- This happens during:
  - Deployments
  - Auto-restarts
  - Inactivity periods

### **Solutions:**

#### **Option A: Accept Data Loss (Demo/Testing)**
- Fine for demos and testing
- Data resets on each deploy
- No setup required

#### **Option B: Use Railway's Persistent Storage**
Add this to your Railway service:
- Go to **"Settings"** → **"Volumes"**
- Click **"+ New Volume"**
- Mount path: `/app/Backend`
- This will persist your `chefcode.db` file

#### **Option C: Use External Database (Production)**
For production with guaranteed data persistence:

1. **Supabase (Free Tier):**
   - Go to https://supabase.com
   - Create free PostgreSQL database
   - Copy connection string
   - Add to Railway as `DATABASE_URL`

2. **ElephantSQL (Free Tier):**
   - Go to https://www.elephantsql.com
   - Create free PostgreSQL instance (20MB)
   - Copy URL
   - Add to Railway as `DATABASE_URL`

3. **Railway's Paid PostgreSQL:**
   - $5/month
   - Includes in Railway project
   - Automatic backups

---

## **🎯 Recommended Setup by Use Case**

| Use Case | Database | Setup Time | Data Persists? |
|----------|----------|------------|----------------|
| **Demo/Showcase** | SQLite (default) | 5 min | ❌ No (resets) |
| **Testing** | SQLite + Volume | 7 min | ✅ Yes |
| **Production (Small)** | Supabase Free | 10 min | ✅ Yes |
| **Production (Full)** | Railway PostgreSQL | 5 min | ✅ Yes ($5/mo) |

---

## **🚀 Quick Start (SQLite Demo)**

```bash
# Just set these 4 variables in Railway:
OPENAI_API_KEY=your_key
API_KEY=chefcode-secret-key-2024
ENVIRONMENT=production
ALLOWED_ORIGINS=*

# That's it! Deploy and test.
```

---

## **🔄 Adding Persistent Storage Later**

If you start with SQLite and want to upgrade:

1. **Add Volume in Railway:**
   - Settings → Volumes → New Volume
   - Mount path: `/app/Backend`
   
2. **Or Switch to PostgreSQL:**
   - Add DATABASE_URL environment variable
   - Railway will use PostgreSQL instead
   - No code changes needed!

---

## **✅ Current Status**

Your code is already configured to:
- ✅ Use SQLite by default (no DATABASE_URL needed)
- ✅ Automatically switch to PostgreSQL if DATABASE_URL is set
- ✅ Handle both local development and production

**Just deploy with the 4 environment variables above and it will work!** 🎉

---

## **🆘 Troubleshooting**

### **"Database locked" errors**
- SQLite doesn't handle high concurrency well
- Solution: Use PostgreSQL for production

### **Data disappears after restart**
- Expected behavior with default Railway setup
- Solution: Add Volume or use external database

### **App won't start**
- Check Railway logs for specific error
- Verify OPENAI_API_KEY is set correctly
- Make sure all 4 variables are added

---

## **📞 Next Steps**

1. ✅ Deploy with SQLite (5 minutes)
2. ✅ Test all features
3. ✅ Share with team
4. 🔄 Upgrade to persistent storage if needed

**Your app is ready to deploy right now with SQLite!** 🚀
