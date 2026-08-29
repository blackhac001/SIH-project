from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.models.governance import ConsentPurpose, ConsentDataCategory


class ConsentBase(BaseModel):
    candidate_id: int
    purpose: ConsentPurpose = ConsentPurpose.LONGITUDINAL_TRACKING
    data_category: ConsentDataCategory = ConsentDataCategory.EMPLOYMENT_HISTORY
    granted: bool = True
    consent_version: str = "1.0"


class ConsentCreate(ConsentBase):
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class ConsentResponse(ConsentBase):
    id: int
    uuid: str
    granted_at: datetime
    withdrawn_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    action: str
    entity: str
    entity_id: Optional[str] = None
    ip_address: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogResponse(AuditLogBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
