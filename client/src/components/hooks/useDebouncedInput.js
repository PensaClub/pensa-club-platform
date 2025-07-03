// hooks/useDebouncedInput.js
import { useState, useEffect, useCallback } from 'react';

export const useDebouncedInput = (initialValue, onDebouncedChange, delay = 100) => {
  const [localValue, setLocalValue] = useState(initialValue || '');

  useEffect(() => {
    setLocalValue(initialValue || '');
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== (initialValue || '')) {
        onDebouncedChange(localValue);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, delay, onDebouncedChange, initialValue]);

  return [localValue, setLocalValue];
};