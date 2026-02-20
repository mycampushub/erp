
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Eye, Edit, Trash2, Factory, MapPin } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface Plant {
  id: string;
  plantCode: string;
  plantName: string;
  companyCode: string;
  country: string;
  city: string;
  address: string;
  plantCategory: string;
  language: string;
  currency: string;
  status: 'Active' | 'Inactive' | 'Planning';
}

const defaultForm: Omit<Plant, 'id' | 'plantCode'> = {
  plantName: '',
  companyCode: '1000',
  country: 'United States',
  city: '',
  address: '',
  plantCategory: 'Manufacturing',
  language: 'EN',
  currency: 'USD',
  status: 'Active',
};

const STORAGE_KEY = 'sap_plantmaster';

const defaultPlants: Plant[] = [
  { id: '1', plantCode: 'PLT-1000', plantName: 'Manufacturing Plant North', companyCode: '1000', country: 'United States', city: 'Detroit', address: '123 Industrial Blvd', plantCategory: 'Manufacturing', language: 'EN', currency: 'USD', status: 'Active' },
  { id: '2', plantCode: 'PLT-2000', plantName: 'Distribution Center West', companyCode: '1000', country: 'United States', city: 'Los Angeles', address: '456 Warehouse Way', plantCategory: 'Distribution', language: 'EN', currency: 'USD', status: 'Active' },
  { id: '3', plantCode: 'PLT-3000', plantName: 'European Manufacturing', companyCode: '2000', country: 'Germany', city: 'Munich', address: 'Industriestr. 789', plantCategory: 'Manufacturing', language: 'DE', currency: 'EUR', status: 'Planning' },
  { id: '4', plantCode: 'PLT-4000', plantName: 'Asia Pacific Hub', companyCode: '3000', country: 'Singapore', city: 'Singapore', address: '88 Tech Park', plantCategory: 'Distribution', language: 'EN', currency: 'SGD', status: 'Active' },
  { id: '5', plantCode: 'PLT-5000', plantName: 'Latin America Operations', companyCode: '4000', country: 'Brazil', city: 'Sao Paulo', address: 'Av. Paulista 1000', plantCategory: 'Manufacturing', language: 'PT', currency: 'BRL', status: 'Active' },
  { id: '6', plantCode: 'PLT-1001', plantName: 'Chicago Assembly Plant', companyCode: '1000', country: 'United States', city: 'Chicago', address: '2100 S River Ave', plantCategory: 'Manufacturing', language: 'EN', currency: 'USD', status: 'Active' },
  { id: '7', plantCode: 'PLT-1002', plantName: 'Houston Refinery', companyCode: '1000', country: 'United States', city: 'Houston', address: '1500 Refinery Rd', plantCategory: 'Production', language: 'EN', currency: 'USD', status: 'Active' },
  { id: '8', plantCode: 'PLT-2001', plantName: 'Dallas Distribution Hub', companyCode: '2000', country: 'United States', city: 'Dallas', address: '3500 Logistics Pkwy', plantCategory: 'Distribution', language: 'EN', currency: 'USD', status: 'Active' },
  { id: '9', plantCode: 'PLT-2002', plantName: 'Phoenix Warehouse', companyCode: '2000', country: 'United States', city: 'Phoenix', address: '7200 Desert Center Blvd', plantCategory: 'Distribution', language: 'EN', currency: 'USD', status: 'Active' },
  { id: '10', plantCode: 'PLT-3001', plantName: 'Stuttgart Production', companyCode: '2000', country: 'Germany', city: 'Stuttgart', address: 'Mercedesstr. 100', plantCategory: 'Manufacturing', language: 'DE', currency: 'EUR', status: 'Active' },
  { id: '11', plantCode: 'PLT-3002', plantName: 'Hamburg Port Facility', companyCode: '2000', country: 'Germany', city: 'Hamburg', address: 'Hafenstr. 50', plantCategory: 'Distribution', language: 'DE', currency: 'EUR', status: 'Active' },
  { id: '12', plantCode: 'PLT-3003', plantName: 'Berlin Innovation Center', companyCode: '2000', country: 'Germany', city: 'Berlin', address: 'Innovationsallee 25', plantCategory: 'Research', language: 'DE', currency: 'EUR', status: 'Active' },
  { id: '13', plantCode: 'PLT-4001', plantName: 'London Operations', companyCode: '3000', country: 'United Kingdom', city: 'London', address: '100 Thames Road', plantCategory: 'Distribution', language: 'EN', currency: 'GBP', status: 'Active' },
  { id: '14', plantCode: 'PLT-4002', plantName: 'Paris Manufacturing', companyCode: '3000', country: 'France', city: 'Paris', address: '50 Rue Industrielle', plantCategory: 'Manufacturing', language: 'FR', currency: 'EUR', status: 'Active' },
  { id: '15', plantCode: 'PLT-4003', plantName: 'Madrid Service Center', companyCode: '3000', country: 'Spain', city: 'Madrid', address: 'Av. Gran Via 200', plantCategory: 'Service', language: 'ES', currency: 'EUR', status: 'Active' },
  { id: '16', plantCode: 'PLT-5001', plantName: 'Tokyo Tech Factory', companyCode: '4000', country: 'Japan', city: 'Tokyo', address: '1-2-3 Shibuya', plantCategory: 'Manufacturing', language: 'JA', currency: 'JPY', status: 'Active' },
  { id: '17', plantCode: 'PLT-5002', plantName: 'Osaka Distribution', companyCode: '4000', country: 'Japan', city: 'Osaka', address: '5-6-7 Kita-ku', plantCategory: 'Distribution', language: 'JA', currency: 'JPY', status: 'Active' },
  { id: '18', plantCode: 'PLT-5003', plantName: 'Seoul Innovation Hub', companyCode: '4000', country: 'South Korea', city: 'Seoul', address: '100 Gangnam Blvd', plantCategory: 'Research', language: 'KO', currency: 'KRW', status: 'Active' },
  { id: '19', plantCode: 'PLT-6001', plantName: 'Sydney Warehouse', companyCode: '5000', country: 'Australia', city: 'Sydney', address: '200 Harbor Rd', plantCategory: 'Distribution', language: 'EN', currency: 'AUD', status: 'Active' },
  { id: '20', plantCode: 'PLT-6002', plantName: 'Melbourne Manufacturing', companyCode: '5000', country: 'Australia', city: 'Melbourne', address: '300 Industrial Ave', plantCategory: 'Manufacturing', language: 'EN', currency: 'AUD', status: 'Active' },
  { id: '21', plantCode: 'PLT-7001', plantName: 'Toronto Plant', companyCode: '6000', country: 'Canada', city: 'Toronto', address: '400 Maple Drive', plantCategory: 'Manufacturing', language: 'EN', currency: 'CAD', status: 'Active' },
  { id: '22', plantCode: 'PLT-7002', plantName: 'Montreal Distribution', companyCode: '6000', country: 'Canada', city: 'Montreal', address: '500 Rue Commerciale', plantCategory: 'Distribution', language: 'FR', currency: 'CAD', status: 'Active' },
  { id: '23', plantCode: 'PLT-8001', plantName: 'Mumbai Production', companyCode: '7000', country: 'India', city: 'Mumbai', address: '600 Andheri East', plantCategory: 'Manufacturing', language: 'HI', currency: 'INR', status: 'Active' },
  { id: '24', plantCode: 'PLT-8002', plantName: 'Bangalore Tech Center', companyCode: '7000', country: 'India', city: 'Bangalore', address: '700 IT Park Way', plantCategory: 'Research', language: 'EN', currency: 'INR', status: 'Active' },
  { id: '25', plantCode: 'PLT-9001', plantName: 'Shanghai Factory', companyCode: '8000', country: 'China', city: 'Shanghai', address: '800 Pudong Rd', plantCategory: 'Manufacturing', language: 'ZH', currency: 'CNY', status: 'Active' },
  { id: '26', plantCode: 'PLT-9002', plantName: 'Shenzhen Assembly', companyCode: '8000', country: 'China', city: 'Shenzhen', address: '900 Hi-Tech Park', plantCategory: 'Manufacturing', language: 'ZH', currency: 'CNY', status: 'Active' },
  { id: '27', plantCode: 'PLT-9003', plantName: 'Beijing R&D Center', companyCode: '8000', country: 'China', city: 'Beijing', address: '1000 Zhongguancun', plantCategory: 'Research', language: 'ZH', currency: 'CNY', status: 'Active' },
  { id: '28', plantCode: 'PLT-1003', plantName: 'Atlanta Logistics Hub', companyCode: '1000', country: 'United States', city: 'Atlanta', address: '1100 Airport Blvd', plantCategory: 'Distribution', language: 'EN', currency: 'USD', status: 'Active' },
  { id: '29', plantCode: 'PLT-1004', plantName: 'Seattle Tech Plant', companyCode: '1000', country: 'United States', city: 'Seattle', address: '1200 Pacific Hwy', plantCategory: 'Manufacturing', language: 'EN', currency: 'USD', status: 'Active' },
  { id: '30', plantCode: 'PLT-3004', plantName: 'Amsterdam EU Hub', companyCode: '2000', country: 'Netherlands', city: 'Amsterdam', address: '1300 Schipholweg', plantCategory: 'Distribution', language: 'NL', currency: 'EUR', status: 'Active' },
];

const PlantMaster: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  
  const [plants, setPlants] = useLocalStorage<Plant[]>(STORAGE_KEY, defaultPlants);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [form, setForm] = useState<Omit<Plant, 'id' | 'plantCode'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Plant Master. Create and maintain plant master data for manufacturing and distribution locations.');
    }
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingPlant(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (plant: Plant) => {
    setEditingPlant(plant);
    setForm({
      plantName: plant.plantName,
      companyCode: plant.companyCode,
      country: plant.country,
      city: plant.city,
      address: plant.address,
      plantCategory: plant.plantCategory,
      language: plant.language,
      currency: plant.currency,
      status: plant.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.plantName.trim()) {
      toast({ title: 'Validation Error', description: 'Plant name is required.', variant: 'destructive' });
      return;
    }
    if (editingPlant) {
      setPlants(prev => prev.map(p => p.id === editingPlant.id ? { ...editingPlant, ...form } : p));
      toast({ title: 'Plant Updated', description: `${form.plantName} has been updated.` });
    } else {
      const newPlant: Plant = {
        id: String(Date.now()),
        plantCode: `PLT-${String(plants.length + 1).padStart(4, '0')}`,
        ...form,
      };
      setPlants(prev => [...prev, newPlant]);
      toast({ title: 'Plant Created', description: `${form.plantName} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (plant: Plant) => {
    setPlants(prev => prev.filter(p => p.id !== plant.id));
    toast({ title: 'Plant Deleted', description: `${plant.plantName} has been removed.` });
  };

  const handleView = (plant: Plant) => {
    setSelectedPlant(plant);
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
    { key: 'plantCode', header: 'Plant Code' },
    { key: 'plantName', header: 'Plant Name' },
    { key: 'companyCode', header: 'Company Code' },
    { key: 'country', header: 'Country' },
    { key: 'city', header: 'City' },
    { key: 'plantCategory', header: 'Category' },
    { key: 'currency', header: 'Currency' },
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
      render: (_: any, row: Plant) => (
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
          title="Plant Master"
          description="Create and maintain plant master data"
          voiceIntroduction="Welcome to Plant Master."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Plants</div>
          <div className="text-2xl font-bold">{plants.length}</div>
          <div className="text-sm text-blue-600">All plant records</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Active Plants</div>
          <div className="text-2xl font-bold">{plants.filter(p => p.status === 'Active').length}</div>
          <div className="text-sm text-green-600">Currently operational</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Manufacturing</div>
          <div className="text-2xl font-bold">{plants.filter(p => p.plantCategory === 'Manufacturing').length}</div>
          <div className="text-sm text-purple-600">Production facilities</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Distribution</div>
          <div className="text-2xl font-bold">{plants.filter(p => p.plantCategory === 'Distribution').length}</div>
          <div className="text-sm text-orange-600">Warehouses & DCs</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Plant Records</h2>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plant
        </Button>
      </div>

      <Card className="p-6">
        <DataTable columns={columns} data={plants} />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlant ? 'Edit Plant' : 'Create New Plant'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plantName">Plant Name *</Label>
              <Input
                id="plantName"
                value={form.plantName}
                onChange={(e) => setForm({ ...form, plantName: e.target.value })}
                placeholder="Enter plant name"
              />
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
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                    <SelectItem value="Brazil">Brazil</SelectItem>
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
                <Label htmlFor="plantCategory">Category</Label>
                <Select value={form.plantCategory} onValueChange={(value) => setForm({ ...form, plantCategory: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Distribution">Distribution</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select value={form.language} onValueChange={(value) => setForm({ ...form, language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="DE">German</SelectItem>
                    <SelectItem value="FR">French</SelectItem>
                    <SelectItem value="JP">Japanese</SelectItem>
                    <SelectItem value="PT">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={form.currency} onValueChange={(value) => setForm({ ...form, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            <Button onClick={handleSave}>{editingPlant ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Plant Details</DialogTitle>
          </DialogHeader>
          {selectedPlant && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Plant Code:</span>
                <span className="font-medium">{selectedPlant.plantCode}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Plant Name:</span>
                <span className="font-medium">{selectedPlant.plantName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Address:</span>
                <span className="font-medium">{selectedPlant.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Country:</span>
                <span className="font-medium">{selectedPlant.country}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">City:</span>
                <span className="font-medium">{selectedPlant.city}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Company Code:</span>
                <span className="font-medium">{selectedPlant.companyCode}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{selectedPlant.plantCategory}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Currency:</span>
                <span className="font-medium">{selectedPlant.currency}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(selectedPlant.status)}>{selectedPlant.status}</Badge>
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

export default PlantMaster;
