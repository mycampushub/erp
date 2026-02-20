
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, PieChart, Activity, DollarSign, Clock, Users, Target, CheckCircle, FileText, Download, Calendar, Plus } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { StatCard, formatCurrency, formatDate, EnhancedCRUDTable, CRUDDialog, ConfirmDialog, ViewDialog } from '../../lib/projectManagement/CRUDComponents';
import { PM_STORAGE_KEYS } from '../../lib/projectManagement/types';

interface AnalyticsReport {
  id: string;
  name: string;
  type: 'Executive' | 'Performance' | 'Financial' | 'Resource' | 'Risk' | 'Timeline';
  generatedAt: string;
  generatedBy: string;
  period: string;
  status: 'Draft' | 'Generated' | 'Viewed' | 'Archived';
}

const ProjectAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [projectCount, setProjectCount] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalActual, setTotalActual] = useState(0);
  
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AnalyticsReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Project Analytics. View comprehensive performance metrics and reports.');
    loadData();
  }, [isEnabled, speak]);

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    const plans = listEntities<any>(PM_STORAGE_KEYS.PROJECT_PLANS);
    const budgets = listEntities<any>(PM_STORAGE_KEYS.BUDGETS);
    
    setProjectCount(plans.length || 5);
    setActiveProjects(plans.filter((p: any) => p.status === 'Active').length || 3);
    setCompletedProjects(plans.filter((p: any) => p.status === 'Completed').length || 2);
    setTotalBudget(budgets.reduce((sum: number, b: any) => sum + (b.budgeted || 0), 0) || 450000);
    setTotalActual(budgets.reduce((sum: number, b: any) => sum + (b.actual || 0), 0) || 380000);

    const savedReports = listEntities<AnalyticsReport>(PM_STORAGE_KEYS.TIME_REPORTS);
    if (savedReports.length > 0) {
      const mappedReports: AnalyticsReport[] = savedReports.slice(0, 30).map((r: any, idx: number) => ({
        id: r.id || generateId('ar'),
        name: r.name || `Analytics Report ${idx + 1}`,
        type: (['Executive', 'Performance', 'Financial', 'Resource', 'Risk', 'Timeline'][idx % 6]) as AnalyticsReport['type'],
        generatedAt: r.createdAt || new Date().toISOString(),
        generatedBy: r.generatedBy || 'System',
        period: r.dateRange ? `${r.dateRange.start} - ${r.dateRange.end}` : 'Q1 2025',
        status: (['Draft', 'Generated', 'Viewed', 'Archived'][idx % 4]) as AnalyticsReport['status']
      }));
      setReports(mappedReports);
    } else {
      const defaultReports: AnalyticsReport[] = Array.from({ length: 30 }, (_, idx) => ({
        id: generateId('ar'),
        name: `${['Executive Summary', 'Performance Analysis', 'Financial Report', 'Resource Utilization', 'Risk Assessment', 'Timeline Progress'][idx % 6]} - ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx % 12]} 2025`,
        type: (['Executive', 'Performance', 'Financial', 'Resource', 'Risk', 'Timeline'][idx % 6]) as AnalyticsReport['type'],
        generatedAt: new Date(Date.now() - idx * 86400000).toISOString(),
        generatedBy: ['System', 'Admin', 'Manager', 'Finance'][idx % 4],
        period: `Q${Math.floor(idx / 3) + 1} 2025`,
        status: (['Draft', 'Generated', 'Viewed', 'Archived'][idx % 4]) as AnalyticsReport['status']
      }));
      defaultReports.forEach(r => upsertEntity(PM_STORAGE_KEYS.TIME_REPORTS, r));
      setReports(defaultReports);
    }
  }, []);

  const handleCRUD = (item?: AnalyticsReport, edit = false) => {
    setSelectedItem(item || null);
    setIsEditing(edit);
    setIsDialogOpen(true);
  };

  const handleView = (item: AnalyticsReport) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (item: AnalyticsReport) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      removeEntity(PM_STORAGE_KEYS.TIME_REPORTS, selectedItem.id);
      setReports(prev => prev.filter(r => r.id !== selectedItem.id));
      toast({ title: 'Deleted', description: 'Report deleted successfully', variant: 'destructive' });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSave = (data: any) => {
    if (isEditing && selectedItem) {
      const updated = { ...selectedItem, ...data };
      upsertEntity(PM_STORAGE_KEYS.TIME_REPORTS, updated);
      setReports(prev => prev.map(r => r.id === selectedItem.id ? updated : r));
      toast({ title: 'Updated', description: 'Report updated successfully' });
    } else {
      const newReport: AnalyticsReport = {
        ...data,
        id: generateId('ar'),
        generatedAt: new Date().toISOString(),
        generatedBy: 'Current User',
        status: 'Generated'
      };
      upsertEntity(PM_STORAGE_KEYS.TIME_REPORTS, newReport);
      setReports(prev => [newReport, ...prev]);
      toast({ title: 'Created', description: 'Report created successfully' });
    }
    setIsDialogOpen(false);
  };

  const generateReport = (type: string) => {
    const newReport: AnalyticsReport = {
      id: generateId('ar'),
      name: `${type} Report - ${new Date().toLocaleDateString()}`,
      type: type as AnalyticsReport['type'],
      generatedAt: new Date().toISOString(),
      generatedBy: 'Current User',
      period: 'Q1 2025',
      status: 'Generated'
    };
    upsertEntity(PM_STORAGE_KEYS.TIME_REPORTS, newReport);
    setReports(prev => [newReport, ...prev]);
    toast({ title: 'Report Generated', description: `${type} report has been generated` });
  };

  const reportColumns = [
    { key: 'name', header: 'Report Name', sortable: true },
    { key: 'type', header: 'Type', render: (v: string) => (
      <Badge variant={v === 'Executive' ? 'default' : v === 'Financial' ? 'secondary' : 'outline'}>{v}</Badge>
    )},
    { key: 'period', header: 'Period', sortable: true },
    { key: 'generatedBy', header: 'Generated By' },
    { key: 'generatedAt', header: 'Date', render: (v: string) => formatDate(v) },
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'Generated' ? 'default' : v === 'Viewed' ? 'secondary' : v === 'Archived' ? 'outline' : 'destructive'}>{v}</Badge>
    )},
  ];

  const getFormFields = () => [
    { name: 'name', label: 'Report Name', type: 'text' as const, required: true },
    { name: 'type', label: 'Type', type: 'select' as const, options: [
      { label: 'Executive', value: 'Executive' }, { label: 'Performance', value: 'Performance' },
      { label: 'Financial', value: 'Financial' }, { label: 'Resource', value: 'Resource' },
      { label: 'Risk', value: 'Risk' }, { label: 'Timeline', value: 'Timeline' }
    ]},
    { name: 'period', label: 'Period', type: 'text' as const, placeholder: 'Q1 2025' },
    { name: 'generatedBy', label: 'Generated By', type: 'text' as const },
    { name: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Draft', value: 'Draft' }, { label: 'Generated', value: 'Generated' },
      { label: 'Viewed', value: 'Viewed' }, { label: 'Archived', value: 'Archived' }
    ]},
  ];

  const getViewFields = () => [
    { key: 'name', label: 'Report Name' },
    { key: 'type', label: 'Type' },
    { key: 'period', label: 'Period' },
    { key: 'generatedBy', label: 'Generated By' },
    { key: 'generatedAt', label: 'Generated Date', render: (v: string) => formatDate(v) },
    { key: 'status', label: 'Status' },
  ];

  const successRate = projectCount ? Math.round((completedProjects / projectCount) * 100) : 0;
  const budgetVariance = totalBudget - totalActual;

  const performanceMetrics = [
    { name: 'Schedule Performance', value: 92, target: 90, trend: 'up' },
    { name: 'Cost Performance', value: 88, target: 85, trend: 'up' },
    { name: 'Quality Score', value: 95, target: 92, trend: 'stable' },
    { name: 'Resource Efficiency', value: 78, target: 80, trend: 'down' },
  ];

  const projectPerformance = [
    { name: 'ERP Implementation', progress: 65, status: 'On Track', budget: 85, schedule: 90 },
    { name: 'Warehouse Expansion', progress: 42, status: 'On Track', budget: 92, schedule: 88 },
    { name: 'Quality System', progress: 28, status: 'At Risk', budget: 75, schedule: 65 },
    { name: 'Digital Marketing', progress: 78, status: 'On Track', budget: 98, schedule: 95 },
  ];

  const monthlyData = [
    { month: 'Jan', budget: 120000, actual: 110000 },
    { month: 'Feb', budget: 150000, actual: 145000 },
    { month: 'Mar', budget: 180000, actual: 175000 },
    { month: 'Apr', budget: 160000, actual: 155000 },
    { month: 'May', budget: 140000, actual: 138000 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/project-management')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Project Analytics" description="Comprehensive project performance analysis and reporting" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Projects" value={projectCount} icon={<BarChart3 className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Success Rate" value={`${successRate}%`} icon={<TrendingUp className="h-6 w-6 text-green-600" />} />
        <StatCard title="Avg ROI" value="28%" icon={<PieChart className="h-6 w-6 text-purple-600" />} />
        <StatCard title="Total Value" value={formatCurrency(totalBudget)} icon={<Activity className="h-6 w-6 text-orange-600" />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
              <div className="space-y-3">
                <div><div className="flex justify-between text-sm"><span>Active</span><span className="font-medium">{activeProjects}</span></div><Progress value={(activeProjects/projectCount)*100 || 0} className="h-2" /></div>
                <div><div className="flex justify-between text-sm"><span>Completed</span><span className="font-medium">{completedProjects}</span></div><Progress value={(completedProjects/projectCount)*100 || 0} className="h-2" /></div>
                <div><div className="flex justify-between text-sm"><span>Planning</span><span className="font-medium">{projectCount - activeProjects - completedProjects}</span></div><Progress value={((projectCount - activeProjects - completedProjects)/projectCount)*100 || 0} className="h-2" /></div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                {performanceMetrics.map(m => (
                  <div key={m.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{m.name}</span>
                      <span className="flex items-center gap-1">
                        {m.value}%
                        {m.trend === 'up' ? <TrendingUp className="h-3 w-3 text-green-500" /> : m.trend === 'down' ? <TrendingDown className="h-3 w-3 text-red-500" /> : null}
                      </span>
                    </div>
                    <Progress value={m.value} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center"><TrendingUp className="h-4 w-4 mr-2" />Performance Trend</h4>
                <p className="text-sm text-blue-700">Project delivery performance has improved by 15% over the last quarter</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center"><DollarSign className="h-4 w-4 mr-2" />Budget Efficiency</h4>
                <p className="text-sm text-green-700">{budgetVariance >= 0 ? 'Under' : 'Over'} budget by {formatCurrency(Math.abs(budgetVariance))}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2 flex items-center"><Users className="h-4 w-4 mr-2" />Resource Optimization</h4>
                <p className="text-sm text-orange-700">Current resource utilization is at 78%</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Project Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Project</th>
                    <th className="text-center py-2">Progress</th>
                    <th className="text-center py-2">Status</th>
                    <th className="text-center py-2">Budget</th>
                    <th className="text-center py-2">Schedule</th>
                  </tr>
                </thead>
                <tbody>
                  {projectPerformance.map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3"><div className="flex items-center gap-2"><Progress value={p.progress} className="w-20 h-2" /><span className="text-sm">{p.progress}%</span></div></td>
                      <td className="py-3 text-center"><Badge variant={p.status === 'On Track' ? 'default' : 'destructive'}>{p.status}</Badge></td>
                      <td className="py-3 text-center"><span className={p.budget >= 90 ? 'text-green-600' : p.budget >= 70 ? 'text-yellow-600' : 'text-red-600'}>{p.budget}%</span></td>
                      <td className="py-3 text-center"><span className={p.schedule >= 90 ? 'text-green-600' : p.schedule >= 70 ? 'text-yellow-600' : 'text-red-600'}>{p.schedule}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">KPI Dashboard</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>On-Time Delivery Rate</span>
                  <span className="font-bold text-green-600">92%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>First-Time Quality Pass</span>
                  <span className="font-bold text-green-600">88%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Customer Satisfaction</span>
                  <span className="font-bold text-green-600">91%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Employee Engagement</span>
                  <span className="font-bold text-yellow-600">78%</span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
              <div className="space-y-3">
                {['Development Team', 'QA Team', 'Design Team', 'Management'].map((team, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{team}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={[85, 92, 78, 88][i]} className="w-20 h-2" />
                      <span className="text-sm font-medium">{[85, 92, 78, 88][i]}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">Total Budget</p><p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p></div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">Actual Spend</p><p className="text-2xl font-bold">{formatCurrency(totalActual)}</p></div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">Variance</p><p className="text-2xl font-bold text-green-600">{formatCurrency(budgetVariance)}</p></div>
                {budgetVariance >= 0 ? <CheckCircle className="h-8 w-8 text-green-500" /> : <TrendingDown className="h-8 w-8 text-red-500" />}
              </div>
            </Card>
          </div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Budget vs Actual</h3>
            <div className="space-y-3">
              {monthlyData.map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1"><span>{m.month}</span><span>Budget: {formatCurrency(m.budget)} | Actual: {formatCurrency(m.actual)}</span></div>
                  <div className="flex gap-1"><div style={{ width: `${(m.budget / totalBudget) * 100}%` }} className="h-4 bg-blue-500 rounded-l"></div><div style={{ width: `${(m.actual / totalBudget) * 100}%` }} className="h-4 bg-green-500 rounded-r"></div></div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-sm"><span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded"></div>Budget</span><span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded"></div>Actual</span></div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cost Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Labor (45%)', 'Materials (25%)', 'Equipment (20%)', 'Other (10%)'].map((cat, i) => (
                <div key={i} className="text-center p-4 border rounded-lg">
                  <p className="font-bold text-lg">{['#4CAF50', '#2196F3', '#FF9800', '#9E9E9E'][i]}</p>
                  <p className="text-sm">{cat}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => generateReport('Executive')}>
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Executive Dashboard</h4>
                <p className="text-sm text-gray-500 mb-3">High-level project overview for leadership</p>
                <Button onClick={() => generateReport('Executive')}>Generate</Button>
              </div>
              <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => generateReport('Performance')}>
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Performance Report</h4>
                <p className="text-sm text-gray-500 mb-3">Detailed performance metrics analysis</p>
                <Button onClick={() => generateReport('Performance')}>Generate</Button>
              </div>
              <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => generateReport('Financial')}>
                <DollarSign className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Financial Report</h4>
                <p className="text-sm text-gray-500 mb-3">Budget and cost analysis</p>
                <Button onClick={() => generateReport('Financial')}>Generate</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => generateReport('Resource')}>
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Resource Report</h4>
                <p className="text-sm text-gray-500 mb-3">Team utilization and allocation</p>
                <Button variant="outline" onClick={() => generateReport('Resource')}>Generate</Button>
              </div>
              <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => generateReport('Risk')}>
                <Target className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Risk Report</h4>
                <p className="text-sm text-gray-500 mb-3">Risk analysis and mitigation status</p>
                <Button variant="outline" onClick={() => generateReport('Risk')}>Generate</Button>
              </div>
              <div className="border rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => generateReport('Timeline')}>
                <Calendar className="h-12 w-12 text-teal-600 mx-auto mb-3" />
                <h4 className="font-medium mb-2">Timeline Report</h4>
                <p className="text-sm text-gray-500 mb-3">Project schedule and milestones</p>
                <Button variant="outline" onClick={() => generateReport('Timeline')}>Generate</Button>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Saved Reports ({reports.length})</h3>
              <Button onClick={() => handleCRUD()}><Plus className="h-4 w-4 mr-2" />Create Report</Button>
            </div>
            <EnhancedCRUDTable data={reports} columns={reportColumns} title="" pageSize={10}
              onCreate={() => handleCRUD()} onEdit={item => handleCRUD(item, true)} onDelete={item => handleDelete(item)} onView={item => handleView(item)} />
          </Card>
        </TabsContent>
      </Tabs>

      <CRUDDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} 
        title="Analytics Report" item={selectedItem} onSave={handleSave} fields={getFormFields()} isEdit={isEditing} />
      
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={confirmDelete} 
        title="Delete Report" description="Are you sure you want to delete this report?" confirmLabel="Delete" />

      <ViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}
        title="Analytics Report" item={selectedItem} fields={getViewFields()} />
    </div>
  );
};

export default ProjectAnalytics;
