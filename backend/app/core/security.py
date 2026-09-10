from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from app.core.config import settings

ALGORITHM = "HS256"


def validate_password_length(password: str) -> None:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password cannot be longer than 72 bytes")


def hash_password(password: str) -> str:
    validate_password_length(password)

    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password_bytes, salt)

    return password_hash.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    validate_password_length(plain_password)

    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def create_access_token(user_id: int, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.secret_key,
        algorithms=[ALGORITHM],
    )