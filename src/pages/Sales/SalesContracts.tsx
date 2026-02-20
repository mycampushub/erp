
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Search, Plus, Filter, Edit, Trash2, Eye, Download, FileText, RefreshCw } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import PageHeader from '../../components/page/PageHeader';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { SALES_STORAGE_KEYS, SalesContract, DeliverySchedule, initializeSalesData } from '../../lib/salesData';

const SalesContracts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agreements');
  const [contracts, setContracts] = useState<SalesContract[]>([]);
  const [deliverySchedules, setDeliverySchedules] = useState<DeliverySchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<SalesContract | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeSalesData();
    loadData();
  }, []);

  const loadData = () => {
    const storedContracts = listEntities<SalesContract>(SALES_STORAGE_KEYS.CONTRACTS);
    const storedSchedules = listEntities<DeliverySchedule>(SALES_STORAGE_KEYS.DELIVERY_SCHEDULES);
    setContracts(storedContracts);
    setDeliverySchedules(storedSchedules);
    setIsLoading(false);
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contract.type === filterType;
    const matchesStatus = filterStatus === 'all' || contract.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateContract = () => {
    setSelectedContract(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditContract = (contract: SalesContract) => {
    setSelectedContract(contract);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteContract = (contract: SalesContract) => {
    if (window.confirm(`Are you sure you want to delete contract ${contract.contractNumber}?`)) {
      removeEntity(SALES_STORAGE_KEYS.CONTRACTS, contract.id);
      loadData();
      toast({ title: 'Contract Deleted', description: `${contract.contractNumber} has been deleted.` });
    }
  };

  const handleSaveContract = (data: Partial<SalesContract>) => {
    if (isEditing && selectedContract) {
      const updated = { ...selectedContract, ...data };
      upsertEntity(SALES_STORAGE_KEYS.CONTRACTS, updated);
      toast({ title: 'Contract Updated', description: `${updated.contractNumber} has been updated.` });
    } else {
      const newContract: SalesContract = {
        id: generateId('con'),
        contractNumber: `SC-2025-${String(contracts.length + 1).padStart(3, '0')}`,
        type: data.type || 'Volume Agreement',
        customer: data.customer || '',
        customerId: data.customerId || '',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: data.value || 0,
        currency: 'USD',
        status: 'Draft',
        terms: data.terms || '',
        salesRep: data.salesRep || '',
        created: new Date().toISOString().split('T')[0]
      };
      upsertEntity(SALES_STORAGE_KEYS.CONTRACTS, newContract);
      toast({ title: 'Contract Created', description: `${newContract.contractNumber} has been created.` });
    }
    loadData();
    setIsDialogOpen(false);
  };

  const handleExport = () => {
    const headers = ['Contract Number', 'Type', 'Customer', 'Start Date', 'End Date', 'Value', 'Status', 'Sales Rep'];
    const csvContent = [
      headers.join(','),
      ...filteredContracts.map(c => [
        c.contractNumber,
        c.type,
        `"${c.customer}"`,
        c.startDate,
        c.endDate,
        c.value,
        c.status,
        c.salesRep
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contracts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Export Successful', description: `Exported ${filteredContracts.length} contracts` });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Terminated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: EnhancedColumn[] = [
    { key: 'contractNumber', header: 'Contract ID', sortable: true, searchable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'customer', header: 'Customer', sortable: true, searchable: true },
    { key: 'startDate', header: 'Start Date', sortable: true },
    { key: 'endDate', header: 'End Date', sortable: true },
    { 
      key: 'value', 
      header: 'Value',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: SalesContract) => {
        setSelectedContract(row);
        toast({ title: 'View Contract', description: `Opening ${row.contractNumber}` });
      },
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: SalesContract) => handleEditContract(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: SalesContract) => handleDeleteContract(row),
      variant: 'ghost'
    }
  ];

  const scheduleColumns: EnhancedColumn[] = [
    { key: 'scheduleNumber', header: 'Schedule ID', sortable: true },
    { key: 'contractNumber', header: 'Contract Reference', sortable: true },
    { key: 'scheduledDate', header: 'Scheduled Date', sortable: true },
    { key: 'quantity', header: 'Quantity' },
    { key: 'product', header: 'Product' },
    { 
      key: 'deliveryStatus', 
      header: 'Status',
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Planned': 'bg-gray-100 text-gray-800',
          'Confirmed': 'bg-blue-100 text-blue-800',
          'Scheduled': 'bg-purple-100 text-purple-800',
          'Delivered': 'bg-green-100 text-green-800',
          'Cancelled': 'bg-red-100 text-red-800'
        };
        return <Badge className={colors[value] || 'bg-gray-100'}>{value}</Badge>;
      }
    }
  ];

  const contractMetrics = [
    { title: 'Total Contracts', value: contracts.length },
    { title: 'Active', value: contracts.filter(c => c.status === 'Active').length },
    { title: 'Pending Approval', value: contracts.filter(c => c.status === 'Pending Approval').length },
    { title: 'Total Value', value: `$${(contracts.reduce((sum, c) => sum + c.value, 0) / 1000000).toFixed(1)}M` }
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Sales Contracts"
        description="Manage contract agreements, delivery schedules, and contract templates"
      />

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        <Button onClick={handleCreateContract}>
          <Plus className="h-4 w-4 mr-2" />
          Create Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {contractMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-sm text-muted-foreground">{metric.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="agreements" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agreements">Contract Agreements</TabsTrigger>
          <TabsTrigger value="schedules">Delivery Schedules</TabsTrigger>
          <TabsTrigger value="templates">Contract Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="agreements" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Contracts</span>
                <div className="flex space-x-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Volume Agreement">Volume Agreement</SelectItem>
                      <SelectItem value="Service Agreement">Service Agreement</SelectItem>
                      <SelectItem value="Value Contract">Value Contract</SelectItem>
                      <SelectItem value="Quantity Contract">Quantity Contract</SelectItem>
                      <SelectItem value="Scheduling Agreement">Scheduling Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending approval">Pending Approval</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex mb-4">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search contracts..." 
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
                  columns={columns}
                  data={filteredContracts}
                  actions={actions}
                  searchPlaceholder="Search contracts..."
                  exportable={true}
                  refreshable={true}
                  onRefresh={loadData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={scheduleColumns}
                  data={deliverySchedules}
                  searchPlaceholder="Search delivery schedules..."
                  exportable={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Volume-Based Agreement', 'Service Level Agreement', 'Value-Based Contract', 'Scheduling Agreement'].map((template) => (
                  <div key={template} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <h3 className="font-semibold">{template}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Click to use template</p>
                    <Button variant="outline" className="w-full mt-2" size="sm" onClick={() => {
                      toast({ title: 'Template Selected', description: `Using ${template} template` });
                      handleCreateContract();
                    }}>
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Contract' : 'Create New Contract'}</DialogTitle>
          </DialogHeader>
          <ContractForm 
            contract={selectedContract}
            onSave={handleSaveContract}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ContractForm: React.FC<{
  contract: SalesContract | null;
  onSave: (data: Partial<SalesContract>) => void;
  onCancel: () => void;
}> = ({ contract, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: contract?.type || 'Volume Agreement' as const,
    customer: contract?.customer || '',
    customerId: contract?.customerId || '',
    startDate: contract?.startDate || '',
    endDate: contract?.endDate || '',
    value: contract?.value || 0,
    status: contract?.status || 'Draft' as const,
    terms: contract?.terms || '',
    salesRep: contract?.salesRep || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Contract Type</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Volume Agreement">Volume Agreement</SelectItem>
              <SelectItem value="Service Agreement">Service Agreement</SelectItem>
              <SelectItem value="Value Contract">Value Contract</SelectItem>
              <SelectItem value="Quantity Contract">Quantity Contract</SelectItem>
              <SelectItem value="Scheduling Agreement">Scheduling Agreement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Pending Approval">Pending Approval</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Customer</Label>
          <Input 
            value={formData.customer}
            onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Sales Representative</Label>
          <Input 
            value={formData.salesRep}
            onChange={(e) => setFormData(prev => ({ ...prev, salesRep: e.target.value }))}
          />
        </div>
        <div>
          <Label>Start Date</Label>
          <Input 
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input 
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Contract Value</Label>
          <Input 
            type="number"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
            required
          />
        </div>
      </div>
      <div>
        <Label>Terms & Conditions</Label>
        <Textarea 
          value={formData.terms}
          onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
          rows={4}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{contract ? 'Update' : 'Create'} Contract</Button>
      </div>
    </form>
  );
};

export default SalesContracts;
