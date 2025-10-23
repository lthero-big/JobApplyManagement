# 求职管理系统改造完成 ✅

## 🎯 改造内容

已成功将系统从**浏览器本地存储**改造为**用户系统 + 本地数据库**架构！

### ✨ 主要变更

1. **用户认证系统**
   - ✅ 用户注册功能（用户名、邮箱、密码）
   - ✅ 用户登录功能（JWT Token 认证）
   - ✅ 密码加密（bcrypt）
   - ✅ Token 过期管理（7天有效期）
   - ✅ 登出功能

2. **数据库存储**
   - ✅ PostgreSQL 数据库
   - ✅ 用户表（users）
   - ✅ 求职申请表（job_applications）
   - ✅ 状态历史表（status_history）
   - ✅ 数据隔离（每个用户只能看到自己的数据）

3. **后端 API**
   - ✅ Express 服务器
   - ✅ RESTful API 设计
   - ✅ JWT 认证中间件
   - ✅ CORS 跨域支持
   - ✅ 错误处理

4. **前端改造**
   - ✅ 登录页面
   - ✅ 注册页面
   - ✅ 路由保护（未登录跳转）
   - ✅ 用户信息显示
   - ✅ 退出登录
   - ✅ API 集成

## 📁 新增文件

### 后端文件
```
server/
├── config/database.js          # 数据库连接配置
├── middleware/auth.js          # JWT 认证中间件
├── routes/auth.js              # 认证路由（注册/登录）
├── routes/applications.js      # 求职申请 CRUD API
├── db/init.sql                 # 数据库初始化脚本
└── server.js                   # Express 服务器入口
```

### 前端文件
```
src/
├── api/auth.js                 # 认证 API 调用
├── api/applications.js         # 求职申请 API 调用
├── context/AuthContext.jsx     # 认证状态管理
├── pages/Login.jsx             # 登录页面
└── pages/Register.jsx          # 注册页面
```

### 配置文件
```
.env                            # 环境变量配置
.env.example                    # 环境变量示例
docker-compose.yml              # Docker 数据库配置
nodemon.json                    # nodemon 配置
SETUP.md                        # 详细设置指南
QUICKSTART.md                   # 快速启动指南
```

## 🚀 如何运行

### 前提条件

您需要安装以下之一：
1. **Docker**（推荐） - 用于快速启动 PostgreSQL
2. **PostgreSQL**（本地安装） - 如果不使用 Docker

### 方案 A：使用 Docker（推荐）

```bash
# 1. 启动数据库
npm run docker:db:up

# 2. 同时启动前后端
npm run dev:all

# 3. 访问 http://localhost:5173
```

### 方案 B：使用本地 PostgreSQL

如果您没有 Docker，可以：

**在 macOS 上安装 PostgreSQL：**
```bash
# 使用 Homebrew 安装
brew install postgresql@15

# 启动服务
brew services start postgresql@15

# 创建数据库
createdb job_tracker

# 初始化表结构
psql -d job_tracker -f server/db/init.sql

# 启动应用
npm run dev:all
```

**在 Ubuntu/Linux 上安装：**
```bash
sudo apt update
sudo apt install postgresql-15
sudo systemctl start postgresql
sudo -u postgres createdb job_tracker
sudo -u postgres psql -d job_tracker -f server/db/init.sql
npm run dev:all
```

**在 Windows 上：**
1. 下载安装 PostgreSQL：https://www.postgresql.org/download/windows/
2. 使用 pgAdmin 或命令行创建数据库 `job_tracker`
3. 执行 `server/db/init.sql` 初始化表
4. 运行 `npm run dev:all`

## 📊 数据库结构

### users 表（用户）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| email | VARCHAR(100) | 邮箱（唯一） |
| password_hash | VARCHAR(255) | 加密密码 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### job_applications 表（求职申请）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | INTEGER | 用户ID（外键） |
| company | VARCHAR(100) | 公司名称 |
| base | VARCHAR(50) | 工作地点 |
| jd | TEXT | 职位描述 |
| resume_version | VARCHAR(50) | 简历版本 |
| application_link | TEXT | 申请链接 |
| status | VARCHAR(50) | 当前状态 |
| application_date | TIMESTAMP | 投递日期 |
| update_date | TIMESTAMP | 更新日期 |
| notes | TEXT | 备注 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### status_history 表（状态历史）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| application_id | UUID | 申请ID（外键） |
| status | VARCHAR(50) | 状态 |
| date | TIMESTAMP | 状态变更时间 |
| color | VARCHAR(20) | 颜色标记 |
| created_at | TIMESTAMP | 创建时间 |

## 🔑 API 端点

### 认证 API
```
POST /api/auth/register    # 用户注册
POST /api/auth/login       # 用户登录
GET  /api/auth/me          # 获取当前用户
```

### 求职申请 API（需要认证）
```
GET    /api/applications        # 获取所有申请
GET    /api/applications/:id    # 获取单个申请
POST   /api/applications        # 创建申请
PUT    /api/applications/:id    # 更新申请
DELETE /api/applications/:id    # 删除申请
```

## 🔒 安全特性

1. **密码加密**: 使用 bcrypt 加密，不存储明文密码
2. **JWT 认证**: 基于 Token 的无状态认证
3. **数据隔离**: 用户只能访问自己的数据
4. **SQL 注入防护**: 使用参数化查询
5. **CORS 配置**: 防止跨域攻击

## 📝 使用流程

1. **首次使用**
   - 访问 http://localhost:5173
   - 点击"注册"创建账户
   - 填写用户名、邮箱、密码

2. **登录系统**
   - 输入用户名和密码
   - 系统会保存 Token 到 localStorage
   - Token 有效期 7 天

3. **管理求职申请**
   - 添加新的投递记录
   - 更新申请状态
   - 查看状态历史
   - 筛选和搜索

4. **退出登录**
   - 点击右上角用户头像
   - 选择"退出登录"

## 🎨 主要特性保留

✅ 所有原有功能都已保留：
- 投递记录管理
- 状态跟踪
- 面试进度看板
- 筛选和搜索
- 统计图表
- 备注功能

## 🔄 数据迁移

**从 localStorage 到数据库：**

原有的 localStorage 数据不会自动迁移。如果需要保留旧数据：

1. 在浏览器控制台执行：
```javascript
// 导出旧数据
const oldData = localStorage.getItem('job_applications');
console.log(oldData);
// 复制输出的 JSON
```

2. 注册新账户后，可以通过前端界面重新添加

## 📚 文档说明

- **QUICKSTART.md** - 快速启动指南（最简单）
- **SETUP.md** - 完整设置文档（详细说明）
- **README.md** - 项目介绍

## ⚙️ 环境配置

所有配置在 `.env` 文件中：

```env
# 后端端口
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=job_tracker
DB_USER=postgres
DB_PASSWORD=postgres

# JWT 密钥（生产环境请修改！）
JWT_SECRET=your-secret-key-change-in-production

# 前端 API 地址
VITE_API_URL=http://localhost:3000/api
```

## 🐛 调试建议

### 查看后端日志
```bash
npm run server:dev
# 会显示所有请求和错误信息
```

### 测试 API
```bash
# 健康检查
curl http://localhost:3000/api/health

# 注册测试
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

### 查看数据库
```bash
# 使用 Docker
docker exec -it job_tracker_db psql -U postgres -d job_tracker

# 或访问 Adminer
# http://localhost:8081
```

## 🎉 改造完成！

现在您的系统拥有：
- ✅ 完整的用户认证系统
- ✅ 数据存储在服务器数据库
- ✅ 每个用户独立的数据空间
- ✅ 安全的密码加密
- ✅ 专业的前后端分离架构

如有任何问题，请查看 SETUP.md 或 QUICKSTART.md 文档！
