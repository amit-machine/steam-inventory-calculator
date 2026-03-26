import type { InventoryItem } from "api-contracts";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

export interface AccountInventory {
  name: string;
  items: InventoryItem[];
}

/* Loads the current inventory definition from the existing workspace file. */
export async function loadAccountInventory(workspaceRoot = process.cwd()) {
  const inventoryPath = path.join(workspaceRoot, "src/data/inventory.js");
  const inventoryModule = await import(pathToFileURL(inventoryPath).href);
  const accountsByName = inventoryModule.default as Record<string, InventoryItem[]>;
  const accountList: AccountInventory[] = [];

  for (const accountName in accountsByName) {
    accountList.push({
      name: accountName,
      items: accountsByName[accountName],
    });
  }

  return accountList;
}
