
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { openDB } from 'idb';

export interface PurchaseItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Purchase {
  _id?: string;
  localId?: string;
  items: PurchaseItem[];
  totalCost: number;
  storeName?: string;
  date: Date;
}

interface PurchaseState {
  purchases: Purchase[];
  addPurchase: (purchase: Purchase) => void;
  setPurchases: (purchases: Purchase[]) => void;
  syncPending: boolean;
}

// Reuse IDB logic or create new store
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const db = await openDB('pantry-db', 1);
    const val = await db.get('purchases', name); // separate store?
    return val || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const db = await openDB('pantry-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('purchases')) {
          db.createObjectStore('purchases');
        }
        if (!db.objectStoreNames.contains('inventory')) {
            db.createObjectStore('inventory');
        }
      },
    });
    await db.put('purchases', value, name);
  },
  removeItem: async (name: string): Promise<void> => {
    const db = await openDB('pantry-db', 1);
    await db.delete('purchases', name);
  },
};

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set) => ({
      purchases: [],
      syncPending: false,
      addPurchase: (purchase) => set((state) => ({ 
        purchases: [purchase, ...state.purchases], 
        syncPending: true 
      })),
      setPurchases: (purchases) => set({ purchases }),
    }),
    {
      name: 'purchase-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
