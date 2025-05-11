from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from app.api.deps import get_current_active_user
from app.models.chat import Message, MessageCreate
from app.db.database import get_mysql_connection
from .zhipuai_api import get_zhipuai_reply
from app.evorag import model

router = APIRouter()

@router.post(
    "/send",
    response_model=Message,
    summary="发送消息",
    description="发送一条新消息并获取AI助手的回复",
    response_description="返回助手的回复消息",
)
async def send_message(
    message: MessageCreate,
    current_user = Depends(get_current_active_user)
):
    """
    发送消息并获取回复
    
    - **content**: 消息内容
    
    返回:
    - **id**: 消息ID
    - **content**: 消息内容
    - **role**: 消息角色（assistant）
    - **timestamp**: 时间戳
    """
    mysql_conn = get_mysql_connection()
    cursor = mysql_conn.cursor(dictionary=True)
    
    try:
        # 保存用户消息
        cursor.execute(
            """
            INSERT INTO messages (user_id, content, role, timestamp)
            VALUES (%s, %s, %s, %s)
            """,
            (current_user["id"], message.content, "user", datetime.utcnow())
        )
        mysql_conn.commit()
        
        # 调用AI服务获取回复
        assistant_response = await model.deepseek_v3(message.content)
        
        # 保存助手回复
        cursor.execute(
            """
            INSERT INTO messages (user_id, content, role, timestamp)
            VALUES (%s, %s, %s, %s)
            """,
            (current_user["id"], assistant_response, "assistant", datetime.utcnow())
        )
        mysql_conn.commit()

        assistant_msg_id = cursor.lastrowid
        cursor.execute(
            "SELECT id, content, role, timestamp FROM messages WHERE id = %s",
            (assistant_msg_id,)
        )
        response = cursor.fetchone()
        return response
        
    finally:
        cursor.close()
        mysql_conn.close()

@router.get(
    "/history",
    response_model=List[Message],
    summary="获取聊天历史",
    description="获取当前用户的聊天历史记录",
    response_description="返回消息列表",
)
async def get_chat_history(
    current_user = Depends(get_current_active_user)
):
    """
    获取聊天历史记录
    
    返回:
    - 消息列表，每条消息包含：
      - **id**: 消息ID
      - **content**: 消息内容
      - **role**: 消息角色（user 或 assistant）
      - **timestamp**: 时间戳
    """
    mysql_conn = get_mysql_connection()
    cursor = mysql_conn.cursor(dictionary=True)
    
    try:
        cursor.execute(
            """
            SELECT id, content, role, timestamp
            FROM messages
            WHERE user_id = %s
            ORDER BY timestamp ASC
            """,
            (current_user["id"],)
        )
        messages = cursor.fetchall()
        return messages
        
    finally:
        cursor.close()
        mysql_conn.close() 