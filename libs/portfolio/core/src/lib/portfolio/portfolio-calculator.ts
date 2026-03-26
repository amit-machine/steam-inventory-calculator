import type {
  AccountSummary,
  InventoryItem,
  PortfolioHistoryEntry,
  PortfolioSummaryResponse,
  PortfolioTotals,
  PricedItem,
} from "api-contracts";
import { portfolioConfig } from "data-access";

/* Creates the starting totals used for the final portfolio summary. */
const createEmptyPortfolioTotals = (): PortfolioTotals => ({
  totalValue: 0,
  afterTax: 0,
  itemCount: 0,
});

/* Adds up the total storage value and item count for one account. */
const calculateAccountTotals = (pricedItems: PricedItem[]) => {
  const totals = {
    storageValue: 0,
    itemCount: 0,
  };

  for (const item of pricedItems) {
    totals.storageValue += item.totalPrice;
    totals.itemCount += item.quantity;
  }

  return totals;
};

/* Builds the final summary object returned for one processed account. */
export function buildAccountSummary(accountName: string, pricedItems: PricedItem[]): AccountSummary {
  const totals = calculateAccountTotals(pricedItems);

  return {
    account: accountName,
    StorageValue: Math.floor(totals.storageValue),
    AfterTax: Math.floor(totals.storageValue * portfolioConfig.TAX_RATE),
    Count: totals.itemCount,
    Items: pricedItems,
  };
}

/* Adds one account summary into the overall portfolio totals. */
export function addAccountToPortfolioTotals(portfolioTotals: PortfolioTotals, accountSummary: AccountSummary) {
  portfolioTotals.totalValue += accountSummary.StorageValue;
  portfolioTotals.afterTax += accountSummary.AfterTax;
  portfolioTotals.itemCount += accountSummary.Count;
}

/* Creates a history record that can be inserted into MongoDB after the run finishes. */
export function createPortfolioHistoryEntry(accountName: string, storageValue: number): PortfolioHistoryEntry {
  return {
    accountName,
    storageValue,
    timestamp: new Date().toISOString(),
  };
}

/* Creates the in-memory history store used during a single portfolio run. */
export function createPortfolioHistoryStore() {
  return [] as PortfolioHistoryEntry[];
}

/* Creates the final portfolio summary response returned by the API. */
export function buildPortfolioSummaryResponse(accounts: AccountSummary[]): PortfolioSummaryResponse {
  const portfolio = createEmptyPortfolioTotals();

  for (const account of accounts) {
    addAccountToPortfolioTotals(portfolio, account);
  }

  return {
    accounts,
    portfolio,
    generatedAt: new Date().toISOString(),
  };
}

/* Collects every item from every account into one array for shared price fetching. */
export function getAllInventoryItems(accounts: Array<{ name: string; items: InventoryItem[] }>) {
  const allItems: InventoryItem[] = [];

  for (const account of accounts) {
    for (const item of account.items) {
      allItems.push(item);
    }
  }

  return allItems;
}
