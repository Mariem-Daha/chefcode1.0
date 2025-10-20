# Production Deployment Notes

## ⚠️ Security Considerations

### Current API Key Setup (Development Only)

The API key is currently **hardcoded in the mobile app** (`frontend/mobile/src/App.js`) for ease of development. This means:

- ✅ The app works out of the box for development
- ❌ Anyone who downloads the app can extract the API key
- ❌ This defeats the purpose of API authentication

### For Production Deployment

**Option 1: Secure Storage (Recommended for Mobile)**
```javascript
import * as SecureStore from 'expo-secure-store';

// On first run or login, save the key securely
await SecureStore.setItemAsync('api_key', userApiKey);

// Load the key when needed
const apiKey = await SecureStore.getItemAsync('api_key');
api.setApiKey(apiKey);
```

**Option 2: Environment Variables (Build-time)**
```javascript
// .env file (not committed)
API_KEY=your-production-key

// In code
import Constants from 'expo-constants';
api.setApiKey(Constants.expoConfig.extra.apiKey);
```

**Option 3: User Authentication**
Instead of a shared API key, implement per-user authentication:
- Users log in with credentials
- Backend issues JWT tokens
- Frontend includes token in requests
- Backend validates token per-request

## Current Security Status

### ✅ Implemented
- API key authentication on backend
- CORS restrictions
- Input validation
- Secure error handling
- Performance optimizations

### ⚠️ Development Mode
- API key is visible in mobile app source code
- Using HTTP instead of HTTPS
- Single shared API key for all users

### 🚀 For Production
1. **Enable HTTPS** - Encrypt all traffic
2. **Implement user authentication** - JWT/OAuth2
3. **Use secure key storage** - Expo SecureStore / native keychains
4. **Add rate limiting** - Prevent abuse
5. **Implement logging & monitoring** - Track usage and issues
6. **Separate API keys** - Different keys for dev/staging/prod
7. **Consider API key rotation** - Change keys periodically

## Quick Production Checklist

### Backend
- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Use strong, unique `API_KEY`
- [ ] Configure `ALLOWED_ORIGINS` with actual domains
- [ ] Enable HTTPS (reverse proxy or Uvicorn with SSL)
- [ ] Run with multiple workers: `uvicorn main:app --workers 4`
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting

### Frontend
- [ ] Remove hardcoded API key from source
- [ ] Implement secure key storage
- [ ] Update API URL to HTTPS
- [ ] Add error handling for authentication failures
- [ ] Test on real devices
- [ ] Obfuscate code (optional)

### Infrastructure
- [ ] Set up CI/CD pipeline
- [ ] Configure production database
- [ ] Set up backups
- [ ] Implement SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up domain and DNS

## Current Setup Works For

✅ **Local development**
✅ **Testing on local network**
✅ **Proof of concept / MVP**
✅ **Internal use within trusted network**

❌ **NOT suitable for:**
- Public production deployment
- App store distribution
- Handling sensitive data
- Multi-user environments
- Internet-facing applications

## Immediate Next Steps

1. **Test the current setup** - Verify everything works in development
2. **Plan authentication strategy** - Choose user auth or secure key storage
3. **Set up production environment** - Separate from development
4. **Implement security measures** - Based on your deployment needs
5. **Test thoroughly** - Before public release


