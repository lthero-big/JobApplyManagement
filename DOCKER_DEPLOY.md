# Docker 部署指南

## 🚀 快速开始

### 1. 准备环境变量

```bash
# 复制示例配置文件
cp .env.docker .env

# 编辑 .env 文件，修改以下重要配置：
# - DB_PASSWORD: 设置强密码
# - JWT_SECRET: 设置复杂的随机字符串（至少32位）
nano .env
```

### 2. 启动所有服务

```bash
# 构建并启动所有服务（数据库 + 应用 + Adminer）
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

### 3. 访问应用

- **前端应用**: http://localhost:3000
- **API 接口**: http://localhost:3000/api
- **数据库管理**: http://localhost:8081
  - 系统: PostgreSQL
  - 服务器: db
  - 用户名: lthero（或你在 .env 中设置的）
  - 密码: 你在 .env 中设置的密码
  - 数据库: job_tracker

## 📦 常用命令

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 停止并删除数据（危险操作！）
docker compose down -v

# 重新构建镜像
docker compose build --no-cache

# 重启服务
docker compose restart

# 查看日志
docker compose logs -f app
docker compose logs -f db

# 进入容器
docker compose exec app sh
docker compose exec db psql -U lthero -d job_tracker

# 备份数据库
docker compose exec db pg_dump -U lthero job_tracker > backup.sql

# 恢复数据库
cat backup.sql | docker compose exec -T db psql -U lthero job_tracker
```

## 💾 数据持久化

### 数据存储位置

所有数据库文件存储在宿主机的 `./docker-data/postgresql` 目录中：

```
./docker-data/
└── postgresql/          # PostgreSQL 数据文件
    ├── base/
    ├── global/
    ├── pg_wal/
    └── ...
```

### 数据备份

**方式一：直接复制数据目录**
```bash
# 停止服务
docker compose down

# 备份数据目录
tar -czf backup-$(date +%Y%m%d).tar.gz docker-data/

# 恢复数据
tar -xzf backup-20250123.tar.gz

# 重启服务
docker compose up -d
```

**方式二：使用 pg_dump**
```bash
# 备份单个数据库
docker compose exec db pg_dump -U lthero job_tracker > backup.sql

# 备份所有数据库
docker compose exec db pg_dumpall -U lthero > backup-all.sql

# 恢复数据库
cat backup.sql | docker compose exec -T db psql -U lthero job_tracker
```

## 🔧 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 应用端口 | 3000 |
| DB_NAME | 数据库名称 | job_tracker |
| DB_USER | 数据库用户 | lthero |
| DB_PASSWORD | 数据库密码 | Www_159159 |
| JWT_SECRET | JWT 密钥 | 需要修改！ |

### 端口映射

| 服务 | 容器端口 | 宿主机端口 | 说明 |
|------|----------|------------|------|
| app | 3000 | 3000 | 应用服务 |
| db | 5432 | 5432 | PostgreSQL |
| adminer | 8080 | 8081 | 数据库管理 |

## 🔒 安全建议

### 生产环境必做

1. **修改数据库密码**
```bash
# 在 .env 中设置强密码
DB_PASSWORD=your-very-strong-password-here
```

2. **修改 JWT 密钥**
```bash
# 生成随机密钥
openssl rand -base64 32

# 在 .env 中设置
JWT_SECRET=生成的随机字符串
```

3. **限制端口访问**
```yaml
# 在 docker-compose.yml 中，如果不需要外部访问数据库：
services:
  db:
    ports:
      - "127.0.0.1:5432:5432"  # 只允许本地访问
```

4. **禁用 Adminer**（生产环境）
```bash
# 不启动 adminer
docker compose up -d app db
```

## 🐛 故障排除

### 1. 容器无法启动

```bash
# 查看日志
docker compose logs app
docker compose logs db

# 检查端口占用
lsof -i :3000
lsof -i :5432

# 重新构建
docker compose build --no-cache
docker compose up -d
```

### 2. 数据库连接失败

```bash
# 检查数据库是否健康
docker compose ps

# 测试数据库连接
docker compose exec db psql -U lthero -d job_tracker -c "SELECT NOW();"

# 查看数据库日志
docker compose logs db
```

### 3. 权限问题

```bash
# 检查数据目录权限
ls -la docker-data/

# 修复权限（如果需要）
sudo chown -R 999:999 docker-data/postgresql
```

### 4. 数据丢失

```bash
# 检查挂载点
docker compose exec db ls -la /var/lib/postgresql/data

# 确保 docker-compose.yml 中的卷配置正确
# volumes:
#   - ./docker-data/postgresql:/var/lib/postgresql/data
```

## 📊 监控和日志

### 查看资源使用

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df
```

### 日志管理

```bash
# 实时查看所有日志
docker compose logs -f

# 查看最近 100 行日志
docker compose logs --tail=100

# 只查看应用日志
docker compose logs -f app

# 查看错误日志
docker compose logs app | grep -i error
```

## 🚀 更新应用

```bash
# 1. 停止服务
docker compose down

# 2. 拉取最新代码
git pull

# 3. 重新构建镜像
docker compose build --no-cache

# 4. 启动服务
docker compose up -d

# 5. 查看日志确认启动成功
docker compose logs -f
```

## 🌐 部署到服务器

### 1. 准备服务器

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 上传代码

```bash
# 在本地打包
tar -czf job-tracker.tar.gz --exclude=node_modules --exclude=.git .

# 上传到服务器
scp job-tracker.tar.gz user@server:/path/to/app/

# 在服务器上解压
ssh user@server
cd /path/to/app/
tar -xzf job-tracker.tar.gz
```

### 3. 配置防火墙

```bash
# 开放必要端口
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 4. 启动服务

```bash
# 配置环境变量
cp .env.docker .env
nano .env

# 启动
docker compose up -d

# 设置自动重启
docker update --restart unless-stopped $(docker ps -q)
```

## 📝 注意事项

1. **数据备份**: 定期备份 `docker-data` 目录
2. **密码安全**: 生产环境必须修改默认密码
3. **日志管理**: 定期清理 Docker 日志避免占用磁盘
4. **更新策略**: 更新前务必备份数据
5. **资源限制**: 生产环境建议设置容器资源限制

## 🆘 获取帮助

如遇问题，请检查：
1. Docker 日志: `docker compose logs`
2. 容器状态: `docker compose ps`
3. 网络连接: `docker network inspect job_tracker_network`
4. 数据卷: `docker volume ls`
