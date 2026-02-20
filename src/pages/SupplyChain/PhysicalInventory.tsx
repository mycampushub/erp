
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, ClipboardList, Plus, CheckCircle, AlertTriangle, Eye, Edit, Trash2, Package } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { useToast } from '../../hooks/use-toast';
import { generateId } from '../../lib/localCrud';

const countSchema = z.object({
  id: z.string().min(1),
  material: z.string().min(1, 'Material is required'),
  location: z.string().min(1, 'Location is required'),
  systemQty: z.coerce.number().int().min(0, 'System qty required'),
  countedQty: z.coerce.number().int().min(0, 'Counted qty required'),
  status: z.enum(['Pending', 'Counted', 'Approved', 'Variance']),
  counter: z.string().min(1, 'Counter is required'),
  countDate: z.string().min(1, 'Count date is required'),
  notes: z.string().optional(),
});

type InventoryCount = z.infer<typeof countSchema>;

const materials = ['Steel Pipes', 'Copper Wire', 'Aluminum Sheets', 'Fasteners', 'Gaskets', 'Bearings', 'Motors', 'Sensors', 'Cables', 'Connectors', 'Bolts', 'Nuts', 'Washers', 'O-Rings', 'Springs'];
const locations = ['A-01-001', 'A-01-002', 'A-02-001', 'B-01-001', 'B-01-002', 'B-02-001', 'C-01-001', 'C-01-002', 'C-02-001', 'D-01-001', 'D-01-002'];

const seedData: InventoryCount[] = [
  { id: generateId('cc'), material: 'Steel Pipes', location: 'A-01-001', systemQty: 2500, countedQty: 2485, status: 'Counted', counter: 'John Smith', countDate: '2025-08-10' },
  { id: generateId('cc'), material: 'Copper Wire', location: 'B-01-001', systemQty: 150, countedQty: 155, status: 'Variance', counter: 'Maria Garcia', countDate: '2025-08-10' },
  { id: generateId('cc'), material: 'Aluminum Sheets', location: 'C-01-001', systemQty: 800, countedQty: 800, status: 'Counted', counter: 'Robert Johnson', countDate: '2025-08-09' },
  { id: generateId('cc'), material: 'Fasteners', location: 'A-02-001', systemQty: 5000, countedQty: 4985, status: 'Variance', counter: 'Lisa Wong', countDate: '2025-08-09' },
  { id: generateId('cc'), material: 'Gaskets', location: 'B-02-001', systemQty: 1200, countedQty: 1200, status: 'Approved', counter: 'Tom Harris', countDate: '2025-08-08' },
  { id: generateId('cc'), material: 'Bearings', location: 'C-02-001', systemQty: 350, countedQty: 0, status: 'Pending', counter: 'Amy Lee', countDate: '2025-08-11' },
  { id: generateId('cc'), material: 'Motors', location: 'D-01-001', systemQty: 45, countedQty: 45, status: 'Approved', counter: 'Mike Brown', countDate: '2025-08-07' },
  { id: generateId('cc'), material: 'Sensors', location: 'A-01-002', systemQty: 220, countedQty: 218, status: 'Variance', counter: 'Emma van Berg', countDate: '2025-08-10' },
  { id: generateId('cc'), material: 'Cables', location: 'B-01-002', systemQty: 1500, countedQty: 0, status: 'Pending', counter: 'David Chen', countDate: '2025-08-11' },
  { id: generateId('cc'), material: 'Connectors', location: 'C-01-002', systemQty: 2800, countedQty: 2800, status: 'Counted', counter: 'Sarah Johnson', countDate: '2025-08-09' },
  { id: generateId('cc'), material: 'Bolts', location: 'D-01-002', systemQty: 10000, countedQty: 0, status: 'Pending', counter: 'James Wilson', countDate: '2025-08-11' },
  { id: generateId('cc'), material: 'Nuts', location: 'A-02-002', systemQty: 8000, countedQty: 8020, status: 'Variance', counter: 'Karen Martinez', countDate: '2025-08-08' },
  { id: generateId('cc'), material: 'Washers', location: 'B-02-002', systemQty: 6000, countedQty: 6000, status: 'Approved', counter: 'Chris Taylor', countDate: '2025-08-07' },
  { id: generateId('cc'), material: 'O-Rings', location: 'C-02-002', systemQty: 4500, countedQty: 0, status: 'Pending', counter: 'Patricia Davis', countDate: '2025-08-11' },
  { id: generateId('cc'), material: 'Springs', location: 'D-02-001', systemQty: 1800, countedQty: 1795, status: 'Variance', counter: 'Mark Miller', countDate: '2025-08-09' },
  { id: generateId('cc'), material: 'Steel Pipes', location: 'A-01-002', systemQty: 1800, countedQty: 1800, status: 'Approved', counter: 'Nancy White', countDate: '2025-08-06' },
  { id: generateId('cc'), material: 'Copper Wire', location: 'B-01-002', systemQty: 200, countedQty: 200, status: 'Approved', counter: 'Paul Anderson', countDate: '2025-08-05' },
  { id: generateId('cc'), material: 'Aluminum Sheets', location: 'C-01-002', systemQty: 600, countedQty: 0, status: 'Pending', counter: 'Laura Thomas', countDate: '2025-08-11' },
  { id: generateId('cc'), material: 'Fasteners', location: 'A-02-002', systemQty: 3000, countedQty: 3005, status: 'Variance', counter: 'Steven Jackson', countDate: '2025-08-08' },
  { id: generateId('cc'), material: 'Gaskets', location: 'B-02-002', systemQty: 900, countedQty: 900, status: 'Approved', counter: 'Barbara Moore', countDate: '2025-08-04' },
  { id: generateId('cc'), material: 'Bearings', location: 'C-02-002', systemQty: 280, countedQty: 0, status: 'Pending', counter: 'Richard Martin', countDate: '2025-08-11' },
  { id: generateId('cc'), material: 'Motors', location: 'D-02-002', systemQty: 38, countedQty: 38, status: 'Approved', counter: 'Betty Thompson', countDate: '2025-08-03' },
  { id: generateId('cc'), material: 'Sensors', location: 'A-01-003', systemQty: 175, countedQty: 175, status: 'Approved', counter: 'George Harris', countDate: '2025-08-02' },
  { id: generateId('cc'), material: 'Cables', location: 'B-01-003', systemQty: 1200, countedQty: 0, status: 'Pending', counter: 'Helen Clark', countDate: '2025-08-11' },
  { id: generateId('cc'), material: 'Connectors', location: 'C-01-003', systemQty: 2200, countedQty: 2195, status: 'Variance', counter: 'Edward Lewis', countDate: '2025-08-07' },
  { id: generateId('cc'), material: 'Bolts', location: 'D-01-003', systemQty: 8500, countedQty: 8500, status: 'Approved', counter: 'Dorothy Walker', countDate: '2025-08-01' },
  { id: generateId('cc'), material: 'Nuts', location: 'A-02-003', systemQty: 7200, countedQty: 0, status: 'Pending', counter: 'Kenneth Hall', countDate: '2025-08-11' },
  { id: generateId('cc'), material: 'Washers', location: 'B-02-003', systemQty: 5500, countedQty: 5500, status: 'Approved', counter: 'Carol Allen', countDate: '2025-07-31' },
  { id: generateId('cc'), material: 'O-Rings', location: 'C-02-003', systemQty: 3800, countedQty: 3810, status: 'Variance', counter: 'Ronald Young', countDate: '2025-08-05' },
  { id: generateId('cc'), material: 'Springs', location: 'D-02-003', systemQty: 1600, countedQty: 1600, status: 'Approved', counter: 'Sandra King', countDate: '2025-07-30' },
];

const PhysicalInventory: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<InventoryCount[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryCount | null>(null);
  const [viewing, setViewing] = useState<InventoryCount | null>(null);
  const [activeTab, setActiveTab] = useState('counts');

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => [
    { key: 'material', header: 'Material', sortable: true, searchable: true },
    { key: 'location', header: 'Location', sortable: true, searchable: true },
    { key: 'systemQty', header: 'System Qty', sortable: true },
    { key: 'countedQty', header: 'Counted Qty', sortable: true },
    { key: 'countDate', header: 'Count Date', sortable: true },
    { key: 'counter', header: 'Counter', sortable: true },
    { key: 'status', header: 'Status', sortable: true, filterable: true, filterOptions: ['Pending', 'Counted', 'Approved', 'Variance'].map(s => ({ label: s, value: s })) },
  ], []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: InventoryCount) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: InventoryCount) => { setEditing(row); setOpen(true); } },
    { label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, condition: (row: InventoryCount) => row.status === 'Counted', onClick: (row: InventoryCount) => { const updated = { ...row, status: 'Approved' as const }; setData(data.map(d => d.id === row.id ? updated : d)); toast({ title: 'Approved', description: `Count ${row.id} approved` }); } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: InventoryCount) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: `Count ${row.id} removed` }); }, variant: 'destructive' }
  ];

  const form = useForm<InventoryCount>({
    resolver: zodResolver(countSchema),
    defaultValues: { id: '', material: '', location: '', systemQty: 0, countedQty: 0, status: 'Pending', counter: '', countDate: new Date().toISOString().slice(0, 10), notes: '' }
  });

  const openCreate = () => { setEditing(null); form.reset({ id: generateId('cc'), material: '', location: '', systemQty: 0, countedQty: 0, status: 'Pending', counter: '', countDate: new Date().toISOString().slice(0, 10), notes: '' }); setOpen(true); };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: InventoryCount) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'Count Updated' : 'Count Created', description: `Count for ${values.material}` });
  };

  const pendingCount = data.filter(c => c.status === 'Pending').length;
  const countedCount = data.filter(c => c.status === 'Counted').length;
  const varianceCount = data.filter(c => c.status === 'Variance').length;
  const approvedCount = data.filter(c => c.status === 'Approved').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Physical Inventory"
          description="Manage cycle counts, physical inventories, and stock reconciliation"
          voiceIntroduction="Welcome to Physical Inventory. Manage inventory counting and reconciliation."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center"><ClipboardList className="h-8 w-8 text-blue-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.length}</h3><p className="text-sm text-gray-600">Total Items</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><AlertTriangle className="h-8 w-8 text-orange-600 mr-3"/><div><h3 className="text-2xl font-bold">{pendingCount}</h3><p className="text-sm text-gray-600">Pending</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><ClipboardList className="h-8 w-8 text-yellow-600 mr-3"/><div><h3 className="text-2xl font-bold">{varianceCount}</h3><p className="text-sm text-gray-600">Variances</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><CheckCircle className="h-8 w-8 text-green-600 mr-3"/><div><h3 className="text-2xl font-bold">{approvedCount}</h3><p className="text-sm text-gray-600">Approved</p></div></div></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center"><ClipboardList className="h-5 w-5 mr-2" /> Inventory Counts ({data.length})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Count</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit Count' : 'Create Count'}</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="material" render={({ field }) => (
                    <FormItem><FormLabel>Material</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>< SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger></FormControl>
                        <SelectContent>{materials.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>< SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger></FormControl>
                        <SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="systemQty" render={({ field }) => (
                    <FormItem><FormLabel>System Qty</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="countedQty" render={({ field }) => (
                    <FormItem><FormLabel>Counted Qty</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="counter" render={({ field }) => (
                    <FormItem><FormLabel>Counter</FormLabel><FormControl><Input placeholder="Counter name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="countDate" render={({ field }) => (
                    <FormItem><FormLabel>Count Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>< SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>{['Pending', 'Counted', 'Approved', 'Variance'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
          <EnhancedDataTable columns={columns} data={data as any} actions={actions as any} searchPlaceholder="Search counts..." refreshable={true} onRefresh={refresh} exportable={true} />
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Count Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-500">Material</label><p className="font-semibold flex items-center"><Package className="h-4 w-4 mr-2" />{viewing.material}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Status</label><p><Badge variant={viewing.status === 'Approved' ? 'default' : viewing.status === 'Variance' ? 'destructive' : viewing.status === 'Counted' ? 'secondary' : 'outline'}>{viewing.status}</Badge></p></div>
              <div><label className="text-sm font-medium text-gray-500">Location</label><p>{viewing.location}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Counter</label><p>{viewing.counter}</p></div>
              <div><label className="text-sm font-medium text-gray-500">System Qty</label><p>{viewing.systemQty}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Counted Qty</label><p>{viewing.countedQty || 'Pending'}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Count Date</label><p>{viewing.countDate}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Variance</label><p className={viewing.systemQty - viewing.countedQty !== 0 ? 'text-red-600 font-bold' : ''}>{viewing.countedQty - viewing.systemQty}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhysicalInventory;
