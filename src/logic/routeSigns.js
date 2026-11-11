// The arrow sign on a tile, or null. (Wait signs do not steer the route.)
export function findRouteSignAt(signs, col, row) {
  return signs.find((s) => s.type === 'arrow' && s.col === col && s.row === row) || null;
}
