# 求职管理系统 - 设置指南

## 🏗️ 系统架构

本系统已改造为**前后端分离架构**，采用本地数据库存储：

- **前端**: React + Vite + TailwindCSS
- **后端**: Node.js + Express
- **数据库**: PostgreSQL
- **认证**: JWT (JSON Web Token)

## 📋 环境要求

- Node.js 18+ 
- PostgreSQL 15+ （或使用 Docker）
- npm 或 yarn

## 🚀 快速开始

### 方式一：使用 Docker（推荐）

1. **安装依赖**
```bash
npm install
```

2. **启动 PostgreSQL 数据库**
```bash
# 使用 Docker Compose 启动数据库
npm run docker:db:up

# 等待数据库启动完成（约10秒）
```

3. **初始化数据库**
```bash
# 数据库会自动初始化（通过 init.sql）
# 如果需要手动初始化，可以运行：
npm run db:init
```

4. **配置环境变量**
```bash
# .env 文件已创建，默认配置适用于 Docker
# 如需修改，请编辑 .env 文件
```

5. **启动服务**
```bash
# 同时启动前端和后端（推荐）
npm run dev:all

# 或分别启动：
# 终端1 - 启动前端
npm run dev

# 终端2 - 启动后端
npm run server:dev
```

6. **访问应用**
- 前端: http://localhost:5173
- 后端 API: http://localhost:3000/api
- 数据库管理 (Adminer): http://localhost:8081
  - 系统: PostgreSQL
  - 服务器: db (Docker 内部) 或 localhost (本地)
  - 用户名: postgres
  - 密码: postgres
  - 数据库: job_tracker

### 方式二：使用本地 PostgreSQL

1. **安装并启动 PostgreSQL**
   - macOS: `brew install postgresql@15 && brew services start postgresql@15`
   - Ubuntu: `sudo apt install postgresql-15`
   - Windows: 下载并安装 PostgreSQL

2. **创建数据库**
```bash
# 连接到 PostgreSQL
psql -U postgres

# 在 psql 中执行
CREATE DATABASE job_tracker;
\q
```

3. **初始化数据库表**
```bash
npm run db:init
```

4. **配置环境变量**
```bash
# 编辑 .env 文件，确保数据库配置正确
DB_HOST=localhost
DB_PORT=5432
DB_NAME=job_tracker
DB_USER=postgres
DB_PASSWORD=your_password
```

5. **安装依赖并启动**
```bash
npm install
npm run dev:all
```

## 📁 项目结构

```
project/
├── server/                    # 后端代码
│   ├── config/
│   │   └── database.js       # 数据库配置
│   ├── middleware/
│   │   └── auth.js           # JWT 认证中间件
│   ├── routes/
│   │   ├── auth.js           # 认证路由（注册/登录）
│   │   └── applications.js   # 求职申请路由
│   ├── db/
│   │   └── init.sql          # 数据库初始化脚本
│   └── server.js             # 服务器入口
├── src/                       # 前端代码
│   ├── api/
│   │   ├── auth.js           # 认证 API
│   │   └── applications.js   # 求职申请 API
│   ├── context/
│   │   └── AuthContext.jsx   # 认证上下文
│   ├── pages/
│   │   ├── Login.jsx         # 登录页面
│   │   ├── Register.jsx      # 注册页面
│   │   └── Index.jsx         # 主页面
│   └── ...
├── .env                       # 环境变量
├── docker-compose.yml         # Docker 配置
└── package.json
```

## 🔑 API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - 用户登录
  ```json
  {
    "username": "user123",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - 获取当前用户信息（需要 token）

### 求职申请接口（需要认证）

- `GET /api/applications` - 获取当前用户的所有求职申请
- `GET /api/applications/:id` - 获取单个求职申请详情
- `POST /api/applications` - 创建新的求职申请
- `PUT /api/applications/:id` - 更新求职申请
- `DELETE /api/applications/:id` - 删除求职申请

所有需要认证的接口都需要在请求头中携带 token：
```
Authorization: Bearer <your-jwt-token>
```

## 🗃️ 数据库表结构

### users（用户表）
- id: 用户ID（主键）
- username: 用户名（唯一）
- email: 邮箱（唯一）
- password_hash: 密码哈希
- created_at: 创建时间
- updated_at: 更新时间

### job_applications（求职申请表）
- id: UUID（主键）
- user_id: 用户ID（外键）
- company: 公司名称
- base: 工作地点
- jd: 职位描述
- resume_version: 简历版本
- application_link: 申请链接
- status: 当前状态
- application_date: 投递日期
- update_date: 更新日期
- notes: 备注
- created_at: 创建时间
- updated_at: 更新时间

### status_history（状态历史表）
- id: 历史记录ID（主键）
- application_id: 申请ID（外键）
- status: 状态
- date: 状态变更日期
- color: 颜色标记
- created_at: 创建时间

## 🔧 常用命令

```bash
# 开发环境
npm run dev              # 启动前端
npm run server           # 启动后端
npm run server:dev       # 启动后端（带热重载）
npm run dev:all          # 同时启动前后端

# 数据库
npm run docker:db:up     # 启动 Docker 数据库
npm run docker:db:down   # 停止 Docker 数据库
npm run db:init          # 初始化数据库表

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览生产版本

# 代码检查
npm run lint             # ESLint 检查
```

## 🛠️ 故障排除

### 1. 数据库连接失败
- 检查 PostgreSQL 是否正在运行
- 确认 .env 文件中的数据库配置正确
- 如使用 Docker，确保容器正在运行：`docker ps`

### 2. 端口被占用
- 前端默认端口：5173
- 后端默认端口：3000
- 数据库默认端口：5432
- 修改 .env 文件中的 PORT 配置

### 3. 认证失败
- 检查 JWT_SECRET 是否配置
- 确认 token 是否过期（默认 7 天）
- 清除浏览器 localStorage 重新登录

### 4. 数据库表不存在
```bash
# 重新初始化数据库
npm run db:init
```

### 5. Docker 数据库无法访问
```bash
# 检查容器状态
docker ps

# 查看容器日志
docker logs job_tracker_db

# 重启容器
npm run docker:db:down
npm run docker:db:up
```

## 🔒 安全建议

1. **生产环境必做**：
   - 修改 `.env` 中的 `JWT_SECRET` 为复杂的随机字符串
   - 修改数据库密码
   - 启用 HTTPS
   - 配置 CORS 白名单

2. **密码安全**：
   - 系统使用 bcrypt 加密密码
   - 密码最小长度为 6 位
   - 建议用户使用强密码

3. **Token 管理**：
   - JWT token 默认有效期 7 天
   - token 存储在 localStorage
   - 可根据需求调整过期时间

## 📝 开发说明

### 添加新的 API 接口

1. 在 `server/routes/` 中创建或修改路由文件
2. 在 `src/api/` 中添加对应的前端 API 调用
3. 在需要的组件中引入并使用

### 修改数据库结构

1. 修改 `server/db/init.sql`
2. 重新初始化数据库：`npm run db:init`
3. 更新相应的 API 和前端代码

### 添加新功能

1. 后端：添加路由和业务逻辑
2. 前端：创建组件和页面
3. API：连接前后端
4. 测试功能是否正常

## 📚 相关技术文档

- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [JWT](https://jwt.io/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License
