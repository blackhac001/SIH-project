"""
Comprehensive End-to-End Verification Test for CONNECTX Authentication & Registration
Uses standard library urllib (0 external dependencies) to test HTTP API.
Tests:
1. Candidate Registration (Unique Email)
2. Company Registration (Unique Email)
3. Recruiter Registration (Unique Email)
4. Training Provider (Academy) Registration (Unique Email)
5. Duplicate Email Registration (Expecting HTTP 409 Conflict)
6. Login using newly created user accounts
7. Correct Role & User Profile returned (/me endpoint)
8. Existing / Seeded Demo Users Authentication
"""
import sys
import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000/api/v1"

def api_request(method: str, endpoint: str, data: dict = None, token: str = None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status_code = response.getcode()
            body = json.loads(response.read().decode("utf-8"))
            return status_code, body
    except urllib.error.HTTPError as e:
        status_code = e.code
        try:
            body = json.loads(e.read().decode("utf-8"))
        except Exception:
            body = {"detail": str(e)}
        return status_code, body
    except Exception as e:
        return 500, {"detail": str(e)}

def print_result(test_name: str, passed: bool, details: str = ""):
    status_str = " PASS " if passed else " FAIL "
    color_prefix = "\033[92m" if passed else "\033[91m"
    color_reset = "\033[0m"
    print(f"[{color_prefix}{status_str}{color_reset}] {test_name}")
    if details:
        print(f"       -> {details}")

def run_tests():
    print("==================================================================")
    print("CONNECTX REGISTRATION & AUTHENTICATION END-TO-END VERIFICATION")
    print("==================================================================")

    all_passed = True
    ts = int(time.time())

    # 1. Candidate Registration
    cand_email = f"candidate_{ts}@connectx.ai"
    cand_payload = {
        "full_name": "Swarup Lohar",
        "email": cand_email,
        "password": "Candidate@12345",
        "phone_number": "+91 9876543210",
        "education_level": "Graduate / B.Tech",
        "skills": ["Python Programming", "Data Analytics & SQL", "Cloud Infrastructure (AWS/Azure)"],
        "district": "Pune",
        "country": "India",
        "consent_given": True
    }
    status_code, body = api_request("POST", "/auth/register/candidate", cand_payload)
    cand_ok = status_code == 201 and "access_token" in body and body["user"]["role"] == "CANDIDATE"
    all_passed = all_passed and cand_ok
    print_result("Test 1: Candidate Registration", cand_ok, f"Status: {status_code}, User: {body.get('user', {}).get('email')}, Role: {body.get('user', {}).get('role')}")
    cand_token = body.get("access_token")

    # 2. Company Registration
    comp_email = f"company_{ts}@connectx.ai"
    company_payload = {
        "company_name": f"Apex Robotics {ts}",
        "email": comp_email,
        "password": "Company@12345",
        "industry_sector": "Artificial Intelligence & Robotics",
        "company_type": "STARTUP",
        "website": "https://apexrobotics.ai",
        "address": "Baner IT Park, Pune",
        "district": "Pune",
        "country": "India",
        "phone_number": "+91 9822334455"
    }
    status_code, body = api_request("POST", "/auth/register/company", company_payload)
    comp_ok = status_code == 201 and "access_token" in body and body["user"]["role"] == "EMPLOYER"
    all_passed = all_passed and comp_ok
    print_result("Test 2: Company Registration", comp_ok, f"Status: {status_code}, Company: {body.get('user', {}).get('organization_name')}, Role: {body.get('user', {}).get('role')}")

    # 3. Recruiter Registration
    rec_email = f"recruiter_{ts}@connectx.ai"
    recruiter_payload = {
        "full_name": "Vikram Malhotra",
        "email": rec_email,
        "password": "Recruiter@12345",
        "company_name": "Global Talent Search Ltd",
        "job_title": "Lead Technical Recruiter",
        "phone_number": "+91 9811223344"
    }
    status_code, body = api_request("POST", "/auth/register/recruiter", recruiter_payload)
    rec_ok = status_code == 201 and "access_token" in body and body["user"]["role"] == "EMPLOYER"
    all_passed = all_passed and rec_ok
    print_result("Test 3: Recruiter Registration", rec_ok, f"Status: {status_code}, Recruiter: {body.get('user', {}).get('full_name')}, Role: {body.get('user', {}).get('role')}")

    # 4. Academy / Provider Registration
    prov_email = f"provider_{ts}@connectx.ai"
    provider_payload = {
        "name": f"Maharashtra Cyber Academy {ts}",
        "email": prov_email,
        "password": "Academy@12345",
        "provider_type": "PRIVATE_PARTNER",
        "district": "Pune",
        "country": "India",
        "address": "Shivajinagar, Pune - 411005",
        "phone_number": "+91 9833445566"
    }
    status_code, body = api_request("POST", "/auth/register/provider", provider_payload)
    prov_ok = status_code == 201 and "access_token" in body and body["user"]["role"] == "TRAINING_PROVIDER"
    all_passed = all_passed and prov_ok
    print_result("Test 4: Training Provider / Academy Registration", prov_ok, f"Status: {status_code}, Academy: {body.get('user', {}).get('organization_name')}, Role: {body.get('user', {}).get('role')}")

    # 5. Duplicate Email Registration (Expected 409 Conflict)
    status_code, body = api_request("POST", "/auth/register/candidate", cand_payload)
    dup_ok = status_code == 409 and "already exists" in body.get("detail", "")
    all_passed = all_passed and dup_ok
    print_result("Test 5: Duplicate Email Rejection (409 Conflict)", dup_ok, f"Status: {status_code}, Error Detail: {body.get('detail')}")

    # 6. Login using newly created user account
    login_payload = {
        "email": cand_email,
        "password": "Candidate@12345"
    }
    status_code, body = api_request("POST", "/auth/login", login_payload)
    login_ok = status_code == 200 and "access_token" in body and body["user"]["email"] == cand_email
    all_passed = all_passed and login_ok
    print_result("Test 6: Login with Newly Created Candidate", login_ok, f"Status: {status_code}, Email: {body.get('user', {}).get('email')}, Role: {body.get('user', {}).get('role')}")
    login_token = body.get("access_token")

    # 7. Verify /me Endpoint with Bearer Token
    status_code, body = api_request("GET", "/auth/me", token=login_token)
    me_ok = status_code == 200 and body.get("email") == cand_email and body.get("role") == "CANDIDATE"
    all_passed = all_passed and me_ok
    print_result("Test 7: Authenticated Profile Fetch (/auth/me)", me_ok, f"Status: {status_code}, User: {body.get('full_name')} ({body.get('email')}), Role: {body.get('role')}")

    # 8. Seeded Demo Users Authentication (Verify existing users work)
    demo_accounts = [
        ("alex.rivera@connectx.ai", "Candidate@12345", "CANDIDATE"),
        ("recruitment@google.com", "Employer@12345", "EMPLOYER"),
        ("director@mit-academy.edu", "Partner@12345", "TRAINING_PROVIDER"),
        ("admin@connectx.ai", "Admin@12345", "SUPER_ADMIN")
    ]
    demo_all_ok = True
    for email, password, exp_role in demo_accounts:
        status_code, body = api_request("POST", "/auth/login", {"email": email, "password": password})
        if status_code != 200 or body.get("user", {}).get("role") != exp_role:
            demo_all_ok = False
            print(f"       Failed for {email}: {status_code} {body}")
    all_passed = all_passed and demo_all_ok
    print_result("Test 8: Existing Demo Accounts Login", demo_all_ok, "Verified Candidate, Employer, Training Provider, and Super Admin demo accounts.")

    print("==================================================================")
    if all_passed:
        print("\033[92mALL 8 REGISTRATION & AUTHENTICATION TESTS PASSED SUCCESSFULLY!\033[0m")
    else:
        print("\033[91mSOME TESTS FAILED! CHECK OUTPUT ABOVE.\033[0m")
    print("==================================================================")
    return all_passed

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
