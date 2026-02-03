/**
 * Theme tokens for React Native – mirrors app/styles/theme.css.
 * Use these in StyleSheet or components for consistent styling.
 * oklch() values from CSS are approximated to hex for RN compatibility.
 */

export const fontSize = {
  base: 16,
  /** ~0.875rem */
  sm: 14,
  /** ~1rem */
  md: 16,
  /** ~1.125rem */
  lg: 18,
  /** ~1.25rem */
  xl: 20,
  /** ~1.5rem */
  "2xl": 24,
} as const;

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  bold: "700" as const,
};

/** Border radius: 0.625rem base */
export const radius = {
  sm: 6,   // calc(0.625rem - 4px) ≈ 6
  md: 8,   // calc(0.625rem - 2px) ≈ 8
  lg: 10,  // 0.625rem
  xl: 14,  // calc(0.625rem + 4px) ≈ 14
};

/** Light theme (matches :root in theme.css) */
export const light = {
  background: "#ffffff",
  foreground: "#252525",           // oklch(0.145 0 0)
  card: "#ffffff",
  cardForeground: "#252525",
  popover: "#ffffff",
  popoverForeground: "#252525",
  primary: "#030213",
  primaryForeground: "#ffffff",
  secondary: "#f0f1f5",            // oklch(0.95 0.0058 264.53)
  secondaryForeground: "#030213",
  muted: "#ececf0",
  mutedForeground: "#717182",
  accent: "#e9ebef",
  accentForeground: "#030213",
  destructive: "#d4183d",
  destructiveForeground: "#ffffff",
  border: "rgba(0, 0, 0, 0.1)",
  input: "transparent",
  inputBackground: "#f3f3f5",
  switchBackground: "#cbced4",
  ring: "#b5b5b5",                 // oklch(0.708 0 0)
  chart1: "#e07d3a",
  chart2: "#2db8a8",
  chart3: "#3d6bc7",
  chart4: "#e8b84a",
  chart5: "#e09b4a",
  sidebar: "#fafafa",
  sidebarForeground: "#252525",
  sidebarPrimary: "#030213",
  sidebarPrimaryForeground: "#fafafa",
  sidebarAccent: "#f7f7f7",
  sidebarAccentForeground: "#353535",
  sidebarBorder: "#ebebeb",
  sidebarRing: "#b5b5b5",
} as const;

/** Dark theme (matches .dark in theme.css) */
export const dark = {
  background: "#252525",
  foreground: "#fafafa",
  card: "#252525",
  cardForeground: "#fafafa",
  popover: "#252525",
  popoverForeground: "#fafafa",
  primary: "#fafafa",
  primaryForeground: "#353535",
  secondary: "#454545",
  secondaryForeground: "#fafafa",
  muted: "#454545",
  mutedForeground: "#b5b5b5",
  accent: "#454545",
  accentForeground: "#fafafa",
  destructive: "#c42a2a",
  destructiveForeground: "#e85c5c",
  border: "#454545",
  input: "#454545",
  inputBackground: "#454545",
  switchBackground: "#454545",
  ring: "#707070",
  chart1: "#4a5fcf",
  chart2: "#5ec9a0",
  chart3: "#e09b4a",
  chart4: "#c855e0",
  chart5: "#e85c5c",
  sidebar: "#353535",
  sidebarForeground: "#fafafa",
  sidebarPrimary: "#4a5fcf",
  sidebarPrimaryForeground: "#fafafa",
  sidebarAccent: "#454545",
  sidebarAccentForeground: "#fafafa",
  sidebarBorder: "#454545",
  sidebarRing: "#707070",
} as const;

/** Default theme (light). Toggle to dark when you add theme switching. */
export const colors = light;

/** Single export for drop-in use in styles */
export const theme = {
  colors,
  light,
  dark,
  fontSize,
  fontWeight,
  radius,
} as const;

export default theme;
