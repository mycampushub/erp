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
import { ArrowLeft, Plus, BookOpen, Calculator, TrendingUp, Download, Eye, Edit, Trash2, FileText, Save, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/page/PageHeader';
import { useVoiceAssistantContext } from '../../context/VoiceAssistantContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import EnhancedDataTable, { EnhancedColumn, TableAction } from '../../components/data/EnhancedDataTable';
import { useToast } from '../../hooks/use-toast';
import VoiceTrainingComponent from '../../components/procurement/VoiceTrainingComponent';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export interface JournalEntry {
  id: string;
  documentNumber: string;
  fiscalYear: string;
  period: string;
  postingDate: string;
  documentDate: string;
  account: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  reference: string;
  companyCode: string;
  costCenter?: string;
  profitCenter?: string;
  businessArea?: string;
  documentType: string;
  status: 'Draft' | 'Posted' | 'Reversed';
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses';
  balance: number;
  isActive: boolean;
  category: string;
  subCategory: string;
  postingKey: string;
  chartOfAccounts: string;
  createdAt: string;
  updatedAt: string;
}

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const journalEntrySchema = z.object({
  postingDate: z.string().min(1, 'Posting date is required'),
  documentDate: z.string().min(1, 'Document date is required'),
  account: z.string().min(1, 'Account is required'),
  debit: z.number().min(0, 'Debit must be non-negative'),
  credit: z.number().min(0, 'Credit must be non-negative'),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional(),
  companyCode: z.string().min(1, 'Company code is required'),
  costCenter: z.string().optional(),
  profitCenter: z.string().optional(),
  businessArea: z.string().optional(),
  documentType: z.string().min(1, 'Document type is required'),
}).refine(data => data.debit > 0 || data.credit > 0, {
  message: 'Either debit or credit must be greater than 0',
  path: ['debit'],
});

const accountSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses']),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().min(1, 'Sub-category is required'),
  postingKey: z.string().min(1, 'Posting key is required'),
  chartOfAccounts: z.string().min(1, 'Chart of accounts is required'),
});

const seedChartOfAccounts = (): Account[] => {
  const now = new Date().toISOString();
  return [
    { id: generateId('acc'), accountNumber: '100000', accountName: 'Cash and Cash Equivalents', accountType: 'Assets', balance: 2450000, isActive: true, category: 'Current Assets', subCategory: 'Cash', postingKey: '40', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '101000', accountName: 'Petty Cash', accountType: 'Assets', balance: 5000, isActive: true, category: 'Current Assets', subCategory: 'Cash', postingKey: '40', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '102000', accountName: 'Cash in Bank - Operating', accountType: 'Assets', balance: 1500000, isActive: true, category: 'Current Assets', subCategory: 'Bank Accounts', postingKey: '40', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '103000', accountName: 'Cash in Bank - Payroll', accountType: 'Assets', balance: 250000, isActive: true, category: 'Current Assets', subCategory: 'Bank Accounts', postingKey: '40', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '110000', accountName: 'Short-term Investments', accountType: 'Assets', balance: 500000, isActive: true, category: 'Current Assets', subCategory: 'Investments', postingKey: '40', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '120000', accountName: 'Accounts Receivable - Trade', accountType: 'Assets', balance: 1250000, isActive: true, category: 'Current Assets', subCategory: 'Receivables', postingKey: '01', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '121000', accountName: 'Accounts Receivable - Other', accountType: 'Assets', balance: 85000, isActive: true, category: 'Current Assets', subCategory: 'Receivables', postingKey: '01', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '130000', accountName: 'Notes Receivable', accountType: 'Assets', balance: 150000, isActive: true, category: 'Current Assets', subCategory: 'Receivables', postingKey: '01', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '140000', accountName: 'Inventory', accountType: 'Assets', balance: 650000, isActive: true, category: 'Current Assets', subCategory: 'Inventory', postingKey: '01', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '150000', accountName: 'Prepaid Expenses', accountType: 'Assets', balance: 95000, isActive: true, category: 'Current Assets', subCategory: 'Prepaid', postingKey: '01', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '160000', accountName: 'Fixed Assets - Equipment', accountType: 'Assets', balance: 850000, isActive: true, category: 'Fixed Assets', subCategory: 'Equipment', postingKey: '10', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '161000', accountName: 'Fixed Assets - Vehicles', accountType: 'Assets', balance: 350000, isActive: true, category: 'Fixed Assets', subCategory: 'Vehicles', postingKey: '10', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '162000', accountName: 'Fixed Assets - Furniture', accountType: 'Assets', balance: 125000, isActive: true, category: 'Fixed Assets', subCategory: 'Furniture', postingKey: '10', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '170000', accountName: 'Accumulated Depreciation - Equipment', accountType: 'Assets', balance: -175000, isActive: true, category: 'Fixed Assets', subCategory: 'Accumulated Depreciation', postingKey: '10', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '171000', accountName: 'Accumulated Depreciation - Vehicles', accountType: 'Assets', balance: -85000, isActive: true, category: 'Fixed Assets', subCategory: 'Accumulated Depreciation', postingKey: '10', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '200000', accountName: 'Accounts Payable - Trade', accountType: 'Liabilities', balance: 450000, isActive: true, category: 'Current Liabilities', subCategory: 'Payables', postingKey: '50', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '201000', accountName: 'Accounts Payable - Other', accountType: 'Liabilities', balance: 35000, isActive: true, category: 'Current Liabilities', subCategory: 'Payables', postingKey: '50', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '210000', accountName: 'Notes Payable', accountType: 'Liabilities', balance: 200000, isActive: true, category: 'Current Liabilities', subCategory: 'Notes Payable', postingKey: '50', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '220000', accountName: 'Accrued Expenses', accountType: 'Liabilities', balance: 125000, isActive: true, category: 'Current Liabilities', subCategory: 'Accrued', postingKey: '50', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '230000', accountName: 'Salaries Payable', accountType: 'Liabilities', balance: 185000, isActive: true, category: 'Current Liabilities', subCategory: 'Payroll', postingKey: '50', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '240000', accountName: 'Taxes Payable', accountType: 'Liabilities', balance: 95000, isActive: true, category: 'Current Liabilities', subCategory: 'Taxes', postingKey: '50', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '250000', accountName: 'Short-term Debt', accountType: 'Liabilities', balance: 300000, isActive: true, category: 'Current Liabilities', subCategory: 'Debt', postingKey: '50', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '260000', accountName: 'Long-term Debt', accountType: 'Liabilities', balance: 1200000, isActive: true, category: 'Long-term Liabilities', subCategory: 'Debt', postingKey: '55', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '300000', accountName: 'Common Stock', accountType: 'Equity', balance: 2500000, isActive: true, category: 'Equity', subCategory: 'Capital Stock', postingKey: '70', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '310000', accountName: 'Additional Paid-in Capital', accountType: 'Equity', balance: 1500000, isActive: true, category: 'Equity', subCategory: 'Capital Surplus', postingKey: '70', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '320000', accountName: 'Retained Earnings', accountType: 'Equity', balance: 2150000, isActive: true, category: 'Equity', subCategory: 'Retained Earnings', postingKey: '70', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '330000', accountName: 'Dividends', accountType: 'Equity', balance: -250000, isActive: true, category: 'Equity', subCategory: 'Dividends', postingKey: '71', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '400000', accountName: 'Sales Revenue', accountType: 'Revenue', balance: 4250000, isActive: true, category: 'Operating Revenue', subCategory: 'Sales', postingKey: '01', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '410000', accountName: 'Service Revenue', accountType: 'Revenue', balance: 850000, isActive: true, category: 'Operating Revenue', subCategory: 'Services', postingKey: '01', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '420000', accountName: 'Interest Income', accountType: 'Revenue', balance: 45000, isActive: true, category: 'Non-Operating Revenue', subCategory: 'Interest', postingKey: '01', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '430000', accountName: 'Other Income', accountType: 'Revenue', balance: 25000, isActive: true, category: 'Non-Operating Revenue', subCategory: 'Miscellaneous', postingKey: '01', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '500000', accountName: 'Cost of Goods Sold', accountType: 'Expenses', balance: 2150000, isActive: true, category: 'Cost of Sales', subCategory: 'COGS', postingKey: '11', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '510000', accountName: 'Direct Labor', accountType: 'Expenses', balance: 450000, isActive: true, category: 'Cost of Sales', subCategory: 'Labor', postingKey: '11', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '520000', accountName: 'Manufacturing Overhead', accountType: 'Expenses', balance: 285000, isActive: true, category: 'Cost of Sales', subCategory: 'Overhead', postingKey: '11', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '600000', accountName: 'Salaries and Wages', accountType: 'Expenses', balance: 650000, isActive: true, category: 'Operating Expenses', subCategory: 'Personnel', postingKey: '12', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '610000', accountName: 'Rent Expense', accountType: 'Expenses', balance: 185000, isActive: true, category: 'Operating Expenses', subCategory: 'Facilities', postingKey: '12', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '620000', accountName: 'Utilities', accountType: 'Expenses', balance: 45000, isActive: true, category: 'Operating Expenses', subCategory: 'Facilities', postingKey: '12', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '630000', accountName: 'Depreciation Expense', accountType: 'Expenses', balance: 125000, isActive: true, category: 'Operating Expenses', subCategory: 'Depreciation', postingKey: '12', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '640000', accountName: 'Insurance Expense', accountType: 'Expenses', balance: 55000, isActive: true, category: 'Operating Expenses', subCategory: 'Insurance', postingKey: '12', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '650000', accountName: 'Maintenance and Repairs', accountType: 'Expenses', balance: 75000, isActive: true, category: 'Operating Expenses', subCategory: 'Maintenance', postingKey: '12', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '660000', accountName: 'Travel and Entertainment', accountType: 'Expenses', balance: 95000, isActive: true, category: 'Operating Expenses', subCategory: 'Travel', postingKey: '12', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '670000', accountName: 'Professional Services', accountType: 'Expenses', balance: 125000, isActive: true, category: 'Operating Expenses', subCategory: 'Consulting', postingKey: '12', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '680000', accountName: 'Office Supplies', accountType: 'Expenses', balance: 35000, isActive: true, category: 'Operating Expenses', subCategory: 'Supplies', postingKey: '12', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '690000', accountName: 'Marketing and Advertising', accountType: 'Expenses', balance: 175000, isActive: true, category: 'Operating Expenses', subCategory: 'Marketing', postingKey: '12', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '700000', accountName: 'Interest Expense', accountType: 'Expenses', balance: 85000, isActive: true, category: 'Non-Operating Expenses', subCategory: 'Interest', postingKey: '13', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
    { id: generateId('acc'), accountNumber: '710000', accountName: 'Tax Expense', accountType: 'Expenses', balance: 145000, isActive: true, category: 'Non-Operating Expenses', subCategory: 'Taxes', postingKey: '13', chartOfAccounts: 'INTL_USD', createdAt: now, updatedAt: now },
  ];
};

const seedJournalEntries = (accounts: Account[]): JournalEntry[] => {
  const now = new Date().toISOString();
  const getAccount = (num: string) => accounts.find(a => a.accountNumber === num);
  
  return [
    { id: generateId('je'), documentNumber: 'DOC-2025-0001', fiscalYear: '2025', period: '01', postingDate: '2025-01-03', documentDate: '2025-01-03', account: '100000', accountName: getAccount('100000')?.accountName || 'Cash', debit: 25000, credit: 0, description: 'Customer payment received - INV-2025-001', reference: 'CINV-2025-001', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DZ', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0001', fiscalYear: '2025', period: '01', postingDate: '2025-01-03', documentDate: '2025-01-03', account: '120000', accountName: getAccount('120000')?.accountName || 'AR', debit: 0, credit: 25000, description: 'Customer payment received - INV-2025-001', reference: 'CINV-2025-001', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DZ', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0002', fiscalYear: '2025', period: '01', postingDate: '2025-01-05', documentDate: '2025-01-05', account: '500000', accountName: getAccount('500000')?.accountName || 'COGS', debit: 15000, credit: 0, description: 'Cost of goods sold - January sales', reference: 'INV-2025-123', companyCode: '1000', costCenter: 'CC-2000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0002', fiscalYear: '2025', period: '01', postingDate: '2025-01-05', documentDate: '2025-01-05', account: '140000', accountName: getAccount('140000')?.accountName || 'Inventory', debit: 0, credit: 15000, description: 'Cost of goods sold - January sales', reference: 'INV-2025-123', companyCode: '1000', costCenter: 'CC-2000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0003', fiscalYear: '2025', period: '01', postingDate: '2025-01-07', documentDate: '2025-01-07', account: '200000', accountName: getAccount('200000')?.accountName || 'AP', debit: 45000, credit: 0, description: 'Payment to vendor - Dell Technologies', reference: 'PO-2025-001', companyCode: '1000', costCenter: 'CC-3000', documentType: 'KZ', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0003', fiscalYear: '2025', period: '01', postingDate: '2025-01-07', documentDate: '2025-01-07', account: '100000', accountName: getAccount('100000')?.accountName || 'Cash', debit: 0, credit: 45000, description: 'Payment to vendor - Dell Technologies', reference: 'PO-2025-001', companyCode: '1000', costCenter: 'CC-3000', documentType: 'KZ', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0004', fiscalYear: '2025', period: '01', postingDate: '2025-01-10', documentDate: '2025-01-10', account: '400000', accountName: getAccount('400000')?.accountName || 'Sales Revenue', debit: 0, credit: 85000, description: 'Sales invoice - Acme Corporation', reference: 'INV-2025-002', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0004', fiscalYear: '2025', period: '01', postingDate: '2025-01-10', documentDate: '2025-01-10', account: '120000', accountName: getAccount('120000')?.accountName || 'AR', debit: 85000, credit: 0, description: 'Sales invoice - Acme Corporation', reference: 'INV-2025-002', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0005', fiscalYear: '2025', period: '01', postingDate: '2025-01-12', documentDate: '2025-01-12', account: '600000', accountName: getAccount('600000')?.accountName || 'Salaries', debit: 125000, credit: 0, description: 'Payroll posting - January 1st half', reference: 'PR-2025-001', companyCode: '1000', costCenter: 'CC-4000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0005', fiscalYear: '2025', period: '01', postingDate: '2025-01-12', documentDate: '2025-01-12', account: '230000', accountName: getAccount('230000')?.accountName || 'Salaries Payable', debit: 0, credit: 125000, description: 'Payroll posting - January 1st half', reference: 'PR-2025-001', companyCode: '1000', costCenter: 'CC-4000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0006', fiscalYear: '2025', period: '01', postingDate: '2025-01-15', documentDate: '2025-01-15', account: '610000', accountName: getAccount('610000')?.accountName || 'Rent', debit: 45000, credit: 0, description: 'January rent payment', reference: 'RENT-2025-01', companyCode: '1000', costCenter: 'CC-4000', documentType: 'KR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0006', fiscalYear: '2025', period: '01', postingDate: '2025-01-15', documentDate: '2025-01-15', account: '100000', accountName: getAccount('100000')?.accountName || 'Cash', debit: 0, credit: 45000, description: 'January rent payment', reference: 'RENT-2025-01', companyCode: '1000', costCenter: 'CC-4000', documentType: 'KR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0007', fiscalYear: '2025', period: '01', postingDate: '2025-01-18', documentDate: '2025-01-18', account: '630000', accountName: getAccount('630000')?.accountName || 'Depreciation', debit: 12500, credit: 0, description: 'Monthly depreciation - Equipment', reference: 'DEP-2025-01', companyCode: '1000', costCenter: 'CC-2000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0007', fiscalYear: '2025', period: '01', postingDate: '2025-01-18', documentDate: '2025-01-18', account: '170000', accountName: getAccount('170000')?.accountName || 'Accum Depreciation', debit: 0, credit: 12500, description: 'Monthly depreciation - Equipment', reference: 'DEP-2025-01', companyCode: '1000', costCenter: 'CC-2000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0008', fiscalYear: '2025', period: '01', postingDate: '2025-01-20', documentDate: '2025-01-20', account: '160000', accountName: getAccount('160000')?.accountName || 'Fixed Assets', debit: 75000, credit: 0, description: 'Acquisition of new equipment', reference: 'PO-2025-025', companyCode: '1000', costCenter: 'CC-2000', documentType: 'AB', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0008', fiscalYear: '2025', period: '01', postingDate: '2025-01-20', documentDate: '2025-01-20', account: '200000', accountName: getAccount('200000')?.accountName || 'AP', debit: 0, credit: 75000, description: 'Acquisition of new equipment', reference: 'PO-2025-025', companyCode: '1000', costCenter: 'CC-2000', documentType: 'AB', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0009', fiscalYear: '2025', period: '01', postingDate: '2025-01-22', documentDate: '2025-01-22', account: '220000', accountName: getAccount('220000')?.accountName || 'Accrued Expenses', debit: 25000, credit: 0, description: 'Accrual for utilities', reference: 'UTIL-2025-01', companyCode: '1000', costCenter: 'CC-4000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0009', fiscalYear: '2025', period: '01', postingDate: '2025-01-22', documentDate: '2025-01-22', account: '620000', accountName: getAccount('620000')?.accountName || 'Utilities', debit: 0, credit: 25000, description: 'Accrual for utilities', reference: 'UTIL-2025-01', companyCode: '1000', costCenter: 'CC-4000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0010', fiscalYear: '2025', period: '01', postingDate: '2025-01-25', documentDate: '2025-01-25', account: '100000', accountName: getAccount('100000')?.accountName || 'Cash', debit: 125000, credit: 0, description: 'Loan proceeds - Working Capital', reference: 'LN-2025-001', companyCode: '1000', profitCenter: 'PC-1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0010', fiscalYear: '2025', period: '01', postingDate: '2025-01-25', documentDate: '2025-01-25', account: '250000', accountName: getAccount('250000')?.accountName || 'Short-term Debt', debit: 0, credit: 125000, description: 'Loan proceeds - Working Capital', reference: 'LN-2025-001', companyCode: '1000', profitCenter: 'PC-1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0011', fiscalYear: '2025', period: '01', postingDate: '2025-01-27', documentDate: '2025-01-27', account: '700000', accountName: getAccount('700000')?.accountName || 'Interest Expense', debit: 8500, credit: 0, description: 'Monthly interest accrual', reference: 'INT-2025-01', companyCode: '1000', costCenter: 'CC-5000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0011', fiscalYear: '2025', period: '01', postingDate: '2025-01-27', documentDate: '2025-01-27', account: '220000', accountName: getAccount('220000')?.accountName || 'Accrued Expenses', debit: 0, credit: 8500, description: 'Monthly interest accrual', reference: 'INT-2025-01', companyCode: '1000', costCenter: 'CC-5000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0012', fiscalYear: '2025', period: '01', postingDate: '2025-01-28', documentDate: '2025-01-28', account: '690000', accountName: getAccount('690000')?.accountName || 'Marketing', debit: 35000, credit: 0, description: 'Marketing campaign - Q1', reference: 'MKT-2025-001', companyCode: '1000', costCenter: 'CC-6000', documentType: 'KR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0012', fiscalYear: '2025', period: '01', postingDate: '2025-01-28', documentDate: '2025-01-28', account: '200000', accountName: getAccount('200000')?.accountName || 'AP', debit: 0, credit: 35000, description: 'Marketing campaign - Q1', reference: 'MKT-2025-001', companyCode: '1000', costCenter: 'CC-6000', documentType: 'KR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0013', fiscalYear: '2025', period: '01', postingDate: '2025-01-29', documentDate: '2025-01-29', account: '680000', accountName: getAccount('680000')?.accountName || 'Office Supplies', debit: 8500, credit: 0, description: 'Office supplies purchase', reference: 'PO-2025-030', companyCode: '1000', costCenter: 'CC-4000', documentType: 'MR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0013', fiscalYear: '2025', period: '01', postingDate: '2025-01-29', documentDate: '2025-01-29', account: '200000', accountName: getAccount('200000')?.accountName || 'AP', debit: 0, credit: 8500, description: 'Office supplies purchase', reference: 'PO-2025-030', companyCode: '1000', costCenter: 'CC-4000', documentType: 'MR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0014', fiscalYear: '2025', period: '01', postingDate: '2025-01-30', documentDate: '2025-01-30', account: '400000', accountName: getAccount('400000')?.accountName || 'Sales Revenue', debit: 0, credit: 150000, description: 'Sales - Global Manufacturing', reference: 'INV-2025-003', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0014', fiscalYear: '2025', period: '01', postingDate: '2025-01-30', documentDate: '2025-01-30', account: '120000', accountName: getAccount('120000')?.accountName || 'AR', debit: 150000, credit: 0, description: 'Sales - Global Manufacturing', reference: 'INV-2025-003', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0015', fiscalYear: '2025', period: '01', postingDate: '2025-01-31', documentDate: '2025-01-31', account: '660000', accountName: getAccount('660000')?.accountName || 'Travel', debit: 12500, credit: 0, description: 'Travel expenses - Sales team', reference: 'TRV-2025-001', companyCode: '1000', costCenter: 'CC-1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0015', fiscalYear: '2025', period: '01', postingDate: '2025-01-31', documentDate: '2025-01-31', account: '101000', accountName: getAccount('101000')?.accountName || 'Petty Cash', debit: 0, credit: 12500, description: 'Travel expenses - Sales team', reference: 'TRV-2025-001', companyCode: '1000', costCenter: 'CC-1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0016', fiscalYear: '2025', period: '01', postingDate: '2025-01-15', documentDate: '2025-01-15', account: '100000', accountName: getAccount('100000')?.accountName || 'Cash', debit: 0, credit: 25000, description: 'REVERSAL: Customer payment - INV-2025-001', reference: 'CINV-2025-001-REV', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DZ', status: 'Reversed', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0016', fiscalYear: '2025', period: '01', postingDate: '2025-01-15', documentDate: '2025-01-15', account: '120000', accountName: getAccount('120000')?.accountName || 'AR', debit: 25000, credit: 0, description: 'REVERSAL: Customer payment - INV-2025-001', reference: 'CINV-2025-001-REV', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DZ', status: 'Reversed', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0017', fiscalYear: '2025', period: '02', postingDate: '2025-02-03', documentDate: '2025-02-03', account: '400000', accountName: getAccount('400000')?.accountName || 'Sales Revenue', debit: 0, credit: 225000, description: 'Sales - Enterprise Solutions Inc', reference: 'INV-2025-004', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0017', fiscalYear: '2025', period: '02', postingDate: '2025-02-03', documentDate: '2025-02-03', account: '120000', accountName: getAccount('120000')?.accountName || 'AR', debit: 225000, credit: 0, description: 'Sales - Enterprise Solutions Inc', reference: 'INV-2025-004', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0018', fiscalYear: '2025', period: '02', postingDate: '2025-02-05', documentDate: '2025-02-05', account: '510000', accountName: getAccount('510000')?.accountName || 'Direct Labor', debit: 95000, credit: 0, description: 'Direct labor allocation - February', reference: 'LAB-2025-02', companyCode: '1000', costCenter: 'CC-2000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0018', fiscalYear: '2025', period: '02', postingDate: '2025-02-05', documentDate: '2025-02-05', account: '230000', accountName: getAccount('230000')?.accountName || 'Salaries Payable', debit: 0, credit: 95000, description: 'Direct labor allocation - February', reference: 'LAB-2025-02', companyCode: '1000', costCenter: 'CC-2000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0019', fiscalYear: '2025', period: '02', postingDate: '2025-02-10', documentDate: '2025-02-10', account: '670000', accountName: getAccount('670000')?.accountName || 'Professional Services', debit: 45000, credit: 0, description: 'Legal fees - Contract review', reference: 'LEGAL-2025-002', companyCode: '1000', costCenter: 'CC-4000', documentType: 'KR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0019', fiscalYear: '2025', period: '02', postingDate: '2025-02-10', documentDate: '2025-02-10', account: '200000', accountName: getAccount('200000')?.accountName || 'AP', debit: 0, credit: 45000, description: 'Legal fees - Contract review', reference: 'LEGAL-2025-002', companyCode: '1000', costCenter: 'CC-4000', documentType: 'KR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0020', fiscalYear: '2025', period: '02', postingDate: '2025-02-12', documentDate: '2025-02-12', account: '520000', accountName: getAccount('520000')?.accountName || 'Manufacturing Overhead', debit: 65000, credit: 0, description: 'Overhead allocation - February', reference: 'OVH-2025-02', companyCode: '1000', costCenter: 'CC-2000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0020', fiscalYear: '2025', period: '02', postingDate: '2025-02-12', documentDate: '2025-02-12', account: '150000', accountName: getAccount('150000')?.accountName || 'Prepaid Expenses', debit: 0, credit: 65000, description: 'Overhead allocation - February', reference: 'OVH-2025-02', companyCode: '1000', costCenter: 'CC-2000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0021', fiscalYear: '2025', period: '02', postingDate: '2025-02-15', documentDate: '2025-02-15', account: '100000', accountName: getAccount('100000')?.accountName || 'Cash', debit: 75000, credit: 0, description: 'Customer payment - INV-2025-002', reference: 'CINV-2025-002', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DZ', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0021', fiscalYear: '2025', period: '02', postingDate: '2025-02-15', documentDate: '2025-02-15', account: '120000', accountName: getAccount('120000')?.accountName || 'AR', debit: 0, credit: 75000, description: 'Customer payment - INV-2025-002', reference: 'CINV-2025-002', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DZ', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0022', fiscalYear: '2025', period: '02', postingDate: '2025-02-18', documentDate: '2025-02-18', account: '640000', accountName: getAccount('640000')?.accountName || 'Insurance', debit: 15000, credit: 0, description: 'Insurance premium - Q1', reference: 'INS-2025-Q1', companyCode: '1000', costCenter: 'CC-4000', documentType: 'KR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0022', fiscalYear: '2025', period: '02', postingDate: '2025-02-18', documentDate: '2025-02-18', account: '100000', accountName: getAccount('100000')?.accountName || 'Cash', debit: 0, credit: 15000, description: 'Insurance premium - Q1', reference: 'INS-2025-Q1', companyCode: '1000', costCenter: 'CC-4000', documentType: 'KR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0023', fiscalYear: '2025', period: '02', postingDate: '2025-02-20', documentDate: '2025-02-20', account: '500000', accountName: getAccount('500000')?.accountName || 'COGS', debit: 45000, credit: 0, description: 'COGS - February sales', reference: 'COGS-2025-02', companyCode: '1000', costCenter: 'CC-2000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0023', fiscalYear: '2025', period: '02', postingDate: '2025-02-20', documentDate: '2025-02-20', account: '140000', accountName: getAccount('140000')?.accountName || 'Inventory', debit: 0, credit: 45000, description: 'COGS - February sales', reference: 'COGS-2025-02', companyCode: '1000', costCenter: 'CC-2000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0024', fiscalYear: '2025', period: '02', postingDate: '2025-02-25', documentDate: '2025-02-25', account: '100000', accountName: getAccount('100000')?.accountName || 'Cash', debit: 0, credit: 85000, description: 'Vendor payment - Office Depot', reference: 'PO-2025-045', companyCode: '1000', costCenter: 'CC-4000', documentType: 'KZ', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0024', fiscalYear: '2025', period: '02', postingDate: '2025-02-25', documentDate: '2025-02-25', account: '200000', accountName: getAccount('200000')?.accountName || 'AP', debit: 85000, credit: 0, description: 'Vendor payment - Office Depot', reference: 'PO-2025-045', companyCode: '1000', costCenter: 'CC-4000', documentType: 'KZ', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0025', fiscalYear: '2025', period: '02', postingDate: '2025-02-28', documentDate: '2025-02-28', account: '710000', accountName: getAccount('710000')?.accountName || 'Tax Expense', debit: 45000, credit: 0, description: 'Income tax provision - February', reference: 'TAX-2025-02', companyCode: '1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0025', fiscalYear: '2025', period: '02', postingDate: '2025-02-28', documentDate: '2025-02-28', account: '240000', accountName: getAccount('240000')?.accountName || 'Taxes Payable', debit: 0, credit: 45000, description: 'Income tax provision - February', reference: 'TAX-2025-02', companyCode: '1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0026', fiscalYear: '2025', period: '02', postingDate: '2025-02-10', documentDate: '2025-02-10', account: '120000', accountName: getAccount('120000')?.accountName || 'AR', debit: 50000, credit: 0, description: 'DRAFT: Sales - TechStart Inc', reference: 'INV-2025-DRAFT', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DR', status: 'Draft', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0026', fiscalYear: '2025', period: '02', postingDate: '2025-02-10', documentDate: '2025-02-10', account: '400000', accountName: getAccount('400000')?.accountName || 'Sales Revenue', debit: 0, credit: 50000, description: 'DRAFT: Sales - TechStart Inc', reference: 'INV-2025-DRAFT', companyCode: '1000', costCenter: 'CC-1000', documentType: 'DR', status: 'Draft', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0027', fiscalYear: '2025', period: '02', postingDate: '2025-02-15', documentDate: '2025-02-15', account: '110000', accountName: getAccount('110000')?.accountName || 'Short-term Investments', debit: 200000, credit: 0, description: 'Purchase of treasury bills', reference: 'TB-2025-001', companyCode: '1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0027', fiscalYear: '2025', period: '02', postingDate: '2025-02-15', documentDate: '2025-02-15', account: '100000', accountName: getAccount('100000')?.accountName || 'Cash', debit: 0, credit: 200000, description: 'Purchase of treasury bills', reference: 'TB-2025-001', companyCode: '1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0028', fiscalYear: '2025', period: '02', postingDate: '2025-02-20', documentDate: '2025-02-20', account: '420000', accountName: getAccount('420000')?.accountName || 'Interest Income', debit: 0, credit: 8500, description: 'Interest earned - Bank account', reference: 'INT-INC-2025-02', companyCode: '1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0028', fiscalYear: '2025', period: '02', postingDate: '2025-02-20', documentDate: '2025-02-20', account: '102000', accountName: getAccount('102000')?.accountName || 'Cash in Bank', debit: 8500, credit: 0, description: 'Interest earned - Bank account', reference: 'INT-INC-2025-02', companyCode: '1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0029', fiscalYear: '2025', period: '02', postingDate: '2025-02-22', documentDate: '2025-02-22', account: '650000', accountName: getAccount('650000')?.accountName || 'Maintenance', debit: 22000, credit: 0, description: 'Equipment maintenance', reference: 'MAINT-2025-002', companyCode: '1000', costCenter: 'CC-2000', documentType: 'MR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0029', fiscalYear: '2025', period: '02', postingDate: '2025-02-22', documentDate: '2025-02-22', account: '201000', accountName: getAccount('201000')?.accountName || 'AP - Other', debit: 0, credit: 22000, description: 'Equipment maintenance', reference: 'MAINT-2025-002', companyCode: '1000', costCenter: 'CC-2000', documentType: 'MR', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0030', fiscalYear: '2025', period: '02', postingDate: '2025-02-28', documentDate: '2025-02-28', account: '330000', accountName: getAccount('330000')?.accountName || 'Dividends', debit: 100000, credit: 0, description: 'Dividend declaration', reference: 'DIV-2025-Q1', companyCode: '1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
    { id: generateId('je'), documentNumber: 'DOC-2025-0030', fiscalYear: '2025', period: '02', postingDate: '2025-02-28', documentDate: '2025-02-28', account: '230000', accountName: getAccount('230000')?.accountName || 'Salaries Payable', debit: 0, credit: 100000, description: 'Dividend declaration', reference: 'DIV-2025-Q1', companyCode: '1000', documentType: 'SA', status: 'Posted', createdAt: now, updatedAt: now },
  ];
};

const GeneralLedger: React.FC = () => {
  const navigate = useNavigate();
  const { isEnabled } = useVoiceAssistantContext();
  const { speak } = useVoiceAssistant();
  const [activeTab, setActiveTab] = useState('entries');
  const [accounts, setAccounts] = useState<Account[]>(() => seedChartOfAccounts());
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => seedJournalEntries(seedChartOfAccounts()));
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [selectedDocumentNumber, setSelectedDocumentNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const entryForm = useForm<z.infer<typeof journalEntrySchema>>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      debit: 0,
      credit: 0,
      companyCode: '1000',
      documentType: 'SA',
      postingDate: new Date().toISOString().split('T')[0],
      documentDate: new Date().toISOString().split('T')[0],
    },
  });

  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      postingKey: '01',
      chartOfAccounts: 'INTL_USD',
    },
  });

  useEffect(() => {
    if (isEnabled) {
      speak('Welcome to General Ledger. The central repository for all financial transactions.');
    }
  }, [isEnabled, speak]);

  const loadData = () => {
    setIsLoading(true);
    setAccounts(seedChartOfAccounts());
    setJournalEntries(seedJournalEntries(seedChartOfAccounts()));
    setIsLoading(false);
  };

  const saveEntries = (entries: JournalEntry[]) => {
    setJournalEntries(entries);
  };

  const saveAccounts = (newAccounts: Account[]) => {
    setAccounts(newAccounts);
  };

  const onSubmitEntry = (data: z.infer<typeof journalEntrySchema>) => {
    try {
      const documentNumber = selectedDocumentNumber || `DOC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      const account = accounts.find(acc => acc.accountNumber === data.account);
      
      const newEntry: JournalEntry = {
        id: generateId('je'),
        documentNumber,
        fiscalYear: new Date(data.postingDate).getFullYear().toString(),
        period: String(new Date(data.postingDate).getMonth() + 1).padStart(2, '0'),
        postingDate: data.postingDate,
        documentDate: data.documentDate,
        accountName: account?.accountName || 'Unknown Account',
        account: data.account,
        debit: data.debit,
        credit: data.credit,
        description: data.description,
        reference: data.reference || '',
        companyCode: data.companyCode,
        costCenter: data.costCenter,
        profitCenter: data.profitCenter,
        businessArea: data.businessArea,
        documentType: data.documentType,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedEntries = [...journalEntries, newEntry];
      saveEntries(updatedEntries);
      
      toast({
        title: 'Journal Entry Created',
        description: `Entry ${documentNumber} has been created successfully.`,
      });
      
      setIsEntryDialogOpen(false);
      setSelectedDocumentNumber('');
      entryForm.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create journal entry.',
        variant: 'destructive',
      });
    }
  };

  const onSubmitAccount = (data: z.infer<typeof accountSchema>) => {
    try {
      const now = new Date().toISOString();
      const newAccount: Account = {
        id: generateId('acc'),
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        accountType: data.accountType,
        category: data.category,
        subCategory: data.subCategory,
        balance: 0,
        isActive: true,
        postingKey: data.postingKey,
        chartOfAccounts: data.chartOfAccounts,
        createdAt: now,
        updatedAt: now,
      };

      const updatedAccounts = [...accounts, newAccount];
      saveAccounts(updatedAccounts);
      
      toast({
        title: 'Account Created',
        description: `Account ${data.accountNumber} has been created successfully.`,
      });
      
      setIsAccountDialogOpen(false);
      accountForm.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account.',
        variant: 'destructive',
      });
    }
  };

  const postEntry = (entry: JournalEntry) => {
    try {
      const updatedEntry = { ...entry, status: 'Posted' as const, updatedAt: new Date().toISOString() };
      const updatedEntries = journalEntries.map(e => e.id === entry.id ? updatedEntry : e);
      saveEntries(updatedEntries);
      
      const account = accounts.find(a => a.accountNumber === entry.account);
      if (account) {
        const updatedAccounts = accounts.map(a => {
          if (a.id === account.id) {
            const balanceChange = entry.debit - entry.credit;
            return { ...a, balance: a.balance + balanceChange, updatedAt: new Date().toISOString() };
          }
          return a;
        });
        saveAccounts(updatedAccounts);
      }
      
      toast({
        title: 'Entry Posted',
        description: `Journal entry ${entry.documentNumber} has been posted.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post entry.',
        variant: 'destructive',
      });
    }
  };

  const reverseEntry = (entry: JournalEntry) => {
    if (entry.status !== 'Posted') return;
    
    try {
      const reversedEntry = { ...entry, status: 'Reversed' as const, updatedAt: new Date().toISOString() };
      const updatedEntries = journalEntries.map(e => e.id === entry.id ? reversedEntry : e);
      saveEntries(updatedEntries);
      
      toast({
        title: 'Entry Reversed',
        description: `Journal entry ${entry.documentNumber} has been reversed.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reverse entry.',
        variant: 'destructive',
      });
    }
  };

  const deleteEntry = (entry: JournalEntry) => {
    if (entry.status === 'Posted') {
      toast({
        title: 'Cannot Delete',
        description: 'Posted entries cannot be deleted. Please reverse instead.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const updatedEntries = journalEntries.filter(e => e.id !== entry.id);
      saveEntries(updatedEntries);
      
      toast({
        title: 'Entry Deleted',
        description: `Journal entry ${entry.documentNumber} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete entry.',
        variant: 'destructive',
      });
    }
  };

  const deleteAccount = (account: Account) => {
    try {
      const updatedAccounts = accounts.filter(a => a.id !== account.id);
      saveAccounts(updatedAccounts);
      
      toast({
        title: 'Account Deleted',
        description: `Account ${account.accountNumber} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account.',
        variant: 'destructive',
      });
    }
  };

  const updateAccount = (account: Account, data: Partial<Account>) => {
    try {
      const updatedAccounts = accounts.map(a => a.id === account.id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a);
      saveAccounts(updatedAccounts);
      
      toast({
        title: 'Account Updated',
        description: `Account ${account.accountNumber} has been updated.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update account.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-yellow-100 text-yellow-800',
      'Posted': 'bg-green-100 text-green-800',
      'Reversed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: EnhancedColumn[] = [
    { key: 'documentNumber', header: 'Document #', sortable: true, searchable: true },
    { key: 'postingDate', header: 'Posting Date', sortable: true },
    { key: 'period', header: 'Period', sortable: true },
    { key: 'account', header: 'Account', searchable: true },
    { key: 'accountName', header: 'Account Name', searchable: true },
    { 
      key: 'debit', 
      header: 'Debit',
      sortable: true,
      render: (value: number) => value > 0 ? `$${value.toLocaleString()}` : '-'
    },
    { 
      key: 'credit', 
      header: 'Credit',
      sortable: true,
      render: (value: number) => value > 0 ? `$${value.toLocaleString()}` : '-'
    },
    { key: 'description', header: 'Description', searchable: true },
    { key: 'costCenter', header: 'Cost Center', searchable: true },
    {
      key: 'status',
      header: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Draft', value: 'Draft' },
        { label: 'Posted', value: 'Posted' },
        { label: 'Reversed', value: 'Reversed' }
      ],
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    }
  ];

  const entryActions: TableAction<Record<string, unknown>>[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: Record<string, unknown>) => {
        toast({
          title: 'View Entry',
          description: `Opening ${row.documentNumber}`,
        });
      },
      variant: 'ghost'
    },
    {
      label: 'Post',
      icon: <Check className="h-4 w-4" />,
      onClick: (row: Record<string, unknown>) => {
        postEntry(row as unknown as JournalEntry);
      },
      variant: 'ghost',
      condition: (row: Record<string, unknown>) => row.status === 'Draft'
    },
    {
      label: 'Reverse',
      icon: <TrendingUp className="h-4 w-4 transform rotate-180" />,
      onClick: (row: Record<string, unknown>) => {
        if (confirm(`Are you sure you want to reverse entry ${row.documentNumber}?`)) {
          reverseEntry(row as unknown as JournalEntry);
        }
      },
      variant: 'ghost',
      condition: (row: Record<string, unknown>) => row.status === 'Posted'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Record<string, unknown>) => {
        if (confirm(`Are you sure you want to delete entry ${row.documentNumber}?`)) {
          deleteEntry(row as unknown as JournalEntry);
        }
      },
      variant: 'ghost',
      condition: (row: Record<string, unknown>) => row.status === 'Draft'
    }
  ];

  const accountColumns: EnhancedColumn[] = [
    { key: 'accountNumber', header: 'Account #', sortable: true, searchable: true },
    { key: 'accountName', header: 'Account Name', searchable: true },
    { 
      key: 'accountType', 
      header: 'Type',
      filterable: true,
      filterOptions: [
        { label: 'Assets', value: 'Assets' },
        { label: 'Liabilities', value: 'Liabilities' },
        { label: 'Equity', value: 'Equity' },
        { label: 'Revenue', value: 'Revenue' },
        { label: 'Expenses', value: 'Expenses' }
      ]
    },
    { key: 'category', header: 'Category', searchable: true },
    { key: 'subCategory', header: 'Sub-Category', searchable: true },
    { 
      key: 'balance', 
      header: 'Balance',
      sortable: true,
      render: (value: number) => (
        <span className={value < 0 ? 'text-red-600' : value > 0 ? 'text-green-600' : ''}>
          ${Math.abs(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value: boolean) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  const accountActions: TableAction<Record<string, unknown>>[] = [
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: Record<string, unknown>) => {
        updateAccount(row as unknown as Account, { isActive: !row.isActive });
      },
      variant: 'ghost'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Record<string, unknown>) => {
        if (confirm(`Are you sure you want to delete account ${row.accountNumber}?`)) {
          deleteAccount(row as unknown as Account);
        }
      },
      variant: 'ghost'
    }
  ];

  const postedEntries = journalEntries.filter(e => e.status === 'Posted');
  const trialBalance = useMemo(() => {
    const grouped: Record<string, { accountNumber: string; accountName: string; accountType: string; debitBalance: number; creditBalance: number }> = {};
    
    postedEntries.forEach(entry => {
      if (!grouped[entry.account]) {
        const account = accounts.find(a => a.accountNumber === entry.account);
        grouped[entry.account] = {
          accountNumber: entry.account,
          accountName: entry.accountName,
          accountType: account?.accountType || 'Unknown',
          debitBalance: 0,
          creditBalance: 0
        };
      }
      grouped[entry.account].debitBalance += entry.debit;
      grouped[entry.account].creditBalance += entry.credit;
    });

    return Object.values(grouped).map(item => {
      const isDebitType = item.accountType === 'Assets' || item.accountType === 'Expenses';
      const isCreditType = item.accountType === 'Liabilities' || item.accountType === 'Equity' || item.accountType === 'Revenue';
      return {
        ...item,
        debitBalance: isDebitType ? Math.abs(item.debitBalance - item.creditBalance) : 0,
        creditBalance: isCreditType ? Math.abs(item.creditBalance - item.debitBalance) : 0,
      };
    });
  }, [postedEntries, accounts]);

  const totalDebits = trialBalance.reduce((sum, acc) => sum + acc.debitBalance, 0);
  const totalCredits = trialBalance.reduce((sum, acc) => sum + acc.creditBalance, 0);

  const totalAssets = accounts.filter(acc => acc.accountType === 'Assets').reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = accounts.filter(acc => acc.accountType === 'Liabilities').reduce((sum, acc) => sum + acc.balance, 0);
  const totalEquity = accounts.filter(acc => acc.accountType === 'Equity').reduce((sum, acc) => sum + acc.balance, 0);
  const totalRevenue = accounts.filter(acc => acc.accountType === 'Revenue').reduce((sum, acc) => sum + acc.balance, 0);
  const totalExpenses = accounts.filter(acc => acc.accountType === 'Expenses').reduce((sum, acc) => sum + acc.balance, 0);
  const netIncome = totalRevenue - totalExpenses;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading General Ledger data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate('/finance')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <PageHeader
          title="General Ledger"
          description="Central repository for all financial transactions with real-time posting"
          voiceIntroduction="Welcome to General Ledger, the heart of SAP S/4HANA financial accounting."
        />
      </div>

      <VoiceTrainingComponent 
        module="finance"
        topic="General Ledger and Universal Journal"
        examples={[
          "Understanding the Universal Journal as the single source of truth for all financial and management accounting data",
          "Real-time posting of transactions with immediate impact on financial statements and reports",
          "Managing account hierarchies, cost center assignments, and profit center allocations"
        ]}
        detailLevel="advanced"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('entries')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{journalEntries.length}</div>
            <div className="text-sm text-muted-foreground">Journal Entries</div>
            <div className="text-sm text-blue-600">{journalEntries.filter(e => e.status === 'Posted').length} posted</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('balance')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${totalDebits.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Debits</div>
            <div className={`text-sm ${totalDebits === totalCredits ? 'text-green-600' : 'text-red-600'}`}>
              {totalDebits === totalCredits ? 'Balanced' : 'Unbalanced'}
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('balance')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${totalCredits.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Credits</div>
            <div className={`text-sm ${totalDebits === totalCredits ? 'text-green-600' : 'text-red-600'}`}>
              {totalDebits === totalCredits ? 'Balanced' : 'Unbalanced'}
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('accounts')}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{accounts.filter(acc => acc.isActive).length}</div>
            <div className="text-sm text-muted-foreground">Active Accounts</div>
            <div className="text-sm text-purple-600">Chart of accounts</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Journal Entries ({journalEntries.length})
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={loadData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Journal Entry</DialogTitle>
                      </DialogHeader>
                      <Form {...entryForm}>
                        <form onSubmit={entryForm.handleSubmit(onSubmitEntry)} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={entryForm.control}
                              name="postingDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Posting Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={entryForm.control}
                              name="documentDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Document Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={entryForm.control}
                              name="account"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Account</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select account" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {accounts.filter(acc => acc.isActive).map((account) => (
                                        <SelectItem key={account.id} value={account.accountNumber}>
                                          {account.accountNumber} - {account.accountName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={entryForm.control}
                              name="companyCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Code</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select company code" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1000">1000 - Main Company</SelectItem>
                                      <SelectItem value="2000">2000 - Subsidiary A</SelectItem>
                                      <SelectItem value="3000">3000 - Subsidiary B</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={entryForm.control}
                              name="documentType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Document Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select document type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="SA">SA - General Posting</SelectItem>
                                      <SelectItem value="DZ">DZ - Customer Payment</SelectItem>
                                      <SelectItem value="KZ">KZ - Vendor Payment</SelectItem>
                                      <SelectItem value="AB">AB - Asset Posting</SelectItem>
                                      <SelectItem value="RE">RE - Invoice</SelectItem>
                                      <SelectItem value="DR">DR - Receivables</SelectItem>
                                      <SelectItem value="KR">KR - Payables</SelectItem>
                                      <SelectItem value="MR">MR - Material Receipt</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={entryForm.control}
                              name="reference"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reference</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Reference number (optional)" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={entryForm.control}
                              name="debit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Debit Amount</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0" 
                                      step="0.01" 
                                      {...field} 
                                      onChange={(e) => {
                                        field.onChange(parseFloat(e.target.value) || 0);
                                        if (parseFloat(e.target.value) > 0) {
                                          entryForm.setValue('credit', 0);
                                        }
                                      }} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={entryForm.control}
                              name="credit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Credit Amount</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0" 
                                      step="0.01" 
                                      {...field} 
                                      onChange={(e) => {
                                        field.onChange(parseFloat(e.target.value) || 0);
                                        if (parseFloat(e.target.value) > 0) {
                                          entryForm.setValue('debit', 0);
                                        }
                                      }} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={entryForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter transaction description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={entryForm.control}
                              name="costCenter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cost Center</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select cost center (optional)" />
                                      </SelectTrigger>
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
                            <FormField
                              control={entryForm.control}
                              name="profitCenter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Profit Center</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select profit center (optional)" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="PC-1000">PC-1000 - North America</SelectItem>
                                      <SelectItem value="PC-2000">PC-2000 - Europe</SelectItem>
                                      <SelectItem value="PC-3000">PC-3000 - Asia Pacific</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Create Entry</Button>
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
                columns={columns}
                data={journalEntries as unknown as Record<string, unknown>[]}
                actions={entryActions as unknown as TableAction<Record<string, unknown>>[]}
                searchPlaceholder="Search journal entries..."
                exportable={true}
                refreshable={true}
                onRefresh={loadData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Chart of Accounts ({accounts.length})</span>
                <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Account</DialogTitle>
                    </DialogHeader>
                    <Form {...accountForm}>
                      <form onSubmit={accountForm.handleSubmit(onSubmitAccount)} className="space-y-4">
                        <FormField
                          control={accountForm.control}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter account number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="accountName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter account name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="accountType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select account type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Assets">Assets</SelectItem>
                                  <SelectItem value="Liabilities">Liabilities</SelectItem>
                                  <SelectItem value="Equity">Equity</SelectItem>
                                  <SelectItem value="Revenue">Revenue</SelectItem>
                                  <SelectItem value="Expenses">Expenses</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter category" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="subCategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sub-Category</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter sub-category" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="postingKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Posting Key</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select posting key" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="01">01 - Customer Invoice</SelectItem>
                                  <SelectItem value="10">10 - Fixed Assets</SelectItem>
                                  <SelectItem value="11">11 - Cost of Sales</SelectItem>
                                  <SelectItem value="12">12 - Expenses</SelectItem>
                                  <SelectItem value="13">13 - Interest</SelectItem>
                                  <SelectItem value="40">40 - Bank/Cash</SelectItem>
                                  <SelectItem value="50">50 - Vendor Invoice</SelectItem>
                                  <SelectItem value="55">55 - Long-term Liabilities</SelectItem>
                                  <SelectItem value="70">70 - Equity</SelectItem>
                                  <SelectItem value="71">71 - Dividends</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Create Account</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedDataTable 
                columns={accountColumns}
                data={accounts as unknown as Record<string, unknown>[]}
                actions={accountActions as unknown as TableAction<Record<string, unknown>>[]}
                searchPlaceholder="Search accounts..."
                exportable={true}
                refreshable={true}
                onRefresh={loadData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Trial Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 font-semibold border-b pb-2">
                  <div>Account</div>
                  <div>Account Name</div>
                  <div>Type</div>
                  <div className="text-right">Debit</div>
                  <div className="text-right">Credit</div>
                </div>
                {trialBalance.map((account, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 py-2 hover:bg-gray-50">
                    <div className="font-mono">{account.accountNumber}</div>
                    <div>{account.accountName}</div>
                    <div>{account.accountType}</div>
                    <div className="text-right font-medium">
                      {account.debitBalance > 0 ? `$${account.debitBalance.toLocaleString()}` : '-'}
                    </div>
                    <div className="text-right font-medium">
                      {account.creditBalance > 0 ? `$${account.creditBalance.toLocaleString()}` : '-'}
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-5 gap-4 pt-4 border-t font-bold text-lg">
                  <div className="col-span-3">Total</div>
                  <div className="text-right">${totalDebits.toLocaleString()}</div>
                  <div className="text-right">${totalCredits.toLocaleString()}</div>
                </div>
                {totalDebits !== totalCredits && (
                  <div className="text-red-600 text-center flex items-center justify-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Trial balance does not balance! Difference: ${Math.abs(totalDebits - totalCredits).toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Financial Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Assets</span>
                    <span className="font-medium">${Math.abs(totalAssets).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Liabilities</span>
                    <span className="font-medium">${Math.abs(totalLiabilities).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total Equity</span>
                    <span>${(Math.abs(totalAssets) - Math.abs(totalLiabilities)).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Period Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-medium text-green-600">${Math.abs(totalRevenue).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses</span>
                    <span className="font-medium text-red-600">${Math.abs(totalExpenses).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Net Income</span>
                    <span className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${Math.abs(netIncome).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Account Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'].map((type) => {
                    const typeAccounts = accounts.filter(acc => acc.accountType === type);
                    const typeTotal = typeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
                    return (
                      <div key={type} className="flex justify-between">
                        <span>{type} ({typeAccounts.length})</span>
                        <span className="font-medium">${Math.abs(typeTotal).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Transactions</span>
                    <span className="font-medium">{journalEntries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posted Entries</span>
                    <span className="font-medium text-green-600">
                      {journalEntries.filter(entry => entry.status === 'Posted').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Draft Entries</span>
                    <span className="font-medium text-yellow-600">
                      {journalEntries.filter(entry => entry.status === 'Draft').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reversed Entries</span>
                    <span className="font-medium text-red-600">
                      {journalEntries.filter(entry => entry.status === 'Reversed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneralLedger;
