
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Download, Filter, TrendingUp, TrendingDown, Calendar, Users, DollarSign, Target, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from 'recharts';
import { listEntities, generateId } from '../../lib/localCrud';
import { useToast } from '../../hooks/use-toast';

interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: string;
  totalAmount: number;
  status: string;
  salesRep: string;
}

interface Customer {
  id: string;
  name: string;
  status: string;
}

interface Invoice {
  id: string;
  status: string;
  amount: number;
}

const sampleOrders: SalesOrder[] = [
  { id: generateId('so'), orderNumber: 'SO-001', customer: 'Acme Corp', totalAmount: 50000, status: 'Completed', salesRep: 'John Smith' },
  { id: generateId('so'), orderNumber: 'SO-002', customer: 'Tech Inc', totalAmount: 75000, status: 'In Progress', salesRep: 'Sarah Johnson' },
];

const sampleCustomers: Customer[] = [
  { id: generateId('cust'), name: 'Acme Corp', status: 'Active' },
  { id: generateId('cust'), name: 'Tech Inc', status: 'Active' },
];

const sampleInvoices: Invoice[] = [
  { id: generateId('inv'), status: 'Posted', amount: 50000 },
  { id: generateId('inv'), status: 'Posted', amount: 75000 },
];

const SalesAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('12months');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<SalesOrder[]>(() => sampleOrders);
  const [customers, setCustomers] = useState<Customer[]>(() => sampleCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>(() => sampleInvoices);
  const { toast } = useToast();

  const loadData = () => {
    setIsLoading(false);
  };

  const totalRevenue = invoices.filter(i => i.status === 'Posted').reduce((sum, i) => sum + i.amount, 0);
  const totalOrders = orders.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const salesData = months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 100000) + 100000,
    orders: Math.floor(Math.random() * 50) + 20,
    newCustomers: Math.floor(Math.random() * 20) + 5,
    target: 150000
  }));

  const productPerformance = [
    { product: 'Enterprise Software', revenue: 450000, units: 125, growth: 15.2 },
    { product: 'Professional Services', revenue: 320000, units: 89, growth: 8.7 },
    { product: 'Hardware Solutions', revenue: 280000, units: 156, growth: -2.3 },
    { product: 'Support Packages', revenue: 180000, units: 234, growth: 22.1 },
    { product: 'Training Services', revenue: 120000, units: 67, growth: 12.8 }
  ];

  const salesRepData = [...new Set(orders.map(o => o.salesRep))].slice(0, 5).map(rep => ({
    name: rep,
    revenue: orders.filter(o => o.salesRep === rep).reduce((sum, o) => sum + o.totalAmount, 0),
    orders: orders.filter(o => o.salesRep === rep).length
  }));

  const regionData = [
    { region: 'North America', revenue: 580000, share: 35, color: '#8884d8' },
    { region: 'Europe', revenue: 450000, share: 27, color: '#82ca9d' },
    { region: 'Asia Pacific', revenue: 320000, share: 19, color: '#ffc658' },
    { region: 'Latin America', revenue: 180000, share: 11, color: '#ff7300' },
    { region: 'Middle East', revenue: 130000, share: 8, color: '#00ff88' }
  ];

  const customerSegments = [
    { segment: 'Enterprise', revenue: 850000, customers: 45, avgOrder: 18888 },
    { segment: 'Mid-Market', revenue: 520000, customers: 128, avgOrder: 4062 },
    { segment: 'Small Business', revenue: 280000, customers: 234, avgOrder: 1196 },
    { segment: 'Startup', revenue: 120000, customers: 156, avgOrder: 769 }
  ];

  const kpiMetrics = [
    { title: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, change: '+18.5%', trend: 'up', icon: DollarSign },
    { title: 'Total Orders', value: totalOrders.toString(), change: '+12.3%', trend: 'up', icon: Target },
    { title: 'New Customers', value: activeCustomers.toString(), change: '+25.7%', trend: 'up', icon: Users },
    { title: 'Avg Order Value', value: `$${avgOrderValue.toFixed(0)}`, change: '+5.2%', trend: 'up', icon: TrendingUp },
    { title: 'Conversion Rate', value: '14.8%', change: '+2.1%', trend: 'up', icon: TrendingUp },
    { title: 'Customer Retention', value: '89.2%', change: '-1.3%', trend: 'down', icon: TrendingDown }
  ];

  const handleExport = () => {
    toast({ title: 'Exporting', description: 'Analytics data export started...' });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Sales Analytics</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className={`text-sm flex items-center ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {metric.change}
                  </div>
                </div>
                <metric.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="salesreps">Sales Reps</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Target</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={salesData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Actual Revenue" />
                    <Line type="monotone" dataKey="target" stroke="#ff7300" strokeWidth={2} name="Target" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ region, share }) => `${region} ${share}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={salesData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" name="Revenue" />
                  <Area type="monotone" dataKey="orders" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Orders (scaled)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="newCustomers" fill="#82ca9d" name="New Customers" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productPerformance.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{product.product}</div>
                      <div className="text-sm text-muted-foreground">
                        ${product.revenue.toLocaleString()} revenue • {product.units} units sold
                      </div>
                    </div>
                    <Badge variant={product.growth > 0 ? 'default' : 'destructive'}>
                      {product.growth > 0 ? '+' : ''}{product.growth}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productPerformance}>
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salesreps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Representative Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesRepData.map((rep, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{rep.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${rep.revenue.toLocaleString()} revenue • {rep.orders} orders
                      </div>
                    </div>
                  </div>
                ))}
                {salesRepData.length === 0 && (
                  <div className="text-center p-4 text-muted-foreground">No sales rep data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ region, share }) => `${region} ${share}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {customerSegments.map((segment, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="font-medium">{segment.segment}</div>
                    <div className="text-2xl font-bold mt-2">${segment.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {segment.customers} customers • ${segment.avgOrder.toLocaleString()} avg order
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesAnalytics;
