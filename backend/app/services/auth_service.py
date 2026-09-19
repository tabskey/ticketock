import jwt
from sqlalchemy.orm import Session

from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.security import decode_refresh_token, verify_password
from app.models.enums import UserRole
from app.models.user import User
from app.repositories import user_repository


def authenticate(db: Session, email: str, password: str) -> User:
    user = user_repository.get_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password.")
    return user


def refresh_session(db: Session, refresh_token: str) -> User:
    try:
        payload = decode_refresh_token(refresh_token)
    except jwt.PyJWTError as exc:
        raise UnauthorizedError("Invalid or expired refresh token.") from exc

    user = user_repository.get_by_id(db, int(payload["sub"]))
    if user is None:
        raise UnauthorizedError("Invalid or expired refresh token.")
    return user


def ensure_role(user: User, allowed_roles: set[UserRole]) -> None:
    if user.role not in allowed_roles:
        raise ForbiddenError("You do not have permission to perform this action.")
