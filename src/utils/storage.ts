import { sampleTrades } from '../data/sampleTrades';
import type { Trade } from '../types';

export const STORAGE_KEY = 'trade-review-mvp:v1';

export const loadTrades = (): Trade[] => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveTrades(sampleTrades);
    return sampleTrades;
  }

  try {
    const parsed = JSON.parse(raw) as Trade[];
    return Array.isArray(parsed) ? parsed : sampleTrades;
  } catch {
    return sampleTrades;
  }
};

export const saveTrades = (trades: Trade[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
};

export const resetTrades = () => {
  saveTrades(sampleTrades);
  return sampleTrades;
};
