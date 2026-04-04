/**
 * Seeder utility that writes demo data into localStorage.
 *
 * Usage:
 * - Import and call seedDemoData() from browser console or a dev-only UI.
 *   Example (in browser console):
 *     import('/src/utils/seedDemoData.ts').then(m => m.seedDemoData(true));
 *
 * - Or use the provided SeedDemoButton component (optional) to trigger from the UI.
 */

import { demoProducts, demoPurchases, demoSales, demoReturns } from "../data/demo/demoData";

type SeedReport = {
  productsWritten: number;
  purchasesWritten: number;
  salesWritten: number;
  returnsWritten: number;
  skippedBecauseExisting: boolean;
};

const KEY_PRODUCTS = "ppe_demo_inventory_v1";
const KEY_PURCHASES = "ppe_demo_purchases_v1";
const KEY_SALES = "ppe_demo_sales_v1";
const KEY_RETURNS = "ppe_demo_returns_v1";

/**
 * seedDemoData
 * - clearExisting: if true, removes existing keys and writes fresh demo data
 * - returns a report
 */
export async function seedDemoData(clearExisting = false): Promise<SeedReport> {
  try {
    const existing =
      localStorage.getItem(KEY_PRODUCTS) ||
      localStorage.getItem(KEY_PURCHASES) ||
      localStorage.getItem(KEY_SALES) ||
      localStorage.getItem(KEY_RETURNS);

    if (existing && !clearExisting) {
      return {
        productsWritten: 0,
        purchasesWritten: 0,
        salesWritten: 0,
        returnsWritten: 0,
        skippedBecauseExisting: true,
      };
    }

    if (clearExisting) {
      localStorage.removeItem(KEY_PRODUCTS);
      localStorage.removeItem(KEY_PURCHASES);
      localStorage.removeItem(KEY_SALES);
      localStorage.removeItem(KEY_RETURNS);
    }

    // Write data
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(demoProducts));
    localStorage.setItem(KEY_PURCHASES, JSON.stringify(demoPurchases));
    localStorage.setItem(KEY_SALES, JSON.stringify(demoSales));
    localStorage.setItem(KEY_RETURNS, JSON.stringify(demoReturns));

    return {
      productsWritten: demoProducts.length,
      purchasesWritten: demoPurchases.length,
      salesWritten: demoSales.length,
      returnsWritten: demoReturns.length,
      skippedBecauseExisting: false,
    };
  } catch (err) {
    console.error("seedDemoData error:", err);
    throw err;
  }
}

/**
 * readDemoDataFromStorage
 * - Convenience helper to read what was written into localStorage (if any)
 */
export function readDemoDataFromStorage() {
  const products = JSON.parse(localStorage.getItem(KEY_PRODUCTS) || "null");
  const purchases = JSON.parse(localStorage.getItem(KEY_PURCHASES) || "null");
  const sales = JSON.parse(localStorage.getItem(KEY_SALES) || "null");
  const returns = JSON.parse(localStorage.getItem(KEY_RETURNS) || "null");
  return { products, purchases, sales, returns };
}

/**
 * Keys exported for apps that prefer to read directly
 */
export const STORAGE_KEYS = {
  PRODUCTS: KEY_PRODUCTS,
  PURCHASES: KEY_PURCHASES,
  SALES: KEY_SALES,
  RETURNS: KEY_RETURNS,
};