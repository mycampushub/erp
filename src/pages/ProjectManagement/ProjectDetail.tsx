
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ArrowLeft, Calendar, Users, Target, FileText, AlertTriangle, Clock, Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { Project, Task, Risk, Activity, PM_STORAGE_KEYS } from '../../lib/projectManagement/types';
import { ConfirmDialog, formatCurrency, formatDate } from '../../lib/projectManagement/CRUDComponents';

const ProjectDetail: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isRiskDialogOpen, setIsRiskDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [deleteType, setDeleteType] = useState<'task' | 'risk'>('task');
  
  const [newTask, setNewTask] = useState({
    name: '', description: '', assigneeName: '', dueDate: '', priority: 'Medium' as string, status: 'Not Started' as string, estimatedHours: 0
  });
  const [newRisk, setNewRisk] = useState({
    title: '', description: '', category: 'Technical' as string, probability: 'Medium' as string, impact: 'Medium' as string, owner: '', dueDate: ''
  });
  const [editProject, setEditProject] = useState({
    name: '', description: '', manager: '', sponsor: '', status: '', priority: '', startDate: '', endDate: '', budget: 0, progress: 0
  });

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    
    const allProjects = listEntities<Project>(PM_STORAGE_KEYS.PROJECTS);
    const foundProject = allProjects.find(p => p.projectId === projectId);
    
    if (foundProject) {
      setProject(foundProject);
      setEditProject({
        name: foundProject.name,
        description: foundProject.description,
        manager: foundProject.manager,
        sponsor: foundProject.sponsor,
        status: foundProject.status,
        priority: foundProject.priority,
        startDate: foundProject.startDate,
        endDate: foundProject.endDate,
        budget: foundProject.budget,
        progress: foundProject.progress
      });
    } else {
      const defaultProject: Project = {
        id: 'prj-001',
        projectId: projectId || 'PRJ-2023-001',
        name: 'ERP Implementation',
        description: 'Implementation of SAP S/4HANA ERP system',
        status: 'Active',
        progress: 65,
        startDate: '2025-01-15',
        endDate: '2025-06-30',
        budget: 350000,
        actualCost: 218500,
        manager: 'Maria Rodriguez',
        sponsor: 'CEO',
        team: ['John Smith', 'Emma Wilson', 'Michael Brown'],
        priority: 'High',
        createdAt: '2025-01-15'
      };
      setProject(defaultProject);
      upsertEntity(PM_STORAGE_KEYS.PROJECTS, defaultProject);
    }

    const allTasks = listEntities<Task>(PM_STORAGE_KEYS.TASKS);
    const projectTasks = allTasks.filter(t => t.projectId === projectId);
    setTasks(projectTasks.length > 0 ? projectTasks : getDefaultTasks());

    const allRisks = listEntities<Risk>(PM_STORAGE_KEYS.RISKS);
    const projectRisks = allRisks.filter(r => r.projectId === projectId);
    setRisks(projectRisks.length > 0 ? projectRisks : getDefaultRisks());

    setActivities(getDefaultActivities());
  }, [projectId]);

  useEffect(() => {
    if (isEnabled && project) {
      speak(`You are viewing the details for project ${project.name}. This project is ${project.status} with ${project.progress}% completion.`);
    }
    loadData();
  }, [isEnabled, speak, project, loadData]);

  const getDefaultTasks = (): Task[] => [
    { id: 'tsk-001', taskId: 'TASK-0001', name: 'Requirements Analysis', projectId: projectId || '', description: 'Analyze business requirements', assigneeId: 'emp-001', assigneeName: 'John Smith', dueDate: '2025-02-15', priority: 'High', status: 'Completed', completed: true, estimatedHours: 40, actualHours: 38 },
    { id: 'tsk-002', taskId: 'TASK-0002', name: 'System Configuration', projectId: projectId || '', description: 'Configure SAP system', assigneeId: 'emp-002', assigneeName: 'Emma Wilson', dueDate: '2025-03-30', priority: 'High', status: 'In Progress', completed: false, estimatedHours: 80, actualHours: 45 },
    { id: 'tsk-003', taskId: 'TASK-0003', name: 'Data Migration', projectId: projectId || '', description: 'Migrate data from legacy systems', assigneeId: 'emp-003', assigneeName: 'Michael Brown', dueDate: '2025-04-15', priority: 'Medium', status: 'In Progress', completed: false, estimatedHours: 120, actualHours: 30 },
    { id: 'tsk-004', taskId: 'TASK-0004', name: 'Integration Testing', projectId: projectId || '', description: 'Test system integrations', assigneeId: 'emp-004', assigneeName: 'Sarah Davis', dueDate: '2025-05-01', priority: 'Medium', status: 'Not Started', completed: false, estimatedHours: 60, actualHours: 0 },
    { id: 'tsk-005', taskId: 'TASK-0005', name: 'User Training', projectId: projectId || '', description: 'Train end users', assigneeId: 'emp-005', assigneeName: 'Robert Chen', dueDate: '2025-05-15', priority: 'Low', status: 'Not Started', completed: false, estimatedHours: 40, actualHours: 0 }
  ];

  const getDefaultRisks = (): Risk[] => [
    { id: 'risk-001', riskId: 'RISK-001', title: 'Data Migration Complexity', description: 'High risk of data inconsistency due to legacy system structure', projectId: projectId || '', category: 'Technical', probability: 'High', impact: 'High', status: 'Open', owner: 'Michael Brown', dueDate: '2025-04-01', createdAt: '2025-01-20' },
    { id: 'risk-002', riskId: 'RISK-002', title: 'Resource Availability', description: 'Key team members have overlapping commitments', projectId: projectId || '', category: 'Resource', probability: 'Medium', impact: 'Medium', status: 'Monitoring', owner: 'Maria Rodriguez', dueDate: '2025-03-15', createdAt: '2025-02-01' },
    { id: 'risk-003', riskId: 'RISK-003', title: 'Integration Challenges', description: 'Potential compatibility issues with CRM system', projectId: projectId || '', category: 'Technical', probability: 'Low', impact: 'High', status: 'Open', owner: 'Emma Wilson', dueDate: '2025-05-01', createdAt: '2025-02-15' }
  ];

  const getDefaultActivities = (): Activity[] => [
    { id: 'act-001', projectId: projectId || '', type: 'Task', description: 'System Configuration Updated', performedBy: 'Emma Wilson', timestamp: '2025-05-20T10:30:00Z', relatedEntity: 'TASK-0002' },
    { id: 'act-002', projectId: projectId || '', type: 'Task', description: 'Requirements Analysis Completed', performedBy: 'John Smith', timestamp: '2025-05-15T14:20:00Z', relatedEntity: 'TASK-0001' },
    { id: 'act-003', projectId: projectId || '', type: 'Risk', description: 'Data Migration Risk Identified', performedBy: 'Michael Brown', timestamp: '2025-05-10T09:15:00Z', relatedEntity: 'RISK-001' },
    { id: 'act-004', projectId: projectId || '', type: 'Milestone', description: 'Project Plan Updated', performedBy: 'Maria Rodriguez', timestamp: '2025-05-05T16:45:00Z', relatedEntity: 'PLAN-001' }
  ];

  useEffect(() => {
    if (tasks.length === 0 && projectId) {
      const defaults = getDefaultTasks();
      defaults.forEach(t => upsertEntity(PM_STORAGE_KEYS.TASKS, t));
      setTasks(defaults);
    }
  }, [tasks.length, projectId]);

  useEffect(() => {
    if (risks.length === 0 && projectId) {
      const defaults = getDefaultRisks();
      defaults.forEach(r => upsertEntity(PM_STORAGE_KEYS.RISKS, r));
      setRisks(defaults);
    }
  }, [risks.length, projectId]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setNewTask({ name: '', description: '', assigneeName: '', dueDate: '', priority: 'Medium', status: 'Not Started', estimatedHours: 0 });
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    const task: Task = {
      id: selectedTask?.id || generateId('tsk'),
      taskId: selectedTask?.taskId || `TASK-${String(tasks.length + 1).padStart(4, '0')}`,
      name: newTask.name,
      description: newTask.description,
      projectId: projectId || '',
      assigneeId: generateId('emp'),
      assigneeName: newTask.assigneeName,
      dueDate: newTask.dueDate,
      priority: newTask.priority as any,
      status: newTask.status as any,
      completed: newTask.status === 'Completed',
      estimatedHours: newTask.estimatedHours,
      actualHours: selectedTask?.actualHours || 0
    };
    upsertEntity(PM_STORAGE_KEYS.TASKS, task);
    if (selectedTask) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      toast({ title: 'Task Updated', description: `Task "${task.name}" has been updated.` });
    } else {
      setTasks(prev => [task, ...prev]);
      toast({ title: 'Task Created', description: `Task "${task.name}" has been created.` });
    }
    setIsTaskDialogOpen(false);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setNewTask({
      name: task.name,
      description: task.description,
      assigneeName: task.assigneeName,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      estimatedHours: task.estimatedHours
    });
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setDeleteType('task');
    setIsDeleteDialogOpen(true);
  };

  const handleCreateRisk = () => {
    setSelectedRisk(null);
    setNewRisk({ title: '', description: '', category: 'Technical', probability: 'Medium', impact: 'Medium', owner: '', dueDate: '' });
    setIsRiskDialogOpen(true);
  };

  const handleSaveRisk = () => {
    const risk: Risk = {
      id: selectedRisk?.id || generateId('risk'),
      riskId: selectedRisk?.riskId || `RISK-${String(risks.length + 1).padStart(3, '0')}`,
      title: newRisk.title,
      description: newRisk.description,
      projectId: projectId || '',
      category: newRisk.category as any,
      probability: newRisk.probability as any,
      impact: newRisk.impact as any,
      status: selectedRisk?.status || 'Open',
      owner: newRisk.owner,
      dueDate: newRisk.dueDate,
      createdAt: selectedRisk?.createdAt || new Date().toISOString()
    };
    upsertEntity(PM_STORAGE_KEYS.RISKS, risk);
    if (selectedRisk) {
      setRisks(prev => prev.map(r => r.id === risk.id ? risk : r));
      toast({ title: 'Risk Updated', description: `Risk "${risk.title}" has been updated.` });
    } else {
      setRisks(prev => [risk, ...prev]);
      toast({ title: 'Risk Created', description: `Risk "${risk.title}" has been created.` });
    }
    setIsRiskDialogOpen(false);
  };

  const handleEditRisk = (risk: Risk) => {
    setSelectedRisk(risk);
    setNewRisk({
      title: risk.title,
      description: risk.description,
      category: risk.category,
      probability: risk.probability,
      impact: risk.impact,
      owner: risk.owner,
      dueDate: risk.dueDate
    });
    setIsRiskDialogOpen(true);
  };

  const handleDeleteRisk = (risk: Risk) => {
    setSelectedRisk(risk);
    setDeleteType('risk');
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteType === 'task' && selectedTask) {
      removeEntity(PM_STORAGE_KEYS.TASKS, selectedTask.id);
      setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
      toast({ title: 'Task Deleted', description: `Task "${selectedTask.name}" has been deleted.`, variant: 'destructive' });
    } else if (deleteType === 'risk' && selectedRisk) {
      removeEntity(PM_STORAGE_KEYS.RISKS, selectedRisk.id);
      setRisks(prev => prev.filter(r => r.id !== selectedRisk.id));
      toast({ title: 'Risk Deleted', description: `Risk "${selectedRisk.title}" has been deleted.`, variant: 'destructive' });
    }
    setIsDeleteDialogOpen(false);
    setSelectedTask(null);
    setSelectedRisk(null);
  };

  const handleSaveProject = () => {
    if (project) {
      const updated: Project = {
        ...project,
        ...editProject,
        status: editProject.status as any,
        priority: editProject.priority as any
      };
      upsertEntity(PM_STORAGE_KEYS.PROJECTS, updated);
      setProject(updated);
      toast({ title: 'Project Updated', description: `Project "${updated.name}" has been updated.` });
      setIsEditProjectOpen(false);
    }
  };

  const handleTaskStatusChange = (task: Task, newStatus: string) => {
    const updated = { ...task, status: newStatus as any, completed: newStatus === 'Completed' };
    upsertEntity(PM_STORAGE_KEYS.TASKS, updated);
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
  };

  if (!project) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const openRisks = risks.filter(r => r.status === 'Open').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/project-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
      </div>

      <PageHeader
        title={project.name}
        description={`Project ID: ${project.projectId}`}
        voiceIntroduction={`You are viewing the details for project ${project.name}. This project is ${project.status} with ${project.progress}% completion.`}
      />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsEditProjectOpen(true)}><Edit className="h-4 w-4 mr-2" />Edit Project</Button>
        <Button variant="outline"><FileText className="h-4 w-4 mr-2" />Documents</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={project.status === 'Completed' ? 'default' : project.status === 'Active' ? 'outline' : project.status === 'On Hold' ? 'secondary' : 'destructive'}>
                    {project.status}
                  </Badge>
                  <span className="text-sm text-gray-500">Project ID: {project.projectId}</span>
                  <Badge variant={project.priority === 'Critical' ? 'destructive' : project.priority === 'High' ? 'default' : project.priority === 'Medium' ? 'secondary' : 'outline'}>{project.priority}</Badge>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Timeline</div>
                  <div className="font-medium">{formatDate(project.startDate)} - {formatDate(project.endDate)}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Budget</div>
                  <div className="font-medium">{formatCurrency(project.budget)}</div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-100 p-3 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Project Manager</div>
                  <div className="font-medium">{project.manager}</div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-yellow-100 p-3 rounded-lg mr-3">
                  <Target className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Sponsor</div>
                  <div className="font-medium">{project.sponsor}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700">{project.description}</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
              <ul className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <li key={activity.id} className="border-l-2 border-blue-500 pl-4 py-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">By {activity.performedBy}, {formatDate(activity.timestamp.split('T')[0])}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Project Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tasks</span>
                  <span className="font-medium">{completedTasks} / {tasks.length} completed</span>
                </div>
                <Progress value={tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0} className="h-2" />
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-600">Budget Used</span>
                  <span className="font-medium">{formatCurrency(project.actualCost)} / {formatCurrency(project.budget)}</span>
                </div>
                <Progress value={project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0} className="h-2" />

                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-600">Open Risks</span>
                  <Badge variant={openRisks > 0 ? 'destructive' : 'default'}>{openRisks} risks</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Tasks</h3>
              <Button onClick={handleCreateTask}><Plus className="h-4 w-4 mr-2" />Add Task</Button>
            </div>
            
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={task.status === 'Completed'} 
                      onChange={(e) => handleTaskStatusChange(task, e.target.checked ? 'Completed' : 'In Progress')}
                      className="h-5 w-5"
                    />
                    <div>
                      <p className={`font-medium ${task.status === 'Completed' ? 'line-through text-gray-400' : ''}`}>{task.name}</p>
                      <p className="text-sm text-gray-500">{task.assigneeName} • Due: {formatDate(task.dueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority === 'Critical' ? 'destructive' : task.priority === 'High' ? 'default' : task.priority === 'Medium' ? 'secondary' : 'outline'}>{task.priority}</Badge>
                    <Badge variant={task.status === 'Completed' ? 'default' : task.status === 'In Progress' ? 'outline' : 'secondary'}>{task.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Project Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.team?.length > 0 ? project.team.map((member, idx) => (
                <div key={idx} className="border rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{member}</p>
                    <p className="text-sm text-gray-500">Team Member</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No team members assigned yet
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Add Team Member</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Risks</h3>
              <Button onClick={handleCreateRisk}><Plus className="h-4 w-4 mr-2" />Add Risk</Button>
            </div>
            
            <div className="space-y-3">
              {risks.map((risk) => (
                <div key={risk.id} className={`border rounded-lg p-4 ${risk.status === 'Open' ? 'border-l-4 border-red-500' : 'border-l-4 border-yellow-500'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{risk.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{risk.description}</p>
                      <p className="text-xs text-gray-400 mt-2">Owner: {risk.owner} • Due: {formatDate(risk.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={risk.probability === 'High' ? 'destructive' : risk.probability === 'Medium' ? 'default' : 'secondary'}>{risk.probability} Prob.</Badge>
                      <Badge variant={risk.impact === 'High' ? 'destructive' : risk.impact === 'Medium' ? 'default' : 'secondary'}>{risk.impact} Impact</Badge>
                      <Badge variant={risk.status === 'Open' ? 'destructive' : risk.status === 'Mitigated' ? 'default' : 'secondary'}>{risk.status}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleEditRisk(risk)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRisk(risk)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Project Schedule</h3>
            <div className="space-y-4">
              {tasks.map((task, idx) => (
                <div key={task.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{task.name}</span>
                      <span className="text-sm text-gray-500">{formatDate(task.dueDate)}</span>
                    </div>
                    <Progress value={task.status === 'Completed' ? 100 : task.status === 'In Progress' ? 50 : 0} className="h-1 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(project.budget)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Actual Cost</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(project.actualCost)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(project.budget - project.actualCost)}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Budget Utilization</span>
                <span>{project.budget > 0 ? Math.round((project.actualCost / project.budget) * 100) : 0}%</span>
              </div>
              <Progress value={project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0} className="h-3" />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Name *</Label>
              <Input value={newTask.name} onChange={e => setNewTask(p => ({...p, name: e.target.value}))} placeholder="Enter task name" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newTask.description} onChange={e => setNewTask(p => ({...p, description: e.target.value}))} placeholder="Task description" />
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
                <Input type="number" value={newTask.estimatedHours} onChange={e => setNewTask(p => ({...p, estimatedHours: Number(e.target.value)}))} />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTask} disabled={!newTask.name}>{selectedTask ? 'Save Changes' : 'Create Task'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Risk Dialog */}
      <Dialog open={isRiskDialogOpen} onOpenChange={setIsRiskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRisk ? 'Edit Risk' : 'Create New Risk'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Risk Title *</Label>
              <Input value={newRisk.title} onChange={e => setNewRisk(p => ({...p, title: e.target.value}))} placeholder="Enter risk title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newRisk.description} onChange={e => setNewRisk(p => ({...p, description: e.target.value}))} placeholder="Risk description" />
            </div>
            <div>
              <Label>Category</Label>
              <select className="w-full h-10 px-3 border rounded-md" value={newRisk.category} onChange={e => setNewRisk(p => ({...p, category: e.target.value}))}>
                <option value="Technical">Technical</option>
                <option value="Schedule">Schedule</option>
                <option value="Resource">Resource</option>
                <option value="Financial">Financial</option>
                <option value="External">External</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Probability</Label>
                <select className="w-full h-10 px-3 border rounded-md" value={newRisk.probability} onChange={e => setNewRisk(p => ({...p, probability: e.target.value}))}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <Label>Impact</Label>
                <select className="w-full h-10 px-3 border rounded-md" value={newRisk.impact} onChange={e => setNewRisk(p => ({...p, impact: e.target.value}))}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Owner</Label>
                <Input value={newRisk.owner} onChange={e => setNewRisk(p => ({...p, owner: e.target.value}))} placeholder="Risk owner" />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={newRisk.dueDate} onChange={e => setNewRisk(p => ({...p, dueDate: e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsRiskDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveRisk} disabled={!newRisk.title}>{selectedRisk ? 'Save Changes' : 'Create Risk'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Name *</Label>
              <Input value={editProject.name} onChange={e => setEditProject(p => ({...p, name: e.target.value}))} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={editProject.description} onChange={e => setEditProject(p => ({...p, description: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Manager</Label>
                <Input value={editProject.manager} onChange={e => setEditProject(p => ({...p, manager: e.target.value}))} />
              </div>
              <div>
                <Label>Sponsor</Label>
                <Input value={editProject.sponsor} onChange={e => setEditProject(p => ({...p, sponsor: e.target.value}))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Status</Label>
                <select className="w-full h-10 px-3 border rounded-md" value={editProject.status} onChange={e => setEditProject(p => ({...p, status: e.target.value}))}>
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select className="w-full h-10 px-3 border rounded-md" value={editProject.priority} onChange={e => setEditProject(p => ({...p, priority: e.target.value}))}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={editProject.startDate} onChange={e => setEditProject(p => ({...p, startDate: e.target.value}))} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={editProject.endDate} onChange={e => setEditProject(p => ({...p, endDate: e.target.value}))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Budget</Label>
                <Input type="number" value={editProject.budget} onChange={e => setEditProject(p => ({...p, budget: Number(e.target.value)}))} />
              </div>
              <div>
                <Label>Progress %</Label>
                <Input type="number" value={editProject.progress} onChange={e => setEditProject(p => ({...p, progress: Number(e.target.value)}))} />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProject}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={deleteType === 'task' ? 'Delete Task' : 'Delete Risk'}
        description={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ProjectDetail;
