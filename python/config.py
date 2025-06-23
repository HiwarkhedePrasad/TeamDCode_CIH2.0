import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env file if present

class DatabaseConfig:
    def __init__(self, host, port, user, password, database):
        self.host = host
        self.port = int(port)
        self.user = user
        self.password = password
        self.database = database

    @classmethod
    def from_env(cls):
        return cls(
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", 3306),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "root"),
            database=os.getenv("DB_NAME", "CIH2")
        )

class OllamaConfig:
    def __init__(self, model):
        self.model = model

    @classmethod
    def from_env(cls):
        return cls(
            model=os.getenv("OLLAMA_MODEL", "llama3")
        )

class AppConfig:
    def __init__(self, log_level="INFO", log_format="%(asctime)s - %(levelname)s - %(message)s"):
        self.log_level = log_level
        self.log_format = log_format

    @classmethod
    def from_env(cls):
        return cls(
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            log_format=os.getenv("LOG_FORMAT", "%(asctime)s - %(levelname)s - %(message)s")
        )
