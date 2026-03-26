# Steam Inventory Calculator

An Nx monorepo with:

- an Express API in `apps/api`
- an Angular frontend shell in `apps/web`
- shared portfolio logic in `libs/portfolio/*`

## Workspace Structure

```text
apps/
  api/                     Express backend
  web/                     Angular frontend

libs/
  portfolio/
    api-contracts/         Shared response and domain types
    api-feature/           API routes and orchestration
    core/                  Pricing and portfolio calculation logic
    data-access/           MongoDB config, models, and repositories
```

## Inventory Source

The editable inventory data now lives in:

```text
libs/portfolio/core/src/lib/inventory/inventory.data.ts
```

## API Endpoints

- `GET /api/health`
- `GET /api/portfolio/history`
- `GET /api/portfolio/summary`
- `POST /api/portfolio/recalculate`

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

## Run The API

Use Node 22 in your shell, then run:

```bash
npm start
```

That starts the Express API with Nx.

## Other Commands

```bash
npm run start:web
npm run build:api
npm run build:web
```

## Database Collections

- `price_cache`
- `portfolio_history`
