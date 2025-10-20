# How to Start the Web App

## ✅ Fixed Issues:
- Export syntax error in utils.js
- Authentication for sync-data endpoint
- All API calls now include the API key

## 🚀 To Run:

### 1. Backend (Already Running!)
The backend is already running on http://localhost:8000

### 2. Web App
Simply open the HTML file in your browser:

**Option A: Double-click the file**
```
frontend/mobile/assets/index.html
```

**Option B: Use a local server (recommended)**
```bash
cd frontend/mobile/assets
python -m http.server 5500
```
Then open: http://localhost:5500/index.html

**Option C: Use Live Server extension in VS Code**
- Right-click on `index.html`
- Select "Open with Live Server"

## 🔑 API Key Configured
The web app is now configured with the API key:
- `PlXSE6GX_uGzsfQjpnkiXHWc7PNX-uZ6gGMWojabSfM`

All authenticated endpoints will work correctly.

## ✨ Features Available:
- ✅ ChatGPT AI integration
- ✅ Inventory management with backend sync
- ✅ Recipe creation and management
- ✅ Task creation and tracking
- ✅ Voice commands (in supported browsers)

## 🔧 Troubleshooting:
- If you see CORS errors, refresh the page
- Check console for successful authentication message
- Backend must be running on port 8000


