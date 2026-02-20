import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return initialValue;
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting value for key "${key}":`, error);
    }
  }, [storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing value for key "${key}":`, error);
    }
  }, [initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
