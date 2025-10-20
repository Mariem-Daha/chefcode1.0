# ChefCode AI Assistant - User Guide

## 🤖 Overview

The ChefCode AI Assistant is an intelligent voice and text interface that allows you to manage your restaurant's inventory and recipes using natural language. No more clicking through menus – just tell the AI what you need!

---

## 🎯 Features

### ✅ What Can the AI Do?

#### 📦 **Inventory Management**
- **Add items**: "Add 5 kg of rice to inventory"
- **Update quantities**: "Update flour to 10 kg"
- **Delete items**: "Remove tomatoes from inventory"
- **Check stock**: "How much rice do we have?"

#### 🍳 **Recipe Management**
- **Add recipes manually**: "Add a recipe called Pizza with flour 100 kg and tomato sauce 200 ml"
- **Search online**: "Search for pasta recipes" or "Find Italian recipes"
- **Edit recipes**: "Edit recipe Pizza"
- **Delete recipes**: "Delete the recipe Pasta"
- **View recipes**: "Show me the Pizza recipe"

#### 📚 **Recipe Catalogue**
- **Show all**: "Show all recipes"
- **Filter by category**: "Show dessert recipes"

---

## 🎤 How to Use

### Method 1: Voice Input

1. Click the **🎤 microphone button** in the toolbar at the bottom
2. Wait for the "Listening..." message
3. Speak your command clearly
4. The AI will process your request automatically

**Example:** *"Add five kilograms of rice"*

### Method 2: Text Input

1. Click in the text input field at the bottom
2. Type your command
3. Press **Enter** or click the **📤 send button**
4. The AI will respond in the chat panel

**Example:** Type `Add recipe Pizza with cheese 100g and tomato 200g`

---

## 💬 AI Chat Interface

When you interact with the AI, a chat panel slides in from the right side showing:
- **Your messages** (blue bubbles on the right)
- **AI responses** (white bubbles on the left)
- **Typing indicators** when the AI is thinking
- **Action confirmations** before making changes

---

## ⚠️ Confirmation System

For important actions (add, edit, delete), the AI will **always ask for confirmation** before proceeding:

### Example Flow:

**You:** "Delete recipe Pizza"

**AI:** "⚠️ Delete recipe 'Pizza'? This cannot be undone."

**[Confirm] [Cancel]** buttons appear

✅ Click **Confirm** to proceed  
❌ Click **Cancel** to abort

---

## 🔍 Recipe Search

When you search for recipes online:

1. **You:** "Search pasta recipes"
2. **AI:** Shows search results with recipe cards
3. Click on any recipe card to see full details
4. Click **"Import Recipe"** to add it to your collection
5. AI automatically maps ingredients to your inventory

**Smart Ingredient Mapping:**
- ✅ **Green** = Exact match in inventory
- 🔄 **Yellow** = Substitute available
- ❌ **Red** = Missing from inventory

---

## 🎯 Command Examples

### Inventory Commands

```
✅ "Add 5 kg of rice"
✅ "Update flour to 10 kg"
✅ "Remove tomatoes"
✅ "How much rice do we have?"
✅ "Add 2 liters of olive oil at 15 euros"
```

### Recipe Commands

```
✅ "Add a recipe called Tiramisu with mascarpone 500g and coffee 200ml"
✅ "Search for Italian desserts"
✅ "Find vegan recipes"
✅ "Show me the Pizza recipe"
✅ "Edit recipe Carbonara"
✅ "Delete the recipe Lasagna"
```

### Catalogue Commands

```
✅ "Show all recipes"
✅ "Show dessert recipes"
✅ "List all pasta recipes"
```

---

## 🧠 How the AI Works

### Intent Detection
The AI uses **GPT-4o-mini** to understand your command and determine:
- What you want to do (add, edit, search, etc.)
- What item or recipe you're referring to
- Quantities, units, and other details

### Ingredient Mapping
When importing recipes, the AI uses **GPT-o3** reasoning to:
- Match recipe ingredients to your inventory
- Suggest substitutes when available
- Flag missing ingredients

### Conversational Memory
The AI remembers your recent conversation context:
- "Add the second one" (after showing search results)
- "Update it to 5 kg" (after discussing an item)

---

## ✨ Pro Tips

### 1. **Be Specific**
❌ "Add some rice"  
✅ "Add 5 kg of rice"

### 2. **Natural Language Works**
Both work equally well:
- "Add 5 kilograms of rice"
- "Add 5 kg of rice"

### 3. **Use Commas for Multiple Ingredients**
✅ "Add recipe Pizza with flour 100 kg, tomato sauce 200 ml, and cheese 50 kg"

### 4. **Voice Commands Work Best When Clear**
- Speak clearly and at normal pace
- Pause briefly before and after numbers
- Say "point" for decimals: "2.5 kg" → "two point five kilograms"

### 5. **Ask for Help**
If you're stuck, just ask:
- "What can you do?"
- "Help me add a recipe"
- "How do I search for recipes?"

---

## 🎨 UI Elements

### Chat Panel (Right Side)
- Slides in from right when activated
- Shows conversation history
- Close button (X) at top right

### Confirmation Dialog (Center)
- Appears over the main screen
- Shows what action will be taken
- [Confirm] and [Cancel] buttons

### Search Results Overlay
- Grid of recipe cards
- Click to view details
- "Import Recipe" button on each card

### Toast Notifications
- Small popups at bottom center
- ✅ Green for success
- ❌ Red for errors
- Auto-dismiss after 3 seconds

---

## 🚨 Error Handling

### If Something Goes Wrong:

**"I'm not sure what you mean"**
→ Try rephrasing your command more clearly

**"Item not found"**
→ Check the spelling or try a different name

**"Recipe already exists"**
→ Use "Edit recipe" instead, or delete the old one first

**"Backend connection failed"**
→ Make sure the backend server is running

---

## 🔐 Security & Privacy

- All commands require confirmation for destructive actions
- Voice input is processed locally in your browser
- AI processing happens securely via OpenAI's API
- No commands are saved after execution

---

## ⚙️ Technical Details

### AI Models Used:
- **GPT-4o-mini**: Intent detection, query interpretation, conversational responses
- **GPT-o3**: Advanced ingredient mapping and substitution reasoning

### Supported Browsers:
- ✅ Chrome, Edge, Safari (voice + text)
- ✅ Firefox (text only, limited voice support)

### Voice Recognition:
- Uses Web Speech API (built into modern browsers)
- Works offline for speech-to-text
- English (US) language by default

---

## 🆘 Troubleshooting

### Voice Not Working?
1. Check microphone permissions in browser settings
2. Use Chrome or Edge for best compatibility
3. Ensure microphone is connected and working

### AI Not Responding?
1. Check that backend is running (http://localhost:8000)
2. Refresh the page
3. Check browser console for errors (F12)

### Confirmation Dialog Stuck?
1. Click Cancel to close
2. Refresh the page if needed

---

## 📚 Need More Help?

- Check the backend logs for detailed error messages
- Try simpler commands first
- Use the recipe search modal as an alternative for recipe management

---

## 🎉 Quick Start

1. **Type** or **speak** a command in the toolbar
2. **Read** the AI's response in the chat panel
3. **Confirm** when asked
4. **Done!** Your inventory or recipes are updated

**That's it! The AI does the rest. 🤖**


