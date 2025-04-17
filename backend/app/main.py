from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth
from app.api.v1.endpoints import users, admin, system
from app.core.config import settings
from app.db.database import init_mysql

app = FastAPI(title="FastAPI React Demo")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化数据库
@app.on_event("startup")
async def startup_event():
    init_mysql()

# 包含路由
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(system.router, prefix="/api/v1/system", tags=["system"])

