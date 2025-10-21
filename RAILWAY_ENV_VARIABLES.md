# 🔐 Railway Environment Variables Setup

## Required Environment Variables

Copy and paste these into your Railway project's Variables tab:

### Minimal Setup (Required)
```
ENVIRONMENT=production
ALLOWED_ORIGINS=*
API_KEY=your-secure-random-key-here
```

**Generate a secure API_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### With AI Features (Recommended)
```
ENVIRONMENT=production
ALLOWED_ORIGINS=*
API_KEY=your-secure-random-key-here
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Full Setup (All Features)
```
ENVIRONMENT=production
ALLOWED_ORIGINS=*
OPENAI_API_KEY=sk-your-openai-api-key-here
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us
GOOGLE_DOCUMENTAI_PROCESSOR_ID=your-processor-id
```

## 📝 Variable Descriptions

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `API_KEY` | ✅ Yes | Backend authentication key | `random-secure-string` |
| `ENVIRONMENT` | ✅ Yes | Deployment environment | `production` |
| `ALLOWED_ORIGINS` | ✅ Yes | CORS allowed origins | `*` or `https://yourapp.com` |
| `PORT` | ⚠️ Auto | Railway sets this automatically | `8000` (default) |
| `OPENAI_API_KEY` | ⭐ AI Features | OpenAI API key for AI assistant | `sk-...` |
| `DATABASE_URL` | 🔄 Optional | PostgreSQL connection (auto if added) | `postgresql://...` |
| `GOOGLE_CLOUD_PROJECT` | 🔄 Optional | Google Cloud project for OCR | `my-project-123` |
| `GOOGLE_CLOUD_LOCATION` | 🔄 Optional | Google Cloud region | `us` |
| `GOOGLE_DOCUMENTAI_PROCESSOR_ID` | 🔄 Optional | Document AI processor ID | `abc123...` |

## 🚀 How to Set Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Click "Variables" tab
4. Click "New Variable"
5. Add each variable name and value
6. Click "Deploy" to apply changes

## 🔒 Security Notes

- ✅ Railway encrypts all environment variables
- ✅ Never commit `.env` files to git
- ✅ Use `ALLOWED_ORIGINS=*` only for testing
- ✅ For production, set specific domains: `https://your-frontend.com`

## 📱 CORS Configuration Examples

### Development (Allow All):
```
ALLOWED_ORIGINS=*
```

### Production (Specific Domains):
```
ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

### Multiple Environments:
```
ALLOWED_ORIGINS=https://app.com,https://staging.app.com,https://localhost:3000
```

## 🎯 Quick Copy-Paste

**Step 1: Generate API Key (run locally)**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Step 2: For testing without AI:**
```
ENVIRONMENT=production
ALLOWED_ORIGINS=*
API_KEY=<paste-generated-key-here>
```

**Step 3: For production with AI:**
```
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourapp.com
API_KEY=<paste-generated-key-here>
OPENAI_API_KEY=your-actual-key-here
```

## ⚠️ IMPORTANT: API_KEY is Required!

The backend will auto-generate a temporary API_KEY if not provided, but this is **NOT recommended for production**. Always set a secure API_KEY in Railway environment variables.

