
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, BarChart3, PieChart, LineChart, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MetricCard from '../../components/metrics/MetricCard';
import BarChartComponent from '../../components/charts/BarChartComponent';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface VisualizationConfig {
  id: string;
  name: string;
  type: string;
  dataSource: string;
  refreshRate: string;
  width: number;
  height: number;
  colors: string;
  lastModified: string;
  status: 'Published' | 'Draft' | 'Archived';
}

const defaultForm: Omit<VisualizationConfig, 'id'> = {
  name: '',
  type: 'Bar Chart',
  dataSource: 'Sales Data',
  refreshRate: 'Real-time',
  width: 800,
  height: 400,
  colors: '#3b82f6',
  lastModified: new Date().toISOString().split('T')[0],
  status: 'Draft',
};

const STORAGE_KEY = 'sap_datavisualization';

const defaultVisualizations: VisualizationConfig[] = [
  { id: '1', name: 'Revenue by Region', type: 'Bar Chart', dataSource: 'Sales Data', refreshRate: 'Real-time', width: 800, height: 400, colors: '#3b82f6', lastModified: '2024-01-15', status: 'Published' },
  { id: '2', name: 'Monthly Sales Trend', type: 'Line Chart', dataSource: 'Sales Data', refreshRate: 'Daily', width: 1000, height: 400, colors: '#10b981', lastModified: '2024-01-14', status: 'Published' },
  { id: '3', name: 'Product Category Split', type: 'Pie Chart', dataSource: 'Inventory Data', refreshRate: 'Weekly', width: 600, height: 400, colors: '#8b5cf6', lastModified: '2024-01-13', status: 'Published' },
  { id: '4', name: 'Customer Demographics', type: 'Donut Chart', dataSource: 'Customer Data', refreshRate: 'Monthly', width: 600, height: 400, colors: '#f59e0b', lastModified: '2024-01-12', status: 'Draft' },
  { id: '5', name: 'Profit Margins by Product', type: 'Bar Chart', dataSource: 'Finance Data', refreshRate: 'Daily', width: 800, height: 400, colors: '#ef4444', lastModified: '2024-01-11', status: 'Published' },
  { id: '6', name: 'Sales Funnel', type: 'Funnel Chart', dataSource: 'Sales Data', refreshRate: 'Real-time', width: 800, height: 500, colors: '#06b6d4', lastModified: '2024-01-10', status: 'Published' },
  { id: '7', name: 'Geographic Distribution', type: 'Map Chart', dataSource: 'Customer Data', refreshRate: 'Weekly', width: 1000, height: 500, colors: '#84cc16', lastModified: '2024-01-09', status: 'Draft' },
  { id: '8', name: 'Time Series Forecast', type: 'Line Chart', dataSource: 'Analytics Data', refreshRate: 'Daily', width: 1200, height: 400, colors: '#ec4899', lastModified: '2024-01-08', status: 'Published' },
  { id: '9', name: 'Inventory Levels', type: 'Gauge Chart', dataSource: 'Inventory Data', refreshRate: 'Real-time', width: 400, height: 300, colors: '#14b8a6', lastModified: '2024-01-07', status: 'Published' },
  { id: '10', name: 'Employee Performance', type: 'Radar Chart', dataSource: 'HR Data', refreshRate: 'Monthly', width: 600, height: 400, colors: '#a855f7', lastModified: '2024-01-06', status: 'Draft' },
  { id: '11', name: 'Budget Allocation', type: 'Stacked Bar', dataSource: 'Finance Data', refreshRate: 'Monthly', width: 1000, height: 400, colors: '#f97316', lastModified: '2024-01-05', status: 'Published' },
  { id: '12', name: 'Customer Satisfaction', type: 'Area Chart', dataSource: 'Survey Data', refreshRate: 'Weekly', width: 800, height: 400, colors: '#22c55e', lastModified: '2024-01-04', status: 'Published' },
  { id: '13', name: 'Supply Chain Flow', type: 'Sankey Diagram', dataSource: 'Operations Data', refreshRate: 'Daily', width: 1200, height: 600, colors: '#0ea5e9', lastModified: '2024-01-03', status: 'Draft' },
  { id: '14', name: 'Risk Assessment Matrix', type: 'Heat Map', dataSource: 'Risk Data', refreshRate: 'Weekly', width: 800, height: 400, colors: '#e11d48', lastModified: '2024-01-02', status: 'Published' },
  { id: '15', name: 'Marketing Campaign ROI', type: 'Bar Chart', dataSource: 'Marketing Data', refreshRate: 'Daily', width: 800, height: 400, colors: '#7c3aed', lastModified: '2024-01-01', status: 'Published' },
  { id: '16', name: 'Website Traffic Sources', type: 'Pie Chart', dataSource: 'Web Analytics', refreshRate: 'Real-time', width: 600, height: 400, colors: '#0284c7', lastModified: '2023-12-31', status: 'Archived' },
  { id: '17', name: 'Support Ticket Trends', type: 'Line Chart', dataSource: 'Support Data', refreshRate: 'Daily', width: 1000, height: 400, colors: '#059669', lastModified: '2023-12-30', status: 'Published' },
  { id: '18', name: 'Conversion Rates', type: 'Funnel Chart', dataSource: 'Sales Data', refreshRate: 'Real-time', width: 800, height: 500, colors: '#d946ef', lastModified: '2023-12-29', status: 'Published' },
  { id: '19', name: 'Product Performance Grid', type: 'Bubble Chart', dataSource: 'Product Data', refreshRate: 'Weekly', width: 800, height: 400, colors: '#8b5cf6', lastModified: '2023-12-28', status: 'Draft' },
  { id: '20', name: 'Seasonal Patterns', type: 'Radar Chart', dataSource: 'Sales Data', refreshRate: 'Monthly', width: 600, height: 400, colors: '#f43f5e', lastModified: '2023-12-27', status: 'Published' },
  { id: '21', name: 'Operational Efficiency', type: 'Gauge Chart', dataSource: 'Operations Data', refreshRate: 'Real-time', width: 400, height: 300, colors: '#10b981', lastModified: '2023-12-26', status: 'Published' },
  { id: '22', name: 'Customer Journey Map', type: 'Sankey Diagram', dataSource: 'Analytics Data', refreshRate: 'Weekly', width: 1200, height: 600, colors: '#6366f1', lastModified: '2023-12-25', status: 'Draft' },
  { id: '23', name: 'Resource Utilization', type: 'Stacked Bar', dataSource: 'Operations Data', refreshRate: 'Daily', width: 1000, height: 400, colors: '#14b8a6', lastModified: '2023-12-24', status: 'Published' },
  { id: '24', name: 'Network Topology', type: 'Network Graph', dataSource: 'Infrastructure', refreshRate: 'Real-time', width: 1000, height: 600, colors: '#f59e0b', lastModified: '2023-12-23', status: 'Published' },
  { id: '25', name: 'Financial Health Score', type: 'Gauge Chart', dataSource: 'Finance Data', refreshRate: 'Daily', width: 400, height: 300, colors: '#22c55e', lastModified: '2023-12-22', status: 'Published' },
  { id: '26', name: 'Market Share Analysis', type: 'Donut Chart', dataSource: 'Market Data', refreshRate: 'Monthly', width: 600, height: 400, colors: '#3b82f6', lastModified: '2023-12-21', status: 'Draft' },
  { id: '27', name: 'Quality Metrics', type: 'Area Chart', dataSource: 'Quality Data', refreshRate: 'Daily', width: 800, height: 400, colors: '#a855f7', lastModified: '2023-12-20', status: 'Published' },
  { id: '28', name: 'Employee Retention', type: 'Line Chart', dataSource: 'HR Data', refreshRate: 'Monthly', width: 1000, height: 400, colors: '#ec4899', lastModified: '2023-12-19', status: 'Published' },
  { id: '29', name: 'Process Bottlenecks', type: 'Heat Map', dataSource: 'Operations Data', refreshRate: 'Weekly', width: 800, height: 400, colors: '#ef4444', lastModified: '2023-12-18', status: 'Draft' },
  { id: '30', name: 'KPI Dashboard Summary', type: 'Multi-Chart', dataSource: 'Multiple', refreshRate: 'Real-time', width: 1400, height: 800, colors: '#06b6d4', lastModified: '2023-12-17', status: 'Published' },
];

const DataVisualization: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const [visualizations, setVisualizations] = useLocalStorage<VisualizationConfig[]>(STORAGE_KEY, defaultVisualizations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingViz, setEditingViz] = useState<VisualizationConfig | null>(null);
  const [selectedViz, setSelectedViz] = useState<VisualizationConfig | null>(null);
  const [form, setForm] = useState<Omit<VisualizationConfig, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Data Visualization. Create interactive charts and visual analytics dashboards.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingViz(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (viz: VisualizationConfig) => {
    setEditingViz(viz);
    setForm({
      name: viz.name,
      type: viz.type,
      dataSource: viz.dataSource,
      refreshRate: viz.refreshRate,
      width: viz.width,
      height: viz.height,
      colors: viz.colors,
      lastModified: viz.lastModified,
      status: viz.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: 'Validation Error', description: 'Visualization name is required.', variant: 'destructive' });
      return;
    }

    if (editingViz) {
      setVisualizations(prev => prev.map(v => v.id === editingViz.id ? { ...editingViz, ...form } : v));
      toast({ title: 'Visualization Updated', description: `${form.name} has been updated.` });
    } else {
      const newViz: VisualizationConfig = {
        id: String(Date.now()),
        ...form,
      };
      setVisualizations(prev => [...prev, newViz]);
      toast({ title: 'Visualization Created', description: `${form.name} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (viz: VisualizationConfig) => {
    setVisualizations(prev => prev.filter(v => v.id !== viz.id));
    toast({ title: 'Visualization Deleted', description: `${viz.name} has been removed.` });
  };

  const handleView = (viz: VisualizationConfig) => {
    setSelectedViz(viz);
    setIsViewDialogOpen(true);
  };

  const publishedCount = visualizations.filter(v => v.status === 'Published').length;
  const draftCount = visualizations.filter(v => v.status === 'Draft').length;
  const archivedCount = visualizations.filter(v => v.status === 'Archived').length;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Published': 'bg-green-100 text-green-800',
      'Draft': 'bg-yellow-100 text-yellow-800',
      'Archived': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'name', header: 'Visualization Name' },
    { key: 'type', header: 'Chart Type' },
    { key: 'dataSource', header: 'Data Source' },
    { key: 'refreshRate', header: 'Refresh Rate' },
    { key: 'width', header: 'Width' },
    { key: 'height', header: 'Height' },
    { key: 'lastModified', header: 'Last Modified' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: VisualizationConfig) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/business-intelligence')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Data Visualization"
          description="Interactive charts and visual analytics"
          voiceIntroduction="Welcome to Data Visualization."
        />
      </div>

      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="charts">Visualizations</TabsTrigger>
          <TabsTrigger value="records">All Records</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="library">Chart Library</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Published Charts"
                value={String(publishedCount)}
                trend={{ value: "Published", direction: "up", label: "active" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Draft Charts"
                value={String(draftCount)}
                trend={{ value: "Draft", direction: "up", label: "in progress" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Archived"
                value={String(archivedCount)}
                trend={{ value: "Stored", direction: "up", label: "archived" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Total Visualizations"
                value={String(visualizations.length)}
                trend={{ value: "30", direction: "up", label: "records" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Visualization Records</h2>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Visualization
            </Button>
          </div>
          <Card className="p-6">
            <DataTable columns={columns} data={visualizations} />
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Sales Templates"
                value="12"
                trend={{ value: "12", direction: "up", label: "available" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Finance Templates"
                value="8"
                trend={{ value: "8", direction: "up", label: "available" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Custom Templates"
                value="5"
                trend={{ value: "5", direction: "up", label: "available" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Chart Types"
                value="18"
                trend={{ value: "18", direction: "up", label: "available" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Color Palettes"
                value="25"
                trend={{ value: "25", direction: "up", label: "available" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Data Connectors"
                value="15"
                trend={{ value: "15", direction: "up", label: "available" }}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingViz ? 'Edit Visualization' : 'Create Visualization'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Visualization Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter visualization name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Chart Type</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bar Chart">Bar Chart</SelectItem>
                    <SelectItem value="Line Chart">Line Chart</SelectItem>
                    <SelectItem value="Pie Chart">Pie Chart</SelectItem>
                    <SelectItem value="Donut Chart">Donut Chart</SelectItem>
                    <SelectItem value="Area Chart">Area Chart</SelectItem>
                    <SelectItem value="Gauge Chart">Gauge Chart</SelectItem>
                    <SelectItem value="Funnel Chart">Funnel Chart</SelectItem>
                    <SelectItem value="Radar Chart">Radar Chart</SelectItem>
                    <SelectItem value="Heat Map">Heat Map</SelectItem>
                    <SelectItem value="Stacked Bar">Stacked Bar</SelectItem>
                    <SelectItem value="Bubble Chart">Bubble Chart</SelectItem>
                    <SelectItem value="Sankey Diagram">Sankey Diagram</SelectItem>
                    <SelectItem value="Network Graph">Network Graph</SelectItem>
                    <SelectItem value="Map Chart">Map Chart</SelectItem>
                    <SelectItem value="Multi-Chart">Multi-Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dataSource">Data Source</Label>
                <Select value={form.dataSource} onValueChange={(value) => setForm({ ...form, dataSource: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Data">Sales Data</SelectItem>
                    <SelectItem value="Finance Data">Finance Data</SelectItem>
                    <SelectItem value="Customer Data">Customer Data</SelectItem>
                    <SelectItem value="Inventory Data">Inventory Data</SelectItem>
                    <SelectItem value="HR Data">HR Data</SelectItem>
                    <SelectItem value="Operations Data">Operations Data</SelectItem>
                    <SelectItem value="Analytics Data">Analytics Data</SelectItem>
                    <SelectItem value="Multiple">Multiple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="refreshRate">Refresh Rate</Label>
                <Select value={form.refreshRate} onValueChange={(value) => setForm({ ...form, refreshRate: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Real-time">Real-time</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value: 'Published' | 'Draft' | 'Archived') => setForm({ ...form, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={form.width}
                  onChange={(e) => setForm({ ...form, width: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="colors">Primary Color</Label>
              <Input
                id="colors"
                type="color"
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingViz ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Visualization Details</DialogTitle>
          </DialogHeader>
          {selectedViz && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{selectedViz.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Chart Type:</span>
                <span className="font-medium">{selectedViz.type}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Data Source:</span>
                <span className="font-medium">{selectedViz.dataSource}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Refresh Rate:</span>
                <span className="font-medium">{selectedViz.refreshRate}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Dimensions:</span>
                <span className="font-medium">{selectedViz.width} x {selectedViz.height}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Last Modified:</span>
                <span className="font-medium">{selectedViz.lastModified}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedViz.status)}>{selectedViz.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataVisualization;
