from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import require_role
from app.core.database import get_db
from app.models.farmer import Farmer, FarmerVerificationStatus
from app.models.user import User, UserRole
from app.schemas.farmer import FarmerResponse

router = APIRouter(prefix="/admin", tags=["Administration"])

class AdminFarmerResponse(FarmerResponse):
    user: dict

def _response(farmer: Farmer) -> dict:
    return {
        **{field: getattr(farmer, field) for field in ("id", "farm_name", "description", "location", "district", "state", "profile_image", "farm_image", "years_of_farming", "organic_certified", "verification_status", "rating", "created_at", "updated_at")},
        "user": {"id": farmer.user.id, "name": farmer.user.name, "email": farmer.user.email, "phone": farmer.user.phone, "role": farmer.user.role.value, "is_active": farmer.user.is_active},
    }

@router.get("/farmers", response_model=list[AdminFarmerResponse])
def list_farmer_applications(current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    farmers = db.scalars(select(Farmer).options(joinedload(Farmer.user)).order_by(Farmer.created_at.desc())).all()
    return [_response(f) for f in farmers]

def _get_farmer(farmer_id: int, db: Session) -> Farmer:
    farmer = db.scalar(select(Farmer).options(joinedload(Farmer.user)).where(Farmer.id == farmer_id))
    if farmer is None:
        raise HTTPException(status_code=404, detail="Farmer application not found")
    return farmer

@router.post("/farmers/{farmer_id}/start-verification", response_model=AdminFarmerResponse)
def start_verification(farmer_id: int, current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    farmer = _get_farmer(farmer_id, db)
    if farmer.verification_status == FarmerVerificationStatus.COMPLETED:
        raise HTTPException(status_code=409, detail="Farmer is already verified")
    farmer.verification_status = FarmerVerificationStatus.VERIFYING
    farmer.organic_certified = False
    db.commit(); db.refresh(farmer)
    return _response(farmer)

@router.post("/farmers/{farmer_id}/approve", response_model=AdminFarmerResponse)
def approve_farmer(farmer_id: int, current_user: User = Depends(require_role(UserRole.ADMIN)), db: Session = Depends(get_db)):
    farmer = _get_farmer(farmer_id, db)
    farmer.verification_status = FarmerVerificationStatus.COMPLETED
    farmer.organic_certified = True
    db.commit(); db.refresh(farmer)
    return _response(farmer)
