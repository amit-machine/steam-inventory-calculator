# 🎮 Steam Inventory Calculator

A Node.js tool to calculate the total value of your Steam inventory across multiple accounts using live market prices.

---

## 🚀 Features

* Fetches real-time prices from Steam Market
* Rate-limited API calls (prevents blocking)
* Retry mechanism with exponential backoff
* Local caching (reduces API usage)
* Historical tracking of portfolio value
* Multi-account support

---

## 📂 Project Structure

```bash
src/
├── config/        # App configuration
├── core/          # Business logic
├── services/      # API + caching
├── data/          # Inventory + cache + history
└── index.js       # Entry point
```

---

## ⚙️ Setup

### 1. Clone repo

```bash
git clone https://github.com/<your-username>/inventory-calculator.git
cd inventory-calculator
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
module.exports = {
  mainAccount: [
    { hashName: "AK-47 | Redline (Field-Tested)", quantity: 2 }
  ],
  tradingAccount: []
};
```

---

## 🧾 How to get your item names

1. Go to Steam Market:
   https://steamcommunity.com/market/

2. Search your item

3. Copy exact name:

```
AK-47 | Redline (Field-Tested)
```

⚠️ Must match exactly (case + symbols)

---

## ▶️ Run the project

```bash
node src/index.js
```

---

## 📊 Output

* Per account:

  * Total value
  * After tax value
  * Item count

* Overall portfolio summary

---

## 💾 Data Storage

* `prices.json` → cached prices
* `history.json` → portfolio history

---

## ⚙️ Optional Configuration

You can override defaults using environment variables:

```env
APP_ID=730
COUNTRY=IN
CURRENCY=24
TAX_RATE=0.87
REQUEST_DELAY=3000
CACHE_TTL_DAYS=7
```

(Not required — defaults are already set in code)

---

## 🔐 Security

* `.env` is ignored via `.gitignore`
* No sensitive data is stored by default

---

## 🧠 Tech Stack

* Node.js
* Axios
* Bottleneck
* File system (JSON)

---

## 🚧 Future Improvements

* REST API (Express)
* UI Dashboard (Angular)
* Database integration
* Scheduled tracking (cron jobs)
* Alerts for price changes

---

## 👨‍💻 Author

Amit
