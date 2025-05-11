## 项目结构

```
project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI 应用入口
│   │   ├── api/                    # API 相关代码
│   │   │   ├── v1/
│   │   │   │   └── endpoints/      # API端点实现（按功能模块划分）
│   │   │   │       ├── chat.py         # 聊天消息相关接口
│   │   │   │       ├── zhipuai_api.py  # 调用智谱AI大模型API的接口
│   │   │   │       ├── users.py        # 用户管理相关接口
│   │   │   │       ├── admin.py        # 管理员相关接口
│   │   │   │       ├── auth.py         # 认证登录相关接口
│   │   │   │       └── system.py       # 系统信息/健康检查等接口
│   │   │   └── deps.py             # API依赖项（认证、权限等）
│   │   ├── core/                   # 核心配置和工具
│   │   │   ├── config.py           # 应用配置（环境变量、常量等）
│   │   │   └── security.py         # 安全相关（JWT、密码加密等）
│   │   ├── crud/                   # 数据库操作层
│   │   │   ├── base.py            # 基础CRUD操作
│   │   │   ├── crud_user.py       # 用户相关数据库操作
│   │   │   └── crud_message.py    # 消息相关数据库操作
│   │   ├── db/                     # 数据库配置
│   │   │   └── database.py        # 数据库连接和会话管理
│   │   ├── models/                 # 数据库模型（ORM模型）
│   │   │   ├── user.py            # 用户表模型
│   │   │   └── message.py         # 消息表模型
│   │   ├── schemas/               # Pydantic模型（数据验证和序列化）
│   │   │   ├── user.py           # 用户相关的请求/响应模型
│   │   │   └── message.py        # 消息相关的请求/响应模型
│   │   └── services/             # 业务逻辑层
│   │       ├── auth.py           # 认证相关业务逻辑
│   │       └── chat.py           # 聊天相关业务逻辑
│   └── requirements.txt           # 后端依赖
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React组件
│   │   ├── routes/              # 路由组件
│   │   ├── services/            # API服务
│   │   └── hooks/              # 自定义Hooks
│   ├── package.json
│   └── vite.config.ts
│
└── README.md

```

### 后端目录说明

1. **api/** - API层
   - `v1/endpoints/`: API端点实现，按功能模块划分
   - `deps.py`: 依赖注入，包含认证、权限等通用依赖

2. **core/** - 核心配置
   - `config.py`: 应用配置，环境变量管理
   - `security.py`: 安全相关功能，如JWT处理、密码加密

3. **crud/** - 数据访问层
   - 实现与数据库的直接交互
   - 提供基础的CRUD（创建、读取、更新、删除）操作
   - 每个模型对应一个CRUD文件

4. **db/** - 数据库配置
   - 数据库连接管理
   - 会话处理
   - 数据库初始化

5. **models/** - 数据库模型
   - 定义数据库表结构
   - ORM模型定义
   - 表关系映射

6. **schemas/** - 数据验证模型
   - 请求数据验证
   - 响应数据序列化
   - 使用Pydantic模型确保数据类型安全

7. **services/** - 业务逻辑层
   - 实现具体的业务逻辑
   - 协调不同模块之间的交互
   - 处理复杂的业务规则

### 前端目录说明

1. **components/** - UI组件
   - 可重用的界面组件
   - 展示型组件
   - 功能型组件

2. **routes/** - 路由组件
   - 页面级组件
   - 路由配置
   - 布局组件

3. **services/** - API服务
   - API调用封装
   - 数据处理
   - 类型定义

4. **hooks/** - React Hooks
   - 自定义hooks
   - 状态管理
   - 共享逻辑

## 快速开始

### 后端设置

1. 创建并激活虚拟环境：
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
.\venv\Scripts\activate  # Windows
```

或者使用 conda

2. 安装依赖：
```bash
pip install -r requirements.txt
```

依赖有些还没加进去，到时候完善一下

3. 配置环境变量（创建 .env 文件，仅需配置 AI Key，数据库等参数如无特殊需求可用默认值）：
```env
ZHIPUAI_API_KEY=你的智谱AI key
```

如需自定义数据库连接，请在 .env 中补充：
```env
ZHIPUAI_API_KEY=your-zhipuai-api-key
```

4. 启动后端服务：
```bash
uvicorn app.main:app --reload
```

### 前端设置

1. 安装依赖：
```bash
cd frontend
npm install
```

2. 启动开发服务器：
```bash
npm start
```

4. 访问 `http://localhost:3000` 即可体验前端聊天界面。

## API文档

### 认证接口

#### 注册
- **端点**: `/api/register`
- **方法**: POST
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "full_name": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "access_token": "eyJ...",
    "token_type": "bearer"
  }
  ```

#### 登录
- **端点**: `/api/token`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "user@example.com",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "access_token": "eyJ...",
    "token_type": "bearer"
  }
  ```

### 聊天接口

#### 发送消息
- **端点**: `/api/v1/chat/send`
- **方法**: POST
- **认证**: Bearer Token
- **请求体**:
  ```json
  {
    "content": "消息内容"
  }
  ```
- **响应**:
  ```json
  {
    "id": 1,
    "content": "AI助手的回复",
    "role": "assistant",
    "timestamp": "2024-01-01T12:00:00"
  }
  ```

#### 获取聊天历史
- **端点**: `/api/v1/chat/history`
- **方法**: GET
- **认证**: Bearer Token
- **响应**:
  ```json
  [
    {
      "id": 1,
      "content": "用户消息",
      "role": "user",
      "timestamp": "2024-01-01T12:00:00"
    },
    {
      "id": 2,
      "content": "AI回复",
      "role": "assistant",
      "timestamp": "2024-01-01T12:00:01"
    }
  ]
  ```

## 开发规范

### API规范

1. 路由命名：
   - 使用复数名词：`/users`, `/messages`
   - 版本控制：`/api/v1/...`
   - 使用小写字母和连字符：`user-settings`

2. HTTP方法：
   - GET：获取资源
   - POST：创建资源
   - PUT：更新资源
   - DELETE：删除资源

3. 状态码：
   - 200：成功
   - 201：创建成功
   - 400：请求错误
   - 401：未认证
   - 403：未授权
   - 404：未找到
   - 500：服务器错误

4. 错误响应格式：
   ```json
   {
     "detail": "错误描述"
   }
   ```

## 在线文档

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

---

## 数据库表结构（仅供参考）

### users 表
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### messages 表
```sql
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

