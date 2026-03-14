import React, { useEffect, useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';

export default function AutoSaveTextarea({ 
  value, 
  onChange, 
  placeholder, 
  className,
  storageKey,
  ...props 
}) {
  const [localValue, setLocalValue] = useState(value || '');

  // Încarcă din localStorage la mount
  useEffect(() => {
    if (storageKey) {
      const savedValue = localStorage.getItem(`autosave_${storageKey}`);
      if (savedValue && (!value || value.length === 0)) {
        setLocalValue(savedValue);
        if (onChange) onChange({ target: { value: savedValue } });
      }
    }
  }, [storageKey, value, onChange]);

  // Auto-save la fiecare modificare
  useEffect(() => {
    if (storageKey && localValue) {
      localStorage.setItem(`autosave_${storageKey}`, localValue);
    }
  }, [localValue, storageKey]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (onChange) onChange(e);
  }, [onChange]);

  // Curățare când form-ul este trimis cu succes
  const clearAutoSave = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(`autosave_${storageKey}`);
    }
  }, [storageKey]);

  // Expune funcția de clear prin ref
  React.useImperativeHandle(props.ref, () => ({
    clearAutoSave
  }));

  return (
    <div className="relative">
      <Textarea
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        {...props}
      />
      {storageKey && localValue && (
        <div className="text-xs text-green-600 mt-1 flex items-center">
          ✓ Salvat automat local
        </div>
      )}
    </div>
  );
}