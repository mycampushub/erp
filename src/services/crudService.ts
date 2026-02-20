import { useState, useCallback } from 'react';

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRUDOperations<T extends BaseEntity> {
  data: T[];
  loading: boolean;
  error: string | null;
  create: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => T;
  update: (id: string, updates: Partial<T>) => void;
  delete: (id: string) => void;
  getById: (id: string) => T | undefined;
  refresh: () => void;
  clear: () => void;
  setData: (data: T[]) => void;
}

export function useCRUD<T extends BaseEntity>(
  storageKey: string,
  defaultData: T[]
): CRUDOperations<T> {
  const [data, setData] = useState<T[]>(() => defaultData);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback((item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T => {
    const now = new Date().toISOString();
    const newItem: T = {
      ...item,
      id: `${storageKey}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    } as T;
    
    setData(prev => [newItem, ...prev]);
    return newItem;
  }, [storageKey]);

  const update = useCallback((id: string, updates: Partial<T>): void => {
    setData(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    ));
  }, []);

  const deleteItem = useCallback((id: string): void => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  const getById = useCallback((id: string): T | undefined => {
    return data.find(item => item.id === id);
  }, [data]);

  const refresh = useCallback((): void => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const clear = useCallback((): void => {
    setData([]);
  }, []);

  return {
    data,
    loading,
    error,
    create,
    update,
    delete: deleteItem,
    getById,
    refresh,
    clear,
    setData: (newData: T[]) => setData(newData)
  };
}

export const STORAGE_KEYS = {
  MATERIALS: 'sap_materials',
  CUSTOMERS: 'sap_customers',
  VENDORS: 'sap_vendors',
  COST_CENTERS: 'sap_cost_centers',
  PROFIT_CENTERS: 'sap_profit_centers',
  CHART_OF_ACCOUNTS: 'sap_chart_of_accounts',
  BUSINESS_PARTNERS: 'sap_business_partners',
  BANKS: 'sap_banks',
  ASSETS: 'sap_assets',
  PLANTS: 'sap_plants',
  AP_INVOICES: 'sap_ap_invoices',
  AR_INVOICES: 'sap_ar_invoices',
  FIXED_ASSETS: 'sap_fixed_assets',
  PURCHASE_ORDERS: 'sap_purchase_orders',
  SALES_ORDERS: 'sap_sales_orders',
  PROJECTS: 'sap_projects',
  TASKS: 'sap_tasks',
  RISKS: 'sap_risks',
  RESOURCES: 'sap_resources',
  DOCUMENTS: 'sap_documents',
  TIMESHEETS: 'sap_timesheets',
  TIME_ENTRIES: 'sap_time_entries',
  BENEFIT_PLANS: 'sap_benefit_plans',
  COMPENSATION_BANDS: 'sap_compensation_bands',
  JOB_POSTINGS: 'sap_job_postings',
  SUCCESSION_PLANS: 'sap_succession_plans',
  REVIEW_CYCLES: 'sap_review_cycles',
  LEARNING_PROGRAMS: 'sap_learning_programs',
  DEVELOPMENT_PLANS: 'sap_development_plans',
  EMPLOYEES: 'sap_employees',
  PAYROLL_RECORDS: 'sap_payroll_records',
  VMI_PROGRAMS: 'sap_vmi_programs',
  FACILITIES: 'sap_facilities',
  DEMAND_FORECASTS: 'sap_demand_forecasts',
  WORK_CENTERS: 'sap_work_centers',
  MAINTENANCE_ORDERS: 'sap_maintenance_orders',
  BOMs: 'sap_boms',
  CAPACITY_PLANS: 'sap_capacity_plans',
  CATALOG_ITEMS: 'sap_catalog_items',
  CONTRACTS: 'sap_contracts',
  INVOICES: 'sap_invoices',
  RECEIPTS: 'sap_receipts',
  RFQS: 'sap_rfqs',
  SOURCE_LISTS: 'sap_source_lists',
  SUPPLIERS: 'sap_suppliers',
  ACCOUNTS: 'sap_accounts',
  INVESTMENTS: 'sap_investments',
  BUDGET_VERSIONS: 'sap_budget_versions',
  TAX_CONFIG: 'sap_tax_config',
};
