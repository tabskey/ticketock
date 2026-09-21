import pytest

from app.core.errors import ForbiddenError, UnauthorizedError
from app.core.security import create_access_token, create_refresh_token
from app.models.enums import UserRole
from app.models.user import User
from app.services.auth_service import (
    authenticate,
    create_session,
    ensure_role,
    refresh_session,
    revoke_session,
)
from tests.conftest import EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD


def test_ensure_role_allows_matching_role():
    user = User(name="Test User", role=UserRole.SUPPORT)
    ensure_role(user, {UserRole.SUPPORT})


def test_ensure_role_allows_one_of_multiple_roles():
    user = User(name="Test User", role=UserRole.EMPLOYEE)
    ensure_role(user, {UserRole.EMPLOYEE, UserRole.SUPPORT})


def test_ensure_role_rejects_other_role():
    user = User(name="Test User", role=UserRole.EMPLOYEE)
    with pytest.raises(ForbiddenError):
        ensure_role(user, {UserRole.SUPPORT})


def test_authenticate_success(db_session):
    user = authenticate(db_session, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    assert user.email == EMPLOYEE_EMAIL
    assert user.role == UserRole.EMPLOYEE


def test_authenticate_wrong_password(db_session):
    with pytest.raises(UnauthorizedError):
        authenticate(db_session, EMPLOYEE_EMAIL, "wrong-password")


def test_authenticate_unknown_email(db_session):
    with pytest.raises(UnauthorizedError):
        authenticate(db_session, "nobody@company.com", "whatever")


def test_refresh_session_success(db_session, employee_user):
    _, refresh_token = create_session(db_session, employee_user)

    user, access_token, new_refresh_token = refresh_session(db_session, refresh_token)

    assert user.id == employee_user.id
    assert access_token
    assert new_refresh_token != refresh_token


def test_refresh_session_rotates_and_revokes_old_token(db_session, employee_user):
    _, refresh_token = create_session(db_session, employee_user)
    refresh_session(db_session, refresh_token)

    with pytest.raises(UnauthorizedError):
        refresh_session(db_session, refresh_token)


def test_refresh_session_rejects_unregistered_token(db_session, employee_user):
    refresh_token = create_refresh_token(subject=str(employee_user.id), role=employee_user.role.value)

    with pytest.raises(UnauthorizedError):
        refresh_session(db_session, refresh_token)


def test_refresh_session_rejects_access_token(db_session, employee_user):
    access_token = create_access_token(subject=str(employee_user.id), role=employee_user.role.value)
    with pytest.raises(UnauthorizedError):
        refresh_session(db_session, access_token)


def test_refresh_session_rejects_garbage_token(db_session):
    with pytest.raises(UnauthorizedError):
        refresh_session(db_session, "garbage.token.value")


def test_revoke_session_blocks_further_refresh(db_session, employee_user):
    _, refresh_token = create_session(db_session, employee_user)

    revoke_session(db_session, refresh_token)

    with pytest.raises(UnauthorizedError):
        refresh_session(db_session, refresh_token)


def test_revoke_session_ignores_invalid_token(db_session):
    revoke_session(db_session, "garbage.token.value")
