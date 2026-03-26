import mongoose from "mongoose";

export interface PriceCacheDocument {
  hashName: string;
  price: number;
  lastUpdated: Date;
}

const priceCacheSchema = new mongoose.Schema<PriceCacheDocument>(
  {
    hashName: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    lastUpdated: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
    collection: "price_cache",
  }
);

export const PriceCacheModel: mongoose.Model<PriceCacheDocument> =
  (mongoose.models["PriceCache"] as mongoose.Model<PriceCacheDocument> | undefined) ||
  mongoose.model<PriceCacheDocument>("PriceCache", priceCacheSchema);
