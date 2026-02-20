
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
import { Textarea } from '../../components/ui/textarea';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { ArrowLeft, Plus, Edit, Eye, Trash2, Download, Calendar, Clock, Package, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ScheduleOrder {
  id: string;
  scheduleNumber: string;
  orderNumber: string;
  material: string;
  materialDescription: string;
  quantity: number;
  unit: string;
  workCenter: string;
  workCenterName: string;
  plant: string;
  scheduledDate: string;
  scheduledShift: 'Day Shift' | 'Night Shift' | 'Swing Shift';
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  supervisor: string;
  notes?: string;
  createdDate: string;
}

const STORAGE_KEY = 'production_schedule_orders';

const ProductionScheduling: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('daily');
  const [schedules, setSchedules] = useState<ScheduleOrder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleOrder | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleOrder | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const defaultForm = {
    orderNumber: '',
    material: '',
    materialDescription: '',
    quantity: 100,
    unit: 'EA',
    workCenter: 'WC-001',
    workCenterName: 'Assembly Line 1',
    plant: 'Plant 1000',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledShift: 'Day Shift' as const,
    startTime: '08:00',
    endTime: '16:00',
    status: 'Scheduled' as const,
    priority: 'Medium' as const,
    supervisor: '',
    notes: '',
  };

  const [form, setForm] = useState<Omit<ScheduleOrder, 'id' | 'scheduleNumber' | 'createdDate'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('You are now viewing Production Scheduling. This page allows you to schedule and manage production operations.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const stored = listEntities<ScheduleOrder>(STORAGE_KEY);
    if (stored.length === 0) {
      const sampleData = generateSampleSchedules(30);
      sampleData.forEach(s => upsertEntity(STORAGE_KEY, s as any));
      setSchedules(sampleData);
    } else {
      setSchedules(stored);
    }
  };

  const generateSampleSchedules = (count: number): ScheduleOrder[] => {
    const materials = [
      { code: 'FG-001', desc: 'Finished Product A - Standard' },
      { code: 'FG-002', desc: 'Finished Product B - Premium' },
      { code: 'FG-003', desc: 'Finished Product C - Economy' },
      { code: 'SF-001', desc: 'Semi-Finished Component X' },
      { code: 'SF-002', desc: 'Semi-Finished Component Y' },
      { code: 'ASM-001', desc: 'Assembly Unit Alpha' },
      { code: 'ASM-002', desc: 'Assembly Unit Beta' },
      { code: 'PKG-001', desc: 'Packaging Kit Standard' },
    ];

    const workCenters = [
      { id: 'WC-001', name: 'Assembly Line 1' },
      { id: 'WC-002', name: 'Assembly Line 2' },
      { id: 'WC-003', name: 'Machining Center' },
      { id: 'WC-004', name: 'Testing Station' },
      { id: 'WC-005', name: 'Welding Station' },
      { id: 'WC-006', name: 'Painting Booth' },
    ];

    const plants = ['Plant 1000', 'Plant 2000', 'Plant 3000'];
    const supervisors = ['John Smith', 'Sarah Johnson', 'Mike Williams', 'Lisa Brown'];
    const shifts: ScheduleOrder['scheduledShift'][] = ['Day Shift', 'Night Shift', 'Swing Shift'];
    const statuses: ScheduleOrder['status'][] = ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'On Hold'];
    const priorities: ScheduleOrder['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
    const units = ['EA', 'KG', 'L', 'SET'];

    const result: ScheduleOrder[] = [];
    const baseDate = new Date('2025-01-06');

    for (let i = 1; i <= count; i++) {
      const material = materials[Math.floor(Math.random() * materials.length)];
      const wc = workCenters[Math.floor(Math.random() * workCenters.length)];
      const dayOffset = Math.floor((i - 1) / 6);
      const date = new Date(baseDate);
      date.setDate(date.getDate() + dayOffset);

      const startHour = 6 + Math.floor(Math.random() * 10);
      const duration = Math.floor(Math.random() * 6) + 4;
      const endHour = Math.min(startHour + duration, 22);

      result.push({
        id: generateId('sch'),
        scheduleNumber: `SCH-${String(2025000 + i).slice(1)}`,
        orderNumber: `PO-${String(1000000 + i).slice(1)}`,
        material: material.code,
        materialDescription: material.desc,
        quantity: Math.floor(Math.random() * 200) + 20,
        unit: units[Math.floor(Math.random() * units.length)],
        workCenter: wc.id,
        workCenterName: wc.name,
        plant: plants[Math.floor(Math.random() * plants.length)],
        scheduledDate: date.toISOString().split('T')[0],
        scheduledShift: shifts[Math.floor(Math.random() * shifts.length)],
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(endHour).padStart(2, '0')}:00`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        supervisor: supervisors[Math.floor(Math.random() * supervisors.length)],
        notes: Math.random() > 0.7 ? 'Scheduled for priority delivery' : '',
        createdDate: new Date().toISOString().split('T')[0],
      });
    }

    return result.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'On Hold': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const openCreate = () => {
    setEditingSchedule(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (schedule: ScheduleOrder) => {
    setEditingSchedule(schedule);
    setForm({
      orderNumber: schedule.orderNumber,
      material: schedule.material,
      materialDescription: schedule.materialDescription,
      quantity: schedule.quantity,
      unit: schedule.unit,
      workCenter: schedule.workCenter,
      workCenterName: schedule.workCenterName,
      plant: schedule.plant,
      scheduledDate: schedule.scheduledDate,
      scheduledShift: schedule.scheduledShift,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      status: schedule.status,
      priority: schedule.priority,
      supervisor: schedule.supervisor,
      notes: schedule.notes || '',
    });
    setIsDialogOpen(true);
  };

  const openView = (schedule: ScheduleOrder) => {
    setSelectedSchedule(schedule);
    setIsViewDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.material.trim()) {
      toast({ title: 'Validation Error', description: 'Material is required.', variant: 'destructive' });
      return;
    }

    if (editingSchedule) {
      const updated: ScheduleOrder = {
        ...editingSchedule,
        ...form,
      };
      upsertEntity(STORAGE_KEY, updated as any);
      setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? updated : s));
      toast({ title: 'Schedule Updated', description: `${updated.scheduleNumber} has been updated.` });
    } else {
      const newSchedule: ScheduleOrder = {
        id: generateId('sch'),
        scheduleNumber: `SCH-${String(2025000 + schedules.length + 1).slice(1)}`,
        ...form,
        createdDate: new Date().toISOString().split('T')[0],
      };
      upsertEntity(STORAGE_KEY, newSchedule as any);
      setSchedules(prev => [...prev, newSchedule]);
      toast({ title: 'Schedule Created', description: `${newSchedule.scheduleNumber} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (schedule: ScheduleOrder) => {
    removeEntity(STORAGE_KEY, schedule.id);
    setSchedules(prev => prev.filter(s => s.id !== schedule.id));
    toast({ title: 'Schedule Deleted', description: `${schedule.scheduleNumber} has been removed.` });
  };

  const columns: EnhancedColumn[] = [
    { key: 'scheduleNumber', header: 'Schedule #', sortable: true, searchable: true },
    { key: 'orderNumber', header: 'Order #', sortable: true, searchable: true },
    { key: 'material', header: 'Material', searchable: true },
    { key: 'materialDescription', header: 'Description', searchable: true },
    { key: 'quantity', header: 'Qty', sortable: true, render: (v: number, row: ScheduleOrder) => `${v} ${row.unit}` },
    { key: 'workCenter', header: 'Work Center', sortable: true },
    { key: 'scheduledDate', header: 'Date', sortable: true },
    { key: 'scheduledShift', header: 'Shift', filterable: true },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Scheduled', value: 'Scheduled' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'On Hold', value: 'On Hold' },
      ],
      render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge>
    },
    { 
      key: 'priority', 
      header: 'Priority',
      render: (v: string) => <Badge className={getPriorityColor(v)}>{v}</Badge>
    },
    { key: 'supervisor', header: 'Supervisor', searchable: true },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: openView, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: openEdit, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: handleDelete, variant: 'ghost' },
  ];

  const workCenters = ['WC-001', 'WC-002', 'WC-003', 'WC-004', 'WC-005', 'WC-006'];
  const hours = Array.from({ length: 10 }, (_, i) => i + 8);

  const getScheduleForCell = (workCenter: string, hour: number) => {
    return schedules.filter(s => 
      s.workCenter === workCenter && 
      s.scheduledDate === selectedDate &&
      hour >= parseInt(s.startTime.split(':')[0]) &&
      hour < parseInt(s.endTime.split(':')[0])
    );
  };

  const chartData = [
    { name: 'Scheduled', value: schedules.filter(s => s.status === 'Scheduled').length },
    { name: 'In Progress', value: schedules.filter(s => s.status === 'In Progress').length },
    { name: 'Completed', value: schedules.filter(s => s.status === 'Completed').length },
    { name: 'Cancelled', value: schedules.filter(s => s.status === 'Cancelled').length },
  ];

  const workCenterData = workCenters.map(wc => ({
    name: wc,
    scheduled: schedules.filter(s => s.workCenter === wc && s.status === 'Scheduled').length,
    completed: schedules.filter(s => s.workCenter === wc && s.status === 'Completed').length,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/manufacturing')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Production Scheduling"
          description="Schedule and manage production operations efficiently"
          voiceIntroduction="Welcome to Production Scheduling. Here you can plan and schedule production operations."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Scheduled</div>
          <div className="text-2xl font-bold">{schedules.length}</div>
          <div className="text-sm text-blue-600">All schedules</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold">{schedules.filter(s => s.status === 'In Progress').length}</div>
          <div className="text-sm text-yellow-600">Active</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold">{schedules.filter(s => s.status === 'Completed').length}</div>
          <div className="text-sm text-green-600">Done</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Utilization</div>
          <div className="text-2xl font-bold">
            {schedules.length > 0 
              ? Math.round((schedules.filter(s => s.status !== 'Cancelled').length / schedules.length) * 100)
              : 0}%
          </div>
          <div className="text-sm text-purple-600">Overall</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Production Schedule</h2>
          <p className="text-sm text-gray-500">January 2025 - Week 2</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" /> 
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-32 h-8"
            />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="capacity">Capacity View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <Card className="p-0 overflow-hidden">
            <div className="grid grid-cols-8 bg-gray-50 border-b">
              <div className="p-4 border-r font-medium">Time</div>
              {workCenters.map(wc => (
                <div key={wc} className="p-4 border-r font-medium">{wc}</div>
              ))}
            </div>
            
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b hover:bg-gray-50">
                <div className="p-4 border-r text-gray-500">
                  {`${hour}:00`}
                </div>
                {workCenters.map(wc => {
                  const cellSchedules = getScheduleForCell(wc, hour);
                  return (
                    <div key={`${wc}-${hour}`} className={`p-2 border-r ${cellSchedules.length > 0 ? 'bg-blue-50' : ''}`}>
                      {cellSchedules.slice(0, 1).map(s => (
                        <div key={s.id} className="text-xs bg-blue-100 border border-blue-300 rounded p-1">
                          <div className="font-medium">{s.material}</div>
                          <div>{s.quantity} {s.unit}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={columns}
                data={schedules}
                actions={actions}
                searchPlaceholder="Search schedules..."
                exportable={true}
                refreshable={true}
                onRefresh={loadData}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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
        </TabsContent>
        
        <TabsContent value="capacity">
          <Card>
            <CardHeader>
              <CardTitle>Capacity Utilization by Work Center</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workCenterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="scheduled" name="Scheduled" fill="#3b82f6" />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Create Schedule'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Order Number</Label>
              <Input value={form.orderNumber} onChange={e => setForm(f => ({ ...f, orderNumber: e.target.value }))} placeholder="PO-1000001" />
            </div>
            <div className="space-y-2">
              <Label>Material *</Label>
              <Input value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="FG-001" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Material Description</Label>
              <Input value={form.materialDescription} onChange={e => setForm(f => ({ ...f, materialDescription: e.target.value }))} placeholder="Material description" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EA">Each</SelectItem>
                  <SelectItem value="KG">Kilogram</SelectItem>
                  <SelectItem value="L">Liter</SelectItem>
                  <SelectItem value="SET">Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work Center</Label>
              <Select value={form.workCenter} onValueChange={v => {
                const wcNames: Record<string, string> = {
                  'WC-001': 'Assembly Line 1',
                  'WC-002': 'Assembly Line 2',
                  'WC-003': 'Machining Center',
                  'WC-004': 'Testing Station',
                  'WC-005': 'Welding Station',
                  'WC-006': 'Painting Booth',
                };
                setForm(f => ({ ...f, workCenter: v, workCenterName: wcNames[v] || '' }));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WC-001">WC-001 - Assembly Line 1</SelectItem>
                  <SelectItem value="WC-002">WC-002 - Assembly Line 2</SelectItem>
                  <SelectItem value="WC-003">WC-003 - Machining Center</SelectItem>
                  <SelectItem value="WC-004">WC-004 - Testing Station</SelectItem>
                  <SelectItem value="WC-005">WC-005 - Welding Station</SelectItem>
                  <SelectItem value="WC-006">WC-006 - Painting Booth</SelectItem>
                </SelectContent>
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
              <Label>Shift</Label>
              <Select value={form.scheduledShift} onValueChange={v => setForm(f => ({ ...f, scheduledShift: v as ScheduleOrder['scheduledShift'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day Shift">Day Shift</SelectItem>
                  <SelectItem value="Night Shift">Night Shift</SelectItem>
                  <SelectItem value="Swing Shift">Swing Shift</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ScheduleOrder['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as ScheduleOrder['priority'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Supervisor</Label>
              <Select value={form.supervisor} onValueChange={v => setForm(f => ({ ...f, supervisor: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="John Smith">John Smith</SelectItem>
                  <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="Mike Williams">Mike Williams</SelectItem>
                  <SelectItem value="Lisa Brown">Lisa Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingSchedule ? 'Update' : 'Create'} Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Schedule: {selectedSchedule?.scheduleNumber}</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Order Number</Label><div>{selectedSchedule.orderNumber}</div></div>
                <div><Label>Material</Label><div>{selectedSchedule.material}</div></div>
                <div><Label>Description</Label><div>{selectedSchedule.materialDescription}</div></div>
                <div><Label>Quantity</Label><div>{selectedSchedule.quantity} {selectedSchedule.unit}</div></div>
                <div><Label>Work Center</Label><div>{selectedSchedule.workCenter} - {selectedSchedule.workCenterName}</div></div>
                <div><Label>Plant</Label><div>{selectedSchedule.plant}</div></div>
                <div><Label>Date</Label><div>{selectedSchedule.scheduledDate}</div></div>
                <div><Label>Shift</Label><div>{selectedSchedule.scheduledShift}</div></div>
                <div><Label>Time</Label><div>{selectedSchedule.startTime} - {selectedSchedule.endTime}</div></div>
                <div><Label>Status</Label><Badge className={getStatusColor(selectedSchedule.status)}>{selectedSchedule.status}</Badge></div>
                <div><Label>Priority</Label><Badge className={getPriorityColor(selectedSchedule.priority)}>{selectedSchedule.priority}</Badge></div>
                <div><Label>Supervisor</Label><div>{selectedSchedule.supervisor}</div></div>
              </div>
              {selectedSchedule.notes && (
                <div><Label>Notes</Label><div className="text-sm bg-muted p-3 rounded">{selectedSchedule.notes}</div></div>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setIsViewDialogOpen(false); openEdit(selectedSchedule); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionScheduling;
