
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
import { ArrowLeft, Package, TrendingDown, DollarSign, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MetricCard from '../../components/metrics/MetricCard';
import BarChartComponent from '../../components/charts/BarChartComponent';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface ProcurementRecord {
  id: string;
  period: string;
  supplier: string;
  category: string;
  region: string;
  spend: number;
  savings: number;
  targetSavings: number;
  onTimeDelivery: number;
  qualityScore: number;
  status: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

const defaultForm: Omit<ProcurementRecord, 'id'> = {
  period: '2024-01',
  supplier: '',
  category: 'Raw Materials',
  region: 'North America',
  spend: 0,
  savings: 0,
  targetSavings: 0,
  onTimeDelivery: 0,
  qualityScore: 0,
  status: 'Average',
};

const STORAGE_KEY = 'sap_procurementanalytics';

const defaultProcurementRecords: ProcurementRecord[] = [
  { id: '1', period: '2024-01', supplier: 'Global Materials Inc', category: 'Raw Materials', region: 'North America', spend: 250000, savings: 25000, targetSavings: 20000, onTimeDelivery: 98, qualityScore: 97, status: 'Excellent' },
  { id: '2', period: '2024-01', supplier: 'Tech Components Ltd', category: 'Electronics', region: 'Asia Pacific', spend: 180000, savings: 15000, targetSavings: 18000, onTimeDelivery: 92, qualityScore: 95, status: 'Good' },
  { id: '3', period: '2024-01', supplier: 'European Logistics', category: 'Services', region: 'Europe', spend: 120000, savings: 12000, targetSavings: 10000, onTimeDelivery: 95, qualityScore: 98, status: 'Excellent' },
  { id: '4', period: '2024-01', supplier: 'Industrial Equipment Co', category: 'Equipment', region: 'North America', spend: 95000, savings: 8500, targetSavings: 10000, onTimeDelivery: 88, qualityScore: 92, status: 'Average' },
  { id: '5', period: '2024-01', supplier: 'Office Supplies Direct', category: 'Office Supplies', region: 'North America', spend: 35000, savings: 3500, targetSavings: 3000, onTimeDelivery: 99, qualityScore: 94, status: 'Excellent' },
  { id: '6', period: '2024-02', supplier: 'Global Materials Inc', category: 'Raw Materials', region: 'North America', spend: 280000, savings: 32000, targetSavings: 25000, onTimeDelivery: 97, qualityScore: 96, status: 'Excellent' },
  { id: '7', period: '2024-02', supplier: 'Tech Components Ltd', category: 'Electronics', region: 'Asia Pacific', spend: 195000, savings: 22000, targetSavings: 20000, onTimeDelivery: 94, qualityScore: 97, status: 'Excellent' },
  { id: '8', period: '2024-02', supplier: 'Latin America Trade', category: 'Raw Materials', region: 'Latin America', spend: 145000, savings: 10000, targetSavings: 12000, onTimeDelivery: 85, qualityScore: 90, status: 'Average' },
  { id: '9', period: '2024-02', supplier: 'Industrial Equipment Co', category: 'Equipment', region: 'North America', spend: 110000, savings: 12000, targetSavings: 11000, onTimeDelivery: 90, qualityScore: 94, status: 'Good' },
  { id: '10', period: '2024-02', supplier: 'European Logistics', category: 'Services', region: 'Europe', spend: 135000, savings: 15000, targetSavings: 12000, onTimeDelivery: 96, qualityScore: 97, status: 'Excellent' },
  { id: '11', period: '2024-03', supplier: 'Global Materials Inc', category: 'Raw Materials', region: 'North America', spend: 310000, savings: 38000, targetSavings: 30000, onTimeDelivery: 99, qualityScore: 98, status: 'Excellent' },
  { id: '12', period: '2024-03', supplier: 'Middle East Suppliers', category: 'Chemicals', region: 'Middle East', spend: 165000, savings: 12000, targetSavings: 15000, onTimeDelivery: 82, qualityScore: 88, status: 'Poor' },
  { id: '13', period: '2024-03', supplier: 'Tech Components Ltd', category: 'Electronics', region: 'Asia Pacific', spend: 210000, savings: 25000, targetSavings: 22000, onTimeDelivery: 93, qualityScore: 96, status: 'Excellent' },
  { id: '14', period: '2024-03', supplier: 'Office Supplies Direct', category: 'Office Supplies', region: 'North America', spend: 38000, savings: 4200, targetSavings: 3500, onTimeDelivery: 98, qualityScore: 95, status: 'Excellent' },
  { id: '15', period: '2024-03', supplier: 'European Logistics', category: 'Services', region: 'Europe', spend: 145000, savings: 18000, targetSavings: 14000, onTimeDelivery: 97, qualityScore: 99, status: 'Excellent' },
  { id: '16', period: '2024-04', supplier: 'Global Materials Inc', category: 'Raw Materials', region: 'North America', spend: 295000, savings: 35000, targetSavings: 28000, onTimeDelivery: 96, qualityScore: 97, status: 'Excellent' },
  { id: '17', period: '2024-04', supplier: 'African Minerals', category: 'Raw Materials', region: 'Africa', spend: 125000, savings: 8000, targetSavings: 10000, onTimeDelivery: 78, qualityScore: 85, status: 'Poor' },
  { id: '18', period: '2024-04', supplier: 'Tech Components Ltd', category: 'Electronics', region: 'Asia Pacific', spend: 225000, savings: 28000, targetSavings: 24000, onTimeDelivery: 95, qualityScore: 98, status: 'Excellent' },
  { id: '19', period: '2024-04', supplier: 'Industrial Equipment Co', category: 'Equipment', region: 'North America', spend: 135000, savings: 16000, targetSavings: 14000, onTimeDelivery: 91, qualityScore: 93, status: 'Good' },
  { id: '20', period: '2024-04', supplier: 'Latin America Trade', category: 'Raw Materials', region: 'Latin America', spend: 155000, savings: 14000, targetSavings: 13000, onTimeDelivery: 87, qualityScore: 91, status: 'Good' },
  { id: '21', period: '2024-05', supplier: 'Global Materials Inc', category: 'Raw Materials', region: 'North America', spend: 320000, savings: 42000, targetSavings: 32000, onTimeDelivery: 98, qualityScore: 99, status: 'Excellent' },
  { id: '22', period: '2024-05', supplier: 'European Logistics', category: 'Services', region: 'Europe', spend: 155000, savings: 20000, targetSavings: 15000, onTimeDelivery: 96, qualityScore: 98, status: 'Excellent' },
  { id: '23', period: '2024-05', supplier: 'Tech Components Ltd', category: 'Electronics', region: 'Asia Pacific', spend: 240000, savings: 30000, targetSavings: 25000, onTimeDelivery: 94, qualityScore: 97, status: 'Excellent' },
  { id: '24', period: '2024-05', supplier: 'Office Supplies Direct', category: 'Office Supplies', region: 'North America', spend: 42000, savings: 5000, targetSavings: 4000, onTimeDelivery: 99, qualityScore: 96, status: 'Excellent' },
  { id: '25', period: '2024-06', supplier: 'Global Materials Inc', category: 'Raw Materials', region: 'North America', spend: 305000, savings: 38000, targetSavings: 30000, onTimeDelivery: 97, qualityScore: 98, status: 'Excellent' },
  { id: '26', period: '2024-06', supplier: 'Industrial Equipment Co', category: 'Equipment', region: 'North America', spend: 145000, savings: 18000, targetSavings: 15000, onTimeDelivery: 92, qualityScore: 95, status: 'Excellent' },
  { id: '27', period: '2024-06', supplier: 'Middle East Suppliers', category: 'Chemicals', region: 'Middle East', spend: 175000, savings: 15000, targetSavings: 16000, onTimeDelivery: 84, qualityScore: 89, status: 'Average' },
  { id: '28', period: '2024-06', supplier: 'European Logistics', category: 'Services', region: 'Europe', spend: 160000, savings: 22000, targetSavings: 16000, onTimeDelivery: 97, qualityScore: 98, status: 'Excellent' },
  { id: '29', period: '2024-07', supplier: 'Tech Components Ltd', category: 'Electronics', region: 'Asia Pacific', spend: 255000, savings: 32000, targetSavings: 26000, onTimeDelivery: 96, qualityScore: 98, status: 'Excellent' },
  { id: '30', period: '2024-07', supplier: 'Global Materials Inc', category: 'Raw Materials', region: 'North America', spend: 330000, savings: 45000, targetSavings: 33000, onTimeDelivery: 99, qualityScore: 99, status: 'Excellent' },
];

const ProcurementAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const [procurementRecords, setProcurementRecords] = useLocalStorage<ProcurementRecord[]>(STORAGE_KEY, defaultProcurementRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProcurementRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ProcurementRecord | null>(null);
  const [form, setForm] = useState<Omit<ProcurementRecord, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Procurement Analytics. Analyze supplier performance, cost savings, and procurement efficiency metrics.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingRecord(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (record: ProcurementRecord) => {
    setEditingRecord(record);
    setForm({
      period: record.period,
      supplier: record.supplier,
      category: record.category,
      region: record.region,
      spend: record.spend,
      savings: record.savings,
      targetSavings: record.targetSavings,
      onTimeDelivery: record.onTimeDelivery,
      qualityScore: record.qualityScore,
      status: record.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.supplier.trim()) {
      toast({ title: 'Validation Error', description: 'Supplier name is required.', variant: 'destructive' });
      return;
    }
    const status: 'Excellent' | 'Good' | 'Average' | 'Poor' = 
      form.onTimeDelivery >= 95 && form.qualityScore >= 95 ? 'Excellent' :
      form.onTimeDelivery >= 90 && form.qualityScore >= 90 ? 'Good' :
      form.onTimeDelivery >= 80 && form.qualityScore >= 80 ? 'Average' : 'Poor';

    if (editingRecord) {
      setProcurementRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...editingRecord, ...form, status } : r));
      toast({ title: 'Procurement Record Updated', description: `${form.supplier} for ${form.period} has been updated.` });
    } else {
      const newRecord: ProcurementRecord = {
        id: String(Date.now()),
        ...form,
        status,
      };
      setProcurementRecords(prev => [...prev, newRecord]);
      toast({ title: 'Procurement Record Created', description: `${form.supplier} for ${form.period} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (record: ProcurementRecord) => {
    setProcurementRecords(prev => prev.filter(r => r.id !== record.id));
    toast({ title: 'Procurement Record Deleted', description: `${record.supplier} has been removed.` });
  };

  const handleView = (record: ProcurementRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const totalSpend = procurementRecords.reduce((sum, r) => sum + r.spend, 0);
  const totalSavings = procurementRecords.reduce((sum, r) => sum + r.savings, 0);
  const avgOnTime = procurementRecords.reduce((sum, r) => sum + r.onTimeDelivery, 0) / procurementRecords.length;
  const avgQuality = procurementRecords.reduce((sum, r) => sum + r.qualityScore, 0) / procurementRecords.length;

  const spendData = procurementRecords.reduce((acc: { category: string; spend: number; savings: number }[], record) => {
    const existing = acc.find(a => a.category === record.category);
    if (existing) {
      existing.spend += record.spend;
      existing.savings += record.savings;
    } else {
      acc.push({ category: record.category, spend: record.spend, savings: record.savings });
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
    { key: 'supplier', header: 'Supplier' },
    { key: 'category', header: 'Category' },
    { key: 'region', header: 'Region' },
    { key: 'spend', header: 'Spend', render: (value: number) => `$${value.toLocaleString()}` },
    { key: 'savings', header: 'Savings', render: (value: number) => `$${value.toLocaleString()}` },
    { key: 'targetSavings', header: 'Target', render: (value: number) => `$${value.toLocaleString()}` },
    { key: 'onTimeDelivery', header: 'On-Time %', render: (value: number) => `${value}%` },
    { key: 'qualityScore', header: 'Quality', render: (value: number) => `${value}%` },
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
      render: (_: any, row: ProcurementRecord) => (
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
          title="Procurement Analytics"
          description="Supplier performance and procurement cost analysis"
          voiceIntroduction="Welcome to Procurement Analytics."
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Procurement Records</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Performance</TabsTrigger>
          <TabsTrigger value="savings">Cost Savings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Total Spend"
                value={`$${(totalSpend / 1000000).toFixed(1)}M`}
                trend={{ value: "5.2%", direction: "down", label: "cost reduction" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Total Savings"
                value={`$${(totalSavings / 1000).toFixed(0)}K`}
                trend={{ value: "18.5%", direction: "up", label: "vs target" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Avg On-Time"
                value={`${avgOnTime.toFixed(1)}%`}
                trend={{ value: "2.3%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Avg Quality"
                value={`${avgQuality.toFixed(1)}%`}
                trend={{ value: "1.5%", direction: "up", label: "improvement" }}
              />
            </Card>
          </div>

          <Card className="p-6">
            <BarChartComponent
              data={spendData}
              dataKey="spend"
              xAxisKey="category"
              title="Spend by Category"
              subtitle="Procurement spend distribution"
              height={400}
              color="#7c3aed"
            />
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Procurement Records</h2>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Record
            </Button>
          </div>
          <Card className="p-6">
            <DataTable columns={columns} data={procurementRecords} />
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Supplier Performance</h3>
            <DataTable columns={columns.slice(1, 10)} data={procurementRecords.sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 15)} />
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="YTD Savings"
                value={`$${(totalSavings / 1000).toFixed(0)}K`}
                trend={{ value: "15.3%", direction: "up", label: "vs target" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Savings Rate"
                value={`${((totalSavings / totalSpend) * 100).toFixed(1)}%`}
                trend={{ value: "1.2%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Active Suppliers"
                value={String(procurementRecords.length)}
                trend={{ value: "30", direction: "up", label: "records" }}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Procurement Record' : 'Create Procurement Record'}</DialogTitle>
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
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Chemicals">Chemicals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier Name</Label>
              <Input
                id="supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Enter supplier name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">Region</Label>
              <Select value={form.region} onValueChange={(value) => setForm({ ...form, region: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                  <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                  <SelectItem value="Latin America">Latin America</SelectItem>
                  <SelectItem value="Middle East">Middle East</SelectItem>
                  <SelectItem value="Africa">Africa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="spend">Spend</Label>
                <Input
                  id="spend"
                  type="number"
                  value={form.spend}
                  onChange={(e) => setForm({ ...form, spend: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="savings">Savings</Label>
                <Input
                  id="savings"
                  type="number"
                  value={form.savings}
                  onChange={(e) => setForm({ ...form, savings: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetSavings">Target</Label>
                <Input
                  id="targetSavings"
                  type="number"
                  value={form.targetSavings}
                  onChange={(e) => setForm({ ...form, targetSavings: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="onTimeDelivery">On-Time Delivery %</Label>
                <Input
                  id="onTimeDelivery"
                  type="number"
                  value={form.onTimeDelivery}
                  onChange={(e) => setForm({ ...form, onTimeDelivery: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qualityScore">Quality Score %</Label>
                <Input
                  id="qualityScore"
                  type="number"
                  value={form.qualityScore}
                  onChange={(e) => setForm({ ...form, qualityScore: parseFloat(e.target.value) || 0 })}
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
            <DialogTitle>Procurement Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Period:</span>
                <span className="font-medium">{selectedRecord.period}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Supplier:</span>
                <span className="font-medium">{selectedRecord.supplier}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{selectedRecord.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Region:</span>
                <span className="font-medium">{selectedRecord.region}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Spend:</span>
                <span className="font-medium">${selectedRecord.spend.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Savings:</span>
                <span className="font-medium">${selectedRecord.savings.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Target Savings:</span>
                <span className="font-medium">${selectedRecord.targetSavings.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">On-Time Delivery:</span>
                <span className="font-medium">{selectedRecord.onTimeDelivery}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Quality Score:</span>
                <span className="font-medium">{selectedRecord.qualityScore}%</span>
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

export default ProcurementAnalytics;
