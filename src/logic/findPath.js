import { WALKABLE_TILES } from '../config.js';

// Neighbour order when a tile has more than one way on: up, right, down, left.
const STEPS = [
  { col: 0, row: -1 },
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: -1, row: 0 },
];

// Every tile from start to finish in walking order. Takes the result of parseLevel.
export function findPath(level) {
  const path = [level.start];
  const seen = new Set([`${level.start.col},${level.start.row}`]);
  let current = level.start;
  while (!(current.col === level.finish.col && current.row === level.finish.row)) {
    let next = null;
    for (const step of STEPS) {
      const col = current.col + step.col;
      const row = current.row + step.row;
      const name = level.tiles[row] && level.tiles[row][col];
      if (name && WALKABLE_TILES.includes(name) && !seen.has(`${col},${row}`)) {
        next = { col, row };
        break;
      }
    }
    if (next === null) break; // dead end: stop instead of looping forever
    seen.add(`${next.col},${next.row}`);
    path.push(next);
    current = next;
  }
  return path;
}
