from sqlalchemy.orm import Session

from app.models.enums import TicketStatus
from app.models.status_history import StatusHistory


def create(
    db: Session,
    *,
    ticket_id: int,
    from_status: TicketStatus | None,
    to_status: TicketStatus,
    changed_by: int,
) -> StatusHistory:
    entry = StatusHistory(
        ticket_id=ticket_id,
        from_status=from_status,
        to_status=to_status,
        changed_by=changed_by,
    )
    db.add(entry)
    db.flush()
    return entry


def list_by_ticket(db: Session, ticket_id: int) -> list[StatusHistory]:
    return (
        db.query(StatusHistory)
        .filter(StatusHistory.ticket_id == ticket_id)
        .order_by(StatusHistory.changed_at.asc())
        .all()
    )
