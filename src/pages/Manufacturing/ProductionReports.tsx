
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import { ArrowLeft, BarChart2, Calendar, Download, FileText, Printer, Plus, Edit, Eye, Trash2, Filter, Settings, PieChart as PieIcon, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

interface ProductionReport {
  id: string;
  reportId: string;
  reportName: string;
  reportType: 'Summary' | 'Efficiency' | 'Quality' | 'Cost' | 'Custom';
  period: string;
  generatedDate: string;
  format: 'Excel' | 'PDF' | 'Excel, PDF';
  status: 'Generated' | 'Processing' | 'Failed';
  createdBy: string;
  fileSize: number;
  notes?: string;
  createdDate: string;
  lastModified: string;
}

interface EfficiencyData {
  id: string;
  workCenter: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  throughput: number;
  period: string;
  target: number;
  status: 'Green' | 'Yellow' | 'Red';
  createdDate: string;
  lastModified: string;
}

interface QualityReport {
  id: string;
  reportId: string;
  reportName: string;
  defectRate: number;
  firstPassYield: number;
  scrapRate: number;
  reworkRate: number;
  inspectionCount: number;
  period: string;
  status: 'On Track' | 'At Risk' | 'Behind';
  createdDate: string;
  lastModified: string;
}

interface CostReport {
  id: string;
  reportId: string;
  reportName: string;
  category: 'Material' | 'Labor' | 'Overhead' | 'Equipment' | 'Quality';
  budget: number;
  actual: number;
  variance: number;
  variancePercent: number;
  period: string;
  department: string;
  status: 'On Budget' | 'Over Budget' | 'Under Budget';
  trend: 'Up' | 'Down' | 'Stable';
  createdDate: string;
  lastModified: string;
}

interface CustomReport {
  id: string;
  reportId: string;
  reportName: string;
  description: string;
  metrics: string[];
  workCenters: string[];
  period: string;
  chartType: 'Bar' | 'Line' | 'Area' | 'Pie';
  createdBy: string;
  lastGenerated: string;
  status: 'Active' | 'Draft' | 'Scheduled';
  createdDate: string;
  lastModified: string;
}

const STORAGE_KEY_REPORTS = 'production_reports';
const STORAGE_KEY_EFFICIENCY = 'production_efficiency';
const STORAGE_KEY_QUALITY = 'production_quality';
const STORAGE_KEY_COST = 'production_cost';
const STORAGE_KEY_CUSTOM = 'production_custom';

const ProductionReports: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [reports, setReports] = useState<ProductionReport[]>([]);
  const [efficiencyData, setEfficiencyData] = useState<EfficiencyData[]>([]);
  const [qualityData, setQualityData] = useState<QualityReport[]>([]);
  const [costData, setCostData] = useState<CostReport[]>([]);
  const [customData, setCustomData] = useState<CustomReport[]>([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ProductionReport | null>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [reportForm, setReportForm] = useState<Partial<ProductionReport>>({
    reportId: '', reportName: '', reportType: 'Summary', period: '', generatedDate: '', format: 'PDF', status: 'Generated', createdBy: '', fileSize: 0, notes: '',
  });

  const loadData = () => {
    const storedReports = listEntities<ProductionReport>(STORAGE_KEY_REPORTS);
    if (storedReports.length === 0) {
      const reportNames = ['Monthly Production Summary', 'Production Efficiency Analysis', 'Quality Defect Analysis', 'Cost Variance Report', 'Capacity Utilization Report', 'Downtime Analysis', 'Inventory Status Report', 'Production Planning Report', 'Work Center Performance', 'Maintenance Summary'];
      const reportTypes: ProductionReport['reportType'][] = ['Summary', 'Efficiency', 'Quality', 'Cost', 'Custom'];
      const periods = ['May 2025', 'April 2025', 'Q1 2025', 'Q2 2025'];
      const formats: ProductionReport['format'][] = ['Excel', 'PDF', 'Excel, PDF'];
      const statuses: ProductionReport['status'][] = ['Generated', 'Processing', 'Failed'];
      const users = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'System'];

      const sample: ProductionReport[] = Array.from({ length: 30 }, (_, i) => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        return {
          id: generateId('RPT'),
          reportId: `RPT-${String(i + 1).padStart(4, '0')}`,
          reportName: reportNames[i % reportNames.length],
          reportType: reportTypes[i % reportTypes.length],
          period: periods[i % periods.length],
          generatedDate: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          format: formats[Math.floor(Math.random() * formats.length)],
          status,
          createdBy: users[i % users.length],
          fileSize: Math.floor(Math.random() * 5000) + 100,
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_REPORTS, o as any));
    }
    setReports(listEntities<ProductionReport>(STORAGE_KEY_REPORTS));

    const storedEfficiency = listEntities<EfficiencyData>(STORAGE_KEY_EFFICIENCY);
    if (storedEfficiency.length === 0) {
      const workCenters = ['Assembly Line 1', 'Assembly Line 2', 'Quality Control', 'Packaging', 'Material Handling'];
      const periods = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

      const sample: EfficiencyData[] = Array.from({ length: 30 }, (_, i) => {
        const availability = Math.floor(Math.random() * 15) + 85;
        const performance = Math.floor(Math.random() * 15) + 80;
        const quality = Math.floor(Math.random() * 10) + 90;
        const oee = parseFloat((availability * performance * quality / 10000).toFixed(1));
        return {
          id: generateId('EFF'),
          workCenter: workCenters[i % workCenters.length],
          oee,
          availability,
          performance,
          quality,
          throughput: Math.floor(Math.random() * 500) + 100,
          period: periods[i % periods.length],
          target: 85,
          status: oee >= 85 ? 'Green' : oee >= 75 ? 'Yellow' : 'Red',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_EFFICIENCY, o as any));
    }
    setEfficiencyData(listEntities<EfficiencyData>(STORAGE_KEY_EFFICIENCY));

    const storedQuality = listEntities<QualityReport>(STORAGE_KEY_QUALITY);
    if (storedQuality.length === 0) {
      const reportNames = ['First Pass Yield Report', 'Defect Analysis', 'Scrap Analysis', 'Rework Analysis', 'Quality Trend', 'Inspection Summary'];
      const periods = ['May 2025', 'April 2025', 'Q1 2025'];

      const sample: QualityReport[] = Array.from({ length: 30 }, (_, i) => {
        const defectRate = parseFloat((Math.random() * 5).toFixed(1));
        const firstPassYield = parseFloat((100 - defectRate - Math.random() * 2).toFixed(1));
        const scrapRate = parseFloat((Math.random() * 3).toFixed(1));
        const reworkRate = parseFloat((Math.random() * 2).toFixed(1));
        return {
          id: generateId('QR'),
          reportId: `QR-${String(i + 1).padStart(4, '0')}`,
          reportName: reportNames[i % reportNames.length],
          defectRate,
          firstPassYield,
          scrapRate,
          reworkRate,
          inspectionCount: Math.floor(Math.random() * 100) + 50,
          period: periods[i % periods.length],
          status: firstPassYield >= 95 ? 'On Track' : firstPassYield >= 90 ? 'At Risk' : 'Behind',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_QUALITY, o as any));
    }
    setQualityData(listEntities<QualityReport>(STORAGE_KEY_QUALITY));

    const storedCost = listEntities<CostReport>(STORAGE_KEY_COST);
    if (storedCost.length === 0) {
      const reportNames = ['Material Cost Analysis', 'Labor Cost Report', 'Overhead Allocation', 'Equipment Depreciation', 'Quality Cost Summary', 'Unit Cost Analysis', 'Cost Variance Report', 'Budget vs Actual'];
      const categories: CostReport['category'][] = ['Material', 'Labor', 'Overhead', 'Equipment', 'Quality'];
      const departments = ['Production', 'Assembly', 'Quality', 'Maintenance', 'Operations'];
      const periods = ['May 2025', 'April 2025', 'Q1 2025'];
      const statuses: CostReport['status'][] = ['On Budget', 'Over Budget', 'Under Budget'];
      const trends: CostReport['trend'][] = ['Up', 'Down', 'Stable'];

      const sample: CostReport[] = Array.from({ length: 30 }, (_, i) => {
        const budget = Math.floor(Math.random() * 100000) + 50000;
        const actual = Math.floor(Math.random() * 120000) + 40000;
        const variance = actual - budget;
        const variancePercent = parseFloat(((variance / budget) * 100).toFixed(1));
        return {
          id: generateId('CR'),
          reportId: `CR-${String(i + 1).padStart(4, '0')}`,
          reportName: reportNames[i % reportNames.length],
          category: categories[i % categories.length],
          budget,
          actual,
          variance,
          variancePercent,
          period: periods[i % periods.length],
          department: departments[i % departments.length],
          status: variance > 0 ? 'Over Budget' : variance < -budget * 0.1 ? 'Under Budget' : 'On Budget',
          trend: trends[Math.floor(Math.random() * trends.length)],
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_COST, o as any));
    }
    setCostData(listEntities<CostReport>(STORAGE_KEY_COST));

    const storedCustom = listEntities<CustomReport>(STORAGE_KEY_CUSTOM);
    if (storedCustom.length === 0) {
      const reportNames = ['Daily Production Summary', 'Weekly Efficiency Report', 'Monthly Quality Analysis', 'Quarterly Cost Review', 'Annual Performance Summary', 'Custom Dashboard View'];
      const workCenters = ['WC-001', 'WC-002', 'WC-003', 'WC-004', 'WC-005'];
      const periods = ['May 2025', 'April 2025', 'Q1 2025'];
      const chartTypes: CustomReport['chartType'][] = ['Bar', 'Line', 'Area', 'Pie'];
      const statuses: CustomReport['status'][] = ['Active', 'Draft', 'Scheduled'];

      const sample: CustomReport[] = Array.from({ length: 30 }, (_, i) => {
        const metrics = ['Efficiency', 'Quality', 'Cost', 'Production', 'Safety'].slice(0, Math.floor(Math.random() * 4) + 2);
        return {
          id: generateId('CXR'),
          reportId: `CXR-${String(i + 1).padStart(4, '0')}`,
          reportName: reportNames[i % reportNames.length],
          description: `Custom report for ${metrics.join(', ')} metrics`,
          metrics,
          workCenters: workCenters.slice(0, Math.floor(Math.random() * 3) + 1),
          period: periods[i % periods.length],
          chartType: chartTypes[Math.floor(Math.random() * chartTypes.length)],
          createdBy: ['John Smith', 'Sarah Johnson', 'Michael Chen'][i % 3],
          lastGenerated: new Date(2025, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
      });
      sample.forEach(o => upsertEntity(STORAGE_KEY_CUSTOM, o as any));
    }
    setCustomData(listEntities<CustomReport>(STORAGE_KEY_CUSTOM));
  };

  useEffect(() => {
    if (isEnabled) {
      speak('You are now viewing Production Reports. This page provides various reports on production performance and activities.');
    }
    loadData();
  }, [isEnabled, speak]);

  const handleSaveReport = () => {
    const now = new Date().toISOString();
    const newReport: ProductionReport = {
      id: editingReport?.id || generateId('RPT'),
      reportId: editingReport?.reportId || `RPT-${String(Date.now()).slice(-4)}`,
      reportName: reportForm.reportName || '',
      reportType: reportForm.reportType || 'Summary',
      period: reportForm.period || '',
      generatedDate: reportForm.generatedDate || now.split('T')[0],
      format: reportForm.format || 'PDF',
      status: reportForm.status || 'Generated',
      createdBy: reportForm.createdBy || '',
      fileSize: reportForm.fileSize || 0,
      notes: reportForm.notes,
      createdDate: editingReport?.createdDate || now,
      lastModified: now,
    };

    upsertEntity(STORAGE_KEY_REPORTS, newReport as any);
    setReports(listEntities<ProductionReport>(STORAGE_KEY_REPORTS));
    setReportDialogOpen(false);
    setEditingReport(null);
    toast({ title: 'Success', description: `Report ${editingReport ? 'updated' : 'created'} successfully` });
  };

  const handleDeleteReport = (id: string) => {
    removeEntity(STORAGE_KEY_REPORTS, id);
    setReports(listEntities<ProductionReport>(STORAGE_KEY_REPORTS));
    toast({ title: 'Deleted', description: 'Report deleted successfully' });
  };

  const openEditReport = (report: ProductionReport) => {
    setEditingReport(report);
    setReportForm(report);
    setReportDialogOpen(true);
  };

  const openView = (item: any) => {
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const reportColumns: EnhancedColumn<ProductionReport>[] = [
    { key: 'reportId', header: 'Report ID', sortable: true },
    { key: 'reportName', header: 'Report Name', sortable: true },
    { key: 'reportType', header: 'Type', sortable: true },
    { key: 'period', header: 'Period', sortable: true },
    { key: 'generatedDate', header: 'Generated On', sortable: true },
    { key: 'format', header: 'Format', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          'Generated': 'bg-green-100 text-green-800',
          'Processing': 'bg-yellow-100 text-yellow-800',
          'Failed': 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[value] || 'bg-gray-100'}`}>{value}</span>;
      }
    },
  ];

  const reportActions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: any) => openView(row), variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: any) => openEditReport(row), variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: any) => handleDeleteReport(row.id), variant: 'ghost' },
  ];

  const totalOrders = reports.length;
  const completedReports = reports.filter(r => r.status === 'Generated').length;
  const avgEfficiency = efficiencyData.length > 0 ? efficiencyData.reduce((s, e) => s + e.oee, 0) / efficiencyData.length : 0;
  const avgQuality = qualityData.length > 0 ? qualityData.reduce((s, q) => s + q.firstPassYield, 0) / qualityData.length : 0;

  const productionData = [
    { name: 'Week 1', output: 1200, target: 1100 },
    { name: 'Week 2', output: 1350, target: 1100 },
    { name: 'Week 3', output: 1100, target: 1100 },
    { name: 'Week 4', output: 1450, target: 1100 },
  ];

  const workCenterData = efficiencyData.slice(0, 6).map(e => ({
    name: e.workCenter.substring(0, 10),
    oee: e.oee,
    target: e.target,
  }));

  const costByCategory = [
    { name: 'Material', value: costData.filter(c => c.category === 'Material').reduce((s, c) => s + c.actual, 0) },
    { name: 'Labor', value: costData.filter(c => c.category === 'Labor').reduce((s, c) => s + c.actual, 0) },
    { name: 'Overhead', value: costData.filter(c => c.category === 'Overhead').reduce((s, c) => s + c.actual, 0) },
    { name: 'Equipment', value: costData.filter(c => c.category === 'Equipment').reduce((s, c) => s + c.actual, 0) },
    { name: 'Quality', value: costData.filter(c => c.category === 'Quality').reduce((s, c) => s + c.actual, 0) },
  ];

  const costTrendData = costData.slice(0, 8).map((c, i) => ({
    name: c.category,
    budget: c.budget,
    actual: c.actual,
  }));

  const totalBudget = costData.reduce((s, c) => s + c.budget, 0);
  const totalActual = costData.reduce((s, c) => s + c.actual, 0);
  const totalVariance = totalActual - totalBudget;
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/manufacturing')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Production Reports"
          description="View and analyze production performance and activities"
          voiceIntroduction="Welcome to Production Reports."
        />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Production Reports</h2>
          <p className="text-sm text-gray-500">May 2025</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center"><Calendar className="h-4 w-4 mr-2" />Change Period</Button>
          <Button variant="outline" size="sm" className="flex items-center"><Download className="h-4 w-4 mr-2" />Export</Button>
          <Button variant="outline" size="sm" className="flex items-center"><Printer className="h-4 w-4 mr-2" />Print</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Reports</div>
          <div className="text-2xl font-bold">{totalOrders}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-2xl font-bold">{completedReports}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Avg Efficiency</div>
          <div className="text-2xl font-bold">{avgEfficiency.toFixed(1)}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Avg Quality</div>
          <div className="text-2xl font-bold">{avgQuality.toFixed(1)}%</div>
        </Card>
      </div>

      <Tabs defaultValue="summary" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Production Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Total Reports</span>
                    <span>{reports.length}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Generated Reports</span>
                    <span>{completedReports}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Production Efficiency</span>
                    <span className="text-green-600">{avgEfficiency.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Quality Rate</span>
                    <span className="text-green-600">{avgQuality.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Production Output</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={productionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="output" fill="#3B82F6" name="Output" />
                    <Bar dataKey="target" fill="#10B981" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">All Reports</h3>
                <Button size="sm" onClick={() => { setEditingReport(null); setReportForm({ reportId: '', reportName: '', reportType: 'Summary', period: '', generatedDate: '', format: 'PDF', status: 'Generated', createdBy: '', fileSize: 0, notes: '' }); setReportDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Create Report</Button>
              </div>
              <EnhancedDataTable columns={reportColumns} data={reports} actions={reportActions} searchPlaceholder="Search reports..." exportable refreshable onRefresh={loadData} />
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="efficiency">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Efficiency Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">OEE by Work Center</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={workCenterData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="oee" fill="#3B82F6" name="OEE %" />
                    <Bar dataKey="target" fill="#10B981" name="Target %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">OEE Components</h3>
                <div className="space-y-3">
                  {efficiencyData.slice(0, 5).map(e => (
                    <div key={e.id} className="p-3 border rounded">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{e.workCenter}</span>
                        <span className={`px-2 py-1 rounded text-xs ${e.status === 'Green' ? 'bg-green-100 text-green-800' : e.status === 'Yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{e.oee}%</span>
                      </div>
                      <div className="text-xs text-gray-500">Availability: {e.availability}% | Performance: {e.performance}% | Quality: {e.quality}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quality Reports</h2>
            <div className="space-y-4">
              {qualityData.slice(0, 10).map(q => (
                <div key={q.id} className="p-4 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{q.reportName}</span>
                    <span className={`px-2 py-1 rounded text-xs ${q.status === 'On Track' ? 'bg-green-100 text-green-800' : q.status === 'At Risk' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{q.status}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm text-gray-600">
                    <div>FPY: {q.firstPassYield}%</div>
                    <div>Defects: {q.defectRate}%</div>
                    <div>Scrap: {q.scrapRate}%</div>
                    <div>Rework: {q.reworkRate}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="cost">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cost Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-blue-50">
                <div className="text-sm text-gray-600">Total Budget</div>
                <div className="text-2xl font-bold">${(totalBudget / 1000).toFixed(0)}K</div>
              </Card>
              <Card className="p-4 bg-green-50">
                <div className="text-sm text-gray-600">Total Actual</div>
                <div className="text-2xl font-bold">${(totalActual / 1000).toFixed(0)}K</div>
              </Card>
              <Card className={`p-4 ${totalVariance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className="text-sm text-gray-600">Variance</div>
                <div className={`text-2xl font-bold ${totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {totalVariance > 0 ? '+' : ''}${(totalVariance / 1000).toFixed(0)}K
                </div>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-3">Cost by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={costByCategory} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {costByCategory.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-3">Budget vs Actual</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={costTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`} />
                    <Legend />
                    <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                    <Bar dataKey="actual" fill="#10B981" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-medium mb-3">Cost Reports Detail</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {costData.slice(0, 15).map(c => (
                  <div key={c.id} className="p-4 border rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">{c.reportName}</div>
                      <div className="text-sm text-gray-500">{c.category} - {c.department}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${c.actual.toLocaleString()}</div>
                      <div className={`text-xs ${c.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {c.variance > 0 ? '+' : ''}{c.variancePercent}% vs budget
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Custom Reports</h2>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Create Custom Report</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customData.slice(0, 12).map(c => (
                <div key={c.id} className="p-4 border rounded hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{c.reportName}</div>
                    <span className={`px-2 py-1 rounded text-xs ${c.status === 'Active' ? 'bg-green-100 text-green-800' : c.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{c.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.metrics.map((m, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">{m}</span>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Chart: {c.chartType}</span>
                    <span>{c.period}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-6 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Create custom report configurations</p>
                <p className="text-sm text-gray-400 mt-1">Select metrics, work centers, time periods, and visualization types</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingReport ? 'Edit Report' : 'Create Report'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Report Name</Label>
              <Input value={reportForm.reportName || ''} onChange={e => setReportForm({ ...reportForm, reportName: e.target.value })} />
            </div>
            <div>
              <Label>Report Type</Label>
              <Select value={reportForm.reportType} onValueChange={value => setReportForm({ ...reportForm, reportType: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Summary">Summary</SelectItem>
                  <SelectItem value="Efficiency">Efficiency</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Cost">Cost</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Period</Label>
              <Input value={reportForm.period || ''} onChange={e => setReportForm({ ...reportForm, period: e.target.value })} />
            </div>
            <div>
              <Label>Generated Date</Label>
              <Input type="date" value={reportForm.generatedDate || ''} onChange={e => setReportForm({ ...reportForm, generatedDate: e.target.value })} />
            </div>
            <div>
              <Label>Format</Label>
              <Select value={reportForm.format} onValueChange={value => setReportForm({ ...reportForm, format: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel, PDF">Excel, PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={reportForm.status} onValueChange={value => setReportForm({ ...reportForm, status: value as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Generated">Generated</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Created By</Label>
              <Input value={reportForm.createdBy || ''} onChange={e => setReportForm({ ...reportForm, createdBy: e.target.value })} />
            </div>
            <div>
              <Label>File Size (KB)</Label>
              <Input type="number" value={reportForm.fileSize || ''} onChange={e => setReportForm({ ...reportForm, fileSize: parseInt(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReport}>{editingReport ? 'Update' : 'Create'}</Button>
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

export default ProductionReports;
