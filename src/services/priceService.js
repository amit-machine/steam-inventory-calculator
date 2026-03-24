import axios from "axios";
import Bottleneck from "bottleneck";
import fs from "fs";
import path from "path";
import CONFIG from "../config/config.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_FILE = path.join(__dirname, "../data/prices.json");

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: CONFIG.REQUEST_DELAY
});

// ---------------- CACHE ----------------

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

const priceFormat = str => {
  try {
    if (!str) return 0;
    const num = str.split(" ")[1]?.replace(",", "");
    return num ? parseFloat(num) : 0;
  } catch {
    return 0;
  }
};

const hasFreshCache = cached =>
  cached &&
  cached.price > 0 &&
  Date.now() - cached.lastUpdated < CONFIG.CACHE_TTL;

const buildResult = (item, price) => ({
  name: item.hashName,
  price,
  quantity: item.quantity,
  totalPrice: price * item.quantity,
  afterTaxTotal: price * item.quantity * CONFIG.TAX
});

async function getPricesUrl(url, retries = 3, delay = 5000) {
  try {
    const { data } = await axios.get(
      "https://steamcommunity.com/market/priceoverview/",
      {
        params: {
          appid: CONFIG.APP_ID,
          country: CONFIG.COUNTRY,
          currency: CONFIG.CURRENCY,
          market_hash_name: url
        }
      }
    );

    return data;
  } catch (err) {
    const status = err.response?.status;

    if ((status === 429 || (status >= 500 && status < 600)) && retries > 0) {
      console.log(`⏳ Retry ${url} (status ${status}) in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return getPricesUrl(url, retries - 1, delay * 2);
    }

    console.error(`❌ Failed: ${url}`);
    return null;
  }
}
export async function getPriceMap(items) {
  const cache = loadCache();
  const uniqueItems = [];
  const seenItems = new Set();
  const priceMap = {};
  let cacheChanged = false;

  for (const item of items) {
    if (seenItems.has(item.hashName)) continue;
    seenItems.add(item.hashName);
    uniqueItems.push(item);
  }

  console.log(`\n🔍 Processing ${uniqueItems.length} unique items...\n`);

  let index = 0;

  for (const item of uniqueItems) {
    index++;

    console.log(`(${index}/${uniqueItems.length}) ${item.hashName}`);

    const cached = cache[item.hashName];

    if (hasFreshCache(cached)) {
      console.log("   🟡 Using cache");
      priceMap[item.hashName] = cached.price;
      continue;
    }

    console.log("   🔵 Fetching from API...");

    const data = await limiter.schedule(() =>
      getPricesUrl(item.hashName)
    );

    const price = data ? priceFormat(data.lowest_price) : 0;

    if (!price) {
      console.log("   ⚠️ No price found");
    } else {
      console.log(`   💰 ₹${price}`);
    }

    cache[item.hashName] = {
      price,
      lastUpdated: Date.now()
    };
    cacheChanged = true;
    priceMap[item.hashName] = price;
  }

  if (cacheChanged) {
    console.log("\n💾 Saving cache...\n");
    saveCache(cache);
  } else {
    console.log("\n💾 Cache unchanged, skipping save.\n");
  }

  return priceMap;
}

export async function getPrices(items, priceMap = null) {
  const resolvedPriceMap = priceMap || (await getPriceMap(items));
  return items.map(item => buildResult(item, resolvedPriceMap[item.hashName] || 0));
}
