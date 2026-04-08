export interface ThemeColors {
  bg: string;
  grid: string;
  zero: string;
  text: string;
  textSecondary: string;
}

const LIGHT: ThemeColors = {
  bg: "#ffffff",
  grid: "rgba(0,0,0,0.08)",
  zero: "rgba(0,0,0,0.15)",
  text: "#1a1a2e",
  textSecondary: "#4a4a6a",
};

const DARK: ThemeColors = {
  bg: "#0d0d1a",
  grid: "rgba(255,255,255,0.06)",
  zero: "rgba(255,255,255,0.12)",
  text: "#e8e8f0",
  textSecondary: "#a0a0b8",
};

let currentDark = false;
const listeners: Array<(dark: boolean) => void> = [];

export function isDark(): boolean {
  return currentDark;
}

export function getThemeColors(): ThemeColors {
  return currentDark ? DARK : LIGHT;
}

export function onThemeChange(fn: (dark: boolean) => void): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function toggleTheme(): void {
  currentDark = !currentDark;
  applyTheme();
  localStorage.setItem("theme", currentDark ? "dark" : "light");
  for (const fn of listeners) fn(currentDark);
}

function applyTheme(): void {
  document.documentElement.setAttribute(
    "data-theme",
    currentDark ? "dark" : "light",
  );
}

export function initTheme(): void {
  const stored = localStorage.getItem("theme");
  if (stored) {
    currentDark = stored === "dark";
  } else {
    currentDark = matchMedia("(prefers-color-scheme: dark)").matches;
  }
  applyTheme();
}
