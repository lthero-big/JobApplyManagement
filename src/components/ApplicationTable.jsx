import React, { useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { statusOptions } from '@/lib/jobApplicationStore';
import ConfirmDelete from '@/components/ConfirmDelete';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

const ApplicationTable = ({ applications, onEdit, onDelete, onViewDetails, onUpdateStatus }) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    applicationId: null
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedApplications = React.useMemo(() => {
    if (!sortConfig.key) return applications;

    return [...applications].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // 处理日期排序
      if (sortConfig.key.includes('date')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // 处理状态排序
      if (sortConfig.key === 'status') {
        const statusOrder = statusOptions.map(option => option.value);
        aValue = statusOrder.indexOf(aValue);
        bValue = statusOrder.indexOf(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [applications, sortConfig]);

  // 计算分页数据
  const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = sortedApplications.slice(startIndex, startIndex + itemsPerPage);

  // 处理页面变化
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 处理每页显示数量变化
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // 重置到第一页
  };

  // 生成分页链接
  const generatePaginationLinks = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" /> : 
      <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] cursor-pointer" onClick={() => handleSort('company')}>
                公司名称 {getSortIcon('company')}
              </TableHead>
              <TableHead className="w-[100px] text-center cursor-pointer" onClick={() => handleSort('base')}>
                Base地 {getSortIcon('base')}
              </TableHead>
              <TableHead className="w-[200px]">岗位JD</TableHead>
              <TableHead className="w-[150px]">简历版本</TableHead>
              <TableHead className="w-[100px]">投递链接</TableHead>
              <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('status')}>
                当前状态 {getSortIcon('status')}
              </TableHead>
              <TableHead className="w-[150px] cursor-pointer" onClick={() => handleSort('applicationDate')}>
                投递日期 {getSortIcon('applicationDate')}
              </TableHead>
              <TableHead className="w-[150px] cursor-pointer" onClick={() => handleSort('updateDate')}>
                更新日期 {getSortIcon('updateDate')}
              </TableHead>
              <TableHead className="w-[120px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplications.map((application) => (
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

      {/* 分页控件 */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">每页显示</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            共 {sortedApplications.length} 条记录
          </span>
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {generatePaginationLinks().map((page, index) => (
              <PaginationItem key={index}>
                {page === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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
