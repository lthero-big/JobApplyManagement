import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusColors = {
  '简历投递': 'bg-blue-100 text-blue-800',
  '简历筛选': 'bg-yellow-100 text-yellow-800',
  '笔试': 'bg-purple-100 text-purple-800',
  '业务面试': 'bg-indigo-100 text-indigo-800',
  'HR面试': 'bg-pink-100 text-pink-800',
  'Offer发放': 'bg-green-100 text-green-800',
  '入职': 'bg-teal-100 text-teal-800',
  '已拒绝': 'bg-red-100 text-red-800'
};

const StatusBadge = ({ status, className = '' }) => {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <Badge className={`${colorClass} ${className}`}>
      {status}
    </Badge>
  );
};

export default StatusBadge;
