from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=True)

    # RBAC Role
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    role = relationship("Role", back_populates="users", lazy="joined")

    # Consent Tracking (Core to CONNECTX longitudinal platform)
    consent_given = Column(Boolean, default=False, nullable=False)
    consent_date = Column(DateTime, nullable=True)
    consent_version = Column(String(20), default="1.0", nullable=True)

    # Profile & Regional Attributes
    district = Column(String(100), nullable=True, index=True)
    organization_name = Column(String(255), nullable=True)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Relationships to Domain Profiles
    candidate = relationship("Candidate", uselist=False, back_populates="user")
    employer = relationship("Employer", uselist=False, back_populates="user")
    training_provider = relationship("TrainingProvider", uselist=False, back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.name if self.role else None}')>"
