
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Plus, CheckCircle, XCircle, AlertTriangle, DollarSign, FileText, Save, X, Trash2, Edit2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { seedProcurementData, getProcurementData, Invoice, PurchaseOrder, Supplier } from '../../lib/procurementData';

interface InvoiceFormData {
  supplier: string;
  poNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  currency: string;
  status: 'Pending' | 'Matched' | 'Blocked' | 'Approved' | 'Paid' | 'Rejected';
  matchingStatus: 'Not Matched' | 'Partially Matched' | 'Fully Matched' | 'Variances Found';
  paymentTerms: string;
  processor: string;
  discrepancies: string[];
}

const InvoiceVerification: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('invoices');
  const initialData = getProcurementData();
  const [invoices, setInvoices] = useState<Invoice[]>(() => initialData?.invoices || []);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => initialData?.purchaseOrders || []);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => initialData?.suppliers || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    supplier: '',
    poNumber: '',
    invoiceDate: '',
    dueDate: '',
    totalAmount: '',
    currency: 'USD',
    status: 'Pending',
    matchingStatus: 'Not Matched',
    paymentTerms: 'Net 30',
    processor: '',
    discrepancies: []
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Invoice Verification. Verify and process supplier invoices against purchase orders and goods receipts.');
    }
  }, [isEnabled, speak]);

  const generateId = (prefix: string): string => {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    setFormData({
      supplier: '',
      poNumber: '',
      invoiceDate: '',
      dueDate: '',
      totalAmount: '',
      currency: 'USD',
      status: 'Pending',
      matchingStatus: 'Not Matched',
      paymentTerms: 'Net 30',
      processor: '',
      discrepancies: []
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      supplier: invoice.supplier,
      poNumber: invoice.poNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      totalAmount: invoice.totalAmount.toString(),
      currency: invoice.currency,
      status: invoice.status,
      matchingStatus: invoice.matchingStatus,
      paymentTerms: invoice.paymentTerms,
      processor: invoice.processor,
      discrepancies: invoice.discrepancies
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setDeletingInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingInvoice) {
      const updatedInvoices = invoices.filter(i => i.id !== deletingInvoice.id);
      setInvoices(updatedInvoices);
      toast({
        title: 'Invoice Deleted',
        description: `Invoice ${deletingInvoice.invoiceNumber} has been deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setDeletingInvoice(null);
    }
  };

  const handleSubmit = () => {
    if (!formData.supplier || !formData.poNumber || !formData.invoiceDate || !formData.dueDate || !formData.totalAmount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const selectedSupplier = suppliers.find(s => s.name === formData.supplier);
    const selectedPO = purchaseOrders.find(po => po.poNumber === formData.poNumber);
    
    const invoiceData = {
      supplier: formData.supplier,
      supplierId: selectedSupplier?.id || '',
      poNumber: formData.poNumber,
      poId: selectedPO?.id || '',
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      totalAmount: parseFloat(formData.totalAmount),
      currency: formData.currency,
      status: formData.status,
      matchingStatus: formData.matchingStatus,
      paymentTerms: formData.paymentTerms,
      processor: formData.processor,
      discrepancies: formData.discrepancies,
      lineItems: []
    };

    if (editingInvoice) {
      const updatedInvoice: Invoice = { ...editingInvoice, ...invoiceData };
      const updatedInvoices = invoices.map(i => i.id === editingInvoice.id ? updatedInvoice : i);
      setInvoices(updatedInvoices);
      toast({
        title: 'Invoice Updated',
        description: `Invoice ${editingInvoice.invoiceNumber} has been updated.`,
      });
    } else {
      const newInvoice: Invoice = {
        id: generateId('inv'),
        invoiceNumber: `INV-2025-${String(invoices.length + 1).padStart(4, '0')}`,
        ...invoiceData,
        createdAt: new Date().toISOString()
      };
      const updatedInvoices = [...invoices, newInvoice];
      setInvoices(updatedInvoices);
      toast({
        title: 'Invoice Created',
        description: `Invoice ${newInvoice.invoiceNumber} has been created.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleMatch = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(i => 
      i.id === invoice.id ? { ...i, matchingStatus: 'Fully Matched' as const, status: 'Matched' as const } : i
    );
    setInvoices(updatedInvoices);
    toast({ title: 'Matching Complete', description: `Invoice ${invoice.invoiceNumber} has been matched.` });
  };

  const handleReview = (invoice: Invoice) => {
    toast({ title: 'Review Invoice', description: `Opening review for ${invoice.invoiceNumber}` });
  };

  const handleApprove = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(i => 
      i.id === invoice.id ? { ...i, status: 'Approved' as const } : i
    );
    setInvoices(updatedInvoices);
    toast({ title: 'Invoice Approved', description: `Invoice ${invoice.invoiceNumber} approved for payment` });
  };

  const handleReject = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(i => 
      i.id === invoice.id ? { ...i, status: 'Rejected' as const } : i
    );
    setInvoices(updatedInvoices);
    toast({ title: 'Invoice Rejected', description: `Invoice ${invoice.invoiceNumber} has been rejected` });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Matched': 'bg-blue-100 text-blue-800',
      'Blocked': 'bg-red-100 text-red-800',
      'Approved': 'bg-green-100 text-green-800',
      'Paid': 'bg-gray-100 text-gray-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMatchingColor = (matching: string) => {
    const colors: Record<string, string> = {
      'Not Matched': 'bg-gray-100 text-gray-800',
      'Partially Matched': 'bg-yellow-100 text-yellow-800',
      'Fully Matched': 'bg-green-100 text-green-800',
      'Variances Found': 'bg-red-100 text-red-800'
    };
    return colors[matching] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true, searchable: true },
    { key: 'supplier', header: 'Supplier', searchable: true },
    { key: 'poNumber', header: 'PO Number', searchable: true },
    { 
      key: 'totalAmount', 
      header: 'Amount',
      sortable: true,
      render: (value: number, row: Invoice) => `${row.currency} ${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Pending', value: 'Pending' },
        { label: 'Matched', value: 'Matched' },
        { label: 'Blocked', value: 'Blocked' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Paid', value: 'Paid' },
        { label: 'Rejected', value: 'Rejected' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'matchingStatus', 
      header: 'Matching',
      filterable: true,
      filterOptions: [
        { label: 'Not Matched', value: 'Not Matched' },
        { label: 'Partially Matched', value: 'Partially Matched' },
        { label: 'Fully Matched', value: 'Fully Matched' },
        { label: 'Variances Found', value: 'Variances Found' }
      ],
      render: (value: string) => (
        <Badge className={getMatchingColor(value)}>
          {value}
        </Badge>
      )
    },
    { key: 'dueDate', header: 'Due Date', sortable: true },
    { key: 'processor', header: 'Processor', searchable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <FileText className="h-4 w-4" />,
      onClick: (row: Invoice) => handleEdit(row),
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit2 className="h-4 w-4" />,
      onClick: (row: Invoice) => handleEdit(row),
      variant: 'ghost'
    },
    {
      label: 'Match',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (row: Invoice) => handleMatch(row),
      variant: 'ghost',
      condition: (row: Invoice) => row.status === 'Pending'
    },
    {
      label: 'Approve',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (row: Invoice) => handleApprove(row),
      variant: 'ghost',
      condition: (row: Invoice) => row.matchingStatus === 'Fully Matched'
    },
    {
      label: 'Reject',
      icon: <XCircle className="h-4 w-4" />,
      onClick: (row: Invoice) => handleReject(row),
      variant: 'ghost',
      condition: (row: Invoice) => row.status === 'Pending' || row.status === 'Blocked'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Invoice) => handleDelete(row),
      variant: 'ghost',
      condition: (row: Invoice) => row.status === 'Pending' || row.status === 'Rejected'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/procurement')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Invoice Verification"
          description="Verify and process supplier invoices for payment"
          voiceIntroduction="Welcome to Invoice Verification for processing supplier invoices."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{invoices.length}</div>
            <div className="text-sm text-muted-foreground">Total Invoices</div>
            <div className="text-sm text-blue-600">This month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {invoices.filter(i => i.status === 'Pending' || i.status === 'Blocked').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
            <div className="text-sm text-orange-600">Needs attention</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {invoices.filter(i => i.matchingStatus === 'Fully Matched').length}
            </div>
            <div className="text-sm text-muted-foreground">Fully Matched</div>
            <div className="text-sm text-green-600">Ready for payment</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${invoices.reduce((sum, i) => sum + i.totalAmount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-sm text-purple-600">Awaiting payment</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Invoice Verification Queue
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Invoice
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={invoices}
                actions={actions}
                searchPlaceholder="Search invoices, suppliers, or PO numbers..."
                exportable={true}
                refreshable={true}
                onRefresh={() => {
                  const data = getProcurementData();
                  if (data) {
                    setInvoices(data.invoices);
                    setPurchaseOrders(data.purchaseOrders);
                    setSuppliers(data.suppliers);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Three-Way Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.filter(i => i.matchingStatus !== 'Fully Matched').map((invoice) => (
                  <div key={invoice.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          {invoice.invoiceNumber}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Supplier: {invoice.supplier} | PO: {invoice.poNumber}
                        </p>
                        <p className="text-sm">Amount: {invoice.currency} {invoice.totalAmount.toLocaleString()}</p>
                        <Badge className={getMatchingColor(invoice.matchingStatus)}>
                          {invoice.matchingStatus}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleMatch(invoice)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Match
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReview(invoice)}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                    {invoice.discrepancies.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 rounded">
                        <p className="text-sm font-medium text-red-800">Discrepancies:</p>
                        <ul className="text-sm text-red-700 mt-1">
                          {invoice.discrepancies.map((disc, index) => (
                            <li key={index}>• {disc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                {invoices.filter(i => i.matchingStatus !== 'Fully Matched').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">All invoices are fully matched.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.filter(i => i.status === 'Blocked').map((invoice) => (
                  <div key={invoice.id} className="p-4 border rounded-lg bg-red-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold flex items-center text-red-800">
                          <XCircle className="h-4 w-4 mr-2" />
                          {invoice.invoiceNumber} - BLOCKED
                        </h4>
                        <p className="text-sm text-red-700">
                          {invoice.supplier} | Due: {invoice.dueDate}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-red-800">Issues:</p>
                          <ul className="text-sm text-red-700">
                            {invoice.discrepancies.map((disc, index) => (
                              <li key={index}>• {disc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleReview(invoice)}>Resolve</Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(invoice)}>Reject</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {invoices.filter(i => i.status === 'Blocked').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No blocked invoices.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Pending', 'Matched', 'Blocked', 'Approved', 'Paid', 'Rejected'].map((status) => {
                    const count = invoices.filter(i => i.status === status).length;
                    const percentage = invoices.length > 0 ? Math.round((count / invoices.length) * 100) : 0;
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{status}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span>Straight-Through Processing</span>
                      <span className="font-bold text-green-600">65%</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span>Average Processing Time</span>
                      <span className="font-bold">2.3 days</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span>Exception Rate</span>
                      <span className="font-bold text-orange-600">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Upload New Invoice'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select value={formData.supplier} onValueChange={(value) => setFormData({ ...formData, supplier: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.slice(0, 15).map(s => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="poNumber">PO Number *</Label>
                <Select value={formData.poNumber} onValueChange={(value) => setFormData({ ...formData, poNumber: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PO" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrders.slice(0, 15).map(po => (
                      <SelectItem key={po.id} value={po.poNumber}>{po.poNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="invoiceDate">Invoice Date *</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Total Amount *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Matched">Matched</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="matchingStatus">Matching Status</Label>
                <Select value={formData.matchingStatus} onValueChange={(value: any) => setFormData({ ...formData, matchingStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Matched">Not Matched</SelectItem>
                    <SelectItem value="Partially Matched">Partially Matched</SelectItem>
                    <SelectItem value="Fully Matched">Fully Matched</SelectItem>
                    <SelectItem value="Variances Found">Variances Found</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="processor">Processor</Label>
                <Input
                  id="processor"
                  value={formData.processor}
                  onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                  placeholder="Enter processor name"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {editingInvoice ? 'Update' : 'Upload'} Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete invoice "{deletingInvoice?.invoiceNumber}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceVerification;
