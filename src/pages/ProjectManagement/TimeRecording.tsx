
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Clock, Play, Pause, Save, Calendar, User, Plus, Edit, Trash2, Eye, FileText, Download, BarChart3 } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { listEntities, upsertEntity, removeEntity, generateId } from '../../lib/localCrud';
import { seedAllProjectManagementData } from '../../lib/projectManagement/seedData';
import { 
  CRUDDialog, EnhancedCRUDTable, StatCard, ConfirmDialog, formatDate, formatCurrency, ViewDialog
} from '../../lib/projectManagement/CRUDComponents';
import { TimeEntry, Timesheet, TimeReport, PM_STORAGE_KEYS } from '../../lib/projectManagement/types';

const TimeRecording: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('recording');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [reports, setReports] = useState<TimeReport[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'entry' | 'timesheet' | 'report'>('entry');
  const [isEditing, setIsEditing] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerProject, setTimerProject] = useState('');
  const [timerTask, setTimerTask] = useState('');

  const loadData = useCallback(() => {
    seedAllProjectManagementData();
    const entries = listEntities<TimeEntry>(PM_STORAGE_KEYS.TIME_ENTRIES);
    const sheets = listEntities<Timesheet>(PM_STORAGE_KEYS.TIMESHEETS);
    const reps = listEntities<TimeReport>(PM_STORAGE_KEYS.TIME_REPORTS);
    setTimeEntries(entries);
    setTimesheets(sheets);
    setReports(reps);
  }, []);

  useEffect(() => {
    if (isEnabled) speak('Welcome to Time Recording. Track time, manage timesheets, and generate reports.');
    loadData();
    const timer = setInterval(() => { if (isTimerRunning) setTimerSeconds(s => s + 1); }, 1000);
    return () => clearInterval(timer);
  }, [isEnabled, speak, isTimerRunning, loadData]);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCRUD = (type: 'entry' | 'timesheet' | 'report', item?: any, edit = false) => {
    setDialogType(type);
    setSelectedItem(item);
    setIsEditing(edit);
    setIsDialogOpen(true);
  };

  const handleView = (item: any, type: 'entry' | 'timesheet' | 'report') => {
    setSelectedItem(item);
    setDialogType(type);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (item: any, type: 'entry' | 'timesheet' | 'report') => {
    setSelectedItem(item);
    setDialogType(type);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let key: any = PM_STORAGE_KEYS.TIME_ENTRIES;
    let setter: any = setTimeEntries;
    if (dialogType === 'timesheet') { key = PM_STORAGE_KEYS.TIMESHEETS; setter = setTimesheets; }
    else if (dialogType === 'report') { key = PM_STORAGE_KEYS.TIME_REPORTS; setter = setReports; }
    
    removeEntity(key, selectedItem.id);
    setter((prev: any[]) => prev.filter((item: any) => item.id !== selectedItem.id));
    toast({ title: 'Deleted', description: 'Item deleted successfully', variant: 'destructive' });
    setIsDeleteDialogOpen(false);
  };

  const handleSave = (data: any) => {
    let key: any = PM_STORAGE_KEYS.TIME_ENTRIES;
    let setter: any = setTimeEntries;
    if (dialogType === 'timesheet') { key = PM_STORAGE_KEYS.TIMESHEETS; setter = setTimesheets; }
    else if (dialogType === 'report') { key = PM_STORAGE_KEYS.TIME_REPORTS; setter = setReports; }

    if (isEditing && selectedItem) {
      const updated = { ...selectedItem, ...data };
      upsertEntity(key, updated);
      setter((prev: any[]) => prev.map((item: any) => item.id === selectedItem.id ? updated : item));
      toast({ title: 'Updated', description: 'Item updated successfully' });
    } else {
      const newItem = { 
        ...data, 
        id: generateId(dialogType === 'entry' ? 'time' : dialogType === 'timesheet' ? 'ts' : 'rpt'),
        createdAt: new Date().toISOString()
      };
      upsertEntity(key, newItem);
      setter((prev: any[]) => [newItem, ...prev]);
      toast({ title: 'Created', description: 'Item created successfully' });
    }
    setIsDialogOpen(false);
  };

  const saveTimerEntry = () => {
    if (timerSeconds > 0 && timerProject) {
      const hours = Math.round((timerSeconds / 3600) * 100) / 100;
      const entry: TimeEntry = {
        id: generateId('time'),
        entryId: `TE-${String(timeEntries.length + 1).padStart(4, '0')}`,
        date: new Date().toISOString().split('T')[0],
        projectId: timerProject,
        task: timerTask || 'General',
        hours,
        description: `Time tracked: ${formatTimer(timerSeconds)}`,
        status: 'Draft',
        employeeId: 'emp-001',
        employeeName: 'Current User',
        approvedBy: '',
        approvedDate: ''
      };
      upsertEntity(PM_STORAGE_KEYS.TIME_ENTRIES, entry);
      setTimeEntries(prev => [entry, ...prev]);
      toast({ title: 'Time Entry Saved', description: `${hours} hours logged to ${timerProject}` });
      setTimerSeconds(0);
      setTimerProject('');
      setTimerTask('');
    }
  };

  const generateReport = (type: string) => {
    const newReport: TimeReport = {
      id: generateId('rpt'),
      name: `${type} Report - ${new Date().toLocaleDateString()}`,
      type: type as 'Project' | 'Employee' | 'Billing' | 'Summary',
      dateRange: { start: '2025-01-01', end: '2025-12-31' },
      createdAt: new Date().toISOString(),
      generatedBy: 'Current User'
    };
    upsertEntity(PM_STORAGE_KEYS.TIME_REPORTS, newReport);
    setReports(prev => [newReport, ...prev]);
    toast({ title: 'Report Generated', description: `${type} report has been generated` });
  };

  const timeEntryColumns = [
    { key: 'date', header: 'Date', sortable: true, render: (v: string) => formatDate(v) },
    { key: 'projectId', header: 'Project', sortable: true },
    { key: 'task', header: 'Task', sortable: true },
    { key: 'hours', header: 'Hours', sortable: true, render: (v: number) => `${v}h` },
    { key: 'employeeName', header: 'Employee', sortable: true },
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'Approved' ? 'default' : v === 'Submitted' ? 'secondary' : v === 'Rejected' ? 'destructive' : 'outline'}>{v}</Badge>
    )},
  ];

  const timesheetColumns = [
    { key: 'weekStartDate', header: 'Week Start', render: (v: string) => formatDate(v) },
    { key: 'weekEndDate', header: 'Week End', render: (v: string) => formatDate(v) },
    { key: 'employeeName', header: 'Employee', sortable: true },
    { key: 'totalHours', header: 'Total Hours', sortable: true, render: (v: number) => `${v}h` },
    { key: 'billableHours', header: 'Billable', sortable: true, render: (v: number) => `${v}h` },
    { key: 'status', header: 'Status', render: (v: string) => (
      <Badge variant={v === 'Approved' ? 'default' : v === 'Submitted' ? 'secondary' : v === 'Rejected' ? 'destructive' : 'outline'}>{v}</Badge>
    )},
  ];

  const reportColumns = [
    { key: 'name', header: 'Report Name', sortable: true },
    { key: 'type', header: 'Type', render: (v: string) => (
      <Badge variant={v === 'Project' ? 'default' : v === 'Employee' ? 'secondary' : 'outline'}>{v}</Badge>
    )},
    { key: 'dateRange', header: 'Date Range', render: (v: any) => `${formatDate(v.start)} - ${formatDate(v.end)}` },
    { key: 'generatedBy', header: 'Generated By' },
    { key: 'createdAt', header: 'Created', render: (v: string) => formatDate(v) },
  ];

  const getViewFields = () => {
    if (dialogType === 'entry') return [
      { key: 'entryId', label: 'Entry ID' },
      { key: 'date', label: 'Date', render: (v: string) => formatDate(v) },
      { key: 'projectId', label: 'Project ID' },
      { key: 'task', label: 'Task' },
      { key: 'hours', label: 'Hours' },
      { key: 'description', label: 'Description' },
      { key: 'employeeName', label: 'Employee' },
      { key: 'status', label: 'Status' },
      { key: 'approvedBy', label: 'Approved By' },
      { key: 'approvedDate', label: 'Approved Date', render: (v: string) => formatDate(v) },
    ];
    if (dialogType === 'timesheet') return [
      { key: 'weekStartDate', label: 'Week Start', render: (v: string) => formatDate(v) },
      { key: 'weekEndDate', label: 'Week End', render: (v: string) => formatDate(v) },
      { key: 'employeeName', label: 'Employee' },
      { key: 'totalHours', label: 'Total Hours' },
      { key: 'billableHours', label: 'Billable Hours' },
      { key: 'status', label: 'Status' },
      { key: 'submittedDate', label: 'Submitted Date', render: (v: string) => formatDate(v) },
      { key: 'approvedBy', label: 'Approved By' },
    ];
    return [
      { key: 'name', label: 'Report Name' },
      { key: 'type', label: 'Type' },
      { key: 'dateRange', label: 'Date Range', render: (v: any) => v ? `${formatDate(v.start)} - ${formatDate(v.end)}` : '-' },
      { key: 'generatedBy', label: 'Generated By' },
      { key: 'createdAt', label: 'Created', render: (v: string) => formatDate(v) },
    ];
  };

  const getFormFields = () => {
    if (dialogType === 'entry') return [
      { name: 'date', label: 'Date', type: 'date' as const, required: true },
      { name: 'projectId', label: 'Project ID', type: 'text' as const, required: true },
      { name: 'task', label: 'Task', type: 'text' as const, required: true },
      { name: 'hours', label: 'Hours', type: 'number' as const, required: true },
      { name: 'description', label: 'Description', type: 'textarea' as const, rows: 2 },
      { name: 'employeeName', label: 'Employee Name', type: 'text' as const, required: true },
      { name: 'status', label: 'Status', type: 'select' as const, options: [
        { label: 'Draft', value: 'Draft' }, { label: 'Submitted', value: 'Submitted' }, { label: 'Approved', value: 'Approved' }, { label: 'Rejected', value: 'Rejected' }
      ]},
    ];
    if (dialogType === 'timesheet') return [
      { name: 'weekStartDate', label: 'Week Start', type: 'date' as const, required: true },
      { name: 'weekEndDate', label: 'Week End', type: 'date' as const, required: true },
      { name: 'employeeName', label: 'Employee Name', type: 'text' as const, required: true },
      { name: 'totalHours', label: 'Total Hours', type: 'number' as const },
      { name: 'billableHours', label: 'Billable Hours', type: 'number' as const },
      { name: 'status', label: 'Status', type: 'select' as const, options: [
        { label: 'Draft', value: 'Draft' }, { label: 'Submitted', value: 'Submitted' }, { label: 'Approved', value: 'Approved' }, { label: 'Rejected', value: 'Rejected' }
      ]},
    ];
    return [
      { name: 'name', label: 'Report Name', type: 'text' as const, required: true },
      { name: 'type', label: 'Type', type: 'select' as const, options: [
        { label: 'Project', value: 'Project' }, { label: 'Employee', value: 'Employee' }, { label: 'Billing', value: 'Billing' }, { label: 'Summary', value: 'Summary' }
      ]},
      { name: 'startDate', label: 'Start Date', type: 'date' as const },
      { name: 'endDate', label: 'End Date', type: 'date' as const },
      { name: 'generatedBy', label: 'Generated By', type: 'text' as const },
    ];
  };

  const todayHours = timeEntries.filter(e => e.date === new Date().toISOString().split('T')[0]).reduce((sum, e) => sum + e.hours, 0);
  const weekHours = timeEntries.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return d >= weekStart;
  }).reduce((sum, e) => sum + e.hours, 0);
  const billableHours = timesheets.filter(t => t.status === 'Approved').reduce((sum, t) => sum + t.billableHours, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/project-management')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Time Recording" description="Track time, manage timesheets, and generate reports" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today" value={`${todayHours}h`} icon={<Clock className="h-6 w-6 text-blue-600" />} />
        <StatCard title="This Week" value={`${weekHours}h`} icon={<Calendar className="h-6 w-6 text-green-600" />} />
        <StatCard title="Billable" value={`${billableHours}h`} icon={<FileText className="h-6 w-6 text-purple-600" />} />
        <StatCard title="Reports" value={reports.length} icon={<BarChart3 className="h-6 w-6 text-orange-600" />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recording">Time Recording</TabsTrigger>
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="recording" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Time Tracker</h3>
              <div className="text-center space-y-4">
                <div className="text-5xl font-mono font-bold text-blue-600">{formatTimer(timerSeconds)}</div>
                <div className="space-y-2">
                  <select className="w-full p-2 border rounded-md" value={timerProject} onChange={e => setTimerProject(e.target.value)}>
                    <option value="">Select Project</option>
                    <option value="PRJ-2023-001">ERP Implementation</option>
                    <option value="PRJ-2023-008">Warehouse Expansion</option>
                    <option value="PRJ-2023-012">Quality System Upgrade</option>
                  </select>
                  <select className="w-full p-2 border rounded-md" value={timerTask} onChange={e => setTimerTask(e.target.value)}>
                    <option value="">Select Task</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsTimerRunning(!isTimerRunning)} className={isTimerRunning ? 'bg-red-600' : 'bg-green-600'}>
                    {isTimerRunning ? <><Pause className="h-4 w-4 mr-2" />Pause</> : <><Play className="h-4 w-4 mr-2" />Start</>}
                  </Button>
                  <Button variant="outline" onClick={saveTimerEntry} disabled={timerSeconds === 0}>
                    <Save className="h-4 w-4 mr-2" />Save Entry
                  </Button>
                  <Button variant="outline" onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }}>
                    Reset
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2"><span>Today's Hours</span><span className="font-semibold">{todayHours}h</span></div>
                <div className="flex justify-between items-center border-b pb-2"><span>This Week</span><span className="font-semibold">{weekHours}h</span></div>
                <div className="flex justify-between items-center border-b pb-2"><span>Billable Hours</span><span className="font-semibold">{billableHours}h</span></div>
                <div className="flex justify-between items-center border-b pb-2"><span>Pending Approval</span><span className="font-semibold text-orange-600">{timeEntries.filter(e => e.status === 'Submitted').length}</span></div>
                <div className="flex justify-between items-center"><span>Overtime</span><span className="font-semibold text-red-600">{Math.max(0, weekHours - 40)}h</span></div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entries" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Time Entries</h3>
              <Button onClick={() => handleCRUD('entry')}><Plus className="h-4 w-4 mr-2" />Add Entry</Button>
            </div>
            <EnhancedCRUDTable data={timeEntries} columns={timeEntryColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('entry')} onEdit={item => handleCRUD('entry', item, true)} onDelete={item => handleDelete(item, 'entry')} onView={item => handleView(item, 'entry')} />
          </Card>
        </TabsContent>

        <TabsContent value="timesheets" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Timesheets</h3>
              <Button onClick={() => handleCRUD('timesheet')}><Plus className="h-4 w-4 mr-2" />Add Timesheet</Button>
            </div>
            <EnhancedCRUDTable data={timesheets} columns={timesheetColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('timesheet')} onEdit={item => handleCRUD('timesheet', item, true)} onDelete={item => handleDelete(item, 'timesheet')} onView={item => handleView(item, 'timesheet')} />
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generate Reports</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <Clock className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium mb-2">Project Time Report</h4>
                <p className="text-sm text-gray-500 mb-3">Track time spent per project</p>
                <Button onClick={() => generateReport('Project')}>Generate</Button>
              </div>
              <div className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <User className="h-10 w-10 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium mb-2">Employee Time Report</h4>
                <p className="text-sm text-gray-500 mb-3">View hours by employee</p>
                <Button onClick={() => generateReport('Employee')}>Generate</Button>
              </div>
              <div className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <FileText className="h-10 w-10 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium mb-2">Billing Report</h4>
                <p className="text-sm text-gray-500 mb-3">Billable hours summary</p>
                <Button onClick={() => generateReport('Billing')}>Generate</Button>
              </div>
            </div>

            <h4 className="font-medium mb-3">Saved Reports</h4>
            <EnhancedCRUDTable data={reports} columns={reportColumns} title="" pageSize={10}
              onCreate={() => handleCRUD('report')} onEdit={item => handleCRUD('report', item, true)} onDelete={item => handleDelete(item, 'report')} onView={item => handleView(item, 'report')} />
          </Card>
        </TabsContent>
      </Tabs>

      <CRUDDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} 
        title={dialogType === 'entry' ? 'Time Entry' : dialogType === 'timesheet' ? 'Timesheet' : 'Time Report'}
        item={selectedItem} onSave={handleSave} fields={getFormFields()} isEdit={isEditing} />
      
      <ConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={confirmDelete} 
        title="Delete Item" description="Are you sure you want to delete this item?" confirmLabel="Delete" />

      <ViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}
        title={dialogType === 'entry' ? 'Time Entry' : dialogType === 'timesheet' ? 'Timesheet' : 'Time Report'}
        item={selectedItem} fields={getViewFields()} />
    </div>
  );
};

export default TimeRecording;
