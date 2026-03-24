import accounts from "./data/inventory.js";
import {
  loadPortfolioHistory,
  processAccount,
  savePortfolioHistory
} from "./core/processor.js";
import { getPriceMap } from "./services/priceService.js";

const createEmptyPortfolioSummary = () => ({
  totalValue: 0,
  afterTax: 0,
  itemCount: 0
});

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

const getAllItems = accountList => {
  const allItems = [];

  for (const account of accountList) {
    for (const item of account.items) {
      allItems.push(item);
    }
  }

  return allItems;
};

const addAccountToPortfolio = (portfolioSummary, accountSummary) => {
  portfolioSummary.totalValue += accountSummary.StorageValue;
  portfolioSummary.afterTax += accountSummary.AfterTax;
  portfolioSummary.itemCount += accountSummary.Count;
};

const printPortfolioSummary = portfolioSummary => {
  console.log("\n===============================");
  console.log("📊 Portfolio Summary");
  console.log(`💰 Total Value: ₹${portfolioSummary.totalValue}`);
  console.log(`💸 After Tax: ₹${portfolioSummary.afterTax}`);
  console.log(`📦 Total Items: ${portfolioSummary.itemCount}`);
  console.log("===============================\n");
};

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
