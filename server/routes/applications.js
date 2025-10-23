import express from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要认证
router.use(authMiddleware);

// 获取当前用户的所有求职申请
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取求职申请
    const applicationsResult = await pool.query(
      `SELECT 
        id, company, base, jd, resume_version, application_link, 
        status, application_date, update_date, notes
      FROM job_applications 
      WHERE user_id = $1 
      ORDER BY application_date DESC`,
      [userId]
    );

    const applications = applicationsResult.rows;

    // 为每个申请获取状态历史
    for (let app of applications) {
      const historyResult = await pool.query(
        'SELECT status, date, color FROM status_history WHERE application_id = $1 ORDER BY date ASC',
        [app.id]
      );
      app.statusHistory = historyResult.rows;
    }

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('获取求职申请列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取数据失败' 
    });
  }
});

// 获取单个求职申请详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        id, company, base, jd, resume_version, application_link, 
        status, application_date, update_date, notes
      FROM job_applications 
      WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到该记录' 
      });
    }

    const application = result.rows[0];

    // 获取状态历史
    const historyResult = await pool.query(
      'SELECT status, date, color FROM status_history WHERE application_id = $1 ORDER BY date ASC',
      [id]
    );
    application.statusHistory = historyResult.rows;

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('获取求职申请详情错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取数据失败' 
    });
  }
});

// 创建新的求职申请
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const {
      company,
      base,
      jd,
      resumeVersion,
      applicationLink,
      applicationDate,
      status = '简历投递',
      notes
    } = req.body;

    // 验证必填字段
    if (!company || !applicationDate) {
      return res.status(400).json({ 
        success: false, 
        message: '公司名称和投递日期是必填项' 
      });
    }

    await client.query('BEGIN');

    // 插入求职申请
    const result = await client.query(
      `INSERT INTO job_applications 
        (user_id, company, base, jd, resume_version, application_link, status, application_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, company, base, jd, resume_version, application_link, status, application_date, update_date, notes`,
      [userId, company, base, jd, resumeVersion, applicationLink, status, applicationDate, notes]
    );

    const application = result.rows[0];

    // 插入初始状态历史
    await client.query(
      'INSERT INTO status_history (application_id, status, date, color) VALUES ($1, $2, $3, $4)',
      [application.id, '简历投递', applicationDate, 'green']
    );

    // 获取状态历史
    const historyResult = await client.query(
      'SELECT status, date, color FROM status_history WHERE application_id = $1 ORDER BY date ASC',
      [application.id]
    );
    application.statusHistory = historyResult.rows;

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: '创建成功',
      data: application
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('创建求职申请错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '创建失败' 
    });
  } finally {
    client.release();
  }
});

// 更新求职申请
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      company,
      base,
      jd,
      resumeVersion,
      applicationLink,
      applicationDate,
      status,
      notes
    } = req.body;

    // 验证权限
    const checkResult = await client.query(
      'SELECT id, status FROM job_applications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到该记录' 
      });
    }

    const oldStatus = checkResult.rows[0].status;

    await client.query('BEGIN');

    // 更新求职申请
    const result = await client.query(
      `UPDATE job_applications 
      SET company = COALESCE($1, company),
          base = COALESCE($2, base),
          jd = COALESCE($3, jd),
          resume_version = COALESCE($4, resume_version),
          application_link = COALESCE($5, application_link),
          application_date = COALESCE($6, application_date),
          status = COALESCE($7, status),
          notes = COALESCE($8, notes),
          update_date = CURRENT_TIMESTAMP
      WHERE id = $9 AND user_id = $10
      RETURNING id, company, base, jd, resume_version, application_link, status, application_date, update_date, notes`,
      [company, base, jd, resumeVersion, applicationLink, applicationDate, status, notes, id, userId]
    );

    const application = result.rows[0];

    // 如果状态有变化，添加到状态历史
    if (status && status !== oldStatus) {
      // 检查是否已存在该状态
      const existingStatus = await client.query(
        'SELECT id FROM status_history WHERE application_id = $1 AND status = $2',
        [id, status]
      );

      if (existingStatus.rows.length > 0) {
        // 更新现有状态的时间
        await client.query(
          'UPDATE status_history SET date = CURRENT_TIMESTAMP WHERE application_id = $1 AND status = $2',
          [id, status]
        );
      } else {
        // 添加新状态
        const color = status === '已拒绝' ? 'red' : 'green';
        await client.query(
          'INSERT INTO status_history (application_id, status, date, color) VALUES ($1, $2, CURRENT_TIMESTAMP, $3)',
          [id, status, color]
        );
      }
    }

    // 获取状态历史
    const historyResult = await client.query(
      'SELECT status, date, color FROM status_history WHERE application_id = $1 ORDER BY date ASC',
      [id]
    );
    application.statusHistory = historyResult.rows;

    await client.query('COMMIT');

    res.json({
      success: true,
      message: '更新成功',
      data: application
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('更新求职申请错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新失败' 
    });
  } finally {
    client.release();
  }
});

// 删除求职申请
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM job_applications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到该记录' 
      });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除求职申请错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '删除失败' 
    });
  }
});

export default router;
