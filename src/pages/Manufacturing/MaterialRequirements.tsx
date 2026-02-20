
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
import { ArrowLeft, Calendar, Filter, Download, Play, RefreshCw, Plus, ShoppingCart, AlertTriangle, CheckCircle, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useToast } from '../../hooks/use-toast';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MaterialRequirement {
  id: string;
  materialNumber: string;
  material: string;
  description: string;
  required: number;
  unit: string;
  available: number;
  onOrder: number;
  shortage: number;
  orderDate: string;
  status: 'Sufficient' | 'Shortage' | 'On Order' | 'Critical';
  category: string;
  supplier: string;
  leadTime: number;
  minOrderQty: number;
  unitCost: number;
}

const STORAGE_KEY = 'material_requirements';

const MaterialRequirements: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list');
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialRequirement | null>(null);
  const [orderQty, setOrderQty] = useState(0);
  const [lastMrpRun, setLastMrpRun] = useState('Just now');
  const [materials, setMaterials] = useState<MaterialRequirement[]>([]);

  const defaultForm = {
    materialNumber: '',
    material: '',
    description: '',
    required: 0,
    unit: 'EA',
    available: 0,
    onOrder: 0,
    orderDate: '',
    status: 'Sufficient' as const,
    category: 'Raw Materials',
    supplier: '',
    leadTime: 7,
    minOrderQty: 100,
    unitCost: 0,
  };

  const [form, setForm] = useState<Omit<MaterialRequirement, 'id' | 'shortage'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Material Requirements Planning. Plan and manage materials needed for production.');
  }, [isEnabled, speak]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = listEntities<MaterialRequirement>(STORAGE_KEY);
    if (stored.length === 0) {
      const sample = generateSampleMaterials(30);
      sample.forEach(m => upsertEntity(STORAGE_KEY, m as any));
      setMaterials(sample);
    } else {
      setMaterials(stored);
    }
  };

  const generateSampleMaterials = (count: number): MaterialRequirement[] => {
    const materialsData = [
      { num: '1000234', name: 'Widget A - Aluminum Body', cat: 'Finished Goods', unit: 'EA' },
      { num: '1000235', name: 'Widget B - Steel Frame', cat: 'Components', unit: 'EA' },
      { num: '1000236', name: 'Component C - PCB Board', cat: 'Electronics', unit: 'EA' },
      { num: '1000237', name: 'Raw Material D - Steel Rod', cat: 'Raw Materials', unit: 'KG' },
      { num: '1000238', name: 'Packaging Box - Large', cat: 'Packaging', unit: 'PC' },
      { num: '1000239', name: 'Fastener Kit M8', cat: 'Hardware', unit: 'SET' },
      { num: '1000240', name: 'Copper Wire 2.5mm', cat: 'Raw Materials', unit: 'M' },
      { num: '1000241', name: 'Plastic Resin ABS', cat: 'Raw Materials', unit: 'KG' },
      { num: '1000242', name: 'LCD Display 7inch', cat: 'Electronics', unit: 'EA' },
      { num: '1000243', name: 'Lithium Battery Pack', cat: 'Electronics', unit: 'EA' },
      { num: '1000244', name: 'Rubber Gasket Set', cat: 'Components', unit: 'SET' },
      { num: '1000245', name: 'Aluminum Sheet 3mm', cat: 'Raw Materials', unit: 'KG' },
      { num: '1000246', name: 'Stainless Bolts M10', cat: 'Hardware', unit: 'PC' },
      { num: '1000247', name: 'Circuit Breaker 20A', cat: 'Electronics', unit: 'EA' },
      { num: '1000248', name: 'Hydraulic Fluid 5L', cat: 'Consumables', unit: 'L' },
    ];

    const suppliers = ['Tech Components Inc.', 'Steel Works Ltd.', 'Global Electronics', 'Industrial Metals', 'Box & Pack Co.', 'Fastener World', 'ElectroSupply Co.', 'MetalWorks Inc.'];
    const statuses: MaterialRequirement['status'][] = ['Sufficient', 'Shortage', 'On Order', 'Critical'];

    const result: MaterialRequirement[] = [];
    for (let i = 0; i < count; i++) {
      const mat = materialsData[i % materialsData.length];
      const required = Math.floor(Math.random() * 5000) + 500;
      const available = Math.floor(Math.random() * required * 1.5);
      const onOrder = Math.floor(Math.random() * 1000);
      const net = required - available - onOrder;
      const shortage = Math.max(0, net);
      
      let status: MaterialRequirement['status'] = 'Sufficient';
      if (shortage > required * 0.5) status = 'Critical';
      else if (shortage > 0) status = 'Shortage';
      else if (onOrder > 0) status = 'On Order';

      result.push({
        id: generateId('mrp'),
        materialNumber: mat.num,
        material: mat.num,
        description: mat.name,
        required,
        unit: mat.unit,
        available,
        onOrder,
        shortage,
        orderDate: status === 'Sufficient' ? '-' : new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status,
        category: mat.cat,
        supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
        leadTime: Math.floor(Math.random() * 14) + 3,
        minOrderQty: Math.floor(Math.random() * 200) + 50,
        unitCost: Math.round((Math.random() * 100 + 5) * 100) / 100,
      });
    }

    return result;
  };

  const runMRP = () => {
    const updated = materials.map(m => {
      const net = m.required - m.available - m.onOrder;
      const shortage = Math.max(0, net);
      let status: MaterialRequirement['status'] = 'Sufficient';
      if (shortage > 0 && shortage > m.required * 0.5) status = 'Critical';
      else if (shortage > 0) status = 'Shortage';
      else if (m.onOrder > 0) status = 'On Order';
      return { ...m, shortage, status };
    });
    updated.forEach(m => upsertEntity(STORAGE_KEY, m as any));
    setMaterials(updated);
    setLastMrpRun('Just now');
    toast({ title: 'MRP Run Complete', description: `Material requirements recalculated. ${updated.filter(m => m.status !== 'Sufficient').length} items need attention.` });
  };

  const openOrder = (material: MaterialRequirement) => {
    setSelectedMaterial(material);
    setOrderQty(material.shortage > 0 ? material.shortage + Math.floor(material.minOrderQty * 0.5) : material.minOrderQty);
    setIsOrderDialogOpen(true);
  };

  const openEdit = (material: MaterialRequirement) => {
    setSelectedMaterial(material);
    setForm({
      materialNumber: material.materialNumber,
      material: material.material,
      description: material.description,
      required: material.required,
      unit: material.unit,
      available: material.available,
      onOrder: material.onOrder,
      orderDate: material.orderDate,
      status: material.status,
      category: material.category,
      supplier: material.supplier,
      leadTime: material.leadTime,
      minOrderQty: material.minOrderQty,
      unitCost: material.unitCost,
    });
    setIsEditDialogOpen(true);
  };

  const openView = (material: MaterialRequirement) => {
    setSelectedMaterial(material);
    setIsViewDialogOpen(true);
  };

  const handlePlaceOrder = () => {
    if (!selectedMaterial) return;
    const updated = materials.map(m => m.id === selectedMaterial.id
      ? { ...m, onOrder: m.onOrder + orderQty, status: 'On Order' as const }
      : m
    );
    updated.forEach(m => upsertEntity(STORAGE_KEY, m as any));
    setMaterials(updated);
    toast({ title: 'Purchase Order Created', description: `Order for ${orderQty} ${selectedMaterial.unit} of ${selectedMaterial.description} placed with ${selectedMaterial.supplier}.` });
    setIsOrderDialogOpen(false);
  };

  const handleSaveEdit = () => {
    if (!selectedMaterial) return;
    const shortage = Math.max(0, form.required - form.available - form.onOrder);
    let status: MaterialRequirement['status'] = 'Sufficient';
    if (shortage > form.required * 0.5) status = 'Critical';
    else if (shortage > 0) status = 'Shortage';
    else if (form.onOrder > 0) status = 'On Order';

    const updated = { ...selectedMaterial, ...form, shortage, status };
    upsertEntity(STORAGE_KEY, updated as any);
    setMaterials(prev => prev.map(m => m.id === updated.id ? updated : m));
    toast({ title: 'Material Updated', description: `${updated.description} has been updated.` });
    setIsEditDialogOpen(false);
  };

  const handleDelete = (material: MaterialRequirement) => {
    removeEntity(STORAGE_KEY, material.id);
    setMaterials(prev => prev.filter(m => m.id !== material.id));
    toast({ title: 'Material Deleted', description: `${material.description} has been removed.` });
  };

  const handleCreate = () => {
    const shortage = Math.max(0, form.required - form.available - form.onOrder);
    let status: MaterialRequirement['status'] = 'Sufficient';
    if (shortage > form.required * 0.5) status = 'Critical';
    else if (shortage > 0) status = 'Shortage';
    else if (form.onOrder > 0) status = 'On Order';

    const newMaterial: MaterialRequirement = {
      id: generateId('mrp'),
      ...form,
      shortage,
      status,
    };
    upsertEntity(STORAGE_KEY, newMaterial as any);
    setMaterials(prev => [...prev, newMaterial]);
    toast({ title: 'Material Created', description: `${newMaterial.description} has been created.` });
    setIsEditDialogOpen(false);
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { 'Sufficient': 'bg-green-100 text-green-800', 'Shortage': 'bg-orange-100 text-orange-800', 'On Order': 'bg-blue-100 text-blue-800', 'Critical': 'bg-red-100 text-red-800' };
    return c[s] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'materialNumber', header: 'Material #', sortable: true, searchable: true },
    { key: 'description', header: 'Description', searchable: true },
    { key: 'category', header: 'Category', filterable: true, filterOptions: ['Finished Goods','Components','Electronics','Raw Materials','Packaging','Hardware','Consumables'].map(v => ({ label: v, value: v })) },
    { key: 'required', header: 'Required', sortable: true, render: (v: number, row: MaterialRequirement) => `${v.toLocaleString()} ${row.unit}` },
    { key: 'available', header: 'Available', sortable: true, render: (v: number, row: MaterialRequirement) => `${v.toLocaleString()} ${row.unit}` },
    { key: 'onOrder', header: 'On Order', render: (v: number, row: MaterialRequirement) => v > 0 ? <span className="text-blue-600">{v.toLocaleString()} {row.unit}</span> : '-' },
    { key: 'shortage', header: 'Shortage', sortable: true, render: (v: number, row: MaterialRequirement) => v > 0 ? <span className="font-semibold text-red-600">{v.toLocaleString()} {row.unit}</span> : <span className="text-green-600">None</span> },
    { key: 'status', header: 'Status', filterable: true, filterOptions: ['Sufficient','Shortage','On Order','Critical'].map(v => ({ label: v, value: v })), render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
    { key: 'supplier', header: 'Supplier', searchable: true },
    { key: 'leadTime', header: 'Lead Time', render: (v: number) => `${v} days` },
    { key: 'unitCost', header: 'Unit Cost', sortable: true, render: (v: number) => `$${v.toFixed(2)}` },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: openView, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: openEdit, variant: 'ghost' },
    { label: 'Place Order', icon: <ShoppingCart className="h-4 w-4" />, onClick: openOrder, variant: 'ghost', condition: (row: MaterialRequirement) => row.shortage > 0 || row.status === 'Shortage' || row.status === 'Critical' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: handleDelete, variant: 'ghost' },
  ];

  const chartData = materials.slice(0, 12).map(m => ({ name: m.materialNumber, Required: m.required, Available: m.available, OnOrder: m.onOrder }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/manufacturing')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Material Requirements Planning" description="Plan and manage materials needed for production" voiceIntroduction="Welcome to Material Requirements Planning." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="text-sm text-muted-foreground">Critical Shortages</div><div className="text-2xl font-bold text-red-600">{materials.filter(m => m.status === 'Critical').length}</div><div className="text-sm text-red-500">Immediate action needed</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Materials Short</div><div className="text-2xl font-bold text-orange-600">{materials.filter(m => m.status === 'Shortage').length}</div><div className="text-sm text-orange-500">Order required</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">On Order</div><div className="text-2xl font-bold text-blue-600">{materials.filter(m => m.status === 'On Order').length}</div><div className="text-sm text-blue-500">In transit</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Total Materials</div><div className="text-2xl font-bold">{materials.length}</div><div className="text-sm text-muted-foreground">All items tracked</div></Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4" />Last MRP Run: {lastMrpRun}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast({ description: 'Filter applied' })}><Filter className="h-4 w-4 mr-2" />Filter</Button>
          <Button variant="outline" size="sm" onClick={() => toast({ description: 'Exporting MRP data...' })}><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button variant="outline" size="sm" onClick={() => { setForm(defaultForm); setSelectedMaterial(null); setIsEditDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Material</Button>
          <Button size="sm" onClick={runMRP}><Play className="h-4 w-4 mr-2" />Run MRP</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Requirements List</TabsTrigger>
          <TabsTrigger value="chart">Availability Chart</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="pt-4">
              <EnhancedDataTable columns={columns} data={materials} actions={actions} searchPlaceholder="Search materials..." exportable refreshable onRefresh={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart">
          <Card>
            <CardHeader><CardTitle>Material Availability vs Requirements</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Required" fill="#ef4444" name="Required" />
                  <Bar dataKey="Available" fill="#22c55e" name="Available" />
                  <Bar dataKey="OnOrder" fill="#3b82f6" name="On Order" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            {materials.filter(m => m.status !== 'Sufficient').map(m => (
              <Card key={m.id} className={`border-l-4 ${m.status === 'Critical' ? 'border-l-red-500' : m.status === 'Shortage' ? 'border-l-orange-500' : 'border-l-blue-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${m.status === 'Critical' ? 'text-red-500' : 'text-orange-500'}`} />
                        <span className="font-medium">{m.description}</span>
                        <Badge className={getStatusColor(m.status)}>{m.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Shortage: {m.shortage.toLocaleString()} {m.unit} | Supplier: {m.supplier} | Lead Time: {m.leadTime} days | Cost: ${m.unitCost.toFixed(2)}/{m.unit}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openView(m)}><Eye className="h-4 w-4 mr-2" />View</Button>
                      <Button size="sm" onClick={() => openOrder(m)}><ShoppingCart className="h-4 w-4 mr-2" />Order Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {materials.filter(m => m.status !== 'Sufficient').length === 0 && (
              <Card><CardContent className="p-8 text-center text-muted-foreground">All materials have sufficient coverage.</CardContent></Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Place Purchase Order</DialogTitle></DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-3 rounded text-sm space-y-1">
                <div><strong>Material:</strong> {selectedMaterial.description}</div>
                <div><strong>Supplier:</strong> {selectedMaterial.supplier}</div>
                <div><strong>Lead Time:</strong> {selectedMaterial.leadTime} days</div>
                <div><strong>Unit Cost:</strong> ${selectedMaterial.unitCost.toFixed(2)}</div>
                <div><strong>Current Shortage:</strong> <span className="text-red-600">{selectedMaterial.shortage.toLocaleString()} {selectedMaterial.unit}</span></div>
                <div><strong>Min Order Qty:</strong> {selectedMaterial.minOrderQty} {selectedMaterial.unit}</div>
              </div>
              <div className="space-y-2">
                <Label>Order Quantity ({selectedMaterial.unit})</Label>
                <Input type="number" value={orderQty} onChange={e => setOrderQty(Number(e.target.value))} min={1} />
              </div>
              <div className="text-sm text-muted-foreground">
                Expected delivery by: {new Date(Date.now() + selectedMaterial.leadTime * 86400000).toLocaleDateString()}
              </div>
              <div className="text-sm font-semibold">
                Estimated Cost: ${(orderQty * selectedMaterial.unitCost).toFixed(2)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePlaceOrder}><ShoppingCart className="h-4 w-4 mr-2" />Place Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedMaterial ? 'Edit Material' : 'Add Material'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Material Number</Label>
              <Input value={form.materialNumber} onChange={e => setForm(f => ({ ...f, materialNumber: e.target.value, material: e.target.value }))} placeholder="1000234" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                  <SelectItem value="Components">Components</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                  <SelectItem value="Packaging">Packaging</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Material description" />
            </div>
            <div className="space-y-2">
              <Label>Required Quantity</Label>
              <Input type="number" value={form.required} onChange={e => setForm(f => ({ ...f, required: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EA">Each</SelectItem>
                  <SelectItem value="KG">Kilogram</SelectItem>
                  <SelectItem value="L">Liter</SelectItem>
                  <SelectItem value="M">Meter</SelectItem>
                  <SelectItem value="PC">Piece</SelectItem>
                  <SelectItem value="SET">Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Available</Label>
              <Input type="number" value={form.available} onChange={e => setForm(f => ({ ...f, available: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>On Order</Label>
              <Input type="number" value={form.onOrder} onChange={e => setForm(f => ({ ...f, onOrder: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Supplier name" />
            </div>
            <div className="space-y-2">
              <Label>Lead Time (days)</Label>
              <Input type="number" value={form.leadTime} onChange={e => setForm(f => ({ ...f, leadTime: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Min Order Qty</Label>
              <Input type="number" value={form.minOrderQty} onChange={e => setForm(f => ({ ...f, minOrderQty: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Unit Cost ($)</Label>
              <Input type="number" step="0.01" value={form.unitCost} onChange={e => setForm(f => ({ ...f, unitCost: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={selectedMaterial ? handleSaveEdit : handleCreate}>{selectedMaterial ? 'Save Changes' : 'Add Material'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Material Details</DialogTitle></DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Material #</Label><div className="font-medium">{selectedMaterial.materialNumber}</div></div>
                <div><Label>Category</Label><div>{selectedMaterial.category}</div></div>
                <div className="col-span-2"><Label>Description</Label><div>{selectedMaterial.description}</div></div>
                <div><Label>Required</Label><div>{selectedMaterial.required} {selectedMaterial.unit}</div></div>
                <div><Label>Available</Label><div>{selectedMaterial.available} {selectedMaterial.unit}</div></div>
                <div><Label>On Order</Label><div>{selectedMaterial.onOrder} {selectedMaterial.unit}</div></div>
                <div><Label>Shortage</Label><div className={selectedMaterial.shortage > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>{selectedMaterial.shortage} {selectedMaterial.unit}</div></div>
                <div><Label>Status</Label><Badge className={getStatusColor(selectedMaterial.status)}>{selectedMaterial.status}</Badge></div>
                <div><Label>Supplier</Label><div>{selectedMaterial.supplier}</div></div>
                <div><Label>Lead Time</Label><div>{selectedMaterial.leadTime} days</div></div>
                <div><Label>Min Order Qty</Label><div>{selectedMaterial.minOrderQty} {selectedMaterial.unit}</div></div>
                <div><Label>Unit Cost</Label><div>${selectedMaterial.unitCost.toFixed(2)}</div></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setIsViewDialogOpen(false); openEdit(selectedMaterial); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                {selectedMaterial.shortage > 0 && <Button onClick={() => { setIsViewDialogOpen(false); openOrder(selectedMaterial); }}><ShoppingCart className="h-4 w-4 mr-2" />Place Order</Button>}
                <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialRequirements;
