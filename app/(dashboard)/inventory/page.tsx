
"use client";

import { useInventoryStore } from "@/lib/store/useInventoryStore";
import { useEffect, useState } from "react";
import { InventoryCard } from "@/components/inventory-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddItemDialog } from "@/components/add-item-dialog";
import { useTranslation } from "@/lib/hooks/useTranslation";
// Note: AddItemDialog will be created in next step

export default function InventoryPage() {
  const { items, sync, deleteItem } = useInventoryStore();
  const { t } = useTranslation();
  const [ishydrated, setIsHydrated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);

  useEffect(() => {
    setIsHydrated(true);
    // Trigger sync on mount if online
    sync();
  }, [sync]);

  const handleEdit = (item: any) => {
    setItemToEdit(item);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setItemToEdit(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t.common.confirm_delete)) {
      deleteItem(id);
    }
  };

  if (!ishydrated) return <div>{t.common.loading}</div>;

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t.inventory.title}</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> {t.common.add_item}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-10">
            {t.inventory.empty}
          </p>
        ) : (
          items.map((item, idx) => (
            <InventoryCard
              key={item._id || item.localId || idx}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <AddItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}
