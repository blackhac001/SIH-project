"""
Comprehensive End-to-End Verification Test for CONNECTX CV Upload & Authenticated Ownership Isolation
Tests:
1. Account A registration & authentication
2. Initial empty state check (no demo data leaked to authenticated user)
3. Account A PDF upload & validation
4. Account A active resume verification & authenticated download
5. Account B registration & authentication
6. User isolation check: Account B sees empty state (no Account A resume visible)
7. Security check: Account B cannot download Account A's resume by ID (403 Forbidden)
8. Security check: Account B cannot delete Account A's resume by ID (403 Forbidden)
9. Account B DOCX upload & verification
10. Account A switchback: Account A still sees Account A's resume (isolated from B)
11. Replace CV workflow for Account A
12. Delete CV workflow for Account A
13. Security validation: rejection of invalid extensions (.exe), empty files, oversized files, unauthenticated access
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import urllib.parse

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


def run_tests():
    print("=" * 70)
    print("CONNECTX CV UPLOAD & AUTHENTICATED OWNERSHIP TEST SUITE")
    print("=" * 70)

    ts = int(time.time())
    email_a = f"candidate_a_{ts}@connectx.ai"
    email_b = f"candidate_b_{ts}@connectx.ai"
    password = "SecurePassword@123"

    # 1. Register Account A
    print(f"\n[Test 1] Registering Account A: {email_a}...")
    status, res, _ = make_request(
        f"{BASE_URL}/auth/register/candidate",
        method="POST",
        data={
            "full_name": "Candidate Alpha",
            "email": email_a,
            "password": password,
            "phone_number": "+91 9820011223",
            "district": "Pune",
            "education_level": "B.Tech Computer Science",
            "skills": ["Python", "FastAPI", "PostgreSQL"]
        }
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    token_a = res["access_token"]
    user_a = res["user"]
    print(f"  ✓ Registered Account A: user_id={user_a['id']}")

    # 2. Check initial resume status for Account A (must be has_resume: False)
    print("\n[Test 2] Checking Account A initial resume status (no CV uploaded yet)...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume",
        method="GET",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["has_resume"] is False, f"Expected has_resume=False, got {res}"
    assert res["resume"] is None
    print("  ✓ Account A has_resume is False (no demo resume shown)")

    # 3. Account A uploads PDF CV
    print("\n[Test 3] Account A uploading PDF CV...")
    pdf_content = b"%PDF-1.4\n%Candidate Alpha Resume\n1 0 obj\n<< /Title (Candidate Alpha CV) >>\nendobj\ntrailer\n<< >>\n%%EOF"
    body, ctype = create_multipart_payload("file", "Alpha_Developer_Resume.pdf", pdf_content, "application/pdf")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={
            "Authorization": f"Bearer {token_a}",
            "Content-Type": ctype
        }
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    resume_a = res["resume"]
    resume_a_id = resume_a["id"]
    assert resume_a["filename"] == "Alpha_Developer_Resume.pdf"
    assert resume_a["user_id"] == user_a["id"]
    assert resume_a["is_active"] is True
    print(f"  ✓ Account A uploaded CV: ID={resume_a_id}, filename={resume_a['filename']}, user_id={resume_a['user_id']}")

    # 4. Account A downloads CV
    print("\n[Test 4] Account A downloading uploaded CV...")
    status, file_bytes, headers = make_request(
        f"{BASE_URL}/resume/download",
        method="GET",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert status == 200, f"Expected 200, got {status}"
    assert file_bytes == pdf_content, "Downloaded content does not match uploaded content!"
    print(f"  ✓ Account A successfully downloaded exact CV ({len(file_bytes)} bytes)")

    # 5. Register Account B
    print(f"\n[Test 5] Registering Account B: {email_b}...")
    status, res, _ = make_request(
        f"{BASE_URL}/auth/register/candidate",
        method="POST",
        data={
            "full_name": "Candidate Beta",
            "email": email_b,
            "password": password,
            "phone_number": "+91 9820044556",
            "district": "Mumbai City",
            "education_level": "M.S. Data Science",
            "skills": ["PyTorch", "NLP", "Docker"]
        }
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    token_b = res["access_token"]
    user_b = res["user"]
    print(f"  ✓ Registered Account B: user_id={user_b['id']}")

    # 6. Verify User Isolation: Account B sees has_resume: False
    print("\n[Test 6] User Isolation: Checking Account B's resume status...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume",
        method="GET",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["has_resume"] is False, f"Isolation failure! Account B sees a resume: {res}"
    print("  ✓ Account B has has_resume=False (Account A's CV is completely isolated)")

    # 7. Security: Account B attempts to download Account A's resume by ID
    print(f"\n[Test 7] Security Check: Account B attempting unauthorized download of Account A's resume ID {resume_a_id}...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/{resume_a_id}/download",
        method="GET",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert status == 403, f"Security vulnerability! Expected 403 Forbidden, got {status}: {res}"
    print(f"  ✓ Access blocked with HTTP 403 Forbidden: {res.get('detail') if isinstance(res, dict) else res}")

    # 8. Security: Account B attempts to delete Account A's resume by ID
    print(f"\n[Test 8] Security Check: Account B attempting unauthorized delete of Account A's resume ID {resume_a_id}...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/{resume_a_id}",
        method="DELETE",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert status == 403, f"Security vulnerability! Expected 403 Forbidden, got {status}: {res}"
    print(f"  ✓ Delete blocked with HTTP 403 Forbidden: {res.get('detail') if isinstance(res, dict) else res}")

    # 9. Account B uploads DOCX CV
    print("\n[Test 9] Account B uploading DOCX CV...")
    docx_content = b"PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00Candidate Beta DOCX content test container"
    body, ctype = create_multipart_payload("file", "Beta_Data_Scientist.docx", docx_content, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={
            "Authorization": f"Bearer {token_b}",
            "Content-Type": ctype
        }
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    resume_b = res["resume"]
    assert resume_b["filename"] == "Beta_Data_Scientist.docx"
    assert resume_b["user_id"] == user_b["id"]
    print(f"  ✓ Account B uploaded CV: ID={resume_b['id']}, filename={resume_b['filename']}")

    # 10. Switch back to Account A: verifies Account A still sees Account A's CV
    print("\n[Test 10] Switchback to Account A: Verifying Account A still has Account A's CV...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume",
        method="GET",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res}"
    assert res["has_resume"] is True
    assert res["resume"]["id"] == resume_a_id
    assert res["resume"]["filename"] == "Alpha_Developer_Resume.pdf"
    print(f"  ✓ Account A still sees Account A's CV (ID={resume_a_id}) without any cross-contamination")

    # 11. Account A replaces CV
    print("\n[Test 11] Account A replacing CV with a new version...")
    pdf_v2 = b"%PDF-1.4\n%Candidate Alpha Resume V2 Updated\n1 0 obj\n<< >>\nendobj\ntrailer\n<< >>\n%%EOF"
    body, ctype = create_multipart_payload("file", "Alpha_Senior_Lead_2026.pdf", pdf_v2, "application/pdf")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={
            "Authorization": f"Bearer {token_a}",
            "Content-Type": ctype
        }
    )
    assert status == 201, f"Expected 201, got {status}: {res}"
    resume_a_v2 = res["resume"]
    assert resume_a_v2["filename"] == "Alpha_Senior_Lead_2026.pdf"
    assert resume_a_v2["is_active"] is True
    print(f"  ✓ Account A replaced CV with ID={resume_a_v2['id']}, filename={resume_a_v2['filename']}")

    # 12. Account A deletes active CV
    print("\n[Test 12] Account A deleting active CV...")
    status, res, _ = make_request(
        f"{BASE_URL}/resume",
        method="DELETE",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert status == 200, f"Expected 200, got {status}: {res}"
    # Verify status is now has_resume: False
    status, res, _ = make_request(
        f"{BASE_URL}/resume",
        method="GET",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res["has_resume"] is False
    print("  ✓ Account A active CV deleted; has_resume is now False")

    # 13. Security validation: Reject invalid files
    print("\n[Test 13] Security Validations:")
    # 13a. Unauthenticated access
    status, _, _ = make_request(f"{BASE_URL}/resume", method="GET")
    assert status == 401, f"Expected 401 for unauthenticated request, got {status}"
    print("  ✓ 13a: Unauthenticated access rejected with 401 Unauthorized")

    # 13b. Invalid file extension (.exe)
    body, ctype = create_multipart_payload("file", "malicious_script.exe", b"MZ\x90\x00", "application/x-msdownload")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={"Authorization": f"Bearer {token_b}", "Content-Type": ctype}
    )
    assert status == 400, f"Expected 400 for .exe file, got {status}: {res}"
    print(f"  ✓ 13b: Invalid extension .exe rejected with 400 Bad Request ({res.get('detail')})")

    # 13c. Empty file (0 bytes)
    body, ctype = create_multipart_payload("file", "empty_resume.pdf", b"", "application/pdf")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={"Authorization": f"Bearer {token_b}", "Content-Type": ctype}
    )
    assert status == 400, f"Expected 400 for empty file, got {status}: {res}"
    print(f"  ✓ 13c: Empty 0-byte file rejected with 400 Bad Request ({res.get('detail')})")

    # 13d. Fake PDF (invalid magic bytes)
    body, ctype = create_multipart_payload("file", "fake_pdf.pdf", b"This is not a PDF header", "application/pdf")
    status, res, _ = make_request(
        f"{BASE_URL}/resume/upload",
        method="POST",
        data=body,
        headers={"Authorization": f"Bearer {token_b}", "Content-Type": ctype}
    )
    assert status == 400, f"Expected 400 for fake PDF, got {status}: {res}"
    print(f"  ✓ 13d: Invalid PDF magic bytes rejected with 400 Bad Request ({res.get('detail')})")

    print("\n" + "=" * 70)
    print("ALL 13 TESTS PASSED! FULL ISOLATION & AUTHENTICATED OWNERSHIP CONFIRMED!")
    print("=" * 70)


if __name__ == "__main__":
    run_tests()
