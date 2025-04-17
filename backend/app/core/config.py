from pydantic_settings import BaseSettings
from typing import Optional, Dict, Any

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

    class Config:
        env_file = ".env"
        extra = "allow"  # 允许额外的配置项

settings = Settings() 