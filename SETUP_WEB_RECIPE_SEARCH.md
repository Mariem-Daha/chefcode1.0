# Quick Setup Guide - Web Recipe Search Feature

## ⚡ Quick Start (5 minutes)

### 1. Install Python Dependencies

```bash
cd Backend
pip install httpx openai
```

Or install all dependencies:
```bash
pip install -r requirements.txt
```

### 2. Set OpenAI API Key

Create `Backend/.env` file:
```env
OPENAI_API_KEY=sk-your-key-here
```

Get your key from: https://platform.openai.com/api-keys

### 3. Run Database Migration

```bash
cd Backend
python migrate_add_web_recipe_fields.py
```

Expected output:
```
✅ Migration completed successfully! Added 5 column(s).
```

### 4. Start Backend

```bash
python main.py
```

Server runs on: http://localhost:8000

### 5. Test the Feature

1. Open `frontend/mobile/assets/index.html` in your browser
2. Click **RECIPES**
3. Click **SEARCH RECIPE FROM WEB** 🌐
4. Search for "pasta" or "chicken"
5. Click a recipe card to view details
6. Click **Import Recipe**
7. Review AI ingredient mapping
8. Click **Save Recipe**

---

## 🎯 What Gets Created

### Backend Files
- ✅ `Backend/services/ai_service.py` - OpenAI integration
- ✅ `Backend/services/mealdb_service.py` - Recipe API
- ✅ `Backend/routes/web_recipes.py` - 4 new endpoints
- ✅ `Backend/models.py` - Updated Recipe model
- ✅ `Backend/requirements.txt` - Added httpx

### Frontend Files
- ✅ `frontend/mobile/assets/web-recipe-search.js` - Feature logic
- ✅ `frontend/mobile/assets/style.css` - Modal styling (appended)
- ✅ `frontend/mobile/assets/index.html` - Button + modal UI

### Documentation
- ✅ `WEB_RECIPE_SEARCH_GUIDE.md` - Complete guide
- ✅ `SETUP_WEB_RECIPE_SEARCH.md` - This file
- ✅ `Backend/migrate_add_web_recipe_fields.py` - Migration script

---

## 🔧 API Endpoints

All endpoints are prefixed with `/api/web-recipes/`:

1. **POST** `/interpret_query` - Parse natural language
2. **POST** `/search_recipes` - Search TheMealDB
3. **POST** `/map_ingredients` - AI ingredient mapping
4. **POST** `/save_recipe` - Save to database

Test endpoint:
```bash
curl http://localhost:8000/api/web-recipes/test
```

---

## ✅ Verification Checklist

- [ ] `httpx` package installed
- [ ] `OPENAI_API_KEY` set in `.env`
- [ ] Database migration completed
- [ ] Backend running on port 8000
- [ ] Can access: http://localhost:8000/api/web-recipes/test
- [ ] Frontend loads without errors
- [ ] "Search Recipe from Web" button appears
- [ ] Modal opens when button clicked

---

## 🐛 Common Issues

### "Module 'httpx' not found"
```bash
pip install httpx
```

### "OPENAI_API_KEY environment variable not set"
Create `Backend/.env` and add your key.

### "Database has no column named source_url"
Run the migration script:
```bash
python migrate_add_web_recipe_fields.py
```

### "Failed to search recipes"
1. Check backend is running
2. Check internet connection (needs TheMealDB API)
3. Check browser console for errors

### "Failed to map ingredients"
1. Verify OpenAI API key is valid
2. Check you have API credits
3. Update model name in `ai_service.py` if o3-mini is not available:
   ```python
   self.gpt_o3_model = "gpt-4"  # Use gpt-4 instead
   ```

---

## 🎨 Feature Highlights

- 🔍 **Smart Search**: Natural language processing
- 🤖 **AI Matching**: GPT-powered ingredient mapping
- 🎨 **Color Coding**: Green/Yellow/Red for match types
- 📱 **Responsive**: Works on all screen sizes
- ⚡ **Fast**: Results in seconds
- 🔒 **Secure**: API keys in environment variables

---

## 📚 Full Documentation

See `WEB_RECIPE_SEARCH_GUIDE.md` for:
- Complete architecture overview
- Detailed API documentation
- Request/response examples
- Design philosophy
- Advanced configuration

---

## 🚀 Next Steps

After setup:
1. Try searching different cuisines
2. Import a few recipes
3. Check Recipe Catalogue
4. Test ingredient matching with your inventory
5. Explore AI substitution suggestions

---

**That's it! You're ready to search recipes from the web! 🎉**


