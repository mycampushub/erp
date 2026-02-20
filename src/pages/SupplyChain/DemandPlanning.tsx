
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, TrendingUp, Plus, Edit, Trash2, Eye, Target } from 'lucide-react';
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

const forecastSchema = z.object({
  id: z.string().min(1),
  material: z.string().min(1, 'Material is required'),
  currentMonth: z.coerce.number().int().min(0, 'Current month required'),
  nextMonth: z.coerce.number().int().min(0, 'Next month required'),
  threeMonth: z.coerce.number().int().min(0, '3-month required'),
  accuracy: z.coerce.number().min(0).max(100, 'Accuracy 0-100'),
  trend: z.enum(['Increasing', 'Stable', 'Decreasing']),
  model: z.string().min(1, 'Model is required'),
  notes: z.string().optional(),
});

type Forecast = z.infer<typeof forecastSchema>;

const materials = ['Steel Pipes', 'Copper Wire', 'Aluminum Sheets', 'Fasteners', 'Gaskets', 'Bearings', 'Motors', 'Sensors', 'Cables', 'Connectors'];
const models = ['Moving Average', 'Exponential Smoothing', 'Seasonal ARIMA', 'Machine Learning'];

const seedData: Forecast[] = [
  { id: generateId('dp'), material: 'Steel Pipes', currentMonth: 2500, nextMonth: 2750, threeMonth: 8100, accuracy: 94, trend: 'Increasing', model: 'Machine Learning' },
  { id: generateId('dp'), material: 'Copper Wire', currentMonth: 150, nextMonth: 140, threeMonth: 420, accuracy: 89, trend: 'Stable', model: 'Exponential Smoothing' },
  { id: generateId('dp'), material: 'Aluminum Sheets', currentMonth: 800, nextMonth: 850, threeMonth: 2450, accuracy: 91, trend: 'Increasing', model: 'Machine Learning' },
  { id: generateId('dp'), material: 'Fasteners', currentMonth: 5000, nextMonth: 5200, threeMonth: 15500, accuracy: 87, trend: 'Increasing', model: 'Moving Average' },
  { id: generateId('dp'), material: 'Gaskets', currentMonth: 1200, nextMonth: 1150, threeMonth: 3400, accuracy: 92, trend: 'Stable', model: 'Seasonal ARIMA' },
  { id: generateId('dp'), material: 'Bearings', currentMonth: 350, nextMonth: 380, threeMonth: 1100, accuracy: 88, trend: 'Increasing', model: 'Exponential Smoothing' },
  { id: generateId('dp'), material: 'Motors', currentMonth: 45, nextMonth: 48, threeMonth: 140, accuracy: 95, trend: 'Increasing', model: 'Machine Learning' },
  { id: generateId('dp'), material: 'Sensors', currentMonth: 220, nextMonth: 210, threeMonth: 630, accuracy: 86, trend: 'Stable', model: 'Moving Average' },
  { id: generateId('dp'), material: 'Cables', currentMonth: 1500, nextMonth: 1450, threeMonth: 4300, accuracy: 90, trend: 'Decreasing', model: 'Exponential Smoothing' },
  { id: generateId('dp'), material: 'Connectors', currentMonth: 2800, nextMonth: 2900, threeMonth: 8600, accuracy: 93, trend: 'Increasing', model: 'Seasonal ARIMA' },
  { id: generateId('dp'), material: 'Steel Pipes', currentMonth: 2600, nextMonth: 2800, threeMonth: 8200, accuracy: 95, trend: 'Increasing', model: 'Machine Learning' },
  { id: generateId('dp'), material: 'Copper Wire', currentMonth: 155, nextMonth: 145, threeMonth: 440, accuracy: 90, trend: 'Stable', model: 'Exponential Smoothing' },
  { id: generateId('dp'), material: 'Aluminum Sheets', currentMonth: 820, nextMonth: 870, threeMonth: 2550, accuracy: 92, trend: 'Increasing', model: 'Machine Learning' },
  { id: generateId('dp'), material: 'Fasteners', currentMonth: 5100, nextMonth: 5300, threeMonth: 15800, accuracy: 88, trend: 'Increasing', model: 'Moving Average' },
  { id: generateId('dp'), material: 'Gaskets', currentMonth: 1180, nextMonth: 1130, threeMonth: 3350, accuracy: 91, trend: 'Stable', model: 'Seasonal ARIMA' },
  { id: generateId('dp'), material: 'Bearings', currentMonth: 360, nextMonth: 390, threeMonth: 1150, accuracy: 89, trend: 'Increasing', model: 'Exponential Smoothing' },
  { id: generateId('dp'), material: 'Motors', currentMonth: 46, nextMonth: 50, threeMonth: 145, accuracy: 94, trend: 'Increasing', model: 'Machine Learning' },
  { id: generateId('dp'), material: 'Sensors', currentMonth: 225, nextMonth: 215, threeMonth: 645, accuracy: 87, trend: 'Stable', model: 'Moving Average' },
  { id: generateId('dp'), material: 'Cables', currentMonth: 1480, nextMonth: 1430, threeMonth: 4250, accuracy: 89, trend: 'Decreasing', model: 'Exponential Smoothing' },
  { id: generateId('dp'), material: 'Connectors', currentMonth: 2850, nextMonth: 2950, threeMonth: 8750, accuracy: 94, trend: 'Increasing', model: 'Seasonal ARIMA' },
  { id: generateId('dp'), material: 'Steel Pipes', currentMonth: 2700, nextMonth: 2850, threeMonth: 8350, accuracy: 96, trend: 'Increasing', model: 'Machine Learning' },
  { id: generateId('dp'), material: 'Copper Wire', currentMonth: 160, nextMonth: 150, threeMonth: 450, accuracy: 91, trend: 'Stable', model: 'Exponential Smoothing' },
  { id: generateId('dp'), material: 'Aluminum Sheets', currentMonth: 840, nextMonth: 890, threeMonth: 2600, accuracy: 93, trend: 'Increasing', model: 'Machine Learning' },
  { id: generateId('dp'), material: 'Fasteners', currentMonth: 5200, nextMonth: 5400, threeMonth: 16100, accuracy: 89, trend: 'Increasing', model: 'Moving Average' },
  { id: generateId('dp'), material: 'Gaskets', currentMonth: 1160, nextMonth: 1110, threeMonth: 3300, accuracy: 90, trend: 'Stable', model: 'Seasonal ARIMA' },
  { id: generateId('dp'), material: 'Bearings', currentMonth: 370, nextMonth: 400, threeMonth: 1200, accuracy: 90, trend: 'Increasing', model: 'Exponential Smoothing' },
  { id: generateId('dp'), material: 'Motors', currentMonth: 47, nextMonth: 52, threeMonth: 150, accuracy: 96, trend: 'Increasing', model: 'Machine Learning' },
  { id: generateId('dp'), material: 'Sensors', currentMonth: 230, nextMonth: 220, threeMonth: 660, accuracy: 88, trend: 'Stable', model: 'Moving Average' },
  { id: generateId('dp'), material: 'Cables', currentMonth: 1460, nextMonth: 1410, threeMonth: 4200, accuracy: 88, trend: 'Decreasing', model: 'Exponential Smoothing' },
  { id: generateId('dp'), material: 'Connectors', currentMonth: 2900, nextMonth: 3000, threeMonth: 8900, accuracy: 95, trend: 'Increasing', model: 'Seasonal ARIMA' },
];

const DemandPlanning: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<Forecast[]>(() => seedData);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState<Forecast | null>(null);
  const [viewing, setViewing] = useState<Forecast | null>(null);

  const refresh = () => {
    setData([...data]);
  };

  const columns: EnhancedColumn[] = useMemo(() => [
    { key: 'material', header: 'Material', sortable: true, searchable: true },
    { key: 'currentMonth', header: 'Current Month', sortable: true },
    { key: 'nextMonth', header: 'Next Month', sortable: true },
    { key: 'threeMonth', header: '3-Month Forecast', sortable: true },
    { key: 'accuracy', header: 'Accuracy %', sortable: true },
    { key: 'trend', header: 'Trend', sortable: true, filterable: true, filterOptions: ['Increasing', 'Stable', 'Decreasing'].map(t => ({ label: t, value: t })) },
    { key: 'model', header: 'Model', sortable: true },
  ], []);

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: Forecast) => { setViewing(row); setViewOpen(true); } },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row: Forecast) => { setEditing(row); setOpen(true); } },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row: Forecast) => { setData(data.filter(d => d.id !== row.id)); toast({ title: 'Deleted', description: `Forecast for ${row.material} removed` }); }, variant: 'destructive' }
  ];

  const form = useForm<Forecast>({
    resolver: zodResolver(forecastSchema),
    defaultValues: { id: '', material: '', currentMonth: 0, nextMonth: 0, threeMonth: 0, accuracy: 90, trend: 'Stable', model: '', notes: '' }
  });

  const openCreate = () => { setEditing(null); form.reset({ id: generateId('dp'), material: '', currentMonth: 0, nextMonth: 0, threeMonth: 0, accuracy: 90, trend: 'Stable', model: '', notes: '' }); setOpen(true); };
  useEffect(() => { if (editing) form.reset(editing); }, [editing]);

  const onSubmit = (values: Forecast) => {
    const idx = data.findIndex(d => d.id === values.id);
    if (idx >= 0) {
      setData(data.map((d, i) => i === idx ? values : d));
    } else {
      setData([values, ...data]);
    }
    setOpen(false);
    toast({ title: editing ? 'Forecast Updated' : 'Forecast Created', description: values.material });
  };

  const avgAccuracy = data.length > 0 ? Math.round(data.reduce((sum, f) => sum + f.accuracy, 0) / data.length) : 0;
  const increasingCount = data.filter(f => f.trend === 'Increasing').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/supply-chain')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Demand Planning" description="Forecast demand, analyze trends, and optimize inventory planning" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center"><TrendingUp className="h-8 w-8 text-blue-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.length}</h3><p className="text-sm text-gray-600">Materials</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><Target className="h-8 w-8 text-green-600 mr-3"/><div><h3 className="text-2xl font-bold">{avgAccuracy}%</h3><p className="text-sm text-gray-600">Avg Accuracy</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><TrendingUp className="h-8 w-8 text-yellow-600 mr-3"/><div><h3 className="text-2xl font-bold">{increasingCount}</h3><p className="text-sm text-gray-600">Increasing</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center"><TrendingUp className="h-8 w-8 text-purple-600 mr-3"/><div><h3 className="text-2xl font-bold">{data.reduce((sum, f) => sum + f.threeMonth, 0).toLocaleString()}</h3><p className="text-sm text-gray-600">3-Month Total</p></div></div></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center"><TrendingUp className="h-5 w-5 mr-2" /> Demand Forecasts ({data.length})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Create Forecast</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit Forecast' : 'Create Forecast'}</DialogTitle></DialogHeader>
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
                  <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem><FormLabel>Forecast Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger></FormControl>
                        <SelectContent>{models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="currentMonth" render={({ field }) => (
                    <FormItem><FormLabel>Current Month</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="nextMonth" render={({ field }) => (
                    <FormItem><FormLabel>Next Month</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="threeMonth" render={({ field }) => (
                    <FormItem><FormLabel>3-Month Total</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="accuracy" render={({ field }) => (
                    <FormItem><FormLabel>Accuracy %</FormLabel><FormControl><Input type="number" min={0} max={100} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="trend" render={({ field }) => (
                    <FormItem><FormLabel>Trend</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select trend" /></SelectTrigger></FormControl>
                        <SelectContent>{['Increasing', 'Stable', 'Decreasing'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
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
          <EnhancedDataTable columns={columns} data={data as any} actions={actions as any} searchPlaceholder="Search forecasts..." refreshable={true} onRefresh={refresh} exportable={true} />
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Forecast Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-500">Material</label><p className="text-lg font-semibold">{viewing.material}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Model</label><p>{viewing.model}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Current Month</label><p>{viewing.currentMonth.toLocaleString()}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Next Month</label><p>{viewing.nextMonth.toLocaleString()}</p></div>
              <div><label className="text-sm font-medium text-gray-500">3-Month Forecast</label><p className="font-bold">{viewing.threeMonth.toLocaleString()}</p></div>
              <div><label className="text-sm font-medium text-gray-500">Accuracy</label><p className="text-green-600 font-bold">{viewing.accuracy}%</p></div>
              <div className="col-span-2"><label className="text-sm font-medium text-gray-500">Trend</label><p><Badge variant={viewing.trend === 'Increasing' ? 'default' : viewing.trend === 'Decreasing' ? 'destructive' : 'secondary'}>{viewing.trend}</Badge></p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemandPlanning;
