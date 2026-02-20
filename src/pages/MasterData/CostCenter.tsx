
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Eye, Edit, Trash2, Target, DollarSign } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface CostCenter {
  id: string;
  costCenter: string;
  description: string;
  costCenterGroup: string;
  companyCode: string;
  controllingArea: string;
  person: string;
  validFrom: string;
  status: 'Active' | 'Inactive' | 'Planning';
  budget?: number;
  actualCost?: number;
  variance?: number;
  employeeCount?: number;
  location?: string;
  currency?: string;
  validTo?: string;
}

const defaultForm: Omit<CostCenter, 'id' | 'costCenter'> = {
  description: '',
  costCenterGroup: 'Manufacturing',
  companyCode: '1000',
  controllingArea: 'A000',
  person: '',
  validFrom: new Date().toISOString().split('T')[0],
  status: 'Active',
  budget: 100000,
};

const STORAGE_KEY = 'sap_costcenters';

const defaultCostCenters: CostCenter[] = [
  { id: '1', costCenter: 'CC-1000', description: 'Production Department', costCenterGroup: 'Manufacturing', companyCode: '1000', controllingArea: 'A000', person: 'John Smith', validFrom: '2025-01-01', status: 'Active', budget: 500000, actualCost: 425000, variance: 75000, employeeCount: 45, location: 'Plant 1000', currency: 'USD', validTo: '9999-12-31' },
  { id: '2', costCenter: 'CC-2000', description: 'Sales Department', costCenterGroup: 'Sales & Marketing', companyCode: '1000', controllingArea: 'A000', person: 'Sarah Johnson', validFrom: '2025-01-01', status: 'Active', budget: 300000, actualCost: 285000, variance: 15000, employeeCount: 28, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '3', costCenter: 'CC-3000', description: 'IT Department', costCenterGroup: 'Administration', companyCode: '1000', controllingArea: 'A000', person: 'Michael Brown', validFrom: '2025-01-01', status: 'Planning', budget: 200000, actualCost: 0, variance: -200000, employeeCount: 15, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '4', costCenter: 'CC-4000', description: 'Human Resources', costCenterGroup: 'Administration', companyCode: '1000', controllingArea: 'A000', person: 'Emily Davis', validFrom: '2025-02-01', status: 'Active', budget: 150000, actualCost: 125000, variance: 25000, employeeCount: 12, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '5', costCenter: 'CC-5000', description: 'Research & Development', costCenterGroup: 'R&D', companyCode: '1000', controllingArea: 'A000', person: 'Robert Wilson', validFrom: '2025-02-15', status: 'Active', budget: 750000, actualCost: 680000, variance: 70000, employeeCount: 35, location: 'R&D Center', currency: 'USD', validTo: '9999-12-31' },
  { id: '6', costCenter: 'CC-1100', description: 'Assembly Line 1', costCenterGroup: 'Manufacturing', companyCode: '1000', controllingArea: 'A000', person: 'David Chen', validFrom: '2025-01-01', status: 'Active', budget: 350000, actualCost: 320000, variance: 30000, employeeCount: 32, location: 'Plant 1000', currency: 'USD', validTo: '9999-12-31' },
  { id: '7', costCenter: 'CC-1200', description: 'Assembly Line 2', costCenterGroup: 'Manufacturing', companyCode: '1000', controllingArea: 'A000', person: 'Lisa Wang', validFrom: '2025-01-01', status: 'Active', budget: 350000, actualCost: 310000, variance: 40000, employeeCount: 30, location: 'Plant 1000', currency: 'USD', validTo: '9999-12-31' },
  { id: '8', costCenter: 'CC-1300', description: 'Quality Control', costCenterGroup: 'Manufacturing', companyCode: '1000', controllingArea: 'A000', person: 'Thomas Mueller', validFrom: '2025-01-01', status: 'Active', budget: 180000, actualCost: 165000, variance: 15000, employeeCount: 18, location: 'Plant 1000', currency: 'USD', validTo: '9999-12-31' },
  { id: '9', costCenter: 'CC-2100', description: 'Domestic Sales', costCenterGroup: 'Sales & Marketing', companyCode: '1000', controllingArea: 'A000', person: 'Jennifer Taylor', validFrom: '2025-01-01', status: 'Active', budget: 200000, actualCost: 195000, variance: 5000, employeeCount: 15, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '10', costCenter: 'CC-2200', description: 'International Sales', costCenterGroup: 'Sales & Marketing', companyCode: '1000', controllingArea: 'A000', person: 'Maria Garcia', validFrom: '2025-01-01', status: 'Active', budget: 250000, actualCost: 230000, variance: 20000, employeeCount: 18, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '11', costCenter: 'CC-2300', description: 'Marketing', costCenterGroup: 'Sales & Marketing', companyCode: '1000', controllingArea: 'A000', person: 'Kevin O\'Brien', validFrom: '2025-01-01', status: 'Active', budget: 180000, actualCost: 175000, variance: 5000, employeeCount: 10, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '12', costCenter: 'CC-3100', description: 'IT Infrastructure', costCenterGroup: 'Administration', companyCode: '1000', controllingArea: 'A000', person: 'Alex Kim', validFrom: '2025-01-01', status: 'Active', budget: 150000, actualCost: 140000, variance: 10000, employeeCount: 8, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '13', costCenter: 'CC-3200', description: 'IT Applications', costCenterGroup: 'Administration', companyCode: '1000', controllingArea: 'A000', person: 'Priya Sharma', validFrom: '2025-01-01', status: 'Active', budget: 120000, actualCost: 110000, variance: 10000, employeeCount: 6, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '14', costCenter: 'CC-4100', description: 'Recruitment', costCenterGroup: 'Administration', companyCode: '1000', controllingArea: 'A000', person: 'Rachel Green', validFrom: '2025-01-01', status: 'Active', budget: 80000, actualCost: 75000, variance: 5000, employeeCount: 5, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '15', costCenter: 'CC-4200', description: 'Training & Development', costCenterGroup: 'Administration', companyCode: '1000', controllingArea: 'A000', person: 'James Wilson', validFrom: '2025-01-01', status: 'Active', budget: 90000, actualCost: 82000, variance: 8000, employeeCount: 4, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '16', costCenter: 'CC-5100', description: 'Product Development', costCenterGroup: 'R&D', companyCode: '1000', controllingArea: 'A000', person: 'Dr. Hans Weber', validFrom: '2025-01-01', status: 'Active', budget: 400000, actualCost: 365000, variance: 35000, employeeCount: 22, location: 'R&D Center', currency: 'USD', validTo: '9999-12-31' },
  { id: '17', costCenter: 'CC-5200', description: 'Process Innovation', costCenterGroup: 'R&D', companyCode: '1000', controllingArea: 'A000', person: 'Dr. Yuki Tanaka', validFrom: '2025-01-01', status: 'Active', budget: 280000, actualCost: 250000, variance: 30000, employeeCount: 15, location: 'R&D Center', currency: 'USD', validTo: '9999-12-31' },
  { id: '18', costCenter: 'CC-5300', description: 'Quality Assurance', costCenterGroup: 'R&D', companyCode: '1000', controllingArea: 'A000', person: 'Anna Schmidt', validFrom: '2025-01-01', status: 'Active', budget: 150000, actualCost: 135000, variance: 15000, employeeCount: 8, location: 'R&D Center', currency: 'USD', validTo: '9999-12-31' },
  { id: '19', costCenter: 'CC-6100', description: 'Finance & Accounting', costCenterGroup: 'Finance', companyCode: '1000', controllingArea: 'A000', person: 'CFO Office', validFrom: '2025-01-01', status: 'Active', budget: 220000, actualCost: 205000, variance: 15000, employeeCount: 18, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '20', costCenter: 'CC-6200', description: 'Treasury', costCenterGroup: 'Finance', companyCode: '1000', controllingArea: 'A000', person: 'Treasury Manager', validFrom: '2025-01-01', status: 'Active', budget: 80000, actualCost: 72000, variance: 8000, employeeCount: 5, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '21', costCenter: 'CC-7100', description: 'Warehouse Operations', costCenterGroup: 'Logistics', companyCode: '1000', controllingArea: 'A000', person: 'Logistics Manager', validFrom: '2025-01-01', status: 'Active', budget: 280000, actualCost: 265000, variance: 15000, employeeCount: 25, location: 'Warehouse', currency: 'USD', validTo: '9999-12-31' },
  { id: '22', costCenter: 'CC-7200', description: 'Procurement', costCenterGroup: 'Logistics', companyCode: '1000', controllingArea: 'A000', person: 'Procurement Manager', validFrom: '2025-01-01', status: 'Active', budget: 120000, actualCost: 115000, variance: 5000, employeeCount: 12, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '23', costCenter: 'CC-7300', description: 'Customer Service', costCenterGroup: 'Sales & Marketing', companyCode: '1000', controllingArea: 'A000', person: 'CS Director', validFrom: '2025-01-01', status: 'Active', budget: 180000, actualCost: 168000, variance: 12000, employeeCount: 20, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '24', costCenter: 'CC-8100', description: 'Legal & Compliance', costCenterGroup: 'Administration', companyCode: '1000', controllingArea: 'A000', person: 'General Counsel', validFrom: '2025-01-01', status: 'Active', budget: 150000, actualCost: 135000, variance: 15000, employeeCount: 8, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '25', costCenter: 'CC-8200', description: 'Facilities Management', costCenterGroup: 'Administration', companyCode: '1000', controllingArea: 'A000', person: 'Facilities Manager', validFrom: '2025-01-01', status: 'Active', budget: 200000, actualCost: 185000, variance: 15000, employeeCount: 15, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '26', costCenter: 'CC-9100', description: 'Executive Office', costCenterGroup: 'Administration', companyCode: '1000', controllingArea: 'A000', person: 'CEO Office', validFrom: '2025-01-01', status: 'Active', budget: 300000, actualCost: 275000, variance: 25000, employeeCount: 10, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '27', costCenter: 'CC-9200', description: 'Strategy & Planning', costCenterGroup: 'Administration', companyCode: '1000', controllingArea: 'A000', person: 'Chief Strategy Officer', validFrom: '2025-01-01', status: 'Active', budget: 180000, actualCost: 160000, variance: 20000, employeeCount: 8, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '28', costCenter: 'CC-9300', description: 'Business Development', costCenterGroup: 'Sales & Marketing', companyCode: '1000', controllingArea: 'A000', person: 'BD Director', validFrom: '2025-01-01', status: 'Active', budget: 220000, actualCost: 195000, variance: 25000, employeeCount: 12, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '29', costCenter: 'CC-9400', description: 'Product Management', costCenterGroup: 'Sales & Marketing', companyCode: '1000', controllingArea: 'A000', person: 'Product Director', validFrom: '2025-01-01', status: 'Active', budget: 250000, actualCost: 230000, variance: 20000, employeeCount: 14, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
  { id: '30', costCenter: 'CC-9500', description: 'Operations Excellence', costCenterGroup: 'Manufacturing', companyCode: '1000', controllingArea: 'A000', person: 'COO Office', validFrom: '2025-01-01', status: 'Active', budget: 180000, actualCost: 165000, variance: 15000, employeeCount: 10, location: 'Head Office', currency: 'USD', validTo: '9999-12-31' },
];

const CostCenter: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  
  const [costCenters, setCostCenters] = useLocalStorage<CostCenter[]>(STORAGE_KEY, defaultCostCenters);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);
  const [form, setForm] = useState<Omit<CostCenter, 'id' | 'costCenter'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Cost Center Management. Create and maintain cost center hierarchy for cost accounting.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingCostCenter(null);
    setForm({ ...defaultForm, validFrom: new Date().toISOString().split('T')[0] });
    setIsDialogOpen(true);
  };

  const openEdit = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter);
    setForm({
      description: costCenter.description,
      costCenterGroup: costCenter.costCenterGroup,
      companyCode: costCenter.companyCode,
      controllingArea: costCenter.controllingArea,
      person: costCenter.person,
      validFrom: costCenter.validFrom,
      status: costCenter.status,
      budget: costCenter.budget,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.description.trim()) {
      toast({ title: 'Validation Error', description: 'Description is required.', variant: 'destructive' });
      return;
    }
    if (editingCostCenter) {
      setCostCenters(prev => prev.map(c => c.id === editingCostCenter.id ? { ...editingCostCenter, ...form } : c));
      toast({ title: 'Cost Center Updated', description: `${form.description} has been updated.` });
    } else {
      const newCostCenter: CostCenter = {
        id: String(Date.now()),
        costCenter: `CC-${String(costCenters.length + 1).padStart(4, '0')}`,
        ...form,
      };
      setCostCenters(prev => [...prev, newCostCenter]);
      toast({ title: 'Cost Center Created', description: `${form.description} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (costCenter: CostCenter) => {
    setCostCenters(prev => prev.filter(c => c.id !== costCenter.id));
    toast({ title: 'Cost Center Deleted', description: `${costCenter.description} has been removed.` });
  };

  const handleView = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
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
    { key: 'costCenter', header: 'Cost Center' },
    { key: 'description', header: 'Description' },
    { key: 'costCenterGroup', header: 'Cost Center Group' },
    { key: 'companyCode', header: 'Company Code' },
    { key: 'controllingArea', header: 'Controlling Area' },
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
      render: (_: any, row: CostCenter) => (
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
          title="Cost Center"
          description="Create and maintain cost center hierarchy"
          voiceIntroduction="Welcome to Cost Center Management."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Cost Centers</div>
          <div className="text-2xl font-bold">{costCenters.length}</div>
          <div className="text-sm text-blue-600">All cost centers</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Active Centers</div>
          <div className="text-2xl font-bold">{costCenters.filter(c => c.status === 'Active').length}</div>
          <div className="text-sm text-green-600">Currently active</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Cost Groups</div>
          <div className="text-2xl font-bold">{new Set(costCenters.map(c => c.costCenterGroup)).size}</div>
          <div className="text-sm text-purple-600">Hierarchical groups</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Budget</div>
          <div className="text-2xl font-bold">${(costCenters.reduce((sum, c) => sum + (c.budget || 0), 0) / 1000).toFixed(0)}K</div>
          <div className="text-sm text-orange-600">Total allocated</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Cost Center Records</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Cost Center
        </Button>
      </div>

      <Card className="p-6">
        <DataTable columns={columns} data={costCenters} />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCostCenter ? 'Edit Cost Center' : 'Create New Cost Center'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter cost center description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costCenterGroup">Cost Center Group</Label>
              <Select value={form.costCenterGroup} onValueChange={(value) => setForm({ ...form, costCenterGroup: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Sales & Marketing">Sales & Marketing</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="R&D">R&D</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
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
                    <SelectItem value="A200">A200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={form.budget || ''}
                  onChange={(e) => setForm({ ...form, budget: parseInt(e.target.value) || 0 })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingCostCenter ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cost Center Details</DialogTitle>
          </DialogHeader>
          {selectedCostCenter && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Cost Center:</span>
                <span className="font-medium">{selectedCostCenter.costCenter}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Description:</span>
                <span className="font-medium">{selectedCostCenter.description}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Cost Center Group:</span>
                <span className="font-medium">{selectedCostCenter.costCenterGroup}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Company Code:</span>
                <span className="font-medium">{selectedCostCenter.companyCode}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Controlling Area:</span>
                <span className="font-medium">{selectedCostCenter.controllingArea}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Responsible Person:</span>
                <span className="font-medium">{selectedCostCenter.person}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Valid From:</span>
                <span className="font-medium">{selectedCostCenter.validFrom}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Budget:</span>
                <span className="font-medium">${(selectedCostCenter.budget || 0).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedCostCenter.status)}>{selectedCostCenter.status}</Badge>
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

export default CostCenter;
