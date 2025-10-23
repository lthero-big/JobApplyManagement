#!/bin/bash

# 求职管理系统一键部署脚本 v2.0
# 用法: bash deploy.sh [dev|prod]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目路径（可自动检测）
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 打印函数
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 显示帮助
show_help() {
    cat << EOF

🚀 求职管理系统一键部署脚本

用法:
  bash deploy.sh [模式]

模式:
  dev   - 开发模式（使用 Vite 开发服务器，支持热更新）
  prod  - 生产模式（构建静态文件并部署）

示例:
  bash deploy.sh dev   # 开发模式部署
  bash deploy.sh prod  # 生产模式部署

EOF
}

# 检查系统依赖
check_dependencies() {
    print_header "检查系统依赖"
    
    local missing_deps=()
    
    ! command -v node &> /dev/null && missing_deps+=("node")
    ! command -v npm &> /dev/null && missing_deps+=("npm")
    ! command -v pm2 &> /dev/null && missing_deps+=("pm2")
    ! command -v nginx &> /dev/null && missing_deps+=("nginx")
    ! command -v psql &> /dev/null && missing_deps+=("postgresql-client")
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "缺少依赖: ${missing_deps[*]}"
        echo ""
        echo "安装命令:"
        echo "  sudo apt update"
        echo "  sudo apt install -y nodejs npm postgresql-client nginx"
        echo "  sudo npm install -g pm2"
        exit 1
    fi
    
    print_success "所有依赖已安装"
}

# 检查并配置环境变量
configure_environment() {
    print_header "配置环境变量"
    
    if [ -f ".env" ]; then
        print_warning "检测到现有 .env 文件:"
        echo ""
        cat .env
        echo ""
        read -p "是否保留现有配置？[Y/n] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            setup_env_interactive
        else
            print_success "保留现有配置"
        fi
    else
        print_info "未找到 .env 文件，开始配置..."
        setup_env_interactive
    fi
}

# 交互式配置环境变量
setup_env_interactive() {
    echo ""
    print_info "请输入配置信息 (按回车使用默认值):"
    echo ""
    
    read -p "数据库主机 [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "数据库端口 [5432]: " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    read -p "数据库名称 [job_tracker]: " DB_NAME
    DB_NAME=${DB_NAME:-job_tracker}
    
    read -p "数据库用户 [postgres]: " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -sp "数据库密码: " DB_PASSWORD
    echo
    
    read -p "前端域名 (如 https://yourdomain.com): " FRONTEND_URL
    
    # 生成随机 JWT 密钥
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-me-$(date +%s)")
    
    # 创建 .env 文件
    cat > .env << EOF
# 后端配置
PORT=3000
NODE_ENV=production
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET

# 前端配置
FRONTEND_URL=$FRONTEND_URL
VITE_API_URL=${FRONTEND_URL}/api
EOF
    
    print_success "环境变量配置完成"
}

# 测试数据库连接
test_database() {
    print_header "测试数据库连接"
    
    # 从 .env 读取配置
    source .env
    
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "数据库连接正常"
    else
        print_warning "数据库连接失败 (主机=$DB_HOST 用户=$DB_USER 数据库=$DB_NAME)"
        read -p "是否继续部署？[y/N] " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
    fi
}

# 安装 Node 依赖
install_dependencies() {
    print_header "安装项目依赖"
    npm install
    print_success "依赖安装完成"
}

# 启动后端服务
start_backend() {
    print_header "启动后端服务"
    
    # 确保日志目录存在
    mkdir -p logs
    
    # 删除旧进程
    pm2 delete job-tracker 2>/dev/null || true
    
    # 使用 ecosystem 配置文件启动（自动加载 .env）
    pm2 start ecosystem.config.cjs
    
    sleep 3
    
    if pm2 list | grep -q "job-tracker.*online"; then
        print_success "后端服务启动成功"
        
        # 显示启动日志
        print_info "检查服务状态..."
        sleep 2
        pm2 logs job-tracker --lines 10 --nostream
    else
        print_error "后端服务启动失败"
        pm2 logs job-tracker --lines 30
        exit 1
    fi
}

# 配置 Nginx
configure_nginx() {
    local mode=$1
    
    print_header "配置 Nginx"
    
    # 从 .env 读取域名
    source .env
    DOMAIN=$(echo "$FRONTEND_URL" | sed 's|https://||' | sed 's|http://||' | sed 's|/||g')
    
    print_info "域名: $DOMAIN"
    
    # 检查 SSL 证书
    if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        print_warning "未找到 SSL 证书，请先申请证书"
        read -p "是否继续配置 (手动配置SSL)？[y/N] " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && return
    fi
    
    # 生成 Nginx 配置
    if [ "$mode" == "dev" ]; then
        generate_nginx_config_dev "$DOMAIN"
    else
        generate_nginx_config_prod "$DOMAIN"
    fi
    
    sudo ln -sf /etc/nginx/sites-available/job-tracker /etc/nginx/sites-enabled/
    
    if sudo nginx -t; then
        sudo systemctl reload nginx
        print_success "Nginx 配置完成"
    else
        print_error "Nginx 配置错误"
        exit 1
    fi
}

# 生成 Nginx 配置 - 开发模式
generate_nginx_config_dev() {
    local domain=$1
    sudo tee /etc/nginx/sites-available/job-tracker > /dev/null << NGINXEOF
server {
    listen 80;
    server_name $domain;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $domain;

    ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    access_log /var/log/nginx/job-access.log;
    error_log /var/log/nginx/job-error.log;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF
}

# 生成 Nginx 配置 - 生产模式
generate_nginx_config_prod() {
    local domain=$1
    sudo tee /etc/nginx/sites-available/job-tracker > /dev/null << NGINXEOF
server {
    listen 80;
    server_name $domain;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $domain;

    ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    access_log /var/log/nginx/job-access.log;
    error_log /var/log/nginx/job-error.log;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        root /var/www/job-tracker;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        root /var/www/job-tracker;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
NGINXEOF
}

# 开发模式部署
deploy_dev() {
    print_header "🔧 开发模式部署"
    
    configure_environment
    test_database
    install_dependencies
    start_backend
    
    # 启动前端开发服务器
    print_header "启动前端开发服务器"
    pm2 delete vite 2>/dev/null || true
    pm2 start npm --name vite -- run dev -- --host 0.0.0.0 --port 8081
    sleep 5
    
    if pm2 list | grep -q "vite.*online"; then
        print_success "前端开发服务器启动成功"
    else
        print_error "前端启动失败"
        pm2 logs vite --lines 20
        exit 1
    fi
    
    configure_nginx "dev"
    
    # 显示结果
    source .env
    DOMAIN=$(echo "$FRONTEND_URL" | sed 's|https://||' | sed 's|http://||' | sed 's|/||g')
    
    print_header "🎉 开发模式部署完成"
    echo ""
    echo "🌐 访问地址: https://$DOMAIN"
    echo "📡 API地址: https://$DOMAIN/api"
    echo ""
    echo "📋 管理命令:"
    echo "  pm2 logs job-tracker  # 查看后端日志"
    echo "  pm2 logs vite         # 查看前端日志"
    echo "  pm2 restart all       # 重启所有服务"
    echo ""
}

# 生产模式部署
deploy_prod() {
    print_header "🚀 生产模式部署"
    
    configure_environment
    test_database
    install_dependencies
    
    # 构建前端
    print_header "构建前端"
    rm -rf dist
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "构建失败"
        exit 1
    fi
    
    print_success "前端构建成功"
    
    # 部署静态文件
    print_header "部署静态文件"
    sudo mkdir -p /var/www/job-tracker
    sudo rm -rf /var/www/job-tracker/*
    sudo cp -r dist/* /var/www/job-tracker/
    sudo chown -R www-data:www-data /var/www/job-tracker
    sudo chmod -R 755 /var/www/job-tracker
    print_success "静态文件部署完成"
    
    start_backend
    pm2 delete vite 2>/dev/null || true  # 停止开发服务器
    configure_nginx "prod"
    
    # 显示结果
    source .env
    DOMAIN=$(echo "$FRONTEND_URL" | sed 's|https://||' | sed 's|http://||' | sed 's|/||g')
    
    print_header "🎉 生产模式部署完成"
    echo ""
    echo "🌐 访问地址: https://$DOMAIN"
    echo "📡 API地址: https://$DOMAIN/api"
    echo ""
    echo "📋 管理命令:"
    echo "  pm2 logs job-tracker  # 查看后端日志"
    echo "  pm2 restart job-tracker  # 重启后端"
    echo ""
    echo "💡 提示: 修改代码后需重新运行 bash deploy.sh prod"
    echo ""
}

# 配置防火墙
configure_firewall() {
    print_header "配置防火墙"
    
    if ! command -v ufw &> /dev/null; then
        print_warning "未安装 UFW 防火墙"
        return
    fi
    
    print_info "配置防火墙规则..."
    sudo ufw allow 22/tcp   # SSH
    sudo ufw allow 80/tcp   # HTTP
    sudo ufw allow 443/tcp  # HTTPS
    
    # 检查并关闭 3000 端口
    if sudo ufw status | grep -q "3000"; then
        print_warning "检测到 3000 端口已开放"
        sudo ufw delete allow 3000/tcp 2>/dev/null || true
        print_success "已关闭 3000 端口"
    fi
    
    echo "y" | sudo ufw enable
    print_success "防火墙配置完成"
}

# 主函数
main() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   求职管理系统 - 一键部署脚本 v2.0     ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    
    # 检查参数
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    MODE=$1
    
    if [ "$MODE" != "dev" ] && [ "$MODE" != "prod" ]; then
        print_error "无效的部署模式: $MODE"
        show_help
        exit 1
    fi
    
    # 确认部署
    echo "部署模式: $([ "$MODE" == "dev" ] && echo "开发模式" || echo "生产模式")"
    echo "项目路径: $PROJECT_DIR"
    echo ""
    read -p "确认部署？[y/N] " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0
    echo ""
    
    cd "$PROJECT_DIR"
    
    check_dependencies
    
    if [ "$MODE" == "dev" ]; then
        deploy_dev
    else
        deploy_prod
    fi
    
    configure_firewall
    
    pm2 save
    print_success "所有部署步骤已完成！"
}

# 执行主函数
main "$@"
