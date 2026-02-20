import { generateId } from '../lib/localCrud';

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager: string;
  managerId: string;
  startDate: string;
  status: 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
  location: string;
  salary: number;
  employeeType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  workSchedule: string;
  skills: string[];
  certifications: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  hireDate: string;
  employmentHistory: {
    position: string;
    department: string;
    startDate: string;
    endDate?: string;
  }[];
  performanceRating: number;
  avatar?: string;
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  breakTime: number;
  overtime: number;
  status: 'Complete' | 'In Progress' | 'Absent' | 'Late';
  location: string;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Vacation' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity' | 'Bereavement';
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  reason: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  period: string;
  baseSalary: number;
  overtime: number;
  bonus: number;
  commission: number;
  grossSalary: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  healthInsurance: number;
  retirement: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Processed' | 'Failed';
  payDate: string;
  bankAccount: string;
  ytdEarnings: number;
  ytdDeductions: number;
}

export interface TalentProfile {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  performanceRating: number;
  potentialRating: 'High' | 'Medium' | 'Low';
  careerLevel: string;
  skillGaps: number;
  skills: string[];
  missingSkills: string[];
  lastReview: string;
  nextReview: string;
  status: 'Star Performer' | 'High Potential' | 'Core Performer' | 'Development' | 'Underperformer';
  readinessLevel: 'Ready Now' | 'Ready 1 Year' | 'Ready 2+ Years' | 'Not Ready';
  developmentPlanId?: string;
}

export interface DevelopmentPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  focusAreas: string[];
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progress: number;
  activities: {
    name: string;
    dueDate: string;
    status: 'Pending' | 'Completed';
  }[];
}

export interface LearningProgram {
  id: string;
  programId: string;
  title: string;
  description: string;
  category: string;
  provider: string;
  duration: string;
  durationHours: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  format: 'Online' | 'In-Person' | 'Hybrid';
  enrolled: number;
  completed: number;
  completionRate: number;
  status: 'Active' | 'Completed' | 'Draft' | 'Archived';
  startDate: string;
  endDate?: string;
  prerequisites: string[];
  objectives: string[];
  instructor?: string;
}

export interface CourseEnrollment {
  id: string;
  programId: string;
  programName: string;
  employeeId: string;
  employeeName: string;
  enrollmentDate: string;
  completionDate?: string;
  status: 'Enrolled' | 'In Progress' | 'Completed' | 'Dropped';
  progress: number;
  score?: number;
  certificateIssued: boolean;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'Active' | 'Expired' | 'Pending Renewal';
  employeeId: string;
  employeeName: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  reviewPeriod: string;
  reviewType: 'Annual' | 'Mid-Year' | 'Quarterly' | 'Probation';
  overallRating: number;
  goalAchievement: number;
  competencyScore: number;
  selfAssessmentRating: number;
  managerRating: number;
  peerRating?: number;
  reviewer: string;
  reviewerId: string;
  status: 'Draft' | 'Pending Self-Assessment' | 'Pending Manager' | 'Completed';
  dueDate: string;
  completedDate?: string;
  strengths: string[];
  areasForImprovement: string[];
  comments: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  category: string;
  weight: number;
  startDate: string;
  targetDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled';
  progress: number;
  measurableOutcome: string;
  alignment: string;
}

export interface SuccessionPlan {
  id: string;
  positionId: string;
  position: string;
  department: string;
  currentHolder: string;
  currentHolderId: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  successors: number;
  readyNow: number;
  ready1Year: number;
  ready2Plus: number;
  status: 'Active' | 'Critical' | 'Complete';
  lastReviewDate: string;
  nextReviewDate: string;
  successorsList: {
    name: string;
    employeeId: string;
    readiness: 'Ready Now' | 'Ready 1 Year' | 'Ready 2+ Years';
    readinessScore: number;
    developmentNeeds: string[];
  }[];
}

export interface JobOpening {
  id: string;
  jobId: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  level: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Manager' | 'Director';
  experienceRequired: number;
  educationRequired: string;
  applications: number;
  interviewed: number;
  offered: number;
  hired: number;
  status: 'Active' | 'Filled' | 'Closed' | 'On Hold' | 'Draft';
  deadline: string;
  postedDate: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  description: string;
  responsibilities: string[];
  benefits: string[];
  hiringManager: string;
  hiringManagerId: string;
  recruiter: string;
}

export interface Candidate {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  jobId: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  source: string;
  experience: number;
  education: string;
  location: string;
  appliedDate: string;
  resumeUrl?: string;
  skills: string[];
  rating: number;
  notes: string;
  interviewStages: {
    stage: string;
    date?: string;
    interviewer?: string;
    rating?: number;
    notes?: string;
  }[];
  offerAmount?: number;
  offerDate?: string;
}

export interface CompensationBand {
  id: string;
  bandId: string;
  level: string;
  department: string;
  jobFamily: string;
  minSalary: number;
  midSalary: number;
  maxSalary: number;
  employees: number;
  avgSalary: number;
  compaRatio: number;
  status: 'Active' | 'Review' | 'Inactive';
  effectiveDate: string;
  marketMin: number;
  marketMid: number;
  marketMax: number;
}

export interface SalaryPlanning {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  currentSalary: number;
  newSalary: number;
  meritIncrease: number;
  promotionIncrease: number;
  adjustment: number;
  totalIncrease: number;
  compaRatio: number;
  newCompaRatio: number;
  effectiveDate: string;
  status: 'Draft' | 'Submitted' | 'Approved';
  approvedBy?: string;
}

export interface BenefitPlan {
  id: string;
  planId: string;
  planName: string;
  category: 'Health' | 'Dental' | 'Vision' | 'Life' | 'Disability' | 'Retirement' | 'FSA' | 'HSA' | 'Other';
  provider: string;
  planType: 'PPO' | 'HMO' | 'EPO' | 'HDHP' | ' Indemnity';
  enrolled: number;
  eligible: number;
  enrollmentRate: number;
  monthlyCost: number;
  employerContribution: number;
  employeeCost: number;
  status: 'Active' | 'Open Enrollment' | 'Inactive';
  effectiveDate: string;
  description: string;
  coverage: {
    employee: boolean;
    spouse: boolean;
    dependents: boolean;
  };
}

export interface BenefitEnrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  planId: string;
  planName: string;
  category: string;
  enrollmentDate: string;
  effectiveDate: string;
  status: 'Active' | 'Pending' | 'Terminated';
  coverageLevel: 'Employee' | 'Employee + Spouse' | 'Employee + Children' | 'Family';
  monthlyCost: number;
  employerContribution: number;
  dependentCount: number;
}

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const departments = ['Information Technology', 'Human Resources', 'Finance', 'Sales', 'Marketing', 'Operations', 'Engineering', 'Customer Service', 'Legal', 'Research & Development'];

const positions: Record<string, string[]> = {
  'Information Technology': ['Software Engineer', 'Senior Software Engineer', 'IT Manager', 'System Administrator', 'DevOps Engineer', 'QA Engineer', 'Data Analyst', 'IT Support Specialist'],
  'Human Resources': ['HR Manager', 'HR Specialist', 'Recruiter', 'HR Coordinator', 'Benefits Administrator', 'Training Manager'],
  'Finance': ['Financial Analyst', 'Senior Accountant', 'Finance Manager', 'Controller', 'Payroll Specialist', 'Accounts Payable'],
  'Sales': ['Sales Representative', 'Account Executive', 'Sales Manager', 'Business Development Rep', 'Sales Director'],
  'Marketing': ['Marketing Manager', 'Marketing Specialist', 'Content Writer', 'SEO Specialist', 'Brand Manager', 'Digital Marketing'],
  'Operations': ['Operations Manager', 'Operations Analyst', 'Supply Chain Manager', 'Project Manager', 'Business Analyst'],
  'Engineering': ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Engineering Manager', 'Product Engineer'],
  'Customer Service': ['Customer Service Rep', 'Support Specialist', 'Customer Success Manager', 'Call Center Manager'],
  'Legal': ['Legal Counsel', 'Paralegal', 'Compliance Officer', 'Contract Manager'],
  'Research & Development': ['R&D Scientist', 'Research Manager', 'Lab Technician', 'Product Developer']
};

const locations = ['New York Office', 'Los Angeles Office', 'Chicago Office', 'Houston Office', 'Phoenix Office', 'San Francisco Office', 'Seattle Office', 'Boston Office', 'Denver Office', 'Austin Office', 'Remote'];

const skills: Record<string, string[]> = {
  'Information Technology': ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'TypeScript', 'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL'],
  'Human Resources': ['Recruiting', 'Employee Relations', 'HRIS', 'Performance Management', 'Compensation', 'Benefits Administration', 'Training', 'HR Analytics'],
  'Finance': ['Financial Analysis', 'Excel', 'SAP', 'QuickBooks', 'Budgeting', 'Forecasting', 'Accounting', 'Tax Planning'],
  'Sales': ['Salesforce', 'CRM', 'Negotiation', 'Lead Generation', 'Account Management', 'Sales Forecasting', 'B2B Sales'],
  'Marketing': ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media', 'Google Analytics', 'Email Marketing', 'Brand Management'],
  'Operations': ['Project Management', 'Supply Chain', 'Process Improvement', 'Lean Six Sigma', 'Risk Management', 'Business Analysis'],
  'Engineering': ['CAD', 'SolidWorks', 'AutoCAD', 'MATLAB', 'Project Engineering', 'Technical Writing'],
  'Customer Service': ['Customer Support', 'CRM', 'Problem Solving', 'Communication', 'Ticketing Systems'],
  'Legal': ['Contract Law', 'Compliance', 'Legal Research', 'Corporate Law', 'Litigation'],
  'Research & Development': ['Research Methodology', 'Data Analysis', 'Lab Techniques', 'Product Development', 'Clinical Trials']
};

const certifications: Record<string, string[]> = {
  'Information Technology': ['AWS Certified Developer', 'PMP', 'Scrum Master', 'CompTIA Security+', 'Microsoft Azure'],
  'Human Resources': ['SHRM-CP', 'PHR', 'SHRM-SCP', 'GPHR'],
  'Finance': ['CPA', 'CFA', 'FRM', 'CMFA'],
  'Sales': ['HubSpot Sales', 'Salesforce Administrator', 'Strategic Selling'],
  'Marketing': ['Google Analytics', 'HubSpot Inbound', 'Facebook Blueprint'],
  'Operations': ['PMP', 'Six Sigma Green Belt', 'Six Sigma Black Belt', 'CSM'],
  'Engineering': ['PE License', 'LEED AP', 'Six Sigma'],
  'Customer Service': ['HDI Support Center', 'COPC'],
  'Legal': ['Bar License', 'CLS'],
  'Research & Development': ['Good Clinical Practice', 'Certified Research Administrator']
};

const generateEmployees = (): Employee[] => {
  const employees: Employee[] = [];
  const statuses: Employee['status'][] = ['Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'On Leave', 'Inactive'];
  const types: Employee['employeeType'][] = ['Full-time', 'Full-time', 'Full-time', 'Full-time', 'Part-time', 'Contract', 'Intern'];

  for (let i = 0; i < 35; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const department = departments[i % departments.length];
    const deptPositions = positions[department];
    const position = deptPositions[i % deptPositions.length];
    const managerName = i > 0 ? `${firstNames[(i - 1) % firstNames.length]} ${lastNames[(i - 1) % lastNames.length]}` : '';
    
    employees.push({
      id: generateId('emp'),
      employeeId: `EMP-${String(i + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
      position,
      department,
      manager: managerName || 'CEO',
      managerId: i > 0 ? `EMP-${String(i).padStart(3, '0')}` : '',
      startDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      salary: Math.floor(Math.random() * 100000) + 40000,
      employeeType: types[Math.floor(Math.random() * types.length)],
      workSchedule: 'Standard 40hrs/week',
      skills: skills[department] ? skills[department].slice(0, Math.floor(Math.random() * 5) + 2) : [],
      certifications: certifications[department] ? [certifications[department][Math.floor(Math.random() * certifications[department].length)]] : [],
      emergencyContact: {
        name: `${firstNames[(i + 5) % firstNames.length]} ${lastNames[(i + 3) % lastNames.length]}`,
        phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
        relationship: ['Spouse', 'Parent', 'Sibling', 'Friend'][Math.floor(Math.random() * 4)]
      },
      dateOfBirth: new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      address: {
        street: `${Math.floor(Math.random() * 9000) + 1000} Main Street`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
        state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        country: 'USA'
      },
      hireDate: new Date(2018 + Math.floor(Math.random() * 7), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      employmentHistory: [
        {
          position,
          department,
          startDate: new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1).toISOString().split('T')[0]
        }
      ],
      performanceRating: Math.round((Math.random() * 2 + 3) * 10) / 10
    });
  }
  return employees;
};

const generateTimeRecords = (employees: Employee[]): TimeRecord[] => {
  const records: TimeRecord[] = [];
  const statuses: TimeRecord['status'][] = ['Complete', 'Complete', 'Complete', 'Complete', 'In Progress', 'Absent', 'Late'];
  
  for (let i = 0; i < 35; i++) {
    const employee = employees[i % employees.length];
    const clockIn = `${String(Math.floor(Math.random() * 2) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    const hoursWorked = Math.random() * 4 + 7;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    records.push({
      id: generateId('time'),
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clockIn,
      clockOut: status === 'In Progress' ? '-' : `${String(Math.floor(parseInt(clockIn.split(':')[0]) + Math.floor(hoursWorked))).padStart(2, '0')}:${clockIn.split(':')[1]}`,
      totalHours: status === 'In Progress' ? 0 : Math.round(hoursWorked * 10) / 10,
      breakTime: status === 'Complete' ? 0.5 : 0,
      overtime: hoursWorked > 8 ? Math.round((hoursWorked - 8) * 10) / 10 : 0,
      status,
      location: employee.location
    });
  }
  return records;
};

const generateLeaveRequests = (employees: Employee[]): LeaveRequest[] => {
  const requests: LeaveRequest[] = [];
  const leaveTypes: LeaveRequest['leaveType'][] = ['Vacation', 'Sick', 'Personal', 'Maternity', 'Paternity'];
  const statuses: LeaveRequest['status'][] = ['Pending', 'Pending', 'Approved', 'Approved', 'Rejected'];
  
  for (let i = 0; i < 25; i++) {
    const employee = employees[i % employees.length];
    const startDate = new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    const days = Math.floor(Math.random() * 10) + 1;
    
    requests.push({
      id: generateId('leave'),
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
      startDate: startDate.toISOString().split('T')[0],
      endDate: new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalDays: days,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      approvedBy: statuses[i % 5] === 'Approved' ? 'HR Manager' : undefined,
      reason: 'Personal leave request'
    });
  }
  return requests;
};

const generateShifts = (employees: Employee[]): Shift[] => {
  const shifts: Shift[] = [];
  const shiftNames = ['Morning Shift', 'Evening Shift', 'Night Shift', 'Day Shift'];
  const shiftTimes = [
    { start: '06:00', end: '14:00' },
    { start: '14:00', end: '22:00' },
    { start: '22:00', end: '06:00' },
    { start: '09:00', end: '17:00' }
  ];
  
  for (let i = 0; i < 30; i++) {
    const employee = employees[i % employees.length];
    const shiftIndex = Math.floor(Math.random() * 4);
    const date = new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000);
    
    shifts.push({
      id: generateId('shift'),
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      shiftName: shiftNames[shiftIndex],
      startTime: shiftTimes[shiftIndex].start,
      endTime: shiftTimes[shiftIndex].end,
      date: date.toISOString().split('T')[0],
      location: employee.location,
      status: 'Scheduled'
    });
  }
  return shifts;
};

const generatePayrollRecords = (employees: Employee[]): PayrollRecord[] => {
  const records: PayrollRecord[] = [];
  const periods = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
  const statuses: PayrollRecord['status'][] = ['Draft', 'Pending', 'Approved', 'Processed', 'Processed', 'Processed'];
  
  for (let i = 0; i < 35; i++) {
    const employee = employees[i % employees.length];
    const period = periods[Math.floor(Math.random() * periods.length)];
    const baseSalary = employee.salary / 12;
    const overtime = Math.random() * 500;
    const bonus = Math.random() > 0.7 ? Math.random() * 2000 : 0;
    const gross = baseSalary + overtime + bonus;
    
    records.push({
      id: generateId('pay'),
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      position: employee.position,
      period,
      baseSalary: Math.round(baseSalary * 100) / 100,
      overtime: Math.round(overtime * 100) / 100,
      bonus: Math.round(bonus * 100) / 100,
      commission: 0,
      grossSalary: Math.round(gross * 100) / 100,
      federalTax: Math.round(gross * 0.12 * 100) / 100,
      stateTax: Math.round(gross * 0.04 * 100) / 100,
      socialSecurity: Math.round(gross * 0.062 * 100) / 100,
      healthInsurance: 250,
      retirement: Math.round(gross * 0.05 * 100) / 100,
      otherDeductions: 0,
      totalDeductions: Math.round((gross * 0.12 + gross * 0.04 + gross * 0.062 + 250 + gross * 0.05) * 100) / 100,
      netSalary: Math.round((gross - gross * 0.12 - gross * 0.04 - gross * 0.062 - 250 - gross * 0.05) * 100) / 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      payDate: new Date(parseInt(period.split('-')[0]), parseInt(period.split('-')[1]) - 1, 28).toISOString().split('T')[0],
      bankAccount: `****${String(Math.floor(Math.random() * 9000) + 1000)}`,
      ytdEarnings: Math.round(gross * parseInt(period.split('-')[1]) * 100) / 100,
      ytdDeductions: Math.round(gross * parseInt(period.split('-')[1]) * 0.232 * 100) / 100
    });
  }
  return records;
};

const generateTalentProfiles = (employees: Employee[]): TalentProfile[] => {
  const profiles: TalentProfile[] = [];
  const statuses: TalentProfile['status'][] = ['Star Performer', 'High Potential', 'Core Performer', 'Development', 'Underperformer'];
  const potentials: TalentProfile['potentialRating'][] = ['High', 'Medium', 'Low'];
  const readinessLevels: TalentProfile['readinessLevel'][] = ['Ready Now', 'Ready 1 Year', 'Ready 2+ Years', 'Not Ready'];
  
  for (let i = 0; i < 35; i++) {
    const employee = employees[i % employees.length];
    const performanceRating = Math.round((Math.random() * 2 + 3) * 10) / 10;
    
    profiles.push({
      id: generateId('talent'),
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      department: employee.department,
      performanceRating,
      potentialRating: potentials[Math.floor(Math.random() * potentials.length)],
      careerLevel: ['Junior', 'Mid', 'Senior', 'Lead', 'Manager'][Math.floor(Math.random() * 5)],
      skillGaps: Math.floor(Math.random() * 5),
      skills: employee.skills,
      missingSkills: ['Leadership', 'Project Management', 'Public Speaking', 'Strategic Planning', 'Data Analysis'].slice(0, Math.floor(Math.random() * 3)),
      lastReview: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      nextReview: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      readinessLevel: readinessLevels[Math.floor(Math.random() * readinessLevels.length)]
    });
  }
  return profiles;
};

const generateDevelopmentPlans = (employees: Employee[]): DevelopmentPlan[] => {
  const plans: DevelopmentPlan[] = [];
  const titles = ['Leadership Development', 'Technical Skills Enhancement', 'Communication Skills', 'Project Management Certification', 'Cloud Computing Certification'];
  
  for (let i = 0; i < 20; i++) {
    const employee = employees[i % employees.length];
    const activityCount = Math.floor(Math.random() * 5) + 2;
    const activities = [];
    
    for (let j = 0; j < activityCount; j++) {
      activities.push({
        name: `Activity ${j + 1}`,
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: Math.random() > 0.5 ? 'Completed' : 'Pending'
      });
    }
    
    plans.push({
      id: generateId('dev'),
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      focusAreas: ['Leadership', 'Technical Skills', 'Communication'].slice(0, Math.floor(Math.random() * 3) + 1),
      targetDate: new Date(Date.now() + Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: Math.random() > 0.5 ? 'In Progress' : 'Not Started',
      progress: Math.floor(Math.random() * 100),
      activities
    });
  }
  return plans;
};

const generateLearningPrograms = (): LearningProgram[] => {
  const programs: LearningProgram[] = [
    { id: '1', programId: 'LRN-001', title: 'Leadership Development Program', description: 'Comprehensive leadership training for managers', category: 'Management', provider: 'Internal', duration: '40 hours', durationHours: 40, level: 'Advanced', format: 'In-Person', enrolled: 45, completed: 32, completionRate: 71, status: 'Active', startDate: '2025-01-01', endDate: '2025-06-30', prerequisites: ['Management Experience'], objectives: ['Lead teams effectively', 'Strategic thinking'], instructor: 'Dr. Sarah Johnson' },
    { id: '2', programId: 'LRN-002', title: 'Technical Skills Bootcamp', description: 'Intensive technical training', category: 'Technical', provider: 'External', duration: '80 hours', durationHours: 80, level: 'Intermediate', format: 'Online', enrolled: 120, completed: 95, completionRate: 79, status: 'Active', startDate: '2024-12-01', prerequisites: [], objectives: ['Master React', 'Build APIs'], instructor: 'John Smith' },
    { id: '3', programId: 'LRN-003', title: 'Customer Service Excellence', description: 'Best practices for customer interactions', category: 'Soft Skills', provider: 'Internal', duration: '20 hours', durationHours: 20, level: 'Beginner', format: 'Hybrid', enrolled: 78, completed: 78, completionRate: 100, status: 'Completed', startDate: '2024-11-15', endDate: '2024-12-15', prerequisites: [], objectives: ['Handle complaints', 'Build rapport'] },
    { id: '4', programId: 'LRN-004', title: 'Data Analytics with Python', description: 'Learn data analysis using Python', category: 'Technical', provider: 'External', duration: '60 hours', durationHours: 60, level: 'Intermediate', format: 'Online', enrolled: 85, completed: 60, completionRate: 71, status: 'Active', startDate: '2025-02-01', prerequisites: ['Basic Python'], objectives: ['Pandas', 'NumPy', 'Visualization'] },
    { id: '5', programId: 'LRN-005', title: 'Project Management Professional', description: 'PMP certification preparation', category: 'Management', provider: 'External', duration: '120 hours', durationHours: 120, level: 'Advanced', format: 'Hybrid', enrolled: 35, completed: 20, completionRate: 57, status: 'Active', startDate: '2025-01-15', prerequisites: ['3+ years PM experience'], objectives: ['Pass PMP exam', 'Best practices'] },
    { id: '6', programId: 'LRN-006', title: 'Cloud Architecture Fundamentals', description: 'AWS and Azure cloud concepts', category: 'Technical', provider: 'External', duration: '50 hours', durationHours: 50, level: 'Intermediate', format: 'Online', enrolled: 95, completed: 70, completionRate: 74, status: 'Active', startDate: '2025-03-01', prerequisites: ['Basic IT knowledge'], objectives: ['AWS certified', 'Design patterns'] },
    { id: '7', programId: 'LRN-007', title: 'Effective Communication', description: 'Business communication skills', category: 'Soft Skills', provider: 'Internal', duration: '16 hours', durationHours: 16, level: 'Beginner', format: 'In-Person', enrolled: 150, completed: 145, completionRate: 97, status: 'Completed', startDate: '2024-10-01', endDate: '2024-11-01', prerequisites: [], objectives: ['Written communication', 'Presentations'] },
    { id: '8', programId: 'LRN-008', title: 'Financial Analysis Workshop', description: 'Corporate finance and analysis', category: 'Finance', provider: 'External', duration: '30 hours', durationHours: 30, level: 'Advanced', format: 'In-Person', enrolled: 40, completed: 35, completionRate: 88, status: 'Active', startDate: '2025-04-01', prerequisites: ['Finance background'], objectives: ['Valuation', 'Financial modeling'] },
    { id: '9', programId: 'LRN-009', title: 'Agile and Scrum Master', description: 'Agile methodology training', category: 'Technical', provider: 'External', duration: '24 hours', durationHours: 24, level: 'Intermediate', format: 'Hybrid', enrolled: 110, completed: 95, completionRate: 86, status: 'Active', startDate: '2025-02-15', prerequisites: [], objectives: ['Scrum framework', 'Sprint planning'] },
    { id: '10', programId: 'LRN-010', title: 'Diversity and Inclusion', description: 'Workplace D&I training', category: 'Soft Skills', provider: 'Internal', duration: '8 hours', durationHours: 8, level: 'Beginner', format: 'Online', enrolled: 500, completed: 480, completionRate: 96, status: 'Active', startDate: '2025-01-01', prerequisites: [], objectives: ['Understanding bias', 'Inclusive practices'] }
  ];
  
  for (let i = 11; i <= 35; i++) {
    programs.push({
      id: String(i),
      programId: `LRN-${String(i).padStart(3, '0')}`,
      title: `Training Program ${i}`,
      description: `Description for program ${i}`,
      category: ['Technical', 'Management', 'Soft Skills', 'Finance', 'Compliance'][Math.floor(Math.random() * 5)],
      provider: ['Internal', 'External'][Math.floor(Math.random() * 2)],
      duration: `${Math.floor(Math.random() * 40) + 8} hours`,
      durationHours: Math.floor(Math.random() * 40) + 8,
      level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)] as LearningProgram['level'],
      format: ['Online', 'In-Person', 'Hybrid'][Math.floor(Math.random() * 3)] as LearningProgram['format'],
      enrolled: Math.floor(Math.random() * 100) + 10,
      completed: Math.floor(Math.random() * 80),
      completionRate: Math.floor(Math.random() * 40) + 60,
      status: ['Active', 'Completed', 'Draft'][Math.floor(Math.random() * 3)] as LearningProgram['status'],
      startDate: new Date(2024 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
      prerequisites: [],
      objectives: []
    });
  }
  
  return programs;
};

const generatePerformanceReviews = (employees: Employee[]): PerformanceReview[] => {
  const reviews: PerformanceReview[] = [];
  const periods = ['Q4 2024', 'Q3 2024', 'Q2 2024', 'Q1 2025'];
  const statuses: PerformanceReview['status'][] = ['Completed', 'Completed', 'Completed', 'Pending Manager', 'Draft'];
  
  for (let i = 0; i < 35; i++) {
    const employee = employees[i % employees.length];
    const overallRating = Math.round((Math.random() * 2 + 3) * 10) / 10;
    
    reviews.push({
      id: generateId('rev'),
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      position: employee.position,
      department: employee.department,
      reviewPeriod: periods[Math.floor(Math.random() * periods.length)],
      reviewType: ['Annual', 'Mid-Year', 'Quarterly', 'Probation'][Math.floor(Math.random() * 4)] as PerformanceReview['reviewType'],
      overallRating,
      goalAchievement: Math.floor(Math.random() * 40) + 60,
      competencyScore: Math.round((Math.random() * 2 + 3) * 10) / 10,
      selfAssessmentRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      managerRating: overallRating,
      peerRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      reviewer: 'HR Manager',
      reviewerId: 'EMP-001',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      dueDate: new Date(2025, Math.floor(Math.random() * 6), 30).toISOString().split('T')[0],
      completedDate: new Date(2024, Math.floor(Math.random() * 12), 28).toISOString().split('T')[0],
      strengths: ['Strong technical skills', 'Good team player', 'Communication'].slice(0, Math.floor(Math.random() * 3) + 1),
      areasForImprovement: ['Leadership', 'Time management'].slice(0, Math.floor(Math.random() * 2) + 1),
      comments: 'Overall good performance with room for growth in leadership skills.'
    });
  }
  return reviews;
};

const generateGoals = (employees: Employee[]): Goal[] => {
  const goals: Goal[] = [];
  const titles = ['Increase Sales by 20%', 'Complete Certification', 'Launch New Product', 'Improve Customer Satisfaction', 'Reduce Costs', 'Hire 5 New Engineers', 'Complete Training', 'Improve Process Efficiency'];
  const categories = ['Revenue', 'Development', 'Operations', 'Customer', 'Cost', 'Growth', 'Learning', 'Process'];
  
  for (let i = 0; i < 40; i++) {
    const employee = employees[i % employees.length];
    const status = Math.random() > 0.5 ? 'In Progress' : Math.random() > 0.5 ? 'Completed' : 'Not Started';
    
    goals.push({
      id: generateId('goal'),
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      description: 'Goal description',
      category: categories[Math.floor(Math.random() * categories.length)],
      weight: Math.floor(Math.random() * 30) + 10,
      startDate: new Date(2025, 0, 1).toISOString().split('T')[0],
      targetDate: new Date(2025, Math.floor(Math.random() * 12), 31).toISOString().split('T')[0],
      status: status as Goal['status'],
      progress: status === 'Completed' ? 100 : Math.floor(Math.random() * 80),
      measurableOutcome: 'Specific measurable outcome',
      alignment: 'Company Objective'
    });
  }
  return goals;
};

const generateSuccessionPlans = (positions: string[]): SuccessionPlan[] => {
  const plans: SuccessionPlan[] = [];
  const riskLevels: SuccessionPlan['riskLevel'][] = ['Low', 'Medium', 'High', 'Critical'];
  
  const samplePositions = [
    'VP Engineering', 'VP Sales', 'VP Marketing', 'VP Operations', 'CFO', 'CTO', 
    'HR Director', 'Finance Director', 'Sales Director', 'Marketing Director', 'IT Director',
    'Product Manager', 'Engineering Manager', 'Operations Manager', 'Customer Success Manager'
  ];
  
  for (let i = 0; i < 35; i++) {
    const position = samplePositions[i % samplePositions.length];
    const readyNow = Math.floor(Math.random() * 3);
    const ready1Year = Math.floor(Math.random() * 4);
    const ready2Plus = Math.floor(Math.random() * 3);
    
    const successorsList = [];
    for (let j = 0; j < readyNow + ready1Year + ready2Plus; j++) {
      successorsList.push({
        name: `${firstNames[j % firstNames.length]} ${lastNames[j % lastNames.length]}`,
        employeeId: `EMP-${String(j + 1).padStart(3, '0')}`,
        readiness: j < readyNow ? 'Ready Now' : j < readyNow + ready1Year ? 'Ready 1 Year' : 'Ready 2+ Years',
        readinessScore: Math.floor(Math.random() * 30) + 70,
        developmentNeeds: ['Leadership', 'Technical Skills', 'Communication'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }
    
    plans.push({
      id: generateId('succ'),
      positionId: `POS-${String(i + 1).padStart(3, '0')}`,
      position,
      department: departments[Math.floor(Math.random() * departments.length)],
      currentHolder: `${firstNames[(i + 1) % firstNames.length]} ${lastNames[(i + 1) % lastNames.length]}`,
      currentHolderId: `EMP-${String(i + 2).padStart(3, '0')}`,
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      successors: readyNow + ready1Year + ready2Plus,
      readyNow,
      ready1Year,
      ready2Plus,
      status: i % 5 === 0 ? 'Critical' : 'Active',
      lastReviewDate: new Date(2024, Math.floor(Math.random() * 12), 15).toISOString().split('T')[0],
      nextReviewDate: new Date(2025, Math.floor(Math.random() * 12), 15).toISOString().split('T')[0],
      successorsList
    });
  }
  return plans;
};

const generateJobOpenings = (): JobOpening[] => {
  const jobs: JobOpening[] = [
    { id: '1', jobId: 'JOB-2025-001', title: 'Senior Software Engineer', department: 'Information Technology', location: 'New York Office', type: 'Full-time', level: 'Senior', experienceRequired: 5, educationRequired: 'Bachelor\'s Degree', applications: 45, interviewed: 8, offered: 2, hired: 0, status: 'Active', deadline: '2025-02-15', postedDate: '2025-01-01', salary: { min: 120000, max: 160000, currency: 'USD' }, requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience'], description: 'We are seeking a senior software engineer', responsibilities: ['Lead development', 'Code review', 'Mentor team'], benefits: ['Health Insurance', '401k', 'Remote Work'], hiringManager: 'Sarah Johnson', hiringManagerId: 'EMP-002', recruiter: 'HR Team' },
    { id: '2', jobId: 'JOB-2025-002', title: 'Marketing Manager', department: 'Marketing', location: 'Chicago Office', type: 'Full-time', level: 'Manager', experienceRequired: 4, educationRequired: 'Bachelor\'s Degree', applications: 67, interviewed: 12, offered: 1, hired: 1, status: 'Filled', deadline: '2025-01-31', postedDate: '2024-12-15', salary: { min: 90000, max: 120000, currency: 'USD' }, requirements: ['Digital Marketing', 'Campaign Management', '3+ years'], description: 'Lead marketing initiatives', responsibilities: ['Campaign strategy', 'Team management', 'Budget'], benefits: ['Health Insurance', '401k', 'Bonus'], hiringManager: 'Mike Wilson', hiringManagerId: 'EMP-003', recruiter: 'HR Team' },
    { id: '3', jobId: 'JOB-2025-003', title: 'Data Analyst', department: 'Information Technology', location: 'Remote', type: 'Full-time', level: 'Mid', experienceRequired: 2, educationRequired: 'Bachelor\'s Degree', applications: 123, interviewed: 15, offered: 3, hired: 0, status: 'Active', deadline: '2025-02-28', postedDate: '2025-01-15', salary: { min: 70000, max: 90000, currency: 'USD' }, requirements: ['Python', 'SQL', 'Data Visualization'], description: 'Analyze business data', responsibilities: ['Data analysis', 'Reporting', 'Insights'], benefits: ['Health Insurance', '401k', 'Flexible'], hiringManager: 'Jane Doe', hiringManagerId: 'EMP-001', recruiter: 'HR Team' },
    { id: '4', jobId: 'JOB-2025-004', title: 'Sales Representative', department: 'Sales', location: 'Los Angeles Office', type: 'Full-time', level: 'Entry', experienceRequired: 1, educationRequired: 'High School', applications: 89, interviewed: 20, offered: 5, hired: 2, status: 'Active', deadline: '2025-03-15', postedDate: '2025-02-01', salary: { min: 50000, max: 70000, currency: 'USD' }, requirements: ['Communication', 'Sales skills'], description: 'Drive sales revenue', responsibilities: ['Lead generation', 'Client meetings', 'Sales'], benefits: ['Health Insurance', 'Commission', 'Car Allowance'], hiringManager: 'Lisa Davis', hiringManagerId: 'EMP-004', recruiter: 'HR Team' },
    { id: '5', jobId: 'JOB-2025-005', title: 'HR Specialist', department: 'Human Resources', location: 'New York Office', type: 'Full-time', level: 'Mid', experienceRequired: 3, educationRequired: 'Bachelor\'s Degree', applications: 34, interviewed: 6, offered: 1, hired: 1, status: 'Filled', deadline: '2025-01-15', postedDate: '2024-12-20', salary: { min: 60000, max: 80000, currency: 'USD' }, requirements: ['HRIS', 'Recruiting', 'Employee Relations'], description: 'Handle HR functions', responsibilities: ['Recruiting', 'Onboarding', 'Policies'], benefits: ['Health Insurance', '401k', 'PTO'], hiringManager: 'HR Director', hiringManagerId: 'EMP-005', recruiter: 'HR Team' }
  ];
  
  const jobTitles = ['Software Engineer', 'Product Manager', 'UX Designer', 'DevOps Engineer', 'Financial Analyst', 'Account Executive', 'Customer Success Manager', 'Operations Analyst', 'Legal Counsel', 'Research Scientist'];
  
  for (let i = 6; i <= 35; i++) {
    jobs.push({
      id: String(i),
      jobId: `JOB-2025-${String(i).padStart(3, '0')}`,
      title: jobTitles[(i - 6) % jobTitles.length],
      department: departments[(i - 6) % departments.length],
      location: locations[(i - 6) % locations.length],
      type: ['Full-time', 'Part-time', 'Contract', 'Internship'][Math.floor(Math.random() * 4)] as JobOpening['type'],
      level: ['Entry', 'Mid', 'Senior', 'Lead', 'Manager'][Math.floor(Math.random() * 5)] as JobOpening['level'],
      experienceRequired: Math.floor(Math.random() * 8),
      educationRequired: ['High School', 'Bachelor\'s Degree', 'Master\'s Degree'][Math.floor(Math.random() * 3)],
      applications: Math.floor(Math.random() * 100) + 10,
      interviewed: Math.floor(Math.random() * 20),
      offered: Math.floor(Math.random() * 5),
      hired: Math.floor(Math.random() * 3),
      status: ['Active', 'Filled', 'Closed', 'On Hold', 'Draft'][Math.floor(Math.random() * 5)] as JobOpening['status'],
      deadline: new Date(2025, Math.floor(Math.random() * 12), 28).toISOString().split('T')[0],
      postedDate: new Date(2025, Math.floor(Math.random() * 6), 1).toISOString().split('T')[0],
      salary: { min: Math.floor(Math.random() * 50000) + 50000, max: Math.floor(Math.random() * 50000) + 80000, currency: 'USD' },
      requirements: ['Skill 1', 'Skill 2', 'Experience'],
      description: `Job description for position ${i}`,
      responsibilities: ['Duty 1', 'Duty 2'],
      benefits: ['Health', '401k', 'PTO'],
      hiringManager: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      hiringManagerId: `EMP-${String(i).padStart(3, '0')}`,
      recruiter: 'HR Team'
    });
  }
  
  return jobs;
};

const generateCandidates = (jobs: JobOpening[]): Candidate[] => {
  const candidates: Candidate[] = [];
  const statuses: Candidate['status'][] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];
  const sources = ['LinkedIn', 'Indeed', 'Company Website', 'Employee Referral', 'Job Fair', 'Headhunter'];
  
  for (let i = 0; i < 35; i++) {
    const job = jobs[i % jobs.length];
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    
    candidates.push({
      id: generateId('cand'),
      candidateId: `CAND-${String(i + 1).padStart(4, '0')}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
      position: job.title,
      jobId: job.jobId,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      experience: Math.floor(Math.random() * 15),
      education: ['High School', 'Bachelor\'s', 'Master\'s', 'PhD'][Math.floor(Math.random() * 4)],
      location: locations[Math.floor(Math.random() * locations.length)],
      appliedDate: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      skills: ['JavaScript', 'React', 'Python', 'SQL'].slice(0, Math.floor(Math.random() * 4) + 1),
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      notes: 'Good candidate with relevant experience',
      interviewStages: [
        { stage: 'Screening', date: new Date(2025, 1, 15).toISOString().split('T')[0], rating: 4 },
        { stage: 'Technical', date: new Date(2025, 1, 20).toISOString().split('T')[0], rating: 4.5 }
      ],
      offerAmount: Math.floor(Math.random() * 30000) + 80000,
      offerDate: new Date(2025, 2, 1).toISOString().split('T')[0]
    });
  }
  
  return candidates;
};

const generateCompensationBands = (): CompensationBand[] => {
  const bands: CompensationBand[] = [
    { id: '1', bandId: 'BAND-001', level: 'Junior', department: 'Information Technology', jobFamily: 'Engineering', minSalary: 45000, midSalary: 55000, maxSalary: 65000, employees: 23, avgSalary: 52000, compaRatio: 0.95, status: 'Active', effectiveDate: '2025-01-01', marketMin: 50000, marketMid: 60000, marketMax: 70000 },
    { id: '2', bandId: 'BAND-002', level: 'Senior', department: 'Information Technology', jobFamily: 'Engineering', minSalary: 65000, midSalary: 80000, maxSalary: 95000, employees: 45, avgSalary: 78000, compaRatio: 0.98, status: 'Active', effectiveDate: '2025-01-01', marketMin: 70000, marketMid: 85000, marketMax: 100000 },
    { id: '3', bandId: 'BAND-003', level: 'Manager', department: 'Sales', jobFamily: 'Sales', minSalary: 80000, midSalary: 100000, maxSalary: 120000, employees: 12, avgSalary: 95000, compaRatio: 0.95, status: 'Review', effectiveDate: '2025-01-01', marketMin: 85000, marketMid: 105000, marketMax: 125000 },
    { id: '4', bandId: 'BAND-004', level: 'Junior', department: 'Finance', jobFamily: 'Finance', minSalary: 50000, midSalary: 60000, maxSalary: 70000, employees: 15, avgSalary: 58000, compaRatio: 0.97, status: 'Active', effectiveDate: '2025-01-01', marketMin: 52000, marketMid: 62000, marketMax: 72000 },
    { id: '5', bandId: 'BAND-005', level: 'Senior', department: 'Marketing', jobFamily: 'Marketing', minSalary: 60000, midSalary: 75000, maxSalary: 90000, employees: 18, avgSalary: 72000, compaRatio: 0.96, status: 'Active', effectiveDate: '2025-01-01', marketMin: 65000, marketMid: 80000, marketMax: 95000 }
  ];
  
  const levels = ['Intern', 'Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', 'VP'];
  
  for (let i = 6; i <= 35; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const min = Math.floor(Math.random() * 40000) + 40000;
    const mid = Math.floor(min * 1.2);
    const max = Math.floor(mid * 1.3);
    
    bands.push({
      id: String(i),
      bandId: `BAND-${String(i).padStart(3, '0')}`,
      level,
      department: departments[Math.floor(Math.random() * departments.length)],
      jobFamily: ['Engineering', 'Sales', 'Marketing', 'Finance', 'Operations', 'HR'][Math.floor(Math.random() * 6)],
      minSalary: min,
      midSalary: mid,
      maxSalary: max,
      employees: Math.floor(Math.random() * 30) + 1,
      avgSalary: Math.floor((min + max) / 2),
      compaRatio: Math.round((0.9 + Math.random() * 0.2) * 100) / 100,
      status: ['Active', 'Review', 'Inactive'][Math.floor(Math.random() * 3)] as CompensationBand['status'],
      effectiveDate: new Date(2025, 0, 1).toISOString().split('T')[0],
      marketMin: Math.floor(min * 0.95),
      marketMid: Math.floor(mid * 0.95),
      marketMax: Math.floor(max * 0.95)
    });
  }
  
  return bands;
};

const generateBenefitPlans = (): BenefitPlan[] => {
  const plans: BenefitPlan[] = [
    { id: '1', planId: 'BEN-001', planName: 'Health Insurance Premium', category: 'Health', provider: 'Blue Cross Blue Shield', planType: 'PPO', enrolled: 1156, eligible: 1247, enrollmentRate: 93, monthlyCost: 450, employerContribution: 380, employeeCost: 70, status: 'Active', effectiveDate: '2025-01-01', description: 'Comprehensive health coverage', coverage: { employee: true, spouse: true, dependents: true } },
    { id: '2', planId: 'BEN-002', planName: 'Dental Insurance', category: 'Dental', provider: 'Delta Dental', planType: 'PPO', enrolled: 987, eligible: 1247, enrollmentRate: 79, monthlyCost: 65, employerContribution: 50, employeeCost: 15, status: 'Active', effectiveDate: '2025-01-01', description: 'Dental coverage including orthodontics', coverage: { employee: true, spouse: true, dependents: true } },
    { id: '3', planId: 'BEN-003', planName: '401k Retirement', category: 'Retirement', provider: 'Fidelity', planType: 'HDHP', enrolled: 1089, eligible: 1247, enrollmentRate: 87, monthlyCost: 0, employerContribution: 200, employeeCost: 0, status: 'Active', effectiveDate: '2025-01-01', description: '401k with 4% employer match', coverage: { employee: true, spouse: false, dependents: false } },
    { id: '4', planId: 'BEN-004', planName: 'Vision Insurance', category: 'Vision', provider: 'VSP', planType: 'PPO', enrolled: 756, eligible: 1247, enrollmentRate: 61, monthlyCost: 25, employerContribution: 20, employeeCost: 5, status: 'Active', effectiveDate: '2025-01-01', description: 'Annual eye exam and glasses', coverage: { employee: true, spouse: true, dependents: true } },
    { id: '5', planId: 'BEN-005', planName: 'Life Insurance', category: 'Life', provider: 'MetLife', planType: 'EPO', enrolled: 1247, eligible: 1247, enrollmentRate: 100, monthlyCost: 0, employerContribution: 25, employeeCost: 0, status: 'Active', effectiveDate: '2025-01-01', description: '2x annual salary coverage', coverage: { employee: true, spouse: false, dependents: false } }
  ];
  
  const planNames = ['HSA Plan', 'FSA Plan', 'Disability Insurance', 'Accident Insurance', 'Critical Illness', 'Legal Plan', 'EAP Program', 'Wellness Program', 'Tuition Reimbursement', 'Child Care FSA'];
  const categories: BenefitPlan['category'][] = ['Health', 'Dental', 'Vision', 'Life', 'Disability', 'FSA', 'HSA', 'Other'];
  const providers = ['Blue Cross', 'Aetna', 'Cigna', 'United Healthcare', 'MetLife', 'Guardian', 'Principal', 'Lincoln'];
  
  for (let i = 6; i <= 35; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const enrolled = Math.floor(Math.random() * 800) + 200;
    const eligible = enrolled + Math.floor(Math.random() * 200);
    
    plans.push({
      id: String(i),
      planId: `BEN-${String(i).padStart(3, '0')}`,
      planName: planNames[(i - 6) % planNames.length],
      category,
      provider: providers[Math.floor(Math.random() * providers.length)],
      planType: ['PPO', 'HMO', 'HDHP', 'EPO', 'Indemnity'][Math.floor(Math.random() * 5)] as BenefitPlan['planType'],
      enrolled,
      eligible,
      enrollmentRate: Math.floor((enrolled / eligible) * 100),
      monthlyCost: Math.floor(Math.random() * 200),
      employerContribution: Math.floor(Math.random() * 150),
      employeeCost: Math.floor(Math.random() * 100),
      status: ['Active', 'Open Enrollment', 'Inactive'][Math.floor(Math.random() * 3)] as BenefitPlan['status'],
      effectiveDate: new Date(2025, 0, 1).toISOString().split('T')[0],
      description: `Benefit plan ${i}`,
      coverage: { employee: true, spouse: Math.random() > 0.5, dependents: Math.random() > 0.5 }
    });
  }
  
  return plans;
};

export const generateAllHRData = () => {
  const employees = generateEmployees();
  const timeRecords = generateTimeRecords(employees);
  const leaveRequests = generateLeaveRequests(employees);
  const shifts = generateShifts(employees);
  const payrollRecords = generatePayrollRecords(employees);
  const talentProfiles = generateTalentProfiles(employees);
  const developmentPlans = generateDevelopmentPlans(employees);
  const learningPrograms = generateLearningPrograms();
  const performanceReviews = generatePerformanceReviews(employees);
  const goals = generateGoals(employees);
  const successionPlans = generateSuccessionPlans(positions['Information Technology']);
  const jobOpenings = generateJobOpenings();
  const candidates = generateCandidates(jobOpenings);
  const compensationBands = generateCompensationBands();
  const benefitPlans = generateBenefitPlans();
  
  return {
    employees,
    timeRecords,
    leaveRequests,
    shifts,
    payrollRecords,
    talentProfiles,
    developmentPlans,
    learningPrograms,
    performanceReviews,
    goals,
    successionPlans,
    jobOpenings,
    candidates,
    compensationBands,
    benefitPlans
  };
};

export const getSeedData = () => {
  const data = generateAllHRData();
  return {
    employees: data.employees,
    timeRecords: data.timeRecords,
    leaveRequests: data.leaveRequests,
    shifts: data.shifts,
    payrollRecords: data.payrollRecords,
    talentProfiles: data.talentProfiles,
    developmentPlans: data.developmentPlans,
    learningPrograms: data.learningPrograms,
    performanceReviews: data.performanceReviews,
    goals: data.goals,
    successionPlans: data.successionPlans,
    jobOpenings: data.jobOpenings,
    candidates: data.candidates,
    compensationBands: data.compensationBands,
    benefitPlans: data.benefitPlans
  };
};
