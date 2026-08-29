from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class District(Base, TimestampMixin):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    division = Column(String(100), nullable=True)  # e.g., Pune, Konkan, Marathwada, Vidarbha
    state = Column(String(100), default="Maharashtra", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    candidates = relationship("Candidate", back_populates="district")
    employers = relationship("Employer", back_populates="district")
    training_centres = relationship("TrainingCentre", back_populates="district")
    training_providers = relationship("TrainingProvider", back_populates="district")
    jobs = relationship("Job", back_populates="district")
    self_employments = relationship("SelfEmployment", back_populates="district")
    job_demands = relationship("JobDemand", back_populates="district")

    def __repr__(self):
        return f"<District(name='{self.name}', code='{self.code}')>"


class Occupation(Base, TimestampMixin):
    __tablename__ = "occupations"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # NCO/NOC or National Standard Code
    title = Column(String(255), nullable=False, index=True)
    sector = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    jobs = relationship("Job", back_populates="occupation")
    job_demands = relationship("JobDemand", back_populates="occupation")

    def __repr__(self):
        return f"<Occupation(code='{self.code}', title='{self.title}')>"
