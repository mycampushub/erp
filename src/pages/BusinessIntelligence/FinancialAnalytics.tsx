
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
import { ArrowLeft, DollarSign, TrendingUp, PieChart, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MetricCard from '../../components/metrics/MetricCard';
import BarChartComponent from '../../components/charts/BarChartComponent';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface BudgetItem {
  id: string;
  period: string;
  category: string;
  subCategory: string;
  budget: number;
  actual: number;
  variance: number;
  status: 'On Track' | 'Over Budget' | 'Under Budget' | 'Pending';
  department: string;
}

const defaultForm: Omit<BudgetItem, 'id'> = {
  period: '2024-01',
  category: 'Revenue',
  subCategory: 'Product Sales',
  budget: 0,
  actual: 0,
  variance: 0,
  status: 'Pending',
  department: 'Sales',
};

const STORAGE_KEY = 'sap_financialanalytics';

const defaultBudgetItems: BudgetItem[] = [
  { id: '1', period: '2024-01', category: 'Revenue', subCategory: 'Product Sales', budget: 1200000, actual: 1180000, variance: -20000, status: 'Under Budget', department: 'Sales' },
  { id: '2', period: '2024-01', category: 'Revenue', subCategory: 'Service Revenue', budget: 450000, actual: 480000, variance: 30000, status: 'On Track', department: 'Services' },
  { id: '3', period: '2024-01', category: 'Revenue', subCategory: 'Licensing', budget: 200000, actual: 185000, variance: -15000, status: 'Under Budget', department: 'Licensing' },
  { id: '4', period: '2024-01', category: 'Operating Expenses', subCategory: 'Salaries', budget: 850000, actual: 870000, variance: 20000, status: 'Over Budget', department: 'HR' },
  { id: '5', period: '2024-01', category: 'Operating Expenses', subCategory: 'Rent', budget: 120000, actual: 120000, variance: 0, status: 'On Track', department: 'Facilities' },
  { id: '6', period: '2024-02', category: 'Revenue', subCategory: 'Product Sales', budget: 1250000, actual: 1300000, variance: 50000, status: 'On Track', department: 'Sales' },
  { id: '7', period: '2024-02', category: 'Revenue', subCategory: 'Service Revenue', budget: 460000, actual: 445000, variance: -15000, status: 'Under Budget', department: 'Services' },
  { id: '8', period: '2024-02', category: 'Operating Expenses', subCategory: 'Marketing', budget: 150000, actual: 175000, variance: 25000, status: 'Over Budget', department: 'Marketing' },
  { id: '9', period: '2024-02', category: 'Operating Expenses', subCategory: 'IT Infrastructure', budget: 95000, actual: 92000, variance: -3000, status: 'On Track', department: 'IT' },
  { id: '10', period: '2024-03', category: 'Revenue', subCategory: 'Product Sales', budget: 1300000, actual: 1420000, variance: 120000, status: 'On Track', department: 'Sales' },
  { id: '11', period: '2024-03', category: 'Revenue', subCategory: 'Consulting', budget: 300000, actual: 325000, variance: 25000, status: 'On Track', department: 'Consulting' },
  { id: '12', period: '2024-03', category: 'Operating Expenses', subCategory: 'R&D', budget: 200000, actual: 195000, variance: -5000, status: 'On Track', department: 'R&D' },
  { id: '13', period: '2024-03', category: 'Operating Expenses', subCategory: 'Travel', budget: 80000, actual: 95000, variance: 15000, status: 'Over Budget', department: 'Admin' },
  { id: '14', period: '2024-04', category: 'Revenue', subCategory: 'Product Sales', budget: 1350000, actual: 1280000, variance: -70000, status: 'Under Budget', department: 'Sales' },
  { id: '15', period: '2024-04', category: 'Revenue', subCategory: 'Service Revenue', budget: 480000, actual: 510000, variance: 30000, status: 'On Track', department: 'Services' },
  { id: '16', period: '2024-04', category: 'Operating Expenses', subCategory: 'Utilities', budget: 45000, actual: 48000, variance: 3000, status: 'Over Budget', department: 'Facilities' },
  { id: '17', period: '2024-04', category: 'Operating Expenses', subCategory: 'Training', budget: 60000, actual: 55000, variance: -5000, status: 'On Track', department: 'HR' },
  { id: '18', period: '2024-05', category: 'Revenue', subCategory: 'Product Sales', budget: 1400000, actual: 1550000, variance: 150000, status: 'On Track', department: 'Sales' },
  { id: '19', period: '2024-05', category: 'Revenue', subCategory: 'Licensing', budget: 250000, actual: 265000, variance: 15000, status: 'On Track', department: 'Licensing' },
  { id: '20', period: '2024-05', category: 'Operating Expenses', subCategory: 'Equipment', budget: 100000, actual: 125000, variance: 25000, status: 'Over Budget', department: 'Operations' },
  { id: '21', period: '2024-06', category: 'Revenue', subCategory: 'Product Sales', budget: 1450000, actual: 1380000, variance: -70000, status: 'Under Budget', department: 'Sales' },
  { id: '22', period: '2024-06', category: 'Revenue', subCategory: 'Service Revenue', budget: 500000, actual: 520000, variance: 20000, status: 'On Track', department: 'Services' },
  { id: '23', period: '2024-06', category: 'Operating Expenses', subCategory: 'Insurance', budget: 35000, actual: 35000, variance: 0, status: 'On Track', department: 'Risk' },
  { id: '24', period: '2024-06', category: 'Operating Expenses', subCategory: 'Professional Services', budget: 75000, actual: 68000, variance: -7000, status: 'On Track', department: 'Legal' },
  { id: '25', period: '2024-07', category: 'Revenue', subCategory: 'Product Sales', budget: 1500000, actual: 1620000, variance: 120000, status: 'On Track', department: 'Sales' },
  { id: '26', period: '2024-07', category: 'Revenue', subCategory: 'Consulting', budget: 350000, actual: 380000, variance: 30000, status: 'On Track', department: 'Consulting' },
  { id: '27', period: '2024-07', category: 'Operating Expenses', subCategory: 'Software Licenses', budget: 90000, actual: 105000, variance: 15000, status: 'Over Budget', department: 'IT' },
  { id: '28', period: '2024-08', category: 'Revenue', subCategory: 'Product Sales', budget: 1550000, actual: 1480000, variance: -70000, status: 'Under Budget', department: 'Sales' },
  { id: '29', period: '2024-08', category: 'Operating Expenses', subCategory: 'Marketing', budget: 160000, actual: 145000, variance: -15000, status: 'On Track', department: 'Marketing' },
  { id: '30', period: '2024-08', category: 'Revenue', subCategory: 'Service Revenue', budget: 520000, actual: 545000, variance: 25000, status: 'On Track', department: 'Services' },
];

const FinancialAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const [budgetItems, setBudgetItems] = useLocalStorage<BudgetItem[]>(STORAGE_KEY, defaultBudgetItems);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
  const [form, setForm] = useState<Omit<BudgetItem, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Financial Analytics. Analyze financial performance, cash flow, profitability, and budget variance reports.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingItem(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setForm({
      period: item.period,
      category: item.category,
      subCategory: item.subCategory,
      budget: item.budget,
      actual: item.actual,
      variance: item.variance,
      status: item.status,
      department: item.department,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.category.trim()) {
      toast({ title: 'Validation Error', description: 'Category is required.', variant: 'destructive' });
      return;
    }
    const variance = form.budget - form.actual;
    const status: 'On Track' | 'Over Budget' | 'Under Budget' | 'Pending' = variance > 0 ? 'Under Budget' : variance < 0 ? 'Over Budget' : 'On Track';
    const newForm = { ...form, variance, status };

    if (editingItem) {
      setBudgetItems(prev => prev.map(i => i.id === editingItem.id ? { ...editingItem, ...newForm } : i));
      toast({ title: 'Budget Updated', description: `${form.category} - ${form.subCategory} has been updated.` });
    } else {
      const newItem: BudgetItem = {
        id: String(Date.now()),
        ...newForm,
      };
      setBudgetItems(prev => [...prev, newItem]);
      toast({ title: 'Budget Created', description: `${form.category} - ${form.subCategory} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (item: BudgetItem) => {
    setBudgetItems(prev => prev.filter(i => i.id !== item.id));
    toast({ title: 'Budget Deleted', description: `${item.category} - ${item.subCategory} has been removed.` });
  };

  const handleView = (item: BudgetItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const revenueData = budgetItems
    .filter(i => i.category === 'Revenue')
    .reduce((acc: { month: string; revenue: number; expenses: number }[], item) => {
      const existing = acc.find(a => a.month === item.period);
      if (existing) {
        existing.revenue += item.actual;
      } else {
        acc.push({ month: item.period, revenue: item.actual, expenses: 0 });
      }
      return acc;
    }, []);

  const expenseData = budgetItems
    .filter(i => i.category === 'Operating Expenses')
    .reduce((acc: { month: string; revenue: number; expenses: number }[], item) => {
      const existing = acc.find(a => a.month === item.period);
      if (existing) {
        existing.expenses += item.actual;
      } else {
        acc.push({ month: item.period, revenue: 0, expenses: item.actual });
      }
      return acc;
    }, []);

  const combinedData = [...revenueData, ...expenseData].reduce((acc: { month: string; revenue: number; expenses: number }[], item) => {
    const existing = acc.find(a => a.month === item.month);
    if (existing) {
      existing.revenue += item.revenue;
      existing.expenses += item.expenses;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);

  const totalBudget = budgetItems.reduce((sum, i) => sum + i.budget, 0);
  const totalActual = budgetItems.reduce((sum, i) => sum + i.actual, 0);
  const totalVariance = totalBudget - totalActual;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'On Track': 'bg-green-100 text-green-800',
      'Over Budget': 'bg-red-100 text-red-800',
      'Under Budget': 'bg-yellow-100 text-yellow-800',
      'Pending': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'period', header: 'Period' },
    { key: 'category', header: 'Category' },
    { key: 'subCategory', header: 'Sub Category' },
    { key: 'department', header: 'Department' },
    { key: 'budget', header: 'Budget', render: (value: number) => `$${value.toLocaleString()}` },
    { key: 'actual', header: 'Actual', render: (value: number) => `$${value.toLocaleString()}` },
    { key: 'variance', header: 'Variance', render: (value: number) => `$${value.toLocaleString()}` },
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
      render: (_: any, row: BudgetItem) => (
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
          title="Financial Analytics"
          description="Comprehensive financial performance analysis"
          voiceIntroduction="Welcome to Financial Analytics."
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Total Revenue"
                value={`$${(totalBudget / 1000000).toFixed(1)}M`}
                trend={{ value: "12.5%", direction: "up", label: "YTD" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Total Actual"
                value={`$${(totalActual / 1000000).toFixed(1)}M`}
                trend={{ value: "8.3%", direction: "up", label: "YTD" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Total Variance"
                value={`$${(totalVariance / 1000).toFixed(0)}K`}
                trend={{ value: totalVariance >= 0 ? "Positive" : "Negative", direction: totalVariance >= 0 ? "up" : "down", label: "YTD" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Budget Items"
                value={String(budgetItems.length)}
                trend={{ value: "30", direction: "up", label: "Active" }}
              />
            </Card>
          </div>

          <Card className="p-6">
            <BarChartComponent
              data={combinedData}
              dataKey="revenue"
              xAxisKey="month"
              title="Revenue vs Expenses by Period"
              subtitle="Financial performance over time"
              height={400}
              color="#0284c7"
            />
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Budget Records</h2>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </div>
          <Card className="p-6">
            <DataTable columns={columns} data={budgetItems} />
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Gross Margin"
                value="38.7%"
                trend={{ value: "1.2%", direction: "up", label: "vs last month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Net Margin"
                value="18.9%"
                trend={{ value: "0.8%", direction: "up", label: "vs last month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="ROE"
                value="22.4%"
                trend={{ value: "3.1%", direction: "up", label: "vs last quarter" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Operating Cash Flow"
                value="$1.8M"
                trend={{ value: "9.5%", direction: "up", label: "vs last month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Free Cash Flow"
                value="$1.2M"
                trend={{ value: "7.2%", direction: "up", label: "vs last month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Cash Conversion Cycle"
                value="45 days"
                trend={{ value: "3 days", direction: "down", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Budget Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="period">Period</Label>
                <Input
                  id="period"
                  type="month"
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                    <SelectItem value="Operating Expenses">Operating Expenses</SelectItem>
                    <SelectItem value="Capital Expenditure">Capital Expenditure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subCategory">Sub Category</Label>
                <Input
                  id="subCategory"
                  value={form.subCategory}
                  onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                  placeholder="Enter sub category"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget Amount</Label>
                <Input
                  id="budget"
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="actual">Actual Amount</Label>
                <Input
                  id="actual"
                  type="number"
                  value={form.actual}
                  onChange={(e) => setForm({ ...form, actual: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <Button className="mt-4" onClick={handleSave}>Create Budget Entry</Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                type="month"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Operating Expenses">Operating Expenses</SelectItem>
                  <SelectItem value="Capital Expenditure">Capital Expenditure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subCategory">Sub Category</Label>
              <Input
                id="subCategory"
                value={form.subCategory}
                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="actual">Actual</Label>
                <Input
                  id="actual"
                  type="number"
                  value={form.actual}
                  onChange={(e) => setForm({ ...form, actual: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Budget Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Period:</span>
                <span className="font-medium">{selectedItem.period}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{selectedItem.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Sub Category:</span>
                <span className="font-medium">{selectedItem.subCategory}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Department:</span>
                <span className="font-medium">{selectedItem.department}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Budget:</span>
                <span className="font-medium">${selectedItem.budget.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Actual:</span>
                <span className="font-medium">${selectedItem.actual.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Variance:</span>
                <span className="font-medium">${selectedItem.variance.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
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

export default FinancialAnalytics;
