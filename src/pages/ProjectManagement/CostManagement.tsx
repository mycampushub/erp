
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, AlertTriangle, PieChart, BarChart3, Plus, Edit, Trash2, Target, Calendar } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { 
  CRUDDialog, EnhancedCRUDTable, StatCard, ConfirmDialog,
  formatCurrency, formatDate, ViewDialog
} from '../../lib/projectManagement/CRUDComponents';
import { Budget, Expense, CostForecast, CostCategory, PM_STORAGE_KEYS } from '../../lib/projectManagement/types';

const CostManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('budget');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [forecasts, setForecasts] = useState<CostForecast[]>([]);
  const [categories, setCategories] = useState<CostCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'budget' | 'expense' | 'forecast'>('budget');
  const [isEditing, setIsEditing] = useState(false);

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    const b = listEntities<Budget>(PM_STORAGE_KEYS.BUDGETS);
    const e = listEntities<Expense>(PM_STORAGE_KEYS.EXPENSES);
    const f = listEntities<CostForecast>(PM_STORAGE_KEYS.FORECASTS);
    setBudgets(b);
    setExpenses(e);
    setForecasts(f);
    
    if (b.length > 0) {
      const cats: CostCategory[] = [
        { id: 'cat-001', name: 'Labor', budgeted: 150000, actual: 125000, percentage: 83, description: 'Personnel costs' },
        { id: 'cat-002', name: 'Materials', budgeted: 80000, actual: 72000, percentage: 90, description: 'Project materials' },
        { id: 'cat-003', name: 'Equipment', budgeted: 50000, actual: 35000, percentage: 70, description: 'Equipment rental' },
        { id: 'cat-004', name: 'Travel', budgeted: 20000, actual: 15000, percentage: 75, description: 'Travel expenses' },
      ];
      setCategories(cats);
    }
  }, []);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Cost Management. Track budgets, expenses, and forecast costs.');
    loadData();
  }, [isEnabled, speak, loadData]);

  const handleCRUD = (type: 'budget' | 'expense' | 'forecast', item?: any, edit = false) => {
    setDialogType(type);
    setSelectedItem(item);
    setIsEditing(edit);
    setIsDialogOpen(true);
  };

  const handleView = (item: any, type: 'budget' | 'expense' | 'forecast') => {
    setSelectedItem(item);
    setDialogType(type);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (item: any, type: 'budget' | 'expense' | 'forecast') => {
    setSelectedItem(item);
    setDialogType(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let key: any = PM_STORAGE_KEYS.BUDGETS;
    let setter: any = setBudgets;
    if (dialogType === 'expense') { key = PM_STORAGE_KEYS.EXPENSES; setter = setExpenses; }
    else if (dialogType === 'forecast') { key = PM_STORAGE_KEYS.FORECASTS; setter = setForecasts; }
    
    removeEntity(key, selectedItem.id);
    setter((prev: any[]) => prev.filter((item: any) => item.id !== selectedItem.id));
    toast({ title: 'Deleted', description: 'Item deleted successfully', variant: 'destructive' });
    setIsDeleteDialogOpen(false);
  };

  const handleSave = (data: any) => {
    let key: any = PM_STORAGE_KEYS.BUDGETS;
    let setter: any = setBudgets;
    if (dialogType === 'expense') { key = PM_STORAGE_KEYS.EXPENSES; setter = setExpenses; }
    else if (dialogType === 'forecast') { key = PM_STORAGE_KEYS.FORECASTS; setter = setForecasts; }

    if (isEditing && selectedItem) {
      const updated = { ...selectedItem, ...data };
      upsertEntity(key, updated);
      setter((prev: any[]) => prev.map((item: any) => item.id === selectedItem.id ? updated : item));
      toast({ title: 'Updated', description: 'Item updated successfully' });
    } else {
      const newItem = { ...data, id: generateId(dialogType === 'budget' ? 'bud' : dialogType === 'expense' ? 'exp' : 'fc') };
      upsertEntity(key, newItem);
      setter((prev: any[]) => [newItem, ...prev]);
      toast({ title: 'Created', description: 'Item created successfully' });
    }
    setIsDialogOpen(false);
  };

  const budgetColumns = [
    { key: 'projectName', header: 'Project', sortable: true },
    { key: 'budgeted', header: 'Budgeted', sortable: true, render: (v: number) => formatCurrency(v) },
    { key: 'actual', header: 'Actual', sortable: true, render: (v: number) => formatCurrency(v) },
    { key: 'variance', header: 'Variance', sortable: true, render: (v: number) => (
      <span className={v >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(v)}</span>
    )},
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'Under Budget' ? 'default' : v === 'Over Budget' ? 'destructive' : 'secondary'}>{v}</Badge>
    )},
    { key: 'completion', header: 'Completion', render: (v: number) => <div className="w-16"><Progress value={v} className="h-2" /><span className="text-xs">{v}%</span></div> },
  ];

  const expenseColumns = [
    { key: 'date', header: 'Date', render: (v: string) => formatDate(v) },
    { key: 'projectId', header: 'Project' },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'amount', header: 'Amount', render: (v: number) => formatCurrency(v) },
    { key: 'vendor', header: 'Vendor' },
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'Approved' ? 'default' : v === 'Pending' ? 'secondary' : v === 'Rejected' ? 'destructive' : 'outline'}>{v}</Badge>
    )},
  ];

  const forecastColumns = [
    { key: 'projectId', header: 'Project', sortable: true },
    { key: 'forecastDate', header: 'Forecast Date', render: (v: string) => formatDate(v) },
    { key: 'estimatedCost', header: 'Estimated Cost', sortable: true, render: (v: number) => formatCurrency(v) },
    { key: 'confidence', header: 'Confidence', render: (v: number) => (
      <div className="flex items-center gap-2">
        <Progress value={v} className="w-16 h-2" />
        <span className="text-sm">{v}%</span>
      </div>
    )},
    { key: 'assumptions', header: 'Assumptions', render: (v: string[]) => v?.slice(0, 2).join(', ') || '-' },
  ];

  const getFormFields = () => {
    if (dialogType === 'budget') return [
      { name: 'projectName', label: 'Project Name', type: 'text' as const, required: true },
      { name: 'budgeted', label: 'Budgeted Amount', type: 'currency' as const, required: true },
      { name: 'actual', label: 'Actual Amount', type: 'currency' as const },
      { name: 'period', label: 'Period', type: 'text' as const, placeholder: '2025' },
      { name: 'completion', label: 'Completion %', type: 'number' as const },
    ];
    if (dialogType === 'expense') return [
      { name: 'projectId', label: 'Project ID', type: 'text' as const, required: true },
      { name: 'category', label: 'Category', type: 'text' as const, required: true },
      { name: 'description', label: 'Description', type: 'textarea' as const, rows: 2 },
      { name: 'amount', label: 'Amount', type: 'currency' as const, required: true },
      { name: 'vendor', label: 'Vendor', type: 'text' as const },
      { name: 'date', label: 'Date', type: 'date' as const, required: true },
      { name: 'status', label: 'Status', type: 'select' as const, options: [
        { label: 'Pending', value: 'Pending' }, { label: 'Approved', value: 'Approved' }, { label: 'Rejected', value: 'Rejected' }
      ]},
    ];
    return [
      { name: 'projectId', label: 'Project ID', type: 'text' as const, required: true },
      { name: 'forecastDate', label: 'Forecast Date', type: 'date' as const, required: true },
      { name: 'estimatedCost', label: 'Estimated Cost', type: 'currency' as const, required: true },
      { name: 'confidence', label: 'Confidence %', type: 'number' as const },
      { name: 'assumptions', label: 'Assumptions (comma-separated)', type: 'text' as const },
    ];
  };

  const getViewFields = () => {
    if (dialogType === 'budget') return [
      { key: 'projectName', label: 'Project Name' },
      { key: 'budgeted', label: 'Budgeted Amount', render: (v: number) => formatCurrency(v) },
      { key: 'actual', label: 'Actual Amount', render: (v: number) => formatCurrency(v) },
      { key: 'variance', label: 'Variance', render: (v: number) => formatCurrency(v) },
      { key: 'status', label: 'Status' },
      { key: 'completion', label: 'Completion %' },
      { key: 'period', label: 'Period' },
    ];
    if (dialogType === 'expense') return [
      { key: 'expenseId', label: 'Expense ID' },
      { key: 'projectId', label: 'Project ID' },
      { key: 'category', label: 'Category' },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount', render: (v: number) => formatCurrency(v) },
      { key: 'vendor', label: 'Vendor' },
      { key: 'date', label: 'Date', render: (v: string) => formatDate(v) },
      { key: 'status', label: 'Status' },
    ];
    return [
      { key: 'projectId', label: 'Project ID' },
      { key: 'forecastDate', label: 'Forecast Date', render: (v: string) => formatDate(v) },
      { key: 'estimatedCost', label: 'Estimated Cost', render: (v: number) => formatCurrency(v) },
      { key: 'confidence', label: 'Confidence %' },
      { key: 'assumptions', label: 'Assumptions', render: (v: string[]) => v?.join(', ') || '-' },
    ];
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalActual = budgets.reduce((sum, b) => sum + b.actual, 0);
  const totalForecast = forecasts.reduce((sum, f) => sum + f.estimatedCost, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/project-management')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Cost Management" description="Track budgets, expenses, and forecast costs" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Budget" value={formatCurrency(totalBudget)} icon={<DollarSign className="h-6 w-6 text-green-600" />} />
        <StatCard title="Actual Spend" value={formatCurrency(totalActual)} icon={<TrendingUp className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Forecasted" value={formatCurrency(totalForecast)} icon={<BarChart3 className="h-6 w-6 text-purple-600" />} />
        <StatCard title="Variance" value={formatCurrency(totalBudget - totalActual)} icon={totalBudget - totalActual >= 0 ? <TrendingDown className="h-6 w-6 text-green-600" /> : <AlertTriangle className="h-6 w-6 text-red-600" />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="budget">Budget Tracking</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="analysis">Cost Analysis</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Budgets</h3>
              <Button onClick={() => handleCRUD('budget')}><Plus className="h-4 w-4 mr-2" />Add Budget</Button>
            </div>
            <EnhancedCRUDTable data={budgets} columns={budgetColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('budget')} onEdit={item => handleCRUD('budget', item, true)} onDelete={item => handleDelete(item, 'budget')} onView={item => handleView(item, 'budget')} />
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Expenses</h3>
              <Button onClick={() => handleCRUD('expense')}><Plus className="h-4 w-4 mr-2" />Add Expense</Button>
            </div>
            <EnhancedCRUDTable data={expenses} columns={expenseColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('expense')} onEdit={item => handleCRUD('expense', item, true)} onDelete={item => handleDelete(item, 'expense')} onView={item => handleView(item, 'expense')} />
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center"><BarChart3 className="h-4 w-4 mr-2" />Cost Performance Index</h4>
                <div className="space-y-3">
                  {budgets.slice(0, 5).map((b, i) => {
                    const cpi = b.actual > 0 ? b.budgeted / b.actual : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm"><span>{b.projectName}</span><span className={cpi >= 1 ? 'text-green-600' : 'text-red-600'}>{cpi.toFixed(2)}</span></div>
                        <Progress value={Math.min(cpi * 100, 100)} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center"><PieChart className="h-4 w-4 mr-2" />Cost Categories</h4>
                <div className="space-y-3">
                  {categories.map(cat => (
                    <div key={cat.id}>
                      <div className="flex justify-between text-sm"><span>{cat.name}</span><span>{cat.percentage}%</span></div>
                      <Progress value={cat.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cost Forecasting</h3>
              <Button onClick={() => handleCRUD('forecast')}><Plus className="h-4 w-4 mr-2" />Add Forecast</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {forecasts.map(fc => (
                <Card key={fc.id} className="p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{fc.projectId}</Badge>
                    <span className="text-sm text-gray-500">{formatDate(fc.forecastDate)}</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(fc.estimatedCost)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={fc.confidence} className="flex-1 h-2" />
                    <span className="text-sm">{fc.confidence}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Confidence</p>
                </Card>
              ))}
            </div>
            <EnhancedCRUDTable data={forecasts} columns={forecastColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('forecast')} onEdit={item => handleCRUD('forecast', item, true)} onDelete={item => handleDelete(item, 'forecast')} onView={item => handleView(item, 'forecast')} />
          </Card>
        </TabsContent>
      </Tabs>

      <CRUDDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} 
        title={dialogType === 'budget' ? 'Budget' : dialogType === 'expense' ? 'Expense' : 'Cost Forecast'}
        item={selectedItem} onSave={handleSave} fields={getFormFields()} isEdit={isEditing} />
      
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={confirmDelete} 
        title="Delete Item" description="Are you sure you want to delete this item?" confirmLabel="Delete" />

      <ViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}
        title={dialogType === 'budget' ? 'Budget' : dialogType === 'expense' ? 'Expense' : 'Cost Forecast'}
        item={selectedItem} fields={getViewFields()} />
    </div>
  );
};

export default CostManagement;
