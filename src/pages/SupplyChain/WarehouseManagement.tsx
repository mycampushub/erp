
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Warehouse, Plus, Edit, Trash2, Eye, MapPin, Users } from 'lucide-react';
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

const warehouseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Warehouse name is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.coerce.number().int().min(0, 'Capacity required'),
  occupied: z.coerce.number().int().min(0, 'Occupied required'),
  manager: z.string().min(1, 'Manager is required'),
  status: z.enum(['Active', 'Inactive', 'Maintenance']),
  type: z.enum(['Distribution Center', 'Storage Warehouse', 'Fulfillment Center']),
});

type Warehouse = z.infer<typeof warehouseSchema>;

const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Seattle, WA', 'Miami, FL', 'Denver, CO'];
const managers = ['John Smith', 'Maria Garcia', 'Robert Johnson', 'Lisa Wong', 'Tom Harris', 'Amy Lee', 'Mike Brown', 'Emma van Berg'];

const seedData: Warehouse[] = [
  { id: generateId('wh'), name: 'Main Warehouse NY', location: 'New York, NY', capacity: 10000, occupied: 7500, manager: 'John Smith', status: 'Active', type: 'Distribution Center' },
  { id: generateId('wh'), name: 'Distribution Center CA', location: 'Los Angeles, CA', capacity: 15000, occupied: 12000, manager: 'Maria Garcia', status: 'Active', type: 'Fulfillment Center' },
  { id: generateId('wh'), name: 'Regional Hub TX', location: 'Houston, TX', capacity: 8000, occupied: 5200, manager: 'Robert Johnson', status: 'Active', type: 'Storage Warehouse' },
  { id: generateId('wh'), name: 'Midwest Warehouse IL', location: 'Chicago, IL', capacity: 12000, occupied: 9000, manager: 'Lisa Wong', status: 'Active', type: 'Distribution Center' },
  { id: generateId('wh'), name: 'West Coast DC', location: 'Phoenix, AZ', capacity: 9000, occupied: 6300, manager: 'Tom Harris', status: 'Active', type: 'Fulfillment Center' },
  { id: generateId('wh'), name: 'Northwest Facility', location: 'Seattle, WA', capacity: 7000, occupied: 4200, manager: 'Amy Lee', status: 'Active', type: 'Storage Warehouse' },
  { id: generateId('wh'), name: 'Southeast Hub', location: 'Miami, FL', capacity: 8500, occupied: 6800, manager: 'Mike Brown', status: 'Active', type: 'Distribution Center' },
  { id: generateId('wh'), name: 'Mountain Region DC', location: 'Denver, CO', capacity: 6000, occupied: 3000, manager: 'Emma van Berg', status: 'Active', type: 'Storage Warehouse' },
  { id: generateId('wh'), name: 'East Coast Warehouse', location: 'New York, NY', capacity: 11000, occupied: 8800, manager: 'David Chen', status: 'Active', type: 'Fulfillment Center' },
  { id: generateId('wh'), name: 'Central Distribution', location: 'Chicago, IL', capacity: 13000, occupied: 10400, manager: 'Sarah Johnson', status: 'Active', type: 'Distribution Center' },
  { id: generateId('wh'), name: 'Southwest Facility', location: 'Phoenix, AZ', capacity: 7500, occupied: 4500, manager: 'James Wilson', status: 'Active', type: 'Storage Warehouse' },
  { id: generateId('wh'), name: 'Pacific Center', location: 'Los Angeles, CA', capacity: 14000, occupied: 11200, manager: 'Karen Martinez', status: 'Active', type: 'Fulfillment Center' },
  { id: generateId('wh'), name: 'Atlantic Warehouse', location: 'Miami, FL', capacity: 9500, occupied: 7600, manager: 'Chris Taylor', status: 'Maintenance', type: 'Distribution Center' },
  { id: generateId('wh'), name: 'Gulf Coast DC', location: 'Houston, TX', capacity: 10500, occupied: 8400, manager: 'Patricia Davis', status: 'Active', type: 'Storage Warehouse' },
  { id: generateId('wh'), name: 'Great Lakes Facility', location: 'Chicago, IL', capacity: 8000, occupied: 6400, manager: 'Mark Miller', status: 'Active', type: 'Fulfillment Center' },
  { id: generateId('wh'), name: 'Southwest Hub', location: 'Phoenix, AZ', capacity: 6800, occupied: 4080, manager: 'Nancy White', status: 'Active', type: 'Distribution Center' },
  { id: generateId('wh'), name: 'Northern Warehouse', location: 'Seattle, WA', capacity: 9200, occupied: 7360, manager: 'Paul Anderson', status: 'Active', type: 'Storage Warehouse' },
  { id: generateId('wh'), name: 'Coastal DC', location: 'Los Angeles, CA', capacity: 11500, occupied: 9200, manager: 'Laura Thomas', status: 'Active', type: 'Fulfillment Center' },
  { id: generateId('wh'), name: 'Central Plains Warehouse', location: 'Denver, CO', capacity: 5500, occupied: 3300, manager: 'Steven Jackson', status: 'Active', type: 'Distribution Center' },
  { id: generateId('wh'), name: 'Eastern Seaboard', location: 'New York, NY', capacity: 12500, occupied: 10000, manager: 'Barbara Moore', status: 'Active', type: 'Storage Warehouse' },
  { id: generateId('wh'), name: 'Texas Distribution', location: 'Houston, TX', capacity: 11800, occupied: 9440, manager: 'Richard Martin', status: 'Active', type: 'Fulfillment Center' },
  { id: generateId('wh'), name: 'Golden State Facility', location: 'Los Angeles, CA', capacity: 10200, occupied: 8160, manager: 'Betty Thompson', status: 'Active', type: 'Distribution Center' },
  { id: generateId('wh'), name: 'Prairie Warehouse', location: 'Chicago, IL', capacity: 7200, occupied: 5040, manager: 'George Harris', status: 'Inactive', type: 'Storage Warehouse' },
  { id: generateId('wh'), name: 'Desert Center', location: 'Phoenix, AZ', capacity: 8800, occupied: 7040, manager: 'Helen Clark', status: 'Active', type: 'Fulfillment Center' },
  { id: generateId('wh'), name: 'Bay Area DC', location: 'Los Angeles, CA', capacity: 13500, occupied: 10800, manager: 'Edward Lewis', status: 'Active', type: 'Distribution Center' },
  { id: generateId('wh'), name: 'Rocky Mountain Warehouse', location: 'Denver, CO', capacity: 4800, occupied: 2880, manager: 'Dorothy Walker', status: 'Active', type: 'Storage Warehouse' },
  { id: generateId('wh'), name: 'Sunshine State Facility', location: 'Miami, FL', capacity: 10800, occupied: 8640, manager: 'Kenneth Hall', status: 'Active', type: 'Fulfillment Center' },
  { id: generateId('wh'), name: 'Windy City DC', location: 'Chicago, IL', capacity: 14200, occupied: 11360, manager: 'Carol Allen', status: 'Active', type: 'Distribution Center' },
  { id: generateId('wh'), name: 'Emerald City Warehouse', location: 'Seattle, WA', capacity: 8200, occupied: 6560, manager: 'Ronald Young', status: 'Active', type: 'Storage Warehouse' },
  { id: generateId('wh'), name: 'Liberty Facility', location: 'New York, NY', capacity: 9800, occupied: 7840, manager: 'Sandra King', status: 'Active', type: 'Fulfillment Center' },
];

const WarehouseManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<Warehouse[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [viewing, setViewing] = useState<Warehouse | null>(null);

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => [
    { key: 'name', header: 'Warehouse Name', sortable: true, searchable: true },
    { key: 'location', header: 'Location', sortable: true, searchable: true },
    { key: 'manager', header: 'Manager', sortable: true },
    { key: 'capacity', header: 'Capacity', sortable: true },
    { key: 'occupied', header: 'Occupied', sortable: true },
    { key: 'type', header: 'Type', sortable: true, filterable: true, filterOptions: ['Distribution Center', 'Storage Warehouse', 'Fulfillment Center'].map(t => ({ label: t, value: t })) },
    { key: 'status', header: 'Status', sortable: true, filterable: true, filterOptions: ['Active', 'Inactive', 'Maintenance'].map(s => ({ label: s, value: s })) },
  ], []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: Warehouse) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: Warehouse) => { setEditing(row); setOpen(true); } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: Warehouse) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: `Warehouse ${row.name} removed` }); }, variant: 'destructive' }
  ];

  const form = useForm<Warehouse>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { id: '', name: '', location: '', capacity: 0, occupied: 0, manager: '', status: 'Active', type: 'Distribution Center' }
  });

  const openCreate = () => { setEditing(null); form.reset({ id: generateId('wh'), name: '', location: '', capacity: 0, occupied: 0, manager: '', status: 'Active', type: 'Distribution Center' }); setOpen(true); };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: Warehouse) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'Warehouse Updated' : 'Warehouse Created', description: values.name });
  };

  const totalCapacity = data.reduce((sum, w) => sum + w.capacity, 0);
  const totalOccupied = data.reduce((sum, w) => sum + w.occupied, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Warehouse Management" description="Manage warehouse operations, locations, and staff" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center"><Warehouse className="h-8 w-8 text-blue-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.length}</h3><p className="text-sm text-gray-600">Warehouses</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Warehouse className="h-8 w-8 text-green-600 mr-3"/><div><h3 className="text-2xl font-bold">{totalCapacity.toLocaleString()}</h3><p className="text-sm text-gray-600">Total Capacity</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><MapPin className="h-8 w-8 text-purple-600 mr-3"/><div><h3 className="text-2xl font-bold">{Math.round(totalOccupied / totalCapacity * 100)}%</h3><p className="text-sm text-gray-600">Avg Utilization</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Users className="h-8 w-8 text-orange-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.filter(w => w.status === 'Active').length}</h3><p className="text-sm text-gray-600">Active</p></div></div></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center"><Warehouse className="h-5 w-5 mr-2" /> Warehouses ({data.length})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Warehouse</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Warehouse Name</FormLabel><FormControl><Input placeholder="Name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger></FormControl>
                        <SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="manager" render={({ field }) => (
                    <FormItem><FormLabel>Manager</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger></FormControl>
                        <SelectContent>{managers.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="capacity" render={({ field }) => (
                    <FormItem><FormLabel>Capacity (sqm)</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="occupied" render={({ field }) => (
                    <FormItem><FormLabel>Occupied (sqm)</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>{['Distribution Center', 'Storage Warehouse', 'Fulfillment Center'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>{['Active', 'Inactive', 'Maintenance'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
          <EnhancedDataTable columns={columns} data={data as any} actions={actions as any} searchPlaceholder="Search warehouses..." refreshable={true} onRefresh={refresh} exportable={true} />
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Warehouse Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-500">Name</label><p className="text-lg font-semibold">{viewing.name}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Status</label><p><Badge variant={viewing.status === 'Active' ? 'default' : viewing.status === 'Maintenance' ? 'secondary' : 'destructive'}>{viewing.status}</Badge></p></div>
              <div><label className="text-sm font-medium text-gray-500">Location</label><p className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{viewing.location}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Manager</label><p className="flex items-center"><Users className="h-4 w-4 mr-2" />{viewing.manager}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Capacity</label><p>{viewing.capacity.toLocaleString()} sqm</p></div>
              <div><label className="text-sm font-medium text-gray-500">Occupied</label><p>{viewing.occupied.toLocaleString()} sqm</p></div>
              <div className="col-span-2"><label className="text-sm font-medium text-gray-500">Utilization</label>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2"><div className="bg-blue-600 h-4 rounded-full" style={{ width: `${(viewing.occupied / viewing.capacity) * 100}%` }}></div></div>
                <p className="text-right mt-1">{Math.round(viewing.occupied / viewing.capacity * 100)}%</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehouseManagement;
