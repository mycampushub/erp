
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Plus, Package, Calculator, TrendingDown, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';

interface Asset {
  id: string;
  assetNumber: string;
  description: string;
  assetClass: string;
  acquisitionValue: number;
  accumulatedDepreciation: number;
  bookValue: number;
  acquisitionDate: string;
  usefulLife: number;
  depreciationMethod: 'Straight Line' | 'Declining Balance' | 'Units of Production';
  status: 'Active' | 'Retired' | 'Under Construction' | 'Sold';
  location: string;
  costCenter: string;
}

const defaultForm: Omit<Asset, 'id' | 'assetNumber' | 'accumulatedDepreciation' | 'bookValue'> = {
  description: '',
  assetClass: 'Computer Equipment',
  acquisitionValue: 0,
  acquisitionDate: new Date().toISOString().split('T')[0],
  usefulLife: 5,
  depreciationMethod: 'Straight Line',
  status: 'Active',
  location: '',
  costCenter: '',
};

const FixedAssets: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('assets');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<Omit<Asset, 'id' | 'assetNumber' | 'accumulatedDepreciation' | 'bookValue'>>(defaultForm);
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Fixed Assets Management. Manage asset lifecycle, depreciation calculations, and asset accounting with comprehensive tracking and reporting.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    const sampleAssets: Asset[] = [
      {
        id: 'asset-001',
        assetNumber: 'IT-001',
        description: 'Dell Laptop Computer',
        assetClass: 'Computer Equipment',
        acquisitionValue: 2500.00,
        accumulatedDepreciation: 500.00,
        bookValue: 2000.00,
        acquisitionDate: '2024-01-15',
        usefulLife: 5,
        depreciationMethod: 'Straight Line',
        status: 'Active',
        location: 'Office Building A',
        costCenter: 'IT Department'
      },
      {
        id: 'asset-002',
        assetNumber: 'VEH-001',
        description: 'Company Vehicle - Toyota Camry',
        assetClass: 'Vehicles',
        acquisitionValue: 35000.00,
        accumulatedDepreciation: 7000.00,
        bookValue: 28000.00,
        acquisitionDate: '2023-06-20',
        usefulLife: 10,
        depreciationMethod: 'Declining Balance',
        status: 'Active',
        location: 'Main Parking',
        costCenter: 'General Administration'
      }
    ];
    setAssets(sampleAssets);
  }, []);

  const openCreate = () => {
    setEditingAsset(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({
      description: asset.description,
      assetClass: asset.assetClass,
      acquisitionValue: asset.acquisitionValue,
      acquisitionDate: asset.acquisitionDate,
      usefulLife: asset.usefulLife,
      depreciationMethod: asset.depreciationMethod,
      status: asset.status,
      location: asset.location,
      costCenter: asset.costCenter,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.description.trim()) {
      toast({ title: 'Validation Error', description: 'Asset description is required.', variant: 'destructive' });
      return;
    }
    if (form.acquisitionValue <= 0) {
      toast({ title: 'Validation Error', description: 'Acquisition value must be greater than 0.', variant: 'destructive' });
      return;
    }
    if (editingAsset) {
      const updatedAsset = { ...editingAsset, ...form };
      updatedAsset.bookValue = updatedAsset.acquisitionValue - updatedAsset.accumulatedDepreciation;
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? updatedAsset : a));
      toast({ title: 'Asset Updated', description: `${form.description} has been updated.` });
    } else {
      const newAsset: Asset = {
        id: String(Date.now()),
        assetNumber: `AST-${String(assets.length + 1).padStart(3, '0')}`,
        ...form,
        accumulatedDepreciation: 0,
        bookValue: form.acquisitionValue,
      };
      setAssets(prev => [...prev, newAsset]);
      toast({ title: 'Asset Created', description: `${form.description} has been added to the asset register.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (asset: Asset) => {
    setAssets(prev => prev.filter(a => a.id !== asset.id));
    toast({ title: 'Asset Deleted', description: `${asset.description} has been removed.` });
  };

  const handleView = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsViewDialogOpen(true);
  };

  const handleCalculateDepreciation = (asset: Asset) => {
    const annualDepreciation = asset.depreciationMethod === 'Straight Line' 
      ? asset.acquisitionValue / asset.usefulLife
      : asset.acquisitionValue * 0.2;
    toast({ title: 'Depreciation Calculated', description: `Annual depreciation: $${annualDepreciation.toFixed(2)}` });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Retired': 'bg-gray-100 text-gray-800',
      'Under Construction': 'bg-blue-100 text-blue-800',
      'Sold': 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'assetNumber', header: 'Asset #', sortable: true, searchable: true },
    { key: 'description', header: 'Description', searchable: true },
    { key: 'assetClass', header: 'Asset Class', searchable: true },
    { 
      key: 'acquisitionValue', 
      header: 'Acquisition Value',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'bookValue', 
      header: 'Book Value',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Retired', value: 'Retired' },
        { label: 'Under Construction', value: 'Under Construction' },
        { label: 'Sold', value: 'Sold' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    { key: 'location', header: 'Location', searchable: true },
    { key: 'costCenter', header: 'Cost Center', searchable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: openEdit,
      variant: 'ghost'
    },
    {
      label: 'Calculate Depreciation',
      icon: <Calculator className="h-4 w-4" />,
      onClick: handleCalculateDepreciation,
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: 'ghost'
    }
  ];

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
          title="Fixed Assets"
          description="Manage asset lifecycle, depreciation, and asset accounting"
          voiceIntroduction="Welcome to Fixed Assets Management for comprehensive asset lifecycle tracking."
        />
      </div>

      <VoiceTrainingComponent 
        module="finance"
        topic="Fixed Asset Accounting"
        examples={[
          "Managing asset master data with acquisition costs, useful life, and depreciation methods including straight-line and declining balance",
          "Processing asset acquisitions and retirements with proper accounting entries and tax implications",
          "Running periodic depreciation calculations with automatic posting to financial accounts and cost centers"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{assets.length}</div>
            <div className="text-sm text-muted-foreground">Total Assets</div>
            <div className="text-sm text-blue-600">Active portfolio</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${assets.reduce((sum, asset) => sum + asset.acquisitionValue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Acquisition Value</div>
            <div className="text-sm text-green-600">Historical cost</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${assets.reduce((sum, asset) => sum + asset.bookValue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Net Book Value</div>
            <div className="text-sm text-purple-600">Current value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${assets.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Accumulated Depreciation</div>
            <div className="text-sm text-red-600">Total depreciated</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assets">Asset Register</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Asset Register
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={assets}
                actions={actions}
                searchPlaceholder="Search assets..."
                exportable={true}
                refreshable={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Depreciation Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Straight Line', 'Declining Balance', 'Units of Production'].map((method) => {
                    const count = assets.filter(asset => asset.depreciationMethod === method).length;
                    return (
                      <div key={method} className="flex justify-between items-center p-3 border rounded">
                        <span>{method}</span>
                        <Badge variant="outline">{count} assets</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Depreciation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>January 2025</span>
                    <span className="font-medium text-red-600">$625</span>
                  </div>
                  <div className="flex justify-between">
                    <span>December 2024</span>
                    <span className="font-medium text-red-600">$625</span>
                  </div>
                  <div className="flex justify-between">
                    <span>November 2024</span>
                    <span className="font-medium text-red-600">$625</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Yearly Total</span>
                      <span className="text-red-600">$7,500</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'Acquisition', asset: 'IT-001', amount: 2500, date: '2024-01-15' },
                  { type: 'Depreciation', asset: 'IT-001', amount: -41.67, date: '2025-01-31' },
                  { type: 'Acquisition', asset: 'VEH-001', amount: 35000, date: '2023-06-20' },
                  { type: 'Depreciation', asset: 'VEH-001', amount: -583.33, date: '2025-01-31' }
                ].map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <span className="font-medium">{transaction.type}</span>
                      <p className="text-sm text-muted-foreground">{transaction.asset} - {transaction.date}</p>
                    </div>
                    <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Summary by Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Computer Equipment', 'Vehicles', 'Furniture', 'Machinery'].map((assetClass) => {
                    const classAssets = assets.filter(asset => asset.assetClass === assetClass);
                    const totalValue = classAssets.reduce((sum, asset) => sum + asset.bookValue, 0);
                    return (
                      <div key={assetClass} className="flex justify-between">
                        <span>{assetClass}</span>
                        <span className="font-medium">${totalValue.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Aging Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>0-2 years</span>
                    <span className="font-medium">1 asset</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2-5 years</span>
                    <span className="font-medium">1 asset</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5+ years</span>
                    <span className="font-medium">0 assets</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter asset description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assetClass">Asset Class</Label>
                <Select value={form.assetClass} onValueChange={(value) => setForm({ ...form, assetClass: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Equipment">Computer Equipment</SelectItem>
                    <SelectItem value="Vehicles">Vehicles</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Machinery">Machinery</SelectItem>
                    <SelectItem value="Buildings">Buildings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value: 'Active' | 'Retired' | 'Under Construction' | 'Sold') => setForm({ ...form, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Construction">Under Construction</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="acquisitionValue">Acquisition Value *</Label>
                <Input
                  id="acquisitionValue"
                  type="number"
                  value={form.acquisitionValue}
                  onChange={(e) => setForm({ ...form, acquisitionValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={form.acquisitionDate}
                  onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="usefulLife">Useful Life (Years)</Label>
                <Input
                  id="usefulLife"
                  type="number"
                  value={form.usefulLife}
                  onChange={(e) => setForm({ ...form, usefulLife: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="depreciationMethod">Depreciation Method</Label>
                <Select value={form.depreciationMethod} onValueChange={(value: 'Straight Line' | 'Declining Balance' | 'Units of Production') => setForm({ ...form, depreciationMethod: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Straight Line">Straight Line</SelectItem>
                    <SelectItem value="Declining Balance">Declining Balance</SelectItem>
                    <SelectItem value="Units of Production">Units of Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costCenter">Cost Center</Label>
              <Input
                id="costCenter"
                value={form.costCenter}
                onChange={(e) => setForm({ ...form, costCenter: e.target.value })}
                placeholder="Enter cost center"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingAsset ? 'Update' : 'Add Asset'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Asset Number:</span>
                <span className="font-medium">{selectedAsset.assetNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Description:</span>
                <span className="font-medium">{selectedAsset.description}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Asset Class:</span>
                <span className="font-medium">{selectedAsset.assetClass}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Acquisition Value:</span>
                <span className="font-medium">${selectedAsset.acquisitionValue.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Accumulated Depreciation:</span>
                <span className="font-medium">${selectedAsset.accumulatedDepreciation.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Book Value:</span>
                <span className="font-medium">${selectedAsset.bookValue.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Acquisition Date:</span>
                <span className="font-medium">{selectedAsset.acquisitionDate}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Useful Life:</span>
                <span className="font-medium">{selectedAsset.usefulLife} years</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Depreciation Method:</span>
                <span className="font-medium">{selectedAsset.depreciationMethod}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Location:</span>
                <span className="font-medium">{selectedAsset.location}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Cost Center:</span>
                <span className="font-medium">{selectedAsset.costCenter}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedAsset.status)}>{selectedAsset.status}</Badge>
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

export default FixedAssets;
