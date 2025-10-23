# 部署脚本使用说明

## 🚨 重要更新 (v2.0)

**新版本部署脚本解决的问题:**

1. ✅ **不再硬编码配置** - 所有配置都通过交互式输入或保留现有 `.env` 文件
2. ✅ **支持多服务器部署** - 每个服务器可以有独立的数据库配置和域名
3. ✅ **智能检测环境** - 自动检测并保留现有配置
4. ✅ **更清晰的结构** - 代码重构,更易维护

## 📋 使用方法

### 首次部署

```bash
# 1. 克隆代码到服务器
git clone https://github.com/lthero-big/JobApplyManagement.git
cd JobApplyManagement

# 2. 运行部署脚本 (会自动引导配置)
bash deploy.sh prod
```

### 交互式配置示例

脚本会询问以下配置:

```
请输入配置信息 (按回车使用默认值):

数据库主机 [localhost]: localhost
数据库端口 [5432]: 5432
数据库名称 [job_tracker]: job_tracker
数据库用户 [postgres]: myuser
数据库密码: ******
前端域名 (如 https://yourdomain.com): https://job.example.com
```

### 已有配置的服务器

如果服务器上已经有 `.env` 文件,脚本会询问是否保留:

```
⚠️  检测到现有 .env 文件:
PORT=3000
DB_HOST=localhost
DB_NAME=job_tracker
...

是否保留现有配置？[Y/n]
```

- 输入 `Y` 或直接回车 - 保留现有配置
- 输入 `N` - 重新配置

## 🔧 部署模式

### 开发模式
```bash
bash deploy.sh dev
```

**特点:**
- 使用 Vite 开发服务器 (端口 8081)
- 支持热更新 (HMR)
- 修改代码自动刷新浏览器
- 适合开发和测试

### 生产模式
```bash
bash deploy.sh prod
```

**特点:**
- 构建优化的静态文件
- 部署到 `/var/www/job-tracker`
- Gzip 压缩和缓存优化
- 适合生产环境

## 📁 配置文件说明

### `.env` 文件

脚本会自动创建 `.env` 文件,包含以下配置:

```env
# 后端配置
PORT=3000
NODE_ENV=production
DB_HOST=localhost          # 数据库主机
DB_PORT=5432              # 数据库端口
DB_NAME=job_tracker       # 数据库名称
DB_USER=postgres          # 数据库用户
DB_PASSWORD=your_password # 数据库密码
JWT_SECRET=random_key     # JWT 密钥(自动生成)

# 前端配置
FRONTEND_URL=https://yourdomain.com  # 你的域名
VITE_API_URL=https://yourdomain.com/api
```

## 🌍 多服务器部署

### 服务器 A (job.lthero.cn)

```bash
cd /root/JobApplyManagement

# 如果已有 .env,保留即可
bash deploy.sh prod
# 选择: [Y] 保留现有配置
```

### 服务器 B (job2.example.com)

```bash
cd /var/www/JobApplyManagement

# 首次部署,交互式输入
bash deploy.sh prod

# 输入服务器 B 的配置:
数据库主机: localhost
数据库用户: server_b_user
数据库密码: server_b_password
前端域名: https://job2.example.com
```

### 服务器 C (job3.example.com)

```bash
cd /home/user/JobApplyManagement

# 手动创建 .env 文件
cat > .env << 'EOF'
PORT=3000
DB_HOST=192.168.1.100  # 远程数据库
DB_USER=server_c_user
DB_PASSWORD=server_c_password
DB_NAME=job_tracker_c
FRONTEND_URL=https://job3.example.com
VITE_API_URL=https://job3.example.com/api
JWT_SECRET=unique_secret_for_server_c
EOF

# 运行部署(会保留 .env)
bash deploy.sh prod
```

## 🔐 安全建议

1. **数据库密码**: 每个服务器使用不同的数据库密码
2. **JWT密钥**: 每个服务器自动生成唯一的 JWT 密钥
3. **防火墙**: 脚本会自动配置防火墙,只开放 22, 80, 443 端口
4. **后端端口**: 后端只监听 `127.0.0.1:3000`,不对外暴露

## 🛠️ 常用命令

### 查看服务状态
```bash
pm2 list
```

### 查看日志
```bash
pm2 logs job-tracker  # 后端日志
pm2 logs vite         # 前端日志(仅开发模式)
```

### 重启服务
```bash
pm2 restart job-tracker  # 重启后端
pm2 restart all          # 重启所有服务
```

### 更新代码后重新部署
```bash
git pull
bash deploy.sh prod  # 选择保留现有配置
```

## 🐛 故障排查

### 数据库连接失败

```bash
# 检查数据库配置
cat .env | grep DB_

# 手动测试连接
PGPASSWORD='your_password' psql -h localhost -U your_user -d job_tracker -c "SELECT 1;"
```

### Nginx 配置错误

```bash
# 测试 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/job-error.log
```

### 后端无法启动

```bash
# 查看详细日志
pm2 logs job-tracker --lines 100

# 直接运行后端(调试模式)
cd /path/to/project
node server/server.js
```

## 📝 版本历史

### v2.0 (2025-10-23)
- ✨ 交互式配置,不再硬编码
- ✨ 智能检测并保留现有配置
- ✨ 支持多服务器独立部署
- ✨ 自动生成唯一 JWT 密钥
- ✨ 简化代码结构,提高可维护性
- 🔒 自动配置防火墙安全规则

### v1.0
- 基础部署功能
- 硬编码配置(已废弃)

## 🤝 贡献

如有问题或建议,请提交 Issue 或 Pull Request。

## 📄 许可证

MIT License
