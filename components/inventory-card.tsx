
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { InventoryItem } from "@/lib/store/useInventoryStore";

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
  const isLowStock = item.quantity <= (item.threshold || 0);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
        {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {item.quantity} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:text-destructive"
              onClick={() => item._id || item.localId ? onDelete(item._id || item.localId!) : null}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
           Expires: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
        </div>
      </CardContent>
    </Card>
  );
}
