from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import UserCreate, Token
from app.db.database import get_mysql_connection

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    # MySQL操作
    mysql_conn = get_mysql_connection()
    cursor = mysql_conn.cursor(dictionary=True)
    
    # 检查用户是否已存在
    cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
    if cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # 创建新用户
    hashed_password = get_password_hash(user.password)
    cursor.execute(
        "INSERT INTO users (email, full_name, hashed_password) VALUES (%s, %s, %s)",
        (user.email, user.full_name, hashed_password)
    )
    mysql_conn.commit()
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    cursor.close()
    mysql_conn.close()
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    mysql_conn = get_mysql_connection()
    cursor = mysql_conn.cursor(dictionary=True)
    
    # 使用 form_data.username 作为 email（因为 OAuth2PasswordRequestForm 只有 username 字段）
    email = form_data.username  # 用户将在前端使用 email 登录
    
    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (email,)
    )
    user = cursor.fetchone()
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    cursor.close()
    mysql_conn.close()
    
    return {"access_token": access_token, "token_type": "bearer"} 