import os

os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://ticketock:ticketock@db:5432/ticketock_test",
)

from pathlib import Path

import psycopg
import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.config import settings
from app.main import app
from app.repositories import user_repository

BACKEND_DIR = Path(__file__).resolve().parent.parent

EMPLOYEE_EMAIL = "employee@company.com"
EMPLOYEE_PASSWORD = "employee123"
SUPPORT_EMAIL = "support@company.com"
SUPPORT_PASSWORD = "support123"


def _ensure_database_exists(database_url: str) -> None:
    url = make_url(database_url)
    with psycopg.connect(
        host=url.host,
        port=url.port,
        user=url.username,
        password=url.password,
        dbname="postgres",
        autocommit=True,
    ) as conn:
        exists = conn.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s", (url.database,)
        ).fetchone()
        if not exists:
            conn.execute(f'CREATE DATABASE "{url.database}"')


@pytest.fixture(scope="session", autouse=True)
def _test_database() -> None:
    _ensure_database_exists(settings.database_url)

    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    command.upgrade(cfg, "head")


@pytest.fixture(scope="session")
def test_engine(_test_database):
    engine = create_engine(settings.database_url)
    yield engine
    engine.dispose()


@pytest.fixture()
def db_session(test_engine):
    connection = test_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def employee_user(db_session):
    return user_repository.get_by_email(db_session, EMPLOYEE_EMAIL)


@pytest.fixture()
def support_user(db_session):
    return user_repository.get_by_email(db_session, SUPPORT_EMAIL)


def auth_headers(test_client: TestClient, email: str, password: str) -> dict:
    response = test_client.post("/api/auth/login", json={"email": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
