import { useMemo } from 'react';
import { useMPs } from './useMPs';
import type { SejmMP } from '../types/sejm';

/**
 * Returns a lookup function that finds an MP by full name.
 * Uses the cached MPs list from useMPs (5min deduping).
 */
export function useMPLookup() {
  const { mps } = useMPs();

  const nameMap = useMemo(() => {
    const map = new Map<string, SejmMP>();
    for (const mp of mps) {
      map.set(mp.firstLastName.toLowerCase(), mp);
    }
    return map;
  }, [mps]);

  return {
    findMP: (name: string): SejmMP | undefined =>
      nameMap.get(name.toLowerCase()),
  };
}
