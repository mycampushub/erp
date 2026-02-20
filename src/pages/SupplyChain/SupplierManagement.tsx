
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Eye, Edit, Trash2, Plus, Building2, Ban, CheckCircle2, Phone, Mail, MapPin, Star } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { useToast } from '../../hooks/use-toast';
import { generateId } from '../../lib/localCrud';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const supplierSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Name is required'),
  category: z.string().min(2, 'Category is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone required'),
  contact: z.string().min(2, 'Contact name required'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  paymentTerms: z.enum(['Immediate', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90']),
  status: z.enum(['Active', 'Blocked', 'Pending']),
  rating: z.coerce.number().min(1).max(5),
  totalOrders: z.coerce.number().min(0),
  totalValue: z.coerce.number().min(0),
  onTimeDelivery: z.coerce.number().min(0).max(100),
  qualityScore: z.coerce.number().min(0).max(100),
});

type Supplier = z.infer<typeof supplierSchema>;

const categories = ['Electronics', 'Mechanical', 'Raw Materials', 'Packaging', 'Chemicals', 'Services', 'Office Supplies', 'Automotive', 'Textiles', 'Food & Beverage'];
const countries = ['United States', 'Germany', 'China', 'Japan', 'India', 'Brazil', 'Mexico', 'United Kingdom', 'France', 'South Korea'];

const seedData: Supplier[] = [
  { id: generateId('sup'), name: 'Tech Components Inc.', category: 'Electronics', email: 'sales@techco.com', phone: '+1 222 555 1000', contact: 'Alex Reed', address: '123 Tech Blvd', city: 'San Jose', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 5, totalOrders: 245, totalValue: 1250000, onTimeDelivery: 98, qualityScore: 96 },
  { id: generateId('sup'), name: 'Industrial Parts Co.', category: 'Mechanical', email: 'info@indparts.com', phone: '+1 222 555 2000', contact: 'Maria Cruz', address: '456 Industrial Ave', city: 'Detroit', country: 'United States', paymentTerms: 'Net 15', status: 'Active', rating: 4, totalOrders: 189, totalValue: 890000, onTimeDelivery: 94, qualityScore: 91 },
  { id: generateId('sup'), name: 'Global Steel Works', category: 'Raw Materials', email: 'orders@globalsteel.com', phone: '+1 555 123 4567', contact: 'John Miller', address: '789 Steel Rd', city: 'Pittsburgh', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 5, totalOrders: 312, totalValue: 2450000, onTimeDelivery: 97, qualityScore: 99 },
  { id: generateId('sup'), name: 'Pacific Packaging Ltd.', category: 'Packaging', email: 'sales@pacificpack.com', phone: '+1 555 234 5678', contact: 'Sarah Wong', address: '321 Package Lane', city: 'Los Angeles', country: 'United States', paymentTerms: 'Net 45', status: 'Active', rating: 4, totalOrders: 156, totalValue: 340000, onTimeDelivery: 95, qualityScore: 92 },
  { id: generateId('sup'), name: 'ChemSupply GmbH', category: 'Chemicals', email: 'info@chemsupply.de', phone: '+49 30 12345678', contact: 'Hans Mueller', address: 'Industriestr. 45', city: 'Berlin', country: 'Germany', paymentTerms: 'Net 60', status: 'Active', rating: 5, totalOrders: 98, totalValue: 780000, onTimeDelivery: 99, qualityScore: 98 },
  { id: generateId('sup'), name: 'Precision Tools Asia', category: 'Mechanical', email: 'sales@precisiontools.asia', phone: '+86 21 12345678', contact: 'Wei Chen', address: '88 Tool Street', city: 'Shanghai', country: 'China', paymentTerms: 'Net 30', status: 'Active', rating: 4, totalOrders: 234, totalValue: 567000, onTimeDelivery: 93, qualityScore: 90 },
  { id: generateId('sup'), name: 'AutoParts Direct', category: 'Automotive', email: 'orders@autopartsdirect.com', phone: '+1 555 345 6789', contact: 'Mike Johnson', address: '567 Auto Dr', city: 'Chicago', country: 'United States', paymentTerms: 'Net 15', status: 'Active', rating: 4, totalOrders: 445, totalValue: 1890000, onTimeDelivery: 96, qualityScore: 94 },
  { id: generateId('sup'), name: 'EuroTextiles BV', category: 'Textiles', email: 'sales@eurotextiles.nl', phone: '+31 20 1234567', contact: 'Emma van Berg', address: 'Textielweg 12', city: 'Amsterdam', country: 'Netherlands', paymentTerms: 'Net 45', status: 'Active', rating: 3, totalOrders: 67, totalValue: 234000, onTimeDelivery: 88, qualityScore: 85 },
  { id: generateId('sup'), name: 'Office Solutions Group', category: 'Office Supplies', email: 'orders@officesol.com', phone: '+1 555 456 7890', contact: 'Lisa Brown', address: '890 Office Park', city: 'New York', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 4, totalOrders: 523, totalValue: 456000, onTimeDelivery: 97, qualityScore: 93 },
  { id: generateId('sup'), name: 'Fresh Foods Co.', category: 'Food & Beverage', email: 'sales@freshfoodsco.com', phone: '+1 555 567 8901', contact: 'Tom Harris', address: '123 Farm Road', city: 'Fresno', country: 'United States', paymentTerms: 'Net 15', status: 'Active', rating: 5, totalOrders: 678, totalValue: 1234000, onTimeDelivery: 99, qualityScore: 97 },
  { id: generateId('sup'), name: 'MetalWorks India Pvt', category: 'Raw Materials', email: 'info@metalworksindia.in', phone: '+91 22 23456789', contact: 'Raj Patel', address: '45 Industrial Area', city: 'Mumbai', country: 'India', paymentTerms: 'Net 30', status: 'Active', rating: 4, totalOrders: 145, totalValue: 890000, onTimeDelivery: 91, qualityScore: 89 },
  { id: generateId('sup'), name: 'TechVision Korea', category: 'Electronics', email: 'sales@techvision.kr', phone: '+82 2 12345678', contact: 'Min-Jun Kim', address: 'Tech Valley 101', city: 'Seoul', country: 'South Korea', paymentTerms: 'Net 45', status: 'Active', rating: 5, totalOrders: 289, totalValue: 1670000, onTimeDelivery: 98, qualityScore: 96 },
  { id: generateId('sup'), name: 'BuildRight Materials', category: 'Raw Materials', email: 'orders@buildright.com', phone: '+1 555 678 9012', contact: 'David Clark', address: '456 Construction Blvd', city: 'Dallas', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 4, totalOrders: 234, totalValue: 1560000, onTimeDelivery: 94, qualityScore: 91 },
  { id: generateId('sup'), name: 'Plastics Unlimited', category: 'Chemicals', email: 'sales@plasticsunlimited.com', phone: '+1 555 789 0123', contact: 'Amy Wilson', address: '789 Polymer Way', city: 'Houston', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 4, totalOrders: 178, totalValue: 567000, onTimeDelivery: 95, qualityScore: 92 },
  { id: generateId('sup'), name: 'Brazilian Minerals', category: 'Raw Materials', email: 'contato@bramins.com.br', phone: '+55 11 12345678', contact: 'Carlos Silva', address: 'Minerais Ave 500', city: 'Sao Paulo', country: 'Brazil', paymentTerms: 'Net 60', status: 'Active', rating: 3, totalOrders: 89, totalValue: 780000, onTimeDelivery: 86, qualityScore: 84 },
  { id: generateId('sup'), name: 'UK Electronics Ltd', category: 'Electronics', email: 'sales@ukelectronics.co.uk', phone: '+44 20 12345678', contact: 'James Wilson', address: '78 Tech Park', city: 'London', country: 'United Kingdom', paymentTerms: 'Net 30', status: 'Active', rating: 4, totalOrders: 167, totalValue: 890000, onTimeDelivery: 94, qualityScore: 93 },
  { id: generateId('sup'), name: 'Mexican Auto Parts', category: 'Automotive', email: 'ventas@mexautoparts.mx', phone: '+52 55 12345678', contact: 'Carlos Rodriguez', address: 'Auto Industrial 200', city: 'Mexico City', country: 'Mexico', paymentTerms: 'Net 30', status: 'Active', rating: 4, totalOrders: 312, totalValue: 1340000, onTimeDelivery: 95, qualityScore: 91 },
  { id: generateId('sup'), name: 'French Wines & More', category: 'Food & Beverage', email: 'contact@frenchwines.fr', phone: '+33 1 23456789', contact: 'Pierre Dubois', address: '15 Rue du Vin', city: 'Paris', country: 'France', paymentTerms: 'Net 45', status: 'Active', rating: 5, totalOrders: 45, totalValue: 234000, onTimeDelivery: 99, qualityScore: 98 },
  { id: generateId('sup'), name: 'German Precision KG', category: 'Mechanical', email: 'info@germanprecision.de', phone: '+49 89 12345678', contact: 'Klaus Schmidt', address: 'Praezision Str. 33', city: 'Munich', country: 'Germany', paymentTerms: 'Net 60', status: 'Active', rating: 5, totalOrders: 123, totalValue: 1450000, onTimeDelivery: 99, qualityScore: 99 },
  { id: generateId('sup'), name: 'Medical Supplies Inc.', category: 'Services', email: 'orders@medsupplies.com', phone: '+1 555 890 1234', contact: 'Dr. Susan White', address: '999 Health Way', city: 'Boston', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 5, totalOrders: 567, totalValue: 2890000, onTimeDelivery: 98, qualityScore: 99 },
  { id: generateId('sup'), name: 'Japan Tools Corporation', category: 'Mechanical', email: 'sales@japantools.jp', phone: '+81 3 12345678', contact: 'Takeshi Yamamoto', address: '5-2-1 Tool District', city: 'Tokyo', country: 'Japan', paymentTerms: 'Net 45', status: 'Active', rating: 5, totalOrders: 198, totalValue: 1120000, onTimeDelivery: 99, qualityScore: 97 },
  { id: generateId('sup'), name: 'Safety First Equipment', category: 'Services', email: 'orders@safetyfirst.com', phone: '+1 555 901 2345', contact: 'Bob Martinez', address: '345 Safety Lane', city: 'Denver', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 4, totalOrders: 289, totalValue: 678000, onTimeDelivery: 96, qualityScore: 95 },
  { id: generateId('sup'), name: 'SolarTech Solutions', category: 'Electronics', email: 'sales@solartech.com', phone: '+1 555 012 3456', contact: 'Jennifer Lee', address: '678 Solar Ave', city: 'Phoenix', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 4, totalOrders: 145, totalValue: 890000, onTimeDelivery: 94, qualityScore: 92 },
  { id: generateId('sup'), name: 'Cleaning Supplies Co.', category: 'Services', email: 'orders@cleaningsupplies.com', phone: '+1 555 123 4560', contact: 'Karen Taylor', address: '234 Clean Street', city: 'Atlanta', country: 'United States', paymentTerms: 'Net 15', status: 'Active', rating: 4, totalOrders: 456, totalValue: 345000, onTimeDelivery: 97, qualityScore: 94 },
  { id: generateId('sup'), name: 'Engineered Plastics AG', category: 'Chemicals', email: 'info@engplastics.ch', phone: '+41 44 1234567', contact: 'Stefan Roth', address: 'Kunststoffweg 8', city: 'Zurich', country: 'Switzerland', paymentTerms: 'Net 60', status: 'Active', rating: 5, totalOrders: 78, totalValue: 567000, onTimeDelivery: 98, qualityScore: 97 },
  { id: generateId('sup'), name: 'Australian Mining Ltd', category: 'Raw Materials', email: 'sales@ausmining.au', phone: '+61 2 12345678', contact: 'Andrew Thompson', address: 'Mine Road 100', city: 'Sydney', country: 'Australia', paymentTerms: 'Net 45', status: 'Active', rating: 4, totalOrders: 67, totalValue: 1890000, onTimeDelivery: 92, qualityScore: 90 },
  { id: generateId('sup'), name: 'PrintHub Services', category: 'Services', email: 'orders@printhub.com', phone: '+1 555 234 5670', contact: 'Rachel Green', address: '567 Print Blvd', city: 'Seattle', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 3, totalOrders: 234, totalValue: 123000, onTimeDelivery: 90, qualityScore: 87 },
  { id: generateId('sup'), name: 'Frozen Foods International', category: 'Food & Beverage', email: 'sales@ffi.com', phone: '+1 555 345 6780', contact: 'Michael Brown', address: '890 Cold Storage Rd', city: 'Miami', country: 'United States', paymentTerms: 'Net 15', status: 'Active', rating: 4, totalOrders: 567, totalValue: 2340000, onTimeDelivery: 98, qualityScore: 96 },
  { id: generateId('sup'), name: 'Italian Leather Works', category: 'Textiles', email: 'info@italianleather.it', phone: '+39 02 1234567', contact: 'Marco Rossi', address: 'Cuoio Via 45', city: 'Milan', country: 'Italy', paymentTerms: 'Net 45', status: 'Active', rating: 5, totalOrders: 56, totalValue: 345000, onTimeDelivery: 97, qualityScore: 98 },
  { id: generateId('sup'), name: 'Canadian Lumber Mills', category: 'Raw Materials', email: 'orders@canlumber.ca', phone: '+1 604 123 4567', contact: 'John MacDonald', address: 'Forest Road 250', city: 'Vancouver', country: 'Canada', paymentTerms: 'Net 30', status: 'Active', rating: 4, totalOrders: 123, totalValue: 890000, onTimeDelivery: 93, qualityScore: 91 },
  { id: generateId('sup'), name: 'Pending Suppliers Ltd', category: 'Services', email: 'contact@pendingsuppliers.com', phone: '+1 555 456 7890', contact: 'Awaiting Review', address: 'TBD', city: 'Online', country: 'United States', paymentTerms: 'Net 30', status: 'Pending', rating: 0, totalOrders: 0, totalValue: 0, onTimeDelivery: 0, qualityScore: 0 },
];

const SupplierManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<Supplier[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [viewing, setViewing] = useState<Supplier | null>(null);

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => ([
    { key: 'name', header: 'Supplier', sortable: true, searchable: true },
    { key: 'category', header: 'Category', sortable: true, searchable: true, filterable: true, filterOptions: categories.map(c => ({ label: c, value: c })) },
    { key: 'contact', header: 'Contact', sortable: true },
    { key: 'country', header: 'Country', sortable: true, filterable: true, filterOptions: countries.map(c => ({ label: c, value: c })) },
    { key: 'paymentTerms', header: 'Terms', sortable: true },
    { key: 'rating', header: 'Rating', sortable: true, render: (v: number) => <div className="flex items-center"><Star className="h-4 w-4 text-yellow-500 mr-1" />{v}</div> },
    { key: 'status', header: 'Status', sortable: true, filterable: true, filterOptions: [{ label: 'Active', value: 'Active' }, { label: 'Blocked', value: 'Blocked' }, { label: 'Pending', value: 'Pending' }] },
  ]), []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: Supplier) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: Supplier) => { setEditing(row); setOpen(true); } },
    { label: 'Activate', icon: <CheckCircle2 className="h-4 w-4" />, condition: (r: Supplier) => r.status === 'Blocked' || r.status === 'Pending', onClick: (r: Supplier) => { const updated: Supplier = { ...r, status: 'Active' }; setData(data.map(d => d.id === r.id ? updated : d)); toast({ title: 'Activated', description: r.name }); } },
    { label: 'Block', icon: <Ban className="h-4 w-4" />, condition: (r: Supplier) => r.status === 'Active', onClick: (r: Supplier) => { const updated: Supplier = { ...r, status: 'Blocked' }; setData(data.map(d => d.id === r.id ? updated : d)); toast({ title: 'Blocked', description: r.name }); } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: Supplier) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: row.name }); }, variant: 'destructive' }
  ];

  const form = useForm<Supplier>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { id: generateId('sup'), name: '', category: '', email: '', phone: '', contact: '', address: '', city: '', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 5, totalOrders: 0, totalValue: 0, onTimeDelivery: 95, qualityScore: 90 }
  });

  const openCreate = () => { 
    setEditing(null); 
    const newId = generateId('sup');
    form.reset({ id: newId, name: '', category: '', email: '', phone: '', contact: '', address: '', city: '', country: 'United States', paymentTerms: 'Net 30', status: 'Active', rating: 5, totalOrders: 0, totalValue: 0, onTimeDelivery: 95, qualityScore: 90 }); 
    setOpen(true); 
  };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: Supplier) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'Supplier Updated' : 'Supplier Created', description: values.name });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Supplier Management"
          description="Manage supplier information, contracts, and performance"
          voiceIntroduction="Welcome to Supplier Management. Here you can manage supplier information and performance."
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" /> Suppliers ({data.length})
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Create Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Supplier' : 'Create Supplier'}</DialogTitle>
                <DialogDescription>Enter supplier master data. All fields are required.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name</FormLabel>
                      <FormControl><Input placeholder="Supplier name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="contact" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl><Input placeholder="Contact name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input placeholder="+1 ..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="Street address" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input placeholder="City" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="paymentTerms" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select terms" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {['Immediate', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {['Active', 'Blocked', 'Pending'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="rating" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (1-5)</FormLabel>
                      <FormControl><Input type="number" min={1} max={5} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="onTimeDelivery" render={({ field }) => (
                    <FormItem>
                      <FormLabel>On-Time Delivery %</FormLabel>
                      <FormControl><Input type="number" min={0} max={100} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="qualityScore" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality Score %</FormLabel>
                      <FormControl><Input type="number" min={0} max={100} {...field} /></FormControl>
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
          <EnhancedDataTable columns={columns} data={data as any} actions={actions as any} searchPlaceholder="Search suppliers..." refreshable={true} onRefresh={refresh} exportable={true} />
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Supplier Name</label>
                  <p className="text-lg font-semibold">{viewing.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p><Badge variant={viewing.status === 'Active' ? 'default' : viewing.status === 'Blocked' ? 'destructive' : 'secondary'}>{viewing.status}</Badge></p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p>{viewing.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rating</label>
                  <p className="flex items-center"><Star className="h-4 w-4 text-yellow-500 mr-1" />{viewing.rating}/5</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="flex items-center"><span className="mr-2">👤</span>{viewing.contact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="flex items-center"><Mail className="h-4 w-4 mr-2" />{viewing.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="flex items-center"><Phone className="h-4 w-4 mr-2" />{viewing.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{viewing.city}, {viewing.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Terms</label>
                  <p>{viewing.paymentTerms}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{viewing.onTimeDelivery}%</p>
                    <p className="text-xs text-gray-500">On-Time Delivery</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{viewing.qualityScore}%</p>
                    <p className="text-xs text-gray-500">Quality Score</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{viewing.totalOrders}</p>
                    <p className="text-xs text-gray-500">Total Orders</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Total Value</h4>
                <p className="text-3xl font-bold text-green-600">${viewing.totalValue.toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManagement;
