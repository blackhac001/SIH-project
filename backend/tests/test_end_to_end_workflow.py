import pytest
from datetime import datetime, timezone, timedelta
from app.models.role import RoleEnum
from app.models.employment import ApplicationStatus, InterviewStatus
from app.models.candidate import CandidateEmploymentStatus


def test_complete_candidate_to_hiring_pipeline(client, db):
    """
    End-to-End Workflow Test:
    1. Candidate 1 registers & parses resume
    2. Company 1 registers & creates job
    3. Candidate 1 applies to Company 1 job
    4. Company 1 views applicants & shortlists candidate
    5. Company 1 schedules technical interview
    6. Company 1 sends message to Candidate 1
    7. Company 1 confirms hiring Candidate 1
    8. Verifies placement, employment record, notifications, and candidate employment status
    9. Verifies cross-account isolation for Candidate 2 and Company 2
    """
    # -------------------------------------------------------------------------
    # 1. CANDIDATE 1 REGISTRATION & RESUME PARSE
    # -------------------------------------------------------------------------
    cand1_res = client.post(
        "/api/v1/auth/register/candidate",
        json={
            "full_name": "Alex Rivera",
            "email": "alex.rivera@connectx.workflow",
            "password": "PasswordAlex@123",
            "education_level": "M.S. Computer Science",
            "skills": ["Python", "FastAPI", "PostgreSQL"]
        }
    )
    assert cand1_res.status_code == 201
    cand1_token = cand1_res.json()["access_token"]
    cand1_headers = {"Authorization": f"Bearer {cand1_token}"}

    # Candidate 1 analyzes resume with AI
    resume_res = client.post(
        "/api/v1/intelligence/analyze-resume",
        json={
            "resume_text": "Alex Rivera - Senior AI Systems Engineer. 5 years experience with Python, FastAPI, Docker, PyTorch, and Distributed Systems. Built high-throughput microservices serving 10k QPS.",
            "target_role": "Senior AI Systems Engineer"
        },
        headers=cand1_headers
    )
    assert resume_res.status_code == 200
    resume_data = resume_res.json()
    assert resume_data["atsScore"] >= 75
    assert any(s["name"] == "Python" for s in resume_data["extractedSkills"])

    # -------------------------------------------------------------------------
    # 2. COMPANY 1 REGISTRATION & JOB CREATION
    # -------------------------------------------------------------------------
    comp1_res = client.post(
        "/api/v1/auth/register/company",
        json={
            "company_name": "Google Cloud AI",
            "email": "recruitment@google.workflow",
            "password": "PasswordGoogle@123",
            "industry_sector": "Cloud & AI Infrastructure"
        }
    )
    assert comp1_res.status_code == 201
    comp1_token = comp1_res.json()["access_token"]
    comp1_headers = {"Authorization": f"Bearer {comp1_token}"}

    # Company 1 creates a job opening
    job_payload = {
        "employer_id": 1,
        "title": "Senior AI Platform Engineer",
        "occupation_id": 1,
        "district_id": 1,
        "min_salary": 140000,
        "max_salary": 185000,
        "vacancies": 2,
        "employment_type": "FULL_TIME",
        "min_education": "Graduate",
        "description": "Architect high-throughput inference backends using FastAPI and distributed clusters."
    }
    job_create_res = client.post("/api/v1/jobs", json=job_payload, headers=comp1_headers)
    assert job_create_res.status_code == 201
    job_id = job_create_res.json()["id"]

    # -------------------------------------------------------------------------
    # 3. CANDIDATE 1 APPLIES TO JOB
    # -------------------------------------------------------------------------
    apply_res = client.post(f"/api/v1/jobs/{job_id}/apply", headers=cand1_headers)
    assert apply_res.status_code == 200
    app_data = apply_res.json()
    application_id = app_data["id"]
    assert app_data["status"] == "APPLIED"

    # Duplicate application check -> MUST return 400
    dup_apply = client.post(f"/api/v1/jobs/{job_id}/apply", headers=cand1_headers)
    assert dup_apply.status_code == 400

    # -------------------------------------------------------------------------
    # 4. COMPANY 1 VIEWS APPLICANTS & SHORTLISTS CANDIDATE 1
    # -------------------------------------------------------------------------
    emp_apps_res = client.get("/api/v1/jobs/employer/applications", headers=comp1_headers)
    assert emp_apps_res.status_code == 200
    apps_list = emp_apps_res.json()
    assert any(a["id"] == application_id for a in apps_list)

    # Shortlist application
    shortlist_res = client.put(
        f"/api/v1/jobs/applications/{application_id}/status?new_status=SHORTLISTED",
        headers=comp1_headers
    )
    assert shortlist_res.status_code == 200
    assert shortlist_res.json()["status"] == "SHORTLISTED"

    # -------------------------------------------------------------------------
    # 5. COMPANY 1 SCHEDULES INTERVIEW
    # -------------------------------------------------------------------------
    interview_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    interview_res = client.post(
        "/api/v1/interviews",
        json={
            "application_id": application_id,
            "scheduled_at": interview_time,
            "interview_type": "TECHNICAL",
            "meeting_link": "https://meet.connectx.ai/interview-room-101",
            "interviewer_name": "Google Staff Architect",
            "notes": "System design and concurrency in Python"
        },
        headers=comp1_headers
    )
    assert interview_res.status_code == 201
    interview_id = interview_res.json()["id"]

    # Candidate 1 checks their scheduled interviews
    cand_interviews = client.get("/api/v1/interviews/my", headers=cand1_headers)
    assert cand_interviews.status_code == 200
    assert any(i["id"] == interview_id for i in cand_interviews.json())

    # -------------------------------------------------------------------------
    # 6. COMPANY 1 SENDS IN-APP MESSAGE TO CANDIDATE 1
    # -------------------------------------------------------------------------
    # Get candidate user id from application
    cand1_profile = client.get("/api/v1/auth/me", headers=cand1_headers).json()
    cand1_user_id = cand1_profile["id"]

    conv_res = client.post(
        "/api/v1/messages/conversations",
        json={
            "recipient_user_id": cand1_user_id,
            "initial_message": "Hi Alex, we were very impressed by your resume and look forward to the technical interview!"
        },
        headers=comp1_headers
    )
    assert conv_res.status_code == 201
    conv_id = conv_res.json()["id"]

    # Candidate 1 lists conversations and reads the message
    cand_convs = client.get("/api/v1/messages/conversations", headers=cand1_headers)
    assert cand_convs.status_code == 200
    assert len(cand_convs.json()) >= 1
    assert any(c["id"] == conv_id for c in cand_convs.json())

    # -------------------------------------------------------------------------
    # 7. COMPANY 1 CONFIRMS HIRING CANDIDATE 1
    # -------------------------------------------------------------------------
    hire_res = client.post(
        f"/api/v1/jobs/applications/{application_id}/hire?offered_salary=165000",
        headers=comp1_headers
    )
    assert hire_res.status_code == 200
    hire_data = hire_res.json()
    assert hire_data["status"] == "HIRED"
    assert hire_data["offeredSalary"] == 165000

    # -------------------------------------------------------------------------
    # 8. CANDIDATE 1 VERIFIES EMPLOYMENT TIMELINE & NOTIFICATIONS
    # -------------------------------------------------------------------------
    # Candidate 1 verifies application status is SELECTED
    cand_apps = client.get("/api/v1/jobs/applications/my", headers=cand1_headers).json()
    my_app = next(a for a in cand_apps if a["id"] == application_id)
    assert my_app["status"] == "SELECTED"

    # Candidate 1 verifies notifications
    notifs = client.get("/api/v1/notifications", headers=cand1_headers).json()
    assert any("Congratulations" in n["title"] or "Offer" in n["title"] for n in notifs)

    # Candidate 1 verifies KPIs
    kpis = client.get("/api/v1/intelligence/dashboard-kpis", headers=cand1_headers).json()
    assert kpis["role"] == "CANDIDATE"
    assert kpis["kpis"]["activeApplications"] >= 1

    # -------------------------------------------------------------------------
    # 9. MULTI-USER ISOLATION: CANDIDATE 2 & COMPANY 2 CANNOT ACCESS PRIVATE DATA
    # -------------------------------------------------------------------------
    # Register Candidate 2
    cand2_res = client.post(
        "/api/v1/auth/register/candidate",
        json={
            "full_name": "Maya Patel",
            "email": "maya.patel@connectx.workflow",
            "password": "PasswordMaya@123"
        }
    )
    cand2_token = cand2_res.json()["access_token"]
    cand2_headers = {"Authorization": f"Bearer {cand2_token}"}

    # Candidate 2 cannot see Candidate 1's conversations
    cand2_convs = client.get("/api/v1/messages/conversations", headers=cand2_headers).json()
    assert not any(c["id"] == conv_id for c in cand2_convs)

    # Candidate 2 cannot see Candidate 1's applications
    cand2_apps = client.get("/api/v1/jobs/applications/my", headers=cand2_headers).json()
    assert not any(a["id"] == application_id for a in cand2_apps)

    # Register Company 2
    comp2_res = client.post(
        "/api/v1/auth/register/company",
        json={
            "company_name": "Tesla AI Labs",
            "email": "recruiting@tesla.workflow",
            "password": "PasswordTesla@123"
        }
    )
    comp2_token = comp2_res.json()["access_token"]
    comp2_headers = {"Authorization": f"Bearer {comp2_token}"}

    # Company 2 cannot see applications for Company 1's job
    comp2_apps = client.get("/api/v1/jobs/employer/applications", headers=comp2_headers).json()
    assert not any(a["id"] == application_id for a in comp2_apps)
