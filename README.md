# Steam Inventory Calculator

Backend-first Nx monorepo for calculating Steam inventory value.

Contents

- `apps/api` — Express backend exposing REST endpoints for portfolio history, summary, and recalculation.
- `libs/portfolio/*` — shared TypeScript libraries: `core` (inventory & pricing), `data-access` (MongoDB models/repositories), and `api-feature` helpers.

What it does

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

API Endpoints (summary)

- `GET /api/health` — lightweight health check.
- `GET /api/portfolio/history?limit=<n>` — returns stored portfolio history (no recalculation). `limit` must be 1..500.
- `GET /api/portfolio/summary` — returns latest stored summary snapshot (404 if none exists).
- `POST /api/portfolio/recalculate` — recalculates using `inventory.data.ts`, resolves prices, stores history and latest summary.

Examples

1) GET portfolio history (example response):

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

2) GET portfolio summary (example when snapshot exists):

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

3) POST recalculation (triggers full recalculation and stores snapshots):

```bash
curl -X POST http://localhost:3333/api/portfolio/recalculate
```

Notes

- The frontend that used to live in `apps/web` (Angular) was removed; this repo is backend-first until a React frontend is added.
- I can add a `docker-compose.yml` to run MongoDB + API locally if you'd like.

Next steps

- Scaffold a React frontend (Nx React or Vite + React), or
- Add Docker Compose for local MongoDB, or
- Continue backend improvements (logging, metrics, CI).

Tell me which you'd like me to do next.
