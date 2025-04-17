from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from app.api import deps
from app.core.security import get_password_hash, verify_password
from app.models.user import UserRole

router = APIRouter()

@router.get("/profile")
def get_current_user(
    current_user: Dict = Depends(deps.get_current_user)
):
    """
    获取当前用户信息
    """
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "role": current_user.get("role", "user"),
        "is_active": current_user.get("is_active", True),
        "is_superuser": current_user.get("is_superuser", False)
    }

@router.get("/")
def read_users(
    db = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取用户列表
    """
    if not current_user.get("role") == "admin" and not current_user.get("is_superuser"):
        raise HTTPException(
            status_code=400, detail="权限不足"
        )
    
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM users LIMIT %s OFFSET %s",
        (limit, skip)
    )
    users = cursor.fetchall()
    cursor.close()
    return users

@router.put("/profile")
def update_profile(
    *,
    db = Depends(deps.get_db),
    full_name: str,
    current_user: Dict = Depends(deps.get_current_user)
):
    """
    更新用户个人信息
    """
    cursor = db.cursor()
    cursor.execute(
        "UPDATE users SET full_name = %s WHERE id = %s",
        (full_name, current_user["id"])
    )
    db.commit()
    cursor.close()
    
    return {"message": "Profile updated successfully"}

@router.post("/change-password")
def change_password(
    *,
    db = Depends(deps.get_db),
    current_password: str,
    new_password: str,
    current_user: Dict = Depends(deps.get_current_user)
):
    """
    修改密码
    """
    # 验证当前密码
    if not verify_password(current_password, current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="当前密码错误"
        )
    
    # 更新密码
    hashed_password = get_password_hash(new_password)
    cursor = db.cursor()
    cursor.execute(
        "UPDATE users SET hashed_password = %s WHERE id = %s",
        (hashed_password, current_user["id"])
    )
    db.commit()
    cursor.close()
    
    return {"message": "Password updated successfully"}
    return {"message": "Password updated successfully"}

@router.put("/{user_id}")
def update_user(
    *,
    db = Depends(deps.get_db),
    user_id: int,
    full_name: str,
    email: str,
    current_user: Dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    更新用户信息
    """
    # 检查用户是否存在
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        raise HTTPException(
            status_code=404,
            detail="用户不存在",
        )
    
    # 检查权限
    if not current_user.get("role") == "admin" and not current_user.get("is_superuser") and str(user_id) != str(current_user.get("id")):
        cursor.close()
        raise HTTPException(
            status_code=400, detail="权限不足"
        )
    
    # 更新用户信息
    cursor.execute(
        "UPDATE users SET full_name = %s, email = %s WHERE id = %s",
        (full_name, email, user_id)
    )
    db.commit()
    
    # 获取更新后的用户信息
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    updated_user = cursor.fetchone()
    cursor.close()
    
    return updated_user

@router.delete("/{user_id}")
def delete_user(
    *,
    db = Depends(deps.get_db),
    user_id: int,
    current_user: Dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    删除用户
    """
    # 检查权限
    if not current_user.get("role") == "admin" and not current_user.get("is_superuser"):
        raise HTTPException(
            status_code=400, detail="权限不足"
        )
    
    cursor = db.cursor(dictionary=True)
    
    # 检查用户是否存在
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        raise HTTPException(
            status_code=404,
            detail="用户不存在",
        )
    
    # 删除用户
    cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
    db.commit()
    cursor.close()
    
    return user 