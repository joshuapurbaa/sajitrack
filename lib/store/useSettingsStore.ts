import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    language: string;
    currency: string;
    setLanguage: (language: string) => void;
    setCurrency: (currency: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: 'en',
            currency: 'USD',
            setLanguage: (language) => set({ language }),
            setCurrency: (currency) => set({ currency }),
        }),
        {
            name: 'settings-storage',
        }
    )
);
