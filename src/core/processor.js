import { getPrices } from "../services/priceService.js";
import config from "../config/config.js";
import { PortfolioHistory } from "../models/PortfolioHistory.js";

/* Adds up the total storage value and item count for one account. */
const calculateAccountTotals = pricedItems => {
  const totals = {
    storageValue: 0,
    itemCount: 0
  };

  for (const item of pricedItems) {
    totals.storageValue += item.totalPrice;
    totals.itemCount += item.quantity;
  }

  return totals;
};

/* Builds the final summary object returned for one processed account. */
const buildAccountSummary = (accountName, pricedItems) => {
  const totals = calculateAccountTotals(pricedItems);

  return {
    account: accountName,
    StorageValue: Math.floor(totals.storageValue),
    AfterTax: Math.floor(totals.storageValue * config.TAX_RATE),
    Count: totals.itemCount,
    Items: pricedItems
  };
};

/* Creates a history record that can be inserted into MongoDB after the run finishes. */
const createHistoryEntry = (accountName, storageValue) => ({
  accountName,
  storageValue,
  timestamp: new Date()
});

/* Creates the in-memory history store used during a single portfolio run. */
export function createPortfolioHistoryStore() {
  return [];
}

/* Saves the new history records from this run into MongoDB. */
export async function savePortfolioHistory(historyEntries) {
  if (historyEntries.length === 0) {
    return;
  }

  await PortfolioHistory.insertMany(historyEntries);
}

/* Processes one account by pricing its items, building a summary, and updating history. */
export async function processAccount(items, accountName, priceMap = null, history = null) {
  if (!items || items.length === 0) return null;

  const pricedItems = await getPrices(items, priceMap);
  const accountSummary = buildAccountSummary(accountName, pricedItems);

  if (history) {
    history.push(createHistoryEntry(accountName, accountSummary.StorageValue));
  }

  return accountSummary;
}
