import enum
from sqlalchemy import (
    Column, Integer, String, Boolean, Date, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class ApprenticeshipStatus(str, enum.Enum):
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    TERMINATED = "TERMINATED"


class BusinessType(str, enum.Enum):
    SOLE_PROPRIETORSHIP = "SOLE_PROPRIETORSHIP"
    PARTNERSHIP = "PARTNERSHIP"
    LLP = "LLP"
    PRIVATE_LIMITED = "PRIVATE_LIMITED"
    INFORMAL_MICRO = "INFORMAL_MICRO"


class Apprenticeship(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "apprenticeships"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id", ondelete="RESTRICT"), nullable=False, index=True)
    contract_number = Column(String(100), unique=True, nullable=False, index=True)  # NAPS/NATS Contract No
    trade = Column(String(255), nullable=False)
    stipend_monthly = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    completion_status = Column(Enum(ApprenticeshipStatus), default=ApprenticeshipStatus.ONGOING, nullable=False)
    notes = Column(Text, nullable=True)

    # Relationships
    candidate = relationship("Candidate", back_populates="apprenticeships")
    employer = relationship("Employer", back_populates="apprenticeships")


class SelfEmployment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "self_employments"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    enterprise_name = Column(String(255), nullable=False, index=True)
    sector = Column(String(100), nullable=False, index=True)
    business_type = Column(Enum(BusinessType), default=BusinessType.SOLE_PROPRIETORSHIP, nullable=False)
    monthly_revenue = Column(Integer, nullable=True)
    capital_invested = Column(Integer, nullable=True)
    scheme_loan_availed = Column(String(255), nullable=True)  # e.g., PMEGP, Mudra, CMEGP
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False)
    registration_number = Column(String(100), nullable=True)  # Udyam / Shop Act
    start_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    candidate = relationship("Candidate", back_populates="self_employments")
    district = relationship("District", back_populates="self_employments")
