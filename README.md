# 🎮 Steam Inventory Calculator

A Node.js tool to calculate the total value of your Steam inventory across multiple accounts using live market data.

---

## 🚀 Features

* 📡 Fetches real-time prices from Steam Market
* ⏱️ Rate-limited API calls to avoid throttling
* 🔁 Retry mechanism with exponential backoff
* 💾 Local caching to minimize API usage
* 📊 Historical tracking of portfolio value
* 👥 Multi-account support
* ⚡ CLI-based execution with detailed logs

---

## 📂 Project Structure

```bash
src/
├── config/        # Configuration (constants + optional env overrides)
├── core/          # Business logic (account processing)
├── services/      # External API + caching logic
├── data/          # Inventory + cache + history files
└── index.js       # Entry point
```

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

### 3. Add your inventory

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

* `src/data/prices.json` → Cached prices (auto-generated)
* `src/data/history.json` → Portfolio history (auto-generated)

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
* File System (JSON-based storage)

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
