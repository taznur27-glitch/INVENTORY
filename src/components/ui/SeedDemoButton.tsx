import React, { useState } from "react";
import { seedDemoData, readDemoDataFromStorage } from "../../utils/seedDemoData";
import { useToast } from "./toast";

export const SeedDemoButton: React.FC<{ className?: string; showDetailed?: boolean }> = ({ className, showDetailed = false }) => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSeed = async (clear = false) => {
    setLoading(true);
    try {
      const report = await seedDemoData(clear);
      if (report.skippedBecauseExisting && !clear) {
        addToast({ type: "info", title: "Demo data", message: "Demo data already exists. Use Clear & Seed to overwrite." });
      } else {
        addToast({ type: "success", title: "Seeded", message: `Products: ${report.productsWritten}, Sales: ${report.salesWritten}` });
      }
      if (showDetailed) {
        // small console dump
        // eslint-disable-next-line no-console
        console.info("Demo storage snapshot:", readDemoDataFromStorage());
      }
    } catch (err) {
      addToast({ type: "error", title: "Seed failed", message: "See console for details." });
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <button
          onClick={() => handleSeed(false)}
          disabled={loading}
          className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Seeding..." : "Seed Demo Data"}
        </button>
        <button
          onClick={() => handleSeed(true)}
          disabled={loading}
          className="px-3 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {loading ? "Seeding..." : "Clear & Seed"}
        </button>
      </div>
    </div>
  );
};