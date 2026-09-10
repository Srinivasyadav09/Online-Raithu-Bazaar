from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FarmerVerificationStatus(str, __import__("enum").Enum):
    PROFILE_SUBMITTED = "PROFILE_SUBMITTED"
    VERIFYING = "VERIFYING"
    COMPLETED = "COMPLETED"


class Farmer(Base):
    __tablename__ = "farmers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    farm_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    location: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    district: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    state: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    profile_image: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    farm_image: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    years_of_farming: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    organic_certified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    verification_status: Mapped[FarmerVerificationStatus] = mapped_column(
        SQLEnum(FarmerVerificationStatus, name="farmerverificationstatus"),
        default=FarmerVerificationStatus.PROFILE_SUBMITTED,
        nullable=False,
    )

    rating: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="farmer",
    )

    products = relationship(
        "Product",
        back_populates="farmer",
        cascade="all, delete-orphan",
    )