import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import applicationsRoutes from './routes/applications.js';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationsRoutes);

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      success: true, 
      message: '服务运行正常',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: '数据库连接失败' 
    });
  }
});

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  console.log('📁 静态文件目录:', distPath);
  
  app.use(express.static(distPath));
  
  // 所有非 API 请求返回 index.html（支持前端路由）
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误' 
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 API 文档:`);
  console.log(`   - POST /api/auth/register - 用户注册`);
  console.log(`   - POST /api/auth/login - 用户登录`);
  console.log(`   - GET  /api/auth/me - 获取当前用户`);
  console.log(`   - GET  /api/applications - 获取求职申请列表`);
  console.log(`   - POST /api/applications - 创建求职申请`);
  console.log(`   - PUT  /api/applications/:id - 更新求职申请`);
  console.log(`   - DELETE /api/applications/:id - 删除求职申请`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  await pool.end();
  process.exit(0);
});
