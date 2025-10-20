# ⚠️ Frontend Security Configuration

## Critical Security Issue: API Key in Frontend

### Current Status (Development Only)
The frontend currently stores the API key in `mobile/assets/config.js`. **This is NOT secure for production** because:

- ✅ Anyone can view browser source code and extract the API key
- ✅ The key grants full access to backend APIs
- ✅ Could lead to unauthorized usage and costs

### For Production Deployment

**Option 1: Session-Based Authentication (Recommended)**
```javascript
// User logs in → Backend creates session
// Frontend stores session cookie
// No API keys in frontend code
```

**Option 2: Backend Proxy**
```javascript
// Frontend → Your Backend Proxy → FastAPI
// API key stored only on your server
// Frontend never sees the key
```

**Option 3: Public Rate-Limited Keys**
```javascript
// Create separate "public" API key
// Heavily rate-limited per IP
// Limited permissions
```

### Current Setup (Local Development)

1. `config.js` contains API_KEY
2. **DO NOT commit `config.js` to git**
3. Each developer creates their own:

```bash
# Copy template
cp mobile/assets/config.template.js mobile/assets/config.js

# Edit config.js with your API key
# This file is gitignored
```

### Mobile App (React Native)

For the mobile app (`App.js`):
```javascript
// Use environment variables or secure storage
import { API_KEY } from '@env'; // react-native-dotenv
// OR
import * as SecureStore from 'expo-secure-store';
```

## Action Items

- [ ] Implement proper authentication system
- [ ] Remove API keys from frontend completely
- [ ] Use session/JWT tokens
- [ ] Add rate limiting
- [ ] Monitor API usage


