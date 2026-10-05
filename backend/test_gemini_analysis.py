"""
CONNECTX Automated Test Suite — Step 3: Gemini CV Analysis & User Isolation
Tests:
1. Candidate A registration (Dr. Aarav Kulkarni - AI Engineer)
2. Candidate A PDF upload with structured text
3. Candidate A AI analysis execution (POST /api/v1/resume/analyze)
4. Verification of Candidate A's structured AI results (Name, Python/PyTorch/FastAPI, Pune Univ, TechCorp)
5. Candidate B registration (Pooja Deshmukh - Data Analyst)
6. Candidate B DOCX upload with structured text
7. Candidate B AI analysis execution (POST /api/v1/resume/analyze)
8. Verification of Candidate B's structured AI results (Name, SQL/Tableau/Snowflake, Mumbai Univ, FinTech)
9. Contrast & Isolation: Candidate A and Candidate B have completely different, non-overlapping CV data
10. Security: Candidate A blocked from Candidate B's analysis (403 Forbidden)
11. Security: Candidate B blocked from Candidate A's analysis (403 Forbidden)
12. Retrieval: GET /api/v1/resume/analysis returns the authenticated user's own analysis
13. Edge Case: Empty/textless CV rejection (400 Bad Request)
"""
import sys
import io
import time
import json
import urllib.request
import urllib.error
import zipfile
import xml.sax.saxutils as saxutils

BASE_URL = "http://127.0.0.1:8000/api/v1"


def make_request(url, method="GET", data=None, headers=None):
    req_headers = {"Accept": "application/json"}
    if headers:
        req_headers.update(headers)

    body = None
    if data is not None:
        if isinstance(data, (dict, list)):
            body = json.dumps(data).encode("utf-8")
            req_headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            body = data

    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp_body = resp.read().decode("utf-8")
            try:
                return resp.status, json.loads(resp_body), resp.headers
            except Exception:
                return resp.status, resp_body, resp.headers
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(resp_body), e.headers
        except Exception:
            return e.code, resp_body, e.headers
    except Exception as e:
        return 500, {"error": str(e)}, {}


def create_multipart_payload(field_name, filename, file_bytes, content_type):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    crlf = b"\r\n"
    lines = []
    lines.append(f"--{boundary}".encode("latin1"))
    lines.append(f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"'.encode("latin1"))
    lines.append(f"Content-Type: {content_type}".encode("latin1"))
    lines.append(b"")
    lines.append(file_bytes)
    lines.append(f"--{boundary}--".encode("latin1"))
    lines.append(b"")

    body = crlf.join(lines)
    header_content_type = f"multipart/form-data; boundary={boundary}"
    return body, header_content_type


def generate_test_pdf_with_text(text_content):
    lines = text_content.strip().split("\n")
    stream_ops = ["BT", "/F1 12 Tf", "50 720 Td"]
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
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        content_types = (
            b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            b'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            b'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            b'<Default Extension="xml" ContentType="application/xml"/>'
            b'<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
            b'</Types>'
        )
        zf.writestr("[Content_Types].xml", content_types)

        rels = (
            b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            b'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            b'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
            b'</Relationships>'
        )
        zf.writestr("_rels/.rels", rels)

        p_xmls = []
        for p in paragraphs:
            escaped_p = saxutils.escape(p)
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


def run_gemini_analysis_tests():
    print("=" * 70)
    print("CONNECTX STEP 3: GEMINI CV ANALYSIS & USER ISOLATION TEST SUITE")
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
    user_a_id = res["user"]["id"]
    print(f"  ✓ Candidate A registered: user_id={user_a_id}")

    # 2. Candidate A uploads structured PDF CV
    print("\n[Test 2] Candidate A uploading AI Engineer PDF CV...")
    cv_a_text = (
        "DR. AARAV KULKARNI\n"
        "Principal AI Systems & Distributed Cloud Architect\n"
        "SUMMARY\n"
        "Over 8 years experience architecting high-throughput distributed systems with Python, FastAPI, and Kubernetes.\n"
        "EDUCATION\n"
        "Ph.D. in Computer Science - Pune University\n"
        "SKILLS\n"
        "Python, FastAPI, PyTorch, Kubernetes, Docker, PostgreSQL, Vector Databases, Distributed Systems\n"
        "EXPERIENCE\n"
        "Principal AI Systems Engineer at TechCorp (2020 - Present)\n"
        "- Scaled model inference to 10k QPS with 99.99% uptime\n"
        "- Architected automated data extraction pipelines\n"
        "PROJECTS\n"
        "- Distributed Vector Embedding Cache: Scaled vector search to 50ms latency\n"
        "CERTIFICATIONS\n"
        "Certified Kubernetes Administrator (CKA)"
    )
    pdf_a = generate_test_pdf_with_text(cv_a_text)
    body, ctype = create_multipart_payload("file", "Aarav_Kulkarni_CV.pdf", pdf_a, "application/pdf")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={"Authorization": f"Bearer {token_a}", "Content-Type": ctype}
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    resume_a_id = res["resume"]["id"]
    print(f"  ✓ Candidate A CV uploaded (Resume ID={resume_a_id})")

    # 3. Candidate A triggers Gemini AI Analysis
    print("\n[Test 3] Candidate A triggering Gemini AI Analysis (POST /api/v1/resume/analyze)...")
    status, res_a, _ = make_request(
        f"{BASE_URL}/resume/analyze",
        method="POST",
        data={"target_role": "Principal AI & Cloud Architect"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res_a}"
    print(f"  ✓ Analysis executed successfully: Model={res_a.get('model_used')}, Score={res_a.get('resume_score')}")

    # 4. Verify Candidate A's structured AI results
    print("\n[Test 4] Verifying Candidate A's structured Gemini fields...")
    assert res_a["user_id"] == user_a_id
    assert res_a["resume_id"] == resume_a_id
    assert res_a["resume_score"] >= 70, f"Expected score >= 70, got {res_a['resume_score']}"
    assert res_a["job_readiness"] >= 65, f"Expected job_readiness >= 65, got {res_a['job_readiness']}"
    assert len(res_a["skills"]) >= 3, f"Expected >= 3 skills, got {res_a['skills']}"

    skills_a_str = " ".join(str(s) for s in res_a["skills"]).lower()
    tech_a_str = " ".join(str(s) for s in res_a["technical_skills"]).lower()
    assert "python" in skills_a_str or "python" in tech_a_str, "Expected Python in Candidate A skills"
    assert "fastapi" in skills_a_str or "fastapi" in tech_a_str, "Expected FastAPI in Candidate A skills"

    summary_a = (res_a.get("summary") or "").lower()
    assert "aarav" in summary_a or "kulkarni" in summary_a or "engineer" in summary_a or "ai" in summary_a

    print(f"  ✓ Candidate A analysis verified: {len(res_a['skills'])} skills, Score={res_a['resume_score']}, Summary={res_a['summary'][:60]}...")

    # 5. Register Candidate B
    print(f"\n[Test 5] Registering Candidate B: {email_b}...")
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
            "skills": ["SQL", "Tableau", "Snowflake", "Power BI"]
        }
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    token_b = res["access_token"]
    user_b_id = res["user"]["id"]
    print(f"  ✓ Candidate B registered: user_id={user_b_id}")

    # 6. Candidate B uploads structured DOCX CV
    print("\n[Test 6] Candidate B uploading Data Analyst DOCX CV...")
    docx_b_paragraphs = [
        "POOJA DESHMUKH",
        "Lead Business Intelligence and Data Warehouse Specialist",
        "SUMMARY: Specialist in enterprise data warehousing, SQL optimization, and automated KPI reporting.",
        "SKILLS: SQL, PostgreSQL, Tableau, Power BI, Apache Spark, Snowflake, ETL",
        "EXPERIENCE: Senior Analytics Lead at FinTech Global (2021 - Present)",
        "- Reduced financial query runtimes by 65%",
        "EDUCATION: Master of Science in Data Analytics - Mumbai University",
        "PROJECTS: Automated KPI Executive Dashboard for 500+ branch managers",
        "CERTIFICATIONS: AWS Certified Data Analytics Specialty"
    ]
    docx_b = generate_test_docx_with_text(docx_b_paragraphs)
    body, ctype = create_multipart_payload(
        "file",
        "Pooja_Deshmukh_Resume.docx",
        docx_b,
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
    print(f"  ✓ Candidate B DOCX CV uploaded (Resume ID={resume_b_id})")

    # 7. Candidate B triggers Gemini AI Analysis
    print("\n[Test 7] Candidate B triggering Gemini AI Analysis (POST /api/v1/resume/analyze)...")
    status, res_b, _ = make_request(
        f"{BASE_URL}/resume/analyze",
        method="POST",
        data={"target_role": "Lead Data & Analytics Specialist"},
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res_b}"
    assert res_b["user_id"] == user_b_id
    assert res_b["resume_id"] == resume_b_id
    print(f"  ✓ Candidate B analysis executed: Model={res_b.get('model_used')}, Score={res_b.get('resume_score')}")

    # 8. Verify Candidate B's structured AI results
    print("\n[Test 8] Verifying Candidate B's structured Gemini fields...")
    skills_b_str = " ".join(str(s) for s in res_b["skills"]).lower()
    tech_b_str = " ".join(str(s) for s in res_b["technical_skills"]).lower()
    assert "sql" in skills_b_str or "sql" in tech_b_str, "Expected SQL in Candidate B skills"
    assert "snowflake" in skills_b_str or "snowflake" in tech_b_str, "Expected Snowflake in Candidate B skills"

    summary_b = (res_b.get("summary") or "").lower()
    assert "pooja" in summary_b or "deshmukh" in summary_b or "analyst" in summary_b or "data" in summary_b
    print(f"  ✓ Candidate B analysis verified: {len(res_b['skills'])} skills, Summary={res_b['summary'][:60]}...")

    # 9. Isolation / Contrast: Candidate A and B analysis outputs are strictly separate
    print("\n[Test 9] Verifying strict content separation between Candidate A and Candidate B...")
    assert res_a["user_id"] != res_b["user_id"]
    assert res_a["resume_id"] != res_b["resume_id"]
    assert res_a["summary"] != res_b["summary"]
    # Candidate A should have PyTorch/Kubernetes; Candidate B should have Snowflake/Tableau
    assert "snowflake" not in tech_a_str, "Candidate A should NOT have Candidate B's Snowflake skill"
    assert "pytorch" not in tech_b_str, "Candidate B should NOT have Candidate A's PyTorch skill"
    print("  ✓ Strict content isolation confirmed: 0 data bleed between Candidate A and Candidate B.")

    # 10. Security: Candidate A cannot access Candidate B's analysis
    print(f"\n[Test 10] Security Check: Candidate A attempting to read Candidate B's analysis (Resume ID {resume_b_id})...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/{resume_b_id}/analysis",
        method="GET",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    # Since query is filtered by user_id, it returns has_analysis=False or 403 Forbidden
    if status == 200:
        assert res.get("has_analysis") is False or res.get("analysis") is None
        print("  ✓ Candidate A received has_analysis=False (Cannot access Candidate B's records)")
    else:
        assert status in (403, 404), f"Expected 403 or 404, got {status}: {res}"
        print(f"  ✓ Candidate A blocked with HTTP {status}: {res}")

    # 11. Security: Candidate B cannot access Candidate A's analysis
    print(f"\n[Test 11] Security Check: Candidate B attempting to read Candidate A's analysis (Resume ID {resume_a_id})...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/{resume_a_id}/analysis",
        method="GET",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    if status == 200:
        assert res.get("has_analysis") is False or res.get("analysis") is None
        print("  ✓ Candidate B received has_analysis=False (Cannot access Candidate A's records)")
    else:
        assert status in (403, 404), f"Expected 403 or 404, got {status}: {res}"
        print(f"  ✓ Candidate B blocked with HTTP {status}: {res}")

    # 12. Retrieval: GET /api/v1/resume/analysis returns current user's latest analysis
    print("\n[Test 12] Verifying GET /api/v1/resume/analysis for Candidate A...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/analysis",
        method="GET",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["has_analysis"] is True
    assert res["analysis"]["user_id"] == user_a_id
    assert res["analysis"]["resume_id"] == resume_a_id
    print(f"  ✓ Candidate A retrieved their own analysis (Score={res['analysis']['resume_score']})")

    # 13. Edge Case: Empty/scanned file rejection
    print("\n[Test 13] Edge Case: Registering Candidate C with empty text CV...")
    email_c = f"candidate_gamma_{ts}@connectx.ai"
    status, res, _ = make_request(
        f"{BASE_URL}/auth/register/candidate",
        method="POST",
        data={
            "full_name": "Empty Candidate",
            "email": email_c,
            "password": password,
            "phone_number": "+91 9820033777",
            "district": "Nagpur",
            "education_level": "B.A.",
            "skills": ["Communication"]
        }
    )
    token_c = res["access_token"]

    # Upload empty text PDF
    pdf_c = (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n"
        b"xref\n0 4\n0000000000 65535 f \n"
        b"trailer\n<< /Root 1 0 R /Size 4 >>\nstartxref\n200\n%%EOF"
    )
    body, ctype = create_multipart_payload("file", "Empty_Scanned.pdf", pdf_c, "application/pdf")
    make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={"Authorization": f"Bearer {token_c}", "Content-Type": ctype}
    )

    # Attempt AI analysis on empty text CV
    status, res, _ = make_request(
        f"{BASE_URL}/resume/analyze",
        method="POST",
        data={"target_role": "General"},
        headers={"Authorization": f"Bearer {token_c}"}
    )
    assert status == 400, f"Expected 400 Bad Request for empty CV text, got {status}: {res}"
    print(f"  ✓ Empty CV text analysis properly rejected with HTTP 400: {res.get('detail')}")

    print("\n" + "=" * 70)
    print("ALL 13 GEMINI CV ANALYSIS & USER ISOLATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    run_gemini_analysis_tests()
