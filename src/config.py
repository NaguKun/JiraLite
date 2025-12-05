from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str

    # Email (Resend)
    RESEND_API_KEY: str
    FROM_EMAIL: str

    # AI
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # App
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Jira Lite API"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
