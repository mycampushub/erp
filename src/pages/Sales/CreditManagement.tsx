
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Search, AlertCircle, Check, Clock, Ban, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { SALES_STORAGE_KEYS, CreditCheck, CustomerCredit, initializeSalesData } from '../../lib/salesData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const CreditManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('checks');
  const [creditChecks, setCreditChecks] = useState<CreditCheck[]>([]);
  const [customerCredit, setCustomerCredit] = useState<CustomerCredit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'check' | 'customer'>('check');
  const [selectedItem, setSelectedItem] = useState<CreditCheck | CustomerCredit | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeSalesData();
    loadData();
  }, []);

  const loadData = () => {
    const storedChecks = listEntities<CreditCheck>(SALES_STORAGE_KEYS.CREDIT_CHECKS);
    const storedCredit = listEntities<CustomerCredit>(SALES_STORAGE_KEYS.CUSTOMER_CREDIT);
    setCreditChecks(storedChecks);
    setCustomerCredit(storedCredit);
    setIsLoading(false);
  };

  const filteredChecks = creditChecks.filter(check => 
    check.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    check.checkNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCredit = customerCredit.filter(c => 
    c.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCheck = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setDialogType('check');
    setIsDialogOpen(true);
  };

  const handleCreateCustomerCredit = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setDialogType('customer');
    setIsDialogOpen(true);
  };

  const handleEditCheck = (check: CreditCheck) => {
    setSelectedItem(check);
    setIsEditing(true);
    setDialogType('check');
    setIsDialogOpen(true);
  };

  const handleEditCustomerCredit = (credit: CustomerCredit) => {
    setSelectedItem(credit);
    setIsEditing(true);
    setDialogType('customer');
    setIsDialogOpen(true);
  };

  const handleDeleteCheck = (check: CreditCheck) => {
    if (window.confirm(`Delete credit check ${check.checkNumber}?`)) {
      removeEntity(SALES_STORAGE_KEYS.CREDIT_CHECKS, check.id);
      loadData();
      toast({ title: 'Deleted', description: 'Credit check has been deleted.' });
    }
  };

  const handleDeleteCustomerCredit = (credit: CustomerCredit) => {
    if (window.confirm(`Delete credit record for ${credit.customer}?`)) {
      removeEntity(SALES_STORAGE_KEYS.CUSTOMER_CREDIT, credit.id);
      loadData();
      toast({ title: 'Deleted', description: 'Customer credit record has been deleted.' });
    }
  };

  const handleSaveCheck = (data: Partial<CreditCheck>) => {
    if (isEditing && selectedItem) {
      upsertEntity(SALES_STORAGE_KEYS.CREDIT_CHECKS, { ...selectedItem, ...data } as CreditCheck);
      toast({ title: 'Updated', description: 'Credit check has been updated.' });
    } else {
      const newCheck: CreditCheck = {
        id: generateId('cc'),
        checkNumber: `CC-${String(creditChecks.length + 1).padStart(4, '0')}`,
        customer: data.customer || '',
        customerId: data.customerId || '',
        orderRef: data.orderRef || '',
        amount: data.amount || 0,
        checkDate: data.checkDate || new Date().toISOString().split('T')[0],
        status: 'Pending',
        creditLimit: data.creditLimit || 100000,
        currentExposure: data.currentExposure || 0
      };
      upsertEntity(SALES_STORAGE_KEYS.CREDIT_CHECKS, newCheck);
      toast({ title: 'Created', description: 'Credit check has been created.' });
    }
    loadData();
    setIsDialogOpen(false);
  };

  const handleSaveCustomerCredit = (data: Partial<CustomerCredit>) => {
    if (isEditing && selectedItem) {
      upsertEntity(SALES_STORAGE_KEYS.CUSTOMER_CREDIT, { ...selectedItem, ...data } as CustomerCredit);
      toast({ title: 'Updated', description: 'Customer credit has been updated.' });
    } else {
      const newCredit: CustomerCredit = {
        id: generateId('crc'),
        customer: data.customer || '',
        customerId: data.customerId || '',
        creditLimit: data.creditLimit || 100000,
        currentExposure: data.currentExposure || 0,
        riskCategory: data.riskCategory || 'Medium',
        lastReview: data.lastReview || new Date().toISOString().split('T')[0],
        nextReview: data.nextReview || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentHistory: data.paymentHistory || 'Good'
      };
      upsertEntity(SALES_STORAGE_KEYS.CUSTOMER_CREDIT, newCredit);
      toast({ title: 'Created', description: 'Customer credit has been created.' });
    }
    loadData();
    setIsDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <Check className="h-4 w-4 text-green-500" />;
      case 'Pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Blocked': return <Ban className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-amber-100 text-amber-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[risk] || 'bg-gray-100'}>{risk}</Badge>;
  };

  const calculateUsagePercentage = (exposure: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min(Math.round((exposure / limit) * 100), 100);
  };

  const checkColumns: EnhancedColumn[] = [
    { key: 'checkNumber', header: 'Check ID', sortable: true },
    { key: 'customer', header: 'Customer', sortable: true, searchable: true },
    { key: 'orderRef', header: 'Order Ref', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'checkDate', header: 'Check Date', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <div className="flex items-center">
          {getStatusIcon(value)}
          <span className="ml-2">{value}</span>
        </div>
      )
    }
  ];

  const checkActions: TableAction[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: CreditCheck) => handleEditCheck(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: CreditCheck) => handleDeleteCheck(row),
      variant: 'ghost'
    }
  ];

  const creditColumns: EnhancedColumn[] = [
    { key: 'customer', header: 'Customer', sortable: true, searchable: true },
    { key: 'creditLimit', header: 'Credit Limit', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { 
      key: 'currentExposure', 
      header: 'Credit Usage',
      render: (value: number, row: CustomerCredit) => {
        const usage = calculateUsagePercentage(value, row.creditLimit);
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>${value.toLocaleString()}</span>
              <span>{usage}%</span>
            </div>
            <Progress 
              value={usage} 
              max={100}
              className={`h-2 ${usage >= 90 ? 'bg-red-100' : usage >= 75 ? 'bg-amber-100' : 'bg-gray-100'}`}
            />
          </div>
        );
      }
    },
    { 
      key: 'riskCategory', 
      header: 'Risk',
      render: (value: string) => getRiskBadge(value)
    },
    { key: 'lastReview', header: 'Last Review', sortable: true },
    { key: 'nextReview', header: 'Next Review', sortable: true }
  ];

  const creditActions: TableAction[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: CustomerCredit) => handleEditCustomerCredit(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: CustomerCredit) => handleDeleteCustomerCredit(row),
      variant: 'ghost'
    }
  ];

  const creditMetrics = [
    { title: 'Credit Checks', value: creditChecks.length },
    { title: 'Approved', value: creditChecks.filter(c => c.status === 'Approved').length },
    { title: 'Pending', value: creditChecks.filter(c => c.status === 'Pending').length },
    { title: 'High Risk', value: customerCredit.filter(c => c.riskCategory === 'High' || c.riskCategory === 'Critical').length }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Credit Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            Credit Alerts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {creditMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="checks" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checks">Credit Checks ({creditChecks.length})</TabsTrigger>
          <TabsTrigger value="customers">Customer Credit ({customerCredit.length})</TabsTrigger>
          <TabsTrigger value="settings">Credit Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search credit checks..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button onClick={handleCreateCheck}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Credit Check
                </Button>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={checkColumns}
                  data={filteredChecks}
                  actions={checkActions}
                  exportable={true}
                  refreshable={true}
                  onRefresh={loadData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search customers..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button onClick={handleCreateCustomerCredit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Customer Credit
                </Button>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={creditColumns}
                  data={filteredCredit}
                  actions={creditActions}
                  exportable={true}
                  refreshable={true}
                  onRefresh={loadData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6 p-6 flex flex-col items-center justify-center">
              <h3 className="text-lg font-medium mb-2">Credit Management Configuration</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">Configure credit check rules, risk categories, approval workflows, and credit limits</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                <Button variant="outline" className="h-24 flex flex-col">
                  <span className="text-sm font-medium">Credit Limit Rules</span>
                  <span className="text-xs text-muted-foreground mt-1">Configure automatic credit limit determination</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <span className="text-sm font-medium">Risk Categories</span>
                  <span className="text-xs text-muted-foreground mt-1">Define risk levels and scoring models</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <span className="text-sm font-medium">Approval Workflows</span>
                  <span className="text-xs text-muted-foreground mt-1">Set up credit approval processes</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col">
                  <span className="text-sm font-medium">Block Reasons</span>
                  <span className="text-xs text-muted-foreground mt-1">Configure credit block reasons</span>
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
              {dialogType === 'check' 
                ? (isEditing ? 'Edit Credit Check' : 'New Credit Check')
                : (isEditing ? 'Edit Customer Credit' : 'Set Customer Credit')}
            </DialogTitle>
          </DialogHeader>
          {dialogType === 'check' ? (
            <CreditCheckForm 
              check={selectedItem as CreditCheck | null}
              onSave={handleSaveCheck}
              onCancel={() => setIsDialogOpen(false)}
            />
          ) : (
            <CustomerCreditForm 
              credit={selectedItem as CustomerCredit | null}
              onSave={handleSaveCustomerCredit}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CreditCheckForm: React.FC<{
  check: CreditCheck | null;
  onSave: (data: Partial<CreditCheck>) => void;
  onCancel: () => void;
}> = ({ check, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: check?.customer || '',
    customerId: check?.customerId || '',
    orderRef: check?.orderRef || '',
    amount: check?.amount || 0,
    checkDate: check?.checkDate || new Date().toISOString().split('T')[0],
    creditLimit: check?.creditLimit || 100000,
    currentExposure: check?.currentExposure || 0
  });

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Customer</Label>
          <Input value={formData.customer} onChange={(e) => setFormData(p => ({ ...p, customer: e.target.value }))} />
        </div>
        <div>
          <Label>Order Reference</Label>
          <Input value={formData.orderRef} onChange={(e) => setFormData(p => ({ ...p, orderRef: e.target.value }))} />
        </div>
        <div>
          <Label>Amount</Label>
          <Input type="number" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: Number(e.target.value) }))} />
        </div>
        <div>
          <Label>Check Date</Label>
          <Input type="date" value={formData.checkDate} onChange={(e) => setFormData(p => ({ ...p, checkDate: e.target.value }))} />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>{check ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
};

const CustomerCreditForm: React.FC<{
  credit: CustomerCredit | null;
  onSave: (data: Partial<CustomerCredit>) => void;
  onCancel: () => void;
}> = ({ credit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: credit?.customer || '',
    customerId: credit?.customerId || '',
    creditLimit: credit?.creditLimit || 100000,
    currentExposure: credit?.currentExposure || 0,
    riskCategory: credit?.riskCategory || 'Medium' as const,
    paymentHistory: credit?.paymentHistory || 'Good' as const
  });

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Customer</Label>
          <Input value={formData.customer} onChange={(e) => setFormData(p => ({ ...p, customer: e.target.value }))} />
        </div>
        <div>
          <Label>Credit Limit</Label>
          <Input type="number" value={formData.creditLimit} onChange={(e) => setFormData(p => ({ ...p, creditLimit: Number(e.target.value) }))} />
        </div>
        <div>
          <Label>Current Exposure</Label>
          <Input type="number" value={formData.currentExposure} onChange={(e) => setFormData(p => ({ ...p, currentExposure: Number(e.target.value) }))} />
        </div>
        <div>
          <Label>Risk Category</Label>
          <Select value={formData.riskCategory} onValueChange={(v: any) => setFormData(p => ({ ...p, riskCategory: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)}>{credit ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
};

export default CreditManagement;
