
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createIDBStorage } from './idb';

export interface InventoryItem {
  _id?: string; // MongoDB ID
  localId?: string; // IndexedDB ID
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: Date;
  purchaseDate?: Date;
  threshold?: number;
  category?: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface InventoryState {
  items: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  setItems: (items: InventoryItem[]) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  syncPending: boolean;
  setSyncPending: (pending: boolean) => void;
  sync: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      syncPending: false,
      addItem: (item) => set((state) => ({ items: [...state.items, item], syncPending: true })),
      setItems: (items) => set({ items }),
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((item) =>
          (item._id === id || item.localId === id) ? { ...item, ...updates } : item
        ),
        syncPending: true
      })),
      deleteItem: (id) => set((state) => ({
        items: state.items.filter((item) => item._id !== id && item.localId !== id),
        syncPending: true
      })),
      setSyncPending: (pending) => set({ syncPending: pending }),
      sync: async () => {
        const state = get();
        if (state.syncPending && navigator.onLine) {
          // Actual implementation would invoke api.syncInventory(state.items)
          // and update items with server IDs.
          // For now, we'll just toggle the flag if successful.
          // This is a placeholder for the robust sync logic.
          console.log('Syncing...');
          set({ syncPending: false });
        }
      }
    }),
    {
      name: 'inventory-storage',
      storage: createJSONStorage(() => createIDBStorage('inventory')),
      onRehydrateStorage: () => (state) => {
        // Optional: trigger sync on load if online
      }
    }
  )
);
