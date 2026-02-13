"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash, ShoppingBag } from "lucide-react";
import { usePurchaseStore } from "@/lib/store/usePurchaseStore";
import { useInventoryStore } from "@/lib/store/useInventoryStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { useTranslation } from "@/lib/hooks/useTranslation";

const UNITS = ['pcs', 'kg', 'g', 'L', 'ml'];

const purchaseSchema = z.object({
  storeName: z.string().optional(),
  date: z.string(),
  items: z.array(z.object({
    name: z.string().min(1, "Name required"),
    quantity: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Qty > 0"),
    price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Price >= 0"),
    unit: z.string().min(1, "Unit required"),
  })).min(1, "At least one item required"),
});

export function AddPurchaseDialog() {
  const [open, setOpen] = useState(false);
  const addPurchase = usePurchaseStore((state) => state.addPurchase);
  const addItem = useInventoryStore((state) => state.addItem);
  const { currency } = useCurrency();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      storeName: "",
      date: new Date().toISOString().split('T')[0],
      items: [{ name: "", quantity: "1", price: "0", unit: "pcs" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  function onSubmit(values: z.infer<typeof purchaseSchema>) {
    const items = values.items.map(item => ({
      ...item,
      quantity: parseFloat(item.quantity),
      price: parseFloat(item.price),
    }));

    const totalCost = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Add to Purchase History
    addPurchase({
      localId: crypto.randomUUID(),
      storeName: values.storeName,
      date: new Date(values.date),
      items,
      totalCost,
    });

    // Add to Inventory
    items.forEach(item => {
      addItem({
        localId: crypto.randomUUID(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        purchaseDate: new Date(values.date),
        category: 'Uncategorized',
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        threshold: 1
      });
    });

    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-20 right-4 rounded-full h-14 w-14 shadow-lg" size="icon">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.common.log_purchase}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.expenses.store_name}</FormLabel>
                    <FormControl>
                      <Input placeholder="Grocery Store" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.common.date}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{t.common.items}</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", quantity: "1", price: "0", unit: "pcs" })}>
                  <Plus className="h-4 w-4 mr-1" /> {t.common.add_item}
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2 p-3 border rounded-md">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium">{t.common.items} {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => remove(index)}>
                        <Trash className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <Input placeholder={t.common.name} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder={t.common.quantity} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t.common.unit} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UNITS.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="text-xs">{t.common.price_unit} ({currency})</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder={t.common.price} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">{t.common.save_purchase}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
