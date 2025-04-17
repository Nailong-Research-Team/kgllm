from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User, UserRole
from app.services.user import create_user, get_user_by_email
from app.core.config import settings

def create_admin_user():
    # 创建数据库引擎
    engine = create_engine(
        f"mysql+mysqlconnector://{settings.MYSQL_USER}:{settings.MYSQL_PASSWORD}@{settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DB}"
    )
    
    # 创建会话
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        # 创建管理员用户
        admin_email = "2944006086@qq.com"
        admin_password = "admin123"
        admin_name = "管理员"
        
        # 检查用户是否已存在
        existing_user = get_user_by_email(session, admin_email)
        if existing_user:
            print("管理员用户已存在")
            return
        
        # 创建管理员用户
        admin_user = create_user(
            session,
            email=admin_email,
            password=admin_password,
            full_name=admin_name,
            role=UserRole.ADMIN,
            is_superuser=True
        )
        
        session.commit()
        print("管理员用户创建成功！")
        print(f"邮箱: {admin_email}")
        print(f"密码: {admin_password}")
    finally:
        session.close()

if __name__ == "__main__":
    create_admin_user() 