
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
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { ArrowLeft, Plus, Edit, Eye, Trash2, Settings, Activity, Wrench, CheckCircle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface WorkCenter {
  id: string;
  workCenterId: string;
  name: string;
  type: string;
  capacity: number;
  efficiency: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
  costCenter: string;
  responsiblePerson: string;
  plant: string;
  location: string;
  shift: string;
  setupTime: number;
  teardownTime: number;
  hourlyRate: number;
}

const STORAGE_KEY = 'work_centers';

const WorkCenters: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list');
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingWC, setEditingWC] = useState<WorkCenter | null>(null);
  const [selectedWC, setSelectedWC] = useState<WorkCenter | null>(null);

  const defaultForm: Omit<WorkCenter, 'id'> = {
    workCenterId: '',
    name: '',
    type: 'Production',
    capacity: 160,
    efficiency: 90,
    status: 'Active',
    costCenter: '',
    responsiblePerson: '',
    plant: 'Plant 1000',
    location: '',
    shift: 'Day Shift',
    setupTime: 30,
    teardownTime: 20,
    hourlyRate: 85,
  };

  const [form, setForm] = useState<Omit<WorkCenter, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Work Centers Management. Manage work centers, capacity, and configuration.');
  }, [isEnabled, speak]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = listEntities<WorkCenter>(STORAGE_KEY);
    if (stored.length === 0) {
      const sample = generateSampleWorkCenters(30);
      sample.forEach(wc => upsertEntity(STORAGE_KEY, wc as any));
      setWorkCenters(sample);
    } else {
      setWorkCenters(stored);
    }
  };

  const generateSampleWorkCenters = (count: number): WorkCenter[] => {
    const types = ['Production', 'Quality', 'Packaging', 'Fabrication', 'Testing', 'Welding', 'Machining'];
    const names = [
      'Assembly Line 1', 'Assembly Line 2', 'Assembly Line 3',
      'Quality Control Station', 'Testing Lab', 'Inspection Bay',
      'Packaging Line 1', 'Packaging Line 2', 'Wrapping Station',
      'CNC Machining Center', 'Laser Cutting', 'Welding Station 1', 'Welding Station 2',
      'Press Line', 'Paint Booth', 'Assembly Station',
    ];
    const locations = ['Building A, Floor 1', 'Building A, Floor 2', 'Building B, Floor 1', 'Building B, Floor 2', 'Building C, Floor 1', 'Building C, Floor 2'];
    const shifts = ['Day Shift', 'Night Shift', 'Swing Shift', '24 Hours'];
    const supervisors = ['John Smith', 'Sarah Johnson', 'Mike Williams', 'Lisa Brown', 'David Lee', 'Emma Davis', 'Robert Wilson', 'Jennifer Taylor'];
    const statuses: WorkCenter['status'][] = ['Active', 'Maintenance', 'Inactive'];

    const result: WorkCenter[] = [];
    for (let i = 0; i < count; i++) {
      result.push({
        id: generateId('wc'),
        workCenterId: `WC-${String(i + 1).padStart(3, '0')}`,
        name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
        type: types[i % types.length],
        capacity: 120 + Math.floor(Math.random() * 80),
        efficiency: Math.floor(Math.random() * 20) + 80,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        costCenter: `CC-${1000 + (i % 10)}`,
        responsiblePerson: supervisors[i % supervisors.length],
        plant: `Plant ${1000 + (i % 3) * 1000}`,
        location: locations[i % locations.length],
        shift: shifts[i % shifts.length],
        setupTime: 15 + Math.floor(Math.random() * 45),
        teardownTime: 10 + Math.floor(Math.random() * 30),
        hourlyRate: 50 + Math.floor(Math.random() * 80),
      });
    }

    return result;
  };

  const openCreate = () => {
    setEditingWC(null);
    setForm({ ...defaultForm, workCenterId: `WC-${String(workCenters.length + 1).padStart(3, '0')}` });
    setIsDialogOpen(true);
  };

  const openEdit = (wc: WorkCenter) => {
    setEditingWC(wc);
    setForm({
      workCenterId: wc.workCenterId,
      name: wc.name,
      type: wc.type,
      capacity: wc.capacity,
      efficiency: wc.efficiency,
      status: wc.status,
      costCenter: wc.costCenter,
      responsiblePerson: wc.responsiblePerson,
      plant: wc.plant,
      location: wc.location,
      shift: wc.shift,
      setupTime: wc.setupTime,
      teardownTime: wc.teardownTime,
      hourlyRate: wc.hourlyRate,
    });
    setIsDialogOpen(true);
  };

  const openView = (wc: WorkCenter) => {
    setSelectedWC(wc);
    setIsViewDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: 'Validation Error', description: 'Work Center name is required.', variant: 'destructive' });
      return;
    }
    if (editingWC) {
      const updated = { ...editingWC, ...form };
      upsertEntity(STORAGE_KEY, updated as any);
      setWorkCenters(prev => prev.map(w => w.id === editingWC.id ? updated : w));
      toast({ title: 'Work Center Updated', description: `${form.name} has been updated successfully.` });
    } else {
      const newWC: WorkCenter = { id: generateId('wc'), ...form };
      upsertEntity(STORAGE_KEY, newWC as any);
      setWorkCenters(prev => [...prev, newWC]);
      toast({ title: 'Work Center Created', description: `${form.name} has been created successfully.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (wc: WorkCenter) => {
    removeEntity(STORAGE_KEY, wc.id);
    setWorkCenters(prev => prev.filter(w => w.id !== wc.id));
    toast({ title: 'Work Center Deleted', description: `${wc.name} has been removed.` });
  };

  const handleStatusChange = (wc: WorkCenter, status: WorkCenter['status']) => {
    const updated = { ...wc, status };
    upsertEntity(STORAGE_KEY, updated as any);
    setWorkCenters(prev => prev.map(w => w.id === wc.id ? updated : w));
    toast({ title: 'Status Updated', description: `${wc.name} status changed to ${status}.` });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { 'Active': 'bg-green-100 text-green-800', 'Maintenance': 'bg-yellow-100 text-yellow-800', 'Inactive': 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'workCenterId', header: 'Work Center ID', sortable: true, searchable: true },
    { key: 'name', header: 'Name', searchable: true },
    { key: 'type', header: 'Type', filterable: true, filterOptions: ['Production','Quality','Packaging','Fabrication','Testing','Welding','Machining'].map(v => ({ label: v, value: v })) },
    { key: 'plant', header: 'Plant', filterable: true, filterOptions: ['Plant 1000','Plant 2000','Plant 3000'].map(v => ({ label: v, value: v })) },
    { key: 'capacity', header: 'Capacity (hrs)', sortable: true, render: (v: number) => `${v} hrs` },
    { key: 'efficiency', header: 'Efficiency', sortable: true, render: (v: number) => (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${v >= 90 ? 'bg-green-500' : v >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${v}%` }} />
        </div>
        <span className={v >= 90 ? 'text-green-600' : v >= 80 ? 'text-yellow-600' : 'text-red-600'}>{v}%</span>
      </div>
    )},
    { key: 'responsiblePerson', header: 'Responsible', searchable: true },
    { key: 'status', header: 'Status', filterable: true, filterOptions: ['Active','Maintenance','Inactive'].map(v => ({ label: v, value: v })),
      render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
    { key: 'hourlyRate', header: 'Rate/hr', sortable: true, render: (v: number) => `$${v}` },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: openView, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: openEdit, variant: 'ghost' },
    { label: 'Set Active', icon: <CheckCircle className="h-4 w-4" />, onClick: (row: WorkCenter) => handleStatusChange(row, 'Active'), variant: 'ghost', condition: (row: WorkCenter) => row.status !== 'Active' },
    { label: 'Set Maintenance', icon: <Wrench className="h-4 w-4" />, onClick: (row: WorkCenter) => handleStatusChange(row, 'Maintenance'), variant: 'ghost', condition: (row: WorkCenter) => row.status === 'Active' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: handleDelete, variant: 'ghost' },
  ];

  const chartData = workCenters.slice(0, 10).map(wc => ({
    name: wc.workCenterId,
    Capacity: wc.capacity,
    Efficiency: wc.efficiency,
  }));

  const avgEfficiency = workCenters.length > 0 ? Math.round(workCenters.reduce((s, w) => s + w.efficiency, 0) / workCenters.length) : 0;
  const totalCapacity = workCenters.reduce((s, w) => s + w.capacity, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/manufacturing')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Work Centers" description="Manage work centers, capacity, and configuration" voiceIntroduction="Welcome to Work Centers Management." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Work Centers</div>
          <div className="text-2xl font-bold">{workCenters.length}</div>
          <div className="text-sm text-blue-600">All centers</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Centers</div>
          <div className="text-2xl font-bold">{workCenters.filter(w => w.status === 'Active').length}</div>
          <div className="text-sm text-green-600">Operational</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Avg Efficiency</div>
          <div className="text-2xl font-bold">{avgEfficiency}%</div>
          <div className="text-sm text-purple-600">Across all centers</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Capacity</div>
          <div className="text-2xl font-bold">{totalCapacity} hrs</div>
          <div className="text-sm text-orange-600">Monthly</div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Work Centers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Work Centers
                <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Work Center</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={columns} data={workCenters} actions={actions} searchPlaceholder="Search work centers..." exportable refreshable onRefresh={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Efficiency by Work Center</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Efficiency" fill="#3b82f6" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Capacity Overview</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Capacity" fill="#22c55e" name="Capacity (hrs)" />
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
            <DialogTitle>{editingWC ? 'Edit Work Center' : 'Create Work Center'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Work Center ID *</Label>
              <Input value={form.workCenterId} onChange={e => setForm(f => ({ ...f, workCenterId: e.target.value }))} placeholder="WC-001" />
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Assembly Line 1" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Production','Quality','Packaging','Fabrication','Testing','Welding','Machining'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as WorkCenter['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Active','Maintenance','Inactive'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plant</Label>
              <Select value={form.plant} onValueChange={v => setForm(f => ({ ...f, plant: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Plant 1000','Plant 2000','Plant 3000'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <Select value={form.shift} onValueChange={v => setForm(f => ({ ...f, shift: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Day Shift','Night Shift','Swing Shift','24 Hours','3-Shift'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Capacity (hrs/month)</Label>
              <Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Efficiency (%)</Label>
              <Input type="number" min="0" max="100" value={form.efficiency} onChange={e => setForm(f => ({ ...f, efficiency: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Cost Center</Label>
              <Input value={form.costCenter} onChange={e => setForm(f => ({ ...f, costCenter: e.target.value }))} placeholder="e.g. CC-1001" />
            </div>
            <div className="space-y-2">
              <Label>Responsible Person</Label>
              <Input value={form.responsiblePerson} onChange={e => setForm(f => ({ ...f, responsiblePerson: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Building & floor" />
            </div>
            <div className="space-y-2">
              <Label>Setup Time (min)</Label>
              <Input type="number" value={form.setupTime} onChange={e => setForm(f => ({ ...f, setupTime: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Teardown Time (min)</Label>
              <Input type="number" value={form.teardownTime} onChange={e => setForm(f => ({ ...f, teardownTime: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Hourly Rate ($)</Label>
              <Input type="number" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingWC ? 'Update' : 'Create'} Work Center</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Work Center Details: {selectedWC?.workCenterId}</DialogTitle>
          </DialogHeader>
          {selectedWC && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name</Label><div className="font-medium">{selectedWC.name}</div></div>
                <div><Label>Type</Label><div>{selectedWC.type}</div></div>
                <div><Label>Plant</Label><div>{selectedWC.plant}</div></div>
                <div><Label>Status</Label><Badge className={getStatusColor(selectedWC.status)}>{selectedWC.status}</Badge></div>
                <div><Label>Capacity</Label><div>{selectedWC.capacity} hrs/month</div></div>
                <div><Label>Efficiency</Label><div className={selectedWC.efficiency >= 90 ? 'text-green-600' : 'text-yellow-600'}>{selectedWC.efficiency}%</div></div>
                <div><Label>Cost Center</Label><div>{selectedWC.costCenter}</div></div>
                <div><Label>Responsible Person</Label><div>{selectedWC.responsiblePerson}</div></div>
                <div><Label>Location</Label><div>{selectedWC.location}</div></div>
                <div><Label>Shift</Label><div>{selectedWC.shift}</div></div>
                <div><Label>Setup Time</Label><div>{selectedWC.setupTime} min</div></div>
                <div><Label>Teardown Time</Label><div>{selectedWC.teardownTime} min</div></div>
                <div><Label>Hourly Rate</Label><div className="font-semibold">${selectedWC.hourlyRate}/hr</div></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setIsViewDialogOpen(false); openEdit(selectedWC); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkCenters;
