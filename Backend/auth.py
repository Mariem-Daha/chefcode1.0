from fastapi import Header, HTTPException, status
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Simple API key authentication
# In production, use a more robust authentication system (JWT, OAuth2, etc.)
API_KEY = os.getenv("API_KEY")

# Ensure API key is configured
# For cloud deployment, generate a default key if not provided (for quick deployment)
if not API_KEY:
    import secrets
    import warnings
    # Generate a secure random key for this session
    API_KEY = secrets.token_urlsafe(32)
    warnings.warn(
        "⚠️ API_KEY environment variable is not set. "
        "A temporary key has been generated for this session. "
        "For production, please set API_KEY in your cloud environment variables.",
        RuntimeWarning
    )
    print(f"⚠️ Generated temporary API_KEY: {API_KEY}")
    print("⚠️ Add this to your cloud environment: API_KEY=<your-secure-key>")

async def verify_api_key(x_api_key: Optional[str] = Header(None, description="API Key for authentication")):
    """
    Dependency to verify API key authentication.
    Clients must include X-API-Key header with valid API key.
    """
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key is required. Include X-API-Key header.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    
    return x_api_key

