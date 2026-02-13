
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { useInventoryStore, InventoryItem } from "@/lib/store/useInventoryStore";
import { useTranslation } from "@/lib/hooks/useTranslation";

// ... (keep usage of formSchema)

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  quantity: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Quantity must be a number",
  }),
  unit: z.enum(["kg", "g", "L", "ml", "pcs"]),
  expiryDate: z.string().optional(),
  threshold: z.string().optional(),
});

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: InventoryItem | null;
}

export function AddItemDialog({ open, onOpenChange, itemToEdit }: AddItemDialogProps) {
  const { addItem, updateItem } = useInventoryStore();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: "1",
      unit: "pcs",
      threshold: "1",
    },
  });

  useEffect(() => {
    if (open) {
      if (itemToEdit) {
        form.reset({
          name: itemToEdit.name,
          quantity: String(itemToEdit.quantity),
          unit: itemToEdit.unit as any,
          expiryDate: itemToEdit.expiryDate ? new Date(itemToEdit.expiryDate).toISOString().split('T')[0] : undefined,
          threshold: String(itemToEdit.threshold || 1),
        });
      } else {
        form.reset({
          name: "",
          quantity: "1",
          unit: "pcs",
          threshold: "1",
          expiryDate: undefined, // ensure this is undefined for new items
        });
      }
    }
  }, [open, itemToEdit, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (itemToEdit) {
      updateItem(itemToEdit._id || itemToEdit.localId!, {
        name: values.name,
        quantity: Number(values.quantity),
        unit: values.unit,
        expiryDate: values.expiryDate ? new Date(values.expiryDate) : undefined,
        threshold: Number(values.threshold || 1),
      });
    } else {
      addItem({
        localId: crypto.randomUUID(),
        name: values.name,
        quantity: Number(values.quantity),
        unit: values.unit,
        expiryDate: values.expiryDate ? new Date(values.expiryDate) : undefined,
        threshold: values.threshold ? Number(values.threshold) : 1,
        purchaseDate: new Date(),
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        category: 'Uncategorized'
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? t.inventory.edit_item_title : t.inventory.add_item_title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.common.name}</FormLabel>
                  <FormControl>
                    <Input placeholder="Apple, Milk, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t.common.quantity}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel>{t.common.unit}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.common.unit} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pcs">pcs</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.inventory.expiry_date} ({t.common.optional})</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">{t.common.save_item}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
