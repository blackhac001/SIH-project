from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.role import RoleEnum


class RoleBase(BaseModel):
    name: RoleEnum
    display_name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    pass


class RoleResponse(RoleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
