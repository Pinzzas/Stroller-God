// Pure walking rules: no game engine, no drawing, no timers.

const MS_PER_SECOND = 1000;

// Distance walked in tiles, kept between 0 and the last tile of the path.
export function walkProgress(elapsedMs, speed, pathLength) {
  const distance = (elapsedMs / MS_PER_SECOND) * speed;
  return Math.min(Math.max(distance, 0), pathLength - 1);
}

// Position along the path; can sit between two tiles.
export function pointOnPath(path, distance) {
  const last = path.length - 1;
  if (distance <= 0) return { col: path[0].col, row: path[0].row };
  if (distance >= last) return { col: path[last].col, row: path[last].row };
  const index = Math.floor(distance);
  const part = distance - index;
  const from = path[index];
  const to = path[index + 1];
  return {
    col: from.col + (to.col - from.col) * part,
    row: from.row + (to.row - from.row) * part,
  };
}

// True once the walker has reached the last tile.
export function hasArrived(distance, pathLength) {
  return distance >= pathLength - 1;
}

// Walk-clock after one frame. Only moves while walking.
export function advanceTime(elapsedMs, deltaMs, state, multiplier) {
  if (state !== 'walking') return elapsedMs;
  return elapsedMs + deltaMs * multiplier;
}

// walking <-> paused; any other state is left alone.
export function togglePause(state) {
  if (state === 'walking') return 'paused';
  if (state === 'paused') return 'walking';
  return state;
}

// Switch between normal and fast speed.
export function toggleSpeed(multiplier, normal, fast) {
  return multiplier === normal ? fast : normal;
}

// One frame of walking with wait signs. deltaMs is already multiplied by the speed multiplier.
// walker is { distance, waitLeftMs, waitedIndex }. Returns a new walker.
export function stepWalk(walker, deltaMs, speed, path, signs, waitMs) {
  const { distance, waitLeftMs, waitedIndex } = walker;
  if (waitLeftMs > 0) {
    return { distance, waitLeftMs: Math.max(0, waitLeftMs - deltaMs), waitedIndex };
  }
  const newDistance = Math.min(distance + (deltaMs / MS_PER_SECOND) * speed, path.length - 1);
  for (let i = Math.floor(distance) + 1; i <= Math.floor(newDistance); i++) {
    if (i <= waitedIndex || i <= distance) continue;
    const hasWait = signs.some((s) => s.type === 'wait' && s.col === path[i].col && s.row === path[i].row);
    if (hasWait) return { distance: i, waitLeftMs: waitMs, waitedIndex: i };
  }
  return { distance: newDistance, waitLeftMs: 0, waitedIndex };
}
