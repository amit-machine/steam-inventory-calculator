import type { PortfolioHistoryEntry } from "api-contracts";
import { PortfolioHistoryModel } from "../models/portfolio-history.model";

/* Inserts the latest portfolio history records for the current run. */
export async function insertPortfolioHistory(entries: PortfolioHistoryEntry[]) {
  if (entries.length === 0) {
    return;
  }

  await PortfolioHistoryModel.insertMany(
    entries.map(entry => ({
      accountName: entry.accountName,
      storageValue: entry.storageValue,
      timestamp: new Date(entry.timestamp),
    }))
  );
}

/* Returns the most recent portfolio history entries, newest first. */
export async function getPortfolioHistory(limit = 100) {
  const historyEntries = await PortfolioHistoryModel.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

  return historyEntries.map(entry => ({
    accountName: entry["accountName"],
    storageValue: entry["storageValue"],
    timestamp: new Date(entry["timestamp"]).toISOString(),
  }));
}
