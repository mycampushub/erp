
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Truck, MapPin, Route, BarChart3, Plus, Edit, Trash2, Eye } from 'lucide-react';
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

const routeSchema = z.object({
  id: z.string().min(1),
  route: z.string().min(1, 'Route ID is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  distance: z.coerce.number().int().min(1, 'Distance required'),
  deliveries: z.coerce.number().int().min(1, 'Deliveries required'),
  capacity: z.coerce.number().int().min(0).max(100, 'Capacity 0-100%'),
  cost: z.coerce.number().min(0, 'Cost required'),
  status: z.enum(['Optimized', 'At Capacity', 'Underutilized', 'In Review']),
  notes: z.string().optional(),
});

type RouteData = z.infer<typeof routeSchema>;

const origins = ['Main Warehouse', 'Distribution Center', 'Regional Hub', 'Port Facility', 'Manufacturing Plant'];
const destinations = ['Customer Zone A', 'Customer Zone B', 'Customer Zone C', 'Retail Store', 'Service Center'];
const statuses = ['Optimized', 'At Capacity', 'Underutilized', 'In Review'] as const;

const seedData: RouteData[] = [
  { id: generateId('dp'), route: 'Route-001', origin: 'Main Warehouse', destination: 'Customer Zone A', distance: 125, deliveries: 8, capacity: 85, cost: 450, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-002', origin: 'Distribution Center', destination: 'Customer Zone B', distance: 89, deliveries: 12, capacity: 92, cost: 380, status: 'At Capacity' },
  { id: generateId('dp'), route: 'Route-003', origin: 'Regional Hub', destination: 'Customer Zone C', distance: 156, deliveries: 6, capacity: 72, cost: 620, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-004', origin: 'Port Facility', destination: 'Retail Store', distance: 210, deliveries: 4, capacity: 65, cost: 890, status: 'Underutilized' },
  { id: generateId('dp'), route: 'Route-005', origin: 'Manufacturing Plant', destination: 'Service Center', distance: 78, deliveries: 15, capacity: 88, cost: 320, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-006', origin: 'Main Warehouse', destination: 'Customer Zone B', distance: 145, deliveries: 7, capacity: 78, cost: 540, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-007', origin: 'Distribution Center', destination: 'Customer Zone A', distance: 98, deliveries: 10, capacity: 95, cost: 410, status: 'At Capacity' },
  { id: generateId('dp'), route: 'Route-008', origin: 'Regional Hub', destination: 'Retail Store', distance: 180, deliveries: 5, capacity: 68, cost: 750, status: 'In Review' },
  { id: generateId('dp'), route: 'Route-009', origin: 'Port Facility', destination: 'Customer Zone C', distance: 230, deliveries: 3, capacity: 55, cost: 920, status: 'Underutilized' },
  { id: generateId('dp'), route: 'Route-010', origin: 'Manufacturing Plant', destination: 'Customer Zone A', distance: 110, deliveries: 9, capacity: 82, cost: 460, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-011', origin: 'Main Warehouse', destination: 'Service Center', distance: 67, deliveries: 14, capacity: 90, cost: 290, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-012', origin: 'Distribution Center', destination: 'Retail Store', distance: 165, deliveries: 6, capacity: 75, cost: 680, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-013', origin: 'Regional Hub', destination: 'Customer Zone A', distance: 135, deliveries: 8, capacity: 80, cost: 520, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-014', origin: 'Port Facility', destination: 'Customer Zone B', distance: 195, deliveries: 5, capacity: 62, cost: 810, status: 'Underutilized' },
  { id: generateId('dp'), route: 'Route-015', origin: 'Manufacturing Plant', destination: 'Customer Zone C', distance: 88, deliveries: 11, capacity: 85, cost: 370, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-016', origin: 'Main Warehouse', destination: 'Retail Store', distance: 175, deliveries: 4, capacity: 58, cost: 720, status: 'Underutilized' },
  { id: generateId('dp'), route: 'Route-017', origin: 'Distribution Center', destination: 'Service Center', distance: 92, deliveries: 13, capacity: 88, cost: 390, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-018', origin: 'Regional Hub', destination: 'Customer Zone B', distance: 148, deliveries: 7, capacity: 77, cost: 590, status: 'In Review' },
  { id: generateId('dp'), route: 'Route-019', origin: 'Port Facility', destination: 'Service Center', distance: 205, deliveries: 4, capacity: 60, cost: 850, status: 'Underutilized' },
  { id: generateId('dp'), route: 'Route-020', origin: 'Manufacturing Plant', destination: 'Retail Store', distance: 125, deliveries: 9, capacity: 83, cost: 510, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-021', origin: 'Main Warehouse', destination: 'Customer Zone C', distance: 158, deliveries: 6, capacity: 70, cost: 640, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-022', origin: 'Distribution Center', destination: 'Customer Zone C', distance: 172, deliveries: 5, capacity: 65, cost: 700, status: 'In Review' },
  { id: generateId('dp'), route: 'Route-023', origin: 'Regional Hub', destination: 'Service Center', distance: 105, deliveries: 10, capacity: 86, cost: 440, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-024', origin: 'Port Facility', destination: 'Retail Store', distance: 245, deliveries: 3, capacity: 52, cost: 980, status: 'Underutilized' },
  { id: generateId('dp'), route: 'Route-025', origin: 'Manufacturing Plant', destination: 'Customer Zone B', distance: 95, deliveries: 12, capacity: 91, cost: 400, status: 'At Capacity' },
  { id: generateId('dp'), route: 'Route-026', origin: 'Main Warehouse', destination: 'Service Center', distance: 72, deliveries: 16, capacity: 94, cost: 310, status: 'At Capacity' },
  { id: generateId('dp'), route: 'Route-027', origin: 'Distribution Center', destination: 'Customer Zone C', distance: 168, deliveries: 6, capacity: 73, cost: 670, status: 'Optimized' },
  { id: generateId('dp'), route: 'Route-028', origin: 'Regional Hub', destination: 'Retail Store', distance: 190, deliveries: 4, capacity: 59, cost: 790, status: 'Underutilized' },
  { id: generateId('dp'), route: 'Route-029', origin: 'Port Facility', destination: 'Customer Zone A', distance: 220, deliveries: 4, capacity: 57, cost: 900, status: 'Underutilized' },
  { id: generateId('dp'), route: 'Route-030', origin: 'Manufacturing Plant', destination: 'Service Center', distance: 82, deliveries: 14, capacity: 89, cost: 350, status: 'Optimized' },
];

const DistributionPlanning: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<RouteData[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<RouteData | null>(null);
  const [viewing, setViewing] = useState<RouteData | null>(null);

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => [
    { key: 'route', header: 'Route ID', sortable: true, searchable: true },
    { key: 'origin', header: 'Origin', sortable: true, searchable: true },
    { key: 'destination', header: 'Destination', sortable: true, searchable: true },
    { key: 'distance', header: 'Distance (km)', sortable: true },
    { key: 'deliveries', header: 'Deliveries', sortable: true },
    { key: 'capacity', header: 'Capacity %', sortable: true },
    { key: 'cost', header: 'Cost ($)', sortable: true },
    { key: 'status', header: 'Status', sortable: true, filterable: true, filterOptions: statuses.map(s => ({ label: s, value: s })) },
  ], []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: RouteData) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: RouteData) => { setEditing(row); setOpen(true); } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: RouteData) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: `Route ${row.route} removed` }); }, variant: 'destructive' }
  ];

  const form = useForm<RouteData>({
    resolver: zodResolver(routeSchema),
    defaultValues: { id: '', route: '', origin: '', destination: '', distance: 100, deliveries: 5, capacity: 75, cost: 400, status: 'Optimized', notes: '' }
  });

  const openCreate = () => { setEditing(null); form.reset({ id: generateId('dp'), route: '', origin: '', destination: '', distance: 100, deliveries: 5, capacity: 75, cost: 400, status: 'Optimized', notes: '' }); setOpen(true); };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: RouteData) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'Route Updated' : 'Route Created', description: values.route });
  };

  const optimizedCount = data.filter(r => r.status === 'Optimized').length;
  const atCapacityCount = data.filter(r => r.status === 'At Capacity').length;
  const underutilizedCount = data.filter(r => r.status === 'Underutilized').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Distribution Planning" description="Optimize distribution networks, routes, and delivery schedules" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center"><Truck className="h-8 w-8 text-blue-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.length}</h3><p className="text-sm text-gray-600">Active Routes</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Route className="h-8 w-8 text-green-600 mr-3"/><div><h3 className="text-2xl font-bold">{optimizedCount}</h3><p className="text-sm text-gray-600">Optimized</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><BarChart3 className="h-8 w-8 text-orange-600 mr-3"/><div><h3 className="text-2xl font-bold">{atCapacityCount}</h3><p className="text-sm text-gray-600">At Capacity</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><MapPin className="h-8 w-8 text-purple-600 mr-3"/><div><h3 className="text-2xl font-bold">{underutilizedCount}</h3><p className="text-sm text-gray-600">Underutilized</p></div></div></Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Distribution Routes</h2>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Route</Button>
        </div>
        <EnhancedDataTable columns={columns} data={data as any} actions={actions} searchPlaceholder="Search routes..." />
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Route' : 'Add New Route'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="route" render={({ field }) => (<FormItem><FormLabel>Route ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="origin" render={({ field }) => (<FormItem><FormLabel>Origin</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select origin" /></SelectTrigger><SelectContent>{origins.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="destination" render={({ field }) => (<FormItem><FormLabel>Destination</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger><SelectContent>{destinations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="distance" render={({ field }) => (<FormItem><FormLabel>Distance (km)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="deliveries" render={({ field }) => (<FormItem><FormLabel>Deliveries</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="capacity" render={({ field }) => (<FormItem><FormLabel>Capacity (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="cost" render={({ field }) => (<FormItem><FormLabel>Cost ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={(v) => field.onChange(v as RouteData['status'])} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <DialogFooter><Button type="submit">{editing ? 'Update' : 'Create'}</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Route Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Route ID:</span><span>{viewing.route}</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Origin:</span><span>{viewing.origin}</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Destination:</span><span>{viewing.destination}</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Distance:</span><span>{viewing.distance} km</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Deliveries:</span><span>{viewing.deliveries}</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Capacity:</span><span>{viewing.capacity}%</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Cost:</span><span>${viewing.cost}</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Status:</span><Badge variant={viewing.status === 'Optimized' ? 'default' : viewing.status === 'At Capacity' ? 'secondary' : 'outline'}>{viewing.status}</Badge></div>
              {viewing.notes && <div className="grid grid-cols-2 gap-2 text-sm"><span className="font-medium">Notes:</span><span>{viewing.notes}</span></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DistributionPlanning;
