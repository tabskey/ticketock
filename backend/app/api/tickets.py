from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_role
from app.models.enums import TicketCategory, TicketPriority, TicketStatus, UserRole
from app.models.user import User
from app.schemas.ticket import (
    PaginatedTickets,
    StatusHistoryRead,
    TicketCreate,
    TicketDetail,
    TicketRead,
    TicketStatusUpdate,
)
from app.services import ticket_service

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("", response_model=TicketRead, status_code=201)
def create_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    requester: User = Depends(require_role(UserRole.EMPLOYEE, UserRole.SUPPORT)),
) -> TicketRead:
    ticket = ticket_service.create_ticket(
        db,
        requester=requester,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
    )
    return TicketRead.model_validate(ticket)


@router.get("", response_model=PaginatedTickets)
def list_tickets(
    status: TicketStatus | None = Query(default=None),
    category: TicketCategory | None = Query(default=None),
    priority: TicketPriority | None = Query(default=None),
    sort_by: Literal["created_at", "priority"] = Query(default="created_at"),
    order: Literal["asc", "desc"] = Query(default="desc"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    requester: User = Depends(get_current_user),
) -> PaginatedTickets:
    items, total = ticket_service.list_tickets(
        db,
        requester=requester,
        status=status,
        category=category,
        priority=priority,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )
    return PaginatedTickets(
        items=[TicketRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{ticket_id}", response_model=TicketDetail)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    requester: User = Depends(get_current_user),
) -> TicketDetail:
    ticket = ticket_service.get_ticket(db, ticket_id, requester)
    history = ticket_service.get_ticket_history(db, ticket_id, requester)
    return TicketDetail(
        **TicketRead.model_validate(ticket).model_dump(),
        history=[StatusHistoryRead.model_validate(entry) for entry in history],
    )


@router.patch("/{ticket_id}/status", response_model=TicketRead)
def update_ticket_status(
    ticket_id: int,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    requester: User = Depends(require_role(UserRole.SUPPORT)),
) -> TicketRead:
    ticket = ticket_service.change_status(
        db, ticket_id, requester, payload.status, resolution_note=payload.resolution_note
    )
    return TicketRead.model_validate(ticket)
