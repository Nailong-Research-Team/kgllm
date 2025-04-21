from pydantic import BaseModel
from datetime import datetime
from typing import Literal

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    role: Literal['user', 'assistant']
    timestamp: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        schema_extra = {
            "example": {
                "id": 1,
                "content": "你好，我需要帮助。",
                "role": "user",
                "timestamp": "2024-01-01T12:00:00"
            }
        } 