
import { InventoryItem } from "./store/useInventoryStore";

export async function syncInventory(items: InventoryItem[]): Promise<boolean> {
  // Simple sync logic: push all local items to server if they don't have a server ID
  // In a real app, this would be more complex (bidirectional sync, conflict resolution)
  
  if (!navigator.onLine) return false;

  try {
    for (const item of items) {
      if (!item._id) {
        // New local item, push to server
        const res = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        
        if (res.ok) {
          const data = await res.json();
          // Ideally update the local item with the returned _id
          // This requires the store to handle the update
        }
      }
    }
    return true;
  } catch (error) {
    console.error('Sync failed', error);
    return false;
  }
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await fetch('/api/inventory');
  if (!res.ok) throw new Error('Failed to fetch');
  const json = await res.json();
  return json.data;
}
