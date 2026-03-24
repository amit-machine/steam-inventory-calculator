import fs from "fs";
import path from "path";
import { getPrices } from "../services/priceService.js";
import config from "../config/config.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HISTORY_FILE = path.join(__dirname, "../data/history.json");

const loadHistory = () => {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return {};
    const data = fs.readFileSync(HISTORY_FILE, "utf-8");
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error("Invalid history JSON, resetting...");
    return {};
  }
};

const saveHistory = history =>
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));

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

const addHistorySnapshot = (history, accountName, storageValue) => {
  if (!history[accountName]) {
    history[accountName] = [];
  }

  history[accountName].push({
    timestamp: new Date().toISOString(),
    StorageValue: storageValue
  });
};

export function loadPortfolioHistory() {
  return loadHistory();
}

export function savePortfolioHistory(history) {
  saveHistory(history);
}

export async function processAccount(
  items,
  accountName,
  priceMap = null,
  history = null
) {
  if (!items || items.length === 0) return null;

  const pricedItems = await getPrices(items, priceMap);
  const accountSummary = buildAccountSummary(accountName, pricedItems);

  const nextHistory = history || loadHistory();
  addHistorySnapshot(nextHistory, accountName, accountSummary.StorageValue);

  if (!history) {
    saveHistory(nextHistory);
  }

  return accountSummary;
}
