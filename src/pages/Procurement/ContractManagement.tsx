
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
import { ArrowLeft, Plus, Edit, Eye, FileText, Calendar, AlertTriangle, Save, X, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { seedProcurementData, getProcurementData, Contract, Supplier } from '../../lib/procurementData';

interface ContractFormData {
  supplier: string;
  title: string;
  type: 'Service' | 'Supply' | 'Framework' | 'Maintenance';
  status: 'Active' | 'Expired' | 'Pending' | 'Draft';
  startDate: string;
  endDate: string;
  value: string;
  currency: string;
  renewalOption: boolean;
  owner: string;
  terms: string;
}

const contractTitles = [
  'IT Equipment Supply Agreement', 'Office Supplies Framework', 'Maintenance Services Contract',
  'Software Licensing Agreement', 'Logistics Services Framework', 'Industrial Parts Supply',
  'Medical Supplies Contract', 'Consulting Services Agreement', 'Facilities Management'
];

const ContractManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('contracts');
  const initialData = getProcurementData();
  const [contracts, setContracts] = useState<Contract[]>(() => initialData?.contracts || []);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => initialData?.suppliers || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<ContractFormData>({
    supplier: '',
    title: '',
    type: 'Supply',
    status: 'Draft',
    startDate: '',
    endDate: '',
    value: '',
    currency: 'USD',
    renewalOption: true,
    owner: '',
    terms: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Contract Management. Manage supplier contracts, agreements, and renewal schedules.');
    }
  }, [isEnabled, speak]);

  const generateId = (prefix: string): string => {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  };

  const handleCreate = () => {
    setEditingContract(null);
    setFormData({
      supplier: '',
      title: '',
      type: 'Supply',
      status: 'Draft',
      startDate: '',
      endDate: '',
      value: '',
      currency: 'USD',
      renewalOption: true,
      owner: '',
      terms: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      supplier: contract.supplier,
      title: contract.title,
      type: contract.type,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      value: contract.value.toString(),
      currency: contract.currency,
      renewalOption: contract.renewalOption,
      owner: contract.owner,
      terms: contract.terms
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (contract: Contract) => {
    setDeletingContract(contract);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingContract) {
      const updatedContracts = contracts.filter(c => c.id !== deletingContract.id);
      setContracts(updatedContracts);
      toast({
        title: 'Contract Deleted',
        description: `Contract ${deletingContract.contractNumber} has been deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setDeletingContract(null);
    }
  };

  const handleSubmit = () => {
    if (!formData.supplier || !formData.title || !formData.startDate || !formData.endDate || !formData.value) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const selectedSupplier = suppliers.find(s => s.name === formData.supplier);
    const contractData = {
      supplier: formData.supplier,
      supplierId: selectedSupplier?.id || '',
      title: formData.title,
      type: formData.type,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      value: parseFloat(formData.value),
      currency: formData.currency,
      renewalOption: formData.renewalOption,
      owner: formData.owner,
      terms: formData.terms
    };

    if (editingContract) {
      const updatedContract: Contract = {
        ...editingContract,
        ...contractData,
        supplierId: editingContract.supplierId
      };
      const updatedContracts = contracts.map(c => 
        c.id === editingContract.id ? updatedContract : c
      );
      setContracts(updatedContracts);
      toast({
        title: 'Contract Updated',
        description: `${formData.title} has been updated.`,
      });
    } else {
      const newContract: Contract = {
        id: generateId('ct'),
        contractNumber: `CT-2025-${String(contracts.length + 1).padStart(3, '0')}`,
        ...contractData,
        createdAt: new Date().toISOString()
      };
      const updatedContracts = [...contracts, newContract];
      setContracts(updatedContracts);
      toast({
        title: 'Contract Created',
        description: `${formData.title} has been created.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleScheduleRenewal = (contract: Contract) => {
    toast({ title: 'Schedule Renewal', description: `Scheduling renewal for contract ${contract.contractNumber}` });
  };

  const handleRenewNow = (contract: Contract) => {
    toast({ title: 'Renew Contract', description: `Renewing contract ${contract.contractNumber}` });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Expired': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Draft': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'contractNumber', header: 'Contract #', sortable: true, searchable: true },
    { key: 'supplier', header: 'Supplier', sortable: true, searchable: true },
    { key: 'title', header: 'Title', searchable: true },
    { key: 'type', header: 'Type', filterable: true, filterOptions: [
      { label: 'Service', value: 'Service' },
      { label: 'Supply', value: 'Supply' },
      { label: 'Framework', value: 'Framework' },
      { label: 'Maintenance', value: 'Maintenance' }
    ]},
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Expired', value: 'Expired' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Draft', value: 'Draft' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    { key: 'endDate', header: 'End Date', sortable: true },
    { 
      key: 'value', 
      header: 'Value',
      sortable: true,
      render: (value: number, row: Contract) => `${row.currency} ${value.toLocaleString()}`
    },
    { key: 'owner', header: 'Owner', searchable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: Contract) => handleEdit(row),
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: Contract) => handleEdit(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Contract) => handleDelete(row),
      variant: 'ghost',
      condition: (row: Contract) => row.status === 'Draft'
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
          title="Contract Management"
          description="Manage supplier contracts, agreements, and renewal schedules"
          voiceIntroduction="Welcome to Contract Management for comprehensive contract lifecycle management."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{contracts.length}</div>
            <div className="text-sm text-muted-foreground">Total Contracts</div>
            <div className="text-sm text-blue-600">+3 this month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contracts.filter(c => c.status === 'Active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Contracts</div>
            <div className="text-sm text-green-600">Well managed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contracts.filter(c => new Date(c.endDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-muted-foreground">Expiring Soon</div>
            <div className="text-sm text-orange-600">Needs attention</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${contracts.reduce((sum, c) => sum + c.value, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-sm text-green-600">Portfolio value</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Contract Portfolio
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Contract
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={contracts}
                actions={actions}
                searchPlaceholder="Search contracts by number, supplier, or title..."
                exportable={true}
                refreshable={true}
                onRefresh={() => {
                  const data = getProcurementData();
                  if (data) {
                    setContracts(data.contracts);
                    setSuppliers(data.suppliers);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.filter(c => c.renewalOption).map((contract) => (
                  <div key={contract.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {contract.supplier} - {contract.contractNumber}
                        </p>
                        <p className="text-sm">Expires: {contract.endDate}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleScheduleRenewal(contract)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Renewal
                        </Button>
                        <Button size="sm" onClick={() => handleRenewNow(contract)}>
                          Renew Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {contracts.filter(c => c.renewalOption).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No contracts with renewal options.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Service', 'Supply', 'Framework', 'Maintenance'].map((type) => {
                    const count = contracts.filter(c => c.type === type).length;
                    const value = contracts.filter(c => c.type === type).reduce((sum, c) => sum + c.value, 0);
                    return (
                      <div key={type} className="flex justify-between">
                        <span>{type}</span>
                        <span className="font-medium">{count} (${value.toLocaleString()})</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardTitle>Status Overview</CardTitle>
              <CardContent>
                <div className="space-y-4">
                  {['Active', 'Expired', 'Pending', 'Draft'].map((status) => {
                    const count = contracts.filter(c => c.status === status).length;
                    return (
                      <div key={status} className="flex justify-between">
                        <span>{status}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
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
            <DialogTitle>{editingContract ? 'Edit Contract' : 'Create New Contract'}</DialogTitle>
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
                <Label htmlFor="title">Contract Title *</Label>
                <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTitles.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Supply">Supply</SelectItem>
                    <SelectItem value="Framework">Framework</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value">Contract Value *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
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
                <Label htmlFor="owner">Contract Owner</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Enter owner name"
                />
              </div>
              <div className="grid gap-2 pt-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="renewalOption"
                    checked={formData.renewalOption}
                    onChange={(e) => setFormData({ ...formData, renewalOption: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="renewalOption">Auto Renewal Option</Label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Enter terms and conditions..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {editingContract ? 'Update' : 'Create'} Contract
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
          <p>Are you sure you want to delete contract "{deletingContract?.title}"? This action cannot be undone.</p>
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

export default ContractManagement;
