import type { PortfolioSummaryResponse } from "api-contracts";
import { PortfolioSummaryModel } from "../models/portfolio-summary.model";

const LATEST_SUMMARY_KEY = "latest";

/* Loads the most recently saved portfolio summary snapshot. */
export async function getLatestPortfolioSummary(): Promise<PortfolioSummaryResponse | null> {
  const summaryEntry = await PortfolioSummaryModel.findOne({
    key: LATEST_SUMMARY_KEY,
  }).lean();

  if (!summaryEntry) {
    return null;
  }

  return {
    accounts: summaryEntry["accounts"],
    portfolio: summaryEntry["portfolio"],
    generatedAt: new Date(summaryEntry["generatedAt"]).toISOString(),
  };
}

/* Saves the latest recalculated portfolio summary so read endpoints stay side-effect free. */
export async function savePortfolioSummary(summary: PortfolioSummaryResponse) {
  await PortfolioSummaryModel.findOneAndUpdate(
    {
      key: LATEST_SUMMARY_KEY,
    },
    {
      $set: {
        accounts: summary.accounts,
        portfolio: summary.portfolio,
        generatedAt: new Date(summary.generatedAt),
      },
    },
    {
      upsert: true,
      new: true,
    }
  );
}
