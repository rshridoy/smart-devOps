import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # OpenSearch
    OPENSEARCH_HOST: str = "opensearch"
    OPENSEARCH_PORT: int = 9200
    OPENSEARCH_USER: str = "admin"
    OPENSEARCH_PASSWORD: str = "admin"
    OPENSEARCH_USE_SSL: bool = False
    
    # Slack
    SLACK_WEBHOOK_URL: str = ""
    
    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "devops@example.com"
    ALERT_EMAIL_RECIPIENTS: str = ""
    
    # LLM
    OLLAMA_BASE_URL: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "mistral"
    
    # Backend
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    
    def get_email_recipients(self) -> List[str]:
        """Parse email recipients from comma-separated string"""
        if not self.ALERT_EMAIL_RECIPIENTS:
            return []
        return [email.strip() for email in self.ALERT_EMAIL_RECIPIENTS.split(",") if email.strip()]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
