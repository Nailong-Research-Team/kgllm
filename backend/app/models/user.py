from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy import Boolean, Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "user"
    is_superuser: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    role = Column(String, default=UserRole.USER)
    created_at = Column(String, nullable=False)

class UserInDB(UserInDBBase):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class User:
    def __init__(
        self,
        id: int,
        email: str,
        full_name: str,
        hashed_password: str,
        is_active: bool = True,
        role: UserRole = UserRole.USER,
        created_at: Optional[datetime] = None
    ):
        self.id = id
        self.email = email
        self.full_name = full_name
        self.hashed_password = hashed_password
        self.is_active = is_active
        self.role = role
        self.created_at = created_at or datetime.utcnow() 