#!/usr/bin/env python3
"""
Configuration module for CV Processing Pipeline
Manages database and API configurations
"""

import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class DatabaseConfig:
    """Database configuration class"""
    host: str
    user: str
    password: str
    database: str
    port: int = 3306
    
    @classmethod
    def from_env(cls) -> 'DatabaseConfig':
        """Create database config from environment variables"""
        return cls(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'CIH2'),
            port=int(os.getenv('DB_PORT', '3306'))
        )

@dataclass
class OllamaConfig:
    """Ollama configuration class - compatible with legacy client"""
    model: str
    timeout: int = 120
    
    @classmethod
    def from_env(cls) -> 'OllamaConfig':
        """Create Ollama config from environment variables"""
        return cls(
            model=os.getenv('OLLAMA_MODEL', 'llama3'),  # Changed default to match legacy
            timeout=int(os.getenv('OLLAMA_TIMEOUT', '120'))
        )

@dataclass
class AppConfig:
    """Application configuration"""
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(levelname)s - %(message)s"
    
    @classmethod
    def from_env(cls) -> 'AppConfig':
        """Create app config from environment variables"""
        return cls(
            log_level=os.getenv('LOG_LEVEL', 'INFO'),
            log_format=os.getenv('LOG_FORMAT', '%(asctime)s - %(levelname)s - %(message)s')
        )