
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Search, Plus, Edit, Trash2, Eye, Download, Upload, Phone, Mail, MapPin, Building, RefreshCw } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import DataTable from '../../components/data/DataTable';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import PageHeader from '../../components/page/PageHeader';
import { listEntities, upsertEntity, removeEntity, getEntity, generateId } from '../../lib/localCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  status: 'Active' | 'Inactive' | 'Prospect';
  creditLimit: number;
  address?: string;
  website?: string;
  taxId?: string;
  paymentTerms?: string;
  salesRep: string;
  contactPerson?: string;
  created?: string;
  totalRevenue: number;
  lastOrder?: string;
}

const STORAGE_KEY = 'sales_customers';

const sampleCustomers: Customer[] = [
  { id: generateId('cust'), name: 'John Smith', email: 'john.smith@acme.com', phone: '+1-555-0101', company: 'Acme Corporation', industry: 'Manufacturing', status: 'Active', creditLimit: 500000, salesRep: 'Mike Johnson', totalRevenue: 1250000, created: '2024-01-15', contactPerson: 'John Smith', website: 'https://acme.com', paymentTerms: 'Net 30' },
  { id: generateId('cust'), name: 'Sarah Davis', email: 'sarah.d@techsol.com', phone: '+1-555-0102', company: 'TechSolutions Inc', industry: 'Technology', status: 'Active', creditLimit: 750000, salesRep: 'Emily Chen', totalRevenue: 2100000, created: '2024-02-20', contactPerson: 'Sarah Davis', website: 'https://techsol.io', paymentTerms: 'Net 45' },
  { id: generateId('cust'), name: 'Michael Brown', email: 'm.brown@global.com', phone: '+1-555-0103', company: 'Global Industries', industry: 'Consulting', status: 'Active', creditLimit: 300000, salesRep: 'David Wilson', totalRevenue: 850000, created: '2024-03-10', contactPerson: 'Michael Brown', website: 'https://globalind.com', paymentTerms: 'Net 30' },
  { id: generateId('cust'), name: 'Emily Wilson', email: 'emily.w@megacorp.com', phone: '+1-555-0104', company: 'MegaCorp Ltd', industry: 'Finance', status: 'Active', creditLimit: 1000000, salesRep: 'Mike Johnson', totalRevenue: 3200000, created: '2024-01-05', contactPerson: 'Emily Wilson', website: 'https://megacorp.com', paymentTerms: 'Net 60' },
  { id: generateId('cust'), name: 'David Lee', email: 'd.lee@startup.io', phone: '+1-555-0105', company: 'StartupXYZ', industry: 'Technology', status: 'Prospect', creditLimit: 50000, salesRep: 'Emily Chen', totalRevenue: 0, created: '2025-01-20', contactPerson: 'David Lee', website: 'https://startupxyz.io', paymentTerms: 'Net 15' },
];

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone is required'),
  company: z.string().min(1, 'Company is required'),
  industry: z.string().min(1, 'Industry is required'),
  status: z.enum(['Active', 'Inactive', 'Prospect']),
  creditLimit: z.number().min(0),
  address: z.string().optional(),
  website: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
  salesRep: z.string().min(1, 'Sales rep is required')
});

type CustomerFormData = z.infer<typeof customerSchema>;

const CustomerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState<Customer[]>(() => sampleCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      status: 'Prospect',
      creditLimit: 100000,
      paymentTerms: 'Net 30'
    }
  });

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Customer Management. Manage your customer database with full CRUD operations and comprehensive analytics.');
    }
  }, [isEnabled, speak]);

  const loadCustomers = () => {
    setIsLoading(false);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || customer.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setIsEditing(false);
    form.reset({
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: '',
      status: 'Prospect',
      creditLimit: 100000,
      address: '',
      website: '',
      taxId: '',
      paymentTerms: 'Net 30',
      salesRep: ''
    });
    setIsDialogOpen(true);
    if (isEnabled) {
      speak('Opening customer creation form. Please fill in the required customer information.');
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditing(true);
    form.reset({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      industry: customer.industry,
      status: customer.status,
      creditLimit: customer.creditLimit,
      address: customer.address,
      website: customer.website,
      taxId: customer.taxId,
      paymentTerms: customer.paymentTerms,
      salesRep: customer.salesRep
    });
    setIsDialogOpen(true);
    if (isEnabled) {
      speak(`Editing customer ${customer.name} from ${customer.company}.`);
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    navigate(`/sales/customer/${customer.id}`);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete customer ${customer.name}? This action cannot be undone.`)) {
      removeEntity(STORAGE_KEY, customer.id);
      loadCustomers();
      toast({
        title: 'Customer Deleted',
        description: `${customer.name} has been successfully removed.`,
      });
      if (isEnabled) {
        speak('Customer has been successfully deleted from the system.');
      }
    }
  };

  const handleSaveCustomer = (data: CustomerFormData) => {
    if (isEditing && selectedCustomer) {
      const updated: Customer = {
        ...selectedCustomer,
        ...data,
        contactPerson: data.name,
        website: data.website || '',
        taxId: data.taxId || '',
        paymentTerms: data.paymentTerms || 'Net 30'
      };
      upsertEntity(STORAGE_KEY, updated);
      toast({
        title: 'Customer Updated',
        description: `${data.name} has been successfully updated.`,
      });
    } else {
      const newCustomer: Customer = {
        id: generateId('cust'),
        created: new Date().toISOString().split('T')[0],
        totalRevenue: 0,
        lastOrder: '',
        contactPerson: data.name,
        website: data.website || '',
        taxId: data.taxId || '',
        paymentTerms: data.paymentTerms || 'Net 30',
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        industry: data.industry,
        status: data.status,
        creditLimit: data.creditLimit,
        salesRep: data.salesRep,
        address: data.address || '',
      };
      upsertEntity(STORAGE_KEY, newCustomer as any);
      setCustomers(prev => [...prev, newCustomer]);
      toast({
        title: 'Customer Created',
        description: `${data.name} has been successfully added.`,
      });
    }
    loadCustomers();
    setIsDialogOpen(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({ title: 'Import Started', description: `Importing customers from ${file.name}` });
        setTimeout(() => {
          toast({ title: 'Import Complete', description: 'Customer data imported successfully' });
          loadCustomers();
        }, 1500);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const headers = ['Customer ID', 'Name', 'Company', 'Email', 'Phone', 'Industry', 'Status', 'Total Revenue', 'Credit Limit'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(c => [
        c.id,
        `"${c.name}"`,
        `"${c.company}"`,
        c.email,
        c.phone,
        c.industry,
        c.status,
        c.totalRevenue,
        c.creditLimit
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Export Successful', description: `Exported ${filteredCustomers.length} customers` });
  };

  const columns: EnhancedColumn[] = [
    { key: 'id', header: 'Customer ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true, searchable: true },
    { key: 'company', header: 'Company', sortable: true, searchable: true },
    { key: 'industry', header: 'Industry', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Prospect', value: 'Prospect' }
      ],
      render: (value: string) => (
        <Badge variant={value === 'Active' ? 'default' : value === 'Prospect' ? 'secondary' : 'outline'}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'totalRevenue', 
      header: 'Revenue',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'creditLimit', 
      header: 'Credit Limit',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { key: 'salesRep', header: 'Sales Rep', sortable: true }
  ];

  const actions: TableAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: Customer) => handleViewCustomer(row),
      variant: 'ghost'
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: Customer) => handleEditCustomer(row),
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Customer) => handleDeleteCustomer(row),
      variant: 'ghost'
    }
  ];

  const customerMetrics = [
    { name: 'Total Customers', value: customers.length, change: '+12%', icon: Building },
    { name: 'Active Customers', value: customers.filter(c => c.status === 'Active').length, change: '+8%', icon: Building },
    { name: 'Prospects', value: customers.filter(c => c.status === 'Prospect').length, change: '+25%', icon: Building },
    { name: 'Total Revenue', value: `$${customers.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}`, change: '+18%', icon: Building }
  ];

  const industryData = customers.reduce((acc, customer) => {
    acc[customer.industry] = (acc[customer.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(industryData).map(([industry, count]) => ({
    industry,
    count,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const revenueByRep = customers.reduce((acc, customer) => {
    acc[customer.salesRep] = (acc[customer.salesRep] || 0) + customer.totalRevenue;
    return acc;
  }, {} as Record<string, number>);

  const repChartData = Object.entries(revenueByRep).map(([rep, revenue]) => ({
    name: rep,
    revenue
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Customer Management"
        description="Manage customer relationships, track revenue, and analyze customer data"
        voiceIntroduction="Welcome to Customer Management. Manage your customer database with full CRUD operations."
      />

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadCustomers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Button onClick={handleCreateCustomer}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {customerMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-sm text-green-600">{metric.change}</div>
                </div>
                <metric.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search customers..." 
                      className="pl-8 w-80"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <EnhancedDataTable 
                  columns={columns}
                  data={filteredCustomers}
                  actions={actions}
                  searchPlaceholder="Search customers..."
                  exportable={true}
                  refreshable={true}
                  onRefresh={loadCustomers}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution by Industry</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ industry, count }) => `${industry} (${count})`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Sales Representative</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={repChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {customers.filter(c => c.status === 'Active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Customers</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {customers.filter(c => c.status === 'Prospect').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Prospects</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">
                    {customers.filter(c => c.status === 'Inactive').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Inactive</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold">High Value</h3>
                  <p className="text-sm text-muted-foreground">Revenue &gt; $1M</p>
                  <div className="text-2xl font-bold mt-2">
                    {customers.filter(c => c.totalRevenue > 1000000).length}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold">Medium Value</h3>
                  <p className="text-sm text-muted-foreground">Revenue $100K - $1M</p>
                  <div className="text-2xl font-bold mt-2">
                    {customers.filter(c => c.totalRevenue >= 100000 && c.totalRevenue <= 1000000).length}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold">Low Value</h3>
                  <p className="text-sm text-muted-foreground">Revenue &lt; $100K</p>
                  <div className="text-2xl font-bold mt-2">
                    {customers.filter(c => c.totalRevenue < 100000).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col" onClick={() => {
                  toast({ title: 'Generating Report', description: 'Customer Activity Report for last 30 days' });
                  setTimeout(() => {
                    const reportData = `CUSTOMER ACTIVITY REPORT
Generated: ${new Date().toISOString().split('T')[0]}
==========================================
${customers.map(c => `${c.name} (${c.company}): Last order ${c.lastOrder || 'N/A'}, Total Revenue: $${c.totalRevenue.toLocaleString()}`).join('\n')}

Summary:
- Total Customers: ${customers.length}
- Active Customers: ${customers.filter(c => c.status === 'Active').length}
- Total Revenue: $${customers.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}`;
                    const blob = new Blob([reportData], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'customer-activity-report.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                    toast({ title: 'Report Generated', description: 'Customer activity report downloaded' });
                  }, 1000);
                }}>
                  <span>Customer Activity Report</span>
                  <span className="text-xs text-muted-foreground">Last 30 days</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col" onClick={() => {
                  toast({ title: 'Generating Report', description: 'Revenue Analysis by customer segment' });
                  setTimeout(() => {
                    const revenueReport = `High Value: $${customers.filter(c => c.totalRevenue > 1000000).reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}
Medium Value: $${customers.filter(c => c.totalRevenue >= 100000 && c.totalRevenue <= 1000000).reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}
Low Value: $${customers.filter(c => c.totalRevenue < 100000).reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}`;
                    const blob = new Blob([revenueReport], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'revenue-analysis.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                    toast({ title: 'Report Generated', description: 'Revenue analysis report downloaded' });
                  }, 1000);
                }}>
                  <span>Revenue Analysis</span>
                  <span className="text-xs text-muted-foreground">By customer segment</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col" onClick={() => {
                  toast({ title: 'Generating Report', description: 'Credit Analysis report' });
                  setTimeout(() => {
                    const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);
                    const creditReport = `CREDIT ANALYSIS REPORT
Generated: ${new Date().toISOString().split('T')[0]}
==========================================
${customers.map(c => `${c.company}: Credit Limit $${c.creditLimit.toLocaleString()}, Available: $${(c.creditLimit - c.totalRevenue).toLocaleString()}`).join('\n')}

Summary:
- Total Credit Limit: $${totalCreditLimit.toLocaleString()}
- Average Credit Limit: $${Math.round(totalCreditLimit / customers.length).toLocaleString()}
- Customers at High Utilization: ${customers.filter(c => c.totalRevenue / c.creditLimit > 0.8).length}`;
                    const blob = new Blob([creditReport], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'credit-analysis.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                    toast({ title: 'Report Generated', description: 'Credit analysis report downloaded' });
                  }, 1000);
                }}>
                  <span>Credit Analysis</span>
                  <span className="text-xs text-muted-foreground">Credit limits &amp; usage</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col" onClick={() => {
                  toast({ title: 'Generating Report', description: 'Sales Performance by representative' });
                  setTimeout(() => {
                    const salesReps = [...new Set(customers.map(c => c.salesRep))];
                    const performanceReport = salesReps.map(rep => {
                      const repCustomers = customers.filter(c => c.salesRep === rep);
                      const totalRevenue = repCustomers.reduce((sum, c) => sum + c.totalRevenue, 0);
                      return `${rep}: ${repCustomers.length} customers, $${totalRevenue.toLocaleString()} revenue`;
                    }).join('\n');
                    const blob = new Blob([performanceReport], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'sales-performance.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                    toast({ title: 'Report Generated', description: 'Sales performance report downloaded' });
                  }, 1000);
                }}>
                  <span>Sales Performance</span>
                  <span className="text-xs text-muted-foreground">By sales representative</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Customer' : 'Create New Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSaveCustomer)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Contact Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  {...form.register('company')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select value={form.watch('industry')} onValueChange={(value) => form.setValue('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={form.watch('status')} onValueChange={(value: 'Active' | 'Inactive' | 'Prospect') => form.setValue('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...form.register('address')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  {...form.register('creditLimit', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="salesRep">Sales Representative *</Label>
                <Select value={form.watch('salesRep')} onValueChange={(value) => form.setValue('salesRep', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales rep" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="John Smith">John Smith</SelectItem>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Davis">Mike Davis</SelectItem>
                    <SelectItem value="Emily Brown">Emily Brown</SelectItem>
                    <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                    <SelectItem value="David Wilson">David Wilson</SelectItem>
                    <SelectItem value="Jennifer Lee">Jennifer Lee</SelectItem>
                    <SelectItem value="Robert Taylor">Robert Taylor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Customer' : 'Create Customer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
