import { useState, useCallback, useEffect } from 'react';
import { listEntities, upsertEntity, removeEntity, generateId } from '../localCrud';

export function usePMCRUD<T extends { id: string }>(storageKey: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [storageKey]);

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      let items = listEntities<T>(storageKey);
      if (items.length === 0 && initialData.length > 0) {
        initialData.forEach(item => upsertEntity(storageKey, item));
        items = listEntities<T>(storageKey);
      }
      setData(items);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [storageKey, initialData]);

  const create = useCallback((item: Omit<T, 'id'>): T => {
    const newItem = { ...item, id: generateId(storageKey.split('-')[1] || 'item') } as T;
    upsertEntity(storageKey, newItem);
    setData(prev => [newItem, ...prev]);
    return newItem;
  }, [storageKey]);

  const update = useCallback((item: T): T => {
    upsertEntity(storageKey, item);
    setData(prev => prev.map(d => d.id === item.id ? item : d));
    return item;
  }, [storageKey]);

  const remove = useCallback((id: string): void => {
    removeEntity<T>(storageKey, id);
    setData(prev => prev.filter(d => d.id !== id));
  }, [storageKey]);

  const getById = useCallback((id: string): T | undefined => {
    return data.find(d => d.id === id);
  }, [data]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    getById,
    refresh,
    setData
  };
}

// Search and filter helpers
export function filterData<T>(data: T[], searchTerm: string, keys: (keyof T)[]): T[] {
  if (!searchTerm) return data;
  const term = searchTerm.toLowerCase();
  return data.filter(item =>
    keys.some(key => {
      const value = item[key];
      return value !== undefined && String(value).toLowerCase().includes(term);
    })
  );
}

export function sortData<T>(data: T[], key: keyof T, direction: 'asc' | 'desc'): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal === bVal) return 0;
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;
    const comparison = aVal < bVal ? -1 : 1;
    return direction === 'asc' ? comparison : -comparison;
  });
}

export function paginateData<T>(data: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}
