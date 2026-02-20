
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
import { ArrowLeft, Users, TrendingUp, Award, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import MetricCard from '../../components/metrics/MetricCard';
import BarChartComponent from '../../components/charts/BarChartComponent';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface HRRecord {
  id: string;
  period: string;
  department: string;
  position: string;
  headcount: number;
  openPositions: number;
  turnover: number;
  avgTenure: number;
  satisfactionScore: number;
  trainingHours: number;
  status: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

const defaultForm: Omit<HRRecord, 'id'> = {
  period: '2024-01',
  department: 'Engineering',
  position: 'Software Engineer',
  headcount: 0,
  openPositions: 0,
  turnover: 0,
  avgTenure: 0,
  satisfactionScore: 0,
  trainingHours: 0,
  status: 'Average',
};

const STORAGE_KEY = 'sap_hranalytics';

const defaultHRRecords: HRRecord[] = [
  { id: '1', period: '2024-01', department: 'Engineering', position: 'Software Engineer', headcount: 120, openPositions: 15, turnover: 8.5, avgTenure: 3.2, satisfactionScore: 4.2, trainingHours: 45, status: 'Good' },
  { id: '2', period: '2024-01', department: 'Sales', position: 'Sales Representative', headcount: 85, openPositions: 12, turnover: 12.3, avgTenure: 2.1, satisfactionScore: 3.8, trainingHours: 32, status: 'Average' },
  { id: '3', period: '2024-01', department: 'Marketing', position: 'Marketing Manager', headcount: 45, openPositions: 5, turnover: 6.2, avgTenure: 4.5, satisfactionScore: 4.5, trainingHours: 28, status: 'Excellent' },
  { id: '4', period: '2024-01', department: 'Operations', position: 'Operations Analyst', headcount: 65, openPositions: 8, turnover: 9.8, avgTenure: 2.8, satisfactionScore: 3.9, trainingHours: 38, status: 'Good' },
  { id: '5', period: '2024-01', department: 'Finance', position: 'Financial Analyst', headcount: 40, openPositions: 3, turnover: 5.5, avgTenure: 5.2, satisfactionScore: 4.6, trainingHours: 42, status: 'Excellent' },
  { id: '6', period: '2024-02', department: 'Engineering', position: 'QA Engineer', headcount: 55, openPositions: 8, turnover: 7.2, avgTenure: 2.9, satisfactionScore: 4.1, trainingHours: 48, status: 'Good' },
  { id: '7', period: '2024-02', department: 'HR', position: 'HR Specialist', headcount: 25, openPositions: 2, turnover: 4.0, avgTenure: 6.1, satisfactionScore: 4.7, trainingHours: 35, status: 'Excellent' },
  { id: '8', period: '2024-02', department: 'Sales', position: 'Account Executive', headcount: 70, openPositions: 10, turnover: 11.5, avgTenure: 2.3, satisfactionScore: 3.7, trainingHours: 30, status: 'Average' },
  { id: '9', period: '2024-02', department: 'Engineering', position: 'DevOps Engineer', headcount: 35, openPositions: 6, turnover: 6.8, avgTenure: 3.1, satisfactionScore: 4.3, trainingHours: 52, status: 'Good' },
  { id: '10', period: '2024-02', department: 'Customer Support', position: 'Support Specialist', headcount: 90, openPositions: 15, turnover: 15.2, avgTenure: 1.5, satisfactionScore: 3.2, trainingHours: 25, status: 'Poor' },
  { id: '11', period: '2024-03', department: 'Engineering', position: 'Data Scientist', headcount: 40, openPositions: 8, turnover: 5.0, avgTenure: 2.5, satisfactionScore: 4.5, trainingHours: 55, status: 'Excellent' },
  { id: '12', period: '2024-03', department: 'Marketing', position: 'Content Writer', headcount: 30, openPositions: 4, turnover: 8.3, avgTenure: 1.8, satisfactionScore: 3.9, trainingHours: 22, status: 'Good' },
  { id: '13', period: '2024-03', department: 'Operations', position: 'Supply Chain Manager', headcount: 28, openPositions: 3, turnover: 4.2, avgTenure: 5.8, satisfactionScore: 4.6, trainingHours: 40, status: 'Excellent' },
  { id: '14', period: '2024-03', department: 'Sales', position: 'Sales Manager', headcount: 55, openPositions: 7, turnover: 9.5, avgTenure: 3.5, satisfactionScore: 4.0, trainingHours: 35, status: 'Good' },
  { id: '15', period: '2024-03', department: 'Engineering', position: 'Frontend Developer', headcount: 65, openPositions: 10, turnover: 7.8, avgTenure: 2.2, satisfactionScore: 4.2, trainingHours: 42, status: 'Good' },
  { id: '16', period: '2024-04', department: 'Finance', position: 'Accountant', headcount: 35, openPositions: 4, turnover: 6.5, avgTenure: 4.1, satisfactionScore: 4.3, trainingHours: 38, status: 'Good' },
  { id: '17', period: '2024-04', department: 'Customer Support', position: 'Team Lead', headcount: 20, openPositions: 2, turnover: 10.0, avgTenure: 4.0, satisfactionScore: 3.8, trainingHours: 30, status: 'Average' },
  { id: '18', period: '2024-04', department: 'Engineering', position: 'Backend Developer', headcount: 75, openPositions: 12, turnover: 8.0, avgTenure: 2.7, satisfactionScore: 4.1, trainingHours: 46, status: 'Good' },
  { id: '19', period: '2024-04', department: 'HR', position: 'Recruiter', headcount: 18, openPositions: 3, turnover: 5.5, avgTenure: 3.2, satisfactionScore: 4.4, trainingHours: 32, status: 'Excellent' },
  { id: '20', period: '2024-04', department: 'Marketing', position: 'SEO Specialist', headcount: 22, openPositions: 2, turnover: 4.5, avgTenure: 3.0, satisfactionScore: 4.2, trainingHours: 28, status: 'Excellent' },
  { id: '21', period: '2024-05', department: 'Engineering', position: 'Security Engineer', headcount: 30, openPositions: 5, turnover: 3.3, avgTenure: 4.2, satisfactionScore: 4.8, trainingHours: 60, status: 'Excellent' },
  { id: '22', period: '2024-05', department: 'Operations', position: 'Logistics Coordinator', headcount: 42, openPositions: 6, turnover: 11.9, avgTenure: 1.9, satisfactionScore: 3.5, trainingHours: 26, status: 'Average' },
  { id: '23', period: '2024-05', department: 'Sales', position: 'Business Developer', headcount: 48, openPositions: 8, turnover: 10.4, avgTenure: 2.0, satisfactionScore: 3.6, trainingHours: 34, status: 'Average' },
  { id: '24', period: '2024-05', department: 'Finance', position: 'Controller', headcount: 15, openPositions: 1, turnover: 0.0, avgTenure: 7.5, satisfactionScore: 4.9, trainingHours: 50, status: 'Excellent' },
  { id: '25', period: '2024-05', department: 'Engineering', position: 'ML Engineer', headcount: 28, openPositions: 6, turnover: 3.6, avgTenure: 2.3, satisfactionScore: 4.6, trainingHours: 58, status: 'Excellent' },
  { id: '26', period: '2024-06', department: 'Customer Support', position: 'Customer Success Manager', headcount: 35, openPositions: 4, turnover: 8.6, avgTenure: 2.8, satisfactionScore: 3.9, trainingHours: 28, status: 'Good' },
  { id: '27', period: '2024-06', department: 'Marketing', position: 'Brand Manager', headcount: 20, openPositions: 2, turnover: 5.0, avgTenure: 4.8, satisfactionScore: 4.5, trainingHours: 36, status: 'Excellent' },
  { id: '28', period: '2024-06', department: 'HR', position: 'Training Coordinator', headcount: 12, openPositions: 1, turnover: 8.3, avgTenure: 3.5, satisfactionScore: 4.3, trainingHours: 40, status: 'Good' },
  { id: '29', period: '2024-06', department: 'Operations', position: 'Quality Assurance Manager', headcount: 25, openPositions: 3, turnover: 4.0, avgTenure: 5.0, satisfactionScore: 4.5, trainingHours: 44, status: 'Excellent' },
  { id: '30', period: '2024-06', department: 'Engineering', position: 'Product Manager', headcount: 32, openPositions: 4, turnover: 6.3, avgTenure: 3.8, satisfactionScore: 4.4, trainingHours: 48, status: 'Excellent' },
];

const HRAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();

  const [hrRecords, setHRRecords] = useLocalStorage<HRRecord[]>(STORAGE_KEY, defaultHRRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HRRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HRRecord | null>(null);
  const [form, setForm] = useState<Omit<HRRecord, 'id'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to HR Analytics. Analyze workforce metrics, employee performance, and human capital insights.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingRecord(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (record: HRRecord) => {
    setEditingRecord(record);
    setForm({
      period: record.period,
      department: record.department,
      position: record.position,
      headcount: record.headcount,
      openPositions: record.openPositions,
      turnover: record.turnover,
      avgTenure: record.avgTenure,
      satisfactionScore: record.satisfactionScore,
      trainingHours: record.trainingHours,
      status: record.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.position.trim()) {
      toast({ title: 'Validation Error', description: 'Position is required.', variant: 'destructive' });
      return;
    }
    const status: 'Excellent' | 'Good' | 'Average' | 'Poor' = 
      form.satisfactionScore >= 4.5 && form.turnover < 6 ? 'Excellent' :
      form.satisfactionScore >= 4.0 && form.turnover < 10 ? 'Good' :
      form.satisfactionScore >= 3.5 && form.turnover < 15 ? 'Average' : 'Poor';

    if (editingRecord) {
      setHRRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...editingRecord, ...form, status } : r));
      toast({ title: 'HR Record Updated', description: `${form.position} in ${form.department} has been updated.` });
    } else {
      const newRecord: HRRecord = {
        id: String(Date.now()),
        ...form,
        status,
      };
      setHRRecords(prev => [...prev, newRecord]);
      toast({ title: 'HR Record Created', description: `${form.position} in ${form.department} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (record: HRRecord) => {
    setHRRecords(prev => prev.filter(r => r.id !== record.id));
    toast({ title: 'HR Record Deleted', description: `${record.position} has been removed.` });
  };

  const handleView = (record: HRRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const totalHeadcount = hrRecords.reduce((sum, r) => sum + r.headcount, 0);
  const totalOpenPositions = hrRecords.reduce((sum, r) => sum + r.openPositions, 0);
  const avgTurnover = hrRecords.reduce((sum, r) => sum + r.turnover, 0) / hrRecords.length;
  const avgSatisfaction = hrRecords.reduce((sum, r) => sum + r.satisfactionScore, 0) / hrRecords.length;

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
    { key: 'department', header: 'Department' },
    { key: 'position', header: 'Position' },
    { key: 'headcount', header: 'Headcount' },
    { key: 'openPositions', header: 'Open Positions' },
    { key: 'turnover', header: 'Turnover %', render: (value: number) => `${value.toFixed(1)}%` },
    { key: 'avgTenure', header: 'Avg Tenure', render: (value: number) => `${value.toFixed(1)} yrs` },
    { key: 'satisfactionScore', header: 'Satisfaction', render: (value: number) => value.toFixed(1) },
    { key: 'trainingHours', header: 'Training Hrs' },
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
      render: (_: any, row: HRRecord) => (
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
          title="HR Analytics"
          description="Workforce analytics and human capital insights"
          voiceIntroduction="Welcome to HR Analytics."
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">HR Records</TabsTrigger>
          <TabsTrigger value="workforce">Workforce</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <MetricCard
                title="Total Headcount"
                value={totalHeadcount.toString()}
                trend={{ value: "25", direction: "up", label: "new hires" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Open Positions"
                value={totalOpenPositions.toString()}
                trend={{ value: "8", direction: "down", label: "vs last month" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Avg Turnover"
                value={`${avgTurnover.toFixed(1)}%`}
                trend={{ value: "1.2%", direction: "down", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Avg Satisfaction"
                value={avgSatisfaction.toFixed(1)}
                trend={{ value: "0.3", direction: "up", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">HR Records</h2>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Record
            </Button>
          </div>
          <Card className="p-6">
            <DataTable columns={columns} data={hrRecords} />
          </Card>
        </TabsContent>

        <TabsContent value="workforce" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Diversity Score"
                value="72%"
                trend={{ value: "5%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Internal Promotion Rate"
                value="28%"
                trend={{ value: "3%", direction: "up", label: "vs last year" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Contractor Ratio"
                value="12%"
                trend={{ value: "2%", direction: "down", label: "reduction" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="Avg Performance Score"
                value="4.2"
                trend={{ value: "0.2", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Training ROI"
                value="285%"
                trend={{ value: "35%", direction: "up", label: "vs last year" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Skills Gap"
                value="15%"
                trend={{ value: "3%", direction: "down", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <MetricCard
                title="1-Year Retention"
                value="82%"
                trend={{ value: "4%", direction: "up", label: "improvement" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="3-Year Retention"
                value="65%"
                trend={{ value: "2%", direction: "up", label: "vs last year" }}
              />
            </Card>
            <Card>
              <MetricCard
                title="Regrettable Attrition"
                value="8%"
                trend={{ value: "2%", direction: "down", label: "improvement" }}
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit HR Record' : 'Create HR Record'}</DialogTitle>
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
                <Label htmlFor="department">Department</Label>
                <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Customer Support">Customer Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="Enter position"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="headcount">Headcount</Label>
                <Input
                  id="headcount"
                  type="number"
                  value={form.headcount}
                  onChange={(e) => setForm({ ...form, headcount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="openPositions">Open Positions</Label>
                <Input
                  id="openPositions"
                  type="number"
                  value={form.openPositions}
                  onChange={(e) => setForm({ ...form, openPositions: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="turnover">Turnover %</Label>
                <Input
                  id="turnover"
                  type="number"
                  value={form.turnover}
                  onChange={(e) => setForm({ ...form, turnover: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="avgTenure">Avg Tenure (yrs)</Label>
                <Input
                  id="avgTenure"
                  type="number"
                  value={form.avgTenure}
                  onChange={(e) => setForm({ ...form, avgTenure: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="satisfactionScore">Satisfaction (1-5)</Label>
                <Input
                  id="satisfactionScore"
                  type="number"
                  step="0.1"
                  max="5"
                  value={form.satisfactionScore}
                  onChange={(e) => setForm({ ...form, satisfactionScore: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trainingHours">Training Hours</Label>
                <Input
                  id="trainingHours"
                  type="number"
                  value={form.trainingHours}
                  onChange={(e) => setForm({ ...form, trainingHours: parseInt(e.target.value) || 0 })}
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
            <DialogTitle>HR Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Period:</span>
                <span className="font-medium">{selectedRecord.period}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Department:</span>
                <span className="font-medium">{selectedRecord.department}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Position:</span>
                <span className="font-medium">{selectedRecord.position}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Headcount:</span>
                <span className="font-medium">{selectedRecord.headcount}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Open Positions:</span>
                <span className="font-medium">{selectedRecord.openPositions}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Turnover:</span>
                <span className="font-medium">{selectedRecord.turnover.toFixed(1)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Avg Tenure:</span>
                <span className="font-medium">{selectedRecord.avgTenure.toFixed(1)} yrs</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Satisfaction Score:</span>
                <span className="font-medium">{selectedRecord.satisfactionScore.toFixed(1)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Training Hours:</span>
                <span className="font-medium">{selectedRecord.trainingHours}</span>
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

export default HRAnalytics;
