
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Eye, Edit, Trash2, Plus, FileText, CheckCircle, XCircle } from 'lucide-react';
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

const poSchema = z.object({
  id: z.string().min(1),
  poNumber: z.string().min(3, 'PO number is required'),
  supplier: z.string().min(2, 'Supplier is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  deliveryDate: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  value: z.coerce.number().min(0, 'Value must be positive'),
  items: z.coerce.number().int().min(1, 'At least one item'),
  status: z.enum(['Draft', 'Pending Approval', 'Approved', 'Open', 'In Process', 'Delivered', 'Cancelled']),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

type PurchaseOrder = z.infer<typeof poSchema>;

const suppliers = ['Tech Components Inc.', 'Industrial Parts Co.', 'Global Steel Works', 'Pacific Packaging Ltd.', 'ChemSupply GmbH', 'Precision Tools Asia', 'AutoParts Direct', 'EuroTextiles BV', 'Office Solutions Group', 'Fresh Foods Co.'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];
const statuses = ['Draft', 'Pending Approval', 'Approved', 'Open', 'In Process', 'Delivered', 'Cancelled'];

const seedData: PurchaseOrder[] = [
  { id: generateId('po'), poNumber: '4500012765', supplier: 'Tech Components Inc.', orderDate: '2025-08-01', deliveryDate: '2025-08-15', currency: 'USD', value: 125000, items: 12, status: 'Open', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012766', supplier: 'Industrial Supplies Ltd.', orderDate: '2025-08-02', deliveryDate: '2025-08-10', currency: 'USD', value: 37850, items: 8, status: 'In Process', paymentTerms: 'Net 15' },
  { id: generateId('po'), poNumber: '4500012767', supplier: 'Global Electronics', orderDate: '2025-08-03', deliveryDate: '2025-08-18', currency: 'USD', value: 243725, items: 24, status: 'Approved', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012768', supplier: 'Office Solutions', orderDate: '2025-08-04', deliveryDate: '2025-08-08', currency: 'USD', value: 8450, items: 5, status: 'Pending Approval', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012769', supplier: 'Steel Corp Inc.', orderDate: '2025-08-05', deliveryDate: '2025-08-20', currency: 'USD', value: 189000, items: 15, status: 'Open', paymentTerms: 'Net 45' },
  { id: generateId('po'), poNumber: '4500012770', supplier: 'Copper Solutions', orderDate: '2025-08-06', deliveryDate: '2025-08-12', currency: 'USD', value: 56000, items: 10, status: 'Delivered', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012771', supplier: 'Tech Components Inc.', orderDate: '2025-07-28', deliveryDate: '2025-08-05', currency: 'USD', value: 95000, items: 18, status: 'Delivered', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012772', supplier: 'Industrial Parts Co.', orderDate: '2025-07-29', deliveryDate: '2025-08-08', currency: 'USD', value: 123000, items: 22, status: 'Delivered', paymentTerms: 'Net 15' },
  { id: generateId('po'), poNumber: '4500012773', supplier: 'Global Steel Works', orderDate: '2025-07-30', deliveryDate: '2025-08-10', currency: 'USD', value: 345000, items: 30, status: 'Delivered', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012774', supplier: 'Precision Tools Asia', orderDate: '2025-07-31', deliveryDate: '2025-08-12', currency: 'USD', value: 78000, items: 14, status: 'Delivered', paymentTerms: 'Net 45' },
  { id: generateId('po'), poNumber: '4500012775', supplier: 'AutoParts Direct', orderDate: '2025-08-07', currency: 'USD', value: 156000, items: 20, status: 'Draft', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012776', supplier: 'EuroTextiles BV', orderDate: '2025-08-08', deliveryDate: '2025-08-22', currency: 'EUR', value: 89000, items: 16, status: 'Approved', paymentTerms: 'Net 45' },
  { id: generateId('po'), poNumber: '4500012777', supplier: 'Office Solutions Group', orderDate: '2025-08-09', currency: 'USD', value: 23000, items: 8, status: 'Pending Approval', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012778', supplier: 'Fresh Foods Co.', orderDate: '2025-08-10', deliveryDate: '2025-08-12', currency: 'USD', value: 45000, items: 25, status: 'Open', paymentTerms: 'Net 15' },
  { id: generateId('po'), poNumber: '4500012779', supplier: 'ChemSupply GmbH', orderDate: '2025-08-11', deliveryDate: '2025-08-25', currency: 'EUR', value: 67000, items: 12, status: 'Approved', paymentTerms: 'Net 60' },
  { id: generateId('po'), poNumber: '4500012780', supplier: 'Pacific Packaging Ltd.', orderDate: '2025-08-12', currency: 'USD', value: 34000, items: 18, status: 'Draft', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012781', supplier: 'MetalWorks India', orderDate: '2025-07-25', deliveryDate: '2025-08-05', currency: 'USD', value: 178000, items: 28, status: 'Delivered', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012782', supplier: 'TechVision Korea', orderDate: '2025-07-26', deliveryDate: '2025-08-07', currency: 'USD', value: 234000, items: 35, status: 'Delivered', paymentTerms: 'Net 45' },
  { id: generateId('po'), poNumber: '4500012783', supplier: 'BuildRight Materials', orderDate: '2025-07-27', deliveryDate: '2025-08-06', currency: 'USD', value: 145000, items: 20, status: 'Delivered', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012784', supplier: 'Plastics Unlimited', orderDate: '2025-07-28', deliveryDate: '2025-08-04', currency: 'USD', value: 89000, items: 15, status: 'Delivered', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012785', supplier: 'UK Electronics Ltd', orderDate: '2025-08-13', currency: 'GBP', value: 78000, items: 22, status: 'Pending Approval', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012786', supplier: 'Mexican Auto Parts', orderDate: '2025-08-14', deliveryDate: '2025-08-28', currency: 'USD', value: 112000, items: 18, status: 'Approved', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012787', supplier: 'German Precision KG', orderDate: '2025-08-15', currency: 'EUR', value: 234000, items: 28, status: 'Draft', paymentTerms: 'Net 60' },
  { id: generateId('po'), poNumber: '4500012788', supplier: 'Medical Supplies Inc.', orderDate: '2025-07-20', deliveryDate: '2025-08-01', currency: 'USD', value: 567000, items: 45, status: 'Delivered', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012789', supplier: 'Japan Tools Corporation', orderDate: '2025-07-21', deliveryDate: '2025-08-03', currency: 'JPY', value: 15600000, items: 32, status: 'Delivered', paymentTerms: 'Net 45' },
  { id: generateId('po'), poNumber: '4500012790', supplier: 'Safety First Equipment', orderDate: '2025-07-22', deliveryDate: '2025-08-02', currency: 'USD', value: 89000, items: 20, status: 'Delivered', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012791', supplier: 'SolarTech Solutions', orderDate: '2025-07-23', deliveryDate: '2025-08-04', currency: 'USD', value: 345000, items: 40, status: 'Delivered', paymentTerms: 'Net 30' },
  { id: generateId('po'), poNumber: '4500012792', supplier: 'Cleaning Supplies Co.', orderDate: '2025-07-24', deliveryDate: '2025-08-01', currency: 'USD', value: 23000, items: 12, status: 'Delivered', paymentTerms: 'Net 15' },
  { id: generateId('po'), poNumber: '4500012793', supplier: 'Engineered Plastics AG', orderDate: '2025-08-16', currency: 'CHF', value: 67000, items: 14, status: 'Pending Approval', paymentTerms: 'Net 60' },
  { id: generateId('po'), poNumber: '4500012794', supplier: 'Canadian Lumber Mills', orderDate: '2025-08-17', currency: 'USD', value: 98000, items: 25, status: 'Approved', paymentTerms: 'Net 30' },
];

const PurchaseOrders: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<PurchaseOrder[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [viewing, setViewing] = useState<PurchaseOrder | null>(null);

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => [
    { key: 'poNumber', header: 'PO Number', sortable: true, searchable: true },
    { key: 'supplier', header: 'Supplier', sortable: true, searchable: true },
    { key: 'orderDate', header: 'Order Date', sortable: true },
    { key: 'deliveryDate', header: 'Delivery Date', sortable: true },
    { key: 'value', header: 'Value', sortable: true },
    { key: 'items', header: 'Items', sortable: true },
    { key: 'status', header: 'Status', sortable: true, filterable: true, filterOptions: statuses.map(s => ({ label: s, value: s })) },
  ], []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: PurchaseOrder) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: PurchaseOrder) => { setEditing(row); setOpen(true); } },
    { label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, condition: (row: PurchaseOrder) => row.status === 'Pending Approval', onClick: (row: PurchaseOrder) => { const updated = { ...row, status: 'Approved' as const }; setData(data.map(d => d.id === row.id ? updated : d)); toast({ title: 'Approved', description: `PO ${row.poNumber} approved` }); } },
    { label: 'Reject', icon: <XCircle className="h-4 w-4" />, condition: (row: PurchaseOrder) => row.status === 'Pending Approval', onClick: (row: PurchaseOrder) => { const updated = { ...row, status: 'Cancelled' as const }; setData(data.map(d => d.id === row.id ? updated : d)); toast({ title: 'Cancelled', description: `PO ${row.poNumber} rejected` }); } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: PurchaseOrder) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: `PO ${row.poNumber} removed` }); }, variant: 'destructive' }
  ];

  const form = useForm<PurchaseOrder>({
    resolver: zodResolver(poSchema),
    defaultValues: { id: '', poNumber: '', supplier: '', orderDate: new Date().toISOString().slice(0, 10), currency: 'USD', value: 0, items: 1, status: 'Draft', paymentTerms: 'Net 30', notes: '' }
  });

  const openCreate = () => { setEditing(null); form.reset({ id: generateId('po'), poNumber: '', supplier: '', orderDate: new Date().toISOString().slice(0, 10), currency: 'USD', value: 0, items: 1, status: 'Draft', paymentTerms: 'Net 30', notes: '' }); setOpen(true); };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: PurchaseOrder) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'PO Updated' : 'PO Created', description: values.poNumber });
  };

  const totalValue = data.reduce((sum, o) => sum + o.value, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Purchase Orders"
          description="Create and manage purchase orders for goods and services"
          voiceIntroduction="Welcome to Purchase Orders. Here you can create and manage your purchase orders."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center"><FileText className="h-8 w-8 text-blue-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.length}</h3><p className="text-sm text-gray-600">Total POs</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><CheckCircle className="h-8 w-8 text-green-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.filter(o => o.status === 'Open' || o.status === 'In Process').length}</h3><p className="text-sm text-gray-600">Open POs</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><XCircle className="h-8 w-8 text-orange-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.filter(o => o.status === 'Pending Approval').length}</h3><p className="text-sm text-gray-600">Pending Approval</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><FileText className="h-8 w-8 text-purple-600 mr-3"/><div><h3 className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</h3><p className="text-sm text-gray-600">Total Value</p></div></div></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center"><FileText className="h-5 w-5 mr-2" /> Purchase Orders ({data.length})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Create PO</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Purchase Order' : 'Create Purchase Order'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="poNumber" render={({ field }) => (
                    <FormItem><FormLabel>PO Number</FormLabel><FormControl><Input placeholder="4500..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="supplier" render={({ field }) => (
                    <FormItem><FormLabel>Supplier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger></FormControl>
                        <SelectContent>{suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="orderDate" render={({ field }) => (
                    <FormItem><FormLabel>Order Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="deliveryDate" render={({ field }) => (
                    <FormItem><FormLabel>Delivery Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
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
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="paymentTerms" render={({ field }) => (
                    <FormItem><FormLabel>Payment Terms</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select terms" /></SelectTrigger></FormControl>
                        <SelectContent>{['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Immediate'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
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
          <EnhancedDataTable columns={columns} data={data as any} actions={actions as any} searchPlaceholder="Search POs..." refreshable={true} onRefresh={refresh} exportable={true} />
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Purchase Order Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-500">PO Number</label><p className="text-lg font-semibold">{viewing.poNumber}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Status</label><p><Badge variant={viewing.status === 'Delivered' ? 'default' : viewing.status === 'Approved' || viewing.status === 'Open' ? 'secondary' : viewing.status === 'Cancelled' ? 'destructive' : 'outline'}>{viewing.status}</Badge></p></div>
              <div><label className="text-sm font-medium text-gray-500">Supplier</label><p>{viewing.supplier}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Payment Terms</label><p>{viewing.paymentTerms || 'N/A'}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Order Date</label><p>{viewing.orderDate}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Delivery Date</label><p>{viewing.deliveryDate || 'TBD'}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Items</label><p>{viewing.items}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Value</label><p className="font-bold text-green-600">{viewing.currency} {viewing.value.toLocaleString()}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;
