import mongoose from "mongoose";

export interface PortfolioHistoryDocument {
  accountName: string;
  storageValue: number;
  timestamp: Date;
}

const portfolioHistorySchema = new mongoose.Schema<PortfolioHistoryDocument>(
  {
    accountName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    storageValue: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    collection: "portfolio_history",
  }
);

export const PortfolioHistoryModel: mongoose.Model<PortfolioHistoryDocument> =
  (mongoose.models["PortfolioHistory"] as mongoose.Model<PortfolioHistoryDocument> | undefined) ||
  mongoose.model<PortfolioHistoryDocument>("PortfolioHistory", portfolioHistorySchema);
