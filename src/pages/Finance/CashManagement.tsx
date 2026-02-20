
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  ArrowLeft, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw,
  Save,
  Trash2
} from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';

interface CashFlow {
  id: string;
  date: string;
  description: string;
  type: 'Inflow' | 'Outflow';
  amount: number;
  category: string;
  account: string;
  status: 'Planned' | 'Actual' | 'Forecasted';
}

interface BankPosition {
  id: string;
  bankName: string;
  accountType: string;
  currency: string;
  balance: number;
  availableBalance: number;
  pendingTransactions: number;
  lastUpdated: string;
}

interface PaymentTransaction {
  id: string;
  paymentId: string;
  vendor: string;
  amount: number;
  currency: string;
  paymentMethod: 'Wire Transfer' | 'ACH' | 'Check' | 'Credit Card';
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  scheduledDate: string;
  processedDate?: string;
}

const CashManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('overview');
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [bankPositions, setBankPositions] = useState<BankPosition[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCashFlowDialogOpen, setIsCashFlowDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [cashFlowForm, setCashFlowForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'Inflow',
    amount: '',
    category: '',
    account: 'Operating Account',
    status: 'Planned'
  });
  const [paymentForm, setPaymentForm] = useState({
    vendor: '',
    amount: '',
    currency: 'USD',
    paymentMethod: 'Wire Transfer',
    scheduledDate: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Cash Management. Monitor cash flow, manage bank accounts, and optimize liquidity for effective treasury operations.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    loadCashData();
  }, []);

  const loadCashData = () => {
    const sampleCashFlows: CashFlow[] = [
      {
        id: 'cf-001',
        date: '2025-01-28',
        description: 'Customer Payment - Invoice #12345',
        type: 'Inflow',
        amount: 125000,
        category: 'Sales Revenue',
        account: 'Operating Account',
        status: 'Actual'
      },
      {
        id: 'cf-002',
        date: '2025-01-28',
        description: 'Vendor Payment - Dell Technologies',
        type: 'Outflow',
        amount: 45000,
        category: 'Operating Expenses',
        account: 'Operating Account',
        status: 'Actual'
      },
      {
        id: 'cf-003',
        date: '2025-01-29',  
        description: 'Payroll Processing',
        type: 'Outflow',
        amount: 95000,
        category: 'Payroll',
        account: 'Operating Account',
        status: 'Planned'
      },
      {
        id: 'cf-004',
        date: '2025-01-30',
        description: 'Loan Interest Payment',
        type: 'Outflow',
        amount: 12500,
        category: 'Interest Expense',
        account: 'Operating Account',
        status: 'Planned'
      }
    ];

    const sampleBankPositions: BankPosition[] = [
      {
        id: 'bp-001',
        bankName: 'JPMorgan Chase',
        accountType: 'Operating Account',
        currency: 'USD',
        balance: 2450000,
        availableBalance: 2350000,
        pendingTransactions: 5,
        lastUpdated: '2025-01-28T14:30:00Z'
      },
      {
        id: 'bp-002',
        bankName: 'Bank of America',
        accountType: 'Savings Account',
        currency: 'USD',
        balance: 1200000,
        availableBalance: 1200000,
        pendingTransactions: 0,
        lastUpdated: '2025-01-28T14:30:00Z'
      },
      {
        id: 'bp-003',
        bankName: 'Wells Fargo',
        accountType: 'Credit Line',
        currency: 'USD',
        balance: -150000,
        availableBalance: 850000,
        pendingTransactions: 2,
        lastUpdated: '2025-01-28T14:30:00Z'
      }
    ];

    const samplePayments: PaymentTransaction[] = [
      {
        id: 'pt-001',
        paymentId: 'PAY-2025-001',
        vendor: 'Dell Technologies',
        amount: 45000,
        currency: 'USD',
        paymentMethod: 'Wire Transfer',
        status: 'Completed',
        scheduledDate: '2025-01-28',
        processedDate: '2025-01-28'
      },
      {
        id: 'pt-002',
        paymentId: 'PAY-2025-002',
        vendor: 'Microsoft Corporation',
        amount: 25000,
        currency: 'USD',
        paymentMethod: 'ACH',
        status: 'Processing',
        scheduledDate: '2025-01-29'
      },
      {
        id: 'pt-003',
        paymentId: 'PAY-2025-003',
        vendor: 'Office Supplies Inc',
        amount: 1500,
        currency: 'USD',
        paymentMethod: 'Credit Card',
        status: 'Pending',
        scheduledDate: '2025-01-30'
      }
    ];

    setCashFlows(sampleCashFlows);
    setBankPositions(sampleBankPositions);
    setPayments(samplePayments);
  };

  const refreshData = () => {
    setIsLoading(true);
    loadCashData();
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Data Refreshed',
        description: 'Bank positions and cash flow data have been updated',
      });
    }, 1000);
  };

  const handleAddCashFlow = () => {
    if (!cashFlowForm.description || !cashFlowForm.amount || !cashFlowForm.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const newCashFlow: CashFlow = {
      id: `cf-${String(cashFlows.length + 1).padStart(3, '0')}`,
      date: cashFlowForm.date,
      description: cashFlowForm.description,
      type: cashFlowForm.type as 'Inflow' | 'Outflow',
      amount: parseFloat(cashFlowForm.amount),
      category: cashFlowForm.category,
      account: cashFlowForm.account,
      status: cashFlowForm.status as 'Planned' | 'Actual' | 'Forecasted'
    };

    setCashFlows([...cashFlows, newCashFlow]);
    setIsCashFlowDialogOpen(false);
    setCashFlowForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: 'Inflow',
      amount: '',
      category: '',
      account: 'Operating Account',
      status: 'Planned'
    });
    
    toast({
      title: 'Cash Flow Added',
      description: `${cashFlowForm.type} entry of $${parseFloat(cashFlowForm.amount).toLocaleString()} has been added`,
    });
  };

  const handleProcessPayment = () => {
    if (!paymentForm.vendor || !paymentForm.amount) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const newPayment: PaymentTransaction = {
      id: `pt-${String(payments.length + 1).padStart(3, '0')}`,
      paymentId: `PAY-2025-${String(payments.length + 1).padStart(3, '0')}`,
      vendor: paymentForm.vendor,
      amount: parseFloat(paymentForm.amount),
      currency: paymentForm.currency,
      paymentMethod: paymentForm.paymentMethod as 'Wire Transfer' | 'ACH' | 'Check' | 'Credit Card',
      status: 'Pending',
      scheduledDate: paymentForm.scheduledDate
    };

    setPayments([...payments, newPayment]);
    setIsPaymentDialogOpen(false);
    setPaymentForm({
      vendor: '',
      amount: '',
      currency: 'USD',
      paymentMethod: 'Wire Transfer',
      scheduledDate: new Date().toISOString().split('T')[0]
    });
    
    toast({
      title: 'Payment Processed',
      description: `Payment of $${parseFloat(paymentForm.amount).toLocaleString()} to ${paymentForm.vendor} has been queued`,
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Planned': 'bg-blue-100 text-blue-800',
      'Actual': 'bg-green-100 text-green-800',
      'Forecasted': 'bg-purple-100 text-purple-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const cashFlowColumns: EnhancedColumn[] = [
    { key: 'date', header: 'Date', sortable: true },
    { key: 'description', header: 'Description', searchable: true },
    { 
      key: 'type', 
      header: 'Type',
      filterable: true,
      filterOptions: [
        { label: 'Inflow', value: 'Inflow' },
        { label: 'Outflow', value: 'Outflow' }
      ],
      render: (value: string) => (
        <div className={`flex items-center ${value === 'Inflow' ? 'text-green-600' : 'text-red-600'}`}>
          {value === 'Inflow' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
          {value}
        </div>
      )
    },
    { 
      key: 'amount', 
      header: 'Amount',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { key: 'category', header: 'Category', searchable: true },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    }
  ];

  const bankPositionColumns: EnhancedColumn[] = [
    { key: 'bankName', header: 'Bank', searchable: true },
    { key: 'accountType', header: 'Account Type', searchable: true },
    { key: 'currency', header: 'Currency' },
    { 
      key: 'balance', 
      header: 'Balance',
      sortable: true,
      render: (value: number, row: BankPosition) => (
        <span className={value < 0 ? 'text-red-600' : 'text-green-600'}>
          {row.currency} {Math.abs(value).toLocaleString()}
        </span>
      )
    },
    { 
      key: 'availableBalance', 
      header: 'Available',
      render: (value: number, row: BankPosition) => `${row.currency} ${value.toLocaleString()}`
    },
    { key: 'pendingTransactions', header: 'Pending', sortable: true }
  ];

  const paymentColumns: EnhancedColumn[] = [
    { key: 'paymentId', header: 'Payment ID', searchable: true },
    { key: 'vendor', header: 'Vendor', searchable: true },
    { 
      key: 'amount', 
      header: 'Amount',
      render: (value: number, row: PaymentTransaction) => `${row.currency} ${value.toLocaleString()}`
    },
    { key: 'paymentMethod', header: 'Method', searchable: true },
    { key: 'scheduledDate', header: 'Scheduled', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    }
  ];

  const totalCash = bankPositions.reduce((sum, pos) => sum + Math.max(0, pos.balance), 0);
  const totalInflows = cashFlows.filter(cf => cf.type === 'Inflow').reduce((sum, cf) => sum + cf.amount, 0);
  const totalOutflows = cashFlows.filter(cf => cf.type === 'Outflow').reduce((sum, cf) => sum + cf.amount, 0);
  const netCashFlow = totalInflows - totalOutflows;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/finance')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Cash Management"
          description="Monitor cash flow, manage bank accounts, and optimize liquidity"
          voiceIntroduction="Welcome to comprehensive Cash Management for optimal treasury operations."
        />
      </div>

      <VoiceTrainingComponent 
        module="finance"
        topic="Cash and Liquidity Management"
        examples={[
          "Managing bank master data and electronic bank statements with automated reconciliation and real-time position monitoring",
          "Creating cash flow forecasts and liquidity planning with rolling forecasts and scenario analysis for optimal cash positioning",
          "Processing payments and collections with optimized payment methods and bank communication for efficient cash operations"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">${(totalCash / 1000000).toFixed(2)}M</div>
            <div className="text-sm text-muted-foreground">Available Cash</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">${(totalInflows / 1000).toFixed(0)}K</div>
            <div className="text-sm text-muted-foreground">Total Inflows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">${(totalOutflows / 1000).toFixed(0)}K</div>
            <div className="text-sm text-muted-foreground">Total Outflows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Banknote className={`h-8 w-8 mx-auto mb-2 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(Math.abs(netCashFlow) / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-muted-foreground">Net Cash Flow</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="positions">Bank Positions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="flex items-center text-green-600">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      Total Inflows
                    </span>
                    <span className="font-medium text-green-600">${totalInflows.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center text-red-600">
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                      Total Outflows
                    </span>
                    <span className="font-medium text-red-600">${totalOutflows.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Net Cash Flow</span>
                    <span className={`font-semibold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(netCashFlow).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bank Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bankPositions.map((position) => (
                    <div key={position.id} className="flex justify-between">
                      <div>
                        <div className="font-medium">{position.bankName}</div>
                        <div className="text-sm text-muted-foreground">{position.accountType}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${position.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {position.currency} {Math.abs(position.balance).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Available: {position.currency} {position.availableBalance.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Cash Flow Management
                <Dialog open={isCashFlowDialogOpen} onOpenChange={setIsCashFlowDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setCashFlowForm({
                      date: new Date().toISOString().split('T')[0],
                      description: '',
                      type: 'Inflow',
                      amount: '',
                      category: '',
                      account: 'Operating Account',
                      status: 'Planned'
                    })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Cash Flow Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date *</Label>
                          <Input 
                            type="date"
                            value={cashFlowForm.date}
                            onChange={(e) => setCashFlowForm({...cashFlowForm, date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Type *</Label>
                          <Select value={cashFlowForm.type} onValueChange={(v) => setCashFlowForm({...cashFlowForm, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inflow">Inflow</SelectItem>
                              <SelectItem value="Outflow">Outflow</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Description *</Label>
                        <Input 
                          value={cashFlowForm.description}
                          onChange={(e) => setCashFlowForm({...cashFlowForm, description: e.target.value})}
                          placeholder="Enter description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Amount *</Label>
                          <Input 
                            type="number"
                            value={cashFlowForm.amount}
                            onChange={(e) => setCashFlowForm({...cashFlowForm, amount: e.target.value})}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Category *</Label>
                          <Select value={cashFlowForm.category} onValueChange={(v) => setCashFlowForm({...cashFlowForm, category: v})}>
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sales Revenue">Sales Revenue</SelectItem>
                              <SelectItem value="Operating Expenses">Operating Expenses</SelectItem>
                              <SelectItem value="Payroll">Payroll</SelectItem>
                              <SelectItem value="Interest Expense">Interest Expense</SelectItem>
                              <SelectItem value="Capital Expenditure">Capital Expenditure</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Account</Label>
                          <Select value={cashFlowForm.account} onValueChange={(v) => setCashFlowForm({...cashFlowForm, account: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Operating Account">Operating Account</SelectItem>
                              <SelectItem value="Savings Account">Savings Account</SelectItem>
                              <SelectItem value="Credit Line">Credit Line</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Select value={cashFlowForm.status} onValueChange={(v) => setCashFlowForm({...cashFlowForm, status: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Planned">Planned</SelectItem>
                              <SelectItem value="Actual">Actual</SelectItem>
                              <SelectItem value="Forecasted">Forecasted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCashFlowDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCashFlow}><Save className="h-4 w-4 mr-2" />Add Entry</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={cashFlowColumns}
                data={cashFlows}
                searchPlaceholder="Search cash flows..."
                exportable={true}
                refreshable={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Bank Position Management
                <Button onClick={refreshData} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={bankPositionColumns}
                data={bankPositions}
                searchPlaceholder="Search bank positions..."
                exportable={true}
                refreshable={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Payment Processing
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setPaymentForm({
                      vendor: '',
                      amount: '',
                      currency: 'USD',
                      paymentMethod: 'Wire Transfer',
                      scheduledDate: new Date().toISOString().split('T')[0]
                    })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Process Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Process New Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Vendor *</Label>
                        <Input 
                          value={paymentForm.vendor}
                          onChange={(e) => setPaymentForm({...paymentForm, vendor: e.target.value})}
                          placeholder="Enter vendor name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Amount *</Label>
                          <Input 
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Currency</Label>
                          <Select value={paymentForm.currency} onValueChange={(v) => setPaymentForm({...paymentForm, currency: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Payment Method</Label>
                          <Select value={paymentForm.paymentMethod} onValueChange={(v) => setPaymentForm({...paymentForm, paymentMethod: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                              <SelectItem value="ACH">ACH</SelectItem>
                              <SelectItem value="Check">Check</SelectItem>
                              <SelectItem value="Credit Card">Credit Card</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Scheduled Date</Label>
                          <Input 
                            type="date"
                            value={paymentForm.scheduledDate}
                            onChange={(e) => setPaymentForm({...paymentForm, scheduledDate: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleProcessPayment}><Save className="h-4 w-4 mr-2" />Process Payment</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={paymentColumns}
                data={payments}
                searchPlaceholder="Search payments..."
                exportable={true}
                refreshable={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashManagement;
