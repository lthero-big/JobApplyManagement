# 求职管理系统部署指南

## 📋 目录

- [项目概述](#项目概述)
- [部署过程中遇到的问题](#部署过程中遇到的问题)
- [解决方案](#解决方案)
- [生产环境部署步骤](#生产环境部署步骤)
- [维护命令](#维护命令)

---

## 项目概述

**项目名称：** 求职管理系统 V2  
**技术栈：**
- 前端：React 18 + Vite + TailwindCSS + shadcn/ui
- 后端：Node.js + Express + PostgreSQL
- 部署：Nginx + PM2 + Let's Encrypt SSL

**功能特性：**
- 用户注册/登录（JWT 认证）
- 求职申请管理（CRUD）
- 面试状态跟踪
- 笔记管理

---

## 部署过程中遇到的问题

### 问题 1: 数据库密码类型错误

**错误信息：**
```
SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

**原因：**  
`process.env.DB_PASSWORD` 未正确转换为字符串类型，导致 PostgreSQL 连接失败。

**解决方法：**  
在 `server/config/database.js` 中显式转换密码为字符串：
```javascript
const config = {
  password: String(process.env.DB_PASSWORD || ''),
  // ...其他配置
};
```

---

### 问题 2: Mixed Content 安全限制

**错误信息：**
```
Mixed Content: The page at 'https://job.lthero.cn' was loaded over HTTPS, 
but requested an insecure XMLHttpRequest endpoint 'http://114.66.63.134:3000/api/auth/login'. 
This request has been blocked.
```

**原因：**  
前端使用 HTTPS 域名访问，但 API 请求使用 HTTP 协议，浏览器阻止混合内容请求。

**解决方法：**  
配置 Nginx 反向代理，使前端和 API 都通过同一 HTTPS 域名访问：
- 前端：`https://job.lthero.cn/`
- API：`https://job.lthero.cn/api/`

---

### 问题 3: 前端构建产物路径错误

**错误信息：**
```
ls: cannot access 'dist/': No such file or directory
```

**原因：**  
Vite 构建输出到 `build/` 目录而非 `dist/` 目录，与 Nginx 配置不匹配。

**解决方法：**  
修改 `vite.config.js`，指定输出目录为 `dist`：
```javascript
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
```

---

### 问题 4: Nginx 文件权限错误

**错误信息：**
```
[crit] stat() "/root/JobApplyManagement/dist/" failed (13: Permission denied)
```

**原因：**  
Nginx 进程（通常以 `www-data` 用户运行）无权访问 `/root` 目录及其子目录。

**解决方法：**  
提供两种方案（见下方）

---

## 解决方案

### 方案 1: 修复权限（快速开发）

适用于快速测试或开发环境。

#### 步骤 1: 修复目录权限

```bash
# 给 /root 目录添加执行权限
chmod 755 /root
chmod 755 /root/JobApplyManagement

# 如果有 dist 目录
chmod -R 755 /root/JobApplyManagement/dist
```

#### 步骤 2: 启动前端开发服务器

```bash
cd /root/JobApplyManagement

# 使用 pm2 启动 Vite 开发服务器
pm2 start npm --name vite -- run dev -- --host 0.0.0.0 --port 8081

# 查看日志确认启动
pm2 logs vite --lines 20
```

#### 步骤 3: 配置 Nginx 代理

Nginx 配置文件：`/etc/nginx/sites-available/job-tracker`

```nginx
server {
    listen 80;
    server_name job.lthero.cn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name job.lthero.cn;

    ssl_certificate /etc/letsencrypt/live/job.lthero.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/job.lthero.cn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # 前端代理到开发服务器
    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 步骤 4: 重载 Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### 步骤 5: 测试访问

```bash
# 测试 API
curl https://job.lthero.cn/api/health

# 浏览器访问
# https://job.lthero.cn
```

**优点：**
- ✅ 快速启动，立即可用
- ✅ 支持热更新（HMR）
- ✅ 方便开发调试

**缺点：**
- ⚠️ 不适合生产环境
- ⚠️ 需要保持开发服务器运行

---

### 方案 2: 生产环境部署（推荐）

适用于正式生产环境，提供更好的性能和安全性。

#### 完整部署脚本

创建部署脚本：`/root/JobApplyManagement/deploy-production.sh`

```bash
#!/bin/bash
set -e

echo "🚀 生产环境部署..."
echo ""

cd /root/JobApplyManagement

# 1. 配置 Vite
cat > vite.config.js << 'VITEEOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5173,
  }
})
VITEEOF

# 2. 配置环境变量
cat > .env << 'ENVEOF'
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=job_tracker
DB_USER=lthero
DB_PASSWORD=Www_159159
JWT_SECRET=your-secret-key-change-in-production-use-random-string-at-least-32-characters-long
FRONTEND_URL=https://job.lthero.cn
VITE_API_URL=https://job.lthero.cn/api
ENVEOF

# 3. 构建前端
echo "🔨 构建前端..."
rm -rf dist build node_modules/.vite
npm run build

# 检查构建结果
if [ ! -d "dist" ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo "✅ 构建成功"
ls -lh dist/

# 4. 部署到 /var/www
echo "📦 部署静态文件..."
sudo mkdir -p /var/www/job-tracker
sudo rm -rf /var/www/job-tracker/*
sudo cp -r dist/* /var/www/job-tracker/
sudo chown -R www-data:www-data /var/www/job-tracker
sudo chmod -R 755 /var/www/job-tracker

# 5. 配置 Nginx
echo "⚙️  配置 Nginx..."
sudo tee /etc/nginx/sites-available/job-tracker > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name job.lthero.cn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name job.lthero.cn;

    ssl_certificate /etc/letsencrypt/live/job.lthero.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/job.lthero.cn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    access_log /var/log/nginx/job-access.log;
    error_log /var/log/nginx/job-error.log;

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # 前端静态文件
    location / {
        root /var/www/job-tracker;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/job-tracker;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/job-tracker /etc/nginx/sites-enabled/

# 6. 测试并重载 Nginx
sudo nginx -t
sudo systemctl reload nginx

# 7. 确保后端运行
pm2 restart job-tracker || pm2 start server/server.js --name job-tracker

# 8. 测试
sleep 2
echo ""
echo "🧪 测试访问..."
curl -s https://job.lthero.cn/api/health
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://job.lthero.cn/)
echo "首页状态码: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "✅✅✅ 部署成功！✅✅✅"
    echo ""
    echo "🌐 访问: https://job.lthero.cn"
    echo "📡 API: https://job.lthero.cn/api"
fi
```

#### 执行部署

```bash
chmod +x /root/JobApplyManagement/deploy-production.sh
bash /root/JobApplyManagement/deploy-production.sh
```

**优点：**
- ✅ 生产级性能（静态文件由 Nginx 直接提供）
- ✅ 更好的安全性（文件部署在 /var/www）
- ✅ 资源缓存优化
- ✅ Gzip 压缩

**缺点：**
- ⚠️ 每次代码更新需要重新构建部署

---

## 生产环境部署步骤

### 1. 环境准备

#### 安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js (18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Nginx
sudo apt install -y nginx

# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 安装 PM2
sudo npm install -g pm2

# 安装 Certbot (SSL 证书)
sudo apt install -y certbot python3-certbot-nginx
```

#### 配置数据库

```bash
# 创建数据库和用户
sudo -u postgres psql << EOF
CREATE DATABASE job_tracker;
CREATE USER lthero WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE job_tracker TO lthero;
\q
EOF

# 初始化表结构
psql -h localhost -U lthero -d job_tracker -f server/db/init.sql
```

### 2. 克隆项目

```bash
cd /root
git clone https://github.com/lthero-big/JobApplyManagement.git
cd JobApplyManagement
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
cat > .env << 'EOF'
# 后端配置
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=job_tracker
DB_USER=lthero
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your-jwt-secret-key-at-least-32-characters-long

# 前端配置
FRONTEND_URL=https://job.lthero.cn
VITE_API_URL=https://job.lthero.cn/api
EOF
```

### 4. 申请 SSL 证书

```bash
# 确保域名已解析到服务器 IP
sudo certbot --nginx -d job.lthero.cn

# 设置自动续期
sudo certbot renew --dry-run
```

### 5. 部署应用

```bash
# 使用生产部署脚本
bash /root/JobApplyManagement/deploy-production.sh
```

### 6. 配置开机自启

```bash
# PM2 开机自启
pm2 startup
pm2 save

# Nginx 开机自启
sudo systemctl enable nginx

# PostgreSQL 开机自启
sudo systemctl enable postgresql
```

---

## 维护命令

### 后端管理

```bash
# 查看后端状态
pm2 list

# 查看后端日志
pm2 logs job-tracker

# 重启后端
pm2 restart job-tracker

# 停止后端
pm2 stop job-tracker

# 查看后端详细信息
pm2 describe job-tracker
```

### 前端管理（开发模式）

```bash
# 启动开发服务器
pm2 start npm --name vite -- run dev -- --host 0.0.0.0 --port 8081

# 查看日志
pm2 logs vite

# 停止开发服务器
pm2 stop vite
pm2 delete vite
```

### Nginx 管理

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx

# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx

# 查看访问日志
sudo tail -f /var/log/nginx/job-access.log

# 查看错误日志
sudo tail -f /var/log/nginx/job-error.log
```

### 数据库管理

```bash
# 连接数据库
psql -h localhost -U lthero -d job_tracker

# 查看数据库状态
sudo systemctl status postgresql

# 重启数据库
sudo systemctl restart postgresql

# 备份数据库
pg_dump -h localhost -U lthero -d job_tracker > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
psql -h localhost -U lthero -d job_tracker < backup_20251023_150000.sql
```

### 更新部署

```bash
# 1. 拉取最新代码
cd /root/JobApplyManagement
git pull origin main

# 2. 安装新依赖（如果有）
npm install

# 3. 重新部署
bash deploy-production.sh
```

### 监控和调试

```bash
# 实时监控所有服务
pm2 monit

# 查看系统资源
htop

# 查看端口占用
netstat -tlnp | grep -E "3000|80|443"

# 测试 API
curl https://job.lthero.cn/api/health

# 测试后端（本地）
curl http://localhost:3000/api/health
```

---

## 故障排查

### 后端无法启动

```bash
# 1. 查看详细日志
pm2 logs job-tracker --lines 100

# 2. 测试直接运行
cd /root/JobApplyManagement
node server/server.js

# 3. 检查数据库连接
psql -h localhost -U lthero -d job_tracker -c "SELECT NOW();"

# 4. 检查端口占用
lsof -i :3000
```

### Nginx 502 Bad Gateway

```bash
# 1. 检查后端是否运行
pm2 list

# 2. 测试后端直接访问
curl http://localhost:3000/api/health

# 3. 查看 Nginx 错误日志
sudo tail -n 50 /var/log/nginx/error.log

# 4. 检查 Nginx 配置
sudo nginx -t
```

### 前端无法访问

```bash
# 1. 检查文件是否存在
ls -la /var/www/job-tracker/

# 2. 检查文件权限
ls -ld /var/www/job-tracker/

# 3. 查看 Nginx 错误日志
sudo tail -n 50 /var/log/nginx/error.log

# 4. 测试 Nginx 配置
sudo nginx -t
```

### SSL 证书问题

```bash
# 检查证书有效期
sudo certbot certificates

# 手动续期
sudo certbot renew

# 强制续期
sudo certbot renew --force-renewal
```

---

## 安全建议

### 1. 修改默认密码

```bash
# 修改数据库密码
sudo -u postgres psql -c "ALTER USER lthero WITH PASSWORD 'new_strong_password';"

# 更新 .env 文件中的密码
nano /root/JobApplyManagement/.env
```

### 2. 配置防火墙

```bash
# 启用 UFW
sudo ufw enable

# 允许必要端口
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# ⚠️ 重要：不要开放 3000 端口！
# 后端应该只监听 localhost，通过 Nginx 反向代理访问

# 查看状态
sudo ufw status
```

**安全说明：**
- ✅ **只开放 80 和 443 端口**供 Nginx 使用
- ✅ **后端 3000 端口只监听** `localhost/127.0.0.1`
- ✅ **所有 API 请求通过 Nginx 反向代理**
- ❌ **不要直接开放 3000 端口到公网**

**验证后端只监听本地：**
```bash
# 检查后端监听地址
netstat -tlnp | grep 3000
# 应该显示: tcp6  0  0 :::3000  或  127.0.0.1:3000

# 如果显示 0.0.0.0:3000，说明监听所有网卡，需要修改
```

**正确的架构：**
```
外网请求 → Nginx (443) → 反向代理 → 后端 (localhost:3000)
         ✓ SSL/TLS      ✓ 安全防护   ✓ 仅本地访问
```

### 3. 定期备份

创建备份脚本：`/root/JobApplyManagement/backup.sh`

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -h localhost -U lthero -d job_tracker > $BACKUP_DIR/db_$DATE.sql

# 备份代码
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /root/JobApplyManagement

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ 备份完成: $DATE"
```

设置定时备份：

```bash
# 添加到 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /root/JobApplyManagement/backup.sh >> /var/log/backup.log 2>&1
```

### 4. 限制 SSH 访问

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 禁止 root 直接登录（可选）
PermitRootLogin no

# 使用密钥认证
PasswordAuthentication no

# 重启 SSH 服务
sudo systemctl restart sshd
```

---

## 性能优化

### 1. 启用 HTTP/2

已在 Nginx 配置中启用：
```nginx
listen 443 ssl http2;
```

### 2. 配置浏览器缓存

已在 Nginx 配置中设置：
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 启用 Gzip 压缩

已在 Nginx 配置中启用：
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 4. 数据库连接池优化

在 `server/config/database.js` 中已配置：
```javascript
const pool = new Pool({
  max: 20,  // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
```

---

## 访问地址

- **生产环境：** https://job.lthero.cn
- **API 文档：** https://job.lthero.cn/api/health
- **数据库管理：** 使用 psql 或 Adminer

---

## 技术支持

如遇到问题，请检查：
1. 后端日志：`pm2 logs job-tracker`
2. Nginx 日志：`sudo tail -f /var/log/nginx/error.log`
3. 数据库日志：`sudo tail -f /var/log/postgresql/postgresql-*.log`

---

**最后更新时间：** 2025年10月23日
