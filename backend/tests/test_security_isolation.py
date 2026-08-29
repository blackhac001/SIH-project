import pytest
from app.models.role import RoleEnum
from app.models.user import User


def test_candidate_data_isolation(client, db):
    """Verify Candidate A cannot access or modify Candidate B's private data."""
    # 1. Register Candidate A
    res_a = client.post(
        "/api/v1/auth/register/candidate",
        json={
            "full_name": "Candidate Alpha",
            "email": "candidate.alpha@connectx.test",
            "password": "PasswordAlpha@123",
            "education_level": "B.Tech Computer Science",
            "skills": ["Python", "FastAPI"]
        }
    )
    assert res_a.status_code == 201
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register Candidate B
    res_b = client.post(
        "/api/v1/auth/register/candidate",
        json={
            "full_name": "Candidate Beta",
            "email": "candidate.beta@connectx.test",
            "password": "PasswordBeta@123",
            "education_level": "M.S. Data Science",
            "skills": ["Kubernetes", "PyTorch"]
        }
    )
    assert res_b.status_code == 201
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Verify /candidates/me resolves strictly to own identity
    me_a = client.get("/api/v1/candidates/me", headers=headers_a)
    assert me_a.status_code == 200
    cand_a_data = me_a.json()
    assert cand_a_data["full_name"] == "Candidate Alpha"
    assert cand_a_data["email"] == "candidate.alpha@connectx.test"

    me_b = client.get("/api/v1/candidates/me", headers=headers_b)
    assert me_b.status_code == 200
    cand_b_data = me_b.json()
    assert cand_b_data["full_name"] == "Candidate Beta"
    assert cand_b_data["email"] == "candidate.beta@connectx.test"

    cand_a_id = cand_a_data["id"]

    # 4. Candidate B attempts to access Candidate A by ID -> MUST return 403 Forbidden
    cross_get = client.get(f"/api/v1/candidates/{cand_a_id}", headers=headers_b)
    assert cross_get.status_code == 403
    assert "permission" in cross_get.json()["detail"].lower()

    # 5. Candidate B attempts to update Candidate A by ID -> MUST return 403 Forbidden
    cross_put = client.put(
        f"/api/v1/candidates/{cand_a_id}",
        json={"full_name": "Hacked Candidate Alpha"},
        headers=headers_b
    )
    assert cross_put.status_code == 403


def test_company_data_isolation(client, db):
    """Verify Company A cannot access or modify Company B's private profile."""
    # 1. Register Company A
    res_a = client.post(
        "/api/v1/auth/register/company",
        json={
            "company_name": "Company Alpha Inc",
            "email": "hr@alpha.test",
            "password": "PasswordCompA@123",
            "industry_sector": "Cloud Computing"
        }
    )
    assert res_a.status_code == 201
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register Company B
    res_b = client.post(
        "/api/v1/auth/register/company",
        json={
            "company_name": "Company Beta Corp",
            "email": "hr@beta.test",
            "password": "PasswordCompB@123",
            "industry_sector": "Biotech AI"
        }
    )
    assert res_b.status_code == 201
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Verify /employers/me resolves strictly to own company
    me_a = client.get("/api/v1/employers/me", headers=headers_a)
    assert me_a.status_code == 200
    comp_a_data = me_a.json()
    assert comp_a_data["company_name"] == "Company Alpha Inc"

    me_b = client.get("/api/v1/employers/me", headers=headers_b)
    assert me_b.status_code == 200
    comp_b_data = me_b.json()
    assert comp_b_data["company_name"] == "Company Beta Corp"

    comp_a_id = comp_a_data["id"]

    # 4. Company B attempts to update Company A -> MUST return 403 Forbidden
    cross_put = client.put(
        f"/api/v1/employers/{comp_a_id}",
        json={
            "company_name": "Hacked Alpha Corp",
            "employer_code": comp_a_data["employer_code"],
            "industry_sector": "Malicious Sector",
            "district_id": comp_a_data["district_id"]
        },
        headers=headers_b
    )
    assert cross_put.status_code == 403


def test_role_access_segregation(client, db):
    """Verify non-admin roles cannot access admin endpoints."""
    # Register Candidate
    res_cand = client.post(
        "/api/v1/auth/register/candidate",
        json={
            "full_name": "Candidate Isolation Tester",
            "email": "candidate.segregation@connectx.test",
            "password": "Password@123"
        }
    )
    token_cand = res_cand.json()["access_token"]

    # Register Employer
    res_emp = client.post(
        "/api/v1/auth/register/company",
        json={
            "company_name": "Employer Segregation",
            "email": "employer.segregation@connectx.test",
            "password": "Password@123"
        }
    )
    token_emp = res_emp.json()["access_token"]

    # Register Admin
    res_admin = client.post(
        "/api/v1/auth/register",
        json={
            "email": "superadmin.isolation@connectx.test",
            "password": "Password@123",
            "full_name": "Super Admin User",
            "role_name": RoleEnum.SUPER_ADMIN.value
        }
    )
    token_admin = res_admin.json()["access_token"]

    # 1. Candidate accessing /users (Admin endpoint) -> 403
    cand_users = client.get("/api/v1/users/", headers={"Authorization": f"Bearer {token_cand}"})
    assert cand_users.status_code == 403

    # 2. Employer accessing /users (Admin endpoint) -> 403
    emp_users = client.get("/api/v1/users/", headers={"Authorization": f"Bearer {token_emp}"})
    assert emp_users.status_code == 403

    # 3. Super Admin accessing /users -> 200 OK
    admin_users = client.get("/api/v1/users/", headers={"Authorization": f"Bearer {token_admin}"})
    assert admin_users.status_code == 200


def test_authentication_failures(client, db):
    """Verify invalid password, missing token, and inactive account protections."""
    # Register test user
    client.post(
        "/api/v1/auth/register/candidate",
        json={
            "full_name": "Auth Fail Tester",
            "email": "auth.fail@connectx.test",
            "password": "CorrectPassword@123"
        }
    )

    # 1. Invalid password -> 401 with generic error
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": "auth.fail@connectx.test", "password": "WrongPassword"}
    )
    assert bad_login.status_code == 401
    assert "Invalid email or password." in bad_login.json()["detail"]

    # 2. Non-existent account -> 401 with generic error (no account enumeration)
    no_user_login = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@connectx.test", "password": "AnyPassword"}
    )
    assert no_user_login.status_code == 401
    assert "Invalid email or password." in no_user_login.json()["detail"]

    # 3. Missing token -> 401
    no_token = client.get("/api/v1/auth/me")
    assert no_token.status_code == 401

    # 4. Inactive account -> 400
    user = db.query(User).filter(User.email == "auth.fail@connectx.test").first()
    user.is_active = False
    db.commit()

    inactive_login = client.post(
        "/api/v1/auth/login",
        json={"email": "auth.fail@connectx.test", "password": "CorrectPassword@123"}
    )
    assert inactive_login.status_code == 400
    assert "deactivated" in inactive_login.json()["detail"].lower() or "inactive" in inactive_login.json()["detail"].lower()
