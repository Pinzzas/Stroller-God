import { ARROW_DIRECTIONS } from '../config.js';
import { isWalkable, neighbour } from './grid.js';
import { isJunction } from './route.js';

export function signAt(signs, col, row) {
  return signs.find((s) => s.col === col && s.row === row) || null;
}

export function canPlaceSign(level, signs, supply, type, col, row) {
  if (!(supply[type] > 0)) return false;
  if (signAt(signs, col, row) !== null) return false;
  if (type === 'arrow') return isJunction(level, col, row);
  if (type === 'wait') return Boolean(level.tiles[row]) && level.tiles[row][col] === 'path';
  return false;
}

function walkableDirection(level, col, row, dir) {
  const next = neighbour(col, row, dir);
  return isWalkable(level, next.col, next.row);
}

export function placeSign(level, signs, supply, type, col, row) {
  if (!canPlaceSign(level, signs, supply, type, col, row)) {
    return { signs: signs.map((s) => ({ ...s })), supply: { ...supply } };
  }
  const sign = { col, row, type };
  if (type === 'arrow') sign.dir = ARROW_DIRECTIONS.find((dir) => walkableDirection(level, col, row, dir));
  return { signs: [...signs.map((s) => ({ ...s })), sign], supply: { ...supply, [type]: supply[type] - 1 } };
}

// Turns the arrow to the next walkable direction, clockwise.
export function rotateArrow(level, signs, col, row) {
  return signs.map((s) => {
    if (s.type !== 'arrow' || s.col !== col || s.row !== row) return { ...s };
    const count = ARROW_DIRECTIONS.length;
    const from = ARROW_DIRECTIONS.indexOf(s.dir);
    for (let k = 1; k <= count; k++) {
      const dir = ARROW_DIRECTIONS[(from + k) % count];
      if (walkableDirection(level, col, row, dir)) return { ...s, dir };
    }
    return { ...s };
  });
}

export function pickUpSign(signs, supply, col, row) {
  const sign = signAt(signs, col, row);
  if (sign === null) return { signs: signs.map((s) => ({ ...s })), supply: { ...supply } };
  return {
    signs: signs.filter((s) => s !== sign).map((s) => ({ ...s })),
    supply: { ...supply, [sign.type]: supply[sign.type] + 1 },
  };
}

export function pressKind(heldMs, longPressMs) {
  return heldMs >= longPressMs ? 'long' : 'tap';
}
