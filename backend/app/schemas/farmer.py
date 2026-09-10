from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FarmerCreate(BaseModel):
    farm_name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    location: str | None = Field(default=None, max_length=150)
    district: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    profile_image: str | None = Field(default=None, max_length=500)
    farm_image: str | None = Field(default=None, max_length=500)
    years_of_farming: int | None = Field(default=None, ge=0)


class FarmerUpdate(BaseModel):
    farm_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    description: str | None = None
    location: str | None = Field(default=None, max_length=150)
    district: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    profile_image: str | None = Field(default=None, max_length=500)
    farm_image: str | None = Field(default=None, max_length=500)
    years_of_farming: int | None = Field(default=None, ge=0)


class FarmerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_name: str
    location: str | None = None
    district: str | None = None
    state: str | None = None
    profile_image: str | None = None
    organic_certified: bool
    rating: float
    verification_status: str


class FarmerResponse(FarmerSummary):
    description: str | None = None
    farm_image: str | None = None
    years_of_farming: int | None = None
    created_at: datetime
    updated_at: datetime