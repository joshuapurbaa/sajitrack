"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useShoppingStore } from "@/lib/store/useShoppingStore";
import { usePurchaseStore } from "@/lib/store/usePurchaseStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrency } from "@/lib/hooks/useCurrency";

interface AIGroceryItem {
    name: string;
    quantity: string | number;
    unit: string;
    estimatedPrice: number;
    reason: string;
}

export function AIGroceryPlanner({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { t } = useTranslation();
    const { addItem } = useShoppingStore();
    const { purchases } = usePurchaseStore();
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<AIGroceryItem[]>([]);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const { formatCurrency } = useCurrency();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setSuggestions([]);
        setSelectedIndexes([]);

        try {
            // Get unique recent purchase names for context
            const recentPurchaseNames = Array.from(new Set(
                purchases.flatMap(p => p.items.map(i => i.name))
            )).slice(0, 20);

            const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';

            const response = await fetch('/api/ai/grocery-planner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    language,
                    recentPurchases: recentPurchaseNames
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch from AI planner');
            }

            const data = await response.json();

            if (data.items && Array.isArray(data.items)) {
                setSuggestions(data.items);
                // Pre-select all by default
                setSelectedIndexes(data.items.map((_: any, i: number) => i));
            }
        } catch (error) {
            console.error("Error asking AI Planner:", error);
            // Optionally add toast notification here
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelection = (index: number) => {
        setSelectedIndexes(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleAddSelected = () => {
        selectedIndexes.forEach(index => {
            const item = suggestions[index];
            if (item) {
                addItem(item.name, String(item.quantity), item.unit);
            }
        });

        onOpenChange(false);
        setPrompt("");
        setSuggestions([]);
        setSelectedIndexes([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Grocery Planner
                    </DialogTitle>
                    <DialogDescription>
                        Describe what you need, your budget, or dietary preferences. The AI will plan your groceries.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Textarea
                        placeholder={'e.g., "I want to shop at a traditional market for nutritious ingredients rich in protein, vitamins, and fiber with a budget of 100,000 rupiah. Make sure all ingredients last for one week without refrigeration."'}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                    />

                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Planning...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Plan
                            </>
                        )}
                    </Button>

                    {suggestions.length > 0 && (
                        <div className="space-y-3 mt-4">
                            <h3 className="text-sm font-medium">Suggested Items</h3>
                            <ScrollArea className="h-[250px] pr-4">
                                <div className="space-y-2">
                                    {suggestions.map((item, idx) => (
                                        <Card key={idx} className="cursor-pointer" onClick={() => toggleSelection(idx)}>
                                            <CardContent className="p-3 flex items-start gap-3">
                                                <Checkbox
                                                    checked={selectedIndexes.includes(idx)}
                                                    onCheckedChange={() => toggleSelection(idx)}
                                                    onClick={(e: any) => e.stopPropagation()}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                                        <span className="text-sm font-semibold whitespace-nowrap">
                                                            {item.estimatedPrice ? formatCurrency(item.estimatedPrice) : "-"}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                                        <span>{item.quantity} {item.unit}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1 bg-accent/30 p-1.5 rounded-md">
                                                        {item.reason}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>

                            <div className="text-sm font-medium flex justify-between pt-2 border-t">
                                <span>Total Estimated Price:</span>
                                <span>
                                    {formatCurrency(
                                        selectedIndexes.reduce((sum, idx) => sum + (suggestions[idx].estimatedPrice || 0), 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {suggestions.length > 0 ? (
                        <Button onClick={handleAddSelected} disabled={selectedIndexes.length === 0} className="w-full sm:w-auto">
                            <Check className="mr-2 h-4 w-4" />
                            Add Selected to List ({selectedIndexes.length})
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
