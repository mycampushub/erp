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
import { ArrowLeft, Plus, FileText, DollarSign, Clock, CheckCircle, AlertTriangle, Eye, Edit, Trash2, Download, RefreshCw, CreditCard, Building, Mail, Phone, MapPin, User, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export interface Customer {
  id: string;
  customerNumber: string;
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
  creditRating: string;
  industry: string;
  salesRep: string;
  status: 'Active' | 'Blocked' | 'On Hold';
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  postingDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Sent' | 'Paid' | 'Overdue' | 'Partially Paid';
  description: string;
  soReference: string;
  salesRep: string;
  paymentMethod: string;
  approvedBy?: string;
  approvedDate?: string;
  paidAmount: number;
  remainingAmount: number;
  dunningLevel: number;
  lastDunningDate?: string;
  createdAt: string;
}

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  currency: z.string().min(1, 'Currency is required'),
  creditLimit: z.number().min(0, 'Credit limit must be positive'),
  creditRating: z.string().optional(),
  industry: z.string().optional(),
  salesRep: z.string().optional(),
});

const invoiceSchema = z.object({
  customerNumber: z.string().min(1, 'Customer is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  taxAmount: z.number().min(0, 'Tax amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  soReference: z.string().optional(),
  salesRep: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

const seedCustomers = (): Customer[] => {
  const now = new Date().toISOString();
  return [
    { id: generateId('cus'), customerNumber: 'CUS-001', name: 'Acme Corporation', email: 'accounts@acme.com', phone: '+1-212-555-0100', address: '350 Fifth Avenue', city: 'New York', country: 'USA', taxId: '13-1234567', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 500000, creditRating: 'AAA', industry: 'Manufacturing', salesRep: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-002', name: 'Global Manufacturing Ltd', email: 'ar@globalmanuf.com', phone: '+1-312-555-0200', address: '233 S Wacker Drive', city: 'Chicago', country: 'USA', taxId: '36-2345678', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 750000, creditRating: 'AA+', industry: 'Manufacturing', salesRep: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-003', name: 'TechStart Inc', email: 'billing@techstart.io', phone: '+1-650-555-0300', address: '1 Apple Park Way', city: 'Cupertino', country: 'USA', taxId: '94-3456789', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 300000, creditRating: 'A', industry: 'Technology', salesRep: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-004', name: 'Enterprise Solutions Group', email: 'payments@entsolutions.com', phone: '+1-408-555-0400', address: '1600 Amphitheatre Parkway', city: 'Mountain View', country: 'USA', taxId: '77-4567890', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 450000, creditRating: 'AA', industry: 'Technology', salesRep: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-005', name: 'Alpha Industries', email: 'accounting@alphaind.com', phone: '+1-214-555-0500', address: '1 Microsoft Way', city: 'Redmond', country: 'USA', taxId: '91-5678901', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 600000, creditRating: 'AA+', industry: 'Manufacturing', salesRep: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-006', name: 'Beta Healthcare Systems', email: 'billing@betahealth.org', phone: '+1-617-555-0600', address: '1 Harvard Way', city: 'Boston', country: 'USA', taxId: '04-6789012', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 850000, creditRating: 'AAA', industry: 'Healthcare', salesRep: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-007', name: 'Gamma Retail Holdings', email: 'payments@gammaretail.com', phone: '+1-404-555-0700', address: '191 Peachtree Street', city: 'Atlanta', country: 'USA', taxId: '58-7890123', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 400000, creditRating: 'A+', industry: 'Retail', salesRep: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-008', name: 'Delta Financial Services', email: 'ar@deltafin.com', phone: '+1-212-555-0800', address: '200 Vesey Street', city: 'New York', country: 'USA', taxId: '13-8901234', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 1000000, creditRating: 'AAA', industry: 'Finance', salesRep: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-009', name: 'Epsilon Logistics', email: 'billing@epsilonlog.com', phone: '+1-847-555-0900', address: '150 N Riverside Plaza', city: 'Chicago', country: 'USA', taxId: '36-9012345', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 350000, creditRating: 'BBB+', industry: 'Logistics', salesRep: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-010', name: 'Zeta Construction Group', email: 'payments@zetaconst.com', phone: '+1-305-555-1000', address: '1111 Brickell Avenue', city: 'Miami', country: 'USA', taxId: '59-0123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 550000, creditRating: 'AA', industry: 'Construction', salesRep: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-011', name: 'Eta Consulting Partners', email: 'ar@etaconsult.com', phone: '+1-617-555-1100', address: '100 Summer Street', city: 'Boston', country: 'USA', taxId: '04-1123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 280000, creditRating: 'A', industry: 'Consulting', salesRep: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-012', name: 'Theta Media Group', email: 'billing@thetamedia.com', phone: '+1-310-555-1200', address: '2049 Century Park East', city: 'Los Angeles', country: 'USA', taxId: '95-2123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 420000, creditRating: 'AA-', industry: 'Media', salesRep: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-013', name: 'Iota Pharmaceuticals', email: 'payments@iotapharma.com', phone: '+1-609-555-1300', address: '1 Princeton Way', city: 'Princeton', country: 'USA', taxId: '22-3123456', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 900000, creditRating: 'AAA', industry: 'Pharmaceuticals', salesRep: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-014', name: 'Kappa Energy Corp', email: 'ar@kappaenergy.com', phone: '+1-713-555-1400', address: '1000 Louisiana Street', city: 'Houston', country: 'USA', taxId: '76-4123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 1200000, creditRating: 'AAA', industry: 'Energy', salesRep: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-015', name: 'Lambda Software Solutions', email: 'billing@lambdasoft.com', phone: '+1-425-555-1500', address: '15600 NE 36th Way', city: 'Redmond', country: 'USA', taxId: '91-5123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 380000, creditRating: 'A+', industry: 'Technology', salesRep: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-016', name: 'Mu Automotive Inc', email: 'payments@muauto.com', phone: '+1-248-555-1600', address: '1 American Drive', city: 'Detroit', country: 'USA', taxId: '38-6123456', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 750000, creditRating: 'AA', industry: 'Automotive', salesRep: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-017', name: 'Nu Food Services LLC', email: 'ar@nufood.com', phone: '+1-614-555-1700', address: '1 Miranova Place', city: 'Columbus', country: 'USA', taxId: '31-7123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 180000, creditRating: 'BBB', industry: 'Food Services', salesRep: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-018', name: 'Xi Telecommunications', email: 'billing@xitel.com', phone: '+1-202-555-1800', address: '1200 G Street NW', city: 'Washington', country: 'USA', taxId: '53-8123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 650000, creditRating: 'AA+', industry: 'Telecommunications', salesRep: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-019', name: 'Omicron Real Estate Holdings', email: 'payments@omicronre.com', phone: '+1-312-555-1900', address: '200 E Randolph Street', city: 'Chicago', country: 'USA', taxId: '36-9123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 800000, creditRating: 'AA', industry: 'Real Estate', salesRep: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-020', name: 'Pi Education Group', email: 'ar@piedu.com', phone: '+1-617-555-2000', address: '1320 Main Street', city: 'Cambridge', country: 'USA', taxId: '04-0123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 220000, creditRating: 'A', industry: 'Education', salesRep: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-021', name: 'Rho Insurance Services', email: 'payments@rhoins.com', phone: '+1-678-555-2100', address: '191 Peachtree Street NE', city: 'Atlanta', country: 'USA', taxId: '58-1123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 550000, creditRating: 'AA+', industry: 'Insurance', salesRep: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-022', name: 'Sigma Aerospace Ltd', email: 'billing@sigmaaerospace.com', phone: '+1-206-555-2200', address: '929 108th Avenue NE', city: 'Bellevue', country: 'USA', taxId: '91-2123456', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 950000, creditRating: 'AAA', industry: 'Aerospace', salesRep: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-023', name: 'Tau Biotech Inc', email: 'ar@taubiotech.com', phone: '+1-858-555-2300', address: '10188 Teledyne Way', city: 'San Diego', country: 'USA', taxId: '95-3123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 480000, creditRating: 'AA-', industry: 'Biotechnology', salesRep: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-024', name: 'Upsilon Defense Contractors', email: 'payments@upsilondc.com', phone: '+1-703-555-2400', address: '800 N Glebe Road', city: 'Arlington', country: 'USA', taxId: '54-4123456', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 1500000, creditRating: 'AAA', industry: 'Defense', salesRep: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-025', name: 'Phi Hospitality Group', email: 'billing@phihospitality.com', phone: '+1-702-555-2500', address: '3500 Las Vegas Boulevard', city: 'Las Vegas', country: 'USA', taxId: '88-5123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 420000, creditRating: 'A+', industry: 'Hospitality', salesRep: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-026', name: 'Chi Mining Corporation', email: 'ar@chiming.com', phone: '+1-303-555-2600', address: '1700 Lincoln Street', city: 'Denver', country: 'USA', taxId: '84-6123456', paymentTerms: 'Net 45', currency: 'USD', creditLimit: 1100000, creditRating: 'AA+', industry: 'Mining', salesRep: 'Sarah Johnson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-027', name: 'Psi Transportation Inc', email: 'payments@psitrans.com', phone: '+1-901-555-2700', address: '100 N Main Street', city: 'Memphis', country: 'USA', taxId: '47-7123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 320000, creditRating: 'BBB+', industry: 'Transportation', salesRep: 'Mike Wilson', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-028', name: 'Omega Government Solutions', email: 'billing@omeg govt.com', phone: '+1-240-555-2800', address: '7500 Greenway Center Drive', city: 'Greenbelt', country: 'USA', taxId: '52-8123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 700000, creditRating: 'AA', industry: 'Government', salesRep: 'Lisa Brown', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-029', name: 'Starter Ventures LLC', email: 'ar@starterventures.com', phone: '+1-408-555-2900', address: '3000 El Camino Real', city: 'Palo Alto', country: 'USA', taxId: '77-9123456', paymentTerms: 'Net 15', currency: 'USD', creditLimit: 100000, creditRating: 'B', industry: 'Startups', salesRep: 'John Smith', status: 'Active', createdAt: now },
    { id: generateId('cus'), customerNumber: 'CUS-030', name: 'Non-Profit Foundation', email: 'billing@nonprofit.org', phone: '+1-202-555-3000', address: '1300 L Street NW', city: 'Washington', country: 'USA', taxId: '53-0123456', paymentTerms: 'Net 30', currency: 'USD', creditLimit: 150000, creditRating: 'A', industry: 'Non-Profit', salesRep: 'Sarah Johnson', status: 'Active', createdAt: now },
  ];
};

const seedInvoices = (customers: Customer[]): Invoice[] => {
  const now = new Date().toISOString();
  
  return [
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0001', customerNumber: 'CUS-001', customerName: 'Acme Corporation', invoiceDate: '2025-01-05', dueDate: '2025-02-04', postingDate: '2025-01-06', amount: 45000, taxAmount: 3600, totalAmount: 48600, currency: 'USD', status: 'Paid', description: 'Product order - Q1 Supply', soReference: 'SO-2025-001', salesRep: 'John Smith', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-01-06', paidAmount: 48600, remainingAmount: 0, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0002', customerNumber: 'CUS-002', customerName: 'Global Manufacturing Ltd', invoiceDate: '2025-01-08', dueDate: '2025-02-22', postingDate: '2025-01-09', amount: 72000, taxAmount: 5760, totalAmount: 77760, currency: 'USD', status: 'Sent', description: 'Industrial equipment sale', soReference: 'SO-2025-002', salesRep: 'Sarah Johnson', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-01-09', paidAmount: 0, remainingAmount: 77760, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0003', customerNumber: 'CUS-003', customerName: 'TechStart Inc', invoiceDate: '2025-01-10', dueDate: '2025-02-09', postingDate: '2025-01-11', amount: 25000, taxAmount: 2000, totalAmount: 27000, currency: 'USD', status: 'Overdue', description: 'Software licensing', soReference: 'SO-2025-003', salesRep: 'Mike Wilson', paymentMethod: 'Credit Card', approvedBy: 'Finance Manager', approvedDate: '2025-01-11', paidAmount: 0, remainingAmount: 27000, dunningLevel: 2, lastDunningDate: '2025-02-15', createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0004', customerNumber: 'CUS-004', customerName: 'Enterprise Solutions Group', invoiceDate: '2025-01-12', dueDate: '2025-02-11', postingDate: '2025-01-13', amount: 85000, taxAmount: 6800, totalAmount: 91800, currency: 'USD', status: 'Paid', description: 'Enterprise software license', soReference: 'SO-2025-004', salesRep: 'Lisa Brown', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-01-13', paidAmount: 91800, remainingAmount: 0, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0005', customerNumber: 'CUS-005', customerName: 'Alpha Industries', invoiceDate: '2025-01-15', dueDate: '2025-03-01', postingDate: '2025-01-16', amount: 125000, taxAmount: 10000, totalAmount: 135000, currency: 'USD', status: 'Sent', description: 'Manufacturing supplies', soReference: 'SO-2025-005', salesRep: 'John Smith', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-01-16', paidAmount: 0, remainingAmount: 135000, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0006', customerNumber: 'CUS-006', customerName: 'Beta Healthcare Systems', invoiceDate: '2025-01-18', dueDate: '2025-02-17', postingDate: '2025-01-19', amount: 55000, taxAmount: 4400, totalAmount: 59400, currency: 'USD', status: 'Paid', description: 'Medical equipment', soReference: 'SO-2025-006', salesRep: 'Sarah Johnson', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-01-19', paidAmount: 59400, remainingAmount: 0, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0007', customerNumber: 'CUS-007', customerName: 'Gamma Retail Holdings', invoiceDate: '2025-01-20', dueDate: '2025-02-19', postingDate: '2025-01-21', amount: 38000, taxAmount: 3040, totalAmount: 41040, currency: 'USD', status: 'Partially Paid', description: 'Retail supplies', soReference: 'SO-2025-007', salesRep: 'Mike Wilson', paymentMethod: 'Credit Card', approvedBy: 'Finance Manager', approvedDate: '2025-01-21', paidAmount: 15000, remainingAmount: 26040, dunningLevel: 1, lastDunningDate: '2025-02-25', createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0008', customerNumber: 'CUS-008', customerName: 'Delta Financial Services', invoiceDate: '2025-01-22', dueDate: '2025-02-21', postingDate: '2025-01-23', amount: 95000, taxAmount: 7600, totalAmount: 102600, currency: 'USD', status: 'Paid', description: 'Financial software license', soReference: 'SO-2025-008', salesRep: 'Lisa Brown', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-01-23', paidAmount: 102600, remainingAmount: 0, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0009', customerNumber: 'CUS-009', customerName: 'Epsilon Logistics', invoiceDate: '2025-01-25', dueDate: '2025-03-11', postingDate: '2025-01-26', amount: 42000, taxAmount: 3360, totalAmount: 45360, currency: 'USD', status: 'Pending Approval', description: 'Logistics software', soReference: 'SO-2025-009', salesRep: 'John Smith', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 45360, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0010', customerNumber: 'CUS-010', customerName: 'Zeta Construction Group', invoiceDate: '2025-01-28', dueDate: '2025-02-27', postingDate: '2025-01-29', amount: 68000, taxAmount: 5440, totalAmount: 73440, currency: 'USD', status: 'Sent', description: 'Construction materials', soReference: 'SO-2025-010', salesRep: 'Sarah Johnson', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-01-29', paidAmount: 0, remainingAmount: 73440, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0011', customerNumber: 'CUS-011', customerName: 'Eta Consulting Partners', invoiceDate: '2025-01-30', dueDate: '2025-03-01', postingDate: '2025-01-31', amount: 28000, taxAmount: 2240, totalAmount: 30240, currency: 'USD', status: 'Draft', description: 'Consulting services', soReference: 'SO-2025-011', salesRep: 'Mike Wilson', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 30240, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0012', customerNumber: 'CUS-012', customerName: 'Theta Media Group', invoiceDate: '2025-02-01', dueDate: '2025-03-03', postingDate: '2025-02-02', amount: 52000, taxAmount: 4160, totalAmount: 56160, currency: 'USD', status: 'Sent', description: 'Media production services', soReference: 'SO-2025-012', salesRep: 'Lisa Brown', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-02', paidAmount: 0, remainingAmount: 56160, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0013', customerNumber: 'CUS-013', customerName: 'Iota Pharmaceuticals', invoiceDate: '2025-02-03', dueDate: '2025-03-20', postingDate: '2025-02-04', amount: 150000, taxAmount: 12000, totalAmount: 162000, currency: 'USD', status: 'Pending Approval', description: 'Pharmaceutical supplies', soReference: 'SO-2025-013', salesRep: 'John Smith', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 162000, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0014', customerNumber: 'CUS-014', customerName: 'Kappa Energy Corp', invoiceDate: '2025-02-05', dueDate: '2025-03-07', postingDate: '2025-02-06', amount: 280000, taxAmount: 22400, totalAmount: 302400, currency: 'USD', status: 'Sent', description: 'Energy equipment', soReference: 'SO-2025-014', salesRep: 'Sarah Johnson', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-06', paidAmount: 0, remainingAmount: 302400, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0015', customerNumber: 'CUS-015', customerName: 'Lambda Software Solutions', invoiceDate: '2025-02-08', dueDate: '2025-03-10', postingDate: '2025-02-09', amount: 35000, taxAmount: 2800, totalAmount: 37800, currency: 'USD', status: 'Paid', description: 'Software development', soReference: 'SO-2025-015', salesRep: 'Mike Wilson', paymentMethod: 'Credit Card', approvedBy: 'Finance Manager', approvedDate: '2025-02-09', paidAmount: 37800, remainingAmount: 0, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0016', customerNumber: 'CUS-016', customerName: 'Mu Automotive Inc', invoiceDate: '2025-02-10', dueDate: '2025-03-27', postingDate: '2025-02-11', amount: 185000, taxAmount: 14800, totalAmount: 199800, currency: 'USD', status: 'Approved', description: 'Auto parts supply', soReference: 'SO-2025-016', salesRep: 'Lisa Brown', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-11', paidAmount: 0, remainingAmount: 199800, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0017', customerNumber: 'CUS-017', customerName: 'Nu Food Services LLC', invoiceDate: '2025-02-12', dueDate: '2025-03-14', postingDate: '2025-02-13', amount: 22000, taxAmount: 1760, totalAmount: 23760, currency: 'USD', status: 'Approved', description: 'Food service equipment', soReference: 'SO-2025-017', salesRep: 'John Smith', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-13', paidAmount: 0, remainingAmount: 23760, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0018', customerNumber: 'CUS-018', customerName: 'Xi Telecommunications', invoiceDate: '2025-02-15', dueDate: '2025-03-17', postingDate: '2025-02-16', amount: 75000, taxAmount: 6000, totalAmount: 81000, currency: 'USD', status: 'Sent', description: 'Telecom infrastructure', soReference: 'SO-2025-018', salesRep: 'Sarah Johnson', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-16', paidAmount: 0, remainingAmount: 81000, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0019', customerNumber: 'CUS-019', customerName: 'Omicron Real Estate Holdings', invoiceDate: '2025-02-18', dueDate: '2025-03-20', postingDate: '2025-02-19', amount: 45000, taxAmount: 3600, totalAmount: 48600, currency: 'USD', status: 'Paid', description: 'Property management software', soReference: 'SO-2025-019', salesRep: 'Mike Wilson', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-19', paidAmount: 48600, remainingAmount: 0, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0020', customerNumber: 'CUS-020', customerName: 'Pi Education Group', invoiceDate: '2025-02-20', dueDate: '2025-03-22', postingDate: '2025-02-21', amount: 18000, taxAmount: 1440, totalAmount: 19440, currency: 'USD', status: 'Sent', description: 'Educational materials', soReference: 'SO-2025-020', salesRep: 'Lisa Brown', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-21', paidAmount: 0, remainingAmount: 19440, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0021', customerNumber: 'CUS-021', customerName: 'Rho Insurance Services', invoiceDate: '2025-02-22', dueDate: '2025-03-24', postingDate: '2025-02-23', amount: 32000, taxAmount: 2560, totalAmount: 34560, currency: 'USD', status: 'Approved', description: 'Insurance software license', soReference: 'SO-2025-021', salesRep: 'John Smith', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-23', paidAmount: 0, remainingAmount: 34560, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0022', customerNumber: 'CUS-022', customerName: 'Sigma Aerospace Ltd', invoiceDate: '2025-02-25', dueDate: '2025-04-11', postingDate: '2025-02-26', amount: 220000, taxAmount: 17600, totalAmount: 237600, currency: 'USD', status: 'Pending Approval', description: 'Aerospace components', soReference: 'SO-2025-022', salesRep: 'Sarah Johnson', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 237600, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0023', customerNumber: 'CUS-023', customerName: 'Tau Biotech Inc', invoiceDate: '2025-01-05', dueDate: '2025-02-04', postingDate: '2025-01-06', amount: 65000, taxAmount: 5200, totalAmount: 70200, currency: 'USD', status: 'Overdue', description: 'Biotech research equipment', soReference: 'SO-2025-023', salesRep: 'Mike Wilson', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-01-06', paidAmount: 0, remainingAmount: 70200, dunningLevel: 3, lastDunningDate: '2025-02-20', createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0024', customerNumber: 'CUS-024', customerName: 'Upsilon Defense Contractors', invoiceDate: '2025-02-10', dueDate: '2025-03-27', postingDate: '2025-02-11', amount: 350000, taxAmount: 28000, totalAmount: 378000, currency: 'USD', status: 'Approved', description: 'Defense systems', soReference: 'SO-2025-024', salesRep: 'Lisa Brown', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-11', paidAmount: 0, remainingAmount: 378000, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0025', customerNumber: 'CUS-025', customerName: 'Phi Hospitality Group', invoiceDate: '2025-02-12', dueDate: '2025-03-14', postingDate: '2025-02-13', amount: 28000, taxAmount: 2240, totalAmount: 30240, currency: 'USD', status: 'Sent', description: 'Hospitality solutions', soReference: 'SO-2025-025', salesRep: 'John Smith', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-13', paidAmount: 0, remainingAmount: 30240, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0026', customerNumber: 'CUS-026', customerName: 'Chi Mining Corporation', invoiceDate: '2025-02-15', dueDate: '2025-04-01', postingDate: '2025-02-16', amount: 175000, taxAmount: 14000, totalAmount: 189000, currency: 'USD', status: 'Pending Approval', description: 'Mining equipment', soReference: 'SO-2025-026', salesRep: 'Sarah Johnson', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 189000, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0027', customerNumber: 'CUS-027', customerName: 'Psi Transportation Inc', invoiceDate: '2025-02-18', dueDate: '2025-03-20', postingDate: '2025-02-19', amount: 24000, taxAmount: 1920, totalAmount: 25920, currency: 'USD', status: 'Sent', description: 'Transportation software', soReference: 'SO-2025-027', salesRep: 'Mike Wilson', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-19', paidAmount: 0, remainingAmount: 25920, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0028', customerNumber: 'CUS-028', customerName: 'Omega Government Solutions', invoiceDate: '2025-02-20', dueDate: '2025-03-22', postingDate: '2025-02-21', amount: 55000, taxAmount: 4400, totalAmount: 59400, currency: 'USD', status: 'Paid', description: 'Government IT services', soReference: 'SO-2025-028', salesRep: 'Lisa Brown', paymentMethod: 'Bank Transfer', approvedBy: 'Finance Manager', approvedDate: '2025-02-21', paidAmount: 59400, remainingAmount: 0, dunningLevel: 0, createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0029', customerNumber: 'CUS-029', customerName: 'Starter Ventures LLC', invoiceDate: '2025-02-22', dueDate: '2025-03-09', postingDate: '2025-02-23', amount: 12000, taxAmount: 960, totalAmount: 12960, currency: 'USD', status: 'Overdue', description: 'Startup package', soReference: 'SO-2025-029', salesRep: 'John Smith', paymentMethod: 'Credit Card', approvedBy: 'Finance Manager', approvedDate: '2025-02-23', paidAmount: 0, remainingAmount: 12960, dunningLevel: 1, lastDunningDate: '2025-03-10', createdAt: now },
    { id: generateId('inv'), invoiceNumber: 'AR-2025-0030', customerNumber: 'CUS-030', customerName: 'Non-Profit Foundation', invoiceDate: '2025-02-25', dueDate: '2025-03-27', postingDate: '2025-02-26', amount: 15000, taxAmount: 1200, totalAmount: 16200, currency: 'USD', status: 'Draft', description: 'Non-profit software donation', soReference: 'SO-2025-030', salesRep: 'Sarah Johnson', paymentMethod: 'Bank Transfer', paidAmount: 0, remainingAmount: 16200, dunningLevel: 0, createdAt: now },
  ];
};

const AccountsReceivable: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('invoices');
  const [customers, setCustomers] = useState<Customer[]>(() => seedCustomers());
  const [invoices, setInvoices] = useState<Invoice[]>(() => seedInvoices(seedCustomers()));
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const customerForm = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: { paymentTerms: 'Net 30', currency: 'USD', creditLimit: 0 },
  });

  const invoiceForm = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { taxAmount: 0, soReference: '', salesRep: '', paymentMethod: 'Bank Transfer' },
  });

  useEffect(() => {
    if (isEnabled) speak('Welcome to Accounts Receivable. Manage customer invoices, payments, and customer master data.');
  }, [isEnabled, speak]);

  const loadData = () => {
    setIsLoading(true);
    setCustomers(seedCustomers());
    setInvoices(seedInvoices(seedCustomers()));
    setIsLoading(false);
  };

  const saveInvoices = (data: Invoice[]) => {
    setInvoices(data);
  };

  const onSubmitCustomer = (data: z.infer<typeof customerSchema>) => {
    const newCustomer: Customer = {
      id: generateId('cus'),
      customerNumber: `CUS-${String(customers.length + 1).padStart(3, '0')}`,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      country: data.country || '',
      taxId: data.taxId || '',
      paymentTerms: data.paymentTerms,
      currency: data.currency,
      creditLimit: data.creditLimit,
      creditRating: data.creditRating || '',
      industry: data.industry || '',
      salesRep: data.salesRep || '',
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    toast({ title: 'Customer Created', description: `Customer ${data.name} has been created.` });
    setIsCustomerDialogOpen(false);
    customerForm.reset();
  };

  const onSubmitInvoice = (data: z.infer<typeof invoiceSchema>) => {
    const customer = customers.find(c => c.customerNumber === data.customerNumber);
    const totalAmount = data.amount + data.taxAmount;
    const newInvoice: Invoice = {
      id: generateId('inv'),
      invoiceNumber: `AR-2025-${String(invoices.length + 1).padStart(4, '0')}`,
      customerNumber: data.customerNumber,
      customerName: customer?.name || 'Unknown',
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      postingDate: new Date().toISOString().split('T')[0],
      amount: data.amount,
      taxAmount: data.taxAmount,
      totalAmount,
      currency: customer?.currency || 'USD',
      status: 'Draft',
      description: data.description,
      soReference: data.soReference || '',
      salesRep: data.salesRep || '',
      paymentMethod: data.paymentMethod,
      paidAmount: 0,
      remainingAmount: totalAmount,
      dunningLevel: 0,
      createdAt: new Date().toISOString(),
    };
    saveInvoices([...invoices, newInvoice]);
    toast({ title: 'Invoice Created', description: `Invoice ${newInvoice.invoiceNumber} created.` });
    setIsInvoiceDialogOpen(false);
    invoiceForm.reset();
  };

  const approveInvoice = (invoice: Invoice) => {
    saveInvoices(invoices.map(inv => inv.id === invoice.id ? { ...inv, status: 'Approved' as const, approvedBy: 'Finance Manager', approvedDate: new Date().toISOString().split('T')[0] } : inv));
    toast({ title: 'Invoice Approved', description: `Invoice ${invoice.invoiceNumber} approved.` });
  };

  const sendInvoice = (invoice: Invoice) => {
    saveInvoices(invoices.map(inv => inv.id === invoice.id ? { ...inv, status: 'Sent' as const } : inv));
    toast({ title: 'Invoice Sent', description: `Invoice ${invoice.invoiceNumber} sent to customer.` });
  };

  const recordPayment = (invoice: Invoice, amount: number) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoice.id) {
        const newPaidAmount = inv.paidAmount + amount;
        const newRemaining = inv.totalAmount - newPaidAmount;
        return {
          ...inv,
          paidAmount: newPaidAmount,
          remainingAmount: newRemaining,
          status: newRemaining <= 0 ? 'Paid' as const : 'Partially Paid' as const,
        };
      }
      return inv;
    });
    saveInvoices(updated);
    toast({ title: 'Payment Recorded', description: `Payment of $${amount.toLocaleString()} recorded for ${invoice.invoiceNumber}.` });
  };

  const deleteInvoice = (invoice: Invoice) => {
    if (invoice.status !== 'Draft') {
      toast({ title: 'Cannot Delete', description: 'Only draft invoices can be deleted.', variant: 'destructive' });
      return;
    }
    saveInvoices(invoices.filter(inv => inv.id !== invoice.id));
    toast({ title: 'Invoice Deleted', description: `Invoice ${invoice.invoiceNumber} deleted.` });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800', 'Pending Approval': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-blue-100 text-blue-800', 'Sent': 'bg-purple-100 text-purple-800',
      'Paid': 'bg-green-100 text-green-800', 'Overdue': 'bg-red-100 text-red-800',
      'Partially Paid': 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const invoiceColumns: EnhancedColumn<Record<string, unknown>>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', sortable: true, searchable: true },
    { key: 'customerName', header: 'Customer', searchable: true },
    { key: 'invoiceDate', header: 'Invoice Date', sortable: true },
    { key: 'dueDate', header: 'Due Date', sortable: true },
    { key: 'totalAmount', header: 'Amount', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'remainingAmount', header: 'Balance Due', sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'status', header: 'Status', filterable: true, filterOptions: [{ label: 'Draft', value: 'Draft' }, { label: 'Sent', value: 'Sent' }, { label: 'Paid', value: 'Paid' }, { label: 'Overdue', value: 'Overdue' }], render: (v: string) => <Badge className={getStatusColor(v)}>{v}</Badge> },
    { key: 'dunningLevel', header: 'Dunning', render: (v: number) => v > 0 ? <Badge variant="destructive">Level {v}</Badge> : '-' },
  ];

  const invoiceActions: TableAction<Record<string, unknown>>[] = [
    { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row) => toast({ title: 'View Invoice', description: `Opening ${row.invoiceNumber}` }), variant: 'ghost' },
    { label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, onClick: (row) => approveInvoice(row as unknown as Invoice), variant: 'ghost', condition: (row) => row.status === 'Pending Approval' },
    { label: 'Send', icon: <TrendingUp className="h-4 w-4" />, onClick: (row) => sendInvoice(row as unknown as Invoice), variant: 'ghost', condition: (row) => row.status === 'Approved' },
    { label: 'Payment', icon: <DollarSign className="h-4 w-4" />, onClick: (row) => recordPayment(row as unknown as Invoice, (row as unknown as Invoice).remainingAmount), variant: 'ghost', condition: (row) => row.status === 'Sent' || row.status === 'Partially Paid' },
    { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row) => { if (confirm(`Delete ${row.invoiceNumber}?`)) deleteInvoice(row as unknown as Invoice); }, variant: 'ghost', condition: (row) => row.status === 'Draft' },
  ];

  const customerColumns: EnhancedColumn<Record<string, unknown>>[] = [
    { key: 'customerNumber', header: 'Customer #', sortable: true },
    { key: 'name', header: 'Name', searchable: true },
    { key: 'city', header: 'City', searchable: true },
    { key: 'country', header: 'Country', searchable: true },
    { key: 'creditLimit', header: 'Credit Limit', render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'creditRating', header: 'Rating' },
    { key: 'paymentTerms', header: 'Terms' },
    { key: 'status', header: 'Status', render: (v: string) => <Badge className={v === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>{v}</Badge> },
  ];

  const arSummary = useMemo(() => {
    const totalReceivable = invoices.filter(inv => inv.status !== 'Paid').reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const overdueAmount = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const pending = invoices.filter(inv => inv.status === 'Pending Approval').length;
    const sent = invoices.filter(inv => inv.status === 'Sent').length;
    return { totalReceivable, overdueAmount, pending, sent };
  }, [invoices]);

  const agingAnalysis = useMemo(() => {
    const today = new Date();
    return {
      current: invoices.filter(inv => inv.status !== 'Paid' && new Date(inv.dueDate) >= today).reduce((sum, inv) => sum + inv.remainingAmount, 0),
      days30: invoices.filter(inv => { const diff = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)); return inv.status !== 'Paid' && diff > 0 && diff <= 30; }).reduce((sum, inv) => sum + inv.remainingAmount, 0),
      days60: invoices.filter(inv => { const diff = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)); return inv.status !== 'Paid' && diff > 30 && diff <= 60; }).reduce((sum, inv) => sum + inv.remainingAmount, 0),
      days90: invoices.filter(inv => { const diff = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)); return inv.status !== 'Paid' && diff > 60 && diff <= 90; }).reduce((sum, inv) => sum + inv.remainingAmount, 0),
      over90: invoices.filter(inv => { const diff = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)); return inv.status !== 'Paid' && diff > 90; }).reduce((sum, inv) => sum + inv.remainingAmount, 0),
    };
  }, [invoices]);

  if (isLoading) {
    return <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-muted-foreground">Loading Accounts Receivable data...</p></div></div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate('/finance')}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <PageHeader title="Accounts Receivable" description="Manage customer invoices, payments, and customer master data with full CRUD" voiceIntroduction="Welcome to Accounts Receivable module." />
      </div>

      <VoiceTrainingComponent module="finance" topic="Accounts Receivable Management" examples={["Managing customer master data with credit limits and payment terms", "Processing customer invoices with approval and sending workflows", "Recording payments and managing dunning procedures for overdue accounts"]} detailLevel="advanced" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><div className="text-2xl font-bold">${arSummary.totalReceivable.toLocaleString()}</div><div className="text-sm text-muted-foreground">Total Receivable</div></div><DollarSign className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><div className="text-2xl font-bold text-red-600">${arSummary.overdueAmount.toLocaleString()}</div><div className="text-sm text-muted-foreground">Overdue</div></div><AlertTriangle className="h-8 w-8 text-red-600" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><div className="text-2xl font-bold">{arSummary.pending}</div><div className="text-sm text-muted-foreground">Pending Approval</div></div><Clock className="h-8 w-8 text-yellow-600" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><div className="text-2xl font-bold">{customers.length}</div><div className="text-sm text-muted-foreground">Active Customers</div></div><User className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="invoices">Invoices</TabsTrigger><TabsTrigger value="customers">Customer Master</TabsTrigger><TabsTrigger value="aging">Aging Analysis</TabsTrigger></TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Customer Invoices ({invoices.length})</span>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                  <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                    <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Invoice</Button></DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader><DialogTitle>Create Customer Invoice</DialogTitle></DialogHeader>
                      <Form {...invoiceForm}>
                        <form onSubmit={invoiceForm.handleSubmit(onSubmitInvoice)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={invoiceForm.control} name="customerNumber" render={({ field }) => (<FormItem><FormLabel>Customer</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger></FormControl><SelectContent>{customers.filter(c => c.status === 'Active').map(c => (<SelectItem key={c.id} value={c.customerNumber}>{c.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                            <FormField control={invoiceForm.control} name="salesRep" render={({ field }) => (<FormItem><FormLabel>Sales Rep</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select rep" /></SelectTrigger></FormControl><SelectContent><SelectItem value="John Smith">John Smith</SelectItem><SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem><SelectItem value="Mike Wilson">Mike Wilson</SelectItem><SelectItem value="Lisa Brown">Lisa Brown</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={invoiceForm.control} name="invoiceDate" render={({ field }) => (<FormItem><FormLabel>Invoice Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={invoiceForm.control} name="dueDate" render={({ field }) => (<FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={invoiceForm.control} name="amount" render={({ field }) => (<FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={invoiceForm.control} name="taxAmount" render={({ field }) => (<FormItem><FormLabel>Tax Amount</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <FormField control={invoiceForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={invoiceForm.control} name="soReference" render={({ field }) => (<FormItem><FormLabel>SO Reference</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={invoiceForm.control} name="paymentMethod" render={({ field }) => (<FormItem><FormLabel>Payment Method</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Bank Transfer">Bank Transfer</SelectItem><SelectItem value="Credit Card">Credit Card</SelectItem><SelectItem value="Check">Check</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                          </div>
                          <div className="flex justify-end space-x-2"><Button type="button" variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>Cancel</Button><Button type="submit">Create Invoice</Button></div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={invoiceColumns} data={invoices as unknown as Record<string, unknown>[]} actions={invoiceActions} searchPlaceholder="Search invoices..." exportable={true} refreshable={true} onRefresh={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Customer Master Data ({customers.length})</span>
                <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Customer</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Create Customer</DialogTitle></DialogHeader>
                    <Form {...customerForm}>
                      <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={customerForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Customer Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={customerForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={customerForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={customerForm.control} name="industry" render={({ field }) => (<FormItem><FormLabel>Industry</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <FormField control={customerForm.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={customerForm.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={customerForm.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={customerForm.control} name="paymentTerms" render={({ field }) => (<FormItem><FormLabel>Payment Terms</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Net 15">Net 15</SelectItem><SelectItem value="Net 30">Net 30</SelectItem><SelectItem value="Net 45">Net 45</SelectItem><SelectItem value="Net 60">Net 60</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                          <FormField control={customerForm.control} name="currency" render={({ field }) => (<FormItem><FormLabel>Currency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={customerForm.control} name="creditLimit" render={({ field }) => (<FormItem><FormLabel>Credit Limit</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={customerForm.control} name="creditRating" render={({ field }) => (<FormItem><FormLabel>Credit Rating</FormLabel><FormControl><Input placeholder="e.g. AAA" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={customerForm.control} name="salesRep" render={({ field }) => (<FormItem><FormLabel>Sales Rep</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="flex justify-end space-x-2"><Button type="button" variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>Cancel</Button><Button type="submit">Create Customer</Button></div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable columns={customerColumns} data={customers as unknown as Record<string, unknown>[]} searchPlaceholder="Search customers..." exportable={true} refreshable={true} onRefresh={loadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Current</div><div className="text-2xl font-bold text-green-600">${agingAnalysis.current.toLocaleString()}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">1-30 Days</div><div className="text-2xl font-bold text-yellow-600">${agingAnalysis.days30.toLocaleString()}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">31-60 Days</div><div className="text-2xl font-bold text-orange-600">${agingAnalysis.days60.toLocaleString()}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">61-90 Days</div><div className="text-2xl font-bold text-red-600">${agingAnalysis.days90.toLocaleString()}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Over 90 Days</div><div className="text-2xl font-bold text-red-800">${agingAnalysis.over90.toLocaleString()}</div></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountsReceivable;
