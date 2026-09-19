"""seed example tickets and status history

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-17

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

users_table = sa.table(
    "users",
    sa.column("id", sa.Integer),
    sa.column("email", sa.String),
)

tickets_table = sa.table(
    "tickets",
    sa.column("id", sa.Integer),
    sa.column("title", sa.String),
    sa.column("description", sa.String),
    sa.column(
        "category",
        postgresql.ENUM("IT", "Facilities", "HR", name="ticket_category", create_type=False),
    ),
    sa.column(
        "priority",
        postgresql.ENUM("Low", "Medium", "High", "Urgent", name="ticket_priority", create_type=False),
    ),
    sa.column(
        "status",
        postgresql.ENUM("Open", "In Progress", "Resolved", "Closed", name="ticket_status", create_type=False),
    ),
    sa.column("created_by", sa.Integer),
)

status_history_table = sa.table(
    "status_history",
    sa.column("id", sa.Integer),
    sa.column("ticket_id", sa.Integer),
    sa.column(
        "from_status",
        postgresql.ENUM("Open", "In Progress", "Resolved", "Closed", name="ticket_status", create_type=False),
    ),
    sa.column(
        "to_status",
        postgresql.ENUM("Open", "In Progress", "Resolved", "Closed", name="ticket_status", create_type=False),
    ),
    sa.column("changed_by", sa.Integer),
)

EXAMPLE_TICKETS = [
    {
        "title": "Laptop does not connect to Wi-Fi",
        "description": "The employee laptop disconnects repeatedly from the office Wi‑Fi and cannot maintain a stable connection.",
        "category": "IT",
        "priority": "High",
        "status": "Open",
        "created_by_email": "employee@company.com",
    },
    {
        "title": "Broken desk chair in office 2B",
        "description": "A desk chair in the office is broken and needs replacement before the team can resume working normally.",
        "category": "Facilities",
        "priority": "Medium",
        "status": "In Progress",
        "created_by_email": "employee@company.com",
    },
    {
        "title": "Payroll document request",
        "description": "The employee needs an updated payroll document and confirmation regarding the latest deduction summary.",
        "category": "HR",
        "priority": "Low",
        "status": "Resolved",
        "created_by_email": "employee@company.com",
    },
    {
        "title": "VPN access expired for contractor",
        "description": "A contractor lost access to the VPN after a temporary account was removed and needs it restored for limited access.",
        "category": "IT",
        "priority": "Urgent",
        "status": "Closed",
        "created_by_email": "employee@company.com",
    },
]


def _get_user_id(conn, email: str) -> int:
    result = conn.execute(sa.select(users_table.c.id).where(users_table.c.email == email)).scalar_one()
    return int(result)


def _get_ticket_id(conn, title: str) -> int:
    result = conn.execute(sa.select(tickets_table.c.id).where(tickets_table.c.title == title)).scalar_one()
    return int(result)


def upgrade() -> None:
    conn = op.get_bind()

    ticket_rows = [
        {
            "title": row["title"],
            "description": row["description"],
            "category": row["category"],
            "priority": row["priority"],
            "status": row["status"],
            "created_by": _get_user_id(conn, row["created_by_email"]),
        }
        for row in EXAMPLE_TICKETS
    ]

    op.bulk_insert(tickets_table, ticket_rows)

    ticket_ids = {row["title"]: _get_ticket_id(conn, row["title"]) for row in EXAMPLE_TICKETS}
    support_id = _get_user_id(conn, "support@company.com")

    status_history_rows = [
        {
            "ticket_id": ticket_ids["Laptop does not connect to Wi-Fi"],
            "from_status": None,
            "to_status": "Open",
            "changed_by": _get_user_id(conn, "employee@company.com"),
        },
        {
            "ticket_id": ticket_ids["Broken desk chair in office 2B"],
            "from_status": "Open",
            "to_status": "In Progress",
            "changed_by": support_id,
        },
        {
            "ticket_id": ticket_ids["Payroll document request"],
            "from_status": "Open",
            "to_status": "In Progress",
            "changed_by": support_id,
        },
        {
            "ticket_id": ticket_ids["Payroll document request"],
            "from_status": "In Progress",
            "to_status": "Resolved",
            "changed_by": support_id,
        },
        {
            "ticket_id": ticket_ids["VPN access expired for contractor"],
            "from_status": "Open",
            "to_status": "In Progress",
            "changed_by": support_id,
        },
        {
            "ticket_id": ticket_ids["VPN access expired for contractor"],
            "from_status": "In Progress",
            "to_status": "Resolved",
            "changed_by": support_id,
        },
        {
            "ticket_id": ticket_ids["VPN access expired for contractor"],
            "from_status": "Resolved",
            "to_status": "Closed",
            "changed_by": support_id,
        },
    ]

    op.bulk_insert(status_history_table, status_history_rows)


def downgrade() -> None:
    conn = op.get_bind()
    ticket_titles = [row["title"] for row in EXAMPLE_TICKETS]

    conn.execute(
        status_history_table.delete().where(
            status_history_table.c.ticket_id.in_(
                sa.select(tickets_table.c.id).where(tickets_table.c.title.in_(ticket_titles))
            )
        )
    )
    conn.execute(tickets_table.delete().where(tickets_table.c.title.in_(ticket_titles)))
