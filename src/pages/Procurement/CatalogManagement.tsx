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
import { ArrowLeft, Plus, Edit, Trash2, Eye, Package, RefreshCw, Save, X } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { seedProcurementData, getProcurementData, CatalogItem } from '../../lib/procurementData';
import { generateId } from '../../lib/localCrud';

const CatalogManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('catalog');
  const initialData = getProcurementData();
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(() => initialData?.catalogItems || []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [viewingItem, setViewingItem] = useState<CatalogItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);

  const [formData, setFormData] = useState({
    itemCode: '',
    description: '',
    category: '',
    supplier: '',
    supplierId: '',
    unitPrice: 0,
    currency: 'USD',
    uom: 'Each',
    status: 'Active' as 'Active' | 'Inactive' | 'Discontinued',
    specifications: '',
    minOrderQty: 1,
    leadTime: 1,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const categories = ['IT Equipment', 'Office Supplies', 'Furniture', 'Services', 'Manufacturing', 'Maintenance', 'Raw Materials', 'Industrial Equipment'];
  const suppliers = ['Dell Technologies', 'HP Inc.', 'Lenovo Group', 'ASUSTek', 'Acer Inc.', 'Office Depot', 'Staples Inc.', 'Amazon Business', 'Grainger', 'Uline'];

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Catalog Management. Manage product catalogs, pricing, and supplier catalogs for streamlined procurement.');
    }
  }, [isEnabled, speak]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.itemCode.trim()) errors.itemCode = 'Item code is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.supplier) errors.supplier = 'Supplier is required';
    if (formData.unitPrice <= 0) errors.unitPrice = 'Unit price must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      itemCode: '',
      description: '',
      category: '',
      supplier: '',
      supplierId: '',
      unitPrice: 0,
      currency: 'USD',
      uom: 'Each',
      status: 'Active',
      specifications: '',
      minOrderQty: 1,
      leadTime: 1,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode,
      description: item.description,
      category: item.category,
      supplier: item.supplier,
      supplierId: item.supplierId || '',
      unitPrice: item.unitPrice,
      currency: item.currency,
      uom: item.uom,
      status: item.status,
      specifications: item.specifications || '',
      minOrderQty: item.minOrderQty || 1,
      leadTime: item.leadTime || 1,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (item: CatalogItem) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (item: CatalogItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const now = new Date().toISOString().split('T')[0];
    
    if (editingItem) {
      const updatedItems = catalogItems.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, lastUpdated: now }
          : item
      );
      setCatalogItems(updatedItems);
      toast({ title: 'Success', description: 'Catalog item updated successfully' });
    } else {
      const newItem: CatalogItem = {
        id: generateId('cat'),
        ...formData,
        lastUpdated: now,
      };
      const updatedItems = [newItem, ...catalogItems];
      setCatalogItems(updatedItems);
      toast({ title: 'Success', description: 'Catalog item created successfully' });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (itemToDelete) {
    const updatedItems = catalogItems.filter(item => item.id !== itemToDelete.id);
    setCatalogItems(updatedItems);
    toast({ title: 'Success', description: 'Catalog item deleted successfully' });
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleRefresh = () => {
    const data = getProcurementData();
    if (data && data.catalogItems) {
      setCatalogItems(data.catalogItems);
    }
    toast({ title: 'Refreshed', description: 'Catalog data refreshed successfully' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-yellow-100 text-yellow-800',
      'Discontinued': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'itemCode', header: 'Item Code', sortable: true, searchable: true },
    { key: 'description', header: 'Description', searchable: true },
    { key: 'category', header: 'Category', filterable: true, filterOptions: categories.map(c => ({ label: c, value: c })) },
    { key: 'supplier', header: 'Supplier', searchable: true },
    { 
      key: 'unitPrice', 
      header: 'Unit Price',
      sortable: true,
      render: (value: number, row: CatalogItem) => `${row.currency} ${value.toFixed(2)}`
    },
    { key: 'uom', header: 'UOM' },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Discontinued', value: 'Discontinued' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    { key: 'lastUpdated', header: 'Last Updated', sortable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: CatalogItem) => handleOpenViewDialog(row),
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: CatalogItem) => handleOpenEditDialog(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: CatalogItem) => handleOpenDeleteDialog(row),
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
          title="Catalog Management"
          description="Manage product catalogs, pricing, and supplier catalogs"
          voiceIntroduction="Welcome to Catalog Management for comprehensive catalog administration."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{catalogItems.length}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
            <div className="text-sm text-blue-600">In catalog</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{catalogItems.filter(item => item.status === 'Active').length}</div>
            <div className="text-sm text-muted-foreground">Active Items</div>
            <div className="text-sm text-green-600">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{new Set(catalogItems.map(i => i.category)).size}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
            <div className="text-sm text-purple-600">Well organized</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{new Set(catalogItems.map(i => i.supplier)).size}</div>
            <div className="text-sm text-muted-foreground">Suppliers</div>
            <div className="text-sm text-orange-600">Contributing</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="catalog">Catalog Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Catalog Items
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={handleOpenCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={catalogItems}
                actions={actions}
                searchPlaceholder="Search catalog items..."
                exportable={true}
                refreshable={true}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Category Management</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category} className="p-4 border rounded">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{category}</h4>
                      <Badge variant="outline">
                        {catalogItems.filter(item => item.category === category).length} items
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Pricing Management</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold mb-2">Price Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Items:</span>
                      <span className="font-medium">{catalogItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Price:</span>
                      <span className="font-medium">
                        ${(catalogItems.reduce((sum, i) => sum + i.unitPrice, 0) / catalogItems.length || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Catalog Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.slice(0, 4).map((category) => {
                    const count = catalogItems.filter(item => item.category === category).length;
                    const percentage = catalogItems.length > 0 ? Math.round((count / catalogItems.length) * 100) : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span>{count} items ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Catalog Item' : 'Create Catalog Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the catalog item details below.' : 'Fill in the details to create a new catalog item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemCode">Item Code *</Label>
              <Input
                id="itemCode"
                value={formData.itemCode}
                onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                placeholder="e.g., LAP-DEL-001"
              />
              {formErrors.itemCode && <p className="text-red-500 text-xs">{formErrors.itemCode}</p>}
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
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Item description"
              />
              {formErrors.description && <p className="text-red-500 text-xs">{formErrors.description}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select value={formData.supplier} onValueChange={(value) => setFormData({ ...formData, supplier: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.supplier && <p className="text-red-500 text-xs">{formErrors.supplier}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              />
              {formErrors.unitPrice && <p className="text-red-500 text-xs">{formErrors.unitPrice}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="uom">Unit of Measure</Label>
              <Select value={formData.uom} onValueChange={(value) => setFormData({ ...formData, uom: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select UOM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Each">Each</SelectItem>
                  <SelectItem value="Box">Box</SelectItem>
                  <SelectItem value="Case">Case</SelectItem>
                  <SelectItem value="Pallet">Pallet</SelectItem>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="Meter">Meter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'Active' | 'Inactive' | 'Discontinued') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="leadTime">Lead Time (days)</Label>
              <Input
                id="leadTime"
                type="number"
                min="1"
                value={formData.leadTime}
                onChange={(e) => setFormData({ ...formData, leadTime: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="specifications">Specifications</Label>
              <Input
                id="specifications"
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                placeholder="Item specifications"
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
            <DialogTitle>Catalog Item Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Item Code:</span><p className="font-medium">{viewingItem.itemCode}</p></div>
                <div><span className="text-muted-foreground">Status:</span><Badge className={getStatusColor(viewingItem.status)}>{viewingItem.status}</Badge></div>
                <div><span className="text-muted-foreground">Category:</span><p className="font-medium">{viewingItem.category}</p></div>
                <div><span className="text-muted-foreground">Supplier:</span><p className="font-medium">{viewingItem.supplier}</p></div>
                <div><span className="text-muted-foreground">Unit Price:</span><p className="font-medium">{viewingItem.currency} {viewingItem.unitPrice.toFixed(2)}</p></div>
                <div><span className="text-muted-foreground">UOM:</span><p className="font-medium">{viewingItem.uom}</p></div>
                <div><span className="text-muted-foreground">Min Order Qty:</span><p className="font-medium">{viewingItem.minOrderQty}</p></div>
                <div><span className="text-muted-foreground">Lead Time:</span><p className="font-medium">{viewingItem.leadTime} days</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Description:</span><p className="font-medium">{viewingItem.description}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Specifications:</span><p className="font-medium">{viewingItem.specifications || 'N/A'}</p></div>
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
              Are you sure you want to delete the catalog item "{itemToDelete?.itemCode}"? This action cannot be undone.
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

export default CatalogManagement;
