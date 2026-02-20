
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import { ArrowLeft, BarChart2, Download, FileText, Filter, Search, Plus, Edit, Eye, Trash2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

interface QualityIncident {
  id: string;
  incidentId: string;
  product: string;
  productLine: string;
  defectType: string;
  incidentDate: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  quantityAffected: number;
  rootCause: string;
  correctiveAction: string;
  resolutionDate: string;
  costImpact: number;
  assignedTo: string;
  notes?: string;
  createdDate: string;
  lastModified: string;
}

interface DefectRecord {
  id: string;
  recordId: string;
  category: string;
  subCategory: string;
  count: number;
  percentage: number;
  trend: 'Up' | 'Down' | 'Stable';
  trendValue: number;
  location: string;
  shift: 'Day' | 'Night' | 'Weekend';
  operator: string;
  equipment: string;
  createdDate: string;
  lastModified: string;
}

interface QualityMetric {
  id: string;
  metricId: string;
  metricName: string;
  period: string;
  value: number;
  target: number;
  previousValue: number;
  unit: string;
  category: 'Defect Rate' | 'First Pass Yield' | 'Customer Returns' | 'Scrap Rate';
  trend: 'Improving' | 'Declining' | 'Stable';
  createdDate: string;
  lastModified: string;
}

interface QualityCost {
  id: string;
  costId: string;
  costType: 'Prevention' | 'Appraisal' | 'Internal Failure' | 'External Failure';
  category: string;
  amount: number;
  budget: number;
  period: string;
  department: string;
  description: string;
  status: 'On Budget' | 'Over Budget' | 'Under Budget';
  createdDate: string;
  lastModified: string;
}

const STORAGE_KEY_INCIDENTS = 'quality_incidents';
const STORAGE_KEY_DEFECTS = 'quality_defects';
const STORAGE_KEY_METRICS = 'quality_metrics';
const STORAGE_KEY_COSTS = 'quality_costs';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const QualityAnalysis: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [incidents, setIncidents] = useState<QualityIncident[]>([]);
  const [defects, setDefects] = useState<DefectRecord[]>([]);
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [costs, setCosts] = useState<QualityCost[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [defectDialogOpen, setDefectDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<QualityIncident | null>(null);
  const [editingDefect, setEditingDefect] = useState<DefectRecord | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [incidentForm, setIncidentForm] = useState<Partial<QualityIncident>>({
    incidentId: '', product: '', productLine: '', defectType: '', incidentDate: '',
    status: 'Open', impact: 'Medium', quantityAffected: 0, rootCause: '', correctiveAction: '',
    resolutionDate: '', costImpact: 0, assignedTo: '', notes: '',
  });

  const [defectForm, setDefectForm] = useState<Partial<DefectRecord>>({
    recordId: '', category: '', subCategory: '', count: 0, percentage: 0,
    trend: 'Stable', trendValue: 0, location: '', shift: 'Day', operator: '', equipment: '',
  });

  const loadData = () => {
    const storedIncidents = listEntities<QualityIncident>(STORAGE_KEY_INCIDENTS);
    if (storedIncidents.length === 0) {
      const products = ['Widget A', 'Widget B', 'Widget C', 'Component X', 'Assembly Y', 'Part Z'];
      const productLines = ['Product Line A', 'Product Line B', 'Product Line C', 'Product Line D'];
      const defectTypes = ['Dimensional Variance', 'Surface Finish', 'Material Defect', 'Assembly Error', 'Electrical Failure', 'Packaging Issue'];
      const statuses: QualityIncident['status'][] = ['Open', 'In Progress', 'Resolved', 'Closed'];
      const impacts: QualityIncident['impact'][] = ['Low', 'Medium', 'High', 'Critical'];
      const rootCauses = ['Equipment Malfunction', 'Material Defect', 'Human Error', 'Process Variation', 'Environmental Condition'];
      const assignees = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'Quality Team'];

      const sample: QualityIncident[] = Array.from({ length: 30 }, (_, i) => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        return {
          id: generateId('QI'),
          incidentId: `QI-2025-${String(i + 1).padStart(3, '0')}`,
          product: products[Math.floor(Math.random() * products.length)],
          productLine: productLines[Math.floor(Math.random() * productLines.length)],
          defectType: defectTypes[Math.floor(Math.random() * defectTypes.length)],
          incidentDate: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          status,
          impact: impacts[Math.floor(Math.random() * impacts.length)],
          quantityAffected: Math.floor(Math.random() * 100) + 1,
          rootCause: rootCauses[Math.floor(Math.random() * rootCauses.length)],
          correctiveAction: 'Corrective action implemented',
          resolutionDate: status === 'Resolved' || status === 'Closed' ? new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] : '',
          costImpact: Math.floor(Math.random() * 5000) + 100,
          assignedTo: assignees[Math.floor(Math.random() * assignees.length)],
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_INCIDENTS, o as any));
    }
    setIncidents(listEntities<QualityIncident>(STORAGE_KEY_INCIDENTS));

    const storedDefects = listEntities<DefectRecord>(STORAGE_KEY_DEFECTS);
    if (storedDefects.length === 0) {
      const categories = ['Dimensional Variance', 'Surface Finish', 'Assembly Error', 'Material Defect', 'Electrical Failure', 'Packaging'];
      const locations = ['Production Line 1', 'Production Line 2', 'Assembly Area', 'Quality Lab', 'Packaging'];
      const shifts: DefectRecord['shift'][] = ['Day', 'Night', 'Weekend'];
      const trends: DefectRecord['trend'][] = ['Up', 'Down', 'Stable'];

      const sample: DefectRecord[] = Array.from({ length: 30 }, (_, i) => {
        const count = Math.floor(Math.random() * 150) + 10;
        return {
          id: generateId('DEF'),
          recordId: `DEF-2025-${String(i + 1).padStart(3, '0')}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          subCategory: `Sub-type ${i + 1}`,
          count,
          percentage: parseFloat((count / 400 * 100).toFixed(1)),
          trend: trends[Math.floor(Math.random() * trends.length)],
          trendValue: parseFloat((Math.random() * 5 - 2.5).toFixed(1)),
          location: locations[Math.floor(Math.random() * locations.length)],
          shift: shifts[Math.floor(Math.random() * shifts.length)],
          operator: `Operator ${Math.floor(Math.random() * 20) + 1}`,
          equipment: `EQ-${Math.floor(Math.random() * 10) + 1}`,
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_DEFECTS, o as any));
    }
    setDefects(listEntities<DefectRecord>(STORAGE_KEY_DEFECTS));

    const storedMetrics = listEntities<QualityMetric>(STORAGE_KEY_METRICS);
    if (storedMetrics.length === 0) {
      const metricNames = ['First Pass Yield', 'Defect Rate', 'Customer Returns', 'Scrap Rate', 'Rework Rate', 'COPQ'];
      const periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const categories: QualityMetric['category'][] = ['Defect Rate', 'First Pass Yield', 'Customer Returns', 'Scrap Rate'];

      const sample: QualityMetric[] = [];
      metricNames.forEach((name, idx) => {
        periods.forEach((period, pIdx) => {
          sample.push({
            id: generateId('QM'),
            metricId: `QM-${idx}-${pIdx}`,
            metricName: name,
            period,
            value: parseFloat((Math.random() * 20 + 80).toFixed(1)),
            target: parseFloat((Math.random() * 10 + 90).toFixed(1)),
            previousValue: parseFloat((Math.random() * 20 + 80).toFixed(1)),
            unit: '%',
            category: categories[idx % categories.length],
            trend: ['Improving', 'Declining', 'Stable'][Math.floor(Math.random() * 3)] as any,
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          });
        });
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_METRICS, o as any));
    }
    setMetrics(listEntities<QualityMetric>(STORAGE_KEY_METRICS));

    const storedCosts = listEntities<QualityCost>(STORAGE_KEY_COSTS);
    if (storedCosts.length === 0) {
      const costTypes: QualityCost['costType'][] = ['Prevention', 'Appraisal', 'Internal Failure', 'External Failure'];
      const departments = ['Production', 'Quality', 'Engineering', 'Operations', 'R&D'];

      const sample: QualityCost[] = Array.from({ length: 30 }, (_, i) => {
        const budget = Math.floor(Math.random() * 20000) + 5000;
        const amount = Math.floor(Math.random() * budget * 1.2);
        let status: QualityCost['status'] = 'On Budget';
        if (amount > budget) status = 'Over Budget';
        else if (amount < budget * 0.8) status = 'Under Budget';

        return {
          id: generateId('QC'),
          costId: `QC-2025-${String(i + 1).padStart(3, '0')}`,
          costType: costTypes[Math.floor(Math.random() * costTypes.length)],
          category: `Category ${Math.floor(Math.random() * 5) + 1}`,
          amount,
          budget,
          period: `Q${Math.floor(Math.random() * 4) + 1} 2025`,
          department: departments[Math.floor(Math.random() * departments.length)],
          description: `Quality cost for period`,
          status,
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_COSTS, o as any));
    }
    setCosts(listEntities<QualityCost>(STORAGE_KEY_COSTS));
  };

  useEffect(() => {
    if (isEnabled) {
      speak('You are now viewing Quality Analysis. This page helps you analyze quality metrics and identify improvement opportunities.');
    }
    loadData();
  }, [isEnabled, speak]);

  const handleSaveIncident = () => {
    const now = new Date().toISOString();
    const newIncident: QualityIncident = {
      id: editingIncident?.id || generateId('QI'),
      incidentId: editingIncident?.incidentId || `QI-2025-${String(Date.now()).slice(-3)}`,
      product: incidentForm.product || '',
      productLine: incidentForm.productLine || '',
      defectType: incidentForm.defectType || '',
      incidentDate: incidentForm.incidentDate || now.split('T')[0],
      status: incidentForm.status || 'Open',
      impact: incidentForm.impact || 'Medium',
      quantityAffected: incidentForm.quantityAffected || 0,
      rootCause: incidentForm.rootCause || '',
      correctiveAction: incidentForm.correctiveAction || '',
      resolutionDate: incidentForm.resolutionDate || '',
      costImpact: incidentForm.costImpact || 0,
      assignedTo: incidentForm.assignedTo || '',
      notes: incidentForm.notes,
      createdDate: editingIncident?.createdDate || now,
      lastModified: now,
    };

    upsertEntity(STORAGE_KEY_INCIDENTS, newIncident as any);
    setIncidents(listEntities<QualityIncident>(STORAGE_KEY_INCIDENTS));
    setIncidentDialogOpen(false);
    setEditingIncident(null);
    toast({ title: 'Success', description: `Incident ${editingIncident ? 'updated' : 'created'} successfully` });
  };

  const handleDeleteIncident = (id: string) => {
    removeEntity(STORAGE_KEY_INCIDENTS, id);
    setIncidents(listEntities<QualityIncident>(STORAGE_KEY_INCIDENTS));
    toast({ title: 'Deleted', description: 'Incident deleted successfully' });
  };

  const incidentColumns: EnhancedColumn<QualityIncident>[] = [
    { key: 'incidentId', header: 'Incident ID', sortable: true },
    { key: 'product', header: 'Product', sortable: true },
    { key: 'productLine', header: 'Product Line', sortable: true },
    { key: 'defectType', header: 'Type', sortable: true },
    { key: 'incidentDate', header: 'Date', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Open': 'bg-red-100 text-red-800',
          'In Progress': 'bg-yellow-100 text-yellow-800',
          'Resolved': 'bg-green-100 text-green-800',
          'Closed': 'bg-gray-100 text-gray-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
    {
      key: 'impact',
      header: 'Impact',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Low': 'bg-green-100 text-green-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'High': 'bg-orange-100 text-orange-800',
          'Critical': 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
  ];

  const defectColumns: EnhancedColumn<DefectRecord>[] = [
    { key: 'recordId', header: 'Record ID', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'count', header: 'Count', sortable: true },
    { key: 'percentage', header: '%', sortable: true },
    { key: 'location', header: 'Location', sortable: true },
    { key: 'shift', header: 'Shift', sortable: true },
    {
      key: 'trend',
      header: 'Trend',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Up': 'bg-red-100 text-red-800',
          'Down': 'bg-green-100 text-green-800',
          'Stable': 'bg-gray-100 text-gray-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
  ];

  const incidentActions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: any) => { setViewingItem(row); setViewDialogOpen(true); }, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: any) => { setEditingIncident(row); setIncidentForm(row); setIncidentDialogOpen(true); }, variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: any) => handleDeleteIncident(row.id), variant: 'ghost' },
  ];

  const overallRating = (incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length / incidents.length * 100) || 0;
  const defectRate = defects.length > 0 ? (defects.reduce((sum, d) => sum + d.count, 0) / 1000 * 100) : 0;
  const openIncidents = incidents.filter(i => i.status === 'Open' || i.status === 'In Progress').length;
  const totalCost = costs.reduce((sum, c) => sum + c.amount, 0);

  const statusData = [
    { name: 'Open', value: incidents.filter(i => i.status === 'Open').length },
    { name: 'In Progress', value: incidents.filter(i => i.status === 'In Progress').length },
    { name: 'Resolved', value: incidents.filter(i => i.status === 'Resolved').length },
    { name: 'Closed', value: incidents.filter(i => i.status === 'Closed').length },
  ];

  const categoryData = [
    { name: 'Dimensional', value: defects.filter(d => d.category === 'Dimensional Variance').length },
    { name: 'Surface', value: defects.filter(d => d.category === 'Surface Finish').length },
    { name: 'Assembly', value: defects.filter(d => d.category === 'Assembly Error').length },
    { name: 'Material', value: defects.filter(d => d.category === 'Material Defect').length },
    { name: 'Electrical', value: defects.filter(d => d.category === 'Electrical Failure').length },
    { name: 'Other', value: defects.filter(d => d.category === 'Packaging').length },
  ];

  const trendData = metrics.filter(m => m.period).slice(0, 12).map(m => ({
    period: m.period,
    value: m.value,
    target: m.target,
  }));

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/manufacturing')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Quality Analysis"
          description="Analyze quality metrics and identify improvement opportunities"
          voiceIntroduction="Welcome to Quality Analysis. Here you can analyze quality performance and identify areas for improvement."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Overall Quality Rating</h3>
          <div className="text-3xl font-semibold mb-2">{overallRating.toFixed(1)}%</div>
          <div className="flex items-center">
            <span className="text-green-500 text-sm font-medium">↑ 0.8%</span>
            <span className="text-xs text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Defect Rate</h3>
          <div className="text-3xl font-semibold mb-2">{defectRate.toFixed(1)}%</div>
          <div className="flex items-center">
            <span className="text-green-500 text-sm font-medium">↓ 0.5%</span>
            <span className="text-xs text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Quality Incidents</h3>
          <div className="text-3xl font-semibold mb-2">{openIncidents}</div>
          <div className="flex items-center">
            <span className="text-green-500 text-sm font-medium">↓ 3</span>
            <span className="text-xs text-gray-500 ml-2">vs last month</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Quality Cost</h3>
          <div className="text-3xl font-semibold mb-2">${(totalCost / 1000).toFixed(1)}K</div>
          <div className="flex items-center">
            <span className="text-red-500 text-sm font-medium">↑ 4.5%</span>
            <span className="text-xs text-gray-500 ml-2">vs budget</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Quality Analysis</h2>
          <p className="text-sm text-gray-500">Last 30 days</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center"><Filter className="h-4 w-4 mr-2" />Filter</Button>
          <Button variant="outline" size="sm" className="flex items-center"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="defects">Defect Analysis</TabsTrigger>
          <TabsTrigger value="trends">Quality Trends</TabsTrigger>
          <TabsTrigger value="costs">Quality Costs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Quality by Product Line</h3>
                <div className="space-y-4">
                  {['Product Line A', 'Product Line B', 'Product Line C', 'Product Line D'].map((line, idx) => {
                    const rate = [97.8, 94.2, 89.6, 96.5][idx];
                    return (
                      <div key={line}>
                        <div className="flex justify-between mb-1">
                          <span>{line}</span>
                          <span className="font-medium">{rate}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${rate >= 95 ? 'bg-green-500' : rate >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Quality Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData.length > 0 ? trendData : [{ period: 'N/A', value: 0, target: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="target" stroke="#3B82F6" strokeWidth={2} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Quality Incidents</h3>
                <Button size="sm" onClick={() => { setEditingIncident(null); setIncidentForm({ incidentId: '', product: '', productLine: '', defectType: '', incidentDate: '', status: 'Open', impact: 'Medium', quantityAffected: 0, rootCause: '', correctiveAction: '', resolutionDate: '', costImpact: 0, assignedTo: '', notes: '' }); setIncidentDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Incident</Button>
              </div>
              <EnhancedDataTable columns={incidentColumns} data={incidents} actions={incidentActions} searchPlaceholder="Search incidents..." exportable refreshable onRefresh={loadData} />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="defects">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Defect Analysis</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex items-center"><Search className="h-4 w-4 mr-2" />Search</Button>
                <Button variant="outline" size="sm" className="flex items-center"><FileText className="h-4 w-4 mr-2" />Report</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Defect Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Defect Count by Category</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-medium mb-3">Defect Records</h4>
              <EnhancedDataTable columns={defectColumns} data={defects} searchPlaceholder="Search defects..." exportable refreshable onRefresh={loadData} />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quality Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Quality Metrics Over Time</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={trendData.length > 0 ? trendData : [{ period: 'N/A', value: 0, target: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="target" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Metric Breakdown</h4>
                <div className="space-y-3">
                  {metrics.slice(0, 6).map(m => (
                    <div key={m.metricId} className="flex justify-between items-center">
                      <span className="text-sm">{m.metricName}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.value}%</span>
                        <span className={`text-xs ${m.trend === 'Improving' ? 'text-green-600' : m.trend === 'Declining' ? 'text-red-600' : 'text-gray-600'}`}>{m.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="costs">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quality Costs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Cost Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Prevention', value: costs.filter(c => c.costType === 'Prevention').reduce((s, c) => s + c.amount, 0) },
                      { name: 'Appraisal', value: costs.filter(c => c.costType === 'Appraisal').reduce((s, c) => s + c.amount, 0) },
                      { name: 'Internal Failure', value: costs.filter(c => c.costType === 'Internal Failure').reduce((s, c) => s + c.amount, 0) },
                      { name: 'External Failure', value: costs.filter(c => c.costType === 'External Failure').reduce((s, c) => s + c.amount, 0) },
                    ]} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {COLORS.map((color, index) => (<Cell key={`cell-${index}`} fill={color} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-medium mb-3">Budget vs Actual</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: 'Prevention', budget: costs.filter(c => c.costType === 'Prevention').reduce((s, c) => s + c.budget, 0), actual: costs.filter(c => c.costType === 'Prevention').reduce((s, c) => s + c.amount, 0) },
                    { name: 'Appraisal', budget: costs.filter(c => c.costType === 'Appraisal').reduce((s, c) => s + c.budget, 0), actual: costs.filter(c => c.costType === 'Appraisal').reduce((s, c) => s + c.amount, 0) },
                    { name: 'Internal', budget: costs.filter(c => c.costType === 'Internal Failure').reduce((s, c) => s + c.budget, 0), actual: costs.filter(c => c.costType === 'Internal Failure').reduce((s, c) => s + c.amount, 0) },
                    { name: 'External', budget: costs.filter(c => c.costType === 'External Failure').reduce((s, c) => s + c.budget, 0), actual: costs.filter(c => c.costType === 'External Failure').reduce((s, c) => s + c.amount, 0) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                    <Bar dataKey="actual" fill="#10B981" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingIncident ? 'Edit Incident' : 'Add Incident'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Incident ID</Label>
              <Input value={incidentForm.incidentId || ''} onChange={e => setIncidentForm({ ...incidentForm, incidentId: e.target.value })} />
            </div>
            <div>
              <Label>Product</Label>
              <Input value={incidentForm.product || ''} onChange={e => setIncidentForm({ ...incidentForm, product: e.target.value })} />
            </div>
            <div>
              <Label>Product Line</Label>
              <Input value={incidentForm.productLine || ''} onChange={e => setIncidentForm({ ...incidentForm, productLine: e.target.value })} />
            </div>
            <div>
              <Label>Defect Type</Label>
              <Input value={incidentForm.defectType || ''} onChange={e => setIncidentForm({ ...incidentForm, defectType: e.target.value })} />
            </div>
            <div>
              <Label>Incident Date</Label>
              <Input type="date" value={incidentForm.incidentDate || ''} onChange={e => setIncidentForm({ ...incidentForm, incidentDate: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={incidentForm.status} onValueChange={value => setIncidentForm({ ...incidentForm, status: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Impact</Label>
              <Select value={incidentForm.impact} onValueChange={value => setIncidentForm({ ...incidentForm, impact: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity Affected</Label>
              <Input type="number" value={incidentForm.quantityAffected || ''} onChange={e => setIncidentForm({ ...incidentForm, quantityAffected: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Cost Impact</Label>
              <Input type="number" value={incidentForm.costImpact || ''} onChange={e => setIncidentForm({ ...incidentForm, costImpact: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input value={incidentForm.assignedTo || ''} onChange={e => setIncidentForm({ ...incidentForm, assignedTo: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Root Cause</Label>
              <Textarea value={incidentForm.rootCause || ''} onChange={e => setIncidentForm({ ...incidentForm, rootCause: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Corrective Action</Label>
              <Textarea value={incidentForm.correctiveAction || ''} onChange={e => setIncidentForm({ ...incidentForm, correctiveAction: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIncidentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveIncident}>{editingIncident ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
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

export default QualityAnalysis;
