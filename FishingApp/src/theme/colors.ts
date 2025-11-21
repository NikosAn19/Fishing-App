// Full color palette - primary source of truth
export const colorPalette = {
  slate: {
    950: "#020617",
    900: "#0f172a",
    800: "#1e293b",
    700: "#334155",
    500: "#64748b",
    400: "#94a3b8",
    300: "#cbd5e1",
    200: "#e2e8f0",
  },
  emerald: {
    900: "#064e3b",
    500: "#10b981",
    400: "#34d399",
  },
  blue: {
    600: "#2563eb",
    500: "#3b82f6",
    400: "#60a5fa",
  },
  amber: {
    400: "#fbbf24",
  },
  purple: {
    400: "#c084fc",
  },
  indigo: {
    400: "#818cf8",
  },
  teal: {
    400: "#2dd4bf",
  },
  red: {
    400: "#f87171",
    500: "#ef4444",
  },
} as const;

// Semantic color mappings using the palette
export const colors = {
  // Backgrounds
  primaryBg: colorPalette.slate[950],
  secondaryBg: colorPalette.slate[900],
  tertiaryBg: colorPalette.slate[800],

  // Accent colors
  accent: colorPalette.emerald[500],
  accentSecondary: colorPalette.teal[400],
  accentGradientStart: colorPalette.emerald[500],
  accentGradientEnd: colorPalette.emerald[900],

  // Base colors
  white: "#ffffff",

  // Text colors
  textPrimary: "#ffffff",
  textSecondary: colorPalette.slate[400],
  textTertiary: colorPalette.slate[500],
  textMuted: colorPalette.slate[700],

  // Borders
  border: colorPalette.slate[800],
  borderLight: colorPalette.slate[700],

  // Status colors
  success: colorPalette.emerald[500],
  info: colorPalette.blue[500],
  warning: colorPalette.amber[400],
  neutral: colorPalette.slate[500],

  // Icon colors
  iconWind: colorPalette.blue[400],
  iconWaves: colorPalette.blue[400],
  iconWater: colorPalette.teal[400],
  iconFish: "#ffffff",

  // Opacity variants for overlays
  overlay10: "rgba(255, 255, 255, 0.1)",
  overlay20: "rgba(255, 255, 255, 0.2)",
  overlayDark10: "rgba(0, 0, 0, 0.1)",

  // Direct palette access
  palette: colorPalette,
} as const;

export type AppColor = keyof typeof colors;
