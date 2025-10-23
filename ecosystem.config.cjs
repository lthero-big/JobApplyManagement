// PM2 配置文件
// 使用 CommonJS 格式以确保兼容性

require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'job-tracker',
      script: './server/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3000',
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: process.env.DB_PORT || '5432',
        DB_NAME: process.env.DB_NAME || 'job_tracker',
        DB_USER: process.env.DB_USER || 'postgres',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        JWT_SECRET: process.env.JWT_SECRET || '',
        FRONTEND_URL: process.env.FRONTEND_URL || '',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
