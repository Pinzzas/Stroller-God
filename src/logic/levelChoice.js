import { LEVEL_URL_PARAM } from '../config.js';

// Reads the level number from a link's query text, e.g. '?level=3'.
export function levelIdFromUrl(search, ids, fallback) {
  const value = new URLSearchParams(search).get(LEVEL_URL_PARAM);
  if (value === null || !/^\d+$/.test(value)) return fallback;
  return Object.hasOwn(ids, value) ? ids[value] : fallback;
}
