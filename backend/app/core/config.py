from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    app_env: Literal["development", "staging", "production"] = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"

    # CORS — provide as a JSON array in .env: ["http://localhost:5173"]
    cors_origins: list[str] = Field(default=["http://localhost:5173"])

    # Database
    database_url: str

    # LLM provider
    groq_api_key: str


@lru_cache
def get_settings() -> Settings:
    return Settings()
