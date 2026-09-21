"""add indexes on queried columns

Revision ID: 0006
Revises: 0005
Create Date: 2026-09-20

"""

from typing import Sequence, Union

from alembic import op

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TICKET_INDEXES = ("created_by", "status", "category", "priority")


def upgrade() -> None:
    for column in _TICKET_INDEXES:
        op.create_index(f"ix_tickets_{column}", "tickets", [column])
    op.create_index("ix_status_history_ticket_id", "status_history", ["ticket_id"])


def downgrade() -> None:
    op.drop_index("ix_status_history_ticket_id", table_name="status_history")
    for column in reversed(_TICKET_INDEXES):
        op.drop_index(f"ix_tickets_{column}", table_name="tickets")
