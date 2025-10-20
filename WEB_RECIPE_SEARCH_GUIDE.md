# 🌐 Web Recipe Search Feature - Complete Guide

## Overview

The **Web Recipe Search** feature allows users to search for recipes from the web (TheMealDB), view details, and intelligently import them into ChefCode with AI-powered ingredient mapping to existing inventory.

---

## 🎯 Features

### 1. **Natural Language Search**
- Search using everyday language: *"quick Italian pasta without cheese"*
- AI interprets your intent using GPT-4o-mini

### 2. **Recipe Discovery**
- Browse recipes from TheMealDB with images, descriptions, and instructions
- Filter by cuisine type (Italian, Chinese, Mexican, etc.)
- View detailed ingredient lists and cooking instructions

### 3. **AI Ingredient Mapping**
- GPT-o3 reasoning semantically matches recipe ingredients to your inventory
- **Color-coded results:**
  - ✅ **Green**: Exact match found in inventory
  - 🔄 **Yellow**: Substitute suggested
  - ❌ **Red**: Missing from inventory

### 4. **One-Click Import**
- Import recipes directly into your catalogue
- Preserves original recipe data + AI mappings
- Auto-links to inventory items

---

## 🏗️ Architecture

### Backend Components

#### **1. Database Model** (`Backend/models.py`)
Updated `Recipe` model with new fields:
- `source_url` - Original recipe URL
- `image_url` - Recipe thumbnail
- `cuisine` - Cuisine type (Italian, Chinese, etc.)
- `ingredients_raw` - Original web ingredients (JSON)
- `ingredients_mapped` - AI-mapped ingredients (JSON)

#### **2. AI Service** (`Backend/services/ai_service.py`)
- **`interpret_query()`** - Uses GPT-4o-mini to parse natural language
- **`map_ingredients()`** - Uses GPT-o3 for semantic ingredient matching

#### **3. MealDB Service** (`Backend/services/mealdb_service.py`)
- **`search_by_name()`** - Search TheMealDB by recipe name
- **`get_recipe_by_id()`** - Fetch full recipe details

#### **4. API Routes** (`Backend/routes/web_recipes.py`)

**Endpoints:**

##### `POST /api/web-recipes/interpret_query`
Interprets natural language search query.

**Request:**
```json
{
  "query": "quick Italian pasta without cheese"
}
```

**Response:**
```json
{
  "keywords": ["pasta"],
  "cuisine": "Italian",
  "restrictions": ["no cheese"],
  "max_time": 30
}
```

##### `POST /api/web-recipes/search_recipes`
Searches recipes using TheMealDB.

**Request:**
```json
{
  "query": "pasta",
  "cuisine": "Italian",
  "restrictions": []
}
```

**Response:**
```json
[
  {
    "id": "52772",
    "name": "Teriyaki Chicken Casserole",
    "image": "https://www.themealdb.com/images/...",
    "category": "Chicken",
    "area": "Japanese",
    "instructions": "Preheat oven to 350°...",
    "ingredients": [
      {"name": "soy sauce", "measure": "3/4 cup"},
      {"name": "water", "measure": "1/2 cup"}
    ],
    "source_url": "https://..."
  }
]
```

##### `POST /api/web-recipes/map_ingredients`
Maps recipe ingredients to inventory using AI.

**Request:**
```json
{
  "recipe_id": "52772",
  "recipe_ingredients": [
    {"name": "soy sauce", "quantity": "3/4", "unit": "cup"},
    {"name": "chicken breast", "quantity": "500", "unit": "g"}
  ]
}
```

**Response:**
```json
{
  "recipe_id": "52772",
  "mappings": [
    {
      "recipe_ingredient": "soy sauce",
      "recipe_quantity": "3/4",
      "recipe_unit": "cup",
      "mapped_to": "Soy Sauce",
      "match_confidence": 1.0,
      "match_type": "exact",
      "note": "Perfect match found in inventory"
    },
    {
      "recipe_ingredient": "chicken breast",
      "recipe_quantity": "500",
      "recipe_unit": "g",
      "mapped_to": null,
      "match_confidence": 0.0,
      "match_type": "missing",
      "note": "Not available in inventory"
    }
  ]
}
```

##### `POST /api/web-recipes/save_recipe`
Saves imported recipe to database.

**Request:**
```json
{
  "recipe_id": "52772",
  "name": "Teriyaki Chicken Casserole",
  "instructions": "Preheat oven...",
  "cuisine": "Japanese",
  "image_url": "https://...",
  "source_url": "https://...",
  "ingredients_raw": [...],
  "ingredients_mapped": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recipe 'Teriyaki Chicken Casserole' saved successfully",
  "recipe_id": 42,
  "name": "Teriyaki Chicken Casserole",
  "items_count": 5
}
```

---

### Frontend Components

#### **1. HTML** (`frontend/mobile/assets/index.html`)
- **Button**: "Search Recipe from Web" in Recipe Management
- **Modal**: Multi-screen interface for search, detail, mapping, and success

#### **2. CSS** (`frontend/mobile/assets/style.css`)
- Modern gradient design with purple theme
- Responsive layout for mobile and desktop
- Color-coded ingredient mapping badges
- Smooth animations and transitions

#### **3. JavaScript** (`frontend/mobile/assets/web-recipe-search.js`)
- Modal state management
- API integration with error handling
- Dynamic UI updates
- Search, detail, and mapping workflows

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

New dependency added: `httpx>=0.25.0`

### Step 2: Set Environment Variables

Create or update `Backend/.env`:

```env
OPENAI_API_KEY=your-openai-api-key-here
```

**Important:** You need an OpenAI API key with access to:
- GPT-4o-mini (for query interpretation)
- o3-mini or o3 (for ingredient mapping)

### Step 3: Run Database Migration

```bash
cd Backend
python migrate_add_web_recipe_fields.py
```

This adds the new columns to the `recipes` table.

### Step 4: Start the Backend

```bash
cd Backend
python main.py
```

Server will run on `http://localhost:8000`

### Step 5: Open the Frontend

Open `frontend/mobile/assets/index.html` in your browser, or follow your existing frontend setup.

---

## 📖 User Guide

### How to Use

1. **Navigate to Recipe Management**
   - Click "RECIPES" from the main dashboard
   - You'll see three options: Add Recipe, Search Recipe from Web, Recipe Catalogue

2. **Click "Search Recipe from Web"**
   - A modal will open with a search bar

3. **Enter Your Search**
   - Use natural language: *"vegetarian pasta", "spicy chicken curry", "quick dessert"*
   - Press Enter or click Search

4. **Browse Results**
   - Recipes display as cards with images, category, and cuisine
   - Click any card to view full details

5. **View Recipe Details**
   - See ingredients list, instructions, and metadata
   - Click "Import Recipe" to proceed

6. **Review AI Ingredient Mapping**
   - AI analyzes each ingredient against your inventory
   - **Green items**: Already in stock
   - **Yellow items**: Suggested substitutes
   - **Red items**: Need to purchase
   - Each mapping includes an explanation note

7. **Save Recipe**
   - Review the mappings
   - Click "Save Recipe" to add to your catalogue
   - Recipe is now available in your Recipe Catalogue

---

## 🎨 Design Philosophy

- **Modern & Minimal**: Clean purple gradient theme
- **User-Friendly**: Large buttons, clear labels, intuitive flow
- **Responsive**: Works on desktop, tablet, and mobile
- **Informative**: Color-coded badges, helpful notes, loading states
- **Error-Resilient**: Graceful fallbacks, user-friendly error messages

---

## 🔒 Security Considerations

1. **API Key Protection**
   - Never commit `.env` file
   - Use environment variables for sensitive data

2. **Input Validation**
   - Backend validates all user inputs
   - Pydantic models enforce data types

3. **Error Handling**
   - Try-catch blocks on all API calls
   - User-friendly error messages (no technical details exposed)

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Search for "pasta" - should return Italian dishes
- [ ] Click a recipe card - detail screen should show
- [ ] Click "Import Recipe" - mapping screen should show with AI analysis
- [ ] Verify color coding: green (exact), yellow (substitute), red (missing)
- [ ] Click "Save Recipe" - success screen should appear
- [ ] Check Recipe Catalogue - new recipe should be listed

### Test Search Queries

- "quick Italian pasta"
- "chicken curry"
- "vegetarian soup"
- "chocolate dessert"
- "seafood"

---

## 📊 Example JSON Structures

### Stored Recipe in Database

```json
{
  "id": 42,
  "name": "Teriyaki Chicken Casserole",
  "items": "[{\"name\":\"Soy Sauce\",\"qty\":180,\"unit\":\"ml\"}]",
  "instructions": "Preheat oven to 350°...",
  "source_url": "https://www.themealdb.com/meal/52772",
  "image_url": "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
  "cuisine": "Japanese",
  "ingredients_raw": "[{\"name\":\"soy sauce\",\"measure\":\"3/4 cup\"}]",
  "ingredients_mapped": "[{\"recipe_ingredient\":\"soy sauce\",\"mapped_to\":\"Soy Sauce\",\"match_confidence\":1.0,\"match_type\":\"exact\"}]"
}
```

---

## 🐛 Troubleshooting

### Issue: "Failed to search recipes"
**Solution:** Check that the backend is running on port 8000 and TheMealDB API is accessible.

### Issue: "Failed to map ingredients"
**Solution:** 
1. Verify `OPENAI_API_KEY` is set correctly
2. Check if you have access to o3-mini model
3. If not, update `ai_service.py` to use `gpt-4` or another model

### Issue: "Recipe already exists"
**Solution:** Recipe names must be unique. Rename the recipe or delete the existing one first.

### Issue: Modal doesn't open
**Solution:** Check browser console for JavaScript errors. Ensure `web-recipe-search.js` is loaded.

---

## 🔮 Future Enhancements

Potential improvements:
- Add recipe rating system
- Support for custom recipe sources
- Batch import multiple recipes
- Recipe modification before saving
- Shopping list generation from missing ingredients
- Nutritional information display
- Recipe difficulty level
- Estimated cooking time

---

## 📝 License & Attribution

- **TheMealDB**: Free recipe API (https://www.themealdb.com/)
- **OpenAI**: GPT models for AI-powered features
- **ChefCode**: Built by the ChefCode team

---

## 🤝 Support

For issues or questions:
1. Check this guide thoroughly
2. Review browser console for errors
3. Check backend logs
4. Verify environment variables are set

---

**Happy cooking! 🍳👨‍🍳**


