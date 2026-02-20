
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Eye, Edit, Trash2, Users2, Briefcase } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface BusinessPartner {
  id: string;
  bpNumber: string;
  bpName: string;
  bpType: 'Organization' | 'Person';
  bpRole: string;
  country: string;
  city: string;
  address: string;
  partnerGroup: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  email?: string;
  phone?: string;
}

const defaultForm: Omit<BusinessPartner, 'id' | 'bpNumber'> = {
  bpName: '',
  bpType: 'Organization',
  bpRole: 'Customer',
  country: 'United States',
  city: '',
  address: '',
  partnerGroup: 'Enterprise',
  status: 'Active',
  email: '',
  phone: '',
};

const STORAGE_KEY = 'sap_businesspartners';

const defaultPartners: BusinessPartner[] = [
  { id: '1', bpNumber: 'BP-100001', bpName: 'Global Tech Solutions Inc.', bpType: 'Organization', bpRole: 'Customer', country: 'United States', city: 'San Francisco', address: '100 Tech Blvd', partnerGroup: 'Enterprise', status: 'Active', email: 'contact@globaltech.com', phone: '+1-555-0100' },
  { id: '2', bpNumber: 'BP-200001', bpName: 'Industrial Supplies Ltd.', bpType: 'Organization', bpRole: 'Vendor', country: 'Germany', city: 'Hamburg', address: 'Industriestr. 100', partnerGroup: 'Supplier', status: 'Active', email: 'sales@indsupplies.de', phone: '+49-40-555-0200' },
  { id: '3', bpNumber: 'BP-300001', bpName: 'John Smith Consulting', bpType: 'Person', bpRole: 'Service Provider', country: 'United Kingdom', city: 'London', address: '50 Oxford St', partnerGroup: 'Individual', status: 'Blocked', email: 'john@consulting.co.uk', phone: '+44-20-555-0300' },
  { id: '4', bpNumber: 'BP-100002', bpName: 'Euro Components GmbH', bpType: 'Organization', bpRole: 'Vendor', country: 'Germany', city: 'Munich', address: 'Technologiepark 50', partnerGroup: 'Supplier', status: 'Active', email: 'info@eucomponents.de', phone: '+49-89-555-0400' },
  { id: '5', bpNumber: 'BP-400001', bpName: 'Maria Garcia', bpType: 'Person', bpRole: 'Customer', country: 'Spain', city: 'Madrid', address: 'Gran Via 25', partnerGroup: 'Individual', status: 'Active', email: 'maria.garcia@email.es', phone: '+34-91-555-0500' },
  { id: '6', bpNumber: 'BP-100003', bpName: 'North American Logistics', bpType: 'Organization', bpRole: 'Customer', country: 'United States', city: 'Chicago', address: '500 W Madison St', partnerGroup: 'Enterprise', status: 'Active', email: 'ops@nalogistics.com', phone: '+1-312-555-0600' },
  { id: '7', bpNumber: 'BP-200002', bpName: 'Asian Electronics Corp', bpType: 'Organization', bpRole: 'Vendor', country: 'Japan', city: 'Tokyo', address: '1-1-1 Shibuya', partnerGroup: 'Strategic', status: 'Active', email: 'procurement@aelec.co.jp', phone: '+81-3-5555-0700' },
  { id: '8', bpNumber: 'BP-100004', bpName: 'Healthcare Systems Inc', bpType: 'Organization', bpRole: 'Customer', country: 'United States', city: 'Boston', address: '200 Longwood Ave', partnerGroup: 'Enterprise', status: 'Active', email: 'info@healthsys.com', phone: '+1-617-555-0800' },
  { id: '9', bpNumber: 'BP-300002', bpName: 'Sarah Johnson', bpType: 'Person', bpRole: 'Service Provider', country: 'Canada', city: 'Toronto', address: '100 King St W', partnerGroup: 'Individual', status: 'Active', email: 'sarah.j@consulting.ca', phone: '+1-416-555-0900' },
  { id: '10', bpNumber: 'BP-200003', bpName: 'Nordic Materials AB', bpType: 'Organization', bpRole: 'Vendor', country: 'Sweden', city: 'Stockholm', address: 'Sveavagen 1', partnerGroup: 'Supplier', status: 'Active', email: 'orders@nordicmat.se', phone: '+46-8-555-1000' },
  { id: '11', bpNumber: 'BP-100005', bpName: 'Retail Masters LLC', bpType: 'Organization', bpRole: 'Customer', country: 'United States', city: 'New York', address: '350 5th Ave', partnerGroup: 'Enterprise', status: 'Active', email: 'sales@retailmasters.com', phone: '+1-212-555-1100' },
  { id: '12', bpNumber: 'BP-200004', bpName: 'French Wines & Spirits', bpType: 'Organization', bpRole: 'Vendor', country: 'France', city: 'Bordeaux', address: '1 Rue du Commerce', partnerGroup: 'Supplier', status: 'Active', email: 'contact@fwines.fr', phone: '+33-5-555-1200' },
  { id: '13', bpNumber: 'BP-100006', bpName: 'Automotive Parts Co', bpType: 'Organization', bpRole: 'Customer', country: 'United States', city: 'Detroit', address: '1500 Woodward Ave', partnerGroup: 'Strategic', status: 'Active', email: 'purchasing@autoparts.com', phone: '+1-313-555-1300' },
  { id: '14', bpNumber: 'BP-300003', bpName: 'Robert Chen Consulting', bpType: 'Person', bpRole: 'Service Provider', country: 'Singapore', city: 'Singapore', address: '1 Raffles Place', partnerGroup: 'Individual', status: 'Active', email: 'robert.chen@sgc.com', phone: '+65-5555-1400' },
  { id: '15', bpNumber: 'BP-200005', bpName: 'Brazilian Coffee Exports', bpType: 'Organization', bpRole: 'Vendor', country: 'Brazil', city: 'Sao Paulo', address: 'Av Paulista 1000', partnerGroup: 'Supplier', status: 'Active', email: 'exports@brazilcoffee.br', phone: '+55-11-555-1500' },
  { id: '16', bpNumber: 'BP-100007', bpName: 'Construction Dynamics', bpType: 'Organization', bpRole: 'Customer', country: 'United States', city: 'Houston', address: '1000 Louisiana St', partnerGroup: 'Enterprise', status: 'Active', email: 'info@constructiondyn.com', phone: '+1-713-555-1600' },
  { id: '17', bpNumber: 'BP-200006', bpName: 'Swiss Precision Tools', bpType: 'Organization', bpRole: 'Vendor', country: 'Switzerland', city: 'Zurich', address: 'Bahnhofstrasse 10', partnerGroup: 'Strategic', status: 'Active', email: 'sales@swisspt.ch', phone: '+41-44-555-1700' },
  { id: '18', bpNumber: 'BP-100008', bpName: 'Education First Group', bpType: 'Organization', bpRole: 'Customer', country: 'United Kingdom', city: 'Oxford', address: '1 Oxford St', partnerGroup: 'Enterprise', status: 'Active', email: 'admissions@edufirst.co.uk', phone: '+44-18-655-1800' },
  { id: '19', bpNumber: 'BP-300004', bpName: 'Anna Mueller GmbH', bpType: 'Organization', bpRole: 'Service Provider', country: 'Germany', city: 'Berlin', address: 'Unter den Linden 50', partnerGroup: 'Individual', status: 'Active', email: 'anna@muellerconsulting.de', phone: '+49-30-555-1900' },
  { id: '20', bpNumber: 'BP-200007', bpName: 'Australian Minerals Ltd', bpType: 'Organization', bpRole: 'Vendor', country: 'Australia', city: 'Sydney', address: '100 George St', partnerGroup: 'Supplier', status: 'Active', email: 'trading@ausminerals.au', phone: '+61-2-555-2000' },
  { id: '21', bpNumber: 'BP-100009', bpName: 'Media Networks Corp', bpType: 'Organization', bpRole: 'Customer', country: 'United States', city: 'Los Angeles', address: '2000 Avenue of the Stars', partnerGroup: 'Enterprise', status: 'Active', email: 'partnerships@medianet.com', phone: '+1-310-555-2100' },
  { id: '22', bpNumber: 'BP-200008', bpName: 'Italian Leather Works', bpType: 'Organization', bpRole: 'Vendor', country: 'Italy', city: 'Milan', address: 'Via Monte Napoleone 8', partnerGroup: 'Supplier', status: 'Active', email: 'orders@itleather.it', phone: '+39-02-555-2200' },
  { id: '23', bpNumber: 'BP-100010', bpName: 'Financial Services Group', bpType: 'Organization', bpRole: 'Customer', country: 'United States', city: 'Boston', address: '100 Federal St', partnerGroup: 'Strategic', status: 'Active', email: 'clients@fsgfinancial.com', phone: '+1-617-555-2300' },
  { id: '24', bpNumber: 'BP-300005', bpName: 'David Park Industries', bpType: 'Organization', bpRole: 'Service Provider', country: 'South Korea', city: 'Seoul', address: '333 Gangnam-daero', partnerGroup: 'Individual', status: 'Active', email: 'dpark@davidpark.kr', phone: '+82-2-555-2400' },
  { id: '25', bpNumber: 'BP-200009', bpName: 'Indian Textiles International', bpType: 'Organization', bpRole: 'Vendor', country: 'India', city: 'Mumbai', address: '1 Marine Drive', partnerGroup: 'Supplier', status: 'Active', email: 'exports@indiantextiles.in', phone: '+91-22-555-2500' },
  { id: '26', bpNumber: 'BP-100011', bpName: 'Energy Solutions Inc', bpType: 'Organization', bpRole: 'Customer', country: 'United States', city: 'Houston', address: '1000 Main St', partnerGroup: 'Enterprise', status: 'Active', email: 'business@energysol.com', phone: '+1-713-555-2600' },
  { id: '27', bpNumber: 'BP-200010', bpName: 'Dutch Dairy Products', bpType: 'Organization', bpRole: 'Vendor', country: 'Netherlands', city: 'Amsterdam', address: 'Damrak 1', partnerGroup: 'Supplier', status: 'Active', email: 'orders@dutchdairy.nl', phone: '+31-20-555-2700' },
  { id: '28', bpNumber: 'BP-100012', bpName: 'Telecom Partners LLC', bpType: 'Organization', bpRole: 'Customer', country: 'United States', city: 'Dallas', address: '2000 McKinney Ave', partnerGroup: 'Enterprise', status: 'Active', email: 'sales@telecompartners.com', phone: '+1-214-555-2800' },
  { id: '29', bpNumber: 'BP-300006', bpName: 'Lisa Thompson', bpType: 'Person', bpRole: 'Service Provider', country: 'Australia', city: 'Melbourne', address: '100 Collins St', partnerGroup: 'Individual', status: 'Active', email: 'lisa.t@consulting.au', phone: '+61-3-555-2900' },
  { id: '30', bpNumber: 'BP-200011', bpName: 'Mexican Foods SA de CV', bpType: 'Organization', bpRole: 'Vendor', country: 'Mexico', city: 'Mexico City', address: 'Paseo de la Reforma 255', partnerGroup: 'Supplier', status: 'Active', email: 'export@mexfoods.mx', phone: '+52-55-555-3000' },
];

const BusinessPartner: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  
  const [businessPartners, setBusinessPartners] = useLocalStorage<BusinessPartner[]>(STORAGE_KEY, defaultPartners);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<BusinessPartner | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<BusinessPartner | null>(null);
  const [form, setForm] = useState<Omit<BusinessPartner, 'id' | 'bpNumber'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Business Partner Management. Unified business partner management for customers, vendors, and other entities.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingPartner(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (partner: BusinessPartner) => {
    setEditingPartner(partner);
    setForm({
      bpName: partner.bpName,
      bpType: partner.bpType,
      bpRole: partner.bpRole,
      country: partner.country,
      city: partner.city,
      address: partner.address,
      partnerGroup: partner.partnerGroup,
      status: partner.status,
      email: partner.email,
      phone: partner.phone,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.bpName.trim()) {
      toast({ title: 'Validation Error', description: 'Business partner name is required.', variant: 'destructive' });
      return;
    }
    if (editingPartner) {
      setBusinessPartners(prev => prev.map(p => p.id === editingPartner.id ? { ...editingPartner, ...form } : p));
      toast({ title: 'Business Partner Updated', description: `${form.bpName} has been updated.` });
    } else {
      const newPartner: BusinessPartner = {
        id: String(Date.now()),
        bpNumber: `BP-${String(businessPartners.length + 1).padStart(6, '0')}`,
        ...form,
      };
      setBusinessPartners(prev => [...prev, newPartner]);
      toast({ title: 'Business Partner Created', description: `${form.bpName} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (partner: BusinessPartner) => {
    setBusinessPartners(prev => prev.filter(p => p.id !== partner.id));
    toast({ title: 'Business Partner Deleted', description: `${partner.bpName} has been removed.` });
  };

  const handleView = (partner: BusinessPartner) => {
    setSelectedPartner(partner);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Blocked': 'bg-red-100 text-red-800',
      'Inactive': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    { key: 'bpNumber', header: 'BP Number' },
    { key: 'bpName', header: 'Business Partner Name' },
    { key: 'bpType', header: 'Type' },
    { key: 'bpRole', header: 'Role' },
    { key: 'country', header: 'Country' },
    { key: 'city', header: 'City' },
    { key: 'partnerGroup', header: 'Partner Group' },
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
      render: (_: any, row: BusinessPartner) => (
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
          title="Business Partner"
          description="Unified business partner management"
          voiceIntroduction="Welcome to Business Partner Management."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Partners</div>
          <div className="text-2xl font-bold">{businessPartners.length}</div>
          <div className="text-sm text-blue-600">All business partners</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Active Partners</div>
          <div className="text-2xl font-bold">{businessPartners.filter(p => p.status === 'Active').length}</div>
          <div className="text-sm text-green-600">Currently active</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Organizations</div>
          <div className="text-2xl font-bold">{businessPartners.filter(p => p.bpType === 'Organization').length}</div>
          <div className="text-sm text-purple-600">Corporate entities</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Individuals</div>
          <div className="text-2xl font-bold">{businessPartners.filter(p => p.bpType === 'Person').length}</div>
          <div className="text-sm text-orange-600">Individual partners</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Business Partner Records</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Business Partner
        </Button>
      </div>

      <Card className="p-6">
        <DataTable columns={columns} data={businessPartners} />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPartner ? 'Edit Business Partner' : 'Create New Business Partner'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bpName">Business Partner Name *</Label>
              <Input
                id="bpName"
                value={form.bpName}
                onChange={(e) => setForm({ ...form, bpName: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bpType">Type</Label>
                <Select value={form.bpType} onValueChange={(value: 'Organization' | 'Person') => setForm({ ...form, bpType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Organization">Organization</SelectItem>
                    <SelectItem value="Person">Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bpRole">Role</Label>
                <Select value={form.bpRole} onValueChange={(value) => setForm({ ...form, bpRole: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Vendor">Vendor</SelectItem>
                    <SelectItem value="Service Provider">Service Provider</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Select value={form.country} onValueChange={(value) => setForm({ ...form, country: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Spain">Spain</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="partnerGroup">Partner Group</Label>
                <Select value={form.partnerGroup} onValueChange={(value) => setForm({ ...form, partnerGroup: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                    <SelectItem value="Supplier">Supplier</SelectItem>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="SMB">SMB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value: 'Active' | 'Inactive' | 'Blocked') => setForm({ ...form, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1-555-0000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingPartner ? ' Update' : ' Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Business Partner Details</DialogTitle>
          </DialogHeader>
          {selectedPartner && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">BP Number:</span>
                <span className="font-medium">{selectedPartner.bpNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{selectedPartner.bpName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium">{selectedPartner.bpType}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Role:</span>
                <span className="font-medium">{selectedPartner.bpRole}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Address:</span>
                <span className="font-medium">{selectedPartner.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Country:</span>
                <span className="font-medium">{selectedPartner.country}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Partner Group:</span>
                <span className="font-medium">{selectedPartner.partnerGroup}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{selectedPartner.email || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Phone:</span>
                <span className="font-medium">{selectedPartner.phone || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedPartner.status)}>{selectedPartner.status}</Badge>
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

export default BusinessPartner;
