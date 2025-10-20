# 🍳 ChefCode - AI Restaurant Management System

<div align="center">

![ChefCode Logo](https://img.shields.io/badge/ChefCode-AI%20Restaurant%20Management-blue?style=for-the-badge&logo=robot)

**AI-Powered Restaurant Inventory & Recipe Management with Voice Recognition**

[![Deploy on Railway](https://img.shields.io/badge/🚂%20Deploy%20on-Railway-purple?style=for-the-badge)](https://railway.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)

</div>

---

## 🎯 **What is ChefCode?**

ChefCode is an intelligent restaurant management system that combines **AI-powered voice recognition** with **web recipe discovery** to streamline kitchen operations. Built for restaurant managers, chefs, and kitchen staff who want to optimize their workflow with cutting-edge technology.

### **🌟 Key Features**

- 🎤 **Voice-First Interface** - Hands-free operation with continuous conversation
- 🤖 **AI Assistant** - Natural language processing for inventory and recipe management
- 🌐 **Web Recipe Search** - Discover and import recipes from TheMealDB database
- 📦 **Smart Inventory** - Track ingredients with quantities, prices, and expiry dates
- 🍳 **Recipe Management** - Create, edit, and manage recipes with AI ingredient mapping
- 🎨 **Modern UI** - Clean, responsive interface optimized for kitchen environments

---

## 🚀 **Quick Start Guide**

### **1. Enable Microphone Access**
When you first open the app, allow microphone access for voice commands.

### **2. Try Your First Voice Command**
Click the **🎤 microphone button** in the footer and say:
> *"Add 5 kg of flour at 2 euros per kg"*

### **3. Explore Recipe Search**
Go to **Recipes** → **"Search Recipe from Web"** and search for:
> *"Italian pasta recipes"* or *"chicken soup"*

---

## 🤖 **AI Assistant Commands**

### **📦 Inventory Management**
```
🎤 "Add 5 kg of rice at 2.50 euros per kg"
🎤 "Update flour to 10 kg" 
🎤 "Remove tomatoes from inventory"
🎤 "How much rice do we have?"
🎤 "Show me all inventory items"
```

### **🍳 Recipe Management**
```
🎤 "Add recipe Pizza with flour 500 grams and tomato 200 ml"
🎤 "Search for Italian pasta recipes"
🎤 "Edit recipe Pizza by adding 2 grams of salt"
🎤 "Show me all dessert recipes"
🎤 "Delete the Pasta recipe"
```

### **🌐 Web Recipe Discovery**
```
🎤 "Find pasta recipes"
🎤 "Search for desserts"
🎤 "Look for Italian dishes"
🎤 "Find vegan recipes"
```

---

## 🎨 **User Interface**

### **Main Dashboard**
- **📊 Inventory Overview** - Real-time stock levels and values
- **🍳 Recipe Catalogue** - Browse and manage your recipes
- **📋 Task Management** - Production planning and tracking
- **🤖 AI Assistant** - Voice and text command interface

### **AI Assistant Features**
- **🎤 Voice Recognition** - Continuous conversation without restarting
- **💬 Text Input** - Type commands when voice isn't available
- **✅ Smart Confirmations** - AI asks for confirmation before making changes
- **🔄 Real-time Updates** - Instant data synchronization

### **Web Recipe Search**
- **🔍 Natural Language Search** - "Find quick Italian pasta without cheese"
- **🖼️ Visual Recipe Cards** - Browse recipes with images and descriptions
- **🎯 AI Ingredient Mapping** - Color-coded matching to your inventory:
  - ✅ **Green** - Exact match found
  - 🔄 **Yellow** - Suitable substitute available
  - ❌ **Red** - Missing from inventory
- **📥 One-Click Import** - Seamlessly add recipes to your collection

---

## 🔧 **Technical Architecture**

### **Backend (FastAPI)**
- **RESTful API** - Comprehensive endpoints for all operations
- **SQLite Database** - Persistent data storage with SQLAlchemy ORM
- **AI Integration** - OpenAI GPT-4o-mini and GPT-o3 for intelligent processing
- **External APIs** - TheMealDB integration for recipe discovery
- **Real-time Processing** - Async operations for optimal performance

### **Frontend (Modern Web)**
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Voice Recognition** - Web Speech API for hands-free operation
- **Real-time Updates** - Live data synchronization
- **Intuitive UI** - Clean, modern interface with ChefCode branding
- **Offline Support** - Local storage for basic operations

### **AI Models**
- **GPT-4o-mini** - Intent detection and natural language understanding
- **GPT-o3** - Advanced reasoning for ingredient mapping and complex tasks
- **Custom Prompts** - Optimized for restaurant management context
- **Fallback Systems** - Robust error handling and alternative processing

---

## 📊 **Database Schema**

### **Tables**
- **`inventory_items`** - Ingredient stock with quantities, prices, and expiry dates
- **`recipes`** - Recipe data with JSON ingredients and instructions
- **`tasks`** - Production tasks and status tracking
- **`sync_data`** - Data synchronization history

### **Data Persistence**
- **SQLite Database** - Local file-based storage
- **JSON Fields** - Flexible ingredient and recipe data
- **Automatic Backups** - Data integrity and recovery
- **Migration Support** - Schema updates and versioning

---

## 🎯 **Use Cases**

### **Restaurant Managers**
- **Inventory Oversight** - Real-time stock monitoring and cost tracking
- **Menu Planning** - Recipe discovery and cost analysis
- **Staff Training** - Intuitive interface for new employees
- **Multi-Location** - Centralized management across sites

### **Kitchen Staff**
- **Daily Operations** - Voice-controlled inventory updates
- **Recipe Execution** - Step-by-step cooking instructions
- **Stock Management** - Automatic quantity tracking
- **Cost Control** - Price monitoring and waste reduction

### **Chefs**
- **Recipe Creation** - AI-assisted ingredient suggestions
- **Menu Development** - Web recipe discovery and adaptation
- **Portion Control** - Yield management and scaling
- **Innovation** - Access to thousands of professional recipes

---

## 🚨 **Important Notes**

### **⚠️ Limitations**
- **Free Tier** - Railway provides $5 monthly credit (enough for 24/7 uptime)
- **AI Costs** - OpenAI API calls count against your quota
- **Database** - PostgreSQL database included with Railway deployment

### **💡 Deployment Options**
- **Railway (Recommended)** - One-click deploy, free tier, persistent PostgreSQL database
- **Local Development** - Run locally with SQLite for testing
- **Self-Hosted** - Deploy on your own infrastructure using Docker

### **📖 Deployment Guide**
See [DEPLOY_RAILWAY_NOW.md](DEPLOY_RAILWAY_NOW.md) for step-by-step deployment instructions.

---

## 🔑 **Environment Variables**

### **Required**
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### **Optional**
```env
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-domain.com
```

---

## 📈 **Performance**

### **Optimizations**
- **Lazy Loading** - Components load on demand
- **Caching** - AI responses cached for faster retrieval
- **Compression** - Static assets optimized for web delivery
- **Async Operations** - Non-blocking API calls

### **Scalability**
- **Horizontal Scaling** - Stateless backend design
- **Database Optimization** - Indexed queries and efficient schemas
- **CDN Ready** - Static assets optimized for content delivery
- **API Rate Limiting** - Protection against abuse

---

## 🎉 **Get Started Now!**

1. **Click the microphone button** 🎤
2. **Say your first command** - "Add 5 kg of flour at 2 euros per kg"
3. **Explore recipe search** - Find and import recipes from the web
4. **Manage your inventory** - Track ingredients and costs
5. **Enjoy AI-powered efficiency** - Streamline your restaurant operations

---

## 📞 **Support & Feedback**

- **Issues** - Report bugs and feature requests
- **Documentation** - Comprehensive guides and API references
- **Community** - Join discussions and share experiences
- **Updates** - Regular improvements and new features

---

<div align="center">

**🍳 Transform your restaurant operations with AI-powered intelligence! 🚀**

[![Star this repo](https://img.shields.io/github/stars/your-repo?style=social)](https://github.com/your-repo)
[![Follow on Twitter](https://img.shields.io/twitter/follow/your-handle?style=social)](https://twitter.com/your-handle)

</div>
