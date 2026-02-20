
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Truck, Plus, Edit, Trash2, Eye, MapPin } from 'lucide-react';
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

const shipmentSchema = z.object({
  id: z.string().min(1),
  shipmentId: z.string().min(1, 'Shipment ID is required'),
  carrier: z.string().min(1, 'Carrier is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  arrivalDate: z.string().optional(),
  status: z.enum(['Planning', 'In Transit', 'Delivered', 'Cancelled']),
  weight: z.string().min(1, 'Weight is required'),
  value: z.coerce.number().min(0, 'Value required'),
  driver: z.string().optional(),
  vehicle: z.string().optional(),
});

type Shipment = z.infer<typeof shipmentSchema>;

const carriers = ['Global Logistics Inc.', 'Fast Freight Corp', 'Express Transport', 'Premium Delivery', 'DHL Express', 'FedEx', 'UPS', 'USPS'];
const cities = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Seattle, WA', 'Miami, FL', 'Denver, CO', 'Boston, MA', 'Atlanta, GA'];

const seedData: Shipment[] = [
  { id: generateId('shp'), shipmentId: 'SHP-001', carrier: 'Global Logistics Inc.', origin: 'New York, NY', destination: 'Los Angeles, CA', departureDate: '2025-08-10', status: 'In Transit', weight: '2500 kg', value: 125000, driver: 'John Smith', vehicle: 'TRK-001' },
  { id: generateId('shp'), shipmentId: 'SHP-002', carrier: 'Fast Freight Corp', origin: 'Chicago, IL', destination: 'Miami, FL', departureDate: '2025-08-09', arrivalDate: '2025-08-12', status: 'Delivered', weight: '1800 kg', value: 89500, driver: 'Maria Garcia', vehicle: 'TRK-002' },
  { id: generateId('shp'), shipmentId: 'SHP-003', carrier: 'Express Transport', origin: 'Seattle, WA', destination: 'Denver, CO', departureDate: '2025-08-11', status: 'Planning', weight: '3200 kg', value: 156000, driver: 'Robert Johnson', vehicle: 'TRK-003' },
  { id: generateId('shp'), shipmentId: 'SHP-004', carrier: 'Premium Delivery', origin: 'Phoenix, AZ', destination: 'Boston, MA', departureDate: '2025-08-08', arrivalDate: '2025-08-11', status: 'Delivered', weight: '1500 kg', value: 78000, driver: 'Lisa Wong', vehicle: 'TRK-004' },
  { id: generateId('shp'), shipmentId: 'SHP-005', carrier: 'DHL Express', origin: 'Miami, FL', destination: 'Atlanta, GA', departureDate: '2025-08-12', status: 'In Transit', weight: '2200 kg', value: 110000, driver: 'Tom Harris', vehicle: 'TRK-005' },
  { id: generateId('shp'), shipmentId: 'SHP-006', carrier: 'FedEx', origin: 'Los Angeles, CA', destination: 'Seattle, WA', departureDate: '2025-08-07', arrivalDate: '2025-08-09', status: 'Delivered', weight: '950 kg', value: 45000, driver: 'Amy Lee', vehicle: 'TRK-006' },
  { id: generateId('shp'), shipmentId: 'SHP-007', carrier: 'UPS', origin: 'Denver, CO', destination: 'Houston, TX', departureDate: '2025-08-13', status: 'Planning', weight: '2800 kg', value: 134000, driver: 'Mike Brown', vehicle: 'TRK-007' },
  { id: generateId('shp'), shipmentId: 'SHP-008', carrier: 'USPS', origin: 'Boston, MA', destination: 'Chicago, IL', departureDate: '2025-08-06', arrivalDate: '2025-08-08', status: 'Delivered', weight: '750 kg', value: 32000, driver: 'Emma van Berg', vehicle: 'TRK-008' },
  { id: generateId('shp'), shipmentId: 'SHP-009', carrier: 'Global Logistics Inc.', origin: 'Atlanta, GA', destination: 'Phoenix, AZ', departureDate: '2025-08-14', status: 'Planning', weight: '1900 kg', value: 92000, driver: 'David Chen', vehicle: 'TRK-009' },
  { id: generateId('shp'), shipmentId: 'SHP-010', carrier: 'Fast Freight Corp', origin: 'Houston, TX', destination: 'New York, NY', departureDate: '2025-08-05', arrivalDate: '2025-08-08', status: 'Delivered', weight: '3500 kg', value: 178000, driver: 'Sarah Johnson', vehicle: 'TRK-010' },
  { id: generateId('shp'), shipmentId: 'SHP-011', carrier: 'Express Transport', origin: 'Miami, FL', destination: 'Los Angeles, CA', departureDate: '2025-08-15', status: 'In Transit', weight: '4100 kg', value: 205000, driver: 'James Wilson', vehicle: 'TRK-011' },
  { id: generateId('shp'), shipmentId: 'SHP-012', carrier: 'Premium Delivery', origin: 'Seattle, WA', destination: 'Denver, CO', departureDate: '2025-08-04', arrivalDate: '2025-08-06', status: 'Delivered', weight: '1200 kg', value: 56000, driver: 'Karen Martinez', vehicle: 'TRK-012' },
  { id: generateId('shp'), shipmentId: 'SHP-013', carrier: 'DHL Express', origin: 'Phoenix, AZ', destination: 'Chicago, IL', departureDate: '2025-08-16', status: 'Planning', weight: '2600 kg', value: 128000, driver: 'Chris Taylor', vehicle: 'TRK-013' },
  { id: generateId('shp'), shipmentId: 'SHP-014', carrier: 'FedEx', origin: 'Boston, MA', destination: 'Miami, FL', departureDate: '2025-08-03', arrivalDate: '2025-08-05', status: 'Delivered', weight: '880 kg', value: 41000, driver: 'Patricia Davis', vehicle: 'TRK-014' },
  { id: generateId('shp'), shipmentId: 'SHP-015', carrier: 'UPS', origin: 'Denver, CO', destination: 'Atlanta, GA', departureDate: '2025-08-17', status: 'Planning', weight: '2300 kg', value: 115000, driver: 'Mark Miller', vehicle: 'TRK-015' },
  { id: generateId('shp'), shipmentId: 'SHP-016', carrier: 'USPS', origin: 'New York, NY', destination: 'Houston, TX', departureDate: '2025-08-02', arrivalDate: '2025-08-05', status: 'Delivered', weight: '4200 kg', value: 210000, driver: 'Nancy White', vehicle: 'TRK-016' },
  { id: generateId('shp'), shipmentId: 'SHP-017', carrier: 'Global Logistics Inc.', origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', departureDate: '2025-08-18', status: 'In Transit', weight: '1700 kg', value: 82000, driver: 'Paul Anderson', vehicle: 'TRK-017' },
  { id: generateId('shp'), shipmentId: 'SHP-018', carrier: 'Fast Freight Corp', origin: 'Chicago, IL', destination: 'Seattle, WA', departureDate: '2025-08-01', arrivalDate: '2025-08-04', status: 'Delivered', weight: '2900 kg', value: 145000, driver: 'Laura Thomas', vehicle: 'TRK-018' },
  { id: generateId('shp'), shipmentId: 'SHP-019', carrier: 'Express Transport', origin: 'Houston, TX', destination: 'Boston, MA', departureDate: '2025-08-19', status: 'Planning', weight: '3800 kg', value: 189000, driver: 'Steven Jackson', vehicle: 'TRK-019' },
  { id: generateId('shp'), shipmentId: 'SHP-020', carrier: 'Premium Delivery', origin: 'Miami, FL', destination: 'Denver, CO', departureDate: '2025-07-31', arrivalDate: '2025-08-02', status: 'Delivered', weight: '1400 kg', value: 67000, driver: 'Barbara Moore', vehicle: 'TRK-020' },
  { id: generateId('shp'), shipmentId: 'SHP-021', carrier: 'DHL Express', origin: 'Atlanta, GA', destination: 'New York, NY', departureDate: '2025-08-20', status: 'In Transit', weight: '3100 kg', value: 155000, driver: 'Richard Martin', vehicle: 'TRK-021' },
  { id: generateId('shp'), shipmentId: 'SHP-022', carrier: 'FedEx', origin: 'Phoenix, AZ', destination: 'Los Angeles, CA', departureDate: '2025-07-30', arrivalDate: '2025-08-01', status: 'Delivered', weight: '920 kg', value: 44000, driver: 'Betty Thompson', vehicle: 'TRK-022' },
  { id: generateId('shp'), shipmentId: 'SHP-023', carrier: 'UPS', origin: 'Seattle, WA', destination: 'Chicago, IL', departureDate: '2025-08-21', status: 'Planning', weight: '2700 kg', value: 135000, driver: 'George Harris', vehicle: 'TRK-023' },
  { id: generateId('shp'), shipmentId: 'SHP-024', carrier: 'USPS', origin: 'Boston, MA', destination: 'Houston, TX', departureDate: '2025-07-29', arrivalDate: '2025-08-01', status: 'Delivered', weight: '4600 kg', value: 230000, driver: 'Helen Clark', vehicle: 'TRK-024' },
  { id: generateId('shp'), shipmentId: 'SHP-025', carrier: 'Global Logistics Inc.', origin: 'Denver, CO', destination: 'Miami, FL', departureDate: '2025-08-22', status: 'In Transit', weight: '2000 kg', value: 98000, driver: 'Edward Lewis', vehicle: 'TRK-025' },
  { id: generateId('shp'), shipmentId: 'SHP-026', carrier: 'Fast Freight Corp', origin: 'New York, NY', destination: 'Atlanta, GA', departureDate: '2025-07-28', arrivalDate: '2025-07-31', status: 'Delivered', weight: '3400 kg', value: 170000, driver: 'Dorothy Walker', vehicle: 'TRK-026' },
  { id: generateId('shp'), shipmentId: 'SHP-027', carrier: 'Express Transport', origin: 'Los Angeles, CA', destination: 'Boston, MA', departureDate: '2025-08-23', status: 'Planning', weight: '4800 kg', value: 240000, driver: 'Kenneth Hall', vehicle: 'TRK-027' },
  { id: generateId('shp'), shipmentId: 'SHP-028', carrier: 'Premium Delivery', origin: 'Chicago, IL', destination: 'Phoenix, AZ', departureDate: '2025-07-27', arrivalDate: '2025-07-30', status: 'Delivered', weight: '1600 kg', value: 78000, driver: 'Carol Allen', vehicle: 'TRK-028' },
  { id: generateId('shp'), shipmentId: 'SHP-029', carrier: 'DHL Express', origin: 'Houston, TX', destination: 'Seattle, WA', departureDate: '2025-08-24', status: 'In Transit', weight: '2500 kg', value: 125000, driver: 'Ronald Young', vehicle: 'TRK-029' },
  { id: generateId('shp'), shipmentId: 'SHP-030', carrier: 'FedEx', origin: 'Miami, FL', destination: 'Denver, CO', departureDate: '2025-07-26', arrivalDate: '2025-07-29', status: 'Delivered', weight: '1100 kg', value: 52000, driver: 'Sandra King', vehicle: 'TRK-030' },
];

const Transportation: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<Shipment[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [viewing, setViewing] = useState<Shipment | null>(null);

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => [
    { key: 'shipmentId', header: 'Shipment ID', sortable: true, searchable: true },
    { key: 'carrier', header: 'Carrier', sortable: true, searchable: true },
    { key: 'origin', header: 'Origin', sortable: true },
    { key: 'destination', header: 'Destination', sortable: true },
    { key: 'departureDate', header: 'Departure', sortable: true },
    { key: 'status', header: 'Status', sortable: true, filterable: true, filterOptions: ['Planning', 'In Transit', 'Delivered', 'Cancelled'].map(s => ({ label: s, value: s })) },
    { key: 'value', header: 'Value', sortable: true },
  ], []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: Shipment) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: Shipment) => { setEditing(row); setOpen(true); } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: Shipment) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: `Shipment ${row.shipmentId} removed` }); }, variant: 'destructive' }
  ];

  const form = useForm<Shipment>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: { id: '', shipmentId: '', carrier: '', origin: '', destination: '', departureDate: new Date().toISOString().slice(0, 10), status: 'Planning', weight: '', value: 0, driver: '', vehicle: '' }
  });

  const openCreate = () => { setEditing(null); form.reset({ id: generateId('shp'), shipmentId: '', carrier: '', origin: '', destination: '', departureDate: new Date().toISOString().slice(0, 10), status: 'Planning', weight: '', value: 0, driver: '', vehicle: '' }); setOpen(true); };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: Shipment) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'Shipment Updated' : 'Shipment Created', description: values.shipmentId });
  };

  const totalValue = data.reduce((sum, s) => sum + s.value, 0);
  const inTransitCount = data.filter(s => s.status === 'In Transit').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Transportation Management" description="Manage transportation planning, execution, and tracking" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center"><Truck className="h-8 w-8 text-blue-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.length}</h3><p className="text-sm text-gray-600">Total Shipments</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Truck className="h-8 w-8 text-yellow-600 mr-3"/><div><h3 className="text-2xl font-bold">{inTransitCount}</h3><p className="text-sm text-gray-600">In Transit</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><MapPin className="h-8 w-8 text-green-600 mr-3"/><div><h3 className="text-2xl font-bold">{carriers.length}</h3><p className="text-sm text-gray-600">Carriers</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Truck className="h-8 w-8 text-purple-600 mr-3"/><div><h3 className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</h3><p className="text-sm text-gray-600">Total Value</p></div></div></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center"><Truck className="h-5 w-5 mr-2" /> Shipments ({data.length})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Create Shipment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit Shipment' : 'Create Shipment'}</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="shipmentId" render={({ field }) => (
                    <FormItem><FormLabel>Shipment ID</FormLabel><FormControl><Input placeholder="SHP-xxx" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="carrier" render={({ field }) => (
                    <FormItem><FormLabel>Carrier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select carrier" /></SelectTrigger></FormControl>
                        <SelectContent>{carriers.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="origin" render={({ field }) => (
                    <FormItem><FormLabel>Origin</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select origin" /></SelectTrigger></FormControl>
                        <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="destination" render={({ field }) => (
                    <FormItem><FormLabel>Destination</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger></FormControl>
                        <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="departureDate" render={({ field }) => (
                    <FormItem><FormLabel>Departure Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel>Weight</FormLabel><FormControl><Input placeholder="e.g. 1000 kg" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="value" render={({ field }) => (
                    <FormItem><FormLabel>Value ($)</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>{['Planning', 'In Transit', 'Delivered', 'Cancelled'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
          <EnhancedDataTable columns={columns} data={data as any} actions={actions as any} searchPlaceholder="Search shipments..." refreshable={true} onRefresh={refresh} exportable={true} />
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Shipment Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-500">Shipment ID</label><p className="text-lg font-semibold">{viewing.shipmentId}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Status</label><p><Badge variant={viewing.status === 'Delivered' ? 'default' : viewing.status === 'In Transit' ? 'secondary' : viewing.status === 'Cancelled' ? 'destructive' : 'outline'}>{viewing.status}</Badge></p></div>
              <div><label className="text-sm font-medium text-gray-500">Carrier</label><p>{viewing.carrier}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Driver</label><p>{viewing.driver || 'N/A'}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Origin</label><p className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{viewing.origin}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Vehicle</label><p>{viewing.vehicle || 'N/A'}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Destination</label><p className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{viewing.destination}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Weight</label><p>{viewing.weight}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Departure</label><p>{viewing.departureDate}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Arrival</label><p>{viewing.arrivalDate || 'TBD'}</p></div>
              <div className="col-span-2"><label className="text-sm font-medium text-gray-500">Value</label><p className="text-2xl font-bold text-green-600">${viewing.value.toLocaleString()}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transportation;
