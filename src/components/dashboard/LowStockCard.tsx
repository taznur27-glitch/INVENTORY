import React from "react";
import { formatCurrency } from "@/utils/formatCurrency";

export type LowStockItem = {
  id: string | number;
  name: string;
  stock: number;
  threshold?: number;
  price?: number;
};

export const LowStockCard: React.FC<{
  items: LowStockItem[];
  threshold?: number;
  className?: string;
}> = ({ items, threshold = 5, className }) => {
  const low = items.filter((i) => (i.threshold ?? threshold) >= 0 && i.stock <= (i.threshold ?? threshold));

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Low Stock</h4>
        <span className="text-xs text-slate-500 dark:text-slate-300">{low.length} at or below threshold</span>
      </div>

      {low.length === 0 ? (
        <div className="text-sm text-slate-600 dark:text-slate-300">No items low in stock.</div>
      ) : (
        <ul className="space-y-3">
          {low.slice(0, 6).map((it) => (
            <li key={it.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{it.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-300">Stock: {it.stock}</div>
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-200">
                {typeof it.price === "number" ? formatCurrency(it.price) : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};