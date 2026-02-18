import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createIDBStorage } from './idb';

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
      storage: createJSONStorage(() => createIDBStorage('purchases')),
    }
  )
);
