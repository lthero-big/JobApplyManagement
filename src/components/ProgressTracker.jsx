import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/ui/StatusBadge';
import { statusOptions } from '@/lib/jobApplicationStore';

const statusFlow = [
  '简历投递',
  '简历筛选',
  '笔试',
  '业务面试',
  'HR面试',
  'Offer发放',
  '入职'
];

const getStatusColor = (status) => {
  switch (status) {
    case '已拒绝':
      return 'bg-red-500';
    case '入职':
      return 'bg-green-500';
    default:
      return 'bg-blue-500';
  }
};

const ProgressTracker = ({ applications }) => {
  // 计算各状态的统计信息
  const statusCounts = statusOptions.reduce((acc, option) => {
    acc[option.value] = applications.filter(app => app.status === option.value).length;
    return acc;
  }, {});

  // 计算整体进度
  const totalApplications = applications.length;
  const offerGrantedApplications = applications.filter(app => app.status === 'Offer发放').length;
  const rejectedApplications = applications.filter(app => app.status === '已拒绝').length;
  const inProgressApplications = totalApplications - offerGrantedApplications - rejectedApplications;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>总体进度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">总投递数</span>
                <span className="text-sm font-medium">{totalApplications}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">进行中</span>
                <span className="text-sm font-medium">{inProgressApplications}</span>
              </div>
              <Progress 
                value={totalApplications > 0 ? (inProgressApplications / totalApplications) * 100 : 0} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Offer发放</span>
                <span className="text-sm font-medium">{offerGrantedApplications}</span>
              </div>
              <Progress 
                value={totalApplications > 0 ? (offerGrantedApplications / totalApplications) * 100 : 0} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">被拒绝</span>
                <span className="text-sm font-medium">{rejectedApplications}</span>
              </div>
              <Progress 
                value={totalApplications > 0 ? (rejectedApplications / totalApplications) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>状态分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statusOptions.map((option) => (
              <div key={option.value} className="text-center">
                <div className="text-2xl font-bold">{statusCounts[option.value] || 0}</div>
                <div className="mt-1">
                  <StatusBadge status={option.value} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
