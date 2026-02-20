
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Truck, Plus, Edit, Trash2, Eye, Package } from 'lucide-react';
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

const supplySchema = z.object({
  id: z.string().min(1),
  material: z.string().min(1, 'Material is required'),
  currentStock: z.coerce.number().int().min(0, 'Current stock required'),
  requirement: z.coerce.number().int().min(0, 'Requirement required'),
  supplier: z.string().min(1, 'Supplier is required'),
  leadTime: z.coerce.number().int().min(1, 'Lead time required'),
  orderDate: z.string().min(1, 'Order date is required'),
  status: z.enum(['Planned', 'Urgent', 'Ordered', 'Delivered']),
  notes: z.string().optional(),
});

type Supply = z.infer<typeof supplySchema>;

const materials = ['Steel Pipes', 'Copper Wire', 'Aluminum Sheets', 'Fasteners', 'Gaskets', 'Bearings', 'Motors', 'Sensors', 'Cables', 'Connectors'];
const suppliers = ['Tech Components Inc.', 'Industrial Parts Co.', 'Global Steel Works', 'Pacific Packaging Ltd.', 'ChemSupply GmbH', 'Precision Tools Asia', 'AutoParts Direct'];

const seedData: Supply[] = [
  { id: generateId('sp'), material: 'Steel Pipes', currentStock: 2500, requirement: 3200, supplier: 'Global Steel Works', leadTime: 14, orderDate: '2025-08-15', status: 'Planned' },
  { id: generateId('sp'), material: 'Copper Wire', currentStock: 150, requirement: 300, supplier: 'Precision Tools Asia', leadTime: 10, orderDate: '2025-08-18', status: 'Urgent' },
  { id: generateId('sp'), material: 'Aluminum Sheets', currentStock: 800, requirement: 1000, supplier: 'Global Steel Works', leadTime: 12, orderDate: '2025-08-16', status: 'Planned' },
  { id: generateId('sp'), material: 'Fasteners', currentStock: 5000, requirement: 5500, supplier: 'Industrial Parts Co.', leadTime: 7, orderDate: '2025-08-14', status: 'Ordered' },
  { id: generateId('sp'), material: 'Gaskets', currentStock: 1200, requirement: 1500, supplier: 'Pacific Packaging Ltd.', leadTime: 8, orderDate: '2025-08-17', status: 'Planned' },
  { id: generateId('sp'), material: 'Bearings', currentStock: 350, requirement: 400, supplier: 'AutoParts Direct', leadTime: 10, orderDate: '2025-08-19', status: 'Planned' },
  { id: generateId('sp'), material: 'Motors', currentStock: 45, requirement: 50, supplier: 'Tech Components Inc.', leadTime: 21, orderDate: '2025-08-20', status: 'Planned' },
  { id: generateId('sp'), material: 'Sensors', currentStock: 220, requirement: 280, supplier: 'Tech Components Inc.', leadTime: 15, orderDate: '2025-08-18', status: 'Urgent' },
  { id: generateId('sp'), material: 'Cables', currentStock: 1500, requirement: 1800, supplier: 'Precision Tools Asia', leadTime: 9, orderDate: '2025-08-15', status: 'Ordered' },
  { id: generateId('sp'), material: 'Connectors', currentStock: 2800, requirement: 3200, supplier: 'Tech Components Inc.', leadTime: 12, orderDate: '2025-08-16', status: 'Planned' },
  { id: generateId('sp'), material: 'Steel Pipes', currentStock: 2300, requirement: 3000, supplier: 'Global Steel Works', leadTime: 14, orderDate: '2025-08-21', status: 'Planned' },
  { id: generateId('sp'), material: 'Copper Wire', currentStock: 140, requirement: 280, supplier: 'Precision Tools Asia', leadTime: 10, orderDate: '2025-08-19', status: 'Urgent' },
  { id: generateId('sp'), material: 'Aluminum Sheets', currentStock: 750, requirement: 950, supplier: 'Global Steel Works', leadTime: 12, orderDate: '2025-08-17', status: 'Planned' },
  { id: generateId('sp'), material: 'Fasteners', currentStock: 4800, requirement: 5300, supplier: 'Industrial Parts Co.', leadTime: 7, orderDate: '2025-08-15', status: 'Ordered' },
  { id: generateId('sp'), material: 'Gaskets', currentStock: 1150, requirement: 1450, supplier: 'Pacific Packaging Ltd.', leadTime: 8, orderDate: '2025-08-18', status: 'Planned' },
  { id: generateId('sp'), material: 'Bearings', currentStock: 330, requirement: 380, supplier: 'AutoParts Direct', leadTime: 10, orderDate: '2025-08-20', status: 'Planned' },
  { id: generateId('sp'), material: 'Motors', currentStock: 42, requirement: 48, supplier: 'Tech Components Inc.', leadTime: 21, orderDate: '2025-08-21', status: 'Planned' },
  { id: generateId('sp'), material: 'Sensors', currentStock: 200, requirement: 260, supplier: 'Tech Components Inc.', leadTime: 15, orderDate: '2025-08-19', status: 'Urgent' },
  { id: generateId('sp'), material: 'Cables', currentStock: 1400, requirement: 1700, supplier: 'Precision Tools Asia', leadTime: 9, orderDate: '2025-08-16', status: 'Ordered' },
  { id: generateId('sp'), material: 'Connectors', currentStock: 2650, requirement: 3050, supplier: 'Tech Components Inc.', leadTime: 12, orderDate: '2025-08-17', status: 'Planned' },
  { id: generateId('sp'), material: 'Steel Pipes', currentStock: 2100, requirement: 2800, supplier: 'Global Steel Works', leadTime: 14, orderDate: '2025-08-22', status: 'Planned' },
  { id: generateId('sp'), material: 'Copper Wire', currentStock: 130, requirement: 260, supplier: 'Precision Tools Asia', leadTime: 10, orderDate: '2025-08-20', status: 'Urgent' },
  { id: generateId('sp'), material: 'Aluminum Sheets', currentStock: 700, requirement: 900, supplier: 'Global Steel Works', leadTime: 12, orderDate: '2025-08-18', status: 'Planned' },
  { id: generateId('sp'), material: 'Fasteners', currentStock: 4600, requirement: 5100, supplier: 'Industrial Parts Co.', leadTime: 7, orderDate: '2025-08-16', status: 'Ordered' },
  { id: generateId('sp'), material: 'Gaskets', currentStock: 1100, requirement: 1400, supplier: 'Pacific Packaging Ltd.', leadTime: 8, orderDate: '2025-08-19', status: 'Planned' },
  { id: generateId('sp'), material: 'Bearings', currentStock: 310, requirement: 360, supplier: 'AutoParts Direct', leadTime: 10, orderDate: '2025-08-21', status: 'Planned' },
  { id: generateId('sp'), material: 'Motors', currentStock: 39, requirement: 46, supplier: 'Tech Components Inc.', leadTime: 21, orderDate: '2025-08-22', status: 'Planned' },
  { id: generateId('sp'), material: 'Sensors', currentStock: 180, requirement: 240, supplier: 'Tech Components Inc.', leadTime: 15, orderDate: '2025-08-20', status: 'Urgent' },
  { id: generateId('sp'), material: 'Cables', currentStock: 1300, requirement: 1600, supplier: 'Precision Tools Asia', leadTime: 9, orderDate: '2025-08-17', status: 'Ordered' },
  { id: generateId('sp'), material: 'Connectors', currentStock: 2500, requirement: 2900, supplier: 'Tech Components Inc.', leadTime: 12, orderDate: '2025-08-18', status: 'Planned' },
];

const SupplyPlanning: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<Supply[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Supply | null>(null);
  const [viewing, setViewing] = useState<Supply | null>(null);

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => [
    { key: 'material', header: 'Material', sortable: true, searchable: true },
    { key: 'currentStock', header: 'Current Stock', sortable: true },
    { key: 'requirement', header: 'Requirement', sortable: true },
    { key: 'supplier', header: 'Supplier', sortable: true, searchable: true },
    { key: 'leadTime', header: 'Lead Time (days)', sortable: true },
    { key: 'orderDate', header: 'Order Date', sortable: true },
    { key: 'status', header: 'Status', sortable: true, filterable: true, filterOptions: ['Planned', 'Urgent', 'Ordered', 'Delivered'].map(s => ({ label: s, value: s })) },
  ], []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: Supply) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: Supply) => { setEditing(row); setOpen(true); } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: Supply) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: `Supply plan for ${row.material} removed` }); }, variant: 'destructive' }
  ];

  const form = useForm<Supply>({
    resolver: zodResolver(supplySchema),
    defaultValues: { id: '', material: '', currentStock: 0, requirement: 0, supplier: '', leadTime: 14, orderDate: new Date().toISOString().slice(0, 10), status: 'Planned', notes: '' }
  });

  const openCreate = () => { setEditing(null); form.reset({ id: generateId('sp'), material: '', currentStock: 0, requirement: 0, supplier: '', leadTime: 14, orderDate: new Date().toISOString().slice(0, 10), status: 'Planned', notes: '' }); setOpen(true); };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: Supply) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'Supply Plan Updated' : 'Supply Plan Created', description: values.material });
  };

  const urgentCount = data.filter(s => s.status === 'Urgent').length;
  const plannedCount = data.filter(s => s.status === 'Planned').length;
  const shortageCount = data.filter(s => s.currentStock < s.requirement).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Supply Planning" description="Manage supply requirements, purchase planning, and supplier capacity" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center"><Package className="h-8 w-8 text-blue-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.length}</h3><p className="text-sm text-gray-600">Materials Planned</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Truck className="h-8 w-8 text-red-600 mr-3"/><div><h3 className="text-2xl font-bold">{urgentCount}</h3><p className="text-sm text-gray-600">Urgent</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Package className="h-8 w-8 text-yellow-600 mr-3"/><div><h3 className="text-2xl font-bold">{plannedCount}</h3><p className="text-sm text-gray-600">Planned</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Package className="h-8 w-8 text-orange-600 mr-3"/><div><h3 className="text-2xl font-bold">{shortageCount}</h3><p className="text-sm text-gray-600">Shortages</p></div></div></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center"><Package className="h-5 w-5 mr-2" /> Supply Planning ({data.length})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Create Plan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit Supply Plan' : 'Create Supply Plan'}</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="material" render={({ field }) => (
                    <FormItem><FormLabel>Material</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger></FormControl>
                        <SelectContent>{materials.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="supplier" render={({ field }) => (
                    <FormItem><FormLabel>Supplier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger></FormControl>
                        <SelectContent>{suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="currentStock" render={({ field }) => (
                    <FormItem><FormLabel>Current Stock</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="requirement" render={({ field }) => (
                    <FormItem><FormLabel>Requirement</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="leadTime" render={({ field }) => (
                    <FormItem><FormLabel>Lead Time (days)</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="orderDate" render={({ field }) => (
                    <FormItem><FormLabel>Order Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>{['Planned', 'Urgent', 'Ordered', 'Delivered'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
          <EnhancedDataTable columns={columns} data={data as any} actions={actions as any} searchPlaceholder="Search supply plans..." refreshable={true} onRefresh={refresh} exportable={true} />
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supply Plan Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-500">Material</label><p className="text-lg font-semibold">{viewing.material}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Status</label><p><Badge variant={viewing.status === 'Urgent' ? 'destructive' : viewing.status === 'Ordered' ? 'default' : 'secondary'}>{viewing.status}</Badge></p></div>
              <div><label className="text-sm font-medium text-gray-500">Current Stock</label><p>{viewing.currentStock}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Requirement</label><p className="font-bold">{viewing.requirement}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Supplier</label><p>{viewing.supplier}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Lead Time</label><p>{viewing.leadTime} days</p></div>
              <div className="col-span-2"><label className="text-sm font-medium text-gray-500">Shortage</label><p className={viewing.currentStock < viewing.requirement ? 'text-red-600 font-bold text-xl' : 'text-green-600 font-bold'}>{viewing.currentStock < viewing.requirement ? viewing.requirement - viewing.currentStock : 'None'}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplyPlanning;
