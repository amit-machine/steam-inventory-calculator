import type { AccountSummary, PortfolioTotals, PricedItem } from "api-contracts";
import mongoose from "mongoose";

export interface PortfolioSummaryDocument {
  key: string;
  accounts: AccountSummary[];
  portfolio: PortfolioTotals;
  generatedAt: Date;
}

const pricedItemSchema = new mongoose.Schema<PricedItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    afterTaxTotal: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const accountSummarySchema = new mongoose.Schema<AccountSummary>(
  {
    account: {
      type: String,
      required: true,
      trim: true,
    },
    storageValue: {
      type: Number,
      required: true,
    },
    afterTax: {
      type: Number,
      required: true,
    },
    itemCount: {
      type: Number,
      required: true,
    },
    items: {
      type: [pricedItemSchema],
      required: true,
    },
  },
  {
    _id: false,
  }
);

const portfolioTotalsSchema = new mongoose.Schema<PortfolioTotals>(
  {
    totalValue: {
      type: Number,
      required: true,
    },
    afterTax: {
      type: Number,
      required: true,
    },
    itemCount: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const portfolioSummarySchema = new mongoose.Schema<PortfolioSummaryDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    accounts: {
      type: [accountSummarySchema],
      required: true,
    },
    portfolio: {
      type: portfolioTotalsSchema,
      required: true,
    },
    generatedAt: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
    collection: "portfolio_summary",
  }
);

export const PortfolioSummaryModel: mongoose.Model<PortfolioSummaryDocument> =
  (mongoose.models["PortfolioSummary"] as mongoose.Model<PortfolioSummaryDocument> | undefined) ||
  mongoose.model<PortfolioSummaryDocument>("PortfolioSummary", portfolioSummarySchema);
