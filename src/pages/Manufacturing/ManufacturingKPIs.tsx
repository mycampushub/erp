
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import { ArrowLeft, BarChart2, TrendingUp, TrendingDown, Plus, Edit, Eye, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface KPIRecord {
  id: string;
  kpiId: string;
  kpiName: string;
  category: 'Production' | 'Quality' | 'Cost' | 'Time' | 'Delivery';
  value: number;
  target: number;
  unit: string;
  trend: 'Up' | 'Down' | 'Stable';
  trendValue: number;
  period: string;
  workCenter: string;
  status: 'On Track' | 'At Risk' | 'Behind';
  createdDate: string;
  lastModified: string;
}

interface KPIThreshold {
  id: string;
  kpiName: string;
  category: string;
  minValue: number;
  maxValue: number;
  target: number;
  status: string;
  createdDate: string;
  lastModified: string;
}

const STORAGE_KEY_KPIS = 'manufacturing_kpis';
const STORAGE_KEY_THRESHOLDS = 'kpi_thresholds';

const ManufacturingKPIs: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [kpis, setKpis] = useState<KPIRecord[]>([]);
  const [thresholds, setThresholds] = useState<KPIThreshold[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [kpiDialogOpen, setKpiDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPIRecord | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [kpiForm, setKpiForm] = useState<Partial<KPIRecord>>({
    kpiId: '', kpiName: '', category: 'Production', value: 0, target: 0, unit: '%', trend: 'Stable', trendValue: 0, period: '', workCenter: '', status: 'On Track',
  });

  const loadData = () => {
    const storedKpis = listEntities<KPIRecord>(STORAGE_KEY_KPIS);
    if (storedKpis.length === 0) {
      const kpiNames = ['Production Efficiency', 'OEE', 'First Pass Yield', 'Defect Rate', 'Scrap Rate', 'Unit Production Cost', 'Manufacturing Lead Time', 'Cycle Time', 'On-Time Delivery', 'Inventory Turnover'];
      const categories: KPIRecord['category'][] = ['Production', 'Quality', 'Cost', 'Time', 'Delivery'];
      const workCenters = ['WC-001', 'WC-002', 'WC-003', 'WC-004', 'WC-005'];
      const periods = ['May 2025', 'April 2025', 'Q1 2025'];
      const trends: KPIRecord['trend'][] = ['Up', 'Down', 'Stable'];
      const statuses: KPIRecord['status'][] = ['On Track', 'At Risk', 'Behind'];

      const sample: KPIRecord[] = Array.from({ length: 30 }, (_, i) => {
        const target = Math.floor(Math.random() * 20) + 80;
        const value = Math.floor(Math.random() * 30) + 70;
        const trend = trends[Math.floor(Math.random() * trends.length)];
        return {
          id: generateId('KPI'),
          kpiId: `KPI-${String(i + 1).padStart(3, '0')}`,
          kpiName: kpiNames[i % kpiNames.length],
          category: categories[i % categories.length],
          value,
          target,
          unit: '%',
          trend,
          trendValue: parseFloat((Math.random() * 5 - 2.5).toFixed(1)),
          period: periods[i % periods.length],
          workCenter: workCenters[i % workCenters.length],
          status: value >= target ? 'On Track' : value >= target * 0.9 ? 'At Risk' : 'Behind',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_KPIS, o as any));
    }
    setKpis(listEntities<KPIRecord>(STORAGE_KEY_KPIS));

    const storedThresholds = listEntities<KPIThreshold>(STORAGE_KEY_THRESHOLDS);
    if (storedThresholds.length === 0) {
      const kpiNames = ['Production Efficiency', 'OEE', 'First Pass Yield', 'Defect Rate', 'Unit Production Cost'];
      const categories = ['Production', 'Quality', 'Cost'];

      const sample: KPIThreshold[] = kpiNames.map((name, i) => ({
        id: generateId('TH'),
        kpiName: name,
        category: categories[i % categories.length],
        minValue: 70,
        maxValue: 100,
        target: 90,
        status: 'Active',
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      }));
      sample.forEach(o => upsertEntity(STORAGE_KEY_THRESHOLDS, o as any));
    }
    setThresholds(listEntities<KPIThreshold>(STORAGE_KEY_THRESHOLDS));
  };

  useEffect(() => {
    if (isEnabled) {
      speak('You are now viewing Manufacturing KPIs. This page provides key performance indicators for manufacturing operations.');
    }
    loadData();
  }, [isEnabled, speak]);

  const handleSaveKpi = () => {
    const now = new Date().toISOString();
    const newKpi: KPIRecord = {
      id: editingKpi?.id || generateId('KPI'),
      kpiId: editingKpi?.kpiId || `KPI-${String(Date.now()).slice(-3)}`,
      kpiName: kpiForm.kpiName || '',
      category: kpiForm.category || 'Production',
      value: kpiForm.value || 0,
      target: kpiForm.target || 0,
      unit: kpiForm.unit || '%',
      trend: kpiForm.trend || 'Stable',
      trendValue: kpiForm.trendValue || 0,
      period: kpiForm.period || '',
      workCenter: kpiForm.workCenter || '',
      status: kpiForm.status || 'On Track',
      createdDate: editingKpi?.createdDate || now,
      lastModified: now,
    };

    upsertEntity(STORAGE_KEY_KPIS, newKpi as any);
    setKpis(listEntities<KPIRecord>(STORAGE_KEY_KPIS));
    setKpiDialogOpen(false);
    setEditingKpi(null);
    toast({ title: 'Success', description: `KPI ${editingKpi ? 'updated' : 'created'} successfully` });
  };

  const handleDeleteKpi = (id: string) => {
    removeEntity(STORAGE_KEY_KPIS, id);
    setKpis(listEntities<KPIRecord>(STORAGE_KEY_KPIS));
    toast({ title: 'Deleted', description: 'KPI deleted successfully' });
  };

  const openEditKpi = (kpi: KPIRecord) => {
    setEditingKpi(kpi);
    setKpiForm(kpi);
    setKpiDialogOpen(true);
  };

  const openView = (item: any) => {
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const kpiColumns: EnhancedColumn<KPIRecord>[] = [
    { key: 'kpiId', header: 'KPI ID', sortable: true },
    { key: 'kpiName', header: 'KPI Name', sortable: true },
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

  const kpiActions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: any) => openView(row), variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: any) => openEditKpi(row), variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: any) => handleDeleteKpi(row.id), variant: 'ghost' },
  ];

  const productionKpis = kpis.filter(k => k.category === 'Production');
  const qualityKpis = kpis.filter(k => k.category === 'Quality');
  const costKpis = kpis.filter(k => k.category === 'Cost');
  const timeKpis = kpis.filter(k => k.category === 'Time');

  const avgProduction = productionKpis.length > 0 ? productionKpis.reduce((s, k) => s + k.value, 0) / productionKpis.length : 0;
  const avgQuality = qualityKpis.length > 0 ? qualityKpis.reduce((s, k) => s + k.value, 0) / qualityKpis.length : 0;
  const avgCost = costKpis.length > 0 ? costKpis.reduce((s, k) => s + k.value, 0) / costKpis.length : 0;

  const trendData = kpis.slice(0, 10).map((k, i) => ({
    name: k.kpiName.substring(0, 10),
    value: k.value,
    target: k.target,
  }));

  const radarData = [
    { subject: 'Production', A: avgProduction, fullMark: 100 },
    { subject: 'Quality', A: avgQuality, fullMark: 100 },
    { subject: 'Cost', A: avgCost, fullMark: 100 },
    { subject: 'Time', A: timeKpis.length > 0 ? timeKpis.reduce((s, k) => s + k.value, 0) / timeKpis.length : 0, fullMark: 100 },
    { subject: 'Delivery', A: kpis.filter(k => k.category === 'Delivery').length > 0 ? kpis.filter(k => k.category === 'Delivery').reduce((s, k) => s + k.value, 0) / kpis.filter(k => k.category === 'Delivery').length : 0, fullMark: 100 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/manufacturing')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Manufacturing KPIs"
          description="Key performance indicators for manufacturing operations"
          voiceIntroduction="Welcome to Manufacturing KPIs."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-md mr-3">
              <BarChart2 className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">Production Metrics</h2>
          </div>
          <div className="space-y-4">
            {productionKpis.slice(0, 3).map(kpi => (
              <div key={kpi.kpiId}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm text-gray-500">{kpi.kpiName}</h3>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">{kpi.value}%</span>
                    {kpi.trend === 'Up' ? <TrendingUp className="h-4 w-4 text-green-600 ml-1" /> : kpi.trend === 'Down' ? <TrendingDown className="h-4 w-4 text-red-600 ml-1" /> : null}
                  </div>
                </div>
                <div className="h-1 bg-gray-200 w-full mt-1 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${kpi.status === 'On Track' ? 'bg-green-500' : kpi.status === 'At Risk' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${kpi.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-md mr-3">
              <BarChart2 className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold">Quality Metrics</h2>
          </div>
          <div className="space-y-4">
            {qualityKpis.slice(0, 3).map(kpi => (
              <div key={kpi.kpiId}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm text-gray-500">{kpi.kpiName}</h3>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">{kpi.value}%</span>
                    {kpi.trend === 'Up' ? <TrendingUp className="h-4 w-4 text-green-600 ml-1" /> : kpi.trend === 'Down' ? <TrendingDown className="h-4 w-4 text-red-600 ml-1" /> : null}
                  </div>
                </div>
                <div className="h-1 bg-gray-200 w-full mt-1 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${kpi.status === 'On Track' ? 'bg-green-500' : kpi.status === 'At Risk' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${kpi.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-2 rounded-md mr-3">
              <BarChart2 className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold">Cost Metrics</h2>
          </div>
          <div className="space-y-4">
            {costKpis.slice(0, 3).map(kpi => (
              <div key={kpi.kpiId}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm text-gray-500">{kpi.kpiName}</h3>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">${kpi.value}</span>
                    {kpi.trend === 'Up' ? <TrendingUp className="h-4 w-4 text-green-600 ml-1" /> : kpi.trend === 'Down' ? <TrendingDown className="h-4 w-4 text-red-600 ml-1" /> : null}
                  </div>
                </div>
                <div className="h-1 bg-gray-200 w-full mt-1 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${kpi.status === 'On Track' ? 'bg-green-500' : kpi.status === 'At Risk' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${kpi.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All KPIs</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
                <Button size="sm" onClick={() => { setEditingKpi(null); setKpiForm({ kpiId: '', kpiName: '', category: 'Production', value: 0, target: 0, unit: '%', trend: 'Stable', trendValue: 0, period: '', workCenter: '', status: 'On Track' }); setKpiDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add KPI</Button>
              </div>
            </div>
            <EnhancedDataTable columns={kpiColumns} data={kpis} actions={kpiActions} searchPlaceholder="Search KPIs..." exportable refreshable onRefresh={loadData} />
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">KPI Trends & Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">KPI Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="target" stroke="#10B981" strokeWidth={2} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Category Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">KPI Thresholds</h2>
            <div className="space-y-4">
              {thresholds.map(threshold => (
                <div key={threshold.id} className="p-4 border rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{threshold.kpiName}</div>
                      <div className="text-sm text-gray-500">{threshold.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Target: {threshold.target}%</div>
                      <div className="text-xs text-gray-500">Range: {threshold.minValue}% - {threshold.maxValue}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={kpiDialogOpen} onOpenChange={setKpiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingKpi ? 'Edit KPI' : 'Add KPI'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>KPI Name</Label>
              <Input value={kpiForm.kpiName || ''} onChange={e => setKpiForm({ ...kpiForm, kpiName: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={kpiForm.category} onValueChange={value => setKpiForm({ ...kpiForm, category: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Cost">Cost</SelectItem>
                  <SelectItem value="Time">Time</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input type="number" value={kpiForm.value || ''} onChange={e => setKpiForm({ ...kpiForm, value: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Target</Label>
              <Input type="number" value={kpiForm.target || ''} onChange={e => setKpiForm({ ...kpiForm, target: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Work Center</Label>
              <Input value={kpiForm.workCenter || ''} onChange={e => setKpiForm({ ...kpiForm, workCenter: e.target.value })} />
            </div>
            <div>
              <Label>Period</Label>
              <Input value={kpiForm.period || ''} onChange={e => setKpiForm({ ...kpiForm, period: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={kpiForm.status} onValueChange={value => setKpiForm({ ...kpiForm, status: value as any })}>
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
              <Select value={kpiForm.trend} onValueChange={value => setKpiForm({ ...kpiForm, trend: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Up">Up</SelectItem>
                  <SelectItem value="Down">Down</SelectItem>
                  <SelectItem value="Stable">Stable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKpiDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveKpi}>{editingKpi ? 'Update' : 'Create'}</Button>
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

export default ManufacturingKPIs;
