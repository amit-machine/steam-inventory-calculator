import accounts from "./data/inventory.js";
import { processAccount } from "./core/processor.js";
import { getPriceMap } from "./services/priceService.js";

async function run() {
  console.log("🚀 Starting inventory calculation...\n");

  let portfolio = { totalValue: 0, afterTax: 0, itemCount: 0 };

  const accountEntries = Object.entries(accounts);
  const allItems = accountEntries.flatMap(([, items]) => items);

  const priceMap = await getPriceMap(allItems);

  for (let i = 0; i < accountEntries.length; i++) {
    const [name, items] = accountEntries[i];

    console.log(`\n📦 [${i + 1}/${accountEntries.length}] Processing ${name}...`);
    console.log(`Items: ${items.length}`);

    const start = Date.now();

    const result = await processAccount(items, name, priceMap);

    const end = Date.now();

    if (result) {
      portfolio.totalValue += result.StorageValue;
      portfolio.afterTax += result.AfterTax;
      portfolio.itemCount += result.Count;

      console.log(`✅ Done ${name} in ${((end - start) / 1000).toFixed(2)}s`);
    } else {
      console.log(`⚠️ Skipped ${name}`);
    }
  }

  console.log("\n===============================");
  console.log("📊 Portfolio Summary");
  console.log(`💰 Total Value: ₹${portfolio.totalValue}`);
  console.log(`💸 After Tax: ₹${portfolio.afterTax}`);
  console.log(`📦 Total Items: ${portfolio.itemCount}`);
  console.log("===============================\n");
}

run();
