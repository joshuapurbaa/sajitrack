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
      className="w-full mb-3 cursor-pointer hover:bg-accent/50 transition-colors border-none shadow-sm"
      onClick={() => onEdit(item)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        {/* Icon Section */}
        <div className="flex-shrink-0">
          {DisplayIcon}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base truncate">{item.name}</h3>
          <p className={cn("text-sm", statusColor)}>
            {statusText}
          </p>
        </div>

        {/* Right Section: Quantity & Location */}
        <div className="text-right flex flex-col items-end">
          <div className="font-medium text-base">
            {item.quantity} <span className="text-sm text-muted-foreground">{item.unit}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {item.category || "Pantry"}
          </div>
        </div>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive ml-2 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item._id || item.localId || "");
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
