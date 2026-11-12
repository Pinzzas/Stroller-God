import { TILE_SYMBOLS, WALKABLE_TILES, SIGN_TYPES, ITEM_TYPES, HAZARD_KINDS, TRIGGER_RADIUS_TILES } from '../config.js';

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
  if (json.items !== undefined) {
    const items = json.items;
    if (items === null || typeof items !== 'object' || Array.isArray(items)) {
      problems.push('"items" must be a list of item counts');
    } else {
      for (const [key, count] of Object.entries(items)) {
        if (!ITEM_TYPES.includes(key)) problems.push(`Unknown item type "${key}"`);
        else if (!Number.isInteger(count) || count < 0) problems.push(`Item count for "${key}" must be a whole number, 0 or more`);
      }
    }
  }
  if (json.hazards !== undefined) checkHazards(json, problems);
  return problems;
}

function isWhole(n) {
  return Number.isInteger(n);
}

function insideGrid(json, col, row) {
  return isWhole(col) && isWhole(row) && col >= 0 && col < json.cols && row >= 0 && row < json.rows;
}

function tileName(json, col, row) {
  return TILE_SYMBOLS[json.tiles[row][col]];
}

function checkHazards(json, problems) {
  if (!Array.isArray(json.hazards)) {
    problems.push('"hazards" must be a list');
    return;
  }
  const ids = new Set();
  const used = new Set();
  json.hazards.forEach((hazard, i) => {
    const label = `Hazard ${i + 1}`;
    if (typeof hazard.id !== 'string' || hazard.id === '') problems.push(`${label} has no id`);
    else if (ids.has(hazard.id)) problems.push(`${label}: id "${hazard.id}" is used twice`);
    else ids.add(hazard.id);
    const kind = HAZARD_KINDS[hazard.kind];
    if (kind === undefined) {
      problems.push(`${label} has unknown kind "${hazard.kind}"`);
      return;
    }
    if (kind.type === 'roaming') {
      checkRoute(json, hazard, label, problems);
      return;
    }
    if (!insideGrid(json, hazard.col, hazard.row)) {
      problems.push(`${label} needs a whole-number col and row inside the grid`);
      return;
    }
    const name = tileName(json, hazard.col, hazard.row);
    if (kind.type === 'static' && name !== 'path') problems.push(`${label} (${hazard.kind}) must sit on a plain path tile`);
    if (kind.type !== 'static' && name !== 'grass') problems.push(`${label} (${hazard.kind}) must sit on a grass tile`);
    if (kind.type === 'triggered' && !walkableNear(json, hazard.col, hazard.row)) {
      problems.push(`${label} (${hazard.kind}) has no path within ${TRIGGER_RADIUS_TILES} tiles, so it could never go off`);
    }
    if (kind.type === 'timed' && (!isWhole(hazard.atMs) || hazard.atMs < 0)) {
      problems.push(`${label} (${hazard.kind}) needs "atMs" as a whole number, 0 or more`);
    }
    const key = `${hazard.col},${hazard.row}`;
    if (used.has(key)) problems.push(`${label} shares tile ${key} with another hazard`);
    used.add(key);
  });
}

function walkableNear(json, col, row) {
  for (let r = row - TRIGGER_RADIUS_TILES; r <= row + TRIGGER_RADIUS_TILES; r++) {
    for (let c = col - TRIGGER_RADIUS_TILES; c <= col + TRIGGER_RADIUS_TILES; c++) {
      if (isWalkable(json.tiles, c, r)) return true;
    }
  }
  return false;
}

function checkRoute(json, hazard, label, problems) {
  const route = hazard.route;
  if (!Array.isArray(route) || route.length < 2) {
    problems.push(`${label} (${hazard.kind}) needs a route of at least 2 tiles`);
    return;
  }
  route.forEach((tile, i) => {
    if (!tile || !insideGrid(json, tile.col, tile.row)) {
      problems.push(`${label} route tile ${i + 1} is outside the grid`);
    } else if (i > 0 && route[i - 1] && insideGrid(json, route[i - 1].col, route[i - 1].row)) {
      const gap = Math.abs(tile.col - route[i - 1].col) + Math.abs(tile.row - route[i - 1].row);
      if (gap !== 1) problems.push(`${label} route step ${i + 1} must move exactly one tile up, down, left or right`);
    }
  });
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
