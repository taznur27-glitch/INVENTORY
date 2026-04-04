import React, { useState } from "react";
import { QuickAddModal } from "../inventory/QuickAddModal";

export const FABQuickAdd: React.FC<{
  onAdd?: (payload: any) => Promise<void> | void;
  className?: string;
}> = ({ onAdd, className }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`fixed right-4 bottom-4 z-40 ${className ?? ""}`}>
        <button
          aria-label="Quick add product"
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-lg flex items-center justify-center"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <QuickAddModal
        open={open}
        onClose={() => setOpen(false)}
        onAdd={onAdd}
      />
    </>
  );
};