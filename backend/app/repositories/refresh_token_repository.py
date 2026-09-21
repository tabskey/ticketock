from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


def create(db: Session, *, jti: str, user_id: int, expires_at: datetime) -> RefreshToken:
    token = RefreshToken(jti=jti, user_id=user_id, expires_at=expires_at)
    db.add(token)
    db.flush()
    return token


def get_by_jti(db: Session, jti: str) -> RefreshToken | None:
    return db.query(RefreshToken).filter(RefreshToken.jti == jti).one_or_none()


def revoke(db: Session, token: RefreshToken) -> None:
    token.revoked_at = datetime.now(timezone.utc)
    db.flush()
