import type { PortfolioHistoryResponse, PortfolioSummaryResponse } from "api-contracts";
import {
  buildAccountSummary,
  buildPortfolioSummaryResponse,
  buildPricedItems,
  createPortfolioHistoryEntry,
  getAllInventoryItems,
  loadAccountInventory,
  resolveItemPrices,
} from "core";
import {
  connectToDatabase,
  getPortfolioHistory,
  insertPortfolioHistory,
  loadCachedPrices,
  saveCachedPrices,
} from "data-access";

/* Recalculates the full portfolio by loading inventory, pricing items, and storing history. */
export async function recalculatePortfolio() {
  await connectToDatabase();

  const accounts = await loadAccountInventory();
  const allItems = getAllInventoryItems(accounts);
  const priceMap = await resolveItemPrices(allItems, {
    loadCachedPrices,
    saveCachedPrices,
  });

  const accountSummaries = [];
  const historyEntries = [];

  for (const account of accounts) {
    if (!account.items || account.items.length === 0) {
      continue;
    }

    const pricedItems = buildPricedItems(account.items, priceMap);
    const accountSummary = buildAccountSummary(account.name, pricedItems);

    accountSummaries.push(accountSummary);
    historyEntries.push(createPortfolioHistoryEntry(account.name, accountSummary.StorageValue));
  }

  await insertPortfolioHistory(historyEntries);

  return buildPortfolioSummaryResponse(accountSummaries);
}

/* Returns the stored portfolio history entries from MongoDB. */
export async function fetchPortfolioHistory(limit = 100): Promise<PortfolioHistoryResponse> {
  await connectToDatabase();

  return {
    entries: await getPortfolioHistory(limit),
  };
}

/* Provides a lightweight health response for the API. */
export function getHealthStatus() {
  return {
    status: "ok",
    service: "portfolio-api",
    timestamp: new Date().toISOString(),
  };
}
