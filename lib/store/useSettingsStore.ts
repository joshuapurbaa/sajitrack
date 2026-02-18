import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    language: string;
    currency: string;
    setLanguage: (language: string) => void;
    setCurrency: (currency: string) => void;
}

const getDeviceLanguage = () => {
    if (typeof window === 'undefined') return 'en';
    const lang = navigator.language.split('-')[0];
    return ['en', 'es', 'fr', 'de', 'id'].includes(lang) ? lang : 'en';
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: getDeviceLanguage(),
            currency: 'USD',
            setLanguage: (language) => set({ language }),
            setCurrency: (currency) => set({ currency }),
        }),
        {
            name: 'settings-storage',
        }
    )
);
