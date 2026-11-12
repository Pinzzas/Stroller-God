// Pure item rules: no game engine, no drawing, no timers. No function changes its inputs.

// One count per item type; a missing one is 0.
export function startingItems(levelItems, itemTypes) {
  const supply = {};
  for (const type of itemTypes) supply[type] = (levelItems && levelItems[type]) || 0;
  return supply;
}

// Item types with a count above 0, in itemTypes order.
export function trayItems(supply, itemTypes) {
  return itemTypes.filter((type) => supply[type] > 0);
}

// Centre x of a tray button.
export function traySlotX(index, firstX, spacing) {
  return firstX + index * spacing;
}

// The one item that fixes this kind of hazard, or null for an unknown kind.
export function correctItem(kinds, kind) {
  return kinds[kind] ? kinds[kind].item : null;
}

// The id of the hazard an item can be dropped on at this tile, or null.
// Not roaming, not done, not already fixed.
export function dropTarget(hazards, kinds, states, fixedIds, col, row) {
  for (const hazard of hazards) {
    if (hazard.col !== col || hazard.row !== row) continue;
    if (!kinds[hazard.kind] || kinds[hazard.kind].type === 'roaming') continue;
    if (fixedIds.includes(hazard.id)) continue;
    const state = states.find((s) => s.id === hazard.id);
    if (state && state.state === 'done') continue;
    return hazard.id;
  }
  return null;
}

// Drops one item on a tile. result is 'none', 'right' or 'wrong'.
export function dropItem(hazards, kinds, states, fixedIds, supply, item, col, row) {
  const hazardId = dropTarget(hazards, kinds, states, fixedIds, col, row);
  if (!(supply[item] > 0) || hazardId === null) {
    return { result: 'none', hazardId: null, fixedIds: [...fixedIds], supply: { ...supply } };
  }
  const newSupply = { ...supply, [item]: supply[item] - 1 };
  const hazard = hazards.find((h) => h.id === hazardId);
  if (correctItem(kinds, hazard.kind) === item) {
    return { result: 'right', hazardId, fixedIds: [...fixedIds, hazardId], supply: newSupply };
  }
  return { result: 'wrong', hazardId, fixedIds: [...fixedIds], supply: newSupply };
}

// Copies the hazard states, marking fixed hazards with state 'fixed'.
export function withFixes(states, fixedIds) {
  return states.map((s) => (fixedIds.includes(s.id) ? { ...s, state: 'fixed' } : { ...s }));
}

// How far a shaking hazard is pushed sideways: +px, then -px, changing every stepMs; 0 when over.
export function shakeOffset(elapsedMs, durationMs, px, stepMs) {
  if (elapsedMs < 0 || elapsedMs >= durationMs) return 0;
  return Math.floor(elapsedMs / stepMs) % 2 === 0 ? px : -px;
}
