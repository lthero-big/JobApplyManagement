import { v4 as uuidv4 } from 'uuid';

// 模拟本地存储的键名
const STORAGE_KEY = 'job_applications';

// 初始化默认数据
const defaultApplications = [
  {
    id: uuidv4(),
    company: '字节跳动',
    base: '北京',
    jd: '负责前端开发工作，参与产品迭代',
    resumeVersion: 'v2.1 (2024-05-15)',
    applicationLink: 'https://jobs.bytedance.com/12345',
    status: '业务面试',
    applicationDate: '2024-05-20 09:30',
    updateDate: '2024-05-25 14:20',
    statusHistory: [
      { status: '简历投递', date: '2024-05-20 09:30', color: 'green' },
      { status: '简历筛选', date: '2024-05-21 11:15', color: 'green' },
      { status: '笔试', date: '2024-05-23 10:00', color: 'green' },
      { status: '业务面试', date: '2024-05-25 14:20', color: 'green' }
    ]
  },
  {
    id: uuidv4(),
    company: '阿里巴巴',
    base: '杭州',
    jd: '参与电商平台后端系统开发',
    resumeVersion: 'v1.5 (2024-04-10)',
    applicationLink: 'https://jobs.alibaba.com/67890',
    status: '已拒绝',
    applicationDate: '2024-05-10 14:45',
    updateDate: '2024-05-22 16:30',
    statusHistory: [
      { status: '简历投递', date: '2024-05-10 14:45', color: 'green' },
      { status: '简历筛选', date: '2024-05-12 09:20', color: 'green' },
      { status: '笔试', date: '2024-05-15 13:45', color: 'green' },
      { status: '业务面试', date: '2024-05-18 11:00', color: 'red' },
      { status: '已拒绝', date: '2024-05-22 16:30', color: 'red' }
    ]
  },
  {
    id: uuidv4(),
    company: '腾讯',
    base: '深圳',
    jd: '参与微信小程序开发项目',
    resumeVersion: 'v2.0 (2024-05-01)',
    applicationLink: 'https://careers.tencent.com/54321',
    status: 'Offer发放',
    applicationDate: '2024-05-15 10:15',
    updateDate: '2024-05-28 09:45',
    statusHistory: [
      { status: '简历投递', date: '2024-05-15 10:15', color: 'green' },
      { status: '简历筛选', date: '2024-05-16 15:30', color: 'green' },
      { status: '笔试', date: '2024-05-19 14:00', color: 'green' },
      { status: '业务面试', date: '2024-05-23 10:30', color: 'green' },
      { status: 'HR面试', date: '2024-05-26 16:00', color: 'green' },
      { status: 'Offer发放', date: '2024-05-28 09:45', color: 'green' }
    ]
  }
];

// 状态选项
export const statusOptions = [
  { value: '简历投递', label: '简历投递' },
  { value: '简历筛选', label: '简历筛选' },
  { value: '笔试', label: '笔试' },
  { value: '业务面试', label: '业务面试' },
  { value: 'HR面试', label: 'HR面试' },
  { value: 'Offer发放', label: 'Offer发放' },
  { value: '入职', label: '入职' },
  { value: '已拒绝', label: '已拒绝' }
];

// 获取所有求职申请
export const getApplications = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // 如果没有存储数据，使用默认数据并保存
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultApplications));
  return defaultApplications;
};

// 保存求职申请
export const saveApplications = (applications) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
};

// 添加新的求职申请
export const addApplication = (application) => {
  const applications = getApplications();
  const newApplication = {
    ...application,
    id: uuidv4(),
    statusHistory: [
      { status: '简历投递', date: application.applicationDate, color: 'green' }
    ]
  };
  applications.push(newApplication);
  saveApplications(applications);
  return newApplication;
};

// 更新求职申请
export const updateApplication = (id, updatedData) => {
  const applications = getApplications();
  const index = applications.findIndex(app => app.id === id);
  
  if (index !== -1) {
    // 更新主状态
    applications[index] = { ...applications[index], ...updatedData };
    
    // 更新状态历史
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // 如果状态历史中已存在该状态，则更新时间，否则添加新状态
    const existingStatusIndex = applications[index].statusHistory.findIndex(
      item => item.status === updatedData.status
    );
    
    if (existingStatusIndex !== -1) {
      // 更新现有状态的时间
      applications[index].statusHistory[existingStatusIndex].date = formattedDate;
    } else {
      // 添加新状态
      const newStatus = {
        status: updatedData.status,
        date: formattedDate,
        color: updatedData.status === '已拒绝' ? 'red' : 'green'
      };
      applications[index].statusHistory.push(newStatus);
    }
    
    // 如果状态是"入职"，则标记为已完成
    if (updatedData.status === '入职') {
      applications[index].completed = true;
    }
    
    saveApplications(applications);
    return applications[index];
  }
  return null;
};

// 删除求职申请
export const deleteApplication = (id) => {
  const applications = getApplications();
  const filtered = applications.filter(app => app.id !== id);
  saveApplications(filtered);
  return filtered;
};

// 根据筛选条件过滤求职申请
export const filterApplications = (applications, filters) => {
  return applications.filter(app => {
    // 公司名称筛选
    if (filters.company && !app.company.toLowerCase().includes(filters.company.toLowerCase())) {
      return false;
    }
    
    // Base地筛选
    if (filters.base && !app.base.includes(filters.base)) {
      return false;
    }
    
    // 状态筛选
    if (filters.status && app.status !== filters.status) {
      return false;
    }
    
    // 投递日期筛选
    if (filters.applicationDateStart || filters.applicationDateEnd) {
      const appDate = new Date(app.applicationDate);
      
      if (filters.applicationDateStart && appDate < new Date(filters.applicationDateStart)) {
        return false;
      }
      
      if (filters.applicationDateEnd && appDate > new Date(filters.applicationDateEnd)) {
        return false;
      }
    }
    
    // 更新日期筛选
    if (filters.updateDateStart || filters.updateDateEnd) {
      const updDate = new Date(app.updateDate);
      
      if (filters.updateDateStart && updDate < new Date(filters.updateDateStart)) {
        return false;
      }
      
      if (filters.updateDateEnd && updDate > new Date(filters.updateDateEnd)) {
        return false;
      }
    }
    
    return true;
  });
};
