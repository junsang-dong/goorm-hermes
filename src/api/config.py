from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./data/dkos.db"
    github_token: str = ""
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    google_api_key: str = ""
    perplexity_api_key: str = ""
    hermes_home: str = "~/.hermes"
    gateway_url: str = "http://localhost:8787"
    upload_dir: str = "./data/uploads"
    api_port: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
