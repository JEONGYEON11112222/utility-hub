import type { CSSProperties } from "react";

// Full screen always uses the dark palette from app/globals.css, whatever the system theme,
// so the clock reads well on TVs and monitors. Utilities read these variables, so overriding
// them on the fullscreen element re-themes everything inside it.
export const FULLSCREEN_THEME = {
  "--background": "#0b0b0c",
  "--foreground": "#f4f4f5",
  "--surface": "#18181b",
  "--muted-surface": "#27272a",
  "--muted": "#a1a1aa",
  "--border": "#3f3f46",
  "--accent": "#2dd4bf",
  "--accent-strong": "#5eead4",
  "--accent-soft": "#042f2e",
  "--on-accent": "#042f2e",
  "--danger": "#f87171",
} as CSSProperties;
