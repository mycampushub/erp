
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Search, Plus, Filter, Edit, Trash2, Download, Calculator, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { SALES_STORAGE_KEYS, CommissionRecord, CommissionPlan, initializeSalesData } from '../../lib/salesData';

const Commission: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [commissionRecords, setCommissionRecords] = useState<CommissionRecord[]>([]);
  const [commissionPlans, setCommissionPlans] = useState<CommissionPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'record' | 'plan'>('record');
  const [selectedItem, setSelectedItem] = useState<CommissionRecord | CommissionPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeSalesData();
    loadData();
  }, []);

  const loadData = () => {
    const storedRecords = listEntities<CommissionRecord>(SALES_STORAGE_KEYS.COMMISSION_RECORDS);
    const storedPlans = listEntities<CommissionPlan>(SALES_STORAGE_KEYS.COMMISSION_PLANS);
    setCommissionRecords(storedRecords);
    setCommissionPlans(storedPlans);
    setIsLoading(false);
  };

  const filteredRecords = commissionRecords.filter(record => 
    record.salesRep.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.recordNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRecord = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setDialogType('record');
    setIsDialogOpen(true);
  };

  const handleCreatePlan = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setDialogType('plan');
    setIsDialogOpen(true);
  };

  const handleEditRecord = (record: CommissionRecord) => {
    setSelectedItem(record);
    setIsEditing(true);
    setDialogType('record');
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: CommissionPlan) => {
    setSelectedItem(plan);
    setIsEditing(true);
    setDialogType('plan');
    setIsDialogOpen(true);
  };

  const handleDeleteRecord = (record: CommissionRecord) => {
    if (window.confirm('Delete this commission record?')) {
      removeEntity(SALES_STORAGE_KEYS.COMMISSION_RECORDS, record.id);
      loadData();
      toast({ title: 'Deleted', description: 'Commission record has been deleted.' });
    }
  };

  const handleDeletePlan = (plan: CommissionPlan) => {
    if (window.confirm('Delete this commission plan?')) {
      removeEntity(SALES_STORAGE_KEYS.COMMISSION_PLANS, plan.id);
      loadData();
      toast({ title: 'Deleted', description: 'Commission plan has been deleted.' });
    }
  };

  const handleSaveRecord = (data: Partial<CommissionRecord>) => {
    if (isEditing && selectedItem) {
      upsertEntity(SALES_STORAGE_KEYS.COMMISSION_RECORDS, { ...selectedItem, ...data } as CommissionRecord);
      toast({ title: 'Updated', description: 'Commission record has been updated.' });
    } else {
      const newRecord: CommissionRecord = {
        id: generateId('comr'),
        recordNumber: `COM-2025-${String(commissionRecords.length + 1).padStart(3, '0')}`,
        salesRep: data.salesRep || '',
        salesRepId: data.salesRepId || '',
        period: data.period || '2025-05',
        totalSales: data.totalSales || 0,
        commissionRate: data.commissionRate || 5,
        commissionAmount: (data.totalSales || 0) * (data.commissionRate || 5) / 100,
        bonus: data.bonus || 0,
        totalEarnings: ((data.totalSales || 0) * (data.commissionRate || 5) / 100) + (data.bonus || 0),
        status: 'Pending',
        orders: []
      };
      upsertEntity(SALES_STORAGE_KEYS.COMMISSION_RECORDS, newRecord);
      toast({ title: 'Created', description: 'Commission record has been created.' });
    }
    loadData();
    setIsDialogOpen(false);
  };

  const handleSavePlan = (data: Partial<CommissionPlan>) => {
    if (isEditing && selectedItem) {
      upsertEntity(SALES_STORAGE_KEYS.COMMISSION_PLANS, { ...selectedItem, ...data } as CommissionPlan);
      toast({ title: 'Updated', description: 'Commission plan has been updated.' });
    } else {
      const newPlan: CommissionPlan = {
        id: generateId('comp'),
        planNumber: `PLAN-${String(commissionPlans.length + 1).padStart(3, '0')}`,
        name: data.name || '',
        type: data.type || 'Flat Rate',
        baseRate: data.baseRate || 5,
        isActive: true
      };
      upsertEntity(SALES_STORAGE_KEYS.COMMISSION_PLANS, newPlan);
      toast({ title: 'Created', description: 'Commission plan has been created.' });
    }
    loadData();
    setIsDialogOpen(false);
  };

  const handleCalculateCommissions = () => {
    toast({ title: 'Calculating', description: 'Recalculating all commissions...' });
    setTimeout(() => {
      toast({ title: 'Complete', description: 'Commission calculations updated.' });
      loadData();
    }, 1000);
  };

  const handlePayCommissions = () => {
    toast({ title: 'Processing', description: 'Initiating commission payments...' });
  };

  const recordColumns: EnhancedColumn[] = [
    { key: 'recordNumber', header: 'Commission ID', sortable: true },
    { key: 'salesRep', header: 'Sales Rep', sortable: true, searchable: true },
    { key: 'period', header: 'Period', sortable: true },
    { key: 'totalSales', header: 'Total Sales', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'commissionRate', header: 'Rate', render: (v: number) => `${v}%` },
    { key: 'totalEarnings', header: 'Total Earnings', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'Paid' ? 'default' : value === 'Calculated' ? 'secondary' : value === 'Disputed' ? 'destructive' : 'outline'}>
          {value}
        </Badge>
      )
    }
  ];

  const recordActions: TableAction[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: CommissionRecord) => handleEditRecord(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: CommissionRecord) => handleDeleteRecord(row),
      variant: 'ghost'
    }
  ];

  const planColumns: EnhancedColumn[] = [
    { key: 'planNumber', header: 'Plan ID', sortable: true },
    { key: 'name', header: 'Plan Name', sortable: true, searchable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'baseRate', header: 'Base Rate', render: (v: number) => `${v}%` },
    { key: 'isActive', header: 'Status', render: (v: boolean) => <Badge variant={v ? 'default' : 'outline'}>{v ? 'Active' : 'Inactive'}</Badge> }
  ];

  const planActions: TableAction[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: CommissionPlan) => handleEditPlan(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: CommissionPlan) => handleDeletePlan(row),
      variant: 'ghost'
    }
  ];

  const commissionMetrics = [
    { title: 'Total Commissions', value: `$${(commissionRecords.reduce((sum, r) => sum + r.totalEarnings, 0) / 1000).toFixed(1)}K` },
    { title: 'Paid This Month', value: `$${(commissionRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.totalEarnings, 0) / 1000).toFixed(1)}K` },
    { title: 'Pending Payment', value: `$${(commissionRecords.filter(r => r.status === 'Calculated' || r.status === 'Pending').reduce((sum, r) => sum + r.totalEarnings, 0) / 1000).toFixed(1)}K` },
    { title: 'Active Plans', value: commissionPlans.filter(p => p.isActive).length }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Commission Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCalculateCommissions}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate
          </Button>
          <Button variant="outline" onClick={handlePayCommissions}>
            <DollarSign className="h-4 w-4 mr-2" />
            Process Payments
          </Button>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {commissionMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="records">Commission Records ({commissionRecords.length})</TabsTrigger>
          <TabsTrigger value="plans">Commission Plans ({commissionPlans.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Commission Records</span>
                <Button onClick={handleCreateRecord}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search records..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={recordColumns}
                  data={filteredRecords}
                  actions={recordActions}
                  exportable={true}
                  refreshable={true}
                  onRefresh={loadData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Commission Plans</span>
                <Button onClick={handleCreatePlan}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={planColumns}
                  data={commissionPlans}
                  actions={planActions}
                  exportable={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Charts showing commission trends and sales rep performance.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Calculate commissions based on sales amount and plan.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <span>Monthly Commission Summary</span>
                  <span className="text-xs text-muted-foreground">Detailed monthly breakdown</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <span>Sales Rep Performance</span>
                  <span className="text-xs text-muted-foreground">Individual performance metrics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'record' ? (isEditing ? 'Edit Commission Record' : 'Add Commission Record') : (isEditing ? 'Edit Commission Plan' : 'Create Commission Plan')}
            </DialogTitle>
          </DialogHeader>
          {dialogType === 'record' ? (
            <CommissionRecordForm 
              record={selectedItem as CommissionRecord | null}
              onSave={handleSaveRecord}
              onCancel={() => setIsDialogOpen(false)}
            />
          ) : (
            <CommissionPlanForm 
              plan={selectedItem as CommissionPlan | null}
              onSave={handleSavePlan}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CommissionRecordForm: React.FC<{
  record: CommissionRecord | null;
  onSave: (data: Partial<CommissionRecord>) => void;
  onCancel: () => void;
}> = ({ record, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    salesRep: record?.salesRep || '',
    period: record?.period || '2025-05',
    totalSales: record?.totalSales || 0,
    commissionRate: record?.commissionRate || 5,
    bonus: record?.bonus || 0
  });

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Sales Rep</Label>
          <Input value={formData.salesRep} onChange={(e) => setFormData(p => ({ ...p, salesRep: e.target.value }))} />
        </div>
        <div>
          <Label>Period</Label>
          <Input value={formData.period} onChange={(e) => setFormData(p => ({ ...p, period: e.target.value }))} />
        </div>
        <div>
          <Label>Total Sales</Label>
          <Input type="number" value={formData.totalSales} onChange={(e) => setFormData(p => ({ ...p, totalSales: Number(e.target.value) }))} />
        </div>
        <div>
          <Label>Commission Rate (%)</Label>
          <Input type="number" value={formData.commissionRate} onChange={(e) => setFormData(p => ({ ...p, commissionRate: Number(e.target.value) }))} />
        </div>
        <div>
          <Label>Bonus</Label>
          <Input type="number" value={formData.bonus} onChange={(e) => setFormData(p => ({ ...p, bonus: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>{record ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
};

const CommissionPlanForm: React.FC<{
  plan: CommissionPlan | null;
  onSave: (data: Partial<CommissionPlan>) => void;
  onCancel: () => void;
}> = ({ plan, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    type: plan?.type || 'Flat Rate' as const,
    baseRate: plan?.baseRate || 5
  });

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Plan Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(v: any) => setFormData(p => ({ ...p, type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Flat Rate">Flat Rate</SelectItem>
              <SelectItem value="Tiered">Tiered</SelectItem>
              <SelectItem value="Progressive">Progressive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Base Rate (%)</Label>
          <Input type="number" value={formData.baseRate} onChange={(e) => setFormData(p => ({ ...p, baseRate: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>{plan ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
};

export default Commission;
