export interface InventoryItem {
  hashName: string;
  quantity: number;
}

export interface PricedItem {
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  afterTaxTotal: number;
}

export interface AccountSummary {
  account: string;
  StorageValue: number;
  AfterTax: number;
  Count: number;
  Items: PricedItem[];
}

export interface PortfolioTotals {
  totalValue: number;
  afterTax: number;
  itemCount: number;
}

export interface PortfolioSummaryResponse {
  accounts: AccountSummary[];
  portfolio: PortfolioTotals;
  generatedAt: string;
}

export interface PortfolioHistoryEntry {
  accountName: string;
  storageValue: number;
  timestamp: string;
}

export interface PortfolioHistoryResponse {
  entries: PortfolioHistoryEntry[];
}

export interface PriceCacheEntry {
  hashName: string;
  price: number;
  lastUpdated: number;
}
