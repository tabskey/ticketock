"""add name column to users

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-18

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

users_table = sa.table(
    "users",
    sa.column("email", sa.String),
    sa.column("name", sa.String),
)

SEED_NAMES = {
    "employee@company.com": "Tabatha Macedo",
    "support@company.com": "Rafael Souza",
}


def upgrade() -> None:
    op.add_column("users", sa.Column("name", sa.String(length=255), nullable=True))

    for email, name in SEED_NAMES.items():
        op.execute(
            users_table.update().where(users_table.c.email == email).values(name=name)
        )

    op.alter_column("users", "name", nullable=False)


def downgrade() -> None:
    op.drop_column("users", "name")
