import "dotenv/config";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

/* Converts environment variable strings into numbers and falls back safely when missing. */
const toNumber = (value: string | undefined, fallbackValue: number) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
};

export const portfolioConfig = {
  APP_ID: toNumber(process.env["APP_ID"], 730),
  COUNTRY: process.env["COUNTRY"] || "IN",
  CURRENCY: toNumber(process.env["CURRENCY"], 24),
  TAX_RATE: toNumber(process.env["TAX_RATE"], 0.87),
  REQUEST_DELAY_MS: toNumber(process.env["REQUEST_DELAY"], 3000),
  CACHE_TTL_MS: toNumber(process.env["CACHE_TTL_DAYS"], 1) * ONE_DAY_IN_MS,
  MONGODB_URI: process.env["MONGODB_URI"] || "mongodb://127.0.0.1:27017",
  MONGODB_DB_NAME: process.env["MONGODB_DB_NAME"] || "steam_inventory_calculator",
  PORT: toNumber(process.env["PORT"], 3333),
};
