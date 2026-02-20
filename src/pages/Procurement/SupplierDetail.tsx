
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Edit, Star, Phone, Mail, MapPin, Award, TrendingUp, Save, X, Trash2, Plus } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useToast } from '../../hooks/use-toast';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { seedProcurementData, getProcurementData, Supplier } from '../../lib/procurementData';

const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco', 'Seattle', 'Boston', 'Atlanta', 'Denver'];
const certificationsList = ['ISO 9001', 'ISO 14001', 'ISO 27001', 'SOC 2', 'CE Mark', 'UL Listed', 'Green Certified', 'Fair Trade'];

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

const SupplierDetail: React.FC = () => {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('overview');
  const initialData = getProcurementData();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => initialData?.suppliers || []);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    category: '',
    status: 'Active',
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
      speak('Welcome to Supplier Detail view. Here you can see comprehensive information about the selected supplier.');
    }
  }, [isEnabled, speak]);

  useEffect(() => {
    const data = getProcurementData();
    if (data) {
      setSuppliers(data.suppliers);
      const foundSupplier = data.suppliers.find((s: Supplier) => s.id === supplierId);
      if (foundSupplier) {
        setSupplier(foundSupplier);
        setFormData({
          name: foundSupplier.name,
          category: foundSupplier.category,
          status: foundSupplier.status,
          contactPerson: foundSupplier.contactPerson,
          email: foundSupplier.email,
          phone: foundSupplier.phone,
          address: foundSupplier.address,
          city: foundSupplier.city,
          country: foundSupplier.country,
          taxId: foundSupplier.taxId,
          paymentTerms: foundSupplier.paymentTerms,
          currency: foundSupplier.currency,
          riskLevel: foundSupplier.riskLevel,
          website: foundSupplier.website,
          certifications: foundSupplier.certifications,
          notes: foundSupplier.notes || ''
        });
      }
    }
  }, [supplierId]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!supplier || !formData.name || !formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const updatedSupplier: Supplier = {
      ...supplier,
      name: formData.name,
      category: formData.category,
      status: formData.status,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      taxId: formData.taxId,
      paymentTerms: formData.paymentTerms,
      currency: formData.currency,
      riskLevel: formData.riskLevel,
      website: formData.website,
      certifications: formData.certifications,
      notes: formData.notes
    };

    const updatedSuppliers = suppliers.map(s => 
      s.id === supplier.id ? updatedSupplier : s
    );
    setSupplier(updatedSupplier);
    setSuppliers(updatedSuppliers);
    
    toast({
      title: 'Supplier Updated',
      description: `${formData.name} has been updated successfully.`,
    });
    
    setIsEditDialogOpen(false);
  };

  const handleCertificationChange = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Blocked': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    };
    return colors[risk] || 'bg-gray-100 text-gray-800';
  };

  const performanceData = [
    { month: 'Jan', orders: 8, value: 45000, onTime: 94 },
    { month: 'Feb', orders: 6, value: 38000, onTime: 96 },
    { month: 'Mar', orders: 7, value: 42000, onTime: 95 },
    { month: 'Apr', orders: 9, value: 52000, onTime: 97 },
    { month: 'May', orders: 8, value: 48000, onTime: 93 },
    { month: 'Jun', orders: 7, value: 50000, onTime: 98 }
  ];

  const orderHistory = supplier ? [
    { id: 'PO-2025-001', date: '2025-01-20', amount: 45000, status: 'Delivered' },
    { id: 'PO-2025-002', date: '2025-02-15', amount: 38000, status: 'Delivered' },
    { id: 'PO-2025-003', date: '2025-03-10', amount: 42000, status: 'Invoiced' },
    { id: 'PO-2025-004', date: '2025-04-05', amount: 52000, status: 'Sent' },
    { id: 'PO-2025-005', date: '2025-05-01', amount: 48000, status: 'Approved' }
  ] : [];

  if (!supplier) {
    return <div className="container mx-auto p-6">Loading supplier details...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/procurement/supplier-management')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title={supplier.name}
          description={`Detailed view of supplier ${supplier.name}`}
          voiceIntroduction={`Welcome to the detailed view of supplier ${supplier.name}.`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              {supplier.rating.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Overall Rating</div>
            <div className="text-sm text-green-600">Excellent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{supplier.totalOrders}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="text-sm text-blue-600">Lifetime</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">${supplier.totalValue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-sm text-purple-600">Spent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{supplier.onTimeDelivery}%</div>
            <div className="text-sm text-muted-foreground">On-Time Delivery</div>
            <div className="text-sm text-green-600">Reliable</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Basic Information
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(supplier.status)}>
                    {supplier.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{supplier.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Level:</span>
                  <Badge className={getRiskColor(supplier.riskLevel)}>
                    {supplier.riskLevel}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Terms:</span>
                  <span>{supplier.paymentTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Established:</span>
                  <span>{new Date(supplier.establishedDate).getFullYear()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ID:</span>
                  <span>{supplier.taxId}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.email}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span>{supplier.address}, {supplier.city}, {supplier.country}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-muted-foreground">Website:</span>
                  <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {supplier.website}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground">Primary Contact:</span>
                  <div className="font-medium">{supplier.contactPerson}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Certifications & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {supplier.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Volume Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                    <Bar dataKey="value" fill="#82ca9d" name="Value ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>On-Time Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="onTime" stroke="#8884d8" name="On-Time %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">{supplier.qualityRating.toFixed(1)}/5</div>
                  <div className="text-sm text-muted-foreground">Quality Rating</div>
                </div>
                <div className="p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">{supplier.onTimeDelivery}%</div>
                  <div className="text-sm text-muted-foreground">On-Time Delivery</div>
                </div>
                <div className="p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600">{supplier.rating.toFixed(1)}/5</div>
                  <div className="text-sm text-muted-foreground">Overall Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{order.id}</h4>
                        <p className="text-sm text-muted-foreground">Date: {order.date}</p>
                        <p className="text-sm">Amount: ${order.amount.toLocaleString()}</p>
                      </div>
                      <Badge className={order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Business License', 'Tax Certificate', 'Insurance Certificate', 'Quality Certification', 'ISO 9001 Certificate'].map((doc) => (
                  <div key={doc} className="flex justify-between items-center p-3 border rounded">
                    <span>{doc}</span>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Industrial Equipment">Industrial Equipment</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierDetail;
