import pytest
from app.models.role import RoleEnum
from app.models.geography import District, Occupation


@pytest.fixture
def auth_headers(client):
    # Register & get auth token
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "api.tester@mahaskill.gov.in",
            "password": "Password@123",
            "full_name": "API Tester",
            "role_name": RoleEnum.STATE_ADMIN.value,
        }
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def seed_dist_and_occ(db):
    dist = District(name="Pune Test Dist", code="PUN-T1", state="Maharashtra")
    db.add(dist)
    occ = Occupation(code="NCO-T1", title="Tech Drafter", sector="Design")
    db.add(occ)
    db.commit()
    return dist, occ


def test_health_with_registered_models(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["online", "healthy"]
    assert data["registered_models_count"] >= 20
    assert "candidates" in data["models"]
    assert "employment_records" in data["models"]
    assert "consents" in data["models"]


def test_skills_crud(client, auth_headers):
    # Create Skill
    skill_payload = {
        "code": "SKL-TST-01",
        "name": "Automated Testing Skill",
        "category": "Software Testing",
        "description": "Pytest and API validation"
    }
    create_res = client.post("/api/v1/skills", json=skill_payload, headers=auth_headers)
    assert create_res.status_code == 201
    skill_id = create_res.json()["id"]

    # List Skills
    list_res = client.get("/api/v1/skills", headers=auth_headers)
    assert list_res.status_code == 200
    skills = list_res.json()
    assert any(s["code"] == "SKL-TST-01" for s in skills)

    # Get Single Skill
    get_res = client.get(f"/api/v1/skills/{skill_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Automated Testing Skill"


def test_training_providers_crud(client, auth_headers, seed_dist_and_occ):
    dist, _ = seed_dist_and_occ
    provider_payload = {
        "code": "VTP-TEST-99",
        "name": "Apex Test Polytechnic",
        "provider_type": "POLYTECHNIC",
        "district_id": dist.id,
        "address": "Polytechnic Campus, Pune",
        "accreditation_status": "ACCREDITED"
    }
    create_res = client.post("/api/v1/training-providers", json=provider_payload, headers=auth_headers)
    assert create_res.status_code == 201
    prov_id = create_res.json()["id"]

    list_res = client.get("/api/v1/training-providers", headers=auth_headers)
    assert list_res.status_code == 200
    assert any(p["code"] == "VTP-TEST-99" for p in list_res.json())


def test_courses_crud(client, auth_headers):
    course_payload = {
        "code": "QP-TEST-99",
        "title": "Industrial IoT Specialist",
        "sector": "Electronics",
        "nsqf_level": 5,
        "duration_hours": 300,
        "theory_hours": 100,
        "practical_hours": 200
    }
    create_res = client.post("/api/v1/courses", json=course_payload, headers=auth_headers)
    assert create_res.status_code == 201

    list_res = client.get("/api/v1/courses", headers=auth_headers)
    assert list_res.status_code == 200
    assert any(c["code"] == "QP-TEST-99" for c in list_res.json())


def test_employers_and_jobs_crud(client, auth_headers, seed_dist_and_occ):
    dist, occ = seed_dist_and_occ
    # Create Employer
    emp_payload = {
        "employer_code": "EMP-TST-99",
        "company_name": "Innovative Tech Solutions",
        "industry_sector": "Information Technology",
        "company_type": "CORPORATE",
        "district_id": dist.id
    }
    emp_res = client.post("/api/v1/employers", json=emp_payload, headers=auth_headers)
    assert emp_res.status_code == 201
    emp_id = emp_res.json()["id"]

    # Create Job
    job_payload = {
        "employer_id": emp_id,
        "title": "Software Test Engineer",
        "occupation_id": occ.id,
        "district_id": dist.id,
        "min_salary": 25000,
        "max_salary": 35000,
        "vacancies": 3,
        "employment_type": "FULL_TIME"
    }
    job_res = client.post("/api/v1/jobs", json=job_payload, headers=auth_headers)
    assert job_res.status_code == 201

    list_res = client.get("/api/v1/jobs", headers=auth_headers)
    assert list_res.status_code == 200
    assert any(j["title"] == "Software Test Engineer" for j in list_res.json())


def test_candidate_crud(client, auth_headers, seed_dist_and_occ):
    dist, _ = seed_dist_and_occ

    cand_payload = {
        "full_name": "Sunil Gaikwad",
        "gender": "MALE",
        "dob": "2000-08-20",
        "education_level": "ITI Machinist",
        "phone": "9820011999",
        "email": "sunil.g@mahaskill.in",
        "district_id": dist.id,
        "employment_status": "EMPLOYED",
        "profile": {
            "bio": "Machinist with 2 years lathe experience",
            "expected_salary_min": 22000,
            "external_references": [
                {
                    "external_system": "STATE_VOCATIONAL_REGISTRY",
                    "external_reference": "REG-TEST-999",
                    "reference_type": "REGISTRATION_NUMBER",
                    "verified": True
                }
            ]
        }
    }
    create_res = client.post("/api/v1/candidates", json=cand_payload, headers=auth_headers)
    assert create_res.status_code == 201
    cand_data = create_res.json()
    assert cand_data["candidate_id"].startswith("MSI-") or cand_data["candidate_id"].startswith("CTX-")
    assert cand_data["full_name"] == "Sunil Gaikwad"
    cand_ref = cand_data["candidate_id"]

    # Fetch by human readable reference
    get_res = client.get(f"/api/v1/candidates/{cand_ref}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["candidate_id"] == cand_ref
    ext_refs = get_res.json()["profile"]["external_references"]
    assert len(ext_refs) >= 1
    assert ext_refs[0]["external_system"] == "STATE_VOCATIONAL_REGISTRY"
    assert ext_refs[0]["external_reference"] == "REG-TEST-999"

    # List candidates with filter
    list_res = client.get(f"/api/v1/candidates?search=Sunil", headers=auth_headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1
