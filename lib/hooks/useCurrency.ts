"use client";

import { useSettingsStore } from "@/lib/store/useSettingsStore";

export function useCurrency() {
    const { currency } = useSettingsStore();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return { currency, formatCurrency };
}
