from app.models.base import TimestampMixin, UUIDMixin
from app.models.role import Role, RoleEnum
from app.models.user import User
from app.models.geography import District, Occupation
from app.models.skill import Skill, CandidateSkill, JobSkill, CourseSkill, ProficiencyLevel
from app.models.candidate import (
    Candidate, CandidateProfile, GenderEnum, CandidateEmploymentStatus
)
from app.models.training import (
    Programme, TrainingProvider, TrainingCentre, Course, Batch, Training, Assessment, Certification,
    ProviderType, BatchStatus, TrainingCompletionStatus, AssessmentResult
)
from app.models.employment import (
    Employer, Job, Application, Placement, EmploymentRecord, Interview,
    CompanyType, EmploymentType, JobStatus, ApplicationStatus, PlacementType, PlacementStatus,
    InterviewStatus, InterviewType, TrainingRelevance, VerificationStatus
)
from app.models.alternative_outcomes import (
    Apprenticeship, SelfEmployment, ApprenticeshipStatus, BusinessType
)
from app.models.follow_up import (
    FollowUp, EmployerFeedback, CandidateFeedback, FollowUpType, RetentionStatus
)
from app.models.governance import (
    Consent, AuditLog, Notification, JobDemand, ConsentPurpose, ConsentDataCategory, GrowthTrend
)
from app.models.messaging import Conversation, ConversationParticipant, Message
from app.models.resume_analysis import ResumeAnalysis

__all__ = [
    "TimestampMixin", "UUIDMixin",
    "Role", "RoleEnum", "User",
    "District", "Occupation",
    "Skill", "CandidateSkill", "JobSkill", "CourseSkill", "ProficiencyLevel",
    "Candidate", "CandidateProfile", "GenderEnum", "CandidateEmploymentStatus",
    "Programme", "TrainingProvider", "TrainingCentre", "Course", "Batch", "Training", "Assessment", "Certification",
    "ProviderType", "BatchStatus", "TrainingCompletionStatus", "AssessmentResult",
    "Employer", "Job", "Application", "Placement", "EmploymentRecord", "Interview",
    "CompanyType", "EmploymentType", "JobStatus", "ApplicationStatus", "PlacementType", "PlacementStatus",
    "InterviewStatus", "InterviewType", "TrainingRelevance", "VerificationStatus",
    "Apprenticeship", "SelfEmployment", "ApprenticeshipStatus", "BusinessType",
    "FollowUp", "EmployerFeedback", "CandidateFeedback", "FollowUpType", "RetentionStatus",
    "Consent", "AuditLog", "Notification", "JobDemand", "ConsentPurpose", "ConsentDataCategory", "GrowthTrend",
    "Conversation", "ConversationParticipant", "Message", "ResumeAnalysis"
]
