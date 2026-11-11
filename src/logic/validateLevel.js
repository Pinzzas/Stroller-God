import { TILE_SYMBOLS, WALKABLE_TILES, SIGN_TYPES } from '../config.js';

const STEPS = [
  { col: 0, row: -1 },
  { col: 0, row: 1 },
  { col: -1, row: 0 },
  { col: 1, row: 0 },
];

// Returns a list of plain-English problems. An empty list means the level is fine.
export function validateLevel(json) {
  const problems = [];
  if (!json || !Array.isArray(json.tiles)) return ['Level has no tiles list'];
  const { cols, rows, tiles } = json;

  if (tiles.length !== rows) problems.push(`Level has ${tiles.length} rows, expected ${rows}`);

  const starts = [];
  const finishes = [];
  tiles.forEach((line, row) => {
    if (line.length !== cols) problems.push(`Row ${row} has ${line.length} tiles, expected ${cols}`);
    [...line].forEach((symbol, col) => {
      if (!(symbol in TILE_SYMBOLS)) problems.push(`Row ${row} column ${col} has unknown character "${symbol}"`);
      if (TILE_SYMBOLS[symbol] === 'start') starts.push({ col, row });
      if (TILE_SYMBOLS[symbol] === 'finish') finishes.push({ col, row });
    });
  });

  if (starts.length !== 1) problems.push(`Level has ${starts.length} start tiles (S), expected 1`);
  if (finishes.length !== 1) problems.push(`Level has ${finishes.length} finish tiles (F), expected 1`);

  if (starts.length === 1 && finishes.length === 1 && !canWalk(tiles, starts[0], finishes[0])) {
    problems.push('The finish cannot be reached from the start');
  }
  if (json.signs !== undefined) {
    const signs = json.signs;
    if (signs === null || typeof signs !== 'object' || Array.isArray(signs)) {
      problems.push('"signs" must be a list of sign counts');
    } else {
      for (const [key, count] of Object.entries(signs)) {
        if (!SIGN_TYPES.includes(key)) problems.push(`Unknown sign type "${key}"`);
        else if (!Number.isInteger(count) || count < 0) problems.push(`Sign count for "${key}" must be a whole number, 0 or more`);
      }
    }
  }
  return problems;
}

function isWalkable(tiles, col, row) {
  const line = tiles[row];
  if (line === undefined || col < 0 || col >= line.length) return false;
  return WALKABLE_TILES.includes(TILE_SYMBOLS[line[col]]);
}

// Walks up/down/left/right over walkable tiles, looking for the finish.
function canWalk(tiles, start, finish) {
  const seen = new Set([`${start.col},${start.row}`]);
  const todo = [start];
  while (todo.length > 0) {
    const here = todo.pop();
    if (here.col === finish.col && here.row === finish.row) return true;
    for (const step of STEPS) {
      const col = here.col + step.col;
      const row = here.row + step.row;
      const key = `${col},${row}`;
      if (!seen.has(key) && isWalkable(tiles, col, row)) {
        seen.add(key);
        todo.push({ col, row });
      }
    }
  }
  return false;
}
