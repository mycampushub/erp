
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Plus, Edit, Eye, Trash2, Users, TrendingUp, Award, AlertTriangle, Save, X } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';
import SupplierCard from '../../components/procurement/SupplierCard';
import { seedProcurementData, getProcurementData, Supplier } from '../../lib/procurementData';

interface SupplierFormData {
  name: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Blocked';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  paymentTerms: string;
  currency: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  website: string;
  certifications: string[];
  notes: string;
}

const categories = [
  'IT Equipment', 'Office Supplies', 'Industrial Equipment', 'Medical Supplies',
  'Raw Materials', 'Services', 'Logistics', 'Software', 'Hardware', 'Maintenance'
];

const certificationsList = ['ISO 9001', 'ISO 14001', 'ISO 27001', 'SOC 2', 'CE Mark', 'UL Listed', 'Green Certified', 'Fair Trade'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco', 'Seattle', 'Boston', 'Atlanta', 'Denver'];

const SupplierManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('suppliers');
  const initialData = getProcurementData();
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => initialData?.suppliers || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    category: '',
    status: 'Pending',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'USA',
    taxId: '',
    paymentTerms: 'Net 30',
    currency: 'USD',
    riskLevel: 'Medium',
    website: '',
    certifications: [],
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Supplier Management. Manage vendor relationships, evaluate performance, and maintain supplier master data for optimal procurement outcomes.');
    }
  }, [isEnabled, speak]);

  const generateId = (prefix: string): string => {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      category: '',
      status: 'Pending',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'USA',
      taxId: '',
      paymentTerms: 'Net 30',
      currency: 'USD',
      riskLevel: 'Medium',
      website: '',
      certifications: [],
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      category: supplier.category,
      status: supplier.status,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      country: supplier.country,
      taxId: supplier.taxId,
      paymentTerms: supplier.paymentTerms,
      currency: supplier.currency,
      riskLevel: supplier.riskLevel,
      website: supplier.website,
      certifications: supplier.certifications,
      notes: supplier.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingSupplier) {
      const updatedSuppliers = suppliers.filter(s => s.id !== deletingSupplier.id);
      setSuppliers(updatedSuppliers);
      toast({
        title: 'Supplier Deleted',
        description: `${deletingSupplier.name} has been deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setDeletingSupplier(null);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.contactPerson || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (editingSupplier) {
      const updatedSupplier: Supplier = {
        ...editingSupplier,
        ...formData,
        rating: editingSupplier.rating,
        totalOrders: editingSupplier.totalOrders,
        totalValue: editingSupplier.totalValue,
        onTimeDelivery: editingSupplier.onTimeDelivery,
        qualityRating: editingSupplier.qualityRating,
        establishedDate: editingSupplier.establishedDate
      };
      const updatedSuppliers = suppliers.map(s => 
        s.id === editingSupplier.id ? updatedSupplier : s
      );
      setSuppliers(updatedSuppliers);
      toast({
        title: 'Supplier Updated',
        description: `${formData.name} has been updated.`,
      });
    } else {
      const newSupplier: Supplier = {
        id: generateId('sup'),
        name: formData.name,
        category: formData.category,
        status: formData.status,
        rating: 0,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        taxId: formData.taxId,
        paymentTerms: formData.paymentTerms,
        currency: formData.currency,
        totalOrders: 0,
        totalValue: 0,
        onTimeDelivery: 0,
        qualityRating: 0,
        certifications: formData.certifications,
        riskLevel: formData.riskLevel,
        establishedDate: new Date().toISOString().split('T')[0],
        website: formData.website,
        notes: formData.notes
      };
      const updatedSuppliers = [...suppliers, newSupplier];
      setSuppliers(updatedSuppliers);
      toast({
        title: 'Supplier Created',
        description: `${formData.name} has been created.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleApproveSupplier = (supplier: Supplier) => {
    const updatedSuppliers = suppliers.map(s => 
      s.id === supplier.id ? { ...s, status: 'Active' as const } : s
    );
    setSuppliers(updatedSuppliers);
    toast({
      title: 'Supplier Approved',
      description: `${supplier.name} has been approved as a supplier`,
    });
  };

  const handleSupplierView = (supplier: Supplier) => {
    navigate(`/procurement/supplier-management/${supplier.id}`);
  };

  const handleCertificationChange = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/procurement')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Supplier Management"
          description="Manage vendor relationships, evaluate performance, and maintain supplier data"
          voiceIntroduction="Welcome to Supplier Management for comprehensive vendor relationship management."
        />
      </div>

      <VoiceTrainingComponent 
        module="Supplier Management"
        topic="Vendor Relationship Management"
        examples={[
          "Managing supplier master data including qualifications, certifications, and performance metrics",
          "Evaluating vendor performance through scorecards, delivery metrics, and quality assessments",
          "Conducting supplier risk assessments and maintaining compliance with procurement policies"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <div className="text-sm text-muted-foreground">Total Suppliers</div>
            <div className="text-sm text-blue-600">Active network</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {suppliers.filter(s => s.status === 'Active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Suppliers</div>
            <div className="text-sm text-green-600">Qualified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
            <div className="text-sm text-yellow-600">Quality score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {suppliers.filter(s => s.riskLevel === 'High').length}
            </div>
            <div className="text-sm text-muted-foreground">High Risk</div>
            <div className="text-sm text-red-600">Needs attention</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Supplier Directory
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    onView={handleSupplierView}
                    onEdit={handleEdit}
                    onPerformance={() => {}}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers.filter(s => s.status === 'Active').slice(0, 10).map((supplier) => (
                  <div key={supplier.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">{supplier.name}</h4>
                      <Badge className={supplier.riskLevel === 'Low' ? 'bg-green-100 text-green-800' : 
                                      supplier.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-red-100 text-red-800'}>
                        {supplier.riskLevel} Risk
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="font-medium">{supplier.rating}/5.0</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">On-Time Delivery:</span>
                        <div className="font-medium">{supplier.onTimeDelivery}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Value:</span>
                        <div className="font-medium">${supplier.totalValue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers.filter(s => s.status === 'Pending').map((supplier) => (
                  <div key={supplier.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{supplier.name}</h4>
                        <p className="text-sm text-muted-foreground">{supplier.category}</p>
                        <p className="text-sm">Contact: {supplier.contactPerson}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(supplier)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        <Button size="sm" onClick={() => handleApproveSupplier(supplier)}>
                          <Users className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {suppliers.filter(s => s.status === 'Pending').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No pending suppliers to onboard.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.slice(0, 6).map((category) => {
                    const count = suppliers.filter(s => s.category === category).length;
                    return (
                      <div key={category} className="flex justify-between">
                        <span>{category}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Low', 'Medium', 'High'].map((risk) => {
                    const count = suppliers.filter(s => s.riskLevel === risk).length;
                    const percentage = suppliers.length > 0 ? Math.round((count / suppliers.length) * 100) : 0;
                    return (
                      <div key={risk} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{risk} Risk</span>
                          <span>{count} suppliers ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              risk === 'Low' ? 'bg-green-600' : 
                              risk === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter supplier name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Enter contact name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="supplier@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1-555-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.supplier.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="XX-XXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select value={formData.riskLevel} onValueChange={(value: any) => setFormData({ ...formData, riskLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Certifications</Label>
              <div className="flex flex-wrap gap-2">
                {certificationsList.map(cert => (
                  <Button
                    key={cert}
                    variant={formData.certifications.includes(cert) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCertificationChange(cert)}
                    type="button"
                  >
                    {cert}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {editingSupplier ? 'Update' : 'Create'} Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete supplier "{deletingSupplier?.name}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManagement;
