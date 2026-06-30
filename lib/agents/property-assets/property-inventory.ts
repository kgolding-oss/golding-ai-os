import type { InventoryItem } from "./property-types";
export const demoInventory: InventoryItem[] = [{ id:"inv-filters", sku:"HVAC-FILTER", name:"HVAC Filters", level:4, reorderThreshold:6, storageLocation:"Warehouse A", recommendation:"Replacement recommendation only; purchasing requires approval." }, { id:"inv-chairs", sku:"CHAIR-STD", name:"Office Chairs", level:12, reorderThreshold:8, storageLocation:"HQ Storage" }];
export const inventoryShortages = (items:InventoryItem[]) => items.filter(i=>i.level <= i.reorderThreshold);
