import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createIDBStorage } from './idb';

export interface ShoppingItem {
    id: string;
    name: string;
    completed: boolean;
    unit?: string;
}

interface ShoppingState {
    items: ShoppingItem[];
    addItem: (name: string, unit?: string) => void;
    toggleItem: (id: string) => void;
    removeItem: (id: string) => void;
    clearItems: () => void;
    removeItems: (ids: string[]) => void;
}

export const useShoppingStore = create<ShoppingState>()(
    persist(
        (set) => ({
            items: [],
            addItem: (name, unit = 'pcs') => set((state) => ({
                items: [...state.items, { id: crypto.randomUUID(), name, completed: false, unit }]
            })),
            toggleItem: (id) => set((state) => ({
                items: state.items.map((item) =>
                    item.id === id ? { ...item, completed: !item.completed } : item
                )
            })),
            removeItem: (id) => set((state) => ({
                items: state.items.filter((item) => item.id !== id)
            })),
            clearItems: () => set({ items: [] }),
            removeItems: (ids) => set((state) => ({
                items: state.items.filter((item) => !ids.includes(item.id))
            })),
        }),
        {
            name: 'shopping-storage',
            storage: createJSONStorage(() => createIDBStorage('shopping')),
        }
    )
);
