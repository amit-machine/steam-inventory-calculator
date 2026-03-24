import fs from "fs";
import path from "path";
import { getPrices } from "../services/priceService.js";
import CONFIG from "../config/config.js";
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

export async function processAccount(items, accountName, priceMap = null) {
  if (!items || items.length === 0) return null;

  let data = await getPrices(items, priceMap);

  let totals = data.reduce(
    (acc, x) => {
      acc.total += x.totalPrice;
      acc.count += x.quantity;
      return acc;
    },
    { total: 0, count: 0 }
  );

  let finalData = {
    account: accountName,
    StorageValue: parseInt(totals.total),
    AfterTax: parseInt(totals.total * CONFIG.TAX),
    Count: totals.count,
    Items: data
  };

  const history = loadHistory();
  if (!history[accountName]) history[accountName] = [];

  history[accountName].push({
    timestamp: new Date().toISOString(),
    StorageValue: finalData.StorageValue
  });

  saveHistory(history);

  return finalData;
}
