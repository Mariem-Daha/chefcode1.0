# OCR Invoice Processing Setup Guide

## Overview
ChefCode includes optional OCR (Optical Character Recognition) functionality for automatically extracting invoice data from scanned documents or photos.

**Current Status: ⚠️ OCR is OPTIONAL and currently disabled**

The app works perfectly without OCR - users can still add inventory manually or via voice commands.

---

## OCR Features (When Configured)
- 📷 Extract invoice data from photos or PDFs
- 🤖 AI-powered parsing using Google Document AI + Gemini
- 📊 Automatic extraction of:
  - Item names and descriptions
  - Quantities and units
  - Prices
  - Batch numbers
  - Expiry dates
  - Supplier information

---

## Why OCR is Disabled
OCR requires paid Google Cloud services:
1. **Google Cloud Project** (requires billing account)
2. **Document AI Processor** (paid API)
3. **Gemini AI API** (paid API)

These services cost money and require enterprise setup.

---

## How to Enable OCR (Optional)

### Prerequisites
- Google Cloud account with billing enabled
- Document AI processor created
- Gemini API key

### Steps

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable billing

2. **Enable Document AI**
   - Enable Document AI API
   - Create an Invoice Parser processor
   - Note the Processor ID and Location

3. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create API key

4. **Configure Backend**
   
   Add these to `Backend/.env`:
   ```env
   # OCR Configuration (Optional)
   PROJECT_ID=your-gcp-project-id
   LOCATION=us  # or your region (us, eu, asia)
   PROCESSOR_ID=your-processor-id
   GEMINI_API_KEY=your-gemini-api-key
   GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
   ```

5. **Install Google Cloud Dependencies**
   ```bash
   pip install google-cloud-documentai google-generativeai
   ```

6. **Restart Backend**
   ```bash
   uvicorn main:app --reload
   ```

---

## Using Manual Input Instead

Since OCR requires paid services, ChefCode provides excellent alternatives:

### 1. **AI Voice Commands** ✅ (Already Working!)
```
"Add 10 kg of tomatoes at 3 euros per kilo, batch number BATCH123, expires December 25"
```
The AI automatically extracts:
- Item name: tomatoes
- Quantity: 10
- Unit: kg
- Price: 3 €/kg
- Batch number: BATCH123
- Expiry date: 2024-12-25

### 2. **Manual Form Entry** ✅ (Always Available)
- Fill in the simple form
- All fields validated
- Instant inventory update

### 3. **Quick Add Button** ✅ (Simple & Fast)
- Click item type
- Enter quantity and price
- Done in seconds

---

## Testing OCR Status

You can check if OCR is available:

```bash
curl http://localhost:8000/api/ocr-status
```

**Response (OCR Disabled):**
```json
{
  "available": false,
  "error": "Missing OCR configuration",
  "message": "OCR service is not configured or dependencies are missing"
}
```

**Response (OCR Enabled):**
```json
{
  "available": true,
  "message": "OCR service is ready",
  "supported_formats": ["PDF", "JPEG", "PNG", "TIFF"]
}
```

---

## User Experience

### When OCR is Disabled (Current)
- User clicks "Upload Invoice" in AI toolbar
- Tries to upload a file
- Gets friendly message:
  ```
  ⚠️ OCR Service Not Available
  
  The OCR feature requires Google Cloud credentials.
  
  Please use Manual Input instead or contact your
  administrator to configure:
  • Google Cloud Project ID
  • Document AI Processor
  • Gemini API Key
  ```
- User can use voice commands or manual entry instead

### When OCR is Enabled
- User uploads invoice photo/PDF
- AI extracts all data automatically
- User reviews and confirms
- Items added to inventory instantly

---

## Recommendation

**For development/small businesses:**
- ✅ Use voice commands (FREE, already working!)
- ✅ Use manual entry (always available)
- ❌ Skip OCR (requires paid Google Cloud)

**For large enterprises:**
- ✅ Enable OCR for high-volume invoice processing
- Enterprise billing can absorb Google Cloud costs
- Saves time on bulk data entry

---

## Cost Estimate (If Enabled)

**Google Cloud Document AI:**
- First 1,000 pages/month: FREE
- After that: ~$1.50 per 1,000 pages

**Gemini API:**
- First 60 requests/minute: FREE tier available
- Pay-as-you-go pricing

**Estimated cost for small restaurant:**
- ~50 invoices/month = **FREE** (under free tier)
- ~500 invoices/month = **~$0.75/month**

---

## Support

If you need help enabling OCR:
1. Check Google Cloud documentation
2. Verify all credentials are correct
3. Check backend logs for detailed errors
4. Use the `/api/ocr-status` endpoint to diagnose

---

**Current Status: App works perfectly without OCR! 🎉**



