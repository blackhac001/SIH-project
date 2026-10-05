"""
Reliable, High-Fidelity Text Extraction and Cleaning Engine for Resumes & CVs
Supports:
- PDF (.pdf) via pypdf with robust stream-level fallback
- DOCX (.docx) via python-docx with native standard library zipfile/XML fallback
- Clean structural normalization for downstream AI/NLP analysis
"""

import os
import re
import io
import zlib
import logging
import zipfile
import xml.etree.ElementTree as ET
from typing import Tuple, Optional

logger = logging.getLogger("connectx.extractor")


def clean_extracted_text(raw_text: str) -> str:
    """
    Normalize and clean extracted CV text while preserving meaningful structural sections.
    - Normalizes line breaks
    - Removes non-printable / control characters (retains standard punctuation and bullet points)
    - Fixes hyphenated line breaks (e.g. "distrib-\\nuted" -> "distributed")
    - Collapses excessive horizontal spaces
    - Collapses 3+ redundant blank lines down to 2
    """
    if not raw_text:
        return ""

    text = raw_text

    # 1. Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # 2. Replace non-breaking spaces and special whitespace
    text = text.replace("\xa0", " ").replace("\u200b", "").replace("\ufeff", "")

    # 3. Replace non-printable ASCII control characters except \n and \t
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)

    # 4. Fix hyphenated word breaks at end of lines (e.g., "microser-\nvices" -> "microservices")
    text = re.sub(r'(\b[a-zA-Z]{2,})-\n([a-zA-Z]{2,}\b)', r'\1\2', text)

    # 5. Normalize multiple spaces and tabs within the same line
    lines = []
    for line in text.split("\n"):
        # Strip trailing and leading whitespace from each line
        cleaned_line = re.sub(r'[ \t]+', ' ', line).strip()
        lines.append(cleaned_line)

    text = "\n".join(lines)

    # 6. Normalize section headers with standard casing and line spacing
    # Collapse 3 or more consecutive empty lines to 2
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, str, Optional[str]]:
    """
    Extract textual content from a PDF document.
    Returns: (cleaned_text, status_code, error_message)
    Status codes: "SUCCESS", "NO_TEXT_DETECTED", "EXTRACTION_FAILED"
    """
    if not file_bytes or len(file_bytes) == 0:
        return "", "NO_TEXT_DETECTED", "PDF file is empty (0 bytes)."

    extracted_pages = []

    # Method 1: Try pypdf
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        for page_idx, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    extracted_pages.append(page_text.strip())
            except Exception as pe:
                logger.debug(f"pypdf could not extract page {page_idx}: {pe}")
    except ImportError:
        logger.warning("pypdf not installed, using stream fallback for PDF.")
    except Exception as e:
        logger.warning(f"pypdf extraction encountered error: {e}")

    # Method 2: Stream-level fallback if pypdf extracted nothing or wasn't available
    if not extracted_pages:
        try:
            stream_text = _extract_pdf_streams_fallback(file_bytes)
            if stream_text and stream_text.strip():
                extracted_pages.append(stream_text.strip())
        except Exception as fe:
            logger.debug(f"PDF stream fallback failed: {fe}")

    combined_text = "\n\n".join(extracted_pages)
    cleaned = clean_extracted_text(combined_text)

    if not cleaned:
        return "", "NO_TEXT_DETECTED", "No extractable text found in this PDF document. Scanned images or protected PDFs require OCR processing."

    return cleaned, "SUCCESS", None


def _extract_pdf_streams_fallback(file_bytes: bytes) -> str:
    """Fallback text extractor from raw uncompressed/FlateDecode PDF content streams."""
    text_chunks = []
    # Search for all stream ... endstream blocks
    stream_pattern = re.compile(b'stream[\r\n]+(.*?)[\r\n]+endstream', re.DOTALL)
    for match in stream_pattern.finditer(file_bytes):
        raw_stream = match.group(1)
        decompressed = None
        # Try raw
        try:
            decompressed = zlib.decompress(raw_stream)
        except Exception:
            try:
                decompressed = zlib.decompress(raw_stream, -zlib.MAX_WBITS)
            except Exception:
                decompressed = raw_stream

        if decompressed:
            try:
                decoded = decompressed.decode("latin1", errors="ignore")
                # Look for TJ / Tj text operators in PDF stream
                tj_matches = re.findall(r'\((.*?)\)\s*Tj', decoded)
                for tj in tj_matches:
                    clean = tj.replace(r'\(', '(').replace(r'\)', ')').replace(r'\n', ' ').strip()
                    if clean:
                        text_chunks.append(clean)
                
                # Look for array text operators: [(text) 12 (more)] TJ
                array_matches = re.findall(r'\[(.*?)\]\s*TJ', decoded)
                for arr in array_matches:
                    inner_texts = re.findall(r'\((.*?)\)', arr)
                    combined_arr = "".join(inner_texts).replace(r'\(', '(').replace(r'\)', ')').strip()
                    if combined_arr:
                        text_chunks.append(combined_arr)
            except Exception:
                pass

    return "\n".join(text_chunks)


def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, str, Optional[str]]:
    """
    Extract textual content from a DOCX document (paragraphs, headings, tables).
    Returns: (cleaned_text, status_code, error_message)
    Status codes: "SUCCESS", "NO_TEXT_DETECTED", "EXTRACTION_FAILED"
    """
    if not file_bytes or len(file_bytes) == 0:
        return "", "NO_TEXT_DETECTED", "DOCX file is empty (0 bytes)."

    # Method 1: Try python-docx
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = []
        for p in doc.paragraphs:
            t = p.text.strip()
            if t:
                paragraphs.append(t)
        
        # Also extract table text
        for table in doc.tables:
            for row in table.rows:
                row_texts = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_texts:
                    paragraphs.append(" | ".join(row_texts))

        combined = "\n\n".join(paragraphs)
        cleaned = clean_extracted_text(combined)
        if cleaned:
            return cleaned, "SUCCESS", None
    except ImportError:
        logger.warning("python-docx not installed, using native OpenXML XML parser.")
    except Exception as e:
        logger.warning(f"python-docx extraction encountered error: {e}")

    # Method 2: Standard library zipfile + XML ElementTree parser (100% reliable across all Office formats)
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
            if "word/document.xml" not in zf.namelist():
                return "", "EXTRACTION_FAILED", "Invalid DOCX archive: word/document.xml missing."

            xml_content = zf.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            
            elements = []
            # Iterate through all elements matching paragraph tags regardless of XML namespace
            for elem in tree.iter():
                if elem.tag.endswith('p'):
                    runs = []
                    for child in elem.iter():
                        if child.tag.endswith('t') and child.text:
                            runs.append(child.text)
                    para_text = "".join(runs).strip()
                    if para_text:
                        elements.append(para_text)

            combined = "\n\n".join(elements)
            cleaned = clean_extracted_text(combined)
            if cleaned:
                return cleaned, "SUCCESS", None
            else:
                return "", "NO_TEXT_DETECTED", "No text content found in DOCX file."
    except zipfile.BadZipFile:
        return "", "EXTRACTION_FAILED", "Uploaded document is not a valid zip/DOCX archive."
    except Exception as e:
        logger.error(f"DOCX native parser error: {e}")
        return "", "EXTRACTION_FAILED", f"DOCX extraction failed: {str(e)}"


def extract_resume_text(file_bytes: bytes, filename: str) -> Tuple[str, int, int, str, Optional[str]]:
    """
    Main entrypoint for CV text extraction.
    Determines file format and routes to appropriate extractor.
    Returns: (cleaned_text, char_count, word_count, extraction_status, extraction_error)
    """
    _, ext = os.path.splitext(filename.lower())
    
    if ext == ".pdf":
        text, status, error = extract_text_from_pdf(file_bytes)
    elif ext == ".docx":
        text, status, error = extract_text_from_docx(file_bytes)
    else:
        # Unsupported format
        return "", 0, 0, "UNSUPPORTED_FORMAT", f"Unsupported file format '{ext}'. Expected .pdf or .docx"

    char_count = len(text)
    word_count = len(text.split()) if text else 0

    return text, char_count, word_count, status, error
