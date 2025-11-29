import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { initializeTheme } from "~/composables/useAppearance";
import { themes, applyTheme, type ThemeName } from "~/lib/themes";

interface ThemeContextValue {
  theme: ThemeName | null;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "theme"; // diferente de "appearance"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName | null>(null);

  useEffect(() => {
    // cuida de light/dark baseado em "appearance"
    initializeTheme();

    // restaura palette salva em "theme"
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && saved in themes) {
        const themeName = saved as ThemeName;
        setThemeState(themeName);
        applyTheme(themes[themeName]);
      }
    } catch (err) {
      console.error("Error loading saved theme:", err);
    }
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(themes[next]);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return ctx;
}
