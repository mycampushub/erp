import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Download, Filter, TrendingUp, DollarSign, Target, BarChart, Save } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import DataTable, { Column } from '../../components/data/DataTable';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { useForm } from 'react-hook-form';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';

const ProfitCenterAccounting: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('centers');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateTransferOpen, setIsCreateTransferOpen] = useState(false);
  const [isViewTransferOpen, setIsViewTransferOpen] = useState(false);
  const [isEditTransferOpen, setIsEditTransferOpen] = useState(false);
  const [selectedProfitCenter, setSelectedProfitCenter] = useState<any>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [centerFilter, setCenterFilter] = useState('');
  const [transferFilter, setTransferFilter] = useState('');
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      profitCenterCode: '',
      name: '',
      description: '',
      manager: '',
      businessSegment: '',
      targetProfit: ''
    }
  });

  React.useEffect(() => {
    if (isEnabled) {
      speak('You are now in Profit Center Accounting. Here you can manage profit centers, analyze profitability, and track financial performance by business segments.');
    }
  }, [isEnabled, speak]);

  const [profitCenters, setProfitCenters] = useState([
    { 
      id: 'PC-001',
      profitCenterCode: 'PC-1000',
      name: 'North America Operations',
      description: 'Sales and operations in North America',
      manager: 'Alice Johnson',
      businessSegment: 'Regional Operations',
      revenue: 2500000,
      costs: 1800000,
      profit: 700000,
      targetProfit: 750000,
      profitMargin: 28.0,
      status: 'Active'
    },
    { 
      id: 'PC-002',
      profitCenterCode: 'PC-2000',
      name: 'Product Line A',
      description: 'Consumer electronics product line',
      manager: 'Bob Smith',
      businessSegment: 'Product Lines',
      revenue: 1800000,
      costs: 1350000,
      profit: 450000,
      targetProfit: 500000,
      profitMargin: 25.0,
      status: 'Active'
    },
    { 
      id: 'PC-003',
      profitCenterCode: 'PC-3000',
      name: 'Enterprise Services',
      description: 'B2B services and consulting',
      manager: 'Carol Davis',
      businessSegment: 'Services',
      revenue: 1200000,
      costs: 900000,
      profit: 300000,
      targetProfit: 320000,
      profitMargin: 25.0,
      status: 'Active'
    }
  ]);

  const [performance, setPerformance] = useState([
    { period: '2024-01', profitCenter: 'PC-1000', revenue: 480000, costs: 350000, profit: 130000, margin: 27.1 },
    { period: '2024-01', profitCenter: 'PC-2000', revenue: 350000, costs: 265000, profit: 85000, margin: 24.3 },
    { period: '2024-01', profitCenter: 'PC-3000', revenue: 230000, costs: 175000, profit: 55000, margin: 23.9 },
    { period: '2024-02', profitCenter: 'PC-1000', revenue: 510000, costs: 370000, profit: 140000, margin: 27.5 },
    { period: '2024-02', profitCenter: 'PC-2000', revenue: 380000, costs: 280000, profit: 100000, margin: 26.3 }
  ]);

  const [transfers, setTransfers] = useState([
    { id: 'TF-001', fromCenter: 'PC-1000', toCenter: 'PC-2000', amount: 50000, description: 'Shared IT Services', date: '2024-05-20', status: 'Posted' },
    { id: 'TF-002', fromCenter: 'PC-3000', toCenter: 'PC-1000', amount: 25000, description: 'Consulting Services', date: '2024-05-18', status: 'Posted' },
    { id: 'TF-003', fromCenter: 'PC-2000', toCenter: 'PC-3000', amount: 15000, description: 'Product Support', date: '2024-05-15', status: 'Pending' }
  ]);

  const handleCreate = (data: any) => {
    const newProfitCenter = {
      id: `PC-${String(profitCenters.length + 1).padStart(3, '0')}`,
      profitCenterCode: data.profitCenterCode,
      name: data.name,
      description: data.description,
      manager: data.manager,
      businessSegment: data.businessSegment,
      revenue: 0,
      costs: 0,
      profit: 0,
      targetProfit: parseFloat(data.targetProfit),
      profitMargin: 0,
      status: 'Active'
    };
    setProfitCenters([...profitCenters, newProfitCenter]);
    setIsCreateDialogOpen(false);
    form.reset();
    toast({ title: 'Profit Center Created', description: `${data.name} has been created successfully.` });
  };

  const handleEdit = (profitCenter: any) => {
    setSelectedProfitCenter(profitCenter);
    form.reset({
      profitCenterCode: profitCenter.profitCenterCode,
      name: profitCenter.name,
      description: profitCenter.description,
      manager: profitCenter.manager,
      businessSegment: profitCenter.businessSegment,
      targetProfit: profitCenter.targetProfit.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: any) => {
    setProfitCenters(profitCenters.map(pc => 
      pc.id === selectedProfitCenter?.id 
        ? { 
            ...pc, 
            profitCenterCode: data.profitCenterCode,
            name: data.name,
            description: data.description,
            manager: data.manager,
            businessSegment: data.businessSegment,
            targetProfit: parseFloat(data.targetProfit)
          } 
        : pc
    ));
    setIsEditDialogOpen(false);
    setSelectedProfitCenter(null);
    toast({ title: 'Profit Center Updated', description: 'The profit center has been updated successfully.' });
  };

  const handleDelete = (id: string) => {
    setProfitCenters(profitCenters.filter(pc => pc.id !== id));
    toast({ title: 'Profit Center Deleted', description: 'The profit center has been deleted successfully.' });
  };

  const handleView = (profitCenter: any) => {
    setSelectedProfitCenter(profitCenter);
    setIsViewDialogOpen(true);
    toast({ title: 'View Profit Center', description: `Viewing details for ${profitCenter.name}` });
  };

  const handleExportAnalysis = () => {
    const headers = ['Period', 'Profit Center', 'Revenue', 'Costs', 'Profit', 'Margin %'];
    const csvContent = [
      headers.join(','),
      ...performance.map(row => 
        `${row.period},${row.profitCenter},${row.revenue},${row.costs},${row.profit},${row.margin}%`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `profit_center_performance_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Export Complete', description: 'Performance analysis report downloaded successfully.' });
  };

  const handleExportTransfer = (row: any) => {
    const data = [row];
    const headers = ['Date', 'From Center', 'To Center', 'Amount', 'Description', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(r => `${r.date},${r.fromCenter},${r.toCenter},${r.amount},${r.description},${r.status}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transfer_${row.fromCenter}_${row.date}.csv`;
    link.click();
    toast({ title: 'Export Complete', description: 'Transfer data exported successfully.' });
  };

  const handleViewTransfer = (row: any) => {
    setSelectedTransfer(row);
    setIsViewTransferOpen(true);
  };

  const handleEditTransfer = (row: any) => {
    setSelectedTransfer(row);
    setIsEditTransferOpen(true);
  };

  const handleToggleFilter = () => {
    setFilterOpen(!filterOpen);
    toast({ title: filterOpen ? 'Filter Closed' : 'Filter Open', description: filterOpen ? 'Showing all records' : 'Use filters to narrow down results' });
  };

  const filteredProfitCenters = profitCenters.filter(pc => 
    centerFilter === '' || 
    pc.name.toLowerCase().includes(centerFilter.toLowerCase()) ||
    pc.profitCenterCode.toLowerCase().includes(centerFilter.toLowerCase()) ||
    pc.businessSegment.toLowerCase().includes(centerFilter.toLowerCase())
  );

  const filteredTransfers = transfers.filter(t => 
    transferFilter === '' || 
    t.fromCenter.toLowerCase().includes(transferFilter.toLowerCase()) ||
    t.toCenter.toLowerCase().includes(transferFilter.toLowerCase()) ||
    t.description.toLowerCase().includes(transferFilter.toLowerCase())
  );

  const profitCenterColumns: Column[] = [
    { key: 'profitCenterCode', header: 'Profit Center Code' },
    { key: 'name', header: 'Name' },
    { key: 'manager', header: 'Manager' },
    { key: 'businessSegment', header: 'Business Segment' },
    { 
      key: 'revenue', 
      header: 'Revenue',
      render: (value) => `$${(value / 1000).toFixed(0)}K`
    },
    { 
      key: 'profit', 
      header: 'Profit',
      render: (value) => `$${(value / 1000).toFixed(0)}K`
    },
    { 
      key: 'profitMargin', 
      header: 'Profit Margin',
      render: (value) => `${value.toFixed(1)}%`
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'default' : 'secondary'}>{value}</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(row)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

  const performanceColumns: Column[] = [
    { key: 'period', header: 'Period' },
    { key: 'profitCenter', header: 'Profit Center' },
    { 
      key: 'revenue', 
      header: 'Revenue',
      render: (value) => `$${(value / 1000).toFixed(0)}K`
    },
    { 
      key: 'costs', 
      header: 'Costs',
      render: (value) => `$${(value / 1000).toFixed(0)}K`
    },
    { 
      key: 'profit', 
      header: 'Profit',
      render: (value) => `$${(value / 1000).toFixed(0)}K`
    },
    { 
      key: 'margin', 
      header: 'Margin %',
      render: (value) => `${value.toFixed(1)}%`
    }
  ];

  const transferColumns: Column[] = [
    { key: 'date', header: 'Transfer Date' },
    { key: 'fromCenter', header: 'From Center' },
    { key: 'toCenter', header: 'To Center' },
    { 
      key: 'amount', 
      header: 'Amount',
      render: (value) => `$${value.toLocaleString()}`
    },
    { key: 'description', header: 'Description' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <Badge variant={value === 'Posted' ? 'default' : 'secondary'}>{value}</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewTransfer(row)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditTransfer(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleExportTransfer(row)}><Download className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/finance')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Profit Center Accounting"
          description="Manage profit centers, analyze profitability, and track financial performance by business segments"
          voiceIntroduction="Welcome to Profit Center Accounting. Analyze profitability and manage business segment performance."
        />
      </div>

      <VoiceTrainingComponent 
        module="finance"
        topic="Profit Center Accounting"
        examples={[
          "Creating and managing profit centers with hierarchical structures and responsibility assignments",
          "Analyzing profitability by business segment, product line, or geographic region with detailed margin analysis",
          "Processing internal transfer pricing and cost allocations between profit centers for accurate performance measurement"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{profitCenters.length}</p>
                <p className="text-xs text-muted-foreground">Active Profit Centers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">$5.5M</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">$1.45M</p>
                <p className="text-xs text-muted-foreground">Total Profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">26.4%</p>
                <p className="text-xs text-muted-foreground">Average Margin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="centers">Profit Centers</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="transfers">Internal Transfers</TabsTrigger>
          <TabsTrigger value="reports">Profitability Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Profit Center Management</CardTitle>
                <div className="flex gap-2">
                  <Button variant={filterOpen ? "default" : "outline"} size="sm" onClick={handleToggleFilter}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Profit Center
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Profit Center</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="profitCenterCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profit Center Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="manager"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Manager</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="businessSegment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Segment</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select segment" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Regional Operations">Regional Operations</SelectItem>
                                    <SelectItem value="Product Lines">Product Lines</SelectItem>
                                    <SelectItem value="Services">Services</SelectItem>
                                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                    <SelectItem value="Distribution">Distribution</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="targetProfit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Target Profit</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Create Profit Center</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filterOpen && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <Input
                    placeholder="Search by name, code, or segment..."
                    value={centerFilter}
                    onChange={(e) => setCenterFilter(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              )}
              <DataTable columns={profitCenterColumns} data={filteredProfitCenters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Performance Analysis</CardTitle>
                <Button size="sm" onClick={handleExportAnalysis}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={performanceColumns} data={performance} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Internal Transfer Pricing</CardTitle>
                <Dialog open={isCreateTransferOpen} onOpenChange={setIsCreateTransferOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Transfer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Transfer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>From Center</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source profit center" />
                          </SelectTrigger>
                          <SelectContent>
                            {profitCenters.map(pc => (
                              <SelectItem key={pc.id} value={pc.profitCenterCode}>{pc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>To Center</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination profit center" />
                          </SelectTrigger>
                          <SelectContent>
                            {profitCenters.map(pc => (
                              <SelectItem key={pc.id} value={pc.profitCenterCode}>{pc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input placeholder="e.g., Shared IT Services" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateTransferOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" onClick={() => {
                          toast({ title: 'Transfer Created', description: 'New transfer created successfully.' });
                          setIsCreateTransferOpen(false);
                        }}>
                          Create Transfer
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search transfers..."
                  value={transferFilter}
                  onChange={(e) => setTransferFilter(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <DataTable columns={transferColumns} data={filteredTransfers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>1. North America Ops</span>
                    <span className="font-semibold text-green-600">28.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. Product Line A</span>
                    <span className="font-semibold text-green-600">25.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. Enterprise Services</span>
                    <span className="font-semibold text-green-600">25.0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Target vs Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>North America</span>
                    <span className="font-semibold text-red-600">-6.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product Line A</span>
                    <span className="font-semibold text-red-600">-10.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enterprise Services</span>
                    <span className="font-semibold text-red-600">-6.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profit Center</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="profitCenterCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profit Center Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessSegment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Segment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Regional Operations">Regional Operations</SelectItem>
                        <SelectItem value="Product Lines">Product Lines</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Distribution">Distribution</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Profit</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Profit Center</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profit Center Details</DialogTitle>
          </DialogHeader>
          {selectedProfitCenter && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Profit Center Code</Label>
                  <p className="font-medium">{selectedProfitCenter.profitCenterCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedProfitCenter.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Business Segment</Label>
                  <p className="font-medium">{selectedProfitCenter.businessSegment}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Manager</Label>
                  <p className="font-medium">{selectedProfitCenter.manager}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Revenue</Label>
                  <p className="font-medium">${selectedProfitCenter.revenue?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Costs</Label>
                  <p className="font-medium">${selectedProfitCenter.costs?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Profit</Label>
                  <p className="font-medium text-green-600">${selectedProfitCenter.profit?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Profit Margin</Label>
                  <p className="font-medium">{selectedProfitCenter.profitMargin?.toFixed(1)}%</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{selectedProfitCenter.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTransferOpen} onOpenChange={setIsViewTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Transfer Date</Label>
                  <p className="font-medium">{selectedTransfer.date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">From Center</Label>
                  <p className="font-medium">{selectedTransfer.fromCenter}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">To Center</Label>
                  <p className="font-medium">{selectedTransfer.toCenter}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">${selectedTransfer.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="font-medium">{selectedTransfer.description}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={selectedTransfer.status === 'Posted' ? 'default' : 'secondary'}>
                    {selectedTransfer.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTransferOpen} onOpenChange={setIsEditTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transfer</DialogTitle>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div>
                <Label>From Center</Label>
                <Input defaultValue={selectedTransfer.fromCenter} />
              </div>
              <div>
                <Label>To Center</Label>
                <Input defaultValue={selectedTransfer.toCenter} />
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" defaultValue={selectedTransfer.amount} />
              </div>
              <div>
                <Label>Description</Label>
                <Input defaultValue={selectedTransfer.description} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditTransferOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={() => {
                  toast({ title: 'Transfer Updated', description: 'Transfer updated successfully.' });
                  setIsEditTransferOpen(false);
                }}>
                  Update Transfer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfitCenterAccounting;
