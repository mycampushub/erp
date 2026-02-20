import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Target, RefreshCw, Save, X } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { seedProcurementData, getProcurementData, SourceList } from '../../lib/procurementData';
import { generateId } from '../../lib/localCrud';

const SourceDetermination: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('sources');
  const initialData = getProcurementData();
  const [sourceLists, setSourceLists] = useState<SourceList[]>(() => initialData?.sourceLists || []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SourceList | null>(null);
  const [viewingItem, setViewingItem] = useState<SourceList | null>(null);
  const [itemToDelete, setItemToDelete] = useState<SourceList | null>(null);

  const [formData, setFormData] = useState({
    materialCode: '',
    materialDescription: '',
    category: '',
    preferredSuppliers: [] as string[],
    alternativeSuppliers: [] as string[],
    status: 'Active' as 'Active' | 'Inactive' | 'Under Review',
    leadTime: 1,
    minOrderQty: 1,
    priceValidity: '2025-12-31',
    evaluationCriteria: 'Price, Quality, Delivery, Service',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [preferredSupplierInput, setPreferredSupplierInput] = useState('');
  const [alternativeSupplierInput, setAlternativeSupplierInput] = useState('');

  const categories = ['IT Equipment', 'Office Supplies', 'Furniture', 'Services', 'Manufacturing', 'Maintenance', 'Raw Materials', 'Industrial Equipment'];
  const suppliers = ['Dell Technologies', 'HP Inc.', 'Lenovo Group', 'ASUSTek', 'Acer Inc.', 'Office Depot', 'Staples Inc.', 'Amazon Business', 'Grainger', 'Uline', 'Siemens AG', 'GE Healthcare', '3M Company', 'Honeywell', 'ABB Ltd'];

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Source Determination. Manage supplier selection criteria and source lists for optimal procurement decisions.');
    }
  }, [isEnabled, speak]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.materialCode.trim()) errors.materialCode = 'Material code is required';
    if (!formData.materialDescription.trim()) errors.materialDescription = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (formData.preferredSuppliers.length === 0) errors.preferredSuppliers = 'At least one preferred supplier is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      materialCode: '',
      materialDescription: '',
      category: '',
      preferredSuppliers: [],
      alternativeSuppliers: [],
      status: 'Active',
      leadTime: 1,
      minOrderQty: 1,
      priceValidity: '2025-12-31',
      evaluationCriteria: 'Price, Quality, Delivery, Service',
    });
    setFormErrors({});
    setPreferredSupplierInput('');
    setAlternativeSupplierInput('');
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (item: SourceList) => {
    setEditingItem(item);
    setFormData({
      materialCode: item.materialCode,
      materialDescription: item.materialDescription,
      category: item.category,
      preferredSuppliers: item.preferredSuppliers || [],
      alternativeSuppliers: item.alternativeSuppliers || [],
      status: item.status,
      leadTime: item.leadTime || 1,
      minOrderQty: item.minOrderQty || 1,
      priceValidity: item.priceValidity || '2025-12-31',
      evaluationCriteria: item.evaluationCriteria || 'Price, Quality, Delivery, Service',
    });
    setFormErrors({});
    setPreferredSupplierInput('');
    setAlternativeSupplierInput('');
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (item: SourceList) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (item: SourceList) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const addPreferredSupplier = () => {
    if (preferredSupplierInput.trim() && !formData.preferredSuppliers.includes(preferredSupplierInput.trim())) {
      setFormData({
        ...formData,
        preferredSuppliers: [...formData.preferredSuppliers, preferredSupplierInput.trim()],
      });
      setPreferredSupplierInput('');
    }
  };

  const removePreferredSupplier = (supplier: string) => {
    setFormData({
      ...formData,
      preferredSuppliers: formData.preferredSuppliers.filter(s => s !== supplier),
    });
  };

  const addAlternativeSupplier = () => {
    if (alternativeSupplierInput.trim() && !formData.alternativeSuppliers.includes(alternativeSupplierInput.trim())) {
      setFormData({
        ...formData,
        alternativeSuppliers: [...formData.alternativeSuppliers, alternativeSupplierInput.trim()],
      });
      setAlternativeSupplierInput('');
    }
  };

  const removeAlternativeSupplier = (supplier: string) => {
    setFormData({
      ...formData,
      alternativeSuppliers: formData.alternativeSuppliers.filter(s => s !== supplier),
    });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString().split('T')[0];
    
    if (editingItem) {
      const updatedItems = sourceLists.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, lastUpdated: now }
          : item
      );
      setSourceLists(updatedItems);
      toast({ title: 'Success', description: 'Source list updated successfully' });
    } else {
      const newItem: SourceList = {
        id: generateId('sl'),
        ...formData,
        lastUpdated: now,
      };
      const updatedItems = [newItem, ...sourceLists];
      setSourceLists(updatedItems);
      toast({ title: 'Success', description: 'Source list created successfully' });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (itemToDelete) {
    const updatedItems = sourceLists.filter(item => item.id !== itemToDelete.id);
    setSourceLists(updatedItems);
    toast({ title: 'Success', description: 'Source list deleted successfully' });
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleRefresh = () => {
    const data = getProcurementData();
    if (data && data.sourceLists) {
      setSourceLists(data.sourceLists);
    }
    toast({ title: 'Refreshed', description: 'Source list data refreshed successfully' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Under Review': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'materialCode', header: 'Material Code', sortable: true, searchable: true },
    { key: 'materialDescription', header: 'Description', searchable: true },
    { key: 'category', header: 'Category', filterable: true, filterOptions: categories.map(c => ({ label: c, value: c })) },
    { 
      key: 'preferredSuppliers', 
      header: 'Preferred',
      render: (value: string[]) => `${value?.length || 0} suppliers`
    },
    { 
      key: 'alternativeSuppliers', 
      header: 'Alternatives',
      render: (value: string[]) => `${value?.length || 0} suppliers`
    },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Under Review', value: 'Under Review' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    { key: 'leadTime', header: 'Lead Time (days)', sortable: true },
    { key: 'lastUpdated', header: 'Last Updated', sortable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: SourceList) => handleOpenViewDialog(row),
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: SourceList) => handleOpenEditDialog(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: SourceList) => handleOpenDeleteDialog(row),
      variant: 'ghost'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/procurement')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Source Determination"
          description="Determine optimal suppliers for materials and services based on criteria"
          voiceIntroduction="Welcome to Source Determination for optimal supplier selection."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{sourceLists.length}</div>
            <div className="text-sm text-muted-foreground">Source Lists</div>
            <div className="text-sm text-blue-600">Maintained</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{sourceLists.filter(s => s.status === 'Active').length}</div>
            <div className="text-sm text-muted-foreground">Active Sources</div>
            <div className="text-sm text-green-600">Ready to use</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{sourceLists.reduce((sum, s) => sum + (s.preferredSuppliers?.length || 0), 0)}</div>
            <div className="text-sm text-muted-foreground">Preferred Suppliers</div>
            <div className="text-sm text-purple-600">Qualified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {sourceLists.length > 0 ? Math.round(sourceLists.reduce((sum, s) => sum + s.leadTime, 0) / sourceLists.length) : 0}
            </div>
            <div className="text-sm text-muted-foreground">Avg Lead Time (days)</div>
            <div className="text-sm text-orange-600">Planning horizon</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sources">Source Lists</TabsTrigger>
          <TabsTrigger value="criteria">Selection Criteria</TabsTrigger>
          <TabsTrigger value="analysis">Source Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Material Source Lists
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={handleOpenCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Source List
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={sourceLists}
                actions={actions}
                searchPlaceholder="Search materials and suppliers..."
                exportable={true}
                refreshable={true}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Selection Criteria Configuration</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Primary Criteria</h4>
                  <div className="space-y-3">
                    {['Price Competitiveness', 'Quality Rating', 'Delivery Performance', 'Financial Stability'].map((criteria) => (
                      <div key={criteria} className="flex justify-between items-center p-3 border rounded">
                        <span>{criteria}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Weight:</span>
                          <span className="font-medium">25%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Secondary Criteria</h4>
                  <div className="space-y-3">
                    {['Geographic Location', 'Sustainability Rating', 'Innovation Capability', 'Risk Assessment'].map((criteria) => (
                      <div key={criteria} className="flex justify-between items-center p-3 border rounded">
                        <span>{criteria}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Weight:</span>
                          <span className="font-medium">15%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Supplier Distribution by Category</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.slice(0, 4).map((category) => {
                    const sourceCount = sourceLists.filter(s => s.category === category).length;
                    const supplierCount = sourceLists
                      .filter(s => s.category === category)
                      .reduce((sum, s) => sum + (s.preferredSuppliers?.length || 0) + (s.alternativeSuppliers?.length || 0), 0);
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between">
                          <span>{category}</span>
                          <span className="font-medium">{sourceCount} materials | {supplierCount} suppliers</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, sourceLists.length > 0 ? (sourceCount / sourceLists.length) * 100 : 0)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Source Quality Metrics</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span>Average Supplier Options</span>
                      <span className="font-bold">
                        {sourceLists.length > 0 ? Math.round(sourceLists.reduce((sum, s) => sum + (s.preferredSuppliers?.length || 0) + (s.alternativeSuppliers?.length || 0), 0) / sourceLists.length) : 0}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span>Coverage Completeness</span>
                      <span className="font-bold text-green-600">95%</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <span>Source List Freshness</span>
                      <span className="font-bold text-blue-600">Good</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Source Optimization Recommendations</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <h4 className="font-semibold text-green-800 mb-2">Consolidation Opportunity</h4>
                  <p className="text-sm">Consider consolidating Office Supplies suppliers to reduce management overhead and increase volume discounts.</p>
                </div>
                
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <h4 className="font-semibold text-yellow-800 mb-2">Supplier Diversification</h4>
                  <p className="text-sm">IT Equipment category has limited supplier diversity. Consider adding more alternative suppliers to reduce risk.</p>
                </div>
                
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-semibold text-blue-800 mb-2">Lead Time Optimization</h4>
                  <p className="text-sm">Some materials have extended lead times. Consider sourcing from local suppliers to improve responsiveness.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Source List' : 'Create Source List'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the source list details below.' : 'Fill in the details to create a new source list.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="materialCode">Material Code *</Label>
              <Input
                id="materialCode"
                value={formData.materialCode}
                onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                placeholder="e.g., LAP-001"
              />
              {formErrors.materialCode && <p className="text-red-500 text-xs">{formErrors.materialCode}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.category && <p className="text-red-500 text-xs">{formErrors.category}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="materialDescription">Description *</Label>
              <Input
                id="materialDescription"
                value={formData.materialDescription}
                onChange={(e) => setFormData({ ...formData, materialDescription: e.target.value })}
                placeholder="Material description"
              />
              {formErrors.materialDescription && <p className="text-red-500 text-xs">{formErrors.materialDescription}</p>}
            </div>
            <div className="space-y-2">
              <Label>Preferred Suppliers *</Label>
              <div className="flex gap-2">
                <Select value={preferredSupplierInput} onValueChange={setPreferredSupplierInput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.filter(s => !formData.preferredSuppliers.includes(s) && !formData.alternativeSuppliers.includes(s)).map((sup) => (
                      <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={addPreferredSupplier}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.preferredSuppliers.map((supplier) => (
                  <Badge key={supplier} variant="default" className="gap-1">
                    {supplier}
                    <button type="button" onClick={() => removePreferredSupplier(supplier)} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                ))}
              </div>
              {formErrors.preferredSuppliers && <p className="text-red-500 text-xs">{formErrors.preferredSuppliers}</p>}
            </div>
            <div className="space-y-2">
              <Label>Alternative Suppliers</Label>
              <div className="flex gap-2">
                <Select value={alternativeSupplierInput} onValueChange={setAlternativeSupplierInput}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.filter(s => !formData.preferredSuppliers.includes(s) && !formData.alternativeSuppliers.includes(s)).map((sup) => (
                      <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={addAlternativeSupplier}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.alternativeSuppliers.map((supplier) => (
                  <Badge key={supplier} variant="outline" className="gap-1">
                    {supplier}
                    <button type="button" onClick={() => removeAlternativeSupplier(supplier)} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'Active' | 'Inactive' | 'Under Review') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadTime">Lead Time (days)</Label>
              <Input
                id="leadTime"
                type="number"
                min="1"
                value={formData.leadTime}
                onChange={(e) => setFormData({ ...formData, leadTime: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minOrderQty">Min Order Qty</Label>
              <Input
                id="minOrderQty"
                type="number"
                min="1"
                value={formData.minOrderQty}
                onChange={(e) => setFormData({ ...formData, minOrderQty: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceValidity">Price Validity</Label>
              <Input
                id="priceValidity"
                type="date"
                value={formData.priceValidity}
                onChange={(e) => setFormData({ ...formData, priceValidity: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="evaluationCriteria">Evaluation Criteria</Label>
              <Input
                id="evaluationCriteria"
                value={formData.evaluationCriteria}
                onChange={(e) => setFormData({ ...formData, evaluationCriteria: e.target.value })}
                placeholder="Price, Quality, Delivery, Service"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Source List Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Material Code:</span><p className="font-medium">{viewingItem.materialCode}</p></div>
                <div><span className="text-muted-foreground">Status:</span><Badge className={getStatusColor(viewingItem.status)}>{viewingItem.status}</Badge></div>
                <div><span className="text-muted-foreground">Category:</span><p className="font-medium">{viewingItem.category}</p></div>
                <div><span className="text-muted-foreground">Lead Time:</span><p className="font-medium">{viewingItem.leadTime} days</p></div>
                <div><span className="text-muted-foreground">Min Order Qty:</span><p className="font-medium">{viewingItem.minOrderQty}</p></div>
                <div><span className="text-muted-foreground">Price Validity:</span><p className="font-medium">{viewingItem.priceValidity}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Description:</span><p className="font-medium">{viewingItem.materialDescription}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Evaluation Criteria:</span><p className="font-medium">{viewingItem.evaluationCriteria}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Preferred Suppliers:</span><div className="flex flex-wrap gap-1 mt-1">{viewingItem.preferredSuppliers?.map(s => <Badge key={s}>{s}</Badge>)}</div></div>
                <div className="col-span-2"><span className="text-muted-foreground">Alternative Suppliers:</span><div className="flex flex-wrap gap-1 mt-1">{viewingItem.alternativeSuppliers?.map(s => <Badge key={s} variant="outline">{s}</Badge>)}</div></div>
                <div><span className="text-muted-foreground">Last Updated:</span><p className="font-medium">{viewingItem.lastUpdated}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the source list for "{itemToDelete?.materialCode}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SourceDetermination;
