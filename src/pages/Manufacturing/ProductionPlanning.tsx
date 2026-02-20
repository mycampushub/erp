
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
import { ArrowLeft, Plus, Edit, Eye, Trash2, Download, Filter, Calendar, TrendingUp, Package, Settings } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

interface ProductionPlan {
  id: string;
  planNumber: string;
  material: string;
  materialDescription: string;
  plannedQuantity: number;
  actualQuantity: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  workCenter: string;
  plant: string;
  supervisor: string;
  efficiency: number;
  variance: number;
  notes?: string;
  createdDate: string;
  lastModified: string;
}

interface CapacityEntry {
  id: string;
  workCenter: string;
  workCenterName: string;
  totalCapacity: number;
  planned: number;
  available: number;
  utilization: number;
  efficiency: number;
  plant: string;
}

interface ScheduleEntry {
  id: string;
  planId: string;
  date: string;
  shift: string;
  workCenter: string;
  material: string;
  quantity: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
}

interface ForecastEntry {
  id: string;
  period: string;
  forecastType: string;
  quantity: number;
  confidence: number;
  trend: number;
}

const STORAGE_KEY = 'production_plans';
const CAPACITY_STORAGE_KEY = 'capacity_entries';
const SCHEDULE_STORAGE_KEY = 'production_schedule';
const FORECAST_STORAGE_KEY = 'production_forecast';

const ProductionPlanningPage: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('planning');
  const [selectedPeriod, setSelectedPeriod] = useState('current-week');
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [capacity, setCapacity] = useState<CapacityEntry[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [forecast, setForecast] = useState<ForecastEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);

  const defaultForm: Omit<ProductionPlan, 'id' | 'planNumber' | 'actualQuantity' | 'efficiency' | 'variance' | 'createdDate' | 'lastModified'> = {
    material: '',
    materialDescription: '',
    plannedQuantity: 100,
    unit: 'EA',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Planned',
    priority: 'Medium',
    workCenter: 'WC-001',
    plant: 'Plant 1000',
    supervisor: '',
    notes: '',
  };

  const [form, setForm] = useState<Omit<ProductionPlan, 'id' | 'planNumber' | 'actualQuantity' | 'efficiency' | 'variance' | 'createdDate' | 'lastModified'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('You are now in Production Planning. Here you can manage production plans, capacity, and scheduling.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedPlans = listEntities<ProductionPlan>(STORAGE_KEY);
    const storedCapacity = listEntities<CapacityEntry>(CAPACITY_STORAGE_KEY);
    const storedSchedule = listEntities<ScheduleEntry>(SCHEDULE_STORAGE_KEY);
    const storedForecast = listEntities<ForecastEntry>(FORECAST_STORAGE_KEY);

    if (storedPlans.length === 0) {
      const samplePlans = generateSamplePlans(30);
      samplePlans.forEach(p => upsertEntity(STORAGE_KEY, p as any));
      setPlans(samplePlans);
    } else {
      setPlans(storedPlans);
    }

    if (storedCapacity.length === 0) {
      const sampleCapacity = generateSampleCapacity(30);
      sampleCapacity.forEach(c => upsertEntity(CAPACITY_STORAGE_KEY, c as any));
      setCapacity(sampleCapacity);
    } else {
      setCapacity(storedCapacity);
    }

    if (storedSchedule.length === 0) {
      const sampleSchedule = generateSampleSchedule(30);
      sampleSchedule.forEach(s => upsertEntity(SCHEDULE_STORAGE_KEY, s as any));
      setSchedule(sampleSchedule);
    } else {
      setSchedule(storedSchedule);
    }

    if (storedForecast.length === 0) {
      const sampleForecast = generateSampleForecast(12);
      sampleForecast.forEach(f => upsertEntity(FORECAST_STORAGE_KEY, f as any));
      setForecast(sampleForecast);
    } else {
      setForecast(storedForecast);
    }
  };

  const generateSamplePlans = (count: number): ProductionPlan[] => {
    const materials = [
      { code: 'FG-001', desc: 'Finished Product A - Standard' },
      { code: 'FG-002', desc: 'Finished Product B - Premium' },
      { code: 'FG-003', desc: 'Finished Product C - Economy' },
      { code: 'SF-001', desc: 'Semi-Finished Component X' },
      { code: 'SF-002', desc: 'Semi-Finished Component Y' },
      { code: 'SF-003', desc: 'Semi-Finished Component Z' },
      { code: 'ASM-001', desc: 'Assembly Unit Alpha' },
      { code: 'ASM-002', desc: 'Assembly Unit Beta' },
      { code: 'PKG-001', desc: 'Packaging Kit Standard' },
      { code: 'RAW-001', desc: 'Raw Material Base Alloy' },
    ];

    const statuses: ProductionPlan['status'][] = ['Planned', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
    const priorities: ProductionPlan['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
    const supervisors = ['John Smith', 'Sarah Johnson', 'Mike Williams', 'Lisa Brown', 'David Lee', 'Emma Davis'];
    const workCenters = ['WC-001', 'WC-002', 'WC-003', 'WC-004', 'WC-005', 'WC-006'];
    const plants = ['Plant 1000', 'Plant 2000', 'Plant 3000'];
    const units = ['EA', 'KG', 'L', 'M', 'SET'];

    const result: ProductionPlan[] = [];
    const baseDate = new Date('2025-01-01');

    for (let i = 1; i <= count; i++) {
      const material = materials[Math.floor(Math.random() * materials.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const startOffset = Math.floor(Math.random() * 60);
      const duration = Math.floor(Math.random() * 14) + 3;
      const startDate = new Date(baseDate);
      startDate.setDate(startDate.getDate() + startOffset);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration);

      const plannedQty = Math.floor(Math.random() * 900) + 100;
      let actualQty = 0;
      if (status === 'Completed') {
        actualQty = plannedQty - Math.floor(Math.random() * 20);
      } else if (status === 'In Progress') {
        actualQty = Math.floor(plannedQty * (Math.random() * 0.6 + 0.2));
      }

      const variance = plannedQty > 0 ? ((actualQty - plannedQty) / plannedQty) * 100 : 0;

      result.push({
        id: generateId('pp'),
        planNumber: `PP-${String(2025000 + i).slice(1)}`,
        material: material.code,
        materialDescription: material.desc,
        plannedQuantity: plannedQty,
        actualQuantity: actualQty,
        unit: units[Math.floor(Math.random() * units.length)],
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        workCenter: workCenters[Math.floor(Math.random() * workCenters.length)],
        plant: plants[Math.floor(Math.random() * plants.length)],
        supervisor: supervisors[Math.floor(Math.random() * supervisors.length)],
        efficiency: status === 'Completed' ? Math.floor(Math.random() * 15) + 85 : 0,
        variance: Math.round(variance * 10) / 10,
        notes: Math.random() > 0.5 ? `Production plan for ${material.desc}` : '',
        createdDate: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
      });
    }

    return result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const generateSampleCapacity = (count: number): CapacityEntry[] => {
    const workCenters = [
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
    ];

    const result: CapacityEntry[] = [];
    for (let i = 0; i < count; i++) {
      const wc = workCenters[i % workCenters.length];
      const totalCapacity = 160 + Math.floor(Math.random() * 40);
      const planned = Math.floor(totalCapacity * (0.5 + Math.random() * 0.55));
      const available = totalCapacity - planned;
      const utilization = Math.round((planned / totalCapacity) * 100);
      const efficiency = Math.floor(Math.random() * 20) + 80;

      result.push({
        id: generateId('cap'),
        workCenter: wc.id,
        workCenterName: wc.name,
        totalCapacity,
        planned,
        available,
        utilization,
        efficiency,
        plant: wc.plant,
      });
    }

    return result;
  };

  const generateSampleSchedule = (count: number): ScheduleEntry[] => {
    const shifts = ['Day Shift', 'Night Shift', 'Swing Shift'];
    const materials = ['FG-001', 'FG-002', 'FG-003', 'SF-001', 'ASM-001'];
    const workCenters = ['WC-001', 'WC-002', 'WC-003', 'WC-004', 'WC-005'];
    const statuses: ScheduleEntry['status'][] = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

    const result: ScheduleEntry[] = [];
    const baseDate = new Date('2025-01-06');

    for (let i = 1; i <= count; i++) {
      const dayOffset = Math.floor((i - 1) / 5);
      const date = new Date(baseDate);
      date.setDate(date.getDate() + dayOffset);

      result.push({
        id: generateId('sch'),
        planId: `PP-2025${String(i).padStart(3, '0')}`,
        date: date.toISOString().split('T')[0],
        shift: shifts[Math.floor(Math.random() * shifts.length)],
        workCenter: workCenters[Math.floor(Math.random() * workCenters.length)],
        material: materials[Math.floor(Math.random() * materials.length)],
        quantity: Math.floor(Math.random() * 100) + 10,
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }

    return result;
  };

  const generateSampleForecast = (count: number): ForecastEntry[] => {
    const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'];
    const types = ['Conservative', 'Expected', 'Optimistic'];

    return periods.map((period, i) => ({
      id: generateId('fc'),
      period,
      forecastType: types[i % 3],
      quantity: Math.floor(2000 + Math.random() * 3000 + i * 100),
      confidence: Math.floor(90 - i * 3),
      trend: Math.floor(Math.random() * 20) - 5,
    }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Planned': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'On Hold': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
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
    setEditingPlan(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (plan: ProductionPlan) => {
    setEditingPlan(plan);
    setForm({
      material: plan.material,
      materialDescription: plan.materialDescription,
      plannedQuantity: plan.plannedQuantity,
      unit: plan.unit,
      startDate: plan.startDate,
      endDate: plan.endDate,
      status: plan.status,
      priority: plan.priority,
      workCenter: plan.workCenter,
      plant: plan.plant,
      supervisor: plan.supervisor,
      notes: plan.notes || '',
    });
    setIsDialogOpen(true);
  };

  const openView = (plan: ProductionPlan) => {
    setSelectedPlan(plan);
    setIsViewDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.material.trim()) {
      toast({ title: 'Validation Error', description: 'Material is required.', variant: 'destructive' });
      return;
    }

    if (editingPlan) {
      const updatedPlan: ProductionPlan = {
        ...editingPlan,
        ...form,
        lastModified: new Date().toISOString().split('T')[0],
      };
      upsertEntity(STORAGE_KEY, updatedPlan as any);
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? updatedPlan : p));
      toast({ title: 'Plan Updated', description: `${updatedPlan.planNumber} has been updated.` });
    } else {
      const newPlan: ProductionPlan = {
        id: generateId('pp'),
        planNumber: `PP-${String(2025000 + plans.length + 1).slice(1)}`,
        ...form,
        actualQuantity: 0,
        efficiency: 0,
        variance: 0,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
      };
      upsertEntity(STORAGE_KEY, newPlan as any);
      setPlans(prev => [...prev, newPlan]);
      toast({ title: 'Plan Created', description: `${newPlan.planNumber} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (plan: ProductionPlan) => {
    removeEntity(STORAGE_KEY, plan.id);
    setPlans(prev => prev.filter(p => p.id !== plan.id));
    toast({ title: 'Plan Deleted', description: `${plan.planNumber} has been removed.` });
  };

  const planColumns: EnhancedColumn[] = [
    { key: 'planNumber', header: 'Plan #', sortable: true, searchable: true },
    { key: 'material', header: 'Material', searchable: true },
    { key: 'materialDescription', header: 'Description', searchable: true },
    { key: 'plannedQuantity', header: 'Planned Qty', sortable: true, render: (v: number, row: ProductionPlan) => `${v} ${row.unit}` },
    { key: 'actualQuantity', header: 'Actual Qty', sortable: true, render: (v: number, row: ProductionPlan) => `${v} ${row.unit}` },
    { 
      key: 'variance', 
      header: 'Variance', 
      sortable: true,
      render: (v: number) => (
        <span className={v >= 0 ? 'text-green-600' : 'text-red-600'}>
          {v >= 0 ? '+' : ''}{v}%
        </span>
      )
    },
    { key: 'startDate', header: 'Start Date', sortable: true },
    { key: 'endDate', header: 'End Date', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Planned', value: 'Planned' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' },
        { label: 'On Hold', value: 'On Hold' },
        { label: 'Cancelled', value: 'Cancelled' },
      ],
      render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge>
    },
    { 
      key: 'priority', 
      header: 'Priority',
      filterable: true,
      filterOptions: [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Critical', value: 'Critical' },
      ],
      render: (v: string) => <Badge className={getPriorityColor(v)}>{v}</Badge>
    },
    { key: 'workCenter', header: 'Work Center', searchable: true },
    { key: 'supervisor', header: 'Supervisor', searchable: true },
  ];

  const planActions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: openView, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: openEdit, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: handleDelete, variant: 'ghost' },
  ];

  const capacityColumns: EnhancedColumn[] = [
    { key: 'workCenter', header: 'Work Center', sortable: true },
    { key: 'workCenterName', header: 'Name', searchable: true },
    { key: 'plant', header: 'Plant', filterable: true },
    { key: 'totalCapacity', header: 'Total Capacity (hrs)', sortable: true, render: (v: number) => `${v} h` },
    { key: 'planned', header: 'Planned (hrs)', sortable: true, render: (v: number) => `${v} h` },
    { key: 'available', header: 'Available (hrs)', sortable: true, render: (v: number) => `${v} h` },
    { 
      key: 'utilization', 
      header: 'Utilization %',
      sortable: true,
      render: (v: number) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className={`h-2 rounded-full ${v > 90 ? 'bg-red-500' : v > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(v, 100)}%` }}
            ></div>
          </div>
          <span>{v}%</span>
        </div>
      )
    },
    { key: 'efficiency', header: 'Efficiency %', sortable: true, render: (v: number) => `${v}%` },
  ];

  const scheduleColumns: EnhancedColumn[] = [
    { key: 'date', header: 'Date', sortable: true },
    { key: 'shift', header: 'Shift', filterable: true },
    { key: 'workCenter', header: 'Work Center', searchable: true },
    { key: 'material', header: 'Material', searchable: true },
    { key: 'quantity', header: 'Quantity', sortable: true },
    { key: 'status', header: 'Status', render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
  ];

  const chartData = plans.slice(0, 10).map(p => ({
    name: p.planNumber,
    Planned: p.plannedQuantity,
    Actual: p.actualQuantity,
  }));

  const utilizationData = capacity.slice(0, 10).map(c => ({
    name: c.workCenter,
    Utilization: c.utilization,
    Efficiency: c.efficiency,
  }));

  const forecastData = forecast.map(f => ({
    name: f.period,
    Quantity: f.quantity,
    Confidence: f.confidence,
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
          title="Production Planning"
          description="Manage production plans, capacity planning, and scheduling"
          voiceIntroduction="Welcome to Production Planning. Here you can manage all production planning activities."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Plans</div>
          <div className="text-2xl font-bold">{plans.length}</div>
          <div className="text-sm text-blue-600">All plans</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold">{plans.filter(p => p.status === 'In Progress').length}</div>
          <div className="text-sm text-yellow-600">Active</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold">{plans.filter(p => p.status === 'Completed').length}</div>
          <div className="text-sm text-green-600">This period</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Plan Accuracy</div>
          <div className="text-2xl font-bold">
            {plans.length > 0 
              ? (plans.reduce((s, p) => s + (p.status === 'Completed' ? (100 - Math.abs(p.variance)) : 0), 0) / 
                Math.max(plans.filter(p => p.status === 'Completed').length, 1)).toFixed(1)
              : 0}%
          </div>
          <div className="text-sm text-purple-600">Average</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Production Planning</h2>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-week">Current Week</SelectItem>
              <SelectItem value="next-week">Next Week</SelectItem>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="next-month">Next Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="planning">Production Plans</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="forecasting">Demand Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="planning">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Production Plans
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={planColumns}
                data={plans}
                actions={planActions}
                searchPlaceholder="Search production plans..."
                exportable={true}
                refreshable={true}
                onRefresh={loadData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity">
          <Card>
            <CardHeader>
              <CardTitle>Work Center Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={capacityColumns}
                data={capacity}
                searchPlaceholder="Search work centers..."
                exportable={true}
                refreshable={true}
                onRefresh={loadData}
              />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Capacity Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 120]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Utilization" fill="#3b82f6" name="Utilization %" />
                    <Bar dataKey="Efficiency" fill="#10b981" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Production vs Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Planned" fill="#6366f1" />
                    <Bar dataKey="Actual" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduling">
          <Card>
            <CardHeader>
              <CardTitle>Production Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={scheduleColumns}
                data={schedule}
                searchPlaceholder="Search schedule..."
                exportable={true}
                refreshable={true}
                onRefresh={loadData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting">
          <Card>
            <CardHeader>
              <CardTitle>Demand Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {forecast.slice(0, 3).map((f, i) => (
                  <div key={f.id} className="p-4 border rounded">
                    <div className="text-sm text-muted-foreground">{f.period} Forecast</div>
                    <div className="text-2xl font-bold">{f.quantity.toLocaleString()} units</div>
                    <div className="text-sm text-green-600">{f.confidence}% confidence</div>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Quantity" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Confidence" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Production Plan' : 'Create Production Plan'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Material *</Label>
              <Input value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} placeholder="e.g. FG-001" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.materialDescription} onChange={e => setForm(f => ({ ...f, materialDescription: e.target.value }))} placeholder="Material description" />
            </div>
            <div className="space-y-2">
              <Label>Planned Quantity</Label>
              <Input type="number" value={form.plannedQuantity} onChange={e => setForm(f => ({ ...f, plannedQuantity: Number(e.target.value) }))} />
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
                  <SelectItem value="SET">Set</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ProductionPlan['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as ProductionPlan['priority'] }))}>
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
              <Label>Work Center</Label>
              <Select value={form.workCenter} onValueChange={v => setForm(f => ({ ...f, workCenter: v }))}>
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
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingPlan ? 'Update' : 'Create'} Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Production Plan: {selectedPlan?.planNumber}</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Material</Label><div className="font-medium">{selectedPlan.material}</div></div>
                <div><Label>Description</Label><div>{selectedPlan.materialDescription}</div></div>
                <div><Label>Planned Quantity</Label><div>{selectedPlan.plannedQuantity} {selectedPlan.unit}</div></div>
                <div><Label>Actual Quantity</Label><div>{selectedPlan.actualQuantity} {selectedPlan.unit}</div></div>
                <div><Label>Variance</Label><div className={selectedPlan.variance >= 0 ? 'text-green-600' : 'text-red-600'}>{selectedPlan.variance}%</div></div>
                <div><Label>Status</Label><Badge className={getStatusColor(selectedPlan.status)}>{selectedPlan.status}</Badge></div>
                <div><Label>Priority</Label><Badge className={getPriorityColor(selectedPlan.priority)}>{selectedPlan.priority}</Badge></div>
                <div><Label>Work Center</Label><div>{selectedPlan.workCenter}</div></div>
                <div><Label>Plant</Label><div>{selectedPlan.plant}</div></div>
                <div><Label>Supervisor</Label><div>{selectedPlan.supervisor}</div></div>
                <div><Label>Start Date</Label><div>{selectedPlan.startDate}</div></div>
                <div><Label>End Date</Label><div>{selectedPlan.endDate}</div></div>
                <div><Label>Efficiency</Label><div>{selectedPlan.efficiency}%</div></div>
                <div><Label>Created</Label><div>{selectedPlan.createdDate}</div></div>
              </div>
              {selectedPlan.notes && (
                <div><Label>Notes</Label><div className="mt-1 text-sm bg-muted p-3 rounded">{selectedPlan.notes}</div></div>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setIsViewDialogOpen(false); openEdit(selectedPlan); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductionPlanningPage;
