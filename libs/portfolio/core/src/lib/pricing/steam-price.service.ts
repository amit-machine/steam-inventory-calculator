import type { InventoryItem, PriceCacheEntry, PricedItem } from "api-contracts";
import axios from "axios";
import Bottleneck from "bottleneck";
import { portfolioConfig } from "data-access";

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: portfolioConfig.REQUEST_DELAY_MS,
});

/* Converts Steam price text into a number the calculator can use. */
const parseSteamPrice = (priceText: string | undefined) => {
  try {
    if (!priceText) return 0;

    const valuePart = priceText.split(" ")[1]?.replace(",", "");
    return valuePart ? parseFloat(valuePart) : 0;
  } catch {
    return 0;
  }
};

/* Checks whether a cached price is still fresh enough to reuse. */
const isFreshCacheEntry = (cacheEntry?: { price: number; lastUpdated: number }) =>
  cacheEntry &&
  cacheEntry.price > 0 &&
  Date.now() - cacheEntry.lastUpdated < portfolioConfig.CACHE_TTL_MS;

/* Creates the final priced item object for reporting and totals. */
const createPricedItem = (item: InventoryItem, price: number): PricedItem => ({
  name: item.hashName,
  price,
  quantity: item.quantity,
  totalPrice: price * item.quantity,
  afterTaxTotal: price * item.quantity * portfolioConfig.TAX_RATE,
});

/* Removes duplicate market items so each unique hash name is priced only once per run. */
const getUniqueItems = (items: InventoryItem[]) => {
  const uniqueItems: InventoryItem[] = [];
  const seenHashNames = new Set<string>();

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
async function fetchMarketPriceOverview(hashName: string, retries = 3, delay = 5000) {
  try {
    const { data } = await axios.get("https://steamcommunity.com/market/priceoverview/", {
      params: {
        appid: portfolioConfig.APP_ID,
        country: portfolioConfig.COUNTRY,
        currency: portfolioConfig.CURRENCY,
        market_hash_name: hashName,
      },
    });

    return data;
  } catch (err: any) {
    const status = err.response?.status;

    if ((status === 429 || (status >= 500 && status < 600)) && retries > 0) {
      console.log(`⏳ Retry ${hashName} (status ${status}) in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchMarketPriceOverview(hashName, retries - 1, delay * 2);
    }

    console.error(`❌ Failed: ${hashName}`);
    return null;
  }
}

/* Returns a price from cache when possible, otherwise fetches it and prepares a cache update. */
const getPriceFromCacheOrApi = async (
  item: InventoryItem,
  cache: Record<string, { price: number; lastUpdated: number }>
) => {
  const cachedEntry = cache[item.hashName];

  if (isFreshCacheEntry(cachedEntry)) {
    console.log("   🟡 Using cache");
    return {
      price: cachedEntry.price,
      cacheUpdated: false,
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
    lastUpdated: Date.now(),
  };

  return {
    price,
    cacheUpdated: true,
  };
};

interface ResolveItemPricesOptions {
  loadCachedPrices(hashNames: string[]): Promise<Record<string, { price: number; lastUpdated: number }>>;
  saveCachedPrices(entries: PriceCacheEntry[]): Promise<void>;
}

/* Builds a map of item names to prices using cache first and Steam Market as fallback. */
export async function resolveItemPrices(items: InventoryItem[], options: ResolveItemPricesOptions) {
  const uniqueItems = getUniqueItems(items);
  const uniqueHashNames = uniqueItems.map(item => item.hashName);
  const cache = await options.loadCachedPrices(uniqueHashNames);
  const priceMap: Record<string, number> = {};
  const updatedCacheEntries: PriceCacheEntry[] = [];

  console.log(`\n🔍 Processing ${uniqueItems.length} unique items...\n`);

  let index = 0;

  for (const item of uniqueItems) {
    index++;
    console.log(`(${index}/${uniqueItems.length}) ${item.hashName}`);

    const { price, cacheUpdated } = await getPriceFromCacheOrApi(item, cache);
    priceMap[item.hashName] = price;

    if (cacheUpdated) {
      updatedCacheEntries.push({
        hashName: item.hashName,
        price,
        lastUpdated: cache[item.hashName].lastUpdated,
      });
    }
  }

  if (updatedCacheEntries.length > 0) {
    console.log("\n💾 Saving cache to MongoDB...\n");
    await options.saveCachedPrices(updatedCacheEntries);
  } else {
    console.log("\n💾 Cache unchanged, skipping database update.\n");
  }

  return priceMap;
}

/* Converts raw inventory items into priced items using a resolved item price map. */
export function buildPricedItems(items: InventoryItem[], priceMap: Record<string, number>) {
  const pricedItems: PricedItem[] = [];

  for (const item of items) {
    const price = priceMap[item.hashName] || 0;
    pricedItems.push(createPricedItem(item, price));
  }

  return pricedItems;
}
