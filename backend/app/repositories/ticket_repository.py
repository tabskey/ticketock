from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.models.enums import TicketCategory, TicketPriority, TicketStatus
from app.models.ticket import Ticket

_SORT_COLUMNS = {
    "created_at": Ticket.created_at,
    "priority": Ticket.priority,
}


def create(
    db: Session,
    *,
    title: str,
    description: str,
    category: TicketCategory,
    priority: TicketPriority,
    created_by: int,
) -> Ticket:
    ticket = Ticket(
        title=title,
        description=description,
        category=category,
        priority=priority,
        status=TicketStatus.OPEN,
        created_by=created_by,
    )
    db.add(ticket)
    db.flush()
    return ticket


def get_by_id(db: Session, ticket_id: int) -> Ticket | None:
    return db.get(Ticket, ticket_id)


def list_tickets(
    db: Session,
    *,
    created_by: int | None,
    status: TicketStatus | None,
    category: TicketCategory | None,
    priority: TicketPriority | None,
    sort_by: str,
    order: str,
    offset: int,
    limit: int,
) -> tuple[list[Ticket], int]:
    query = db.query(Ticket)

    if created_by is not None:
        query = query.filter(Ticket.created_by == created_by)
    if status is not None:
        query = query.filter(Ticket.status == status)
    if category is not None:
        query = query.filter(Ticket.category == category)
    if priority is not None:
        query = query.filter(Ticket.priority == priority)

    total = query.count()

    sort_column = _SORT_COLUMNS[sort_by]
    direction = asc if order == "asc" else desc
    items = query.order_by(direction(sort_column)).offset(offset).limit(limit).all()

    return items, total
