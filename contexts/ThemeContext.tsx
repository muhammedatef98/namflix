import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NightPalette } from '@/constants/theme';
import type { Localized } from '@/lib/i18n';

const THEME_KEY = 'namflix.theme';

/**
 * Eye-comfort themes. Every option is a warm, low-blue-light palette — the
 * only thing that changes between them is *how* warm and *how* dim, never the
 * amount of melatonin-suppressing blue (there is none in any of them). The
 * accent stays in the amber→red→gold family, and each theme carries its own
 * warm veil that tints the whole app through WarmthOverlay.
 */
export interface NightTheme {
  id: string;
  label: Localized;
  /** Warm accent for interactive elements (no blue, ever). */
  accent: string;
  /** Full-screen warm veil colour. */
  veil: string;
  /** Baseline warmth added on top of the warmth slider (0..1 of the veil). */
  boost: number;
}

export const THEMES: NightTheme[] = [
  {
    id: 'ember',
    label: { en: 'Ember', ar: 'جَمر' },
    accent: '#C24E1A',
    veil: '#FF6A1A',
    boost: 0,
  },
  {
    id: 'candle',
    label: { en: 'Candlelight', ar: 'ضوء الشمعة' },
    accent: '#B5612A',
    veil: '#FF5410',
    boost: 0.14,
  },
  {
    id: 'rose',
    label: { en: 'Warm rose', ar: 'وردة دافئة' },
    accent: '#B5443B',
    veil: '#F2481E',
    boost: 0.05,
  },
  {
    id: 'dusk',
    label: { en: 'Golden dusk', ar: 'غسق ذهبي' },
    accent: '#A8792F',
    veil: '#E86A20',
    boost: 0.08,
  },
];

const DEFAULT_THEME = THEMES[0];

type ThemeValue = {
  palette: typeof NightPalette;
  /** 0 = full warm brightness, 1 = deepest dim. Ramps up near bedtime. */
  intensity: number;
  setIntensity: (v: number) => void;
  /** The active low-blue comfort theme. */
  theme: NightTheme;
  setThemeId: (id: string) => void;
  /** Convenience: the active theme's accent colour. */
  accent: string;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [intensity, setIntensityRaw] = useState(0.6);
  const [themeId, setThemeIdRaw] = useState<string>(DEFAULT_THEME.id);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((saved) => {
        if (saved && THEMES.some((th) => th.id === saved)) setThemeIdRaw(saved);
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo<ThemeValue>(() => {
    const theme = THEMES.find((th) => th.id === themeId) ?? DEFAULT_THEME;
    return {
      palette: NightPalette,
      intensity,
      setIntensity: (v) => setIntensityRaw(Math.min(1, Math.max(0, v))),
      theme,
      setThemeId: (id) => {
        setThemeIdRaw(id);
        AsyncStorage.setItem(THEME_KEY, id).catch(() => undefined);
      },
      accent: theme.accent,
    };
  }, [intensity, themeId]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
