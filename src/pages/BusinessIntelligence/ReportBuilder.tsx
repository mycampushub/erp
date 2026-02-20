
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
import { ArrowLeft, FileText, Download, Share, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MetricCard from '../../components/metrics/MetricCard';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface Report {
  id: string;
  name: string;
  type: string;
  category: string;
  format: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'Active' | 'Draft' | 'Scheduled' | 'Archived';
}

const defaultForm: Omit<Report, 'id'> = {
  name: '',
  type: 'Standard',
  category: 'Sales',
  format: 'PDF',
  schedule: 'Daily',
  lastRun: '',
  nextRun: '',
  status: 'Draft',
};

const STORAGE_KEY = 'sap_reportbuilder';

const defaultReports: Report[] = [
  { id: '1', name: 'Monthly Sales Report', type: 'Standard', category: 'Sales', format: 'PDF', schedule: 'Monthly', lastRun: '2024-01-15', nextRun: '2024-02-15', status: 'Active' },
  { id: '2', name: 'Financial Summary', type: 'Summary', category: 'Finance', format: 'Excel', schedule: 'Daily', lastRun: '2024-01-14', nextRun: '2024-01-15', status: 'Active' },
  { id: '3', name: 'Inventory Analysis', type: 'Detailed', category: 'Operations', format: 'CSV', schedule: 'Weekly', lastRun: '2024-01-13', nextRun: '2024-01-20', status: 'Draft' },
  { id: '4', name: 'HR Metrics Dashboard', type: 'Dashboard', category: 'Human Resources', format: 'PDF', schedule: 'Monthly', lastRun: '2024-01-12', nextRun: '2024-02-12', status: 'Active' },
  { id: '5', name: 'Customer Acquisition Report', type: 'Standard', category: 'Sales', format: 'PDF', schedule: 'Weekly', lastRun: '2024-01-11', nextRun: '2024-01-18', status: 'Scheduled' },
  { id: '6', name: 'Profit & Loss Statement', type: 'Detailed', category: 'Finance', format: 'PDF', schedule: 'Monthly', lastRun: '2024-01-10', nextRun: '2024-02-10', status: 'Active' },
  { id: '7', name: 'Supply Chain Performance', type: 'Summary', category: 'Operations', format: 'Excel', schedule: 'Daily', lastRun: '2024-01-09', nextRun: '2024-01-15', status: 'Active' },
  { id: '8', name: 'Employee Turnover Analysis', type: 'Detailed', category: 'Human Resources', format: 'PDF', schedule: 'Quarterly', lastRun: '2024-01-08', nextRun: '2024-04-08', status: 'Scheduled' },
  { id: '9', name: 'Marketing Campaign Results', type: 'Standard', category: 'Marketing', format: 'PDF', schedule: 'Weekly', lastRun: '2024-01-07', nextRun: '2024-01-14', status: 'Active' },
  { id: '10', name: 'Product Sales Analysis', type: 'Detailed', category: 'Sales', format: 'Excel', schedule: 'Monthly', lastRun: '2024-01-06', nextRun: '2024-02-06', status: 'Draft' },
  { id: '11', name: 'Budget Variance Report', type: 'Summary', category: 'Finance', format: 'PDF', schedule: 'Monthly', lastRun: '2024-01-05', nextRun: '2024-02-05', status: 'Active' },
  { id: '12', name: 'Warehouse Utilization', type: 'Standard', category: 'Operations', format: 'CSV', schedule: 'Weekly', lastRun: '2024-01-04', nextRun: '2024-01-11', status: 'Scheduled' },
  { id: '13', name: 'Performance Reviews Summary', type: 'Dashboard', category: 'Human Resources', format: 'PDF', schedule: 'Quarterly', lastRun: '2024-01-03', nextRun: '2024-04-03', status: 'Archived' },
  { id: '14', name: 'Website Analytics', type: 'Summary', category: 'Marketing', format: 'Excel', schedule: 'Daily', lastRun: '2024-01-02', nextRun: '2024-01-15', status: 'Active' },
  { id: '15', name: 'Accounts Receivable Aging', type: 'Detailed', category: 'Finance', format: 'PDF', schedule: 'Weekly', lastRun: '2024-01-01', nextRun: '2024-01-08', status: 'Active' },
  { id: '16', name: 'Manufacturing Output', type: 'Standard', category: 'Operations', format: 'Excel', schedule: 'Daily', lastRun: '2023-12-31', nextRun: '2024-01-15', status: 'Active' },
  { id: '17', name: 'Training Completion Rate', type: 'Summary', category: 'Human Resources', format: 'PDF', schedule: 'Monthly', lastRun: '2023-12-30', nextRun: '2024-01-30', status: 'Scheduled' },
  { id: '18', name: 'Lead Conversion Analysis', type: 'Detailed', category: 'Sales', format: 'CSV', schedule: 'Weekly', lastRun: '2023-12-29', nextRun: '2024-01-05', status: 'Active' },
  { id: '19', name: 'Cash Flow Projection', type: 'Summary', category: 'Finance', format: 'Excel', schedule: 'Daily', lastRun: '2023-12-28', nextRun: '2024-01-15', status: 'Active' },
  { id: '20', name: 'Supplier Performance Score', type: 'Detailed', category: 'Operations', format: 'PDF', schedule: 'Monthly', lastRun: '2023-12-27', nextRun: '2024-01-27', status: 'Draft' },
  { id: '21', name: 'Employee Satisfaction Survey', type: 'Dashboard', category: 'Human Resources', format: 'PDF', schedule: 'Annually', lastRun: '2023-12-26', nextRun: '2024-12-26', status: 'Archived' },
  { id: '22', name: 'Ad Campaign ROI', type: 'Standard', category: 'Marketing', format: 'Excel', schedule: 'Weekly', lastRun: '2023-12-25', nextRun: '2024-01-01', status: 'Active' },
  { id: '23', name: 'Regional Sales Breakdown', type: 'Detailed', category: 'Sales', format: 'PDF', schedule: 'Monthly', lastRun: '2023-12-24', nextRun: '2024-01-24', status: 'Scheduled' },
  { id: '24', name: 'Fixed Asset Register', type: 'Standard', category: 'Finance', format: 'Excel', schedule: 'Quarterly', lastRun: '2023-12-23', nextRun: '2024-03-23', status: 'Active' },
  { id: '25', name: 'Production Efficiency', type: 'Summary', category: 'Operations', format: 'PDF', schedule: 'Daily', lastRun: '2023-12-22', nextRun: '2024-01-15', status: 'Active' },
  { id: '26', name: 'Compensation Analysis', type: 'Detailed', category: 'Human Resources', format: 'PDF', schedule: 'Annually', lastRun: '2023-12-21', nextRun: '2024-12-21', status: 'Archived' },
  { id: '27', name: 'Social Media Metrics', type: 'Dashboard', category: 'Marketing', format: 'Excel', schedule: 'Daily', lastRun: '2023-12-20', nextRun: '2024-01-15', status: 'Active' },
  { id: '28', name: 'Customer Lifetime Value', type: 'Detailed', category: 'Sales', format: 'CSV', schedule: 'Monthly', lastRun: '2023-12-19', nextRun: '2024-01-19', status: 'Draft' },
  { id: '29', name: 'Tax Compliance Report', type: 'Standard', category: 'Finance', format: 'PDF', schedule: 'Quarterly', lastRun: '2023-12-18', nextRun: '2024-03-18', status: 'Scheduled' },
  { id: '30', name: 'Executive KPI Summary', type: 'Dashboard', category: 'Executive', format: 'PDF', schedule: 'Daily', lastRun: '2023-12-17', nextRun: '2024-01-15', status: 'Active' },
];

const ReportBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const [reports, setReports] = useLocalStorage<Report[]>(STORAGE_KEY, defaultReports);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [form, setForm] = useState<Omit<Report, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Report Builder. Create custom reports and analytics with drag-and-drop functionality.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingReport(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (report: Report) => {
    setEditingReport(report);
    setForm({
      name: report.name,
      type: report.type,
      category: report.category,
      format: report.format,
      schedule: report.schedule,
      lastRun: report.lastRun,
      nextRun: report.nextRun,
      status: report.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: 'Validation Error', description: 'Report name is required.', variant: 'destructive' });
      return;
    }

    if (editingReport) {
      setReports(prev => prev.map(r => r.id === editingReport.id ? { ...editingReport, ...form } : r));
      toast({ title: 'Report Updated', description: `${form.name} has been updated.` });
    } else {
      const newReport: Report = {
        id: String(Date.now()),
        ...form,
      };
      setReports(prev => [...prev, newReport]);
      toast({ title: 'Report Created', description: `${form.name} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (report: Report) => {
    setReports(prev => prev.filter(r => r.id !== report.id));
    toast({ title: 'Report Deleted', description: `${report.name} has been removed.` });
  };

  const handleView = (report: Report) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const activeReports = reports.filter(r => r.status === 'Active').length;
  const scheduledReports = reports.filter(r => r.status === 'Scheduled').length;
  const draftReports = reports.filter(r => r.status === 'Draft').length;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Draft': 'bg-yellow-100 text-yellow-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Archived': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'name', header: 'Report Name' },
    { key: 'type', header: 'Type' },
    { key: 'category', header: 'Category' },
    { key: 'format', header: 'Format' },
    { key: 'schedule', header: 'Schedule' },
    { key: 'lastRun', header: 'Last Run' },
    { key: 'nextRun', header: 'Next Run' },
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
      render: (_: any, row: Report) => (
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
          title="Report Builder"
          description="Create and manage custom reports"
          voiceIntroduction="Welcome to Report Builder."
        />
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="records">All Records</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Total Reports"
                value={String(reports.length)}
                trend={{ value: "30", direction: "up", label: "reports" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Active Reports"
                value={String(activeReports)}
                trend={{ value: "Running", direction: "up", label: "active" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Scheduled"
                value={String(scheduledReports)}
                trend={{ value: "Pending", direction: "up", label: "scheduled" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Draft Reports"
                value={String(draftReports)}
                trend={{ value: "Editing", direction: "up", label: "draft" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Report Records</h2>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
          <Card className="p-6">
            <DataTable columns={columns} data={reports} />
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Sales Templates"
                value="8"
                trend={{ value: "8", direction: "up", label: "available" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Finance Templates"
                value="10"
                trend={{ value: "10", direction: "up", label: "available" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Operations Templates"
                value="6"
                trend={{ value: "6", direction: "up", label: "available" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Daily Reports"
                value="12"
                trend={{ value: "12", direction: "up", label: "scheduled" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Weekly Reports"
                value="10"
                trend={{ value: "10", direction: "up", label: "scheduled" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Monthly Reports"
                value="8"
                trend={{ value: "8", direction: "up", label: "scheduled" }}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReport ? 'Edit Report' : 'Create Report'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Report Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter report name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Report Type</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Summary">Summary</SelectItem>
                    <SelectItem value="Detailed">Detailed</SelectItem>
                    <SelectItem value="Dashboard">Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="format">Format</Label>
                <Select value={form.format} onValueChange={(value) => setForm({ ...form, format: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Select value={form.schedule} onValueChange={(value) => setForm({ ...form, schedule: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(value: 'Active' | 'Draft' | 'Scheduled' | 'Archived') => setForm({ ...form, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingReport ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{selectedReport.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium">{selectedReport.type}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{selectedReport.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Format:</span>
                <span className="font-medium">{selectedReport.format}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Schedule:</span>
                <span className="font-medium">{selectedReport.schedule}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Last Run:</span>
                <span className="font-medium">{selectedReport.lastRun}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Next Run:</span>
                <span className="font-medium">{selectedReport.nextRun}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge>
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

export default ReportBuilder;
