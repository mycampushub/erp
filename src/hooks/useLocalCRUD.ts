import { useState, useCallback } from 'react';

export interface CRUDItem {
  id: string;
  [key: string]: any;
}

export interface UseLocalCRUDOptions<T extends CRUDItem> {
  storageKey: string;
  defaultData: T[];
}

export function useLocalCRUD<T extends CRUDItem>({ storageKey, defaultData }: UseLocalCRUDOptions<T>) {
  const [data, setData] = useState<T[]>(() => {
    return defaultData;
  });

  const [loading, setLoading] = useState(false);

  const create = useCallback((item: Omit<T, 'id'>): T => {
    const newItem = { ...item, id: `${storageKey}-${Date.now()}` } as T;
    setData(prev => {
      const updated = [newItem, ...prev];
      return updated;
    });
    return newItem;
  }, [storageKey]);

  const update = useCallback((id: string, updates: Partial<T>): void => {
    setData(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      return updated;
    });
  }, []);

  const remove = useCallback((id: string): void => {
    setData(prev => {
      const updated = prev.filter(item => item.id !== id);
      return updated;
    });
  }, []);

  const getById = useCallback((id: string): T | undefined => {
    return data.find(item => item.id === id);
  }, [data]);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  }, []);

  return {
    data,
    setData,
    loading,
    create,
    update,
    remove,
    getById,
    refresh,
  };
}
