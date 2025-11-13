export const colors = {
  primaryBg: "#020617", // slate-950 - Main dark background
  secondaryBg: "#0f172a", // slate-900 - Cards and containers
  tertiaryBg: "#1e293b", // slate-800 - Nested elements
  
  accent: "#10b981", // emerald-500 - Primary accent (excellent conditions)
  accentSecondary: "#06b6d4", // cyan-500 - Secondary accent (good conditions)
  accentGradientStart: "#10b981", // emerald-500
  accentGradientEnd: "#0d9488", // teal-600
  
  white: "#ffffff",
  
  textPrimary: "#ffffff", // white - Main text
  textSecondary: "#94a3b8", // slate-400 - Secondary text
  textTertiary: "#64748b", // slate-500 - Tertiary text/hints
  textMuted: "#475569", // slate-600 - Very subtle text
  
  border: "#1e293b", // slate-800 - Default borders
  borderLight: "#334155", // slate-700 - Highlighted borders
  
  success: "#10b981", // emerald-500 - Excellent scores
  info: "#06b6d4", // cyan-500 - Good scores  
  warning: "#0ea5e9", // blue-500 - Fair scores
  neutral: "#64748b", // slate-500 - Low scores
  
  // Icon colors
  iconWind: "#22d3ee", // cyan-400
  iconWaves: "#60a5fa", // blue-400
  iconWater: "#2dd4bf", // teal-400
  iconFish: "#ffffff", // white
  
  // Opacity variants for overlays
  overlay10: "rgba(255, 255, 255, 0.1)",
  overlay20: "rgba(255, 255, 255, 0.2)",
  overlayDark10: "rgba(0, 0, 0, 0.1)",
};

export type AppColor = keyof typeof colors;
