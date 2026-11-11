import { ARROW_DIRECTIONS } from '../config.js';
import { isWalkable, sameTile, tileKey, neighbour, DIRECTION_STEPS } from './grid.js';
import { findRouteSignAt } from './routeSigns.js';

// A path tile with 3 or 4 walkable neighbours. Start and finish never count.
export function isJunction(level, col, row) {
  if (!level.tiles[row] || level.tiles[row][col] !== 'path') return false;
  const count = ARROW_DIRECTIONS.filter((dir) => {
    const next = neighbour(col, row, dir);
    return isWalkable(level, next.col, next.row);
  }).length;
  return count >= 3;
}

// Steps to the finish from every tile that can still reach it without stepping on walked tiles.
function stepsToFinish(level, walkedKeys) {
  const steps = new Map([[tileKey(level.finish.col, level.finish.row), 0]]);
  const todo = [level.finish];
  while (todo.length > 0) {
    const here = todo.shift();
    const hereSteps = steps.get(tileKey(here.col, here.row));
    for (const dir of ARROW_DIRECTIONS) {
      const next = neighbour(here.col, here.row, dir);
      const key = tileKey(next.col, next.row);
      if (steps.has(key) || walkedKeys.has(key) || !isWalkable(level, next.col, next.row)) continue;
      steps.set(key, hereSteps + 1);
      todo.push(next);
    }
  }
  return steps;
}

// Direction of the last step in a path, or null when there has been no step yet.
function lastDirection(path) {
  if (path.length < 2) return null;
  const from = path[path.length - 2];
  const to = path[path.length - 1];
  return ARROW_DIRECTIONS.find((dir) => {
    const step = DIRECTION_STEPS[dir];
    return from.col + step.col === to.col && from.row + step.row === to.row;
  });
}

// Walked tiles followed by the tiles still to walk, ending at the finish.
export function findRoute(level, signs, walked = [level.start]) {
  const path = walked.map((tile) => ({ col: tile.col, row: tile.row }));
  const walkedKeys = new Set(path.map((tile) => tileKey(tile.col, tile.row)));
  while (!sameTile(path[path.length - 1], level.finish)) {
    const here = path[path.length - 1];
    const steps = stepsToFinish(level, walkedKeys);
    let open = ARROW_DIRECTIONS.filter((dir) => {
      const next = neighbour(here.col, here.row, dir);
      return steps.has(tileKey(next.col, next.row)) && !walkedKeys.has(tileKey(next.col, next.row));
    });
    if (open.length === 0) {
      // The finish cannot be reached (a broken level): just keep going while there is a new tile.
      open = ARROW_DIRECTIONS.filter((dir) => {
        const next = neighbour(here.col, here.row, dir);
        return isWalkable(level, next.col, next.row) && !walkedKeys.has(tileKey(next.col, next.row));
      });
      if (open.length === 0) break;
      const next = neighbour(here.col, here.row, open[0]);
      path.push(next);
      walkedKeys.add(tileKey(next.col, next.row));
      continue;
    }
    const arrow = findRouteSignAt(signs, here.col, here.row);
    const straight = lastDirection(path);
    let choice;
    if (arrow && open.includes(arrow.dir)) {
      choice = arrow.dir;
    } else if (straight && open.includes(straight)) {
      choice = straight;
    } else {
      choice = open[0];
      for (const dir of open) {
        const a = neighbour(here.col, here.row, dir);
        const b = neighbour(here.col, here.row, choice);
        if (steps.get(tileKey(a.col, a.row)) < steps.get(tileKey(b.col, b.row))) choice = dir;
      }
    }
    const next = neighbour(here.col, here.row, choice);
    path.push(next);
    walkedKeys.add(tileKey(next.col, next.row));
  }
  return path;
}

// Keeps the path up to the tile the walker is heading to, then plans the rest again.
export function reroute(level, signs, path, distance) {
  const keep = Math.min(Math.floor(distance) + 2, path.length);
  return findRoute(level, signs, path.slice(0, keep));
}
