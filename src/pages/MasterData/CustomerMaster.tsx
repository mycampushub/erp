
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Plus, Eye, Edit, Trash2, Users, Building, Search, Download, Phone, Mail, Globe, CreditCard } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DataTable from '../../components/data/DataTable';
import { useToast } from '../../hooks/use-toast';

interface Customer {
  id: string;
  customerNumber: string;
  customerName: string;
  country: string;
  city: string;
  address: string;
  customerGroup: string;
  paymentTerms: string;
  creditLimit: number;
  status: 'Active' | 'Inactive' | 'Blocked';
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  taxId: string;
  salesOrganization: string;
  distributionChannel: string;
  division: string;
  priceList: string;
  currency: string;
  shippingCondition: string;
  incoterms: string;
  accountGroup: string;
  vatRegistration: string;
  telephone: string;
  fax: string;
  website: string;
  parentCompany: string;
  employeeCount: number;
  annualRevenue: number;
  lastOrderDate: string;
  createdAt: string;
}

const STORAGE_KEY = 'sap_customers';

const defaultCustomers: Customer[] = [
  { id: '1', customerNumber: 'CUST-001', customerName: 'ABC Corporation', country: 'United States', city: 'New York', address: '123 Business Ave, New York, NY 10001', customerGroup: 'Enterprise', paymentTerms: 'Net 30', creditLimit: 500000, status: 'Active', contactPerson: 'John Smith', email: 'jsmith@abccorp.com', phone: '+1-212-555-0100', industry: 'Manufacturing', taxId: '12-3456789', salesOrganization: '1000', distributionChannel: '10', division: '01', priceList: 'PL-001', currency: 'USD', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'US123456789', telephone: '+1-212-555-0100', fax: '+1-212-555-0101', website: 'www.abccorp.com', parentCompany: '', employeeCount: 2500, annualRevenue: 50000000, lastOrderDate: '2025-03-15', createdAt: '2024-01-15' },
  { id: '2', customerNumber: 'CUST-002', customerName: 'Global Tech Solutions', country: 'Germany', city: 'Berlin', address: 'Unter den Linden 45, 10117 Berlin', customerGroup: 'SMB', paymentTerms: 'Net 15', creditLimit: 100000, status: 'Active', contactPerson: 'Hans Mueller', email: 'h.mueller@globaltech.de', phone: '+49-30-555-0200', industry: 'Technology', taxId: 'DE123456789', salesOrganization: '2000', distributionChannel: '10', division: '02', priceList: 'PL-002', currency: 'EUR', shippingCondition: '02', incoterms: 'CIF', accountGroup: 'CUST', vatRegistration: 'DE123456789', telephone: '+49-30-555-0200', fax: '+49-30-555-0201', website: 'www.globaltech.de', parentCompany: '', employeeCount: 450, annualRevenue: 12000000, lastOrderDate: '2025-03-12', createdAt: '2024-02-20' },
  { id: '3', customerNumber: 'CUST-003', customerName: 'Regional Distributors', country: 'United Kingdom', city: 'London', address: '50 Oxford Street, London W1D 1BS', customerGroup: 'Distributor', paymentTerms: 'Cash', creditLimit: 250000, status: 'Blocked', contactPerson: 'Emma Wilson', email: 'ewilson@regional.co.uk', phone: '+44-20-555-0300', industry: 'Retail', taxId: 'GB123456789', salesOrganization: '3000', distributionChannel: '20', division: '01', priceList: 'PL-003', currency: 'GBP', shippingCondition: '01', incoterms: 'EXW', accountGroup: 'DIST', vatRegistration: 'GB123456789', telephone: '+44-20-555-0300', fax: '+44-20-555-0301', website: 'www.regional.co.uk', parentCompany: '', employeeCount: 180, annualRevenue: 8000000, lastOrderDate: '2025-02-28', createdAt: '2024-03-10' },
  { id: '4', customerNumber: 'CUST-004', customerName: 'Pacific Trading Co', country: 'Japan', city: 'Tokyo', address: '1-1 Marunouchi, Chiyoda City, Tokyo', customerGroup: 'Enterprise', paymentTerms: 'Net 45', creditLimit: 750000, status: 'Active', contactPerson: 'Yuki Tanaka', email: 'ytanaka@pacific.co.jp', phone: '+81-3-5555-0400', industry: 'Trading', taxId: 'JP12345678901', salesOrganization: '4000', distributionChannel: '10', division: '03', priceList: 'PL-001', currency: 'JPY', shippingCondition: '03', incoterms: 'DDP', accountGroup: 'CUST', vatRegistration: 'JP12345678901', telephone: '+81-3-5555-0400', fax: '+81-3-5555-0401', website: 'www.pacific.co.jp', parentCompany: 'Pacific Holdings', employeeCount: 1200, annualRevenue: 35000000, lastOrderDate: '2025-03-18', createdAt: '2024-04-05' },
  { id: '5', customerNumber: 'CUST-005', customerName: 'Nordic Solutions', country: 'Sweden', city: 'Stockholm', address: 'Sveavagen 45, 111 34 Stockholm', customerGroup: 'SMB', paymentTerms: 'Net 30', creditLimit: 150000, status: 'Active', contactPerson: 'Erik Johansson', email: 'ej@nordicsolutions.se', phone: '+46-8-555-0500', industry: 'Services', taxId: 'SE12345678901', salesOrganization: '2000', distributionChannel: '10', division: '02', priceList: 'PL-002', currency: 'SEK', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'SE12345678901', telephone: '+46-8-555-0500', fax: '+46-8-555-0501', website: 'www.nordicsolutions.se', parentCompany: '', employeeCount: 85, annualRevenue: 2500000, lastOrderDate: '2025-03-10', createdAt: '2024-05-12' },
  { id: '6', customerNumber: 'CUST-006', customerName: 'Euro Components GmbH', country: 'Germany', city: 'Munich', address: 'Technologiepark 50, 80939 Munich', customerGroup: 'Enterprise', paymentTerms: 'Net 30', creditLimit: 400000, status: 'Active', contactPerson: 'Klaus Weber', email: 'k.weber@eucomp.de', phone: '+49-89-555-0600', industry: 'Electronics', taxId: 'DE987654321', salesOrganization: '2000', distributionChannel: '10', division: '02', priceList: 'PL-001', currency: 'EUR', shippingCondition: '02', incoterms: 'CFR', accountGroup: 'CUST', vatRegistration: 'DE987654321', telephone: '+49-89-555-0600', fax: '+49-89-555-0601', website: 'www.eucomp.de', parentCompany: 'EuroTech AG', employeeCount: 620, annualRevenue: 18000000, lastOrderDate: '2025-03-16', createdAt: '2024-06-18' },
  { id: '7', customerNumber: 'CUST-007', customerName: 'Atlantic Industries', country: 'United States', city: 'Chicago', address: '500 Michigan Ave, Chicago, IL 60611', customerGroup: 'Enterprise', paymentTerms: 'Net 45', creditLimit: 600000, status: 'Active', contactPerson: 'Robert Johnson', email: 'rjohnson@atlantic.com', phone: '+1-312-555-0700', industry: 'Manufacturing', taxId: '36-4567890', salesOrganization: '1000', distributionChannel: '10', division: '01', priceList: 'PL-001', currency: 'USD', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'US987654321', telephone: '+1-312-555-0700', fax: '+1-312-555-0701', website: 'www.atlantic.com', parentCompany: '', employeeCount: 1800, annualRevenue: 42000000, lastOrderDate: '2025-03-14', createdAt: '2024-07-22' },
  { id: '8', customerNumber: 'CUST-008', customerName: 'Mediterranean Trade', country: 'Italy', city: 'Milan', address: 'Via della Moscova 15, 20121 Milano', customerGroup: 'Distributor', paymentTerms: 'Net 60', creditLimit: 300000, status: 'Active', contactPerson: 'Marco Rossi', email: 'mrossi@medtrade.it', phone: '+39-02-5555-0800', industry: 'Wholesale', taxId: 'IT12345678901', salesOrganization: '2000', distributionChannel: '20', division: '01', priceList: 'PL-003', currency: 'EUR', shippingCondition: '03', incoterms: 'CIF', accountGroup: 'DIST', vatRegistration: 'IT12345678901', telephone: '+39-02-5555-0800', fax: '+39-02-5555-0801', website: 'www.medtrade.it', parentCompany: '', employeeCount: 320, annualRevenue: 15000000, lastOrderDate: '2025-03-11', createdAt: '2024-08-15' },
  { id: '9', customerNumber: 'CUST-009', customerName: 'Apex Manufacturing', country: 'Canada', city: 'Toronto', address: '100 King Street West, Toronto, ON M5X 1B1', customerGroup: 'Enterprise', paymentTerms: 'Net 30', creditLimit: 550000, status: 'Active', contactPerson: 'David Chen', email: 'dchen@apexmfg.ca', phone: '+1-416-555-0900', industry: 'Manufacturing', taxId: '123456789RT0001', salesOrganization: '1000', distributionChannel: '10', division: '01', priceList: 'PL-001', currency: 'CAD', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'CA123456789', telephone: '+1-416-555-0900', fax: '+1-416-555-0901', website: 'www.apexmfg.ca', parentCompany: 'Apex Industries Ltd', employeeCount: 950, annualRevenue: 28000000, lastOrderDate: '2025-03-17', createdAt: '2024-09-08' },
  { id: '10', customerNumber: 'CUST-010', customerName: 'Southern Sun Corp', country: 'Australia', city: 'Sydney', address: '60 Martin Place, Sydney NSW 2000', customerGroup: 'SMB', paymentTerms: 'Net 15', creditLimit: 120000, status: 'Active', contactPerson: 'Sarah Williams', email: 'swilliams@southernsun.com.au', phone: '+61-2-5555-1000', industry: 'Retail', taxId: 'ABN12345678901', salesOrganization: '5000', distributionChannel: '10', division: '01', priceList: 'PL-002', currency: 'AUD', shippingCondition: '02', incoterms: 'CIF', accountGroup: 'CUST', vatRegistration: 'AU12345678901', telephone: '+61-2-5555-1000', fax: '+61-2-5555-1001', website: 'www.southernsun.com.au', parentCompany: '', employeeCount: 180, annualRevenue: 4500000, lastOrderDate: '2025-03-09', createdAt: '2024-10-20' },
  { id: '11', customerNumber: 'CUST-011', customerName: 'Alpine Engineering', country: 'Switzerland', city: 'Zurich', address: 'Bahnhofstrasse 10, 8001 Zurich', customerGroup: 'Enterprise', paymentTerms: 'Net 30', creditLimit: 800000, status: 'Active', contactPerson: 'Hans Mueller', email: 'hmueller@alpine.ch', phone: '+41-44-555-1100', industry: 'Engineering', taxId: 'CHE123456789', salesOrganization: '2000', distributionChannel: '10', division: '02', priceList: 'PL-001', currency: 'CHF', shippingCondition: '01', incoterms: 'DDP', accountGroup: 'CUST', vatRegistration: 'CHE123456789', telephone: '+41-44-555-1100', fax: '+41-44-555-1101', website: 'www.alpine.ch', parentCompany: 'Alpine Group', employeeCount: 450, annualRevenue: 22000000, lastOrderDate: '2025-03-13', createdAt: '2024-11-05' },
  { id: '12', customerNumber: 'CUST-012', customerName: 'Delta Logistics', country: 'France', city: 'Paris', address: '25 Avenue des Champs-Elysees, 75008 Paris', customerGroup: 'Distributor', paymentTerms: 'Net 45', creditLimit: 350000, status: 'Active', contactPerson: 'Pierre Dubois', email: 'pdubois@deltalog.fr', phone: '+33-1-5555-1200', industry: 'Logistics', taxId: 'FR12345678901', salesOrganization: '2000', distributionChannel: '20', division: '03', priceList: 'PL-003', currency: 'EUR', shippingCondition: '02', incoterms: 'CFR', accountGroup: 'DIST', vatRegistration: 'FR12345678901', telephone: '+33-1-5555-1200', fax: '+33-1-5555-1201', website: 'www.deltalog.fr', parentCompany: '', employeeCount: 280, annualRevenue: 11000000, lastOrderDate: '2025-03-08', createdAt: '2024-12-10' },
  { id: '13', customerNumber: 'CUST-013', customerName: 'Precision Parts Ltd', country: 'United Kingdom', city: 'Birmingham', address: '12 New Street, Birmingham B2 4AD', customerGroup: 'SMB', paymentTerms: 'Net 30', creditLimit: 95000, status: 'Active', contactPerson: 'James Brown', email: 'jbrown@precisionparts.co.uk', phone: '+44-121-555-1300', industry: 'Automotive', taxId: 'GB987654321', salesOrganization: '3000', distributionChannel: '10', division: '01', priceList: 'PL-002', currency: 'GBP', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'GB987654321', telephone: '+44-121-555-1300', fax: '+44-121-555-1301', website: 'www.precisionparts.co.uk', parentCompany: '', employeeCount: 145, annualRevenue: 3200000, lastOrderDate: '2025-03-06', createdAt: '2025-01-08' },
  { id: '14', customerNumber: 'CUST-014', customerName: 'Orient Exports', country: 'Singapore', city: 'Singapore', address: '1 Raffles Place, Singapore 048616', customerGroup: 'Enterprise', paymentTerms: 'Net 60', creditLimit: 700000, status: 'Active', contactPerson: 'Wei Lin', email: 'wlin@orientexports.sg', phone: '+65-6555-1400', industry: 'Trading', taxId: 'GST123456789', salesOrganization: '4000', distributionChannel: '10', division: '03', priceList: 'PL-001', currency: 'SGD', shippingCondition: '03', incoterms: 'CIF', accountGroup: 'CUST', vatRegistration: 'SG123456789', telephone: '+65-6555-1400', fax: '+65-6555-1401', website: 'www.orientexports.sg', parentCompany: 'Orient Holdings', employeeCount: 520, annualRevenue: 45000000, lastOrderDate: '2025-03-19', createdAt: '2025-01-15' },
  { id: '15', customerNumber: 'CUST-015', customerName: 'Central Supplies Inc', country: 'United States', city: 'Houston', address: '1000 Louisiana St, Houston, TX 77002', customerGroup: 'SMB', paymentTerms: 'Net 30', creditLimit: 180000, status: 'Active', contactPerson: 'Michael Davis', email: 'mdavis@centralsupplies.com', phone: '+1-713-555-1500', industry: 'Wholesale', taxId: '74-2345678', salesOrganization: '1000', distributionChannel: '20', division: '01', priceList: 'PL-002', currency: 'USD', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'US234567890', telephone: '+1-713-555-1500', fax: '+1-713-555-1501', website: 'www.centralsupplies.com', parentCompany: '', employeeCount: 220, annualRevenue: 8500000, lastOrderDate: '2025-03-12', createdAt: '2025-01-22' },
  { id: '16', customerNumber: 'CUST-016', customerName: 'Nordic Electronics', country: 'Norway', city: 'Oslo', address: 'Karl Johans gate 15, 0159 Oslo', customerGroup: 'Enterprise', paymentTerms: 'Net 30', creditLimit: 450000, status: 'Active', contactPerson: 'Lars Andersen', email: 'landersen@nordel.no', phone: '+47-22-555-1600', industry: 'Electronics', taxId: 'NO123456789', salesOrganization: '2000', distributionChannel: '10', division: '02', priceList: 'PL-001', currency: 'NOK', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'NO123456789', telephone: '+47-22-555-1600', fax: '+47-22-555-1601', website: 'www.nordel.no', parentCompany: '', employeeCount: 380, annualRevenue: 19000000, lastOrderDate: '2025-03-11', createdAt: '2025-02-01' },
  { id: '17', customerNumber: 'CUST-017', customerName: 'Caribbean Trading Co', country: 'Mexico', city: 'Mexico City', address: 'Paseo de la Reforma 255, CDMX', customerGroup: 'Distributor', paymentTerms: 'Net 45', creditLimit: 280000, status: 'Active', contactPerson: 'Carlos Hernandez', email: 'chernandez@caribbeantrading.mx', phone: '+52-55-5555-1700', industry: 'Trading', taxId: 'MXA123456789', salesOrganization: '1000', distributionChannel: '20', division: '03', priceList: 'PL-003', currency: 'MXN', shippingCondition: '02', incoterms: 'CIF', accountGroup: 'DIST', vatRegistration: 'MX123456789', telephone: '+52-55-5555-1700', fax: '+52-55-5555-1701', website: 'www.caribbeantrading.mx', parentCompany: '', employeeCount: 195, annualRevenue: 7200000, lastOrderDate: '2025-03-07', createdAt: '2025-02-10' },
  { id: '18', customerNumber: 'CUST-018', customerName: 'Pacific Northwest Mfg', country: 'United States', city: 'Seattle', address: '1918 8th Ave, Seattle, WA 98101', customerGroup: 'Enterprise', paymentTerms: 'Net 30', creditLimit: 520000, status: 'Active', contactPerson: 'Jennifer Taylor', email: 'jtaylor@pnwmfg.com', phone: '+1-206-555-1800', industry: 'Manufacturing', taxId: '91-3456789', salesOrganization: '1000', distributionChannel: '10', division: '01', priceList: 'PL-001', currency: 'USD', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'US345678901', telephone: '+1-206-555-1800', fax: '+1-206-555-1801', website: 'www.pnwmfg.com', parentCompany: '', employeeCount: 720, annualRevenue: 25000000, lastOrderDate: '2025-03-18', createdAt: '2025-02-15' },
  { id: '19', customerNumber: 'CUST-019', customerName: 'Gulf Petrochemical', country: 'Saudi Arabia', city: 'Riyadh', address: 'King Fahd Road, Riyadh 11411', customerGroup: 'Enterprise', paymentTerms: 'Net 60', creditLimit: 900000, status: 'Active', contactPerson: 'Ahmed Al-Rashid', email: 'aarashid@gulfpetro.sa', phone: '+966-11-555-1900', industry: 'Chemical', taxId: 'SA123456789', salesOrganization: '4000', distributionChannel: '10', division: '03', priceList: 'PL-001', currency: 'SAR', shippingCondition: '03', incoterms: 'DDP', accountGroup: 'CUST', vatRegistration: 'SA123456789', telephone: '+966-11-555-1900', fax: '+966-11-555-1901', website: 'www.gulfpetro.sa', parentCompany: 'Gulf Industries', employeeCount: 1500, annualRevenue: 85000000, lastOrderDate: '2025-03-20', createdAt: '2025-02-20' },
  { id: '20', customerNumber: 'CUST-020', customerName: 'Dutch Dynamics', country: 'Netherlands', city: 'Amsterdam', address: 'Zuidplein 126, 1077 XV Amsterdam', customerGroup: 'SMB', paymentTerms: 'Net 30', creditLimit: 140000, status: 'Active', contactPerson: ' Willem van der Berg', email: 'wvanderberg@dutchdynamics.nl', phone: '+31-20-555-2000', industry: 'Technology', taxId: 'NL123456789B01', salesOrganization: '2000', distributionChannel: '10', division: '02', priceList: 'PL-002', currency: 'EUR', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'NL123456789B01', telephone: '+31-20-555-2000', fax: '+31-20-555-2001', website: 'www.dutchdynamics.nl', parentCompany: '', employeeCount: 95, annualRevenue: 4200000, lastOrderDate: '2025-03-05', createdAt: '2025-02-25' },
  { id: '21', customerNumber: 'CUST-021', customerName: 'Eastern Supplies', country: 'India', city: 'Mumbai', address: 'One BKC, G Block, Mumbai 400051', customerGroup: 'SMB', paymentTerms: 'Net 45', creditLimit: 110000, status: 'Active', contactPerson: 'Priya Sharma', email: 'psharma@easternsupplies.in', phone: '+91-22-5555-2100', industry: 'Wholesale', taxId: 'GSTIN27ABCDE1234F', salesOrganization: '4000', distributionChannel: '10', division: '01', priceList: 'PL-002', currency: 'INR', shippingCondition: '02', incoterms: 'CIF', accountGroup: 'CUST', vatRegistration: 'IN123456789', telephone: '+91-22-5555-2100', fax: '+91-22-5555-2101', website: 'www.easternsupplies.in', parentCompany: '', employeeCount: 165, annualRevenue: 5500000, lastOrderDate: '2025-03-04', createdAt: '2025-03-01' },
  { id: '22', customerNumber: 'CUST-022', customerName: 'Maple Leaf Industries', country: 'Canada', city: 'Vancouver', address: '1055 Dunsmuir St, Vancouver, BC V7X 1L4', customerGroup: 'Enterprise', paymentTerms: 'Net 30', creditLimit: 480000, status: 'Active', contactPerson: 'Kevin Thompson', email: 'kthompson@mapleleaf.ca', phone: '+1-604-555-2200', industry: 'Manufacturing', taxId: '789012345RT0001', salesOrganization: '1000', distributionChannel: '10', division: '01', priceList: 'PL-001', currency: 'CAD', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'CA789012345', telephone: '+1-604-555-2200', fax: '+1-604-555-2201', website: 'www.mapleleaf.ca', parentCompany: '', employeeCount: 580, annualRevenue: 21000000, lastOrderDate: '2025-03-15', createdAt: '2025-03-05' },
  { id: '23', customerNumber: 'CUST-023', customerName: 'Brazilian Solutions', country: 'Brazil', city: 'Sao Paulo', address: 'Av. Paulista 1000, Sao Paulo, SP 01310-100', customerGroup: 'Enterprise', paymentTerms: 'Net 45', creditLimit: 650000, status: 'Active', contactPerson: 'Ana Paula Silva', email: 'apsilva@brsolutions.com.br', phone: '+55-11-5555-2300', industry: 'Technology', taxId: 'CNPJ12.345.678/0001-90', salesOrganization: '4000', distributionChannel: '10', division: '02', priceList: 'PL-001', currency: 'BRL', shippingCondition: '02', incoterms: 'CIF', accountGroup: 'CUST', vatRegistration: 'BR123456789', telephone: '+55-11-5555-2300', fax: '+55-11-5555-2301', website: 'www.brsolutions.com.br', parentCompany: '', employeeCount: 890, annualRevenue: 38000000, lastOrderDate: '2025-03-16', createdAt: '2025-03-08' },
  { id: '24', customerNumber: 'CUST-024', customerName: 'Celtic Engineering', country: 'Ireland', city: 'Dublin', address: '1 Grand Canal Square, Dublin 2', customerGroup: 'SMB', paymentTerms: 'Net 30', creditLimit: 130000, status: 'Active', contactPerson: 'Patrick O\'Brien', email: 'pobrien@celticeng.ie', phone: '+353-1-555-2400', industry: 'Engineering', taxId: 'IE1234567AB', salesOrganization: '2000', distributionChannel: '10', division: '02', priceList: 'PL-002', currency: 'EUR', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'IE1234567AB', telephone: '+353-1-555-2400', fax: '+353-1-555-2401', website: 'www.celticeng.ie', parentCompany: '', employeeCount: 110, annualRevenue: 3800000, lastOrderDate: '2025-03-03', createdAt: '2025-03-10' },
  { id: '25', customerNumber: 'CUST-025', customerName: 'Korean Tech Corp', country: 'South Korea', city: 'Seoul', address: '267 Gangnam-gu, Seoul 06164', customerGroup: 'Enterprise', paymentTerms: 'Net 30', creditLimit: 720000, status: 'Active', contactPerson: 'Ji-Young Park', email: 'jypark@krtech.kr', phone: '+82-2-5555-2500', industry: 'Electronics', taxId: '123-45-67890', salesOrganization: '4000', distributionChannel: '10', division: '02', priceList: 'PL-001', currency: 'KRW', shippingCondition: '02', incoterms: 'CFR', accountGroup: 'CUST', vatRegistration: 'KR123456789', telephone: '+82-2-5555-2500', fax: '+82-2-5555-2501', website: 'www.krtech.kr', parentCompany: 'Korea Electronics', employeeCount: 1650, annualRevenue: 72000000, lastOrderDate: '2025-03-19', createdAt: '2025-03-12' },
  { id: '26', customerNumber: 'CUST-026', customerName: 'South African Mining', country: 'South Africa', city: 'Johannesburg', address: '1 Sandton Drive, Johannesburg 2146', customerGroup: 'Enterprise', paymentTerms: 'Net 60', creditLimit: 850000, status: 'Active', contactPerson: 'Thabo Molefe', email: 'tmolefe@samining.za', phone: '+27-11-555-2600', industry: 'Mining', taxId: 'ZA912345678', salesOrganization: '5000', distributionChannel: '10', division: '03', priceList: 'PL-001', currency: 'ZAR', shippingCondition: '03', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'ZA912345678', telephone: '+27-11-555-2600', fax: '+27-11-555-2601', website: 'www.samining.za', parentCompany: 'African Minerals Ltd', employeeCount: 2800, annualRevenue: 120000000, lastOrderDate: '2025-03-20', createdAt: '2025-03-14' },
  { id: '27', customerNumber: 'CUST-027', customerName: 'Viking Maritime', country: 'Denmark', city: 'Copenhagen', address: 'Kalvebod Brygge 45, 1560 Copenhagen', customerGroup: 'SMB', paymentTerms: 'Net 30', creditLimit: 160000, status: 'Active', contactPerson: 'Erik Nielsen', email: 'enielsen@vikingmaritime.dk', phone: '+45-33-555-2700', industry: 'Marine', taxId: 'DK12 34 56 78', salesOrganization: '2000', distributionChannel: '10', division: '03', priceList: 'PL-002', currency: 'DKK', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'DK12345678', telephone: '+45-33-555-2700', fax: '+45-33-555-2701', website: 'www.vikingmaritime.dk', parentCompany: '', employeeCount: 75, annualRevenue: 2800000, lastOrderDate: '2025-03-02', createdAt: '2025-03-15' },
  { id: '28', customerNumber: 'CUST-028', customerName: 'Polish Precision', country: 'Poland', city: 'Warsaw', address: 'Aleje Jerozolimskie 123, 02-017 Warsaw', customerGroup: 'SMB', paymentTerms: 'Net 30', creditLimit: 105000, status: 'Active', contactPerson: 'Tomasz Kowalski', email: 'tkowalski@polishprecision.pl', phone: '+48-22-555-2800', industry: 'Manufacturing', taxId: 'PL1234567890', salesOrganization: '2000', distributionChannel: '10', division: '01', priceList: 'PL-002', currency: 'PLN', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'PL1234567890', telephone: '+48-22-555-2800', fax: '+48-22-555-2801', website: 'www.polishprecision.pl', parentCompany: '', employeeCount: 135, annualRevenue: 4200000, lastOrderDate: '2025-03-06', createdAt: '2025-03-16' },
  { id: '29', customerNumber: 'CUST-029', customerName: 'MENA Distribution', country: 'UAE', city: 'Dubai', address: 'Dubai Internet City, Dubai', customerGroup: 'Distributor', paymentTerms: 'Net 45', creditLimit: 420000, status: 'Active', contactPerson: 'Omar Hassan', email: 'ohassan@menadist.ae', phone: '+971-4-555-2900', industry: 'Wholesale', taxId: 'AE1234567890123', salesOrganization: '4000', distributionChannel: '20', division: '03', priceList: 'PL-003', currency: 'AED', shippingCondition: '02', incoterms: 'CIF', accountGroup: 'DIST', vatRegistration: 'AE123456789', telephone: '+971-4-555-2900', fax: '+971-4-555-2901', website: 'www.menadist.ae', parentCompany: '', employeeCount: 310, annualRevenue: 18000000, lastOrderDate: '2025-03-17', createdAt: '2025-03-17' },
  { id: '30', customerNumber: 'CUST-030', customerName: 'Turkish Manufacturing', country: 'Turkey', city: 'Istanbul', address: 'Levent Mah. Istanbul 34330', customerGroup: 'Enterprise', paymentTerms: 'Net 30', creditLimit: 520000, status: 'Active', contactPerson: 'Ayse Yilmaz', email: 'ayilmaz@turkishmfg.tr', phone: '+90-212-555-3000', industry: 'Manufacturing', taxId: 'TR1234567890', salesOrganization: '2000', distributionChannel: '10', division: '01', priceList: 'PL-001', currency: 'TRY', shippingCondition: '01', incoterms: 'FOB', accountGroup: 'CUST', vatRegistration: 'TR123456789', telephone: '+90-212-555-3000', fax: '+90-212-555-3001', website: 'www.turkishmfg.tr', parentCompany: '', employeeCount: 1450, annualRevenue: 45000000, lastOrderDate: '2025-03-18', createdAt: '2025-03-18' },
];

const defaultForm: Omit<Customer, 'id' | 'customerNumber' | 'createdAt'> = {
  customerName: '',
  country: 'United States',
  city: '',
  address: '',
  customerGroup: 'Enterprise',
  paymentTerms: 'Net 30',
  creditLimit: 100000,
  status: 'Active',
  contactPerson: '',
  email: '',
  phone: '',
  industry: 'Manufacturing',
  taxId: '',
  salesOrganization: '1000',
  distributionChannel: '10',
  division: '01',
  priceList: 'PL-001',
  currency: 'USD',
  shippingCondition: '01',
  incoterms: 'FOB',
  accountGroup: 'CUST',
  vatRegistration: '',
  telephone: '',
  fax: '',
  website: '',
  parentCompany: '',
  employeeCount: 0,
  annualRevenue: 0,
  lastOrderDate: '',
};

const CustomerMaster: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useLocalStorage<Customer[]>(STORAGE_KEY, defaultCustomers);
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<Omit<Customer, 'id' | 'customerNumber' | 'createdAt'>>(defaultForm);

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to Customer Master. Manage customer information including contact details, payment terms, and credit limits.');
    }
  }, [isEnabled, speak]);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.customerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesGroup = filterGroup === 'all' || c.customerGroup === filterGroup;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const openCreate = () => {
    setEditingCustomer(null);
    setForm(defaultForm);
    setIsDialogOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      customerName: customer.customerName,
      country: customer.country,
      city: customer.city,
      address: customer.address,
      customerGroup: customer.customerGroup,
      paymentTerms: customer.paymentTerms,
      creditLimit: customer.creditLimit,
      status: customer.status,
      contactPerson: customer.contactPerson,
      email: customer.email,
      phone: customer.phone,
      industry: customer.industry,
      taxId: customer.taxId,
      salesOrganization: customer.salesOrganization,
      distributionChannel: customer.distributionChannel,
      division: customer.division,
      priceList: customer.priceList,
      currency: customer.currency,
      shippingCondition: customer.shippingCondition,
      incoterms: customer.incoterms,
      accountGroup: customer.accountGroup,
      vatRegistration: customer.vatRegistration,
      telephone: customer.telephone,
      fax: customer.fax,
      website: customer.website,
      parentCompany: customer.parentCompany,
      employeeCount: customer.employeeCount,
      annualRevenue: customer.annualRevenue,
      lastOrderDate: customer.lastOrderDate,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.customerName.trim()) {
      toast({ title: 'Validation Error', description: 'Customer name is required.', variant: 'destructive' });
      return;
    }
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...form } : c));
      toast({ title: 'Customer Updated', description: `${form.customerName} has been updated.` });
    } else {
      const newCustomer: Customer = {
        id: String(Date.now()),
        customerNumber: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        ...form,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomers(prev => [...prev, newCustomer]);
      toast({ title: 'Customer Created', description: `${form.customerName} added to customer master.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (customer: Customer) => {
    setCustomers(prev => prev.filter(c => c.id !== customer.id));
    toast({ title: 'Customer Deleted', description: `${customer.customerName} has been removed.` });
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['Customer Number', 'Customer Name', 'Country', 'City', 'Industry', 'Credit Limit', 'Status'].join(','),
      ...customers.map(c => [c.customerNumber, `"${c.customerName}"`, c.country, c.city, c.industry, c.creditLimit, c.status].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers_export.csv';
    a.click();
    toast({ title: 'Export Complete', description: `${customers.length} customers exported successfully.` });
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
    { key: 'customerNumber', header: 'Customer Number', sortable: true },
    { key: 'customerName', header: 'Customer Name', sortable: true },
    { key: 'country', header: 'Country', filterable: true },
    { key: 'city', header: 'City' },
    { key: 'customerGroup', header: 'Customer Group', filterable: true },
    { key: 'paymentTerms', header: 'Payment Terms' },
    { key: 'creditLimit', header: 'Credit Limit', sortable: true, render: (value: number) => `$${value.toLocaleString()}` },
    { key: 'industry', header: 'Industry' },
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
      render: (_: any, row: Customer) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(row)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row)} title="Delete">
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
          title="Customer Master"
          description="Create and maintain customer master records with full sales area configuration"
          voiceIntroduction="Welcome to Customer Master."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Customers</div>
          <div className="text-2xl font-bold">{customers.length}</div>
          <div className="text-sm text-blue-600">All customer records</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Active Customers</div>
          <div className="text-2xl font-bold">{customers.filter(c => c.status === 'Active').length}</div>
          <div className="text-sm text-green-600">Currently active</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Credit Exposure</div>
          <div className="text-2xl font-bold">${(customers.reduce((sum, c) => sum + c.creditLimit, 0) / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-orange-600">Total credit limits</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Countries</div>
          <div className="text-2xl font-bold">{new Set(customers.map(c => c.country)).size}</div>
          <div className="text-sm text-purple-600">Global presence</div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Customer List</TabsTrigger>
          <TabsTrigger value="create">Create Customer</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="SMB">SMB</SelectItem>
                  <SelectItem value="Distributor">Distributor</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />Export
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />Create Customer
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <DataTable columns={columns} data={filteredCustomers} />
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Register New Customer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={form.country} onValueChange={v => setForm(f => ({ ...f, country: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="Sweden">Sweden</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                    <SelectItem value="UAE">UAE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Customer Group</Label>
                <Select value={form.customerGroup} onValueChange={v => setForm(f => ({ ...f, customerGroup: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                    <SelectItem value="SMB">SMB</SelectItem>
                    <SelectItem value="Distributor">Distributor</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Trading">Trading</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Wholesale">Wholesale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Select value={form.paymentTerms} onValueChange={v => setForm(f => ({ ...f, paymentTerms: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 45">Net 45</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Credit Limit</Label>
                <Input type="number" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Customer['status'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tax ID</Label>
                <Input value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Sales Organization</Label>
                <Select value={form.salesOrganization} onValueChange={v => setForm(f => ({ ...f, salesOrganization: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1000 - US Sales</SelectItem>
                    <SelectItem value="2000">2000 - Europe Sales</SelectItem>
                    <SelectItem value="3000">3000 - UK Sales</SelectItem>
                    <SelectItem value="4000">4000 - Asia Sales</SelectItem>
                    <SelectItem value="5000">5000 - Global Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Distribution Channel</Label>
                <Select value={form.distributionChannel} onValueChange={v => setForm(f => ({ ...f, distributionChannel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 - Direct Sales</SelectItem>
                    <SelectItem value="20">20 - Indirect Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employee Count</Label>
                <Input type="number" value={form.employeeCount} onChange={e => setForm(f => ({ ...f, employeeCount: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Annual Revenue</Label>
                <Input type="number" value={form.annualRevenue} onChange={e => setForm(f => ({ ...f, annualRevenue: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSave}><Plus className="h-4 w-4 mr-2" />Create Customer</Button>
              <Button variant="outline" onClick={() => setForm(defaultForm)}>Reset</Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Customers by Industry</h3>
              <div className="space-y-3">
                {['Manufacturing', 'Technology', 'Trading', 'Services', 'Retail', 'Wholesale'].map(industry => {
                  const count = customers.filter(c => c.industry === industry).length;
                  const pct = (count / customers.length * 100).toFixed(1);
                  return (
                    <div key={industry}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{industry}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Customers by Region</h3>
              <div className="space-y-3">
                {['Europe', 'North America', 'Asia Pacific', 'Middle East', 'Other'].map(region => {
                  const regionCountries = {
                    'Europe': ['Germany', 'United Kingdom', 'Sweden', 'France', 'Italy', 'Switzerland', 'Netherlands', 'Norway', 'Ireland', 'Denmark', 'Poland', 'Turkey'],
                    'North America': ['United States', 'Canada', 'Mexico'],
                    'Asia Pacific': ['Japan', 'Singapore', 'Australia', 'India', 'South Korea', 'Brazil'],
                    'Middle East': ['Saudi Arabia', 'UAE'],
                    'Other': ['South Africa']
                  };
                  const count = customers.filter(c => regionCountries[region as keyof typeof regionCountries]?.includes(c.country)).length;
                  const pct = (count / customers.length * 100).toFixed(1);
                  return (
                    <div key={region}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{region}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Credit Exposure by Group</h3>
              <div className="space-y-3">
                {['Enterprise', 'SMB', 'Distributor', 'Retail'].map(group => {
                  const total = customers.filter(c => c.customerGroup === group).reduce((sum, c) => sum + c.creditLimit, 0);
                  return (
                    <div key={group} className="flex justify-between items-center p-2 border rounded">
                      <span>{group}</span>
                      <span className="font-semibold">${(total / 1000000).toFixed(2)}M</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Create New Customer'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Customer Name *</Label>
              <Input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={form.country} onValueChange={v => setForm(f => ({ ...f, country: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="Sweden">Sweden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Customer Group</Label>
              <Select value={form.customerGroup} onValueChange={v => setForm(f => ({ ...f, customerGroup: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="SMB">SMB</SelectItem>
                  <SelectItem value="Distributor">Distributor</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Trading">Trading</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select value={form.paymentTerms} onValueChange={v => setForm(f => ({ ...f, paymentTerms: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Credit Limit</Label>
              <Input type="number" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Customer['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tax ID</Label>
              <Input value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingCustomer ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="sales">Sales Area</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-gray-500">Customer Number:</span>
                  <span className="font-medium">{selectedCustomer.customerNumber}</span>
                  <span className="text-gray-500">Customer Name:</span>
                  <span className="font-medium">{selectedCustomer.customerName}</span>
                  <span className="text-gray-500">Contact Person:</span>
                  <span className="font-medium">{selectedCustomer.contactPerson}</span>
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{selectedCustomer.email}</span>
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{selectedCustomer.phone}</span>
                  <span className="text-gray-500">Address:</span>
                  <span className="font-medium">{selectedCustomer.address}</span>
                  <span className="text-gray-500">Country:</span>
                  <span className="font-medium">{selectedCustomer.country}</span>
                  <span className="text-gray-500">Industry:</span>
                  <span className="font-medium">{selectedCustomer.industry}</span>
                  <span className="text-gray-500">Customer Group:</span>
                  <span className="font-medium">{selectedCustomer.customerGroup}</span>
                  <span className="text-gray-500">Status:</span>
                  <Badge className={getStatusColor(selectedCustomer.status)}>{selectedCustomer.status}</Badge>
                  <span className="text-gray-500">Website:</span>
                  <span className="font-medium">{selectedCustomer.website || 'N/A'}</span>
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">{selectedCustomer.createdAt}</span>
                </div>
              </TabsContent>
              <TabsContent value="sales" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-gray-500">Sales Organization:</span>
                  <span className="font-medium">{selectedCustomer.salesOrganization}</span>
                  <span className="text-gray-500">Distribution Channel:</span>
                  <span className="font-medium">{selectedCustomer.distributionChannel}</span>
                  <span className="text-gray-500">Division:</span>
                  <span className="font-medium">{selectedCustomer.division}</span>
                  <span className="text-gray-500">Price List:</span>
                  <span className="font-medium">{selectedCustomer.priceList}</span>
                  <span className="text-gray-500">Shipping Condition:</span>
                  <span className="font-medium">{selectedCustomer.shippingCondition}</span>
                  <span className="text-gray-500">Incoterms:</span>
                  <span className="font-medium">{selectedCustomer.incoterms}</span>
                  <span className="text-gray-500">Last Order:</span>
                  <span className="font-medium">{selectedCustomer.lastOrderDate || 'N/A'}</span>
                </div>
              </TabsContent>
              <TabsContent value="financial" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <span className="text-gray-500">Credit Limit:</span>
                  <span className="font-medium">${selectedCustomer.creditLimit.toLocaleString()}</span>
                  <span className="text-gray-500">Payment Terms:</span>
                  <span className="font-medium">{selectedCustomer.paymentTerms}</span>
                  <span className="text-gray-500">Currency:</span>
                  <span className="font-medium">{selectedCustomer.currency}</span>
                  <span className="text-gray-500">Tax ID:</span>
                  <span className="font-medium">{selectedCustomer.taxId}</span>
                  <span className="text-gray-500">VAT Registration:</span>
                  <span className="font-medium">{selectedCustomer.vatRegistration || 'N/A'}</span>
                  <span className="text-gray-500">Employee Count:</span>
                  <span className="font-medium">{selectedCustomer.employeeCount}</span>
                  <span className="text-gray-500">Annual Revenue:</span>
                  <span className="font-medium">${selectedCustomer.annualRevenue.toLocaleString()}</span>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerMaster;
