"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function ProfilePage() {
    const { language, currency, setLanguage, setCurrency } = useSettingsStore();
    const { t } = useTranslation();

    return (
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">{t.profile.title}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{t.profile.preferences}</CardTitle>
                    <CardDescription>
                        {t.profile.preferences_desc}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="language">{t.profile.language}</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger id="language">
                                <SelectValue placeholder={t.profile.select_language} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="id">Indonesian</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currency">{t.profile.currency}</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger id="currency">
                                <SelectValue placeholder={t.profile.select_currency} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="IDR">IDR (Rp)</SelectItem>
                                <SelectItem value="JPY">JPY (¥)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
