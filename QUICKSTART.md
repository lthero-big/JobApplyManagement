# 🚀 快速启动指南

## 第一步：启动数据库

```bash
# 使用 Docker 启动 PostgreSQL 数据库
npm run docker:db:up

# 等待约 10 秒让数据库完全启动
# 数据库会自动执行 init.sql 初始化表结构
```

**验证数据库是否启动成功：**
```bash
# 查看 Docker 容器状态
docker ps | grep job_tracker_db

# 应该看到容器在运行
```

**可选：使用 Adminer 管理数据库**
- 访问：http://localhost:8081
- 系统：PostgreSQL
- 服务器：db
- 用户名：postgres
- 密码：postgres
- 数据库：job_tracker

## 第二步：启动应用

### 方式 A：同时启动前后端（推荐）

```bash
npm run dev:all
```

这会同时启动：
- 前端开发服务器（Vite）: http://localhost:5173
- 后端 API 服务器（Express）: http://localhost:3000

### 方式 B：分别启动

```bash
# 终端 1 - 启动前端
npm run dev

# 终端 2 - 启动后端
npm run server:dev
```

## 第三步：访问应用

1. 打开浏览器访问：http://localhost:5173
2. 点击"注册"创建新账户
3. 登录后即可使用求职管理系统

## 🛑 停止服务

```bash
# 停止前后端（Ctrl + C）

# 停止数据库
npm run docker:db:down
```

## 📝 测试账户

初次使用需要先注册账户，系统会自动创建用户和相关数据表。

## ⚠️ 常见问题

### 1. 端口被占用

如果端口被占用，可以修改 `.env` 文件：
```env
PORT=3001           # 后端端口，默认 3000
DB_PORT=5433        # 数据库端口，默认 5432
```

前端端口在 `vite.config.js` 中修改：
```js
export default defineConfig({
  server: {
    port: 5174  // 修改为其他端口
  }
})
```

### 2. 数据库连接失败

检查 Docker 是否正在运行：
```bash
docker ps
```

查看数据库日志：
```bash
docker logs job_tracker_db
```

重启数据库：
```bash
npm run docker:db:down
npm run docker:db:up
```

### 3. 前端无法连接后端

确保：
- 后端服务器正在运行（http://localhost:3000）
- 检查 `.env` 文件中的配置
- 前端环境变量 `VITE_API_URL` 设置正确

### 4. JWT 认证失败

清除浏览器存储：
1. 打开浏览器开发者工具（F12）
2. Application/存储 -> Local Storage
3. 清除所有数据
4. 重新登录

## 🔧 开发技巧

### 热重载

- 前端修改会自动刷新
- 后端修改会自动重启（使用 nodemon）

### API 测试

后端健康检查：
```bash
curl http://localhost:3000/api/health
```

### 数据库查询

连接数据库：
```bash
# 使用 psql
docker exec -it job_tracker_db psql -U postgres -d job_tracker

# 查看所有表
\dt

# 查看用户
SELECT * FROM users;

# 退出
\q
```

## 📚 下一步

查看完整文档：
- `SETUP.md` - 详细设置指南
- `README.md` - 项目介绍

祝您使用愉快！🎉
