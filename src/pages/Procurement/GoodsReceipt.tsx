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
import { ArrowLeft, Plus, Edit, Trash2, Eye, Package, RefreshCw, Save, X, CheckCircle, AlertCircle, Clock, Truck } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { seedProcurementData, getProcurementData, GoodsReceipt, PurchaseOrder } from '../../lib/procurementData';
import { generateId } from '../../lib/localCrud';

const GoodsReceiptPage: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('receipts');
  const initialData = getProcurementData();
  const [receipts, setReceipts] = useState<GoodsReceipt[]>(() => initialData?.goodsReceipts || []);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => initialData?.purchaseOrders || []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GoodsReceipt | null>(null);
  const [viewingItem, setViewingItem] = useState<GoodsReceipt | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GoodsReceipt | null>(null);

  const [formData, setFormData] = useState({
    receiptNumber: '',
    poNumber: '',
    poId: '',
    supplier: '',
    supplierId: '',
    materialCode: '',
    materialDescription: '',
    orderedQty: 0,
    receivedQty: 0,
    uom: 'Each',
    status: 'Pending' as 'Pending' | 'Partial' | 'Complete' | 'Over-received' | 'Damaged',
    receivedDate: new Date().toISOString().split('T')[0],
    receiver: '',
    storageLocation: '',
    qualityStatus: 'Pending' as 'Passed' | 'Failed' | 'Pending' | 'Not Required',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const storageLocations = ['WH-A-001', 'WH-A-002', 'WH-B-001', 'WH-B-002', 'WH-C-001', 'WH-C-002'];
  const receivers = ['John Smith', 'Sarah Wilson', 'Mike Brown', 'Emily Davis', 'Robert Chen'];

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Goods Receipt. Record and verify receipt of goods from purchase orders and update inventory.');
    }
  }, [isEnabled, speak]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.receiptNumber.trim()) errors.receiptNumber = 'Receipt number is required';
    if (!formData.poNumber) errors.poNumber = 'PO Number is required';
    if (!formData.supplier) errors.supplier = 'Supplier is required';
    if (!formData.materialDescription.trim()) errors.materialDescription = 'Material description is required';
    if (formData.receivedQty < 0) errors.receivedQty = 'Received quantity cannot be negative';
    if (!formData.storageLocation) errors.storageLocation = 'Storage location is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      receiptNumber: `GR-${Date.now().toString(36).toUpperCase()}`,
      poNumber: '',
      poId: '',
      supplier: '',
      supplierId: '',
      materialCode: '',
      materialDescription: '',
      orderedQty: 0,
      receivedQty: 0,
      uom: 'Each',
      status: 'Pending',
      receivedDate: new Date().toISOString().split('T')[0],
      receiver: '',
      storageLocation: '',
      qualityStatus: 'Pending',
      notes: '',
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (item: GoodsReceipt) => {
    setEditingItem(item);
    setFormData({
      receiptNumber: item.receiptNumber,
      poNumber: item.poNumber,
      poId: item.poId || '',
      supplier: item.supplier,
      supplierId: item.supplierId || '',
      materialCode: item.materialCode,
      materialDescription: item.materialDescription,
      orderedQty: item.orderedQty,
      receivedQty: item.receivedQty,
      uom: item.uom,
      status: item.status,
      receivedDate: item.receivedDate,
      receiver: item.receiver,
      storageLocation: item.storageLocation,
      qualityStatus: item.qualityStatus,
      notes: item.notes || '',
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (item: GoodsReceipt) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (item: GoodsReceipt) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handlePOSelect = (poNumber: string) => {
    const po = purchaseOrders.find(p => p.poNumber === poNumber);
    if (po) {
      setFormData({
        ...formData,
        poNumber: po.poNumber,
        poId: po.id,
        supplier: po.supplier,
        supplierId: po.supplierId,
        orderedQty: Math.floor(Math.random() * 100) + 10,
      });
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    if (editingItem) {
      const updatedItems = receipts.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData }
          : item
      );
      setReceipts(updatedItems);
      toast({ title: 'Success', description: 'Goods receipt updated successfully' });
    } else {
      const newItem: GoodsReceipt = {
        id: generateId('gr'),
        ...formData,
      };
      const updatedItems = [newItem, ...receipts];
      setReceipts(updatedItems);
      toast({ title: 'Success', description: 'Goods receipt created successfully' });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      const updatedItems = receipts.filter(item => item.id !== itemToDelete.id);
    setReceipts(updatedItems);
    toast({ title: 'Success', description: 'Goods receipt deleted successfully' });
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleProcessReceipt = (item: GoodsReceipt) => {
    const updatedItems = receipts.map(r => {
      if (r.id === item.id) {
        const newStatus: GoodsReceipt['status'] = r.receivedQty >= r.orderedQty ? 'Complete' : r.receivedQty > 0 ? 'Partial' : r.status;
        return { ...r, status: newStatus };
      }
      return r;
    });
    setReceipts(updatedItems);
    toast({ title: 'Processed', description: `Receipt ${item.receiptNumber} has been processed` });
  };

  const handleQualityPass = (item: GoodsReceipt) => {
    const updatedItems = receipts.map(r => 
      r.id === item.id ? { ...r, qualityStatus: 'Passed' as const } : r
    );
    setReceipts(updatedItems);
    toast({ title: 'Quality Check Passed', description: `Receipt ${item.receiptNumber} passed quality check` });
  };

  const handleQualityFail = (item: GoodsReceipt) => {
    const updatedItems = receipts.map(r => 
      r.id === item.id ? { ...r, qualityStatus: 'Failed' as const } : r
    );
    setReceipts(updatedItems);
    toast({ title: 'Quality Check Failed', description: `Receipt ${item.receiptNumber} failed quality check` });
  };

  const handleRefresh = () => {
    const data = getProcurementData();
    if (data) {
      if (data.goodsReceipts) setReceipts(data.goodsReceipts);
      if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);
    }
    toast({ title: 'Refreshed', description: 'Goods receipt data refreshed successfully' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-orange-100 text-orange-800',
      'Complete': 'bg-green-100 text-green-800',
      'Over-received': 'bg-blue-100 text-blue-800',
      'Damaged': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getQualityColor = (quality: string) => {
    const colors: Record<string, string> = {
      'Passed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Not Required': 'bg-gray-100 text-gray-800'
    };
    return colors[quality] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'receiptNumber', header: 'Receipt #', sortable: true, searchable: true },
    { key: 'poNumber', header: 'PO Number', sortable: true, searchable: true },
    { key: 'supplier', header: 'Supplier', searchable: true },
    { key: 'materialDescription', header: 'Material', searchable: true },
    { 
      key: 'receivedQty', 
      header: 'Qty Received',
      render: (value: number, row: GoodsReceipt) => `${value}/${row.orderedQty} ${row.uom}`
    },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Pending', value: 'Pending' },
        { label: 'Partial', value: 'Partial' },
        { label: 'Complete', value: 'Complete' },
        { label: 'Over-received', value: 'Over-received' },
        { label: 'Damaged', value: 'Damaged' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    { 
      key: 'qualityStatus', 
      header: 'Quality',
      filterable: true,
      filterOptions: [
        { label: 'Passed', value: 'Passed' },
        { label: 'Failed', value: 'Failed' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Not Required', value: 'Not Required' }
      ],
      render: (value: string) => (
        <Badge className={getQualityColor(value)}>{value}</Badge>
      )
    },
    { key: 'receivedDate', header: 'Received Date', sortable: true },
    { key: 'receiver', header: 'Receiver', searchable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: GoodsReceipt) => handleOpenViewDialog(row),
      variant: 'ghost'
    },
    {
      label: 'Process',
      icon: <Package className="h-4 w-4" />,
      onClick: (row: GoodsReceipt) => handleProcessReceipt(row),
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: GoodsReceipt) => handleOpenEditDialog(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: GoodsReceipt) => handleOpenDeleteDialog(row),
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
          title="Goods Receipt"
          description="Record and verify receipt of goods from purchase orders"
          voiceIntroduction="Welcome to Goods Receipt for processing incoming deliveries."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{receipts.length}</div>
            <div className="text-sm text-muted-foreground">Total Receipts</div>
            <div className="text-sm text-blue-600">This month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{receipts.filter(r => r.status === 'Pending').length}</div>
            <div className="text-sm text-muted-foreground">Pending Processing</div>
            <div className="text-sm text-orange-600">Needs attention</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{receipts.filter(r => r.status === 'Complete').length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-sm text-green-600">Processed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{receipts.filter(r => r.qualityStatus === 'Pending').length}</div>
            <div className="text-sm text-muted-foreground">Quality Pending</div>
            <div className="text-sm text-yellow-600">Awaiting inspection</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Goods Receipt Records
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={handleOpenCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Receipt
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={receipts}
                actions={actions}
                searchPlaceholder="Search receipts, PO numbers, or materials..."
                exportable={true}
                refreshable={true}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Pending Goods Receipts</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receipts.filter(r => r.status === 'Pending' || r.status === 'Partial').map((receipt) => (
                  <div key={receipt.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          {receipt.receiptNumber}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          PO: {receipt.poNumber} | Supplier: {receipt.supplier}
                        </p>
                        <p className="text-sm">
                          {receipt.materialDescription} | 
                          Qty: {receipt.receivedQty}/{receipt.orderedQty} {receipt.uom}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleProcessReceipt(receipt)}>
                          <Package className="h-4 w-4 mr-2" />
                          Process
                        </Button>
                        <Badge className={getStatusColor(receipt.status)}>
                          {receipt.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Quality Control Queue</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receipts.filter(r => r.qualityStatus === 'Pending').map((receipt) => (
                  <div key={receipt.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {receipt.materialDescription}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Receipt: {receipt.receiptNumber} | Location: {receipt.storageLocation}
                        </p>
                        <p className="text-sm">Received: {receipt.receivedDate}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleQualityPass(receipt)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Pass
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleQualityFail(receipt)}>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Fail
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Receipt Status Overview</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Pending', 'Partial', 'Complete', 'Over-received', 'Damaged'].map((status) => {
                    const count = receipts.filter(r => r.status === status).length;
                    const percentage = receipts.length > 0 ? Math.round((count / receipts.length) * 100) : 0;
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{status}</span>
                          <span>{count} ({percentage}%)</span>
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

            <Card>
              <CardHeader><CardTitle>Quality Status Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Passed', 'Failed', 'Pending', 'Not Required'].map((quality) => {
                    const count = receipts.filter(r => r.qualityStatus === quality).length;
                    return (
                      <div key={quality} className="flex justify-between">
                        <span>{quality}</span>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Goods Receipt' : 'Create Goods Receipt'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the goods receipt details below.' : 'Fill in the details to create a new goods receipt.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Receipt Number *</Label>
              <Input
                id="receiptNumber"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                placeholder="e.g., GR-2025-001"
              />
              {formErrors.receiptNumber && <p className="text-red-500 text-xs">{formErrors.receiptNumber}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="poNumber">PO Number *</Label>
              <Select value={formData.poNumber} onValueChange={handlePOSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select PO" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseOrders.map((po) => (
                    <SelectItem key={po.poNumber} value={po.poNumber}>{po.poNumber} - {po.supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.poNumber && <p className="text-red-500 text-xs">{formErrors.poNumber}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Supplier name"
              />
              {formErrors.supplier && <p className="text-red-500 text-xs">{formErrors.supplier}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="receivedDate">Received Date</Label>
              <Input
                id="receivedDate"
                type="date"
                value={formData.receivedDate}
                onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="materialDescription">Material Description *</Label>
              <Input
                id="materialDescription"
                value={formData.materialDescription}
                onChange={(e) => setFormData({ ...formData, materialDescription: e.target.value })}
                placeholder="Material description"
              />
              {formErrors.materialDescription && <p className="text-red-500 text-xs">{formErrors.materialDescription}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderedQty">Ordered Qty</Label>
              <Input
                id="orderedQty"
                type="number"
                min="0"
                value={formData.orderedQty}
                onChange={(e) => setFormData({ ...formData, orderedQty: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receivedQty">Received Qty</Label>
              <Input
                id="receivedQty"
                type="number"
                min="0"
                value={formData.receivedQty}
                onChange={(e) => setFormData({ ...formData, receivedQty: parseInt(e.target.value) || 0 })}
              />
              {formErrors.receivedQty && <p className="text-red-500 text-xs">{formErrors.receivedQty}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="uom">UOM</Label>
              <Select value={formData.uom} onValueChange={(value) => setFormData({ ...formData, uom: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select UOM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Each">Each</SelectItem>
                  <SelectItem value="Box">Box</SelectItem>
                  <SelectItem value="Case">Case</SelectItem>
                  <SelectItem value="Pallet">Pallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: GoodsReceipt['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Over-received">Over-received</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storageLocation">Storage Location *</Label>
              <Select value={formData.storageLocation} onValueChange={(value) => setFormData({ ...formData, storageLocation: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {storageLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.storageLocation && <p className="text-red-500 text-xs">{formErrors.storageLocation}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiver">Receiver</Label>
              <Select value={formData.receiver} onValueChange={(value) => setFormData({ ...formData, receiver: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select receiver" />
                </SelectTrigger>
                <SelectContent>
                  {receivers.map((rec) => (
                    <SelectItem key={rec} value={rec}>{rec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualityStatus">Quality Status</Label>
              <Select value={formData.qualityStatus} onValueChange={(value: GoodsReceipt['qualityStatus']) => setFormData({ ...formData, qualityStatus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quality status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Passed">Passed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Not Required">Not Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
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
            <DialogTitle>Goods Receipt Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Receipt Number:</span><p className="font-medium">{viewingItem.receiptNumber}</p></div>
                <div><span className="text-muted-foreground">Status:</span><Badge className={getStatusColor(viewingItem.status)}>{viewingItem.status}</Badge></div>
                <div><span className="text-muted-foreground">PO Number:</span><p className="font-medium">{viewingItem.poNumber}</p></div>
                <div><span className="text-muted-foreground">Supplier:</span><p className="font-medium">{viewingItem.supplier}</p></div>
                <div><span className="text-muted-foreground">Quantity:</span><p className="font-medium">{viewingItem.receivedQty}/{viewingItem.orderedQty} {viewingItem.uom}</p></div>
                <div><span className="text-muted-foreground">Quality:</span><Badge className={getQualityColor(viewingItem.qualityStatus)}>{viewingItem.qualityStatus}</Badge></div>
                <div><span className="text-muted-foreground">Storage Location:</span><p className="font-medium">{viewingItem.storageLocation}</p></div>
                <div><span className="text-muted-foreground">Receiver:</span><p className="font-medium">{viewingItem.receiver}</p></div>
                <div><span className="text-muted-foreground">Received Date:</span><p className="font-medium">{viewingItem.receivedDate}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Material:</span><p className="font-medium">{viewingItem.materialDescription}</p></div>
                {viewingItem.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span><p className="font-medium">{viewingItem.notes}</p></div>}
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
              Are you sure you want to delete the goods receipt "{itemToDelete?.receiptNumber}"? This action cannot be undone.
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

export default GoodsReceiptPage;
