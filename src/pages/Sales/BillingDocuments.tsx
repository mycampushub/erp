
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Search, FileText, Download, Filter, Calendar, Check, AlertCircle, ArrowLeft, Plus } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { SALES_STORAGE_KEYS, Invoice, BillingCreditMemo, initializeSalesData } from '../../lib/salesData';

const BillingDocuments: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [creditMemos, setCreditMemos] = useState<BillingCreditMemo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    initializeSalesData();
    loadData();
    if (isEnabled) {
      speak('Welcome to Billing Documents. Manage invoices, credit memos, and billing reports for comprehensive revenue tracking.');
    }
  }, [isEnabled, speak]);

  const loadData = () => {
    const storedInvoices = listEntities<Invoice>(SALES_STORAGE_KEYS.INVOICES);
    const storedCreditMemos = listEntities<BillingCreditMemo>(SALES_STORAGE_KEYS.CREDIT_MEMOS);
    setInvoices(storedInvoices);
    setCreditMemos(storedCreditMemos);
    setIsLoading(false);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = paymentFilter === 'all' || invoice.paymentStatus.toLowerCase() === paymentFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredCreditMemos = creditMemos.filter(memo => {
    const matchesSearch = memo.creditMemoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memo.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    toast({ title: 'View Invoice', description: `Opening invoice ${invoice.invoiceNumber}` });
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast({ title: 'Download Invoice', description: `Downloading invoice ${invoice.invoiceNumber} as PDF` });
  };

  const handleGenerateReport = (reportName: string) => {
    toast({ title: 'Generating Report', description: `${reportName} is being generated...` });
    setTimeout(() => {
      toast({ title: 'Report Ready', description: `${reportName} has been generated successfully.` });
    }, 1500);
  };

  const handleCreateInvoice = (data: Partial<Invoice>) => {
    const newInvoice: Invoice = {
      id: generateId('inv'),
      invoiceNumber: `INV-${String(202500000 + invoices.length + 1)}`,
      customer: data.customer || '',
      customerId: data.customerId || '',
      orderRef: data.orderRef || '',
      orderId: data.orderId,
      date: data.date || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: data.amount || 0,
      currency: 'USD',
      status: 'Draft',
      paymentStatus: 'Open'
    };
    upsertEntity(SALES_STORAGE_KEYS.INVOICES, newInvoice);
    loadData();
    setIsCreateDialogOpen(false);
    toast({ title: 'Invoice Created', description: `New invoice ${newInvoice.invoiceNumber} has been created.` });
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    if (window.confirm(`Delete invoice ${invoice.invoiceNumber}?`)) {
      removeEntity(SALES_STORAGE_KEYS.INVOICES, invoice.id);
      loadData();
      toast({ title: 'Invoice Deleted', description: `Invoice ${invoice.invoiceNumber} has been deleted.` });
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string, text: string }> = {
      'Paid': { bg: 'bg-green-100', text: 'text-green-800' },
      'Open': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Partially Paid': { bg: 'bg-amber-100', text: 'text-amber-800' },
      'Overdue': { bg: 'bg-red-100', text: 'text-red-800' },
      'Not Applicable': { bg: 'bg-gray-100', text: 'text-gray-800' },
    };
    const color = colors[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs ${color.bg} ${color.text}`}>{status}</span>;
  };

  const getStatusBadge = (status: string) => {
    return <Badge variant={status === 'Posted' ? 'default' : 'outline'}>{status}</Badge>;
  };

  const invoiceColumns: EnhancedColumn[] = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true, searchable: true },
    { key: 'customer', header: 'Customer', sortable: true, searchable: true },
    { key: 'orderRef', header: 'Order Reference', sortable: true },
    { key: 'date', header: 'Date', sortable: true },
    { key: 'dueDate', header: 'Due Date', sortable: true },
    { 
      key: 'amount', 
      header: 'Amount',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => getStatusBadge(value)
    },
    { 
      key: 'paymentStatus', 
      header: 'Payment Status',
      render: (value: string) => getPaymentStatusBadge(value)
    }
  ];

  const invoiceActions: TableAction[] = [
    {
      label: 'View',
      icon: <FileText className="h-4 w-4" />,
      onClick: (row: Invoice) => handleViewInvoice(row),
      variant: 'ghost'
    },
    {
      label: 'Download',
      icon: <Download className="h-4 w-4" />,
      onClick: (row: Invoice) => handleDownloadInvoice(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <AlertCircle className="h-4 w-4" />,
      onClick: (row: Invoice) => handleDeleteInvoice(row),
      variant: 'ghost'
    }
  ];

  const creditMemoColumns: EnhancedColumn[] = [
    { key: 'creditMemoNumber', header: 'Credit Memo #', sortable: true, searchable: true },
    { key: 'customer', header: 'Customer', sortable: true, searchable: true },
    { key: 'invoiceRef', header: 'Invoice Reference' },
    { key: 'date', header: 'Date', sortable: true },
    { 
      key: 'amount', 
      header: 'Amount',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { key: 'reason', header: 'Reason' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => getStatusBadge(value)
    }
  ];

  const billingMetrics = [
    { title: 'Total Invoices', value: invoices.length },
    { title: 'Total Revenue', value: `$${(invoices.reduce((sum, i) => sum + i.amount, 0) / 1000).toFixed(1)}K` },
    { title: 'Open Invoices', value: invoices.filter(i => i.paymentStatus === 'Open').length },
    { title: 'Overdue', value: invoices.filter(i => i.paymentStatus === 'Overdue').length }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/sales')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Billing Documents"
          description="Manage invoices, credit memos, and billing reports for revenue tracking"
          voiceIntroduction="Welcome to Billing Documents for comprehensive billing management."
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Billing Schedule', description: 'Opening billing schedule calendar' })}>
            <Calendar className="h-4 w-4 mr-2" />
            Billing Schedule
          </Button>
        </div>
        <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {billingMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="invoices" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="creditMemos">Credit Memos ({creditMemos.length})</TabsTrigger>
          <TabsTrigger value="reports">Billing Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search invoices..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="partially paid">Partially Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={invoiceColumns}
                  data={filteredInvoices}
                  actions={invoiceActions}
                  exportable={true}
                  refreshable={true}
                  onRefresh={loadData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creditMemos" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search credit memos..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={creditMemoColumns}
                  data={filteredCreditMemos}
                  exportable={true}
                  refreshable={true}
                  onRefresh={loadData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleGenerateReport('Monthly Billing Summary')}>
                  <FileText className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">Monthly Billing Summary</h3>
                  <p className="text-sm text-gray-500 mt-1">Overview of all billing activity by month</p>
                </div>
                
                <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleGenerateReport('Invoice Status Report')}>
                  <FileText className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">Invoice Status Report</h3>
                  <p className="text-sm text-gray-500 mt-1">Track open, paid and overdue invoices</p>
                </div>
                
                <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleGenerateReport('Customer Billing Analysis')}>
                  <FileText className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">Customer Billing Analysis</h3>
                  <p className="text-sm text-gray-500 mt-1">Billing trends by customer segment</p>
                </div>
                
                <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleGenerateReport('Credit Memo Analysis')}>
                  <FileText className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">Credit Memo Analysis</h3>
                  <p className="text-sm text-gray-500 mt-1">Summary of credit memo reasons and amounts</p>
                </div>
                
                <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleGenerateReport('Revenue Recognition Report')}>
                  <FileText className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">Revenue Recognition Report</h3>
                  <p className="text-sm text-gray-500 mt-1">Track when revenue is recognized</p>
                </div>
                
                <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleGenerateReport('Tax Summary Report')}>
                  <FileText className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">Tax Summary Report</h3>
                  <p className="text-sm text-gray-500 mt-1">Summary of taxes collected by region</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <InvoiceForm 
            onSave={handleCreateInvoice}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InvoiceForm: React.FC<{
  onSave: (data: Partial<Invoice>) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: '',
    customerId: '',
    orderRef: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="customer">Customer</Label>
        <Input 
          id="customer" 
          value={formData.customer}
          onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
          placeholder="Enter customer name" 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="orderRef">Order Reference</Label>
        <Input 
          id="orderRef" 
          value={formData.orderRef}
          onChange={(e) => setFormData(prev => ({ ...prev, orderRef: e.target.value }))}
          placeholder="Enter order reference" 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Invoice Date</Label>
          <Input 
            id="date" 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input 
            id="amount" 
            type="number" 
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            placeholder="0.00" 
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>Create Invoice</Button>
      </div>
    </form>
  );
};

export default BillingDocuments;
