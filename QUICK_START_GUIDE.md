# ChefCode - Quick Start Guide

## ✅ Frontend Reconnected to FastAPI Backend

Your ChefCode frontend is now connected to the FastAPI backend (port **8000**).

---

## 🚀 Starting the Application

### 1. Start the FastAPI Backend

```powershell
# Navigate to backend folder
cd C:\Users\Admin\Desktop\ChefCode_final\Backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```

**Backend will run on:** `http://localhost:8000`
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 2. Open the Frontend

**For Web Interface:**
```powershell
# Navigate to frontend folder
cd C:\Users\Admin\Desktop\ChefCode_final\frontend\mobile\assets

# Open index.html in browser
start index.html
```

**For Mobile App (React Native):**
```powershell
cd C:\Users\Admin\Desktop\ChefCode_final\frontend\mobile

# Update IP address in App.js (line 28)
# Change '192.168.1.100' to your computer's local IP

npm install  # First time only
npx expo start
```

---

## 🔧 Configuration Changes Made

### Port Changed: 3000 → 8000
- **Old:** Node.js backend on port 3000
- **New:** FastAPI backend on port 8000

### Files Updated:
1. ✅ `frontend/shared/api.js` - Base URL: `http://localhost:8000`
2. ✅ `frontend/mobile/assets/script.js` - ChatGPT & sync endpoints
3. ✅ `frontend/mobile/src/App.js` - Mobile app connection
4. ✅ `frontend/mobile/assets/shared/config.js` - Config: port 8000
5. ✅ All Android assets updated

---

## 🎯 Features Available

### With Backend Connected:
✅ **AI Chat** - ChatGPT integration for inventory parsing
✅ **Data Sync** - Automatic synchronization with backend
✅ **Inventory Management** - Add, update, delete items
✅ **Recipe Management** - Create and manage recipes
✅ **Task Tracking** - Production task management
✅ **Persistent Storage** - Data saved in SQLite database

### Offline Mode:
✅ **Local Storage** - Data persists in browser localStorage
✅ **Basic Operations** - Add inventory, recipes, tasks locally
❌ **AI Chat** - Requires backend connection

---

## 📡 API Endpoints (FastAPI)

### Core Endpoints:
- `GET /api/data` - Get all data (inventory, recipes, tasks)
- `POST /api/sync-data` - Sync all data from frontend
- `POST /api/action` - Handle actions (add-inventory, save-recipe, add-task)
- `POST /api/chatgpt-smart` - AI chat integration

### Health Check:
- `GET /health` - Check backend status

---

## 🤖 ChatGPT Integration

### Setting Up OpenAI API:

1. Get API key from: https://platform.openai.com/api-keys

2. Create `.env` file in Backend folder:
```env
OPENAI_API_KEY=your_api_key_here
```

3. Restart the backend server

### Using AI Chat:
- "Add 2 kg pasta at 3 euros"
- "aggiungi 500 grammi pomodori 2 euro e 50"
- AI will parse and add items automatically

---

## 🔍 Connection Status Indicators

### Web Interface:
- Console logs show connection status
- ChatGPT responses indicate backend availability

### Mobile App:
- Header shows: 🟢 "FastAPI Connected (Port 8000)" or 🔴 "Offline Mode"
- Pull to refresh to retry connection

---

## 🐛 Troubleshooting

### Backend Not Connecting:

1. **Check if backend is running:**
   ```powershell
   # Test health endpoint
   curl http://localhost:8000/health
   ```

2. **Check port availability:**
   ```powershell
   netstat -ano | findstr :8000
   ```

3. **Restart backend:**
   ```powershell
   # Kill existing process if needed
   taskkill /F /PID <process_id>
   
   # Restart
   uvicorn main:app --reload
   ```

### Mobile Connection Issues:

1. **Find your computer's IP:**
   ```powershell
   ipconfig
   # Look for "IPv4 Address" under your WiFi adapter
   ```

2. **Update IP in App.js:**
   - Open `frontend/mobile/src/App.js`
   - Line 28: Change `'192.168.1.100'` to your actual IP
   - Example: `'192.168.1.150'`

3. **Ensure same WiFi network:**
   - Computer and phone must be on same network
   - Some networks block device-to-device communication

### CORS Errors:

If you see CORS errors, the FastAPI backend already has CORS enabled for all origins.
Check that you're using the correct port (8000) in all API calls.

---

## 📊 Database

### Location:
`Backend/chefcode.db` (SQLite)

### Tables:
- `inventory_items` - Inventory data
- `recipes` - Recipe data with JSON ingredients
- `tasks` - Production tasks
- `sync_data` - Sync history

### Reset Database:
```powershell
cd C:\Users\Admin\Desktop\ChefCode_final\Backend
rm chefcode.db
# Will be recreated on next server start
```

---

## 🌐 Production Deployment

### Frontend:
- Deploy to Netlify, Vercel, or GitHub Pages
- Update `production` URL in config.js

### Backend:
- Deploy to Render, Railway, or Heroku
- Migrate from SQLite to PostgreSQL
- Update CORS origins to your frontend domain
- Set environment variables (OPENAI_API_KEY)

---

## 📝 Quick Commands Reference

```powershell
# Start Backend
cd Backend
uvicorn main:app --reload

# Start Mobile App
cd frontend/mobile
npx expo start

# Open Web Interface
cd frontend/mobile/assets
start index.html

# Check Backend Health
curl http://localhost:8000/health

# View API Docs
start http://localhost:8000/docs

# Reset Database
rm Backend/chefcode.db
```

---

## 🎉 You're All Set!

Your ChefCode application is now connected to the FastAPI backend on port 8000.

**Next Steps:**
1. Start the FastAPI backend
2. Open the frontend
3. Test the connection
4. Try adding items via AI chat!

Enjoy using ChefCode! 🍳
