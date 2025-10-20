# ChefCode AI Assistant - Technical Implementation Guide

## 🏗️ Architecture Overview

The AI Assistant system consists of three layers:

1. **Frontend (JavaScript)** - User interface and interaction
2. **Backend API (FastAPI)** - Request routing and orchestration  
3. **AI Services (OpenAI)** - Intent detection and reasoning

```
User Input (Voice/Text)
    ↓
Frontend (ai-assistant.js)
    ↓
Backend API (/api/ai-assistant/command)
    ↓
AI Service (GPT-4o-mini) → Intent Detection
    ↓
Route Handler → Database Operations
    ↓
Response → Frontend → User
```

---

## 📂 File Structure

### Backend
```
Backend/
├── services/
│   ├── ai_assistant_service.py      # Intent detection & NLU
│   ├── ai_service.py                 # Ingredient mapping (GPT-o3)
│   └── mealdb_service.py             # Recipe search API
├── routes/
│   └── ai_assistant.py               # API endpoints
└── main.py                           # Route registration
```

### Frontend
```
frontend/mobile/assets/
├── ai-assistant.js                   # Chat UI & logic
├── style.css                         # AI assistant styles
└── index.html                        # Script inclusion
```

---

## 🔌 API Endpoints

### 1. Process Command
**POST** `/api/ai-assistant/command`

Detects intent and either executes action or requests confirmation.

**Request:**
```json
{
  "command": "Add 5 kg of rice",
  "context": {
    "last_intent": "query_inventory",
    "last_result": {}
  }
}
```

**Response:**
```json
{
  "intent": "add_inventory",
  "confidence": 0.95,
  "message": "Ready to add 5 kg of rice. Confirm?",
  "requires_confirmation": true,
  "confirmation_data": {
    "intent": "add_inventory",
    "item_name": "rice",
    "quantity": 5,
    "unit": "kg"
  }
}
```

### 2. Confirm Action
**POST** `/api/ai-assistant/confirm`

Executes a confirmed action.

**Request:**
```json
{
  "confirmation_id": "1234567890",
  "confirmed": true,
  "data": {
    "intent": "add_inventory",
    "item_name": "rice",
    "quantity": 5,
    "unit": "kg"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Added 5 kg of rice"
}
```

---

## 🧠 Intent Detection

### Supported Intents

| Intent | Description | Example |
|--------|-------------|---------|
| `add_inventory` | Add items to inventory | "Add 5 kg of rice" |
| `update_inventory` | Update quantities | "Update flour to 10 kg" |
| `delete_inventory` | Remove items | "Delete tomatoes" |
| `query_inventory` | Check stock | "How much rice?" |
| `add_recipe` | Create recipe | "Add recipe Pizza with..." |
| `edit_recipe` | Modify recipe | "Edit recipe Pizza" |
| `delete_recipe` | Remove recipe | "Delete recipe Pasta" |
| `search_recipe_web` | Search online | "Search pasta recipes" |
| `show_recipe` | Display recipe | "Show Pizza recipe" |
| `import_recipe` | Import from search | "Import the second one" |
| `show_catalogue` | Show all recipes | "Show all recipes" |
| `filter_catalogue` | Filter recipes | "Show desserts" |

### Intent Detection Prompt

The AI uses a structured prompt with few-shot examples:

```python
system_prompt = """You are ChefCode's intelligent assistant.

SUPPORTED INTENTS:
- add_inventory: "Add 5 kg of rice"
  Entities: {"item_name": "rice", "quantity": 5, "unit": "kg"}
  
- add_recipe: "Add recipe Pizza with flour 100 kg"
  Entities: {"recipe_name": "Pizza", "raw_text": "..."}
...

Return JSON:
{
  "intent": "add_inventory",
  "confidence": 0.95,
  "entities": {...},
  "requires_confirmation": true,
  "response_message": "Ready to add 5 kg of rice. Confirm?"
}
"""
```

---

## 🎨 Frontend Components

### 1. Chat Overlay (`ai-chat-overlay`)
- Slides in from right
- Fixed width 420px (100% on mobile)
- Shows conversation history
- Auto-scrolls to latest message

### 2. Confirmation Dialog (`ai-confirmation-dialog`)
- Modal overlay with backdrop blur
- Center-aligned
- Two buttons: Confirm / Cancel
- Auto-closes on action

### 3. Search Results Overlay (`ai-search-results-overlay`)
- Full-screen modal
- Grid of recipe cards
- Import button on each card
- Close button top-right

### 4. Toast Notifications (`ai-toast`)
- Fixed bottom-center
- Auto-dismiss after 3s
- Color-coded (green=success, red=error)

---

## 🔄 Conversation Flow

### Example: Add Recipe

```
1. User: "Add recipe Pizza with flour 100 kg and tomato 200 ml"
   ↓
2. Frontend: Send to /api/ai-assistant/command
   ↓
3. Backend: Detect intent → add_recipe
   ↓
4. AI Service: Parse recipe structure
   ↓
5. Backend: Return confirmation request
   ↓
6. Frontend: Show confirmation dialog
   ↓
7. User: Click "Confirm"
   ↓
8. Frontend: Send to /api/ai-assistant/confirm
   ↓
9. Backend: Execute recipe creation
   ↓
10. Frontend: Show success toast + chat message
```

---

## 🧩 Service Layer

### AIAssistantService

**Purpose:** Intent detection and NLU

**Methods:**
- `detect_intent(user_input, context)` → IntentResult
- `parse_recipe_from_text(user_input)` → Dict
- `generate_response(intent, action_result)` → str

**Model:** GPT-4o-mini
- Temperature: 0.3 (deterministic)
- Max tokens: 1000
- Returns structured JSON

### AIService

**Purpose:** Ingredient mapping

**Methods:**
- `map_ingredients(recipe_ingredients, inventory_items)` → List[Dict]

**Model:** GPT-o3 (with fallback to GPT-4)
- Max completion tokens: 4000
- Returns array of mappings:

```json
[
  {
    "recipe_ingredient": "flour",
    "recipe_quantity": "100",
    "recipe_unit": "kg",
    "mapped_to": "All-purpose flour",
    "match_confidence": 0.95,
    "match_type": "exact",
    "note": "Perfect match"
  }
]
```

### MealDBService

**Purpose:** Online recipe search

**Methods:**
- `search_recipes(query)` → List[Dict]
- `get_recipe_details(meal_id)` → Dict

**API:** TheMealDB (https://www.themealdb.com/api/json/v1/1/)

---

## 🎤 Voice Recognition

### Implementation
- Uses Web Speech API (browser built-in)
- `SpeechRecognition` or `webkitSpeechRecognition`
- Language: en-US
- Continuous: false
- Interim results: false

### Event Flow
```javascript
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // Send to processCommand()
};

recognition.onerror = (event) => {
  // Handle errors
};

recognition.onend = () => {
  // Stop listening indicator
};
```

---

## 💾 Database Schema Updates

### Recipes Table
New columns added:
- `source_url` (String): Original recipe URL
- `image_url` (String): Recipe image
- `cuisine` (String): Cuisine type
- `ingredients_raw` (Text/JSON): Original ingredients
- `ingredients_mapped` (Text/JSON): AI-mapped ingredients

### Migration Script
Run: `python Backend/migrate_add_web_recipe_fields.py`

---

## 🔐 Environment Variables

Required in `Backend/.env`:

```env
OPENAI_API_KEY=sk-...your-key-here
ALLOWED_ORIGINS=*
DATABASE_URL=sqlite:///./chefcode.db
```

---

## 🧪 Testing

### Manual Test Commands

```bash
# Test AI service import
python -c "from services.ai_assistant_service import AIAssistantService; print('OK')"

# Test routes import
python -c "from routes.ai_assistant import router; print('OK')"

# Test backend running
curl http://localhost:8000/

# Test AI endpoint
curl -X POST http://localhost:8000/api/ai-assistant/command \
  -H "Content-Type: application/json" \
  -d '{"command": "Add 5 kg of rice"}'
```

### Frontend Testing

1. Open browser console (F12)
2. Type command in toolbar
3. Watch for:
   - API requests to `/api/ai-assistant/command`
   - Chat messages appearing
   - Confirmation dialogs

---

## 🐛 Debugging

### Backend Logs
Check terminal running `python main.py` for:
```
INFO: Detected intent: add_inventory (confidence: 0.95)
INFO: Executing confirmed action: add_inventory
```

### Frontend Console
```javascript
console.log('AI Response:', result);
console.log('Intent:', result.intent);
console.log('Entities:', result.entities);
```

### Common Issues

**Import Error:**
```
ImportError: cannot import name 'get_db'
```
Solution: Each route defines its own `get_db()` function

**API Key Missing:**
```
ValueError: OPENAI_API_KEY environment variable not set
```
Solution: Set in `.env` file

**CORS Error:**
```
Access-Control-Allow-Origin missing
```
Solution: Check `ALLOWED_ORIGINS` in main.py

---

## 🚀 Deployment Considerations

### Production Checklist

- [ ] Set specific `ALLOWED_ORIGINS` (not `*`)
- [ ] Use environment-specific API keys
- [ ] Enable HTTPS for voice recognition
- [ ] Rate limit AI endpoints
- [ ] Cache common queries
- [ ] Add user authentication
- [ ] Log AI interactions for auditing
- [ ] Monitor token usage costs

### Performance Optimization

1. **Caching:** Store common intent patterns
2. **Batch Processing:** Group multiple commands
3. **Streaming:** Stream AI responses for long outputs
4. **Lazy Loading:** Load chat history on demand

---

## 📊 Cost Estimation

### OpenAI API Usage

**GPT-4o-mini:**
- ~500 tokens per intent detection
- $0.150 / 1M input tokens
- $0.600 / 1M output tokens
- **~$0.0004 per command**

**GPT-o3:**
- ~2000 tokens per ingredient mapping
- $15 / 1M input tokens (reasoning)
- $60 / 1M output tokens
- **~$0.05 per mapping**

**Monthly Estimate (1000 commands):**
- Intent detection: $0.40
- Ingredient mapping (100): $5.00
- **Total: ~$6/month** for moderate usage

---

## 🔄 Future Enhancements

### Planned Features
- [ ] Multi-language support
- [ ] Voice output (text-to-speech)
- [ ] Recipe suggestions based on inventory
- [ ] Batch operations ("Add 5 items...")
- [ ] Undo/redo functionality
- [ ] Export conversation history
- [ ] Integration with calendar for planning

### AI Improvements
- [ ] Fine-tune custom model on restaurant domain
- [ ] Add memory across sessions
- [ ] Learn user preferences
- [ ] Predict common actions

---

## 📖 Code Examples

### Add Custom Intent

**1. Update `AIAssistantService`:**
```python
INTENTS = {
    ...
    "my_custom_intent": "Description",
}
```

**2. Add Handler in `ai_assistant.py`:**
```python
async def handle_my_custom_intent(intent_result, db):
    entities = intent_result.entities
    # Your logic here
    return CommandResponse(...)
```

**3. Route in `process_command()`:**
```python
elif intent_result.intent == "my_custom_intent":
    return await handle_my_custom_intent(intent_result, db)
```

---

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)

---

## 🤝 Contributing

When adding new features:
1. Update intent list in `AIAssistantService`
2. Add handler in `ai_assistant.py`
3. Update frontend if needed
4. Document in this guide
5. Add tests

---

## 📞 Support

For technical issues:
- Check backend logs
- Enable frontend debug mode
- Review API responses
- Test individual components

---

**Built with ❤️ for ChefCode**


