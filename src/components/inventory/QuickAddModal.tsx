import React, { useState } from "react";
import { useToast } from "../ui/toast";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

export type QuickAddPayload = {
  name: string;
  imei?: string;
  price?: number;
  quantity?: number;
  vendor?: string;
};

export const QuickAddModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onAdd?: (payload: QuickAddPayload) => Promise<void> | void;
}> = ({ open, onClose, onAdd }) => {
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [imei, setImei] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">(1);
  const [vendor, setVendor] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const reset = () => {
    setName(""); setImei(""); setPrice(""); setQuantity(1); setVendor("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      addToast({ type: "error", message: "Please provide a product name." });
      return;
    }
    const payload: QuickAddPayload = {
      name: name.trim(),
      imei: imei.trim() || undefined,
      price: price === "" ? undefined : Number(price),
      quantity: quantity === "" ? undefined : Number(quantity),
      vendor: vendor.trim() || undefined,
    };
    try {
      setLoading(true);
      await onAdd?.(payload);
      addToast({ type: "success", title: "Added", message: `${payload.name} added.` });
      reset();
      onClose();
    } catch (err) {
      console.error(err);
      addToast({ type: "error", title: "Error", message: "Failed to add product." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-lg sm:rounded-lg shadow-lg p-4 sm:p-6 pointer-events-auto"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Quick Add Product</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">IMEI (optional)</span>
            <input
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Price</span>
              <input
                type="number"
                min={0}
                value={price as any}
                onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="0.00"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700 dark:text-slate-200">Qty</span>
              <input
                type="number"
                min={1}
                value={quantity as any}
                onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-slate-700 dark:text-slate-200">Vendor (optional)</span>
            <input
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </label>

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {price !== "" ? formatCurrency(Number(price)) : ""}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};