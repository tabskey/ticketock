"""seed users

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-17

"""
from typing import Sequence, Union

import bcrypt
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

users_table = sa.table(
    "users",
    sa.column("id", sa.Integer),
    sa.column("email", sa.String),
    sa.column("hashed_password", sa.String),
    sa.column("role", postgresql.ENUM("employee", "support", name="user_role", create_type=False)),
)

SEED_USERS = [
    {"email": "employee@company.com", "password": "employee123", "role": "employee"},
    {"email": "support@company.com", "password": "support123", "role": "support"},
]


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def upgrade() -> None:
    op.bulk_insert(
        users_table,
        [
            {
                "email": seed_user["email"],
                "hashed_password": _hash(seed_user["password"]),
                "role": seed_user["role"],
            }
            for seed_user in SEED_USERS
        ],
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        users_table.delete().where(
            users_table.c.email.in_([seed_user["email"] for seed_user in SEED_USERS])
        )
    )
