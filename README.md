# 部署说明

## Node.js 部署

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器

### 部署步骤

1. 克隆项目代码到服务器：

   ```bash
   git clone <项目地址>
   cd <项目目录>
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 构建生产版本：

   ```bash
   npm run build
   ```

4. 启动生产服务器：

   ```bash
   npm run preview
   ```

   默认情况下，应用将在 `http://localhost:8080` 上运行。

### 环境变量配置

在生产环境中，可以通过设置以下环境变量来配置应用：

- `NODE_ENV`: 设置为 `production`
- `PORT`: 应用监听的端口（默认 8080）

### 使用 PM2 进行进程管理（推荐）

1. 安装 PM2：

   ```bash
   npm install -g pm2
   ```

2. 启动应用：

   ```bash
   pm2 start npm --name "job-tracker" -- run preview
   ```

3. 设置开机自启：

   ```bash
   pm2 startup
   pm2 save
   ```

## Docker 部署

### 环境要求

- Docker
- Docker Compose

### 部署步骤

1. 克隆项目代码到本地：

   ```bash
   git clone <项目地址>
   cd <项目目录>
   ```

2. 构建并启动 Docker 容器：

   ```bash
   docker compose up -d
   ```

3. 等待服务启动完成，访问应用：

   - 前端应用: http://localhost:8080
   - 数据库管理: http://localhost:5432 (PostgreSQL)

### 数据库初始化

数据库表会在首次启动时自动创建。如果需要手动初始化数据库，可以运行：

```bash
docker compose exec db psql -U postgres -d job_applications_db -f /docker-entrypoint-initdb.d/init-db.sh
```

### 停止服务

```bash
docker compose down
```

### 查看日志

```bash
# 查看应用日志
docker-compose logs app

# 查看数据库日志
docker-compose logs db
```

## 环境变量配置

可以在 `docker-compose.yml` 文件中修改以下环境变量：

- `POSTGRES_DB`: 数据库名称
- `POSTGRES_USER`: 数据库用户名
- `POSTGRES_PASSWORD`: 数据库密码

## 数据持久化

数据库数据存储在 Docker 卷中，即使容器被删除，数据也会保留。可以通过以下命令查看卷：

```bash
docker volume ls
```

## 故障排除

1. 如果端口冲突，请修改 `docker-compose.yml` 中的端口映射
2. 如果数据库连接失败，请检查环境变量配置
3. 如果应用无法启动，请查看日志以获取详细错误信息
