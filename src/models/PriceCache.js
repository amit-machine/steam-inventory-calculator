import mongoose from "mongoose";

const priceCacheSchema = new mongoose.Schema(
  {
    hashName: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    lastUpdated: {
      type: Date,
      required: true
    }
  },
  {
    versionKey: false,
    collection: "price_cache"
  }
);

export const PriceCache =
  mongoose.models.PriceCache || mongoose.model("PriceCache", priceCacheSchema);
