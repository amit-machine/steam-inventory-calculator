# Steam Inventory Calculator

An Nx monorepo for tracking Steam inventory value with:

- an Express API in `apps/api`
- an Angular dashboard in `apps/web`
- shared TypeScript libraries in `libs/portfolio/*`
- MongoDB for cached prices, saved summaries, and portfolio history

## What This App Does

- reads your editable inventory data from `libs/portfolio/core/src/lib/inventory/inventory.data.ts`
- fetches Steam Market prices for unique items only once per recalculation
- reuses fresh cached prices from MongoDB
- saves portfolio history snapshots in MongoDB
- saves the latest portfolio summary snapshot so read endpoints stay side-effect free

## Workspace Structure

```text
apps/
  api/                     Express backend
  web/                     Angular frontend

libs/
  portfolio/
    api-contracts/         Shared request and response types
    api-feature/           API routes and orchestration
    core/                  Inventory loading, pricing, and portfolio calculation
    data-access/           MongoDB config, models, and repositories

scripts/
  build-web.mjs            Stable custom web build script used by Nx

tests/
  pricing.test.cjs         Pricing and cache behavior tests
  portfolio-routes.test.cjs Route-layer behavior tests
```

## Requirements

- Node 22
- npm
- local MongoDB running on your machine

If you use `nvm`, switch Node first:

```bash
nvm use 22
```

Install dependencies:

```bash
npm install
```

## Local MongoDB Setup

Start MongoDB before starting the API:

```bash
brew services start mongodb-community
```

You can verify it is running with:

```bash
brew services list | grep mongodb
```

## Environment Variables

Create a `.env` file in the project root:

```env
APP_ID=730
COUNTRY=IN
CURRENCY=24
TAX_RATE=0.87
REQUEST_DELAY=3000
CACHE_TTL_DAYS=1
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=steam_inventory_calculator
PORT=3333
```

## Running The Apps

Start the API:

```bash
npm start
```

The API runs at:

```text
http://localhost:3333/api
```

Start the Angular frontend in another terminal:

```bash
npm run start:web
```

The frontend calls the API on port `3333` and uses the current browser hostname automatically.

## Build Commands

```bash
npm run build:api
npm run build:web
```

## Test Command

```bash
npm test
```

Current test coverage includes:

- Steam price parsing
- cache-aware item price resolution
- route validation and route behavior

## API Endpoints

### `GET /api/health`

Simple health response for the backend.

### `GET /api/portfolio/history?limit=12`

Reads saved portfolio history from MongoDB.

- `limit` must be an integer between `1` and `500`
- this endpoint does not fetch Steam prices

Example response:

```json
{
  "entries": [
    {
      "accountName": "account1",
      "storageValue": 12345,
      "timestamp": "2026-04-25T09:30:00.000Z"
    }
  ]
}
```

### `GET /api/portfolio/summary`

Reads the latest saved summary snapshot from MongoDB.

- this endpoint does not recalculate prices
- it returns `404` until you run a recalculation at least once

### `POST /api/portfolio/recalculate`

Recalculates the portfolio from inventory data.

This endpoint:

- loads all accounts from `inventory.data.ts`
- fetches prices for unique items
- reuses fresh cache entries when possible
- stores new history entries
- stores the latest summary snapshot

Example response:

```json
{
  "accounts": [
    {
      "account": "account1",
      "storageValue": 12345,
      "afterTax": 10740.15,
      "itemCount": 20,
      "items": []
    }
  ],
  "portfolio": {
    "totalValue": 12345,
    "afterTax": 10740.15,
    "itemCount": 20
  },
  "generatedAt": "2026-04-25T09:30:00.000Z"
}
```

## MongoDB Collections

- `price_cache`
- `portfolio_history`
- `portfolio_summary`

## Frontend Notes

- the frontend is now wired to the API
- it loads the latest saved summary on startup
- it shows recent history entries
- it lets you trigger a recalculation from the UI

If `GET /api/portfolio/summary` returns `404`, the UI will show an empty state until you run the first recalculation.
