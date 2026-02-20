import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type EntityWithId = { id: string } & Record<string, unknown>;

class MemoryStore {
  private store: Map<string, EntityWithId[]> = new Map();
  private initialized: Set<string> = new Set();

  get<T extends EntityWithId>(key: string): T[] {
    return (this.store.get(key) as T[]) || [];
  }

  set(key: string, data: EntityWithId[]): void {
    this.store.set(key, data);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  isInitialized(key: string): boolean {
    return this.initialized.has(key);
  }

  markInitialized(key: string): void {
    this.initialized.add(key);
  }

  clear(): void {
    this.store.clear();
    this.initialized.clear();
  }
}

const memoryStore = new MemoryStore();

export function listEntities<T extends EntityWithId>(key: string): T[] {
  return memoryStore.get<T>(key);
}

export function upsertEntity<T extends EntityWithId>(key: string, entity: T): T {
  const all = memoryStore.get<T>(key);
  const idx = all.findIndex((e) => e.id === entity.id);
  if (idx >= 0) {
    all[idx] = entity;
  } else {
    all.unshift(entity);
  }
  memoryStore.set(key, all);
  return entity;
}

export function removeEntity<T extends EntityWithId>(key: string, id: string): void {
  const all = memoryStore.get<T>(key);
  const filtered = all.filter((e) => e.id !== id);
  memoryStore.set(key, filtered);
}

export function getEntity<T extends EntityWithId>(key: string, id: string): T | undefined {
  return memoryStore.get<T>(key).find((e) => e.id === id);
}

export function seedIfEmpty<T extends EntityWithId>(key: string, seed: T[]): void {
  const all = memoryStore.get<T>(key);
  if (!all || all.length === 0) {
    memoryStore.set(key, seed);
    memoryStore.markInitialized(key);
  }
}

export function isInitialized(key: string): boolean {
  return memoryStore.isInitialized(key);
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function resetStore(): void {
  memoryStore.clear();
}

interface AppDataContextType {
  isReady: boolean;
}

const AppDataContext = createContext<AppDataContextType>({ isReady: true });

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [isReady] = useState(true);

  return (
    <AppDataContext.Provider value={{ isReady }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
