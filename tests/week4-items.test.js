import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseLevel } from '../src/logic/parseLevel.js';
import { validateLevel } from '../src/logic/validateLevel.js';
import { updateHazards } from '../src/logic/hazards.js';
import { startingItems, trayItems, traySlotX, correctItem, dropTarget, dropItem, withFixes } from '../src/logic/items.js';
import * as C from '../src/config.js';

const load = (name) => JSON.parse(readFileSync(new URL(`../levels/${name}.json`, import.meta.url), 'utf8'));
const J1 = load('level-01');
const J3 = load('level-03');
const L1 = parseLevel(J1);
const L3 = parseLevel(J3);
const T = {
  warningMs: C.HAZARD_WARNING_MS,
  timedActiveMs: C.TIMED_ACTIVE_MS,
  triggerRadius: C.TRIGGER_RADIUS_TILES,
  warningRadius: C.TRIGGER_WARNING_RADIUS_TILES,
  roamSpeed: C.ROAM_SPEED,
};
const S = (t) => updateHazards(L1.hazards, C.HAZARD_KINDS, null, t, L1.start, T);
const full = { plank: 2, speaker: 1, shh: 1 };
const K = C.HAZARD_KINDS;
const target = (states, fixed, c, r) => dropTarget(L1.hazards, K, states, fixed, c, r);
const drop = (states, fixed, supply, item, c, r) => dropItem(L1.hazards, K, states, fixed, supply, item, c, r);
const none = (res, fixed, supply) => {
  assert.equal(res.result, 'none');
  assert.equal(res.hazardId, null);
  assert.deepEqual(res.fixedIds, fixed);
  assert.deepEqual(res.supply, supply);
};

test('AC3: startingItems fills missing types with 0', () => {
  assert.deepEqual(startingItems(full, C.ITEM_TYPES), full);
  assert.deepEqual(startingItems(undefined, C.ITEM_TYPES), { plank: 0, speaker: 0, shh: 0 });
  assert.deepEqual(startingItems({ speaker: 1 }, C.ITEM_TYPES), { plank: 0, speaker: 1, shh: 0 });
});
test('AC3: parsed level 1 has the full items, level 3 has zeros', () => {
  assert.deepEqual(L1.items, full);
  assert.deepEqual(L3.items, { plank: 0, speaker: 0, shh: 0 });
});
test('AC4: trayItems lists types with count above 0 in order', () => {
  assert.deepEqual(trayItems(full, C.ITEM_TYPES), ['plank', 'speaker', 'shh']);
  assert.deepEqual(trayItems({ plank: 0, speaker: 1, shh: 0 }, C.ITEM_TYPES), ['speaker']);
  assert.deepEqual(trayItems({ plank: 0, speaker: 0, shh: 0 }, C.ITEM_TYPES), []);
});
test('AC5: traySlotX', () => {
  assert.equal(traySlotX(0, 48, 72), 48);
  assert.equal(traySlotX(2, 48, 72), 192);
  assert.equal(traySlotX(0, C.ITEM_TRAY_FIRST_X, C.ITEM_TRAY_SPACING), 48);
});
test('AC6: correctItem per hazard kind', () => {
  assert.equal(correctItem(K, 'cobbles'), 'plank');
  assert.equal(correctItem(K, 'neighbour'), 'shh');
  assert.equal(correctItem(K, 'bells'), 'speaker');
  assert.equal(correctItem(K, 'pigeons'), 'breadcrumbs');
  assert.equal(correctItem(K, 'vespa'), null);
});
test('AC7: dropTarget finds hazards on their own tile', () => {
  assert.equal(target(S(0), [], 13, 4), 'cobbles-1');
  assert.equal(target(S(0), [], 9, 7), 'neighbour-1');
  assert.equal(target(S(0), [], 5, 3), 'bells-1');
  assert.equal(target(S(0), [], 0, 0), null);
  assert.equal(target(S(0), [], 5, 2), null);
});
test('AC7: a fixed hazard is not a target', () => {
  assert.equal(target(S(0), ['cobbles-1'], 13, 4), null);
});
test('AC7: bells are a target while warning and active, not once done', () => {
  assert.equal(target(S(3000), [], 5, 3), 'bells-1');
  assert.equal(target(S(6000), [], 5, 3), 'bells-1');
  assert.equal(target(S(10000), [], 5, 3), null);
});
test('AC8: roaming hazards are never targets', () => {
  const st = updateHazards(L3.hazards, K, null, 0, L3.start, T);
  assert.equal(dropTarget(L3.hazards, K, st, [], 8, 3), null);
});
test('AC9: right item fixes the hazard', () => {
  const r = drop(S(0), [], full, 'plank', 13, 4);
  assert.equal(r.result, 'right');
  assert.equal(r.hazardId, 'cobbles-1');
  assert.deepEqual(r.fixedIds, ['cobbles-1']);
  assert.deepEqual(r.supply, { plank: 1, speaker: 1, shh: 1 });
});
test('AC10: wrong item is used up, then the right one still works', () => {
  const w = drop(S(0), [], full, 'plank', 5, 3);
  assert.equal(w.result, 'wrong');
  assert.equal(w.hazardId, 'bells-1');
  assert.deepEqual(w.fixedIds, []);
  assert.deepEqual(w.supply, { plank: 1, speaker: 1, shh: 1 });
  const r = drop(S(0), w.fixedIds, w.supply, 'speaker', 5, 3);
  assert.equal(r.result, 'right');
  assert.deepEqual(r.supply, { plank: 1, speaker: 0, shh: 1 });
  assert.equal(drop(S(0), [], full, 'shh', 9, 7).result, 'right');
});
test('AC11: drops that do nothing return unchanged copies', () => {
  none(drop(S(0), [], full, 'plank', 0, 0), [], full);
  const noPlank = { plank: 0, speaker: 1, shh: 1 };
  none(drop(S(0), [], noPlank, 'plank', 13, 4), [], noPlank);
  none(drop(S(0), ['cobbles-1'], full, 'plank', 13, 4), ['cobbles-1'], full);
  none(drop(S(10000), [], full, 'speaker', 5, 3), [], full);
});
test('AC12: withFixes marks only fixed ids', () => {
  const r = withFixes(S(0), ['neighbour-1']);
  const by = (id) => r.find((s) => s.id === id);
  assert.equal(by('neighbour-1').state, 'fixed');
  assert.equal(by('cobbles-1').state, S(0).find((s) => s.id === 'cobbles-1').state);
  assert.equal(by('bells-1').state, S(0).find((s) => s.id === 'bells-1').state);
  assert.deepEqual(withFixes(S(0), []), S(0));
});
test('AC13: no function changes its inputs', () => {
  const states = S(0);
  const fixed = ['cobbles-1'];
  const supply = { ...full };
  const snap = JSON.stringify([L1.hazards, states, fixed, supply, K, J1]);
  startingItems(J1.items, C.ITEM_TYPES);
  trayItems(supply, C.ITEM_TYPES);
  correctItem(K, 'bells');
  dropTarget(L1.hazards, K, states, fixed, 5, 3);
  dropItem(L1.hazards, K, states, fixed, supply, 'speaker', 5, 3);
  dropItem(L1.hazards, K, states, [], supply, 'plank', 13, 4);
  withFixes(states, fixed);
  parseLevel(J1);
  assert.equal(JSON.stringify([L1.hazards, states, fixed, supply, K, J1]), snap);
});
test('AC14: validateLevel accepts level 1, level 3 and a level without items', () => {
  assert.deepEqual(validateLevel(J1), []);
  assert.deepEqual(validateLevel(J3), []);
  const { items, ...noItems } = J1;
  assert.deepEqual(validateLevel(noItems), []);
});
for (const [label, bad] of [
  ['an array', []],
  ['a negative count', { plank: -1 }],
  ['a fractional count', { plank: 1.5 }],
  ['a text count', { plank: '2' }],
  ['breadcrumbs', { breadcrumbs: 1 }],
  ['an unknown item', { towel: 1 }],
]) {
  test(`AC14: validateLevel reports items as ${label}`, () => {
    assert.ok(validateLevel({ ...J1, items: bad }).length >= 1);
  });
}
test('AC25: item config values match the spec', () => {
  assert.deepEqual(C.ITEM_TYPES, ['plank', 'speaker', 'shh']);
  assert.equal(C.ITEM_BUTTON_SIZE, 56);
  assert.equal(C.ITEM_TRAY_Y, 544);
  assert.equal(C.ITEM_TRAY_SPACING, 72);
  assert.equal(C.RIGHT_FEEDBACK_MS, 600);
  assert.equal(C.WRONG_FEEDBACK_MS, 600);
  assert.equal(C.WRONG_SHAKE_PX, 6);
  assert.equal(C.WRONG_SHAKE_STEP_MS, 75);
  assert.equal(C.DEPTH_ITEMS, 0.75);
  assert.equal(C.DEPTH_DRAG, 7);
  assert.equal(C.INVALID_TILE_COLOUR, 0xc0504d);
  for (const t of C.ITEM_TYPES) assert.ok(C.ITEM_KINDS[t].width > 0 && C.ITEM_KINDS[t].height > 0);
});
test('AC25: src/logic does not import Phaser', () => {
  const src = readFileSync(new URL('../src/logic/items.js', import.meta.url), 'utf8');
  assert.ok(!/phaser/i.test(src));
});
