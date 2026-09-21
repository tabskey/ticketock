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
    assert body["refresh_token"]


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


def test_refresh_success(client):
    login_response = client.post(
        "/api/auth/login", json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
    )
    refresh_token = login_response.json()["refresh_token"]

    response = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    body = response.json()

    assert response.status_code == 200
    assert body["role"] == "employee"
    assert body["access_token"]
    assert body["refresh_token"]


def test_refresh_with_garbage_token_returns_unauthorized(client):
    response = client.post("/api/auth/refresh", json={"refresh_token": "garbage.token.value"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_refresh_with_access_token_returns_unauthorized(client):
    login_response = client.post(
        "/api/auth/login", json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
    )
    access_token = login_response.json()["access_token"]

    response = client.post("/api/auth/refresh", json={"refresh_token": access_token})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_refresh_rotates_the_token(client):
    login_response = client.post(
        "/api/auth/login", json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
    )
    original_refresh_token = login_response.json()["refresh_token"]

    refreshed = client.post("/api/auth/refresh", json={"refresh_token": original_refresh_token})
    assert refreshed.status_code == 200
    rotated_refresh_token = refreshed.json()["refresh_token"]
    assert rotated_refresh_token != original_refresh_token

    reused = client.post("/api/auth/refresh", json={"refresh_token": original_refresh_token})
    assert reused.status_code == 401
    assert reused.json()["error"]["code"] == "UNAUTHORIZED"


def test_logout_revokes_the_refresh_token(client):
    login_response = client.post(
        "/api/auth/login", json={"email": EMPLOYEE_EMAIL, "password": EMPLOYEE_PASSWORD}
    )
    refresh_token = login_response.json()["refresh_token"]

    logout_response = client.post("/api/auth/logout", json={"refresh_token": refresh_token})
    assert logout_response.status_code == 204

    reused = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert reused.status_code == 401
    assert reused.json()["error"]["code"] == "UNAUTHORIZED"
