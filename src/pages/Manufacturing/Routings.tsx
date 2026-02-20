
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { ArrowLeft, Plus, Edit, Copy, Eye, Trash2, Download, Settings, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Routing {
  id: string;
  routingId: string;
  material: string;
  materialDescription: string;
  version: string;
  status: 'Active' | 'Draft' | 'Inactive';
  totalTime: number;
  operations: number;
  workCenter: string;
  workCenterName: string;
  plant: string;
  validFrom: string;
  validTo: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

interface RoutingOperation {
  id: string;
  routingId: string;
  operationNumber: string;
  description: string;
  workCenter: string;
  setupTime: number;
  runTime: number;
  teardownTime: number;
  totalTime: number;
  sequence: number;
}

const STORAGE_KEY = 'routings';
const OPERATIONS_KEY = 'routing_operations';

const Routings: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [routings, setRoutings] = useState<Routing[]>([]);
  const [operations, setOperations] = useState<RoutingOperation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRouting, setEditingRouting] = useState<Routing | null>(null);
  const [selectedRouting, setSelectedRouting] = useState<Routing | null>(null);

  const defaultForm = {
    material: '',
    materialDescription: '',
    version: '1.0',
    status: 'Draft' as const,
    workCenter: 'WC-001',
    workCenterName: 'Assembly Line 1',
    plant: 'Plant 1000',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  const [form, setForm] = useState<Omit<Routing, 'id' | 'routingId' | 'totalTime' | 'operations' | 'createdBy' | 'createdDate' | 'lastModified'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('You are now in Routings Management. Here you can manage production routings, operations, and work sequences.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = listEntities<Routing>(STORAGE_KEY);
    const storedOps = listEntities<RoutingOperation>(OPERATIONS_KEY);
    
    if (stored.length === 0) {
      const sample = generateSampleRoutings(30);
      sample.forEach(r => upsertEntity(STORAGE_KEY, r as any));
      sample.flatMap(r => r._operations || []).forEach(op => upsertEntity(OPERATIONS_KEY, op as any));
      setRoutings(sample);
      setOperations(sample.flatMap(r => r._operations || []));
    } else {
      setRoutings(stored);
      setOperations(storedOps);
    }
  };

  const generateSampleRoutings = (count: number): (Routing & { _operations: RoutingOperation[] })[] => {
    const materials = [
      { code: 'FG-001', desc: 'Finished Product A - Standard' },
      { code: 'FG-002', desc: 'Finished Product B - Premium' },
      { code: 'FG-003', desc: 'Finished Product C - Economy' },
      { code: 'SF-001', desc: 'Semi-Finished Component X' },
      { code: 'SF-002', desc: 'Semi-Finished Component Y' },
      { code: 'ASM-001', desc: 'Assembly Unit Alpha' },
    ];

    const workCenters = [
      { id: 'WC-001', name: 'Assembly Line 1' },
      { id: 'WC-002', name: 'Assembly Line 2' },
      { id: 'WC-003', name: 'Machining Center' },
      { id: 'WC-004', name: 'Testing Station' },
      { id: 'WC-005', name: 'Welding Station' },
    ];

    const statuses: Routing['status'][] = ['Active', 'Draft', 'Inactive'];
    const users = ['Manufacturing Engineer', 'Process Engineer', 'Production Manager'];

    const result: (Routing & { _operations: RoutingOperation[] })[] = [];
    const baseDate = new Date('2024-01-01');

    for (let i = 1; i <= count; i++) {
      const material = materials[i % materials.length];
      const wc = workCenters[i % workCenters.length];
      const numOps = Math.floor(Math.random() * 6) + 2;
      const ops: RoutingOperation[] = [];
      
      let totalTime = 0;
      for (let j = 0; j < numOps; j++) {
        const setupTime = Math.floor(Math.random() * 30) + 10;
        const runTime = Math.floor(Math.random() * 60) + 20;
        const teardownTime = Math.floor(Math.random() * 15) + 5;
        totalTime += setupTime + runTime + teardownTime;
        
        ops.push({
          id: generateId('rop'),
          routingId: `RT-${String(i).padStart(4, '0')}`,
          operationNumber: String((j + 1) * 10),
          description: `Operation ${j + 1} - ${['Setup', 'Assembly', 'Machining', 'Inspection', 'Packaging'][j % 5]}`,
          workCenter: wc.id,
          setupTime,
          runTime,
          teardownTime,
          totalTime: setupTime + runTime + teardownTime,
          sequence: j + 1,
        });
      }

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdDate = new Date(baseDate.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000);

      result.push({
        id: generateId('rt'),
        routingId: `RT-${String(i).padStart(4, '0')}`,
        material: material.code,
        materialDescription: material.desc,
        version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
        status,
        totalTime,
        operations: numOps,
        workCenter: wc.id,
        workCenterName: wc.name,
        plant: `Plant ${1000 + (i % 3) * 1000}`,
        validFrom: createdDate.toISOString().split('T')[0],
        validTo: new Date(createdDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdBy: users[Math.floor(Math.random() * users.length)],
        createdDate: createdDate.toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        _operations: ops,
      });
    }

    return result;
  };

  const handleCreate = () => {
    setEditingRouting(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (routing: Routing) => {
    setEditingRouting(routing);
    setForm({
      material: routing.material,
      materialDescription: routing.materialDescription,
      version: routing.version,
      status: routing.status,
      workCenter: routing.workCenter,
      workCenterName: routing.workCenterName,
      plant: routing.plant,
      validFrom: routing.validFrom,
      validTo: routing.validTo,
    });
    setIsDialogOpen(true);
  };

  const handleView = (routing: Routing) => {
    setSelectedRouting(routing);
    setIsViewDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.material.trim()) {
      toast({ title: 'Validation Error', description: 'Material is required.', variant: 'destructive' });
      return;
    }

    if (editingRouting) {
      const updated = { ...editingRouting, ...form, lastModified: new Date().toISOString().split('T')[0] };
      upsertEntity(STORAGE_KEY, updated as any);
      setRoutings(prev => prev.map(r => r.id === editingRouting.id ? updated : r));
      toast({ title: 'Routing Updated', description: `${updated.routingId} has been updated.` });
    } else {
      const newRouting: Routing = {
        id: generateId('rt'),
        routingId: `RT-${String(routings.length + 1).padStart(4, '0')}`,
        ...form,
        totalTime: 0,
        operations: 0,
        createdBy: 'Current User',
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
      };
      upsertEntity(STORAGE_KEY, newRouting as any);
      setRoutings(prev => [...prev, newRouting]);
      toast({ title: 'Routing Created', description: `${newRouting.routingId} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (routing: Routing) => {
    removeEntity(STORAGE_KEY, routing.id);
    setRoutings(prev => prev.filter(r => r.id !== routing.id));
    toast({ title: 'Routing Deleted', description: `${routing.routingId} has been removed.` });
  };

  const handleCopy = (routing: Routing) => {
    const copied = {
      ...routing,
      id: generateId('rt'),
      routingId: `RT-${String(routings.length + 1).padStart(4, '0')}`,
      version: '1.0',
      status: 'Draft' as const,
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };
    upsertEntity(STORAGE_KEY, copied as any);
    setRoutings(prev => [...prev, copied]);
    toast({ title: 'Routing Copied', description: 'Routing has been copied as a new draft.' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Draft': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'routingId', header: 'Routing ID', sortable: true, searchable: true },
    { key: 'material', header: 'Material', searchable: true },
    { key: 'materialDescription', header: 'Description', searchable: true },
    { key: 'version', header: 'Version', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Inactive', value: 'Inactive' },
      ],
      render: (value: string) => <Badge className={getStatusColor(value)}>{value}</Badge>
    },
    { key: 'totalTime', header: 'Total Time (min)', sortable: true, render: (v: number) => `${v} min` },
    { key: 'operations', header: 'Operations', sortable: true },
    { key: 'workCenter', header: 'Work Center', searchable: true },
    { key: 'plant', header: 'Plant', searchable: true },
    { key: 'validFrom', header: 'Valid From', sortable: true },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: handleView, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: handleEdit, variant: 'ghost' },
    { label: 'Copy', icon: <Copy className="h-4 w-4" />, onClick: handleCopy, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: handleDelete, variant: 'ghost' },
  ];

  const chartData = routings.slice(0, 10).map(r => ({
    name: r.routingId,
    'Total Time': r.totalTime,
    Operations: r.operations * 10,
  }));

  const avgTime = routings.length > 0 ? Math.round(routings.reduce((s, r) => s + r.totalTime, 0) / routings.length) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/manufacturing')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Routings"
          description="Manage production routings, operations, and work sequences"
          voiceIntroduction="Welcome to Routings Management."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Routings</div>
          <div className="text-2xl font-bold">{routings.length}</div>
          <div className="text-sm text-blue-600">All versions</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Routings</div>
          <div className="text-2xl font-bold">{routings.filter(r => r.status === 'Active').length}</div>
          <div className="text-sm text-green-600">Currently used</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Avg Operations</div>
          <div className="text-2xl font-bold">{routings.length > 0 ? (routings.reduce((s, r) => s + r.operations, 0) / routings.length).toFixed(1) : 0}</div>
          <div className="text-sm text-purple-600">Per routing</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Avg Cycle Time</div>
          <div className="text-2xl font-bold">{avgTime} min</div>
          <div className="text-sm text-orange-600">Per unit</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Routings Management
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
              <Button size="sm" onClick={handleCreate}><Plus className="h-4 w-4 mr-2" />Create Routing</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedDataTable 
            columns={columns}
            data={routings}
            actions={actions}
            searchPlaceholder="Search routings..."
            exportable={true}
            refreshable={true}
            onRefresh={loadData}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Routing Cycle Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total Time" fill="#3b82f6" name="Total Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Operations Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Operations" fill="#22c55e" name="Operations x10" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRouting ? 'Edit Routing' : 'Create Routing'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Material *</Label>
              <Input value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="FG-001" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.materialDescription} onChange={e => setForm(f => ({ ...f, materialDescription: e.target.value }))} />
            </div>
            <div>
              <Label>Version</Label>
              <Input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Routing['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Work Center</Label>
              <Select value={form.workCenter} onValueChange={v => {
                const names: Record<string, string> = { 'WC-001': 'Assembly Line 1', 'WC-002': 'Assembly Line 2', 'WC-003': 'Machining Center', 'WC-004': 'Testing Station', 'WC-005': 'Welding Station' };
                setForm(f => ({ ...f, workCenter: v, workCenterName: names[v] || '' }));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WC-001">WC-001 - Assembly Line 1</SelectItem>
                  <SelectItem value="WC-002">WC-002 - Assembly Line 2</SelectItem>
                  <SelectItem value="WC-003">WC-003 - Machining Center</SelectItem>
                  <SelectItem value="WC-004">WC-004 - Testing Station</SelectItem>
                  <SelectItem value="WC-005">WC-005 - Welding Station</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
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
            <div>
              <Label>Valid From</Label>
              <Input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} />
            </div>
            <div>
              <Label>Valid To</Label>
              <Input type="date" value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingRouting ? 'Update' : 'Create'} Routing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Routing: {selectedRouting?.routingId}</DialogTitle>
          </DialogHeader>
          {selectedRouting && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Material</Label><div className="font-medium">{selectedRouting.material}</div></div>
                <div><Label>Description</Label><div>{selectedRouting.materialDescription}</div></div>
                <div><Label>Version</Label><div>{selectedRouting.version}</div></div>
                <div><Label>Status</Label><Badge className={getStatusColor(selectedRouting.status)}>{selectedRouting.status}</Badge></div>
                <div><Label>Work Center</Label><div>{selectedRouting.workCenter} - {selectedRouting.workCenterName}</div></div>
                <div><Label>Plant</Label><div>{selectedRouting.plant}</div></div>
                <div><Label>Total Time</Label><div>{selectedRouting.totalTime} min</div></div>
                <div><Label>Operations</Label><div>{selectedRouting.operations}</div></div>
                <div><Label>Valid From</Label><div>{selectedRouting.validFrom}</div></div>
                <div><Label>Valid To</Label><div>{selectedRouting.validTo}</div></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setIsViewDialogOpen(false); handleEdit(selectedRouting); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                <Button variant="outline" onClick={() => handleCopy(selectedRouting)}><Copy className="h-4 w-4 mr-2" />Copy</Button>
                <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Routings;
