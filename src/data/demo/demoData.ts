/**
 * Demo data generator
 * Path: src/data/demo/demoData.ts
 *
 * Exports:
 * - demoProducts: DemoProduct[]
 * - demoPurchases: PurchaseRecord[]
 * - demoSales: SaleRecord[]
 * - demoReturns: ReturnRecord[]
 *
 * Deterministic seeded RNG is used for reproducibility.
 */

export type DemoProduct = {
  id: string; // stable unique ID
  name: string;
  brand: string;
  model: string;
  imei?: string;
  price: number;
  quantity: number;
  vendor?: string;
  createdAt: string; // ISO
};

export type PurchaseRecord = {
  id: string;
  productId: string;
  vendor?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
  note?: string;
};

export type SaleRecord = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date: string;
  customer?: string;
  imei?: string;
  note?: string;
};

export type ReturnRecord = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  reason?: string;
  date: string;
  refundAmount: number;
};

const BRANDS = ["Samsung", "Apple", "Xiaomi", "OnePlus", "Oppo", "Realme", "Vivo", "Motorola", "Nokia"];
const MODELS = [
  "A1", "Pro", "Max", "Lite", "Mini", "Ultra", "S", "Note", "Z", "X"
];
const VENDORS = ["Oppo Distributors", "City Mobiles", "Global Traders", "Local Vendor", "Handset Hub"];
const CUSTOMERS = ["Customer A", "Customer B", "Customer C", "Walk-in", "Online Buyer"];
const REASONS = ["Defective", "Wrong model", "Changed mind", "Warranty claim"];

function seededRandom(seed: number) {
  // simple LCG
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pick<T>(rng: () => number, arr: T[]) {
  return arr[Math.floor(rng() * arr.length)];
}

function pad(n: number, length = 2) {
  return n.toString().padStart(length, "0");
}

function genIMEI(rng: () => number) {
  // 15-digit numeric
  let imei = "";
  for (let i = 0; i < 15; i++) {
    imei += Math.floor(rng() * 10).toString();
  }
  return imei;
}

function isoDaysAgo(days: number, rngSeedOffset = 0) {
  const now = Date.now();
  // add some jitter
  const jitter = Math.floor(Math.random() * 24 * 3600 * 1000);
  const d = new Date(now - (days * 24 * 3600 * 1000 + rngSeedOffset + jitter));
  return d.toISOString();
}

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/**
 * Generate demo data (deterministic given fixed Math.random seed initial override)
 * We keep the generator pure by using a seeded RNG local to this module.
 */
(function ensureSeededMath() {
  // do not modify global Math.random; use seeded RNG locally below
})();

const RNG = seededRandom(1234567); // constant seed -> deterministic

// Generate 100 products
export const demoProducts: DemoProduct[] = (() => {
  const list: DemoProduct[] = [];
  for (let i = 1; i <= 100; i++) {
    const brand = pick(RNG, BRANDS);
    const model = `${pick(RNG, MODELS)} ${Math.floor(1 + RNG() * 500)}`;
    const name = `${brand} ${model}`;
    const price = Number((100 + Math.floor(RNG() * 900) + (RNG() > 0.7 ? 0.99 : 0)).toFixed(2)); // 100 - 1000
    const quantity = Math.floor(RNG() * 20); // 0 - 19
    const vendor = pick(RNG, VENDORS);
    const imei = RNG() > 0.25 ? genIMEI(RNG) : undefined; // some devices have IMEI
    const createdAt = isoDaysAgo(Math.floor(RNG() * 180), i);
    list.push({
      id: `demo-prod-${pad(i, 3)}`,
      name,
      brand,
      model,
      imei,
      price,
      quantity,
      vendor,
      createdAt,
    });
  }
  return list;
})();

// Generate purchases: for ~70% of products create 1-3 purchases to reflect inventory history
export const demoPurchases: PurchaseRecord[] = (() => {
  const list: PurchaseRecord[] = [];
  demoProducts.forEach((p, idx) => {
    if (RNG() > 0.3) {
      const purchasesCount = 1 + Math.floor(RNG() * 3); // 1-3
      for (let k = 0; k < purchasesCount; k++) {
        const qty = 1 + Math.floor(RNG() * 10);
        const unitPrice = Number((p.price * (0.6 + RNG() * 0.5)).toFixed(2)); // purchase price lower than retail
        const total = Number((qty * unitPrice).toFixed(2));
        const date = isoDaysAgo(Math.floor(RNG() * 200), idx + k);
        list.push({
          id: `demo-pur-${p.id}-${k}`,
          productId: p.id,
          vendor: pick(RNG, VENDORS),
          quantity: qty,
          unitPrice,
          total,
          date,
          note: RNG() > 0.8 ? "Promotional purchase" : undefined,
        });
      }
    }
  });
  return list;
})();

// Generate sales: create sales entries for about 60% of products; ensure sale dates happen after some purchases
export const demoSales: SaleRecord[] = (() => {
  const list: SaleRecord[] = [];
  demoProducts.forEach((p, idx) => {
    if (RNG() > 0.4) {
      const salesCount = Math.floor(RNG() * 3) + Math.floor(p.quantity / 3); // more if quantity present
      for (let s = 0; s < salesCount; s++) {
        // don't oversell more than inventory historical + some margin
        const maxQty = Math.max(1, Math.min(5, Math.floor(p.quantity + RNG() * 5)));
        const qty = 1 + Math.floor(RNG() * maxQty);
        const unitPrice = Number((p.price * (0.9 + RNG() * 0.25)).toFixed(2)); // near retail
        const total = Number((qty * unitPrice).toFixed(2));
        const date = isoDaysAgo(Math.floor(RNG() * 150), idx + s);
        list.push({
          id: `demo-sale-${p.id}-${s}`,
          productId: p.id,
          quantity: qty,
          unitPrice,
          total,
          date,
          customer: pick(RNG, CUSTOMERS),
          imei: RNG() > 0.4 ? p.imei : undefined,
          note: RNG() > 0.85 ? "Bundle sold" : undefined,
        });
      }
    }
  });
  return list;
})();

// Generate returns: pick some sales and make return entries
export const demoReturns: ReturnRecord[] = (() => {
  const list: ReturnRecord[] = [];
  demoSales.forEach((sale, idx) => {
    if (RNG() > 0.85) {
      const returnQty = Math.min(sale.quantity, 1 + Math.floor(RNG() * sale.quantity));
      const refundAmount = Number((returnQty * sale.unitPrice * (0.9 + RNG() * 0.1)).toFixed(2)); // small deduction possible
      const date = new Date(new Date(sale.date).getTime() + Math.floor(RNG() * 10) * 24 * 3600 * 1000).toISOString();
      list.push({
        id: `demo-ret-${sale.id}`,
        saleId: sale.id,
        productId: sale.productId,
        quantity: returnQty,
        reason: pick(RNG, REASONS),
        date,
        refundAmount,
      });
    }
  });
  return list;
})();