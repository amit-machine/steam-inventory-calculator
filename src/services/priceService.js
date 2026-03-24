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

// ---------------- HELPERS ----------------

const priceFormat = str => {
  try {
    if (!str) return 0;
    const num = str.split(" ")[1]?.replace(",", "");
    return num ? parseFloat(num) : 0;
  } catch {
    return 0;
  }
};

// ---------------- API ----------------

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

// ---------------- MAIN ----------------

export async function getPrices(items) {
  let cache = loadCache();
  const results = [];

  console.log(`\n🔍 Processing ${items.length} items...\n`);

  let index = 0;

  for (let item of items) {
    index++;

    const cached = cache[item.hashName];

    const useCache =
      cached &&
      cached.price > 0 &&
      Date.now() - cached.lastUpdated < CONFIG.CACHE_TTL;

    // Progress indicator
    console.log(
      `(${index}/${items.length}) ${item.hashName}`
    );

    if (useCache) {
      console.log("   🟡 Using cache");

      results.push({
        name: item.hashName,
        price: cached.price,
        quantity: item.quantity,
        totalPrice: cached.price * item.quantity,
        afterTaxTotal: cached.price * item.quantity * CONFIG.TAX
      });

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

    results.push({
      name: item.hashName,
      price,
      quantity: item.quantity,
      totalPrice: price * item.quantity,
      afterTaxTotal: price * item.quantity * CONFIG.TAX
    });
  }

  console.log("\n💾 Saving cache...\n");
  saveCache(cache);

  return results;
}