from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.schemas.user import UserCreate, Token
from app.db.database import get_mysql_connection

router = APIRouter()

@router.post(
    "/register",
    response_model=Token,
    summary="用户注册",
    description="注册新用户并返回访问令牌",
    response_description="包含访问令牌的响应",
    status_code=status.HTTP_201_CREATED,
)
async def register(user: UserCreate):
    """
    注册新用户
    
    - **email**: 用户邮箱（必须是有效的邮箱格式）
    - **full_name**: 用户全名
    - **password**: 密码（至少8个字符）
    
    返回:
    - **access_token**: JWT访问令牌
    - **token_type**: 令牌类型（bearer）
    """
    mysql_conn = get_mysql_connection()
    cursor = mysql_conn.cursor(dictionary=True)
    
    try:
        # 检查用户是否已存在
        cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该邮箱已被注册"
            )
        
        # 创建新用户
        hashed_password = get_password_hash(user.password)
        cursor.execute(
            """
            INSERT INTO users (email, full_name, hashed_password)
            VALUES (%s, %s, %s)
            """,
            (user.email, user.full_name, hashed_password)
        )
        mysql_conn.commit()
        
        # 创建访问令牌
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    finally:
        cursor.close()
        mysql_conn.close()

@router.post(
    "/token",
    response_model=Token,
    summary="用户登录",
    description="使用邮箱和密码登录并获取访问令牌",
    response_description="包含访问令牌的响应",
)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    用户登录获取令牌
    
    - **username**: 用户邮箱
    - **password**: 用户密码
    
    返回:
    - **access_token**: JWT访问令牌
    - **token_type**: 令牌类型（bearer）
    
    可能的错误:
    - **401 Unauthorized**: 邮箱或密码错误
    """
    mysql_conn = get_mysql_connection()
    cursor = mysql_conn.cursor(dictionary=True)
    
    try:
        # 使用 form_data.username 作为 email
        cursor.execute(
            "SELECT * FROM users WHERE email = %s",
            (form_data.username,)
        )
        user = cursor.fetchone()
        
        if not user or not verify_password(form_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="邮箱或密码错误",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    finally:
        cursor.close()
        mysql_conn.close() 