from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import psutil

app = FastAPI(
    title="FastAPI React Demo API",
    description="这是一个自动生成的API文档",
    version="1.0.0",
    contact={
        "name": "技术支持",
        "email": "support@example.com",
    },
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    role: str = "user"

    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "email": "zhangsan@example.com",
                "full_name": "张三",
                "role": "user"
            }
        }

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "password123"
            }
        }

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }

class SystemStats(BaseModel):
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: dict

    class Config:
        schema_extra = {
            "example": {
                "cpu_usage": 45.2,
                "memory_usage": 62.8,
                "disk_usage": 75.5,
                "network_io": {
                    "bytes_sent": 1024576,
                    "bytes_recv": 2048576
                }
            }
        }

class ChatMessage(BaseModel):
    message: str

    class Config:
        schema_extra = {
            "example": {
                "message": "你好，我需要帮助。"
            }
        }

class ChatResponse(BaseModel):
    text: str
    response: str

    class Config:
        schema_extra = {
            "example": {
                "text": "你好，我需要帮助。",
                "response": "你好！我很乐意帮助你。请告诉我你的问题。"
            }
        }

# 认证
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # 这里应该验证token并返回用户信息
    return User(id=1, email="user@example.com", full_name="测试用户")

# API路由
@app.post("/api/v1/auth/login", response_model=LoginResponse, tags=["认证"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    用户登录接口
    """
    return {
        "access_token": "dummy_token",
        "token_type": "bearer"
    }

@app.get("/api/v1/users/profile", response_model=User, tags=["用户"])
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    获取当前用户信息
    """
    return current_user

@app.put("/api/v1/users/profile", response_model=User, tags=["用户"])
async def update_user_profile(
    user_update: UserBase,
    current_user: User = Depends(get_current_user)
):
    """
    更新用户信息
    """
    return {**current_user.dict(), **user_update.dict()}

@app.post("/api/v1/users/change-password", tags=["用户"])
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user)
):
    """
    修改密码
    """
    return {"message": "密码修改成功"}

@app.get("/api/v1/system/stats", response_model=SystemStats, tags=["系统"])
async def get_system_stats(current_user: User = Depends(get_current_user)):
    """
    获取系统状态
    """
    cpu_usage = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    net_io = psutil.net_io_counters()

    return {
        "cpu_usage": cpu_usage,
        "memory_usage": memory.percent,
        "disk_usage": disk.percent,
        "network_io": {
            "bytes_sent": net_io.bytes_sent,
            "bytes_recv": net_io.bytes_recv
        }
    }

@app.post("/api/v1/chat/message", response_model=ChatResponse, tags=["聊天"])
async def send_message(
    message: ChatMessage,
    current_user: User = Depends(get_current_user)
):
    """
    发送聊天消息
    """
    return {
        "text": message.message,
        "response": f"这是对'{message.message}'的回应"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 