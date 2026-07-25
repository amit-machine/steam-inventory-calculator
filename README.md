# Steam Inventory Calculator

An Nx monorepo for tracking Steam inventory value with:

- an Express API in `apps/api`
- a frontend app in `apps/web` (previously Angular)
- shared TypeScript libraries in `libs/portfolio/*`
- MongoDB for cached prices, saved summaries, and portfolio history

## What This App Does

- reads your editable inventory data from `libs/portfolio/core/src/lib/inventory/inventory.data.ts`
- fetches Steam Market prices for unique items only once per recalculation
- reuses fresh cached prices from MongoDB
- saves portfolio history snapshots in MongoDB
# Steam Inventory Calculator

Small Nx-style monorepo focused on the backend API for calculating Steam inventory value.

What remains in this repo:

- `apps/api` — Express backend that exposes REST endpoints for portfolio history, summary, and recalculation.
- `libs/portfolio/*` — shared TypeScript libraries: `core` (inventory & pricing), `data-access` (MongoDB models/repositories), and `api-*` helpers.

Why the repo exists

- Loads editable inventory from `libs/portfolio/core/src/lib/inventory/inventory.data.ts`.
- Resolves Steam Market prices for unique items, using a MongoDB-backed cache to avoid repeated fetches.
- Persists portfolio history and a latest summary snapshot to MongoDB.

Quickstart (backend)

1. Install dependencies:

```bash
npm install
```

2. Provide environment variables (create a `.env` in project root):

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

3. Start the API:

```bash
npm start
```

4. Run tests:

```bash
npm test
```

Notes

- The frontend previously lived under `apps/web` (Angular). It has been removed — the repository is being kept backend-first until a React frontend is scaffolded.
- A Docker Compose for local MongoDB would make running the API easier; I can add that if you want.

API Endpoints (summary)

- `GET /api/health` — lightweight health check.
- `GET /api/portfolio/history?limit=<n>` — returns stored portfolio history (no recalculation). `limit` must be 1..500.
- `GET /api/portfolio/summary` — returns latest stored summary snapshot (404 if none exists).
- `POST /api/portfolio/recalculate` — recalculates using `inventory.data.ts`, resolves prices, stores history and latest summary.

Where to next

- I can scaffold a minimal React frontend and wire it to the API, or
- Add `docker-compose.yml` to run MongoDB + API for local development, or
- Continue improving backend features (logging, metrics, CI).

If you want a React frontend now, tell me whether you'd like Nx-based React or a lightweight Vite + React app.
MONGODB_DB_NAME=steam_inventory_calculator
