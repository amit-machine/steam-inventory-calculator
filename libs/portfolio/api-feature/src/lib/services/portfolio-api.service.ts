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
  getLatestPortfolioSummary,
  getPortfolioHistory,
  insertPortfolioHistory,
  loadCachedPrices,
  savePortfolioSummary,
  saveCachedPrices,
} from "data-access";

/* Builds a fresh portfolio summary from inventory, cache, and Steam Market data. */
async function calculatePortfolioSummary() {
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
    historyEntries.push(createPortfolioHistoryEntry(account.name, accountSummary.storageValue));
  }

  return {
    summary: buildPortfolioSummaryResponse(accountSummaries),
    historyEntries,
  };
}

/* Recalculates the full portfolio, stores history, and refreshes the latest summary snapshot. */
export async function recalculatePortfolio(): Promise<PortfolioSummaryResponse> {
  const { summary, historyEntries } = await calculatePortfolioSummary();
  await insertPortfolioHistory(historyEntries);
  await savePortfolioSummary(summary);

  return summary;
}

/* Returns the most recently stored portfolio summary without recalculating prices. */
export async function fetchPortfolioSummary(): Promise<PortfolioSummaryResponse | null> {
  return getLatestPortfolioSummary();
}

/* Returns the stored portfolio history entries from MongoDB. */
export async function fetchPortfolioHistory(limit = 100): Promise<PortfolioHistoryResponse> {
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
