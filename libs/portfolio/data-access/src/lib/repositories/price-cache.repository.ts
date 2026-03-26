import type { PriceCacheEntry } from "api-contracts";
import { PriceCacheModel } from "../models/price-cache.model";

/* Loads cached prices for the requested item names from MongoDB. */
export async function loadCachedPrices(hashNames: string[]) {
  const cacheEntries = await PriceCacheModel.find({
    hashName: { $in: hashNames },
  }).lean();

  const cacheMap: Record<string, { price: number; lastUpdated: number }> = {};

  for (const entry of cacheEntries) {
    cacheMap[entry["hashName"]] = {
      price: entry["price"],
      lastUpdated: new Date(entry["lastUpdated"]).getTime(),
    };
  }

  return cacheMap;
}

/* Saves only the changed cache entries back into MongoDB using bulk upserts. */
export async function saveCachedPrices(entries: PriceCacheEntry[]) {
  if (entries.length === 0) {
    return;
  }

  await PriceCacheModel.bulkWrite(
    entries.map(entry => ({
      updateOne: {
        filter: { hashName: entry.hashName },
        update: {
          $set: {
            price: entry.price,
            lastUpdated: new Date(entry.lastUpdated),
          },
        },
        upsert: true,
      },
    }))
  );
}
