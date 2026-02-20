
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MetricCard from '../../components/metrics/MetricCard';
import BarChartComponent from '../../components/charts/BarChartComponent';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface KPIRecord {
  id: string;
  name: string;
  category: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  period: string;
  status: 'On Track' | 'At Risk' | 'Below Target' | 'Exceeded';
}

const defaultForm: Omit<KPIRecord, 'id'> = {
  name: '',
  category: 'Financial',
  value: 0,
  target: 0,
  unit: '%',
  trend: 0,
  period: '2024-Q1',
  status: 'Below Target',
};

const STORAGE_KEY = 'sap_executivedashboard';

const defaultKPIs: KPIRecord[] = [
  { id: '1', name: 'Total Revenue', category: 'Financial', value: 14200000, target: 13000000, unit: '$', trend: 12.5, period: '2024-Q1', status: 'Exceeded' },
  { id: '2', name: 'Net Profit', category: 'Financial', value: 2800000, target: 2500000, unit: '$', trend: 8.3, period: '2024-Q1', status: 'Exceeded' },
  { id: '3', name: 'Gross Margin', category: 'Financial', value: 38.7, target: 36.0, unit: '%', trend: 2.1, period: '2024-Q1', status: 'On Track' },
  { id: '4', name: 'Operating Margin', category: 'Financial', value: 24.5, target: 22.0, unit: '%', trend: 1.8, period: '2024-Q1', status: 'On Track' },
  { id: '5', name: 'EBITDA', category: 'Financial', value: 3400000, target: 3200000, unit: '$', trend: 9.2, period: '2024-Q1', status: 'On Track' },
  { id: '6', name: 'Cash Flow', category: 'Financial', value: 2100000, target: 2000000, unit: '$', trend: 6.7, period: '2024-Q1', status: 'On Track' },
  { id: '7', name: 'ROI', category: 'Financial', value: 18.5, target: 16.0, unit: '%', trend: 2.3, period: '2024-Q1', status: 'On Track' },
  { id: '8', name: 'Active Customers', category: 'Sales', value: 8547, target: 8000, unit: '', trend: 15.2, period: '2024-Q1', status: 'Exceeded' },
  { id: '9', name: 'Customer Acquisition', category: 'Sales', value: 1250, target: 1000, unit: '', trend: 22.5, period: '2024-Q1', status: 'Exceeded' },
  { id: '10', name: 'Customer Retention', category: 'Sales', value: 87.5, target: 85.0, unit: '%', trend: 2.1, period: '2024-Q1', status: 'On Track' },
  { id: '11', name: 'Sales Growth', category: 'Sales', value: 18.5, target: 15.0, unit: '%', trend: 3.5, period: '2024-Q1', status: 'Exceeded' },
  { id: '12', name: 'Market Share', category: 'Sales', value: 12.3, target: 12.0, unit: '%', trend: 0.8, period: '2024-Q1', status: 'On Track' },
  { id: '13', name: 'Production Efficiency', category: 'Operations', value: 94.2, target: 92.0, unit: '%', trend: 3.1, period: '2024-Q1', status: 'On Track' },
  { id: '14', name: 'Quality Score', category: 'Operations', value: 97.8, target: 96.0, unit: '%', trend: 1.2, period: '2024-Q1', status: 'On Track' },
  { id: '15', name: 'On-Time Delivery', category: 'Operations', value: 95.5, target: 94.0, unit: '%', trend: 2.0, period: '2024-Q1', status: 'On Track' },
  { id: '16', name: 'Inventory Turnover', category: 'Operations', value: 8.2, target: 7.5, unit: 'x', trend: 0.7, period: '2024-Q1', status: 'On Track' },
  { id: '17', name: 'Employee Count', category: 'HR', value: 1243, target: 1200, unit: '', trend: 5.1, period: '2024-Q1', status: 'Exceeded' },
  { id: '18', name: 'Employee Satisfaction', category: 'HR', value: 4.2, target: 4.0, unit: '/5', trend: 0.3, period: '2024-Q1', status: 'On Track' },
  { id: '19', name: 'Turnover Rate', category: 'HR', value: 8.5, target: 10.0, unit: '%', trend: -1.5, period: '2024-Q1', status: 'On Track' },
  { id: '20', name: 'Training Hours', category: 'HR', value: 42, target: 40, unit: 'hrs', trend: 5.0, period: '2024-Q1', status: 'On Track' },
  { id: '21', name: 'IT System Uptime', category: 'IT', value: 99.98, target: 99.9, unit: '%', trend: 0.08, period: '2024-Q1', status: 'On Track' },
  { id: '22', name: 'Cybersecurity Score', category: 'IT', value: 92, target: 90, unit: '%', trend: 3.0, period: '2024-Q1', status: 'On Track' },
  { id: '23', name: 'Digital Transformation', category: 'Strategy', value: 75, target: 70, unit: '%', trend: 10.0, period: '2024-Q1', status: 'On Track' },
  { id: '24', name: 'Innovation Index', category: 'Strategy', value: 68, target: 65, unit: '%', trend: 5.0, period: '2024-Q1', status: 'On Track' },
  { id: '25', name: 'Brand Awareness', category: 'Marketing', value: 72, target: 70, unit: '%', trend: 4.0, period: '2024-Q1', status: 'On Track' },
  { id: '26', name: 'Marketing ROI', category: 'Marketing', value: 325, target: 300, unit: '%', trend: 15.0, period: '2024-Q1', status: 'On Track' },
  { id: '27', name: 'Lead Conversion', category: 'Sales', value: 22.5, target: 20.0, unit: '%', trend: 2.5, period: '2024-Q1', status: 'On Track' },
  { id: '28', name: 'Customer Satisfaction', category: 'Operations', value: 4.7, target: 4.5, unit: '/5', trend: 0.3, period: '2024-Q1', status: 'On Track' },
  { id: '29', name: 'Supply Chain Resilience', category: 'Operations', value: 85, target: 80, unit: '%', trend: 8.0, period: '2024-Q1', status: 'On Track' },
  { id: '30', name: 'Sustainability Score', category: 'Strategy', value: 78, target: 75, unit: '%', trend: 5.0, period: '2024-Q1', status: 'On Track' },
];

const ExecutiveDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const [kpis, setKPIs] = useLocalStorage<KPIRecord[]>(STORAGE_KEY, defaultKPIs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPIRecord | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<KPIRecord | null>(null);
  const [form, setForm] = useState<Omit<KPIRecord, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Executive Dashboard. Access comprehensive business performance insights and key metrics for strategic decision making.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingKPI(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (kpi: KPIRecord) => {
    setEditingKPI(kpi);
    setForm({
      name: kpi.name,
      category: kpi.category,
      value: kpi.value,
      target: kpi.target,
      unit: kpi.unit,
      trend: kpi.trend,
      period: kpi.period,
      status: kpi.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: 'Validation Error', description: 'KPI name is required.', variant: 'destructive' });
      return;
    }
    const status: 'On Track' | 'At Risk' | 'Below Target' | 'Exceeded' = 
      form.value >= form.target ? 'Exceeded' :
      form.value >= form.target * 0.9 ? 'On Track' :
      form.value >= form.target * 0.7 ? 'At Risk' : 'Below Target';

    if (editingKPI) {
      setKPIs(prev => prev.map(k => k.id === editingKPI.id ? { ...editingKPI, ...form, status } : k));
      toast({ title: 'KPI Updated', description: `${form.name} has been updated.` });
    } else {
      const newKPI: KPIRecord = {
        id: String(Date.now()),
        ...form,
        status,
      };
      setKPIs(prev => [...prev, newKPI]);
      toast({ title: 'KPI Created', description: `${form.name} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (kpi: KPIRecord) => {
    setKPIs(prev => prev.filter(k => k.id !== kpi.id));
    toast({ title: 'KPI Deleted', description: `${kpi.name} has been removed.` });
  };

  const handleView = (kpi: KPIRecord) => {
    setSelectedKPI(kpi);
    setIsViewDialogOpen(true);
  };

  const exceededCount = kpis.filter(k => k.status === 'Exceeded').length;
  const onTrackCount = kpis.filter(k => k.status === 'On Track').length;
  const atRiskCount = kpis.filter(k => k.status === 'At Risk').length;

  const kpiData = [
    { name: 'Q1', revenue: 2400000, profit: 400000 },
    { name: 'Q2', revenue: 2800000, profit: 500000 },
    { name: 'Q3', revenue: 3200000, profit: 650000 },
    { name: 'Q4', revenue: 3600000, profit: 720000 }
  ];

  const departmentData = [
    { name: 'Sales', performance: 92 },
    { name: 'Manufacturing', performance: 87 },
    { name: 'Finance', performance: 95 },
    { name: 'HR', performance: 89 }
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'On Track': 'bg-green-100 text-green-800',
      'At Risk': 'bg-yellow-100 text-yellow-800',
      'Below Target': 'bg-red-100 text-red-800',
      'Exceeded': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'name', header: 'KPI Name' },
    { key: 'category', header: 'Category' },
    { key: 'value', header: 'Value', render: (value: number, row: KPIRecord) => `${row.unit === '$' ? '$' : ''}${typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}${row.unit === '%' ? '%' : ''}` },
    { key: 'target', header: 'Target', render: (value: number, row: KPIRecord) => `${row.unit === '$' ? '$' : ''}${typeof value === 'number' && value > 1000 ? value.toLocaleString() : value}${row.unit === '%' ? '%' : ''}` },
    { key: 'trend', header: 'Trend %', render: (value: number) => `${value > 0 ? '+' : ''}${value}%` },
    { key: 'period', header: 'Period' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: KPIRecord) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/business-intelligence')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Executive Dashboard"
          description="Strategic business intelligence and performance metrics"
          voiceIntroduction="Welcome to Executive Dashboard."
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">KPI Records</TabsTrigger>
          <TabsTrigger value="financial">Financial KPIs</TabsTrigger>
          <TabsTrigger value="operational">Operational Metrics</TabsTrigger>
          <TabsTrigger value="strategic">Strategic Initiatives</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Total Revenue"
                value="$14.2M"
                trend={{ value: "12.5%", direction: "up", label: "vs last quarter" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Net Profit"
                value="$2.8M"
                trend={{ value: "8.3%", direction: "up", label: "vs last quarter" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Active Customers"
                value="8,547"
                trend={{ value: "15.2%", direction: "up", label: "vs last quarter" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Employee Count"
                value="1,243"
                trend={{ value: "5.1%", direction: "up", label: "vs last quarter" }}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <BarChartComponent
                data={kpiData}
                dataKey="revenue"
                xAxisKey="name"
                title="Quarterly Revenue Trend"
                subtitle="Revenue performance by quarter"
                height={300}
                color="#0284c7"
              />
            </Card>
            <Card className="p-6">
              <BarChartComponent
                data={departmentData}
                dataKey="performance"
                xAxisKey="name"
                title="Department Performance"
                subtitle="Performance score by department"
                height={300}
                color="#059669"
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">KPI Records</h2>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create KPI
            </Button>
          </div>
          <Card className="p-6">
            <DataTable columns={columns} data={kpis} />
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Exceeded KPIs"
                value={String(exceededCount)}
                trend={{ value: "Exceeded", direction: "up", label: "targets" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="On Track"
                value={String(onTrackCount)}
                trend={{ value: "On Track", direction: "up", label: "targets" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="At Risk"
                value={String(atRiskCount)}
                trend={{ value: "Monitor", direction: "up", label: "needs attention" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Total KPIs"
                value={String(kpis.length)}
                trend={{ value: "30", direction: "up", label: "records" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Production Efficiency"
                value="94.2%"
                trend={{ value: "3.1%", direction: "up", label: "vs last month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Quality Score"
                value="97.8%"
                trend={{ value: "1.2%", direction: "up", label: "vs last month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Customer Satisfaction"
                value="4.7/5"
                trend={{ value: "0.3", direction: "up", label: "vs last month" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Active Initiatives</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Digital Transformation</span>
                  <span className="text-green-600">75% Complete</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Market Expansion</span>
                  <span className="text-blue-600">45% Complete</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sustainability Program</span>
                  <span className="text-orange-600">60% Complete</span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Market Risk</span>
                  <span className="text-yellow-600">Medium</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Operational Risk</span>
                  <span className="text-green-600">Low</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Financial Risk</span>
                  <span className="text-green-600">Low</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingKPI ? 'Edit KPI' : 'Create KPI'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">KPI Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter KPI name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Strategy">Strategy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period">Period</Label>
                <Select value={form.period} onValueChange={(value) => setForm({ ...form, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-Q1">2024-Q1</SelectItem>
                    <SelectItem value="2024-Q2">2024-Q2</SelectItem>
                    <SelectItem value="2024-Q3">2024-Q3</SelectItem>
                    <SelectItem value="2024-Q4">2024-Q4</SelectItem>
                    <SelectItem value="2024-H1">2024-H1</SelectItem>
                    <SelectItem value="2024-H2">2024-H2</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value">Current Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={form.unit} onValueChange={(value) => setForm({ ...form, unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="%">%</SelectItem>
                    <SelectItem value="$">$</SelectItem>
                    <SelectItem value="">Number</SelectItem>
                    <SelectItem value="/5">/5</SelectItem>
                    <SelectItem value="x">x</SelectItem>
                    <SelectItem value="hrs">hrs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trend">Trend %</Label>
                <Input
                  id="trend"
                  type="number"
                  value={form.trend}
                  onChange={(e) => setForm({ ...form, trend: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingKPI ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>KPI Details</DialogTitle>
          </DialogHeader>
          {selectedKPI && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{selectedKPI.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{selectedKPI.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Current Value:</span>
                <span className="font-medium">{selectedKPI.value} {selectedKPI.unit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Target:</span>
                <span className="font-medium">{selectedKPI.target} {selectedKPI.unit}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Trend:</span>
                <span className="font-medium">{selectedKPI.trend > 0 ? '+' : ''}{selectedKPI.trend}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Period:</span>
                <span className="font-medium">{selectedKPI.period}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedKPI.status)}>{selectedKPI.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExecutiveDashboard;
