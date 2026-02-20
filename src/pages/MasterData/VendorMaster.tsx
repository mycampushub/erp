
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Plus, Eye, Edit, Trash2, Truck, Handshake, Ban, CheckCircle, Phone, Mail, Globe } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';

interface Vendor {
  id: string;
  vendorNumber: string;
  vendorName: string;
  country: string;
  city: string;
  address: string;
  vendorGroup: string;
  paymentTerms: string;
  currency: string;
  status: 'Active' | 'Blocked' | 'Inactive';
  taxId: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  bankAccount: string;
  creditLimit: number;
  notes: string;
}

const defaultForm: Omit<Vendor, 'id' | 'vendorNumber'> = {
  vendorName: '', country: 'United States', city: '', address: '', vendorGroup: 'Raw Materials',
  paymentTerms: 'Net 30', currency: 'USD', status: 'Active', taxId: '', contactPerson: '',
  email: '', phone: '', website: '', bankAccount: '', creditLimit: 100000, notes: '',
};

const STORAGE_KEY = 'sap_vendors';

const defaultVendors: Vendor[] = [
  { id: '1', vendorNumber: 'VEND-001', vendorName: 'Industrial Supplies Co.', country: 'United States', city: 'Chicago', address: '123 Industrial Blvd, Chicago, IL 60601', vendorGroup: 'Raw Materials', paymentTerms: 'Net 45', currency: 'USD', status: 'Active', taxId: '12-3456789', contactPerson: 'James Wilson', email: 'jwilson@indsup.com', phone: '+1-312-555-0100', website: 'www.indsupplies.com', bankAccount: '****5621', creditLimit: 500000, notes: 'Preferred vendor for raw materials.' },
  { id: '2', vendorNumber: 'VEND-002', vendorName: 'European Components Ltd', country: 'Germany', city: 'Munich', address: 'Industriestraße 45, 80339 München', vendorGroup: 'Components', paymentTerms: 'Net 30', currency: 'EUR', status: 'Active', taxId: 'DE123456789', contactPerson: 'Hans Mueller', email: 'h.mueller@eucomp.de', phone: '+49-89-555-0200', website: 'www.eucomponents.de', bankAccount: '****3388', creditLimit: 250000, notes: 'High quality electronic components.' },
  { id: '3', vendorNumber: 'VEND-003', vendorName: 'Asia Pacific Trading', country: 'Singapore', city: 'Singapore', address: '88 Market Street, Singapore 048948', vendorGroup: 'Services', paymentTerms: 'Net 15', currency: 'SGD', status: 'Blocked', taxId: 'SG123456789A', contactPerson: 'Li Wei', email: 'li.wei@aptrade.sg', phone: '+65-6555-0300', website: 'www.aptrade.sg', bankAccount: '****7712', creditLimit: 150000, notes: 'Blocked pending contract renegotiation.' },
  { id: '4', vendorNumber: 'VEND-004', vendorName: 'Tech Innovations Corp', country: 'United States', city: 'San Jose', address: '500 Tech Park Way, San Jose, CA 95110', vendorGroup: 'Technology', paymentTerms: 'Net 60', currency: 'USD', status: 'Active', taxId: '98-7654321', contactPerson: 'Sarah Chen', email: 's.chen@techinno.com', phone: '+1-408-555-0400', website: 'www.techinno.com', bankAccount: '****9934', creditLimit: 750000, notes: 'Software and hardware solutions.' },
  { id: '5', vendorNumber: 'VEND-005', vendorName: 'Nordic Steel Works', country: 'Sweden', city: 'Stockholm', address: 'Industrivägen 15, 112 67 Stockholm', vendorGroup: 'Raw Materials', paymentTerms: 'Net 30', currency: 'SEK', status: 'Active', taxId: 'SE12345678901', contactPerson: 'Erik Johansson', email: 'ej@nordicsteel.se', phone: '+46-8-555-0500', website: 'www.nordicsteel.se', bankAccount: '****4521', creditLimit: 350000, notes: 'Premium quality steel supplier.' },
  { id: '6', vendorNumber: 'VEND-006', vendorName: 'German Precision Parts', country: 'Germany', city: 'Stuttgart', address: 'Industriestraße 100, 70372 Stuttgart', vendorGroup: 'Components', paymentTerms: 'Net 30', currency: 'EUR', status: 'Active', taxId: 'DE987654321', contactPerson: 'Klaus Schmidt', email: 'kschmidt@germanparts.de', phone: '+49-711-555-0600', website: 'www.germanparts.de', bankAccount: '****8821', creditLimit: 420000, notes: 'Precision machined components.' },
  { id: '7', vendorNumber: 'VEND-007', vendorName: 'Chinese Electronics Hub', country: 'China', city: 'Shenzhen', address: 'Tech Park Building A, Nanshan District', vendorGroup: 'Electronics', paymentTerms: 'Net 45', currency: 'CNY', status: 'Active', taxId: 'CN91440300MA', contactPerson: 'Wei Zhang', email: 'wzhang@cehub.cn', phone: '+86-755-5555-0700', website: 'www.cehub.cn', bankAccount: '****3321', creditLimit: 680000, notes: 'Wide range of electronic components.' },
  { id: '8', vendorNumber: 'VEND-008', vendorName: 'Japanese Auto Parts Inc', country: 'Japan', city: 'Tokyo', address: '1-2-3 Shin-Kawasaki, Kawasaki City', vendorGroup: 'Components', paymentTerms: 'Net 30', currency: 'JPY', status: 'Active', taxId: 'JP12345678901', contactPerson: 'Takeshi Yamamoto', email: 'tyamamoto@japauto.jp', phone: '+81-44-555-0800', website: 'www.japauto.jp', bankAccount: '****9921', creditLimit: 550000, notes: 'OEM automotive parts specialist.' },
  { id: '9', vendorNumber: 'VEND-009', vendorName: 'British Logistics Solutions', country: 'United Kingdom', city: 'Birmingham', address: '100 Colmore Row, Birmingham B3 2AG', vendorGroup: 'Logistics', paymentTerms: 'Net 15', currency: 'GBP', status: 'Active', taxId: 'GB123456789', contactPerson: 'John Smith', email: 'jsmith@britlog.co.uk', phone: '+44-121-555-0900', website: 'www.britlog.co.uk', bankAccount: '****2211', creditLimit: 180000, notes: 'Reliable logistics partner.' },
  { id: '10', vendorNumber: 'VEND-010', vendorName: 'Mexican Manufacturing SA', country: 'Mexico', city: 'Monterrey', address: 'Av. Industrial 5000, Monterrey, NL', vendorGroup: 'Raw Materials', paymentTerms: 'Net 30', currency: 'MXN', status: 'Active', taxId: 'MXA850101GR8', contactPerson: 'Carlos Rodriguez', email: 'crodriguez@memx.mx', phone: '+52-81-5555-1000', website: 'www.memx.mx', bankAccount: '****6611', creditLimit: 320000, notes: 'Cost-effective manufacturing.' },
  { id: '11', vendorNumber: 'VEND-011', vendorName: 'Swiss Precision Tools', country: 'Switzerland', city: 'Zurich', address: 'Bahnhofstrasse 50, 8001 Zurich', vendorGroup: 'Tools', paymentTerms: 'Net 30', currency: 'CHF', status: 'Active', taxId: 'CHE123456789', contactPerson: 'Hans Mueller', email: 'hmueller@swisspt.ch', phone: '+41-44-555-1100', website: 'www.swisspt.ch', bankAccount: '****8811', creditLimit: 280000, notes: 'High-precision tooling.' },
  { id: '12', vendorNumber: 'VEND-012', vendorName: 'Australian Mining Supplies', country: 'Australia', city: 'Sydney', address: '100 George Street, Sydney NSW 2000', vendorGroup: 'Raw Materials', paymentTerms: 'Net 45', currency: 'AUD', status: 'Active', taxId: 'ABN12345678901', contactPerson: 'David Brown', email: 'dbrown@ausmine.com.au', phone: '+61-2-5555-1200', website: 'www.ausmine.com.au', bankAccount: '****1121', creditLimit: 450000, notes: 'Mining equipment and supplies.' },
  { id: '13', vendorNumber: 'VEND-013', vendorName: 'Indian Software Solutions', country: 'India', city: 'Bangalore', address: 'Tech City, Electronic City, Bangalore', vendorGroup: 'Services', paymentTerms: 'Net 30', currency: 'INR', status: 'Active', taxId: 'GSTIN29AAAAA0000A', contactPerson: 'Raj Patel', email: 'rpatel@indsoft.in', phone: '+91-80-5555-1300', website: 'www.indsoft.in', bankAccount: '****3321', creditLimit: 220000, notes: 'IT services and software.' },
  { id: '14', vendorNumber: 'VEND-014', vendorName: 'Brazilian Coffee Exporters', country: 'Brazil', city: 'Sao Paulo', address: 'Av. Paulista 1000, Sao Paulo', vendorGroup: 'Raw Materials', paymentTerms: 'Net 15', currency: 'BRL', status: 'Active', taxId: 'CNPJ12.345.678/0001-90', contactPerson: 'Ana Silva', email: 'asilva@brcoffee.com.br', phone: '+55-11-5555-1400', website: 'www.brcoffee.com.br', bankAccount: '****5521', creditLimit: 180000, notes: 'Premium coffee supplier.' },
  { id: '15', vendorNumber: 'VEND-015', vendorName: 'French Packaging Solutions', country: 'France', city: 'Paris', address: '50 Avenue des Champs-Elysees, 75008', vendorGroup: 'Packaging', paymentTerms: 'Net 30', currency: 'EUR', status: 'Active', taxId: 'FR12345678901', contactPerson: 'Pierre Dubois', email: 'pdubois@frpack.fr', phone: '+33-1-5555-1500', website: 'www.frpack.fr', bankAccount: '****7721', creditLimit: 150000, notes: 'Custom packaging solutions.' },
  { id: '16', vendorNumber: 'VEND-016', vendorName: 'Korean Semiconductor Corp', country: 'South Korea', city: 'Seoul', address: ' Pangyo Techno Valley, Seongnam', vendorGroup: 'Electronics', paymentTerms: 'Net 45', currency: 'KRW', status: 'Active', taxId: '123-45-67890', contactPerson: 'Kim Ji-Young', email: 'kjy@korsemi.kr', phone: '+82-31-555-1600', website: 'www.korsemi.kr', bankAccount: '****9921', creditLimit: 850000, notes: 'Advanced semiconductor solutions.' },
  { id: '17', vendorNumber: 'VEND-017', vendorName: 'Dutch Freight Services', country: 'Netherlands', city: 'Rotterdam', address: 'Europaweg 200, 3089 JH Rotterdam', vendorGroup: 'Logistics', paymentTerms: 'Net 15', currency: 'EUR', status: 'Active', taxId: 'NL123456789B01', contactPerson: 'van der Berg', email: 'berg@dutfret.nl', phone: '+31-10-555-1700', website: 'www.dutfret.nl', bankAccount: '****2211', creditLimit: 195000, notes: 'International freight forwarding.' },
  { id: '18', vendorNumber: 'VEND-018', vendorName: 'Canadian Timber Mills', country: 'Canada', city: 'Vancouver', address: '1500 West Georgia St, Vancouver BC', vendorGroup: 'Raw Materials', paymentTerms: 'Net 30', currency: 'CAD', status: 'Active', taxId: '789012345RT0001', contactPerson: 'Michael Thompson', email: 'mthompson@cantimber.ca', phone: '+1-604-555-1800', website: 'www.cantimber.ca', bankAccount: '****4411', creditLimit: 380000, notes: 'Sustainable timber products.' },
  { id: '19', vendorNumber: 'VEND-019', vendorName: 'Spanish Chemical Industries', country: 'Spain', city: 'Barcelona', address: 'Paseo de Gracia 100, 08008 Barcelona', vendorGroup: 'Chemicals', paymentTerms: 'Net 30', currency: 'EUR', status: 'Active', taxId: 'ESB12345678', contactPerson: 'Carlos Garcia', email: 'cgarcia@spachem.es', phone: '+34-93-555-1900', website: 'www.spachem.es', bankAccount: '****6611', creditLimit: 420000, notes: 'Industrial chemicals supplier.' },
  { id: '20', vendorNumber: 'VEND-020', vendorName: 'UAE Oil Field Services', country: 'UAE', city: 'Dubai', address: 'Dubai Internet City, Building 12', vendorGroup: 'Services', paymentTerms: 'Net 45', currency: 'AED', status: 'Active', taxId: 'AE123456789012', contactPerson: 'Ahmed Al-Rashid', email: 'aarashid@uaeoil.ae', phone: '+971-4-555-2000', website: 'www.uaeoil.ae', bankAccount: '****8811', creditLimit: 750000, notes: 'Oilfield equipment and services.' },
  { id: '21', vendorNumber: 'VEND-021', vendorName: 'Polish Furniture Manufacturer', country: 'Poland', city: 'Warsaw', address: 'Aleje Jerozolimskie 123, 00-001 Warsaw', vendorGroup: 'Finished Goods', paymentTerms: 'Net 30', currency: 'PLN', status: 'Active', taxId: 'PL1234567890', contactPerson: 'Tomasz Nowak', email: 'tnowak@plfurn.pl', phone: '+48-22-555-2100', website: 'www.plfurn.pl', bankAccount: '****1121', creditLimit: 165000, notes: 'Modern office furniture.' },
  { id: '22', vendorNumber: 'VEND-022', vendorName: 'Thai Rubber Products', country: 'Thailand', city: 'Bangkok', address: 'Sathorn Road, Bangkok 10120', vendorGroup: 'Raw Materials', paymentTerms: 'Net 30', currency: 'THB', status: 'Active', taxId: 'TH123456789012', contactPerson: 'Somsak Chai', email: 'schai@thrubber.th', phone: '+66-2-5555-2200', website: 'www.thrubber.th', bankAccount: '****3321', creditLimit: 210000, notes: 'High-quality natural rubber.' },
  { id: '23', vendorNumber: 'VEND-023', vendorName: 'Norwegian Seafood Exports', country: 'Norway', city: 'Oslo', address: 'Aker Brygge 50, 0250 Oslo', vendorGroup: 'Raw Materials', paymentTerms: 'Net 15', currency: 'NOK', status: 'Active', taxId: 'NO123456789', contactPerson: 'Lars Hansen', email: 'lhansen@nrseafood.no', phone: '+47-22-555-2300', website: 'www.nrseafood.no', bankAccount: '****5521', creditLimit: 480000, notes: 'Fresh and frozen seafood.' },
  { id: '24', vendorNumber: 'VEND-024', vendorName: 'Turkish Textile Mills', country: 'Turkey', city: 'Istanbul', address: 'Levent Mah. Istanbul 34330', vendorGroup: 'Raw Materials', paymentTerms: 'Net 30', currency: 'TRY', status: 'Active', taxId: 'TR1234567890', contactPerson: 'Ayse Yilmaz', email: 'ayilmaz@trtextile.tr', phone: '+90-212-555-2400', website: 'www.trtextile.tr', bankAccount: '****7721', creditLimit: 195000, notes: 'Quality textile materials.' },
  { id: '25', vendorNumber: 'VEND-025', vendorName: 'South African Mining Equipment', country: 'South Africa', city: 'Johannesburg', address: '1 Sandton Drive, Johannesburg', vendorGroup: 'Equipment', paymentTerms: 'Net 45', currency: 'ZAR', status: 'Active', taxId: 'ZA912345678', contactPerson: 'Thabo Molefe', email: 'tmolefe@samine.co.za', phone: '+27-11-555-2500', website: 'www.samine.co.za', bankAccount: '****9911', creditLimit: 650000, notes: 'Mining equipment supplier.' },
  { id: '26', vendorNumber: 'VEND-026', vendorName: 'Vietnam Electronics Mfg', country: 'Vietnam', city: 'Ho Chi Minh City', address: 'District 7, Saigon Hi-tech Park', vendorGroup: 'Electronics', paymentTerms: 'Net 45', currency: 'VND', status: 'Active', taxId: 'VN1234567890', contactPerson: 'Nguyen Van Phuc', email: 'nvphuc@vnelec.vn', phone: '+84-28-5555-2600', website: 'www.vnelec.vn', bankAccount: '****2211', creditLimit: 380000, notes: 'Contract electronics manufacturing.' },
  { id: '27', vendorNumber: 'VEND-027', vendorName: 'Italian Leather Tanners', country: 'Italy', city: 'Milan', address: 'Via Monte Napoleone 8, 20121 Milano', vendorGroup: 'Raw Materials', paymentTerms: 'Net 30', currency: 'EUR', status: 'Active', taxId: 'IT12345678901', contactPerson: 'Marco Rossi', email: 'mrossi@itleather.it', phone: '+39-02-5555-2700', website: 'www.itleather.it', bankAccount: '****4411', creditLimit: 245000, notes: 'Premium Italian leather.' },
  { id: '28', vendorNumber: 'VEND-028', vendorName: 'Belgian Chocolate Supplies', country: 'Belgium', city: 'Brussels', address: 'Avenue Louise 100, 1050 Brussels', vendorGroup: 'Raw Materials', paymentTerms: 'Net 15', currency: 'EUR', status: 'Active', taxId: 'BE1234567890', contactPerson: 'Jean Dupont', email: 'jdupont@bechoco.be', phone: '+32-2-555-2800', website: 'www.bechoco.be', bankAccount: '****6611', creditLimit: 175000, notes: 'Fine Belgian chocolate ingredients.' },
  { id: '29', vendorNumber: 'VEND-029', vendorName: 'New Zealand Dairy Co-op', country: 'New Zealand', city: 'Auckland', address: '109 Carlton Gore Road, Newmarket', vendorGroup: 'Raw Materials', paymentTerms: 'Net 30', currency: 'NZD', status: 'Active', taxId: 'NZ123456789', contactPerson: 'William Taylor', email: 'wtaylor@nzdairy.nz', phone: '+64-9-555-2900', website: 'www.nzdairy.nz', bankAccount: '****8811', creditLimit: 520000, notes: 'Premium dairy ingredients.' },
  { id: '30', vendorNumber: 'VEND-030', vendorName: 'Egyptian Cotton Traders', country: 'Egypt', city: 'Cairo', address: 'Nile City Towers, Cairo', vendorGroup: 'Raw Materials', paymentTerms: 'Net 30', currency: 'EGP', status: 'Active', taxId: 'EG123456789', contactPerson: 'Omar Hassan', email: 'ohassan@egcotton.eg', phone: '+20-2-5555-3000', website: 'www.egcotton.eg', bankAccount: '****1121', creditLimit: 290000, notes: 'World-renowned Egyptian cotton.' },
];

const VendorMaster: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useLocalStorage<Vendor[]>(STORAGE_KEY, defaultVendors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Omit<Vendor, 'id' | 'vendorNumber'>>(defaultForm);

  React.useEffect(() => {
    if (isEnabled) speak('Welcome to Vendor Master. Manage supplier information including contact details, payment terms, and vendor classifications.');
  }, [isEnabled, speak]);

  const openCreate = () => {
    setEditingVendor(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setEditingVendor(v);
    setForm({ vendorName: v.vendorName, country: v.country, city: v.city, address: v.address, vendorGroup: v.vendorGroup, paymentTerms: v.paymentTerms, currency: v.currency, status: v.status, taxId: v.taxId, contactPerson: v.contactPerson, email: v.email, phone: v.phone, website: v.website, bankAccount: v.bankAccount, creditLimit: v.creditLimit, notes: v.notes });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.vendorName.trim()) {
      toast({ title: 'Validation Error', description: 'Vendor name is required.', variant: 'destructive' });
      return;
    }
    if (editingVendor) {
      setVendors(prev => prev.map(v => v.id === editingVendor.id ? { ...editingVendor, ...form } : v));
      toast({ title: 'Vendor Updated', description: `${form.vendorName} has been updated.` });
    } else {
      const newVendor: Vendor = { id: String(Date.now()), vendorNumber: `VEND-${String(vendors.length + 1).padStart(3, '0')}`, ...form };
      setVendors(prev => [...prev, newVendor]);
      toast({ title: 'Vendor Created', description: `${form.vendorName} added to vendor master.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (v: Vendor) => {
    setVendors(prev => prev.filter(vendor => vendor.id !== v.id));
    toast({ title: 'Vendor Deleted', description: `${v.vendorName} has been removed.` });
  };

  const toggleBlock = (v: Vendor) => {
    const newStatus = v.status === 'Active' ? 'Blocked' : 'Active';
    setVendors(prev => prev.map(vendor => vendor.id === v.id ? { ...vendor, status: newStatus } : vendor));
    toast({ title: `Vendor ${newStatus}`, description: `${v.vendorName} is now ${newStatus}.` });
  };

  const getStatusColor = (s: string) => {
    const c = { 'Active': 'bg-green-100 text-green-800', 'Blocked': 'bg-red-100 text-red-800', 'Inactive': 'bg-gray-100 text-gray-800' };
    return c[s as keyof typeof c] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'vendorNumber', header: 'Vendor #', sortable: true, searchable: true },
    { key: 'vendorName', header: 'Vendor Name', searchable: true },
    { key: 'country', header: 'Country', filterable: true, filterOptions: Array.from(new Set(vendors.map(v => v.country))).map(c => ({ label: c, value: c })) },
    { key: 'city', header: 'City', searchable: true },
    { key: 'vendorGroup', header: 'Group', filterable: true, filterOptions: ['Raw Materials','Components','Services','Technology','Logistics','Packaging'].map(v => ({ label: v, value: v })) },
    { key: 'paymentTerms', header: 'Payment Terms' },
    { key: 'currency', header: 'Currency' },
    { key: 'creditLimit', header: 'Credit Limit', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'status', header: 'Status', filterable: true, filterOptions: ['Active','Blocked','Inactive'].map(v => ({ label: v, value: v })), render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
    { key: 'contactPerson', header: 'Contact', searchable: true },
  ];

  const actions: TableAction[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row: Vendor) => { setSelectedVendor(row); setIsViewDialogOpen(true); }, variant: 'ghost' },
    { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: openEdit, variant: 'ghost' },
    { label: 'Block', icon: <Ban className="h-4 w-4" />, onClick: toggleBlock, variant: 'ghost', condition: (row: Vendor) => row.status === 'Active' },
    { label: 'Unblock', icon: <CheckCircle className="h-4 w-4" />, onClick: toggleBlock, variant: 'ghost', condition: (row: Vendor) => row.status === 'Blocked' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: handleDelete, variant: 'ghost' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/master-data')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader title="Vendor Master" description="Create and maintain vendor master records with payment and banking details" voiceIntroduction="Welcome to Vendor Master." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="text-sm text-muted-foreground">Total Vendors</div><div className="text-2xl font-bold">{vendors.length}</div><div className="text-sm text-blue-600">All records</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Active Vendors</div><div className="text-2xl font-bold">{vendors.filter(v => v.status === 'Active').length}</div><div className="text-sm text-green-600">Currently active</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Blocked</div><div className="text-2xl font-bold">{vendors.filter(v => v.status === 'Blocked').length}</div><div className="text-sm text-red-600">Access restricted</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Countries</div><div className="text-2xl font-bold">{new Set(vendors.map(v => v.country)).size}</div><div className="text-sm text-purple-600">Global suppliers</div></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vendors">Vendor Directory</TabsTrigger>
          <TabsTrigger value="create">New Vendor</TabsTrigger>
        </TabsList>
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Vendor Master Records
                <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Vendor</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={columns} data={vendors} actions={actions} searchPlaceholder="Search vendors..." exportable refreshable onRefresh={() => {}} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="create">
          <Card>
            <CardHeader><CardTitle>Register New Vendor</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Vendor Name *</Label><Input value={form.vendorName} onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Vendor Group</Label>
                  <Select value={form.vendorGroup} onValueChange={v => setForm(f => ({ ...f, vendorGroup: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Raw Materials','Components','Services','Technology','Logistics','Packaging'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
                <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
                <div className="col-span-2 space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Tax ID</Label><Input value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Payment Terms</Label>
                  <Select value={form.paymentTerms} onValueChange={v => setForm(f => ({ ...f, paymentTerms: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Net 15','Net 30','Net 45','Net 60','COD','Prepaid'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Currency</Label>
                  <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['USD','EUR','GBP','SGD','JPY','CNY'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Credit Limit ($)</Label><Input type="number" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: Number(e.target.value) }))} /></div>
                <div className="space-y-2"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Website</Label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
                <div className="col-span-2 space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSave}><Plus className="h-4 w-4 mr-2" />Create Vendor</Button>
                <Button variant="outline" onClick={() => setForm(defaultForm)}>Reset</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingVendor ? `Edit: ${editingVendor.vendorName}` : 'Create Vendor'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2"><Label>Vendor Name *</Label><Input value={form.vendorName} onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Vendor Group</Label>
              <Select value={form.vendorGroup} onValueChange={v => setForm(f => ({ ...f, vendorGroup: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Raw Materials','Components','Services','Technology','Logistics','Packaging'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
            <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div className="col-span-2 space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Payment Terms</Label>
              <Select value={form.paymentTerms} onValueChange={v => setForm(f => ({ ...f, paymentTerms: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Net 15','Net 30','Net 45','Net 60','COD','Prepaid'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Vendor['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Active','Blocked','Inactive'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Credit Limit ($)</Label><Input type="number" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: Number(e.target.value) }))} /></div>
            <div className="col-span-2 space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingVendor ? 'Update' : 'Create'} Vendor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Vendor: {selectedVendor?.vendorName}</DialogTitle></DialogHeader>
          {selectedVendor && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div><div className="text-sm text-muted-foreground">{selectedVendor.vendorNumber}</div><div className="text-lg font-bold">{selectedVendor.vendorName}</div></div>
                <Badge className={getStatusColor(selectedVendor.status)}>{selectedVendor.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><Label>Vendor Group</Label><div>{selectedVendor.vendorGroup}</div></div>
                <div><Label>Payment Terms</Label><div>{selectedVendor.paymentTerms}</div></div>
                <div><Label>Currency</Label><div>{selectedVendor.currency}</div></div>
                <div><Label>Credit Limit</Label><div className="font-semibold">${selectedVendor.creditLimit.toLocaleString()}</div></div>
                <div><Label>Tax ID</Label><div>{selectedVendor.taxId}</div></div>
                <div><Label>Country</Label><div>{selectedVendor.country}, {selectedVendor.city}</div></div>
              </div>
              <div className="space-y-2 text-sm border-t pt-3">
                <div className="font-semibold text-muted-foreground">CONTACT</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{selectedVendor.contactPerson} — {selectedVendor.phone}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{selectedVendor.email}</div>
                {selectedVendor.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4" />{selectedVendor.website}</div>}
              </div>
              {selectedVendor.notes && <div className="text-sm bg-muted p-3 rounded">{selectedVendor.notes}</div>}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setIsViewDialogOpen(false); openEdit(selectedVendor); }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                <Button variant="outline" onClick={() => toggleBlock(selectedVendor)}>{selectedVendor.status === 'Active' ? 'Block' : 'Unblock'}</Button>
                <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorMaster;
