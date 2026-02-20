
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Eye, Edit, Trash2, FileText, BarChart3 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  accountGroup: string;
  accountType: string;
  level: number;
  parentAccount: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  postingAllowed: 'Yes' | 'No';
  balance: number;
  currency: string;
}

const defaultForm: Omit<Account, 'id' | 'accountNumber'> = {
  accountName: '',
  accountGroup: 'Assets',
  accountType: 'Balance Sheet',
  level: 1,
  parentAccount: '',
  status: 'Active',
  postingAllowed: 'Yes',
  balance: 0,
  currency: 'USD',
};

const STORAGE_KEY = 'sap_chartofaccounts';

const defaultAccounts: Account[] = [
  { id: '1', accountNumber: '1000000', accountName: 'Cash and Cash Equivalents', accountGroup: 'Assets', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 2500000, currency: 'USD' },
  { id: '2', accountNumber: '1100000', accountName: 'Accounts Receivable', accountGroup: 'Assets', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 1850000, currency: 'USD' },
  { id: '3', accountNumber: '1200000', accountName: 'Inventory', accountGroup: 'Assets', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 3200000, currency: 'USD' },
  { id: '4', accountNumber: '1300000', accountName: 'Prepaid Expenses', accountGroup: 'Assets', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 180000, currency: 'USD' },
  { id: '5', accountNumber: '1400000', accountName: 'Fixed Assets', accountGroup: 'Assets', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 8500000, currency: 'USD' },
  { id: '6', accountNumber: '1500000', accountName: 'Intangible Assets', accountGroup: 'Assets', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 450000, currency: 'USD' },
  { id: '7', accountNumber: '1600000', accountName: 'Accumulated Depreciation', accountGroup: 'Assets', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'No', balance: -1250000, currency: 'USD' },
  { id: '8', accountNumber: '2000000', accountName: 'Accounts Payable', accountGroup: 'Liabilities', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 1200000, currency: 'USD' },
  { id: '9', accountNumber: '2100000', accountName: 'Accrued Expenses', accountGroup: 'Liabilities', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 350000, currency: 'USD' },
  { id: '10', accountNumber: '2200000', accountName: 'Short-term Debt', accountGroup: 'Liabilities', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 750000, currency: 'USD' },
  { id: '11', accountNumber: '2300000', accountName: 'Long-term Debt', accountGroup: 'Liabilities', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 2500000, currency: 'USD' },
  { id: '12', accountNumber: '2400000', accountName: 'Deferred Revenue', accountGroup: 'Liabilities', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 280000, currency: 'USD' },
  { id: '13', accountNumber: '3000000', accountName: 'Equity', accountGroup: 'Equity', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'No', balance: 8500000, currency: 'USD' },
  { id: '14', accountNumber: '3100000', accountName: 'Common Stock', accountGroup: 'Equity', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'No', balance: 5000000, currency: 'USD' },
  { id: '15', accountNumber: '3200000', accountName: 'Retained Earnings', accountGroup: 'Equity', accountType: 'Balance Sheet', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'No', balance: 3500000, currency: 'USD' },
  { id: '16', accountNumber: '4000000', accountName: 'Revenue', accountGroup: 'Revenue', accountType: 'P&L', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'No', balance: 15000000, currency: 'USD' },
  { id: '17', accountNumber: '4010000', accountName: 'Product Sales', accountGroup: 'Revenue', accountType: 'P&L', level: 2, parentAccount: '4000000', status: 'Active', postingAllowed: 'Yes', balance: 12000000, currency: 'USD' },
  { id: '18', accountNumber: '4020000', accountName: 'Service Revenue', accountGroup: 'Revenue', accountType: 'P&L', level: 2, parentAccount: '4000000', status: 'Active', postingAllowed: 'Yes', balance: 2500000, currency: 'USD' },
  { id: '19', accountNumber: '4030000', accountName: 'Licensing Revenue', accountGroup: 'Revenue', accountType: 'P&L', level: 2, parentAccount: '4000000', status: 'Active', postingAllowed: 'Yes', balance: 500000, currency: 'USD' },
  { id: '20', accountNumber: '5000000', accountName: 'Cost of Goods Sold', accountGroup: 'Expenses', accountType: 'P&L', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 8500000, currency: 'USD' },
  { id: '21', accountNumber: '5010000', accountName: 'Material Costs', accountGroup: 'Expenses', accountType: 'P&L', level: 2, parentAccount: '5000000', status: 'Active', postingAllowed: 'Yes', balance: 5200000, currency: 'USD' },
  { id: '22', accountNumber: '5020000', accountName: 'Direct Labor', accountGroup: 'Expenses', accountType: 'P&L', level: 2, parentAccount: '5000000', status: 'Active', postingAllowed: 'Yes', balance: 2100000, currency: 'USD' },
  { id: '23', accountNumber: '5030000', accountName: 'Manufacturing Overhead', accountGroup: 'Expenses', accountType: 'P&L', level: 2, parentAccount: '5000000', status: 'Active', postingAllowed: 'Yes', balance: 1200000, currency: 'USD' },
  { id: '24', accountNumber: '6000000', accountName: 'Operating Expenses', accountGroup: 'Expenses', accountType: 'P&L', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 2800000, currency: 'USD' },
  { id: '25', accountNumber: '6010000', accountName: 'Sales & Marketing', accountGroup: 'Expenses', accountType: 'P&L', level: 2, parentAccount: '6000000', status: 'Active', postingAllowed: 'Yes', balance: 1200000, currency: 'USD' },
  { id: '26', accountNumber: '6020000', accountName: 'Research & Development', accountGroup: 'Expenses', accountType: 'P&L', level: 2, parentAccount: '6000000', status: 'Active', postingAllowed: 'Yes', balance: 850000, currency: 'USD' },
  { id: '27', accountNumber: '6030000', accountName: 'General & Administrative', accountGroup: 'Expenses', accountType: 'P&L', level: 2, parentAccount: '6000000', status: 'Active', postingAllowed: 'Yes', balance: 750000, currency: 'USD' },
  { id: '28', accountNumber: '7000000', accountName: 'Other Income/Expense', accountGroup: 'Other', accountType: 'P&L', level: 1, parentAccount: '', status: 'Active', postingAllowed: 'Yes', balance: 150000, currency: 'USD' },
  { id: '29', accountNumber: '7010000', accountName: 'Interest Income', accountGroup: 'Other', accountType: 'P&L', level: 2, parentAccount: '7000000', status: 'Active', postingAllowed: 'Yes', balance: 85000, currency: 'USD' },
  { id: '30', accountNumber: '7020000', accountName: 'Interest Expense', accountGroup: 'Other', accountType: 'P&L', level: 2, parentAccount: '7000000', status: 'Active', postingAllowed: 'Yes', balance: -65000, currency: 'USD' },
];

const ChartOfAccounts: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  
  const [accounts, setAccounts] = useLocalStorage<Account[]>(STORAGE_KEY, defaultAccounts);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [form, setForm] = useState<Omit<Account, 'id' | 'accountNumber'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Chart of Accounts. Define and maintain chart of accounts structure for financial reporting.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingAccount(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (account: Account) => {
    setEditingAccount(account);
    setForm({
      accountName: account.accountName,
      accountGroup: account.accountGroup,
      accountType: account.accountType,
      level: account.level,
      parentAccount: account.parentAccount,
      status: account.status,
      postingAllowed: account.postingAllowed,
      balance: account.balance,
      currency: account.currency,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.accountName.trim()) {
      toast({ title: 'Validation Error', description: 'Account name is required.', variant: 'destructive' });
      return;
    }
    if (editingAccount) {
      setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...editingAccount, ...form } : a));
      toast({ title: 'Account Updated', description: `${form.accountName} has been updated.` });
    } else {
      const newAccount: Account = {
        id: String(Date.now()),
        accountNumber: `${String(accounts.length + 1).padStart(7, '0')}`,
        ...form,
      };
      setAccounts(prev => [...prev, newAccount]);
      toast({ title: 'Account Created', description: `${form.accountName} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (account: Account) => {
    setAccounts(prev => prev.filter(a => a.id !== account.id));
    toast({ title: 'Account Deleted', description: `${account.accountName} has been removed.` });
  };

  const handleView = (account: Account) => {
    setSelectedAccount(account);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Blocked': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'accountNumber', header: 'Account Number' },
    { key: 'accountName', header: 'Account Name' },
    { key: 'accountGroup', header: 'Account Group' },
    { key: 'accountType', header: 'Account Type' },
    { key: 'level', header: 'Level' },
    { key: 'parentAccount', header: 'Parent Account' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    { 
      key: 'postingAllowed', 
      header: 'Posting',
      render: (value: string) => (
        <Badge className={value === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Account) => (
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
          onClick={() => navigate('/master-data')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Chart of Accounts"
          description="Define and maintain chart of accounts structure"
          voiceIntroduction="Welcome to Chart of Accounts."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Accounts</div>
          <div className="text-2xl font-bold">{accounts.length}</div>
          <div className="text-sm text-blue-600">All account records</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Active Accounts</div>
          <div className="text-2xl font-bold">{accounts.filter(a => a.status === 'Active').length}</div>
          <div className="text-sm text-green-600">Currently active</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Balance Sheet</div>
          <div className="text-2xl font-bold">{accounts.filter(a => a.accountType === 'Balance Sheet').length}</div>
          <div className="text-sm text-purple-600">Assets & Liabilities</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">P&L Accounts</div>
          <div className="text-2xl font-bold">{accounts.filter(a => a.accountType === 'P&L').length}</div>
          <div className="text-sm text-orange-600">Revenue & Expenses</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Account Records</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Account
        </Button>
      </div>

      <Card className="p-6">
        <DataTable columns={columns} data={accounts} />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Create New Account'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="accountName">Account Name *</Label>
              <Input
                id="accountName"
                value={form.accountName}
                onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                placeholder="Enter account name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accountGroup">Account Group</Label>
              <Select value={form.accountGroup} onValueChange={(value) => setForm({ ...form, accountGroup: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assets">Assets</SelectItem>
                  <SelectItem value="Liabilities">Liabilities</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expenses">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={form.accountType} onValueChange={(value) => setForm({ ...form, accountType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Balance Sheet">Balance Sheet</SelectItem>
                    <SelectItem value="P&L">P&L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Level</Label>
                <Select value={String(form.level)} onValueChange={(value) => setForm({ ...form, level: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parentAccount">Parent Account</Label>
              <Select value={form.parentAccount} onValueChange={(value) => setForm({ ...form, parentAccount: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {accounts.filter(a => a.level === form.level - 1).map(a => (
                    <SelectItem key={a.accountNumber} value={a.accountNumber}>{a.accountNumber} - {a.accountName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value: 'Active' | 'Inactive' | 'Blocked') => setForm({ ...form, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postingAllowed">Posting Allowed</Label>
                <Select value={form.postingAllowed} onValueChange={(value: 'Yes' | 'No') => setForm({ ...form, postingAllowed: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingAccount ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Account Number:</span>
                <span className="font-medium">{selectedAccount.accountNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Account Name:</span>
                <span className="font-medium">{selectedAccount.accountName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Account Group:</span>
                <span className="font-medium">{selectedAccount.accountGroup}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Account Type:</span>
                <span className="font-medium">{selectedAccount.accountType}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Level:</span>
                <span className="font-medium">{selectedAccount.level}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Parent Account:</span>
                <span className="font-medium">{selectedAccount.parentAccount || 'None'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedAccount.status)}>{selectedAccount.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Posting Allowed:</span>
                <Badge className={selectedAccount.postingAllowed === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {selectedAccount.postingAllowed}
                </Badge>
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

export default ChartOfAccounts;
