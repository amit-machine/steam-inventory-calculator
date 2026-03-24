const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

// Converts environment variable strings into numbers and falls back safely when missing.
const toNumber = (value, fallbackValue) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
};

const config = {
  APP_ID: toNumber(process.env.APP_ID, 730),
  COUNTRY: process.env.COUNTRY || "IN",
  CURRENCY: toNumber(process.env.CURRENCY, 24),
  TAX_RATE: toNumber(process.env.TAX_RATE, 0.87),
  REQUEST_DELAY_MS: toNumber(process.env.REQUEST_DELAY, 3000),
  CACHE_TTL_MS: toNumber(process.env.CACHE_TTL_DAYS, 7) * ONE_DAY_IN_MS
};

export default config;
