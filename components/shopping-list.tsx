"use client";

import { useState, useMemo } from "react";
import { Plus, Trash, History, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useShoppingStore } from "@/lib/store/useShoppingStore";
import { usePurchaseStore } from "@/lib/store/usePurchaseStore";
import { AddPurchaseDialog } from "./add-purchase-dialog";
import { useTranslation } from "@/lib/hooks/useTranslation";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const UNITS = ['pcs', 'kg', 'g', 'L', 'ml'];

export function ShoppingList() {
    const { items, addItem, toggleItem, removeItem, removeItems } = useShoppingStore();
    const { purchases } = usePurchaseStore();
    const { t } = useTranslation();
    const [newItemName, setNewItemName] = useState("");
    const [newItemQuantity, setNewItemQuantity] = useState("1");
    const [newItemUnit, setNewItemUnit] = useState("pcs");
    const [isLogPurchaseOpen, setIsLogPurchaseOpen] = useState(false);

    // Get unique items from purchase history
    const recentItems = useMemo(() => {
        return Array.from(new Set(
            purchases.flatMap(p => p.items.map(i => i.name))
        )).slice(0, 10);
    }, [purchases]);

    const handleAddItem = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newItemName.trim() && newItemQuantity.trim()) {
            addItem(newItemName.trim(), newItemQuantity.trim(), newItemUnit);
            setNewItemName("");
            setNewItemQuantity("1");
            setNewItemUnit("pcs");
        }
    };

    const handleAddRecent = (name: string) => {
        addItem(name, "1");
    };

    const completedItems = items.filter(i => i.completed);

    const handlePurchaseComplete = () => {
        // Remove purchased items from the shopping list
        removeItems(completedItems.map(i => i.id));
        setIsLogPurchaseOpen(false);
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        {t.shoppingList?.title || "Shopping Plan"}
                    </div>
                </CardTitle>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                            <History className="mr-2 h-4 w-4" />
                            {t.shoppingList?.addRecent || "Add Recent"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-0" align="end">
                        <div className="p-2">
                            <div className="text-sm font-medium px-2 py-1.5 text-muted-foreground">
                                {t.shoppingList?.recentItems || "Recent Items"}
                            </div>
                            {recentItems.length === 0 ? (
                                <div className="px-2 py-1.5 text-sm text-center text-muted-foreground">
                                    {t.shoppingList?.noRecent || "No recent items found"}
                                </div>
                            ) : (
                                <div className="grid gap-1">
                                    {recentItems.map((item, i) => (
                                        <Button
                                            key={i}
                                            variant="ghost"
                                            size="sm"
                                            className="justify-start font-normal h-8"
                                            onClick={() => handleAddRecent(item)}
                                        >
                                            <Plus className="mr-2 h-3 w-3" />
                                            {item}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleAddItem} className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            placeholder={t.shoppingList?.addItemPlaceholder || "Add item (e.g., Milk)"}
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                        />
                    </div>
                    <div className="w-[80px]">
                        <Input
                            type="number"
                            min="0.1"
                            step="any"
                            placeholder="Qty"
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(e.target.value)}
                        />
                    </div>
                    <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {UNITS.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                    {unit}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button type="submit" size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </form>

                <div className="space-y-2">
                    {items.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                            {t.shoppingList?.emptyList || "Your shopping list is empty"}
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Checkbox
                                        checked={item.completed}
                                        onCheckedChange={() => toggleItem(item.id)}
                                        id={`item-${item.id}`}
                                    />
                                    <label
                                        htmlFor={`item-${item.id}`}
                                        className={`text-sm font-medium cursor-pointer truncate ${item.completed ? "line-through text-muted-foreground" : ""
                                            }`}
                                    >
                                        {item.name} <span className="text-muted-foreground text-xs ml-1">({item.quantity || "1"} {item.unit || 'pcs'})</span>
                                    </label>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                {completedItems.length > 0 && (
                    <div className="pt-2 border-t">
                        <Button
                            className="w-full"
                            onClick={() => setIsLogPurchaseOpen(true)}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            {t.shoppingList?.logSelected || `Log Selected (${completedItems.length})`}
                        </Button>
                    </div>
                )}

                <AddPurchaseDialog
                    open={isLogPurchaseOpen}
                    onOpenChange={setIsLogPurchaseOpen}
                    initialItems={completedItems.map(i => ({
                        name: i.name,
                        quantity: i.quantity || "1",
                        price: "0",
                        unit: i.unit || "pcs"
                    }))}
                    onSuccess={handlePurchaseComplete}
                />
            </CardContent>
        </Card>
    );
}
