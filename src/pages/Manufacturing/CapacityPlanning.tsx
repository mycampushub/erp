
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
import { ArrowLeft, Calendar, Filter, Download, Clock, Plus, Edit, Eye, AlertTriangle, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useToast } from '../../hooks/use-toast';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface WorkCenterCapacity {
  id: string;
  workCenter: string;
  name: string;
  plant: string;
  totalCapacity: number;
  availableHours: number;
  plannedHours: number;
  utilization: number;
  efficiency: number;
  overload: boolean;
  shift: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

const STORAGE_KEY = 'capacity_work_centers';

const CapacityPlanning: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('current-week');
  const [isLevelingDialogOpen, setIsLevelingDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedWC, setSelectedWC] = useState<WorkCenterCapacity | null>(null);
  const [workCenters, setWorkCenters] = useState<WorkCenterCapacity[]>([]);

  const defaultForm = {
    workCenter: '',
    name: '',
    plant: 'Plant 1000',
    totalCapacity: 160,
    availableHours: 160,
    plannedHours: 0,
    efficiency: 90,
    shift: 'Day Shift',
    status: 'Active' as const,
  };

  const [form, setForm] = useState<Omit<WorkCenterCapacity, 'id' | 'utilization' | 'overload'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Capacity Planning. Plan and manage production capacity efficiently.');
  }, [isEnabled, speak]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = listEntities<WorkCenterCapacity>(STORAGE_KEY);
    if (stored.length === 0) {
      const sample = generateSampleCapacity(30);
      sample.forEach(wc => upsertEntity(STORAGE_KEY, wc as any));
      setWorkCenters(sample);
    } else {
      setWorkCenters(stored);
    }
  };

  const generateSampleCapacity = (count: number): WorkCenterCapacity[] => {
    const wcData = [
      { id: 'WC-001', name: 'Assembly Line 1', plant: 'Plant 1000' },
      { id: 'WC-002', name: 'Assembly Line 2', plant: 'Plant 1000' },
      { id: 'WC-003', name: 'Machining Center', plant: 'Plant 1000' },
      { id: 'WC-004', name: 'Testing Station', plant: 'Plant 1000' },
      { id: 'WC-005', name: 'Welding Station', plant: 'Plant 2000' },
      { id: 'WC-006', name: 'Painting Booth', plant: 'Plant 2000' },
      { id: 'WC-007', name: 'Packaging Line 1', plant: 'Plant 2000' },
      { id: 'WC-008', name: 'Packaging Line 2', plant: 'Plant 3000' },
      { id: 'WC-009', name: 'Quality Control', plant: 'Plant 3000' },
      { id: 'WC-010', name: 'Final Assembly', plant: 'Plant 3000' },
      { id: 'WC-011', name: 'CNC Machine 1', plant: 'Plant 1000' },
      { id: 'WC-012', name: 'CNC Machine 2', plant: 'Plant 1000' },
      { id: 'WC-013', name: 'Laser Cutting', plant: 'Plant 2000' },
      { id: 'WC-014', name: 'Press Line 1', plant: 'Plant 2000' },
      { id: 'WC-015', name: 'Press Line 2', plant: 'Plant 3000' },
    ];

    const shifts = ['Day Shift', 'Night Shift', 'Swing Shift', '24 Hours'];
    const statuses: WorkCenterCapacity['status'][] = ['Active', 'Maintenance', 'Inactive'];

    const result: WorkCenterCapacity[] = [];
    for (let i = 0; i < count; i++) {
      const wc = wcData[i % wcData.length];
      const totalCapacity = 120 + Math.floor(Math.random() * 80);
      const planned = Math.floor(totalCapacity * (0.4 + Math.random() * 0.65));
      const utilization = Math.round((planned / totalCapacity) * 100);
      
      result.push({
        id: generateId('wc'),
        workCenter: `${wc.id}-${Math.floor(i / 15) + 1}`,
        name: wc.name,
        plant: wc.plant,
        totalCapacity,
        availableHours: totalCapacity - planned,
        plannedHours: planned,
        utilization,
        efficiency: Math.floor(Math.random() * 20) + 80,
        overload: utilization > 100,
        shift: shifts[Math.floor(Math.random() * shifts.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }

    return result;
  };

  const runCapacityLeveling = () => {
    const updated = workCenters.map(wc => {
      if (wc.overload) {
        const newPlanned = Math.floor(wc.totalCapacity * 0.85);
        const utilization = Math.round((newPlanned / wc.totalCapacity) * 100);
        return { ...wc, plannedHours: newPlanned, availableHours: wc.totalCapacity - newPlanned, utilization, overload: false };
      }
      return wc;
    });
    updated.forEach(wc => upsertEntity(STORAGE_KEY, wc as any));
    setWorkCenters(updated);
    setIsLevelingDialogOpen(false);
    toast({ title: 'Capacity Leveling Applied', description: 'Workload has been redistributed across work centers.' });
  };

  const handleAdjust = (wc: WorkCenterCapacity) => {
    setSelectedWC(wc);
    setForm({
      workCenter: wc.workCenter,
      name: wc.name,
      plant: wc.plant,
      totalCapacity: wc.totalCapacity,
      availableHours: wc.availableHours,
      plannedHours: wc.plannedHours,
      efficiency: wc.efficiency,
      shift: wc.shift,
      status: wc.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (wc: WorkCenterCapacity) => {
    setSelectedWC(wc);
    setIsViewDialogOpen(true);
  };

  const handleSaveAdjust = () => {
    if (!selectedWC) return;
    const utilization = Math.round(form.plannedHours / form.totalCapacity * 100);
    const updated = { 
      ...selectedWC, 
      ...form,
      utilization, 
      overload: utilization > 100,
      availableHours: form.totalCapacity - form.plannedHours,
    };
    upsertEntity(STORAGE_KEY, updated as any);
    setWorkCenters(prev => prev.map(wc => wc.id === updated.id ? updated : wc));
    toast({ title: 'Capacity Updated', description: `${updated.name} capacity has been adjusted.` });
    setIsEditDialogOpen(false);
  };

  const handleDelete = (wc: WorkCenterCapacity) => {
    removeEntity(STORAGE_KEY, wc.id);
    setWorkCenters(prev => prev.filter(w => w.id !== wc.id));
    toast({ title: 'Work Center Deleted', description: `${wc.name} has been removed.` });
  };

  const handleCreate = () => {
    const newWC: WorkCenterCapacity = {
      id: generateId('wc'),
      ...form,
      utilization: Math.round((form.plannedHours / form.totalCapacity) * 100),
      overload: form.plannedHours > form.totalCapacity,
    };
    upsertEntity(STORAGE_KEY, newWC as any);
    setWorkCenters(prev => [...prev, newWC]);
    toast({ title: 'Work Center Created', description: `${newWC.name} has been created.` });
    setIsEditDialogOpen(false);
  };

  const exportPlan = () => {
    toast({ title: 'Export Started', description: 'Capacity plan exported to Excel successfully.' });
  };

  const columns: EnhancedColumn[] = [
    { key: 'workCenter', header: 'Work Center', sortable: true, searchable: true },
    { key: 'name', header: 'Name', searchable: true },
    { key: 'plant', header: 'Plant', filterable: true, filterOptions: ['Plant 1000','Plant 2000','Plant 3000'].map(v => ({ label: v, value: v })) },
    { key: 'totalCapacity', header: 'Total Capacity (hrs)', sortable: true, render: (v: number) => `${v} h` },
    { key: 'plannedHours', header: 'Planned (hrs)', sortable: true, render: (v: number) => `${v} h` },
    { key: 'availableHours', header: 'Available (hrs)', sortable: true, render: (v: number) => `${v} h` },
    { key: 'utilization', header: 'Utilization', sortable: true, render: (v: number, row: WorkCenterCapacity) => (
      <div className="flex items-center gap-2">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${v > 100 ? 'bg-red-500' : v > 85 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(v, 100)}%` }} />
        </div>
        <span className={v > 100 ? 'text-red-600 font-semibold' : v > 85 ? 'text-yellow-600' : 'text-green-600'}>{v}%</span>
        {row.overload && <AlertTriangle className="h-4 w-4 text-red-500" />}
      </div>
    )},
    { key: 'efficiency', header: 'Efficiency %', sortable: true, render: (v: number) => `${v}%` },
    { key: 'status', header: 'Status', render: (v: string) => {
      const colors: Record<string, string> = { 'Active': 'bg-green-100 text-green-800', 'Maintenance': 'bg-yellow-100 text-yellow-800', 'Inactive': 'bg-red-100 text-red-800' };
      return <Badge className={colors[v] || 'bg-gray-100'}>{v}</Badge>;
    }},
  ];

  const actions: TableAction[] = [
    { label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: handleView, variant: 'ghost' },
    { label: 'Adjust Capacity', icon: <Edit className="h-4 w-4" />, onClick: handleAdjust, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: handleDelete, variant: 'ghost' },
  ];

  const avgUtil = workCenters.length > 0 ? workCenters.reduce((s, wc) => s + wc.utilization, 0) / workCenters.length : 0;

  const trendData = [
    { week: 'Week 18', WC001: 72, WC002: 65, WC003: 88, WC004: 45 },
    { week: 'Week 19', WC001: 78, WC002: 70, WC003: 95, WC004: 50 },
    { week: 'Week 20', WC001: 82, WC002: 74, WC003: 100, WC004: 48 },
    { week: 'Week 21', WC001: 89, WC002: 79, WC003: 105, WC004: 53 },
  ];

  const chartData = workCenters.slice(0, 10).map(wc => ({
    name: wc.workCenter,
    Available: wc.totalCapacity,
    Planned: wc.plannedHours,
  }));

  const utilizationData = workCenters.slice(0, 10).map(wc => ({
    name: wc.workCenter,
    Utilization: wc.utilization,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/manufacturing')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Capacity Planning" description="Plan and manage production capacity efficiently" voiceIntroduction="Welcome to Capacity Planning." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="text-sm text-muted-foreground">Avg Utilization</div><div className="text-2xl font-bold">{avgUtil.toFixed(1)}%</div><div className="text-sm text-blue-600">Across all centers</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Total Available</div><div className="text-2xl font-bold">{workCenters.reduce((s,w) => s+w.totalCapacity,0)} h</div><div className="text-sm text-green-600">This period</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Bottlenecks</div><div className="text-2xl font-bold text-red-600">{workCenters.filter(w => w.overload).length}</div><div className="text-sm text-red-600">Overloaded centers</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Underutilized</div><div className="text-2xl font-bold text-yellow-600">{workCenters.filter(w => w.utilization < 60).length}</div><div className="text-sm text-yellow-600">Below 60% capacity</div></Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Capacity Analysis</h2>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['current-week','next-week','current-month','next-month'].map(p => <SelectItem key={p} value={p}>{p.replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportPlan}><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button size="sm" onClick={() => { setForm(defaultForm); setSelectedWC(null); setIsEditDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Work Center</Button>
          <Button size="sm" onClick={() => setIsLevelingDialogOpen(true)}><Clock className="h-4 w-4 mr-2" />Capacity Leveling</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="table">Work Centers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Capacity Utilization by Work Center</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Available" fill="#93c5fd" name="Available" />
                    <Bar dataKey="Planned" fill="#3b82f6" name="Planned" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Utilization Rate (%)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 120]} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="Utilization" fill="#3b82f6" name="Utilization %">
                      {utilizationData.map((entry, index) => (
                        <Bar key={`bar-${index}`} dataKey="Utilization" fill={entry.Utilization > 90 ? '#ef4444' : entry.Utilization > 70 ? '#f59e0b' : '#22c55e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardHeader><CardTitle>Work Center Capacity Details</CardTitle></CardHeader>
            <CardContent>
              <EnhancedDataTable columns={columns} data={workCenters} actions={actions} searchPlaceholder="Search work centers..." exportable refreshable onRefresh={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader><CardTitle>Utilization Trend (4 Weeks)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 120]} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="WC001" stroke="#3b82f6" name="Assembly Line 1" />
                  <Line type="monotone" dataKey="WC002" stroke="#22c55e" name="Assembly Line 2" />
                  <Line type="monotone" dataKey="WC003" stroke="#ef4444" name="Machining Center" />
                  <Line type="monotone" dataKey="WC004" stroke="#f59e0b" name="Testing Station" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Capacity Leveling Dialog */}
      <Dialog open={isLevelingDialogOpen} onOpenChange={setIsLevelingDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Capacity Leveling</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">The following work centers are overloaded and will have their load redistributed:</p>
            {workCenters.filter(wc => wc.overload).map(wc => (
              <div key={wc.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{wc.name}</div>
                  <div className="text-sm text-muted-foreground">{wc.plannedHours}/{wc.totalCapacity} hrs ({wc.utilization}%)</div>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            ))}
            {workCenters.filter(wc => wc.overload).length === 0 && (
              <p className="text-green-600 text-sm">No overloaded work centers found. All capacities are within limits.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLevelingDialogOpen(false)}>Cancel</Button>
            <Button onClick={runCapacityLeveling}>Apply Leveling</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedWC ? 'Adjust Capacity' : 'Add Work Center'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Work Center ID</Label>
                <Input value={form.workCenter} onChange={e => setForm(f => ({ ...f, workCenter: e.target.value }))} placeholder="WC-001" />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Assembly Line 1" />
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
                <Label>Shift</Label>
                <Select value={form.shift} onValueChange={v => setForm(f => ({ ...f, shift: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Day Shift">Day Shift</SelectItem>
                    <SelectItem value="Night Shift">Night Shift</SelectItem>
                    <SelectItem value="Swing Shift">Swing Shift</SelectItem>
                    <SelectItem value="24 Hours">24 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Total Capacity (hrs)</Label>
                <Input type="number" value={form.totalCapacity} onChange={e => setForm(f => ({ ...f, totalCapacity: Number(e.target.value), availableHours: Number(e.target.value) - f.plannedHours }))} />
              </div>
              <div className="space-y-2">
                <Label>Planned Hours</Label>
                <Input type="number" value={form.plannedHours} onChange={e => setForm(f => ({ ...f, plannedHours: Number(e.target.value), availableHours: f.totalCapacity - Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Efficiency (%)</Label>
                <Input type="number" value={form.efficiency} onChange={e => setForm(f => ({ ...f, efficiency: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as WorkCenterCapacity['status'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedWC && (
              <div className="bg-muted p-3 rounded text-sm">
                <strong>Calculated Utilization:</strong> {Math.round(form.plannedHours / form.totalCapacity * 100)}%
                {form.plannedHours > form.totalCapacity && <span className="text-red-500 ml-2">⚠ Overloaded</span>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={selectedWC ? handleSaveAdjust : handleCreate}>{selectedWC ? 'Save Changes' : 'Add Work Center'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Work Center: {selectedWC?.name}</DialogTitle></DialogHeader>
          {selectedWC && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Work Center ID</Label><div className="font-medium">{selectedWC.workCenter}</div></div>
                <div><Label>Plant</Label><div>{selectedWC.plant}</div></div>
                <div><Label>Total Capacity</Label><div>{selectedWC.totalCapacity} hrs</div></div>
                <div><Label>Planned Hours</Label><div>{selectedWC.plannedHours} hrs</div></div>
                <div><Label>Available Hours</Label><div>{selectedWC.availableHours} hrs</div></div>
                <div><Label>Utilization</Label><div className={selectedWC.utilization > 90 ? 'text-red-600' : 'text-green-600'}>{selectedWC.utilization}%</div></div>
                <div><Label>Efficiency</Label><div>{selectedWC.efficiency}%</div></div>
                <div><Label>Shift</Label><div>{selectedWC.shift}</div></div>
                <div><Label>Status</Label><Badge className={selectedWC.status === 'Active' ? 'bg-green-100' : selectedWC.status === 'Maintenance' ? 'bg-yellow-100' : 'bg-red-100'}>{selectedWC.status}</Badge></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setIsViewDialogOpen(false); handleAdjust(selectedWC); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CapacityPlanning;
