import pytest

from app.core.errors import (
    InvalidStatusTransitionError,
    MissingResolutionNoteError,
    TicketNotFoundError,
)
from app.models.enums import TicketCategory, TicketPriority, TicketStatus, UserRole
from app.models.ticket import Ticket
from app.models.user import User
from app.services import ticket_service
from app.services.ticket_service import is_valid_transition


@pytest.mark.parametrize(
    ("current", "new", "expected"),
    [
        (TicketStatus.OPEN, TicketStatus.IN_PROGRESS, True),
        (TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, True),
        (TicketStatus.RESOLVED, TicketStatus.CLOSED, True),
        (TicketStatus.OPEN, TicketStatus.RESOLVED, False),
        (TicketStatus.OPEN, TicketStatus.CLOSED, False),
        (TicketStatus.IN_PROGRESS, TicketStatus.OPEN, False),
        (TicketStatus.IN_PROGRESS, TicketStatus.CLOSED, False),
        (TicketStatus.RESOLVED, TicketStatus.OPEN, False),
        (TicketStatus.RESOLVED, TicketStatus.IN_PROGRESS, False),
        (TicketStatus.CLOSED, TicketStatus.OPEN, False),
        (TicketStatus.OPEN, TicketStatus.OPEN, False),
        (TicketStatus.CLOSED, TicketStatus.CLOSED, False),
    ],
)
def test_is_valid_transition(current, new, expected):
    assert is_valid_transition(current, new) is expected


def test_owner_employee_can_see_own_ticket():
    employee = User(id=1, name="Test User", role=UserRole.EMPLOYEE)
    ticket = Ticket(created_by=1)
    assert ticket_service._is_hidden_from(ticket, employee) is False


def test_other_employee_cannot_see_ticket():
    employee = User(id=2, name="Test User", role=UserRole.EMPLOYEE)
    ticket = Ticket(created_by=1)
    assert ticket_service._is_hidden_from(ticket, employee) is True


def test_support_can_see_any_ticket():
    support = User(id=99, name="Test User", role=UserRole.SUPPORT)
    ticket = Ticket(created_by=1)
    assert ticket_service._is_hidden_from(ticket, support) is False


def test_create_ticket_starts_open_with_initial_history(db_session, employee_user):
    ticket = ticket_service.create_ticket(
        db_session,
        requester=employee_user,
        title="Broken monitor",
        description="Screen flickers",
        category=TicketCategory.IT,
        priority=TicketPriority.LOW,
    )

    assert ticket.status == TicketStatus.OPEN
    assert ticket.created_by == employee_user.id

    history = ticket_service.get_ticket_history(db_session, ticket.id, employee_user)
    assert len(history) == 1
    assert history[0].from_status is None
    assert history[0].to_status == TicketStatus.OPEN


def test_get_ticket_not_found(db_session, employee_user):
    with pytest.raises(TicketNotFoundError):
        ticket_service.get_ticket(db_session, 999999, employee_user)


def test_get_ticket_hidden_from_other_employee(db_session, employee_user, support_user):
    ticket = ticket_service.create_ticket(
        db_session,
        requester=support_user,
        title="Support's own ticket",
        description="desc",
        category=TicketCategory.HR,
        priority=TicketPriority.MEDIUM,
    )

    with pytest.raises(TicketNotFoundError):
        ticket_service.get_ticket(db_session, ticket.id, employee_user)


def test_change_status_success(db_session, employee_user, support_user):
    ticket = ticket_service.create_ticket(
        db_session,
        requester=employee_user,
        title="t",
        description="d",
        category=TicketCategory.IT,
        priority=TicketPriority.HIGH,
    )

    updated = ticket_service.change_status(
        db_session, ticket.id, support_user, TicketStatus.IN_PROGRESS
    )

    assert updated.status == TicketStatus.IN_PROGRESS


def test_change_status_rejects_skip(db_session, employee_user, support_user):
    ticket = ticket_service.create_ticket(
        db_session,
        requester=employee_user,
        title="t",
        description="d",
        category=TicketCategory.IT,
        priority=TicketPriority.HIGH,
    )

    with pytest.raises(InvalidStatusTransitionError):
        ticket_service.change_status(db_session, ticket.id, support_user, TicketStatus.RESOLVED)


def test_change_status_rejects_backward(db_session, employee_user, support_user):
    ticket = ticket_service.create_ticket(
        db_session,
        requester=employee_user,
        title="t",
        description="d",
        category=TicketCategory.IT,
        priority=TicketPriority.HIGH,
    )
    ticket_service.change_status(db_session, ticket.id, support_user, TicketStatus.IN_PROGRESS)

    with pytest.raises(InvalidStatusTransitionError):
        ticket_service.change_status(db_session, ticket.id, support_user, TicketStatus.OPEN)


def test_change_status_not_found(db_session, support_user):
    with pytest.raises(TicketNotFoundError):
        ticket_service.change_status(db_session, 999999, support_user, TicketStatus.IN_PROGRESS)


@pytest.mark.parametrize("resolution_note", [None, "", "   "])
def test_change_status_resolved_requires_note(db_session, employee_user, support_user, resolution_note):
    ticket = ticket_service.create_ticket(
        db_session,
        requester=employee_user,
        title="t",
        description="d",
        category=TicketCategory.IT,
        priority=TicketPriority.HIGH,
    )
    ticket_service.change_status(db_session, ticket.id, support_user, TicketStatus.IN_PROGRESS)

    with pytest.raises(MissingResolutionNoteError):
        ticket_service.change_status(
            db_session, ticket.id, support_user, TicketStatus.RESOLVED, resolution_note=resolution_note
        )


def test_change_status_resolved_persists_trimmed_note(db_session, employee_user, support_user):
    ticket = ticket_service.create_ticket(
        db_session,
        requester=employee_user,
        title="t",
        description="d",
        category=TicketCategory.IT,
        priority=TicketPriority.HIGH,
    )
    ticket_service.change_status(db_session, ticket.id, support_user, TicketStatus.IN_PROGRESS)

    ticket_service.change_status(
        db_session,
        ticket.id,
        support_user,
        TicketStatus.RESOLVED,
        resolution_note="  Replaced the network cable.  ",
    )

    history = ticket_service.get_ticket_history(db_session, ticket.id, support_user)
    resolved_entry = next(entry for entry in history if entry.to_status == TicketStatus.RESOLVED)
    assert resolved_entry.resolution_note == "Replaced the network cable."


def test_change_status_skip_to_resolved_rejected_before_note_check(db_session, employee_user, support_user):
    ticket = ticket_service.create_ticket(
        db_session,
        requester=employee_user,
        title="t",
        description="d",
        category=TicketCategory.IT,
        priority=TicketPriority.HIGH,
    )

    with pytest.raises(InvalidStatusTransitionError):
        ticket_service.change_status(db_session, ticket.id, support_user, TicketStatus.RESOLVED)


def test_list_tickets_scoping(db_session, employee_user, support_user):
    ticket_service.create_ticket(
        db_session,
        requester=employee_user,
        title="mine",
        description="d",
        category=TicketCategory.IT,
        priority=TicketPriority.LOW,
    )
    ticket_service.create_ticket(
        db_session,
        requester=support_user,
        title="support's",
        description="d",
        category=TicketCategory.HR,
        priority=TicketPriority.LOW,
    )

    employee_items, employee_total = ticket_service.list_tickets(
        db_session,
        requester=employee_user,
        status=None,
        category=None,
        priority=None,
        sort_by="created_at",
        order="desc",
        page=1,
        page_size=20,
    )
    assert employee_total == 1
    assert employee_items[0].title == "mine"

    _, support_total = ticket_service.list_tickets(
        db_session,
        requester=support_user,
        status=None,
        category=None,
        priority=None,
        sort_by="created_at",
        order="desc",
        page=1,
        page_size=20,
    )
    assert support_total == 2
