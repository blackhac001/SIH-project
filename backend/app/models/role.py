import enum
from sqlalchemy import Column, Integer, String, Text, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class RoleEnum(str, enum.Enum):
    CANDIDATE = "CANDIDATE"
    EMPLOYER = "EMPLOYER"
    TRAINING_PROVIDER = "TRAINING_PROVIDER"
    DISTRICT_OFFICER = "DISTRICT_OFFICER"
    STATE_ADMIN = "STATE_ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Enum(RoleEnum), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    users = relationship("User", back_populates="role")

    def __repr__(self):
        return f"<Role(id={self.id}, name={self.name.value})>"
