import { useEffect, useState, useCallback } from "react";

type Appearance = "light" | "dark" | "system";

export function updateTheme(value: Appearance) {
  if (typeof window === "undefined") return;

  if (value === "system") {
    const isSystemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.documentElement.classList.toggle("dark", isSystemDark);
  } else {
    document.documentElement.classList.toggle("dark", value === "dark");
  }
}

const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const mediaQuery = () => {
  if (typeof window === "undefined") return null;
  return window.matchMedia("(prefers-color-scheme: dark)");
};

const getStoredAppearance = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("appearance") as Appearance | null;
};

const handleSystemThemeChange = () => {
  const current = getStoredAppearance();
  updateTheme(current || "system");
};

export function initializeTheme() {
  if (typeof window === "undefined") return;

  const saved = getStoredAppearance();
  updateTheme(saved || "system");

  mediaQuery()?.addEventListener("change", handleSystemThemeChange);
}

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>("system");

  useEffect(() => {
    const saved = getStoredAppearance();
    if (saved) setAppearance(saved);

    const mql = mediaQuery();
    mql?.addEventListener("change", handleSystemThemeChange);

    return () => mql?.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const updateAppearance = useCallback((value: Appearance) => {
    setAppearance(value);

    localStorage.setItem("appearance", value);
    setCookie("appearance", value);

    updateTheme(value);
  }, []);

  return {
    appearance,
    updateAppearance,
  };
}
