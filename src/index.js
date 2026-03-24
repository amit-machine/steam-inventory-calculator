import accounts from "./data/inventory.js";
import {
  loadPortfolioHistory,
  processAccount,
  savePortfolioHistory
} from "./core/processor.js";
import { getPriceMap } from "./services/priceService.js";

// Creates the starting totals used for the final portfolio summary.
const createEmptyPortfolioSummary = () => ({
  totalValue: 0,
  afterTax: 0,
  itemCount: 0
});

// Converts the accounts object into a simple list of account records.
const getAccountList = accountsByName => {
  const accountList = [];

  for (const accountName in accountsByName) {
    accountList.push({
      name: accountName,
      items: accountsByName[accountName]
    });
  }

  return accountList;
};

// Collects every item from every account into one array for shared price fetching.
const getAllItems = accountList => {
  const allItems = [];

  for (const account of accountList) {
    for (const item of account.items) {
      allItems.push(item);
    }
  }

  return allItems;
};

// Adds one account summary into the overall portfolio totals.
const addAccountToPortfolio = (portfolioSummary, accountSummary) => {
  portfolioSummary.totalValue += accountSummary.StorageValue;
  portfolioSummary.afterTax += accountSummary.AfterTax;
  portfolioSummary.itemCount += accountSummary.Count;
};

// Prints the final portfolio totals after all accounts are processed.
const printPortfolioSummary = portfolioSummary => {
  console.log("\n===============================");
  console.log("📊 Portfolio Summary");
  console.log(`💰 Total Value: ₹${portfolioSummary.totalValue}`);
  console.log(`💸 After Tax: ₹${portfolioSummary.afterTax}`);
  console.log(`📦 Total Items: ${portfolioSummary.itemCount}`);
  console.log("===============================\n");
};

// Runs the full inventory calculation flow from loading data to printing the summary.
async function run() {
  console.log("🚀 Starting inventory calculation...\n");

  const portfolioSummary = createEmptyPortfolioSummary();
  const accountList = getAccountList(accounts);
  const allItems = getAllItems(accountList);
  const history = loadPortfolioHistory();
  const priceMap = await getPriceMap(allItems);

  for (let index = 0; index < accountList.length; index++) {
    const account = accountList[index];

    console.log(`\n📦 [${index + 1}/${accountList.length}] Processing ${account.name}...`);
    console.log(`Items: ${account.items.length}`);

    const startTime = Date.now();
    const accountSummary = await processAccount(
      account.items,
      account.name,
      priceMap,
      history
    );
    const endTime = Date.now();

    if (!accountSummary) {
      console.log(`⚠️ Skipped ${account.name}`);
      continue;
    }

    addAccountToPortfolio(portfolioSummary, accountSummary);
    console.log(`✅ Done ${account.name} in ${((endTime - startTime) / 1000).toFixed(2)}s`);
  }

  savePortfolioHistory(history);
  printPortfolioSummary(portfolioSummary);
}

run();
