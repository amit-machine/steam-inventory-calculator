import axios from "axios";
import Bottleneck from "bottleneck";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE = path.join(__dirname, "../data/prices.json");

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: config.REQUEST_DELAY_MS
});

const loadCache = () => {
  try {
    if (!fs.existsSync(CACHE_FILE)) return {};
    const data = fs.readFileSync(CACHE_FILE, "utf-8");
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error("⚠️ Invalid cache JSON, resetting...");
    return {};
  }
};

const saveCache = cache =>
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

/* Converts Steam price text into a number the calculator can use. */
const parseSteamPrice = priceText => {
  try {
    if (!priceText) return 0;

    const valuePart = priceText.split(" ")[1]?.replace(",", "");
    return valuePart ? parseFloat(valuePart) : 0;
  } catch {
    return 0;
  }
};

/* Checks whether a cached price is still fresh enough to reuse. */
const isFreshCacheEntry = cacheEntry =>
  cacheEntry &&
  cacheEntry.price > 0 &&
  Date.now() - cacheEntry.lastUpdated < config.CACHE_TTL_MS;

/* Creates the final priced item object for reporting and totals. */
const createPricedItem = (item, price) => ({
  name: item.hashName,
  price,
  quantity: item.quantity,
  totalPrice: price * item.quantity,
  afterTaxTotal: price * item.quantity * config.TAX_RATE
});

/* Removes duplicate market items so each unique hash name is priced only once per run. */
const getUniqueItems = items => {
  const uniqueItems = [];
  const seenHashNames = new Set();

  for (const item of items) {
    if (seenHashNames.has(item.hashName)) {
      continue;
    }

    seenHashNames.add(item.hashName);
    uniqueItems.push(item);
  }

  return uniqueItems;
};

/* Fetches Steam market pricing for one item with retry support for temporary failures. */
async function fetchMarketPriceOverview(hashName, retries = 3, delay = 5000) {
  try {
    const { data } = await axios.get(
      "https://steamcommunity.com/market/priceoverview/",
      {
        params: {
          appid: config.APP_ID,
          country: config.COUNTRY,
          currency: config.CURRENCY,
          market_hash_name: hashName
        }
      }
    );

    return data;
  } catch (err) {
    const status = err.response?.status;

    if ((status === 429 || (status >= 500 && status < 600)) && retries > 0) {
      console.log(`⏳ Retry ${hashName} (status ${status}) in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return fetchMarketPriceOverview(hashName, retries - 1, delay * 2);
    }

    console.error(`❌ Failed: ${hashName}`);
    return null;
  }
}

/* Returns a price from cache when possible, otherwise fetches it and updates the cache. */
const getPriceFromCacheOrApi = async (item, cache) => {
  const cachedEntry = cache[item.hashName];

  if (isFreshCacheEntry(cachedEntry)) {
    console.log("   🟡 Using cache");
    return {
      price: cachedEntry.price,
      cacheUpdated: false
    };
  }

  console.log("   🔵 Fetching from API...");

  const marketData = await limiter.schedule(() => fetchMarketPriceOverview(item.hashName));

  const price = marketData ? parseSteamPrice(marketData.lowest_price) : 0;

  if (!price) {
    console.log("   ⚠️ No price found");
  } else {
    console.log(`   💰 ₹${price}`);
  }

  cache[item.hashName] = {
    price,
    lastUpdated: Date.now()
  };

  return {
    price,
    cacheUpdated: true
  };
};

/* Builds a map of item names to prices for all unique items in the run. */
export async function getPriceMap(items) {
  const cache = loadCache();
  const uniqueItems = getUniqueItems(items);
  const priceMap = {};
  let cacheChanged = false;

  console.log(`\n🔍 Processing ${uniqueItems.length} unique items...\n`);

  let index = 0;

  for (const item of uniqueItems) {
    index++;

    console.log(`(${index}/${uniqueItems.length}) ${item.hashName}`);

    const { price, cacheUpdated } = await getPriceFromCacheOrApi(item, cache);
    priceMap[item.hashName] = price;
    cacheChanged = cacheChanged || cacheUpdated;
  }

  if (cacheChanged) {
    console.log("\n💾 Saving cache...\n");
    saveCache(cache);
  } else {
    console.log("\n💾 Cache unchanged, skipping save.\n");
  }

  return priceMap;
}

/* Converts raw inventory items into priced items using an existing or newly created price map. */
export async function getPrices(items, priceMap = null) {
  const resolvedPriceMap = priceMap || (await getPriceMap(items));
  const pricedItems = [];

  for (const item of items) {
    const price = resolvedPriceMap[item.hashName] || 0;
    pricedItems.push(createPricedItem(item, price));
  }

  return pricedItems;
}
