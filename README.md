


# 创建数据库
sudo -u postgres psql -c "CREATE DATABASE job_tracker;"

# 创建/重置用户并设置密码（如果已存在，可改为 ALTER USER ...）
sudo -u postgres psql -c "CREATE USER lthero WITH PASSWORD 'YOUR_PASSWORD';"

# 授权
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE job_tracker TO lthero;"


# 在项目根目录运行（如果 server/db/init.sql 在该位置）
psql -h localhost -U lthero -d job_tracker -f server/db/init.sql
# 如果提示密码，输入上面设置的 YOUR_PASSWORD


# 测试连接并列出表
psql -h localhost -U lthero -d job_tracker -c "\dt"
# 测试简单查询
psql -h localhost -U lthero -d job_tracker -c "SELECT NOW();"


# 如果用 npm
npm run dev   # 或你的后端启动脚本

# 如果用 pm2
pm2 restart all
pm2 logs