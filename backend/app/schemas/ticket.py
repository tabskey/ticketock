from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TicketCategory, TicketPriority, TicketStatus


class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1, max_length=10_000)
    category: TicketCategory
    priority: TicketPriority


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    created_by: int
    created_at: datetime
    updated_at: datetime


class StatusHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    from_status: TicketStatus | None
    to_status: TicketStatus
    changed_by: int
    changed_at: datetime
    resolution_note: str | None


class TicketDetail(TicketRead):
    history: list[StatusHistoryRead]


class TicketStatusUpdate(BaseModel):
    status: TicketStatus
    resolution_note: str | None = None


class PaginatedTickets(BaseModel):
    items: list[TicketRead]
    total: int
    page: int
    page_size: int
