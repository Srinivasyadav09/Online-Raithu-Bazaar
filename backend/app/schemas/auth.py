from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=72)


class FarmerRegisterRequest(RegisterRequest):
    farm_name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    location: str | None = Field(default=None, max_length=150)
    district: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    years_of_farming: int | None = Field(default=None, ge=0)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str | None
    role: UserRole
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse