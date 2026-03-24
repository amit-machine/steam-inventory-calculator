# 🎮 Steam Inventory Calculator

A Node.js tool to calculate the total value of your Steam inventory across multiple accounts using live market data.

---

## 🚀 Features

* 📡 Fetches real-time prices from Steam Market
* ♻️ Fetches each unique item price once per run across all accounts
* ⏱️ Rate-limited API calls to avoid throttling
* 🔁 Retry mechanism with exponential backoff
* 🍃 MongoDB storage for cached prices and portfolio history
* 📝 Skips unnecessary cache database writes when nothing changed
* 📊 Historical tracking of portfolio value
* 👥 Multi-account support
* ⚡ CLI-based execution with detailed logs
* 📚 Beginner-friendly code structure with small named helper functions

---

## 📂 Project Structure

```bash
src/
├── config/        # Configuration values and env parsing
├── db/            # Mongoose connection setup
├── core/          # Account totals + portfolio history logic
├── models/        # MongoDB models for cache and history
├── services/      # Steam API, cache handling, and price preparation
├── data/          # Inventory input data
└── index.js       # Entry point
```

---

## ⚡ Performance Notes

The current version is optimized for larger inventories:

* duplicate items across accounts are priced once per run and reused
* history entries are buffered during the run and inserted in one batch
* cached prices are only written to MongoDB when data actually changes

---

## 🛠️ What I Optimized

This project started as a working CLI tool, then was improved with a focus on performance, maintainability, and beginner-friendly readability.

Key improvements:

* reduced duplicate Steam price lookups by pricing shared items once per run
* replaced local file persistence with MongoDB and Mongoose models
* reduced unnecessary database writes for cache and history updates
* refactored logic into smaller helper functions with clearer naming
* improved code readability with consistent formatting and function-level documentation comments

These changes make the app faster on larger inventories and easier to understand for new contributors.

---

## 🧭 Runtime Flow

The application runs in this order:

1. load accounts from `src/data/inventory.js`
2. combine all account items into one list
3. fetch or reuse prices for each unique market item
4. process each account using the shared price map
5. update history and print the final portfolio summary

This design keeps the API usage efficient while preserving simple CLI behavior.

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/amit-machine/steam-inventory-calculator.git
cd steam-inventory-calculator
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Start MongoDB

Make sure a MongoDB server is running locally or provide a remote connection string.

Default local connection:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=steam_inventory_calculator
```

---

### 4. Add your inventory

Edit:

```bash
src/data/inventory.js
```

Example:

```js
export default {
  mainAccount: [
    { hashName: "AK-47 | Redline (Field-Tested)", quantity: 2 },
    { hashName: "AWP | Asiimov (Battle-Scarred)", quantity: 1 }
  ],
  tradingAccount: []
};
```

---

## 🧾 How to get your item names

1. Go to Steam Market
   👉 https://steamcommunity.com/market/

2. Search for your item

3. Copy the exact market hash name

Example:

```
AK-47 | Redline (Field-Tested)
```

⚠️ Must match exactly (including spaces, symbols, and condition)

---

## ▶️ Run the project

```bash
npm start
```

or

```bash
node src/index.js
```

---

## 📊 Output

* Per account:

  * 💰 Total value
  * 💸 After-tax value
  * 📦 Total item count

* Portfolio summary:

  * Combined value across all accounts

Example:

```bash
📊 Portfolio Summary
💰 Total Value: ₹2815902
💸 After Tax: ₹2449834
📦 Total Items: 49638
```

---

## 💾 Data Storage

MongoDB collections used by the app:

* `pricecaches` → Cached Steam market prices
* `portfoliohistories` → Historical portfolio snapshots

---

## 🧠 Code Style

The codebase is intentionally written to stay beginner-friendly:

* small helper functions with descriptive names
* top-of-function block comments instead of inline code comments
* simple control flow that is easier to trace while learning

---

## ⚙️ Configuration (Optional)

You can override defaults using environment variables:

```env
APP_ID=730
COUNTRY=IN
CURRENCY=24
TAX_RATE=0.87
REQUEST_DELAY=3000
CACHE_TTL_DAYS=7
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=steam_inventory_calculator
```

👉 Not required — defaults are already defined in code.

---

## 🔐 Security Notes

* `.env` is ignored via `.gitignore`
* No sensitive data is stored by default
* Safe to run locally without exposing credentials

---

## 🧠 Tech Stack

* Node.js (ES Modules)
* Axios (HTTP requests)
* Bottleneck (rate limiting)
* MongoDB
* Mongoose

---

## 🚧 Future Improvements

* 🌐 REST API (Express)
* 📊 Dashboard UI (Angular)
* 🗄️ Database integration (MongoDB)
* ⏲️ Scheduled tracking (cron jobs)
* 🔔 Price alerts / notifications
* ⚡ Parallel processing with batching

---

## 👨‍💻 Author

**Amit**

---

## ⭐ If you found this useful

Give it a star ⭐ — helps a lot!
