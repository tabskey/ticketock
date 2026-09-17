from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://ticketock:ticketock@db:5432/ticketock"


settings = Settings()
