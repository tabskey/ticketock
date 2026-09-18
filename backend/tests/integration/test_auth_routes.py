from tests.conftest import EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD, SUPPORT_EMAIL, SUPPORT_PASSWORD


def test_login_success_employee(client):
    response = client.post(
        "/api/auth/login", json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
    )
    body = response.json()

    assert response.status_code == 200
    assert body["role"] == "employee"
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_success_support(client):
    response = client.post(
        "/api/auth/login", json={"email": SUPPORT_EMAIL, "password": SUPPORT_PASSWORD}
    )
    assert response.status_code == 200
    assert response.json()["role"] == "support"


def test_login_wrong_password(client):
    response = client.post(
        "/api/auth/login", json={"email": EMPLOYEE_EMAIL, "password": "wrong-password"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_login_unknown_email(client):
    response = client.post(
        "/api/auth/login", json={"email": "nobody@company.com", "password": "whatever"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_login_missing_field_returns_validation_error(client):
    response = client.post("/api/auth/login", json={"email": EMPLOYEE_EMAIL})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_protected_route_without_token_returns_unauthorized(client):
    response = client.get("/api/tickets")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_protected_route_with_garbage_token_returns_unauthorized(client):
    response = client.get("/api/tickets", headers={"Authorization": "Bearer garbage.token.value"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"
