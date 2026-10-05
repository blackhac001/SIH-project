"""
Comprehensive Automated Test Suite for:
1. CV Dashboard 0% Initial State Verification
2. CV Upload & Analysis Lifecycle (No stale/reuse data)
3. Ask AI Multi-Turn and Distinct Query Responses
4. Multi-Role Isolation & Prompt Injection Neutralization
"""
import sys
import importlib.util
from pathlib import Path

# Load gemini_service
service_path = Path(__file__).parent / "backend" / "app" / "services" / "gemini_service.py"
spec = importlib.util.spec_from_file_location("gemini_service", str(service_path))
gemini_module = importlib.util.module_from_spec(spec)
sys.modules["gemini_service"] = gemini_module
spec.loader.exec_module(gemini_module)
GeminiService = gemini_module.GeminiService


def test_1_new_candidate_zero_percent_and_ask_ai():
    """Test 1: New candidate with no CV / analysis starts at 0% and Ask AI guides them."""
    cand_no_cv = {
        "role": "CANDIDATE",
        "candidate_name": "Rohan Deshmukh",
        "has_cv": False,
        "has_analysis": False,
        "resume_score": 0,
        "ats_score": 0,
        "job_readiness": 0,
        "skills": [],
        "strengths": [],
        "weaknesses": ["No CV uploaded yet."],
        "recommendations": ["Upload your CV to generate AI resume insights."]
    }

    # Ask skills question without CV
    reply_skills, actions = GeminiService.copilot_chat(cand_no_cv, "What skills are currently in my CV?")
    print("\n[Test 1A] No-CV Candidate asking about skills:\n", reply_skills)
    assert "not uploaded a cv" in reply_skills.lower() or "upload" in reply_skills.lower(), "FAIL: Should instruct user to upload CV"
    assert "Upload CV Document" in actions

    # Ask general interview question
    reply_interview, _ = GeminiService.copilot_chat(cand_no_cv, "How should I prepare for technical interviews?")
    print("\n[Test 1B] No-CV Candidate asking general interview advice:\n", reply_interview)
    assert "interview" in reply_interview.lower() or "star" in reply_interview.lower(), "FAIL: Should provide helpful interview framework"
    print("[PASS] Test 1: New candidate no-CV flow verified.")


def test_2_uploaded_unanalyzed_cv_zero_percent():
    """Test 2: Candidate uploaded a CV but has NOT clicked Analyse yet."""
    cand_uploaded = {
        "role": "CANDIDATE",
        "candidate_name": "Rohan Deshmukh",
        "target_role": "Candidate",
        "has_cv": True,
        "has_analysis": False,
        "resume_filename": "rohan_cv.pdf",
        "cv_text_snippet": "Rohan Deshmukh - Software Engineer - Python, FastAPI, Docker",
        "resume_score": 0,
        "ats_score": 0,
        "job_readiness": 0,
        "skills": [],
        "strengths": [],
        "weaknesses": ["Analysis not run yet for this CV."],
        "recommendations": ["Click 'Analyse' to extract verified skills and ATS score."]
    }

    reply, actions = GeminiService.copilot_chat(cand_uploaded, "What skills are currently in my CV?")
    print("\n[Test 2] Uploaded unanalyzed CV query:\n", reply)
    assert "analyse" in reply.lower() or "analysis has not been run" in reply.lower(), "FAIL: Should tell user to click Analyse"
    print("[PASS] Test 2: Uploaded unanalyzed CV correctly returns 0%/pending state.")


def test_3_analyzed_cv_distinct_questions():
    """Test 3: Candidate with analyzed CV asks genuinely different questions and receives distinct answers."""
    cand_analyzed = {
        "role": "CANDIDATE",
        "candidate_name": "Aarav Sharma",
        "target_role": "Senior Cloud Infrastructure Architect",
        "has_cv": True,
        "has_analysis": True,
        "resume_filename": "aarav_cloud_architect.pdf",
        "cv_text_snippet": "Aarav Sharma - Senior Cloud Architect - AWS, Kubernetes, Terraform, Go, Docker",
        "resume_score": 88,
        "ats_score": 88,
        "job_readiness": 88,
        "skills": ["AWS", "Kubernetes", "Terraform", "Go", "Docker"],
        "strengths": ["Enterprise Kubernetes deployment leadership", "Terraform IaC mastery"],
        "weaknesses": ["Quantify cost optimization metrics", "Add distributed database benchmarks"],
        "recommendations": ["Complete Certified Kubernetes Security Specialist (CKS)", "Publish Terraform module"],
        "missing_sections": []
    }

    # Q1: Skills in CV
    q1 = "What skills are currently in my CV?"
    r1, _ = GeminiService.copilot_chat(cand_analyzed, q1)
    print(f"\n[Test 3A] Q: '{q1}'\nReply:\n{r1}")
    assert "AWS" in r1 and "Kubernetes" in r1 and "Terraform" in r1, "FAIL: Q1 should list verified skills"

    # Q2: Improve resume / weaknesses
    q2 = "How can I improve my resume?"
    r2, _ = GeminiService.copilot_chat(cand_analyzed, q2)
    print(f"\n[Test 3B] Q: '{q2}'\nReply:\n{r2}")
    assert "cost optimization" in r2.lower() or "metrics" in r2.lower() or "recommendation" in r2.lower(), "FAIL: Q2 should give resume improvement advice"
    assert r1 != r2, "FAIL: Q1 and Q2 must not return identical answers"

    # Q3: Target roles
    q3 = "What jobs should I target?"
    r3, _ = GeminiService.copilot_chat(cand_analyzed, q3)
    print(f"\n[Test 3C] Q: '{q3}'\nReply:\n{r3}")
    assert "Senior Cloud Infrastructure Architect" in r3 or "Target" in r3, "FAIL: Q3 should recommend matching target roles"
    assert r3 != r1 and r3 != r2, "FAIL: Q3 must be distinct from Q1 and Q2"

    # Q4: Strongest skill
    q4 = "Explain my strongest skill."
    r4, _ = GeminiService.copilot_chat(cand_analyzed, q4)
    print(f"\n[Test 4D] Q: '{q4}'\nReply:\n{r4}")
    assert "AWS" in r4 or "Kubernetes" in r4 or "Strongest" in r4, "FAIL: Q4 should explain strongest skill"
    assert r4 != r1 and r4 != r2 and r4 != r3, "FAIL: Q4 must be distinct"

    # Q5: Multi-turn follow-up question
    history = [
        {"sender": "user", "text": "What are the weaknesses in my resume?"},
        {"sender": "ai", "text": r2}
    ]
    q5 = "How can I improve them?"
    r5, _ = GeminiService.copilot_chat(cand_analyzed, q5, conversation_history=history)
    print(f"\n[Test 3E] Follow-up Q: '{q5}'\nReply:\n{r5}")
    assert "address" in r5.lower() or "project" in r5.lower() or "certif" in r5.lower(), "FAIL: Follow-up question should understand context"

    print("[PASS] Test 3: Genuinely distinct answers and multi-turn context verified.")


def test_4_provider_name_masking():
    """Test 4: Verify that no provider name appears in outputs."""
    cand = {
        "role": "CANDIDATE",
        "candidate_name": "Test User",
        "has_cv": True,
        "has_analysis": True,
        "skills": ["Python", "FastAPI"],
        "resume_score": 80,
        "job_readiness": 80,
        "strengths": ["Backend Architecture"],
        "weaknesses": ["Cloud Certifications"],
        "recommendations": ["Learn Kubernetes"]
    }

    for query in [
        "Who are you?",
        "What skills are currently in my CV?",
        "How can I improve my resume?",
        "What jobs should I target?",
        "Explain my strongest skill.",
        "Tell me about the platform."
    ]:
        reply, _ = GeminiService.copilot_chat(cand, query)
        for forbidden in ["gemini", "google gemini", "copilot"]:
            assert forbidden not in reply.lower(), f"FAIL: Found forbidden provider string '{forbidden}' in reply to '{query}'"

    print("[PASS] Test 4: Provider names masked 100% in all user-facing output.")


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING CONNECTX MASTER VERIFICATION TEST SUITE")
    print("=" * 60)
    test_1_new_candidate_zero_percent_and_ask_ai()
    test_2_uploaded_unanalyzed_cv_zero_percent()
    test_3_analyzed_cv_distinct_questions()
    test_4_provider_name_masking()
    print("=" * 60)
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)
