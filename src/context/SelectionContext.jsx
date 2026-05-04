import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'soparimex_selection';

const SelectionContext = createContext();

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('SelectionContext: could not save to localStorage', e);
  }
};

export const SelectionProvider = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState(loadFromStorage);

  useEffect(() => {
    saveToStorage(selectedItems);
  }, [selectedItems]);

  const addToSelection = useCallback((product) => {
    if (!product?.id) return;
    setSelectedItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [
        ...prev,
        {
          id: product.id,
          name: product.name ?? '',
          image_url: product.image_url ?? null,
          product_code: product.product_code ?? '',
        },
      ];
    });
  }, []);

  const removeFromSelection = useCallback((id) => {
    setSelectedItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isInSelection = useCallback(
    (id) => selectedItems.some((p) => p.id === id),
    [selectedItems]
  );

  const value = {
    selectedItems,
    addToSelection,
    removeFromSelection,
    clearSelection,
    isInSelection,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook lié au contexte, fichier unique intentionnel
export const useSelection = () => {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
};
