import { generateId } from './localCrud';

export const SALES_STORAGE_KEYS = {
  ORDERS: 'sales_orders',
  CUSTOMERS: 'sales_customers',
  PRODUCTS: 'sales_products',
  QUOTATIONS: 'sales_quotations',
  CONTRACTS: 'sales_contracts',
  INVOICES: 'sales_invoices',
  TERRITORIES: 'sales_territories',
  TERRITORY_RULES: 'sales_territory_rules',
  PRICE_LISTS: 'sales_price_lists',
  PRICING_CONDITIONS: 'sales_pricing_conditions',
  COMMISSIONS: 'sales_commissions',
  CREDIT_CHECKS: 'sales_credit_checks',
  RETURNS: 'sales_returns',
};

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: string;
  totalAmount: number;
  status: string;
  salesRep: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  company?: string;
  status: string;
  creditLimit?: number;
  totalRevenue?: number;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  category?: string;
  price: number;
  stock?: number;
  status?: string;
}

export interface Quotation {
  id: string;
  customer: string;
  status: string;
  totalAmount: number;
}

export interface QuotationItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface SalesContract {
  id: string;
  contractNumber: string;
  customer: string;
  status: string;
}

export interface DeliverySchedule {
  id: string;
}

export interface Invoice {
  id: string;
  status: string;
  amount: number;
}

export interface BillingCreditMemo {
  id: string;
}

export interface Territory {
  id: string;
  name: string;
  region?: string;
  salesRep?: string;
  target?: number;
  achieved?: number;
  customers?: number;
  status: string;
  [key: string]: any;
}

export interface TerritoryRule {
  id: string;
  name: string;
  territoryId?: string;
  conditionType?: string;
  conditionValue?: string;
  priority?: number;
  [key: string]: any;
}

export interface PriceList {
  id: string;
  name: string;
  currency?: string;
  validFrom?: string;
  validTo?: string;
  status: string;
  [key: string]: any;
}

export interface PricingCondition {
  id: string;
  conditionNumber: string;
  type: string;
  product: string;
  [key: string]: any;
}

export interface CommissionRecord {
  id: string;
  salesRep: string;
  amount: number;
}

export interface CommissionPlan {
  id: string;
  name: string;
}

export interface CreditCheck {
  id: string;
  customerId: string;
  status: string;
}

export interface CustomerCredit {
  id: string;
  customerId: string;
  limit: number;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  customer: string;
  status: string;
}

export interface ReturnCreditMemo {
  id: string;
}

export const initializeSalesData = () => {
  // No-op - data is now in-memory
};

export const sampleOrders: SalesOrder[] = [
  { id: generateId('so'), orderNumber: 'SO-001', customer: 'Acme Corp', totalAmount: 50000, status: 'Completed', salesRep: 'John Smith' },
];

export const sampleCustomers: Customer[] = [
  { id: generateId('cust'), name: 'Acme Corp', status: 'Active', totalRevenue: 100000 },
];

export const sampleProducts: Product[] = [
  { id: generateId('prod'), productCode: 'PROD-001', name: 'Sample Product', price: 100, status: 'Active' },
];
