import { TILE_SYMBOLS, ITEM_TYPES } from '../config.js';
import { startingItems } from './items.js';

// Turns a valid level file into tile names. Call validateLevel first.
export function parseLevel(json) {
  let start = null;
  let finish = null;
  const tiles = json.tiles.map((line, row) =>
    [...line].map((symbol, col) => {
      const name = TILE_SYMBOLS[symbol];
      if (name === 'start') start = { col, row };
      if (name === 'finish') finish = { col, row };
      return name;
    })
  );
  return { id: json.id, name: json.name, cols: json.cols, rows: json.rows, tiles, start, finish, hazards: json.hazards || [], items: startingItems(json.items, ITEM_TYPES) };
}
