import pytest

from app.core.errors import ForbiddenError, UnauthorizedError
from app.models.enums import UserRole
from app.models.user import User
from app.services.auth_service import authenticate, ensure_role
from tests.conftest import EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD


def test_ensure_role_allows_matching_role():
    user = User(role=UserRole.SUPPORT)
    ensure_role(user, {UserRole.SUPPORT})


def test_ensure_role_allows_one_of_multiple_roles():
    user = User(role=UserRole.EMPLOYEE)
    ensure_role(user, {UserRole.EMPLOYEE, UserRole.SUPPORT})


def test_ensure_role_rejects_other_role():
    user = User(role=UserRole.EMPLOYEE)
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
