import { upsertEntity } from '../localCrud';
import { 
  ProjectPlan, ProjectTemplate, ProjectObjective, Milestone,
  Execution, WorkPackage, Deliverable,
  Resource, ResourceAllocation, CapacityPlan, Skill,
  TimeEntry, Timesheet, TimeReport,
  Budget, Expense, CostCategory, CostForecast,
  Risk, MitigationAction, ContingencyPlan,
  ProjectDocument, DocumentFolder, DocumentVersion, DocumentPermission,
  PortfolioProject, StrategicObjective, PerformanceMetric, OptimizationRecommendation,
  Communication, Meeting, SharedDocument, NotificationSetting,
  Project, Task, Activity
} from './types';

let pmDataSeeded = false;

// Helper to generate IDs
const genId = (prefix: string, num: number) => `${prefix}-${String(num).padStart(3, '0')}`;

// Date helpers
const getDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const getDateTime = (daysOffset: number, hours: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

// ==================== Project Planning Seeds ====================
export const seedProjectPlans = (): ProjectPlan[] => {
  const statuses: ProjectPlan['status'][] = ['Draft', 'In Review', 'Approved', 'Active', 'On Hold', 'Completed', 'Cancelled'];
  const priorities: ProjectPlan['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
  const managers = ['Sarah Johnson', 'Michael Chen', 'Emma Wilson', 'David Brown', 'Lisa Anderson', 'James Taylor', 'Maria Garcia', 'Robert Lee'];
  const sponsors = ['CEO Office', 'CFO', 'CTO', 'COO', 'VP Operations', 'VP Sales', 'Board of Directors'];
  
  const projectNames = [
    'Digital Transformation Initiative', 'Cloud Migration Project', 'ERP Implementation',
    'Mobile Application Development', 'Data Warehouse Upgrade', 'Cybersecurity Enhancement',
    'Customer Portal Redesign', 'AI Integration Project', 'IoT Infrastructure Setup',
    'Business Intelligence Platform', 'Supply Chain Optimization', 'CRM Implementation',
    'E-Commerce Platform Launch', 'Legacy System Modernization', 'Infrastructure Overhaul',
    'Process Automation Initiative', 'Quality Management System', 'Compliance Automation',
    'Knowledge Management System', 'Enterprise Architecture Review', 'DevOps Transformation',
    'API Gateway Implementation', 'Machine Learning Platform', 'Blockchain Integration',
    'Green IT Initiative', 'Customer Experience Enhancement', 'Product Lifecycle Management',
    'Vendor Management System', 'Financial System Integration', 'HR Digital Transformation'
  ];

  return projectNames.map((name, idx) => ({
    id: genId('PLAN', idx + 1),
    planId: genId('PLAN', idx + 1),
    name,
    description: `Comprehensive ${name.toLowerCase()} project to achieve strategic objectives and operational excellence.`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    progress: Math.floor(Math.random() * 100),
    estimatedCost: Math.floor(Math.random() * 900000) + 100000,
    actualCost: Math.floor(Math.random() * 500000),
    startDate: getDate(-180 + idx * 10),
    endDate: getDate(180 - idx * 5),
    projectManager: managers[Math.floor(Math.random() * managers.length)],
    sponsor: sponsors[Math.floor(Math.random() * sponsors.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    phases: [
      {
        id: genId('PHASE', idx * 10 + 1),
        name: 'Planning & Analysis',
        description: 'Initial planning and requirements analysis phase',
        startDate: getDate(-180 + idx * 10),
        endDate: getDate(-120 + idx * 10),
        progress: Math.floor(Math.random() * 100),
        status: Math.random() > 0.5 ? 'Completed' : 'In Progress',
        deliverables: ['Requirements Document', 'Project Charter', 'Risk Assessment'],
        dependencies: []
      },
      {
        id: genId('PHASE', idx * 10 + 2),
        name: 'Design & Architecture',
        description: 'System design and architecture planning',
        startDate: getDate(-120 + idx * 10),
        endDate: getDate(-60 + idx * 10),
        progress: Math.floor(Math.random() * 100),
        status: Math.random() > 0.5 ? 'In Progress' : 'Not Started',
        deliverables: ['Architecture Document', 'Design Specifications', 'Technical Roadmap'],
        dependencies: ['Planning & Analysis']
      },
      {
        id: genId('PHASE', idx * 10 + 3),
        name: 'Implementation',
        description: 'Core implementation and development',
        startDate: getDate(-60 + idx * 10),
        endDate: getDate(60 - idx * 5),
        progress: Math.floor(Math.random() * 100),
        status: 'Not Started',
        deliverables: ['Developed System', 'Unit Tests', 'Integration Tests'],
        dependencies: ['Design & Architecture']
      }
    ],
    resources: [
      {
        id: genId('RES', idx * 10 + 1),
        name: managers[Math.floor(Math.random() * managers.length)],
        role: 'Project Manager',
        allocation: 100,
        cost: Math.floor(Math.random() * 50000) + 50000,
        availability: 'Full-time'
      }
    ],
    risks: Math.random() > 0.5 ? [
      {
        id: genId('RSK', idx * 10 + 1),
        description: 'Resource constraints may impact timeline',
        probability: 'Medium',
        impact: 'High',
        mitigation: 'Cross-train team members and maintain backup resources',
        status: 'Open'
      }
    ] : [],
    createdAt: getDate(-200 + idx * 5),
    updatedAt: getDate(-10)
  }));
};

export const seedProjectTemplates = (): ProjectTemplate[] => {
  const types = ['IT', 'Operations', 'Marketing', 'Finance', 'HR', 'R&D'];
  const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education'];
  const complexities: ProjectTemplate['complexity'][] = ['Low', 'Medium', 'High'];
  
  const templateNames = [
    'Software Development Project', 'Infrastructure Upgrade', 'System Integration',
    'Process Improvement', 'Product Launch', 'Research Initiative',
    'Compliance Project', 'Training Program', 'Facilities Project',
    'Marketing Campaign', 'Data Migration', 'Security Enhancement',
    'Mobile App Development', 'Cloud Migration', 'ERP Implementation',
    'CRM Implementation', 'Business Intelligence', 'E-Commerce Platform',
    'IoT Implementation', 'AI/ML Project', 'Blockchain Project',
    'DevOps Transformation', 'API Development', 'Data Warehouse',
    'Customer Experience', 'Supply Chain', 'Vendor Selection',
    'Merger Integration', 'Organizational Change', 'Sustainability Initiative'
  ];

  return templateNames.map((name, idx) => ({
    id: genId('TMPL', idx + 1),
    name,
    type: types[Math.floor(Math.random() * types.length)],
    duration: `${Math.floor(Math.random() * 12) + 3} months`,
    phases: [
      {
        id: genId('TPH', idx * 10 + 1),
        name: 'Initiation',
        description: 'Project initiation phase',
        startDate: '',
        endDate: '',
        progress: 0,
        status: 'Not Started',
        deliverables: ['Project Charter', 'Stakeholder Register'],
        dependencies: []
      }
    ],
    description: `Standard ${name.toLowerCase()} template with best practices`,
    industry: industries[Math.floor(Math.random() * industries.length)],
    complexity: complexities[Math.floor(Math.random() * complexities.length)],
    createdAt: getDate(-365)
  }));
};

export const seedProjectObjectives = (): ProjectObjective[] => {
  const objectives = [
    'Increase operational efficiency by 25%', 'Reduce project delivery time by 30%',
    'Improve customer satisfaction scores', 'Achieve cost savings of 15%',
    'Enhance data security posture', 'Modernize technology infrastructure',
    'Streamline business processes', 'Improve employee productivity',
    'Increase market share', 'Enhance product quality',
    'Reduce operational costs', 'Improve compliance adherence',
    'Accelerate digital transformation', 'Enhance customer experience',
    'Optimize supply chain', 'Improve risk management',
    'Increase revenue growth', 'Enhance brand recognition',
    'Improve stakeholder engagement', 'Achieve sustainability goals',
    'Enhance innovation capability', 'Improve data analytics',
    'Strengthen partnerships', 'Optimize resource allocation',
    'Enhance governance', 'Improve reporting',
    'Increase automation', 'Enhance scalability',
    'Improve flexibility', 'Achieve competitive advantage'
  ];

  return objectives.map((title, idx) => ({
    id: genId('OBJ', idx + 1),
    title,
    description: `Objective to ${title.toLowerCase()}`,
    projectId: genId('PLAN', Math.floor(idx / 2) + 1),
    targetDate: getDate(365 - idx * 10),
    status: Math.random() > 0.5 ? 'In Progress' : 'Not Started',
    progress: Math.floor(Math.random() * 100),
    kpis: ['KPI 1', 'KPI 2', 'KPI 3']
  }));
};

export const seedMilestones = (): Milestone[] => {
  const milestones = [
    'Project Kickoff', 'Requirements Approval', 'Design Sign-off',
    'Development Complete', 'Testing Complete', 'UAT Complete',
    'Go-Live', 'Hypercare Complete', 'Project Closure',
    'Phase 1 Complete', 'Phase 2 Complete', 'Phase 3 Complete'
  ];

  return milestones.flatMap((name, idx) => ({
    id: genId('MST', idx + 1),
    name,
    description: `${name} milestone for project`,
    projectId: genId('PLAN', Math.floor(idx / 3) + 1),
    dueDate: getDate(30 + idx * 30),
    status: Math.random() > 0.6 ? 'Completed' : Math.random() > 0.5 ? 'Pending' : 'Delayed',
    deliverables: [`${name} Deliverable`]
  }));
};

// ==================== Project Execution Seeds ====================
export const seedExecutions = (): Execution[] => {
  const projects = seedProjectPlans();
  const phases = ['Planning', 'Design', 'Development', 'Testing', 'Deployment', 'Hypercare'];
  const statuses: Execution['status'][] = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
  const teams = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta', 'Team Omega'];

  return projects.slice(0, 30).map((plan, idx) => ({
    id: genId('EXE', idx + 1),
    executionId: genId('EXE', idx + 1),
    project: plan.name,
    phase: phases[Math.floor(Math.random() * phases.length)],
    progress: Math.floor(Math.random() * 100),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    team: teams[Math.floor(Math.random() * teams.length)],
    startDate: plan.startDate,
    endDate: plan.endDate,
    manager: plan.projectManager
  }));
};

export const seedWorkPackages = (): WorkPackage[] => {
  const packageNames = [
    'System Configuration', 'Data Migration', 'Integration Testing',
    'User Training', 'Documentation', 'Code Review',
    'Performance Testing', 'Security Assessment', 'Deployment',
    'Change Management', 'Requirements Gathering', 'UI/UX Design',
    'API Development', 'Database Design', 'Infrastructure Setup',
    'Unit Testing', 'Acceptance Testing', 'Bug Fixing',
    'Data Validation', 'Report Development', 'Workflow Automation',
    'Report Generation', 'Backup & Recovery', 'Monitoring Setup',
    'Access Control', 'Compliance Check', 'Vendor Coordination',
    'Stakeholder Management', 'Quality Assurance', 'Release Management'
  ];

  const statuses: WorkPackage['status'][] = ['Pending', 'Active', 'Completed', 'Cancelled'];
  const assignees = ['John Smith', 'Emma Wilson', 'Mike Johnson', 'Sarah Davis', 'David Brown', 'Lisa Anderson'];

  return packageNames.slice(0, 30).map((name, idx) => ({
    id: genId('WP', idx + 1),
    wpId: genId('WP', idx + 1),
    name,
    description: `Work package for ${name.toLowerCase()}`,
    assignee: assignees[Math.floor(Math.random() * assignees.length)],
    dueDate: getDate(30 + idx * 15),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    completion: Math.floor(Math.random() * 100),
    projectId: genId('PLAN', Math.floor(idx / 3) + 1),
    estimatedHours: Math.floor(Math.random() * 80) + 20,
    actualHours: Math.floor(Math.random() * 60)
  }));
};

export const seedDeliverables = (): Deliverable[] => {
  const deliverables = [
    'System Architecture Document', 'User Acceptance Testing Report', 'Technical Specifications',
    'Project Charter', 'Requirements Document', 'Design Document',
    'Test Plan', 'Test Results', 'Training Materials',
    'User Manual', 'Installation Guide', 'API Documentation',
    'Data Migration Script', 'Configuration Document', 'Security Assessment',
    'Performance Report', 'Go-Live Checklist', 'Post-Implementation Review',
    'Change Request Log', 'Risk Register', 'Issue Log',
    'Status Report', 'Budget Report', 'Resource Plan',
    'Communication Plan', 'Quality Plan', 'Stakeholder Register',
    'Lessons Learned', 'Project Closure Report', 'Warranty Documentation'
  ];

  const statuses: Deliverable['status'][] = ['Not Started', 'In Progress', 'Completed', 'Rejected'];

  return deliverables.slice(0, 30).map((name, idx) => ({
    id: genId('DLV', idx + 1),
    name,
    description: `Deliverable: ${name}`,
    projectId: genId('PLAN', Math.floor(idx / 3) + 1),
    dueDate: getDate(30 + idx * 20),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    approvedBy: 'Project Manager',
    approvalDate: getDate(45 + idx * 20)
  }));
};

// ==================== Resource Management Seeds ====================
export const seedResources = (): Resource[] => {
  const firstNames = ['John', 'Emma', 'Michael', 'Sarah', 'David', 'Lisa', 'James', 'Maria', 'Robert', 'Jennifer', 'William', 'Emily', 'Daniel', 'Sofia', 'Matthew'];
  const lastNames = ['Smith', 'Wilson', 'Johnson', 'Davis', 'Brown', 'Anderson', 'Taylor', 'Garcia', 'Lee', 'Miller', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis'];
  const roles = ['Project Manager', 'System Architect', 'Senior Developer', 'Developer', 'QA Engineer', 'Business Analyst', 'UI/UX Designer', 'DevOps Engineer', 'Data Analyst', 'Security Specialist'];
  const departments = ['IT', 'Engineering', 'Operations', 'Finance', 'Marketing', 'HR', 'R&D', 'Product'];
  
  const allSkills = [
    'Project Management', 'Java', 'React', 'Python', 'AWS', 'Azure', 'SQL', 'NoSQL',
    'Agile', 'Scrum', 'Data Analysis', 'Machine Learning', 'DevOps', 'CI/CD',
    'Security', 'Cloud Architecture', 'API Design', 'Microservices', 'Kubernetes',
    'Docker', 'Node.js', 'TypeScript', 'Angular', 'Vue.js', 'iOS Development',
    'Android Development', 'UI/UX Design', 'Testing', 'Automation', 'Performance Testing'
  ];

  return Array.from({ length: 30 }, (_, idx) => {
    const firstName = firstNames[idx % firstNames.length];
    const lastName = lastNames[Math.floor(idx / firstNames.length) % lastNames.length];
    const role = roles[Math.floor(Math.random() * roles.length)];
    
    return {
      id: genId('RES', idx + 1),
      resourceId: genId('RES', idx + 1),
      name: `${firstName} ${lastName}`,
      role,
      department: departments[Math.floor(Math.random() * departments.length)],
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      phone: `+1-555-${String(1000 + idx).padStart(4, '0')}`,
      availability: Math.floor(Math.random() * 50) + 50,
      utilization: Math.floor(Math.random() * 40) + 60,
      skills: allSkills.slice(idx % 10, (idx % 10) + 5),
      costRate: Math.floor(Math.random() * 150) + 50,
      costCurrency: 'USD',
      status: 'Active',
      hireDate: getDate(-365 * Math.floor(Math.random() * 5))
    };
  });
};

export const seedResourceAllocations = (): ResourceAllocation[] => {
  const projects = seedProjectPlans();
  const resources = seedResources();
  
  return Array.from({ length: 30 }, (_, idx) => ({
    id: genId('ALLOC', idx + 1),
    projectId: projects[idx % projects.length].id,
    resourceId: resources[idx % resources.length].id,
    allocation: [25, 50, 75, 100][Math.floor(Math.random() * 4)],
    startDate: getDate(-60 + idx * 10),
    endDate: getDate(120 - idx * 5),
    role: resources[idx % resources.length].role
  }));
};

export const seedCapacityPlans = (): CapacityPlan[] => {
  const resources = seedResources();
  const periods = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
  
  return resources.slice(0, 30).map((resource, idx) => ({
    id: genId('CAP', idx + 1),
    resourceId: resource.id,
    period: periods[idx % periods.length],
    plannedCapacity: 160,
    availableCapacity: Math.floor(Math.random() * 60) + 100,
    utilizedCapacity: Math.floor(Math.random() * 40) + 80
  }));
};

export const seedSkills = (): Skill[] => {
  const technicalSkills = ['Java', 'Python', 'React', 'Angular', 'Node.js', 'AWS', 'Azure', 'Kubernetes', 'Docker', 'SQL'];
  const softSkills = ['Leadership', 'Communication', 'Problem Solving', 'Team Management', 'Stakeholder Management'];
  const domainSkills = ['Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Logistics'];
  const certifications = ['PMP', 'Scrum Master', 'AWS Certified', 'ITIL', 'CISSP'];

  return [
    ...technicalSkills.map((name, idx) => ({
      id: genId('SKL', idx + 1),
      name,
      category: 'Technical' as const,
      description: `${name} technical skill`,
      resources: [genId('RES', idx + 1), genId('RES', idx + 2)]
    })),
    ...softSkills.map((name, idx) => ({
      id: genId('SKL', idx + 11),
      name,
      category: 'Soft' as const,
      description: `${name} skill`,
      resources: [genId('RES', idx + 3)]
    })),
    ...domainSkills.map((name, idx) => ({
      id: genId('SKL', idx + 16),
      name,
      category: 'Domain' as const,
      description: `${name} domain expertise`,
      resources: [genId('RES', idx + 4)]
    })),
    ...certifications.map((name, idx) => ({
      id: genId('SKL', idx + 21),
      name,
      category: 'Certification' as const,
      description: `${name} certification`,
      resources: [genId('RES', idx + 5)]
    }))
  ];
};

// ==================== Time Recording Seeds ====================
export const seedTimeReports = (): TimeReport[] => {
  const reportNames = [
    'Monthly Project Summary', 'Employee Hours Q1', 'Billable Hours January',
    'Weekly Time Report', 'Project Time Analysis', 'Resource Utilization Report',
    'Overtime Report', 'Timesheet Summary', 'Department Hours Report',
    'Client Billing Report', 'Project Cost Analysis', 'Team Performance Report',
    'Attendance Summary', 'Leave Balance Report', 'Productivity Analysis',
    'Budget vs Actual Hours', 'Milestone Completion Report', 'Sprint Hours Report',
    'Training Hours Report', 'Internal Project Hours', 'External Consulting Hours',
    'Development Time Log', 'Testing Hours Summary', 'Meeting Time Analysis',
    'Travel Time Report', 'Administrative Hours', 'Support Hours Report',
    'R&D Time Allocation', 'Maintenance Hours', 'Implementation Hours'
  ];
  const types: TimeReport['type'][] = ['Project', 'Employee', 'Billing', 'Summary'];

  return reportNames.map((name, idx) => ({
    id: genId('RPT', idx + 1),
    name,
    type: types[Math.floor(Math.random() * types.length)],
    dateRange: { start: getDate(-30 + idx * 5), end: getDate(idx * 5) },
    createdAt: getDate(-30 + idx * 5),
    generatedBy: ['System', 'Admin', 'Manager', 'Finance'][idx % 4]
  }));
};

export const seedTimeEntries = (): TimeEntry[] => {
  const projects = seedProjectPlans();
  const tasks = ['System Configuration', 'Development', 'Testing', 'Documentation', 'Meeting', 'Research', 'Code Review', 'Deployment'];
  const statuses: TimeEntry['status'][] = ['Draft', 'Submitted', 'Approved', 'Rejected'];
  const employees = ['John Smith', 'Emma Wilson', 'Mike Johnson', 'Sarah Davis', 'David Brown'];

  return Array.from({ length: 30 }, (_, idx) => ({
    id: genId('TIME', idx + 1),
    entryId: genId('TIME', idx + 1),
    date: getDate(-30 + idx),
    projectId: projects[idx % projects.length].id,
    task: tasks[Math.floor(Math.random() * tasks.length)],
    hours: Math.floor(Math.random() * 8) + 1,
    description: `Work on ${tasks[Math.floor(Math.random() * tasks.length)].toLowerCase()}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    employeeId: genId('EMP', idx % 5 + 1),
    employeeName: employees[idx % employees.length],
    approvedBy: idx % 3 === 0 ? 'Manager' : '',
    approvedDate: idx % 3 === 0 ? getDate(-5 + idx) : ''
  }));
};

export const seedTimesheets = (): Timesheet[] => {
  const employees = ['John Smith', 'Emma Wilson', 'Mike Johnson', 'Sarah Davis', 'David Brown'];
  const statuses: Timesheet['status'][] = ['Draft', 'Submitted', 'Approved', 'Rejected'];

  return Array.from({ length: 30 }, (_, idx) => {
    const weekStart = getDate(-56 + idx * 7);
    return {
      id: genId('TS', idx + 1),
      weekStartDate: weekStart,
      weekEndDate: getDate(-50 + idx * 7),
      employeeId: genId('EMP', idx % 5 + 1),
      employeeName: employees[idx % employees.length],
      totalHours: Math.floor(Math.random() * 20) + 30,
      billableHours: Math.floor(Math.random() * 15) + 25,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      entries: Array.from({ length: 5 }, (_, i) => genId('TIME', idx * 5 + i + 1)),
      submittedDate: getDate(-5 + idx),
      approvedBy: idx % 2 === 0 ? 'Manager' : ''
    };
  });
};

// ==================== Cost Management Seeds ====================
export const seedBudgets = (): Budget[] => {
  const projects = seedProjectPlans();
  return projects.map((plan, idx) => {
    const budgeted = plan.estimatedCost;
    const actual = plan.actualCost;
    const variance = budgeted - actual;
    return {
      id: genId('BUD', idx + 1),
      projectId: plan.id,
      projectName: plan.name,
      budgeted,
      actual,
      variance,
      status: variance > 0 ? 'Under Budget' : variance < 0 ? 'Over Budget' : 'On Budget',
      completion: plan.progress,
      period: '2025'
    };
  });
};

export const seedExpenses = (): Expense[] => {
  const projects = seedProjectPlans();
  const categories = ['Personnel', 'Equipment', 'Software', 'Travel', 'Consulting', 'Training', 'Infrastructure', 'Marketing'];
  const vendors = ['AWS', 'Microsoft', 'Oracle', 'SAP', 'Google Cloud', 'Adobe', 'Salesforce', 'Cisco'];
  const statuses: Expense['status'][] = ['Pending', 'Approved', 'Rejected', 'Reimbursed'];

  return Array.from({ length: 30 }, (_, idx) => ({
    id: genId('EXP', idx + 1),
    expenseId: genId('EXP', idx + 1),
    projectId: projects[idx % projects.length].id,
    category: categories[Math.floor(Math.random() * categories.length)],
    description: `Expense for ${categories[Math.floor(Math.random() * categories.length)].toLowerCase()}`,
    amount: Math.floor(Math.random() * 50000) + 1000,
    currency: 'USD',
    date: getDate(-60 + idx * 5),
    vendor: vendors[Math.floor(Math.random() * vendors.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    submittedBy: 'Employee',
    approvedBy: idx % 2 === 0 ? 'Manager' : ''
  }));
};

export const seedCostCategories = (): CostCategory[] => {
  const categories = [
    { name: 'Personnel', budgeted: 500000, percentage: 45 },
    { name: 'Equipment', budgeted: 200000, percentage: 18 },
    { name: 'Software', budgeted: 150000, percentage: 14 },
    { name: 'Consulting', budgeted: 100000, percentage: 9 },
    { name: 'Travel', budgeted: 75000, percentage: 7 },
    { name: 'Training', budgeted: 50000, percentage: 5 },
    { name: 'Infrastructure', budgeted: 25000, percentage: 2 }
  ];

  return categories.map((cat, idx) => ({
    id: genId('CC', idx + 1),
    name: cat.name,
    budgeted: cat.budgeted,
    actual: Math.floor(cat.budgeted * (0.8 + Math.random() * 0.4)),
    percentage: cat.percentage,
    description: `${cat.name} cost category`
  }));
};

export const seedCostForecasts = (): CostForecast[] => {
  const projects = seedProjectPlans();
  const assumptions = ['Market stability', 'Resource availability', 'Technology compatibility', 'No major delays', 'Budget approval', 'Team availability', 'Vendor support'];

  return Array.from({ length: 30 }, (_, idx) => ({
    id: genId('FCST', idx + 1),
    projectId: projects[idx % projects.length].id,
    forecastDate: getDate(30 + idx * 10),
    estimatedCost: projects[idx % projects.length].estimatedCost * (0.85 + Math.random() * 0.4),
    confidence: Math.floor(Math.random() * 35) + 65,
    assumptions: [assumptions[idx % assumptions.length], assumptions[(idx + 1) % assumptions.length]]
  }));
};

// ==================== Risk Management Seeds ====================
export const seedRisks = (): Risk[] => {
  const projects = seedProjectPlans();
  const titles = [
    'Data Migration Complexity', 'Resource Availability', 'Technology Integration',
    'Budget Overrun', 'Timeline Delays', 'Scope Creep', 'Vendor Issues',
    'Security Vulnerabilities', 'Regulatory Compliance', 'Stakeholder Resistance',
    'Technical Debt', 'Performance Issues', 'Data Quality', 'System Downtime',
    'Staff Turnover', 'Training Gaps', 'Change Management', 'Third-party Dependencies',
    'Infrastructure Limitations', 'Quality Issues', 'Requirements Changes',
    'Testing Coverage', 'Documentation Gaps', 'Integration Challenges',
    'User Adoption', 'Support Capacity', 'Upgrade Path', 'Legacy System Issues',
    'Scalability Concerns', 'Disaster Recovery'
  ];
  const categories: Risk['category'][] = ['Technical', 'Schedule', 'Resource', 'Financial', 'External'];

  return titles.map((title, idx) => ({
    id: genId('RSK', idx + 1),
    riskId: genId('RSK', idx + 1),
    title,
    description: `Risk: ${title}`,
    projectId: projects[idx % projects.length].id,
    category: categories[Math.floor(Math.random() * categories.length)],
    probability: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
    impact: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
    status: ['Open', 'Monitoring', 'Mitigated', 'Closed'][Math.floor(Math.random() * 4)] as 'Open' | 'Monitoring' | 'Mitigated' | 'Closed',
    owner: 'Project Manager',
    dueDate: getDate(30 + idx * 15),
    createdAt: getDate(-60 + idx * 5)
  }));
};

export const seedMitigationActions = (): MitigationAction[] => {
  const risks = seedRisks();
  const actions = [
    'Hire external consultants', 'Cross-train team members', 'Conduct proof of concept',
    'Increase testing coverage', 'Add contingency buffer', 'Implement risk monitoring',
    'Establish escalation process', 'Create backup plans', 'Engage stakeholders early',
    'Review and adjust scope', 'Negotiate better terms', 'Enhance security measures',
    'Provide additional training', 'Increase resources', 'Revise timeline'
  ];
  const statuses: MitigationAction['status'][] = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

  return Array.from({ length: 30 }, (_, idx) => ({
    id: genId('MIT', idx + 1),
    actionId: genId('MIT', idx + 1),
    riskId: risks[idx % risks.length].id,
    action: actions[idx % actions.length],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    dueDate: getDate(30 + idx * 10),
    completedDate: idx % 4 === 0 ? getDate(-10 + idx * 5) : '',
    owner: 'Project Manager'
  }));
};

export const seedContingencyPlans = (): ContingencyPlan[] => {
  const risks = seedRisks();
  const triggers = ['Risk probability exceeds 60%', 'Budget variance >15%', 'Timeline slip >2 weeks', 'Resource leaves project'];
  const responses = ['Activate backup team', 'Extend timeline', 'Reduce scope', 'Seek additional funding'];

  return risks.slice(0, 20).map((risk, idx) => ({
    id: genId('CP', idx + 1),
    riskId: risk.id,
    trigger: triggers[idx % triggers.length],
    response: responses[idx % responses.length],
    responsible: 'Project Manager',
    resources: 'Additional budget allocation'
  }));
};

// ==================== Document Management Seeds ====================
export const seedDocuments = (): ProjectDocument[] => {
  const projects = seedProjectPlans();
  const docTypes: ProjectDocument['type'][] = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'Image', 'Other'];
  const statuses: ProjectDocument['status'][] = ['Draft', 'Review', 'Approved', 'Archived'];
  const names = [
    'Project Charter', 'Technical Specification', 'Test Plan', 'User Manual',
    'Architecture Document', 'Requirements Document', 'Design Document',
    'API Documentation', 'Training Materials', 'Security Assessment',
    'Risk Register', 'Status Report', 'Budget Report', 'Meeting Minutes',
    'Presentation Deck', 'Data Dictionary', 'Migration Plan', 'Deployment Guide',
    'Quality Report', 'Change Request', 'Issue Log', 'Lessons Learned',
    'Business Case', 'Feasibility Study', 'Cost Benefit Analysis',
    'Stakeholder Analysis', 'Communication Plan', 'Resource Plan', 'Schedule'
  ];

  return names.map((name, idx) => ({
    id: genId('DOC', idx + 1),
    docId: genId('DOC', idx + 1),
    name,
    type: docTypes[Math.floor(Math.random() * docTypes.length)],
    size: Math.floor(Math.random() * 10000000) + 100000,
    sizeFormatted: `${(Math.random() * 10 + 0.1).toFixed(1)} MB`,
    projectId: projects[idx % projects.length].id,
    folderId: genId('FOLD', Math.floor(idx / 5) + 1),
    lastModified: getDate(-30 + idx * 3),
    version: `1.${Math.floor(Math.random() * 10)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdBy: 'User',
    modifiedBy: 'User'
  }));
};

export const seedDocumentFolders = (): DocumentFolder[] => {
  const folderNames = [
    'Project Plans', 'Technical Documents', 'Legal Documents', 'Meeting Minutes',
    'Reports', 'Presentations', 'Training Materials', 'Specifications',
    'Design Documents', 'Test Documents', 'User Guides', 'Architecture',
    'Requirements', 'Budgets', 'Schedules', 'Communications', 'Approvals',
    'Change Requests', 'Risk Documents', 'Quality Documents', 'Compliance',
    'Vendors', 'Contracts', 'Invoices', 'Purchase Orders', 'Receipts',
    'HR Documents', 'Policies', 'Procedures', 'Standards'
  ];

  return folderNames.slice(0, 30).map((name, idx) => ({
    id: genId('FOLD', idx + 1),
    name,
    parentId: idx > 5 ? genId('FOLD', Math.floor(idx / 5) + 1) : null,
    documentCount: Math.floor(Math.random() * 20) + 1,
    totalSize: Math.floor(Math.random() * 50000000) + 1000000,
    lastAccess: getDate(-10 + idx),
    createdBy: 'Admin'
  }));
};

// ==================== Portfolio Management Seeds ====================
export const seedPortfolioProjects = (): PortfolioProject[] => {
  const projects = seedProjectPlans();
  return projects.map((plan, idx) => ({
    id: genId('PF', idx + 1),
    projectId: plan.id,
    name: plan.name,
    description: plan.description,
    priority: plan.priority,
    status: plan.status === 'Active' ? 'In Progress' : plan.status === 'Completed' ? 'Completed' : 'Planning',
    progress: plan.progress,
    budget: plan.estimatedCost,
    actualCost: plan.actualCost,
    roi: `${Math.floor(Math.random() * 30) + 10}%`,
    strategicValue: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as 'High' | 'Medium' | 'Low',
    startDate: plan.startDate,
    endDate: plan.endDate,
    sponsor: plan.sponsor,
    manager: plan.projectManager
  }));
};

export const seedStrategicObjectives = (): StrategicObjective[] => {
  const objectives = [
    'Digital Transformation', 'Operational Excellence', 'Customer Experience',
    'Market Expansion', 'Innovation', 'Sustainability', 'Cost Optimization',
    'Talent Development', 'Risk Management', 'Compliance'
  ];

  return objectives.map((name, idx) => ({
    id: genId('SO', idx + 1),
    name,
    description: `Strategic objective for ${name.toLowerCase()}`,
    projects: Array.from({ length: 5 }, (_, i) => genId('PF', idx * 3 + i + 1)),
    alignmentScore: Math.floor(Math.random() * 30) + 70,
    status: ['On Track', 'At Risk', 'Behind'][Math.floor(Math.random() * 3)] as 'On Track' | 'At Risk' | 'Behind'
  }));
};

export const seedPerformanceMetrics = (): PerformanceMetric[] => {
  const metrics = [
    'Project Success Rate', 'On-Time Delivery', 'Budget Adherence',
    'Resource Utilization', 'Customer Satisfaction', 'Defect Rate',
    'Employee Productivity', 'ROI', 'NPS Score'
  ];

  return metrics.map((name, idx) => ({
    id: genId('PM', idx + 1),
    name,
    value: Math.floor(Math.random() * 30) + 70,
    target: Math.floor(Math.random() * 20) + 80,
    trend: ['+', '-'][Math.floor(Math.random() * 2)] + `${Math.floor(Math.random() * 10) + 1}%`,
    period: 'Q1 2025'
  }));
};

export const seedOptimizationRecommendations = (): OptimizationRecommendation[] => {
  const recommendations = [
    { type: 'Resource', title: 'Reallocate Resources', description: 'Optimize resource distribution across projects' },
    { type: 'Timeline', title: 'Parallel Execution', description: 'Run phases in parallel to save time' },
    { type: 'Budget', title: 'Cost Reduction', description: 'Identify areas to reduce costs' },
    { type: 'Quality', title: 'Process Improvement', description: 'Enhance quality control processes' },
    { type: 'Risk', title: 'Risk Mitigation', description: 'Implement additional risk controls' }
  ];

  return recommendations.flatMap((rec, idx) => Array.from({ length: 2 }, (_, i) => ({
    id: genId('OPT', idx * 2 + i + 1),
    type: rec.type,
    title: rec.title,
    description: rec.description,
    impact: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as 'High' | 'Medium' | 'Low',
    effort: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as 'High' | 'Medium' | 'Low',
    status: ['Proposed', 'Approved', 'Implemented'][Math.floor(Math.random() * 3)] as 'Proposed' | 'Approved' | 'Implemented'
  })));
};

// ==================== Collaboration Seeds ====================
export const seedCommunications = (): Communication[] => {
  const projects = seedProjectPlans();
  const types: Communication['type'][] = ['Message', 'Email', 'Comment'];
  const subjects = [
    'Project Update', 'Status Report', 'Meeting Request', 'Decision Needed',
    'Issue Alert', 'Approval Request', 'Document Review', 'Timeline Change',
    'Budget Discussion', 'Risk Update', 'Resource Request', 'Escalation',
    'Success Story', 'Best Practice', 'Question', 'Information'
  ];

  return Array.from({ length: 30 }, (_, idx) => ({
    id: genId('COMM', idx + 1),
    commId: genId('COMM', idx + 1),
    type: types[Math.floor(Math.random() * types.length)],
    subject: subjects[idx % subjects.length],
    content: `Communication about ${subjects[idx % subjects.length].toLowerCase()}`,
    from: ['John Smith', 'Emma Wilson', 'Mike Johnson', 'Sarah Davis'][idx % 4],
    projectId: projects[idx % projects.length].id,
    timestamp: getDateTime(-7 + idx, 9 + (idx % 8)),
    readStatus: idx % 3 === 0 ? 'Read' : 'Unread'
  }));
};

export const seedMeetings = (): Meeting[] => {
  const projects = seedProjectPlans();
  const titles = [
    'Sprint Planning', 'Design Review', 'Status Meeting', 'Risk Assessment',
    'Budget Review', 'Stakeholder Update', 'Team Standup', 'Retro Meeting',
    'Planning Session', 'Review Meeting', 'Kickoff', 'Workshop',
    'Training Session', 'Demo', 'Demo', 'Q&A Session'
  ];
  const statuses: Meeting['status'][] = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

  return Array.from({ length: 30 }, (_, idx) => ({
    id: genId('MTG', idx + 1),
    meetingId: genId('MTG', idx + 1),
    title: titles[idx % titles.length],
    description: `${titles[idx % titles.length]} meeting`,
    projectId: projects[idx % projects.length].id,
    scheduledAt: getDateTime(idx - 7, 10 + (idx % 6)),
    duration: [30, 60, 90][Math.floor(Math.random() * 3)],
    attendees: Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, i) => `Employee ${i + 1}`),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    host: ['John Smith', 'Emma Wilson', 'Mike Johnson'][idx % 3],
    location: ['Conference Room A', 'Conference Room B', 'Virtual', 'Office'][idx % 4]
  }));
};

export const seedNotificationSettings = (): NotificationSetting[] => {
  const types = ['Task Assignment', 'Meeting Reminder', 'Document Update', 'Project Update', 'Deadline Reminder', 'Risk Alert', 'Budget Approval', 'Milestone Completion', 'Resource Assignment', 'Status Change'];
  const channels: NotificationSetting['channel'][] = ['In-App', 'Email', 'Both'];

  return Array.from({ length: 30 }, (_, idx) => ({
    id: genId('NS', idx + 1),
    userId: genId('USR', idx % 5 + 1),
    type: types[idx % types.length],
    enabled: idx % 4 !== 0,
    channel: channels[idx % channels.length]
  }));
};

export const seedSharedDocuments = (): SharedDocument[] => {
  const accessLevels: SharedDocument['accessLevel'][] = ['View', 'Edit'];
  const users = ['John Smith', 'Emma Wilson', 'Mike Johnson', 'Sarah Davis', 'David Brown', 'Lisa Anderson', 'James Taylor', 'Maria Garcia'];

  return Array.from({ length: 30 }, (_, idx) => ({
    id: genId('SD', idx + 1),
    documentId: genId('DOC', idx % 30 + 1),
    sharedWith: [users[idx % users.length], users[(idx + 1) % users.length]].filter((v, i, a) => a.indexOf(v) === i),
    sharedAt: getDate(-30 + idx * 3),
    sharedBy: users[Math.floor(Math.random() * users.length)],
    accessLevel: accessLevels[Math.floor(Math.random() * accessLevels.length)]
  }));
};

// ==================== Project Detail Seeds ====================
export const seedProjects = (): Project[] => {
  const projects = seedProjectPlans();
  return projects.map((plan, idx) => ({
    id: genId('PRJ', idx + 1),
    projectId: plan.planId,
    name: plan.name,
    description: plan.description,
    status: plan.status,
    progress: plan.progress,
    startDate: plan.startDate,
    endDate: plan.endDate,
    budget: plan.estimatedCost,
    actualCost: plan.actualCost,
    manager: plan.projectManager,
    sponsor: plan.sponsor,
    team: Array.from({ length: 5 }, (_, i) => `Team Member ${i + 1}`),
    priority: plan.priority,
    createdAt: plan.createdAt
  }));
};

export const seedTasks = (): Task[] => {
  const projects = seedProjects();
  const taskNames = [
    'Requirements Analysis', 'System Configuration', 'Data Migration', 'Integration Testing',
    'User Training', 'Documentation', 'Code Review', 'Performance Testing',
    'Security Assessment', 'Deployment', 'UAT Support', 'Bug Fixing',
    'Report Development', 'Workflow Setup', 'Data Validation', 'API Integration',
    'UI Development', 'Database Design', 'Infrastructure Setup', 'Monitoring Configuration',
    'Backup Setup', 'Access Control Configuration', 'Training Development', 'Process Documentation',
    'Quality Testing', 'Compliance Check', 'Vendor Evaluation', 'Risk Assessment',
    'Change Management', 'Stakeholder Communication'
  ];
  const statuses: Task['status'][] = ['Not Started', 'In Progress', 'Completed', 'Cancelled'];

  return taskNames.slice(0, 30).map((name, idx) => ({
    id: genId('TASK', idx + 1),
    taskId: genId('TASK', idx + 1),
    name,
    description: `Task: ${name}`,
    projectId: projects[idx % projects.length].id,
    dueDate: getDate(30 + idx * 10),
    assigneeId: genId('RES', idx % 10 + 1),
    assigneeName: ['John Smith', 'Emma Wilson', 'Mike Johnson', 'Sarah Davis', 'David Brown'][idx % 5],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)] as 'Low' | 'Medium' | 'High' | 'Critical',
    completed: Math.random() > 0.6,
    estimatedHours: Math.floor(Math.random() * 40) + 8,
    actualHours: Math.floor(Math.random() * 30)
  }));
};

export const seedActivities = (): Activity[] => {
  const projects = seedProjects();
  const activityTypes = ['Status Update', 'Document Uploaded', 'Task Completed', 'Meeting Held', 'Risk Updated', 'Milestone Reached'];
  const descriptions = [
    'Updated project status to In Progress',
    'Uploaded new document version',
    'Completed task ahead of schedule',
    'Conducted weekly sync meeting',
    'Identified new risk and mitigation',
    'Reached Phase 1 completion'
  ];

  return Array.from({ length: 30 }, (_, idx) => ({
    id: genId('ACT', idx + 1),
    projectId: projects[idx % projects.length].id,
    type: activityTypes[idx % activityTypes.length],
    description: descriptions[idx % descriptions.length],
    performedBy: ['John Smith', 'Emma Wilson', 'Mike Johnson'][idx % 3],
    timestamp: getDateTime(-14 + idx * 2, 8 + (idx % 8)),
    relatedEntity: `Entity ${idx + 1}`
  }));
};

// ==================== Master Seed Function ====================
export const seedAllProjectManagementData = () => {
  if (typeof window === 'undefined') return;

  const keys = [
    'pm-project-plans', 'pm-project-templates', 'pm-project-objectives',
    'pm-project-milestones', 'pm-executions', 'pm-work-packages',
    'pm-deliverables', 'pm-resources', 'pm-resource-allocations',
    'pm-capacity-plans', 'pm-skills', 'pm-time-entries', 'pm-timesheets',
    'pm-budgets', 'pm-expenses', 'pm-cost-categories', 'pm-forecasts',
    'pm-risks', 'pm-mitigation-actions', 'pm-contingency-plans',
    'pm-documents', 'pm-document-folders', 'pm-portfolio-projects',
    'pm-strategic-objectives', 'pm-performance-metrics', 'pm-optimization-recs',
    'pm-communications', 'pm-meetings', 'pm-notification-settings',
    'pm-projects', 'pm-tasks', 'pm-activities'
  ];

  if (pmDataSeeded) {
    console.log('Project Management data already seeded');
    return;
  }

  console.log('Seeding Project Management data...');
  pmDataSeeded = true;

  // Seed all data
  const plans = seedProjectPlans();
  plans.forEach(p => upsertEntity('pm-project-plans', p));

  const templates = seedProjectTemplates();
  templates.forEach(t => upsertEntity('pm-project-templates', t));

  const objectives = seedProjectObjectives();
  objectives.forEach(o => upsertEntity('pm-project-objectives', o));

  const milestones = seedMilestones();
  milestones.forEach(m => upsertEntity('pm-project-milestones', m));

  const executions = seedExecutions();
  executions.forEach(e => upsertEntity('pm-executions', e));

  const workPackages = seedWorkPackages();
  workPackages.forEach(wp => upsertEntity('pm-work-packages', wp));

  const deliverables = seedDeliverables();
  deliverables.forEach(d => upsertEntity('pm-deliverables', d));

  const resources = seedResources();
  resources.forEach(r => upsertEntity('pm-resources', r));

  const allocations = seedResourceAllocations();
  allocations.forEach(a => upsertEntity('pm-resource-allocations', a));

  const capacity = seedCapacityPlans();
  capacity.forEach(c => upsertEntity('pm-capacity-plans', c));

  const skills = seedSkills();
  skills.forEach(s => upsertEntity('pm-skills', s));

  const timeEntries = seedTimeEntries();
  timeEntries.forEach(te => upsertEntity('pm-time-entries', te));

  const timeReports = seedTimeReports();
  timeReports.forEach(tr => upsertEntity('pm-time-reports', tr));

  const timesheets = seedTimesheets();
  timesheets.forEach(ts => upsertEntity('pm-timesheets', ts));

  const budgets = seedBudgets();
  budgets.forEach(b => upsertEntity('pm-budgets', b));

  const expenses = seedExpenses();
  expenses.forEach(e => upsertEntity('pm-expenses', e));

  const costCategories = seedCostCategories();
  costCategories.forEach(cc => upsertEntity('pm-cost-categories', cc));

  const forecasts = seedCostForecasts();
  forecasts.forEach(f => upsertEntity('pm-forecasts', f));

  const risks = seedRisks();
  risks.forEach(r => upsertEntity('pm-risks', r));

  const mitigations = seedMitigationActions();
  mitigations.forEach(m => upsertEntity('pm-mitigation-actions', m));

  const contingencies = seedContingencyPlans();
  contingencies.forEach(c => upsertEntity('pm-contingency-plans', c));

  const documents = seedDocuments();
  documents.forEach(d => upsertEntity('pm-documents', d));

  const folders = seedDocumentFolders();
  folders.forEach(f => upsertEntity('pm-document-folders', f));

  const portfolio = seedPortfolioProjects();
  portfolio.forEach(p => upsertEntity('pm-portfolio-projects', p));

  const strategies = seedStrategicObjectives();
  strategies.forEach(s => upsertEntity('pm-strategic-objectives', s));

  const metrics = seedPerformanceMetrics();
  metrics.forEach(m => upsertEntity('pm-performance-metrics', m));

  const optimizations = seedOptimizationRecommendations();
  optimizations.forEach(o => upsertEntity('pm-optimization-recs', o));

  const communications = seedCommunications();
  communications.forEach(c => upsertEntity('pm-communications', c));

  const meetings = seedMeetings();
  meetings.forEach(m => upsertEntity('pm-meetings', m));

  const notifSettings = seedNotificationSettings();
  notifSettings.forEach(n => upsertEntity('pm-notification-settings', n));

  const sharedDocs = seedSharedDocuments();
  sharedDocs.forEach(sd => upsertEntity('pm-shared-docs', sd));

  const projects = seedProjects();
  projects.forEach(p => upsertEntity('pm-projects', p));

  const tasks = seedTasks();
  tasks.forEach(t => upsertEntity('pm-tasks', t));

  const activities = seedActivities();
  activities.forEach(a => upsertEntity('pm-activities', a));

  console.log('Project Management data seeded successfully!');
};
