/* ChefCode – MVP Controller
   PATCH 1.2.2 — Stable (Inventory deduction + Production fix)
*/

// Global utility functions
function normName(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\s]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function normUnit(u) {
  u = String(u || '').trim().toLowerCase();
  if (u === 'l') u = 'lt';
  if (u === 'gr') u = 'g';
  if (u === 'pz.' || u === 'pcs' || u === 'pc') u = 'pz';
  return u;
}

function convertFactor(from, to) {
  from = normUnit(from); to = normUnit(to);
  if (from === to) return 1;
  if (from === 'kg' && to === 'g')  return 1000;
  if (from === 'g'  && to === 'kg') return 1/1000;
  if (from === 'lt' && to === 'ml') return 1000;
  if (from === 'ml' && to === 'lt') return 1/1000;
  // MVP: pz <-> bt 1:1
  if ((from === 'pz' && to === 'bt') || (from === 'bt' && to === 'pz')) return 1;
  return null; // non convertibili
}

// Global function for adding/merging inventory items
window.addOrMergeInventoryItem = function({ name, unit, quantity, category, price, batch_number, expiry_date }) {
  const nName = normName(name);
  const pCents = Math.round((Number(price) || 0) * 100);

  // HACCP: Items with different batch numbers or expiry dates MUST be kept separate for traceability
  const idx = window.STATE.inventory.findIndex(it =>
    normName(it.name) === nName &&
    Math.round((Number(it.price) || 0) * 100) === pCents &&
    (it.batch_number || '') === (batch_number || '') &&
    (it.expiry_date || '') === (expiry_date || '')
  );

  if (idx >= 0) {
    const row = window.STATE.inventory[idx];
    const fromU = normUnit(unit || row.unit);
    const toU   = normUnit(row.unit || fromU);
    const f = convertFactor(fromU, toU);

    if (f === null) {
      // unità non compatibili: NON fondere, crea una nuova riga
      window.STATE.inventory.push({ name, unit, quantity, category: category || row.category || 'Other', price, batch_number, expiry_date });
    } else {
      row.quantity = (Number(row.quantity) || 0) + (Number(quantity) || 0) * f;
      // manteniamo categoria e unit della riga esistente
    }
  } else {
    // nuova riga con HACCP traceability
    window.STATE.inventory.push({ name, unit, quantity, category, price, batch_number, expiry_date });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // ===== AI TOOLBAR FUNCTIONALITY =====
  
  // ===================================================================
  // AI ASSISTANT TOOLBAR
  // ===================================================================
  // All AI functionality (voice, text, commands) is now handled by ai-assistant.js
  // - Voice button opens the AI chat with voice recognition
  // - Send button sends commands through AI chat
  // - No more browser prompt()/alert() - all conversational UI
  // - See ai-assistant.js for full implementation
  // ===================================================================
  
  // Upload button (connects to OCR)
  const aiUploadBtn = document.getElementById('ai-upload-btn');
  if (aiUploadBtn) {
    aiUploadBtn.addEventListener('click', () => {
      // Open OCR modal if available
      if (window.ocrModal) {
        window.ocrModal.openModal();
      } else {
        alert('📤 Upload functionality - Coming soon!');
      }
    });
  }
  
  

  // ---------- Helpers ----------
  const el = (id) => document.getElementById(id);
  const q  = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  function safe(fn){ try { return fn(); } catch(e){ console.warn(e); return undefined; } }

  // ---------- Storage ----------
  window.STATE = {
    inventory: [],            // [{name, unit, quantity, category, price}]
    recipes: {},              // { "Carbonara": { items:[{name, qty, unit}] } }
    tasks: [],                // [{id, recipe, quantity, assignedTo, status}]
    nextTaskId: 1
  };

  // Remove load/save/localStorage. Always sync with backend.
  window.updateInventoryToBackend = async function() {
    try {
      const apiKey = window.CHEFCODE_CONFIG?.API_KEY || '';
      console.log('🔄 Syncing to backend...', {
        recipes: Object.keys(window.STATE.recipes || {}).length,
        inventory: (window.STATE.inventory || []).length,
        tasks: (window.STATE.tasks || []).length
      });
      
      const syncData = {
        inventory: window.STATE.inventory || [],
        recipes: window.STATE.recipes || {},
        tasks: window.STATE.tasks || []
      };
      
      const response = await fetch('http://localhost:8000/api/sync-data', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(syncData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Sync failed:', response.status, errorText);
        throw new Error(`Sync failed: ${response.status} - ${errorText}`);
      }
      
      console.log('✅ Sync successful!');
      // Removed fetchInventoryFromBackend() to prevent race condition
      // Frontend already has the latest STATE, no need to fetch again
    } catch (err) {
      console.error('❌ Backend sync failed:', err.message);
      alert(`Failed to save to database: ${err.message}\n\nYour changes may not be saved!`);
      throw err; // Re-throw so callers know sync failed
    }
  }

  async function fetchInventoryFromBackend() {
    try {
      const dataRes = await fetch('http://localhost:8000/api/data');
      
      if (!dataRes.ok) {
        throw new Error(`Backend returned ${dataRes.status}: ${dataRes.statusText}`);
      }
      
      const latest = await dataRes.json();
      
      // Validate response structure
      if (!latest || typeof latest !== 'object') {
        throw new Error('Invalid response format from backend');
      }
      
      window.STATE = {
        inventory: Array.isArray(latest.inventory) ? latest.inventory : [],
        recipes: latest.recipes || {},
        tasks: Array.isArray(latest.tasks) ? latest.tasks : [],
        nextTaskId: window.STATE.nextTaskId || 1
      };
      
      // Debug: Log recipes loaded
      console.log(`✅ Data loaded from backend: ${Object.keys(window.STATE.recipes).length} recipes`);
      if (Object.keys(window.STATE.recipes).length > 0) {
        console.log('Recipes:', Object.keys(window.STATE.recipes));
      }
      
      // Synchronize production tasks with STATE.tasks
      if (Array.isArray(window.STATE.tasks)) {
        window.productionTasks = window.STATE.tasks;
      }
      
      window.renderInventory();
    } catch (err) {
      console.error('⚠️ Backend fetch failed:', err.message);
      // Keep existing STATE if fetch fails - don't clear user's data
    }
  }


  // ---------- Selectors ----------
  const chefcodeLogoBtn = el('chefcode-logo-btn');

  const stepSelectionPage   = el('step-selection-page');
  const inputDetailPage     = el('input-detail-page');
  const inputPagesContainer = el('input-pages-container');
  const bigStepButtons      = qa('.big-step-button[data-step]');
  
  // Production tab panels (for visibility control)
  const prodPanels = [
    ...Array.from(qa('#production-content .production-tabs')),
    ...Array.from(qa('#production-content .production-tasks-tabbed'))
  ];

  // Account
  const accountButton         = q('.account-button');
  const accountDropdownContent= q('.account-menu .dropdown-content');

  // Goods In – Camera/OCR (sim)
  const cameraViewfinder = q('.camera-viewfinder');
  const cameraOutput     = q('.camera-output');

  // Goods In – Voice (sim + process)
  const microphoneBtn         = el('microphone-btn');
  const micLabel              = el('mic-label');
  const voiceStatus           = el('voice-status');
  const voiceRecognizedText   = el('voice-recognized-text');
  const recognizedTextContent = el('recognized-text-content');
  const processVoiceBtn       = el('process-voice-btn');

  // Goods In – Manual input
  const manualEntryForm   = el('manual-entry-form');
  const inventoryTableBody= el('inventory-table-body');
  const inventoryTotalVal = el('inventory-total-value');

  // Inventory – search/filter/expand
  const inventorySearch   = el('inventory-search');
  const categoryFilter    = el('inventory-category-filter');
  const expandTableBtn    = el('expand-table-btn');
  const inventoryTableCtr = q('#inventory-page-content .inventory-table-container');

  // Recipe setup
  const ingredientSelect        = el('ingredient-select');
  const ingredientQty           = el('ingredient-qty');
  const ingredientUnit          = el('ingredient-unit');
  const addIngredientBtn        = el('add-ingredient-btn');
  const recipeIngredientsList   = el('recipe-ingredients-list');
  const saveRecipeBtn           = el('save-recipe-btn');
  const recipeNameInput         = el('recipe-name');

  // Production
  const recipeSelectProd  = el('recipe-select-prod');
  const productionQty     = el('production-qty');
  const assignTo          = el('assign-to');
  const initialStatusSelect = el('initial-status');
  const addTaskBtn        = el('add-task-btn');
  const todoTasksContainer      = el('todo-tasks');
  const inprogressTasksContainer= el('inprogress-tasks');
  const completedTasksList      = el('completed-tasks-list');

// === Production state bootstrap (safe) ===
// garantisci che l'array esista sempre e che l'id parta da >0
window.productionTasks = Array.isArray(window.productionTasks) ? window.productionTasks : [];
window.taskIdCounter   = typeof window.taskIdCounter === 'number' ? window.taskIdCounter : 0;

  // runtime temp for recipe building
  let currentRecipeIngredients = [];
  let RECIPES = {};  // mappa: { [recipeName]: { items:[{name, quantity, unit}] } }
    // --- Helpers per unità/nome e parsing ---
     const normUnit = (u) => {
        u = String(u || '').trim().toLowerCase();
         if (u === 'l') u = 'lt';
         if (u === 'gr') u = 'g';
        if (u === 'pz.' || u === 'pcs' || u === 'pc') u = 'pz';
        return u;
     };
     const convertFactor = (from, to) => {
        from = normUnit(from); to = normUnit(to);
        if (from === to) return 1;
         if (from === 'kg' && to === 'g')  return 1000;
        if (from === 'g'  && to === 'kg') return 1/1000;
         if (from === 'lt' && to === 'ml') return 1000;
         if (from === 'ml' && to === 'lt') return 1/1000;
        // MVP: pz <-> bt 1:1
         if ((from === 'pz' && to === 'bt') || (from === 'bt' && to === 'pz')) return 1;
         return null; // non convertibili
    };
     const normName = (s) =>
         String(s || '')
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
          .replace(/[^a-z0-9\s]/g,' ')
           .replace(/\s+/g,' ')
           .trim();
     const parseNumber = (t) => {
        if (!t) return 0;
         t = String(t).replace('€','').replace(/\s/g,'');
         // togli separa-migliaia e usa il punto come decimale
         t = t.replace(/\./g,'').replace(',', '.');
         const n = parseFloat(t);
         return isNaN(n) ? 0 : n;
     };
// ==== Merge Inventory: stesso nome + stesso prezzo => somma quantità ====
// Usa le funzioni già presenti: normName, normUnit, convertFactor

  let isRecording = false;
  
  

  // ---------- Routing ----------
  function normalizeToken(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,''); }

  function findPageIdForStep(stepToken){
    const token = normalizeToken(stepToken);
    // Prova id esatto "<step>-content"
    const direct = `${stepToken}-content`;
    if (el(direct)) return direct;
    // Cerca qualunque .input-page che contenga il token “normalizzato”
    const pages = qa('.input-page');
    for (const page of pages){
      const pid = page.id || '';
      if (normalizeToken(pid).includes(token)) return pid;
    }
    return null;
  }

  function showPage(pageId){
    if (!stepSelectionPage || !inputDetailPage || !inputPagesContainer) return;
    qa('.input-page').forEach(p => p.classList.remove('active'));
    stepSelectionPage.classList.remove('active');
    inputDetailPage.classList.remove('active');
    const target = el(pageId);
    if (target){ target.classList.add('active'); inputDetailPage.classList.add('active'); }
    else { stepSelectionPage.classList.add('active'); }
    // Mostra i tab solo se sei nella pagina production
    prodPanels.forEach(el => {
      el.style.display = (pageId === 'production-content') ? '' : 'none';
    });
    
    // Render recipe catalogue when showing that page
    if (pageId === 'recipe-catalogue-content' && window.renderRecipeCatalogue) {
      window.renderRecipeCatalogue();
    }
  }

  bigStepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.getAttribute('data-step'); // es: goodsin / goods-in
      const pid  = findPageIdForStep(step || '');
      if (pid) showPage(pid);
      else showPage('step-selection-page');
     /* ==== PATCH LAYOUT-4x2 — pulizia stili inline sul Back (append-only) ==== */
(function enforceHomeGridOnBack(){
  const home = document.getElementById('step-selection-page');
  if (!home) return;
  const grid = home.querySelector('.step-buttons-grid');
  if (!grid) return;

  function cleanInline() {
    // rimuove qualsiasi style inline che possa stringere i riquadri
    grid.removeAttribute('style');
    if (grid.style) {
      grid.style.gridTemplateColumns = '';
      grid.style.gridTemplateRows = '';
      grid.style.gap = '';
    }
  }

  // Dopo qualunque click su un back-button, quando la home è visibile ripulisci
  document.addEventListener('click', (e) => {
    const back = e.target.closest('.back-button');
    if (!back) return;
    const targetId = back.dataset.backTarget || '';
    setTimeout(() => {
      if (targetId === 'step-selection-page' || home.classList.contains('active')) {
        cleanInline(); // il CSS sopra fa il resto (4x2 responsive)
      }
    }, 0);
  }, true);

  // Safety net: se la home diventa active per altri motivi
  const mo = new MutationObserver(() => {
    if (home.classList.contains('active')) cleanInline();
  });
  mo.observe(home, { attributes: true, attributeFilter: ['class'] });
})();
 /* === PATCH 1.1.6 — Forza il centro della dashboard al ritorno (append-only) === */
(function centerHomeGridOnActivate(){
  const home = document.getElementById('step-selection-page');
  const grid = home ? home.querySelector('.step-buttons-grid') : null;
  if (!home || !grid) return;

  function centerNow(){
    // nessuna misura fissa: centratura a contenuto (resta responsive)
    grid.style.width = 'fit-content';
    grid.style.marginLeft = 'auto';
    grid.style.marginRight = 'auto';
    grid.style.justifyContent = 'center';
  }

  // Quando premi "Back" e torni alla home, centra
  document.addEventListener('click', (e) => {
    const back = e.target.closest('.back-button');
    if (!back) return;
    setTimeout(() => {
      if (home.classList.contains('active')) centerNow();
    }, 0);
  }, true);

  // Safety net: qualsiasi volta la home diventa active, centra
  const mo = new MutationObserver(() => {
    if (home.classList.contains('active')) centerNow();
  });
  mo.observe(home, { attributes: true, attributeFilter: ['class'] });
})();

    });
  });

  if (chefcodeLogoBtn){
    chefcodeLogoBtn.addEventListener('click', () => showPage('step-selection-page'));
  }

  // Account menu
  if (accountButton && accountDropdownContent){
    accountButton.addEventListener('click', () => {
      accountDropdownContent.style.display = accountDropdownContent.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
      if (!accountButton.contains(e.target) && !accountDropdownContent.contains(e.target)) {
        accountDropdownContent.style.display = 'none';
      }
    /* ============ PATCH 1.1.3 — Goods In click fix + Back grid 2x4 ============ */
/* SOLO aggiunte, nessuna modifica al tuo codice esistente                     */

// 1) Goods In: cattura in modo robusto i click sui 3 pulsanti interni
(function rebindGoodsInButtons(){
  const goodsInContent = document.getElementById('goods-in-content');
  if (!goodsInContent) return;

  // Usiamo capture=true per intercettare il click anche se ci sono figli (icona/span)
  goodsInContent.addEventListener('click', (e) => {
    const btn = e.target.closest('.big-step-button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    if (!action) return;

    // Skip invoice-photo action - handled by OCR modal
    if (action === 'invoice-photo') {
      return; // Let the OCR modal handle this action
    }

    // Mappa azione -> id pagina interna (sono gli ID che hai già in index.html)
    const map = {
      'voice-input'  : 'voice-input-page-content',
      'manual-input' : 'manual-input-content'
    };
    const targetId = map[action];
    if (targetId && typeof showPage === 'function') {
      e.preventDefault();
      showPage(targetId);
    }
  }, true);
})();

// 2) Back: quando torni alla dashboard, forziamo la griglia 2×4 come all’inizio
(function fixBackGrid(){
  // intercettiamo TUTTI i back-button già presenti in pagina
  document.addEventListener('click', (e) => {
    const back = e.target.closest('.back-button');
    if (!back) return;

    // Lasciamo che il tuo handler faccia showPage(...). Poi sistemiamo la griglia.
    setTimeout(() => {
      const targetId = back.dataset.backTarget || '';
      // Se torni alla home, rimetti 4 colonne fisse (2 righe x 4)
      if (targetId === 'step-selection-page' || document.getElementById('step-selection-page')?.classList.contains('active')) {
        const grid = document.querySelector('#step-selection-page .step-buttons-grid');
        if (grid) grid.style.gridTemplateColumns = 'repeat(4, 1fr)'; // 2 file da 4 come da origine
      }
    }, 0);
  }, true);
})();

    });
  }

  // ---------- Camera/OCR (sim) ----------
  function renderCameraIdle(){
    if (!cameraViewfinder) return;
    cameraViewfinder.innerHTML = `
      <div class="camera-overlay">
        <div class="camera-guides"></div>
        <div class="camera-guides"></div>
        <div class="camera-guides"></div>
      </div>
      <div class="camera-cta">
        <button id="take-photo-btn" class="camera-btn"><i class="fas fa-camera"></i></button>
      </div>`;
  }
  if (cameraViewfinder){
    renderCameraIdle();
    let capturedFile = null;
    cameraViewfinder.addEventListener('click', (e) => {
      if (e.target.closest('#take-photo-btn')) {
        // Create a real file input for image selection
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = (ev) => {
          const file = ev.target.files[0];
          if (file) {
            capturedFile = file;
            const reader = new FileReader();
            reader.onload = function(evt) {
              cameraViewfinder.innerHTML = `
                <div class="camera-shot">
                  <img src="${evt.target.result}" alt="Invoice" style="max-width:100%;max-height:220px;object-fit:contain;" />
                </div>
                <div class="camera-cta">
                  <button id="retake-photo-btn" class="camera-btn secondary"><i class="fas fa-redo"></i></button>
                  <button id="confirm-photo-btn" class="camera-btn primary"><i class="fas fa-check"></i></button>
                </div>`;
            };
            reader.readAsDataURL(file);
          }
        };
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
      }
      if (e.target.closest('#retake-photo-btn')) {
        capturedFile = null;
        renderCameraIdle();
      }
      if (e.target.closest('#confirm-photo-btn') && cameraOutput) {
        if (!capturedFile) {
          alert('No image selected. Please take a photo.');
          return;
        }
        // Show loading
        cameraOutput.innerHTML = `<div class="ocr-result"><h4>Processing invoice...</h4></div>`;
        cameraOutput.style.display = '';
        // Upload to backend
        const formData = new FormData();
        formData.append('file', capturedFile);
        const apiKey = window.CHEFCODE_CONFIG?.API_KEY || '';
        fetch('http://localhost:8000/api/ocr-invoice', {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey
          },
          body: formData
        })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && Array.isArray(data.items)) {
            let added = [];
            data.items.forEach(item => {
              // OCR may extract HACCP fields; if not, they can be added manually later
              addOrMergeInventoryItem({
                name: item.name,
                unit: item.unit,
                quantity: item.quantity,
                category: item.category || 'Other',
                price: item.price,
                batch_number: item.batch_number || '',
                expiry_date: item.expiry_date || ''
              });
              added.push(`${item.name} (${item.quantity} ${item.unit} @ €${item.price})`);
            });
            updateInventoryToBackend();
            renderInventory();
            cameraOutput.innerHTML = `<div class="ocr-result"><h4>OCR Extraction Result</h4><ul>${added.map(x => `<li>${x}</li>`).join('')}</ul><p style="color:#888; margin-top:10px;">💡 Tip: Add batch numbers and expiry dates via Manual Input for HACCP compliance</p></div>`;
          } else {
            cameraOutput.innerHTML = `<div class="ocr-result"><h4>OCR failed</h4><div>${data.message || 'Could not extract items.'}</div></div>`;
          }
        })
        .catch(err => {
          cameraOutput.innerHTML = `<div class="ocr-result"><h4>OCR error</h4><div>${err.message}</div></div>`;
        });
      }
    });
  }

  // ---------- Voice (sim + process) ----------
  if (microphoneBtn){
    microphoneBtn.addEventListener('click', () => {
      isRecording = !isRecording;
      if (isRecording){
        if (voiceStatus) voiceStatus.textContent = 'Listening...';
        if (micLabel)    micLabel.textContent = 'Stop Recording';
        setTimeout(() => {
          if (recognizedTextContent) recognizedTextContent.textContent = '"pomodori 20 chili 2 euro e 50"';
          if (voiceRecognizedText)   voiceRecognizedText.style.display = 'block';
        }, 1200);
      } else {
        if (micLabel)              micLabel.textContent = 'Start Recording';
        if (voiceStatus)           voiceStatus.textContent = 'Press the microphone to start speaking...';
        if (voiceRecognizedText)   voiceRecognizedText.style.display = 'none';
        if (recognizedTextContent) recognizedTextContent.textContent = '';
      }
    });
  }

  function parseItalianGoods(text){
    const t = (text||'').toLowerCase().replace(/"/g,' ').replace(/\s+/g,' ').trim();
    // prezzo: "2 euro e 50" | "€2,50"
    let price = 0;
    const pm = t.match(/(\d+[.,]?\d*)\s*(?:€|euro)?(?:\s*e\s*(\d{1,2}))?/);
    if (pm){
      const euros = parseFloat(pm[1].replace(',','.'));
      const cents = pm[2] ? parseInt(pm[2]) : 0;
      price = (isNaN(euros)?0:euros) + (isNaN(cents)?0:cents)/100;
    }
    const unitMap = { chili:'kg', chilo:'kg', chilogrammi:'kg', kg:'kg', grammi:'g', g:'g', litro:'l', litri:'l', lt:'l', l:'l', millilitri:'ml', ml:'ml', pezzi:'pz', pezzo:'pz', uova:'pz', pz:'pz', bt:'bt' };
    const qm = t.match(/(\d+[.,]?\d*)\s*(kg|g|l|lt|ml|pz|bt|litro|litri|chili|chilo|chilogrammi|grammi|millilitri|pezzi|pezzo|uova)\b/);
    const qty  = qm ? parseFloat(qm[1].replace(',','.')) : 1;
    const unit = qm ? (unitMap[qm[2]] || qm[2]) : 'pz';
    const name = qm ? t.slice(0, t.indexOf(qm[0])).trim() : t;
    return { name: name || 'item', qty: isNaN(qty)?1:qty, unit, price: isNaN(price)?0:price };
  }

  if (processVoiceBtn && recognizedTextContent){
    processVoiceBtn.addEventListener('click', () => {
      const text = recognizedTextContent.textContent || '';
      const { name, qty, unit, price } = parseItalianGoods(text);
      if (!name){ alert('Voice: nessun nome articolo rilevato'); return; }
    addOrMergeInventoryItem({ name, unit, quantity: qty, category: 'Other', price });
      renderInventory(); // Update display immediately
      updateInventoryToBackend();
      alert(`Voice→Inventory: ${name} — ${qty} ${unit} @ €${price.toFixed(2)}`);
    });
  }

  // ---------- Inventory ----------
  function rowToItem(tr){
    const tds = tr?.querySelectorAll('td'); if (!tds || tds.length < 6) return null;
    const name = tds[0].textContent.trim();
    const priceText = tds[1].textContent.replace('€','').trim();
    const unit = tds[2].textContent.trim();
    const quantityText = tds[3].textContent.trim();
    const category = tds[4].textContent.trim();
    const price = parseFloat(priceText.replace(',','.')) || 0;
    const quantity = parseFloat(quantityText.replace(',','.')) || 0;
    return { name, unit, quantity, category, price };
  }

  window.renderInventory = function(){
    if (!inventoryTableBody) return;
    
    // Validate STATE and inventory array exist
    if (!window.STATE || !Array.isArray(window.STATE.inventory)) {
      console.warn('⚠️ Invalid STATE or inventory array');
      window.STATE = window.STATE || { inventory: [], recipes: {}, tasks: [], nextTaskId: 1 };
      window.STATE.inventory = [];
    }
    
    inventoryTableBody.innerHTML = '';
    let total = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    window.STATE.inventory.forEach(item => {
      // Validate item structure
      if (!item || typeof item !== 'object') return;
      const rowTotal = (item.price||0) * (item.quantity||0);
      total += rowTotal;
      const tr = document.createElement('tr');
      
      // Calculate expiry alert level
      let expiryHTML = '-';
      let expiryClass = '';
      if (item.expiry_date) {
        const expiryDate = new Date(item.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 2) {
          expiryClass = 'expiry-critical'; // Red
          expiryHTML = `<span class="${expiryClass}">${window.escapeHtml(item.expiry_date)} (${daysUntilExpiry}d)</span>`;
        } else if (daysUntilExpiry < 7) {
          expiryClass = 'expiry-warning'; // Yellow
          expiryHTML = `<span class="${expiryClass}">${window.escapeHtml(item.expiry_date)} (${daysUntilExpiry}d)</span>`;
        } else {
          expiryHTML = window.escapeHtml(item.expiry_date);
        }
      }
      
      tr.innerHTML = `
        <td>${window.escapeHtml(item.name || '')}</td>
        <td>€${(item.price ?? 0).toFixed(2)}</td>
        <td>${window.escapeHtml(item.unit || '-')}</td>
        <td>${item.quantity ?? 0}</td>
        <td>${window.escapeHtml(item.category || '-')}</td>
        <td>${window.escapeHtml(item.batch_number || '-')}</td>
        <td>${expiryHTML}</td>
        <td>€${rowTotal.toFixed(2)}</td>
        <td><button class="delete-btn" onclick="deleteInventoryItem(${item.id})" title="Delete item"><i class="fas fa-trash"></i></button></td>`;
      inventoryTableBody.appendChild(tr);
    });
    if (inventoryTotalVal) inventoryTotalVal.textContent = `€${total.toFixed(2)}`;
    populateIngredientSelect(); // tiene il select aggiornato
  }

  // Bootstrap inventory: always fetch from backend, do not import from DOM or localStorage
  if (inventoryTableBody){
    fetchInventoryFromBackend();
  }

  // Manual Input (sovrascrive submit per evitare doppie append)
  if (manualEntryForm){
    manualEntryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (el('item-name')?.value || '').trim();
      const qty  = parseFloat(el('item-quantity')?.value || '0');
      const unit = el('item-unit')?.value || 'pz';
      const price= parseFloat(el('item-price')?.value || '0');
      const cat  = el('item-category')?.value || 'Other';
      const batchNumber = el('item-batch-number')?.value || '';
      const expiryDate = el('item-expiry-date')?.value || '';
      if (!name || isNaN(qty) || isNaN(price)){ alert('Inserisci nome, quantità e prezzo validi.'); return; }
      // Validate expiry date is not in the past (if provided)
      if (expiryDate) {
        const expiry = new Date(expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiry < today) {
          alert('Expiry date cannot be in the past!');
          return;
        }
      }
      addOrMergeInventoryItem({ 
        name, 
        unit, 
        quantity: qty, 
        category: cat, 
        price,
        batch_number: batchNumber,
        expiry_date: expiryDate
      });
      renderInventory(); // Update display immediately
      await updateInventoryToBackend();
      safe(()=>manualEntryForm.reset());
      safe(()=>el('item-name').focus());
      alert(`"${name}" aggiunto in inventario`);
    });
  }

  // Search / Filter
  function applyInventoryFilters(){
    if (!inventoryTableBody) return;
    const term = (inventorySearch?.value || '').toLowerCase();
    const cat  = (categoryFilter?.value || 'All');
    let total = 0;
    qa('#inventory-table-body tr').forEach(row => {
      const name = row.children[0]?.textContent.toLowerCase() || '';
      const rc   = row.children[4]?.textContent || '';
      const isAll = cat.toLowerCase() === 'all';
      const ok   = (!term || name.includes(term)) && (isAll || cat === '' || rc === cat);
      row.style.display = ok ? '' : 'none';
      if (ok){
        const tv = row.children[7]?.textContent.replace('€','').trim();
        const val= parseFloat(tv?.replace('.','').replace(',','.')) || 0;
        total += val;
      }
    });
    if (inventoryTotalVal) inventoryTotalVal.textContent = `€${total.toFixed(2)}`;
  }

  // Delete inventory item function - attach to window for global access
  window.deleteInventoryItem = async function(itemId) {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const apiKey = window.CHEFCODE_CONFIG?.API_KEY;
      if (!apiKey) {
        alert('API key not configured');
        return;
      }

      const response = await fetch('http://localhost:8000/api/inventory/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ id: itemId })
      });

      if (response.ok) {
        // Remove from local state
        window.STATE.inventory = window.STATE.inventory.filter(item => item.id !== itemId);
        window.renderInventory();
        // No need for full sync after successful delete - local state is already updated
        console.log('Item deleted successfully');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || 'Unknown error';
        } catch (e) {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        alert(`Failed to delete item: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  if (inventorySearch) inventorySearch.addEventListener('input', applyInventoryFilters);
  if (categoryFilter)  categoryFilter.addEventListener('change', applyInventoryFilters);
  if (expandTableBtn && inventoryTableCtr){
    expandTableBtn.addEventListener('click', () => inventoryTableCtr.classList.toggle('expanded'));
  }

  // ---------- Recipes ----------
  function renderIngredientsList(){
    if (!recipeIngredientsList) return;
    recipeIngredientsList.innerHTML = '';
    currentRecipeIngredients.forEach((ing, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${ing.name} - ${ing.quantity} ${ing.unit}</span>
                      <button class="remove-ingredient-btn" data-index="${i}">&times;</button>`;
      recipeIngredientsList.appendChild(li);
    });
  }

  function populateIngredientSelect(){
    if (!ingredientSelect) return;
    const current = ingredientSelect.value;
    ingredientSelect.innerHTML = `<option value="" disabled selected>-- choose item --</option>`;
    const seen = new Set();
    window.STATE.inventory.forEach(it => {
      if (seen.has(it.name)) return;
      seen.add(it.name);
      const opt = document.createElement('option');
      opt.value = it.name; opt.textContent = it.name;
      ingredientSelect.appendChild(opt);
    });
    if (current && seen.has(current)) ingredientSelect.value = current;
    updateRecipeSelects(); // mantiene in sync Produzione
  }

  if (addIngredientBtn){
    addIngredientBtn.addEventListener('click', () => {
      const name = ingredientSelect?.value || '';
      const qty  = parseFloat(ingredientQty?.value || '0');
      const unit = ingredientUnit?.value || 'g';
      if (!name || !qty){ alert('Seleziona ingrediente e quantità.'); return; }
      currentRecipeIngredients.push({ name, quantity: qty, unit });
      renderIngredientsList();
      if (ingredientSelect) ingredientSelect.value = '';
      if (ingredientQty)    ingredientQty.value = '';
    });
  }

  if (recipeIngredientsList){
    recipeIngredientsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.remove-ingredient-btn');
      if (!btn) return;
      const idx = parseInt(btn.dataset.index, 10);
      if (!isNaN(idx)) currentRecipeIngredients.splice(idx, 1);
      renderIngredientsList();
    });
  }

  function updateRecipeSelects(){
    if (!recipeSelectProd) return;
    const current = recipeSelectProd.value;
    recipeSelectProd.innerHTML = '<option value="" disabled selected>-- Choose a recipe --</option>';
    Object.keys(window.STATE.recipes).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      recipeSelectProd.appendChild(opt);
    });
    if (window.STATE.recipes[current]) recipeSelectProd.value = current;
  }
    if (saveRecipeBtn) {
  saveRecipeBtn.addEventListener('click', async () => {
    const recipeName = (document.getElementById('recipe-name')?.value || '').trim();
    if (!recipeName) { alert('Please enter a name for the recipe.'); return; }
    if (!currentRecipeIngredients.length) { alert('Please add at least one ingredient.'); return; }

    // Get yield data
    const yieldQty = parseFloat(el('recipe-yield-qty')?.value || 0);
    const yieldUnit = el('recipe-yield-unit')?.value || 'pz';

    console.log(`💾 Saving recipe: ${recipeName} with yield:`, yieldQty > 0 ? `${yieldQty} ${yieldUnit}` : 'none');

    // Salva nel motore usato dalla Production: STATE.recipes
    // e usa il campo "qty" (non "quantity") perché la deduzione legge ing.qty
    window.STATE.recipes[recipeName] = {
      items: currentRecipeIngredients.map(i => ({
        name: i.name,
        qty:  parseFloat(i.quantity) || 0, // quantità per 1 batch
        unit: i.unit
      })),
      // Save yield information
      yield: yieldQty > 0 ? { qty: yieldQty, unit: yieldUnit } : null
    };
    
    try {
      await updateInventoryToBackend();
    } catch (error) {
      console.error('Failed to save recipe:', error);
      return; // Don't continue if save failed
    }

    // Aggiorna il menu a tendina in Production
    updateRecipeSelects();

    // Feedback
    let summary = `Recipe Saved: ${recipeName}\n\nIngredients:\n`;
    window.STATE.recipes[recipeName].items.forEach(ing => {
      summary += `- ${ing.name}: ${ing.qty} ${ing.unit}\n`;
    });
    alert(summary);

    // Reset form ricetta
    currentRecipeIngredients = [];
    renderIngredientsList();
    const rn = document.getElementById('recipe-name'); if (rn) rn.value = '';
    const ri = document.getElementById('recipe-instructions'); if (ri) ri.value = '';
    const yq = el('recipe-yield-qty'); if (yq) yq.value = '';
    const yu = el('recipe-yield-unit'); if (yu) yu.value = 'pz';
    if (ingredientSelect) ingredientSelect.value = '';
    if (ingredientQty) ingredientQty.value = '';
  });
}
   
  // Primo allineamento selects
  populateIngredientSelect();
  updateRecipeSelects();

  // ---------- Recipe Catalogue ----------
  const recipeCatalogueBody = el('recipe-catalogue-body');
  const recipeCatalogueEmpty = el('recipe-catalogue-empty');
  const recipeSearchInput = el('recipe-search');

  // Render recipe catalogue table
  window.renderRecipeCatalogue = function() {
    console.log('📖 Rendering recipe catalogue...');
    if (!recipeCatalogueBody) {
      console.warn('⚠️ Recipe catalogue body element not found');
      return;
    }
    
    recipeCatalogueBody.innerHTML = '';
    const recipes = window.STATE.recipes || {};
    const recipeNames = Object.keys(recipes);
    
    console.log(`Found ${recipeNames.length} recipes in STATE:`, recipeNames);
    
    // Show/hide empty state
    if (recipeCatalogueEmpty) {
      recipeCatalogueEmpty.style.display = recipeNames.length === 0 ? 'block' : 'none';
    }
    
    if (recipeNames.length === 0) {
      console.log('No recipes to display');
      return;
    }
    
    // Get search term
    const searchTerm = recipeSearchInput?.value.toLowerCase() || '';
    
    recipeNames.forEach(recipeName => {
      // Apply search filter
      if (searchTerm && !recipeName.toLowerCase().includes(searchTerm)) {
        return;
      }
      
      const recipe = recipes[recipeName];
      const ingredients = recipe.items || [];
      const ingredientCount = ingredients.length;
      
      // Build full ingredients list for display
      const ingredientsList = ingredients.map(ing => {
        const qty = ing.qty !== undefined && ing.qty !== null ? ing.qty : '?';
        const unit = ing.unit !== undefined && ing.unit !== null ? ing.unit : '';
        return `<li><span class="ing-name">${window.escapeHtml(ing.name)}</span> <span class="ing-qty">${qty} ${unit}</span></li>`;
      }).join('');
      
      // Get yield info
      const yieldInfo = recipe.yield ? `${recipe.yield.qty} ${recipe.yield.unit}` : 'Not specified';
      
      // Create card element
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <div class="recipe-card-header">
          <h4 class="recipe-card-title">${window.escapeHtml(recipeName)}</h4>
          <span class="recipe-card-badge">${ingredientCount} ingredient${ingredientCount !== 1 ? 's' : ''}</span>
        </div>
        
        <div class="recipe-card-body">
          <div class="recipe-ingredients-section">
            <h5><i class="fas fa-list"></i> Ingredients</h5>
            <ul class="recipe-ingredients-list">
              ${ingredientsList}
            </ul>
          </div>
          
          <div class="recipe-yield-section">
            <i class="fas fa-utensils"></i>
            <span class="yield-label">Yield:</span>
            <span class="yield-value">${window.escapeHtml(yieldInfo)}</span>
          </div>
        </div>
        
        <div class="recipe-card-footer">
          <button class="recipe-card-btn edit-recipe-btn" data-recipe="${window.escapeHtml(recipeName)}" title="Edit Recipe">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="recipe-card-btn delete-recipe-btn" data-recipe="${window.escapeHtml(recipeName)}" title="Delete Recipe">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      `;
      recipeCatalogueBody.appendChild(card);
    });
  };

  // Delete recipe
  async function deleteRecipe(recipeName) {
    if (!confirm(`Are you sure you want to delete the recipe "${recipeName}"?`)) {
      return;
    }
    
    console.log(`🗑️ Deleting recipe: ${recipeName}`);
    delete window.STATE.recipes[recipeName];
    
    try {
      await updateInventoryToBackend();
      renderRecipeCatalogue();
      updateRecipeSelects(); // Update dropdowns in production
      alert(`Recipe "${recipeName}" has been deleted and saved to database.`);
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      // Recipe already deleted from STATE, but sync failed
    }
  }

  // Edit recipe - navigate to add recipe page and populate form
  function editRecipe(recipeName) {
    const recipe = window.STATE.recipes[recipeName];
    if (!recipe) return;
    
    // Store recipe name for editing
    window.editingRecipeName = recipeName;
    
    // Navigate to add recipe page
    const addRecipePage = el('add-recipe-content');
    if (addRecipePage) {
      // Clear current state
      qa('.input-page').forEach(p => p.classList.remove('active'));
      el('step-selection-page')?.classList.remove('active');
      el('input-detail-page')?.classList.add('active');
      addRecipePage.classList.add('active');
      
      // Populate form
      const recipeNameInput = el('recipe-name');
      if (recipeNameInput) {
        recipeNameInput.value = recipeName;
        recipeNameInput.disabled = true; // Don't allow name change during edit
      }
      
      // Populate yield fields
      const yieldQtyInput = el('recipe-yield-qty');
      const yieldUnitInput = el('recipe-yield-unit');
      if (recipe.yield) {
        if (yieldQtyInput) yieldQtyInput.value = recipe.yield.qty || '';
        if (yieldUnitInput) yieldUnitInput.value = recipe.yield.unit || 'pz';
      } else {
        if (yieldQtyInput) yieldQtyInput.value = '';
        if (yieldUnitInput) yieldUnitInput.value = 'pz';
      }
      
      // Populate ingredients
      currentRecipeIngredients = recipe.items.map(ing => ({
        name: ing.name,
        quantity: ing.qty,
        unit: ing.unit
      }));
      renderIngredientsList();
      
      // Change button text
      if (saveRecipeBtn) {
        saveRecipeBtn.innerHTML = '<i class="fas fa-save"></i> Update Recipe';
      }
      
      alert(`Editing recipe: ${recipeName}\nModify ingredients and click "Update Recipe" to save changes.`);
    }
  }

  // Handle edit/delete button clicks
  if (recipeCatalogueBody) {
    recipeCatalogueBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-recipe-btn');
      const deleteBtn = e.target.closest('.delete-recipe-btn');
      
      if (editBtn) {
        const recipeName = editBtn.dataset.recipe;
        editRecipe(recipeName);
      } else if (deleteBtn) {
        const recipeName = deleteBtn.dataset.recipe;
        deleteRecipe(recipeName);
      }
    });
  }

  // Search recipes
  if (recipeSearchInput) {
    recipeSearchInput.addEventListener('input', () => {
      renderRecipeCatalogue();
    });
  }

  // Update save recipe button to handle edit mode
  if (saveRecipeBtn) {
    const originalClickHandler = saveRecipeBtn.onclick;
    saveRecipeBtn.addEventListener('click', () => {
      // After saving, reset edit mode
      if (window.editingRecipeName) {
        const recipeNameInput = el('recipe-name');
        if (recipeNameInput) {
          recipeNameInput.disabled = false;
        }
        delete window.editingRecipeName;
        if (saveRecipeBtn) {
          saveRecipeBtn.innerHTML = '<i class="fas fa-save"></i> Save Recipe';
        }
      }
      
      // Update catalogue if it's visible
      setTimeout(() => {
        renderRecipeCatalogue();
      }, 100);
    });
  }

// ---------- Production ----------
  const renderProductionTasks = () => {
    if (!todoTasksContainer || !completedTasksList) return;
    // Tab To Do
    todoTasksContainer.innerHTML = '<h4 class="tab-title">To Do</h4>';
    // Tab Completed
    completedTasksList.innerHTML = '<h4 class="tab-title">Completed</h4>';
    window.productionTasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.dataset.id = String(task.id);
      card.innerHTML = `
        <h5>${task.recipe} (${task.quantity})</h5>
        <p>Assegnato a: ${task.assignedTo || '—'}</p>
        <div class="task-card-footer">
          ${task.status === 'todo' ? '<button class="task-action-btn" type="button">Convalida</button>' : '<span class="task-completed-label">Completata</span>'}
        </div>
      `;
      if (task.status === 'todo') {
        todoTasksContainer.appendChild(card);
      } else if (task.status === 'completed') {
        completedTasksList.appendChild(card);
      }
    });
  };


// ==== Helpers per deduzione inventario (unità + nomi) ====
function ccNormUnit(u){
  u = String(u || '').trim().toLowerCase();
  if (u === 'l') u = 'lt';
  if (u === 'gr') u = 'g';
  if (u === 'pcs' || u === 'pc' || u === 'pz.') u = 'pz';
  return u;
}
function ccConvertFactor(from, to){
  from = ccNormUnit(from); to = ccNormUnit(to);
  if (from === to) return 1;
  if (from === 'kg' && to === 'g') return 1000;
  if (from === 'g'  && to === 'kg') return 1/1000;
  if (from === 'lt' && to === 'ml') return 1000;
  if (from === 'ml' && to === 'lt') return 1/1000;
  // equivalenza “di comodo” se tratti bottle/pezzi come unità contabili
  if ((from === 'pz' && to === 'bt') || (from === 'bt' && to === 'pz')) return 1;
  return null; // incompatibili
}
function ccNormName(s){ return String(s || '').trim().toLowerCase(); }
function ccFindInventoryItemByName(name){
  const wanted = ccNormName(name);
  return window.STATE.inventory.find(it => ccNormName(it.name) === wanted) || null;
}

 function consumeInventoryForTask(task){
  const r = window.STATE.recipes[task.recipe];
  if (!r){ alert(`Ricetta non trovata: ${task.recipe}`); return; }

  const batches = Number(task.quantity) || 1; // quante “unità ricetta” produci
  let changed = false;
  const skipped = [];

  r.items.forEach(ing => {
    const inv = ccFindInventoryItemByName(ing.name);
    if (!inv){ skipped.push(`${ing.name} (non in inventario)`); return; }

    const invU = ccNormUnit(inv.unit);
    const ingU = ccNormUnit(ing.unit || invU);
    const f = ccConvertFactor(ingU, invU);
    if (f === null){ skipped.push(`${ing.name} (${ingU}→${invU} incompatibile)`); return; }

    const perBatch = Number(ing.qty) || 0;
    const toConsume = perBatch * batches * f;

    inv.quantity = Math.max(0, (Number(inv.quantity) || 0) - toConsume);
    changed = true;
  });

  if (changed){ updateInventoryToBackend(); renderInventory(); }
  if (skipped.length){ console.warn('Ingredienti non scalati:', skipped); }
}


  function onTaskActionClick(e){
    const btn = e.target.closest('.task-action-btn');
    if (!btn) return;
    const card = btn.closest('.task-card'); if (!card) return;
    const id = Number(card.dataset.id);
    const task = window.STATE.tasks.find(t => t.id === id);
    if (!task) return;
    if (task.status === 'todo'){ task.status = 'inprogress'; }
    else if (task.status === 'inprogress'){ task.status = 'completed'; consumeInventoryForTask(task); }
    renderInventory(); // Update inventory display after consumption
    window.updateInventoryToBackend();
    renderProductionTasks();
  }

  if (addTaskBtn) {
  // evita comportamenti da "submit" nel caso in cui il bottone fosse dentro un form
  addTaskBtn.setAttribute('type','button');

    addTaskBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const recipe = recipeSelectProd && recipeSelectProd.value;
    const quantity = productionQty && productionQty.value;
    const assignedToVal = assignTo && assignTo.value;
    const initialStatus = (initialStatusSelect && initialStatusSelect.value) || 'todo';

    if (!recipe || !quantity) {
      alert('Please select a recipe and specify the quantity.');
      return;
    }

    window.taskIdCounter += 1;
    const newTask = {
      id: window.taskIdCounter,
      recipe,
      quantity: Number(quantity),
      assignedTo: assignedToVal || '',
      status: (initialStatus === 'completed') ? 'completed' : 'todo'
      
    };
// Se l'utente ha scelto "Completed", scala subito l'inventario
if (initialStatus === 'completed') {
  try {
    consumeInventoryForTask(newTask);
  } catch (e) {
    console.warn('consume-on-create failed', e);
  }
}
    window.productionTasks.push(newTask);
    renderProductionTasks();

    if (productionQty) productionQty.value = '';
    if (recipeSelectProd) recipeSelectProd.value = '';
    if (initialStatusSelect) initialStatusSelect.value = 'todo';
  });

}


// Gestione click su To Do: convalida task
if (todoTasksContainer) {
  todoTasksContainer.addEventListener('click', function(event) {
    const btn = event.target.closest('button.task-action-btn');
    if (!btn) return;
    const card = btn.closest('.task-card');
    const taskId = parseInt(card.dataset.id, 10);
    const task = window.productionTasks.find(t => t.id === taskId);
    if (!task) return;
    // Deduzione ingredienti SOLO ora
    try { consumeInventoryForTask(task); } catch(e){}
    task.status = 'completed';
    renderProductionTasks();
  });
}

// Tab switching logic
if (typeof prodTabBtns !== 'undefined' && prodTabBtns.length) {
  prodTabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      prodTabBtns.forEach(b => b.classList.remove('active'));
      prodTabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      if (tab === 'todo') {
        todoTasksContainer.classList.add('active');
      } else if (tab === 'completed') {
        completedTasksList.classList.add('active');
      }
    });
  });
}

 // Inizializza tasks view e riallinea contatore
try {
  const maxExisting = window.STATE.tasks.reduce((m, t) => {
    const id = Number(t?.id) || 0;
    return id > m ? id : m;
  }, 0);
  const current = Number(window.STATE.nextTaskId) || 1;
  window.STATE.nextTaskId = Math.max(current, maxExisting + 1);
} catch (e) {
  console.warn('Reindex nextTaskId failed', e);
  window.STATE.nextTaskId = Number(window.STATE.nextTaskId) || 1;
}

  renderProductionTasks();

  // ---------- Back buttons ----------
  qa('.back-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.backTarget || 'step-selection-page';
      showPage(target);
    });
  });

  // ---------- Dev reset ----------
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && String(e.key).toLowerCase() === 'r'){
      if (confirm('Reset ChefCode data?')){
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    }
  });
});
/* ===== CHEFCODE PATCH BACK-RESTORE 1.0 — START ===== */
(function(){
  const home = document.getElementById('step-selection-page');
  const inputDetail = document.getElementById('input-detail-page');
  const homeGrid = home ? home.querySelector('.step-buttons-grid') : null;
  if (!home || !inputDetail || !homeGrid) return;

  // Snapshot dello stato iniziale (quello giusto che vedi all'apertura)
  const ORIGINAL_CLASS = homeGrid.className;
  const HAD_STYLE = homeGrid.hasAttribute('style');
  const ORIGINAL_STYLE = homeGrid.getAttribute('style');

  function restoreHome(){
    // 1) Mostra la home, nascondi area dettagli e qualsiasi sotto-pagina ancora attiva
    document.querySelectorAll('#input-pages-container .input-page.active')
      .forEach(p => p.classList.remove('active'));
    inputDetail.classList.remove('active');
    home.classList.add('active');

    // 2) Ripristina la griglia ESATTAMENTE come all'avvio
    homeGrid.className = ORIGINAL_CLASS;
    if (HAD_STYLE) {
      homeGrid.setAttribute('style', ORIGINAL_STYLE || '');
    } else {
      homeGrid.removeAttribute('style');
    }
    // 3) Pulisci eventuali proprietà inline appiccicate da patch vecchie
    if (homeGrid.style) {
      [
        'grid-template-columns','grid-template-rows','width',
        'margin-left','margin-right','left','right','transform',
        'justify-content','max-width'
      ].forEach(prop => homeGrid.style.removeProperty(prop));
    }
  }

  // Intercetta TUTTI i "Back" e, dopo che i tuoi handler hanno girato, ripristina la home
  document.addEventListener('click', (e) => {
    const back = e.target.closest('.back-button');
    if (!back) return;
    setTimeout(() => {
      const targetId = back.getAttribute('data-back-target') || '';
      if (targetId === 'step-selection-page') restoreHome();
    }, 0);
  }, true);
  /* ===== CHEFCODE PATCH HOME-RESTORE 1.0 — START ===== */
(function(){
  const home = document.getElementById('step-selection-page');
  const inputDetail = document.getElementById('input-detail-page');
  const grid = home ? home.querySelector('.step-buttons-grid') : null;
  const homeBtn = document.getElementById('chefcode-logo-btn');
  if (!home || !inputDetail || !grid || !homeBtn) return;

  // Prendiamo uno snapshot della griglia com'è all'apertura (stato "buono")
  const ORIGINAL_CLASS = grid.className;
  const HAD_STYLE = grid.hasAttribute('style');
  const ORIGINAL_STYLE = grid.getAttribute('style');

  function cleanGridToInitial(){
    // Classi originali
    grid.className = ORIGINAL_CLASS;

    // Stile inline: se all’inizio non c’era, lo togliamo; altrimenti rimettiamo il valore originale
    if (HAD_STYLE) grid.setAttribute('style', ORIGINAL_STYLE || '');
    else grid.removeAttribute('style');

    // Rimuovi qualsiasi proprietà inline residua che possa decentrarla o rimpicciolirla
    if (grid.style){
      [
        'grid-template-columns','grid-template-rows','width','max-width',
        'margin-left','margin-right','left','right','transform','justify-content'
      ].forEach(p => grid.style.removeProperty(p));
    }
  }

  function restoreHome(){
    // Chiudi eventuali sotto-pagine attive
    document.querySelectorAll('#input-pages-container .input-page.active')
      .forEach(p => p.classList.remove('active'));
    inputDetail.classList.remove('active');
    home.classList.add('active');

    // Ripristina la griglia allo stato iniziale (come al primo load)
    cleanGridToInitial();
  }

  // Quando clicchi la "casetta", lasciamo agire il tuo handler e poi ripristiniamo (come fatto per il Back)
  homeBtn.addEventListener('click', () => {
    setTimeout(restoreHome, 0);
  }, true);
})();

  // ===== OCR MODAL FUNCTIONALITY =====
  class OCRModal {
    constructor() {
      this.modal = document.getElementById('ocr-modal');
      this.currentStream = null;
      this.currentFile = null;
      this.ocrResults = null;
      this.currentScreen = 'selection';
      
      this.initializeEventListeners();
    }

    initializeEventListeners() {
      // Modal open/close
      document.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="invoice-photo"]')) {
          e.preventDefault();
          this.openModal();
        }
      });

      // Close modal
      document.getElementById('ocr-modal-close-btn').addEventListener('click', () => {
        this.closeModal();
      });

      // Close on overlay click
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });

      // Selection screen
      document.getElementById('camera-option').addEventListener('click', () => {
        this.showCameraScreen();
      });

      document.getElementById('upload-option').addEventListener('click', () => {
        this.showFileUpload();
      });

      // Camera screen
      document.getElementById('ocr-camera-back').addEventListener('click', () => {
        this.showSelectionScreen();
      });

      document.getElementById('ocr-camera-capture').addEventListener('click', () => {
        this.capturePhoto();
      });

      document.getElementById('ocr-camera-switch').addEventListener('click', () => {
        this.switchCamera();
      });

      // Preview screen
      document.getElementById('ocr-preview-back').addEventListener('click', () => {
        this.showCameraScreen();
      });

      document.getElementById('ocr-preview-process').addEventListener('click', () => {
        this.processInvoice();
      });

      // Results screen
      document.getElementById('ocr-results-back').addEventListener('click', () => {
        this.showSelectionScreen();
      });

      document.getElementById('ocr-results-confirm').addEventListener('click', () => {
        this.confirmAndAddToInventory();
      });

      // Success screen
      document.getElementById('ocr-success-close').addEventListener('click', () => {
        this.closeModal();
      });
    }

    openModal() {
      this.modal.style.display = 'flex';
      setTimeout(() => {
        this.modal.classList.add('show');
      }, 10);
      document.body.style.overflow = 'hidden';
      this.showSelectionScreen();
    }

    closeModal() {
      this.modal.classList.remove('show');
      setTimeout(() => {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.cleanup();
      }, 300);
    }

    showScreen(screenId) {
      // Hide all screens
      document.querySelectorAll('.ocr-screen').forEach(screen => {
        screen.style.display = 'none';
      });
      
      // Show target screen
      document.getElementById(screenId).style.display = 'flex';
      this.currentScreen = screenId;
    }

    showSelectionScreen() {
      this.showScreen('ocr-selection-screen');
      this.cleanup();
    }

    showCameraScreen() {
      this.showScreen('ocr-camera-screen');
      this.initializeCamera();
    }

    showPreviewScreen() {
      this.showScreen('ocr-preview-screen');
    }

    showProcessingScreen() {
      this.showScreen('ocr-processing-screen');
    }

    showResultsScreen() {
      this.showScreen('ocr-results-screen');
    }

    showSuccessScreen() {
      this.showScreen('ocr-success-screen');
    }

    async initializeCamera() {
      try {
        this.currentStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        const video = document.getElementById('ocr-camera-preview');
        video.srcObject = this.currentStream;
        video.play();
      } catch (error) {
        console.error('Camera access denied:', error);
        alert('Camera access is required to take photos. Please allow camera access and try again.');
        this.showSelectionScreen();
      }
    }

    switchCamera() {
      // Simple camera switch - in a real implementation, you'd cycle through available cameras
      if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop());
      }
      this.initializeCamera();
    }

    capturePhoto() {
      const video = document.getElementById('ocr-camera-preview');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        this.currentFile = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
        this.showPreviewScreen();
        
        // Display preview
        const previewImg = document.getElementById('ocr-preview-image');
        previewImg.src = URL.createObjectURL(blob);
      }, 'image/jpeg', 0.8);
    }

    showFileUpload() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,.pdf';
      input.style.display = 'none';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          this.currentFile = file;
          this.showPreviewScreen();
          
          // Display preview
          const previewImg = document.getElementById('ocr-preview-image');
          if (file.type.startsWith('image/')) {
            previewImg.src = URL.createObjectURL(file);
          } else {
            previewImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjN2Y4YzhkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UERGIEZpbGU8L3RleHQ+PC9zdmc+';
          }
        }
      };
      
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    }

    async processInvoice() {
      if (!this.currentFile) {
        alert('No file selected');
        return;
      }

      this.showProcessingScreen();

      try {
        const formData = new FormData();
        formData.append('file', this.currentFile);
        
        const apiKey = window.CHEFCODE_CONFIG?.API_KEY || '';
        const response = await fetch('http://localhost:8000/api/ocr-invoice', {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey
          },
          body: formData
        });

        const data = await response.json();
        
        // Handle service unavailable (503) - OCR not configured
        if (response.status === 503) {
          alert('⚠️ OCR Service Not Available\n\n' +
                'The OCR feature requires Google Cloud credentials.\n\n' +
                'Please use Manual Input instead or contact your administrator to configure:\n' +
                '• Google Cloud Project ID\n' +
                '• Document AI Processor\n' +
                '• Gemini API Key');
          this.showSelectionScreen();
          return;
        }
        
        if (!response.ok) {
          throw new Error(data.detail || `Server error: ${response.status}`);
        }
        
        if (data.status === 'success' && Array.isArray(data.items)) {
          this.ocrResults = data;
          this.displayResults(data);
          this.showResultsScreen();
        } else {
          throw new Error(data.message || 'OCR processing failed');
        }
      } catch (error) {
        console.error('OCR processing error:', error);
        alert(`OCR processing failed: ${error.message}`);
        this.showSelectionScreen();
      }
    }

    displayResults(data) {
      // Update metadata with null checks
      const supplierElement = document.getElementById('ocr-supplier-name');
      if (supplierElement) {
        supplierElement.textContent = `Supplier: ${data.supplier || 'Unknown'}`;
      }
      
      const dateElement = document.getElementById('ocr-invoice-date');
      if (dateElement) {
        dateElement.textContent = `Date: ${data.date || 'Unknown'}`;
      }

      // Populate results table with EDITABLE cells
      const tbody = document.getElementById('ocr-results-tbody');
      if (tbody && Array.isArray(data.items)) {
        tbody.innerHTML = '';

        data.items.forEach((item, index) => {
          const row = document.createElement('tr');
          row.dataset.index = index;
          row.innerHTML = `
            <td><input type="text" class="ocr-edit-input" data-field="name" value="${window.escapeHtml(item.name || 'Unknown')}" /></td>
            <td><input type="number" class="ocr-edit-input ocr-number-input" data-field="quantity" value="${item.quantity || 0}" step="0.01" /></td>
            <td>
              <select class="ocr-edit-input ocr-select-input" data-field="unit">
                <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg</option>
                <option value="g" ${item.unit === 'g' ? 'selected' : ''}>g</option>
                <option value="lt" ${item.unit === 'lt' ? 'selected' : ''}>lt</option>
                <option value="ml" ${item.unit === 'ml' ? 'selected' : ''}>ml</option>
                <option value="pz" ${item.unit === 'pz' || !item.unit ? 'selected' : ''}>pz</option>
                <option value="bt" ${item.unit === 'bt' ? 'selected' : ''}>bt</option>
              </select>
            </td>
            <td><input type="number" class="ocr-edit-input ocr-number-input" data-field="price" value="${item.price || 0}" step="0.01" /></td>
            <td><input type="text" class="ocr-edit-input" data-field="batch_number" value="${window.escapeHtml(item.batch_number || '')}" placeholder="Enter batch #" /></td>
            <td><input type="date" class="ocr-edit-input ocr-date-input" data-field="expiry_date" value="${item.expiry_date || ''}" placeholder="YYYY-MM-DD" /></td>
          `;
          tbody.appendChild(row);
        });

        // Add event listeners to sync changes back to data
        tbody.querySelectorAll('.ocr-edit-input').forEach(input => {
          input.addEventListener('change', (e) => {
            const row = e.target.closest('tr');
            const index = parseInt(row.dataset.index);
            const field = e.target.dataset.field;
            let value = e.target.value;
            
            // Convert numeric fields
            if (field === 'quantity' || field === 'price') {
              value = parseFloat(value) || 0;
            }
            
            // Update the data object
            if (this.ocrResults && this.ocrResults.items[index]) {
              this.ocrResults.items[index][field] = value;
            }
          });
        });
      }
    }

    async confirmAndAddToInventory() {
      if (!this.ocrResults || !this.ocrResults.items) {
        alert('No OCR results to add');
        return;
      }

      try {
        // Add items to inventory
        let addedCount = 0;
        this.ocrResults.items.forEach(item => {
          window.addOrMergeInventoryItem({
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            category: item.category || 'Other',
            price: item.price,
            batch_number: item.batch_number || '',
            expiry_date: item.expiry_date || ''
          });
          addedCount++;
        });

        // Sync to backend
        await window.updateInventoryToBackend();
        window.renderInventory();

        this.showSuccessScreen();
      } catch (error) {
        console.error('Error adding to inventory:', error);
        alert(`Failed to add items to inventory: ${error.message}`);
      }
    }

    cleanup() {
      // Stop camera stream
      if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop());
        this.currentStream = null;
      }

      // Clear file references
      this.currentFile = null;
      this.ocrResults = null;

      // Clear preview image
      const previewImg = document.getElementById('ocr-preview-image');
      if (previewImg.src && previewImg.src.startsWith('blob:')) {
        URL.revokeObjectURL(previewImg.src);
        previewImg.src = '';
      }
    }

  }

  // Global utility function for HTML escaping
  window.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Initialize OCR Modal
  const ocrModal = new OCRModal();

  // QuickAddPopup removed - ready for new AI toolbar implementation
  
  // Make OCR modal globally accessible
  window.ocrModal = ocrModal;

})();
window.CHEFCODE_RESET = () => { alert('ChefCode storage azzerato'); location.reload(); };
