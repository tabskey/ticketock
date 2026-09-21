from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.auth import LoginRequest, RefreshTokenRequest, TokenResponse
from app.services.auth_service import (
    authenticate,
    create_session,
    refresh_session,
    revoke_session,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = authenticate(db, payload.email, payload.password)
    access_token, refresh_token = create_session(db, user)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, role=user.role)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user, access_token, refresh_token = refresh_session(db, payload.refresh_token)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, role=user.role)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> Response:
    revoke_session(db, payload.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
