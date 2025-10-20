# Frontend Setup & Security Configuration

## 🔐 Security Updates Required

The backend has been updated with authentication and security fixes. The frontend needs to be updated to work with these changes.

## Required Changes

### 1. **Add API Key to Requests**

All write operations (POST, PUT, DELETE) now require an `X-API-Key` header.

**The API client has been updated** (`shared/api.js`):

The ChefCodeAPI class now requires you to set the API key before making requests:

```javascript
// Initialize the API client
const api = new ChefCodeAPI('http://192.168.1.100:8000');

// Set the API key (MUST be done before making authenticated requests)
api.setApiKey('your-api-key-from-backend');

// Now you can make requests
await api.addInventoryItem({ name: 'Test', unit: 'kg', quantity: 5 });
```

**Important:** The API key is no longer hardcoded for security. You must:
1. Generate a secure API key on the backend
2. Securely provide it to your frontend
3. Call `setApiKey()` before making any authenticated requests

### 2. **Update All API Calls**

Replace direct `fetch()` calls with the authenticated `apiRequest()` function:

**Before:**
```javascript
fetch(`${API_URL}/api/inventory`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

**After:**
```javascript
apiRequest(`${API_URL}/api/inventory`, {
  method: 'POST',
  body: JSON.stringify(data)
})
```

### 3. **HTTPS Configuration (Production)**

⚠️ **Important:** The app currently uses HTTP which is insecure.

**For Production:**

1. **Update Backend URL** in `shared/config.js`:
   ```javascript
   // Change from:
   const API_URL = 'http://192.168.1.100:8000';
   
   // To:
   const API_URL = 'https://your-domain.com';
   ```

2. **Deploy backend with HTTPS:**
   - Use reverse proxy (nginx/Apache)
   - Or configure Uvicorn with SSL certificates
   - Or use a service like Heroku, Railway, or AWS

3. **Update CORS settings** in backend `.env`:
   ```env
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

### 4. **Secure API Key Storage**

**For React Native:**
```javascript
// Install: npm install @react-native-async-storage/async-storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store API key securely
await AsyncStorage.setItem('api_key', 'your-key');

// Retrieve when needed
const API_KEY = await AsyncStorage.getItem('api_key');
```

**For Web:**
```javascript
// Option 1: Environment variable (recommended for build time)
const API_KEY = process.env.REACT_APP_API_KEY;

// Option 2: Secure storage (for runtime)
// Use libraries like secure-ls or encrypt-storage
```

**For React Native (with react-native-dotenv):**
```javascript
// .env file
API_KEY=your-secret-key

// In your code
import { API_KEY } from '@env';
```

### 5. **Handle Authentication Errors**

Add error handling for authentication failures:

```javascript
try {
  const response = await apiRequest(url, options);
  const data = await response.json();
  return data;
} catch (error) {
  if (error.message.includes('Authentication failed')) {
    // Show login screen or API key input
    Alert.alert('Authentication Error', 'Please configure your API key');
  } else {
    Alert.alert('Error', error.message);
  }
}
```

## Example: Updated API Client

Create a new file `shared/apiClient.js`:

```javascript
const API_URL = 'http://192.168.1.100:8000'; // Change to HTTPS in production
const API_KEY = 'your-secret-api-key-change-this'; // Load from secure storage

class APIClient {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      throw new Error('Invalid API Key');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Inventory methods
  async getInventory() {
    return this.request('/api/inventory');
  }

  async addInventoryItem(item) {
    return this.request('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  async updateInventoryItem(id, item) {
    return this.request(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  }

  async deleteInventoryItem(id) {
    return this.request(`/api/inventory/${id}`, {
      method: 'DELETE'
    });
  }

  // Recipe methods
  async getRecipes(skip = 0, limit = 100) {
    return this.request(`/api/recipes?skip=${skip}&limit=${limit}`);
  }

  async createRecipe(recipe) {
    return this.request('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe)
    });
  }

  // Task methods
  async getTasks() {
    return this.request('/api/tasks');
  }

  async createTask(task) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  }

  // Action methods
  async performAction(action, data) {
    return this.request('/api/action', {
      method: 'POST',
      body: JSON.stringify({ action, data })
    });
  }

  async syncData(inventory, recipes, tasks) {
    return this.request('/api/sync-data', {
      method: 'POST',
      body: JSON.stringify({ inventory, recipes, tasks })
    });
  }
}

export default new APIClient();
```

## Testing the Updates

1. **Generate a secure API Key** on the backend:
   ```bash
   cd Backend
   python generate_api_key.py
   ```
   
   Or manually create one:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Add the key to Backend/.env**:
   ```env
   API_KEY=your-generated-secure-key-here
   ```

3. **Update frontend** to use the same key:
   ```javascript
   const api = new ChefCodeAPI('http://192.168.1.100:8000');
   api.setApiKey('your-generated-secure-key-here');
   ```

4. **Test API calls:**
   ```bash
   # Should work:
   curl -H "X-API-Key: test-key-123" -X POST http://localhost:8000/api/inventory \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Item","unit":"kg","quantity":5,"category":"Other","price":10}'

   # Should fail (401):
   curl -X POST http://localhost:8000/api/inventory \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Item"}'
   ```

## Migration Checklist

- [ ] Create `.env` file in backend with `API_KEY`
- [ ] Update all API calls to include `X-API-Key` header
- [ ] Implement error handling for 401 responses
- [ ] Store API key securely (not hardcoded)
- [ ] Test all CRUD operations
- [ ] Plan HTTPS deployment for production
- [ ] Update CORS origins when deploying
- [ ] Document API key distribution for team members

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use HTTPS** in production
3. **Rotate API keys** periodically
4. **Limit CORS origins** to known domains
5. **Implement rate limiting** (consider adding to backend)
6. **Use environment-specific keys** (dev, staging, prod)

## Support

If you encounter issues:
1. Check browser/app console for errors
2. Verify API key matches between frontend and backend
3. Check CORS settings allow your frontend origin
4. Ensure all requests include the `X-API-Key` header

