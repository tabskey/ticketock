"""add resolution_note column to status_history

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-20

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("status_history", sa.Column("resolution_note", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("status_history", "resolution_note")
