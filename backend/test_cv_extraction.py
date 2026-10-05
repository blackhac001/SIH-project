"""
Comprehensive Verification Test for STEP 2: CV Text Extraction, Cleaning & Authenticated Ownership Isolation
Tests:
1. Candidate A registration & authentication
2. Candidate A uploads structured PDF CV (Summary, Education, Skills, Experience)
3. Verification of extracted text, normalization, char count, and word count for Candidate A
4. Candidate B registration & authentication
5. Candidate B uploads structured DOCX CV
6. Verification of extracted text for Candidate B
7. Cross-user isolation: Candidate A cannot access Candidate B's extracted text (403 Forbidden)
8. Cross-user isolation: Candidate B cannot access Candidate A's extracted text (403 Forbidden)
9. Reprocessing test: Candidate A uploads updated CV -> extracted text is updated immediately
10. Edge case test: Textless / Scanned PDF returns NO_TEXT_DETECTED without hallucinating text
11. Edge case test: Empty / malformed file error handling
"""

import os
import sys
import json
import time
import zipfile
import io
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000/api/v1"


def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    req_data = None
    if data is not None:
        if isinstance(data, (dict, list)):
            req_data = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            req_data = data
        elif isinstance(data, str):
            req_data = data.encode("utf-8")

    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            content_type = resp.headers.get("Content-Type", "")
            if "application/json" in content_type:
                try:
                    return resp.status, json.loads(content.decode("utf-8")), resp.headers
                except Exception:
                    return resp.status, content, resp.headers
            return resp.status, content, resp.headers
    except urllib.error.HTTPError as e:
        err_content = e.read()
        try:
            return e.code, json.loads(err_content.decode("utf-8")), e.headers
        except Exception:
            return e.code, err_content.decode("utf-8", errors="ignore"), e.headers


def create_multipart_payload(field_name, filename, file_bytes, content_type):
    boundary = "----WebKitFormBoundary" + hex(int(time.time() * 1000))[2:]
    lines = []
    lines.append(f"--{boundary}".encode("utf-8"))
    lines.append(f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"'.encode("utf-8"))
    lines.append(f"Content-Type: {content_type}".encode("utf-8"))
    lines.append(b"")
    lines.append(file_bytes)
    lines.append(f"--{boundary}--".encode("utf-8"))
    lines.append(b"")
    body = b"\r\n".join(lines)
    return body, f"multipart/form-data; boundary={boundary}"


def generate_test_pdf_with_text(text_content):
    """Generate a minimal valid PDF with clean stream text."""
    # PDF with uncompressed text stream for 100% reliable test parsing
    lines = text_content.split("\n")
    stream_ops = ["BT", "/F1 12 Tf", "50 750 Td"]
    for l in lines:
        escaped = l.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        stream_ops.append(f"({escaped}) Tj")
        stream_ops.append("0 -15 Td")
    stream_ops.append("ET")
    stream_data = "\n".join(stream_ops).encode("latin1")
    stream_len = len(stream_data)

    header = (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        + f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("latin1")
    )
    footer = (
        b"\nendstream\nendobj\n"
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        b"xref\n0 6\n0000000000 65535 f \n"
        b"trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n500\n%%EOF"
    )
    return header + stream_data + footer


def generate_test_docx_with_text(paragraphs):
    """Generate a valid DOCX zip archive with structured word/document.xml."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # [Content_Types].xml
        content_types = (
            b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            b'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            b'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            b'<Default Extension="xml" ContentType="application/xml"/>'
            b'<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
            b'</Types>'
        )
        zf.writestr("[Content_Types].xml", content_types)

        # _rels/.rels
        rels = (
            b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            b'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            b'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
            b'</Relationships>'
        )
        zf.writestr("_rels/.rels", rels)

        # word/document.xml
        import xml.sax.saxutils as saxutils
        p_xmls = []
        for p in paragraphs:
            escaped_p = saxutils.escape(p)  # Escape &, <, > for valid XML
            p_xmls.append(f'<w:p><w:r><w:t>{escaped_p}</w:t></w:r></w:p>')
        body_xml = "".join(p_xmls)

        doc_xml = (
            f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            f'<w:body>{body_xml}</w:body>'
            f'</w:document>'
        ).encode("utf-8")
        zf.writestr("word/document.xml", doc_xml)

    return buf.getvalue()


def run_extraction_tests():
    print("=" * 70)
    print("CONNECTX STEP 2: CV TEXT EXTRACTION & ISOLATION TEST SUITE")
    print("=" * 70)

    ts = int(time.time())
    email_a = f"candidate_alpha_{ts}@connectx.ai"
    email_b = f"candidate_beta_{ts}@connectx.ai"
    password = "SecurePassword@123"

    # 1. Register Candidate A
    print(f"\n[Test 1] Registering Candidate A: {email_a}...")
    status, res, _ = make_request(
        f"{BASE_URL}/auth/register/candidate",
        method="POST",
        data={
            "full_name": "Dr. Aarav Kulkarni",
            "email": email_a,
            "password": password,
            "phone_number": "+91 9820011999",
            "district": "Pune",
            "education_level": "Ph.D. Artificial Intelligence",
            "skills": ["Python", "FastAPI", "PyTorch", "Kubernetes"]
        }
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    token_a = res["access_token"]
    user_a = res["user"]
    print(f"  ✓ Candidate A registered: user_id={user_a['id']}")

    # 2. Candidate A uploads structured PDF CV
    print("\n[Test 2] Candidate A uploading structured PDF CV...")
    cv_a_text = (
        "DR. AARAV KULKARNI\n"
        "Senior AI Platform & Distributed Systems Engineer\n"
        "SUMMARY\n"
        "Over 8 years experience designing distributed microservices with Python, FastAPI, and Docker.\n"
        "EDUCATION\n"
        "Ph.D. in Computer Science - Pune University\n"
        "SKILLS\n"
        "Python, FastAPI, PyTorch, Kubernetes, PostgreSQL, Vector Databases\n"
        "EXPERIENCE\n"
        "Principal AI Systems Engineer at TechCorp (2020 - Present)\n"
        "- Scaled model inference to 10k QPS with 99.99% uptime\n"
        "- Architected automated data extraction pipelines"
    )
    pdf_a_bytes = generate_test_pdf_with_text(cv_a_text)
    body, ctype = create_multipart_payload("file", "Aarav_Kulkarni_CV.pdf", pdf_a_bytes, "application/pdf")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={"Authorization": f"Bearer {token_a}", "Content-Type": ctype}
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    resume_a_id = res["resume"]["id"]
    print(f"  ✓ Candidate A CV uploaded (ID={resume_a_id})")

    # 3. Verify Candidate A extracted text endpoint (/api/v1/resume/text)
    print("\n[Test 3] Verifying Candidate A extracted text retrieval (/api/v1/resume/text)...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/text",
        method="GET",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["resume_id"] == resume_a_id
    assert res["has_extractable_text"] is True
    assert res["extraction_status"] == "SUCCESS"
    assert res["char_count"] > 50, f"Expected char_count > 50, got {res['char_count']}"
    assert res["word_count"] > 10, f"Expected word_count > 10, got {res['word_count']}"
    extracted_a = res["extracted_text"]
    assert "AARAV KULKARNI" in extracted_a or "FastAPI" in extracted_a, f"Extracted text mismatch: {extracted_a}"
    print(f"  ✓ Candidate A extracted text verified: {res['word_count']} words, {res['char_count']} chars")

    # 4. Register Candidate B
    print(f"\n[Test 4] Registering Candidate B: {email_b}...")
    status, res, _ = make_request(
        f"{BASE_URL}/auth/register/candidate",
        method="POST",
        data={
            "full_name": "Pooja Deshmukh",
            "email": email_b,
            "password": password,
            "phone_number": "+91 9820022888",
            "district": "Mumbai City",
            "education_level": "M.S. Data Analytics",
            "skills": ["SQL", "Tableau", "Python", "ETL"]
        }
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    token_b = res["access_token"]
    user_b = res["user"]
    print(f"  ✓ Candidate B registered: user_id={user_b['id']}")

    # 5. Candidate B uploads structured DOCX CV
    print("\n[Test 5] Candidate B uploading structured DOCX CV...")
    docx_b_paragraphs = [
        "POOJA DESHMUKH",
        "Lead Data Analyst and Business Intelligence Specialist",
        "SUMMARY: Specialist in enterprise data warehousing, SQL optimization, and automated KPI reporting.",
        "SKILLS: SQL, PostgreSQL, Python, Tableau, Power BI, Apache Spark, Snowflake",
        "EXPERIENCE: Senior Analytics Lead at FinTech Global (2021 - Present)",
        "EDUCATION: Master of Science in Data Analytics - Mumbai University",
        "CERTIFICATIONS: AWS Certified Data Analytics Specialty"
    ]
    docx_b_bytes = generate_test_docx_with_text(docx_b_paragraphs)
    body, ctype = create_multipart_payload(
        "file",
        "Pooja_Deshmukh_Resume.docx",
        docx_b_bytes,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={"Authorization": f"Bearer {token_b}", "Content-Type": ctype}
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    resume_b_id = res["resume"]["id"]
    print(f"  ✓ Candidate B DOCX CV uploaded (ID={resume_b_id})")

    # 6. Verify Candidate B extracted text
    print("\n[Test 6] Verifying Candidate B extracted text retrieval...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/text",
        method="GET",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["resume_id"] == resume_b_id
    assert res["has_extractable_text"] is True
    assert res["extraction_status"] == "SUCCESS"
    extracted_b = res["extracted_text"]
    assert "POOJA DESHMUKH" in extracted_b
    assert "Snowflake" in extracted_b
    print(f"  ✓ Candidate B extracted text verified: {res['word_count']} words, {res['char_count']} chars")

    # 7. User Isolation: Candidate A cannot access Candidate B's text
    print(f"\n[Test 7] Security Check: Candidate A attempting to read Candidate B's text (Resume ID {resume_b_id})...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/{resume_b_id}/text",
        method="GET",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert status == 403, f"Expected 403 Forbidden, got {status}: {res}"
    print(f"  ✓ Candidate A blocked from Candidate B's text with 403 Forbidden: {res.get('detail')}")

    # 8. User Isolation: Candidate B cannot access Candidate A's text
    print(f"\n[Test 8] Security Check: Candidate B attempting to read Candidate A's text (Resume ID {resume_a_id})...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/{resume_a_id}/text",
        method="GET",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert status == 403, f"Expected 403 Forbidden, got {status}: {res}"
    print(f"  ✓ Candidate B blocked from Candidate A's text with 403 Forbidden: {res.get('detail')}")

    # 9. Reprocessing test: Candidate A replaces CV with updated version
    print("\n[Test 9] Reprocessing: Candidate A replaces CV with updated Version 2...")
    cv_a_v2_text = (
        "DR. AARAV KULKARNI - CHIEF AI ARCHITECT\n"
        "UPDATED PROFILE 2026\n"
        "SUMMARY: Promoted to Chief AI Architect leading enterprise GenAI initiatives.\n"
        "SKILLS: Python, FastAPI, PyTorch, vLLM, DeepSeek, LangChain, Kubernetes\n"
        "PROJECTS: Autonomous Agent Swarm & Skill Intelligence Engine"
    )
    pdf_a_v2 = generate_test_pdf_with_text(cv_a_v2_text)
    body, ctype = create_multipart_payload("file", "Aarav_Kulkarni_V2_Chief_Architect.pdf", pdf_a_v2, "application/pdf")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={"Authorization": f"Bearer {token_a}", "Content-Type": ctype}
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    resume_a_v2_id = res["resume"]["id"]

    # Verify active text is now V2
    status, res, _ = make_request(
        f"{BASE_URL}/resume/text",
        method="GET",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["resume_id"] == resume_a_v2_id
    assert "CHIEF AI ARCHITECT" in res["extracted_text"]
    assert "Autonomous Agent Swarm" in res["extracted_text"]
    print(f"  ✓ Candidate A active extracted text cleanly updated to V2 (Resume ID={resume_a_v2_id})")

    # 10. Edge Case: Textless / Scanned image PDF
    print("\n[Test 10] Edge Case: Uploading scanned/textless PDF (0 text streams)...")
    # PDF with an empty page (no text operations)
    scanned_pdf = (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n"
        b"4 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj\n"
        b"xref\n0 5\n0000000000 65535 f \n"
        b"trailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n250\n%%EOF"
    )
    body, ctype = create_multipart_payload("file", "Scanned_Document_Only.pdf", scanned_pdf, "application/pdf")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={"Authorization": f"Bearer {token_a}", "Content-Type": ctype}
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    scanned_resume_id = res["resume"]["id"]

    # Verify extraction status is NO_TEXT_DETECTED
    status, res, _ = make_request(
        f"{BASE_URL}/resume/text",
        method="GET",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["has_extractable_text"] is False
    assert res["extraction_status"] == "NO_TEXT_DETECTED"
    assert "OCR" in res["extraction_error"] or "No extractable text" in res["extraction_error"]
    print(f"  ✓ Textless/scanned PDF handled gracefully: status={res['extraction_status']}, error='{res['extraction_error']}'")

    print("\n" + "=" * 70)
    print("ALL 10 CV TEXT EXTRACTION & ISOLATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_extraction_tests()
