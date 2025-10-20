from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from typing import Dict, Any
import os
import tempfile
import asyncio
from pathlib import Path
from auth import verify_api_key

router = APIRouter()

# Cached OCR processor instance
_ocr_processor_cache = {"instance": None, "error": None}

# Lazy import of OCR to avoid import errors if dependencies are missing
def get_ocr_processor():
    """Lazy load OCR processor with caching to avoid repeated initialization"""
    # Return cached instance if available
    if _ocr_processor_cache["instance"] is not None:
        return _ocr_processor_cache["instance"], None
    if _ocr_processor_cache["error"] is not None:
        return None, _ocr_processor_cache["error"]
    
    try:
        import sys
        import io
        
        # Set UTF-8 encoding for stdout/stderr to handle emojis
        if sys.stdout.encoding != 'utf-8':
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
        
        from tools.ocr_invoice import InvoiceOCR
        
        # Get configuration from environment
        PROJECT_ID = os.getenv("PROJECT_ID")
        LOCATION = os.getenv("LOCATION")
        PROCESSOR_ID = os.getenv("PROCESSOR_ID")
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        
        if not all([PROJECT_ID, LOCATION, PROCESSOR_ID, GEMINI_API_KEY]):
            error = "Missing OCR configuration. Set PROJECT_ID, LOCATION, PROCESSOR_ID, and GEMINI_API_KEY in .env"
            _ocr_processor_cache["error"] = error
            return None, error
        
        ocr = InvoiceOCR(
            project_id=PROJECT_ID,
            location=LOCATION,
            processor_id=PROCESSOR_ID,
            gemini_api_key=GEMINI_API_KEY
        )
        _ocr_processor_cache["instance"] = ocr
        return ocr, None
        
    except ImportError as e:
        error = f"OCR dependencies not installed: {str(e)}"
        _ocr_processor_cache["error"] = error
        return None, error
    except Exception as e:
        import logging
        logging.error(f"OCR initialization error: {str(e)}", exc_info=True)
        error = f"Failed to initialize OCR: {str(e)}"
        _ocr_processor_cache["error"] = error
        return None, error


@router.post("/ocr-invoice")
async def process_invoice(
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key)
) -> Dict[str, Any]:
    """
    Process an invoice image/PDF and extract structured data using OCR
    
    Supports: PDF, JPG, JPEG, PNG, TIFF
    """
    # Get OCR processor
    ocr, error = get_ocr_processor()
    if error:
        raise HTTPException(
            status_code=503, 
            detail=f"OCR service not available: {error}"
        )
    
    # Validate file type
    allowed_types = {'application/pdf', 'image/jpeg', 'image/png', 'image/tiff'}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Supported: PDF, JPEG, PNG, TIFF"
        )
    
    # Create temporary file to store upload
    temp_file = None
    try:
        # Determine file extension
        extension = Path(file.filename).suffix or '.tmp'
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temp:
            # Read and write file content
            content = await file.read()
            temp.write(content)
            temp_file = temp.name
        
        # Process the invoice asynchronously (run synchronous OCR in thread pool)
        invoice_data = await asyncio.to_thread(ocr.process_invoice, temp_file, save_json=False)
        
        # Extract line items and convert to frontend format
        line_items = invoice_data.get("line_items", [])
        items = []
        for item in line_items:
            items.append({
                "name": item.get("description", "Unknown"),
                "quantity": item.get("quantity", 0),
                "unit": item.get("unit", "pz"),
                "price": item.get("unit_price", 0),
                "category": item.get("type", "Food"),  # Use OCR extracted type as category
                "lot_number": item.get("item_code", ""),  # Use item_code as lot_number
                "expiry_date": item.get("expiry_date", "")  # Extract expiry date from OCR
            })
        
        # Return in format frontend expects
        return {
            "status": "success",
            "items": items,
            "filename": file.filename,
            "metadata": invoice_data.get("_processing_metadata", {})
        }
        
    except Exception as e:
        # Log detailed error internally
        import logging
        logging.error(f"OCR processing error: {str(e)}")
        
        raise HTTPException(
            status_code=500,
            detail="Error processing invoice. Please check the file format and try again."
        )
        
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file):
            try:
                os.unlink(temp_file)
            except:
                pass


@router.get("/ocr-status")
async def ocr_status():
    """Check if OCR service is available"""
    ocr, error = get_ocr_processor()
    
    if error:
        return {
            "available": False,
            "error": error,
            "message": "OCR service is not configured or dependencies are missing"
        }
    
    return {
        "available": True,
        "message": "OCR service is ready",
        "supported_formats": ["PDF", "JPEG", "PNG", "TIFF"]
    }

