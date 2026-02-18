
"use client";

import { useInventoryStore } from "@/lib/store/useInventoryStore";
import { useEffect, useState } from "react";
import { InventoryCard } from "@/components/inventory-card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Bell, SlidersHorizontal } from "lucide-react";
import { AddItemDialog } from "@/components/add-item-dialog";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";

export default function InventoryPage() {
  const { items, sync, deleteItem } = useInventoryStore();
  const { t } = useTranslation();
  const [ishydrated, setIsHydrated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  // Delete Confirmation State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

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
    const item = items.find((i) => (i._id === id || i.localId === id));
    if (item) {
      setItemToDelete(item);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete._id || itemToDelete.localId);
      setItemToDelete(null);
    }
  };

  // Filter Logic
  const normalizeCategory = (cat?: string) => (cat || "").toLowerCase().trim();

  const filteredItems = items.filter(item => {
    if (activeFilter === "All") return true;
    const itemCat = normalizeCategory(item.category);

    if (activeFilter === "Dry pantry") {
      return itemCat === "pantry" || itemCat === "dry pantry";
    }
    return itemCat === normalizeCategory(activeFilter);
  });

  // Counts
  const getCount = (filterName: string) => {
    if (filterName === "All") return items.length;
    return items.filter(item => {
      const itemCat = normalizeCategory(item.category);
      if (filterName === "Dry pantry") {
        return itemCat === "pantry" || itemCat === "dry pantry";
      }
      return itemCat === normalizeCategory(filterName);
    }).length;
  };

  const counts = {
    All: items.length,
    Fridge: getCount("Fridge"),
    Freezer: getCount("Freezer"),
    "Dry pantry": getCount("Dry pantry"),
  };

  if (!ishydrated) return <div>{t.common.loading}</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Section */}
      <div className="p-4 bg-background sticky top-0 z-10">
        {/* Top Icons */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
        </div>

        {/* Title & Filter Icon */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t.inventory.title}</h1>
          <Button variant="ghost" size="icon">
            <SlidersHorizontal className="h-6 w-6" />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-4 no-scrollbar">
          {["All", "Fridge", "Freezer", "Dry pantry"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium",
                activeFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {filter}
              <span className={cn(
                "text-xs ml-1",
                activeFilter === filter ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {counts[filter as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Item List */}
      <div className="px-4 space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{t.inventory.empty}</p>
            <Button onClick={handleAdd} className="mt-4" variant="outline">
              {t.common.add_item}
            </Button>
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <InventoryCard
              key={item._id || item.localId || idx}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Floating Add Button (if needed, but using dialog trigger for now via bottom nav or duplicate here if desired) */}
      {/* Note: The mockup shows a central + button in the bottom nav. 
           We'll keep the AddItemDialog mounted and controlled by state. 
           For this specific page, we can also add a floating button if the bottom nav doesn't cover it.
       */}
      <div className="fixed bottom-24 right-4 z-20">
        <Button onClick={handleAdd} size="icon" className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AddItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        itemToEdit={itemToEdit}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.name || ""}
      />
    </div>
  );
}
