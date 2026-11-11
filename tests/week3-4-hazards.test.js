import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { parseLevel } from '../src/logic/parseLevel.js';
import { validateLevel } from '../src/logic/validateLevel.js';
import { findPath } from '../src/logic/findPath.js';
import { pointOnPath } from '../src/logic/walking.js';
import { tileDistance, timedState, nextTriggeredState, roamPosition, updateHazards } from '../src/logic/hazards.js';
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
const P1 = findPath(L1);
const at = (level, prev, walkMs, stroller) => updateHazards(level.hazards, C.HAZARD_KINDS, prev, walkMs, stroller, T);
const by = (list, id) => list.find((h) => h.id === id);
const withHazards = (hazards, base = J1) => ({ ...base, hazards });
const bad = (hazards, base = J1) => assert.ok(validateLevel(withHazards(hazards, base)).length >= 1);

test('AC1/2: findPath(L1) is still 24 tiles', () => assert.equal(P1.length, 24));

test('AC3: tileDistance', () => {
  assert.equal(tileDistance({ col: 7, row: 3 }, { col: 9, row: 7 }), 4);
  assert.equal(tileDistance({ col: 7, row: 4.5 }, { col: 9, row: 7 }), 2.5);
  assert.equal(tileDistance({ col: 3, row: 3 }, { col: 3, row: 3 }), 0);
});

test('AC4: timedState boundaries', () => {
  const s = (t) => timedState(5000, t, 2500, 4000);
  for (const [t, e] of [[0, 'idle'], [2499, 'idle'], [2500, 'warning'], [4999, 'warning'], [5000, 'active'], [8999, 'active'], [9000, 'done'], [20000, 'done']]) {
    assert.equal(s(t), e, `t=${t}`);
  }
});
test('AC4/edge: timed hazard at atMs 0 never idles past 0', () => {
  assert.equal(timedState(0, 0, 2500, 4000), 'active');
});

test('AC5: nextTriggeredState table', () => {
  const n = (s, d) => nextTriggeredState(s, d, 4, 2);
  assert.equal(n('idle', 5), 'idle');
  assert.equal(n('idle', 4), 'warning');
  assert.equal(n('idle', 1.5), 'active');
  assert.equal(n('warning', 3), 'warning');
  assert.equal(n('warning', 2), 'active');
  assert.equal(n('active', 2), 'active');
  assert.equal(n('active', 2.5), 'done');
  assert.equal(n('done', 0), 'done');
});
test('AC5/edge: warning never goes back to idle; done never reopens', () => {
  assert.equal(nextTriggeredState('warning', 10, 4, 2), 'warning');
  assert.equal(nextTriggeredState('done', 1, 4, 2), 'done');
});

test('AC6: roamPosition', () => {
  const r = [{ col: 8, row: 3 }, { col: 8, row: 4 }, { col: 8, row: 5 }, { col: 8, row: 6 }];
  for (const [ms, c, rw] of [[0, 8, 3], [1500, 8, 4.5], [3000, 8, 6], [4000, 8, 5], [6000, 8, 3], [7500, 8, 4.5], [8000, 8, 5]]) {
    assert.deepEqual(roamPosition(r, ms, 1), { col: c, row: rw }, `ms=${ms}`);
  }
});
test('AC6/edge: roamPosition with a 2-tile route and at the exact last tile', () => {
  const r = [{ col: 1, row: 1 }, { col: 2, row: 1 }];
  assert.deepEqual(roamPosition(r, 1000, 1), { col: 2, row: 1 });
  assert.deepEqual(roamPosition(r, 2000, 1), { col: 1, row: 1 });
  assert.deepEqual(roamPosition(r, 500, 1), { col: 1.5, row: 1 });
});

test('AC7: level 1 neighbour states along the walk', () => {
  let prev = null;
  const seen = {};
  const marks = [9.5, 10, 11.5, 12, 15, 18, 18.5, 23];
  for (let d = 0; d <= 23.0001; d += 0.5) {
    prev = at(L1, prev, d * 1000, pointOnPath(P1, d));
    seen[d] = by(prev, 'neighbour-1').state;
  }
  const want = { 9.5: 'idle', 10: 'warning', 11.5: 'warning', 12: 'active', 15: 'active', 18: 'active', 18.5: 'done', 23: 'done' };
  for (const m of marks) assert.equal(seen[m], want[m], `d=${m}`);
});

test('AC8: level 1 at the start', () => {
  const l = at(L1, null, 0, pointOnPath(P1, 0));
  assert.deepEqual(by(l, 'cobbles-1'), { id: 'cobbles-1', state: 'active', col: 13, row: 4 });
  assert.equal(by(l, 'neighbour-1').state, 'idle');
  assert.equal(by(l, 'bells-1').state, 'idle');
  assert.equal(by(at(L1, null, 6000, pointOnPath(P1, 0)), 'bells-1').state, 'active');
  assert.equal(by(at(L1, null, 10000, pointOnPath(P1, 0)), 'bells-1').state, 'done');
});

test('AC9: level 3 pigeons at 8 s are on (8,5)', () => {
  const p = findPath(L3);
  const h = by(at(L3, null, 8000, pointOnPath(p, 8)), 'pigeons-1');
  assert.deepEqual(h, { id: 'pigeons-1', state: 'active', col: 8, row: 5 });
});

test('AC10: functions do not change their inputs', () => {
  const before = JSON.stringify(J1);
  const raw = load('level-01');
  const prev = at(L1, null, 3000, { col: 7, row: 3 });
  const hz = JSON.stringify(L1.hazards);
  const prevCopy = JSON.stringify(prev);
  const stroller = { col: 7, row: 5 };
  at(L1, prev, 12000, stroller);
  assert.equal(JSON.stringify(prev), prevCopy);
  assert.equal(JSON.stringify(L1.hazards), hz);
  assert.deepEqual(stroller, { col: 7, row: 5 });
  const route = J3.hazards[0].route;
  const rc = JSON.stringify(route);
  roamPosition(route, 4321, 1);
  assert.equal(JSON.stringify(route), rc);
  parseLevel(raw);
  assert.equal(JSON.stringify(raw), before);
});

test('AC11: valid levels have no problems; parseLevel hazards default', () => {
  assert.deepEqual(validateLevel(J1), []);
  assert.deepEqual(validateLevel(J3), []);
  const { hazards, ...none } = J1;
  assert.deepEqual(validateLevel(none), []);
  assert.deepEqual(parseLevel(none).hazards, []);
  assert.equal(parseLevel(J1).hazards.length, 3);
});

const cob = (col, row, id = 'a') => ({ id, kind: 'cobbles', col, row });
const pig = (route) => ({ id: 'p', kind: 'pigeons', route });
test('AC12: hazards not a list', () => assert.ok(validateLevel({ ...J1, hazards: {} }).length >= 1));
test('AC12: missing id', () => bad([{ kind: 'cobbles', col: 13, row: 4 }]));
test('AC12: duplicate id', () => bad([cob(13, 4, 'a'), cob(12, 4, 'a')]));
test('AC12: unknown kind vespa', () => bad([{ id: 'a', kind: 'vespa', col: 13, row: 4 }]));
test('AC12: cobbles on start', () => bad([cob(0, 4)]));
test('AC12: cobbles on grass', () => bad([cob(0, 0)]));
test('AC12: cobbles outside the grid', () => bad([cob(16, 4)]));
test('AC12: fractional col', () => bad([cob(1.5, 4)]));
test('AC12: neighbour on a path tile', () => bad([{ id: 'n', kind: 'neighbour', col: 5, row: 2 }]));
test('AC12: neighbour with no path within 2', () => bad([{ id: 'n', kind: 'neighbour', col: 0, row: 0 }]));
test('AC12: bells without atMs', () => bad([{ id: 'b', kind: 'bells', col: 5, row: 3 }]));
test('AC12: bells with atMs -1', () => bad([{ id: 'b', kind: 'bells', col: 5, row: 3, atMs: -1 }]));
test('AC12: bells with atMs 2.5', () => bad([{ id: 'b', kind: 'bells', col: 5, row: 3, atMs: 2.5 }]));
test('AC12: pigeons with 1-tile route', () => bad([pig([{ col: 8, row: 3 }])], J3));
test('AC12: pigeons route tile outside grid', () => bad([pig([{ col: 8, row: 8 }, { col: 8, row: 9 }])], J3));
test('AC12: pigeons route step of 2 tiles', () => bad([pig([{ col: 8, row: 3 }, { col: 8, row: 5 }])], J3));
test('AC12: two cobbles on the same tile', () => bad([cob(13, 4, 'a'), cob(13, 4, 'b')]));
test('AC12/edge: bells with atMs 0 is allowed', () => {
  assert.deepEqual(validateLevel(withHazards([{ id: 'b', kind: 'bells', col: 5, row: 3, atMs: 0 }])), []);
});
test('AC12/edge: pigeons may share a tile with cobbles (roaming is exempt)', () => {
  assert.deepEqual(validateLevel(withHazards([cob(13, 4), pig([{ col: 13, row: 4 }, { col: 13, row: 3 }])])), []);
});

test('AC18: src/logic does not import Phaser', () => {
  for (const f of readdirSync(new URL('../src/logic/', import.meta.url))) {
    const text = readFileSync(new URL(`../src/logic/${f}`, import.meta.url), 'utf8');
    assert.ok(!/phaser/i.test(text), f);
  }
});
test('AC18: hazard tuning values exist in config', () => {
  assert.deepEqual(C.HAZARD_TYPES, ['static', 'triggered', 'timed', 'roaming']);
  for (const k of Object.values(C.HAZARD_KINDS)) assert.ok(C.HAZARD_TYPES.includes(k.type));
  assert.equal(C.HAZARD_WARNING_MS, 2500);
  assert.equal(C.TIMED_ACTIVE_MS, 4000);
  assert.equal(C.TRIGGER_RADIUS_TILES, 2);
  assert.equal(C.TRIGGER_WARNING_RADIUS_TILES, 4);
  assert.equal(C.DEPTH_HAZARDS, 0.5);
});

// Level file checks for every file in levels/
for (const f of readdirSync(new URL('../levels/', import.meta.url)).filter((n) => n.endsWith('.json'))) {
  const json = load(f.replace('.json', ''));
  test(`${f}: loads and validates`, () => assert.deepEqual(validateLevel(json), []));
  test(`${f}: a route from start to finish exists`, () => {
    const level = parseLevel(json);
    const p = findPath(level);
    assert.deepEqual(p[0], level.start);
    assert.deepEqual(p[p.length - 1], level.finish);
  });
  test(`${f}: every hazard has a valid kind, id and place`, () => {
    const level = parseLevel(json);
    const ids = level.hazards.map((h) => h.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const h of level.hazards) assert.ok(h.kind in C.HAZARD_KINDS);
  });
  test(`${f}: triggered hazards can go off, timed hazards ring before the walk ends`, () => {
    const level = parseLevel(json);
    const p = findPath(level);
    let prev = null;
    const reached = new Set();
    for (let d = 0; d <= p.length - 1; d += 0.25) {
      prev = at(level, prev, d * 1000, pointOnPath(p, d));
      prev.forEach((h) => reached.add(`${h.id}:${h.state}`));
    }
    for (const h of level.hazards) {
      const type = C.HAZARD_KINDS[h.kind].type;
      if (type === 'triggered') assert.ok(reached.has(`${h.id}:active`), `${h.id} never goes off`);
      if (type === 'timed') assert.ok(h.atMs <= (p.length - 1) * 1000, `${h.id} rings after the walk ends`);
    }
  });
}
