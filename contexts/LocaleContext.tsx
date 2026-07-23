import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { translate, pick, type Lang, type Localized, type StringKey } from '@/lib/i18n';

const STORAGE_KEY = 'namflix.lang';

/** Default to the device language on first run — Arabic device → Arabic app. */
function deviceDefault(): Lang {
  try {
    const code = getLocales()[0]?.languageCode?.toLowerCase();
    return code === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

interface LocaleValue {
  lang: Lang;
  isRTL: boolean;
  /** Translate a chrome string key. */
  t: (key: StringKey) => string;
  /** Resolve a bilingual content value. */
  tc: (value: Localized) => string;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(deviceDefault);

  useEffect(() => {
    // A saved choice always wins over the device default.
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'en' || saved === 'ar') setLangState(saved);
      })
      .catch(() => undefined);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const toggle = useCallback(() => setLang(lang === 'en' ? 'ar' : 'en'), [lang, setLang]);

  const t = useCallback((key: StringKey) => translate(key, lang), [lang]);
  const tc = useCallback((value: Localized) => pick(value, lang), [lang]);

  return (
    <LocaleContext.Provider value={{ lang, isRTL: lang === 'ar', t, tc, setLang, toggle }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
