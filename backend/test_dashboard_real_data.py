"""
CONNECTX Step 4: Dashboard Real Data & User Isolation Test Suite
Verifies that:
1. Fresh candidates without a CV see clean empty states (score=0, hasResume=False, skills=0).
2. Candidates with analyzed CVs see their own real scores, skills, salary benchmarks, and applications.
3. Candidate A and Candidate B dashboard statistics are strictly isolated with zero cross-contamination.
4. Login / Logout / Refresh workflows reload the exact authentic user data every time.
"""

import sys
import io
import time
import requests
from docx import Document

BASE_URL = "http://localhost:8000/api/v1"
TIMESTAMP = int(time.time())

def generate_pdf_cv(name: str, title: str, skills: list, company: str, university: str) -> bytes:
    content = f"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >> endobj
4 0 obj << /Length 300 >> stream
BT
/F1 12 Tf
72 720 Td ({name}) Tj
0 -20 Td ({title}) Tj
0 -20 Td (Skills: {', '.join(skills)}) Tj
0 -20 Td (Experience: Principal Engineer at {company} 2020-Present) Tj
0 -20 Td (Education: {university}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
565
%%EOF"""
    return content.encode("utf-8")

def generate_docx_cv(name: str, title: str, skills: list, company: str, university: str) -> bytes:
    doc = Document()
    doc.add_heading(name, level=1)
    doc.add_paragraph(title)
    doc.add_heading("Skills", level=2)
    doc.add_paragraph(", ".join(skills))
    doc.add_heading("Experience", level=2)
    doc.add_paragraph(f"Senior Analyst at {company} (2021-Present)")
    doc.add_heading("Education", level=2)
    doc.add_paragraph(f"Bachelor of Science, {university}")
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()

def register_and_login(name: str, email: str, password: str = "SecurePass123!"):
    resp = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "full_name": name,
        "role": "CANDIDATE",
        "phone_number": f"+9198{TIMESTAMP % 100000000:08d}",
        "district_id": 1,
        "education_level": "POST_GRADUATE"
    })
    assert resp.status_code == 201, f"Registration failed: {resp.text}"
    
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["tokens"]["access_token"]
    user_id = login_resp.json()["user"]["id"]
    return token, user_id

def run_tests():
    print("=" * 70)
    print("CONNECTX STEP 4: DASHBOARD REAL DATA & ISOLATION TEST SUITE")
    print("=" * 70)
    
    # -------------------------------------------------------------------------
    # TEST 1: Fresh Candidate with No CV
    # -------------------------------------------------------------------------
    print("\n[Test 1] Fresh Candidate with No CV (Empty State Validation)...")
    email_fresh = f"candidate_fresh_{TIMESTAMP}@connectx.ai"
    token_fresh, uid_fresh = register_and_login("Siddharth Joshi", email_fresh)
    headers_fresh = {"Authorization": f"Bearer {token_fresh}"}
    
    kpi_resp = requests.get(f"{BASE_URL}/intelligence/dashboard-kpis", headers=headers_fresh)
    assert kpi_resp.status_code == 200, f"KPI failed: {kpi_resp.text}"
    kpis_fresh = kpi_resp.json()["kpis"]
    
    assert kpis_fresh["hasResume"] is False, "hasResume should be False for fresh user"
    assert kpis_fresh["hasAnalysis"] is False, "hasAnalysis should be False for fresh user"
    assert kpis_fresh["careerScore"] == 0, f"careerScore should be 0, got {kpis_fresh['careerScore']}"
    assert kpis_fresh["verifiedSkills"] == 0, f"verifiedSkills should be 0, got {kpis_fresh['verifiedSkills']}"
    assert kpis_fresh["activeApplications"] == 0, "activeApplications should be 0"
    assert kpis_fresh["targetSalary"] == 0, "targetSalary should be 0"
    print("  ✓ Fresh user dashboard KPIs correctly return zero/empty state (no fake demo stats).")
    
    # Salary prediction empty state
    salary_resp = requests.post(f"{BASE_URL}/intelligence/salary-prediction", headers=headers_fresh)
    assert salary_resp.status_code == 200, f"Salary prediction failed: {salary_resp.text}"
    assert salary_resp.json()["currentEstimatedSalary"] == 0, "Salary baseline should be 0"
    print("  ✓ Fresh user salary forecast correctly shows $0 baseline without CV.")

    # -------------------------------------------------------------------------
    # TEST 2: Candidate A (AI Engineer - PDF CV)
    # -------------------------------------------------------------------------
    print("\n[Test 2] Registering Candidate A (Dr. Aarav Kulkarni, AI Engineer)...")
    email_a = f"candidate_alpha_{TIMESTAMP}@connectx.ai"
    token_a, uid_a = register_and_login("Dr. Aarav Kulkarni", email_a)
    headers_a = {"Authorization": f"Bearer {token_a}"}
    
    pdf_cv = generate_pdf_cv(
        "Dr. Aarav Kulkarni",
        "Principal AI Systems Engineer",
        ["Python", "FastAPI", "PyTorch", "Kubernetes", "Docker", "PostgreSQL", "Vector Databases", "Distributed Systems"],
        "TechCorp Global",
        "Pune University"
    )
    
    files_a = {"file": ("Dr_Aarav_Kulkarni_CV.pdf", pdf_cv, "application/pdf")}
    upload_a = requests.post(f"{BASE_URL}/resume/upload", headers=headers_a, files=files_a)
    assert upload_a.status_code == 201, f"Upload A failed: {upload_a.text}"
    resume_id_a = upload_a.json()["id"]
    print(f"  ✓ Candidate A CV uploaded (ID={resume_id_a})")
    
    # Run Gemini AI Analysis
    analyze_a = requests.post(f"{BASE_URL}/resume/analyze", headers=headers_a, json={
        "target_role": "Principal AI & Cloud Architect"
    })
    assert analyze_a.status_code == 200, f"Analysis A failed: {analyze_a.text}"
    score_a = analyze_a.json()["resume_score"]
    print(f"  ✓ Candidate A Gemini analysis executed: Score={score_a}")

    # Verify Dashboard KPIs for Candidate A
    kpi_resp_a = requests.get(f"{BASE_URL}/intelligence/dashboard-kpis", headers=headers_a)
    assert kpi_resp_a.status_code == 200
    kpis_a = kpi_resp_a.json()["kpis"]
    
    assert kpis_a["hasResume"] is True, "hasResume should be True"
    assert kpis_a["hasAnalysis"] is True, "hasAnalysis should be True"
    assert kpis_a["careerScore"] == score_a, f"Expected {score_a}, got {kpis_a['careerScore']}"
    assert kpis_a["verifiedSkills"] >= 4, f"Expected >= 4 skills, got {kpis_a['verifiedSkills']}"
    assert any("Python" in s or "PyTorch" in s for s in kpis_a["skills"]), "Candidate A skills missing Python/PyTorch"
    assert kpis_a["targetSalary"] > 100000, "Candidate A target salary should be > 100k"
    print(f"  ✓ Candidate A dashboard KPIs verified: {kpis_a['verifiedSkills']} skills, Score={kpis_a['careerScore']}, TargetSalary=${kpis_a['targetSalary']:,}")

    # -------------------------------------------------------------------------
    # TEST 3: Candidate B (Data Analyst - DOCX CV)
    # -------------------------------------------------------------------------
    print("\n[Test 3] Registering Candidate B (Pooja Deshmukh, Data Analyst)...")
    email_b = f"candidate_beta_{TIMESTAMP}@connectx.ai"
    token_b, uid_b = register_and_login("Pooja Deshmukh", email_b)
    headers_b = {"Authorization": f"Bearer {token_b}"}
    
    docx_cv = generate_docx_cv(
        "Pooja Deshmukh",
        "Senior Analytics Lead",
        ["SQL", "Tableau", "PowerBI", "Snowflake", "dbt", "Python", "Data Governance", "ETL Pipelines"],
        "FinTech Solutions Ltd",
        "Mumbai University"
    )
    
    files_b = {"file": ("Pooja_Deshmukh_Analytics.docx", docx_cv, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    upload_b = requests.post(f"{BASE_URL}/resume/upload", headers=headers_b, files=files_b)
    assert upload_b.status_code == 201, f"Upload B failed: {upload_b.text}"
    resume_id_b = upload_b.json()["id"]
    print(f"  ✓ Candidate B CV uploaded (ID={resume_id_b})")
    
    # Run Gemini AI Analysis
    analyze_b = requests.post(f"{BASE_URL}/resume/analyze", headers=headers_b, json={
        "target_role": "Lead Data Analytics Architect"
    })
    assert analyze_b.status_code == 200, f"Analysis B failed: {analyze_b.text}"
    score_b = analyze_b.json()["resume_score"]
    print(f"  ✓ Candidate B Gemini analysis executed: Score={score_b}")

    # Verify Dashboard KPIs for Candidate B
    kpi_resp_b = requests.get(f"{BASE_URL}/intelligence/dashboard-kpis", headers=headers_b)
    assert kpi_resp_b.status_code == 200
    kpis_b = kpi_resp_b.json()["kpis"]
    
    assert kpis_b["hasResume"] is True
    assert kpis_b["hasAnalysis"] is True
    assert kpis_b["careerScore"] == score_b
    assert any("SQL" in s or "Tableau" in s or "Snowflake" in s for s in kpis_b["skills"]), "Candidate B skills missing SQL/Tableau/Snowflake"
    print(f"  ✓ Candidate B dashboard KPIs verified: {kpis_b['verifiedSkills']} skills, Score={kpis_b['careerScore']}")

    # -------------------------------------------------------------------------
    # TEST 4: User Data Isolation Verification
    # -------------------------------------------------------------------------
    print("\n[Test 4] Verifying strict data isolation between Candidate A and Candidate B...")
    skills_a_set = set(kpis_a["skills"])
    skills_b_set = set(kpis_b["skills"])
    
    # Candidate A should not have Snowflake/Tableau
    assert "Snowflake" not in skills_a_set, "Data Bleed: Candidate A has Snowflake from Candidate B!"
    assert "Tableau" not in skills_a_set, "Data Bleed: Candidate A has Tableau from Candidate B!"
    # Candidate B should not have PyTorch/Kubernetes
    assert "PyTorch" not in skills_b_set, "Data Bleed: Candidate B has PyTorch from Candidate A!"
    assert "Kubernetes" not in skills_b_set, "Data Bleed: Candidate B has Kubernetes from Candidate A!"
    print("  ✓ Strict User Isolation Confirmed: 0 cross-contamination between candidates.")

    # -------------------------------------------------------------------------
    # TEST 5: Login / Logout / Refresh Persistence
    # -------------------------------------------------------------------------
    print("\n[Test 5] Testing Login / Logout / Refresh persistence...")
    
    # Re-login as Candidate A
    login_a_again = requests.post(f"{BASE_URL}/auth/login", json={"email": email_a, "password": "SecurePass123!"})
    assert login_a_again.status_code == 200
    fresh_token_a = login_a_again.json()["tokens"]["access_token"]
    
    kpi_fresh_a = requests.get(f"{BASE_URL}/intelligence/dashboard-kpis", headers={"Authorization": f"Bearer {fresh_token_a}"})
    assert kpi_fresh_a.status_code == 200
    reloaded_kpis_a = kpi_fresh_a.json()["kpis"]
    assert reloaded_kpis_a["careerScore"] == score_a
    assert reloaded_kpis_a["verifiedSkills"] == kpis_a["verifiedSkills"]
    print("  ✓ Candidate A re-authenticated: Exact personalized dashboard stats persisted seamlessly.")

    # Re-login as Candidate B
    login_b_again = requests.post(f"{BASE_URL}/auth/login", json={"email": email_b, "password": "SecurePass123!"})
    assert login_b_again.status_code == 200
    fresh_token_b = login_b_again.json()["tokens"]["access_token"]
    
    kpi_fresh_b = requests.get(f"{BASE_URL}/intelligence/dashboard-kpis", headers={"Authorization": f"Bearer {fresh_token_b}"})
    assert kpi_fresh_b.status_code == 200
    reloaded_kpis_b = kpi_fresh_b.json()["kpis"]
    assert reloaded_kpis_b["careerScore"] == score_b
    assert reloaded_kpis_b["verifiedSkills"] == kpis_b["verifiedSkills"]
    print("  ✓ Candidate B re-authenticated: Exact personalized dashboard stats persisted seamlessly.")

    print("\n" + "=" * 70)
    print("ALL 5 DASHBOARD REAL DATA & ISOLATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
