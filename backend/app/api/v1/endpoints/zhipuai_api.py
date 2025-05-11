import requests
from app.core.config import settings

def get_zhipuai_reply(user_query: str) -> str:
    """
    调用质谱AI接口获取回复
    """
    api_key = getattr(settings, "ZHIPUAI_API_KEY", None)
    if not api_key:
        raise ValueError("ZHIPUAI_API_KEY not found in environment variables.")
    
    url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    data = {
        "model": "glm-4",
        "messages": [
            {"role": "user", "content": user_query}
        ]
    }
    response = requests.post(url, headers=headers, json=data, timeout=30)
    response.raise_for_status()
    result = response.json()
    # 适配返回格式
    return result.get("choices", [{}])[0].get("message", {}).get("content", "[无回复]")
