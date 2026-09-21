from sqlalchemy.orm import Session

from app.core.errors import (
    InvalidStatusTransitionError,
    MissingResolutionNoteError,
    TicketNotFoundError,
)
from app.models.enums import TicketCategory, TicketPriority, TicketStatus, UserRole
from app.models.status_history import StatusHistory
from app.models.ticket import Ticket
from app.models.user import User
from app.repositories import status_history_repository, ticket_repository

STATUS_ORDER = [
    TicketStatus.OPEN,
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
]


def create_ticket(
    db: Session,
    *,
    requester: User,
    title: str,
    description: str,
    category: TicketCategory,
    priority: TicketPriority,
) -> Ticket:
    ticket = ticket_repository.create(
        db,
        title=title,
        description=description,
        category=category,
        priority=priority,
        created_by=requester.id,
    )
    status_history_repository.create(
        db,
        ticket_id=ticket.id,
        from_status=None,
        to_status=TicketStatus.OPEN,
        changed_by=requester.id,
    )
    db.commit()
    db.refresh(ticket)
    return ticket


def get_ticket(db: Session, ticket_id: int, requester: User) -> Ticket:
    ticket = ticket_repository.get_by_id(db, ticket_id)
    if ticket is None or _is_hidden_from(ticket, requester):
        raise TicketNotFoundError(f"Ticket {ticket_id} not found.")
    return ticket


def get_ticket_history(db: Session, ticket_id: int, requester: User) -> list[StatusHistory]:
    get_ticket(db, ticket_id, requester)
    return status_history_repository.list_by_ticket(db, ticket_id)


def list_tickets(
    db: Session,
    *,
    requester: User,
    status: TicketStatus | None,
    category: TicketCategory | None,
    priority: TicketPriority | None,
    sort_by: str,
    order: str,
    page: int,
    page_size: int,
) -> tuple[list[Ticket], int]:
    created_by = None if requester.role == UserRole.SUPPORT else requester.id
    offset = (page - 1) * page_size
    return ticket_repository.list_tickets(
        db,
        created_by=created_by,
        status=status,
        category=category,
        priority=priority,
        sort_by=sort_by,
        order=order,
        offset=offset,
        limit=page_size,
    )


def change_status(
    db: Session,
    ticket_id: int,
    requester: User,
    new_status: TicketStatus,
    resolution_note: str | None = None,
) -> Ticket:
    ticket = ticket_repository.get_by_id(db, ticket_id)
    if ticket is None:
        raise TicketNotFoundError(f"Ticket {ticket_id} not found.")

    if not is_valid_transition(ticket.status, new_status):
        raise InvalidStatusTransitionError(
            f"Cannot move from '{ticket.status.value}' to '{new_status.value}'."
        )

    note_to_store: str | None = None
    if new_status == TicketStatus.RESOLVED:
        trimmed_note = (resolution_note or "").strip()
        if not trimmed_note:
            raise MissingResolutionNoteError(
                "A resolution note is required to resolve a ticket."
            )
        note_to_store = trimmed_note

    previous_status = ticket.status
    if not ticket_repository.update_status(
        db, ticket_id, expected=previous_status, new=new_status
    ):
        raise InvalidStatusTransitionError(
            "The ticket status changed concurrently; please retry."
        )
    status_history_repository.create(
        db,
        ticket_id=ticket.id,
        from_status=previous_status,
        to_status=new_status,
        changed_by=requester.id,
        resolution_note=note_to_store,
    )
    db.commit()
    db.refresh(ticket)
    return ticket


def is_valid_transition(current: TicketStatus, new: TicketStatus) -> bool:
    current_index = STATUS_ORDER.index(current)
    return current_index + 1 < len(STATUS_ORDER) and STATUS_ORDER[current_index + 1] == new


def _is_hidden_from(ticket: Ticket, requester: User) -> bool:
    return requester.role == UserRole.EMPLOYEE and ticket.created_by != requester.id
