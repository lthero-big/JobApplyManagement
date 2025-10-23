#!/bin/bash

# PostgreSQL 安装和配置脚本
# 用于在没有 PostgreSQL 的服务器上快速安装配置

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   PostgreSQL 快速安装配置脚本          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 检查是否已安装
if command -v psql &> /dev/null; then
    print_info "PostgreSQL 已安装"
    psql --version
    
    # 检查服务状态
    PG_SERVICE=$(systemctl list-units --type=service | grep -oP 'postgresql[^.]*' | head -1)
    if [ -n "$PG_SERVICE" ]; then
        print_info "服务名称: $PG_SERVICE"
        
        if systemctl is-active --quiet "$PG_SERVICE"; then
            print_success "服务正在运行"
        else
            print_warning "服务未运行，正在启动..."
            sudo systemctl start "$PG_SERVICE"
            sudo systemctl enable "$PG_SERVICE"
            print_success "服务已启动"
        fi
    fi
    
    read -p "PostgreSQL 已安装，是否重新配置？[y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "跳过安装"
        exit 0
    fi
else
    print_info "PostgreSQL 未安装，开始安装..."
    echo ""
    
    # 更新包列表
    print_info "更新包列表..."
    sudo apt update
    
    # 安装 PostgreSQL
    print_info "安装 PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    
    print_success "PostgreSQL 安装完成"
    psql --version
fi

echo ""
print_info "配置 PostgreSQL..."

# 确保服务运行
PG_SERVICE=$(systemctl list-units --type=service | grep -oP 'postgresql[^.]*' | head -1)
if [ -z "$PG_SERVICE" ]; then
    print_error "无法找到 PostgreSQL 服务"
    exit 1
fi

print_info "启动服务: $PG_SERVICE"
sudo systemctl start "$PG_SERVICE"
sudo systemctl enable "$PG_SERVICE"
sleep 2

if systemctl is-active --quiet "$PG_SERVICE"; then
    print_success "PostgreSQL 服务运行正常"
else
    print_error "PostgreSQL 服务启动失败"
    sudo systemctl status "$PG_SERVICE"
    exit 1
fi

echo ""
print_info "创建数据库和用户..."

# 从 .env 读取配置（如果存在）
if [ -f ".env" ]; then
    source .env
    print_info "从 .env 读取配置"
else
    print_info "请输入数据库配置:"
    read -p "数据库名称 [job_tracker]: " DB_NAME
    DB_NAME=${DB_NAME:-job_tracker}
    
    read -p "数据库用户 [lthero]: " DB_USER
    DB_USER=${DB_USER:-lthero}
    
    read -sp "数据库密码: " DB_PASSWORD
    echo
fi

echo ""
print_info "配置信息:"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo "  密码: ${DB_PASSWORD:0:3}***"
echo ""

# 创建数据库和用户
print_info "执行数据库配置..."
sudo -u postgres psql << EOF
-- 创建数据库
CREATE DATABASE $DB_NAME;

-- 创建用户
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- 连接到数据库
\c $DB_NAME

-- 授予 schema 权限
GRANT ALL ON SCHEMA public TO $DB_USER;

-- 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

-- 显示结果
\l $DB_NAME
\du $DB_USER
EOF

if [ $? -eq 0 ]; then
    print_success "数据库配置完成"
else
    print_error "配置失败"
    exit 1
fi

echo ""
print_info "测试连接..."
if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
    print_success "✅ 连接测试成功"
    echo ""
    PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();"
else
    print_error "连接测试失败"
    echo ""
    print_info "可能需要配置 pg_hba.conf"
    echo "1. 编辑配置文件:"
    echo "   sudo vim /etc/postgresql/*/main/pg_hba.conf"
    echo ""
    echo "2. 确保包含以下行:"
    echo "   local   all             all                                     md5"
    echo "   host    all             all             127.0.0.1/32            md5"
    echo ""
    echo "3. 重启 PostgreSQL:"
    echo "   sudo systemctl restart $PG_SERVICE"
fi

echo ""
print_success "🎉 PostgreSQL 安装配置完成！"
echo ""
echo "📋 服务管理命令:"
echo "  sudo systemctl status $PG_SERVICE   # 查看状态"
echo "  sudo systemctl restart $PG_SERVICE  # 重启服务"
echo "  sudo systemctl stop $PG_SERVICE     # 停止服务"
echo ""
echo "🔍 连接测试:"
echo "  PGPASSWORD='$DB_PASSWORD' psql -h localhost -U $DB_USER -d $DB_NAME"
echo ""
