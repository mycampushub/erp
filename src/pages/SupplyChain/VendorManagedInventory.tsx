
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Users, Package, TrendingUp, Shield, Plus, Edit, Trash2, Eye } from 'lucide-react';
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

const vmiSchema = z.object({
  id: z.string().min(1),
  supplier: z.string().min(1, 'Supplier is required'),
  material: z.string().min(1, 'Material is required'),
  minLevel: z.coerce.number().int().min(0, 'Min level required'),
  maxLevel: z.coerce.number().int().min(1, 'Max level required'),
  currentLevel: z.coerce.number().int().min(0, 'Current level required'),
  lastReplenishment: z.string().min(1, 'Last replenishment date required'),
  nextReplenishment: z.string().min(1, 'Next replenishment date required'),
  status: z.enum(['Active', 'Pending', 'Suspended', 'Review']),
  notes: z.string().optional(),
});

type VmiData = z.infer<typeof vmiSchema>;

const suppliers = ['Steel Corp Inc.', 'Copper Solutions', 'Aluminum Distributors', 'Plastics International', 'Rubber Masters', 'Chemical Supplies Co.', 'Electronic Components Ltd.', 'Fastener World'];
const materials = ['Steel Pipes', 'Copper Wire', 'Aluminum Sheets', 'Plastic Resin', 'Rubber Gaskets', 'Industrial Chemicals', 'Electronic Sensors', 'Stainless Fasteners'];
const statuses = ['Active', 'Pending', 'Suspended', 'Review'] as const;

const generateDate = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
};

const seedData: VmiData[] = [
  { id: generateId('vmi'), supplier: 'Steel Corp Inc.', material: 'Steel Pipes', minLevel: 500, maxLevel: 2500, currentLevel: 2200, lastReplenishment: '2025-05-18', nextReplenishment: '2025-05-25', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Copper Solutions', material: 'Copper Wire', minLevel: 100, maxLevel: 500, currentLevel: 120, lastReplenishment: '2025-05-19', nextReplenishment: '2025-05-26', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Aluminum Distributors', material: 'Aluminum Sheets', minLevel: 200, maxLevel: 800, currentLevel: 650, lastReplenishment: '2025-05-20', nextReplenishment: '2025-05-27', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Plastics International', material: 'Plastic Resin', minLevel: 300, maxLevel: 1500, currentLevel: 1400, lastReplenishment: '2025-05-17', nextReplenishment: '2025-05-24', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Rubber Masters', material: 'Rubber Gaskets', minLevel: 150, maxLevel: 600, currentLevel: 180, lastReplenishment: '2025-05-21', nextReplenishment: '2025-05-28', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Chemical Supplies Co.', material: 'Industrial Chemicals', minLevel: 80, maxLevel: 400, currentLevel: 350, lastReplenishment: '2025-05-16', nextReplenishment: '2025-05-23', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Electronic Components Ltd.', material: 'Electronic Sensors', minLevel: 50, maxLevel: 250, currentLevel: 220, lastReplenishment: '2025-05-22', nextReplenishment: '2025-05-29', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Fastener World', material: 'Stainless Fasteners', minLevel: 500, maxLevel: 3000, currentLevel: 2800, lastReplenishment: '2025-05-15', nextReplenishment: '2025-05-22', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Steel Corp Inc.', material: 'Steel Pipes', minLevel: 400, maxLevel: 2000, currentLevel: 1800, lastReplenishment: '2025-05-23', nextReplenishment: '2025-05-30', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Copper Solutions', material: 'Copper Wire', minLevel: 80, maxLevel: 400, currentLevel: 95, lastReplenishment: '2025-05-24', nextReplenishment: '2025-05-31', status: 'Pending' },
  { id: generateId('vmi'), supplier: 'Aluminum Distributors', material: 'Aluminum Sheets', minLevel: 180, maxLevel: 750, currentLevel: 200, lastReplenishment: '2025-05-25', nextReplenishment: '2025-06-01', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Plastics International', material: 'Plastic Resin', minLevel: 250, maxLevel: 1200, currentLevel: 1100, lastReplenishment: '2025-05-26', nextReplenishment: '2025-06-02', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Rubber Masters', material: 'Rubber Gaskets', minLevel: 120, maxLevel: 550, currentLevel: 160, lastReplenishment: '2025-05-27', nextReplenishment: '2025-06-03', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Chemical Supplies Co.', material: 'Industrial Chemicals', minLevel: 60, maxLevel: 350, currentLevel: 320, lastReplenishment: '2025-05-28', nextReplenishment: '2025-06-04', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Electronic Components Ltd.', material: 'Electronic Sensors', minLevel: 40, maxLevel: 200, currentLevel: 180, lastReplenishment: '2025-05-29', nextReplenishment: '2025-06-05', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Fastener World', material: 'Stainless Fasteners', minLevel: 450, maxLevel: 2800, currentLevel: 2600, lastReplenishment: '2025-05-30', nextReplenishment: '2025-06-06', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Steel Corp Inc.', material: 'Steel Pipes', minLevel: 450, maxLevel: 2200, currentLevel: 2000, lastReplenishment: '2025-05-31', nextReplenishment: '2025-06-07', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Copper Solutions', material: 'Copper Wire', minLevel: 90, maxLevel: 450, currentLevel: 85, lastReplenishment: '2025-06-01', nextReplenishment: '2025-06-08', status: 'Review' },
  { id: generateId('vmi'), supplier: 'Aluminum Distributors', material: 'Aluminum Sheets', minLevel: 160, maxLevel: 700, currentLevel: 620, lastReplenishment: '2025-06-02', nextReplenishment: '2025-06-09', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Plastics International', material: 'Plastic Resin', minLevel: 280, maxLevel: 1300, currentLevel: 1200, lastReplenishment: '2025-06-03', nextReplenishment: '2025-06-10', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Rubber Masters', material: 'Rubber Gaskets', minLevel: 130, maxLevel: 580, currentLevel: 540, lastReplenishment: '2025-06-04', nextReplenishment: '2025-06-11', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Chemical Supplies Co.', material: 'Industrial Chemicals', minLevel: 70, maxLevel: 380, currentLevel: 100, lastReplenishment: '2025-06-05', nextReplenishment: '2025-06-12', status: 'Suspended' },
  { id: generateId('vmi'), supplier: 'Electronic Components Ltd.', material: 'Electronic Sensors', minLevel: 45, maxLevel: 220, currentLevel: 200, lastReplenishment: '2025-06-06', nextReplenishment: '2025-06-13', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Fastener World', material: 'Stainless Fasteners', minLevel: 480, maxLevel: 2900, currentLevel: 2700, lastReplenishment: '2025-06-07', nextReplenishment: '2025-06-14', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Steel Corp Inc.', material: 'Steel Pipes', minLevel: 420, maxLevel: 2100, currentLevel: 1900, lastReplenishment: '2025-06-08', nextReplenishment: '2025-06-15', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Copper Solutions', material: 'Copper Wire', minLevel: 85, maxLevel: 420, currentLevel: 380, lastReplenishment: '2025-06-09', nextReplenishment: '2025-06-16', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Aluminum Distributors', material: 'Aluminum Sheets', minLevel: 170, maxLevel: 720, currentLevel: 660, lastReplenishment: '2025-06-10', nextReplenishment: '2025-06-17', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Plastics International', material: 'Plastic Resin', minLevel: 260, maxLevel: 1250, currentLevel: 1150, lastReplenishment: '2025-06-11', nextReplenishment: '2025-06-18', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Rubber Masters', material: 'Rubber Gaskets', minLevel: 125, maxLevel: 560, currentLevel: 520, lastReplenishment: '2025-06-12', nextReplenishment: '2025-06-19', status: 'Active' },
  { id: generateId('vmi'), supplier: 'Electronic Components Ltd.', material: 'Electronic Sensors', minLevel: 42, maxLevel: 210, currentLevel: 190, lastReplenishment: '2025-06-13', nextReplenishment: '2025-06-20', status: 'Active' },
];

const VendorManagedInventory: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<VmiData[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<VmiData | null>(null);
  const [viewing, setViewing] = useState<VmiData | null>(null);

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => [
    { key: 'supplier', header: 'Supplier', sortable: true, searchable: true },
    { key: 'material', header: 'Material', sortable: true, searchable: true },
    { key: 'minLevel', header: 'Min Level', sortable: true },
    { key: 'maxLevel', header: 'Max Level', sortable: true },
    { key: 'currentLevel', header: 'Current Level', sortable: true },
    { key: 'nextReplenishment', header: 'Next Replenishment', sortable: true },
    { key: 'status', header: 'Status', sortable: true, filterable: true, filterOptions: statuses.map(s => ({ label: s, value: s })) },
  ], []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: VmiData) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: VmiData) => { setEditing(row); setOpen(true); } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: VmiData) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: `VMI program for ${row.supplier} - ${row.material} removed` }); }, variant: 'destructive' }
  ];

  const form = useForm<VmiData>({
    resolver: zodResolver(vmiSchema),
    defaultValues: { id: '', supplier: '', material: '', minLevel: 100, maxLevel: 500, currentLevel: 250, lastReplenishment: generateDate(-7), nextReplenishment: generateDate(7), status: 'Active', notes: '' }
  });

  const openCreate = () => { setEditing(null); form.reset({ id: generateId('vmi'), supplier: '', material: '', minLevel: 100, maxLevel: 500, currentLevel: 250, lastReplenishment: generateDate(-7), nextReplenishment: generateDate(7), status: 'Active', notes: '' }); setOpen(true); };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: VmiData) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'VMI Program Updated' : 'VMI Program Created', description: `${values.supplier} - ${values.material}` });
  };

  const activeCount = data.filter(v => v.status === 'Active').length;
  const pendingCount = data.filter(v => v.status === 'Pending').length;
  const lowStockCount = data.filter(v => v.currentLevel <= v.minLevel).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Vendor Managed Inventory" description="Monitor VMI programs, supplier performance, and inventory optimization" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center"><Users className="h-8 w-8 text-blue-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.length}</h3><p className="text-sm text-gray-600">VMI Materials</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Package className="h-8 w-8 text-green-600 mr-3"/><div><h3 className="text-2xl font-bold">{activeCount}</h3><p className="text-sm text-gray-600">Active Programs</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><TrendingUp className="h-8 w-8 text-orange-600 mr-3"/><div><h3 className="text-2xl font-bold">{lowStockCount}</h3><p className="text-sm text-gray-600">Low Stock</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Shield className="h-8 w-8 text-purple-600 mr-3"/><div><h3 className="text-2xl font-bold">{pendingCount}</h3><p className="text-sm text-gray-600">Pending</p></div></div></Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">VMI Programs</h2>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add VMI Program</Button>
        </div>
        <EnhancedDataTable columns={columns} data={data as any} actions={actions} searchPlaceholder="Search VMI programs..." />
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit VMI Program' : 'Add New VMI Program'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="supplier" render={({ field }) => (<FormItem><FormLabel>Supplier</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="material" render={({ field }) => (<FormItem><FormLabel>Material</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger><SelectContent>{materials.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="minLevel" render={({ field }) => (<FormItem><FormLabel>Min Level</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="maxLevel" render={({ field }) => (<FormItem><FormLabel>Max Level</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="currentLevel" render={({ field }) => (<FormItem><FormLabel>Current</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="lastReplenishment" render={({ field }) => (<FormItem><FormLabel>Last Replenishment</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="nextReplenishment" render={({ field }) => (<FormItem><FormLabel>Next Replenishment</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={(v) => field.onChange(v as VmiData['status'])} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <DialogFooter><Button type="submit">{editing ? 'Update' : 'Create'}</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>VMI Program Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Supplier:</span><span>{viewing.supplier}</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Material:</span><span>{viewing.material}</span></div>
              <div className="grid grid-cols-3 gap-2 text-sm"><span className="font-medium">Min Level:</span><span>{viewing.minLevel}</span></div>
              <div className="grid grid-cols-3 gap-2 text-sm"><span className="font-medium">Max Level:</span><span>{viewing.maxLevel}</span></div>
              <div className="grid grid-cols-3 gap-2 text-sm"><span className="font-medium">Current Level:</span><span>{viewing.currentLevel}</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Last Replenishment:</span><span>{viewing.lastReplenishment}</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Next Replenishment:</span><span>{viewing.nextReplenishment}</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Status:</span><Badge variant={viewing.status === 'Active' ? 'default' : viewing.status === 'Pending' ? 'secondary' : viewing.status === 'Suspended' ? 'destructive' : 'outline'}>{viewing.status}</Badge></div>
              {viewing.notes && <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Notes:</span><span>{viewing.notes}</span></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagedInventory;
