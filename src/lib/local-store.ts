import { useCallback, useEffect, useState } from "react";

/**
 * localStorage-backed state. Reads only after hydration to avoid SSR mismatch.
 */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value, ready]);

  return [value, setValue, ready] as const;
}

export type Profile = {
  name: string;
  allergies: string[];
  diets: string[];
  maxPrice: number;
  city: string;
};

export const DEFAULT_PROFILE: Profile = {
  name: "Camille Duret",
  allergies: [],
  diets: [],
  maxPrice: 4,
  city: "Paris",
};

export type UserReview = {
  id: string;
  restaurantId: string;
  quality: number;
  speed: number;
  ambience: number;
  value: number;
  comment: string;
  date: string;
};

export function useFavorites() {
  const [ids, setIds] = useLocalState<string[]>("ff:favorites", []);
  const toggle = useCallback(
    (id: string) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setIds],
  );
  return { ids, toggle };
}

export function useHistory() {
  const [ids, setIds] = useLocalState<string[]>("ff:history", []);
  const visit = useCallback(
    (id: string) => setIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 30)),
    [setIds],
  );
  return { ids, visit };
}
