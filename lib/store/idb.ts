import { openDB } from 'idb';
import { StateStorage } from 'zustand/middleware';

const DB_NAME = 'pantry-db';
const DB_VERSION = 2; // Bump version to force upgrade

const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('inventory')) {
                db.createObjectStore('inventory');
            }
            if (!db.objectStoreNames.contains('purchases')) {
                db.createObjectStore('purchases');
            }
        },
    });
};

export const createIDBStorage = (storeName: string): StateStorage => ({
    getItem: async (name: string): Promise<string | null> => {
        const db = await initDB();
        return (await db.get(storeName, name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        const db = await initDB();
        await db.put(storeName, value, name);
    },
    removeItem: async (name: string): Promise<void> => {
        const db = await initDB();
        await db.delete(storeName, name);
    },
});
