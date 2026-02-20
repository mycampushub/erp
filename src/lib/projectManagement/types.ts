// Project Management Module - Data Types and localStorage Keys
// Phase 1: Foundation

// ==================== localStorage Keys ====================
export const PM_STORAGE_KEYS = {
  PROJECT_PLANS: 'pm-project-plans',
  PROJECT_TEMPLATES: 'pm-project-templates',
  PROJECT_OBJECTIVES: 'pm-project-objectives',
  PROJECT_MILESTONES: 'pm-project-milestones',
  EXECUTIONS: 'pm-executions',
  WORK_PACKAGES: 'pm-work-packages',
  DELIVERABLES: 'pm-deliverables',
  RESOURCES: 'pm-resources',
  RESOURCE_ALLOCATIONS: 'pm-resource-allocations',
  CAPACITY_PLANS: 'pm-capacity-plans',
  SKILLS: 'pm-skills',
  TIME_ENTRIES: 'pm-time-entries',
  TIMESHEETS: 'pm-timesheets',
  TIME_REPORTS: 'pm-time-reports',
  BUDGETS: 'pm-budgets',
  EXPENSES: 'pm-expenses',
  COST_CATEGORIES: 'pm-cost-categories',
  FORECASTS: 'pm-forecasts',
  RISKS: 'pm-risks',
  MITIGATION_ACTIONS: 'pm-mitigation-actions',
  CONTINGENCY_PLANS: 'pm-contingency-plans',
  DOCUMENTS: 'pm-documents',
  DOCUMENT_FOLDERS: 'pm-document-folders',
  DOCUMENT_VERSIONS: 'pm-document-versions',
  DOCUMENT_PERMISSIONS: 'pm-document-permissions',
  PORTFOLIO_PROJECTS: 'pm-portfolio-projects',
  STRATEGIC_OBJECTIVES: 'pm-strategic-objectives',
  PERFORMANCE_METRICS: 'pm-performance-metrics',
  OPTIMIZATION_RECS: 'pm-optimization-recs',
  COMMUNICATIONS: 'pm-communications',
  MEETINGS: 'pm-meetings',
  SHARED_DOCS: 'pm-shared-docs',
  NOTIFICATION_SETTINGS: 'pm-notification-settings',
  PROJECTS: 'pm-projects',
  TASKS: 'pm-tasks',
  ACTIVITIES: 'pm-activities',
} as const;

// ==================== Project Planning Types ====================
export type ProjectStatus = 'Draft' | 'In Review' | 'Approved' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type PhaseStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: PhaseStatus;
  deliverables: string[];
  dependencies: string[];
}

export interface ProjectResource {
  id: string;
  name: string;
  role: string;
  allocation: number;
  cost: number;
  availability: string;
}

export interface ProjectRisk {
  id: string;
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
  status: 'Open' | 'Mitigated' | 'Closed';
}

export interface ProjectPlan {
  id: string;
  planId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  estimatedCost: number;
  actualCost: number;
  startDate: string;
  endDate: string;
  projectManager: string;
  sponsor: string;
  priority: Priority;
  phases: ProjectPhase[];
  resources: ProjectResource[];
  risks: ProjectRisk[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  type: string;
  duration: string;
  phases: ProjectPhase[];
  description: string;
  industry: string;
  complexity: Priority;
  createdAt: string;
}

export interface ProjectObjective {
  id: string;
  title: string;
  description: string;
  projectId: string;
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  kpis: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  projectId: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Delayed';
  deliverables: string[];
}

// ==================== Project Execution Types ====================
export interface Execution {
  id: string;
  executionId: string;
  project: string;
  phase: string;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  team: string;
  startDate: string;
  endDate: string;
  manager: string;
}

export interface WorkPackage {
  id: string;
  wpId: string;
  name: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
  completion: number;
  projectId: string;
  estimatedHours: number;
  actualHours: number;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  projectId: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Rejected';
  approvedBy: string;
  approvalDate: string;
}

// ==================== Resource Management Types ====================
export interface Resource {
  id: string;
  resourceId: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  availability: number;
  utilization: number;
  skills: string[];
  costRate: number;
  costCurrency: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  hireDate: string;
}

export interface ResourceAllocation {
  id: string;
  projectId: string;
  resourceId: string;
  allocation: number;
  startDate: string;
  endDate: string;
  role: string;
}

export interface CapacityPlan {
  id: string;
  resourceId: string;
  period: string;
  plannedCapacity: number;
  availableCapacity: number;
  utilizedCapacity: number;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Technical' | 'Soft' | 'Domain' | 'Certification';
  description: string;
  resources: string[];
}

// ==================== Time Recording Types ====================
export interface TimeEntry {
  id: string;
  entryId: string;
  date: string;
  projectId: string;
  task: string;
  hours: number;
  description: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  employeeId: string;
  employeeName: string;
  approvedBy: string;
  approvedDate: string;
}

export interface Timesheet {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  employeeId: string;
  employeeName: string;
  totalHours: number;
  billableHours: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  entries: string[];
  submittedDate: string;
  approvedBy: string;
}

export interface TimeReport {
  id: string;
  name: string;
  type: 'Project' | 'Employee' | 'Billing' | 'Summary';
  dateRange: { start: string; end: string };
  createdAt: string;
  generatedBy: string;
}

// ==================== Cost Management Types ====================
export interface Budget {
  id: string;
  projectId: string;
  projectName: string;
  budgeted: number;
  actual: number;
  variance: number;
  status: 'Under Budget' | 'On Budget' | 'Over Budget';
  completion: number;
  period: string;
}

export interface Expense {
  id: string;
  expenseId: string;
  projectId: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  vendor: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Reimbursed';
  submittedBy: string;
  approvedBy: string;
}

export interface CostCategory {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
  percentage: number;
  description: string;
}

export interface CostForecast {
  id: string;
  projectId: string;
  forecastDate: string;
  estimatedCost: number;
  confidence: number;
  assumptions: string[];
}

// ==================== Risk Management Types ====================
export interface Risk {
  id: string;
  riskId: string;
  title: string;
  description: string;
  projectId: string;
  category: 'Technical' | 'Schedule' | 'Resource' | 'Financial' | 'External';
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'Monitoring' | 'Mitigated' | 'Closed';
  owner: string;
  dueDate: string;
  createdAt: string;
}

export interface MitigationAction {
  id: string;
  actionId: string;
  riskId: string;
  action: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  dueDate: string;
  completedDate: string;
  owner: string;
}

export interface ContingencyPlan {
  id: string;
  riskId: string;
  trigger: string;
  response: string;
  responsible: string;
  resources: string;
}

// ==================== Document Management Types ====================
export interface ProjectDocument {
  id: string;
  docId: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'Image' | 'Other';
  size: number;
  sizeFormatted: string;
  projectId: string;
  folderId: string;
  lastModified: string;
  version: string;
  status: 'Draft' | 'Review' | 'Approved' | 'Archived';
  createdBy: string;
  modifiedBy: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId: string | null;
  documentCount: number;
  totalSize: number;
  lastAccess: string;
  createdBy: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  changes: string;
  createdBy: string;
  createdAt: string;
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  permission: 'Read' | 'Write' | 'Full Access';
  grantedBy: string;
  grantedAt: string;
}

// ==================== Portfolio Management Types ====================
export interface PortfolioProject {
  id: string;
  projectId: string;
  name: string;
  description: string;
  priority: Priority;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  progress: number;
  budget: number;
  actualCost: number;
  roi: string;
  strategicValue: 'High' | 'Medium' | 'Low';
  startDate: string;
  endDate: string;
  sponsor: string;
  manager: string;
}

export interface StrategicObjective {
  id: string;
  name: string;
  description: string;
  projects: string[];
  alignmentScore: number;
  status: 'On Track' | 'At Risk' | 'Behind';
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: string;
  period: string;
}

export interface OptimizationRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  status: 'Proposed' | 'Approved' | 'Implemented';
}

// ==================== Collaboration Types ====================
export interface Communication {
  id: string;
  commId: string;
  type: 'Message' | 'Email' | 'Comment';
  subject: string;
  content: string;
  from: string;
  projectId: string;
  timestamp: string;
  readStatus: 'Read' | 'Unread';
}

export interface Meeting {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  projectId: string;
  scheduledAt: string;
  duration: number;
  attendees: string[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  host: string;
  location: string;
}

export interface SharedDocument {
  id: string;
  documentId: string;
  sharedWith: string[];
  sharedAt: string;
  sharedBy: string;
  accessLevel: 'View' | 'Edit';
}

export interface NotificationSetting {
  id: string;
  userId: string;
  type: string;
  enabled: boolean;
  channel: 'In-App' | 'Email' | 'Both';
}

// ==================== Project Detail Types ====================
export interface Project {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  actualCost: number;
  manager: string;
  sponsor: string;
  team: string[];
  priority: Priority;
  createdAt: string;
}

export interface Task {
  id: string;
  taskId: string;
  name: string;
  description: string;
  projectId: string;
  dueDate: string;
  assigneeId: string;
  assigneeName: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: Priority;
  completed: boolean;
  estimatedHours: number;
  actualHours: number;
}

export interface Activity {
  id: string;
  projectId: string;
  type: string;
  description: string;
  performedBy: string;
  timestamp: string;
  relatedEntity: string;
}
