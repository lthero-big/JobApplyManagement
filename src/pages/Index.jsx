import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { 
  getApplications, 
  addApplication, 
  updateApplication, 
  deleteApplication, 
  filterApplications 
} from '@/lib/jobApplicationStore';
import ApplicationFilter from '@/components/ApplicationFilter';
import ApplicationTable from '@/components/ApplicationTable';
import ApplicationForm from '@/components/ApplicationForm';
import ProgressTracker from '@/components/ProgressTracker';
import InterviewStatusBoard from '@/components/InterviewStatusBoard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const Index = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filters, setFilters] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');

  // 初始化数据
  useEffect(() => {
    const apps = getApplications();
    setApplications(apps);
    setFilteredApplications(apps);
  }, []);

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

  const handleDeleteApplication = (id) => {
    const updated = deleteApplication(id);
    setApplications(updated);
  };

  const handleUpdateStatus = (id, status) => {
    const updated = updateApplication(id, { status });
    if (updated) {
      setApplications(prev => 
        prev.map(app => app.id === id ? updated : app)
      );
    }
  };

  const handleSubmitApplication = (data) => {
    if (editingApplication) {
      // 更新现有记录
      const updated = updateApplication(editingApplication.id, data);
      if (updated) {
        setApplications(prev => 
          prev.map(app => app.id === editingApplication.id ? updated : app)
        );
      }
    } else {
      // 添加新记录
      const newApp = addApplication(data);
      setApplications(prev => [...prev, newApp]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">求职管理后台</h1>
          <Button onClick={handleAddApplication}>
            <Plus className="mr-2 h-4 w-4" />
            新增投递记录
          </Button>
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
