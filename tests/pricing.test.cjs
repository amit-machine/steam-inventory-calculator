const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseSteamPrice,
  resolveItemPrices,
} = require('../libs/portfolio/core/src/lib/pricing/steam-price.service.ts');

test('parseSteamPrice handles common Steam currency formats', () => {
  assert.equal(parseSteamPrice('₹ 1,234.50'), 1234.5);
  assert.equal(parseSteamPrice('$1,234.50'), 1234.5);
  assert.equal(parseSteamPrice('1.234,50€'), 1234.5);
  assert.equal(parseSteamPrice(undefined), 0);
  assert.equal(parseSteamPrice('not a price'), 0);
});

test('resolveItemPrices uses unique names and skips saving when cache is fresh', async (t) => {
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'error', () => {});

  const now = Date.now();
  const items = [
    { hashName: 'Prisma 2 Case', quantity: 1 },
    { hashName: 'Prisma 2 Case', quantity: 3 },
    { hashName: 'Prisma Case', quantity: 2 },
  ];

  const loadCalls = [];
  let saveCalled = false;

  const priceMap = await resolveItemPrices(items, {
    async loadCachedPrices(hashNames) {
      loadCalls.push(hashNames);

      return {
        'Prisma 2 Case': {
          price: 15.5,
          lastUpdated: now,
        },
        'Prisma Case': {
          price: 20,
          lastUpdated: now,
        },
      };
    },
    async saveCachedPrices() {
      saveCalled = true;
    },
  });

  assert.deepEqual(loadCalls, [['Prisma 2 Case', 'Prisma Case']]);
  assert.deepEqual(priceMap, {
    'Prisma 2 Case': 15.5,
    'Prisma Case': 20,
  });
  assert.equal(saveCalled, false);
});
