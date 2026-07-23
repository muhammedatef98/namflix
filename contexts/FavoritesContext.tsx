import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'namflix.favorites';

type FavoritesValue = {
  /** Sound-track ids the user has hearted, most recently added first. */
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY)
      .then((saved) => {
        if (!saved) return;
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
          setFavoriteIds(parsed);
        }
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo<FavoritesValue>(
    () => ({
      favoriteIds,
      isFavorite: (id) => favoriteIds.includes(id),
      toggleFavorite: (id) => {
        setFavoriteIds((prev) => {
          const next = prev.includes(id) ? prev.filter((f) => f !== id) : [id, ...prev];
          AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch(() => undefined);
          return next;
        });
      },
    }),
    [favoriteIds],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
