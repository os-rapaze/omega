export type ThemeName = "omega" | "carboneto" | "sobrio";

export interface Theme {
  id: ThemeName;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    input: string;
    ring: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  omega: {
    id: "omega",
    name: "Ômega",
    description: "Vibrante e energético",
    colors: {
      primary: "oklch(0.65 0.22 45)",
      primaryForeground: "oklch(0.98 0.01 45)",
      background: "oklch(0.12 0.02 45)",
      foreground: "oklch(0.95 0.01 45)",
      card: "oklch(0.18 0.025 45)",
      cardForeground: "oklch(0.95 0.01 45)",
      secondary: "oklch(0.22 0.03 45)",
      secondaryForeground: "oklch(0.95 0.01 45)",
      muted: "oklch(0.25 0.03 45)",
      mutedForeground: "oklch(0.65 0.015 45)",
      accent: "oklch(0.65 0.22 45)",
      accentForeground: "oklch(0.98 0.01 45)",
      border: "oklch(0.25 0.03 45)",
      input: "oklch(0.22 0.03 45)",
      ring: "oklch(0.65 0.22 45)",
    },
  },
  carboneto: {
    id: "carboneto",
    name: "Carboneto",
    description: "Moderno e tecnológico",
    colors: {
      primary: "oklch(0.65 0.25 265)",
      primaryForeground: "oklch(0.98 0.01 265)",
      background: "oklch(0.12 0.02 270)",
      foreground: "oklch(0.95 0.01 265)",
      card: "oklch(0.18 0.025 270)",
      cardForeground: "oklch(0.95 0.01 265)",
      secondary: "oklch(0.22 0.03 270)",
      secondaryForeground: "oklch(0.95 0.01 265)",
      muted: "oklch(0.25 0.03 270)",
      mutedForeground: "oklch(0.65 0.015 265)",
      accent: "oklch(0.65 0.25 265)",
      accentForeground: "oklch(0.98 0.01 265)",
      border: "oklch(0.25 0.03 270)",
      input: "oklch(0.22 0.03 270)",
      ring: "oklch(0.65 0.25 265)",
    },
  },
  sobrio: {
    id: "sobrio",
    name: "Sóbrio",
    description: "Elegante e minimalista",
    colors: {
      primary: "oklch(0.98 0.005 0)",
      primaryForeground: "oklch(0.15 0.005 0)",
      background: "oklch(0.15 0.005 0)",
      foreground: "oklch(0.95 0.005 0)",
      card: "oklch(0.20 0.005 0)",
      cardForeground: "oklch(0.95 0.005 0)",
      secondary: "oklch(0.25 0.005 0)",
      secondaryForeground: "oklch(0.95 0.005 0)",
      muted: "oklch(0.30 0.005 0)",
      mutedForeground: "oklch(0.70 0.005 0)",
      accent: "oklch(0.98 0.005 0)",
      accentForeground: "oklch(0.15 0.005 0)",
      border: "oklch(0.30 0.005 0)",
      input: "oklch(0.25 0.005 0)",
      ring: "oklch(0.98 0.005 0)",
    },
  },
};

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const baseClass = "theme";

  (["omega", "carboneto", "sobrio"] as ThemeName[]).forEach((id) => {
    root.classList.remove(`${baseClass}-${id}`);
  });

  root.classList.add(`${baseClass}-${theme.id}`);
}
