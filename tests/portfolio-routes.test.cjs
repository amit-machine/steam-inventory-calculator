const test = require('node:test');
const assert = require('node:assert/strict');

const { createPortfolioRouter } = require('../libs/portfolio/api-feature/src/lib/routes/portfolio.routes.ts');

function getRouteHandler(router, method, path) {
  const routeLayer = router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method]);

  if (!routeLayer) {
    throw new Error(`Route ${method.toUpperCase()} ${path} was not found`);
  }

  return routeLayer.route.stack[0].handle;
}

function createMockResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    sendStatus(code) {
      this.statusCode = code;
      return this;
    },
  };
}

test('GET /api/portfolio/history validates limit query params', async (t) => {
  const handlers = {
    fetchPortfolioHistory: async () => ({ entries: [] }),
    fetchPortfolioSummary: async () => null,
    getHealthStatus: () => ({ status: 'ok' }),
    recalculatePortfolio: async () => ({ accounts: [], portfolio: { totalValue: 0, afterTax: 0, itemCount: 0 }, generatedAt: '' }),
  };
  const router = createPortfolioRouter(handlers);
  const historyHandler = getRouteHandler(router, 'get', '/portfolio/history');
  const response = createMockResponse();
  let nextCalledWith = null;

  await historyHandler(
    {
      query: {
        limit: '0',
      },
    },
    response,
    (error) => {
      nextCalledWith = error;
    }
  );

  assert.equal(nextCalledWith, null);
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, 'limit must be an integer between 1 and 500');
});

test('GET /api/portfolio/summary reads the saved snapshot without recalculating', async () => {
  let recalculateCallCount = 0;
  let summaryCallCount = 0;

  const handlers = {
    fetchPortfolioHistory: async () => ({ entries: [] }),
    fetchPortfolioSummary: async () => {
      summaryCallCount += 1;

      return {
        accounts: [
          {
            account: 'account1',
            storageValue: 100,
            afterTax: 87,
            itemCount: 2,
            items: [],
          },
        ],
        portfolio: {
          totalValue: 100,
          afterTax: 87,
          itemCount: 2,
        },
        generatedAt: '2026-04-25T00:00:00.000Z',
      };
    },
    getHealthStatus: () => ({ status: 'ok' }),
    recalculatePortfolio: async () => {
      recalculateCallCount += 1;

      return {
        accounts: [],
        portfolio: { totalValue: 0, afterTax: 0, itemCount: 0 },
        generatedAt: '2026-04-25T00:00:00.000Z',
      };
    },
  };
  const router = createPortfolioRouter(handlers);
  const summaryHandler = getRouteHandler(router, 'get', '/portfolio/summary');
  const response = createMockResponse();

  await summaryHandler({}, response, () => {});

  assert.equal(response.statusCode, 200);
  assert.equal(summaryCallCount, 1);
  assert.equal(recalculateCallCount, 0);
  assert.equal(response.body.accounts[0].storageValue, 100);
});

test('POST /api/portfolio/recalculate uses the recalculation handler', async () => {
  let recalculateCallCount = 0;

  const handlers = {
    fetchPortfolioHistory: async () => ({ entries: [] }),
    fetchPortfolioSummary: async () => null,
    getHealthStatus: () => ({ status: 'ok' }),
    recalculatePortfolio: async () => {
      recalculateCallCount += 1;

      return {
        accounts: [],
        portfolio: {
          totalValue: 200,
          afterTax: 174,
          itemCount: 3,
        },
        generatedAt: '2026-04-25T00:00:00.000Z',
      };
    },
  };
  const router = createPortfolioRouter(handlers);
  const recalculateHandler = getRouteHandler(router, 'post', '/portfolio/recalculate');
  const response = createMockResponse();

  await recalculateHandler({}, response, () => {});

  assert.equal(response.statusCode, 200);
  assert.equal(recalculateCallCount, 1);
  assert.equal(response.body.portfolio.totalValue, 200);
});
