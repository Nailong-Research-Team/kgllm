from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import users, admin, system, chat, auth
from app.core.config import settings
from app.db.database import init_mysql

app = FastAPI(
    title="KGLLM",
    description="API文档",
    version="1.0.0",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    contact={
        "name": "技术支持",
        "email": "support@example.com",
    },
    license_info={
        "name": "MIT",
    }
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Credentials"
    ],
    expose_headers=["*"],
    max_age=3600,
)

# 初始化数据库
@app.on_event("startup")
async def startup_event():
    init_mysql()

# 包含路由
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["认证"],
    responses={404: {"description": "未找到"}},
)

app.include_router(
    users.router,
    prefix="/api/v1/users",
    tags=["用户"],
    responses={404: {"description": "未找到"}},
)

app.include_router(
    admin.router,
    prefix="/api/v1/admin",
    tags=["管理员"],
    responses={404: {"description": "未找到"}},
)

app.include_router(
    system.router,
    prefix="/api/v1/system",
    tags=["系统"],
    responses={404: {"description": "未找到"}},
)

app.include_router(
    chat.router,
    prefix="/api/v1/chat",
    tags=["聊天"],
    responses={404: {"description": "未找到"}},
)

