import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, User } from 'lucide-react';
import { 
  getApplications as getApplicationsAPI,
  createApplication as createApplicationAPI,
  updateApplication as updateApplicationAPI,
  deleteApplication as deleteApplicationAPI
} from '@/api/applications';
import { filterApplications } from '@/lib/jobApplicationStore';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ApplicationFilter from '@/components/ApplicationFilter';
import ApplicationTable from '@/components/ApplicationTable';
import ApplicationForm from '@/components/ApplicationForm';
import ProgressTracker from '@/components/ProgressTracker';
import InterviewStatusBoard from '@/components/InterviewStatusBoard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filters, setFilters] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 初始化数据 - 从服务器获取
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await getApplicationsAPI();
      if (response.success) {
        setApplications(response.data);
        setFilteredApplications(response.data);
      }
    } catch (error) {
      toast.error('加载数据失败：' + (error.message || '请稍后重试'));
    } finally {
      setLoading(false);
    }
  };

  // 应用筛选
  useEffect(() => {
    const filtered = filterApplications(applications, filters);
    setFilteredApplications(filtered);
  }, [applications, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleAddApplication = () => {
    setEditingApplication(null);
    setIsFormOpen(true);
  };

  const handleEditApplication = (application) => {
    setEditingApplication(application);
    setIsFormOpen(true);
  };

  const handleViewDetails = (application) => {
    setViewingApplication(application);
    setIsFormOpen(true);
  };

  const handleDeleteApplication = async (id) => {
    try {
      const response = await deleteApplicationAPI(id);
      if (response.success) {
        setApplications(prev => prev.filter(app => app.id !== id));
        toast.success('删除成功');
      }
    } catch (error) {
      toast.error('删除失败：' + (error.message || '请稍后重试'));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const app = applications.find(a => a.id === id);
      const response = await updateApplicationAPI(id, { ...app, status });
      if (response.success) {
        setApplications(prev => 
          prev.map(app => app.id === id ? response.data : app)
        );
        toast.success('状态更新成功');
      }
    } catch (error) {
      toast.error('更新失败：' + (error.message || '请稍后重试'));
    }
  };

  const handleSubmitApplication = async (data) => {
    try {
      if (editingApplication) {
        // 更新现有记录
        const response = await updateApplicationAPI(editingApplication.id, data);
        if (response.success) {
          setApplications(prev => 
            prev.map(app => app.id === editingApplication.id ? response.data : app)
          );
          toast.success('更新成功');
        }
      } else {
        // 添加新记录
        const response = await createApplicationAPI(data);
        if (response.success) {
          setApplications(prev => [...prev, response.data]);
          toast.success('创建成功');
        }
      }
    } catch (error) {
      toast.error(error.message || '操作失败，请稍后重试');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('已退出登录');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">求职管理后台</h1>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.username}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleAddApplication}>
              <Plus className="mr-2 h-4 w-4" />
              新增投递记录
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applications">投递记录</TabsTrigger>
            <TabsTrigger value="interview-board">面试状态看板</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications">
            <div className="mt-6">
              <ProgressTracker applications={applications} />
              
              <div className="mb-6">
                <ApplicationFilter 
                  onFilterChange={handleFilterChange} 
                  onReset={handleResetFilters} 
                />
              </div>
              
              <div className="mb-8">
                <ApplicationTable 
                  applications={filteredApplications}
                  onEdit={handleEditApplication}
                  onDelete={handleDeleteApplication}
                  onViewDetails={handleViewDetails}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="interview-board">
            <div className="mt-6">
              <InterviewStatusBoard 
                applications={applications} 
                onDelete={handleDeleteApplication} 
              />
            </div>
          </TabsContent>
        </Tabs>

        <ApplicationForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleSubmitApplication}
          initialData={editingApplication}
        />
      </div>
    </div>
  );
};

export default Index;
