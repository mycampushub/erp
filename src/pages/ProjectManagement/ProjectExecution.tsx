import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Play, Pause, CheckCircle, AlertCircle, Clock, Users, Plus, Edit, Eye, Trash2, TrendingUp, TrendingDown, Activity, BarChart3, Zap } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { 
  CRUDDialog, EnhancedCRUDTable, StatCard, ViewDialog, ConfirmDialog,
  formatDate
} from '../../lib/projectManagement/CRUDComponents';
import { Execution, WorkPackage, Deliverable, PM_STORAGE_KEYS } from '../../lib/projectManagement/types';

const ProjectExecution: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('execution');
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'execution' | 'workpackage' | 'deliverable'>('execution');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Project Execution. Here you can monitor project progress, manage work packages, track deliverables, and ensure successful project delivery.');
    }
    loadData();
  }, [isEnabled, speak]);

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    const exec = listEntities<Execution>(PM_STORAGE_KEYS.EXECUTIONS);
    const wp = listEntities<WorkPackage>(PM_STORAGE_KEYS.WORK_PACKAGES);
    const del = listEntities<Deliverable>(PM_STORAGE_KEYS.DELIVERABLES);
    setExecutions(exec);
    setWorkPackages(wp);
    setDeliverables(del);
  }, []);

  const handleCreate = (type: 'execution' | 'workpackage' | 'deliverable') => {
    setDialogType(type);
    setSelectedItem(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any, type: 'execution' | 'workpackage' | 'deliverable') => {
    setDialogType(type);
    setSelectedItem(item);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleView = (item: any, type: 'execution' | 'workpackage' | 'deliverable') => {
    setDialogType(type);
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (item: any, type: 'execution' | 'workpackage' | 'deliverable') => {
    setDialogType(type);
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedItem) return;
    let key: any = PM_STORAGE_KEYS.EXECUTIONS;
    let setter: React.Dispatch<React.SetStateAction<any[]>> = setExecutions;
    if (dialogType === 'workpackage') {
      key = PM_STORAGE_KEYS.WORK_PACKAGES;
      setter = setWorkPackages as any;
    } else if (dialogType === 'deliverable') {
      key = PM_STORAGE_KEYS.DELIVERABLES;
      setter = setDeliverables as any;
    }
    removeEntity(key, selectedItem.id);
    setter((prev: any[]) => prev.filter((item: any) => item.id !== selectedItem.id));
    toast({ title: 'Item Deleted', description: 'Item has been deleted successfully.', variant: 'destructive' });
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleSave = (data: any) => {
    let key: any = PM_STORAGE_KEYS.EXECUTIONS;
    let setter: React.Dispatch<React.SetStateAction<any[]>> = setExecutions;
    if (dialogType === 'workpackage') {
      key = PM_STORAGE_KEYS.WORK_PACKAGES;
      setter = setWorkPackages as any;
    } else if (dialogType === 'deliverable') {
      key = PM_STORAGE_KEYS.DELIVERABLES;
      setter = setDeliverables as any;
    }

    if (isEditing && selectedItem) {
      const updated = { ...selectedItem, ...data };
      upsertEntity(key, updated);
      setter((prev: any[]) => prev.map((item: any) => item.id === selectedItem.id ? updated : item));
      toast({ title: 'Item Updated', description: 'Item has been updated successfully.' });
    } else {
      const newItem = { ...data, id: generateId(dialogType === 'execution' ? 'exe' : dialogType === 'workpackage' ? 'wp' : 'dlv') };
      upsertEntity(key, newItem);
      setter((prev: any[]) => [newItem, ...prev]);
      toast({ title: 'Item Created', description: 'Item has been created successfully.' });
    }
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const executionColumns = [
    { key: 'project', header: 'Project', sortable: true },
    { key: 'phase', header: 'Current Phase', sortable: true },
    { key: 'progress', header: 'Progress', sortable: true, render: (value: number) => (
      <div className="w-24">
        <Progress value={value} className="h-2" />
        <div className="text-xs text-right mt-1">{value}%</div>
      </div>
    )},
    { key: 'status', header: 'Status', sortable: true, render: (value: string) => (
      <Badge variant={value === 'In Progress' ? 'default' : value === 'Completed' ? 'secondary' : 'destructive'}>{value}</Badge>
    )},
    { key: 'team', header: 'Team', sortable: true },
    { key: 'startDate', header: 'Start Date', render: (v: string) => formatDate(v) },
    { key: 'endDate', header: 'End Date', render: (v: string) => formatDate(v) },
  ];

  const workPackageColumns = [
    { key: 'name', header: 'Work Package', sortable: true },
    { key: 'assignee', header: 'Assignee', sortable: true },
    { key: 'dueDate', header: 'Due Date', render: (v: string) => formatDate(v) },
    { key: 'status', header: 'Status', sortable: true, render: (value: string) => (
      <Badge variant={value === 'Active' ? 'default' : value === 'Completed' ? 'secondary' : 'outline'}>{value}</Badge>
    )},
    { key: 'completion', header: 'Completion', sortable: true, render: (value: number) => `${value}%` },
    { key: 'estimatedHours', header: 'Est. Hours' },
  ];

  const deliverableColumns = [
    { key: 'name', header: 'Deliverable', sortable: true },
    { key: 'projectId', header: 'Project', sortable: true },
    { key: 'dueDate', header: 'Due Date', render: (v: string) => formatDate(v) },
    { key: 'status', header: 'Status', sortable: true, render: (value: string) => (
      <Badge variant={value === 'Completed' ? 'default' : value === 'In Progress' ? 'secondary' : 'outline'}>{value}</Badge>
    )},
    { key: 'approvedBy', header: 'Approved By' },
  ];

  const getFormFields = () => {
    if (dialogType === 'execution') {
      return [
        { name: 'project', label: 'Project', type: 'text' as const, required: true, placeholder: 'Enter project name' },
        { name: 'phase', label: 'Current Phase', type: 'text' as const, required: true },
        { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
          { label: 'Not Started', value: 'Not Started' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Completed', value: 'Completed' },
          { label: 'On Hold', value: 'On Hold' },
          { label: 'Cancelled', value: 'Cancelled' }
        ]},
        { name: 'team', label: 'Team', type: 'text' as const, placeholder: 'Enter team name' },
        { name: 'startDate', label: 'Start Date', type: 'date' as const, required: true },
        { name: 'endDate', label: 'End Date', type: 'date' as const, required: true },
        { name: 'manager', label: 'Manager', type: 'text' as const, placeholder: 'Enter manager name' },
        { name: 'progress', label: 'Progress %', type: 'number' as const, placeholder: '0-100' },
      ];
    } else if (dialogType === 'workpackage') {
      return [
        { name: 'name', label: 'Work Package Name', type: 'text' as const, required: true },
        { name: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
        { name: 'assignee', label: 'Assignee', type: 'text' as const, required: true },
        { name: 'dueDate', label: 'Due Date', type: 'date' as const, required: true },
        { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
          { label: 'Pending', value: 'Pending' },
          { label: 'Active', value: 'Active' },
          { label: 'Completed', value: 'Completed' },
          { label: 'Cancelled', value: 'Cancelled' }
        ]},
        { name: 'estimatedHours', label: 'Estimated Hours', type: 'number' as const },
        { name: 'projectId', label: 'Project ID', type: 'text' as const },
      ];
    } else {
      return [
        { name: 'name', label: 'Deliverable Name', type: 'text' as const, required: true },
        { name: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
        { name: 'projectId', label: 'Project ID', type: 'text' as const, required: true },
        { name: 'dueDate', label: 'Due Date', type: 'date' as const, required: true },
        { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
          { label: 'Not Started', value: 'Not Started' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Completed', value: 'Completed' },
          { label: 'Rejected', value: 'Rejected' }
        ]},
        { name: 'approvedBy', label: 'Approved By', type: 'text' as const },
      ];
    }
  };

  const activeCount = executions.filter(e => e.status === 'In Progress').length;
  const completedCount = workPackages.filter(w => w.status === 'Completed').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/project-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Project Execution"
          description="Monitor and manage active project execution phases"
          voiceIntroduction="Welcome to Project Execution management."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Executions" value={activeCount} icon={<Play className="h-6 w-6 text-green-600" />} />
        <StatCard title="Completed Tasks" value={completedCount} icon={<CheckCircle className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Issues" value="8" icon={<AlertCircle className="h-6 w-6 text-orange-600" />} />
        <StatCard title="Team Members" value="45" icon={<Users className="h-6 w-6 text-purple-600" />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="execution">Executions</TabsTrigger>
          <TabsTrigger value="workpackages">Work Packages</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="execution" className="space-y-6">
          <Card className="p-6">
            <EnhancedCRUDTable
              data={executions}
              columns={executionColumns}
              title="Project Executions"
              pageSize={10}
              onCreate={() => handleCreate('execution')}
              onEdit={(item) => handleEdit(item, 'execution')}
              onView={(item) => handleView(item, 'execution')}
              onDelete={(item) => handleDelete(item, 'execution')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="workpackages" className="space-y-6">
          <Card className="p-6">
            <EnhancedCRUDTable
              data={workPackages}
              columns={workPackageColumns}
              title="Work Packages"
              pageSize={10}
              onCreate={() => handleCreate('workpackage')}
              onEdit={(item) => handleEdit(item, 'workpackage')}
              onView={(item) => handleView(item, 'workpackage')}
              onDelete={(item) => handleDelete(item, 'workpackage')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="deliverables" className="space-y-6">
          <Card className="p-6">
            <EnhancedCRUDTable
              data={deliverables}
              columns={deliverableColumns}
              title="Deliverables"
              pageSize={10}
              onCreate={() => handleCreate('deliverable')}
              onEdit={(item) => handleEdit(item, 'deliverable')}
              onView={(item) => handleView(item, 'deliverable')}
              onDelete={(item) => handleDelete(item, 'deliverable')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Schedule Performance</p>
                  <p className="text-2xl font-bold text-green-600">92%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={92} className="h-2 mt-2" />
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cost Performance</p>
                  <p className="text-2xl font-bold text-yellow-600">88%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-yellow-500" />
              </div>
              <Progress value={88} className="h-2 mt-2" />
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Quality Score</p>
                  <p className="text-2xl font-bold text-blue-600">95%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={95} className="h-2 mt-2" />
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Team Velocity</p>
                  <p className="text-2xl font-bold text-purple-600">+12%</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
              <Progress value={75} className="h-2 mt-2" />
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center"><Activity className="h-4 w-4 mr-2" />Schedule Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Planned vs Actual</span>
                    <Badge variant="default">On Track</Badge>
                  </div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Tasks Completed</span><span>45/52</span></div><Progress value={87} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Milestones Met</span><span>8/10</span></div><Progress value={80} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Deadlines Met</span><span>95%</span></div><Progress value={95} className="h-2" /></div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center"><BarChart3 className="h-4 w-4 mr-2" />Cost Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Budget Status</span>
                    <Badge variant="secondary">Under Budget</Badge>
                  </div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Budget Used</span><span>€285,000/€350,000</span></div><Progress value={81} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Variance</span><span className="text-green-600">-€12,500</span></div><Progress value={15} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Cost Efficiency</span><span>94%</span></div><Progress value={94} className="h-2" /></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quality & Satisfaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Quality Metrics</h4>
                <div className="space-y-3">
                  <div><div className="flex justify-between text-sm mb-1"><span>Deliverable Quality</span><span>95%</span></div><Progress value={95} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Defect Rate</span><span>2.3%</span></div><Progress value={97} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Rework Required</span><span>5%</span></div><Progress value={95} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Compliance Score</span><span>100%</span></div><Progress value={100} className="h-2" /></div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Stakeholder Satisfaction</h4>
                <div className="space-y-3">
                  <div><div className="flex justify-between text-sm mb-1"><span>Customer Satisfaction</span><span>91%</span></div><Progress value={91} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Team Satisfaction</span><span>85%</span></div><Progress value={85} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Stakeholder Engagement</span><span>88%</span></div><Progress value={88} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Risk Awareness</span><span>92%</span></div><Progress value={92} className="h-2" /></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Team Size</span>
                </div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-500">Members</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Avg Hours</span>
                </div>
                <p className="text-2xl font-bold">38.5</p>
                <p className="text-sm text-gray-500">Hours/week</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Productivity</span>
                </div>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-sm text-gray-500">Efficiency</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <CRUDDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={dialogType === 'execution' ? 'Execution' : dialogType === 'workpackage' ? 'Work Package' : 'Deliverable'}
        item={selectedItem}
        onSave={handleSave}
        fields={getFormFields()}
        isEdit={isEditing}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Item"
        description={`Are you sure you want to delete this item? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ProjectExecution;
