
"use client";

import { useInventoryStore } from "@/lib/store/useInventoryStore";
import { useEffect, useState } from "react";
import { InventoryCard } from "@/components/inventory-card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Bell, SlidersHorizontal, X } from "lucide-react";
import { AddItemDialog } from "@/components/add-item-dialog";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { differenceInDays } from "date-fns";

export default function InventoryPage() {
  const { items, sync, deleteItem } = useInventoryStore();
  const { t } = useTranslation();
  const [ishydrated, setIsHydrated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSort, setActiveSort] = useState("Default");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

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
    // 1. Search Query Filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(query) &&
        !(item.category || "").toLowerCase().includes(query)) {
        return false; // Skip if it doesn't match the search
      }
    }

    // 2. Category Filter
    if (activeFilter === "All") return true;
    const itemCat = normalizeCategory(item.category);

    if (activeFilter === "Dry pantry") {
      return itemCat === "pantry" || itemCat === "dry pantry";
    }
    return itemCat === normalizeCategory(activeFilter);
  });

  // Sort Logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (activeSort === "Expired First") {
      const aExpiry = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      const bExpiry = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      return aExpiry - bExpiry; // Earliest expiry dates first
    }
    if (activeSort === "Lowest Quantity") {
      return a.quantity - b.quantity;
    }
    if (activeSort === "Highest Quantity") {
      return b.quantity - a.quantity;
    }
    if (activeSort === "Newly Added") {
      // Assuming createdAt is primarily used, fallback to localId timestamp if available
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : (a.localId ? parseInt(a.localId.split('-')[1] || "0") : 0);
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : (b.localId ? parseInt(b.localId.split('-')[1] || "0") : 0);
      return bTime - aTime; // Newest first
    }
    return 0; // Default
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
        {/* Top Header: Title & Icons */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{t.inventory.title}</h1>
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
        </div>

        {/* Filter Tabs & Sort Icon */}
        <div className="flex items-center gap-2 mb-2 w-full">
          {/* Filter Tabs */}
          <div className="flex overflow-x-auto pb-2 gap-2 flex-1 no-scrollbar">
            {["All", "Fridge", "Freezer", "Dry pantry"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium shrink-0",
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 shrink-0 mb-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">{activeSort === "Default" ? "Sort By" : activeSort}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveSort("Default")}>Default</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSort("Expired First")}>Expired First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSort("Highest Quantity")}>Highest Quantity</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSort("Lowest Quantity")}>Lowest Quantity</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveSort("Newly Added")}>Newly Added</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Bar - Under Filter Tabs */}
        <div className="mt-4 mb-2 flex items-center justify-between w-full">
          {!isSearchActive ? (
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
              onClick={() => setIsSearchActive(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              Search inventory...
            </Button>
          ) : (
            <div className="flex items-center w-full gap-2 transition-all">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inventory..."
                  className="pl-9 h-10 w-full bg-muted/30 focus-visible:ring-1"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                setIsSearchActive(false);
                setSearchQuery("");
              }}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Item List */}
      {filteredItems.length === 0 ? (
        <div className="px-4 text-center py-20">
          <p className="text-muted-foreground">{t.inventory.empty}</p>
          <Button onClick={handleAdd} className="mt-4" variant="outline">
            {t.common.add_item}
          </Button>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedItems.map((item, idx) => (
            <InventoryCard
              key={item._id || item.localId || idx}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

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
