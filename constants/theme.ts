/**
 * Namflix "True Biological Dark Mode" palette.
 *
 * Reds/ambers carry far less melatonin-suppressing blue content than a
 * standard dark theme. This reduces the blue the UI *draws* — it does NOT
 * eliminate the blue the screen backlight *emits*. Pair with OS Night Shift
 * (iOS) / Night Light (Android) for the color-temperature shift no app can do.
 */
export const NightPalette = {
  voidBlack: '#0A0503', // near-black, warm-biased
  deepEmber: '#1A0D06',
  surface: '#241109',
  amber: '#C24E1A', // primary accent
  warmRed: '#8C2A12',
  dimText: '#7A4A33',
  textPrimary: '#D98B5A', // warm, never white
} as const;

export type NightPalette = typeof NightPalette;

/**
 * Tajawal — a warm, geometric Arabic typeface that reads comfortably in long
 * passages and carries clean Latin glyphs too, so one family serves both
 * languages. Loaded in the root layout; `Tajawal_400Regular` is set as the
 * global default so every screen is comfortable to read in Arabic.
 */
export const FONT = {
  light: 'Tajawal_300Light',
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
  black: 'Tajawal_800ExtraBold',
} as const;

/**
 * Display face reserved for the "Namflix" wordmark only. Fraunces is a warm,
 * high-contrast editorial serif with real character — it makes the brand read
 * premium and intentional next to the crescent logo, without touching the
 * Tajawal body text everywhere else.
 */
export const WORDMARK = {
  regular: 'Fraunces_500Medium',
  bold: 'Fraunces_600SemiBold',
} as const;
