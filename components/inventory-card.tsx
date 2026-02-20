import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { InventoryItem } from "@/lib/store/useInventoryStore";
import { differenceInDays, formatDistanceToNow, isPast, isToday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
  const isLowStock = item.quantity <= (item.threshold || 0);

  const rawCategory = (item.category || "").toLowerCase().trim();
  let displayCategory = item.category || "Uncategorized";
  if (!item.category || rawCategory === "") displayCategory = "Uncategorized";

  let categoryStyles = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
  let cardStyles = "bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 dark:bg-slate-950/20 dark:border-slate-800 dark:hover:bg-slate-900/40";

  if (rawCategory === "fridge") {
    categoryStyles = "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    cardStyles = "bg-blue-50/50 border-blue-200 hover:bg-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/50 dark:hover:bg-blue-900/40";
  } else if (rawCategory === "freezer") {
    categoryStyles = "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400";
    cardStyles = "bg-cyan-50/50 border-cyan-200 hover:bg-cyan-100/50 dark:bg-cyan-950/20 dark:border-cyan-900/50 dark:hover:bg-cyan-900/40";
  } else if (rawCategory === "pantry" || rawCategory === "dry pantry") {
    categoryStyles = "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    cardStyles = "bg-amber-50/50 border-amber-200 hover:bg-amber-100/50 dark:bg-amber-950/20 dark:border-amber-900/50 dark:hover:bg-amber-900/40";
  }

  // Calculate expiry status
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
  const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate) : null;
  const today = new Date();

  let statusText = "";
  let statusColor = "text-muted-foreground";

  if (expiryDate) {
    const daysUntilExpiry = differenceInDays(expiryDate, today);

    if (daysUntilExpiry < 0) {
      statusText = `Expired ${Math.abs(daysUntilExpiry)} days ago!`;
      statusColor = "text-red-500 font-medium";
    } else if (daysUntilExpiry <= 3) {
      statusText = `Expiring in ${daysUntilExpiry} days!`;
      statusColor = "text-orange-500 font-medium";
    } else {
      // Fallback if not expiring soon
      if (purchaseDate) {
        const daysIn = differenceInDays(today, purchaseDate);
        statusText = `${daysIn} days in`;
      } else {
        statusText = `Expires in ${daysUntilExpiry} days`;
      }
    }
  } else if (purchaseDate) {
    const daysIn = differenceInDays(today, purchaseDate);
    statusText = `${daysIn} days in`;
  }

  // Determine icon (fallback to name first letter if no icon)
  const DisplayIcon = item.icon ? (
    <span className="text-2xl">{item.icon}</span>
  ) : (
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
      {item.name.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <Card
      className={cn(
        "w-full h-full cursor-pointer transition-colors border shadow-sm relative overflow-hidden group",
        cardStyles
      )}
      onClick={() => onEdit(item)}
    >
      <CardContent className="p-4 flex flex-col items-center text-center gap-2 h-full">
        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item._id || item.localId || "");
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Icon Section */}
        <div className="flex-shrink-0 mt-1">
          {DisplayIcon}
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0 mt-1">
          <h3 className="font-bold text-sm sm:text-base w-full truncate">{item.name}</h3>
          <p className={cn("text-xs mt-1", statusColor)}>
            {statusText}
          </p>
        </div>

        {/* Bottom Section: Location & Quantity */}
        <div className="w-full flex justify-between items-center mt-auto pt-3 border-t">
          <div className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full truncate max-w-[50%]", categoryStyles)}>
            {displayCategory}
          </div>
          <div className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-md flex-shrink-0">
            {item.quantity} <span className="text-xs font-normal">{item.unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
