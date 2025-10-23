-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建求职申请表
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(100) NOT NULL,
  base VARCHAR(50),
  jd TEXT,
  resume_version VARCHAR(50),
  application_link TEXT,
  status VARCHAR(50) NOT NULL DEFAULT '简历投递',
  application_date TIMESTAMP NOT NULL,
  update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建状态历史表
CREATE TABLE IF NOT EXISTS status_history (
  id SERIAL PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  date TIMESTAMP NOT NULL,
  color VARCHAR(20) DEFAULT 'green',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_history_application_id ON status_history(application_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 为求职申请表添加触发器
DROP TRIGGER IF EXISTS update_applications_updated_at ON job_applications;
CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON job_applications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 插入测试用户（密码: test123，已使用 bcrypt 加密）
-- 实际密码为 test123
INSERT INTO users (username, email, password_hash) 
VALUES ('testuser', 'test@example.com', '$2b$10$YourHashedPasswordHere')
ON CONFLICT (username) DO NOTHING;

COMMENT ON TABLE users IS '用户表';
COMMENT ON TABLE job_applications IS '求职申请表';
COMMENT ON TABLE status_history IS '状态历史记录表';
