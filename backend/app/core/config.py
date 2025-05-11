from pydantic_settings import BaseSettings
from typing import Optional, Dict, Any
from dotenv import load_dotenv;

load_dotenv()

class Settings(BaseSettings):
    # JWT设置
    SECRET_KEY: str = "your-secret-key-here"  # 在生产环境中应该使用环境变量
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # MySQL设置
    MYSQL_HOST: str = "localhost"
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = "root"
    MYSQL_DB: str = "fastapi_demo"
    MYSQL_PORT: int = 3306

    # Neo4j设置
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"

    ZHIPUAI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "allow" 

settings = Settings() 