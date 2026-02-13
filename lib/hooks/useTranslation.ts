"use client";

import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { translations, Language, TranslationKeys } from "@/lib/i18n/translations";

export function useTranslation() {
    const { language } = useSettingsStore();

    const t: TranslationKeys = translations[language as Language] || translations.en;

    return { t };
}
