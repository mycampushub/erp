
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Eye, Edit, Trash2, Plus, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { useToast } from '../../hooks/use-toast';
import { generateId } from '../../lib/localCrud';
import { Badge } from '../../components/ui/badge';

const requisitionSchema = z.object({
  id: z.string().min(1),
  reqNumber: z.string().min(3, 'Requisition number is required'),
  title: z.string().min(2, 'Title is required'),
  requestor: z.string().min(2, 'Requestor is required'),
  department: z.string().min(1, 'Department is required'),
  requestDate: z.string().min(1, 'Request date is required'),
  neededDate: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  value: z.coerce.number().min(0, 'Value must be positive'),
  items: z.coerce.number().int().min(1, 'At least one item'),
  status: z.enum(['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Converted to PO']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  notes: z.string().optional(),
});

type Requisition = z.infer<typeof requisitionSchema>;

const departments = ['Finance', 'IT', 'Marketing', 'Production', 'HR', 'Operations', 'Sales', 'R&D', 'Legal', 'Admin'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

const seedData: Requisition[] = [
  { id: generateId('pr'), reqNumber: 'PR-10045', title: 'Office Supplies', requestor: 'John Smith', department: 'Finance', requestDate: '2025-08-01', neededDate: '2025-08-15', currency: 'USD', value: 1250, items: 12, status: 'Pending Approval', priority: 'Low' },
  { id: generateId('pr'), reqNumber: 'PR-10046', title: 'IT Equipment', requestor: 'Maria Garcia', department: 'IT', requestDate: '2025-07-30', neededDate: '2025-08-10', currency: 'USD', value: 8745, items: 5, status: 'Approved', priority: 'High' },
  { id: generateId('pr'), reqNumber: 'PR-10047', title: 'Marketing Materials', requestor: 'Alex Johnson', department: 'Marketing', requestDate: '2025-07-28', neededDate: '2025-08-08', currency: 'USD', value: 3500, items: 8, status: 'Pending Approval', priority: 'Medium' },
  { id: generateId('pr'), reqNumber: 'PR-10048', title: 'Manufacturing Supplies', requestor: 'Robert Chen', department: 'Production', requestDate: '2025-07-25', neededDate: '2025-08-05', currency: 'USD', value: 12800, items: 15, status: 'Rejected', priority: 'Urgent' },
  { id: generateId('pr'), reqNumber: 'PR-10049', title: 'Training Services', requestor: 'Emma Wilson', department: 'HR', requestDate: '2025-07-22', neededDate: '2025-08-01', currency: 'USD', value: 5200, items: 3, status: 'Approved', priority: 'Medium' },
  { id: generateId('pr'), reqNumber: 'PR-10050', title: 'Safety Equipment', requestor: 'Tom Harris', department: 'Production', requestDate: '2025-08-02', neededDate: '2025-08-12', currency: 'USD', value: 4500, items: 20, status: 'Pending Approval', priority: 'High' },
  { id: generateId('pr'), reqNumber: 'PR-10051', title: 'Software Licenses', requestor: 'Lisa Wong', department: 'IT', requestDate: '2025-07-20', neededDate: '2025-07-30', currency: 'USD', value: 15000, items: 10, status: 'Approved', priority: 'Urgent' },
  { id: generateId('pr'), reqNumber: 'PR-10052', title: 'Office Furniture', requestor: 'Mike Brown', department: 'Admin', requestDate: '2025-07-18', neededDate: '2025-08-01', currency: 'USD', value: 8500, items: 5, status: 'Approved', priority: 'Low' },
  { id: generateId('pr'), reqNumber: 'PR-10053', title: 'Raw Materials', requestor: 'Amy Lee', department: 'Production', requestDate: '2025-08-03', neededDate: '2025-08-18', currency: 'USD', value: 25000, items: 30, status: 'Pending Approval', priority: 'High' },
  { id: generateId('pr'), reqNumber: 'PR-10054', title: 'Conference Services', requestor: 'David Chen', department: 'Sales', requestDate: '2025-07-15', neededDate: '2025-07-25', currency: 'USD', value: 12000, items: 2, status: 'Approved', priority: 'Medium' },
  { id: generateId('pr'), reqNumber: 'PR-10055', title: 'Lab Equipment', requestor: 'Sarah Johnson', department: 'R&D', requestDate: '2025-08-04', neededDate: '2025-08-20', currency: 'USD', value: 35000, items: 8, status: 'Draft', priority: 'High' },
  { id: generateId('pr'), reqNumber: 'PR-10056', title: 'Cleaning Services', requestor: 'James Wilson', department: 'Operations', requestDate: '2025-07-12', neededDate: '2025-07-20', currency: 'USD', value: 2800, items: 1, status: 'Approved', priority: 'Low' },
  { id: generateId('pr'), reqNumber: 'PR-10057', title: 'Legal Consultation', requestor: 'Karen Martinez', department: 'Legal', requestDate: '2025-08-05', neededDate: '2025-08-25', currency: 'USD', value: 18000, items: 1, status: 'Pending Approval', priority: 'High' },
  { id: generateId('pr'), reqNumber: 'PR-10058', title: 'Maintenance Parts', requestor: 'Chris Taylor', department: 'Operations', requestDate: '2025-07-10', neededDate: '2025-07-18', currency: 'USD', value: 5600, items: 15, status: 'Approved', priority: 'Urgent' },
  { id: generateId('pr'), reqNumber: 'PR-10059', title: 'Promotional Items', requestor: 'Patricia Davis', department: 'Marketing', requestDate: '2025-08-06', currency: 'USD', value: 4200, items: 25, status: 'Draft', priority: 'Low' },
  { id: generateId('pr'), reqNumber: 'PR-10060', title: 'Cloud Storage', requestor: 'Mark Miller', department: 'IT', requestDate: '2025-07-08', neededDate: '2025-07-15', currency: 'USD', value: 3600, items: 1, status: 'Approved', priority: 'Medium' },
  { id: generateId('pr'), reqNumber: 'PR-10061', title: 'Packaging Materials', requestor: 'Nancy White', department: 'Production', requestDate: '2025-08-07', neededDate: '2025-08-17', currency: 'USD', value: 7800, items: 40, status: 'Pending Approval', priority: 'Medium' },
  { id: generateId('pr'), reqNumber: 'PR-10062', title: 'Travel Expenses', requestor: 'Paul Anderson', department: 'Sales', requestDate: '2025-07-05', neededDate: '2025-07-10', currency: 'USD', value: 4500, items: 1, status: 'Approved', priority: 'Medium' },
  { id: generateId('pr'), reqNumber: 'PR-10063', title: 'Security Systems', requestor: 'Laura Thomas', department: 'Operations', requestDate: '2025-08-08', neededDate: '2025-08-22', currency: 'USD', value: 22000, items: 6, status: 'Draft', priority: 'High' },
  { id: generateId('pr'), reqNumber: 'PR-10064', title: 'Office Electronics', requestor: 'Steven Jackson', department: 'Admin', requestDate: '2025-07-03', neededDate: '2025-07-12', currency: 'USD', value: 6700, items: 12, status: 'Approved', priority: 'Medium' },
  { id: generateId('pr'), reqNumber: 'PR-10065', title: 'Chemical Supplies', requestor: 'Barbara Moore', department: 'R&D', requestDate: '2025-08-09', neededDate: '2025-08-24', currency: 'USD', value: 14500, items: 20, status: 'Pending Approval', priority: 'High' },
  { id: generateId('pr'), reqNumber: 'PR-10066', title: 'Catering Services', requestor: 'Richard Martin', department: 'HR', requestDate: '2025-07-01', neededDate: '2025-07-08', currency: 'USD', value: 2100, items: 1, status: 'Approved', priority: 'Low' },
  { id: generateId('pr'), reqNumber: 'PR-10067', title: 'Network Equipment', requestor: 'Betty Thompson', department: 'IT', requestDate: '2025-08-10', neededDate: '2025-08-25', currency: 'USD', value: 45000, items: 15, status: 'Draft', priority: 'Urgent' },
  { id: generateId('pr'), reqNumber: 'PR-10068', title: 'Printing Services', requestor: 'George Harris', department: 'Marketing', requestDate: '2025-06-28', neededDate: '2025-07-05', currency: 'USD', value: 1800, items: 3, status: 'Approved', priority: 'Low' },
  { id: generateId('pr'), reqNumber: 'PR-10069', title: 'Warehouse Tools', requestor: 'Helen Clark', department: 'Operations', requestDate: '2025-08-11', currency: 'USD', value: 9200, items: 35, status: 'Pending Approval', priority: 'Medium' },
  { id: generateId('pr'), reqNumber: 'PR-10070', title: 'Medical Supplies', requestor: 'Edward Lewis', department: 'HR', requestDate: '2025-06-25', neededDate: '2025-07-02', currency: 'USD', value: 5600, items: 18, status: 'Approved', priority: 'High' },
  { id: generateId('pr'), reqNumber: 'PR-10071', title: 'Analytics Software', requestor: 'Dorothy Walker', department: 'Sales', requestDate: '2025-08-12', currency: 'USD', value: 28000, items: 1, status: 'Draft', priority: 'High' },
  { id: generateId('pr'), reqNumber: 'PR-10072', title: 'Vehicle Parts', requestor: 'Kenneth Hall', department: 'Operations', requestDate: '2025-06-22', neededDate: '2025-07-01', currency: 'USD', value: 11200, items: 25, status: 'Approved', priority: 'Urgent' },
  { id: generateId('pr'), reqNumber: 'PR-10073', title: 'Training Materials', requestor: 'Carol Allen', department: 'HR', requestDate: '2025-08-13', currency: 'USD', value: 3400, items: 10, status: 'Pending Approval', priority: 'Low' },
  { id: generateId('pr'), reqNumber: 'PR-10074', title: 'Research Samples', requestor: 'Ronald Young', department: 'R&D', requestDate: '2025-08-14', neededDate: '2025-08-28', currency: 'USD', value: 18500, items: 50, status: 'Draft', priority: 'High' },
];

const Requisitions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<Requisition[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Requisition | null>(null);
  const [viewing, setViewing] = useState<Requisition | null>(null);

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => [
    { key: 'reqNumber', header: 'PR Number', sortable: true, searchable: true },
    { key: 'title', header: 'Title', sortable: true, searchable: true },
    { key: 'requestor', header: 'Requestor', sortable: true, searchable: true },
    { key: 'department', header: 'Department', sortable: true, filterable: true, filterOptions: departments.map(d => ({ label: d, value: d })) },
    { key: 'requestDate', header: 'Request Date', sortable: true },
    { key: 'value', header: 'Value', sortable: true },
    { key: 'status', header: 'Status', sortable: true, filterable: true, filterOptions: ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Converted to PO'].map(s => ({ label: s, value: s })) },
    { key: 'priority', header: 'Priority', sortable: true },
  ], []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: Requisition) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: Requisition) => { setEditing(row); setOpen(true); } },
    { label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, condition: (row: Requisition) => row.status === 'Pending Approval', onClick: (row: Requisition) => { 
      const updated = { ...row, status: 'Approved' as const }; 
      setData(data.map(d => d.id === row.id ? updated : d)); 
      toast({ title: 'Approved', description: `PR ${row.reqNumber} approved` }); 
    } },
    { label: 'Reject', icon: <AlertCircle className="h-4 w-4" />, condition: (row: Requisition) => row.status === 'Pending Approval', onClick: (row: Requisition) => { 
      const updated = { ...row, status: 'Rejected' as const }; 
      setData(data.map(d => d.id === row.id ? updated : d)); 
      toast({ title: 'Rejected', description: `PR ${row.reqNumber} rejected` }); 
    } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: Requisition) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: `PR ${row.reqNumber} removed` }); }, variant: 'destructive' }
  ];

  const form = useForm<Requisition>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: { id: '', reqNumber: '', title: '', requestor: '', department: '', requestDate: new Date().toISOString().slice(0, 10), currency: 'USD', value: 0, items: 1, status: 'Draft', priority: 'Medium', notes: '' }
  });

  const openCreate = () => { setEditing(null); form.reset({ id: generateId('pr'), reqNumber: '', title: '', requestor: '', department: '', requestDate: new Date().toISOString().slice(0, 10), currency: 'USD', value: 0, items: 1, status: 'Draft', priority: 'Medium', notes: '' }); setOpen(true); };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: Requisition) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'Requisition Updated' : 'Requisition Created', description: values.reqNumber });
  };

  const totalValue = data.reduce((sum, r) => sum + r.value, 0);
  const pendingCount = data.filter(r => r.status === 'Pending Approval').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Purchase Requisitions"
          description="Create and manage requisition requests for goods and services"
          voiceIntroduction="Welcome to Purchase Requisitions. Here you can create and manage requisition requests."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center"><FileText className="h-8 w-8 text-blue-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.length}</h3><p className="text-sm text-gray-600">Total Requisitions</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Clock className="h-8 w-8 text-orange-600 mr-3"/><div><h3 className="text-2xl font-bold">{pendingCount}</h3><p className="text-sm text-gray-600">Pending Approval</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><CheckCircle className="h-8 w-8 text-green-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.filter(r => r.status === 'Approved').length}</h3><p className="text-sm text-gray-600">Approved</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><FileText className="h-8 w-8 text-purple-600 mr-3"/><div><h3 className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</h3><p className="text-sm text-gray-600">Total Value</p></div></div></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center"><FileText className="h-5 w-5 mr-2" /> Purchase Requisitions ({data.length})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Create Requisition</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Requisition' : 'Create Requisition'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="reqNumber" render={({ field }) => (
                    <FormItem><FormLabel>PR Number</FormLabel><FormControl><Input placeholder="PR-xxx" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Title" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="requestor" render={({ field }) => (
                    <FormItem><FormLabel>Requestor</FormLabel><FormControl><Input placeholder="Requestor name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem><FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                        <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="requestDate" render={({ field }) => (
                    <FormItem><FormLabel>Request Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="neededDate" render={({ field }) => (
                    <FormItem><FormLabel>Needed Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="currency" render={({ field }) => (
                    <FormItem><FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger></FormControl>
                        <SelectContent>{currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="value" render={({ field }) => (
                    <FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="items" render={({ field }) => (
                    <FormItem><FormLabel>Items</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem><FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                        <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>{['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Converted to PO'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <DialogFooter className="col-span-full mt-2">
                    <Button type="submit">{editing ? 'Save Changes' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <EnhancedDataTable columns={columns} data={data as any} actions={actions as any} searchPlaceholder="Search requisitions..." refreshable={true} onRefresh={refresh} exportable={true} />
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Requisition Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-500">PR Number</label><p className="text-lg font-semibold">{viewing.reqNumber}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Status</label><p><Badge variant={viewing.status === 'Approved' ? 'default' : viewing.status === 'Rejected' ? 'destructive' : viewing.status === 'Pending Approval' ? 'secondary' : 'outline'}>{viewing.status}</Badge></p></div>
              <div><label className="text-sm font-medium text-gray-500">Title</label><p>{viewing.title}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Priority</label><p><Badge variant={viewing.priority === 'Urgent' ? 'destructive' : viewing.priority === 'High' ? 'secondary' : 'outline'}>{viewing.priority}</Badge></p></div>
              <div><label className="text-sm font-medium text-gray-500">Requestor</label><p>{viewing.requestor}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Department</label><p>{viewing.department}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Request Date</label><p>{viewing.requestDate}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Needed Date</label><p>{viewing.neededDate || 'TBD'}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Items</label><p>{viewing.items}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Value</label><p className="font-bold text-green-600">{viewing.currency} {viewing.value.toLocaleString()}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requisitions;
