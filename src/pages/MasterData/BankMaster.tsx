
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Eye, Edit, Trash2, Building, CreditCard } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface Bank {
  id: string;
  bankKey: string;
  bankName: string;
  country: string;
  city: string;
  swiftCode: string;
  routingNumber: string;
  bankGroup: string;
  status: 'Active' | 'Inactive' | 'Blocked';
}

const defaultForm: Omit<Bank, 'id' | 'bankKey'> = {
  bankName: '',
  country: 'United States',
  city: '',
  swiftCode: '',
  routingNumber: '',
  bankGroup: 'Commercial',
  status: 'Active',
};

const STORAGE_KEY = 'sap_bankmaster';

const defaultBanks: Bank[] = [
  { id: '1', bankKey: 'BANK-001', bankName: 'First National Bank', country: 'United States', city: 'New York', swiftCode: 'FNBKUS33XXX', routingNumber: '021000021', bankGroup: 'Commercial', status: 'Active' },
  { id: '2', bankKey: 'BANK-002', bankName: 'Deutsche Bank AG', country: 'Germany', city: 'Frankfurt', swiftCode: 'DEUTDEFFXXX', routingNumber: '', bankGroup: 'International', status: 'Active' },
  { id: '3', bankKey: 'BANK-003', bankName: 'HSBC Bank PLC', country: 'United Kingdom', city: 'London', swiftCode: 'HBUKGB4BXXX', routingNumber: '', bankGroup: 'International', status: 'Inactive' },
  { id: '4', bankKey: 'BANK-004', bankName: 'JP Morgan Chase', country: 'United States', city: 'New York', swiftCode: 'CHASUS33XXX', routingNumber: '021202337', bankGroup: 'Commercial', status: 'Active' },
  { id: '5', bankKey: 'BANK-005', bankName: 'Bank of Tokyo-Mitsubishi', country: 'Japan', city: 'Tokyo', swiftCode: 'BOTKJPJTXXX', routingNumber: '', bankGroup: 'International', status: 'Active' },
  { id: '6', bankKey: 'BANK-006', bankName: 'Citibank NA', country: 'United States', city: 'New York', swiftCode: 'CITIUS33XXX', routingNumber: '021000089', bankGroup: 'Commercial', status: 'Active' },
  { id: '7', bankKey: 'BANK-007', bankName: 'Santander Bank', country: 'Spain', city: 'Madrid', swiftCode: 'BSCHESMMXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '8', bankKey: 'BANK-008', bankName: 'ING Bank', country: 'Netherlands', city: 'Amsterdam', swiftCode: 'INGBNL2AXXX', routingNumber: '', bankGroup: 'International', status: 'Active' },
  { id: '9', bankKey: 'BANK-009', bankName: 'UBS AG', country: 'Switzerland', city: 'Zurich', swiftCode: 'UBSWCHZH80AXXX', routingNumber: '', bankGroup: 'Private', status: 'Active' },
  { id: '10', bankKey: 'BANK-010', bankName: 'BNP Paribas', country: 'France', city: 'Paris', swiftCode: 'BNPAFRPPXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '11', bankKey: 'BANK-011', bankName: 'Wells Fargo', country: 'United States', city: 'San Francisco', swiftCode: 'WFBIUS6SXXX', routingNumber: '121000248', bankGroup: 'Commercial', status: 'Active' },
  { id: '12', bankKey: 'BANK-012', bankName: 'Barclays Bank', country: 'United Kingdom', city: 'London', swiftCode: 'BARCGB22XXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '13', bankKey: 'BANK-013', bankName: 'Mizuho Bank', country: 'Japan', city: 'Tokyo', swiftCode: 'MHCBJPJTXXX', routingNumber: '', bankGroup: 'International', status: 'Active' },
  { id: '14', bankKey: 'BANK-014', bankName: 'Bank of America', country: 'United States', city: 'Charlotte', swiftCode: 'BOFAUS3NXXX', routingNumber: '011000138', bankGroup: 'Commercial', status: 'Active' },
  { id: '15', bankKey: 'BANK-015', bankName: 'Credit Suisse', country: 'Switzerland', city: 'Zurich', swiftCode: 'CRESCHZZ80AXXX', routingNumber: '', bankGroup: 'Private', status: 'Active' },
  { id: '16', bankKey: 'BANK-016', bankName: 'Societe Generale', country: 'France', city: 'Paris', swiftCode: 'SOGEFRPPXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '17', bankKey: 'BANK-017', bankName: 'UniCredit Bank', country: 'Italy', city: 'Milan', swiftCode: 'UNCRITMMXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '18', bankKey: 'BANK-018', bankName: 'Goldman Sachs', country: 'United States', city: 'New York', swiftCode: 'GOLDUS33XXX', routingNumber: '021000210', bankGroup: 'Investment', status: 'Active' },
  { id: '19', bankKey: 'BANK-019', bankName: 'Morgan Stanley', country: 'United States', city: 'New York', swiftCode: 'MSGIUS33XXX', routingNumber: '021000322', bankGroup: 'Investment', status: 'Active' },
  { id: '20', bankKey: 'BANK-020', bankName: 'Australia and New Zealand Banking', country: 'Australia', city: 'Melbourne', swiftCode: 'ANZBAU3MXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '21', bankKey: 'BANK-021', bankName: 'Royal Bank of Canada', country: 'Canada', city: 'Toronto', swiftCode: 'ROYCCAT2XXX', routingNumber: '000300013', bankGroup: 'Commercial', status: 'Active' },
  { id: '22', bankKey: 'BANK-022', bankName: 'Scotiabank', country: 'Canada', city: 'Toronto', swiftCode: 'NOSCUS33XXX', routingNumber: '000300215', bankGroup: 'Commercial', status: 'Active' },
  { id: '23', bankKey: 'BANK-023', bankName: 'China Construction Bank', country: 'China', city: 'Beijing', swiftCode: 'PCBCCNBJXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '24', bankKey: 'BANK-024', bankName: 'Industrial and Commercial Bank of China', country: 'China', city: 'Shanghai', swiftCode: 'ICBKCNBJXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '25', bankKey: 'BANK-025', bankName: 'State Bank of India', country: 'India', city: 'Mumbai', swiftCode: 'SBININBBXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '26', bankKey: 'BANK-026', bankName: 'Nordea Bank', country: 'Sweden', city: 'Stockholm', swiftCode: 'NDEASESSXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '27', bankKey: 'BANK-027', bankName: 'Danske Bank', country: 'Denmark', city: 'Copenhagen', swiftCode: 'DABADKKKXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
  { id: '28', bankKey: 'BANK-028', bankName: 'PNC Bank', country: 'United States', city: 'Pittsburgh', swiftCode: 'PNCCUS33XXX', routingNumber: '031000053', bankGroup: 'Commercial', status: 'Active' },
  { id: '29', bankKey: 'BANK-029', bankName: 'TD Bank', country: 'Canada', city: 'Toronto', swiftCode: 'TDOMCAITGXXX', routingNumber: '000300116', bankGroup: 'Commercial', status: 'Active' },
  { id: '30', bankKey: 'BANK-030', bankName: 'CaixaBank', country: 'Spain', city: 'Barcelona', swiftCode: 'CAIXESBBXXX', routingNumber: '', bankGroup: 'Commercial', status: 'Active' },
];

const BankMaster: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  
  const [banks, setBanks] = useLocalStorage<Bank[]>(STORAGE_KEY, defaultBanks);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [form, setForm] = useState<Omit<Bank, 'id' | 'bankKey'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Bank Master. Manage bank information for payment processing and cash management.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingBank(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (bank: Bank) => {
    setEditingBank(bank);
    setForm({
      bankName: bank.bankName,
      country: bank.country,
      city: bank.city,
      swiftCode: bank.swiftCode,
      routingNumber: bank.routingNumber,
      bankGroup: bank.bankGroup,
      status: bank.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.bankName.trim()) {
      toast({ title: 'Validation Error', description: 'Bank name is required.', variant: 'destructive' });
      return;
    }
    if (editingBank) {
      setBanks(prev => prev.map(b => b.id === editingBank.id ? { ...editingBank, ...form } : b));
      toast({ title: 'Bank Updated', description: `${form.bankName} has been updated.` });
    } else {
      const newBank: Bank = {
        id: String(Date.now()),
        bankKey: `BANK-${String(banks.length + 1).padStart(3, '0')}`,
        ...form,
      };
      setBanks(prev => [...prev, newBank]);
      toast({ title: 'Bank Created', description: `${form.bankName} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (bank: Bank) => {
    setBanks(prev => prev.filter(b => b.id !== bank.id));
    toast({ title: 'Bank Deleted', description: `${bank.bankName} has been removed.` });
  };

  const handleView = (bank: Bank) => {
    setSelectedBank(bank);
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
    { key: 'bankKey', header: 'Bank Key' },
    { key: 'bankName', header: 'Bank Name' },
    { key: 'country', header: 'Country' },
    { key: 'city', header: 'City' },
    { key: 'swiftCode', header: 'SWIFT Code' },
    { key: 'routingNumber', header: 'Routing Number' },
    { key: 'bankGroup', header: 'Bank Group' },
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
      render: (_: any, row: Bank) => (
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
          title="Bank Master"
          description="Manage bank information for payment processing"
          voiceIntroduction="Welcome to Bank Master."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Banks</div>
          <div className="text-2xl font-bold">{banks.length}</div>
          <div className="text-sm text-blue-600">All bank records</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Active Banks</div>
          <div className="text-2xl font-bold">{banks.filter(b => b.status === 'Active').length}</div>
          <div className="text-sm text-green-600">Currently active</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Countries</div>
          <div className="text-2xl font-bold">{new Set(banks.map(b => b.country)).size}</div>
          <div className="text-sm text-purple-600">Global coverage</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Bank Groups</div>
          <div className="text-2xl font-bold">{new Set(banks.map(b => b.bankGroup)).size}</div>
          <div className="text-sm text-orange-600">Categories defined</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bank Records</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bank
        </Button>
      </div>

      <Card className="p-6">
        <DataTable columns={columns} data={banks} />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBank ? 'Edit Bank' : 'Create New Bank'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                placeholder="Enter bank name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Select value={form.country} onValueChange={(value) => setForm({ ...form, country: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="swiftCode">SWIFT Code</Label>
                <Input
                  id="swiftCode"
                  value={form.swiftCode}
                  onChange={(e) => setForm({ ...form, swiftCode: e.target.value.toUpperCase() })}
                  placeholder="XXXXUS33XXX"
                  maxLength={11}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  value={form.routingNumber}
                  onChange={(e) => setForm({ ...form, routingNumber: e.target.value })}
                  placeholder="021000021"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bankGroup">Bank Group</Label>
                <Select value={form.bankGroup} onValueChange={(value) => setForm({ ...form, bankGroup: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="Central Bank">Central Bank</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingBank ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bank Details</DialogTitle>
          </DialogHeader>
          {selectedBank && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Bank Key:</span>
                <span className="font-medium">{selectedBank.bankKey}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Bank Name:</span>
                <span className="font-medium">{selectedBank.bankName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Country:</span>
                <span className="font-medium">{selectedBank.country}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">City:</span>
                <span className="font-medium">{selectedBank.city}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">SWIFT Code:</span>
                <span className="font-medium">{selectedBank.swiftCode}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Routing Number:</span>
                <span className="font-medium">{selectedBank.routingNumber || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedBank.status)}>{selectedBank.status}</Badge>
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

export default BankMaster;
