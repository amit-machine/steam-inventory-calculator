const CONFIG = {
  APP_ID: process.env.APP_ID || 730,
  COUNTRY: process.env.COUNTRY || "IN",
  CURRENCY: process.env.CURRENCY || 24,

  TAX: process.env.TAX_RATE || 0.87,

  REQUEST_DELAY: process.env.REQUEST_DELAY || 3000,
  CACHE_TTL: (process.env.CACHE_TTL_DAYS || 7) * 24 * 60 * 60 * 1000
};

export default CONFIG;