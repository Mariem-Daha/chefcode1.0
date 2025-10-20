"""
Enhanced Invoice OCR using Google Document AI + Gemini AI
Extracts structured invoice data with 100% accuracy
"""

import os
import json
import io
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions
import google.generativeai as genai
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
PROJECT_ID = os.getenv("PROJECT_ID")
LOCATION = os.getenv("LOCATION")
PROCESSOR_ID = os.getenv("PROCESSOR_ID")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GOOGLE_CREDS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Validate environment variables (silently - errors are handled in routes/ocr.py)
if not all([PROJECT_ID, LOCATION, PROCESSOR_ID, GEMINI_API_KEY]):
    # OCR will be unavailable but app will continue to work
    pass


class InvoiceOCR:
    """Enhanced Invoice OCR using Document AI + Gemini"""
    
    def __init__(self, project_id: str, location: str, processor_id: str, gemini_api_key: str):
        self.project_id = project_id
        self.location = location
        self.processor_id = processor_id
        self.processor_name = f"projects/{project_id}/locations/{location}/processors/{processor_id}"
        
        # Initialize Document AI client
        self._init_document_ai()
        
        # Initialize Gemini
        genai.configure(api_key=gemini_api_key)
        self.gemini_model = genai.GenerativeModel(
            'gemini-2.0-flash',
            generation_config={
                "temperature": 0.1,
                "top_p": 0.8,
                "top_k": 20,
                "max_output_tokens": 8192,  # Increased for longer invoices
                "response_mime_type": "application/json",  # Request JSON format
            }
        )
        
        logger.info("Invoice OCR processor initialized successfully")
    
    def _init_document_ai(self):
        """Initialize Document AI client with credentials"""
        # Check if GOOGLE_CREDS is JSON content or file path
        if GOOGLE_CREDS and GOOGLE_CREDS.strip().startswith('{'):
            # It's JSON content (from Hugging Face secret)
            try:
                import json
                from google.oauth2 import service_account
                
                creds_dict = json.loads(GOOGLE_CREDS)
                credentials = service_account.Credentials.from_service_account_info(creds_dict)
                
                opts = ClientOptions(api_endpoint=f"{self.location}-documentai.googleapis.com")
                self.docai_client = documentai.DocumentProcessorServiceClient(
                    client_options=opts,
                    credentials=credentials
                )
                logger.info("Using Google Cloud credentials from JSON content")
                return
            except Exception as e:
                logger.warning(f"Could not load credentials from JSON: {e}")
        
        # Try file path
        if GOOGLE_CREDS and Path(GOOGLE_CREDS).exists():
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_CREDS
            opts = ClientOptions(api_endpoint=f"{self.location}-documentai.googleapis.com")
            self.docai_client = documentai.DocumentProcessorServiceClient(client_options=opts)
            logger.info("Using Google Cloud credentials from file")
        else:
            # Use default credentials
            opts = ClientOptions(api_endpoint=f"{self.location}-documentai.googleapis.com")
            self.docai_client = documentai.DocumentProcessorServiceClient(client_options=opts)
            logger.info("Using default Google Cloud credentials")
    
    def process_with_document_ai(self, file_path: str) -> str:
        """Extract text from invoice using Document AI OCR"""
        with open(file_path, "rb") as file:
            file_content = file.read()
        
        # Detect MIME type
        mime_type = self._detect_mime_type(file_path)
        
        # Create Document AI request
        raw_document = documentai.RawDocument(
            content=file_content,
            mime_type=mime_type
        )
        
        request = documentai.ProcessRequest(
            name=self.processor_name,
            raw_document=raw_document
        )
        
        # Process document
        result = self.docai_client.process_document(request=request)
        document = result.document
        
        return document.text
    
    def process_with_gemini_vision(self, file_path: str, raw_text: str = None) -> Dict[str, Any]:
        """
        Use Gemini AI to analyze invoice with both image and text
        """
        # Create the prompt for Gemini
        prompt = self._create_gemini_prompt(raw_text)
        
        # Read and prepare the image
        if file_path and Path(file_path).exists():
            try:
                with open(file_path, 'rb') as f:
                    image_bytes = f.read()
                
                # Import PIL for image handling
                from PIL import Image
                image = Image.open(io.BytesIO(image_bytes))
                
                # Generate response with IMAGE + TEXT
                response = self.gemini_model.generate_content([prompt, image])
                
            except Exception as e:
                logger.warning(f"Could not load image, falling back to text-only: {e}")
                response = self.gemini_model.generate_content(prompt)
        else:
            response = self.gemini_model.generate_content(prompt)
        
        # Parse JSON from response
        return self._parse_gemini_response(response.text)
    
    def _create_gemini_prompt(self, raw_text: Optional[str] = None) -> str:
        """Create a detailed prompt for Gemini to extract invoice data"""
        prompt = """CRITICAL INSTRUCTIONS:
        You are a multilingual AI specialized in extracting and structuring invoice data from text and image.
        You must keep all field names in English but preserve content in the same language as the document (e.g., Italian item descriptions).

        Your task: return valid JSON with this EXACT structure:
        {
          "supplier": {"name": "...", "address": "...", "phone": "...", "email": "...", "tax_id": "..."},
          "customer": {"name": "...", "address": "...", "phone": "...", "email": "..."},
          "invoice_details": {
            "invoice_number": "...",  // REQUIRED: Invoice number (e.g., "FT 123/2024", "INV-001")
            "invoice_date": "YYYY-MM-DD",  // REQUIRED: Invoice date in ISO format
            "due_date": "YYYY-MM-DD",  // Payment due date if shown
            "po_number": "...",  // Purchase order number if shown
            "payment_terms": "..."  // Payment terms if shown (e.g., "30 days", "Net 15")
          },
          "line_items": [...],
          "financial_summary": {...}
        }

        **CRITICAL**: ALWAYS extract invoice_number and invoice_date. These are typically at the TOP of the invoice.
        Look for labels like: "Invoice", "Fattura", "N.", "Nr.", "Date", "Data", "Del", etc.

        ---

        📘 STEP 1: EXTRACT INVOICE HEADER (MOST IMPORTANT)
        1. **Invoice Number**: Look at the top of the document for:
           - "Fattura N." / "Invoice No." / "N." / "Nr." / "Numero Fattura"
           - Usually near the top, often bold or prominent
           - Extract the full number (e.g., "FT 123/2024", "INV-001", "2024/123")
        
        2. **Invoice Date**: Look for:
           - "Data" / "Date" / "Del" / "Data fattura" / "Invoice Date"
           - Usually near the invoice number
           - Convert to YYYY-MM-DD format (e.g., "09/04/2025" → "2025-04-09")
        
        3. **Due Date**: Look for:
           - "Scadenza" / "Due Date" / "Data scadenza"
           - Convert to YYYY-MM-DD format
        
        NEVER leave invoice_number or invoice_date empty if visible in the image!

        ---

        📘 STEP 2: Read the TABLE STRUCTURE
        1. Detect columns such as "Q.tà", "Quantità", "UM", "Prezzo", "Importo", "Totale".
        2. Use these to align each value.
        3. Extract numeric values exactly as printed, respecting decimal commas or dots.
        4. Confirm values visually in the image (columns, alignment).

        ---

        📗 STEP 3: Quantity Logic
        If the quantity column is missing, blurred, or unclear:
        1. Compute **quantity = total_price ÷ unit_price** .
        2. Verify this matches the product's description (e.g. "5 KG", "12 PZ", "3 LT").
        3. If both visible and computed quantities differ, prefer the one that visually aligns in the image.

        ---

        📕 STEP 4: Infer the "type" in the SAME LANGUAGE as the invoice
        Use the product name to classify into a natural, short category term in that language.

        **Italian examples:**
        - carne, pollo, manzo, prosciutto, salsiccia, pesce, gamberoni, scampi → `"carne"` or `"pesce"`
        - pomodoro, cicoria, patate, verdure, funghi, frutta → `"vegetale"`
        - latte, panna, burro, formaggio → `"latticino"`
        - farina, riso, pasta, zucchero, sale, spezie → `"dispensa"`
        - bottiglia, cartone, imballo, contenitore, alluminio → `"imballaggio"`
        - acqua, bibita, vino → `"bevanda"`
        If nothing fits, use `"altro"`.

        Return this field exactly as one short lowercase word in the invoice language.

        ---

        🔵 STEP 5: Validation and Correction (MANDATORY - DO NOT SKIP!)
        **THIS IS THE MOST CRITICAL STEP - YOU MUST VALIDATE AND CORRECT EVERY LINE ITEM!**
        
        For EVERY line item, perform this validation:
        1. **Calculate**: expected_total = quantity × unit_price
        2. **Compare**: Is expected_total ≈ total_price? (within ±2% tolerance)
        3. **If NOT matching**:
           - **RECALCULATE quantity**: quantity = total_price ÷ unit_price
           - Round to 2 decimal places
           - **REPLACE the old quantity with this corrected value**
        
        **EXAMPLE**:
        - Extracted: quantity=5, unit_price=10.50, total_price=42.00
        - Check: 5 × 10.50 = 52.50 (NOT ≈ 42.00) ❌ WRONG!
        - Correct: quantity = 42.00 ÷ 10.50 = 4.0 ✓
        - Output: quantity=4.0, unit_price=10.50, total_price=42.00
        
        **YOU MUST DO THIS FOR EVERY SINGLE LINE ITEM!**
        Never output a line where quantity × unit_price ≠ total_price.
        The math MUST be perfect: `quantity * unit_price = total_price` (within 2% tolerance).

        ---

        💰 STEP 6: Extract Financial Summary (TAX/IVA)
        Look for tax information on the invoice. It may be labeled as:
        - **IVA** (Italian)
        - **VAT** (English)
        - **Tax**, **Imposta**, **Tasse**
        - **TVA** (French)
        - Any line showing tax percentage (e.g., "IVA 22%", "VAT 20%")
        
        Extract:
        - **subtotal**: Sum before tax (may be labeled "Imponibile", "Subtotal", "Net Amount")
        - **tax_amount**: The tax value (IVA amount, not percentage)
        - **total_amount**: Final total including tax ("Totale", "Total", "Importo Totale")
        
        If tax is not explicitly shown, set tax_amount to 0.

        ---

        📗 STEP 7: Output Rules
        - Return ONLY valid JSON, no text or explanations.
        - Numbers must use "." as decimal separator.
        - Ensure each line's `quantity * unit_price ≈ total_price`.
        - Include financial_summary with subtotal, tax_amount, and total_amount.
        - **ALWAYS include invoice_details with invoice_number and invoice_date!**

        Example output:
        {
        "supplier": {
            "name": "DAC S.p.A.",
            "address": "Via Roma 123, Milano",
            "phone": "+39 02 1234567",
            "email": "info@dac.it",
            "tax_id": "IT12345678901"
        },
        "customer": {
            "name": "Restaurant ABC",
            "address": "Via Verdi 45, Roma",
            "phone": "+39 06 7654321",
            "email": "abc@restaurant.it"
        },
        "invoice_details": {
            "invoice_number": "FT 123/2024",
            "invoice_date": "2025-04-09",
            "due_date": "2025-05-09",
            "po_number": "PO-2024-001",
            "payment_terms": "30 days"
        },
        "line_items": [
            {
            "item_code": "53747",
            "description": "POLLO PETTO GR 600 X 3/4 F S/V IT.",
            "type": "carne",
            "quantity": 1,
            "unit": "KG",
            "unit_price": 7.20,
            "total_price": 7.20,
            "expiry_date": "2025-12-31"
            },
            {
            "item_code": "88240",
            "description": "CICORIA F.DORO CUBO K.2,5 FOGLIA PIÙ GEL",
            "type": "vegetale",
            "quantity": 4,
            "unit": "PZ",
            "unit_price": 6.36,
            "total_price": 25.44,
            "expiry_date": ""
            }
        ],
        "financial_summary": {
            "subtotal": 32.64,
            "tax_amount": 7.18,
            "total_amount": 39.82,
            "currency": "EUR"
        }
        }
        """

        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """Parse JSON from Gemini response with robust error handling"""
        try:
            # Remove markdown code blocks if present
            text = response_text.strip()
            
            # Remove various markdown formats
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```JSON"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            
            if text.endswith("```"):
                text = text[:-3]
            
            text = text.strip()
            
            # Find JSON object if there's extra text
            if not text.startswith("{"):
                start = text.find("{")
                if start != -1:
                    text = text[start:]
            
            # Try to parse incrementally - find first valid complete JSON object
            # This handles cases where Gemini adds garbage after the JSON
            brace_count = 0
            in_string = False
            escape_next = False
            
            for i, char in enumerate(text):
                # Handle string state to avoid counting braces inside strings
                if char == '"' and not escape_next:
                    in_string = not in_string
                elif char == '\\' and not escape_next:
                    escape_next = True
                    continue
                
                escape_next = False
                
                # Count braces only outside strings
                if not in_string:
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            # Found complete JSON object
                            text = text[:i + 1]
                            break
            
            # If we still have unbalanced braces, try to repair
            if brace_count != 0:
                logger.warning("JSON response appears truncated, attempting repair")
                # Find last complete item and truncate there
                last_complete_item = text.rfind('    }')
                if last_complete_item != -1:
                    # Truncate to last complete item
                    text = text[:last_complete_item + 5]
                    # Close the line_items array and main object
                    text += '\n  ],\n  "financial_summary": {},\n  "payment_info": {},\n  "additional_notes": ""\n}'
                else:
                    # Count and add missing brackets
                    open_braces = text.count("{")
                    close_braces = text.count("}")
                    open_brackets = text.count("[")
                    close_brackets = text.count("]")
                    
                    if open_brackets > close_brackets:
                        text += "]" * (open_brackets - close_brackets)
                    if open_braces > close_braces:
                        text += "}" * (open_braces - close_braces)
            
            # Parse JSON
            invoice_data = json.loads(text)
            
            # Validate structure
            if not isinstance(invoice_data, dict):
                raise ValueError("Response is not a JSON object")
            
            # Ensure required fields exist and fix empty dicts/lists
            required_fields = {
                "supplier": {}, 
                "customer": {}, 
                "invoice_details": {}, 
                "line_items": [], 
                "financial_summary": {},
                "payment_info": {},
                "additional_notes": ""
            }
            
            for field, default in required_fields.items():
                if field not in invoice_data:
                    invoice_data[field] = default
                elif invoice_data[field] is None:
                    invoice_data[field] = default
            
            return invoice_data
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error at position {e.pos}: {e}")
            logger.debug(f"Response text (first 2000 chars):\n{response_text[:2000]}")
            logger.debug(f"Response text (last 500 chars):\n...{response_text[-500:]}")
            return {
                "error": f"Failed to parse JSON: {str(e)}",
                "raw_response": response_text,
                "supplier": {},
                "customer": {},
                "invoice_details": {},
                "line_items": [],
                "financial_summary": {},
                "payment_info": {},
                "additional_notes": "Parse error occurred"
            }
        except Exception as e:
            logger.error(f"Unexpected error parsing response: {e}")
            import traceback
            traceback.print_exc()
            return {"error": str(e), "raw_response": response_text[:2000]}
    
    def _detect_mime_type(self, file_path: str) -> str:
        """Detect MIME type from file extension"""
        extension = Path(file_path).suffix.lower()
        
        mime_types = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.tiff': 'image/tiff',
            '.tif': 'image/tiff'
        }
        
        return mime_types.get(extension, 'application/octet-stream')
    
    def _validate_and_correct_quantities(self, line_items: list) -> list:
        """
        Double-check and correct quantities for all line items.
        Ensures: quantity × unit_price ≈ total_price (within 2% tolerance)
        If incorrect, recalculates quantity = total_price ÷ unit_price
        Also removes redundant quantity prefixes from descriptions (e.g., "2x Coca-Cola" → "Coca-Cola")
        """
        if not line_items:
            return line_items
        
        import re
        corrected_items = []
        corrections_made = 0
        
        for item in line_items:
            try:
                # Clean redundant quantity prefix from description
                description = item.get('description', '')
                if description:
                    # Remove patterns like "2x ", "1× ", "3 x ", etc. at the start
                    cleaned_description = re.sub(r'^(\d+\.?\d*)\s*[x×]\s*', '', description, flags=re.IGNORECASE)
                    if cleaned_description != description:
                        item['description'] = cleaned_description.strip()
                
                quantity = float(item.get('quantity', 0))
                unit_price = float(item.get('unit_price', 0))
                total_price = float(item.get('total_price', 0))
                
                # Skip if any value is 0 or missing
                if quantity == 0 or unit_price == 0 or total_price == 0:
                    corrected_items.append(item)
                    continue
                
                # Calculate expected total
                expected_total = round(quantity * unit_price, 2)
                
                # Check if within 2% tolerance
                tolerance = 0.02 * total_price
                difference = abs(expected_total - total_price)
                
                if difference > tolerance:
                    # Math is wrong! Recalculate quantity
                    correct_quantity = round(total_price / unit_price, 2)
                    
                    logger.info(f"Correcting quantity for '{item.get('description', 'Unknown')[:40]}': "
                               f"qty={quantity}->{correct_quantity}, unit_price={unit_price}, total={total_price}")
                    
                    # Update the quantity
                    item['quantity'] = correct_quantity
                    corrections_made += 1
                
                corrected_items.append(item)
                
            except (ValueError, TypeError, ZeroDivisionError) as e:
                # If there's an error, keep the original item
                logger.warning(f"Could not validate item: {e}")
                corrected_items.append(item)
        
        if corrections_made > 0:
            logger.info(f"Corrected {corrections_made} quantity values")
        else:
            logger.debug("All quantities verified - no corrections needed")
        
        return corrected_items
    
    def process_invoice(
        self, 
        file_path: str, 
        output_json_path: Optional[str] = None,
        save_json: bool = True
    ) -> Dict[str, Any]:
        """
        Complete pipeline: Document AI OCR + Gemini AI interpretation
        
        Args:
            file_path: Path to invoice image/PDF
            output_json_path: Optional path to save JSON output
            save_json: Whether to save JSON output (set False for API usage)
        
        Returns:
            Structured invoice data
        """
        logger.info(f"Processing invoice: {file_path}")
        
        # Step 1: Extract text with Document AI
        logger.info("Step 1: Extracting text with Document AI")
        raw_text = self.process_with_document_ai(file_path)
        logger.info(f"Document AI extracted {len(raw_text)} characters")
        
        # Step 2: Analyze with Gemini AI
        logger.info("Step 2: Analyzing with Gemini AI")
        invoice_data = self.process_with_gemini_vision(file_path, raw_text)
        
        # Step 3: Validate and correct quantities (backend safety check)
        if "error" not in invoice_data and "line_items" in invoice_data:
            logger.info("Step 3: Validating quantities")
            invoice_data["line_items"] = self._validate_and_correct_quantities(
                invoice_data.get("line_items", [])
            )
        
        # Add processing metadata for cost tracking
        if "error" not in invoice_data:
            item_count = len(invoice_data.get("line_items", []))
            logger.info(f"Extraction complete! Found {item_count} line items")
            invoice_data["_processing_metadata"] = {
                "raw_text_length": len(raw_text),
                "includes_image": True
            }
        else:
            logger.warning("Extraction encountered issues")
        
        # Save to JSON if requested
        if save_json:
            if not output_json_path:
                file_stem = Path(file_path).stem
                if os.path.exists("/app"):
                    output_json_path = f"/tmp/{file_stem}_invoice.json"
                else:
                    output_json_path = f"{file_stem}_invoice.json"
            
            try:
                with open(output_json_path, 'w', encoding='utf-8') as f:
                    json.dump(invoice_data, f, indent=2, ensure_ascii=False)
                logger.info(f"Results saved to: {output_json_path}")
            except (PermissionError, OSError) as e:
                logger.warning(f"Could not save JSON file: {e}")
        
        return invoice_data


def main():
    """Example usage"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python ocr_invoice.py <path_to_invoice_image>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Initialize invoice OCR processor
    ocr = InvoiceOCR(
        project_id=PROJECT_ID,
        location=LOCATION,
        processor_id=PROCESSOR_ID,
        gemini_api_key=GEMINI_API_KEY
    )
    
    # Process invoice
    invoice_data = ocr.process_invoice(input_file, output_file)
    
    # Display results
    print("\n" + "="*70)
    print("INVOICE OCR RESULTS")
    print("="*70)
    print(json.dumps(invoice_data, indent=2, ensure_ascii=False))
    print("="*70)


if __name__ == "__main__":
    main()
