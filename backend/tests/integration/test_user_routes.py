from tests.conftest import EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD, SUPPORT_EMAIL, SUPPORT_PASSWORD, auth_headers


def test_get_me_returns_current_user_for_employee(client):
    headers = auth_headers(client, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    response = client.get("/api/users/me", headers=headers)
    body = response.json()

    assert response.status_code == 200
    assert body["email"] == EMPLOYEE_EMAIL
    assert body["name"] == "Tabatha Macedo"
    assert body["role"] == "employee"


def test_get_me_returns_current_user_for_support(client):
    headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)
    response = client.get("/api/users/me", headers=headers)
    body = response.json()

    assert response.status_code == 200
    assert body["email"] == SUPPORT_EMAIL
    assert body["name"] == "Rafael Souza"
    assert body["role"] == "support"


def test_get_me_requires_auth(client):
    response = client.get("/api/users/me")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"
