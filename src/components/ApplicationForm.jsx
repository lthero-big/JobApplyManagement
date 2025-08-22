import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { statusOptions } from '@/lib/jobApplicationStore';

const ApplicationForm = ({ open, onOpenChange, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    company: '',
    base: '',
    jd: '',
    resumeVersion: '',
    applicationLink: '',
    status: '简历投递',
    applicationDate: '',
    updateDate: ''
  });

  // 初始化表单数据
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // 设置默认日期为当前时间
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setFormData({
        company: '',
        base: '',
        jd: '',
        resumeVersion: '',
        applicationLink: '',
        status: '简历投递',
        applicationDate: formattedDate,
        updateDate: formattedDate
      });
    }
  }, [initialData, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // 验证必填字段
    if (!formData.company || !formData.base || !formData.jd) {
      alert('请填写必填字段');
      return;
    }
    
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? '编辑投递记录' : '新增投递记录'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company">公司名称 *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="请输入公司名称"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="base">Base地 *</Label>
            <Input
              id="base"
              value={formData.base}
              onChange={(e) => handleChange('base', e.target.value)}
              placeholder="请输入工作地点"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="jd">岗位JD *</Label>
            <Textarea
              id="jd"
              value={formData.jd}
              onChange={(e) => handleChange('jd', e.target.value)}
              placeholder="请输入岗位描述"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resumeVersion">简历版本</Label>
            <Input
              id="resumeVersion"
              value={formData.resumeVersion}
              onChange={(e) => handleChange('resumeVersion', e.target.value)}
              placeholder="如: v1.0 (2024-01-01)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="applicationLink">投递链接</Label>
            <Input
              id="applicationLink"
              value={formData.applicationLink}
              onChange={(e) => handleChange('applicationLink', e.target.value)}
              placeholder="请输入投递链接"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">当前状态</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="applicationDate">投递日期</Label>
            <Input
              id="applicationDate"
              type="text"
              value={formData.applicationDate}
              onChange={(e) => handleChange('applicationDate', e.target.value)}
              placeholder="格式: YYYY-MM-DD HH:mm"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            {initialData ? '更新' : '保存'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationForm;
