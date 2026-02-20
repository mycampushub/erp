
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
import { ArrowLeft, Factory, Gauge, AlertTriangle, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MetricCard from '../../components/metrics/MetricCard';
import BarChartComponent from '../../components/charts/BarChartComponent';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface ProductionRecord {
  id: string;
  period: string;
  plant: string;
  productLine: string;
  category: string;
  unitsProduced: number;
  targetOutput: number;
  efficiency: number;
  qualityScore: number;
  downtime: number;
  status: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

const defaultForm: Omit<ProductionRecord, 'id'> = {
  period: '2024-01',
  plant: 'Plant 1',
  productLine: 'Assembly Line A',
  category: 'Electronics',
  unitsProduced: 0,
  targetOutput: 0,
  efficiency: 0,
  qualityScore: 0,
  downtime: 0,
  status: 'Average',
};

const STORAGE_KEY = 'sap_manufacturinganalytics';

const defaultProductionRecords: ProductionRecord[] = [
  { id: '1', period: '2024-01', plant: 'Plant 1', productLine: 'Assembly Line A', category: 'Electronics', unitsProduced: 12500, targetOutput: 12000, efficiency: 92, qualityScore: 97, downtime: 3.2, status: 'Excellent' },
  { id: '2', period: '2024-01', plant: 'Plant 2', productLine: 'Assembly Line B', category: 'Electronics', unitsProduced: 9800, targetOutput: 10000, efficiency: 88, qualityScore: 95, downtime: 4.5, status: 'Good' },
  { id: '3', period: '2024-01', plant: 'Plant 3', productLine: 'Machining Center', category: 'Automotive', unitsProduced: 4500, targetOutput: 5000, efficiency: 85, qualityScore: 92, downtime: 5.2, status: 'Average' },
  { id: '4', period: '2024-01', plant: 'Plant 1', productLine: 'Packaging Line', category: 'Consumer Goods', unitsProduced: 25000, targetOutput: 24000, efficiency: 94, qualityScore: 98, downtime: 2.1, status: 'Excellent' },
  { id: '5', period: '2024-01', plant: 'Plant 4', productLine: 'Welding Station', category: 'Industrial', unitsProduced: 3200, targetOutput: 3500, efficiency: 82, qualityScore: 90, downtime: 6.8, status: 'Poor' },
  { id: '6', period: '2024-02', plant: 'Plant 1', productLine: 'Assembly Line A', category: 'Electronics', unitsProduced: 13200, targetOutput: 12000, efficiency: 94, qualityScore: 96, downtime: 2.8, status: 'Excellent' },
  { id: '7', period: '2024-02', plant: 'Plant 2', productLine: 'Assembly Line B', category: 'Electronics', unitsProduced: 10500, targetOutput: 10000, efficiency: 91, qualityScore: 97, downtime: 3.5, status: 'Excellent' },
  { id: '8', period: '2024-02', plant: 'Plant 3', productLine: 'Machining Center', category: 'Automotive', unitsProduced: 4800, targetOutput: 5000, efficiency: 88, qualityScore: 93, downtime: 4.2, status: 'Good' },
  { id: '9', period: '2024-02', plant: 'Plant 1', productLine: 'Packaging Line', category: 'Consumer Goods', unitsProduced: 26800, targetOutput: 24000, efficiency: 96, qualityScore: 99, downtime: 1.8, status: 'Excellent' },
  { id: '10', period: '2024-02', plant: 'Plant 4', productLine: 'Welding Station', category: 'Industrial', unitsProduced: 3400, targetOutput: 3500, efficiency: 84, qualityScore: 91, downtime: 5.5, status: 'Average' },
  { id: '11', period: '2024-03', plant: 'Plant 1', productLine: 'Assembly Line A', category: 'Electronics', unitsProduced: 14000, targetOutput: 12000, efficiency: 96, qualityScore: 98, downtime: 2.1, status: 'Excellent' },
  { id: '12', period: '2024-03', plant: 'Plant 2', productLine: 'Assembly Line B', category: 'Electronics', unitsProduced: 11000, targetOutput: 10000, efficiency: 93, qualityScore: 96, downtime: 3.2, status: 'Excellent' },
  { id: '13', period: '2024-03', plant: 'Plant 3', productLine: 'Machining Center', category: 'Automotive', unitsProduced: 5100, targetOutput: 5000, efficiency: 90, qualityScore: 94, downtime: 3.8, status: 'Good' },
  { id: '14', period: '2024-03', plant: 'Plant 1', productLine: 'Packaging Line', category: 'Consumer Goods', unitsProduced: 27500, targetOutput: 24000, efficiency: 97, qualityScore: 99, downtime: 1.5, status: 'Excellent' },
  { id: '15', period: '2024-03', plant: 'Plant 4', productLine: 'Welding Station', category: 'Industrial', unitsProduced: 3600, targetOutput: 3500, efficiency: 88, qualityScore: 92, downtime: 4.5, status: 'Good' },
  { id: '16', period: '2024-04', plant: 'Plant 1', productLine: 'Assembly Line A', category: 'Electronics', unitsProduced: 12800, targetOutput: 12000, efficiency: 91, qualityScore: 97, downtime: 3.0, status: 'Excellent' },
  { id: '17', period: '2024-04', plant: 'Plant 2', productLine: 'Assembly Line B', category: 'Electronics', unitsProduced: 10200, targetOutput: 10000, efficiency: 89, qualityScore: 95, downtime: 4.0, status: 'Good' },
  { id: '18', period: '2024-04', plant: 'Plant 3', productLine: 'Machining Center', category: 'Automotive', unitsProduced: 4700, targetOutput: 5000, efficiency: 86, qualityScore: 93, downtime: 4.8, status: 'Average' },
  { id: '19', period: '2024-04', plant: 'Plant 1', productLine: 'Packaging Line', category: 'Consumer Goods', unitsProduced: 26000, targetOutput: 24000, efficiency: 95, qualityScore: 98, downtime: 2.0, status: 'Excellent' },
  { id: '20', period: '2024-04', plant: 'Plant 4', productLine: 'Welding Station', category: 'Industrial', unitsProduced: 3300, targetOutput: 3500, efficiency: 83, qualityScore: 90, downtime: 5.8, status: 'Average' },
  { id: '21', period: '2024-05', plant: 'Plant 1', productLine: 'Assembly Line A', category: 'Electronics', unitsProduced: 14500, targetOutput: 12000, efficiency: 97, qualityScore: 99, downtime: 1.8, status: 'Excellent' },
  { id: '22', period: '2024-05', plant: 'Plant 2', productLine: 'Assembly Line B', category: 'Electronics', unitsProduced: 10800, targetOutput: 10000, efficiency: 92, qualityScore: 97, downtime: 3.0, status: 'Excellent' },
  { id: '23', period: '2024-05', plant: 'Plant 3', productLine: 'Machining Center', category: 'Automotive', unitsProduced: 5200, targetOutput: 5000, efficiency: 91, qualityScore: 95, downtime: 3.5, status: 'Excellent' },
  { id: '24', period: '2024-05', plant: 'Plant 1', productLine: 'Packaging Line', category: 'Consumer Goods', unitsProduced: 28200, targetOutput: 24000, efficiency: 98, qualityScore: 99, downtime: 1.2, status: 'Excellent' },
  { id: '25', period: '2024-05', plant: 'Plant 4', productLine: 'Welding Station', category: 'Industrial', unitsProduced: 3700, targetOutput: 3500, efficiency: 90, qualityScore: 93, downtime: 4.0, status: 'Good' },
  { id: '26', period: '2024-06', plant: 'Plant 1', productLine: 'Assembly Line A', category: 'Electronics', unitsProduced: 13800, targetOutput: 12000, efficiency: 95, qualityScore: 98, downtime: 2.3, status: 'Excellent' },
  { id: '27', period: '2024-06', plant: 'Plant 2', productLine: 'Assembly Line B', category: 'Electronics', unitsProduced: 10600, targetOutput: 10000, efficiency: 90, qualityScore: 96, downtime: 3.5, status: 'Excellent' },
  { id: '28', period: '2024-06', plant: 'Plant 3', productLine: 'Machining Center', category: 'Automotive', unitsProduced: 5000, targetOutput: 5000, efficiency: 89, qualityScore: 94, downtime: 4.0, status: 'Good' },
  { id: '29', period: '2024-06', plant: 'Plant 1', productLine: 'Packaging Line', category: 'Consumer Goods', unitsProduced: 27000, targetOutput: 24000, efficiency: 96, qualityScore: 98, downtime: 1.8, status: 'Excellent' },
  { id: '30', period: '2024-06', plant: 'Plant 4', productLine: 'Welding Station', category: 'Industrial', unitsProduced: 3550, targetOutput: 3500, efficiency: 87, qualityScore: 92, downtime: 4.5, status: 'Good' },
];

const ManufacturingAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const [productionRecords, setProductionRecords] = useLocalStorage<ProductionRecord[]>(STORAGE_KEY, defaultProductionRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ProductionRecord | null>(null);
  const [form, setForm] = useState<Omit<ProductionRecord, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Manufacturing Analytics. Monitor production efficiency, quality metrics, and operational performance.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingRecord(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (record: ProductionRecord) => {
    setEditingRecord(record);
    setForm({
      period: record.period,
      plant: record.plant,
      productLine: record.productLine,
      category: record.category,
      unitsProduced: record.unitsProduced,
      targetOutput: record.targetOutput,
      efficiency: record.efficiency,
      qualityScore: record.qualityScore,
      downtime: record.downtime,
      status: record.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.productLine.trim()) {
      toast({ title: 'Validation Error', description: 'Product line is required.', variant: 'destructive' });
      return;
    }
    const efficiency = (form.unitsProduced / form.targetOutput) * 100;
    const status: 'Excellent' | 'Good' | 'Average' | 'Poor' = 
      efficiency >= 95 && form.qualityScore >= 95 ? 'Excellent' :
      efficiency >= 90 && form.qualityScore >= 90 ? 'Good' :
      efficiency >= 80 && form.qualityScore >= 80 ? 'Average' : 'Poor';

    if (editingRecord) {
      setProductionRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...editingRecord, ...form, efficiency, status } : r));
      toast({ title: 'Production Record Updated', description: `${form.productLine} for ${form.period} has been updated.` });
    } else {
      const newRecord: ProductionRecord = {
        id: String(Date.now()),
        ...form,
        efficiency,
        status,
      };
      setProductionRecords(prev => [...prev, newRecord]);
      toast({ title: 'Production Record Created', description: `${form.productLine} for ${form.period} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (record: ProductionRecord) => {
    setProductionRecords(prev => prev.filter(r => r.id !== record.id));
    toast({ title: 'Production Record Deleted', description: `${record.productLine} has been removed.` });
  };

  const handleView = (record: ProductionRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const avgEfficiency = productionRecords.reduce((sum, r) => sum + r.efficiency, 0) / productionRecords.length;
  const avgQuality = productionRecords.reduce((sum, r) => sum + r.qualityScore, 0) / productionRecords.length;
  const avgDowntime = productionRecords.reduce((sum, r) => sum + r.downtime, 0) / productionRecords.length;
  const totalUnits = productionRecords.reduce((sum, r) => sum + r.unitsProduced, 0);

  const productionData = productionRecords.reduce((acc: { month: string; efficiency: number; quality: number }[], record) => {
    const existing = acc.find(a => a.month === record.period);
    if (existing) {
      existing.efficiency += record.efficiency;
      existing.quality += record.qualityScore;
    } else {
      acc.push({ month: record.period, efficiency: record.efficiency, quality: record.qualityScore });
    }
    return acc;
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Average': 'bg-yellow-100 text-yellow-800',
      'Poor': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'period', header: 'Period' },
    { key: 'plant', header: 'Plant' },
    { key: 'productLine', header: 'Product Line' },
    { key: 'category', header: 'Category' },
    { key: 'unitsProduced', header: 'Units' },
    { key: 'targetOutput', header: 'Target' },
    { key: 'efficiency', header: 'Efficiency %', render: (value: number) => `${value.toFixed(1)}%` },
    { key: 'qualityScore', header: 'Quality %', render: (value: number) => `${value.toFixed(1)}%` },
    { key: 'downtime', header: 'Downtime %', render: (value: number) => `${value.toFixed(1)}%` },
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
      render: (_: any, row: ProductionRecord) => (
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
          title="Manufacturing Analytics"
          description="Production efficiency and quality analytics"
          voiceIntroduction="Welcome to Manufacturing Analytics."
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Production Records</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Avg Efficiency"
                value={`${avgEfficiency.toFixed(1)}%`}
                trend={{ value: "3.2%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Avg Quality"
                value={`${avgQuality.toFixed(1)}%`}
                trend={{ value: "1.5%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Avg Downtime"
                value={`${avgDowntime.toFixed(1)}%`}
                trend={{ value: "0.8%", direction: "down", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Total Units"
                value={totalUnits.toLocaleString()}
                trend={{ value: "12.5%", direction: "up", label: "YTD" }}
              />
            </Card>
          </div>

          <Card className="p-6">
            <BarChartComponent
              data={productionData}
              dataKey="efficiency"
              xAxisKey="month"
              title="Efficiency Trends"
              subtitle="Production efficiency over time"
              height={400}
              color="#0891b2"
            />
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Production Records</h2>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Record
            </Button>
          </div>
          <Card className="p-6">
            <DataTable columns={columns} data={productionRecords} />
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="OEE Score"
                value={`${(avgEfficiency * 0.85).toFixed(1)}%`}
                trend={{ value: "2.1%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Capacity Utilization"
                value="87.5%"
                trend={{ value: "5.2%", direction: "up", label: "vs last month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Production Yield"
                value="94.2%"
                trend={{ value: "1.8%", direction: "up", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="First Pass Yield"
                value="92.5%"
                trend={{ value: "2.3%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Defect Rate"
                value="0.8%"
                trend={{ value: "0.2%", direction: "down", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Customer Returns"
                value="1.2%"
                trend={{ value: "0.3%", direction: "down", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="MTBF"
                value="1,250 hrs"
                trend={{ value: "150 hrs", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="MTTR"
                value="4.2 hrs"
                trend={{ value: "0.8 hrs", direction: "down", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Maintenance Cost"
                value="$125K"
                trend={{ value: "8.5%", direction: "down", label: "reduction" }}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Production Record' : 'Create Production Record'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="period">Period</Label>
                <Input
                  id="period"
                  type="month"
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plant">Plant</Label>
                <Select value={form.plant} onValueChange={(value) => setForm({ ...form, plant: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plant 1">Plant 1</SelectItem>
                    <SelectItem value="Plant 2">Plant 2</SelectItem>
                    <SelectItem value="Plant 3">Plant 3</SelectItem>
                    <SelectItem value="Plant 4">Plant 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productLine">Product Line</Label>
              <Input
                id="productLine"
                value={form.productLine}
                onChange={(e) => setForm({ ...form, productLine: e.target.value })}
                placeholder="Enter product line"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                  <SelectItem value="Consumer Goods">Consumer Goods</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unitsProduced">Units Produced</Label>
                <Input
                  id="unitsProduced"
                  type="number"
                  value={form.unitsProduced}
                  onChange={(e) => setForm({ ...form, unitsProduced: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetOutput">Target Output</Label>
                <Input
                  id="targetOutput"
                  type="number"
                  value={form.targetOutput}
                  onChange={(e) => setForm({ ...form, targetOutput: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="qualityScore">Quality Score %</Label>
                <Input
                  id="qualityScore"
                  type="number"
                  value={form.qualityScore}
                  onChange={(e) => setForm({ ...form, qualityScore: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="downtime">Downtime %</Label>
                <Input
                  id="downtime"
                  type="number"
                  value={form.downtime}
                  onChange={(e) => setForm({ ...form, downtime: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingRecord ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Production Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Period:</span>
                <span className="font-medium">{selectedRecord.period}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Plant:</span>
                <span className="font-medium">{selectedRecord.plant}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Product Line:</span>
                <span className="font-medium">{selectedRecord.productLine}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{selectedRecord.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Units Produced:</span>
                <span className="font-medium">{selectedRecord.unitsProduced.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Target Output:</span>
                <span className="font-medium">{selectedRecord.targetOutput.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Efficiency:</span>
                <span className="font-medium">{selectedRecord.efficiency.toFixed(1)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Quality Score:</span>
                <span className="font-medium">{selectedRecord.qualityScore.toFixed(1)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Downtime:</span>
                <span className="font-medium">{selectedRecord.downtime.toFixed(1)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedRecord.status)}>{selectedRecord.status}</Badge>
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

export default ManufacturingAnalytics;
