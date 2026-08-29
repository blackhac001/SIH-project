import uuid
from datetime import date, datetime, timezone
import pytest
from app.models.role import Role, RoleEnum
from app.models.geography import District, Occupation
from app.models.skill import Skill, CandidateSkill, JobSkill, ProficiencyLevel
from app.models.candidate import Candidate, CandidateProfile, GenderEnum, CandidateEmploymentStatus
from app.models.training import (
    Programme, TrainingProvider, TrainingCentre, Course, Batch, Training, Assessment, Certification,
    ProviderType, BatchStatus, TrainingCompletionStatus, AssessmentResult
)
from app.models.employment import (
    Employer, Job, Application, Placement, EmploymentRecord,
    CompanyType, EmploymentType, PlacementType, PlacementStatus, TrainingRelevance, VerificationStatus
)
from app.models.follow_up import FollowUp, FollowUpType, RetentionStatus
from app.models.governance import Consent, AuditLog, ConsentPurpose, ConsentDataCategory


def test_full_longitudinal_lifecycle_models(db):
    # 1. District & Occupation
    dist = District(name="Pune Test", code="MH-PU-TEST", state="Maharashtra")
    db.add(dist)
    occ = Occupation(code="NCO-TEST.01", title="Test Specialist", sector="Automotive")
    db.add(occ)
    db.flush()

    # 2. Skill
    skill = Skill(code="SKL-TEST-01", name="Test Battery Assembly", category="Automotive")
    db.add(skill)
    db.flush()

    # 3. Training Provider, Centre, Course, Batch
    prov = TrainingProvider(
        uuid=str(uuid.uuid4()),
        code="VTP-TEST-01",
        name="Test Vocational Center",
        provider_type=ProviderType.GOVT_ITI,
        district_id=dist.id
    )
    db.add(prov)
    db.flush()

    centre = TrainingCentre(provider_id=prov.id, centre_code="CTR-TEST-01", name="Center A", district_id=dist.id)
    db.add(centre)
    course = Course(code="QP-TEST-01", title="EV Tech", sector="Automotive", nsqf_level=5, provider_id=prov.id)
    db.add(course)
    db.flush()

    batch = Batch(
        uuid=str(uuid.uuid4()),
        course_id=course.id,
        centre_id=centre.id,
        batch_code="BAT-TEST-01",
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 30),
        status=BatchStatus.COMPLETED
    )
    db.add(batch)
    db.flush()

    # 4. Candidate
    cand = Candidate(
        candidate_id="MSI-2026-999999",
        uuid=str(uuid.uuid4()),
        full_name="Rajesh Tester",
        gender=GenderEnum.MALE,
        dob=date(2001, 5, 15),
        district_id=dist.id,
        employment_status=CandidateEmploymentStatus.EMPLOYED
    )
    db.add(cand)
    db.flush()

    # Profile & Skill with generic external reference structure
    prof = CandidateProfile(
        candidate_id=cand.id,
        bio="Test Bio",
        external_references=[
            {
                "external_system": "STATE_VOCATIONAL_REGISTRY",
                "external_reference": "REG-TEST-123",
                "reference_type": "REGISTRATION_NUMBER",
                "verified": True
            }
        ]
    )
    db.add(prof)
    cand_skill = CandidateSkill(
        candidate_id=cand.id,
        skill_id=skill.id,
        proficiency_level=ProficiencyLevel.ADVANCED,
        is_verified=True
    )
    db.add(cand_skill)
    db.flush()

    # 5. Training
    trg = Training(
        uuid=str(uuid.uuid4()),
        candidate_id=cand.id,
        batch_id=batch.id,
        enrollment_date=date(2025, 1, 1),
        completion_status=TrainingCompletionStatus.COMPLETED,
        attendance_percentage=95.0
    )
    db.add(trg)
    db.flush()

    # 6. Assessment & Certification
    ass = Assessment(
        uuid=str(uuid.uuid4()),
        training_id=trg.id,
        candidate_id=cand.id,
        assessment_date=date(2025, 6, 25),
        agency_name="State Assessors",
        score_marks=88.5,
        result=AssessmentResult.PASS
    )
    db.add(ass)
    db.flush()

    cert = Certification(
        uuid=str(uuid.uuid4()),
        candidate_id=cand.id,
        assessment_id=ass.id,
        course_id=course.id,
        certificate_number="CRT-TEST-999999",
        issue_date=date(2025, 6, 28)
    )
    db.add(cert)
    db.flush()

    # 7. Employer, Job, Placement, Employment Record
    emp = Employer(
        uuid=str(uuid.uuid4()),
        employer_code="EMP-TEST-01",
        company_name="Test Motors Ltd",
        industry_sector="Automotive",
        company_type=CompanyType.CORPORATE,
        district_id=dist.id
    )
    db.add(emp)
    db.flush()

    job = Job(
        uuid=str(uuid.uuid4()),
        employer_id=emp.id,
        title="EV Technician",
        occupation_id=occ.id,
        district_id=dist.id,
        min_salary=25000,
        max_salary=30000
    )
    db.add(job)
    db.flush()

    plc = Placement(
        uuid=str(uuid.uuid4()),
        candidate_id=cand.id,
        training_id=trg.id,
        employer_id=emp.id,
        job_id=job.id,
        offer_date=date(2025, 7, 1),
        offered_salary=25000,
        placement_type=PlacementType.CAMPUS,
        status=PlacementStatus.JOINED
    )
    db.add(plc)
    db.flush()

    emp_rec = EmploymentRecord(
        uuid=str(uuid.uuid4()),
        candidate_id=cand.id,
        employer_id=emp.id,
        job_id=job.id,
        placement_id=plc.id,
        company_name="Test Motors Ltd",
        designation="EV Technician",
        joining_date=date(2025, 7, 15),
        salary_min=25000,
        salary_max=30000,
        relevance_to_training=TrainingRelevance.HIGH,
        verification_status=VerificationStatus.EMPLOYER_VERIFIED,
        is_current=True
    )
    db.add(emp_rec)
    db.flush()

    # 8. Follow-up
    fu = FollowUp(
        uuid=str(uuid.uuid4()),
        candidate_id=cand.id,
        employment_record_id=emp_rec.id,
        scheduled_date=date(2025, 8, 15),
        completed_date=date(2025, 8, 16),
        follow_up_type=FollowUpType.DAY_30,
        employment_status="EMPLOYED",
        retention_status=RetentionStatus.RETAINED
    )
    db.add(fu)

    # 9. DPDP Consent & Audit
    consent = Consent(
        uuid=str(uuid.uuid4()),
        candidate_id=cand.id,
        purpose=ConsentPurpose.LONGITUDINAL_TRACKING,
        data_category=ConsentDataCategory.EMPLOYMENT_HISTORY,
        granted=True
    )
    db.add(consent)

    audit = AuditLog(
        action="TEST_ACTION",
        entity="Candidate",
        entity_id=cand.candidate_id,
        ip_address="127.0.0.1"
    )
    db.add(audit)
    db.commit()

    # Verification queries
    fetched_cand = db.query(Candidate).filter(Candidate.candidate_id == "MSI-2026-999999").first()
    assert fetched_cand is not None
    assert fetched_cand.full_name == "Rajesh Tester"
    assert len(fetched_cand.trainings) == 1
    assert len(fetched_cand.certifications) == 1
    assert len(fetched_cand.employment_records) == 1
    assert len(fetched_cand.follow_ups) == 1
    assert len(fetched_cand.consents) == 1
    assert fetched_cand.profile.external_references[0]["external_reference"] == "REG-TEST-123"
