import pytest
from app.models.role import RoleEnum


def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["online", "healthy"]
    assert data["service"] in ["CONNECTX", "MahaSkill Insight"]


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["problem_id"] == "26135"


def test_register_candidate(client):
    payload = {
        "email": "test.candidate@mahaskill.in",
        "password": "Password@123",
        "full_name": "Test Candidate",
        "phone_number": "9998887776",
        "role_name": RoleEnum.CANDIDATE.value,
        "district": "Pune",
        "consent_given": True,
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test.candidate@mahaskill.in"
    assert data["user"]["role"] == RoleEnum.CANDIDATE.value
    assert data["user"]["consent_given"] is True


def test_login_success(client):
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login.test@mahaskill.in",
            "password": "SecurePassword@123",
            "full_name": "Login Tester",
            "role_name": RoleEnum.EMPLOYER.value,
            "organization_name": "Test Corp Ltd",
        },
    )

    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login.test@mahaskill.in",
            "password": "SecurePassword@123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == RoleEnum.EMPLOYER.value


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login.test@mahaskill.in",
            "password": "WrongPassword",
        },
    )
    assert response.status_code == 401


def test_get_current_user_me(client):
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "me.test@mahaskill.in",
            "password": "Password@123",
            "full_name": "Me Tester",
            "role_name": RoleEnum.DISTRICT_OFFICER.value,
            "district": "Nagpur",
        },
    )
    token = reg.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me.test@mahaskill.in"
    assert data["role"] == RoleEnum.DISTRICT_OFFICER.value
    assert data["district"] == "Nagpur"


def test_rbac_access_control(client):
    # Register Candidate
    candidate_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "cand.rbac@mahaskill.in",
            "password": "Password@123",
            "full_name": "Candidate RBAC",
            "role_name": RoleEnum.CANDIDATE.value,
        },
    )
    cand_token = candidate_reg.json()["access_token"]

    # Candidate trying to access Admin users endpoint -> Forbidden 403
    res_forbidden = client.get(
        "/api/v1/users/",
        headers={"Authorization": f"Bearer {cand_token}"},
    )
    assert res_forbidden.status_code == 403

    # Register State Admin
    admin_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin.rbac@mahaskill.in",
            "password": "Password@123",
            "full_name": "State Admin RBAC",
            "role_name": RoleEnum.STATE_ADMIN.value,
        },
    )
    admin_token = admin_reg.json()["access_token"]

    # State Admin accessing Admin users endpoint -> 200 OK
    res_allowed = client.get(
        "/api/v1/users/",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_allowed.status_code == 200
    users_list = res_allowed.json()
    assert len(users_list) >= 2


def test_consent_toggle(client):
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "consent.test@mahaskill.in",
            "password": "Password@123",
            "full_name": "Consent Tester",
            "role_name": RoleEnum.CANDIDATE.value,
            "consent_given": False,
        },
    )
    token = reg.json()["access_token"]

    # Update consent to True
    res = client.post(
        "/api/v1/auth/consent?consent_given=true",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.json()["consent_given"] is True
