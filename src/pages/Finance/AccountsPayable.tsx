import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { ArrowLeft, Plus, FileText, DollarSign, Clock, CheckCircle, AlertTriangle, Eye, Edit, Trash2, Download, RefreshCw, CreditCard, Building, Mail, Phone, MapPin } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export interface Vendor {
  id: string;
  vendorNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxId: string;
  paymentTerms: string;
  currency: string;
  creditLimit: number;
  bankName: string;
  bankAccount: string;
  iban: string;
  swift: string;
  status: 'Active' | 'Blocked' | 'On Hold';
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorNumber: string;
  vendorName: string;
  invoiceDate: string;
  dueDate: string;
  postingDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Paid' | 'Overdue' | 'Partially Paid';
  description: string;
  poReference: string;
  glAccount: string;
  costCenter: string;
  paymentMethod: string;
  approvedBy?: string;
  approvedDate?: string;
  paidAmount: number;
  remainingAmount: number;
  createdAt: string;
}

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  currency: z.string().min(1, 'Currency is required'),
  creditLimit: z.number().min(0, 'Credit limit must be positive'),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
});

const invoiceSchema = z.object({
  vendorNumber: z.string().min(1, 'Vendor is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  taxAmount: z.number().min(0, 'Tax amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  poReference: z.string().optional(),
  glAccount: z.string().min(1, 'GL account is required'),
  costCenter: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

const seedVendors = (): Vendor[] => {
  const now = new Date().toISOString();
  return [
    { id: generateId('vnd'), vendorNumber: 'VND-001', name: 'Dell Technologies Inc', email: 'accounts@dell.com', phone: '+1-800-555-1234', address: 'One Dell Way', city: 'Round Rock', country: 'USA', taxId: '74-2955836', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 500000, bankName: 'JPMorgan Chase', bankAccount: '****4567', iban: 'US21CHASES370005445', swift: 'CHASUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-002', name: 'HP Inc', email: 'ap@hp.com', phone: '+1-650-555-9876', address: '1501 Page Mill Road', city: 'Palo Alto', country: 'USA', taxId: '94-1085716', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 350000, bankName: 'Bank of America', bankAccount: '****8901', iban: 'US54BAC234567890123', swift: 'BOFAUS3N', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-003', name: 'Cisco Systems', email: 'payments@cisco.com', phone: '+1-408-555-2468', address: '170 West Tasman Drive', city: 'San Jose', country: 'USA', taxId: '77-0059597', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 750000, bankName: 'Wells Fargo', bankAccount: '****1357', iban: 'US62WFRE123456789012', swift: 'WFBIUS6S', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-004', name: 'Microsoft Corporation', email: 'vendorpayments@microsoft.com', phone: '+1-425-555-0001', address: 'One Microsoft Way', city: 'Redmond', country: 'USA', taxId: '91-1144448', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 1000000, bankName: 'Citibank', bankAccount: '****2468', iban: 'US93CITI123456789012', swift: 'CITIUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-005', name: 'Oracle Corporation', email: 'payments@oracle.com', phone: '+1-650-555-1111', address: '2300 Oracle Way', city: 'Austin', country: 'USA', taxId: '54-2004983', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 450000, bankName: 'Goldman Sachs', bankAccount: '****3579', iban: 'US12GSBANK123456789', swift: 'GASUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-006', name: 'Salesforce Inc', email: 'ar@salesforce.com', phone: '+1-415-555-2222', address: 'Salesforce Tower', city: 'San Francisco', country: 'USA', taxId: '94-3329100', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 300000, bankName: 'Silicon Valley Bank', bankAccount: '****4680', iban: 'US57SVBK123456789012', swift: 'SVBKUS66', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-007', name: 'Amazon Web Services', email: 'aws-billing@amazon.com', phone: '+1-206-555-0100', address: '410 Terry Avenue North', city: 'Seattle', country: 'USA', taxId: '91-2054571', paymentTerms: 'Net 15', currency: 'USD', creditLimit: 800000, bankName: 'JP Morgan', bankAccount: '****5791', iban: 'US21CHASE123456789012', swift: 'CHASUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-008', name: 'IBM Corporation', email: 'payments@ibm.com', phone: '+1-914-555-0300', address: '1 New Orchard Road', city: 'Armonk', country: 'USA', taxId: '13-0871986', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 600000, bankName: 'Mellon Bank', bankAccount: '****6813', iban: 'US04MTBK100012345678', swift: 'MELTUS3P', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-009', name: 'Adobe Inc', email: 'vendor@adobe.com', phone: '+1-408-555-0500', address: '345 Park Avenue', city: 'San Jose', country: 'USA', taxId: '77-0017522', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 250000, bankName: 'Wells Fargo', bankAccount: '****7924', iban: 'US62WFRE123456789012', swift: 'WFBIUS6S', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-010', name: 'SAP America Inc', email: 'accounts-payable@sap.com', phone: '+1-610-555-0100', address: '3999 West Chester Pike', city: 'Newtown Square', country: 'USA', taxId: '23-2479101', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 550000, bankName: 'Deutsche Bank', bankAccount: '****8035', iban: 'US92DEUT123456789012', swift: 'DEUTUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-011', name: 'Intel Corporation', email: 'payments@intel.com', phone: '+1-408-555-1000', address: '2200 Mission College Boulevard', city: 'Santa Clara', country: 'USA', taxId: '94-1754699', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 700000, bankName: 'Bank of America', bankAccount: '****9146', iban: 'US54BAC234567890123', swift: 'BOFAUS3N', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-012', name: 'Samsung Electronics America', email: 'ap@samsung.com', phone: '+1-972-555-0300', address: '121 S_state Street', city: 'Richardson', country: 'USA', taxId: '76-0479545', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 900000, bankName: 'Korea Exchange Bank', bankAccount: '****0257', iban: 'US27KEBH100012345678', swift: 'KOEXUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-013', name: 'Lenovo Group Limited', email: 'payments@lenovo.com', phone: '+1-919-555-0100', address: '1009 Think Place', city: 'Morrisville', country: 'USA', taxId: '13-3519506', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 400000, bankName: 'HSBC', bankAccount: '****1368', iban: 'US44HSBC123456789012', swift: 'HSBCUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-014', name: 'Accenture LLP', email: 'vendor.invoices@accenture.com', phone: '+1-917-555-0100', address: '500 W Madison Street', city: 'Chicago', country: 'USA', taxId: '98-0176753', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 850000, bankName: 'Morgan Stanley', bankAccount: '****2479', iban: 'US12MSBK123456789012', swift: 'MSBKUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-015', name: 'Deloitte LLP', email: 'payments@deloitte.com', phone: '+1-212-555-0100', address: '30 Rockefeller Plaza', city: 'New York', country: 'USA', taxId: '13-3246329', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 650000, bankName: 'Citibank', bankAccount: '****3580', iban: 'US93CITI123456789012', swift: 'CITIUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-016', name: 'PwC', email: 'vendorpayments@pwc.com', phone: '+1-678-555-0100', address: '300 Madison Avenue', city: 'New York', country: 'USA', taxId: '13-4008324', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 500000, bankName: 'Barclays', bankAccount: '****4691', iban: 'US30BARC123456789012', swift: 'BARCUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-017', name: 'KPMG LLP', email: 'payments@kpmg.com', phone: '+1-201-555-0100', address: '345 Park Avenue', city: 'New York', country: 'USA', taxId: '13-2690237', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 450000, bankName: 'BNP Paribas', bankAccount: '****5702', iban: 'US42BNPA123456789012', swift: 'BNPAUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-018', name: 'Ernst & Young LLP', email: 'vendor.invoices@ey.com', phone: '+1-203-555-0100', address: '200 Plaza Drive', city: 'Stamford', country: 'USA', taxId: '13-2556404', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 550000, bankName: 'Standard Chartered', bankAccount: '****6813', iban: 'US35SCBK123456789012', swift: 'SCBLUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-019', name: 'FedEx Corporation', email: 'enterprise.payments@fedex.com', phone: '+1-901-555-0100', address: '942 S Shady Grove Road', city: 'Memphis', country: 'USA', taxId: '71-0425076', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 350000, bankName: 'SunTrust', bankAccount: '****7924', iban: 'US55SUNB123456789012', swift: 'SUNUTUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-020', name: 'UPS', email: 'supplier@ups.com', phone: '+1-404-555-0100', address: '55 Glenlake Parkway NE', city: 'Atlanta', country: 'USA', taxId: '95-5474093', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 400000, bankName: 'PNC Bank', bankAccount: '****8035', iban: 'US83PNCB123456789012', swift: 'PNCPUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-021', name: 'DHL Express USA', email: 'payments@dhl.com', phone: '+1-800-555-0100', address: '1210 S Pine Street', city: 'Lufkin', country: 'USA', taxId: '74-2322306', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 200000, bankName: 'Commerzbank', bankAccount: '****9146', iban: 'US24COMB123456789012', swift: 'COMBUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-022', name: 'AT&T Services Inc', email: 'ap@att.com', phone: '+1-210-555-0100', address: '208 S Akard Street', city: 'Dallas', country: 'USA', taxId: '43-1301883', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 750000, bankName: 'Bank of Texas', bankAccount: '****0257', iban: 'US37BTEX123456789012', swift: 'BTEXUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-023', name: 'Verizon Business', email: 'payments@verizon.com', phone: '+1-908-555-0100', address: '1095 Avenue of the Americas', city: 'New York', country: 'USA', taxId: '13-2552040', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 650000, bankName: 'US Bank', bankAccount: '****1368', iban: 'US91USBK123456789012', swift: 'USBKUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-024', name: 'T-Mobile USA Inc', email: 'vendor@tmobile.com', phone: '+1-425-555-0100', address: '12920 SE 38th Street', city: 'Bellevue', country: 'USA', taxId: '91-1942306', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 450000, bankName: 'Truist Bank', bankAccount: '****2479', iban: 'US53TRBT123456789012', swift: 'TRBTUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-025', name: 'Office Depot Inc', email: 'vendor.services@officedepot.com', phone: '+1-561-555-0100', address: '6600 N Military Trail', city: 'Boca Raton', country: 'USA', taxId: '59-2365519', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 150000, bankName: 'TD Bank', bankAccount: '****3580', iban: 'US04TDOM123456789012', swift: 'TDOMUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-026', name: 'Staples Inc', email: 'payments@staples.com', phone: '+1-508-555-0100', address: '500 Staples Drive', city: 'Framingham', country: 'USA', taxId: '04-2896127', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 175000, bankName: 'Santander', bankAccount: '****4691', iban: 'US28SANT123456789012', swift: 'SANTUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-027', name: 'Grainger Inc', email: 'vendor@grainger.com', phone: '+1-847-555-0100', address: '100 Grainger Parkway', city: 'Lake Forest', country: 'USA', taxId: '36-1150280', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 300000, bankName: 'Northern Trust', bankAccount: '****5702', iban: 'US07NTBK123456789012', swift: 'CNORUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-028', name: 'CDK Global LLC', email: 'payments@cdk.com', phone: '+1-630-555-0100', address: '1950 Hassell Road', city: 'Hoffman Estates', country: 'USA', taxId: '36-4107726', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 200000, bankName: 'Fifth Third', bankAccount: '****6813', iban: 'US42FBBK123456789012', swift: 'FTHRUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-029', name: 'Thomson Reuters Corp', email: 'vendor@thomsonreuters.com', phone: '+1-800-555-0100', address: '3 Times Square', city: 'New York', country: 'USA', taxId: '13-1026635', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 280000, bankName: 'Royal Bank of Scotland', bankAccount: '****7924', iban: 'US23RBSB123456789012', swift: 'RBSBUS33', status: 'Active', createdAt: now },
    { id: generateId('vnd'), vendorNumber: 'VND-030', name: 'WEX Health Inc', email: 'payments@wexinc.com', phone: '+1-866-555-0100', address: '225 Wesleyann Road', city: 'Portland', country: 'USA', taxId: '01-0976437', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 180000, bankName: 'KeyBank', bankAccount: '****8035', iban: 'US04KEYB123456789012', swift: 'KEYBUS33', status: 'Active', createdAt: now },
  ];
};

const seedInvoices = (vendors: Vendor[]): Invoice[] => {
  const now = new Date().toISOString();
  const getVendor = (num: string) => vendors.find(v => v.vendorNumber === num);
  
  return [
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0001', vendorNumber: 'VND-001', vendorName: 'Dell Technologies Inc', invoiceDate: '2025-01-05', dueDate: '2025-02-04', postingDate: '2025-01-06', amount: 25000, taxAmount: 2000, totalAmount: 27000, currency: 'USD', status: 'Paid', description: 'Dell PowerEdge R750 Server', poReference: 'PO-2025-001', glAccount: '160000', costCenter: 'CC-2000', paymentMethod: 'Bank Transfer', approvedBy: 'John Smith', approvedDate: '2025-01-07', paidAmount: 27000, remainingAmount: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0002', vendorNumber: 'VND-002', vendorName: 'HP Inc', invoiceDate: '2025-01-08', dueDate: '2025-02-07', postingDate: '2025-01-09', amount: 18500, taxAmount: 1480, totalAmount: 19980, currency: 'USD', status: 'Approved', description: 'HP LaserJet Enterprise Printers', poReference: 'PO-2025-002', glAccount: '160000', costCenter: 'CC-4000', paymentMethod: 'Bank Transfer', approvedBy: 'Sarah Johnson', approvedDate: '2025-01-10', paidAmount: 0, remainingAmount: 19980, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0003', vendorNumber: 'VND-003', vendorName: 'Cisco Systems', invoiceDate: '2025-01-10', dueDate: '2025-02-24', postingDate: '2025-01-11', amount: 45000, taxAmount: 3600, totalAmount: 48600, currency: 'USD', status: 'Pending Approval', description: 'Cisco Catalyst 9300 Switches', poReference: 'PO-2025-003', glAccount: '160000', costCenter: 'CC-2000', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 48600, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0004', vendorNumber: 'VND-004', vendorName: 'Microsoft Corporation', invoiceDate: '2025-01-12', dueDate: '2025-02-11', postingDate: '2025-01-13', amount: 12000, taxAmount: 960, totalAmount: 12960, currency: 'USD', status: 'Paid', description: 'Microsoft 365 Enterprise Licenses', poReference: 'PO-2025-004', glAccount: '150000', costCenter: 'CC-4000', paymentMethod: 'Credit Card', approvedBy: 'Mike Wilson', approvedDate: '2025-01-14', paidAmount: 12960, remainingAmount: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0005', vendorNumber: 'VND-005', vendorName: 'Oracle Corporation', invoiceDate: '2025-01-15', dueDate: '2025-02-14', postingDate: '2025-01-16', amount: 85000, taxAmount: 6800, totalAmount: 91800, currency: 'USD', status: 'Approved', description: 'Oracle Database Enterprise Edition', poReference: 'PO-2025-005', glAccount: '160000', costCenter: 'CC-3000', paymentMethod: 'Bank Transfer', approvedBy: 'Lisa Brown', approvedDate: '2025-01-17', paidAmount: 0, remainingAmount: 91800, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0006', vendorNumber: 'VND-006', vendorName: 'Salesforce Inc', invoiceDate: '2025-01-18', dueDate: '2025-02-17', postingDate: '2025-01-19', amount: 35000, taxAmount: 2800, totalAmount: 37800, currency: 'USD', status: 'Paid', description: 'Salesforce Sales Cloud Licenses', poReference: 'PO-2025-006', glAccount: '150000', costCenter: 'CC-1000', paymentMethod: 'Bank Transfer', approvedBy: 'John Smith', approvedDate: '2025-01-20', paidAmount: 37800, remainingAmount: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0007', vendorNumber: 'VND-007', vendorName: 'Amazon Web Services', invoiceDate: '2025-01-20', dueDate: '2025-02-04', postingDate: '2025-01-21', amount: 28000, taxAmount: 0, totalAmount: 28000, currency: 'USD', status: 'Paid', description: 'AWS Cloud Services - January', poReference: 'PO-2025-007', glAccount: '150000', costCenter: 'CC-3000', paymentMethod: 'Credit Card', approvedBy: 'Sarah Johnson', approvedDate: '2025-01-22', paidAmount: 28000, remainingAmount: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0008', vendorNumber: 'VND-008', vendorName: 'IBM Corporation', invoiceDate: '2025-01-22', dueDate: '2025-03-08', postingDate: '2025-01-23', amount: 65000, taxAmount: 5200, totalAmount: 70200, currency: 'USD', status: 'Pending Approval', description: 'IBM Cloud Services Contract', poReference: 'PO-2025-008', glAccount: '150000', costCenter: 'CC-3000', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 70200, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0009', vendorNumber: 'VND-009', vendorName: 'Adobe Inc', invoiceDate: '2025-01-25', dueDate: '2025-02-24', postingDate: '2025-01-26', amount: 18000, taxAmount: 1440, totalAmount: 19440, currency: 'USD', status: 'Approved', description: 'Adobe Creative Cloud Enterprise', poReference: 'PO-2025-009', glAccount: '150000', costCenter: 'CC-6000', paymentMethod: 'Bank Transfer', approvedBy: 'Mike Wilson', approvedDate: '2025-01-27', paidAmount: 0, remainingAmount: 19440, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0010', vendorNumber: 'VND-010', vendorName: 'SAP America Inc', invoiceDate: '2025-01-28', dueDate: '2025-02-27', postingDate: '2025-01-29', amount: 95000, taxAmount: 7600, totalAmount: 102600, currency: 'USD', status: 'Approved', description: 'SAP S/4HANA Cloud License', poReference: 'PO-2025-010', glAccount: '160000', costCenter: 'CC-5000', paymentMethod: 'Bank Transfer', approvedBy: 'Lisa Brown', approvedDate: '2025-01-30', paidAmount: 0, remainingAmount: 102600, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0011', vendorNumber: 'VND-011', vendorName: 'Intel Corporation', invoiceDate: '2025-01-30', dueDate: '2025-03-01', postingDate: '2025-01-31', amount: 42000, taxAmount: 3360, totalAmount: 45360, currency: 'USD', status: 'Draft', description: 'Intel Xeon Processors', poReference: 'PO-2025-011', glAccount: '160000', costCenter: 'CC-2000', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 45360, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0012', vendorNumber: 'VND-012', vendorName: 'Samsung Electronics America', invoiceDate: '2025-02-01', dueDate: '2025-03-18', postingDate: '2025-02-02', amount: 55000, taxAmount: 4400, totalAmount: 59400, currency: 'USD', status: 'Pending Approval', description: 'Samsung Commercial Displays', poReference: 'PO-2025-012', glAccount: '160000', costCenter: 'CC-6000', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 59400, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0013', vendorNumber: 'VND-013', vendorName: 'Lenovo Group Limited', invoiceDate: '2025-02-03', dueDate: '2025-03-05', postingDate: '2025-02-04', amount: 22000, taxAmount: 1760, totalAmount: 23760, currency: 'USD', status: 'Approved', description: 'ThinkPad laptops for employees', poReference: 'PO-2025-013', glAccount: '160000', costCenter: 'CC-4000', paymentMethod: 'Bank Transfer', approvedBy: 'John Smith', approvedDate: '2025-02-05', paidAmount: 0, remainingAmount: 23760, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0014', vendorNumber: 'VND-014', vendorName: 'Accenture LLP', invoiceDate: '2025-02-05', dueDate: '2025-03-07', postingDate: '2025-02-06', amount: 125000, taxAmount: 10000, totalAmount: 135000, currency: 'USD', status: 'Pending Approval', description: 'Digital Transformation Consulting', poReference: 'PO-2025-014', glAccount: '670000', costCenter: 'CC-4000', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 135000, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0015', vendorNumber: 'VND-015', vendorName: 'Deloitte LLP', invoiceDate: '2025-02-08', dueDate: '2025-03-10', postingDate: '2025-02-09', amount: 88000, taxAmount: 7040, totalAmount: 95040, currency: 'USD', status: 'Approved', description: 'Financial Audit Services Q1', poReference: 'PO-2025-015', glAccount: '670000', costCenter: 'CC-5000', paymentMethod: 'Bank Transfer', approvedBy: 'Sarah Johnson', approvedDate: '2025-02-10', paidAmount: 0, remainingAmount: 95040, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0016', vendorNumber: 'VND-016', vendorName: 'PwC', invoiceDate: '2025-02-10', dueDate: '2025-03-12', postingDate: '2025-02-11', amount: 72000, taxAmount: 5760, totalAmount: 77760, currency: 'USD', status: 'Paid', description: 'Tax Advisory Services', poReference: 'PO-2025-016', glAccount: '670000', costCenter: 'CC-5000', paymentMethod: 'Bank Transfer', approvedBy: 'Mike Wilson', approvedDate: '2025-02-12', paidAmount: 77760, remainingAmount: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0017', vendorNumber: 'VND-017', vendorName: 'KPMG LLP', invoiceDate: '2025-02-12', dueDate: '2025-03-14', postingDate: '2025-02-13', amount: 58000, taxAmount: 4640, totalAmount: 62640, currency: 'USD', status: 'Overdue', description: 'Internal Audit Services', poReference: 'PO-2025-017', glAccount: '670000', costCenter: 'CC-5000', paymentMethod: 'Bank Transfer', approvedBy: 'Lisa Brown', approvedDate: '2025-02-14', paidAmount: 0, remainingAmount: 62640, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0018', vendorNumber: 'VND-018', vendorName: 'Ernst & Young LLP', invoiceDate: '2025-02-15', dueDate: '2025-03-17', postingDate: '2025-02-16', amount: 48000, taxAmount: 3840, totalAmount: 51840, currency: 'USD', status: 'Approved', description: 'Compliance Review Services', poReference: 'PO-2025-018', glAccount: '670000', costCenter: 'CC-5000', paymentMethod: 'Bank Transfer', approvedBy: 'John Smith', approvedDate: '2025-02-17', paidAmount: 0, remainingAmount: 51840, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0019', vendorNumber: 'VND-019', vendorName: 'FedEx Corporation', invoiceDate: '2025-02-18', dueDate: '2025-03-20', postingDate: '2025-02-19', amount: 8500, taxAmount: 680, totalAmount: 9180, currency: 'USD', status: 'Paid', description: 'Shipping and Logistics Services', poReference: 'PO-2025-019', glAccount: '660000', costCenter: 'CC-3000', paymentMethod: 'Credit Card', approvedBy: 'Sarah Johnson', approvedDate: '2025-02-20', paidAmount: 9180, remainingAmount: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0020', vendorNumber: 'VND-020', vendorName: 'UPS', invoiceDate: '2025-02-20', dueDate: '2025-03-22', postingDate: '2025-02-21', amount: 6200, taxAmount: 496, totalAmount: 6696, currency: 'USD', status: 'Approved', description: 'Package Delivery Services', poReference: 'PO-2025-020', glAccount: '660000', costCenter: 'CC-3000', paymentMethod: 'Credit Card', approvedBy: 'Mike Wilson', approvedDate: '2025-02-22', paidAmount: 0, remainingAmount: 6696, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0021', vendorNumber: 'VND-021', vendorName: 'DHL Express USA', invoiceDate: '2025-02-22', dueDate: '2025-03-24', postingDate: '2025-02-23', amount: 4500, taxAmount: 360, totalAmount: 4860, currency: 'USD', status: 'Partially Paid', description: 'International Express Shipping', poReference: 'PO-2025-021', glAccount: '660000', costCenter: 'CC-3000', paymentMethod: 'Credit Card', approvedBy: 'Lisa Brown', approvedDate: '2025-02-24', paidAmount: 2000, remainingAmount: 2860, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0022', vendorNumber: 'VND-022', vendorName: 'AT&T Services Inc', invoiceDate: '2025-02-25', dueDate: '2025-03-27', postingDate: '2025-02-26', amount: 15000, taxAmount: 1200, totalAmount: 16200, currency: 'USD', status: 'Pending Approval', description: 'Telecommunications Services - Feb', poReference: 'PO-2025-022', glAccount: '620000', costCenter: 'CC-4000', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 16200, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0023', vendorNumber: 'VND-023', vendorName: 'Verizon Business', invoiceDate: '2025-02-27', dueDate: '2025-03-29', postingDate: '2025-02-28', amount: 12000, taxAmount: 960, totalAmount: 12960, currency: 'USD', status: 'Draft', description: 'Enterprise Data Services', poReference: 'PO-2025-023', glAccount: '620000', costCenter: 'CC-4000', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 12960, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0024', vendorNumber: 'VND-024', vendorName: 'T-Mobile USA Inc', invoiceDate: '2025-01-05', dueDate: '2025-02-04', postingDate: '2025-01-06', amount: 8500, taxAmount: 680, totalAmount: 9180, currency: 'USD', status: 'Overdue', description: 'Mobile Device Management Services', poReference: 'PO-2025-024', glAccount: '620000', costCenter: 'CC-4000', paymentMethod: 'Credit Card', approvedBy: 'John Smith', approvedDate: '2025-01-07', paidAmount: 0, remainingAmount: 9180, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0025', vendorNumber: 'VND-025', vendorName: 'Office Depot Inc', invoiceDate: '2025-02-01', dueDate: '2025-03-03', postingDate: '2025-02-02', amount: 3500, taxAmount: 280, totalAmount: 3780, currency: 'USD', status: 'Paid', description: 'Office Supplies', poReference: 'PO-2025-025', glAccount: '680000', costCenter: 'CC-4000', paymentMethod: 'Credit Card', approvedBy: 'Sarah Johnson', approvedDate: '2025-02-03', paidAmount: 3780, remainingAmount: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0026', vendorNumber: 'VND-026', vendorName: 'Staples Inc', invoiceDate: '2025-02-05', dueDate: '2025-03-07', postingDate: '2025-02-06', amount: 2800, taxAmount: 224, totalAmount: 3024, currency: 'USD', status: 'Approved', description: 'Business Supplies', poReference: 'PO-2025-026', glAccount: '680000', costCenter: 'CC-4000', paymentMethod: 'Credit Card', approvedBy: 'Mike Wilson', approvedDate: '2025-02-07', paidAmount: 0, remainingAmount: 3024, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0027', vendorNumber: 'VND-027', vendorName: 'Grainger Inc', invoiceDate: '2025-02-10', dueDate: '2025-03-12', postingDate: '2025-02-11', amount: 15000, taxAmount: 1200, totalAmount: 16200, currency: 'USD', status: 'Pending Approval', description: 'Industrial Supplies and Equipment', poReference: 'PO-2025-027', glAccount: '650000', costCenter: 'CC-2000', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 16200, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0028', vendorNumber: 'VND-028', vendorName: 'CDK Global LLC', invoiceDate: '2025-02-12', dueDate: '2025-03-14', postingDate: '2025-02-13', amount: 9500, taxAmount: 760, totalAmount: 10260, currency: 'USD', status: 'Approved', description: 'Dealer Management System', poReference: 'PO-2025-028', glAccount: '150000', costCenter: 'CC-3000', paymentMethod: 'Bank Transfer', approvedBy: 'Lisa Brown', approvedDate: '2025-02-14', paidAmount: 0, remainingAmount: 10260, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0029', vendorNumber: 'VND-029', vendorName: 'Thomson Reuters Corp', invoiceDate: '2025-02-15', dueDate: '2025-03-17', postingDate: '2025-02-16', amount: 7500, taxAmount: 600, totalAmount: 8100, currency: 'USD', status: 'Draft', description: 'Legal Research Platform', poReference: 'PO-2025-029', glAccount: '670000', costCenter: 'CC-4000', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 8100, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'INV-2025-0030', vendorNumber: 'VND-030', vendorName: 'WEX Health Inc', invoiceDate: '2025-02-18', dueDate: '2025-03-20', postingDate: '2025-02-19', amount: 5500, taxAmount: 440, totalAmount: 5940, currency: 'USD', status: 'Pending Approval', description: 'Benefits Administration Platform', poReference: 'PO-2025-030', glAccount: '600000', costCenter: 'CC-4000', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 5940, createdAt: now },
  ];
};

const AccountsPayable: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('invoices');
  const [vendors, setVendors] = useState<Vendor[]>(() => seedVendors());
  const [invoices, setInvoices] = useState<Invoice[]>(() => seedInvoices(seedVendors()));
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const vendorForm = useForm<z.infer<typeof vendorSchema>>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      paymentTerms: 'Net 30',
      currency: 'USD',
      creditLimit: 0,
    },
  });

  const invoiceForm = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      taxAmount: 0,
      poReference: '',
      costCenter: '',
      paymentMethod: 'Bank Transfer',
    },
  });

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Accounts Payable. Manage vendor invoices, payments, and maintain vendor master data.');
    }
  }, [isEnabled, speak]);

  const loadData = () => {
    setIsLoading(true);
    setVendors(seedVendors());
    setInvoices(seedInvoices(seedVendors()));
    setIsLoading(false);
  };

  const saveInvoices = (data: Invoice[]) => {
    setInvoices(data);
  };

  const onSubmitVendor = (data: z.infer<typeof vendorSchema>) => {
    const newVendor: Vendor = {
      id: generateId('vnd'),
      vendorNumber: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      country: data.country || '',
      taxId: data.taxId || '',
      paymentTerms: data.paymentTerms,
      currency: data.currency,
      creditLimit: data.creditLimit,
      bankName: data.bankName || '',
      bankAccount: data.bankAccount || '',
      iban: data.iban || '',
      swift: data.swift || '',
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    const updatedVendors = [...vendors, newVendor];
    setVendors(updatedVendors);
    
    toast({
      title: 'Vendor Created',
      description: `Vendor ${data.name} has been created successfully.`,
    });
    
    setIsVendorDialogOpen(false);
    vendorForm.reset();
  };

  const onSubmitInvoice = (data: z.infer<typeof invoiceSchema>) => {
    const vendor = vendors.find(v => v.vendorNumber === data.vendorNumber);
    const totalAmount = data.amount + data.taxAmount;
    
    const newInvoice: Invoice = {
      id: generateId('inv'),
      invoiceNumber: `INV-2025-${String(invoices.length + 1).padStart(4, '0')}`,
      vendorNumber: data.vendorNumber,
      vendorName: vendor?.name || 'Unknown',
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      postingDate: new Date().toISOString().split('T')[0],
      amount: data.amount,
      taxAmount: data.taxAmount,
      totalAmount,
      currency: vendor?.currency || 'USD',
      status: 'Draft',
      description: data.description,
      poReference: data.poReference || '',
      glAccount: data.glAccount,
      costCenter: data.costCenter || '',
      paymentMethod: data.paymentMethod,
      paidAmount: 0,
      remainingAmount: totalAmount,
      createdAt: new Date().toISOString(),
    };

    const updatedInvoices = [...invoices, newInvoice];
    saveInvoices(updatedInvoices);
    
    toast({
      title: 'Invoice Created',
      description: `Invoice ${newInvoice.invoiceNumber} has been created successfully.`,
    });
    
    setIsInvoiceDialogOpen(false);
    invoiceForm.reset();
  };

  const approveInvoice = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, status: 'Approved' as const, approvedBy: 'Current User', approvedDate: new Date().toISOString().split('T')[0] }
        : inv
    );
    saveInvoices(updatedInvoices);
    toast({ title: 'Invoice Approved', description: `Invoice ${invoice.invoiceNumber} has been approved.` });
  };

  const payInvoice = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, status: 'Paid' as const, paidAmount: inv.totalAmount, remainingAmount: 0 }
        : inv
    );
    saveInvoices(updatedInvoices);
    toast({ title: 'Payment Processed', description: `Payment for ${invoice.invoiceNumber} has been processed.` });
  };

  const deleteInvoice = (invoice: Invoice) => {
    if (invoice.status !== 'Draft') {
      toast({ title: 'Cannot Delete', description: 'Only draft invoices can be deleted.', variant: 'destructive' });
      return;
    }
    const updatedInvoices = invoices.filter(inv => inv.id !== invoice.id);
    saveInvoices(updatedInvoices);
    toast({ title: 'Invoice Deleted', description: `Invoice ${invoice.invoiceNumber} has been deleted.` });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Pending Approval': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'Paid': 'bg-green-100 text-green-800',
      'Overdue': 'bg-red-100 text-red-800',
      'Partially Paid': 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const invoiceColumns: EnhancedColumn<Record<string, unknown>>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true, searchable: true },
    { key: 'vendorName', header: 'Vendor', searchable: true },
    { key: 'invoiceDate', header: 'Invoice Date', sortable: true },
    { key: 'dueDate', header: 'Due Date', sortable: true },
    { 
      key: 'totalAmount', 
      header: 'Amount',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'remainingAmount', 
      header: 'Balance Due',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    },
    {
      key: 'status',
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Draft', value: 'Draft' },
        { label: 'Pending', value: 'Pending Approval' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Paid', value: 'Paid' },
        { label: 'Overdue', value: 'Overdue' },
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      )
    },
    { key: 'poReference', header: 'PO Reference', searchable: true },
  ];

  const invoiceActions: TableAction<Record<string, unknown>>[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: Record<string, unknown>) => {
        toast({ title: 'View Invoice', description: `Opening ${row.invoiceNumber}` });
      },
      variant: 'ghost'
    },
    {
      label: 'Approve',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (row: Record<string, unknown>) => {
        approveInvoice(row as unknown as Invoice);
      },
      variant: 'ghost',
      condition: (row: Record<string, unknown>) => row.status === 'Pending Approval'
    },
    {
      label: 'Pay',
      icon: <DollarSign className="h-4 w-4" />,
      onClick: (row: Record<string, unknown>) => {
        payInvoice(row as unknown as Invoice);
      },
      variant: 'ghost',
      condition: (row: Record<string, unknown>) => row.status === 'Approved' || row.status === 'Partially Paid'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Record<string, unknown>) => {
        if (confirm(`Delete invoice ${row.invoiceNumber}?`)) {
          deleteInvoice(row as unknown as Invoice);
        }
      },
      variant: 'ghost',
      condition: (row: Record<string, unknown>) => row.status === 'Draft'
    }
  ];

  const vendorColumns: EnhancedColumn<Record<string, unknown>>[] = [
    { key: 'vendorNumber', header: 'Vendor #', sortable: true, searchable: true },
    { key: 'name', header: 'Vendor Name', searchable: true },
    { key: 'email', header: 'Email', searchable: true },
    { key: 'city', header: 'City', searchable: true },
    { key: 'country', header: 'Country', searchable: true },
    { 
      key: 'creditLimit', 
      header: 'Credit Limit',
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { key: 'paymentTerms', header: 'Terms' },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <Badge className={value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {value}
        </Badge>
      )
    },
  ];

  const apSummary = useMemo(() => {
    const totalPayable = invoices.filter(inv => inv.status !== 'Paid').reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const overdueAmount = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const pendingApproval = invoices.filter(inv => inv.status === 'Pending Approval').length;
    const approved = invoices.filter(inv => inv.status === 'Approved').length;
    return { totalPayable, overdueAmount, pendingApproval, approved };
  }, [invoices]);

  const agingAnalysis = useMemo(() => {
    const today = new Date();
    return {
      current: invoices.filter(inv => inv.status !== 'Paid' && new Date(inv.dueDate) >= today).reduce((sum, inv) => sum + inv.remainingAmount, 0),
      days30: invoices.filter(inv => {
        const dueDate = new Date(inv.dueDate);
        const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return inv.status !== 'Paid' && diffDays > 0 && diffDays <= 30;
      }).reduce((sum, inv) => sum + inv.remainingAmount, 0),
      days60: invoices.filter(inv => {
        const dueDate = new Date(inv.dueDate);
        const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return inv.status !== 'Paid' && diffDays > 30 && diffDays <= 60;
      }).reduce((sum, inv) => sum + inv.remainingAmount, 0),
      days90: invoices.filter(inv => {
        const dueDate = new Date(inv.dueDate);
        const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return inv.status !== 'Paid' && diffDays > 60 && diffDays <= 90;
      }).reduce((sum, inv) => sum + inv.remainingAmount, 0),
      over90: invoices.filter(inv => {
        const dueDate = new Date(inv.dueDate);
        const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return inv.status !== 'Paid' && diffDays > 90;
      }).reduce((sum, inv) => sum + inv.remainingAmount, 0),
    };
  }, [invoices]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Accounts Payable data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/finance')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="Accounts Payable"
          description="Manage vendor invoices, payments, and vendor master data with full CRUD operations"
          voiceIntroduction="Welcome to Accounts Payable module."
        />
      </div>

      <VoiceTrainingComponent 
        module="finance"
        topic="Accounts Payable Management"
        examples={[
          "Managing vendor master data with payment terms, credit limits, and banking details",
          "Processing vendor invoices with approval workflows and three-way matching",
          "Executing payments and maintaining vendor relationships with timely settlements"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">${apSummary.totalPayable.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Payable</div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">${apSummary.overdueAmount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{apSummary.pendingApproval}</div>
                <div className="text-sm text-muted-foreground">Pending Approval</div>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{vendors.length}</div>
                <div className="text-sm text-muted-foreground">Active Vendors</div>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Master</TabsTrigger>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Vendor Invoices ({invoices.length})</span>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={loadData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="h-4 w-4 mr-2" />Create Invoice</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Vendor Invoice</DialogTitle>
                      </DialogHeader>
                      <Form {...invoiceForm}>
                        <form onSubmit={invoiceForm.handleSubmit(onSubmitInvoice)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={invoiceForm.control}
                              name="vendorNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vendor</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {vendors.filter(v => v.status === 'Active').map(v => (
                                        <SelectItem key={v.id} value={v.vendorNumber}>{v.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={invoiceForm.control}
                              name="glAccount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>GL Account</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger><SelectValue placeholder="Select GL" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="200000">200000 - Accounts Payable</SelectItem>
                                      <SelectItem value="160000">160000 - Fixed Assets</SelectItem>
                                      <SelectItem value="150000">150000 - Prepaid Expenses</SelectItem>
                                      <SelectItem value="500000">500000 - COGS</SelectItem>
                                      <SelectItem value="600000">600000 - Salaries</SelectItem>
                                      <SelectItem value="620000">620000 - Utilities</SelectItem>
                                      <SelectItem value="650000">650000 - Maintenance</SelectItem>
                                      <SelectItem value="660000">660000 - Travel</SelectItem>
                                      <SelectItem value="670000">670000 - Professional Services</SelectItem>
                                      <SelectItem value="680000">680000 - Office Supplies</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={invoiceForm.control}
                              name="invoiceDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Invoice Date</FormLabel>
                                  <FormControl><Input type="date" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={invoiceForm.control}
                              name="dueDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Due Date</FormLabel>
                                  <FormControl><Input type="date" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={invoiceForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount</FormLabel>
                                  <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={invoiceForm.control}
                              name="taxAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tax Amount</FormLabel>
                                  <FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={invoiceForm.control}
                              name="poReference"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>PO Reference</FormLabel>
                                  <FormControl><Input placeholder="PO-2025-XXX" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={invoiceForm.control}
                              name="costCenter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cost Center</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger><SelectValue placeholder="Select CC" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="CC-1000">CC-1000 - Sales</SelectItem>
                                      <SelectItem value="CC-2000">CC-2000 - Production</SelectItem>
                                      <SelectItem value="CC-3000">CC-3000 - Procurement</SelectItem>
                                      <SelectItem value="CC-4000">CC-4000 - Administration</SelectItem>
                                      <SelectItem value="CC-5000">CC-5000 - Finance</SelectItem>
                                      <SelectItem value="CC-6000">CC-6000 - Marketing</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={invoiceForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Input placeholder="Invoice description" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={invoiceForm.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                                    <SelectItem value="Check">Check</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Invoice</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={invoiceColumns}
                data={invoices as unknown as Record<string, unknown>[]}
                actions={invoiceActions}
                searchPlaceholder="Search invoices..."
                exportable={true}
                refreshable={true}
                onRefresh={loadData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Vendor Master Data ({vendors.length})</span>
                <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" />Add Vendor</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Vendor</DialogTitle>
                    </DialogHeader>
                    <Form {...vendorForm}>
                      <form onSubmit={vendorForm.handleSubmit(onSubmitVendor)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={vendorForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Vendor Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={vendorForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={vendorForm.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={vendorForm.control} name="taxId" render={({ field }) => (
                            <FormItem><FormLabel>Tax ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <FormField control={vendorForm.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={vendorForm.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={vendorForm.control} name="country" render={({ field }) => (
                            <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={vendorForm.control} name="paymentTerms" render={({ field }) => (
                            <FormItem><FormLabel>Payment Terms</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="Net 15">Net 15</SelectItem>
                                  <SelectItem value="Net 30">Net 30</SelectItem>
                                  <SelectItem value="Net 45">Net 45</SelectItem>
                                  <SelectItem value="Net 60">Net 60</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage /></FormItem>
                          )} />
                          <FormField control={vendorForm.control} name="currency" render={({ field }) => (
                            <FormItem><FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage /></FormItem>
                          )} />
                        </div>
                        <FormField control={vendorForm.control} name="creditLimit" render={({ field }) => (
                          <FormItem><FormLabel>Credit Limit</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsVendorDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Create Vendor</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={vendorColumns}
                data={vendors as unknown as Record<string, unknown>[]}
                searchPlaceholder="Search vendors..."
                exportable={true}
                refreshable={true}
                onRefresh={loadData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Current</div>
                <div className="text-2xl font-bold text-green-600">${agingAnalysis.current.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">1-30 Days</div>
                <div className="text-2xl font-bold text-yellow-600">${agingAnalysis.days30.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">31-60 Days</div>
                <div className="text-2xl font-bold text-orange-600">${agingAnalysis.days60.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">61-90 Days</div>
                <div className="text-2xl font-bold text-red-600">${agingAnalysis.days90.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Over 90 Days</div>
                <div className="text-2xl font-bold text-red-800">${agingAnalysis.over90.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountsPayable;
