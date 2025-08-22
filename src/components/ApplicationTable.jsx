import React, { useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/ui/StatusBadge';
import { statusOptions } from '@/lib/jobApplicationStore';
import ConfirmDelete from '@/components/ConfirmDelete';

const ApplicationTable = ({ applications, onEdit, onDelete, onViewDetails, onUpdateStatus }) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    applicationId: null
  });
  const deleteButtonRef = useRef(null);

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
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">公司名称</TableHead>
              <TableHead className="w-[100px] text-center">Base地</TableHead>
              <TableHead className="w-[200px]">岗位JD</TableHead>
              <TableHead className="w-[150px]">简历版本</TableHead>
              <TableHead className="w-[100px]">投递链接</TableHead>
              <TableHead className="w-[120px]">当前状态</TableHead>
              <TableHead className="w-[150px]">投递日期</TableHead>
              <TableHead className="w-[150px]">更新日期</TableHead>
              <TableHead className="w-[120px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.company}</TableCell>
                <TableCell className="text-center">{application.base}</TableCell>
                <TableCell>
                  <button 
                    onClick={() => onViewDetails(application)}
                    className="text-blue-600 hover:underline text-left"
                  >
                    {application.jd}
                  </button>
                </TableCell>
                <TableCell>{application.resumeVersion}</TableCell>
                <TableCell>
                  <a 
                    href={application.applicationLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    访问
                  </a>
                </TableCell>
                <TableCell>
                  <Select 
                    value={application.status} 
                    onValueChange={(value) => onUpdateStatus(application.id, value)}
                  >
                    <SelectTrigger className="w-[120px]">
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
                </TableCell>
                <TableCell>{application.applicationDate}</TableCell>
                <TableCell>{application.updateDate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(application)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(application.id)}
                      ref={deleteButtonRef}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDelete
        isOpen={deleteConfirmation.isOpen}
        onOpenChange={(open) => setDeleteConfirmation(prev => ({ ...prev, isOpen: open }))}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default ApplicationTable;
