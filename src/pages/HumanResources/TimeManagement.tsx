
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Plus, Clock, Calendar, CheckCircle, Users, Moon, Sun, Briefcase, Trash2, Edit, Eye, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { getSeedData } from '../../data/hrSeedData';
import { generateId } from '../../lib/localCrud';

interface TimeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  breakTime: number;
  overtime: number;
  status: 'Complete' | 'In Progress' | 'Absent' | 'Late';
  location: string;
  notes?: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Vacation' | 'Sick' | 'Personal' | 'Maternity' | 'Paternity' | 'Bereavement';
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  reason: string;
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

const TimeManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('time-records');
  const seedData = getSeedData();
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>(() => seedData.timeRecords);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => seedData.leaveRequests);
  const [shifts, setShifts] = useState<Shift[]>(() => seedData.shifts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'time' | 'leave' | 'shift'>('time');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Time Management. Track employee working hours, attendance, and leave requests.');
    }
  }, [isEnabled, speak]);

  const saveTimeRecords = (data: TimeRecord[]) => {
    setTimeRecords(data);
  };

  const saveLeaveRequests = (data: LeaveRequest[]) => {
    setLeaveRequests(data);
  };

  const saveShifts = (data: Shift[]) => {
    setShifts(data);
  };

  const getStatusColor = (status: string, type: 'time' | 'leave' | 'shift') => {
    if (type === 'time') {
      const colors: Record<string, string> = {
        'Complete': 'bg-green-100 text-green-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Absent': 'bg-red-100 text-red-800',
        'Late': 'bg-yellow-100 text-yellow-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    }
    if (type === 'leave') {
      const colors: Record<string, string> = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    }
    const colors: Record<string, string> = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleAddRecord = (type: 'time' | 'leave' | 'shift') => {
    setDialogType(type);
    setEditingRecord(null);
    setIsDialogOpen(true);
  };

  const handleEditRecord = (record: any, type: 'time' | 'leave' | 'shift') => {
    setDialogType(type);
    setEditingRecord(record);
    setIsDialogOpen(true);
  };

  const handleDeleteRecord = (id: string, type: 'time' | 'leave' | 'shift') => {
    if (type === 'time') {
      const updated = timeRecords.filter(r => r.id !== id);
      saveTimeRecords(updated);
    } else if (type === 'leave') {
      const updated = leaveRequests.filter(r => r.id !== id);
      saveLeaveRequests(updated);
    } else {
      const updated = shifts.filter(s => s.id !== id);
      saveShifts(updated);
    }
    toast({ title: 'Record Deleted', description: 'Record has been removed.' });
  };

  const handleSaveRecord = (data: any) => {
    if (dialogType === 'time') {
      if (editingRecord) {
        const updated = timeRecords.map(r => r.id === editingRecord.id ? { ...r, ...data } : r);
        saveTimeRecords(updated);
        toast({ title: 'Time Record Updated' });
      } else {
        const newRecord: TimeRecord = { id: generateId('time'), ...data };
        saveTimeRecords([newRecord, ...timeRecords]);
        toast({ title: 'Time Record Created' });
      }
    } else if (dialogType === 'leave') {
      if (editingRecord) {
        const updated = leaveRequests.map(r => r.id === editingRecord.id ? { ...r, ...data } : r);
        saveLeaveRequests(updated);
        toast({ title: 'Leave Request Updated' });
      } else {
        const newRequest: LeaveRequest = { id: generateId('leave'), ...data };
        saveLeaveRequests([newRequest, ...leaveRequests]);
        toast({ title: 'Leave Request Created' });
      }
    } else {
      if (editingRecord) {
        const updated = shifts.map(s => s.id === editingRecord.id ? { ...s, ...data } : s);
        saveShifts(updated);
        toast({ title: 'Shift Updated' });
      } else {
        const newShift: Shift = { id: generateId('shift'), ...data };
        saveShifts([newShift, ...shifts]);
        toast({ title: 'Shift Created' });
      }
    }
    setIsDialogOpen(false);
  };

  const handleApproveLeave = (id: string) => {
    const updated = leaveRequests.map(r => r.id === id ? { ...r, status: 'Approved' as const, approvedBy: 'HR Manager' } : r);
    saveLeaveRequests(updated);
    toast({ title: 'Leave Request Approved' });
  };

  const timeColumns: EnhancedColumn[] = [
    { key: 'employeeId', header: 'ID', sortable: true, searchable: true, width: '80px' },
    { key: 'employeeName', header: 'Employee', searchable: true },
    { key: 'date', header: 'Date', sortable: true },
    { key: 'clockIn', header: 'Clock In' },
    { key: 'clockOut', header: 'Clock Out' },
    { key: 'totalHours', header: 'Hours', sortable: true, render: (v: number) => v.toFixed(1) },
    { key: 'overtime', header: 'OT', render: (v: number) => v > 0 ? <span className="text-orange-600 font-medium">{v.toFixed(1)}</span> : '-' },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Complete', value: 'Complete' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Absent', value: 'Absent' },
        { label: 'Late', value: 'Late' }
      ],
      render: (value: string) => <Badge className={getStatusColor(value, 'time')}>{value}</Badge>
    },
    { key: 'location', header: 'Location' },
  ];

  const timeActions: TableAction[] = [
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: TimeRecord) => handleEditRecord(row, 'time'), variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: TimeRecord) => handleDeleteRecord(row.id, 'time'), variant: 'ghost' },
  ];

  const leaveColumns: EnhancedColumn[] = [
    { key: 'employeeId', header: 'ID', sortable: true, width: '80px' },
    { key: 'employeeName', header: 'Employee', searchable: true },
    { key: 'leaveType', header: 'Type', filterable: true, filterOptions: [
      { label: 'Vacation', value: 'Vacation' },
      { label: 'Sick', value: 'Sick' },
      { label: 'Personal', value: 'Personal' }
    ]},
    { key: 'startDate', header: 'Start', sortable: true },
    { key: 'endDate', header: 'End' },
    { key: 'totalDays', header: 'Days', sortable: true },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Pending', value: 'Pending' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' }
      ],
      render: (value: string) => <Badge className={getStatusColor(value, 'leave')}>{value}</Badge>
    },
  ];

  const leaveActions: TableAction[] = [
    { label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, onClick: (row: LeaveRequest) => handleApproveLeave(row.id), variant: 'ghost', condition: (row: LeaveRequest) => row.status === 'Pending' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: LeaveRequest) => handleEditRecord(row, 'leave'), variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: LeaveRequest) => handleDeleteRecord(row.id, 'leave'), variant: 'ghost' },
  ];

  const shiftColumns: EnhancedColumn[] = [
    { key: 'employeeId', header: 'ID', width: '80px' },
    { key: 'employeeName', header: 'Employee', searchable: true },
    { key: 'shiftName', header: 'Shift' },
    { key: 'date', header: 'Date', sortable: true },
    { key: 'startTime', header: 'Start' },
    { key: 'endTime', header: 'End' },
    { key: 'location', header: 'Location' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => <Badge className={getStatusColor(value, 'shift')}>{value}</Badge>
    },
  ];

  const shiftActions: TableAction[] = [
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: Shift) => handleEditRecord(row, 'shift'), variant: 'ghost' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: Shift) => handleDeleteRecord(row.id, 'shift'), variant: 'ghost' },
  ];

  const stats = useMemo(() => ({
    present: timeRecords.filter(r => r.status === 'Complete').length,
    onLeave: leaveRequests.filter(r => r.status === 'Approved').length,
    overtime: timeRecords.reduce((sum, r) => sum + r.overtime, 0),
    avgHours: timeRecords.length > 0 ? timeRecords.reduce((sum, r) => sum + r.totalHours, 0) / timeRecords.length : 0,
    pendingLeaves: leaveRequests.filter(r => r.status === 'Pending').length,
    scheduledShifts: shifts.filter(s => s.status === 'Scheduled').length,
  }), [timeRecords, leaveRequests, shifts]);

  const filteredTimeRecords = useMemo(() => {
    if (!searchTerm) return timeRecords;
    const term = searchTerm.toLowerCase();
    return timeRecords.filter(r => 
      r.employeeName.toLowerCase().includes(term) ||
      r.employeeId.toLowerCase().includes(term)
    );
  }, [timeRecords, searchTerm]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/human-resources')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Time Management"
          description="Track employee working hours, attendance, and leave requests"
          voiceIntroduction="Welcome to Time Management."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">{stats.present}</div>
            <div className="text-sm text-green-600">Present Today</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-700">{stats.onLeave}</div>
            <div className="text-sm text-yellow-600">On Leave</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-700">{stats.overtime.toFixed(1)}</div>
            <div className="text-sm text-orange-600">Overtime Hours</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-700">{stats.avgHours.toFixed(1)}</div>
            <div className="text-sm text-blue-600">Avg Hours</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-700">{stats.pendingLeaves}</div>
            <div className="text-sm text-purple-600">Pending Leaves</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-700">{stats.scheduledShifts}</div>
            <div className="text-sm text-indigo-600">Scheduled Shifts</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="time-records" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Time Records
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Leave Management
          </TabsTrigger>
          <TabsTrigger value="shifts" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Shift Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="time-records" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Records ({filteredTimeRecords.length})
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /></Button>
                <Button onClick={() => handleAddRecord('time')}><Plus className="h-4 w-4 mr-2" />Add Entry</Button>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable
                columns={timeColumns}
                data={filteredTimeRecords}
                actions={timeActions}
                searchPlaceholder="Search time records..."
                exportable={true}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Leave Requests ({leaveRequests.length})
              </CardTitle>
              <Button onClick={() => handleAddRecord('leave')}><Plus className="h-4 w-4 mr-2" />Request Leave</Button>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable
                columns={leaveColumns}
                data={leaveRequests}
                actions={leaveActions}
                searchPlaceholder="Search leave requests..."
                exportable={true}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Shift Schedule ({shifts.length})
              </CardTitle>
              <Button onClick={() => handleAddRecord('shift')}><Plus className="h-4 w-4 mr-2" />Add Shift</Button>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable
                columns={shiftColumns}
                data={shifts}
                actions={shiftActions}
                searchPlaceholder="Search shifts..."
                exportable={true}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'time' ? (editingRecord ? 'Edit Time Entry' : 'Add Time Entry') : 
               dialogType === 'leave' ? (editingRecord ? 'Edit Leave Request' : 'Request Leave') :
               (editingRecord ? 'Edit Shift' : 'Add Shift')}
            </DialogTitle>
          </DialogHeader>
          <RecordForm
            type={dialogType}
            record={editingRecord}
            onSave={handleSaveRecord}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const RecordForm: React.FC<{
  type: 'time' | 'leave' | 'shift';
  record: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ type, record, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: record?.employeeId || 'EMP-001',
    employeeName: record?.employeeName || 'John Smith',
    date: record?.date || new Date().toISOString().split('T')[0],
    clockIn: record?.clockIn || '09:00',
    clockOut: record?.clockOut || '17:00',
    totalHours: record?.totalHours || 8,
    breakTime: record?.breakTime || 0.5,
    overtime: record?.overtime || 0,
    status: record?.status || 'Complete',
    location: record?.location || 'New York Office',
    leaveType: record?.leaveType || 'Vacation',
    startDate: record?.startDate || '',
    endDate: record?.endDate || '',
    totalDays: record?.totalDays || 1,
    reason: record?.reason || '',
    shiftName: record?.shiftName || 'Day Shift',
    startTime: record?.startTime || '09:00',
    endTime: record?.endTime || '17:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let data: any = {};
    
    if (type === 'time') {
      const hours = parseFloat(formData.clockOut.split(':')[0]) - parseFloat(formData.clockIn.split(':')[0]);
      const total = hours - formData.breakTime;
      data = {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        date: formData.date,
        clockIn: formData.clockIn,
        clockOut: formData.clockOut,
        totalHours: total > 0 ? total : 0,
        breakTime: formData.breakTime,
        overtime: total > 8 ? total - 8 : 0,
        status: formData.status as TimeRecord['status'],
        location: formData.location
      };
    } else if (type === 'leave') {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      data = {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        leaveType: formData.leaveType as LeaveRequest['leaveType'],
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: days,
        status: 'Pending' as const,
        reason: formData.reason
      };
    } else {
      data = {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        shiftName: formData.shiftName,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        status: 'Scheduled' as const
      };
    }
    
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Employee ID</Label>
          <Input value={formData.employeeId} onChange={e => setFormData(p => ({ ...p, employeeId: e.target.value }))} />
        </div>
        <div>
          <Label>Employee Name</Label>
          <Input value={formData.employeeName} onChange={e => setFormData(p => ({ ...p, employeeName: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
        </div>
        {type !== 'leave' && (
          <div>
            <Label>Location</Label>
            <Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
          </div>
        )}
      </div>

      {type === 'time' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Clock In</Label>
              <Input type="time" value={formData.clockIn} onChange={e => setFormData(p => ({ ...p, clockIn: e.target.value }))} />
            </div>
            <div>
              <Label>Clock Out</Label>
              <Input type="time" value={formData.clockOut} onChange={e => setFormData(p => ({ ...p, clockOut: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Break Time (hrs)</Label>
              <Input type="number" step="0.5" value={formData.breakTime} onChange={e => setFormData(p => ({ ...p, breakTime: parseFloat(e.target.value) }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {type === 'leave' && (
        <>
          <div>
            <Label>Leave Type</Label>
            <Select value={formData.leaveType} onValueChange={v => setFormData(p => ({ ...p, leaveType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Vacation">Vacation</SelectItem>
                <SelectItem value="Sick">Sick</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Maternity">Maternity</SelectItem>
                <SelectItem value="Paternity">Paternity</SelectItem>
                <SelectItem value="Bereavement">Bereavement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Reason</Label>
            <Input value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} />
          </div>
        </>
      )}

      {type === 'shift' && (
        <>
          <div>
            <Label>Shift Name</Label>
            <Select value={formData.shiftName} onValueChange={v => setFormData(p => ({ ...p, shiftName: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning Shift">Morning Shift</SelectItem>
                <SelectItem value="Day Shift">Day Shift</SelectItem>
                <SelectItem value="Evening Shift">Evening Shift</SelectItem>
                <SelectItem value="Night Shift">Night Shift</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={formData.startTime} onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={formData.endTime} onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))} />
            </div>
          </div>
        </>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{record ? 'Update' : 'Create'}</Button>
      </DialogFooter>
    </form>
  );
};

export default TimeManagement;
