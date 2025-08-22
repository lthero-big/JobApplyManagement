import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { statusOptions } from '@/lib/jobApplicationStore';
import ConfirmDelete from '@/components/ConfirmDelete';

const statusFlow = [
  '简历投递',
  '简历筛选',
  '笔试',
  '业务面试',
  'HR面试',
  'Offer发放',
  '入职'
];

const getStatusColor = (color) => {
  switch (color) {
    case 'green':
      return 'bg-green-500';
    case 'red':
      return 'bg-red-500';
    case 'gray':
    default:
      return 'bg-gray-300';
  }
};

const InterviewStatusBoard = ({ applications, onDelete }) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    applicationId: null
  });

  const handleDeleteClick = (id) => {
    setDeleteConfirmation({
      isOpen: true,
      applicationId: id
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation.applicationId) {
      onDelete(deleteConfirmation.applicationId);
    }
    setDeleteConfirmation({
      isOpen: false,
      applicationId: null
    });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      applicationId: null
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>面试状态看板</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">{application.company} - {application.jd}</h3>
                <div className="flex space-x-2">
                  <Badge variant="secondary">{application.base}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(application.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  {statusFlow.map((status, index) => {
                    // 查找该状态在历史记录中的信息
                    const statusHistory = application.statusHistory?.find(item => item.status === status);
                    const color = statusHistory ? statusHistory.color : 'gray';
                    const date = statusHistory ? statusHistory.date : '';
                    
                    return (
                      <React.Fragment key={status}>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(color)} text-white text-xs`}>
                            {statusHistory ? '✓' : index + 1}
                          </div>
                          <div className="text-xs mt-1 text-center w-20">
                            <StatusBadge status={status} />
                          </div>
                          {date && (
                            <div className="text-xs text-muted-foreground mt-1">{date}</div>
                          )}
                        </div>
                        
                        {index < statusFlow.length - 1 && (
                          <div className="flex-1 h-0.5 bg-gray-200 mx-1"></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>当前状态: <StatusBadge status={application.status} /></span>
                  <span>更新时间: {application.updateDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <ConfirmDelete
        isOpen={deleteConfirmation.isOpen}
        onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Card>
  );
};

export default InterviewStatusBoard;
