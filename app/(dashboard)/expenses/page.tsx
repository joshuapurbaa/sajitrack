
"use client";

import { usePurchaseStore } from "@/lib/store/usePurchaseStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { AddPurchaseDialog } from "@/components/add-purchase-dialog";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function ExpensesPage() {
  const { purchases } = usePurchaseStore();
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();

  const totalSpent = purchases.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-2xl font-bold">{t.expenses.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t.expenses.total_spending}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-muted-foreground">{t.expenses.lifetime_total}</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t.expenses.recent_purchases}</h2>
        {purchases.length === 0 ? (
          <p className="text-muted-foreground">{t.expenses.no_purchases}</p>
        ) : (
          purchases.map((purchase, idx) => (
            <Card key={purchase._id || purchase.localId || idx}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{purchase.storeName || t.common.unknown_store}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(purchase.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {purchase.items.length} {t.common.items}
                  </div>
                </div>
                <div className="font-bold text-lg">
                  {formatCurrency(purchase.totalCost)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddPurchaseDialog />
    </div>
  );
}
