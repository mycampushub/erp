import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { listEntities } from '../localCrud';
import { 
  PM_STORAGE_KEYS, 
  ProjectPlan, Execution, Resource, TimeEntry, 
  Budget, Risk, ProjectDocument, PortfolioProject,
  Communication, Meeting, Project, Task
} from './types';

interface ProjectManagementContextType {
  // Projects
  projects: ProjectPlan[];
  loadProjects: () => void;
  
  // Resources
  resources: Resource[];
  loadResources: () => void;
  
  // Time Entries
  timeEntries: TimeEntry[];
  loadTimeEntries: () => void;
  
  // Budgets
  budgets: Budget[];
  loadBudgets: () => void;
  
  // Risks
  risks: Risk[];
  loadRisks: () => void;
  
  // Cross-module analytics
  getProjectById: (id: string) => ProjectPlan | undefined;
  getResourceById: (id: string) => Resource | undefined;
  getTimeEntriesByProject: (projectId: string) => TimeEntry[];
  getBudgetByProject: (projectId: string) => Budget | undefined;
  getRisksByProject: (projectId: string) => Risk[];
  getDocumentsByProject: (projectId: string) => ProjectDocument[];
  
  // Dashboard data
  getDashboardStats: () => DashboardStats;
  
  // Refresh all
  refreshAll: () => void;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalResources: number;
  totalBudget: number;
  totalActual: number;
  totalRisks: number;
  highRisks: number;
  pendingApprovals: number;
  utilization: number;
}

const ProjectManagementContext = createContext<ProjectManagementContextType | undefined>(undefined);

export const useProjectManagement = () => {
  const context = useContext(ProjectManagementContext);
  if (!context) {
    throw new Error('useProjectManagement must be used within a ProjectManagementProvider');
  }
  return context;
};

interface ProjectManagementProviderProps {
  children: ReactNode;
}

export const ProjectManagementProvider: React.FC<ProjectManagementProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectPlan[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const loadProjects = useCallback(() => {
    const data = listEntities<ProjectPlan>(PM_STORAGE_KEYS.PROJECT_PLANS);
    setProjects(data);
  }, []);

  const loadResources = useCallback(() => {
    const data = listEntities<Resource>(PM_STORAGE_KEYS.RESOURCES);
    setResources(data);
  }, []);

  const loadTimeEntries = useCallback(() => {
    const data = listEntities<TimeEntry>(PM_STORAGE_KEYS.TIME_ENTRIES);
    setTimeEntries(data);
  }, []);

  const loadBudgets = useCallback(() => {
    const data = listEntities<Budget>(PM_STORAGE_KEYS.BUDGETS);
    setBudgets(data);
  }, []);

  const loadRisks = useCallback(() => {
    const data = listEntities<Risk>(PM_STORAGE_KEYS.RISKS);
    setRisks(data);
  }, []);

  const loadDocuments = useCallback(() => {
    const data = listEntities<ProjectDocument>(PM_STORAGE_KEYS.DOCUMENTS);
    setDocuments(data);
  }, []);

  const loadPortfolioProjects = useCallback(() => {
    const data = listEntities<PortfolioProject>(PM_STORAGE_KEYS.PORTFOLIO_PROJECTS);
    setPortfolioProjects(data);
  }, []);

  const loadCommunications = useCallback(() => {
    const data = listEntities<Communication>(PM_STORAGE_KEYS.COMMUNICATIONS);
    setCommunications(data);
  }, []);

  const loadMeetings = useCallback(() => {
    const data = listEntities<Meeting>(PM_STORAGE_KEYS.MEETINGS);
    setMeetings(data);
  }, []);

  const refreshAll = useCallback(() => {
    loadProjects();
    loadResources();
    loadTimeEntries();
    loadBudgets();
    loadRisks();
    loadDocuments();
    loadPortfolioProjects();
    loadCommunications();
    loadMeetings();
  }, [loadProjects, loadResources, loadTimeEntries, loadBudgets, loadRisks, loadDocuments, loadPortfolioProjects, loadCommunications, loadMeetings]);

  // Load all data on mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Cross-module query functions
  const getProjectById = (id: string) => projects.find(p => p.id === id);
  const getResourceById = (id: string) => resources.find(r => r.id === id);

  const getTimeEntriesByProject = (projectId: string) => 
    timeEntries.filter(te => te.projectId === projectId);

  const getBudgetByProject = (projectId: string) => 
    budgets.find(b => b.projectId === projectId);

  const getRisksByProject = (projectId: string) => 
    risks.filter(r => r.projectId === projectId);

  const getDocumentsByProject = (projectId: string) => 
    documents.filter(d => d.projectId === projectId);

  const getDashboardStats = (): DashboardStats => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    
    const totalBudget = budgets.reduce((sum, b) => sum + (b.budgeted || 0), 0);
    const totalActual = budgets.reduce((sum, b) => sum + (b.actual || 0), 0);
    
    const totalRisks = risks.length;
    const highRisks = risks.filter(r => r.probability === 'High' && r.impact === 'High').length;
    
    const pendingApprovals = timeEntries.filter(te => te.status === 'Submitted').length;
    
    const avgUtilization = resources.length > 0 
      ? Math.round(resources.reduce((sum, r) => sum + r.utilization, 0) / resources.length)
      : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalResources: resources.length,
      totalBudget,
      totalActual,
      totalRisks,
      highRisks,
      pendingApprovals,
      utilization: avgUtilization
    };
  };

  const value: ProjectManagementContextType = {
    projects,
    loadProjects,
    resources,
    loadResources,
    timeEntries,
    loadTimeEntries,
    budgets,
    loadBudgets,
    risks,
    loadRisks,
    getProjectById,
    getResourceById,
    getTimeEntriesByProject,
    getBudgetByProject,
    getRisksByProject,
    getDocumentsByProject,
    getDashboardStats,
    refreshAll
  };

  return (
    <ProjectManagementContext.Provider value={value}>
      {children}
    </ProjectManagementContext.Provider>
  );
};

// Cross-module relationship helpers
export const getProjectHealth = (project: ProjectPlan, budgets: Budget[], risks: Risk[]): 'healthy' | 'warning' | 'critical' => {
  const budget = budgets.find(b => b.projectId === project.id);
  const projectRisks = risks.filter(r => r.projectId === project.id);
  const highRisks = projectRisks.filter(r => r.probability === 'High' && r.impact === 'High');
  
  if (highRisks.length > 2 || (budget && budget.variance < 0)) return 'critical';
  if (highRisks.length > 0 || (budget && budget.variance < -10000)) return 'warning';
  return 'healthy';
};

export const calculateProjectProgress = (
  phases: ProjectPlan['phases']
): number => {
  if (!phases || phases.length === 0) return 0;
  const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
  return Math.round(totalProgress / phases.length);
};

export const getResourceUtilization = (
  resourceId: string,
  allocations: { resourceId: string; allocation: number }[]
): number => {
  const resourceAllocations = allocations.filter(a => a.resourceId === resourceId);
  return resourceAllocations.reduce((sum, a) => sum + a.allocation, 0);
};

export const formatProjectTimeline = (
  startDate: string,
  endDate: string
): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  if (now < start) return 'Not Started';
  if (now > end) return 'Overdue';
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.round((daysPassed / totalDays) * 100);
  
  return `${progress}% Complete`;
};

export const generateProjectSummary = (
  project: ProjectPlan,
  budget?: Budget,
  risks?: Risk[],
  timeEntries?: TimeEntry[]
): string => {
  const parts = [
    `${project.name} is currently ${project.status.toLowerCase()}`,
    `with ${project.progress}% completion`,
  ];
  
  if (budget) {
    parts.push(`| Budget: $${budget.budgeted.toLocaleString()} (Actual: $${budget.actual.toLocaleString()})`);
  }
  
  if (risks && risks.length > 0) {
    parts.push(`| ${risks.length} risks identified`);
  }
  
  if (timeEntries && timeEntries.length > 0) {
    const totalHours = timeEntries.reduce((sum, te) => sum + te.hours, 0);
    parts.push(`| ${totalHours} hours logged`);
  }
  
  return parts.join(' ');
};

export default ProjectManagementContext;
