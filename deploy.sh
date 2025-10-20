#!/bin/bash

# ChefCode Quick Deployment Script
# This script prepares your app for deployment

echo "🍳 ChefCode Deployment Preparation"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
Backend/venv/
*.egg-info/
dist/
build/

# Database
*.db
*.sqlite
*.sqlite3
Backend/chefcode.db

# Environment
.env
.env.local
Backend/.env

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Node
node_modules/
frontend/mobile/node_modules/

# Android
frontend/mobile/android/build/
frontend/mobile/android/app/build/
*.apk

# Logs
*.log
logs/

# Secrets
google-service-account.json
Backend/google-service-account.json
EOF
    echo "✅ .gitignore created"
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Show status
echo ""
echo "📊 Git Status:"
git status --short

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Commit changes:"
echo "   git commit -m 'Ready for deployment'"
echo ""
echo "2. Create GitHub repository at https://github.com/new"
echo ""
echo "3. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/chefcode.git"
echo "   git push -u origin main"
echo ""
echo "4. Deploy on Render:"
echo "   - Go to https://render.com"
echo "   - Click 'New' → 'Blueprint'"
echo "   - Connect your GitHub repo"
echo "   - Add OPENAI_API_KEY in environment variables"
echo ""
echo "📖 See DEPLOY_NOW.md for detailed instructions"
echo ""
