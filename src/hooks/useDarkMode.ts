import { useEffect, useState } from "react";

const KEY = "ppesh_dark_mode_v1";

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved !== null) return saved === "1";
      // default to system preference
      return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, isDark ? "1" : "0");
    } catch {}
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  return [isDark, setIsDark] as const;
}