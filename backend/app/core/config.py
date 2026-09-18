from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://ticketock:ticketock@db:5432/ticketock"
    jwt_secret_key: str = "dev-secret-change-me"
    access_token_expire_seconds: int = 3600


settings = Settings()
