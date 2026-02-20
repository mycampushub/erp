
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Search, Plus, Filter, Edit, Trash2, Download, Upload, Package, RotateCcw, RefreshCw, Check } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { SALES_STORAGE_KEYS, SalesReturn, ReturnCreditMemo, initializeSalesData } from '../../lib/salesData';

const SalesReturns: React.FC = () => {
  const [activeTab, setActiveTab] = useState('returns');
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [returnCreditMemos, setReturnCreditMemos] = useState<ReturnCreditMemo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<SalesReturn | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeSalesData();
    loadData();
  }, []);

  const loadData = () => {
    const storedReturns = listEntities<SalesReturn>(SALES_STORAGE_KEYS.RETURNS);
    const storedCreditMemos = listEntities<ReturnCreditMemo>(SALES_STORAGE_KEYS.RETURN_CREDIT_MEMOS);
    setReturns(storedReturns);
    setReturnCreditMemos(storedCreditMemos);
    setIsLoading(false);
  };

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = returnItem.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || returnItem.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateReturn = () => {
    setSelectedReturn(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditReturn = (returnItem: SalesReturn) => {
    setSelectedReturn(returnItem);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteReturn = (returnId: string) => {
    if (window.confirm('Delete this return request?')) {
      removeEntity(SALES_STORAGE_KEYS.RETURNS, returnId);
      loadData();
      toast({ title: 'Return Deleted', description: 'Return request has been removed.' });
    }
  };

  const handleApproveReturn = (returnId: string) => {
    const updated = returns.map(r => r.id === returnId ? { ...r, status: 'Approved' as const, approvedBy: 'Current User' } : r);
    upsertEntity(SALES_STORAGE_KEYS.RETURNS, updated.find(r => r.id === returnId)!);
    loadData();
    toast({ title: 'Return Approved', description: 'Return request has been approved.' });
  };

  const handleRejectReturn = (returnId: string) => {
    const updated = returns.map(r => r.id === returnId ? { ...r, status: 'Rejected' as const } : r);
    upsertEntity(SALES_STORAGE_KEYS.RETURNS, updated.find(r => r.id === returnId)!);
    loadData();
    toast({ title: 'Return Rejected', description: 'Return request has been rejected.' });
  };

  const handleSaveReturn = (data: Partial<SalesReturn>) => {
    if (isEditing && selectedReturn) {
      upsertEntity(SALES_STORAGE_KEYS.RETURNS, { ...selectedReturn, ...data });
      toast({ title: 'Return Updated', description: 'Return has been updated.' });
    } else {
      const newReturn: SalesReturn = {
        id: generateId('ret'),
        returnNumber: `RET-2025-${String(returns.length + 1).padStart(3, '0')}`,
        returnDate: new Date().toISOString().split('T')[0],
        customer: data.customer || '',
        customerId: data.customerId || '',
        originalOrder: data.originalOrder || '',
        returnType: data.returnType || 'Product Return',
        reason: data.reason || '',
        status: 'Pending',
        totalAmount: data.totalAmount || 0,
        refundAmount: 0,
        notes: data.notes || ''
      };
      upsertEntity(SALES_STORAGE_KEYS.RETURNS, newReturn);
      toast({ title: 'Return Created', description: 'New return has been created.' });
    }
    loadData();
    setIsDialogOpen(false);
  };

  const handleExport = () => {
    const headers = ['Return ID', 'Customer', 'Original Order', 'Return Type', 'Reason', 'Status', 'Total Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredReturns.map(r => [r.returnNumber, `"${r.customer}"`, r.originalOrder, r.returnType, r.reason, r.status, r.totalAmount].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `returns_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Export Complete', description: `Exported ${filteredReturns.length} returns` });
  };

  const returnColumns: EnhancedColumn[] = [
    { key: 'returnNumber', header: 'Return ID', sortable: true, searchable: true },
    { key: 'customer', header: 'Customer', sortable: true, searchable: true },
    { key: 'originalOrder', header: 'Original Order', sortable: true },
    { key: 'returnType', header: 'Type', sortable: true },
    { key: 'returnDate', header: 'Return Date', sortable: true },
    { key: 'totalAmount', header: 'Amount', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={
          value === 'Completed' ? 'default' : 
          value === 'Approved' || value === 'Processing' ? 'secondary' : 
          value === 'Rejected' ? 'destructive' : 'outline'
        }>
          {value}
        </Badge>
      )
    }
  ];

  const returnActions: TableAction[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: SalesReturn) => handleEditReturn(row),
      variant: 'ghost'
    },
    {
      label: 'Approve',
      icon: <Check className="h-4 w-4" />,
      onClick: (row: SalesReturn) => handleApproveReturn(row.id),
      variant: 'ghost',
      condition: (row: SalesReturn) => row.status === 'Pending'
    },
    {
      label: 'Reject',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: SalesReturn) => handleRejectReturn(row.id),
      variant: 'ghost',
      condition: (row: SalesReturn) => row.status === 'Pending'
    }
  ];

  const creditMemoColumns: EnhancedColumn[] = [
    { key: 'creditMemoNumber', header: 'Credit Memo ID', sortable: true },
    { key: 'customer', header: 'Customer', sortable: true },
    { key: 'returnId', header: 'Return ID', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'issueDate', header: 'Issue Date', sortable: true },
    { key: 'expiryDate', header: 'Expiry Date', sortable: true },
    { key: 'status', header: 'Status', render: (v: string) => <Badge variant={v === 'Applied' ? 'default' : 'outline'}>{v}</Badge> }
  ];

  const returnMetrics = [
    { title: 'Total Returns', value: returns.length },
    { title: 'Pending Approval', value: returns.filter(r => r.status === 'Pending').length },
    { title: 'Return Value', value: `$${(returns.reduce((sum, r) => sum + r.totalAmount, 0) / 1000).toFixed(1)}K` },
    { title: 'Refund Amount', value: `$${(returns.reduce((sum, r) => sum + r.refundAmount, 0) / 1000).toFixed(1)}K` }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Sales Returns</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateReturn}>
            <Plus className="h-4 w-4 mr-2" />
            Create Return
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {returnMetrics.map((metric, index) => (
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
          <TabsTrigger value="returns">Returns ({returns.length})</TabsTrigger>
          <TabsTrigger value="creditMemos">Credit Memos ({returnCreditMemos.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="approval">Approval Workflow</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Return Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search returns..." 
                      className="pl-8 w-80"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={returnColumns}
                  data={filteredReturns}
                  actions={returnActions}
                  exportable={true}
                  refreshable={true}
                  onRefresh={loadData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creditMemos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credit Memos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={creditMemoColumns}
                  data={returnCreditMemos}
                  exportable={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Return Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics charts showing return trends by reason, type, and status.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {returns.filter(r => r.status === 'Pending').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No pending approvals</div>
              ) : (
                <div className="space-y-4">
                  {returns.filter(r => r.status === 'Pending').map(returnItem => (
                    <div key={returnItem.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{returnItem.returnNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {returnItem.customer} • {returnItem.returnType} • ${returnItem.totalAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleApproveReturn(returnItem.id)}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectReturn(returnItem.id)}>Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Return Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <span>Return Analysis</span>
                  <span className="text-xs text-muted-foreground">Detailed return trends</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <span>Customer Return History</span>
                  <span className="text-xs text-muted-foreground">Returns by customer</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Return' : 'Create New Return'}</DialogTitle>
          </DialogHeader>
          <ReturnForm 
            returnItem={selectedReturn}
            onSave={handleSaveReturn}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ReturnForm: React.FC<{
  returnItem: SalesReturn | null;
  onSave: (data: Partial<SalesReturn>) => void;
  onCancel: () => void;
}> = ({ returnItem, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: returnItem?.customer || '',
    customerId: returnItem?.customerId || '',
    originalOrder: returnItem?.originalOrder || '',
    returnType: returnItem?.returnType || 'Product Return' as const,
    reason: returnItem?.reason || '',
    totalAmount: returnItem?.totalAmount || 0,
    notes: returnItem?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Customer</Label>
          <Input value={formData.customer} onChange={(e) => setFormData(p => ({ ...p, customer: e.target.value }))} required />
        </div>
        <div>
          <Label>Original Order</Label>
          <Input value={formData.originalOrder} onChange={(e) => setFormData(p => ({ ...p, originalOrder: e.target.value }))} />
        </div>
        <div>
          <Label>Return Type</Label>
          <Select value={formData.returnType} onValueChange={(v: any) => setFormData(p => ({ ...p, returnType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Product Return">Product Return</SelectItem>
              <SelectItem value="Credit Return">Credit Return</SelectItem>
              <SelectItem value="Exchange">Exchange</SelectItem>
              <SelectItem value="Warranty Return">Warranty Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Total Amount</Label>
          <Input type="number" value={formData.totalAmount} onChange={(e) => setFormData(p => ({ ...p, totalAmount: Number(e.target.value) }))} required />
        </div>
      </div>
      <div>
        <Label>Reason</Label>
        <Input value={formData.reason} onChange={(e) => setFormData(p => ({ ...p, reason: e.target.value }))} required />
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{returnItem ? 'Update' : 'Create'} Return</Button>
      </div>
    </form>
  );
};

export default SalesReturns;
