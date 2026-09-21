from collections.abc import Generator

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.errors import UnauthorizedError
from app.core.security import decode_access_token
from app.models.enums import UserRole
from app.models.user import User
from app.repositories import user_repository
from app.services.auth_service import ensure_role

bearer_scheme = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError as exc:
        raise UnauthorizedError("Invalid or expired token.") from exc

    subject = payload.get("sub")
    try:
        user_id = int(subject)
    except (TypeError, ValueError) as exc:
        raise UnauthorizedError("Invalid or expired token.") from exc

    user = user_repository.get_by_id(db, user_id)
    if user is None:
        raise UnauthorizedError("Invalid or expired token.")
    return user


def require_role(*roles: UserRole):
    allowed_roles = set(roles)

    def dependency(user: User = Depends(get_current_user)) -> User:
        ensure_role(user, allowed_roles)
        return user

    return dependency
