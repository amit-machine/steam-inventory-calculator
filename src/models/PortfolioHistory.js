import mongoose from "mongoose";

const portfolioHistorySchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    storageValue: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    versionKey: false,
    collection: "portfolio_history"
  }
);

export const PortfolioHistory =
  mongoose.models.PortfolioHistory || mongoose.model("PortfolioHistory", portfolioHistorySchema);
