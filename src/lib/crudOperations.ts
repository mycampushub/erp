// Comprehensive CRUD operations utility with in-memory persistence
import { generateId } from './localCrud';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

const memoryStore = new Map<string, unknown[]>();

// Generic CRUD operations
export class CRUDManager<T extends BaseEntity> {
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  // Create
  create(data: Omit<T, keyof BaseEntity>): T {
    const newEntity = {
      ...data,
      id: generateId(this.storageKey),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;

    const all = this.getAll();
    all.unshift(newEntity);
    this.save(all);
    return newEntity;
  }

  // Read all
  getAll(): T[] {
    return (memoryStore.get(this.storageKey) as T[]) || [];
  }

  // Read one
  getById(id: string): T | undefined {
    return this.getAll().find(item => item.id === id);
  }

  // Update
  update(id: string, data: Partial<T>): T | null {
    const all = this.getAll();
    const index = all.findIndex(item => item.id === id);
    
    if (index === -1) return null;

    all[index] = {
      ...all[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    this.save(all);
    return all[index];
  }

  // Delete
  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter(item => item.id !== id);
    
    if (filtered.length === all.length) return false;
    
    this.save(filtered);
    return true;
  }

  // Bulk operations
  bulkCreate(items: Omit<T, keyof BaseEntity>[]): T[] {
    const newItems = items.map(data => ({
      ...data,
      id: generateId(this.storageKey),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T));

    const all = this.getAll();
    all.unshift(...newItems);
    this.save(all);
    return newItems;
  }

  bulkDelete(ids: string[]): number {
    const all = this.getAll();
    const filtered = all.filter(item => !ids.includes(item.id));
    const deletedCount = all.length - filtered.length;
    
    this.save(filtered);
    return deletedCount;
  }

  // Search and filter
  search(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  // Pagination
  paginate(page: number, pageSize: number): { data: T[]; total: number; pages: number } {
    const all = this.getAll();
    const total = all.length;
    const pages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = all.slice(start, start + pageSize);

    return { data, total, pages };
  }

  // Seed data
  seed(data: T[]): void {
    if (this.getAll().length === 0) {
      this.save(data);
    }
  }

  // Export/Import
  export(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  import(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        this.save(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Private helper
  private save(data: T[]): void {
    memoryStore.set(this.storageKey, data);
  }

  // Clear all data
  clear(): void {
    memoryStore.delete(this.storageKey);
  }
}

// Export singleton instances for common entities
export const materialManager = new CRUDManager('materials');
export const customerManager = new CRUDManager('customers');
export const vendorManager = new CRUDManager('vendors');
export const employeeManager = new CRUDManager('employees');
export const purchaseOrderManager = new CRUDManager('purchase_orders');
export const salesOrderManager = new CRUDManager('sales_orders');
export const productionOrderManager = new CRUDManager('production_orders');
export const inventoryManager = new CRUDManager('inventory');
export const contractManager = new CRUDManager('contracts');
export const projectManager = new CRUDManager('projects');
export const assetManager = new CRUDManager('assets');
export const glAccountManager = new CRUDManager('gl_accounts');
