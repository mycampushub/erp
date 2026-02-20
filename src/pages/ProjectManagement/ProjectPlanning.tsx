
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Calendar, Users, Target, FileText, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { 
  CRUDDialog, EnhancedCRUDTable, StatCard, ViewDialog, ConfirmDialog,
  formatCurrency, formatDate
} from '../../lib/projectManagement/CRUDComponents';
import { ProjectPlan, ProjectTemplate, ProjectObjective, Milestone, PM_STORAGE_KEYS, Priority } from '../../lib/projectManagement/types';

const statusColors: Record<string, string> = {
  'Draft': 'bg-gray-100 text-gray-800',
  'In Review': 'bg-blue-100 text-blue-800',
  'Approved': 'bg-green-100 text-green-800',
  'Active': 'bg-emerald-100 text-emerald-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  'Completed': 'bg-purple-100 text-purple-800',
  'Cancelled': 'bg-red-100 text-red-800',
  'Pending': 'bg-gray-100 text-gray-800',
  'Delayed': 'bg-red-100 text-red-800',
  'Not Started': 'bg-gray-100 text-gray-800',
  'In Progress': 'bg-blue-100 text-blue-800'
};

const priorityColors: Record<string, string> = {
  'Low': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800'
};

const ProjectPlanning: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('planning');
  const [projectPlans, setProjectPlans] = useState<ProjectPlan[]>([]);
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([]);
  const [projectObjectives, setProjectObjectives] = useState<ProjectObjective[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedPlan, setSelectedPlan] = useState<ProjectPlan | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<ProjectObjective | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [deleteType, setDeleteType] = useState<'plan' | 'template' | 'objective' | 'milestone'>('plan');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Project Planning. Create comprehensive project plans with resource allocation, timeline management, and risk assessment for successful project delivery.');
    }
    loadData();
  }, [isEnabled, speak]);

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    const plans = listEntities<ProjectPlan>(PM_STORAGE_KEYS.PROJECT_PLANS);
    const templates = listEntities<ProjectTemplate>(PM_STORAGE_KEYS.PROJECT_TEMPLATES);
    const objectives = listEntities<ProjectObjective>(PM_STORAGE_KEYS.PROJECT_OBJECTIVES);
    const ms = listEntities<Milestone>(PM_STORAGE_KEYS.PROJECT_MILESTONES);
    setProjectPlans(plans);
    setProjectTemplates(templates);
    setProjectObjectives(objectives);
    setMilestones(ms);
  }, []);

  const filteredPlans = projectPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.projectManager?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredObjectives = projectObjectives.filter(obj =>
    obj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obj.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMilestones = milestones.filter(ms =>
    ms.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ms.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setIsEditing(false);
    setIsPlanDialogOpen(true);
  };

  const handleEditPlan = (plan: ProjectPlan) => {
    setSelectedPlan(plan);
    setIsEditing(true);
    setIsPlanDialogOpen(true);
  };

  const handleViewPlan = (plan: ProjectPlan) => {
    setSelectedPlan(plan);
    setIsViewDialogOpen(true);
  };

  const handleDeletePlan = (plan: ProjectPlan) => {
    setSelectedPlan(plan);
    setDeleteType('plan');
    setIsDeleteDialogOpen(true);
  };

  const handleSavePlan = (planData: Partial<ProjectPlan>) => {
    if (isEditing && selectedPlan) {
      const updatedPlan = { ...selectedPlan, ...planData, updatedAt: new Date().toISOString() };
      upsertEntity(PM_STORAGE_KEYS.PROJECT_PLANS, updatedPlan as ProjectPlan);
      setProjectPlans(prev => prev.map(p => p.id === selectedPlan.id ? updatedPlan : p));
      toast({ title: 'Project Plan Updated', description: 'Project plan has been successfully updated.' });
    } else {
      const newPlan: ProjectPlan = {
        id: generateId('plan'),
        planId: `PLAN-${String(projectPlans.length + 1).padStart(3, '0')}`,
        name: planData.name || '',
        description: planData.description || '',
        status: planData.status || 'Draft',
        progress: 0,
        estimatedCost: planData.estimatedCost || 0,
        actualCost: 0,
        startDate: planData.startDate || new Date().toISOString().split('T')[0],
        endDate: planData.endDate || '',
        projectManager: planData.projectManager || '',
        sponsor: planData.sponsor || '',
        priority: planData.priority || 'Medium',
        phases: [],
        resources: [],
        risks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      upsertEntity(PM_STORAGE_KEYS.PROJECT_PLANS, newPlan);
      setProjectPlans(prev => [newPlan, ...prev]);
      toast({ title: 'Project Plan Created', description: 'New project plan has been successfully created.' });
    }
    setIsPlanDialogOpen(false);
    setSelectedPlan(null);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
    setIsTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setDeleteType('template');
    setIsDeleteDialogOpen(true);
  };

  const handleSaveTemplate = (data: Partial<ProjectTemplate>) => {
    if (isEditing && selectedTemplate) {
      const updated = { ...selectedTemplate, ...data };
      upsertEntity(PM_STORAGE_KEYS.PROJECT_TEMPLATES, updated as ProjectTemplate);
      setProjectTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updated : t));
      toast({ title: 'Template Updated', description: 'Template has been updated.' });
    } else {
      const newTemplate: ProjectTemplate = {
        id: generateId('tpl'),
        name: data.name || '',
        type: data.type || 'Standard',
        duration: data.duration || '3 months',
        phases: [],
        description: data.description || '',
        industry: data.industry || 'General',
        complexity: data.complexity || 'Medium',
        createdAt: new Date().toISOString()
      };
      upsertEntity(PM_STORAGE_KEYS.PROJECT_TEMPLATES, newTemplate);
      setProjectTemplates(prev => [newTemplate, ...prev]);
      toast({ title: 'Template Created', description: 'New template has been created.' });
    }
    setIsTemplateDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleCreateObjective = () => {
    setSelectedObjective(null);
    setIsEditing(false);
    setIsObjectiveDialogOpen(true);
  };

  const handleEditObjective = (objective: ProjectObjective) => {
    setSelectedObjective(objective);
    setIsEditing(true);
    setIsObjectiveDialogOpen(true);
  };

  const handleDeleteObjective = (objective: ProjectObjective) => {
    setSelectedObjective(objective);
    setDeleteType('objective');
    setIsDeleteDialogOpen(true);
  };

  const handleSaveObjective = (data: Partial<ProjectObjective>) => {
    if (isEditing && selectedObjective) {
      const updated = { ...selectedObjective, ...data };
      upsertEntity(PM_STORAGE_KEYS.PROJECT_OBJECTIVES, updated as ProjectObjective);
      setProjectObjectives(prev => prev.map(o => o.id === selectedObjective.id ? updated : o));
      toast({ title: 'Objective Updated', description: 'Objective has been updated.' });
    } else {
      const newObjective: ProjectObjective = {
        id: generateId('obj'),
        title: data.title || '',
        description: data.description || '',
        projectId: data.projectId || '',
        targetDate: data.targetDate || '',
        status: data.status || 'Not Started',
        progress: 0,
        kpis: []
      };
      upsertEntity(PM_STORAGE_KEYS.PROJECT_OBJECTIVES, newObjective);
      setProjectObjectives(prev => [newObjective, ...prev]);
      toast({ title: 'Objective Created', description: 'New objective has been created.' });
    }
    setIsObjectiveDialogOpen(false);
    setSelectedObjective(null);
  };

  const handleCreateMilestone = () => {
    setSelectedMilestone(null);
    setIsEditing(false);
    setIsMilestoneDialogOpen(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsEditing(true);
    setIsMilestoneDialogOpen(true);
  };

  const handleDeleteMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setDeleteType('milestone');
    setIsDeleteDialogOpen(true);
  };

  const handleSaveMilestone = (data: Partial<Milestone>) => {
    if (isEditing && selectedMilestone) {
      const updated = { ...selectedMilestone, ...data };
      upsertEntity(PM_STORAGE_KEYS.PROJECT_MILESTONES, updated as Milestone);
      setMilestones(prev => prev.map(m => m.id === selectedMilestone.id ? updated : m));
      toast({ title: 'Milestone Updated', description: 'Milestone has been updated.' });
    } else {
      const newMilestone: Milestone = {
        id: generateId('ms'),
        name: data.name || '',
        description: data.description || '',
        projectId: data.projectId || '',
        dueDate: data.dueDate || '',
        status: data.status || 'Pending',
        deliverables: []
      };
      upsertEntity(PM_STORAGE_KEYS.PROJECT_MILESTONES, newMilestone);
      setMilestones(prev => [newMilestone, ...prev]);
      toast({ title: 'Milestone Created', description: 'New milestone has been created.' });
    }
    setIsMilestoneDialogOpen(false);
    setSelectedMilestone(null);
  };

  const confirmDelete = () => {
    if (deleteType === 'plan' && selectedPlan) {
      removeEntity(PM_STORAGE_KEYS.PROJECT_PLANS, selectedPlan.id);
      setProjectPlans(prev => prev.filter(p => p.id !== selectedPlan.id));
      toast({ title: 'Project Plan Deleted', description: 'Project plan has been deleted.', variant: 'destructive' });
    } else if (deleteType === 'template' && selectedTemplate) {
      removeEntity(PM_STORAGE_KEYS.PROJECT_TEMPLATES, selectedTemplate.id);
      setProjectTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));
      toast({ title: 'Template Deleted', description: 'Template has been deleted.', variant: 'destructive' });
    } else if (deleteType === 'objective' && selectedObjective) {
      removeEntity(PM_STORAGE_KEYS.PROJECT_OBJECTIVES, selectedObjective.id);
      setProjectObjectives(prev => prev.filter(o => o.id !== selectedObjective.id));
      toast({ title: 'Objective Deleted', description: 'Objective has been deleted.', variant: 'destructive' });
    } else if (deleteType === 'milestone' && selectedMilestone) {
      removeEntity(PM_STORAGE_KEYS.PROJECT_MILESTONES, selectedMilestone.id);
      setMilestones(prev => prev.filter(m => m.id !== selectedMilestone.id));
      toast({ title: 'Milestone Deleted', description: 'Milestone has been deleted.', variant: 'destructive' });
    }
    setIsDeleteDialogOpen(false);
    setSelectedPlan(null);
    setSelectedTemplate(null);
    setSelectedObjective(null);
    setSelectedMilestone(null);
  };

  const planColumns = [
    { key: 'name', header: 'Plan Name', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[value] || 'bg-gray-100'}`}>{value}</span>
    )},
    { key: 'priority', header: 'Priority', sortable: true, render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[value] || 'bg-gray-100'}`}>{value}</span>
    )},
    { key: 'progress', header: 'Progress', sortable: true, render: (value: number) => (
      <div className="w-24">
        <Progress value={value} className="h-2" />
        <div className="text-xs text-right mt-1">{value}%</div>
      </div>
    )},
    { key: 'estimatedCost', header: 'Budget', sortable: true, render: (value: number) => formatCurrency(value) },
    { key: 'projectManager', header: 'Manager', sortable: true },
    { key: 'startDate', header: 'Start Date', sortable: true, render: (value: string) => formatDate(value) },
    { key: 'endDate', header: 'End Date', sortable: true, render: (value: string) => formatDate(value) },
  ];

  const planFormFields = [
    { name: 'name', label: 'Plan Name', type: 'text' as const, required: true, placeholder: 'Enter plan name' },
    { name: 'description', label: 'Description', type: 'textarea' as const, rows: 3, placeholder: 'Enter description' },
    { name: 'status', label: 'Status', type: 'select' as const, required: true, options: [
      { label: 'Draft', value: 'Draft' }, { label: 'In Review', value: 'In Review' },
      { label: 'Approved', value: 'Approved' }, { label: 'Active', value: 'Active' },
      { label: 'On Hold', value: 'On Hold' }, { label: 'Completed', value: 'Completed' }, { label: 'Cancelled', value: 'Cancelled' }
    ]},
    { name: 'priority', label: 'Priority', type: 'select' as const, required: true, options: [
      { label: 'Low', value: 'Low' }, { label: 'Medium', value: 'Medium' },
      { label: 'High', value: 'High' }, { label: 'Critical', value: 'Critical' }
    ]},
    { name: 'startDate', label: 'Start Date', type: 'date' as const, required: true },
    { name: 'endDate', label: 'End Date', type: 'date' as const, required: true },
    { name: 'projectManager', label: 'Project Manager', type: 'text' as const, required: true, placeholder: 'Enter manager name' },
    { name: 'sponsor', label: 'Sponsor', type: 'text' as const, placeholder: 'Enter sponsor name' },
    { name: 'estimatedCost', label: 'Estimated Cost', type: 'currency' as const, placeholder: 'Enter budget' },
  ];

  const templateFormFields = [
    { name: 'name', label: 'Template Name', type: 'text' as const, required: true, placeholder: 'Enter template name' },
    { name: 'type', label: 'Type', type: 'select' as const, options: [
      { label: 'Standard', value: 'Standard' }, { label: 'Agile', value: 'Agile' },
      { label: 'Waterfall', value: 'Waterfall' }, { label: 'Hybrid', value: 'Hybrid' }
    ]},
    { name: 'duration', label: 'Duration', type: 'text' as const, placeholder: 'e.g., 3 months' },
    { name: 'complexity', label: 'Complexity', type: 'select' as const, options: [
      { label: 'Low', value: 'Low' }, { label: 'Medium', value: 'Medium' }, { label: 'High', value: 'High' }
    ]},
    { name: 'industry', label: 'Industry', type: 'text' as const, placeholder: 'e.g., IT, Manufacturing' },
    { name: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
  ];

  const objectiveFormFields = [
    { name: 'title', label: 'Objective Title', type: 'text' as const, required: true, placeholder: 'Enter objective' },
    { name: 'description', label: 'Description', type: 'textarea' as const, rows: 3 },
    { name: 'projectId', label: 'Project ID', type: 'text' as const, placeholder: 'Enter project ID' },
    { name: 'targetDate', label: 'Target Date', type: 'date' as const },
    { name: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Not Started', value: 'Not Started' }, { label: 'In Progress', value: 'In Progress' },
      { label: 'Completed', value: 'Completed' }
    ]},
    { name: 'progress', label: 'Progress %', type: 'number' as const, placeholder: '0-100' },
  ];

  const milestoneFormFields = [
    { name: 'name', label: 'Milestone Name', type: 'text' as const, required: true, placeholder: 'Enter milestone name' },
    { name: 'description', label: 'Description', type: 'textarea' as const, rows: 2 },
    { name: 'projectId', label: 'Project ID', type: 'text' as const, placeholder: 'Enter project ID' },
    { name: 'dueDate', label: 'Due Date', type: 'date' as const, required: true },
    { name: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Pending', value: 'Pending' }, { label: 'Completed', value: 'Completed' },
      { label: 'Delayed', value: 'Delayed' }
    ]},
  ];

  const viewFields = [
    { key: 'planId', label: 'Plan ID' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status', render: (v: string) => <span className={`px-2 py-1 rounded-full text-xs ${statusColors[v]}`}>{v}</span> },
    { key: 'priority', label: 'Priority', render: (v: string) => <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[v]}`}>{v}</span> },
    { key: 'progress', label: 'Progress', render: (v: number) => `${v}%` },
    { key: 'estimatedCost', label: 'Budget', render: (v: number) => formatCurrency(v) },
    { key: 'actualCost', label: 'Actual Cost', render: (v: number) => formatCurrency(v) },
    { key: 'projectManager', label: 'Project Manager' },
    { key: 'sponsor', label: 'Sponsor' },
    { key: 'startDate', label: 'Start Date', render: (v: string) => formatDate(v) },
    { key: 'endDate', label: 'End Date', render: (v: string) => formatDate(v) },
    { key: 'createdAt', label: 'Created', render: (v: string) => formatDate(v) },
    { key: 'updatedAt', label: 'Updated', render: (v: string) => formatDate(v) },
  ];

  const totalBudget = projectPlans.reduce((sum, p) => sum + (p.estimatedCost || 0), 0);
  const activePlans = projectPlans.filter(p => p.status === 'Active').length;
  const criticalPlans = projectPlans.filter(p => p.priority === 'Critical').length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/project-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Project Planning"
          description="Create and manage project plans"
          voiceIntroduction="Welcome to Project Planning management."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard title="Total Plans" value={projectPlans.length} icon={<FileText className="h-5 w-5 md:h-6 md:w-6" />} />
        <StatCard title="Active Projects" value={activePlans} icon={<Target className="h-5 w-5 md:h-6 md:w-6" />} />
        <StatCard title="Critical Priority" value={criticalPlans} icon={<AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />} subtitle="High attention needed" />
        <StatCard title="Total Budget" value={formatCurrency(totalBudget)} icon={<Calendar className="h-5 w-5 md:h-6 md:w-6" />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="planning" className="space-y-6">
          <Card className="p-4 md:p-6">
            <EnhancedCRUDTable
              data={filteredPlans}
              columns={planColumns}
              title="Project Plans"
              searchPlaceholder="Search plans..."
              pageSize={10}
              onCreate={handleCreatePlan}
              onEdit={handleEditPlan}
              onView={handleViewPlan}
              onDelete={handleDeletePlan}
            />
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Templates</h3>
              <Button onClick={handleCreateTemplate}><Plus className="h-4 w-4 mr-2" />Add Template</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectTemplates.slice(0, 30).map((template) => (
                <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{template.type}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{template.complexity}</Badge>
                        <Badge variant="secondary">{template.duration}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEditTemplate(template)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteTemplate(template)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="objectives" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Objectives</h3>
              <Button onClick={handleCreateObjective}><Plus className="h-4 w-4 mr-2" />Add Objective</Button>
            </div>
            <div className="space-y-4">
              {filteredObjectives.slice(0, 30).map((obj) => (
                <div key={obj.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{obj.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{obj.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Project: {obj.projectId} • Target: {formatDate(obj.targetDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={obj.status === 'Completed' ? 'default' : 'secondary'}>{obj.status}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => handleEditObjective(obj)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteObjective(obj)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                  <Progress value={obj.progress} className="h-2 mt-3" />
                  <p className="text-xs text-gray-500 mt-1">Progress: {obj.progress}%</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <Card className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Milestones</h3>
              <Button onClick={handleCreateMilestone}><Plus className="h-4 w-4 mr-2" />Add Milestone</Button>
            </div>
            <div className="space-y-4">
              {filteredMilestones.slice(0, 30).map((ms) => (
                <div key={ms.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{ms.name}</h4>
                    <p className="text-sm text-gray-500">Project: {ms.projectId} • Due: {formatDate(ms.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ms.status === 'Completed' ? 'default' : ms.status === 'Delayed' ? 'destructive' : 'secondary'}>{ms.status}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => handleEditMilestone(ms)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteMilestone(ms)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Dialog */}
      <CRUDDialog
        open={isPlanDialogOpen}
        onOpenChange={setIsPlanDialogOpen}
        title={isEditing ? 'Edit Project Plan' : 'Create Project Plan'}
        item={selectedPlan}
        onSave={handleSavePlan}
        fields={planFormFields}
        isEdit={isEditing}
      />

      {/* Template Dialog */}
      <CRUDDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        title={isEditing ? 'Edit Template' : 'Create Template'}
        item={selectedTemplate}
        onSave={handleSaveTemplate}
        fields={templateFormFields}
        isEdit={isEditing}
      />

      {/* Objective Dialog */}
      <CRUDDialog
        open={isObjectiveDialogOpen}
        onOpenChange={setIsObjectiveDialogOpen}
        title={isEditing ? 'Edit Objective' : 'Create Objective'}
        item={selectedObjective}
        onSave={handleSaveObjective}
        fields={objectiveFormFields}
        isEdit={isEditing}
      />

      {/* Milestone Dialog */}
      <CRUDDialog
        open={isMilestoneDialogOpen}
        onOpenChange={setIsMilestoneDialogOpen}
        title={isEditing ? 'Edit Milestone' : 'Create Milestone'}
        item={selectedMilestone}
        onSave={handleSaveMilestone}
        fields={milestoneFormFields}
        isEdit={isEditing}
      />

      {/* View Dialog */}
      <ViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        title="Project Plan"
        item={selectedPlan}
        fields={viewFields}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={`Delete ${deleteType === 'plan' ? 'Project Plan' : deleteType === 'template' ? 'Template' : deleteType === 'objective' ? 'Objective' : 'Milestone'}`}
        description={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ProjectPlanning;
