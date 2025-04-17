from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Any
from app.core.security import get_password_hash, verify_password
from app.api import deps
from app.schemas.user import UserUpdate, ChangePassword
from app.crud import crud_user

router = APIRouter()

@router.post("/change-password", response_model=dict)
def change_password(
    *,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    password_data: ChangePassword,
) -> Any:
    """
    修改用户密码
    """
    if not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="当前密码不正确"
        )
    
    hashed_password = get_password_hash(password_data.new_password)
    current_user.hashed_password = hashed_password
    db.add(current_user)
    db.commit()
    
    return {"message": "密码修改成功"} 