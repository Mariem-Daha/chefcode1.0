/**
 * ChefCode API Layer - Connected to FastAPI Backend
 * Gestisce tutte le chiamate al backend (port 8000)
 */

class ChefCodeAPI {
  constructor(baseURL = 'http://localhost:8000') {
    this.baseURL = baseURL;
    console.log('🌐 ChefCode API connected to:', this.baseURL);
  }

  // Configurazione per mobile (React Native / Flutter)
  setMobileConfig(config) {
    this.baseURL = config.baseURL || this.baseURL;
    this.token = config.token; // Per autenticazione future
    console.log('� API URL updated to:', this.baseURL);
  }

  // ===== SYNC DATA =====
  async syncData(data) {
    try {
      const response = await fetch(`${this.baseURL}/api/sync-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Sync error:', error);
      throw error;
    }
  }

  // ===== CHATGPT AI =====
  async sendChatMessage(prompt, language = 'en') {
    try {
      const response = await fetch(`${this.baseURL}/api/chatgpt-smart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({ prompt, language })
      });
      return await response.json();
    } catch (error) {
      console.error('❌ ChatGPT error:', error);
      throw error;
    }
  }

  // ===== INVENTORY =====
  async getInventory() {
    try {
      const response = await fetch(`${this.baseURL}/api/data`);
      const data = await response.json();
      return data.inventory || [];
    } catch (error) {
      console.error('❌ Get inventory error:', error);
      throw error;
    }
  }

  async addInventoryItem(item) {
    try {
      const response = await fetch(`${this.baseURL}/api/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          action: 'add-inventory',
          data: item
        })
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Add inventory error:', error);
      throw error;
    }
  }

  // ===== RECIPES =====
  async getRecipes() {
    try {
      const response = await fetch(`${this.baseURL}/api/data`);
      const data = await response.json();
      return data.recipes || {};
    } catch (error) {
      console.error('❌ Get recipes error:', error);
      throw error;
    }
  }

  async saveRecipe(name, recipe) {
    try {
      const response = await fetch(`${this.baseURL}/api/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          action: 'save-recipe',
          data: { name, recipe }
        })
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Save recipe error:', error);
      throw error;
    }
  }

  // ===== TASKS =====
  async getTasks() {
    try {
      const response = await fetch(`${this.baseURL}/api/data`);
      const data = await response.json();
      return data.tasks || [];
    } catch (error) {
      console.error('❌ Get tasks error:', error);
      throw error;
    }
  }

  async addTask(task) {
    try {
      const response = await fetch(`${this.baseURL}/api/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          action: 'add-task',
          data: task
        })
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Add task error:', error);
      throw error;
    }
  }

  // ===== HEALTH CHECK =====
  async ping() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export per Web (browser)
if (typeof window !== 'undefined') {
  window.ChefCodeAPI = ChefCodeAPI;
}

// Export per Mobile (React Native / Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChefCodeAPI;
}

// Export per ES6 modules
if (typeof exports !== 'undefined') {
  exports.ChefCodeAPI = ChefCodeAPI;
}