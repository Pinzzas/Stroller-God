import { findRoute } from './route.js';

// Every tile from start to finish in walking order, with no signs. Takes the result of parseLevel.
export function findPath(level) {
  return findRoute(level, []);
}
