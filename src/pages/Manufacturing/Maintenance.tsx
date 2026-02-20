
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { ArrowLeft, Plus, Edit, Eye, Wrench, Calendar, AlertTriangle, CheckCircle, Trash2, Clock, Play, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface MaintenanceOrder {
  id: string;
  orderNumber: string;
  equipment: string;
  equipmentId: string;
  type: 'Preventive' | 'Corrective' | 'Predictive' | 'Emergency';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  scheduledDate: string;
  completedDate?: string;
  estimatedDuration: string;
  actualDuration?: string;
  technician: string;
  description: string;
  resolution?: string;
  costActual?: number;
  costEstimated: number;
  plant: string;
  createdDate: string;
  lastModified: string;
}

const STORAGE_KEY = 'maintenance_orders';

const Maintenance: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<MaintenanceOrder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<MaintenanceOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<MaintenanceOrder | null>(null);

  const defaultForm = {
    equipment: '',
    equipmentId: '',
    type: 'Preventive' as const,
    priority: 'Medium' as const,
    status: 'Open' as const,
    scheduledDate: new Date().toISOString().split('T')[0],
    estimatedDuration: '2 hours',
    technician: '',
    description: '',
    costEstimated: 500,
    plant: 'Plant 1000',
  };

  const [form, setForm] = useState<Omit<MaintenanceOrder, 'id' | 'orderNumber' | 'completedDate' | 'actualDuration' | 'resolution' | 'costActual' | 'createdDate' | 'lastModified'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Maintenance Management. Manage equipment maintenance, schedules, and service records.');
  }, [isEnabled, speak]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = listEntities<MaintenanceOrder>(STORAGE_KEY);
    if (stored.length === 0) {
      const sample = generateSampleOrders(30);
      sample.forEach(o => upsertEntity(STORAGE_KEY, o as any));
      setOrders(sample);
    } else {
      setOrders(stored);
    }
  };

  const generateSampleOrders = (count: number): MaintenanceOrder[] => {
    const equipment = [
      { name: 'Production Line A1', id: 'EQ-001' },
      { name: 'Packaging Machine B2', id: 'EQ-002' },
      { name: 'Quality Control Station', id: 'EQ-003' },
      { name: 'CNC Machining Center', id: 'EQ-004' },
      { name: 'Assembly Line 1', id: 'EQ-005' },
      { name: 'Welding Robot R1', id: 'EQ-006' },
      { name: 'Paint Booth P1', id: 'EQ-007' },
      { name: 'Conveyor System C1', id: 'EQ-008' },
      { name: 'Testing Station T1', id: 'EQ-009' },
      { name: 'Hydraulic Press H1', id: 'EQ-010' },
    ];

    const types: MaintenanceOrder['type'][] = ['Preventive', 'Corrective', 'Predictive', 'Emergency'];
    const priorities: MaintenanceOrder['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
    const statuses: MaintenanceOrder['status'][] = ['Open', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
    const technicians = ['Mike Johnson', 'Sarah Davis', 'Robert Brown', 'Tom Carter', 'Lisa Anderson', 'John Martinez', 'Jennifer White', 'David Garcia'];
    const durations = ['1 hour', '2 hours', '4 hours', '6 hours', '8 hours', '12 hours', '1 day', '2 days'];

    const result: MaintenanceOrder[] = [];
    const baseDate = new Date('2024-12-01');

    for (let i = 1; i <= count; i++) {
      const eq = equipment[i % equipment.length];
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const scheduledOffset = Math.floor(Math.random() * 60) - 30;
      const scheduledDate = new Date(baseDate);
      scheduledDate.setDate(scheduledDate.getDate() + scheduledOffset);

      const costEstimated = Math.floor(Math.random() * 5000) + 200;
      let costActual: number | undefined;
      let completedDate: string | undefined;
      let actualDuration: string | undefined;
      let resolution: string | undefined;

      if (status === 'Completed') {
        costActual = costEstimated + Math.floor(Math.random() * 500) - 250;
        completedDate = new Date(scheduledDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        actualDuration = durations[Math.floor(Math.random() * durations.length)];
        resolution = 'Maintenance completed successfully. All issues resolved.';
      }

      result.push({
        id: generateId('maint'),
        orderNumber: `MO-${String(i).padStart(4, '0')}`,
        equipment: eq.name,
        equipmentId: eq.id,
        type,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status,
        scheduledDate: scheduledDate.toISOString().split('T')[0],
        completedDate,
        estimatedDuration: durations[Math.floor(Math.random() * durations.length)],
        actualDuration,
        technician: technicians[Math.floor(Math.random() * technicians.length)],
        description: `${type} maintenance for ${eq.name}. ${type === 'Preventive' ? 'Scheduled monthly maintenance check.' : type === 'Corrective' ? 'Equipment malfunction detected.' : 'Predictive analysis indicates potential failure.'}`,
        resolution,
        costActual,
        costEstimated,
        plant: `Plant ${1000 + (i % 3) * 1000}`,
        createdDate: new Date(scheduledDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
      });
    }

    return result.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  };

  const openCreate = () => {
    setEditingOrder(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (order: MaintenanceOrder) => {
    setEditingOrder(order);
    setForm({
      equipment: order.equipment,
      equipmentId: order.equipmentId,
      type: order.type,
      priority: order.priority,
      status: order.status,
      scheduledDate: order.scheduledDate,
      estimatedDuration: order.estimatedDuration,
      technician: order.technician,
      description: order.description,
      costEstimated: order.costEstimated,
      plant: order.plant,
    });
    setIsDialogOpen(true);
  };

  const openView = (order: MaintenanceOrder) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.equipment.trim() || !form.technician.trim()) {
      toast({ title: 'Validation Error', description: 'Equipment and Technician are required.', variant: 'destructive' });
      return;
    }

    if (editingOrder) {
      const updated = { ...editingOrder, ...form, lastModified: new Date().toISOString().split('T')[0] };
      upsertEntity(STORAGE_KEY, updated as any);
      setOrders(prev => prev.map(o => o.id === editingOrder.id ? updated : o));
      toast({ title: 'Order Updated', description: `${editingOrder.orderNumber} has been updated.` });
    } else {
      const newOrder: MaintenanceOrder = {
        id: generateId('maint'),
        orderNumber: `MO-${String(orders.length + 1).padStart(4, '0')}`,
        ...form,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
      };
      upsertEntity(STORAGE_KEY, newOrder as any);
      setOrders(prev => [newOrder, ...prev]);
      toast({ title: 'Order Created', description: `${newOrder.orderNumber} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (order: MaintenanceOrder) => {
    removeEntity(STORAGE_KEY, order.id);
    setOrders(prev => prev.filter(o => o.id !== order.id));
    toast({ title: 'Order Deleted', description: `${order.orderNumber} has been removed.` });
  };

  const handleStatusChange = (order: MaintenanceOrder, status: MaintenanceOrder['status']) => {
    const updates: Partial<MaintenanceOrder> = { status, lastModified: new Date().toISOString().split('T')[0] };
    if (status === 'Completed') {
      updates.completedDate = new Date().toISOString().split('T')[0];
      updates.resolution = 'Maintenance completed successfully.';
    }
    const updated = { ...order, ...updates };
    upsertEntity(STORAGE_KEY, updated as any);
    setOrders(prev => prev.map(o => o.id === order.id ? updated : o));
    toast({ title: 'Status Updated', description: `${order.orderNumber} status changed to ${status}.` });
  };

  const getTypeColor = (type: string) => {
    const c: Record<string, string> = { 'Preventive': 'bg-blue-100 text-blue-800', 'Corrective': 'bg-orange-100 text-orange-800', 'Predictive': 'bg-purple-100 text-purple-800', 'Emergency': 'bg-red-100 text-red-800' };
    return c[type] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (p: string) => {
    const c: Record<string, string> = { 'Low': 'bg-gray-100 text-gray-800', 'Medium': 'bg-yellow-100 text-yellow-800', 'High': 'bg-orange-100 text-orange-800', 'Critical': 'bg-red-100 text-red-800' };
    return c[p] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { 'Open': 'bg-blue-100 text-blue-800', 'In Progress': 'bg-yellow-100 text-yellow-800', 'Completed': 'bg-green-100 text-green-800', 'On Hold': 'bg-gray-100 text-gray-800', 'Cancelled': 'bg-red-100 text-red-800' };
    return c[s] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'orderNumber', header: 'Order #', sortable: true, searchable: true },
    { key: 'equipment', header: 'Equipment', searchable: true },
    { key: 'equipmentId', header: 'Equipment ID', searchable: true },
    { 
      key: 'type', 
      header: 'Type', 
      filterable: true,
      filterOptions: ['Preventive','Corrective','Predictive','Emergency'].map(v => ({ label: v, value: v })),
      render: (v: string) => <Badge className={getTypeColor(v)}>{v}</Badge> 
    },
    { 
      key: 'priority', 
      header: 'Priority',
      filterable: true,
      filterOptions: ['Low','Medium','High','Critical'].map(v => ({ label: v, value: v })),
      render: (v: string) => <Badge className={getPriorityColor(v)}>{v}</Badge> 
    },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: ['Open','In Progress','Completed','On Hold','Cancelled'].map(v => ({ label: v, value: v })),
      render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> 
    },
    { key: 'scheduledDate', header: 'Scheduled', sortable: true },
    { key: 'technician', header: 'Technician', searchable: true },
    { key: 'estimatedDuration', header: 'Duration' },
    { key: 'costEstimated', header: 'Est. Cost', render: (v: number) => `$${v.toLocaleString()}` },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: openView, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: openEdit, variant: 'ghost' },
    { label: 'Start Work', icon: <Play className="h-4 w-4" />, onClick: (row: MaintenanceOrder) => handleStatusChange(row, 'In Progress'), variant: 'ghost', condition: (row: MaintenanceOrder) => row.status === 'Open' },
    { label: 'Complete', icon: <CheckCircle className="h-4 w-4" />, onClick: (row: MaintenanceOrder) => handleStatusChange(row, 'Completed'), variant: 'ghost', condition: (row: MaintenanceOrder) => row.status === 'In Progress' },
    { label: 'Put On Hold', icon: <Clock className="h-4 w-4" />, onClick: (row: MaintenanceOrder) => handleStatusChange(row, 'On Hold'), variant: 'ghost', condition: (row: MaintenanceOrder) => ['Open','In Progress'].includes(row.status) },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: handleDelete, variant: 'ghost' },
  ];

  const chartData = [
    { name: 'Preventive', value: orders.filter(o => o.type === 'Preventive').length },
    { name: 'Corrective', value: orders.filter(o => o.type === 'Corrective').length },
    { name: 'Predictive', value: orders.filter(o => o.type === 'Predictive').length },
    { name: 'Emergency', value: orders.filter(o => o.type === 'Emergency').length },
  ];

  const statusData = ['Open', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].map(s => ({
    name: s,
    value: orders.filter(o => o.status === s).length,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/manufacturing')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Maintenance Management" description="Manage equipment maintenance, schedules, and service records" voiceIntroduction="Welcome to Maintenance Management." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Open Orders</div>
          <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Open').length}</div>
          <div className="text-sm text-blue-600">{orders.filter(o => o.priority === 'Critical' && o.status === 'Open').length} critical</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold">{orders.filter(o => o.status === 'In Progress').length}</div>
          <div className="text-sm text-yellow-600">Active work orders</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Completed').length}</div>
          <div className="text-sm text-green-600">This period</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Est. Total Cost</div>
          <div className="text-2xl font-bold">${orders.reduce((s, o) => s + (o.costActual || o.costEstimated), 0).toLocaleString()}</div>
          <div className="text-sm text-orange-600">All orders</div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Maintenance Orders
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setForm(f => ({ ...f, type: 'Preventive' })); openCreate(); }}>
                    <Calendar className="h-4 w-4 mr-2" />Schedule Maintenance
                  </Button>
                  <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Order</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={columns} data={orders} actions={actions} searchPlaceholder="Search orders..." exportable refreshable onRefresh={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Maintenance by Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Order Status Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrder ? `Edit ${editingOrder.orderNumber}` : 'Create Maintenance Order'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Equipment Name *</Label>
              <Input value={form.equipment} onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))} placeholder="Equipment name" />
            </div>
            <div className="space-y-2">
              <Label>Equipment ID</Label>
              <Input value={form.equipmentId} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))} placeholder="e.g. EQ-001" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as MaintenanceOrder['type'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Preventive','Corrective','Predictive','Emergency'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as MaintenanceOrder['priority'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Low','Medium','High','Critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as MaintenanceOrder['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Open','In Progress','Completed','On Hold','Cancelled'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plant</Label>
              <Select value={form.plant} onValueChange={v => setForm(f => ({ ...f, plant: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plant 1000">Plant 1000</SelectItem>
                  <SelectItem value="Plant 2000">Plant 2000</SelectItem>
                  <SelectItem value="Plant 3000">Plant 3000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Technician *</Label>
              <Select value={form.technician} onValueChange={v => setForm(f => ({ ...f, technician: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                  <SelectItem value="Sarah Davis">Sarah Davis</SelectItem>
                  <SelectItem value="Robert Brown">Robert Brown</SelectItem>
                  <SelectItem value="Tom Carter">Tom Carter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estimated Duration</Label>
              <Input value={form.estimatedDuration} onChange={e => setForm(f => ({ ...f, estimatedDuration: e.target.value }))} placeholder="e.g. 4 hours" />
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost ($)</Label>
              <Input type="number" value={form.costEstimated} onChange={e => setForm(f => ({ ...f, costEstimated: Number(e.target.value) }))} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the maintenance work required" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingOrder ? 'Update' : 'Create'} Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Maintenance Order: {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Equipment</Label><div className="font-medium">{selectedOrder.equipment}</div></div>
                <div><Label>Equipment ID</Label><div>{selectedOrder.equipmentId}</div></div>
                <div><Label>Type</Label><Badge className={getTypeColor(selectedOrder.type)}>{selectedOrder.type}</Badge></div>
                <div><Label>Priority</Label><Badge className={getPriorityColor(selectedOrder.priority)}>{selectedOrder.priority}</Badge></div>
                <div><Label>Status</Label><Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge></div>
                <div><Label>Technician</Label><div>{selectedOrder.technician}</div></div>
                <div><Label>Scheduled Date</Label><div>{selectedOrder.scheduledDate}</div></div>
                <div><Label>Duration</Label><div>{selectedOrder.actualDuration || selectedOrder.estimatedDuration}</div></div>
                <div><Label>Est. Cost</Label><div>${selectedOrder.costEstimated.toLocaleString()}</div></div>
                {selectedOrder.costActual && <div><Label>Actual Cost</Label><div className="font-semibold">${selectedOrder.costActual.toLocaleString()}</div></div>}
              </div>
              <div><Label>Description</Label><div className="mt-1 text-sm bg-muted p-3 rounded">{selectedOrder.description}</div></div>
              {selectedOrder.resolution && <div><Label>Resolution</Label><div className="mt-1 text-sm bg-green-50 p-3 rounded">{selectedOrder.resolution}</div></div>}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setIsViewDialogOpen(false); openEdit(selectedOrder); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                {selectedOrder.status === 'Open' && <Button variant="outline" onClick={() => { handleStatusChange(selectedOrder, 'In Progress'); setIsViewDialogOpen(false); }}><Play className="h-4 w-4 mr-2" />Start Work</Button>}
                {selectedOrder.status === 'In Progress' && <Button variant="outline" onClick={() => { handleStatusChange(selectedOrder, 'Completed'); setIsViewDialogOpen(false); }}><CheckCircle className="h-4 w-4 mr-2" />Complete</Button>}
                <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Maintenance;
