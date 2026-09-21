from datetime import datetime, timedelta, timezone
from uuid import uuid4

import bcrypt
import jwt

from app.core.config import settings

JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(*, subject: str, role: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=settings.access_token_expire_seconds
    )
    payload = {"sub": subject, "role": role, "type": "access", "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=JWT_ALGORITHM)


def create_refresh_token(*, subject: str, role: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=settings.refresh_token_expire_seconds
    )
    payload = {
        "sub": subject,
        "role": role,
        "type": "refresh",
        "jti": uuid4().hex,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[JWT_ALGORITHM])
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Not an access token.")
    return payload


def decode_refresh_token(token: str) -> dict:
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[JWT_ALGORITHM])
    if payload.get("type") != "refresh":
        raise jwt.InvalidTokenError("Not a refresh token.")
    return payload
