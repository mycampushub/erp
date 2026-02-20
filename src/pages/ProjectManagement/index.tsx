
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import SAPSection from '../../components/SAPSection';
import ProjectOverview from './components/ProjectOverview';
import ProjectResources from './components/ProjectResources';
import ProjectAnalytics from './components/ProjectAnalytics';
import { Calendar, ClipboardList, Users, BarChart3, Clock, Briefcase, CheckSquare, Settings, Plus, Edit, Eye, Trash2, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { Project, Task, Resource, PM_STORAGE_KEYS } from '../../lib/projectManagement/types';
import { ConfirmDialog, formatCurrency, formatDate } from '../../lib/projectManagement/CRUDComponents';

const ProjectManagement: React.FC = () => {
  const { isEnabled } = useVoiceAssistantContext();
  const { speak, stop } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProject, setNewProject] = useState({
    name: '', manager: '', sponsor: '', status: 'Planning' as string,
    startDate: '', endDate: '', budget: 0, description: '', priority: 'Medium' as string
  });
  const [newTask, setNewTask] = useState({
    name: '', projectId: '', assigneeName: '', dueDate: '', priority: 'Medium' as string,
    status: 'Not Started' as string, description: '', estimatedHours: 0
  });

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    const loadedProjects = listEntities<Project>(PM_STORAGE_KEYS.PROJECTS);
    const loadedTasks = listEntities<Task>(PM_STORAGE_KEYS.TASKS);
    const loadedResources = listEntities<Resource>(PM_STORAGE_KEYS.RESOURCES);
    setProjects(loadedProjects.length > 0 ? loadedProjects : getDefaultProjects());
    setTasks(loadedTasks.length > 0 ? loadedTasks : getDefaultTasks());
    setResources(loadedResources.length > 0 ? loadedResources : getDefaultResources());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isEnabled) {
      stop();
      speak(`Welcome to the Project Management module. Here you can plan, execute, and monitor your projects effectively. 
      This module provides tools for resource planning, task management, and project tracking. You can see your active 
      projects, manage resources, and analyze project performance metrics all in one place.`);
    }
    loadData();
  }, [isEnabled, speak, stop, loadData]);
  
  const getDefaultProjects = (): Project[] => [
    { id: 'prj-001', projectId: 'PRJ-2023-001', name: 'ERP Implementation', description: 'Implementation of SAP S/4HANA ERP system', status: 'Active', progress: 65, startDate: '2025-01-15', endDate: '2025-06-30', budget: 350000, actualCost: 218500, manager: 'Maria Rodriguez', sponsor: 'CEO', team: [], priority: 'High', createdAt: '2025-01-15' },
    { id: 'prj-002', projectId: 'PRJ-2023-008', name: 'Warehouse Expansion', description: 'Expansion of warehouse facilities', status: 'Active', progress: 42, startDate: '2025-03-01', endDate: '2025-09-15', budget: 2800000, actualCost: 1155000, manager: 'Thomas Schmidt', sponsor: 'COO', team: [], priority: 'High', createdAt: '2025-03-01' },
    { id: 'prj-003', projectId: 'PRJ-2023-012', name: 'Quality System Upgrade', description: 'ISO 9001 certification and quality improvements', status: 'On Hold', progress: 28, startDate: '2025-02-15', endDate: '2025-05-30', budget: 180000, actualCost: 85400, manager: 'Elena Martinez', sponsor: 'CFO', team: [], priority: 'Critical', createdAt: '2025-02-15' },
    { id: 'prj-004', projectId: 'PRJ-2023-015', name: 'New Product Development', description: 'Development of new product line', status: 'On Hold', progress: 18, startDate: '2025-04-01', endDate: '2025-12-15', budget: 650000, actualCost: 124000, manager: 'James Wilson', sponsor: 'CTO', team: [], priority: 'Medium', createdAt: '2025-04-01' },
    { id: 'prj-005', projectId: 'PRJ-2023-022', name: 'Digital Marketing Campaign', description: 'Q2 digital marketing initiatives', status: 'Active', progress: 78, startDate: '2025-03-15', endDate: '2025-06-01', budget: 120000, actualCost: 94500, manager: 'Sophie Mueller', sponsor: 'CMO', team: [], priority: 'Medium', createdAt: '2025-03-15' }
  ];

  const getDefaultTasks = (): Task[] => [
    { id: 'tsk-001', taskId: 'TASK-1235', name: 'System Configuration', projectId: 'PRJ-2023-001', assigneeId: 'emp-001', assigneeName: 'Emma Wilson', dueDate: '2025-05-28', priority: 'High', status: 'In Progress', completed: false, description: '', estimatedHours: 40, actualHours: 25 },
    { id: 'tsk-002', taskId: 'TASK-1236', name: 'Data Migration', projectId: 'PRJ-2023-001', assigneeId: 'emp-002', assigneeName: 'Michael Brown', dueDate: '2025-06-10', priority: 'Medium', status: 'Not Started', completed: false, description: '', estimatedHours: 80, actualHours: 0 },
    { id: 'tsk-003', taskId: 'TASK-1240', name: 'Concrete Foundation', projectId: 'PRJ-2023-008', assigneeId: 'emp-003', assigneeName: 'Frank Miller', dueDate: '2025-05-25', priority: 'High', status: 'In Progress', completed: false, description: '', estimatedHours: 120, actualHours: 60 },
    { id: 'tsk-004', taskId: 'TASK-1245', name: 'Quality Manual Update', projectId: 'PRJ-2023-012', assigneeId: 'emp-004', assigneeName: 'Sarah Davis', dueDate: '2025-05-22', priority: 'Critical', status: 'Completed', completed: true, description: '', estimatedHours: 20, actualHours: 22 },
    { id: 'tsk-005', taskId: 'TASK-1252', name: 'Social Media Strategy', projectId: 'PRJ-2023-022', assigneeId: 'emp-005', assigneeName: 'Paul Johnson', dueDate: '2025-05-24', priority: 'Medium', status: 'Completed', completed: true, description: '', estimatedHours: 30, actualHours: 28 }
  ];

  const getDefaultResources = (): Resource[] => [
    { id: 'res-001', resourceId: 'EMP-1001', name: 'John Smith', role: 'Project Manager', department: 'Operations', email: 'john.smith@company.com', phone: '+1-555-0101', availability: 30, utilization: 85, skills: ['PM', 'Agile', 'Scrum'], costRate: 150, costCurrency: 'USD', status: 'Active', hireDate: '2020-01-15' },
    { id: 'res-002', resourceId: 'EMP-1028', name: 'Emma Wilson', role: 'System Architect', department: 'IT', email: 'emma.wilson@company.com', phone: '+1-555-0102', availability: 0, utilization: 95, skills: ['SAP', 'Architecture', 'Integration'], costRate: 175, costCurrency: 'USD', status: 'Active', hireDate: '2019-06-20' },
    { id: 'res-003', resourceId: 'EMP-1045', name: 'Michael Brown', role: 'Data Engineer', department: 'IT', email: 'michael.brown@company.com', phone: '+1-555-0103', availability: 15, utilization: 88, skills: ['SQL', 'ETL', 'Python'], costRate: 130, costCurrency: 'USD', status: 'Active', hireDate: '2021-03-10' },
    { id: 'res-004', resourceId: 'EMP-1062', name: 'Sarah Davis', role: 'Quality Specialist', department: 'Quality', email: 'sarah.davis@company.com', phone: '+1-555-0104', availability: 60, utilization: 45, skills: ['ISO', 'QA', 'Auditing'], costRate: 110, costCurrency: 'USD', status: 'Active', hireDate: '2020-08-05' },
    { id: 'res-005', resourceId: 'EMP-1078', name: 'Robert Chen', role: 'Technical Lead', department: 'IT', email: 'robert.chen@company.com', phone: '+1-555-0105', availability: 25, utilization: 92, skills: ['Java', 'Spring', 'Microservices'], costRate: 160, costCurrency: 'USD', status: 'Active', hireDate: '2018-11-20' },
    { id: 'res-006', resourceId: 'EMP-1084', name: 'Frank Miller', role: 'Construction Engineer', department: 'Engineering', email: 'frank.miller@company.com', phone: '+1-555-0106', availability: 0, utilization: 78, skills: ['Civil', 'Construction', 'CAD'], costRate: 140, costCurrency: 'USD', status: 'Active', hireDate: '2019-04-15' }
  ];

  useEffect(() => {
    if (projects.length === 0) {
      const defaults = getDefaultProjects();
      defaults.forEach(p => upsertEntity(PM_STORAGE_KEYS.PROJECTS, p));
      setProjects(defaults);
    }
  }, [projects.length]);

  useEffect(() => {
    if (tasks.length === 0) {
      const defaults = getDefaultTasks();
      defaults.forEach(t => upsertEntity(PM_STORAGE_KEYS.TASKS, t));
      setTasks(defaults);
    }
  }, [tasks.length]);

  useEffect(() => {
    if (resources.length === 0) {
      const defaults = getDefaultResources();
      defaults.forEach(r => upsertEntity(PM_STORAGE_KEYS.RESOURCES, r));
      setResources(defaults);
    }
  }, [resources.length]);
  
  const handleNavigateToProject = (projectId: string) => {
    navigate(`/project-management/project/${projectId}`);
  };
  
  const handleCreateProject = () => {
    setNewProject({ name: '', manager: '', sponsor: '', status: 'Planning', startDate: '', endDate: '', budget: 0, description: '', priority: 'Medium' });
    setIsCreateDialogOpen(true);
  };

  const handleSaveProject = () => {
    const newProj: Project = {
      id: generateId('prj'),
      projectId: `PRJ-${String(projects.length + 1).padStart(3, '0')}`,
      name: newProject.name,
      description: newProject.description,
      status: newProject.status as any,
      progress: 0,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      budget: newProject.budget,
      actualCost: 0,
      manager: newProject.manager,
      sponsor: newProject.sponsor,
      team: [],
      priority: newProject.priority as any,
      createdAt: new Date().toISOString()
    };
    upsertEntity(PM_STORAGE_KEYS.PROJECTS, newProj);
    setProjects(prev => [newProj, ...prev]);
    toast({ title: 'Project Created', description: `Project "${newProj.name}" has been created.` });
    setIsCreateDialogOpen(false);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setNewProject({
      name: project.name,
      manager: project.manager,
      sponsor: project.sponsor,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      description: project.description,
      priority: project.priority
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = () => {
    if (selectedProject) {
      const updated: Project = {
        ...selectedProject,
        ...newProject,
        status: newProject.status as any,
        priority: newProject.priority as any
      };
      upsertEntity(PM_STORAGE_KEYS.PROJECTS, updated);
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updated : p));
      toast({ title: 'Project Updated', description: `Project "${updated.name}" has been updated.` });
      setIsEditDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProject = () => {
    if (selectedProject) {
      removeEntity(PM_STORAGE_KEYS.PROJECTS, selectedProject.id);
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      toast({ title: 'Project Deleted', description: `Project "${selectedProject.name}" has been deleted.`, variant: 'destructive' });
    }
    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const handleCreateTask = () => {
    setNewTask({ name: '', projectId: '', assigneeName: '', dueDate: '', priority: 'Medium', status: 'Not Started', description: '', estimatedHours: 0 });
    setIsCreateTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    const newTsk: Task = {
      id: generateId('tsk'),
      taskId: `TASK-${String(tasks.length + 1).padStart(4, '0')}`,
      name: newTask.name,
      description: newTask.description,
      projectId: newTask.projectId || projects[0]?.projectId || '',
      assigneeId: generateId('emp'),
      assigneeName: newTask.assigneeName,
      dueDate: newTask.dueDate,
      priority: newTask.priority as any,
      status: newTask.status as any,
      completed: newTask.status === 'Completed',
      estimatedHours: newTask.estimatedHours,
      actualHours: 0
    };
    upsertEntity(PM_STORAGE_KEYS.TASKS, newTsk);
    setTasks(prev => [newTsk, ...prev]);
    toast({ title: 'Task Created', description: `Task "${newTsk.name}" has been created.` });
    setIsCreateTaskDialogOpen(false);
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.manager?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assigneeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const projectColumns = [
    { 
      key: "name", 
      header: "Project Name",
      render: (value: string, row: Project) => (
        <span className="text-blue-600 underline cursor-pointer font-medium" onClick={() => handleNavigateToProject(row.projectId)}>
          {value}
        </span>
      )
    },
    { key: "projectId", header: "Project ID" },
    { key: "manager", header: "Project Manager" },
    { 
      key: "status", 
      header: "Status",
      render: (value: string) => (
        <Badge variant={value === 'In Progress' ? 'outline' : value === 'At Risk' ? 'destructive' : value === 'On Hold' ? 'secondary' : value === 'Completed' ? 'default' : 'outline'}>
          {value}
        </Badge>
      )
    },
    { 
      key: "progress", 
      header: "Progress",
      render: (value: number) => (
        <div className="w-24">
          <Progress value={value} className="h-2" />
          <div className="text-xs text-right mt-1">{value}%</div>
        </div>
      )
    },
    { 
      key: "budget", 
      header: "Budget",
      render: (value: number) => formatCurrency(value)
    },
    { key: "endDate", header: "Due Date", render: (v: string) => formatDate(v) },
    { 
      key: "actions", 
      header: "Actions",
      render: (_: any, row: Project) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleNavigateToProject(row.projectId)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditProject(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(row)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
        </div>
      )
    }
  ];
  
  const taskColumns = [
    { key: "taskId", header: "Task ID" },
    { key: "name", header: "Task Name" },
    { key: "projectId", header: "Project" },
    { key: "assigneeName", header: "Assignee" },
    { 
      key: "priority", 
      header: "Priority",
      render: (value: string) => (
        <Badge variant={value === 'Critical' ? 'destructive' : value === 'High' ? 'default' : value === 'Medium' ? 'secondary' : 'outline'}>
          {value}
        </Badge>
      )
    },
    { 
      key: "status", 
      header: "Status",
      render: (value: string) => (
        <Badge variant={value === 'Completed' ? 'default' : value === 'Overdue' ? 'destructive' : value === 'In Progress' ? 'outline' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    { key: "dueDate", header: "Due Date", render: (v: string) => formatDate(v) }
  ];
  
  const resourceColumns = [
    { key: "name", header: "Name" },
    { key: "role", header: "Role" },
    { key: "department", header: "Department" },
    { 
      key: "availability", 
      header: "Availability",
      render: (value: number) => (
        <div className="w-20">
          <Progress value={value} className="h-2" />
          <div className="text-xs text-right mt-1">{value}%</div>
        </div>
      )
    },
    { 
      key: "utilization", 
      header: "Utilization",
      render: (value: number) => (
        <Badge variant={value > 90 ? 'destructive' : value > 75 ? 'default' : 'secondary'}>{value}%</Badge>
      )
    },
    { key: "email", header: "Email" }
  ];

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const avgUtilization = resources.length > 0 ? Math.round(resources.reduce((sum, r) => sum + r.utilization, 0) / resources.length) : 0;
  
  return (
    <div>
      <PageHeader 
        title="Project Management" 
        voiceIntroduction="Welcome to the Project Management module. Here you can plan, execute, and monitor your projects effectively."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Active Projects</span>
                </div>
                <div className="text-2xl font-bold mt-2">{activeProjects}</div>
                <div className="text-xs text-muted-foreground mt-1">{projects.filter(p => p.status === 'On Hold').length} projects on hold</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  <span>Open Tasks</span>
                </div>
                <div className="text-2xl font-bold mt-2">{totalTasks - completedTasks}</div>
                <div className="text-xs text-muted-foreground mt-1">{completedTasks} completed</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Team Utilization</span>
                </div>
                <div className="text-2xl font-bold mt-2">{avgUtilization}%</div>
                <div className="text-xs text-amber-600 mt-1">{avgUtilization > 75 ? 'Near capacity' : 'Within limits'}</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex flex-col">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Total Budget</span>
                </div>
                <div className="text-2xl font-bold mt-2">{formatCurrency(totalBudget)}</div>
                <div className="text-xs text-green-600 mt-1">{projects.length} projects</div>
              </div>
            </Card>
          </div>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Active Projects</h3>
              <div className="flex gap-2">
                <Input placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64" />
                <Button onClick={handleCreateProject}><Plus className="h-4 w-4 mr-2" />Create Project</Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <DataTable columns={projectColumns} data={filteredProjects.slice(0, 5)} className="border rounded-md" />
            )}
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Tasks</h3>
                <Button variant="outline" size="sm" onClick={handleCreateTask}><Plus className="h-4 w-4 mr-2" />Add Task</Button>
              </div>
              
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <DataTable columns={taskColumns} data={filteredTasks.slice(0, 5)} className="border rounded-md" />
              )}
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Analytics</h3>
              <ProjectAnalytics />
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="projects">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold">Project Overview</h2>
              </div>
              
              <div className="space-y-3">
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center" onClick={handleCreateProject}>
                  <span className="w-6 h-6 mr-2 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs">+</span>
                  Create Project
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Active Projects ({activeProjects})
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Project Templates
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Archive
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <CheckSquare className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold">Tasks</h2>
              </div>
              
              <div className="space-y-3">
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium flex items-center" onClick={handleCreateTask}>
                  <span className="w-6 h-6 mr-2 flex items-center justify-center bg-purple-100 text-purple-700 rounded-full text-xs">+</span>
                  Create Task
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Task Management
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Task Types
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Task Templates
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">Project Settings</h2>
              </div>
              
              <div className="space-y-3">
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Project Types
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Status Definitions
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Priority Settings
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Approval Workflows
                </button>
              </div>
            </div>
          </div>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">All Projects</h3>
              <div className="flex gap-2">
                <Input placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64" />
                <Button variant="outline">Export</Button>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <DataTable columns={projectColumns} data={filteredProjects} className="border rounded-md" />
            )}
          </Card>
          
          <SAPSection title="Project Portfolio" isVoiceAssistantEnabled={isEnabled}>
            <div className="col-span-full">
              <ProjectOverview />
            </div>
          </SAPSection>
        </TabsContent>
        
        <TabsContent value="resources">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Availability</h3>
              
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <DataTable columns={resourceColumns} data={resources} className="border rounded-md" />
              )}
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resource Allocation</h3>
              <ProjectResources />
              
              <div className="mt-6 grid grid-cols-1 gap-4">
                <Button variant="outline" className="w-full">View Resource Calendar</Button>
                <Button variant="outline" className="w-full">Resource Management</Button>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resource Planning</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Plan and allocate resources to your projects efficiently.
              </p>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Team Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Resource Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Capacity Planning
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Time Recording</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track time spent on project activities.
              </p>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Time Sheets
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Activity Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Time Recording Settings
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resource Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze resource utilization and performance.
              </p>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Utilization Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Skills Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Availability Forecast
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="schedule">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold">Schedule</h2>
              </div>
              
              <div className="space-y-3">
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Project Timeline
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Milestones
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Task Management
                </button>
                <button className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm font-medium">
                  Gantt Chart
                </button>
              </div>
            </div>
            
            <Card className="p-6 col-span-2 flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Important Milestones</h3>
              
              <div className="flex-grow space-y-4">
                {projects.filter(p => p.status === 'Active').slice(0, 5).map((proj, idx) => (
                  <div key={proj.id} className={`border-l-4 pl-4 py-1 ${idx === 0 ? 'border-amber-500' : idx === 1 ? 'border-blue-500' : idx === 2 ? 'border-green-500' : 'border-gray-300'}`}>
                    <div className="flex justify-between">
                      <p className="font-medium">{proj.name}</p>
                      <Badge variant={proj.progress > 50 ? 'default' : proj.progress > 25 ? 'secondary' : 'outline'}>{proj.progress}% Complete</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Due: {formatDate(proj.endDate)}</p>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="mt-4">View All Milestones</Button>
            </Card>
          </div>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Project Timeline</h3>
              <div className="flex gap-2">
                <Button variant="outline">Today</Button>
                <Button variant="outline">Week</Button>
                <Button variant="outline">Month</Button>
                <Button variant="outline">Quarter</Button>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="text-center text-gray-500">
                <p>Gantt chart visualization would appear here in a real application</p>
                <p className="text-sm mt-2">Timeline view with project phases, tasks, and dependencies</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Name *</Label>
              <Input value={newProject.name} onChange={e => setNewProject(p => ({...p, name: e.target.value}))} placeholder="Enter project name" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={newProject.description} onChange={e => setNewProject(p => ({...p, description: e.target.value}))} placeholder="Enter description" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Project Manager *</Label>
                <Input value={newProject.manager} onChange={e => setNewProject(p => ({...p, manager: e.target.value}))} placeholder="Manager name" />
              </div>
              <div>
                <Label>Sponsor</Label>
                <Input value={newProject.sponsor} onChange={e => setNewProject(p => ({...p, sponsor: e.target.value}))} placeholder="Sponsor name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Priority</Label>
                <select className="w-full h-10 px-3 border rounded-md" value={newProject.priority} onChange={e => setNewProject(p => ({...p, priority: e.target.value}))}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select className="w-full h-10 px-3 border rounded-md" value={newProject.status} onChange={e => setNewProject(p => ({...p, status: e.target.value}))}>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={newProject.startDate} onChange={e => setNewProject(p => ({...p, startDate: e.target.value}))} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={newProject.endDate} onChange={e => setNewProject(p => ({...p, endDate: e.target.value}))} />
              </div>
            </div>
            <div>
              <Label>Budget</Label>
              <Input type="number" value={newProject.budget} onChange={e => setNewProject(p => ({...p, budget: Number(e.target.value)}))} placeholder="0" />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProject} disabled={!newProject.name || !newProject.manager}>Create Project</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Name *</Label>
              <Input value={newProject.name} onChange={e => setNewProject(p => ({...p, name: e.target.value}))} placeholder="Enter project name" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={newProject.description} onChange={e => setNewProject(p => ({...p, description: e.target.value}))} placeholder="Enter description" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Project Manager *</Label>
                <Input value={newProject.manager} onChange={e => setNewProject(p => ({...p, manager: e.target.value}))} placeholder="Manager name" />
              </div>
              <div>
                <Label>Sponsor</Label>
                <Input value={newProject.sponsor} onChange={e => setNewProject(p => ({...p, sponsor: e.target.value}))} placeholder="Sponsor name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Priority</Label>
                <select className="w-full h-10 px-3 border rounded-md" value={newProject.priority} onChange={e => setNewProject(p => ({...p, priority: e.target.value}))}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select className="w-full h-10 px-3 border rounded-md" value={newProject.status} onChange={e => setNewProject(p => ({...p, status: e.target.value}))}>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={newProject.startDate} onChange={e => setNewProject(p => ({...p, startDate: e.target.value}))} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={newProject.endDate} onChange={e => setNewProject(p => ({...p, endDate: e.target.value}))} />
              </div>
            </div>
            <div>
              <Label>Budget</Label>
              <Input type="number" value={newProject.budget} onChange={e => setNewProject(p => ({...p, budget: Number(e.target.value)}))} placeholder="0" />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateProject} disabled={!newProject.name || !newProject.manager}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Name *</Label>
              <Input value={newTask.name} onChange={e => setNewTask(p => ({...p, name: e.target.value}))} placeholder="Enter task name" />
            </div>
            <div>
              <Label>Project</Label>
              <select className="w-full h-10 px-3 border rounded-md" value={newTask.projectId} onChange={e => setNewTask(p => ({...p, projectId: e.target.value}))}>
                <option value="">Select project...</option>
                {projects.map(p => <option key={p.id} value={p.projectId}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Assignee</Label>
              <Input value={newTask.assigneeName} onChange={e => setNewTask(p => ({...p, assigneeName: e.target.value}))} placeholder="Assignee name" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Priority</Label>
                <select className="w-full h-10 px-3 border rounded-md" value={newTask.priority} onChange={e => setNewTask(p => ({...p, priority: e.target.value}))}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select className="w-full h-10 px-3 border rounded-md" value={newTask.status} onChange={e => setNewTask(p => ({...p, status: e.target.value}))}>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({...p, dueDate: e.target.value}))} />
              </div>
              <div>
                <Label>Estimated Hours</Label>
                <Input type="number" value={newTask.estimatedHours} onChange={e => setNewTask(p => ({...p, estimatedHours: Number(e.target.value)}))} placeholder="0" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={newTask.description} onChange={e => setNewTask(p => ({...p, description: e.target.value}))} placeholder="Task description" />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsCreateTaskDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTask} disabled={!newTask.name}>Create Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        description={`Are you sure you want to delete "${selectedProject?.name}"? This action cannot be undone and will remove all associated tasks.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ProjectManagement;
