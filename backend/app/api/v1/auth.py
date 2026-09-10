from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.farmer import Farmer, FarmerVerificationStatus

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    FarmerRegisterRequest,
    TokenResponse,
    UserResponse,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(User.email == request.email)
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    if request.phone:
        existing_phone = db.scalar(
            select(User).where(User.phone == request.phone)
        )

        if existing_phone is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Phone number is already registered",
            )

    user = User(
        name=request.name.strip(),
        email=request.email.lower(),
        phone=request.phone,
        password_hash=hash_password(request.password),
        role=UserRole.CUSTOMER,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        user_id=user.id,
        role=user.role.value,
    )

    return TokenResponse(
        access_token=token,
        user=user,
    )


@router.post(
    "/register/farmer",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_farmer(
    request: FarmerRegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(select(User).where(User.email == request.email.lower()))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    if request.phone:
        existing_phone = db.scalar(select(User).where(User.phone == request.phone))
        if existing_phone is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number is already registered")

    user = User(
        name=request.name.strip(),
        email=request.email.lower(),
        phone=request.phone,
        password_hash=hash_password(request.password),
        role=UserRole.FARMER,
        is_active=True,
    )
    db.add(user)
    db.flush()

    farmer = Farmer(
        user_id=user.id,
        farm_name=request.farm_name.strip(),
        description=request.description,
        location=request.location,
        district=request.district,
        state=request.state,
        years_of_farming=request.years_of_farming,
        organic_certified=False,
        verification_status=FarmerVerificationStatus.PROFILE_SUBMITTED,
    )
    db.add(farmer)
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id, role=user.role.value)
    return TokenResponse(access_token=token, user=user)


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(
            User.email == request.email.lower()
        )
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        password_valid = verify_password(
            request.password,
            user.password_hash,
        )
    except ValueError:
        password_valid = False

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    token = create_access_token(
        user_id=user.id,
        role=user.role.value,
    )

    return TokenResponse(
        access_token=token,
        user=user,
    )


@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user