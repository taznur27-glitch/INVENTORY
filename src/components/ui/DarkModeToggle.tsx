import React from "react";
import { useDarkMode } from "../../hooks/useDarkMode";

export const DarkModeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <button
      aria-pressed={isDark}
      onClick={() => setIsDark(!isDark)}
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 ${className ?? ""}`}
    >
      {isDark ? (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36-1.42-1.42M7.05 6.05 5.64 4.64m12.02 0l-1.41 1.41M7.05 17.95l-1.41 1.41" />
        </svg>
      )}
      <span className="text-sm">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
};