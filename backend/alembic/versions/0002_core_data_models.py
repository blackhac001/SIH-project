"""Core Data Models for Complete Longitudinal Lifecycle

Revision ID: 0002_core_data_models
Revises: 0001_initial_schema
Create Date: 2026-08-25 00:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002_core_data_models"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Districts
    op.create_table(
        'districts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=False),
        sa.Column('division', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), server_default='Maharashtra', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_districts_id'), 'districts', ['id'], unique=False)
    op.create_index(op.f('ix_districts_name'), 'districts', ['name'], unique=True)
    op.create_index(op.f('ix_districts_code'), 'districts', ['code'], unique=True)

    # 2. Occupations
    op.create_table(
        'occupations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('sector', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_occupations_id'), 'occupations', ['id'], unique=False)
    op.create_index(op.f('ix_occupations_code'), 'occupations', ['code'], unique=True)
    op.create_index(op.f('ix_occupations_title'), 'occupations', ['title'], unique=False)
    op.create_index(op.f('ix_occupations_sector'), 'occupations', ['sector'], unique=False)

    # 3. Skills
    op.create_table(
        'skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skills_id'), 'skills', ['id'], unique=False)
    op.create_index(op.f('ix_skills_code'), 'skills', ['code'], unique=True)
    op.create_index(op.f('ix_skills_name'), 'skills', ['name'], unique=True)
    op.create_index(op.f('ix_skills_category'), 'skills', ['category'], unique=False)

    # 4. Candidates
    gender_enum = sa.Enum('MALE', 'FEMALE', 'OTHER', name='genderenum')
    cand_status_enum = sa.Enum(
        'UNEMPLOYED', 'IN_TRAINING', 'ASSESSMENT_PENDING', 'CERTIFIED',
        'EMPLOYED', 'SELF_EMPLOYED', 'APPRENTICE', 'HIGHER_EDUCATION',
        name='candidateemploymentstatus'
    )
    op.create_table(
        'candidates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('candidate_id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('gender', gender_enum, nullable=False),
        sa.Column('dob', sa.Date(), nullable=True),
        sa.Column('social_category', sa.String(length=50), nullable=True),
        sa.Column('education_level', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('district_id', sa.Integer(), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('pincode', sa.String(length=10), nullable=True),
        sa.Column('employment_status', cand_status_enum, server_default='UNEMPLOYED', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_candidates_id'), 'candidates', ['id'], unique=False)
    op.create_index(op.f('ix_candidates_uuid'), 'candidates', ['uuid'], unique=True)
    op.create_index(op.f('ix_candidates_candidate_id'), 'candidates', ['candidate_id'], unique=True)
    op.create_index(op.f('ix_candidates_full_name'), 'candidates', ['full_name'], unique=False)
    op.create_index(op.f('ix_candidates_district_id'), 'candidates', ['district_id'], unique=False)
    op.create_index(op.f('ix_candidates_employment_status'), 'candidates', ['employment_status'], unique=False)

    # 5. Candidate Profiles
    op.create_table(
        'candidate_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('preferred_locations', sa.JSON(), nullable=True),
        sa.Column('expected_salary_min', sa.Integer(), nullable=True),
        sa.Column('disability_status', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('disability_type', sa.String(length=100), nullable=True),
        sa.Column('resume_url', sa.String(length=500), nullable=True),
        sa.Column('external_references', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('candidate_id')
    )
    op.create_index(op.f('ix_candidate_profiles_id'), 'candidate_profiles', ['id'], unique=False)

    # 6. Candidate Skills
    prof_enum = sa.Enum('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', name='proficiencylevel')
    op.create_table(
        'candidate_skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=False),
        sa.Column('proficiency_level', prof_enum, server_default='INTERMEDIATE', nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('verified_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('candidate_id', 'skill_id', name='uq_candidate_skill')
    )
    op.create_index(op.f('ix_candidate_skills_id'), 'candidate_skills', ['id'], unique=False)
    op.create_index(op.f('ix_candidate_skills_candidate_id'), 'candidate_skills', ['candidate_id'], unique=False)
    op.create_index(op.f('ix_candidate_skills_skill_id'), 'candidate_skills', ['skill_id'], unique=False)

    # 7. Programmes
    op.create_table(
        'programmes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('sponsoring_department', sa.String(length=255), server_default='DVET Maharashtra', nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_programmes_id'), 'programmes', ['id'], unique=False)
    op.create_index(op.f('ix_programmes_code'), 'programmes', ['code'], unique=True)

    # 8. Training Providers
    provider_type_enum = sa.Enum('GOVT_ITI', 'PVT_ITI', 'PMKK', 'POLYTECHNIC', 'PRIVATE_PARTNER', name='providertype')
    op.create_table(
        'training_providers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('provider_type', provider_type_enum, server_default='PRIVATE_PARTNER', nullable=False),
        sa.Column('district_id', sa.Integer(), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('contact_person', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('accreditation_status', sa.String(length=50), server_default='ACCREDITED', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_training_providers_id'), 'training_providers', ['id'], unique=False)
    op.create_index(op.f('ix_training_providers_uuid'), 'training_providers', ['uuid'], unique=True)
    op.create_index(op.f('ix_training_providers_code'), 'training_providers', ['code'], unique=True)
    op.create_index(op.f('ix_training_providers_name'), 'training_providers', ['name'], unique=False)

    # 9. Training Centres
    op.create_table(
        'training_centres',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('provider_id', sa.Integer(), nullable=False),
        sa.Column('centre_code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('district_id', sa.Integer(), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('capacity', sa.Integer(), server_default='100', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['provider_id'], ['training_providers.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_training_centres_id'), 'training_centres', ['id'], unique=False)
    op.create_index(op.f('ix_training_centres_centre_code'), 'training_centres', ['centre_code'], unique=True)

    # 10. Courses
    op.create_table(
        'courses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('sector', sa.String(length=100), nullable=False),
        sa.Column('nsqf_level', sa.Integer(), server_default='4', nullable=False),
        sa.Column('duration_hours', sa.Integer(), server_default='200', nullable=False),
        sa.Column('theory_hours', sa.Integer(), server_default='80', nullable=False),
        sa.Column('practical_hours', sa.Integer(), server_default='120', nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('programme_id', sa.Integer(), nullable=True),
        sa.Column('provider_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['programme_id'], ['programmes.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['provider_id'], ['training_providers.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_courses_id'), 'courses', ['id'], unique=False)
    op.create_index(op.f('ix_courses_code'), 'courses', ['code'], unique=True)
    op.create_index(op.f('ix_courses_title'), 'courses', ['title'], unique=False)
    op.create_index(op.f('ix_courses_sector'), 'courses', ['sector'], unique=False)

    # 11. Course Skills
    op.create_table(
        'course_skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=False),
        sa.Column('target_proficiency', prof_enum, server_default='INTERMEDIATE', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('course_id', 'skill_id', name='uq_course_skill')
    )

    # 12. Batches
    batch_status_enum = sa.Enum('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED', name='batchstatus')
    op.create_table(
        'batches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('centre_id', sa.Integer(), nullable=False),
        sa.Column('batch_code', sa.String(length=50), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('target_capacity', sa.Integer(), server_default='30', nullable=False),
        sa.Column('status', batch_status_enum, server_default='PLANNED', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['centre_id'], ['training_centres.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_batches_id'), 'batches', ['id'], unique=False)
    op.create_index(op.f('ix_batches_uuid'), 'batches', ['uuid'], unique=True)
    op.create_index(op.f('ix_batches_batch_code'), 'batches', ['batch_code'], unique=True)

    # 13. Trainings
    trg_status_enum = sa.Enum('ENROLLED', 'COMPLETED', 'DROPPED_OUT', name='trainingcompletionstatus')
    op.create_table(
        'trainings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('batch_id', sa.Integer(), nullable=False),
        sa.Column('enrollment_date', sa.Date(), nullable=False),
        sa.Column('completion_status', trg_status_enum, server_default='ENROLLED', nullable=False),
        sa.Column('dropout_reason', sa.String(length=255), nullable=True),
        sa.Column('attendance_percentage', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['batch_id'], ['batches.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_trainings_id'), 'trainings', ['id'], unique=False)
    op.create_index(op.f('ix_trainings_uuid'), 'trainings', ['uuid'], unique=True)

    # 14. Assessments
    result_enum = sa.Enum('PASS', 'FAIL', 'WITHHELD', name='assessmentresult')
    op.create_table(
        'assessments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('training_id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('assessment_date', sa.Date(), nullable=False),
        sa.Column('agency_name', sa.String(length=255), nullable=False),
        sa.Column('score_marks', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('total_marks', sa.Float(), server_default='100.0', nullable=False),
        sa.Column('result', result_enum, server_default='PASS', nullable=False),
        sa.Column('assessor_id', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['training_id'], ['trainings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_assessments_id'), 'assessments', ['id'], unique=False)
    op.create_index(op.f('ix_assessments_uuid'), 'assessments', ['uuid'], unique=True)

    # 15. Certifications
    op.create_table(
        'certifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('assessment_id', sa.Integer(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('certificate_number', sa.String(length=100), nullable=False),
        sa.Column('issue_date', sa.Date(), nullable=False),
        sa.Column('valid_until', sa.Date(), nullable=True),
        sa.Column('certificate_url', sa.String(length=500), nullable=True),
        sa.Column('verification_hash', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_certifications_id'), 'certifications', ['id'], unique=False)
    op.create_index(op.f('ix_certifications_uuid'), 'certifications', ['uuid'], unique=True)
    op.create_index(op.f('ix_certifications_certificate_number'), 'certifications', ['certificate_number'], unique=True)

    # 16. Employers
    company_type_enum = sa.Enum('MNC', 'CORPORATE', 'MSME', 'STARTUP', 'GOVT', 'UNORGANIZED', name='companytype')
    op.create_table(
        'employers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('employer_code', sa.String(length=50), nullable=False),
        sa.Column('company_name', sa.String(length=255), nullable=False),
        sa.Column('industry_sector', sa.String(length=100), nullable=False),
        sa.Column('company_type', company_type_enum, server_default='CORPORATE', nullable=False),
        sa.Column('district_id', sa.Integer(), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('hr_name', sa.String(length=255), nullable=True),
        sa.Column('hr_email', sa.String(length=255), nullable=True),
        sa.Column('hr_phone', sa.String(length=20), nullable=True),
        sa.Column('cin_or_gst', sa.String(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_employers_id'), 'employers', ['id'], unique=False)
    op.create_index(op.f('ix_employers_uuid'), 'employers', ['uuid'], unique=True)
    op.create_index(op.f('ix_employers_employer_code'), 'employers', ['employer_code'], unique=True)
    op.create_index(op.f('ix_employers_company_name'), 'employers', ['company_name'], unique=False)

    # 17. Jobs
    emp_type_enum = sa.Enum('FULL_TIME', 'PART_TIME', 'CONTRACT', 'APPRENTICE', 'INTERNSHIP', 'FREELANCE', name='employmenttype')
    job_status_enum = sa.Enum('OPEN', 'CLOSED', 'PAUSED', name='jobstatus')
    op.create_table(
        'jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('employer_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('occupation_id', sa.Integer(), nullable=False),
        sa.Column('district_id', sa.Integer(), nullable=False),
        sa.Column('min_salary', sa.Integer(), nullable=True),
        sa.Column('max_salary', sa.Integer(), nullable=True),
        sa.Column('vacancies', sa.Integer(), server_default='1', nullable=False),
        sa.Column('employment_type', emp_type_enum, server_default='FULL_TIME', nullable=False),
        sa.Column('min_education', sa.String(length=100), nullable=True),
        sa.Column('min_experience_months', sa.Integer(), server_default='0', nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', job_status_enum, server_default='OPEN', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['employer_id'], ['employers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jobs_id'), 'jobs', ['id'], unique=False)
    op.create_index(op.f('ix_jobs_uuid'), 'jobs', ['uuid'], unique=True)
    op.create_index(op.f('ix_jobs_title'), 'jobs', ['title'], unique=False)

    # 18. Job Skills
    op.create_table(
        'job_skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=False),
        sa.Column('required_level', prof_enum, server_default='INTERMEDIATE', nullable=False),
        sa.Column('is_mandatory', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('job_id', 'skill_id', name='uq_job_skill')
    )

    # 19. Applications
    app_status_enum = sa.Enum('APPLIED', 'SHORTLISTED', 'INTERVIEWED', 'SELECTED', 'REJECTED', name='applicationstatus')
    op.create_table(
        'applications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=False),
        sa.Column('applied_at', sa.DateTime(), nullable=False),
        sa.Column('status', app_status_enum, server_default='APPLIED', nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_applications_id'), 'applications', ['id'], unique=False)
    op.create_index(op.f('ix_applications_uuid'), 'applications', ['uuid'], unique=True)

    # 20. Placements
    placement_type_enum = sa.Enum('CAMPUS', 'DIRECT', 'SELF', name='placementtype')
    placement_status_enum = sa.Enum('OFFERED', 'JOINED', 'DECLINED', name='placementstatus')
    op.create_table(
        'placements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('training_id', sa.Integer(), nullable=True),
        sa.Column('employer_id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=True),
        sa.Column('offer_date', sa.Date(), nullable=False),
        sa.Column('joining_date', sa.Date(), nullable=True),
        sa.Column('offered_salary', sa.Integer(), nullable=False),
        sa.Column('placement_type', placement_type_enum, server_default='CAMPUS', nullable=False),
        sa.Column('status', placement_status_enum, server_default='OFFERED', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['employer_id'], ['employers.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['training_id'], ['trainings.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_placements_id'), 'placements', ['id'], unique=False)
    op.create_index(op.f('ix_placements_uuid'), 'placements', ['uuid'], unique=True)

    # 21. Employment Records
    relevance_enum = sa.Enum('HIGH', 'MEDIUM', 'LOW', 'NONE', name='trainingrelevance')
    verif_enum = sa.Enum('SELF_REPORTED', 'EMPLOYER_VERIFIED', 'SYSTEM_VERIFIED', name='verificationstatus')
    op.create_table(
        'employment_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('employer_id', sa.Integer(), nullable=True),
        sa.Column('job_id', sa.Integer(), nullable=True),
        sa.Column('placement_id', sa.Integer(), nullable=True),
        sa.Column('company_name', sa.String(length=255), nullable=False),
        sa.Column('designation', sa.String(length=255), nullable=False),
        sa.Column('joining_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('salary_min', sa.Integer(), nullable=True),
        sa.Column('salary_max', sa.Integer(), nullable=True),
        sa.Column('employment_type', emp_type_enum, server_default='FULL_TIME', nullable=False),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('relevance_to_training', relevance_enum, server_default='HIGH', nullable=False),
        sa.Column('verification_status', verif_enum, server_default='SELF_REPORTED', nullable=False),
        sa.Column('is_current', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['employer_id'], ['employers.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['placement_id'], ['placements.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('placement_id')
    )
    op.create_index(op.f('ix_employment_records_id'), 'employment_records', ['id'], unique=False)
    op.create_index(op.f('ix_employment_records_uuid'), 'employment_records', ['uuid'], unique=True)
    op.create_index(op.f('ix_employment_records_company_name'), 'employment_records', ['company_name'], unique=False)
    op.create_index(op.f('ix_employment_records_is_current'), 'employment_records', ['is_current'], unique=False)

    # 22. Apprenticeships
    appr_status_enum = sa.Enum('ONGOING', 'COMPLETED', 'TERMINATED', name='apprenticeshipstatus')
    op.create_table(
        'apprenticeships',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('employer_id', sa.Integer(), nullable=False),
        sa.Column('contract_number', sa.String(length=100), nullable=False),
        sa.Column('trade', sa.String(length=255), nullable=False),
        sa.Column('stipend_monthly', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('completion_status', appr_status_enum, server_default='ONGOING', nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['employer_id'], ['employers.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_apprenticeships_id'), 'apprenticeships', ['id'], unique=False)
    op.create_index(op.f('ix_apprenticeships_uuid'), 'apprenticeships', ['uuid'], unique=True)
    op.create_index(op.f('ix_apprenticeships_contract_number'), 'apprenticeships', ['contract_number'], unique=True)

    # 23. Self Employments
    biz_type_enum = sa.Enum('SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLP', 'PRIVATE_LIMITED', 'INFORMAL_MICRO', name='businesstype')
    op.create_table(
        'self_employments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('enterprise_name', sa.String(length=255), nullable=False),
        sa.Column('sector', sa.String(length=100), nullable=False),
        sa.Column('business_type', biz_type_enum, server_default='SOLE_PROPRIETORSHIP', nullable=False),
        sa.Column('monthly_revenue', sa.Integer(), nullable=True),
        sa.Column('capital_invested', sa.Integer(), nullable=True),
        sa.Column('scheme_loan_availed', sa.String(length=255), nullable=True),
        sa.Column('district_id', sa.Integer(), nullable=False),
        sa.Column('registration_number', sa.String(length=100), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_self_employments_id'), 'self_employments', ['id'], unique=False)
    op.create_index(op.f('ix_self_employments_uuid'), 'self_employments', ['uuid'], unique=True)

    # 24. Follow Ups
    follow_up_type_enum = sa.Enum('30_DAY', '90_DAY', '180_DAY', '365_DAY', '730_DAY', name='followuptype')
    retention_status_enum = sa.Enum('RETAINED', 'JOB_SWITCH', 'PROMOTED', 'UNEMPLOYED', 'HIGHER_STUDIES', 'DROPPED_OUT', 'UNREACHABLE', name='retentionstatus')
    op.create_table(
        'follow_ups',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('employment_record_id', sa.Integer(), nullable=True),
        sa.Column('scheduled_date', sa.Date(), nullable=False),
        sa.Column('completed_date', sa.Date(), nullable=True),
        sa.Column('follow_up_type', follow_up_type_enum, nullable=False),
        sa.Column('employment_status', sa.String(length=50), nullable=True),
        sa.Column('salary_band', sa.String(length=50), nullable=True),
        sa.Column('current_job', sa.String(length=255), nullable=True),
        sa.Column('retention_status', retention_status_enum, server_default='RETAINED', nullable=False),
        sa.Column('reason_for_non_placement', sa.String(length=255), nullable=True),
        sa.Column('reason_for_leaving', sa.String(length=255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('conducted_by_user_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['conducted_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['employment_record_id'], ['employment_records.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_follow_ups_id'), 'follow_ups', ['id'], unique=False)
    op.create_index(op.f('ix_follow_ups_uuid'), 'follow_ups', ['uuid'], unique=True)
    op.create_index(op.f('ix_follow_ups_scheduled_date'), 'follow_ups', ['scheduled_date'], unique=False)

    # 25. Employer Feedbacks
    op.create_table(
        'employer_feedbacks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('employer_id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.Integer(), nullable=True),
        sa.Column('technical_skill_rating', sa.Integer(), server_default='4', nullable=False),
        sa.Column('soft_skill_rating', sa.Integer(), server_default='4', nullable=False),
        sa.Column('workplace_readiness_rating', sa.Integer(), server_default='4', nullable=False),
        sa.Column('feedback_text', sa.Text(), nullable=True),
        sa.Column('skill_deficiencies', sa.String(length=500), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['employer_id'], ['employers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['job_id'], ['jobs.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # 26. Candidate Feedbacks
    op.create_table(
        'candidate_feedbacks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('training_id', sa.Integer(), nullable=False),
        sa.Column('curriculum_relevance_rating', sa.Integer(), server_default='4', nullable=False),
        sa.Column('infrastructure_rating', sa.Integer(), server_default='4', nullable=False),
        sa.Column('placement_support_rating', sa.Integer(), server_default='4', nullable=False),
        sa.Column('current_relevance_feedback', sa.Text(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['training_id'], ['trainings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 27. Consents (Advanced Multi-Purpose Consent Tracking)
    consent_purpose_enum = sa.Enum('LONGITUDINAL_TRACKING', 'EMPLOYER_VERIFICATION', 'SCHEME_AUDIT', 'JOB_MATCHING', 'CREDENTIAL_SHARING', name='consentpurpose')
    consent_category_enum = sa.Enum('EMPLOYMENT_HISTORY', 'SALARY_DATA', 'CONTACT_DETAILS', 'SKILL_CREDENTIALS', 'ASSESSMENT_SCORES', name='consentdatacategory')
    op.create_table(
        'consents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(length=36), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('purpose', consent_purpose_enum, server_default='LONGITUDINAL_TRACKING', nullable=False),
        sa.Column('data_category', consent_category_enum, server_default='EMPLOYMENT_HISTORY', nullable=False),
        sa.Column('granted', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('granted_at', sa.DateTime(), nullable=False),
        sa.Column('withdrawn_at', sa.DateTime(), nullable=True),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('consent_version', sa.String(length=20), server_default='1.0', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_consents_id'), 'consents', ['id'], unique=False)
    op.create_index(op.f('ix_consents_uuid'), 'consents', ['uuid'], unique=True)
    op.create_index(op.f('ix_consents_candidate_id'), 'consents', ['candidate_id'], unique=False)

    # 28. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.String(length=100), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'], unique=False)
    op.create_index(op.f('ix_audit_logs_timestamp'), 'audit_logs', ['timestamp'], unique=False)

    # 29. Notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.String(length=50), server_default='INFO', nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)

    # 30. Job Demands
    trend_enum = sa.Enum('HIGH', 'MEDIUM', 'LOW', 'DECLINING', name='growthtrend')
    op.create_table(
        'job_demands',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('occupation_id', sa.Integer(), nullable=False),
        sa.Column('district_id', sa.Integer(), nullable=False),
        sa.Column('reported_quarter', sa.String(length=10), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('estimated_openings', sa.Integer(), server_default='0', nullable=False),
        sa.Column('top_skills', sa.JSON(), nullable=True),
        sa.Column('growth_trend', trend_enum, server_default='HIGH', nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['occupation_id'], ['occupations.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_job_demands_id'), 'job_demands', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('job_demands')
    op.drop_table('notifications')
    op.drop_table('audit_logs')
    op.drop_table('consents')
    op.drop_table('candidate_feedbacks')
    op.drop_table('employer_feedbacks')
    op.drop_table('follow_ups')
    op.drop_table('self_employments')
    op.drop_table('apprenticeships')
    op.drop_table('employment_records')
    op.drop_table('placements')
    op.drop_table('applications')
    op.drop_table('job_skills')
    op.drop_table('jobs')
    op.drop_table('employers')
    op.drop_table('certifications')
    op.drop_table('assessments')
    op.drop_table('trainings')
    op.drop_table('batches')
    op.drop_table('course_skills')
    op.drop_table('courses')
    op.drop_table('training_centres')
    op.drop_table('training_providers')
    op.drop_table('programmes')
    op.drop_table('candidate_skills')
    op.drop_table('candidate_profiles')
    op.drop_table('candidates')
    op.drop_table('skills')
    op.drop_table('occupations')
    op.drop_table('districts')
