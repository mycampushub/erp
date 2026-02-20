import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft, Download, Calendar, Filter, FileText, BarChart, PieChart, TrendingUp, Plus, Edit, Trash2, Eye, Play } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import DataTable, { Column } from '../../components/data/DataTable';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '../../hooks/use-toast';

const FinancialReports: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewReportOpen, setIsViewReportOpen] = useState(false);
  const [isViewTemplateOpen, setIsViewTemplateOpen] = useState(false);
  const [isViewDashboardOpen, setIsViewDashboardOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [reportFilter, setReportFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [dashboardFilter, setDashboardFilter] = useState('');
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: '',
      type: '',
      description: '',
      period: '',
      format: ''
    }
  });

  const [reports, setReports] = useState([
    { id: 'RPT-001', name: 'Balance Sheet', type: 'Financial Statement', status: 'Active', lastRun: '2024-05-20', period: 'Monthly', format: 'PDF', createdBy: 'Finance Team' },
    { id: 'RPT-002', name: 'Income Statement', type: 'Financial Statement', status: 'Active', lastRun: '2024-05-20', period: 'Monthly', format: 'Excel', createdBy: 'Finance Team' },
    { id: 'RPT-003', name: 'Cash Flow Statement', type: 'Financial Statement', status: 'Active', lastRun: '2024-05-19', period: 'Quarterly', format: 'PDF', createdBy: 'CFO Office' },
    { id: 'RPT-004', name: 'Budget vs Actual', type: 'Management Report', status: 'Draft', lastRun: '2024-05-18', period: 'Monthly', format: 'Excel', createdBy: 'Budget Team' },
    { id: 'RPT-005', name: 'Aging Analysis', type: 'Operational Report', status: 'Active', lastRun: '2024-05-20', period: 'Weekly', format: 'PDF', createdBy: 'AR Team' }
  ]);

  const [reportTemplates, setReportTemplates] = useState([
    { id: 'TPL-001', name: 'Standard Balance Sheet', category: 'Financial Statements', usage: 45, lastModified: '2024-05-15' },
    { id: 'TPL-002', name: 'Detailed P&L', category: 'Financial Statements', usage: 38, lastModified: '2024-05-12' },
    { id: 'TPL-003', name: 'Cash Flow Analysis', category: 'Cash Management', usage: 28, lastModified: '2024-05-10' },
    { id: 'TPL-004', name: 'Variance Analysis', category: 'Management Reports', usage: 22, lastModified: '2024-05-08' }
  ]);

  const [dashboards, setDashboards] = useState([
    { id: 'DSH-001', name: 'Executive Dashboard', widgets: 8, lastAccessed: '2024-05-20', users: 15, status: 'Active' },
    { id: 'DSH-002', name: 'Financial KPIs', widgets: 12, lastAccessed: '2024-05-20', users: 25, status: 'Active' },
    { id: 'DSH-003', name: 'Budget Tracking', widgets: 6, lastAccessed: '2024-05-19', users: 12, status: 'Active' },
    { id: 'DSH-004', name: 'Cash Position', widgets: 4, lastAccessed: '2024-05-18', users: 8, status: 'Draft' }
  ]);

  const handleCreate = (data: any) => {
    const newReport = {
      id: `RPT-${String(reports.length + 1).padStart(3, '0')}`,
      name: data.name,
      type: data.type,
      status: 'Draft',
      lastRun: new Date().toISOString().split('T')[0],
      period: data.period,
      format: data.format,
      createdBy: 'Current User'
    };
    setReports([...reports, newReport]);
    setIsCreateDialogOpen(false);
    form.reset();
    toast({ title: 'Report Created', description: `${data.name} has been created successfully.` });
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setIsViewReportOpen(true);
  };

  const handleRunReport = (report: any) => {
    const headers = ['Report Name', 'Type', 'Status', 'Last Run', 'Period', 'Format', 'Created By'];
    const csvContent = [
      headers.join(','),
      `${report.name},${report.type},${report.status},${report.lastRun},${report.period},${report.format},${report.createdBy}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${report.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Report Generated', description: `${report.name} has been generated successfully.` });
  };

  const handleEdit = (report: any) => {
    setSelectedReport(report);
    form.reset(report);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: any) => {
    setReports(reports.map(r => r.id === selectedReport?.id ? { ...r, ...data } : r));
    setIsEditDialogOpen(false);
    setSelectedReport(null);
    toast({ title: 'Report Updated', description: 'Report has been updated successfully.' });
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    toast({ title: 'Edit Template', description: `Editing ${template.name}` });
  };

  const handleEditDashboard = (dashboard: any) => {
    setSelectedDashboard(dashboard);
    toast({ title: 'Edit Dashboard', description: `Editing ${dashboard.name}` });
  };

  const handleDelete = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    toast({ title: 'Report Deleted', description: 'Report has been deleted successfully.' });
  };

  const handleDeleteTemplate = (id: string) => {
    setReportTemplates(reportTemplates.filter(t => t.id !== id));
    toast({ title: 'Template Deleted', description: 'Template has been deleted successfully.' });
  };

  const handleDeleteDashboard = (id: string) => {
    setDashboards(dashboards.filter(d => d.id !== id));
    toast({ title: 'Dashboard Deleted', description: 'Dashboard has been deleted successfully.' });
  };

  const handleViewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsViewTemplateOpen(true);
  };

  const handleViewDashboard = (dashboard: any) => {
    setSelectedDashboard(dashboard);
    setIsViewDashboardOpen(true);
  };

  const handleExportTemplate = (template: any) => {
    const data = [template];
    const headers = ['Template Name', 'Category', 'Usage Count', 'Last Modified'];
    const csvContent = [
      headers.join(','),
      ...data.map(t => `${t.name},${t.category},${t.usage},${t.lastModified}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${template.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    toast({ title: 'Export Complete', description: 'Template exported successfully.' });
  };

  const handleExportDashboard = (dashboard: any) => {
    const data = [dashboard];
    const headers = ['Dashboard Name', 'Widgets', 'Active Users', 'Last Accessed', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(d => `${d.name},${d.widgets},${d.users},${d.lastAccessed},${d.status}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard_${dashboard.name.replace(/\s+/g, '_')}.csv`;
    link.click();
    toast({ title: 'Export Complete', description: 'Dashboard exported successfully.' });
  };

  const handleToggleFilter = () => {
    setFilterOpen(!filterOpen);
    toast({ title: filterOpen ? 'Filter Closed' : 'Filter Open', description: filterOpen ? 'Showing all records' : 'Use filters to narrow down results' });
  };

  const filteredReports = reports.filter(r => 
    reportFilter === '' || 
    r.name.toLowerCase().includes(reportFilter.toLowerCase()) ||
    r.type.toLowerCase().includes(reportFilter.toLowerCase()) ||
    r.status.toLowerCase().includes(reportFilter.toLowerCase())
  );

  const filteredTemplates = reportTemplates.filter(t => 
    templateFilter === '' || 
    t.name.toLowerCase().includes(templateFilter.toLowerCase()) ||
    t.category.toLowerCase().includes(templateFilter.toLowerCase())
  );

  const filteredDashboards = dashboards.filter(d => 
    dashboardFilter === '' || 
    d.name.toLowerCase().includes(dashboardFilter.toLowerCase()) ||
    d.status.toLowerCase().includes(dashboardFilter.toLowerCase())
  );

  const reportColumns: Column[] = [
    { key: 'id', header: 'Report ID' },
    { key: 'name', header: 'Report Name' },
    { key: 'type', header: 'Type' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <Badge variant={value === 'Active' ? 'default' : 'secondary'}>{value}</Badge>
      )
    },
    { key: 'lastRun', header: 'Last Run' },
    { key: 'period', header: 'Frequency' },
    { key: 'format', header: 'Format' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewReport(row)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleRunReport(row)}><Play className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

  const templateColumns: Column[] = [
    { key: 'id', header: 'Template ID' },
    { key: 'name', header: 'Template Name' },
    { key: 'category', header: 'Category' },
    { key: 'usage', header: 'Usage Count' },
    { key: 'lastModified', header: 'Last Modified' },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleViewTemplate(row)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleExportTemplate(row)}><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(row.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

  const dashboardColumns: Column[] = [
    { key: 'id', header: 'Dashboard ID' },
    { key: 'name', header: 'Dashboard Name' },
    { key: 'widgets', header: 'Widgets' },
    { key: 'users', header: 'Active Users' },
    { key: 'lastAccessed', header: 'Last Accessed' },
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
          <Button variant="ghost" size="sm" onClick={() => handleViewDashboard(row)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditDashboard(row)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleExportDashboard(row)}><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteDashboard(row.id)}><Trash2 className="h-4 w-4" /></Button>
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
          title="Financial Reports"
          description="Generate and manage financial statements, reports, and dashboards"
          voiceIntroduction="Welcome to Financial Reports. Create, manage, and generate comprehensive financial reports and dashboards."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{dashboards.length}</p>
                <p className="text-xs text-muted-foreground">Active Dashboards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <PieChart className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{reportTemplates.length}</p>
                <p className="text-xs text-muted-foreground">Report Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-xs text-muted-foreground">Automation Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Report Management</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="analytics">Report Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Financial Reports</CardTitle>
                <div className="flex gap-2">
                  <Button variant={filterOpen ? "default" : "outline"} size="sm" onClick={handleToggleFilter}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Report</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Report Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Report Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Financial Statement">Financial Statement</SelectItem>
                                    <SelectItem value="Management Report">Management Report</SelectItem>
                                    <SelectItem value="Operational Report">Operational Report</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="period"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Daily">Daily</SelectItem>
                                    <SelectItem value="Weekly">Weekly</SelectItem>
                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                                    <SelectItem value="Annually">Annually</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="format"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Output Format</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="PDF">PDF</SelectItem>
                                    <SelectItem value="Excel">Excel</SelectItem>
                                    <SelectItem value="CSV">CSV</SelectItem>
                                    <SelectItem value="Word">Word</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Create Report</Button>
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
                    placeholder="Search by name, type, or status..."
                    value={reportFilter}
                    onChange={(e) => setReportFilter(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              )}
              <DataTable columns={reportColumns} data={filteredReports} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Report Templates</CardTitle>
                <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Template Name</Label>
                        <Input placeholder="e.g., Monthly Balance Sheet" />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Financial Statements">Financial Statements</SelectItem>
                            <SelectItem value="Management Reports">Management Reports</SelectItem>
                            <SelectItem value="Cash Management">Cash Management</SelectItem>
                            <SelectItem value="Budget Reports">Budget Reports</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" onClick={() => {
                          toast({ title: 'Template Created', description: 'New template created successfully.' });
                          setIsCreateTemplateOpen(false);
                        }}>
                          Create Template
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
                  placeholder="Search templates..."
                  value={templateFilter}
                  onChange={(e) => setTemplateFilter(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <DataTable columns={templateColumns} data={filteredTemplates} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Financial Dashboards</CardTitle>
                <Dialog open={isCreateDashboardOpen} onOpenChange={setIsCreateDashboardOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Dashboard
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Dashboard</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Dashboard Name</Label>
                        <Input placeholder="e.g., Executive Overview" />
                      </div>
                      <div>
                        <Label>Number of Widgets</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDashboardOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" onClick={() => {
                          toast({ title: 'Dashboard Created', description: 'New dashboard created successfully.' });
                          setIsCreateDashboardOpen(false);
                        }}>
                          Create Dashboard
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
                  placeholder="Search dashboards..."
                  value={dashboardFilter}
                  onChange={(e) => setDashboardFilter(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <DataTable columns={dashboardColumns} data={filteredDashboards} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Usage Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Most Used Report</span>
                    <span className="font-semibold">Balance Sheet (45 runs)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Generation Time</span>
                    <span className="font-semibold">3.2 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-semibold text-green-600">98.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Reports Generated This Month</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Freshness</span>
                    <span className="font-semibold text-green-600">Real-time</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Used</span>
                    <span className="font-semibold">2.3 GB</span>
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
            <DialogTitle>Edit Report</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Financial Statement">Financial Statement</SelectItem>
                        <SelectItem value="Management Report">Management Report</SelectItem>
                        <SelectItem value="Operational Report">Operational Report</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Output Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                        <SelectItem value="CSV">CSV</SelectItem>
                        <SelectItem value="Word">Word</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Report</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewReportOpen} onOpenChange={setIsViewReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Report Name</Label>
                  <p className="font-medium">{selectedReport.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedReport.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={selectedReport.status === 'Active' ? 'default' : 'secondary'}>
                    {selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Frequency</Label>
                  <p className="font-medium">{selectedReport.period}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Format</Label>
                  <p className="font-medium">{selectedReport.format}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Run</Label>
                  <p className="font-medium">{selectedReport.lastRun}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created By</Label>
                  <p className="font-medium">{selectedReport.createdBy}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTemplateOpen} onOpenChange={setIsViewTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Template Details</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Template Name</Label>
                  <p className="font-medium">{selectedTemplate.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{selectedTemplate.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Usage Count</Label>
                  <p className="font-medium">{selectedTemplate.usage}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Modified</Label>
                  <p className="font-medium">{selectedTemplate.lastModified}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDashboardOpen} onOpenChange={setIsViewDashboardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dashboard Details</DialogTitle>
          </DialogHeader>
          {selectedDashboard && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Dashboard Name</Label>
                  <p className="font-medium">{selectedDashboard.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Widgets</Label>
                  <p className="font-medium">{selectedDashboard.widgets}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Active Users</Label>
                  <p className="font-medium">{selectedDashboard.users}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Accessed</Label>
                  <p className="font-medium">{selectedDashboard.lastAccessed}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={selectedDashboard.status === 'Active' ? 'default' : 'secondary'}>
                    {selectedDashboard.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialReports;
