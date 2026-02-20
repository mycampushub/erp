
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import { ArrowLeft, TrendingUp, BarChart2, PieChart, Activity, Plus, Edit, Eye, Trash2, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie as RePie, Cell } from 'recharts';

interface PerformanceMetric {
  id: string;
  metricId: string;
  metricName: string;
  category: 'Efficiency' | 'Quality' | 'Production' | 'Capacity' | 'Cost';
  value: number;
  target: number;
  unit: string;
  period: string;
  workCenter: string;
  trend: 'Improving' | 'Declining' | 'Stable';
  previousValue: number;
  status: 'On Track' | 'At Risk' | 'Behind';
  createdDate: string;
  lastModified: string;
}

interface EfficiencyRecord {
  id: string;
  recordId: string;
  workCenter: string;
  machineEfficiency: number;
  laborEfficiency: number;
  materialEfficiency: number;
  overallEfficiency: number;
  period: string;
  date: string;
  target: number;
  status: 'Green' | 'Yellow' | 'Red';
  createdDate: string;
  lastModified: string;
}

interface CapacityData {
  id: string;
  workCenter: string;
  totalCapacity: number;
  utilizedCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  period: string;
  status: 'Underutilized' | 'Optimal' | 'Overutilized';
  createdDate: string;
  lastModified: string;
}

const STORAGE_KEY_METRICS = 'performance_metrics';
const STORAGE_KEY_EFFICIENCY = 'performance_efficiency';
const STORAGE_KEY_CAPACITY = 'performance_capacity';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const PerformanceAnalytics: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [efficiency, setEfficiency] = useState<EfficiencyRecord[]>([]);
  const [capacity, setCapacity] = useState<CapacityData[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<PerformanceMetric | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [metricForm, setMetricForm] = useState<Partial<PerformanceMetric>>({
    metricId: '', metricName: '', category: 'Efficiency', value: 0, target: 0, unit: '%', period: '', workCenter: '', trend: 'Stable', previousValue: 0, status: 'On Track',
  });

  const loadData = () => {
    const storedMetrics = listEntities<PerformanceMetric>(STORAGE_KEY_METRICS);
    if (storedMetrics.length === 0) {
      const metricNames = ['Overall Equipment Effectiveness', 'First Pass Yield', 'Defect Rate', 'Scrap Rate', 'Rework Rate', 'Machine Uptime', 'Labor Productivity', 'Cycle Time', 'Inventory Turnover', 'Capacity Utilization'];
      const categories: PerformanceMetric['category'][] = ['Efficiency', 'Quality', 'Production', 'Capacity', 'Cost'];
      const workCenters = ['WC-001', 'WC-002', 'WC-003', 'WC-004', 'WC-005'];
      const periods = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
      const trends: PerformanceMetric['trend'][] = ['Improving', 'Declining', 'Stable'];
      const statuses: PerformanceMetric['status'][] = ['On Track', 'At Risk', 'Behind'];

      const sample: PerformanceMetric[] = Array.from({ length: 30 }, (_, i) => {
        const target = Math.floor(Math.random() * 20) + 80;
        const value = Math.floor(Math.random() * 30) + 70;
        return {
          id: generateId('PM'),
          metricId: `PM-${String(i + 1).padStart(3, '0')}`,
          metricName: metricNames[i % metricNames.length],
          category: categories[i % categories.length],
          value,
          target,
          unit: '%',
          period: periods[i % periods.length],
          workCenter: workCenters[i % workCenters.length],
          trend: trends[Math.floor(Math.random() * trends.length)],
          previousValue: Math.floor(Math.random() * 30) + 70,
          status: value >= target ? 'On Track' : value >= target * 0.9 ? 'At Risk' : 'Behind',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_METRICS, o as any));
    }
    setMetrics(listEntities<PerformanceMetric>(STORAGE_KEY_METRICS));

    const storedEfficiency = listEntities<EfficiencyRecord>(STORAGE_KEY_EFFICIENCY);
    if (storedEfficiency.length === 0) {
      const workCenters = ['Assembly Line 1', 'Assembly Line 2', 'Quality Control', 'Packaging', 'Material Handling'];
      const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

      const sample: EfficiencyRecord[] = Array.from({ length: 30 }, (_, i) => {
        const machineEff = Math.floor(Math.random() * 20) + 80;
        const laborEff = Math.floor(Math.random() * 20) + 80;
        const materialEff = Math.floor(Math.random() * 15) + 85;
        const overall = Math.floor((machineEff + laborEff + materialEff) / 3);
        return {
          id: generateId('ER'),
          recordId: `ER-${String(i + 1).padStart(3, '0')}`,
          workCenter: workCenters[i % workCenters.length],
          machineEfficiency: machineEff,
          laborEfficiency: laborEff,
          materialEfficiency: materialEff,
          overallEfficiency: overall,
          period: periods[i % periods.length],
          date: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          target: 90,
          status: overall >= 90 ? 'Green' : overall >= 85 ? 'Yellow' : 'Red',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_EFFICIENCY, o as any));
    }
    setEfficiency(listEntities<EfficiencyRecord>(STORAGE_KEY_EFFICIENCY));

    const storedCapacity = listEntities<CapacityData>(STORAGE_KEY_CAPACITY);
    if (storedCapacity.length === 0) {
      const workCenters = ['Assembly Line 1', 'Assembly Line 2', 'Quality Control', 'Packaging', 'Material Handling'];

      const sample: CapacityData[] = workCenters.map((wc, i) => {
        const total = 160;
        const utilized = Math.floor(Math.random() * 60) + 100;
        return {
          id: generateId('CD'),
          workCenter: wc,
          totalCapacity: total,
          utilizedCapacity: utilized,
          availableCapacity: total - utilized,
          utilizationRate: parseFloat((utilized / total * 100).toFixed(1)),
          period: 'Q1 2025',
          status: utilized / total < 0.7 ? 'Underutilized' : utilized / total > 0.9 ? 'Overutilized' : 'Optimal',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_CAPACITY, o as any));
    }
    setCapacity(listEntities<CapacityData>(STORAGE_KEY_CAPACITY));
  };

  useEffect(() => {
    if (isEnabled) {
      speak('You are now in Performance Analytics. Here you can analyze manufacturing performance, efficiency, and KPIs.');
    }
    loadData();
  }, [isEnabled, speak]);

  const handleSaveMetric = () => {
    const now = new Date().toISOString();
    const newMetric: PerformanceMetric = {
      id: editingMetric?.id || generateId('PM'),
      metricId: editingMetric?.metricId || `PM-${String(Date.now()).slice(-3)}`,
      metricName: metricForm.metricName || '',
      category: metricForm.category || 'Efficiency',
      value: metricForm.value || 0,
      target: metricForm.target || 0,
      unit: metricForm.unit || '%',
      period: metricForm.period || '',
      workCenter: metricForm.workCenter || '',
      trend: metricForm.trend || 'Stable',
      previousValue: metricForm.previousValue || 0,
      status: metricForm.status || 'On Track',
      createdDate: editingMetric?.createdDate || now,
      lastModified: now,
    };

    upsertEntity(STORAGE_KEY_METRICS, newMetric as any);
    setMetrics(listEntities<PerformanceMetric>(STORAGE_KEY_METRICS));
    setMetricDialogOpen(false);
    setEditingMetric(null);
    toast({ title: 'Success', description: `Metric ${editingMetric ? 'updated' : 'created'} successfully` });
  };

  const handleDeleteMetric = (id: string) => {
    removeEntity(STORAGE_KEY_METRICS, id);
    setMetrics(listEntities<PerformanceMetric>(STORAGE_KEY_METRICS));
    toast({ title: 'Deleted', description: 'Metric deleted successfully' });
  };

  const openEditMetric = (metric: PerformanceMetric) => {
    setEditingMetric(metric);
    setMetricForm(metric);
    setMetricDialogOpen(true);
  };

  const openView = (item: any) => {
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const metricColumns: EnhancedColumn<PerformanceMetric>[] = [
    { key: 'metricId', header: 'Metric ID', sortable: true },
    { key: 'metricName', header: 'Metric Name', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'value', header: 'Value', sortable: true },
    { key: 'target', header: 'Target', sortable: true },
    { key: 'workCenter', header: 'Work Center', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'On Track': 'bg-green-100 text-green-800',
          'At Risk': 'bg-yellow-100 text-yellow-800',
          'Behind': 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
  ];

  const metricActions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: any) => openView(row), variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: any) => openEditMetric(row), variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: any) => handleDeleteMetric(row.id), variant: 'ghost' },
  ];

  const overallEfficiency = efficiency.length > 0 ? efficiency.reduce((s, e) => s + e.overallEfficiency, 0) / efficiency.length : 0;
  const productionVolume = metrics.filter(m => m.category === 'Production').reduce((s, m) => s + m.value, 0);
  const qualityRate = metrics.filter(m => m.metricName === 'First Pass Yield').reduce((s, m) => s + m.value, 0) / (metrics.filter(m => m.metricName === 'First Pass Yield').length || 1);
  const machineUptime = metrics.filter(m => m.metricName === 'Machine Uptime').reduce((s, m) => s + m.value, 0) / (metrics.filter(m => m.metricName === 'Machine Uptime').length || 1);

  const workCenterEfficiency = efficiency.slice(0, 6).map(e => ({
    name: e.workCenter,
    efficiency: e.overallEfficiency,
  }));

  const trendData = metrics.slice(0, 10).map((m, i) => ({
    period: `P${i + 1}`,
    value: m.value,
    target: m.target,
  }));

  const categoryData = [
    { name: 'Efficiency', value: metrics.filter(m => m.category === 'Efficiency').length },
    { name: 'Quality', value: metrics.filter(m => m.category === 'Quality').length },
    { name: 'Production', value: metrics.filter(m => m.category === 'Production').length },
    { name: 'Capacity', value: metrics.filter(m => m.category === 'Capacity').length },
    { name: 'Cost', value: metrics.filter(m => m.category === 'Cost').length },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/manufacturing')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Performance Analytics"
          description="Analyze manufacturing performance, efficiency metrics, and KPIs"
          voiceIntroduction="Welcome to Performance Analytics."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Overall Efficiency</div>
              <div className="text-2xl font-bold">{overallEfficiency.toFixed(1)}%</div>
              <div className="text-sm text-green-600">↑ 1.2%</div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Production Volume</div>
              <div className="text-2xl font-bold">{(productionVolume / 100).toFixed(1)}K</div>
              <div className="text-sm text-blue-600">units/month</div>
            </div>
            <BarChart2 className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Quality Rate</div>
              <div className="text-2xl font-bold">{qualityRate.toFixed(1)}%</div>
              <div className="text-sm text-green-600">↑ 0.3%</div>
            </div>
            <PieChart className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Machine Uptime</div>
              <div className="text-2xl font-bold">{machineUptime.toFixed(1)}%</div>
              <div className="text-sm text-green-600">Target: 95%</div>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div></div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button size="sm" onClick={() => { setEditingMetric(null); setMetricForm({ metricId: '', metricName: '', category: 'Efficiency', value: 0, target: 0, unit: '%', period: '', workCenter: '', trend: 'Stable', previousValue: 0, status: 'On Track' }); setMetricDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Metric</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Analysis</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="target" stroke="#3B82F6" strokeWidth={2} name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Efficiency by Work Center</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={workCenterEfficiency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="efficiency" fill="#3B82F6" name="Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-6 col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Performance Metrics</h3>
                <Button size="sm" onClick={() => { setEditingMetric(null); setMetricForm({ metricId: '', metricName: '', category: 'Efficiency', value: 0, target: 0, unit: '%', period: '', workCenter: '', trend: 'Stable', previousValue: 0, status: 'On Track' }); setMetricDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Metric</Button>
              </div>
              <EnhancedDataTable columns={metricColumns} data={metrics} actions={metricActions} searchPlaceholder="Search metrics..." exportable refreshable onRefresh={loadData} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Efficiency Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Machine Efficiency</h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">{(efficiency.length > 0 ? efficiency.reduce((s, e) => s + e.machineEfficiency, 0) / efficiency.length : 0).toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Average across all machines</div>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Labor Efficiency</h4>
                <div className="text-3xl font-bold text-green-600 mb-2">{(efficiency.length > 0 ? efficiency.reduce((s, e) => s + e.laborEfficiency, 0) / efficiency.length : 0).toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Productivity index</div>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Material Efficiency</h4>
                <div className="text-3xl font-bold text-purple-600 mb-2">{(efficiency.length > 0 ? efficiency.reduce((s, e) => s + e.materialEfficiency, 0) / efficiency.length : 0).toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Material utilization rate</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {metrics.filter(m => m.category === 'Quality').slice(0, 4).map(m => (
                  <div key={m.metricId} className="p-4 border rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{m.metricName}</span>
                      <span className="text-lg font-bold">{m.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${m.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Category Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RePieChart>
                    <RePie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={60} fill="#8884d8" dataKey="value">
                      {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </RePie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="capacity">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Capacity Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Capacity Utilization by Work Center</h4>
                {capacity.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">{c.workCenter}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div className={`h-2 rounded-full ${c.status === 'Overutilized' ? 'bg-red-500' : c.status === 'Underutilized' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${c.utilizationRate}%` }}></div>
                      </div>
                      <span className="text-sm">{c.utilizationRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Capacity Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Capacity</span>
                    <span className="font-medium">{capacity.reduce((s, c) => s + c.totalCapacity, 0)} hrs/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Utilized Capacity</span>
                    <span className="font-medium">{capacity.reduce((s, c) => s + c.utilizedCapacity, 0)} hrs/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Available Capacity</span>
                    <span className="font-medium">{capacity.reduce((s, c) => s + c.availableCapacity, 0)} hrs/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Utilization Rate</span>
                    <span className="font-medium text-blue-600">{capacity.length > 0 ? (capacity.reduce((s, c) => s + c.utilizationRate, 0) / capacity.length).toFixed(1) : 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={metricDialogOpen} onOpenChange={setMetricDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMetric ? 'Edit Metric' : 'Add Metric'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Metric Name</Label>
              <Input value={metricForm.metricName || ''} onChange={e => setMetricForm({ ...metricForm, metricName: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={metricForm.category} onValueChange={value => setMetricForm({ ...metricForm, category: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Efficiency">Efficiency</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Capacity">Capacity</SelectItem>
                  <SelectItem value="Cost">Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input type="number" value={metricForm.value || ''} onChange={e => setMetricForm({ ...metricForm, value: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Target</Label>
              <Input type="number" value={metricForm.target || ''} onChange={e => setMetricForm({ ...metricForm, target: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Work Center</Label>
              <Input value={metricForm.workCenter || ''} onChange={e => setMetricForm({ ...metricForm, workCenter: e.target.value })} />
            </div>
            <div>
              <Label>Period</Label>
              <Input value={metricForm.period || ''} onChange={e => setMetricForm({ ...metricForm, period: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={metricForm.status} onValueChange={value => setMetricForm({ ...metricForm, status: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Behind">Behind</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trend</Label>
              <Select value={metricForm.trend} onValueChange={value => setMetricForm({ ...metricForm, trend: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Improving">Improving</SelectItem>
                  <SelectItem value="Stable">Stable</SelectItem>
                  <SelectItem value="Declining">Declining</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMetricDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMetric}>{editingMetric ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(viewingItem).filter(([key]) => !['id', 'createdDate', 'lastModified'].includes(key)).map(([key, value]) => (
                <div key={key}>
                  <Label className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  <div className="text-sm">{String(value) || '-'}</div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceAnalytics;
