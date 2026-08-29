"""
Authoritative, Idempotent Seed Script for CONNECTX
Global Skill-to-Employment Intelligence Platform
"Your Skills. Their Opportunities. A Better Future."

Populates:
- 6 System RBAC Roles
- Demo Stakeholder Accounts (Candidate, Company, Recruiter, Training Provider, Admin)
- 10 Regional Districts
- 20 High-Demand Vocational Skills
- 10 Standard Occupations (NCO Aligned)
- 5 Vocational Training Providers (VTPs / ITIs) with Training Centres
- 10 Accredited Courses & Batches
- 5 Major Industry Employers
- 20 Active Job Postings
- 20 Candidates with Complete Longitudinal Outcome Lifecycles:
  (Training → Assessment → Certification → Placement → Employment → Follow-Up → Consent)
"""
import sys
import uuid
from datetime import date, datetime, timezone
from os.path import abspath, dirname
from sqlalchemy import inspect

backend_path = abspath(dirname(__file__))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.core.database import SessionLocal, engine
from app.models.role import Role, RoleEnum
from app.models.user import User
from app.models.geography import District, Occupation
from app.models.skill import Skill, CandidateSkill, JobSkill, CourseSkill, ProficiencyLevel
from app.models.candidate import Candidate, CandidateProfile, GenderEnum, CandidateEmploymentStatus
from app.models.training import (
    Programme, TrainingProvider, TrainingCentre, Course, Batch, Training, Assessment, Certification,
    ProviderType, BatchStatus, TrainingCompletionStatus, AssessmentResult
)
from app.models.employment import (
    Employer, Job, Placement, EmploymentRecord,
    CompanyType, EmploymentType, JobStatus, PlacementType, PlacementStatus,
    TrainingRelevance, VerificationStatus
)
from app.models.follow_up import FollowUp, FollowUpType, RetentionStatus
from app.models.governance import (
    Consent, AuditLog, ConsentPurpose, ConsentDataCategory
)
from app.auth.password import get_password_hash


def seed():
    print("==================================================================")
    print("[CONNECTX] Seeding Database (Idempotent Execution)")
    print("==================================================================")

    # Verify that schema exists (managed via Alembic)
    inspector = inspect(engine)
    if not inspector.has_table("roles") or not inspector.has_table("candidates"):
        print("\n[ERROR] Database schema not found!")
        print("Please run Alembic migrations first:")
        print("  alembic upgrade head")
        print("==================================================================")
        sys.exit(1)

    db = SessionLocal()

    try:
        # 1. ROLES
        print("\n[1/10] Verifying System Roles...")
        roles_data = [
            (RoleEnum.SUPER_ADMIN, "Super Administrator", "Full system governance and global platform settings"),
            (RoleEnum.STATE_ADMIN, "Regional / State Administrator", "Regional workforce intelligence & policy oversight"),
            (RoleEnum.DISTRICT_OFFICER, "Workforce Operations Officer", "District-level monitoring, provider audits and verification"),
            (RoleEnum.TRAINING_PROVIDER, "Training Provider / Academy", "Course creation, candidate enrollment & certifications"),
            (RoleEnum.EMPLOYER, "Employer / Industry Partner", "AI talent matching, hiring validation & skill gap feedback"),
            (RoleEnum.CANDIDATE, "Global Candidate / Talent", "Longitudinal career trail, skill verifications & consent"),
        ]
        roles_map = {}
        for r_name, r_disp, r_desc in roles_data:
            role = db.query(Role).filter(Role.name == r_name).first()
            if not role:
                role = Role(name=r_name, display_name=r_disp, description=r_desc)
                db.add(role)
                db.flush()
            roles_map[r_name] = role
        db.commit()
        print(f"  + {len(roles_map)} Roles verified.")

        # 2. DEMO USERS (Development / Demo Accounts Only)
        print("\n[2/10] Seeding Demo Stakeholder Accounts...")
        demo_users = [
            # CONNECTX Global Demo Accounts
            {
                "email": "alex.rivera@connectx.ai",
                "password": "Candidate@12345",
                "full_name": "Alex Rivera",
                "phone_number": "+1 415 555 0192",
                "role": RoleEnum.CANDIDATE,
                "district": "Pune",
                "organization_name": None,
                "consent_given": True,
            },
            {
                "email": "recruitment@google.com",
                "password": "Employer@12345",
                "full_name": "Elena Rostova (Google Cloud AI)",
                "phone_number": "+1 650 253 0000",
                "role": RoleEnum.EMPLOYER,
                "district": "Pune",
                "organization_name": "Google Cloud AI",
                "consent_given": True,
            },
            {
                "email": "director@mit-academy.edu",
                "password": "Partner@12345",
                "full_name": "Prof. Sofia Lin",
                "phone_number": "+1 617 253 1000",
                "role": RoleEnum.TRAINING_PROVIDER,
                "district": "Pune",
                "organization_name": "MIT Tech Academy",
                "consent_given": True,
            },
            {
                "email": "admin@connectx.ai",
                "password": "Admin@12345",
                "full_name": "Dr. Marcus Vance (Global Admin)",
                "phone_number": "+1 202 555 0184",
                "role": RoleEnum.SUPER_ADMIN,
                "district": "Mumbai City",
                "organization_name": "CONNECTX Global Intelligence",
                "consent_given": True,
            },
            # Additional Regional Demo Accounts
            {
                "email": "superadmin@mahaskill.gov.in",
                "password": "Admin@12345",
                "full_name": "Dr. Rajeshwar Patil (Super Admin)",
                "phone_number": "+91 9820011221",
                "role": RoleEnum.SUPER_ADMIN,
                "district": "Mumbai City",
                "organization_name": "Govt of Maharashtra - IT Directorate",
                "consent_given": True,
            },
            {
                "email": "stateadmin@mahaskill.gov.in",
                "password": "Admin@12345",
                "full_name": "Smt. Sunita Deshmukh (State Admin)",
                "phone_number": "+91 9820011222",
                "role": RoleEnum.STATE_ADMIN,
                "district": "Mumbai Suburban",
                "organization_name": "Dept of Skill, Employment & Innovation",
                "consent_given": True,
            },
            {
                "email": "officer.pune@mahaskill.gov.in",
                "password": "Officer@12345",
                "full_name": "Shri. Ramesh Gaikwad (DSDO Pune)",
                "phone_number": "+91 9820011223",
                "role": RoleEnum.DISTRICT_OFFICER,
                "district": "Pune",
                "organization_name": "District Skill Development Pune",
                "consent_given": True,
            },
            {
                "email": "vtp.pune@mahaskill.org",
                "password": "Partner@12345",
                "full_name": "Prof. Anand Joshi (VTP Director)",
                "phone_number": "+91 9820011224",
                "role": RoleEnum.TRAINING_PROVIDER,
                "district": "Pune",
                "organization_name": "Government ITI Aundh Pune",
                "consent_given": True,
            },
            {
                "email": "hr.tcs@tcs.com",
                "password": "Employer@12345",
                "full_name": "Pooja Kulkarni (HR Lead)",
                "phone_number": "+91 9820011225",
                "role": RoleEnum.EMPLOYER,
                "district": "Pune",
                "organization_name": "Tata Consultancy Services Ltd",
                "consent_given": True,
            },
            {
                "email": "aarav.sharma@mahaskill.in",
                "password": "Candidate@12345",
                "full_name": "Aarav Sharma",
                "phone_number": "+91 9820011226",
                "role": RoleEnum.CANDIDATE,
                "district": "Pune",
                "organization_name": None,
                "consent_given": True,
            },
        ]
        users_map = {}
        for u in demo_users:
            user = db.query(User).filter(User.email == u["email"]).first()
            if not user:
                user = User(
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    full_name=u["full_name"],
                    phone_number=u["phone_number"],
                    role_id=roles_map[u["role"]].id,
                    district=u["district"],
                    organization_name=u["organization_name"],
                    consent_given=u["consent_given"],
                    consent_date=datetime.now(timezone.utc) if u["consent_given"] else None,
                    is_active=True,
                    is_verified=True,
                )
                db.add(user)
                db.flush()
            users_map[u["email"]] = user
        db.commit()
        print(f"  + {len(users_map)} Demo Accounts verified.")

        # 3. DISTRICTS (10 Key Maharashtra Districts)
        print("\n[3/10] Seeding 10 Maharashtra Districts...")
        districts_data = [
            ("Mumbai City", "MH-MC", "Konkan"),
            ("Mumbai Suburban", "MH-MS", "Konkan"),
            ("Pune", "MH-PU", "Pune"),
            ("Nagpur", "MH-NG", "Vidarbha"),
            ("Nashik", "MH-NS", "Khandesh / North Maharashtra"),
            ("Chhatrapati Sambhajinagar", "MH-CS", "Marathwada"),
            ("Thane", "MH-TH", "Konkan"),
            ("Kolhapur", "MH-KL", "Pune Division / South Maharashtra"),
            ("Solapur", "MH-SO", "Pune Division / Solapur"),
            ("Amravati", "MH-AM", "Vidarbha"),
        ]
        districts_map = {}
        for d_name, d_code, d_div in districts_data:
            dist = db.query(District).filter(District.code == d_code).first()
            if not dist:
                dist = District(name=d_name, code=d_code, division=d_div, state="Maharashtra", is_active=True)
                db.add(dist)
                db.flush()
            districts_map[d_name] = dist
        db.commit()
        print(f"  + {len(districts_map)} Districts seeded.")

        # 4. SKILLS (20 Market-Relevant Skills)
        print("\n[4/10] Seeding 20 High-Demand Skills...")
        skills_data = [
            ("SKL-PY-01", "Python Programming", "Technical / IT", "Core Python, Scripting & Backend Logic"),
            ("SKL-CNC-02", "CNC Machining & Turning", "Manufacturing", "Operating CNC Turning and Milling centers"),
            ("SKL-EV-03", "Electric Vehicle Diagnostics", "Automotive", "EV Battery Pack assembly & diagnostic servicing"),
            ("SKL-SOL-04", "Solar PV System Installation", "Green Energy", "Rooftop and ground-mount PV array installation"),
            ("SKL-PLC-05", "Industrial Automation & PLC", "Manufacturing", "Siemens & Allen-Bradley ladder logic & SCADA"),
            ("SKL-DA-06", "Data Analytics & SQL", "Technical / IT", "Data querying, reporting, and dashboard creation"),
            ("SKL-ACC-07", "Tally Prime & GST Accounting", "Financial Services", "Corporate ledger maintenance, invoicing, GST"),
            ("SKL-GDA-08", "Nursing & Patient Care (GDA)", "Healthcare", "Patient hygiene, vitals recording & bedside assistance"),
            ("SKL-HOS-09", "Hospitality Front Office & F&B", "Tourism & Hospitality", "Guest management, reservation systems & dining"),
            ("SKL-WLD-10", "MIG & TIG Welding", "Capital Goods", "Precision welding & structural steel fabrication"),
            ("SKL-CAD-11", "CAD / SolidWorks Mechanical Drafting", "Engineering", "2D/3D component modeling and blueprints"),
            ("SKL-TEX-12", "Industrial Garment Tailoring", "Apparel & Textiles", "Power sewing machines, pattern cutting & stitching"),
            ("SKL-CYB-13", "Cyber Security & Network Defense", "Technical / IT", "Network firewalls, threat monitoring & audits"),
            ("SKL-LOG-14", "Heavy Commercial Vehicle Driving", "Logistics & Transport", "HCV driving, safety protocols & route GPS"),
            ("SKL-FOD-15", "Food Processing & Quality Testing", "Food Industry", "HACCP hygiene, food packaging & chemical analysis"),
            ("SKL-CLD-16", "Cloud Infrastructure (AWS/Azure)", "Technical / IT", "Compute instances, S3 storage & cloud networking"),
            ("SKL-MEC-17", "Mechatronics & Sensor Calibration", "Electronics", "Microcontrollers, robotics & sensor integration"),
            ("SKL-RET-18", "Retail Store Operations & POS", "Retail", "Inventory auditing, cash handling & customer support"),
            ("SKL-MKT-19", "Digital Marketing & SEO", "Marketing / Media", "Campaign management, social media & analytics"),
            ("SKL-PLM-20", "Plumbing & Sanitation Engineering", "Construction", "Pipe fitting, wastewater systems & pressure testing"),
        ]
        skills_map = {}
        for s_code, s_name, s_cat, s_desc in skills_data:
            skill = db.query(Skill).filter(Skill.code == s_code).first()
            if not skill:
                skill = Skill(code=s_code, name=s_name, category=s_cat, description=s_desc, is_active=True)
                db.add(skill)
                db.flush()
            skills_map[s_code] = skill
        db.commit()
        print(f"  + {len(skills_map)} Skills seeded.")

        # 5. OCCUPATIONS (10 Standard Roles)
        print("\n[5/10] Seeding 10 Occupations...")
        occupations_data = [
            ("NCO-2512.01", "Junior Software Developer", "IT & ITES", "Develops and maintains software applications"),
            ("NCO-7223.01", "CNC Machine Operator", "Capital Goods & Automotive", "Operates CNC lathes and machining centers"),
            ("NCO-7231.02", "Electric Vehicle Service Technician", "Automotive", "Diagnoses and repairs electric vehicles"),
            ("NCO-7421.03", "Solar PV Installation Technician", "Green Jobs", "Installs and maintains solar power setups"),
            ("NCO-3119.04", "PLC & Automation Specialist", "Manufacturing", "Programs automation controllers and sensors"),
            ("NCO-4311.01", "Accounts & GST Assistant", "BFSI", "Manages financial accounts, GST returns and invoices"),
            ("NCO-5321.01", "General Duty Healthcare Assistant", "Healthcare", "Assists nurses with patient monitoring and care"),
            ("NCO-5131.02", "Hospitality Service Executive", "Tourism & Hospitality", "Handles front office and guest services"),
            ("NCO-7212.01", "Advanced Welder & Fabricator", "Capital Goods", "Performs TIG, MIG, and arc welding"),
            ("NCO-3118.01", "Mechanical CAD Drafter", "Engineering Design", "Prepares engineering CAD drawings"),
        ]
        occupations_map = {}
        for o_code, o_title, o_sec, o_desc in occupations_data:
            occ = db.query(Occupation).filter(Occupation.code == o_code).first()
            if not occ:
                occ = Occupation(code=o_code, title=o_title, sector=o_sec, description=o_desc, is_active=True)
                db.add(occ)
                db.flush()
            occupations_map[o_code] = occ
        db.commit()
        print(f"  + {len(occupations_map)} Occupations seeded.")

        # 6. PROGRAMMES & TRAINING PROVIDERS (5 VTPs)
        print("\n[6/10] Seeding Programmes & 5 Training Providers...")
        prog = db.query(Programme).filter(Programme.code == "PMKVY-MH-2026").first()
        if not prog:
            prog = Programme(
                code="PMKVY-MH-2026",
                name="Maharashtra State Kaushalya Vikas Programme",
                sponsoring_department="DVET Maharashtra",
                description="State flagship skilling scheme for youth employability and wage progression",
                is_active=True
            )
            db.add(prog)
            db.flush()

        vtp_user = users_map.get("vtp.pune@mahaskill.org")
        vtp_user_id = vtp_user.id if vtp_user else None

        providers_data = [
            ("VTP-PUN-001", "Government ITI Aundh Pune", ProviderType.GOVT_ITI, "Pune", "Aundh Road, Pune - 411007", vtp_user_id),
            ("VTP-MUM-002", "DVET Apex Skill Center Kurla", ProviderType.GOVT_ITI, "Mumbai Suburban", "Kurla West, Mumbai - 400070", None),
            ("VTP-NAG-003", "Maharashtra State Skill Academy", ProviderType.PMKK, "Nagpur", "MIDC Butibori, Nagpur - 441122", None),
            ("VTP-NSK-004", "Nashik Regional Vocational Institute", ProviderType.PVT_ITI, "Nashik", "Satpur MIDC, Nashik - 422007", None),
            ("VTP-CSB-005", "Marathwada Skill Excellence Center", ProviderType.PRIVATE_PARTNER, "Chhatrapati Sambhajinagar", "Waluj, CSB - 431136", None),
        ]
        providers_map = {}
        for p_code, p_name, p_type, p_dist, p_addr, p_uid in providers_data:
            prov = db.query(TrainingProvider).filter(TrainingProvider.code == p_code).first()
            if not prov:
                prov = TrainingProvider(
                    code=p_code,
                    uuid=str(uuid.uuid4()),
                    name=p_name,
                    provider_type=p_type,
                    district_id=districts_map[p_dist].id,
                    address=p_addr,
                    user_id=p_uid,
                    contact_person="Director of Skilling",
                    phone="+91 9820011224",
                    email=f"{p_code.lower()}@mahaskill.org",
                    accreditation_status="ACCREDITED",
                    is_active=True
                )
                db.add(prov)
                db.flush()

                centre = TrainingCentre(
                    provider_id=prov.id,
                    centre_code=f"CTR-{p_code}",
                    name=f"{p_name} - Main Campus",
                    district_id=districts_map[p_dist].id,
                    address=p_addr,
                    capacity=150,
                    is_active=True
                )
                db.add(centre)
                db.flush()
            providers_map[p_code] = prov
        db.commit()
        print(f"  + {len(providers_map)} Training Providers seeded.")

        # 7. COURSES (10 Courses) & BATCHES
        print("\n[7/10] Seeding 10 Accredited Courses & Batches...")
        courses_data = [
            ("QP-SOL-01", "Solar PV Rooftop System Installer", "Green Jobs", 4, 300, 100, 200, "VTP-PUN-001", ["SKL-SOL-04", "SKL-PLM-20"]),
            ("QP-EV-02", "Electric Vehicle Service Specialist", "Automotive", 5, 450, 150, 300, "VTP-PUN-001", ["SKL-EV-03", "SKL-MEC-17"]),
            ("QP-CNC-03", "CNC Turning & Milling Operator", "Capital Goods", 4, 400, 120, 280, "VTP-NSK-004", ["SKL-CNC-02", "SKL-CAD-11"]),
            ("QP-PLC-04", "Industrial Automation & PLC Technician", "Manufacturing", 5, 500, 150, 350, "VTP-PUN-001", ["SKL-PLC-05", "SKL-MEC-17"]),
            ("QP-IT-05", "Full Stack Python Web Developer", "IT & ITES", 6, 600, 200, 400, "VTP-MUM-002", ["SKL-PY-01", "SKL-DA-06", "SKL-CLD-16"]),
            ("QP-ACC-06", "Accounts Assistant using Tally & GST", "BFSI", 4, 300, 150, 150, "VTP-NAG-003", ["SKL-ACC-07", "SKL-DA-06"]),
            ("QP-GDA-07", "Healthcare General Duty Assistant", "Healthcare", 4, 400, 160, 240, "VTP-PUN-001", ["SKL-GDA-08"]),
            ("QP-WLD-08", "Advanced MIG/TIG Welder & Fabricator", "Capital Goods", 3, 350, 100, 250, "VTP-CSB-005", ["SKL-WLD-10"]),
            ("QP-HOS-09", "Hospitality & Guest Operations Associate", "Tourism & Hospitality", 4, 360, 120, 240, "VTP-MUM-002", ["SKL-HOS-09"]),
            ("QP-CAD-10", "Mechanical CAD/CAM Drafter", "Engineering", 5, 420, 140, 280, "VTP-NSK-004", ["SKL-CAD-11", "SKL-CNC-02"]),
        ]
        courses_map = {}
        batches_map = {}
        for c_code, c_title, c_sec, c_nsqf, c_dur, c_th, c_pr, c_prov, c_skills in courses_data:
            course = db.query(Course).filter(Course.code == c_code).first()
            prov = providers_map[c_prov]
            if not course:
                course = Course(
                    code=c_code,
                    title=c_title,
                    sector=c_sec,
                    nsqf_level=c_nsqf,
                    duration_hours=c_dur,
                    theory_hours=c_th,
                    practical_hours=c_pr,
                    description=f"{c_title} aligned to NSQF Level {c_nsqf}",
                    programme_id=prog.id,
                    provider_id=prov.id,
                    is_active=True
                )
                db.add(course)
                db.flush()

                for s_c in c_skills:
                    if s_c in skills_map:
                        db.add(CourseSkill(course_id=course.id, skill_id=skills_map[s_c].id))

                centre = db.query(TrainingCentre).filter(TrainingCentre.provider_id == prov.id).first()
                batch = Batch(
                    uuid=str(uuid.uuid4()),
                    course_id=course.id,
                    centre_id=centre.id,
                    batch_code=f"BAT-2025-{c_code[-2:]}",
                    start_date=date(2025, 4, 1),
                    end_date=date(2025, 9, 30),
                    target_capacity=30,
                    status=BatchStatus.COMPLETED
                )
                db.add(batch)
                db.flush()
                batches_map[c_code] = batch
            else:
                batch = db.query(Batch).filter(Batch.course_id == course.id).first()
                batches_map[c_code] = batch
            courses_map[c_code] = course
        db.commit()
        print(f"  + {len(courses_map)} Courses & Batches seeded.")

        # 8. EMPLOYERS (5 Employers)
        print("\n[8/10] Seeding 5 Key Industry Employers...")
        emp_user = users_map.get("hr.tcs@tcs.com")
        emp_user_id = emp_user.id if emp_user else None

        employers_data = [
            ("EMP-TCS-001", "Tata Consultancy Services Ltd", "IT & ITES", CompanyType.MNC, "Mumbai City", "Gateway House, Mumbai", emp_user_id, "hr.recruitment@tcs.com"),
            ("EMP-TM-002", "Tata Motors Limited", "Automotive", CompanyType.CORPORATE, "Pune", "Pimpri Works, Pune", None, "hr.recruitment@tatamotors.com"),
            ("EMP-LT-003", "L&T Electrical & Automation", "Manufacturing", CompanyType.CORPORATE, "Thane", "MIDC Mahape, Navi Mumbai", None, "hr.recruitment@larsentoubro.com"),
            ("EMP-KIR-004", "Kirloskar Brothers Limited", "Manufacturing", CompanyType.CORPORATE, "Pune", "Udyog Bhavan, Pune", None, "hr.recruitment@kirloskar.com"),
            ("EMP-SYM-005", "Symbiosis University Hospital & Research Centre", "Healthcare", CompanyType.CORPORATE, "Pune", "Lavale, Pune", None, "hr.recruitment@symbiosis.org"),
        ]
        employers_map = {}
        for e_code, e_name, e_sec, e_type, e_dist, e_addr, e_uid, e_email in employers_data:
            emp = db.query(Employer).filter(Employer.employer_code == e_code).first()
            if not emp:
                emp = Employer(
                    uuid=str(uuid.uuid4()),
                    employer_code=e_code,
                    company_name=e_name,
                    industry_sector=e_sec,
                    company_type=e_type,
                    district_id=districts_map[e_dist].id,
                    address=e_addr,
                    user_id=e_uid,
                    hr_name="HR Recruitment Lead",
                    hr_email=e_email,
                    hr_phone="+91 9820011225",
                    cin_or_gst=f"27AAACT{e_code.replace('-', '')[:4]}1234F1Z5",
                    is_active=True
                )
                db.add(emp)
                db.flush()
            else:
                emp.hr_email = e_email
                db.flush()
            employers_map[e_code] = emp
        db.commit()
        print(f"  + {len(employers_map)} Employers seeded.")

        # 9. JOBS (20 Jobs - Idempotent Check)
        print("\n[9/10] Seeding 20 Real-world Job Postings...")
        jobs_data = [
            ("EMP-TCS-001", "Junior Python Backend Developer", "NCO-2512.01", "Mumbai City", 25000, 35000, 5, ["SKL-PY-01", "SKL-DA-06"]),
            ("EMP-TCS-001", "Junior Data Analyst & SQL Reporter", "NCO-2512.01", "Pune", 22000, 30000, 4, ["SKL-DA-06", "SKL-PY-01"]),
            ("EMP-TM-002", "EV Battery Diagnostic Technician", "NCO-7231.02", "Pune", 20000, 28000, 8, ["SKL-EV-03", "SKL-MEC-17"]),
            ("EMP-TM-002", "CNC Machine Operator - Turning", "NCO-7223.01", "Pune", 18000, 24000, 10, ["SKL-CNC-02"]),
            ("EMP-TM-002", "Junior Robotic Welder & Quality Inspector", "NCO-7212.01", "Pune", 19000, 25000, 6, ["SKL-WLD-10"]),
            ("EMP-LT-003", "PLC Automation & SCADA Engineer", "NCO-3119.04", "Thane", 24000, 32000, 4, ["SKL-PLC-05", "SKL-MEC-17"]),
            ("EMP-LT-003", "Rooftop Solar PV Installation Lead", "NCO-7421.03", "Thane", 20000, 26000, 5, ["SKL-SOL-04", "SKL-PLM-20"]),
            ("EMP-LT-003", "Electrical CAD Drafter", "NCO-3118.01", "Thane", 18000, 24000, 3, ["SKL-CAD-11"]),
            ("EMP-KIR-004", "Industrial Pump Assembly & CNC Operator", "NCO-7223.01", "Pune", 17500, 23000, 6, ["SKL-CNC-02"]),
            ("EMP-KIR-004", "Mechanical CAD Design Assistant", "NCO-3118.01", "Pune", 20000, 26000, 3, ["SKL-CAD-11", "SKL-CNC-02"]),
            ("EMP-KIR-004", "Accounts & GST Invoicing Assistant", "NCO-4311.01", "Pune", 16000, 22000, 2, ["SKL-ACC-07"]),
            ("EMP-SYM-005", "General Duty Assistant - Ward Support", "NCO-5321.01", "Pune", 16000, 21000, 12, ["SKL-GDA-08"]),
            ("EMP-SYM-005", "Patient Care & Diagnostic Assistant", "NCO-5321.01", "Pune", 17000, 22000, 8, ["SKL-GDA-08"]),
            ("EMP-TCS-001", "Cloud Infrastructure Support Associate", "NCO-2512.01", "Mumbai Suburban", 24000, 32000, 4, ["SKL-CLD-16", "SKL-PY-01"]),
            ("EMP-TM-002", "Automotive Mechatronics Assembly Worker", "NCO-7231.02", "Pune", 19500, 26000, 7, ["SKL-MEC-17", "SKL-EV-03"]),
            ("EMP-LT-003", "Solar Micro-grid Maintenance Technician", "NCO-7421.03", "Nashik", 19000, 25000, 4, ["SKL-SOL-04"]),
            ("EMP-KIR-004", "Precision TIG Welder for Pressure Vessels", "NCO-7212.01", "Pune", 21000, 27000, 4, ["SKL-WLD-10"]),
            ("EMP-SYM-005", "Hospital Billing & Insurance Desk Assistant", "NCO-4311.01", "Pune", 18000, 24000, 3, ["SKL-ACC-07"]),
            ("EMP-TCS-001", "Cyber Security SOC Tier 1 Analyst", "NCO-2512.01", "Pune", 26000, 36000, 3, ["SKL-CYB-13"]),
            ("EMP-LT-003", "Industrial Sensor Maintenance Technician", "NCO-3119.04", "Chhatrapati Sambhajinagar", 20000, 27000, 5, ["SKL-MEC-17", "SKL-PLC-05"]),
        ]
        jobs_list = []
        for e_code, j_title, o_code, j_dist, s_min, s_max, vac, req_skills in jobs_data:
            emp = employers_map[e_code]
            occ = occupations_map[o_code]
            dist = districts_map[j_dist]

            # Idempotent Job lookup
            job = db.query(Job).filter(
                Job.employer_id == emp.id,
                Job.title == j_title,
                Job.district_id == dist.id
            ).first()

            if not job:
                job = Job(
                    uuid=str(uuid.uuid4()),
                    employer_id=emp.id,
                    title=j_title,
                    occupation_id=occ.id,
                    district_id=dist.id,
                    min_salary=s_min,
                    max_salary=s_max,
                    vacancies=vac,
                    employment_type=EmploymentType.FULL_TIME,
                    min_education="10th + ITI / Diploma / Degree",
                    min_experience_months=0,
                    description=f"Job opportunity for {j_title} in {j_dist}",
                    status=JobStatus.OPEN
                )
                db.add(job)
                db.flush()

                for sk in req_skills:
                    if sk in skills_map:
                        db.add(JobSkill(job_id=job.id, skill_id=skills_map[sk].id, required_level=ProficiencyLevel.INTERMEDIATE))
            jobs_list.append(job)
        db.commit()
        print(f"  + {len(jobs_list)} Jobs seeded.")

        # 10. CANDIDATES (20 Candidates with Complete Longitudinal Lifecycles)
        print("\n[10/10] Seeding 20 Candidates with Full Longitudinal Lifecycles...")
        cand_user = users_map.get("aarav.sharma@mahaskill.in")
        cand_user_id = cand_user.id if cand_user else None

        candidates_raw = [
            ("Aarav Sharma", GenderEnum.MALE, "General", "ITI Electrician", "aarav.sharma@mahaskill.in", "9820011226", "Pune", CandidateEmploymentStatus.EMPLOYED, "QP-EV-02", "SKL-EV-03", 0, cand_user_id),
            ("Pooja Shinde", GenderEnum.FEMALE, "OBC", "Diploma Computer", "pooja.shinde@mahaskill.in", "9820011227", "Mumbai Suburban", CandidateEmploymentStatus.EMPLOYED, "QP-IT-05", "SKL-PY-01", 0, None),
            ("Rohan Deshpande", GenderEnum.MALE, "General", "ITI Fitter", "rohan.d@mahaskill.in", "9820011228", "Pune", CandidateEmploymentStatus.EMPLOYED, "QP-CNC-03", "SKL-CNC-02", 3, None),
            ("Snehal Jadhav", GenderEnum.FEMALE, "SEBC", "12th Pass", "snehal.j@mahaskill.in", "9820011229", "Pune", CandidateEmploymentStatus.EMPLOYED, "QP-GDA-07", "SKL-GDA-08", 11, None),
            ("Vikram Thorat", GenderEnum.MALE, "SC", "ITI Wireman", "vikram.t@mahaskill.in", "9820011230", "Thane", CandidateEmploymentStatus.EMPLOYED, "QP-SOL-01", "SKL-SOL-04", 6, None),
            ("Aniket Kadam", GenderEnum.MALE, "OBC", "Diploma Electrical", "aniket.k@mahaskill.in", "9820011231", "Pune", CandidateEmploymentStatus.EMPLOYED, "QP-PLC-04", "SKL-PLC-05", 5, None),
            ("Kavita More", GenderEnum.FEMALE, "General", "B.Com", "kavita.m@mahaskill.in", "9820011232", "Nagpur", CandidateEmploymentStatus.EMPLOYED, "QP-ACC-06", "SKL-ACC-07", 10, None),
            ("Ganesh Bhosale", GenderEnum.MALE, "EWS", "ITI Welder", "ganesh.b@mahaskill.in", "9820011233", "Chhatrapati Sambhajinagar", CandidateEmploymentStatus.EMPLOYED, "QP-WLD-08", "SKL-WLD-10", 4, None),
            ("Deepak Chavan", GenderEnum.MALE, "ST", "ITI Draughtsman", "deepak.c@mahaskill.in", "9820011234", "Nashik", CandidateEmploymentStatus.EMPLOYED, "QP-CAD-10", "SKL-CAD-11", 7, None),
            ("Priya Gaikwad", GenderEnum.FEMALE, "SC", "12th Pass", "priya.g@mahaskill.in", "9820011235", "Mumbai City", CandidateEmploymentStatus.EMPLOYED, "QP-HOS-09", "SKL-HOS-09", 13, None),
            ("Siddharth Patil", GenderEnum.MALE, "OBC", "Diploma Mechanical", "siddharth.p@mahaskill.in", "9820011236", "Pune", CandidateEmploymentStatus.EMPLOYED, "QP-EV-02", "SKL-EV-03", 2, None),
            ("Manish Pawar", GenderEnum.MALE, "General", "B.Sc IT", "manish.p@mahaskill.in", "9820011237", "Pune", CandidateEmploymentStatus.EMPLOYED, "QP-IT-05", "SKL-PY-01", 18, None),
            ("Meera Sonawane", GenderEnum.FEMALE, "SEBC", "12th Pass", "meera.s@mahaskill.in", "9820011238", "Pune", CandidateEmploymentStatus.EMPLOYED, "QP-GDA-07", "SKL-GDA-08", 12, None),
            ("Suraj Salunkhe", GenderEnum.MALE, "OBC", "ITI Electrician", "suraj.s@mahaskill.in", "9820011239", "Nashik", CandidateEmploymentStatus.EMPLOYED, "QP-SOL-01", "SKL-SOL-04", 15, None),
            ("Nikhil Wagh", GenderEnum.MALE, "General", "Diploma Electronics", "nikhil.w@mahaskill.in", "9820011240", "Chhatrapati Sambhajinagar", CandidateEmploymentStatus.EMPLOYED, "QP-PLC-04", "SKL-PLC-05", 19, None),
            ("Swati Mane", GenderEnum.FEMALE, "General", "B.Com", "swati.m@mahaskill.in", "9820011241", "Kolhapur", CandidateEmploymentStatus.EMPLOYED, "QP-ACC-06", "SKL-ACC-07", 17, None),
            ("Rahul Sawant", GenderEnum.MALE, "OBC", "ITI Machinist", "rahul.s@mahaskill.in", "9820011242", "Pune", CandidateEmploymentStatus.EMPLOYED, "QP-CNC-03", "SKL-CNC-02", 8, None),
            ("Aditya Khare", GenderEnum.MALE, "General", "Diploma IT", "aditya.k@mahaskill.in", "9820011243", "Mumbai City", CandidateEmploymentStatus.EMPLOYED, "QP-IT-05", "SKL-PY-01", 1, None),
            ("Varsha Joshi", GenderEnum.FEMALE, "General", "ITI Draughtsman", "varsha.j@mahaskill.in", "9820011244", "Pune", CandidateEmploymentStatus.EMPLOYED, "QP-CAD-10", "SKL-CAD-11", 9, None),
            ("Ajay Ingle", GenderEnum.MALE, "SC", "ITI Welder", "ajay.i@mahaskill.in", "9820011245", "Amravati", CandidateEmploymentStatus.EMPLOYED, "QP-WLD-08", "SKL-WLD-10", 16, None),
        ]

        for idx, (c_name, c_gen, c_cat, c_edu, c_email, c_ph, c_dist, c_status, c_qp, c_sk, j_idx, c_uid) in enumerate(candidates_raw, start=1):
            ref_id = f"MSI-2026-{idx:06d}"
            cand = db.query(Candidate).filter(Candidate.candidate_id == ref_id).first()
            if not cand:
                cand = Candidate(
                    candidate_id=ref_id,
                    uuid=str(uuid.uuid4()),
                    user_id=c_uid,
                    full_name=c_name,
                    gender=c_gen,
                    dob=date(2002, (idx % 12) + 1, (idx % 28) + 1),
                    social_category=c_cat,
                    education_level=c_edu,
                    phone=c_ph,
                    email=c_email,
                    district_id=districts_map[c_dist].id,
                    address=f"Plot {idx * 12}, {c_dist} City",
                    pincode=f"4110{idx:02d}",
                    employment_status=c_status,
                    is_active=True
                )
                db.add(cand)
                db.flush()

                # Generic External Reference structure (No Aadhaar or assumed specific identity numbers)
                db.add(CandidateProfile(
                    candidate_id=cand.id,
                    bio=f"Certified {c_edu} professional specializing in {skills_map[c_sk].name}.",
                    preferred_locations=[c_dist, "Pune", "Mumbai City"],
                    expected_salary_min=18000 + (idx * 500),
                    external_references=[
                        {
                            "external_system": "STATE_VOCATIONAL_REGISTRY",
                            "external_reference": f"REG-MH-2026-{idx:05d}",
                            "reference_type": "REGISTRATION_NUMBER",
                            "verified": True,
                        }
                    ]
                ))

                # Candidate Skill
                db.add(CandidateSkill(
                    candidate_id=cand.id,
                    skill_id=skills_map[c_sk].id,
                    proficiency_level=ProficiencyLevel.ADVANCED,
                    is_verified=True,
                    verified_by="DVET Maharashtra Assessor"
                ))

                # 1. Training (Stage 1)
                batch = batches_map[c_qp]
                training = Training(
                    uuid=str(uuid.uuid4()),
                    candidate_id=cand.id,
                    batch_id=batch.id,
                    enrollment_date=date(2025, 4, 1),
                    completion_status=TrainingCompletionStatus.COMPLETED,
                    attendance_percentage=92.5 + (idx % 7)
                )
                db.add(training)
                db.flush()

                # 2. Assessment (Stage 2)
                assessment = Assessment(
                    uuid=str(uuid.uuid4()),
                    training_id=training.id,
                    candidate_id=cand.id,
                    assessment_date=date(2025, 9, 25),
                    agency_name="Maharashtra State Board of Skill Assessment",
                    score_marks=82.0 + (idx % 15),
                    total_marks=100.0,
                    result=AssessmentResult.PASS,
                    assessor_id=f"ASSR-{idx:03d}"
                )
                db.add(assessment)
                db.flush()

                # 3. Certification (Stage 3)
                cert = Certification(
                    uuid=str(uuid.uuid4()),
                    candidate_id=cand.id,
                    assessment_id=assessment.id,
                    course_id=batch.course_id,
                    certificate_number=f"CRT-MH-2025-{idx:06d}",
                    issue_date=date(2025, 9, 28),
                    valid_until=date(2030, 9, 28),
                    verification_hash=f"0x{uuid.uuid4().hex[:16]}"
                )
                db.add(cert)
                db.flush()

                # 4. Placement (Stage 4)
                job = jobs_list[j_idx]
                placement = Placement(
                    uuid=str(uuid.uuid4()),
                    candidate_id=cand.id,
                    training_id=training.id,
                    employer_id=job.employer_id,
                    job_id=job.id,
                    offer_date=date(2025, 10, 5),
                    joining_date=date(2025, 10, 15),
                    offered_salary=job.min_salary or 20000,
                    placement_type=PlacementType.CAMPUS,
                    status=PlacementStatus.JOINED
                )
                db.add(placement)
                db.flush()

                # 5. Employment Record (Stage 5 - Active Employment & Wage Progression)
                emp_rec = EmploymentRecord(
                    uuid=str(uuid.uuid4()),
                    candidate_id=cand.id,
                    employer_id=job.employer_id,
                    job_id=job.id,
                    placement_id=placement.id,
                    company_name=job.employer.company_name,
                    designation=job.title,
                    joining_date=date(2025, 10, 15),
                    salary_min=job.min_salary,
                    salary_max=job.max_salary,
                    employment_type=EmploymentType.FULL_TIME,
                    location=c_dist,
                    relevance_to_training=TrainingRelevance.HIGH,
                    verification_status=VerificationStatus.EMPLOYER_VERIFIED,
                    is_current=True
                )
                db.add(emp_rec)
                db.flush()

                # 6. Follow-ups (Stage 6 - Retention: 30-Day & 90-Day Milestones)
                f30 = FollowUp(
                    uuid=str(uuid.uuid4()),
                    candidate_id=cand.id,
                    employment_record_id=emp_rec.id,
                    scheduled_date=date(2025, 11, 15),
                    completed_date=date(2025, 11, 16),
                    follow_up_type=FollowUpType.DAY_30,
                    employment_status="EMPLOYED",
                    salary_band=f"{job.min_salary//1000}k-{job.max_salary//1000}k",
                    current_job=job.title,
                    retention_status=RetentionStatus.RETAINED,
                    notes="Candidate successfully onboarded, reports high satisfaction."
                )
                db.add(f30)

                f90 = FollowUp(
                    uuid=str(uuid.uuid4()),
                    candidate_id=cand.id,
                    employment_record_id=emp_rec.id,
                    scheduled_date=date(2026, 1, 15),
                    completed_date=date(2026, 1, 16),
                    follow_up_type=FollowUpType.DAY_90,
                    employment_status="EMPLOYED",
                    salary_band=f"{job.min_salary//1000}k-{job.max_salary//1000}k",
                    current_job=job.title,
                    retention_status=RetentionStatus.RETAINED,
                    notes="Candidate completed probation, employer confirms high skill fit."
                )
                db.add(f90)

                # 7. DPDP Consents (Full History)
                db.add(Consent(
                    uuid=str(uuid.uuid4()),
                    candidate_id=cand.id,
                    purpose=ConsentPurpose.LONGITUDINAL_TRACKING,
                    data_category=ConsentDataCategory.EMPLOYMENT_HISTORY,
                    granted=True,
                    granted_at=datetime(2025, 4, 1, 10, 0, 0, tzinfo=timezone.utc),
                    consent_version="1.0"
                ))
                db.add(Consent(
                    uuid=str(uuid.uuid4()),
                    candidate_id=cand.id,
                    purpose=ConsentPurpose.EMPLOYER_VERIFICATION,
                    data_category=ConsentDataCategory.SALARY_DATA,
                    granted=True,
                    granted_at=datetime(2025, 10, 15, 9, 30, 0, tzinfo=timezone.utc),
                    consent_version="1.0"
                ))

        db.commit()
        print("  + 20 Candidates with full 8-stage longitudinal histories verified.")

        # Record System Seed Audit Log if not already recorded
        existing_audit = db.query(AuditLog).filter(AuditLog.action == "SYSTEM_DATABASE_SEEDED").first()
        if not existing_audit:
            db.add(AuditLog(
                action="SYSTEM_DATABASE_SEEDED",
                entity="Database",
                entity_id="ALL",
                timestamp=datetime.now(timezone.utc),
                ip_address="127.0.0.1",
                metadata_json={
                    "districts_seeded": len(districts_data),
                    "skills_seeded": len(skills_data),
                    "occupations_seeded": len(occupations_data),
                    "providers_seeded": len(providers_data),
                    "courses_seeded": len(courses_data),
                    "employers_seeded": len(employers_data),
                    "jobs_seeded": len(jobs_data),
                    "candidates_seeded": len(candidates_raw)
                }
            ))
            db.commit()

        print("\n==================================================================")
        print("[SUCCESS] DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("==================================================================")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
