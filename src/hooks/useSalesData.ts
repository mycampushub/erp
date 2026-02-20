import { useState, useEffect } from 'react';
import { listEntities } from '../lib/localCrud';
import { initializeSalesData, SALES_STORAGE_KEYS } from '../lib/salesData';

export function useSalesData<T extends { id: string }>(storageKey: string, initialData?: T[]): [T[], boolean, () => void] {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    const stored = listEntities<T>(storageKey);
    if (stored.length > 0) {
      setData(stored);
    } else if (initialData) {
      setData(initialData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initializeSalesData();
    loadData();
  }, []);

  return [data, isLoading, loadData];
}

export function useCustomers() {
  return useSalesData(SALES_STORAGE_KEYS.CUSTOMERS);
}

export function useSalesOrders() {
  return useSalesData(SALES_STORAGE_KEYS.ORDERS);
}

export function useQuotations() {
  return useSalesData(SALES_STORAGE_KEYS.QUOTATIONS);
}

export function useContracts() {
  return useSalesData(SALES_STORAGE_KEYS.CONTRACTS);
}

export function usePriceLists() {
  return useSalesData(SALES_STORAGE_KEYS.PRICE_LISTS);
}

export function useProducts() {
  return useSalesData(SALES_STORAGE_KEYS.PRODUCTS);
}

export function useInvoices() {
  return useSalesData(SALES_STORAGE_KEYS.INVOICES);
}

export function useCreditChecks() {
  return useSalesData(SALES_STORAGE_KEYS.CREDIT_CHECKS);
}

export function useCustomerCredit() {
  return useSalesData(SALES_STORAGE_KEYS.CUSTOMER_CREDIT);
}

export function useReturns() {
  return useSalesData(SALES_STORAGE_KEYS.RETURNS);
}

export function useCommissionRecords() {
  return useSalesData(SALES_STORAGE_KEYS.COMMISSION_RECORDS);
}

export function useCommissionPlans() {
  return useSalesData(SALES_STORAGE_KEYS.COMMISSION_PLANS);
}

export function useTerritories() {
  return useSalesData(SALES_STORAGE_KEYS.TERRITORIES);
}

export function useTerritoryRules() {
  return useSalesData(SALES_STORAGE_KEYS.TERRITORY_RULES);
}
