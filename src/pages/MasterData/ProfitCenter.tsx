
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Eye, Edit, Trash2, TrendingUp, PieChart } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface ProfitCenter {
  id: string;
  profitCenter: string;
  description: string;
  controllingArea: string;
  companyCode: string;
  segment: string;
  currency: string;
  person: string;
  validFrom: string;
  status: 'Active' | 'Inactive' | 'Planning';
  revenue?: number;
  profit?: number;
  cost?: number;
  profitMargin?: number;
  targetRevenue?: number;
  actualCost?: number;
}

const defaultForm: Omit<ProfitCenter, 'id' | 'profitCenter'> = {
  description: '',
  controllingArea: 'A000',
  companyCode: '1000',
  segment: 'Manufacturing',
  currency: 'USD',
  person: '',
  validFrom: new Date().toISOString().split('T')[0],
  status: 'Active',
  revenue: 0,
};

const STORAGE_KEY = 'sap_profitcenters';

const defaultProfitCenters: ProfitCenter[] = [
  { id: '1', profitCenter: 'PC-1000', description: 'North America Division', controllingArea: 'A000', companyCode: '1000', segment: 'Manufacturing', currency: 'USD', person: 'Alice Wilson', validFrom: '2025-01-01', status: 'Active', revenue: 15000000, profit: 2250000, cost: 12750000, profitMargin: 15, targetRevenue: 18000000, actualCost: 11000000 },
  { id: '2', profitCenter: 'PC-2000', description: 'Europe Division', controllingArea: 'A000', companyCode: '2000', segment: 'Sales', currency: 'EUR', person: 'Hans Mueller', validFrom: '2025-01-01', status: 'Active', revenue: 12000000, profit: 1800000, cost: 10200000, profitMargin: 15, targetRevenue: 14000000, actualCost: 9500000 },
  { id: '3', profitCenter: 'PC-3000', description: 'Asia Pacific Division', controllingArea: 'A000', companyCode: '3000', segment: 'Services', currency: 'JPY', person: 'Yuki Tanaka', validFrom: '2025-01-01', status: 'Planning', revenue: 0, profit: 0, cost: 0, profitMargin: 0, targetRevenue: 8000000, actualCost: 0 },
  { id: '4', profitCenter: 'PC-4000', description: 'Latin America Division', controllingArea: 'A000', companyCode: '4000', segment: 'Trading', currency: 'USD', person: 'Maria Garcia', validFrom: '2025-03-01', status: 'Active', revenue: 5000000, profit: 650000, cost: 4350000, profitMargin: 13, targetRevenue: 6000000, actualCost: 4200000 },
  { id: '5', profitCenter: 'PC-1100', description: 'US Manufacturing East', controllingArea: 'A000', companyCode: '1000', segment: 'Manufacturing', currency: 'USD', person: 'Robert Chen', validFrom: '2025-01-01', status: 'Active', revenue: 8500000, profit: 1275000, cost: 7225000, profitMargin: 15, targetRevenue: 10000000, actualCost: 6800000 },
  { id: '6', profitCenter: 'PC-1200', description: 'US Manufacturing West', controllingArea: 'A000', companyCode: '1000', segment: 'Manufacturing', currency: 'USD', person: 'Sarah Johnson', validFrom: '2025-01-01', status: 'Active', revenue: 6500000, profit: 975000, cost: 5525000, profitMargin: 15, targetRevenue: 8000000, actualCost: 5200000 },
  { id: '7', profitCenter: 'PC-2100', description: 'Germany Operations', controllingArea: 'A000', companyCode: '2000', segment: 'Manufacturing', currency: 'EUR', person: 'Klaus Weber', validFrom: '2025-01-01', status: 'Active', revenue: 7200000, profit: 1080000, cost: 6120000, profitMargin: 15, targetRevenue: 8500000, actualCost: 5800000 },
  { id: '8', profitCenter: 'PC-2200', description: 'UK Operations', controllingArea: 'A000', companyCode: '2000', segment: 'Sales', currency: 'GBP', person: 'James Brown', validFrom: '2025-01-01', status: 'Active', revenue: 4800000, profit: 720000, cost: 4080000, profitMargin: 15, targetRevenue: 5500000, actualCost: 3900000 },
  { id: '9', profitCenter: 'PC-3100', description: 'Japan Operations', controllingArea: 'A000', companyCode: '3000', segment: 'Technology', currency: 'JPY', person: 'Takeshi Yamamoto', validFrom: '2025-01-01', status: 'Active', revenue: 950000000, profit: 142500000, cost: 807500000, profitMargin: 15, targetRevenue: 1100000000, actualCost: 750000000 },
  { id: '10', profitCenter: 'PC-3200', description: 'Singapore Hub', controllingArea: 'A000', companyCode: '3000', segment: 'Services', currency: 'SGD', person: 'Wei Lin', validFrom: '2025-01-01', status: 'Active', revenue: 4200000, profit: 630000, cost: 3570000, profitMargin: 15, targetRevenue: 5000000, actualCost: 3400000 },
  { id: '11', profitCenter: 'PC-4100', description: 'Mexico Operations', controllingArea: 'A000', companyCode: '4000', segment: 'Manufacturing', currency: 'MXN', person: 'Carlos Rodriguez', validFrom: '2025-01-01', status: 'Active', revenue: 28000000, profit: 4200000, cost: 23800000, profitMargin: 15, targetRevenue: 32000000, actualCost: 23000000 },
  { id: '12', profitCenter: 'PC-4200', description: 'Brazil Operations', controllingArea: 'A000', companyCode: '4000', segment: 'Trading', currency: 'BRL', person: 'Ana Paula Silva', validFrom: '2025-01-01', status: 'Active', revenue: 18000000, profit: 2700000, cost: 15300000, profitMargin: 15, targetRevenue: 22000000, actualCost: 14500000 },
  { id: '13', profitCenter: 'PC-5100', description: 'Australia Division', controllingArea: 'A000', companyCode: '5000', segment: 'Sales', currency: 'AUD', person: 'David Williams', validFrom: '2025-01-01', status: 'Active', revenue: 3800000, profit: 570000, cost: 3230000, profitMargin: 15, targetRevenue: 4500000, actualCost: 3100000 },
  { id: '14', profitCenter: 'PC-5200', description: 'India Operations', controllingArea: 'A000', companyCode: '5000', segment: 'Services', currency: 'INR', person: 'Raj Patel', validFrom: '2025-01-01', status: 'Active', revenue: 220000000, profit: 33000000, cost: 187000000, profitMargin: 15, targetRevenue: 280000000, actualCost: 175000000 },
  { id: '15', profitCenter: 'PC-5300', description: 'Middle East Hub', controllingArea: 'A000', companyCode: '5000', segment: 'Trading', currency: 'AED', person: 'Ahmed Al-Rashid', validFrom: '2025-01-01', status: 'Active', revenue: 5500000, profit: 825000, cost: 4675000, profitMargin: 15, targetRevenue: 6500000, actualCost: 4500000 },
  { id: '16', profitCenter: 'PC-6100', description: 'Canada Division', controllingArea: 'A000', companyCode: '1000', segment: 'Manufacturing', currency: 'CAD', person: 'Kevin Thompson', validFrom: '2025-01-01', status: 'Active', revenue: 4200000, profit: 630000, cost: 3570000, profitMargin: 15, targetRevenue: 5000000, actualCost: 3400000 },
  { id: '17', profitCenter: 'PC-6200', description: 'France Operations', controllingArea: 'A000', companyCode: '2000', segment: 'Sales', currency: 'EUR', person: 'Pierre Dubois', validFrom: '2025-01-01', status: 'Active', revenue: 3500000, profit: 525000, cost: 2975000, profitMargin: 15, targetRevenue: 4200000, actualCost: 2850000 },
  { id: '18', profitCenter: 'PC-6300', description: 'China Operations', controllingArea: 'A000', companyCode: '3000', segment: 'Manufacturing', currency: 'CNY', person: 'Wei Zhang', validFrom: '2025-01-01', status: 'Active', revenue: 28000000, profit: 4200000, cost: 23800000, profitMargin: 15, targetRevenue: 35000000, actualCost: 22000000 },
  { id: '19', profitCenter: 'PC-6400', description: 'South Korea Division', controllingArea: 'A000', companyCode: '3000', segment: 'Technology', currency: 'KRW', person: 'Kim Ji-Young', validFrom: '2025-01-01', status: 'Active', revenue: 6800000000, profit: 1020000000, cost: 5780000000, profitMargin: 15, targetRevenue: 8000000000, actualCost: 5500000000 },
  { id: '20', profitCenter: 'PC-7100', description: 'Switzerland Operations', controllingArea: 'A000', companyCode: '2000', segment: 'Services', currency: 'CHF', person: 'Hans Mueller', validFrom: '2025-01-01', status: 'Active', revenue: 2800000, profit: 420000, cost: 2380000, profitMargin: 15, targetRevenue: 3200000, actualCost: 2300000 },
  { id: '21', profitCenter: 'PC-7200', description: 'Netherlands Hub', controllingArea: 'A000', companyCode: '2000', segment: 'Logistics', currency: 'EUR', person: 'van der Berg', validFrom: '2025-01-01', status: 'Active', revenue: 3200000, profit: 480000, cost: 2720000, profitMargin: 15, targetRevenue: 3800000, actualCost: 2600000 },
  { id: '22', profitCenter: 'PC-7300', description: 'Sweden Operations', controllingArea: 'A000', companyCode: '2000', segment: 'Manufacturing', currency: 'SEK', person: 'Erik Johansson', validFrom: '2025-01-01', status: 'Active', revenue: 25000000, profit: 3750000, cost: 21250000, profitMargin: 15, targetRevenue: 30000000, actualCost: 20000000 },
  { id: '23', profitCenter: 'PC-8100', description: 'Poland Operations', controllingArea: 'A000', companyCode: '2000', segment: 'Manufacturing', currency: 'PLN', person: 'Tomasz Kowalski', validFrom: '2025-01-01', status: 'Active', revenue: 18000000, profit: 2700000, cost: 15300000, profitMargin: 15, targetRevenue: 22000000, actualCost: 14500000 },
  { id: '24', profitCenter: 'PC-8200', description: 'Turkey Division', controllingArea: 'A000', companyCode: '2000', segment: 'Trading', currency: 'TRY', person: 'Ayse Yilmaz', validFrom: '2025-01-01', status: 'Active', revenue: 15000000, profit: 2250000, cost: 12750000, profitMargin: 15, targetRevenue: 18000000, actualCost: 12000000 },
  { id: '25', profitCenter: 'PC-9100', description: 'Africa Operations', controllingArea: 'A000', companyCode: '5000', segment: 'Services', currency: 'ZAR', person: 'Thabo Molefe', validFrom: '2025-01-01', status: 'Active', revenue: 8500000, profit: 1275000, cost: 7225000, profitMargin: 15, targetRevenue: 10000000, actualCost: 7000000 },
  { id: '26', profitCenter: 'PC-9200', description: 'Spain Operations', controllingArea: 'A000', companyCode: '2000', segment: 'Sales', currency: 'EUR', person: 'Carlos Garcia', validFrom: '2025-01-01', status: 'Active', revenue: 2400000, profit: 360000, cost: 2040000, profitMargin: 15, targetRevenue: 2800000, actualCost: 1950000 },
  { id: '27', profitCenter: 'PC-9300', description: 'Italy Division', controllingArea: 'A000', companyCode: '2000', segment: 'Manufacturing', currency: 'EUR', person: 'Marco Rossi', validFrom: '2025-01-01', status: 'Active', revenue: 2900000, profit: 435000, cost: 2465000, profitMargin: 15, targetRevenue: 3500000, actualCost: 2350000 },
  { id: '28', profitCenter: 'PC-9400', description: 'Norway Operations', controllingArea: 'A000', companyCode: '2000', segment: 'Services', currency: 'NOK', person: 'Lars Andersen', validFrom: '2025-01-01', status: 'Active', revenue: 18000000, profit: 2700000, cost: 15300000, profitMargin: 15, targetRevenue: 22000000, actualCost: 14500000 },
  { id: '29', profitCenter: 'PC-9500', description: 'Denmark Hub', controllingArea: 'A000', companyCode: '2000', segment: 'Logistics', currency: 'DKK', person: 'Erik Nielsen', validFrom: '2025-01-01', status: 'Active', revenue: 15000000, profit: 2250000, cost: 12750000, profitMargin: 15, targetRevenue: 18000000, actualCost: 12000000 },
  { id: '30', profitCenter: 'PC-9600', description: 'New Zealand Operations', controllingArea: 'A000', companyCode: '5000', segment: 'Trading', currency: 'NZD', person: 'William Taylor', validFrom: '2025-01-01', status: 'Active', revenue: 2800000, profit: 420000, cost: 2380000, profitMargin: 15, targetRevenue: 3200000, actualCost: 2300000 },
];

const ProfitCenter: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  
  const [profitCenters, setProfitCenters] = useLocalStorage<ProfitCenter[]>(STORAGE_KEY, defaultProfitCenters);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingProfitCenter, setEditingProfitCenter] = useState<ProfitCenter | null>(null);
  const [selectedProfitCenter, setSelectedProfitCenter] = useState<ProfitCenter | null>(null);
  const [form, setForm] = useState<Omit<ProfitCenter, 'id' | 'profitCenter'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Profit Center Management. Define profit center structure and responsibility for profitability analysis.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingProfitCenter(null);
    setForm({ ...defaultForm, validFrom: new Date().toISOString().split('T')[0] });
    setIsDialogOpen(true);
  };

  const openEdit = (profitCenter: ProfitCenter) => {
    setEditingProfitCenter(profitCenter);
    setForm({
      description: profitCenter.description,
      controllingArea: profitCenter.controllingArea,
      companyCode: profitCenter.companyCode,
      segment: profitCenter.segment,
      currency: profitCenter.currency,
      person: profitCenter.person,
      validFrom: profitCenter.validFrom,
      status: profitCenter.status,
      revenue: profitCenter.revenue,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.description.trim()) {
      toast({ title: 'Validation Error', description: 'Description is required.', variant: 'destructive' });
      return;
    }
    if (editingProfitCenter) {
      setProfitCenters(prev => prev.map(p => p.id === editingProfitCenter.id ? { ...editingProfitCenter, ...form } : p));
      toast({ title: 'Profit Center Updated', description: `${form.description} has been updated.` });
    } else {
      const newProfitCenter: ProfitCenter = {
        id: String(Date.now()),
        profitCenter: `PC-${String(profitCenters.length + 1).padStart(4, '0')}`,
        ...form,
      };
      setProfitCenters(prev => [...prev, newProfitCenter]);
      toast({ title: 'Profit Center Created', description: `${form.description} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (profitCenter: ProfitCenter) => {
    setProfitCenters(prev => prev.filter(p => p.id !== profitCenter.id));
    toast({ title: 'Profit Center Deleted', description: `${profitCenter.description} has been removed.` });
  };

  const handleView = (profitCenter: ProfitCenter) => {
    setSelectedProfitCenter(profitCenter);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Planning': 'bg-blue-100 text-blue-800',
      'Inactive': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'profitCenter', header: 'Profit Center' },
    { key: 'description', header: 'Description' },
    { key: 'controllingArea', header: 'Controlling Area' },
    { key: 'companyCode', header: 'Company Code' },
    { key: 'segment', header: 'Segment' },
    { key: 'currency', header: 'Currency' },
    { key: 'person', header: 'Responsible Person' },
    { key: 'validFrom', header: 'Valid From' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: ProfitCenter) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/master-data')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Profit Center"
          description="Define profit center structure and responsibility"
          voiceIntroduction="Welcome to Profit Center Management."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Profit Centers</div>
          <div className="text-2xl font-bold">{profitCenters.length}</div>
          <div className="text-sm text-blue-600">All profit centers</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Active Centers</div>
          <div className="text-2xl font-bold">{profitCenters.filter(p => p.status === 'Active').length}</div>
          <div className="text-sm text-green-600">Currently active</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">${(profitCenters.reduce((sum, p) => sum + (p.revenue || 0), 0) / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-green-600">This quarter</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Segments</div>
          <div className="text-2xl font-bold">{new Set(profitCenters.map(p => p.segment)).size}</div>
          <div className="text-sm text-purple-600">Business segments</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Profit Center Records</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Profit Center
        </Button>
      </div>

      <Card className="p-6">
        <DataTable columns={columns} data={profitCenters} />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProfitCenter ? 'Edit Profit Center' : 'Create New Profit Center'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter profit center description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="segment">Segment</Label>
              <Select value={form.segment} onValueChange={(value) => setForm({ ...form, segment: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Trading">Trading</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="R&D">R&D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="companyCode">Company Code</Label>
                <Select value={form.companyCode} onValueChange={(value) => setForm({ ...form, companyCode: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1000</SelectItem>
                    <SelectItem value="2000">2000</SelectItem>
                    <SelectItem value="3000">3000</SelectItem>
                    <SelectItem value="4000">4000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="controllingArea">Controlling Area</Label>
                <Select value={form.controllingArea} onValueChange={(value) => setForm({ ...form, controllingArea: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A000">A000</SelectItem>
                    <SelectItem value="A100">A100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={form.currency} onValueChange={(value) => setForm({ ...form, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="person">Responsible Person</Label>
              <Input
                id="person"
                value={form.person}
                onChange={(e) => setForm({ ...form, person: e.target.value })}
                placeholder="Enter person name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(value: 'Active' | 'Inactive' | 'Planning') => setForm({ ...form, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingProfitCenter ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profit Center Details</DialogTitle>
          </DialogHeader>
          {selectedProfitCenter && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Profit Center:</span>
                <span className="font-medium">{selectedProfitCenter.profitCenter}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Description:</span>
                <span className="font-medium">{selectedProfitCenter.description}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Segment:</span>
                <span className="font-medium">{selectedProfitCenter.segment}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Company Code:</span>
                <span className="font-medium">{selectedProfitCenter.companyCode}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Currency:</span>
                <span className="font-medium">{selectedProfitCenter.currency}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Responsible Person:</span>
                <span className="font-medium">{selectedProfitCenter.person}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Valid From:</span>
                <span className="font-medium">{selectedProfitCenter.validFrom}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedProfitCenter.status)}>{selectedProfitCenter.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfitCenter;
