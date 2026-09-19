from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.user import User
from tests.conftest import EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD, SUPPORT_EMAIL, SUPPORT_PASSWORD, auth_headers


def _create_ticket(client, headers, **overrides):
    payload = {
        "title": "Printer jam",
        "description": "Cannot print on 3rd floor",
        "category": "IT",
        "priority": "High",
    }
    payload.update(overrides)
    return client.post("/api/tickets", headers=headers, json=payload)


def test_create_ticket_as_employee(client):
    headers = auth_headers(client, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    response = _create_ticket(client, headers)
    body = response.json()

    assert response.status_code == 201
    assert body["status"] == "Open"
    assert body["category"] == "IT"
    assert body["priority"] == "High"


def test_create_ticket_as_support(client):
    headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)
    response = _create_ticket(client, headers, title="New hire laptop")
    assert response.status_code == 201


def test_create_ticket_without_token_is_unauthorized(client):
    response = _create_ticket(client, headers={})
    assert response.status_code == 401


def test_create_ticket_invalid_category_is_validation_error(client):
    headers = auth_headers(client, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    response = _create_ticket(client, headers, category="Nope")
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_get_ticket_detail_includes_creation_history(client):
    headers = auth_headers(client, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    ticket_id = _create_ticket(client, headers).json()["id"]

    response = client.get(f"/api/tickets/{ticket_id}", headers=headers)
    body = response.json()

    assert response.status_code == 200
    assert len(body["history"]) == 1
    assert body["history"][0]["from_status"] is None
    assert body["history"][0]["to_status"] == "Open"


def test_get_nonexistent_ticket_returns_not_found(client):
    headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)
    response = client.get("/api/tickets/999999", headers=headers)
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "TICKET_NOT_FOUND"


def test_employee_cannot_view_another_employees_ticket(client, db_session):
    other_employee = User(
        email="other-employee@company.com",
        name="Other Employee",
        hashed_password=hash_password("other123"),
        role=UserRole.EMPLOYEE,
    )
    db_session.add(other_employee)
    db_session.commit()

    other_headers = auth_headers(client, "other-employee@company.com", "other123")
    ticket_id = _create_ticket(client, other_headers).json()["id"]

    own_headers = auth_headers(client, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    response = client.get(f"/api/tickets/{ticket_id}", headers=own_headers)
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "TICKET_NOT_FOUND"


def test_support_can_view_any_ticket(client):
    employee_headers = auth_headers(client, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    ticket_id = _create_ticket(client, employee_headers).json()["id"]

    support_headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)
    response = client.get(f"/api/tickets/{ticket_id}", headers=support_headers)
    assert response.status_code == 200


def test_list_scopes_to_own_tickets_for_employee(client, db_session):
    other_employee = User(
        email="other-employee@company.com",
        name="Other Employee",
        hashed_password=hash_password("other123"),
        role=UserRole.EMPLOYEE,
    )
    db_session.add(other_employee)
    db_session.commit()

    employee_headers = auth_headers(client, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    other_headers = auth_headers(client, "other-employee@company.com", "other123")

    _create_ticket(client, employee_headers, title="mine")
    _create_ticket(client, other_headers, title="not mine")

    response = client.get("/api/tickets", headers=employee_headers)
    body = response.json()

    assert body["total"] == 1
    assert body["items"][0]["title"] == "mine"


def test_list_shows_all_tickets_for_support(client):
    employee_headers = auth_headers(client, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    support_headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)

    _create_ticket(client, employee_headers, title="a")
    _create_ticket(client, support_headers, title="b")

    response = client.get("/api/tickets", headers=support_headers)
    assert response.json()["total"] == 2


def test_list_filters_by_category(client):
    headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)
    _create_ticket(client, headers, title="it one", category="IT")
    _create_ticket(client, headers, title="hr one", category="HR")

    response = client.get("/api/tickets?category=HR", headers=headers)
    body = response.json()

    assert body["total"] == 1
    assert body["items"][0]["title"] == "hr one"


def test_list_sorts_by_priority_ascending(client):
    headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)
    _create_ticket(client, headers, title="urgent one", priority="Urgent")
    _create_ticket(client, headers, title="low one", priority="Low")
    _create_ticket(client, headers, title="high one", priority="High")

    response = client.get("/api/tickets?sort_by=priority&order=asc", headers=headers)
    priorities = [item["priority"] for item in response.json()["items"]]

    assert priorities == ["Low", "High", "Urgent"]


def test_list_paginates(client):
    headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)
    for i in range(3):
        _create_ticket(client, headers, title=f"ticket {i}")

    response = client.get("/api/tickets?page=1&page_size=2", headers=headers)
    body = response.json()

    assert len(body["items"]) == 2
    assert body["total"] == 3


def test_employee_cannot_change_status(client):
    employee_headers = auth_headers(client, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    ticket_id = _create_ticket(client, employee_headers).json()["id"]

    response = client.patch(
        f"/api/tickets/{ticket_id}/status", headers=employee_headers, json={"status": "In Progress"}
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_support_walks_full_status_workflow(client):
    employee_headers = auth_headers(client, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD)
    support_headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)
    ticket_id = _create_ticket(client, employee_headers).json()["id"]

    for next_status in ("In Progress", "Resolved", "Closed"):
        response = client.patch(
            f"/api/tickets/{ticket_id}/status",
            headers=support_headers,
            json={"status": next_status},
        )
        assert response.status_code == 200
        assert response.json()["status"] == next_status

    detail = client.get(f"/api/tickets/{ticket_id}", headers=support_headers).json()
    transitions = [(h["from_status"], h["to_status"]) for h in detail["history"]]
    assert transitions == [
        (None, "Open"),
        ("Open", "In Progress"),
        ("In Progress", "Resolved"),
        ("Resolved", "Closed"),
    ]


def test_support_cannot_skip_a_step(client):
    support_headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)
    ticket_id = _create_ticket(client, support_headers).json()["id"]

    response = client.patch(
        f"/api/tickets/{ticket_id}/status", headers=support_headers, json={"status": "Resolved"}
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_STATUS_TRANSITION"


def test_support_cannot_move_backward(client):
    support_headers = auth_headers(client, SUPPORT_EMAIL, SUPPORT_PASSWORD)
    ticket_id = _create_ticket(client, support_headers).json()["id"]

    client.patch(
        f"/api/tickets/{ticket_id}/status", headers=support_headers, json={"status": "In Progress"}
    )
    response = client.patch(
        f"/api/tickets/{ticket_id}/status", headers=support_headers, json={"status": "Open"}
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_STATUS_TRANSITION"
