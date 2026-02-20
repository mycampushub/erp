
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
import { ArrowLeft, ShoppingCart, Users, Target, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MetricCard from '../../components/metrics/MetricCard';
import BarChartComponent from '../../components/charts/BarChartComponent';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface SalesRecord {
  id: string;
  period: string;
  product: string;
  category: string;
  region: string;
  sales: number;
  target: number;
  orders: number;
  units: number;
  margin: number;
  status: 'Achieved' | 'Below Target' | 'Above Target';
}

const defaultForm: Omit<SalesRecord, 'id'> = {
  period: '2024-01',
  product: '',
  category: 'Electronics',
  region: 'North America',
  sales: 0,
  target: 0,
  orders: 0,
  units: 0,
  margin: 0,
  status: 'Below Target',
};

const STORAGE_KEY = 'sap_salesanalytics';

const defaultSalesRecords: SalesRecord[] = [
  { id: '1', period: '2024-01', product: 'Laptop Pro X1', category: 'Electronics', region: 'North America', sales: 450000, target: 400000, orders: 245, units: 450, margin: 25, status: 'Achieved' },
  { id: '2', period: '2024-01', product: 'Wireless Mouse M5', category: 'Electronics', region: 'North America', sales: 85000, target: 75000, orders: 520, units: 2100, margin: 35, status: 'Achieved' },
  { id: '3', period: '2024-01', product: 'Office Chair C3', category: 'Furniture', region: 'Europe', sales: 120000, target: 150000, orders: 180, units: 360, margin: 40, status: 'Below Target' },
  { id: '4', period: '2024-01', product: 'Desk Lamp DL2', category: 'Lighting', region: 'Asia Pacific', sales: 45000, target: 50000, orders: 320, units: 890, margin: 30, status: 'Below Target' },
  { id: '5', period: '2024-02', product: 'Laptop Pro X1', category: 'Electronics', region: 'North America', sales: 520000, target: 450000, orders: 289, units: 520, margin: 26, status: 'Achieved' },
  { id: '6', period: '2024-02', product: 'Monitor Ultra 27', category: 'Electronics', region: 'Europe', sales: 180000, target: 160000, orders: 220, units: 440, margin: 28, status: 'Achieved' },
  { id: '7', period: '2024-02', product: 'Keyboard Mechanical', category: 'Electronics', region: 'North America', sales: 75000, target: 80000, orders: 410, units: 1650, margin: 38, status: 'Below Target' },
  { id: '8', period: '2024-02', product: 'Filing Cabinet FC5', category: 'Furniture', region: 'Asia Pacific', sales: 95000, target: 90000, orders: 145, units: 290, margin: 42, status: 'Achieved' },
  { id: '9', period: '2024-03', product: 'Laptop Pro X1', category: 'Electronics', region: 'North America', sales: 610000, target: 500000, orders: 342, units: 610, margin: 27, status: 'Above Target' },
  { id: '10', period: '2024-03', product: 'Webcam HD Pro', category: 'Electronics', region: 'Europe', sales: 65000, target: 55000, orders: 380, units: 1520, margin: 32, status: 'Achieved' },
  { id: '11', period: '2024-03', product: 'Standing Desk SD2', category: 'Furniture', region: 'North America', sales: 210000, target: 180000, orders: 165, units: 330, margin: 45, status: 'Achieved' },
  { id: '12', period: '2024-03', product: 'Headset Wireless', category: 'Electronics', region: 'Asia Pacific', sales: 88000, target: 95000, orders: 490, units: 1960, margin: 36, status: 'Below Target' },
  { id: '13', period: '2024-04', product: 'Laptop Pro X1', category: 'Electronics', region: 'Europe', sales: 480000, target: 520000, orders: 268, units: 480, margin: 25, status: 'Below Target' },
  { id: '14', period: '2024-04', product: 'Docking Station DS1', category: 'Electronics', region: 'North America', sales: 145000, target: 130000, orders: 290, units: 1160, margin: 30, status: 'Achieved' },
  { id: '15', period: '2024-04', product: 'Conference Table CT3', category: 'Furniture', region: 'Europe', sales: 320000, target: 280000, orders: 85, units: 170, margin: 48, status: 'Achieved' },
  { id: '16', period: '2024-04', product: 'USB-C Hub', category: 'Electronics', region: 'Asia Pacific', sales: 55000, target: 60000, orders: 410, units: 2450, margin: 42, status: 'Below Target' },
  { id: '17', period: '2024-05', product: 'Laptop Pro X1', category: 'Electronics', region: 'North America', sales: 720000, target: 600000, orders: 398, units: 720, margin: 28, status: 'Above Target' },
  { id: '18', period: '2024-05', product: 'Ergonomic Keyboard', category: 'Electronics', region: 'Europe', sales: 92000, target: 85000, orders: 520, units: 2080, margin: 40, status: 'Achieved' },
  { id: '19', period: '2024-05', product: 'Bookshelf BS5', category: 'Furniture', region: 'North America', sales: 78000, target: 70000, orders: 120, units: 480, margin: 38, status: 'Achieved' },
  { id: '20', period: '2024-05', product: 'Cable Organizer', category: 'Accessories', region: 'Asia Pacific', sales: 28000, target: 25000, orders: 380, units: 3200, margin: 55, status: 'Achieved' },
  { id: '21', period: '2024-06', product: 'Laptop Pro X1', category: 'Electronics', region: 'Europe', sales: 580000, target: 650000, orders: 325, units: 580, margin: 26, status: 'Below Target' },
  { id: '22', period: '2024-06', product: 'Power Bank PB2', category: 'Electronics', region: 'North America', sales: 48000, target: 45000, orders: 620, units: 4950, margin: 45, status: 'Achieved' },
  { id: '23', period: '2024-06', product: 'Desk Mat DM1', category: 'Accessories', region: 'Europe', sales: 22000, target: 20000, orders: 440, units: 3520, margin: 50, status: 'Achieved' },
  { id: '24', period: '2024-06', product: 'Monitor Stand MS3', category: 'Accessories', region: 'Asia Pacific', sales: 35000, target: 40000, orders: 210, units: 840, margin: 35, status: 'Below Target' },
  { id: '25', period: '2024-07', product: 'Laptop Pro X1', category: 'Electronics', region: 'North America', sales: 850000, target: 700000, orders: 465, units: 850, margin: 29, status: 'Above Target' },
  { id: '26', period: '2024-07', product: 'Webcam 4K Pro', category: 'Electronics', region: 'Europe', sales: 125000, target: 100000, orders: 285, units: 1140, margin: 33, status: 'Achieved' },
  { id: '27', period: '2024-07', product: 'Whiteboard WB2', category: 'Furniture', region: 'North America', sales: 65000, target: 60000, orders: 95, units: 380, margin: 42, status: 'Achieved' },
  { id: '28', period: '2024-08', product: 'Laptop Pro X1', category: 'Electronics', region: 'Asia Pacific', sales: 680000, target: 720000, orders: 378, units: 680, margin: 27, status: 'Below Target' },
  { id: '29', period: '2024-08', product: 'Wireless Charger', category: 'Electronics', region: 'North America', sales: 42000, target: 38000, orders: 720, units: 5760, margin: 48, status: 'Achieved' },
  { id: '30', period: '2024-08', product: 'Room Divider RD1', category: 'Furniture', region: 'Europe', sales: 185000, target: 160000, orders: 62, units: 248, margin: 46, status: 'Achieved' },
];

const SalesAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const [salesRecords, setSalesRecords] = useLocalStorage<SalesRecord[]>(STORAGE_KEY, defaultSalesRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalesRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);
  const [form, setForm] = useState<Omit<SalesRecord, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Sales Analytics. Track sales performance, customer behavior, and revenue trends across all channels.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingRecord(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (record: SalesRecord) => {
    setEditingRecord(record);
    setForm({
      period: record.period,
      product: record.product,
      category: record.category,
      region: record.region,
      sales: record.sales,
      target: record.target,
      orders: record.orders,
      units: record.units,
      margin: record.margin,
      status: record.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.product.trim()) {
      toast({ title: 'Validation Error', description: 'Product name is required.', variant: 'destructive' });
      return;
    }
    const status: 'Achieved' | 'Below Target' | 'Above Target' = 
      form.sales >= form.target ? (form.sales > form.target ? 'Above Target' : 'Achieved') : 'Below Target';

    if (editingRecord) {
      setSalesRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...editingRecord, ...form, status } : r));
      toast({ title: 'Sales Record Updated', description: `${form.product} for ${form.period} has been updated.` });
    } else {
      const newRecord: SalesRecord = {
        id: String(Date.now()),
        ...form,
        status,
      };
      setSalesRecords(prev => [...prev, newRecord]);
      toast({ title: 'Sales Record Created', description: `${form.product} for ${form.period} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (record: SalesRecord) => {
    setSalesRecords(prev => prev.filter(r => r.id !== record.id));
    toast({ title: 'Sales Record Deleted', description: `${record.product} has been removed.` });
  };

  const handleView = (record: SalesRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const totalSales = salesRecords.reduce((sum, r) => sum + r.sales, 0);
  const totalTarget = salesRecords.reduce((sum, r) => sum + r.target, 0);
  const totalOrders = salesRecords.reduce((sum, r) => sum + r.orders, 0);
  const totalUnits = salesRecords.reduce((sum, r) => sum + r.units, 0);

  const salesData = salesRecords.reduce((acc: { month: string; sales: number; target: number }[], record) => {
    const existing = acc.find(a => a.month === record.period);
    if (existing) {
      existing.sales += record.sales;
      existing.target += record.target;
    } else {
      acc.push({ month: record.period, sales: record.sales, target: record.target });
    }
    return acc;
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Achieved': 'bg-green-100 text-green-800',
      'Above Target': 'bg-blue-100 text-blue-800',
      'Below Target': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'period', header: 'Period' },
    { key: 'product', header: 'Product' },
    { key: 'category', header: 'Category' },
    { key: 'region', header: 'Region' },
    { key: 'sales', header: 'Sales', render: (value: number) => `$${value.toLocaleString()}` },
    { key: 'target', header: 'Target', render: (value: number) => `$${value.toLocaleString()}` },
    { key: 'orders', header: 'Orders' },
    { key: 'units', header: 'Units' },
    { key: 'margin', header: 'Margin', render: (value: number) => `${value}%` },
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
      render: (_: any, row: SalesRecord) => (
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
          title="Sales Analytics"
          description="Sales performance and customer analytics"
          voiceIntroduction="Welcome to Sales Analytics."
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Sales Records</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="products">Product Analysis</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Total Sales"
                value={`$${(totalSales / 1000000).toFixed(1)}M`}
                trend={{ value: "18.5%", direction: "up", label: "YTD" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Total Orders"
                value={totalOrders.toLocaleString()}
                trend={{ value: "12.3%", direction: "up", label: "YTD" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Units Sold"
                value={totalUnits.toLocaleString()}
                trend={{ value: "15.2%", direction: "up", label: "YTD" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Target Achievement"
                value={`${((totalSales / totalTarget) * 100).toFixed(1)}%`}
                trend={{ value: "4.1%", direction: "up", label: "YTD" }}
              />
            </Card>
          </div>

          <Card className="p-6">
            <BarChartComponent
              data={salesData}
              dataKey="sales"
              xAxisKey="month"
              title="Sales vs Target by Period"
              subtitle="Monthly sales performance against targets"
              height={400}
              color="#059669"
            />
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sales Records</h2>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Record
            </Button>
          </div>
          <Card className="p-6">
            <DataTable columns={columns} data={salesRecords} />
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Sales Growth"
                value="18.5%"
                trend={{ value: "2.3%", direction: "up", label: "vs last quarter" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Target Achievement"
                value={`${((totalSales / totalTarget) * 100).toFixed(1)}%`}
                trend={{ value: "4.1%", direction: "up", label: "vs last month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Sales Cycle"
                value="28 days"
                trend={{ value: "3 days", direction: "down", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
            <DataTable columns={columns.slice(1, 5)} data={salesRecords.sort((a, b) => b.sales - a.sales).slice(0, 10)} />
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Customer Lifetime Value"
                value="$8,450"
                trend={{ value: "12.3%", direction: "up", label: "vs last quarter" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Customer Retention"
                value="87.5%"
                trend={{ value: "2.1%", direction: "up", label: "vs last quarter" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Churn Rate"
                value="2.3%"
                trend={{ value: "0.5%", direction: "down", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Sales Record' : 'Create Sales Record'}</DialogTitle>
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
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Lighting">Lighting</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product">Product Name</Label>
              <Input
                id="product"
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                placeholder="Enter product name"
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
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sales">Sales Amount</Label>
                <Input
                  id="sales"
                  type="number"
                  value={form.sales}
                  onChange={(e) => setForm({ ...form, sales: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="orders">Orders</Label>
                <Input
                  id="orders"
                  type="number"
                  value={form.orders}
                  onChange={(e) => setForm({ ...form, orders: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="units">Units</Label>
                <Input
                  id="units"
                  type="number"
                  value={form.units}
                  onChange={(e) => setForm({ ...form, units: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="margin">Margin (%)</Label>
              <Input
                id="margin"
                type="number"
                value={form.margin}
                onChange={(e) => setForm({ ...form, margin: parseFloat(e.target.value) || 0 })}
              />
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
            <DialogTitle>Sales Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Period:</span>
                <span className="font-medium">{selectedRecord.period}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Product:</span>
                <span className="font-medium">{selectedRecord.product}</span>
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
                <span className="text-gray-500">Sales:</span>
                <span className="font-medium">${selectedRecord.sales.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Target:</span>
                <span className="font-medium">${selectedRecord.target.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Orders:</span>
                <span className="font-medium">{selectedRecord.orders}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Units:</span>
                <span className="font-medium">{selectedRecord.units}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Margin:</span>
                <span className="font-medium">{selectedRecord.margin}%</span>
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

export default SalesAnalytics;
