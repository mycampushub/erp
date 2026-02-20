
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Plus, Eye, Edit, Trash2, DollarSign, Calculator, FileText, CheckCircle, Download, Printer, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import { getSeedData } from '../../data/hrSeedData';
import { generateId } from '../../lib/localCrud';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  period: string;
  baseSalary: number;
  overtime: number;
  bonus: number;
  commission: number;
  grossSalary: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  healthInsurance: number;
  retirement: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Processed' | 'Failed';
  payDate: string;
  bankAccount: string;
  ytdEarnings: number;
  ytdDeductions: number;
}

const departments = ['Information Technology', 'Human Resources', 'Finance', 'Sales', 'Marketing', 'Operations', 'Engineering', 'Customer Service'];

const calcDeductions = (gross: number) => {
  return {
    federalTax: Math.round(gross * 0.12 * 100) / 100,
    stateTax: Math.round(gross * 0.04 * 100) / 100,
    socialSecurity: Math.round(gross * 0.062 * 100) / 100,
    healthInsurance: 250,
    retirement: Math.round(gross * 0.05 * 100) / 100,
    otherDeductions: 0,
    totalDeductions: Math.round((gross * 0.12 + gross * 0.04 + gross * 0.062 + 250 + gross * 0.05) * 100) / 100,
    netSalary: Math.round((gross - gross * 0.12 - gross * 0.04 - gross * 0.062 - 250 - gross * 0.05) * 100) / 100
  };
};

const Payroll: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('records');
  const seedData = getSeedData();
  const [records, setRecords] = useState<PayrollRecord[]>(() => seedData.payrollRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    if (isEnabled) speak('Welcome to Payroll Management. Process employee salaries, taxes, and benefits calculations.');
  }, [isEnabled, speak]);

  const saveRecords = (data: PayrollRecord[]) => {
    setRecords(data);
  };

  const openCreate = () => {
    setEditingRecord(null);
    setIsDialogOpen(true);
  };

  const openEdit = (r: PayrollRecord) => {
    setEditingRecord(r);
    setIsDialogOpen(true);
  };

  const handleView = (r: PayrollRecord) => {
    setSelectedRecord(r);
    setIsViewDialogOpen(true);
  };

  const handleSave = (data: Partial<PayrollRecord>) => {
    const gross = (data.baseSalary || 0) + (data.overtime || 0) + (data.bonus || 0) + (data.commission || 0);
    const calcs = calcDeductions(gross);
    
    if (editingRecord) {
      const updated = { ...editingRecord, ...data, ...calcs };
      const updatedList = records.map(r => r.id === editingRecord.id ? updated : r);
      saveRecords(updatedList);
      toast({ title: 'Record Updated', description: `Payroll for ${data.employeeName} updated.` });
    } else {
      const newRecord: PayrollRecord = {
        id: generateId('pay'),
        ...data as PayrollRecord,
        ...calcs,
        status: 'Draft'
      };
      saveRecords([newRecord, ...records]);
      toast({ title: 'Record Created', description: `Payroll for ${data.employeeName} created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (r: PayrollRecord) => {
    if (r.status === 'Processed') {
      toast({ title: 'Cannot Delete', description: 'Processed records cannot be deleted.', variant: 'destructive' });
      return;
    }
    const updated = records.filter(rec => rec.id !== r.id);
    saveRecords(updated);
    toast({ title: 'Record Deleted', description: `Payroll for ${r.employeeName} removed.` });
  };

  const handleApprove = (r: PayrollRecord) => {
    const updated = records.map(rec => rec.id === r.id ? { ...rec, status: 'Approved' as const } : rec);
    saveRecords(updated);
    toast({ title: 'Approved', description: `Payroll for ${r.employeeName} approved.` });
  };

  const handleProcess = (r: PayrollRecord) => {
    const updated = records.map(rec => rec.id === r.id ? { ...rec, status: 'Processed' as const } : rec);
    saveRecords(updated);
    toast({ title: 'Payroll Processed', description: `Payment of $${r.netSalary.toLocaleString()} processed for ${r.employeeName}.` });
  };

  const processAll = () => {
    const pending = records.filter(r => r.status === 'Approved');
    if (pending.length === 0) {
      toast({ title: 'No Records', description: 'No approved records to process.', variant: 'destructive' });
      return;
    }
    const updated = records.map(r => r.status === 'Approved' ? { ...r, status: 'Processed' as const } : r);
    saveRecords(updated);
    toast({ title: 'Batch Processed', description: `${pending.length} payroll records processed.` });
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'Processed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800'
    };
    return c[s] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'employeeId', header: 'ID', sortable: true, searchable: true, width: '80px' },
    { key: 'employeeName', header: 'Employee', searchable: true },
    { key: 'department', header: 'Department', filterable: true, filterOptions: departments.map(d => ({ label: d, value: d })) },
    { key: 'period', header: 'Period', sortable: true },
    { key: 'baseSalary', header: 'Base', sortable: true, render: (v: number) => `$${v?.toLocaleString()}` },
    { key: 'bonus', header: 'Bonus', render: (v: number) => v > 0 ? `$${v?.toLocaleString()}` : '-' },
    { key: 'grossSalary', header: 'Gross', sortable: true, render: (v: number) => `$${v?.toLocaleString()}` },
    { key: 'totalDeductions', header: 'Deductions', render: (v: number) => `$${v?.toLocaleString()}` },
    { key: 'netSalary', header: 'Net Pay', sortable: true, render: (v: number) => <span className="font-semibold text-green-700">${v?.toLocaleString()}</span> },
    { 
      key: 'status', 
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Draft', value: 'Draft' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Processed', value: 'Processed' }
      ],
      render: (value: string) => <Badge className={getStatusColor(value)}>{value}</Badge>
    },
    { key: 'payDate', header: 'Pay Date', sortable: true },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: handleView, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: openEdit, variant: 'ghost', condition: (row: PayrollRecord) => row.status !== 'Processed' },
    { label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, onClick: handleApprove, variant: 'ghost', condition: (row: PayrollRecord) => ['Draft', 'Pending'].includes(row.status) },
    { label: 'Process', icon: <DollarSign className="h-4 w-4" />, onClick: handleProcess, variant: 'ghost', condition: (row: PayrollRecord) => row.status === 'Approved' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: handleDelete, variant: 'ghost', condition: (row: PayrollRecord) => row.status !== 'Processed' },
  ];

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(r => 
      r.employeeName.toLowerCase().includes(term) ||
      r.employeeId.toLowerCase().includes(term) ||
      r.department.toLowerCase().includes(term)
    );
  }, [records, searchTerm]);

  const stats = useMemo(() => ({
    totalGross: records.reduce((s, r) => s + r.grossSalary, 0),
    totalNet: records.reduce((s, r) => s + r.netSalary, 0),
    totalDeductions: records.reduce((s, r) => s + r.totalDeductions, 0),
    processed: records.filter(r => r.status === 'Processed').length,
    pending: records.filter(r => ['Draft', 'Pending'].includes(r.status)).length,
  }), [records]);

  const departmentBreakdown = useMemo(() => {
    const breakdown: Record<string, { gross: number; net: number; count: number }> = {};
    records.forEach(r => {
      if (!breakdown[r.department]) breakdown[r.department] = { gross: 0, net: 0, count: 0 };
      breakdown[r.department].gross += r.grossSalary;
      breakdown[r.department].net += r.netSalary;
      breakdown[r.department].count += 1;
    });
    return breakdown;
  }, [records]);

  const deductionBreakdown = useMemo(() => ({
    federalTax: records.reduce((s, r) => s + r.federalTax, 0),
    stateTax: records.reduce((s, r) => s + r.stateTax, 0),
    socialSecurity: records.reduce((s, r) => s + r.socialSecurity, 0),
    healthInsurance: records.reduce((s, r) => s + r.healthInsurance, 0),
    retirement: records.reduce((s, r) => s + r.retirement, 0),
  }), [records]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/human-resources')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Payroll Management" description="Process employee salaries, taxes, and benefits calculations" voiceIntroduction="Welcome to Payroll Management." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-700">${stats.totalGross.toLocaleString()}</div>
            <div className="text-sm text-blue-600">Total Gross</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">${stats.totalNet.toLocaleString()}</div>
            <div className="text-sm text-green-600">Net Disbursement</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-700">$${stats.totalDeductions.toLocaleString()}</div>
            <div className="text-sm text-red-600">Total Deductions</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">{stats.processed}</div>
            <div className="text-sm text-green-600">Processed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="records">Payroll Records</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payroll Records ({filteredRecords.length})
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" onClick={processAll}><Calculator className="h-4 w-4 mr-2" />Process All</Button>
                <Button variant="outline"><RefreshCw className="h-4 w-4" /></Button>
                <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Record</Button>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={columns} data={filteredRecords} actions={actions} searchPlaceholder="Search payroll records..." exportable={true} pageSize={10} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Deduction Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Federal Tax', value: deductionBreakdown.federalTax },
                    { label: 'State Tax', value: deductionBreakdown.stateTax },
                    { label: 'Social Security', value: deductionBreakdown.socialSecurity },
                    { label: 'Health Insurance', value: deductionBreakdown.healthInsurance },
                    { label: 'Retirement (401k)', value: deductionBreakdown.retirement },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total Deductions</span>
                    <span>${stats.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />By Department</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(departmentBreakdown).map(([dept, data]) => (
                    <div key={dept} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{dept}</div>
                        <div className="text-sm text-muted-foreground">{data.count} employees</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${data.gross.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">gross</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader><CardTitle>Payroll Reports</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <Download className="h-5 w-5" />
                  <span>Export CSV</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <Printer className="h-5 w-5" />
                  <span>Print Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Tax Documents</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Bank Files</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Payroll Record' : 'Add Payroll Record'}</DialogTitle>
          </DialogHeader>
          <PayrollForm record={editingRecord} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Pay Slip: {selectedRecord?.employeeName}</DialogTitle></DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><Label>Employee ID</Label><div>{selectedRecord.employeeId}</div></div>
                <div><Label>Department</Label><div>{selectedRecord.department}</div></div>
                <div><Label>Period</Label><div>{selectedRecord.period}</div></div>
                <div><Label>Pay Date</Label><div>{selectedRecord.payDate}</div></div>
              </div>
              <div className="border rounded p-3 space-y-2 text-sm">
                <div className="font-semibold text-muted-foreground">EARNINGS</div>
                <div className="flex justify-between"><span>Base Salary</span><span>${selectedRecord.baseSalary.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Overtime</span><span>${selectedRecord.overtime.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Bonus</span><span>${selectedRecord.bonus.toLocaleString()}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Gross Pay</span><span>${selectedRecord.grossSalary.toLocaleString()}</span></div>
              </div>
              <div className="border rounded p-3 space-y-2 text-sm">
                <div className="font-semibold text-muted-foreground">DEDUCTIONS</div>
                <div className="flex justify-between"><span>Federal Tax</span><span>-${selectedRecord.federalTax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>State Tax</span><span>-${selectedRecord.stateTax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Social Security</span><span>-${selectedRecord.socialSecurity.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Health Insurance</span><span>-${selectedRecord.healthInsurance.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Retirement</span><span>-${selectedRecord.retirement.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-1"><span>Total Deductions</span><span>-${selectedRecord.totalDeductions.toFixed(2)}</span></div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3 flex justify-between items-center">
                <span className="font-bold text-lg">Net Pay</span>
                <span className="font-bold text-xl text-green-700">${selectedRecord.netSalary.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                {selectedRecord.status !== 'Processed' && <Button onClick={() => { openEdit(selectedRecord); setIsViewDialogOpen(false); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PayrollForm: React.FC<{
  record: PayrollRecord | null;
  onSave: (data: Partial<PayrollRecord>) => void;
  onCancel: () => void;
}> = ({ record, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: record?.employeeId || '',
    employeeName: record?.employeeName || '',
    department: record?.department || 'Information Technology',
    position: record?.position || '',
    period: record?.period || '2025-01',
    baseSalary: record?.baseSalary || 5000,
    overtime: record?.overtime || 0,
    bonus: record?.bonus || 0,
    commission: record?.commission || 0,
    payDate: record?.payDate || '2025-01-31',
    bankAccount: record?.bankAccount || '',
    status: record?.status || 'Draft',
  });

  const gross = formData.baseSalary + formData.overtime + formData.bonus + formData.commission;
  const deductions = calcDeductions(gross);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Employee ID *</Label>
          <Input value={formData.employeeId} onChange={e => setFormData(f => ({ ...f, employeeId: e.target.value }))} placeholder="EMP-001" required />
        </div>
        <div>
          <Label>Employee Name *</Label>
          <Input value={formData.employeeName} onChange={e => setFormData(f => ({ ...f, employeeName: e.target.value }))} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Department</Label>
          <Select value={formData.department} onValueChange={v => setFormData(f => ({ ...f, department: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Pay Period</Label>
          <Input value={formData.period} onChange={e => setFormData(f => ({ ...f, period: e.target.value }))} placeholder="2025-01" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Base Salary ($)</Label>
          <Input type="number" value={formData.baseSalary} onChange={e => setFormData(f => ({ ...f, baseSalary: Number(e.target.value) }))} />
        </div>
        <div>
          <Label>Overtime ($)</Label>
          <Input type="number" value={formData.overtime} onChange={e => setFormData(f => ({ ...f, overtime: Number(e.target.value) }))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Bonus ($)</Label>
          <Input type="number" value={formData.bonus} onChange={e => setFormData(f => ({ ...f, bonus: Number(e.target.value) }))} />
        </div>
        <div>
          <Label>Pay Date</Label>
          <Input type="date" value={formData.payDate} onChange={e => setFormData(f => ({ ...f, payDate: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Bank Account</Label>
          <Input value={formData.bankAccount} onChange={e => setFormData(f => ({ ...f, bankAccount: e.target.value }))} placeholder="****1234" />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={v => setFormData(f => ({ ...f, status: v as PayrollRecord['status'] }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-muted p-3 rounded text-sm space-y-1">
        <div className="font-medium">Calculated:</div>
        <div>Gross: ${gross.toLocaleString()}</div>
        <div>Deductions: ${deductions.totalDeductions.toLocaleString()}</div>
        <div className="font-semibold text-green-700">Net (est.): ${deductions.netSalary.toLocaleString()}</div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{record ? 'Update' : 'Create'} Record</Button>
      </DialogFooter>
    </form>
  );
};

export default Payroll;
