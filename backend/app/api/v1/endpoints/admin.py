from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from app.api import deps

router = APIRouter()

@router.get("/users")
def get_users(
    db = Depends(deps.get_db),
    current_user: Dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    获取所有用户列表（仅管理员）
    """
    if not current_user.get("role") == "admin" and not current_user.get("is_superuser"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="没有足够的权限"
        )
    
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    cursor.close()
    
    return users
