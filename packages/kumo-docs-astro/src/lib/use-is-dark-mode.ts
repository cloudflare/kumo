import { useState, useEffect } from "react";

export function getIsDark() {
  if (typeof document === "undefined") return false;

  const root = document.documentElement;

  const mode = root.getAttribute("data-mode");
  if (mode === "dark") return true;
  if (mode === "light") return false;

  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export function useIsDarkMode() {
  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    const root = document.documentElement;

    const update = () => setIsDark(getIsDark());

    // Watch html class changes
    const mo = new MutationObserver(update);
    mo.observe(root, {
      attributes: true,
      attributeFilter: ["data-mode", "class"],
    });

    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (mql) {
      mql.addEventListener("change", update);
    }

    return () => {
      if (mql) {
        mql.removeEventListener("change", update);
      }
      mo.disconnect();
    };
  }, []);

  return isDark;
}
