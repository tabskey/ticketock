from datetime import datetime, timezone

import jwt
from sqlalchemy.orm import Session

from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    verify_password,
)
from app.models.enums import UserRole
from app.models.user import User
from app.repositories import refresh_token_repository, user_repository


def authenticate(db: Session, email: str, password: str) -> User:
    user = user_repository.get_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password.")
    return user


def create_session(db: Session, user: User) -> tuple[str, str]:
    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    refresh_token = _issue_refresh_token(db, user)
    db.commit()
    return access_token, refresh_token


def refresh_session(db: Session, refresh_token: str) -> tuple[User, str, str]:
    payload = _decode_or_unauthorized(refresh_token)

    jti = payload.get("jti")
    stored = refresh_token_repository.get_by_jti(db, jti) if jti else None
    if stored is None or stored.revoked_at is not None:
        raise UnauthorizedError("Invalid or expired refresh token.")

    user = user_repository.get_by_id(db, int(payload["sub"]))
    if user is None:
        raise UnauthorizedError("Invalid or expired refresh token.")

    refresh_token_repository.revoke(db, stored)
    new_refresh_token = _issue_refresh_token(db, user)
    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    db.commit()
    return user, access_token, new_refresh_token


def revoke_session(db: Session, refresh_token: str) -> None:
    try:
        payload = decode_refresh_token(refresh_token)
    except jwt.PyJWTError:
        return

    jti = payload.get("jti")
    stored = refresh_token_repository.get_by_jti(db, jti) if jti else None
    if stored is None or stored.revoked_at is not None:
        return

    refresh_token_repository.revoke(db, stored)
    db.commit()


def ensure_role(user: User, allowed_roles: set[UserRole]) -> None:
    if user.role not in allowed_roles:
        raise ForbiddenError("You do not have permission to perform this action.")


def _issue_refresh_token(db: Session, user: User) -> str:
    refresh_token = create_refresh_token(subject=str(user.id), role=user.role.value)
    payload = decode_refresh_token(refresh_token)
    refresh_token_repository.create(
        db,
        jti=payload["jti"],
        user_id=user.id,
        expires_at=datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
    )
    return refresh_token


def _decode_or_unauthorized(refresh_token: str) -> dict:
    try:
        return decode_refresh_token(refresh_token)
    except jwt.PyJWTError as exc:
        raise UnauthorizedError("Invalid or expired refresh token.") from exc
