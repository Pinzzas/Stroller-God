import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseLevel } from '../src/logic/parseLevel.js';
import { updateHazards } from '../src/logic/hazards.js';
import { pressGesture, selectItem, dropTargets, dropItem } from '../src/logic/items.js';
import * as C from '../src/config.js';

const load = (name) => JSON.parse(readFileSync(new URL(`../levels/${name}.json`, import.meta.url), 'utf8'));
const L1 = parseLevel(load('level-01'));
const L3 = parseLevel(load('level-03'));
const T = {
  warningMs: C.HAZARD_WARNING_MS,
  timedActiveMs: C.TIMED_ACTIVE_MS,
  triggerRadius: C.TRIGGER_RADIUS_TILES,
  warningRadius: C.TRIGGER_WARNING_RADIUS_TILES,
  roamSpeed: C.ROAM_SPEED,
};
const S = (t) => updateHazards(L1.hazards, C.HAZARD_KINDS, null, t, L1.start, T);
const K = C.HAZARD_KINDS;
const full = { plank: 2, speaker: 1, shh: 1 };
const targets = (states, fixed) => dropTargets(L1.hazards, K, states, fixed);

test('config: TAP_MOVE_TOLERANCE_PX is 12', () => {
  assert.equal(C.TAP_MOVE_TOLERANCE_PX, 12);
});

test('AC26: pressGesture tap and drag examples', () => {
  assert.equal(pressGesture(0, 0, 12), 'tap');
  assert.equal(pressGesture(12, 0, 12), 'tap');
  assert.equal(pressGesture(9, 9, 12), 'drag');
  assert.equal(pressGesture(0, 13, 12), 'drag');
});
test('AC26 edge: exactly 12 px is a tap in any direction, just over is a drag', () => {
  assert.equal(pressGesture(0, 12, 12), 'tap');
  assert.equal(pressGesture(-12, 0, 12), 'tap');
  assert.equal(pressGesture(0, -12, 12), 'tap');
  assert.equal(pressGesture(3, 4, 5), 'tap'); // exactly 5 on the diagonal
  assert.equal(pressGesture(12.01, 0, 12), 'drag');
  assert.equal(pressGesture(-13, 0, 12), 'drag');
});
test('AC26: pressGesture works with the config tolerance', () => {
  const t = C.TAP_MOVE_TOLERANCE_PX;
  assert.equal(pressGesture(t, 0, t), 'tap');
  assert.equal(pressGesture(t + 1, 0, t), 'drag');
});

test('AC27: selectItem selects, unselects and switches', () => {
  assert.equal(selectItem(null, full, 'plank'), 'plank');
  assert.equal(selectItem('plank', full, 'plank'), null);
  assert.equal(selectItem('plank', full, 'shh'), 'shh');
});
test('AC27: selectItem with a count-0 item changes nothing', () => {
  const s = { plank: 0, speaker: 1, shh: 1 };
  assert.equal(selectItem(null, s, 'plank'), null);
  assert.equal(selectItem('shh', s, 'plank'), 'shh');
});
test('AC27 edge: tapping the selected item unselects even when its count is 0', () => {
  const s = { plank: 0, speaker: 1, shh: 1 };
  assert.equal(selectItem('plank', s, 'plank'), null);
});
test('AC27 edge: all counts 0 never selects; unknown item changes nothing', () => {
  const zero = { plank: 0, speaker: 0, shh: 0 };
  for (const item of C.ITEM_TYPES) assert.equal(selectItem(null, zero, item), null);
  assert.equal(selectItem('plank', full, 'towel'), 'plank');
});
test('AC27: selectItem does not change its inputs', () => {
  const s = { plank: 0, speaker: 1, shh: 1 };
  const before = JSON.stringify(s);
  selectItem('shh', s, 'plank');
  selectItem(null, s, 'speaker');
  assert.equal(JSON.stringify(s), before);
});

test('AC28: dropTargets lists the three level 1 hazards in level order', () => {
  const expected = L1.hazards.map((h) => h.id);
  // The level file lists bells, neighbour, cobbles (spec text says cobbles first: spec wording slip).
  assert.deepEqual(targets(S(0), []), ['bells-1', 'neighbour-1', 'cobbles-1']);
  assert.deepEqual(targets(S(0), []), expected);
});
test('AC28: fixed hazards are not targets', () => {
  assert.deepEqual(targets(S(0), ['cobbles-1']), ['bells-1', 'neighbour-1']);
});
test('AC28: done hazards are not targets', () => {
  assert.deepEqual(targets(S(10000), []), ['neighbour-1', 'cobbles-1']);
});
test('AC28 edge: finished and fixed together leave only the rest; all fixed gives none', () => {
  assert.deepEqual(targets(S(10000), ['cobbles-1']), ['neighbour-1']);
  assert.deepEqual(targets(S(0), ['cobbles-1', 'neighbour-1', 'bells-1']), []);
});
test('AC28 edge: warning and active hazards are still targets', () => {
  assert.ok(targets(S(3000), []).includes('bells-1'));
  assert.ok(targets(S(6000), []).includes('bells-1'));
});
test('AC28 edge: roaming hazards on level 3 are never targets', () => {
  const states = updateHazards(L3.hazards, K, null, 0, L3.start, T);
  const list = dropTargets(L3.hazards, K, states, []);
  for (const id of list) {
    const h = L3.hazards.find((x) => x.id === id);
    assert.notEqual(K[h.kind].type, 'roaming');
  }
});
test('AC28: dropTargets does not change its inputs', () => {
  const states = S(0);
  const fixed = ['cobbles-1'];
  const before = JSON.stringify([L1.hazards, states, fixed]);
  dropTargets(L1.hazards, K, states, fixed);
  assert.equal(JSON.stringify([L1.hazards, states, fixed]), before);
});

test('AC30: a tap-drop is dropItem with the selected item and tapped tile', () => {
  const selected = selectItem(null, full, 'plank');
  const right = dropItem(L1.hazards, K, S(0), [], full, selected, 13, 4);
  assert.equal(right.result, 'right');
  assert.equal(right.hazardId, 'cobbles-1');
  assert.deepEqual(right.supply, { plank: 1, speaker: 1, shh: 1 });
  const wrong = dropItem(L1.hazards, K, S(0), [], full, selected, 5, 3);
  assert.equal(wrong.result, 'wrong');
  assert.deepEqual(wrong.fixedIds, []);
});
test('AC30: tapping a tile with no target uses nothing', () => {
  const res = dropItem(L1.hazards, K, S(0), [], full, 'plank', 0, 0);
  assert.equal(res.result, 'none');
  assert.deepEqual(res.supply, full);
});
test('AC30 edge: tapping a finished hazard uses nothing', () => {
  const res = dropItem(L1.hazards, K, S(10000), [], full, 'speaker', 5, 3);
  assert.equal(res.result, 'none');
  assert.deepEqual(res.supply, full);
});
test('AC29/30: after the last item is used it can no longer be selected', () => {
  const one = { plank: 1, speaker: 0, shh: 0 };
  const res = dropItem(L1.hazards, K, S(0), [], one, 'plank', 13, 4);
  assert.deepEqual(res.supply, { plank: 0, speaker: 0, shh: 0 });
  assert.equal(selectItem(null, res.supply, 'plank'), null);
});
test('AC29: outlines shrink as hazards get fixed by tap-drops', () => {
  const res = dropItem(L1.hazards, K, S(0), [], full, 'plank', 13, 4);
  assert.deepEqual(targets(S(0), res.fixedIds), ['bells-1', 'neighbour-1']);
});
