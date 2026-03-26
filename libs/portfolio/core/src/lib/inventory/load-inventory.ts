import type { InventoryItem } from "api-contracts";
import { portfolioInventory } from "./inventory.data";

export interface AccountInventory {
  name: string;
  items: InventoryItem[];
}

/* Loads the current inventory definition from the shared Nx inventory file. */
export async function loadAccountInventory() {
  const accountsByName = portfolioInventory;
  const accountList: AccountInventory[] = [];

  for (const accountName in accountsByName) {
    accountList.push({
      name: accountName,
      items: accountsByName[accountName],
    });
  }

  return accountList;
}
