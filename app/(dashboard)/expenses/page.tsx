
"use client";

import { usePurchaseStore } from "@/lib/store/usePurchaseStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns"; 
import { AddPurchaseDialog } from "@/components/add-purchase-dialog";

export default function ExpensesPage() {
  const { purchases } = usePurchaseStore();

  const totalSpent = purchases.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-2xl font-bold">Expenses & Purchases</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Total Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Lifetime total tracked</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Recent Purchases</h2>
        {purchases.length === 0 ? (
          <p className="text-muted-foreground">No purchases logged yet.</p>
        ) : (
          purchases.map((purchase, idx) => (
            <Card key={purchase._id || purchase.localId || idx}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                   <div className="font-medium">{purchase.storeName || 'Unknown Store'}</div>
                   <div className="text-sm text-muted-foreground">
                     {new Date(purchase.date).toLocaleDateString()}
                   </div>
                   <div className="text-xs text-muted-foreground mt-1">
                     {purchase.items.length} items
                   </div>
                </div>
                <div className="font-bold text-lg">
                  ${purchase.totalCost.toFixed(2)}
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
