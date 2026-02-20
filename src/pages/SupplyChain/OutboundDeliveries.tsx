
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Eye, Edit, Trash2, Plus, Package, MapPin, Calendar, CheckCircle, Truck } from 'lucide-react';
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
import { generateId, listEntities, removeEntity, upsertEntity } from '../../lib/localCrud';
import { Badge } from '../../components/ui/badge';

const deliverySchema = z.object({
  id: z.string().min(1),
  deliveryNumber: z.string().min(3, 'Delivery number is required'),
  customer: z.string().min(2, 'Customer is required'),
  carrier: z.string().min(1, 'Carrier is required'),
  referenceSO: z.string().min(3, 'Reference SO is required'),
  items: z.coerce.number().int().min(1, 'At least one item'),
  shipDate: z.string().min(1, 'Ship Date is required'),
  deliveryDate: z.string().optional(),
  status: z.enum(['Open', 'Picking', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Planned']),
  driver: z.string().optional(),
  vehicleNumber: z.string().optional(),
  destinationAddress: z.string().optional(),
  notes: z.string().optional(),
  totalValue: z.coerce.number().min(0).optional(),
  weight: z.string().optional(),
});

type Delivery = z.infer<typeof deliverySchema>;

const customers = ['Acme Retail LLC', 'Globex Corp', 'TechStart Inc.', 'MegaMart Wholesale', 'Prime Distributors', 'Global Exports Ltd.', 'Pacific Trading Co.', 'Atlantic Imports', 'Northern Supplies', 'Southern Distribution'];
const carriers = ['DHL', 'FedEx', 'UPS', 'USPS', 'Fast Freight Corp', 'Global Logistics Inc.', 'Express Transport', 'Premium Delivery'];

const seedData: Delivery[] = [
  { id: generateId('obd'), deliveryNumber: '80000123', customer: 'Acme Retail LLC', carrier: 'DHL', referenceSO: '5000001234', items: 18, shipDate: '2025-08-10', status: 'Picking', driver: 'John Smith', vehicleNumber: 'TRK-101', destinationAddress: '123 Main St, New York, NY', totalValue: 25000, weight: '900 kg' },
  { id: generateId('obd'), deliveryNumber: '80000124', customer: 'Globex Corp', carrier: 'FedEx', referenceSO: '5000005678', items: 5, shipDate: '2025-08-09', deliveryDate: '2025-08-12', status: 'Delivered', driver: 'Maria Garcia', vehicleNumber: 'TRK-102', destinationAddress: '456 Oak Ave, Los Angeles, CA', totalValue: 12000, weight: '250 kg' },
  { id: generateId('obd'), deliveryNumber: '80000125', customer: 'TechStart Inc.', carrier: 'UPS', referenceSO: '5000009012', items: 32, shipDate: '2025-08-11', status: 'Packed', driver: 'Robert Johnson', vehicleNumber: 'TRK-103', destinationAddress: '789 Pine Rd, Chicago, IL', totalValue: 48000, weight: '3200 kg' },
  { id: generateId('obd'), deliveryNumber: '80000126', customer: 'MegaMart Wholesale', carrier: 'USPS', referenceSO: '5000003456', items: 45, shipDate: '2025-08-12', status: 'Open', driver: 'Lisa Wong', vehicleNumber: 'TRK-104', destinationAddress: '321 Elm St, Houston, TX', totalValue: 67000, weight: '4500 kg' },
  { id: generateId('obd'), deliveryNumber: '80000127', customer: 'Prime Distributors', carrier: 'Fast Freight Corp', referenceSO: '5000007890', items: 22, shipDate: '2025-08-08', deliveryDate: '2025-08-10', status: 'Delivered', driver: 'Tom Harris', vehicleNumber: 'TRK-105', destinationAddress: '654 Maple Dr, Phoenix, AZ', totalValue: 35000, weight: '2200 kg' },
  { id: generateId('obd'), deliveryNumber: '80000128', customer: 'Global Exports Ltd.', carrier: 'DHL', referenceSO: '5000001111', items: 15, shipDate: '2025-08-13', status: 'Shipped', driver: 'Amy Lee', vehicleNumber: 'TRK-106', destinationAddress: '987 Cedar Ln, Seattle, WA', totalValue: 28000, weight: '1500 kg' },
  { id: generateId('obd'), deliveryNumber: '80000129', customer: 'Pacific Trading Co.', carrier: 'FedEx', referenceSO: '5000002222', items: 28, shipDate: '2025-08-10', status: 'Picking', driver: 'Mike Brown', vehicleNumber: 'TRK-107', destinationAddress: '147 Birch Way, San Diego, CA', totalValue: 42000, weight: '2800 kg' },
  { id: generateId('obd'), deliveryNumber: '80000130', customer: 'Atlantic Imports', carrier: 'UPS', referenceSO: '5000003333', items: 12, shipDate: '2025-08-07', deliveryDate: '2025-08-09', status: 'Delivered', driver: 'Emma van Berg', vehicleNumber: 'TRK-108', destinationAddress: '258 Spruce Ct, Miami, FL', totalValue: 18000, weight: '1200 kg' },
  { id: generateId('obd'), deliveryNumber: '80000131', customer: 'Northern Supplies', carrier: 'USPS', referenceSO: '5000004444', items: 38, shipDate: '2025-08-14', status: 'Open', driver: 'David Chen', vehicleNumber: 'TRK-109', destinationAddress: '369 Willow Blvd, Boston, MA', totalValue: 55000, weight: '3800 kg' },
  { id: generateId('obd'), deliveryNumber: '80000132', customer: 'Southern Distribution', carrier: 'Express Transport', referenceSO: '5000005555', items: 20, shipDate: '2025-08-11', status: 'Packed', driver: 'Sarah Johnson', vehicleNumber: 'TRK-110', destinationAddress: '741 Ash Dr, Atlanta, GA', totalValue: 30000, weight: '2000 kg' },
  { id: generateId('obd'), deliveryNumber: '80000133', customer: 'Acme Retail LLC', carrier: 'Premium Delivery', referenceSO: '5000006666', items: 25, shipDate: '2025-08-15', status: 'Open', driver: 'James Wilson', vehicleNumber: 'TRK-111', destinationAddress: '852 Poplar St, Dallas, TX', totalValue: 38000, weight: '2500 kg' },
  { id: generateId('obd'), deliveryNumber: '80000134', customer: 'Globex Corp', carrier: 'DHL', referenceSO: '5000007777', items: 8, shipDate: '2025-08-09', deliveryDate: '2025-08-11', status: 'Delivered', driver: 'Karen Martinez', vehicleNumber: 'TRK-112', destinationAddress: '963 Cherry Ave, Denver, CO', totalValue: 15000, weight: '800 kg' },
  { id: generateId('obd'), deliveryNumber: '80000135', customer: 'TechStart Inc.', carrier: 'FedEx', referenceSO: '5000008888', items: 42, shipDate: '2025-08-16', status: 'Planned', driver: 'Chris Taylor', vehicleNumber: 'TRK-113', destinationAddress: '159 Walnut Rd, Portland, OR', totalValue: 72000, weight: '4200 kg' },
  { id: generateId('obd'), deliveryNumber: '80000136', customer: 'MegaMart Wholesale', carrier: 'UPS', referenceSO: '5000009999', items: 55, shipDate: '2025-08-13', status: 'Shipped', driver: 'Patricia Davis', vehicleNumber: 'TRK-114', destinationAddress: '357 Hickory Ln, Minneapolis, MN', totalValue: 85000, weight: '5500 kg' },
  { id: generateId('obd'), deliveryNumber: '80000137', customer: 'Prime Distributors', carrier: 'USPS', referenceSO: '5000010001', items: 16, shipDate: '2025-08-10', deliveryDate: '2025-08-12', status: 'Delivered', driver: 'Mark Miller', vehicleNumber: 'TRK-115', destinationAddress: '486 Juniper Way, Detroit, MI', totalValue: 24000, weight: '1600 kg' },
  { id: generateId('obd'), deliveryNumber: '80000138', customer: 'Global Exports Ltd.', carrier: 'Fast Freight Corp', referenceSO: '5000010112', items: 30, shipDate: '2025-08-17', status: 'Planned', driver: 'Nancy White', vehicleNumber: 'TRK-116', destinationAddress: '579 Cypress Ct, Philadelphia, PA', totalValue: 46000, weight: '3000 kg' },
  { id: generateId('obd'), deliveryNumber: '80000139', customer: 'Pacific Trading Co.', carrier: 'DHL', referenceSO: '5000010223', items: 22, shipDate: '2025-08-12', status: 'Picked', driver: 'Paul Anderson', vehicleNumber: 'TRK-117', destinationAddress: '682 Redwood Dr, San Francisco, CA', totalValue: 33000, weight: '2200 kg' },
  { id: generateId('obd'), deliveryNumber: '80000140', customer: 'Atlantic Imports', carrier: 'FedEx', referenceSO: '5000010334', items: 14, shipDate: '2025-08-08', deliveryDate: '2025-08-10', status: 'Delivered', driver: 'Laura Thomas', vehicleNumber: 'TRK-118', destinationAddress: '795 Sequoia St, Las Vegas, NV', totalValue: 21000, weight: '1400 kg' },
  { id: generateId('obd'), deliveryNumber: '80000141', customer: 'Northern Supplies', carrier: 'UPS', referenceSO: '5000010445', items: 48, shipDate: '2025-08-18', status: 'Planned', driver: 'Steven Jackson', vehicleNumber: 'TRK-119', destinationAddress: '908 Magnolia Blvd, Charlotte, NC', totalValue: 68000, weight: '4800 kg' },
  { id: generateId('obd'), deliveryNumber: '80000142', customer: 'Southern Distribution', carrier: 'USPS', referenceSO: '5000010556', items: 18, shipDate: '2025-08-11', status: 'Picking', driver: 'Barbara Moore', vehicleNumber: 'TRK-120', destinationAddress: '012 Dogwood Ln, Nashville, TN', totalValue: 27000, weight: '1800 kg' },
  { id: generateId('obd'), deliveryNumber: '80000143', customer: 'Acme Retail LLC', carrier: 'Express Transport', referenceSO: '5000010667', items: 35, shipDate: '2025-08-19', status: 'Planned', driver: 'Richard Martin', vehicleNumber: 'TRK-121', destinationAddress: '123 Sycamore Ave, Indianapolis, IN', totalValue: 52000, weight: '3500 kg' },
  { id: generateId('obd'), deliveryNumber: '80000144', customer: 'Globex Corp', carrier: 'Premium Delivery', referenceSO: '5000010778', items: 10, shipDate: '2025-08-09', deliveryDate: '2025-08-11', status: 'Delivered', driver: 'Betty Thompson', vehicleNumber: 'TRK-122', destinationAddress: '234 Beech Rd, Memphis, TN', totalValue: 19000, weight: '1000 kg' },
  { id: generateId('obd'), deliveryNumber: '80000145', customer: 'TechStart Inc.', carrier: 'DHL', referenceSO: '5000010889', items: 52, shipDate: '2025-08-20', status: 'Planned', driver: 'George Harris', vehicleNumber: 'TRK-123', destinationAddress: '345 Fir Way, Louisville, KY', totalValue: 78000, weight: '5200 kg' },
  { id: generateId('obd'), deliveryNumber: '80000146', customer: 'MegaMart Wholesale', carrier: 'FedEx', referenceSO: '5000010990', items: 28, shipDate: '2025-08-14', status: 'Shipped', driver: 'Helen Clark', vehicleNumber: 'TRK-124', destinationAddress: '456 Hemlock Ct, Milwaukee, WI', totalValue: 40000, weight: '2800 kg' },
  { id: generateId('obd'), deliveryNumber: '80000147', customer: 'Prime Distributors', carrier: 'UPS', referenceSO: '5000011001', items: 20, shipDate: '2025-08-10', deliveryDate: '2025-08-12', status: 'Delivered', driver: 'Edward Lewis', vehicleNumber: 'TRK-125', destinationAddress: '567 Spruce Dr, Baltimore, MD', totalValue: 30000, weight: '2000 kg' },
  { id: generateId('obd'), deliveryNumber: '80000148', customer: 'Global Exports Ltd.', carrier: 'USPS', referenceSO: '5000011112', items: 40, shipDate: '2025-08-21', status: 'Planned', driver: 'Dorothy Walker', vehicleNumber: 'TRK-126', destinationAddress: '678 Redwood St, Albuquerque, NM', totalValue: 60000, weight: '4000 kg' },
  { id: generateId('obd'), deliveryNumber: '80000149', customer: 'Pacific Trading Co.', carrier: 'Fast Freight Corp', referenceSO: '5000011223', items: 24, shipDate: '2025-08-13', status: 'Picked', driver: 'Kenneth Hall', vehicleNumber: 'TRK-127', destinationAddress: '789 Pine Ln, Tucson, AZ', totalValue: 36000, weight: '2400 kg' },
  { id: generateId('obd'), deliveryNumber: '80000150', customer: 'Atlantic Imports', carrier: 'Express Transport', referenceSO: '5000011334', items: 16, shipDate: '2025-08-08', deliveryDate: '2025-08-10', status: 'Delivered', driver: 'Carol Allen', vehicleNumber: 'TRK-128', destinationAddress: '890 Oak Way, Fresno, CA', totalValue: 24000, weight: '1600 kg' },
  { id: generateId('obd'), deliveryNumber: '80000151', customer: 'Northern Supplies', carrier: 'Premium Delivery', referenceSO: '5000011445', items: 44, shipDate: '2025-08-22', status: 'Planned', driver: 'Ronald Young', vehicleNumber: 'TRK-129', destinationAddress: '901 Maple Blvd, Sacramento, CA', totalValue: 66000, weight: '4400 kg' },
  { id: generateId('obd'), deliveryNumber: '80000152', customer: 'Southern Distribution', carrier: 'DHL', referenceSO: '5000011556', items: 26, shipDate: '2025-08-15', status: 'Shipped', driver: 'Sandra King', vehicleNumber: 'TRK-130', destinationAddress: '012 Elm Dr, Kansas City, MO', totalValue: 39000, weight: '2600 kg' },
];

const OutboundDeliveries: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<Delivery[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Delivery | null>(null);
  const [viewing, setViewing] = useState<Delivery | null>(null);

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => [
    { key: 'deliveryNumber', header: 'Delivery', sortable: true, searchable: true },
    { key: 'customer', header: 'Customer', sortable: true, searchable: true },
    { key: 'carrier', header: 'Carrier', sortable: true },
    { key: 'referenceSO', header: 'SO Ref', sortable: true },
    { key: 'items', header: 'Items', sortable: true },
    { key: 'shipDate', header: 'Ship Date', sortable: true },
    { key: 'status', header: 'Status', sortable: true, filterable: true, filterOptions: ['Open', 'Picking', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => ({ label: s, value: s })) },
  ], []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: Delivery) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: Delivery) => { setEditing(row); setOpen(true); } },
    { label: 'Post GI', icon: <CheckCircle className="h-4 w-4" />, condition: (row: Delivery) => ['Picked', 'Packed'].includes(row.status), onClick: (row: Delivery) => { const updated = { ...row, status: 'Shipped' as const }; setData(data.map(d => d.id === row.id ? updated : d)); toast({ title: 'Goods Issue Posted', description: `GI posted for ${row.deliveryNumber}` }); } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: Delivery) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: `${row.deliveryNumber} removed` }); }, variant: 'destructive' }
  ];

  const form = useForm<Delivery>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { id: '', deliveryNumber: '', customer: '', carrier: 'DHL', referenceSO: '', items: 1, shipDate: new Date().toISOString().slice(0, 10), status: 'Open', driver: '', vehicleNumber: '', destinationAddress: '', notes: '', totalValue: 0, weight: '' }
  });

  const openCreate = () => { setEditing(null); form.reset({ id: generateId('obd'), deliveryNumber: '', customer: '', carrier: 'DHL', referenceSO: '', items: 1, shipDate: new Date().toISOString().slice(0, 10), status: 'Open', driver: '', vehicleNumber: '', destinationAddress: '', notes: '', totalValue: 0, weight: '' }); setOpen(true); };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: Delivery) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'Delivery Updated' : 'Delivery Created', description: values.deliveryNumber });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Outbound Deliveries"
          description="Manage outgoing shipments and goods issue"
          voiceIntroduction="Welcome to Outbound Deliveries. Here you can manage outgoing shipments and goods issue."
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" /> Outbound Deliveries ({data.length})
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Create Delivery
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Outbound Delivery' : 'Create Outbound Delivery'}</DialogTitle>
                <DialogDescription>Enter details for the outbound delivery. All fields are required.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="deliveryNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Number</FormLabel>
                      <FormControl><Input placeholder="8000..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customer" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {customers.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="carrier" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select carrier" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {carriers.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="referenceSO" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference SO</FormLabel>
                      <FormControl><Input placeholder="5000..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="items" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Items</FormLabel>
                      <FormControl><Input type="number" min={1} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="shipDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ship Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {['Open', 'Picking', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="totalValue" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Value ($)</FormLabel>
                      <FormControl><Input type="number" min={0} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight</FormLabel>
                      <FormControl><Input placeholder="e.g. 1000 kg" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
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
          <EnhancedDataTable columns={columns} data={data as any} actions={actions as any} searchPlaceholder="Search deliveries, customers..." refreshable={true} onRefresh={refresh} exportable={true} />
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Outbound Delivery Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Number</label>
                  <p className="text-lg font-semibold">{viewing.deliveryNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p><Badge variant={viewing.status === 'Delivered' ? 'default' : viewing.status === 'Shipped' ? 'secondary' : viewing.status === 'Cancelled' ? 'destructive' : 'outline'}>{viewing.status}</Badge></p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <p>{viewing.customer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Carrier</label>
                  <p className="flex items-center"><Truck className="h-4 w-4 mr-2" />{viewing.carrier}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reference SO</label>
                  <p>{viewing.referenceSO}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Items</label>
                  <p className="flex items-center"><Package className="h-4 w-4 mr-2" />{viewing.items} items</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ship Date</label>
                  <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{viewing.shipDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Delivery Date</label>
                  <p>{viewing.deliveryDate || 'Not delivered'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Driver</label>
                  <p>{viewing.driver || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vehicle</label>
                  <p>{viewing.vehicleNumber || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Destination Address</label>
                  <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{viewing.destinationAddress || 'N/A'}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Total Value</h4>
                <p className="text-3xl font-bold text-green-600">${(viewing.totalValue || 0).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutboundDeliveries;
