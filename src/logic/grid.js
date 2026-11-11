import { WALKABLE_TILES } from '../config.js';

// One step for each direction name.
export const DIRECTION_STEPS = {
  up: { col: 0, row: -1 },
  right: { col: 1, row: 0 },
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
};

export function isWalkable(level, col, row) {
  const name = level.tiles[row] && level.tiles[row][col];
  return Boolean(name) && WALKABLE_TILES.includes(name);
}

export function sameTile(a, b) {
  return a.col === b.col && a.row === b.row;
}

export function tileKey(col, row) {
  return `${col},${row}`;
}

// The tile one step away in a direction.
export function neighbour(col, row, dir) {
  const step = DIRECTION_STEPS[dir];
  return { col: col + step.col, row: row + step.row };
}
