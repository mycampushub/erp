import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { ArrowLeft, Plus, Users, DollarSign, PieChart, TrendingUp, Eye, Edit, Trash2, RefreshCw, Save } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';
import { useForm } from 'react-hook-form';

export interface CostCenter {
  id: string;
  costCenterNumber: string;
  name: string;
  description: string;
  department: string;
  manager: string;
  hierarchyLevel: number;
  parentCostCenter?: string;
  budget: number;
  actualSpend: number;
  committedSpend: number;
  variance: number;
  variancePercent: number;
  employeeCount: number;
  location: string;
  status: 'Active' | 'Inactive' | 'Archived';
  createdAt: string;
}

export interface CostAllocation {
  id: string;
  allocationNumber: string;
  fromCostCenter: string;
  toCostCenter: string;
  amount: number;
  percentage: number;
  basis: string;
  period: string;
  status: 'Draft' | 'Approved' | 'Posted';
  createdAt: string;
}

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const seedCostCenters = (): CostCenter[] => {
  const now = new Date().toISOString();
  return [
    { id: generateId('cc'), costCenterNumber: 'CC-1000', name: 'Sales - North America', description: 'Sales operations in North America', department: 'Sales', manager: 'John Smith', hierarchyLevel: 1, budget: 2500000, actualSpend: 2350000, committedSpend: 50000, variance: 100000, variancePercent: 4.0, employeeCount: 25, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-1100', name: 'Sales - EMEA', description: 'Sales operations in Europe', department: 'Sales', manager: 'Sarah Johnson', hierarchyLevel: 1, budget: 2000000, actualSpend: 1850000, committedSpend: 75000, variance: 75000, variancePercent: 3.75, employeeCount: 20, location: 'London, UK', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-1200', name: 'Sales - APAC', description: 'Sales operations in Asia Pacific', department: 'Sales', manager: 'Mike Wilson', hierarchyLevel: 1, budget: 1800000, actualSpend: 1650000, committedSpend: 100000, variance: 50000, variancePercent: 2.78, employeeCount: 18, location: 'Singapore', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-2000', name: 'Manufacturing Operations', description: 'Production and manufacturing', department: 'Operations', manager: 'Lisa Brown', hierarchyLevel: 1, budget: 5000000, actualSpend: 4750000, committedSpend: 150000, variance: 100000, variancePercent: 2.0, employeeCount: 150, location: 'Detroit, MI', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-2100', name: 'Production Planning', description: 'Production planning and scheduling', department: 'Operations', manager: 'Tom Davis', hierarchyLevel: 2, parentCostCenter: 'CC-2000', budget: 800000, actualSpend: 750000, committedSpend: 25000, variance: 25000, variancePercent: 3.13, employeeCount: 15, location: 'Detroit, MI', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-2200', name: 'Quality Control', description: 'Product quality assurance', department: 'Operations', manager: 'Emily Chen', hierarchyLevel: 2, parentCostCenter: 'CC-2000', budget: 600000, actualSpend: 550000, committedSpend: 30000, variance: 20000, variancePercent: 3.33, employeeCount: 12, location: 'Detroit, MI', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-2300', name: 'Warehouse & Logistics', description: 'Inventory and shipping', department: 'Operations', manager: 'Robert Lee', hierarchyLevel: 2, parentCostCenter: 'CC-2000', budget: 1200000, actualSpend: 1150000, committedSpend: 20000, variance: 30000, variancePercent: 2.5, employeeCount: 45, location: 'Chicago, IL', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-3000', name: 'Procurement', description: 'Purchasing and vendor management', department: 'Supply Chain', manager: 'Jennifer Martinez', hierarchyLevel: 1, budget: 1500000, actualSpend: 1350000, committedSpend: 75000, variance: 75000, variancePercent: 5.0, employeeCount: 12, location: 'Chicago, IL', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-3100', name: 'Supplier Quality', description: 'Vendor quality management', department: 'Supply Chain', manager: 'David Kim', hierarchyLevel: 2, parentCostCenter: 'CC-3000', budget: 400000, actualSpend: 350000, committedSpend: 25000, variance: 25000, variancePercent: 6.25, employeeCount: 6, location: 'Chicago, IL', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-3200', name: 'Strategic Sourcing', description: 'Strategic vendor relationships', department: 'Supply Chain', manager: 'Amanda White', hierarchyLevel: 2, parentCostCenter: 'CC-3000', budget: 350000, actualSpend: 320000, committedSpend: 15000, variance: 15000, variancePercent: 4.29, employeeCount: 5, location: 'Chicago, IL', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-4000', name: 'Administration', description: 'General administrative functions', department: 'Administration', manager: 'Michael Brown', hierarchyLevel: 1, budget: 3000000, actualSpend: 2850000, committedSpend: 50000, variance: 100000, variancePercent: 3.33, employeeCount: 35, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-4100', name: 'Human Resources', description: 'HR operations and recruitment', department: 'Administration', manager: 'Susan Garcia', hierarchyLevel: 2, parentCostCenter: 'CC-4000', budget: 1200000, actualSpend: 1100000, committedSpend: 50000, variance: 50000, variancePercent: 4.17, employeeCount: 15, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-4200', name: 'Legal & Compliance', description: 'Legal and regulatory affairs', department: 'Administration', manager: 'Richard Thompson', hierarchyLevel: 2, parentCostCenter: 'CC-4000', budget: 900000, actualSpend: 850000, committedSpend: 25000, variance: 25000, variancePercent: 2.78, employeeCount: 8, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-4300', name: 'Facilities Management', description: 'Building and facilities', department: 'Administration', manager: 'Patricia Johnson', hierarchyLevel: 2, parentCostCenter: 'CC-4000', budget: 700000, actualSpend: 680000, committedSpend: 10000, variance: 10000, variancePercent: 1.43, employeeCount: 10, location: 'Multiple', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-5000', name: 'Finance & Accounting', description: 'Financial operations', department: 'Finance', manager: 'Kevin O\'Brien', hierarchyLevel: 1, budget: 2000000, actualSpend: 1850000, committedSpend: 75000, variance: 75000, variancePercent: 3.75, employeeCount: 22, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-5100', name: 'Treasury', description: 'Cash and investment management', department: 'Finance', manager: 'Karen Miller', hierarchyLevel: 2, parentCostCenter: 'CC-5000', budget: 450000, actualSpend: 420000, committedSpend: 15000, variance: 15000, variancePercent: 3.33, employeeCount: 5, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-5200', name: 'Tax', description: 'Tax planning and compliance', department: 'Finance', manager: 'Brian Anderson', hierarchyLevel: 2, parentCostCenter: 'CC-5000', budget: 550000, actualSpend: 500000, committedSpend: 25000, variance: 25000, variancePercent: 4.55, employeeCount: 6, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-5300', name: 'Internal Audit', description: 'Internal audit services', department: 'Finance', manager: 'Nancy Taylor', hierarchyLevel: 2, parentCostCenter: 'CC-5000', budget: 400000, actualSpend: 380000, committedSpend: 10000, variance: 10000, variancePercent: 2.5, employeeCount: 4, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-6000', name: 'Marketing', description: 'Marketing and communications', department: 'Marketing', manager: 'Laura Martinez', hierarchyLevel: 1, budget: 2500000, actualSpend: 2300000, committedSpend: 125000, variance: 75000, variancePercent: 3.0, employeeCount: 18, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-6100', name: 'Brand Management', description: 'Brand strategy and management', department: 'Marketing', manager: 'Chris Wilson', hierarchyLevel: 2, parentCostCenter: 'CC-6000', budget: 800000, actualSpend: 750000, committedSpend: 25000, variance: 25000, variancePercent: 3.13, employeeCount: 6, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-6200', name: 'Digital Marketing', description: 'Online marketing initiatives', department: 'Marketing', manager: 'Jessica Brown', hierarchyLevel: 2, parentCostCenter: 'CC-6000', budget: 700000, actualSpend: 650000, committedSpend: 30000, variance: 20000, variancePercent: 2.86, employeeCount: 8, location: 'San Francisco, CA', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-6300', name: 'Marketing Analytics', description: 'Marketing performance analysis', department: 'Marketing', manager: 'Daniel Lee', hierarchyLevel: 2, parentCostCenter: 'CC-6000', budget: 500000, actualSpend: 450000, committedSpend: 25000, variance: 25000, variancePercent: 5.0, employeeCount: 4, location: 'New York, NY', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-7000', name: 'Research & Development', description: 'Product innovation and R&D', department: 'R&D', manager: 'Dr. Robert Chang', hierarchyLevel: 1, budget: 4000000, actualSpend: 3600000, committedSpend: 250000, variance: 150000, variancePercent: 3.75, employeeCount: 45, location: 'San Jose, CA', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-7100', name: 'Product Development', description: 'New product design and development', department: 'R&D', manager: 'Sharon Taylor', hierarchyLevel: 2, parentCostCenter: 'CC-7000', budget: 1800000, actualSpend: 1650000, committedSpend: 100000, variance: 50000, variancePercent: 2.78, employeeCount: 25, location: 'San Jose, CA', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-7200', name: 'Process Engineering', description: 'Manufacturing process improvement', department: 'R&D', manager: 'Mark Thompson', hierarchyLevel: 2, parentCostCenter: 'CC-7000', budget: 900000, actualSpend: 800000, committedSpend: 50000, variance: 50000, variancePercent: 5.56, employeeCount: 10, location: 'Detroit, MI', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-7300', name: 'Quality Assurance R&D', description: 'Product quality in development', department: 'R&D', manager: 'Linda Harris', hierarchyLevel: 2, parentCostCenter: 'CC-7000', budget: 700000, actualSpend: 620000, committedSpend: 50000, variance: 30000, variancePercent: 4.29, employeeCount: 8, location: 'San Jose, CA', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-8000', name: 'Information Technology', description: 'IT infrastructure and support', department: 'IT', manager: 'Steven Clark', hierarchyLevel: 1, budget: 3500000, actualSpend: 3200000, committedSpend: 175000, variance: 125000, variancePercent: 3.57, employeeCount: 30, location: 'Chicago, IL', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-8100', name: 'IT Infrastructure', description: 'Network and systems', department: 'IT', manager: 'Diane Robinson', hierarchyLevel: 2, parentCostCenter: 'CC-8000', budget: 1500000, actualSpend: 1400000, committedSpend: 50000, variance: 50000, variancePercent: 3.33, employeeCount: 12, location: 'Chicago, IL', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-8200', name: 'Application Development', description: 'Software development', department: 'IT', manager: 'Paul Adams', hierarchyLevel: 2, parentCostCenter: 'CC-8000', budget: 1200000, actualSpend: 1050000, committedSpend: 100000, variance: 50000, variancePercent: 4.17, employeeCount: 10, location: 'San Jose, CA', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-8300', name: 'IT Security', description: 'Cybersecurity operations', department: 'IT', manager: 'Rachel Nelson', hierarchyLevel: 2, parentCostCenter: 'CC-8000', budget: 600000, actualSpend: 550000, committedSpend: 25000, variance: 25000, variancePercent: 4.17, employeeCount: 5, location: 'Chicago, IL', status: 'Active', createdAt: now },
    { id: generateId('cc'), costCenterNumber: 'CC-8400', name: 'IT Support', description: 'Help desk and user support', department: 'IT', manager: 'Anthony Carter', hierarchyLevel: 2, parentCostCenter: 'CC-8000', budget: 400000, actualSpend: 380000, committedSpend: 10000, variance: 10000, variancePercent: 2.5, employeeCount: 8, location: 'New York, NY', status: 'Active', createdAt: now },
  ];
};

const seedAllocations = (): CostAllocation[] => {
  const now = new Date().toISOString();
  return [
    { id: generateId('ca'), allocationNumber: 'CA-2025-001', fromCostCenter: 'CC-4000', toCostCenter: 'CC-1000', amount: 50000, percentage: 5, basis: 'Headcount', period: '2025-Q1', status: 'Posted', createdAt: now },
    { id: generateId('ca'), allocationNumber: 'CA-2025-002', fromCostCenter: 'CC-4000', toCostCenter: 'CC-2000', amount: 150000, percentage: 15, basis: 'Square Footage', period: '2025-Q1', status: 'Posted', createdAt: now },
    { id: generateId('ca'), allocationNumber: 'CA-2025-003', fromCostCenter: 'CC-5000', toCostCenter: 'CC-1000', amount: 75000, percentage: 10, basis: 'Revenue', period: '2025-Q1', status: 'Posted', createdAt: now },
    { id: generateId('ca'), allocationNumber: 'CA-2025-004', fromCostCenter: 'CC-8000', toCostCenter: 'CC-1000', amount: 100000, percentage: 8, basis: 'User Count', period: '2025-Q1', status: 'Approved', createdAt: now },
    { id: generateId('ca'), allocationNumber: 'CA-2025-005', fromCostCenter: 'CC-8000', toCostCenter: 'CC-2000', amount: 200000, percentage: 16, basis: 'User Count', period: '2025-Q1', status: 'Approved', createdAt: now },
  ];
};

const CostCenterAccounting: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('centers');
  const [costCenters, setCostCenters] = useState<CostCenter[]>(() => seedCostCenters());
  const [allocations, setAllocations] = useState<CostAllocation[]>(() => seedAllocations());
  const [isCenterDialogOpen, setIsCenterDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const centerForm = useForm();
  const allocationForm = useForm();

  useEffect(() => {
    if (isEnabled) speak('Welcome to Cost Center Accounting. Manage cost centers, budgets, and cost allocations.');
  }, [isEnabled, speak]);

  const loadData = () => {
    setIsLoading(true);
    setCostCenters(seedCostCenters());
    setAllocations(seedAllocations());
    setIsLoading(false);
  };

  const saveCenters = (data: CostCenter[]) => {
    setCostCenters(data);
  };

  const summary = useMemo(() => {
    const totalBudget = costCenters.reduce((sum, c) => sum + c.budget, 0);
    const totalActual = costCenters.reduce((sum, c) => sum + c.actualSpend, 0);
    const totalVariance = costCenters.reduce((sum, c) => sum + c.variance, 0);
    const totalEmployees = costCenters.reduce((sum, c) => sum + c.employeeCount, 0);
    return { totalBudget, totalActual, totalVariance, totalEmployees };
  }, [costCenters]);

  const centerColumns: EnhancedColumn<Record<string, unknown>>[] = [
    { key: 'costCenterNumber', header: 'Cost Center #', sortable: true },
    { key: 'name', header: 'Name', searchable: true },
    { key: 'department', header: 'Department', searchable: true },
    { key: 'manager', header: 'Manager', searchable: true },
    { key: 'budget', header: 'Budget', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'actualSpend', header: 'Actual', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'variance', header: 'Variance', render: (v: number) => <span className={v >= 0 ? 'text-green-600' : 'text-red-600'}>${v.toLocaleString()}</span> },
    { key: 'variancePercent', header: 'Variance %', render: (v: number) => <span className={v >= 0 ? 'text-green-600' : 'text-red-600'}>{v.toFixed(1)}%</span> },
    { key: 'employeeCount', header: 'Staff' },
    { key: 'status', header: 'Status', render: (v: string) => <Badge className={v === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>{v}</Badge> },
  ];

  const allocationColumns: EnhancedColumn<Record<string, unknown>>[] = [
    { key: 'allocationNumber', header: 'Allocation #', sortable: true },
    { key: 'fromCostCenter', header: 'From CC', sortable: true },
    { key: 'toCostCenter', header: 'To CC', sortable: true },
    { key: 'amount', header: 'Amount', render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'percentage', header: '%' },
    { key: 'basis', header: 'Basis' },
    { key: 'period', header: 'Period' },
    { key: 'status', header: 'Status', render: (v: string) => <Badge className={v === 'Posted' ? 'bg-green-100 text-green-800' : v === 'Approved' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}>{v}</Badge> },
  ];

  if (isLoading) {
    return <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-muted-foreground">Loading Cost Center data...</p></div></div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/finance')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Cost Center Accounting" description="Manage cost centers, budgets, variances, and internal cost allocations" voiceIntroduction="Welcome to Cost Center Accounting." />
      </div>

      <VoiceTrainingComponent module="finance" topic="Cost Center Management" examples={["Managing cost center hierarchies with budget allocation and variance tracking", "Creating internal cost allocations based on various allocation bases like headcount and square footage", "Analyzing cost center performance with budget vs actual comparisons"]} detailLevel="advanced" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{costCenters.length}</div><div className="text-sm text-muted-foreground">Cost Centers</div><div className="text-sm text-blue-600">{costCenters.filter(c => c.status === 'Active').length} active</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">${summary.totalBudget.toLocaleString()}</div><div className="text-sm text-muted-foreground">Total Budget</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">${summary.totalActual.toLocaleString()}</div><div className="text-sm text-muted-foreground">Total Actual</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold">{summary.totalEmployees}</div><div className="text-sm text-muted-foreground">Total Employees</div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="centers">Cost Centers</TabsTrigger><TabsTrigger value="allocations">Allocations</TabsTrigger><TabsTrigger value="reports">Reports</TabsTrigger></TabsList>

        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Cost Centers ({costCenters.length})</span>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                  <Button><Plus className="h-4 w-4 mr-2" />Add Cost Center</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={centerColumns} data={costCenters as unknown as Record<string, unknown>[]} searchPlaceholder="Search cost centers..." exportable={true} refreshable={true} onRefresh={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Cost Allocations ({allocations.length})</span>
                <Button><Plus className="h-4 w-4 mr-2" />New Allocation</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={allocationColumns} data={allocations as unknown as Record<string, unknown>[]} searchPlaceholder="Search allocations..." exportable={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Budget by Department</CardTitle></CardHeader>
              <CardContent>
                {['Sales', 'Operations', 'Supply Chain', 'Administration', 'Finance', 'Marketing', 'R&D', 'IT'].map(dept => {
                  const deptCCs = costCenters.filter(c => c.department === dept);
                  const total = deptCCs.reduce((sum, c) => sum + c.budget, 0);
                  return <div key={dept} className="flex justify-between py-2 border-b"><span>{dept} ({deptCCs.length})</span><span className="font-medium">${total.toLocaleString()}</span></div>;
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Top Variances</CardTitle></CardHeader>
              <CardContent>
                {[...costCenters].sort((a, b) => b.variance - a.variance).slice(0, 8).map(cc => (
                  <div key={cc.costCenterNumber} className="flex justify-between py-2 border-b"><span>{cc.costCenterNumber}</span><span className="font-medium text-green-600">${cc.variance.toLocaleString()}</span></div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostCenterAccounting;
