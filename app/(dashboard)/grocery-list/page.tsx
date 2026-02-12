"use client";

import { useInventoryStore } from "@/lib/store/useInventoryStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export default function GroceryListPage() {
  const { items } = useInventoryStore();

  const lowStockItems = items.filter(
    (item) => item.quantity <= (item.threshold || 0)
  );

  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ShoppingCart className="h-6 w-6" /> Grocery List
      </h1>
      
      {lowStockItems.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>Everything is well-stocked!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {lowStockItems.map((item) => (
            <Card key={item._id || item.localId}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.name}
                </CardTitle>
                <Badge variant="destructive">Low Stock</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.quantity} {item.unit}</div>
                <p className="text-xs text-muted-foreground">
                  Threshold: {item.threshold} {item.unit}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
