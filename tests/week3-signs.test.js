import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { parseLevel } from '../src/logic/parseLevel.js';
import { validateLevel } from '../src/logic/validateLevel.js';
import { findPath } from '../src/logic/findPath.js';
import { isJunction, findRoute, reroute } from '../src/logic/route.js';
import { signAt, canPlaceSign, placeSign, rotateArrow, pickUpSign, pressKind } from '../src/logic/signs.js';
import { stepWalk } from '../src/logic/walking.js';
import { levelIdFromUrl } from '../src/logic/levelChoice.js';
import * as C from '../src/config.js';

const load = (name) => JSON.parse(readFileSync(new URL(`../levels/${name}.json`, import.meta.url), 'utf8'));
const L1 = parseLevel(load('level-01'));
const L3 = parseLevel(load('level-03'));
const full = { arrow: 2, wait: 1 };
const up = { col: 4, row: 5, type: 'arrow', dir: 'up' };
const t = (col, row) => ({ col, row });
const key = (p) => `${p.col},${p.row}`;
const checkRoute = (r) => {
  for (let i = 1; i < r.length; i++) {
    assert.equal(Math.abs(r[i].col - r[i - 1].col) + Math.abs(r[i].row - r[i - 1].row), 1, 'step ' + i);
  }
  assert.equal(new Set(r.map(key)).size, r.length, 'no repeats');
};

test('AC2: findPath on level 1 is unchanged (24 tiles)', () => {
  const p = findPath(L1);
  assert.equal(p.length, 24);
  assert.deepEqual(p[0], t(0, 4));
  assert.deepEqual(p[4], t(3, 3));
  assert.deepEqual(p[23], t(15, 4));
});

test('AC3: isJunction', () => {
  for (const [c, r] of [[4, 5], [11, 5], [11, 2]]) assert.equal(isJunction(L3, c, r), true);
  for (const [c, r] of [[6, 5], [4, 2], [0, 5], [15, 5], [0, 0]]) assert.equal(isJunction(L3, c, r), false);
});

test('AC4: no signs gives 16 tiles along row 5', () => {
  const r = findRoute(L3, []);
  assert.equal(r.length, 16);
  r.forEach((p, i) => assert.deepEqual(p, t(i, 5)));
  assert.deepEqual(findPath(L3), r);
});

test('AC5: up arrow gives the 22 tile loop', () => {
  const r = findRoute(L3, [up]);
  assert.equal(r.length, 22);
  assert.deepEqual(r[5], t(4, 4));
  assert.deepEqual(r[7], t(4, 2));
  assert.deepEqual(r[14], t(11, 2));
  assert.deepEqual(r[15], t(11, 3));
  assert.deepEqual(r[17], t(11, 5));
  assert.deepEqual(r[21], t(15, 5));
  assert.ok(!r.some((p) => key(p) === '12,2'));
  assert.ok(!r.some((p) => key(p) === '10,5'));
  checkRoute(r);
});

test('AC6: arrow into dead end is ignored; backwards and grass arrows give 16 tiles', () => {
  const r = findRoute(L3, [up, { col: 11, row: 2, type: 'arrow', dir: 'right' }]);
  assert.deepEqual(r, findRoute(L3, [up]));
  assert.equal(findRoute(L3, [{ ...up, dir: 'left' }]).length, 16);
  assert.equal(findRoute(L3, [{ ...up, dir: 'down' }]).length, 16);
});

test('AC7: every route is connected with no repeats', () => {
  checkRoute(findRoute(L3, []));
  checkRoute(findRoute(L3, [up]));
  checkRoute(findRoute(L3, [up, { col: 11, row: 2, type: 'arrow', dir: 'right' }]));
  checkRoute(findRoute(L3, [{ ...up, dir: 'left' }]));
  checkRoute(findRoute(L3, [{ ...up, dir: 'down' }]));
});

test('AC8: reroute only counts signs the stroller has not reached', () => {
  const p = findRoute(L3, []);
  assert.equal(reroute(L3, [up], p, 2.5).length, 22);
  assert.equal(reroute(L3, [up], p, 3.99).length, 22);
  assert.deepEqual(reroute(L3, [up], p, 4), p);
  assert.deepEqual(reroute(L3, [up], p, 4.5), p);
  assert.deepEqual(reroute(L3, [], p, 15), p);
});

test('AC9: placeSign arrow', () => {
  assert.deepEqual(placeSign(L3, [], full, 'arrow', 4, 5), { signs: [up], supply: { arrow: 1, wait: 1 } });
  assert.equal(placeSign(L3, [], full, 'arrow', 11, 2).signs[0].dir, 'right');
});

test('AC10: placeSign refusals and wait placement', () => {
  const same = (args, signs = []) => {
    const res = placeSign(L3, signs, args.supply || full, args.type, args.col, args.row);
    assert.deepEqual(res, { signs, supply: args.supply || full });
  };
  same({ type: 'arrow', col: 6, row: 5 });
  for (const [c, r] of [[0, 5], [15, 5], [0, 0]]) {
    same({ type: 'arrow', col: c, row: r });
    same({ type: 'wait', col: c, row: r });
  }
  same({ type: 'arrow', col: 4, row: 5 }, [up]);
  same({ type: 'wait', col: 4, row: 5 }, [up]);
  same({ type: 'wait', col: 6, row: 5, supply: { arrow: 2, wait: 0 } });
  assert.deepEqual(placeSign(L3, [], full, 'wait', 6, 5),
    { signs: [{ col: 6, row: 5, type: 'wait' }], supply: { arrow: 2, wait: 0 } });
  assert.equal(canPlaceSign(L3, [], full, 'wait', 4, 5), true);
});

test('AC11: rotateArrow skips grass', () => {
  let s = [up];
  const dirs = [];
  for (let i = 0; i < 3; i++) { s = rotateArrow(L3, s, 4, 5); dirs.push(s[0].dir); }
  assert.deepEqual(dirs, ['right', 'left', 'up']);
  s = [{ col: 11, row: 2, type: 'arrow', dir: 'right' }];
  dirs.length = 0;
  for (let i = 0; i < 3; i++) { s = rotateArrow(L3, s, 11, 2); dirs.push(s[0].dir); }
  assert.deepEqual(dirs, ['down', 'left', 'right']);
  const none = [{ col: 6, row: 5, type: 'wait' }];
  assert.deepEqual(rotateArrow(L3, none, 6, 5), none);
});

test('AC12: pickUpSign', () => {
  assert.deepEqual(pickUpSign([up], { arrow: 1, wait: 1 }, 4, 5), { signs: [], supply: { arrow: 2, wait: 1 } });
  assert.deepEqual(pickUpSign([up], { arrow: 1, wait: 1 }, 7, 5), { signs: [up], supply: { arrow: 1, wait: 1 } });
  assert.equal(signAt([up], 4, 5).type, 'arrow');
  assert.equal(signAt([up], 5, 5), null);
});

test('AC13: functions do not change their inputs', () => {
  const signs = [{ ...up }, { col: 6, row: 5, type: 'wait' }];
  const supply = { arrow: 1, wait: 0 };
  const path = findRoute(L3, []);
  const before = JSON.stringify([signs, supply, path]);
  placeSign(L3, signs, supply, 'arrow', 11, 2);
  placeSign(L3, signs, supply, 'wait', 8, 5);
  rotateArrow(L3, signs, 4, 5);
  pickUpSign(signs, supply, 4, 5);
  findRoute(L3, signs);
  findRoute(L3, signs, path.slice(0, 3));
  reroute(L3, signs, path, 2.5);
  assert.equal(JSON.stringify([signs, supply, path]), before);
});

test('AC14: stepWalk with wait sign', () => {
  const path = findRoute(L3, []);
  const w = [{ col: 6, row: 5, type: 'wait' }];
  const step = (walker, ms, signs = w) => stepWalk(walker, ms, 1, path, signs, 3000);
  assert.deepEqual(step({ distance: 5.5, waitLeftMs: 0, waitedIndex: 0 }, 1000), { distance: 6, waitLeftMs: 3000, waitedIndex: 6 });
  assert.deepEqual(step({ distance: 6, waitLeftMs: 3000, waitedIndex: 6 }, 1000), { distance: 6, waitLeftMs: 2000, waitedIndex: 6 });
  assert.deepEqual(step({ distance: 6, waitLeftMs: 500, waitedIndex: 6 }, 1000), { distance: 6, waitLeftMs: 0, waitedIndex: 6 });
  assert.deepEqual(step({ distance: 6, waitLeftMs: 0, waitedIndex: 6 }, 500), { distance: 6.5, waitLeftMs: 0, waitedIndex: 6 });
  assert.deepEqual(step({ distance: 5.5, waitLeftMs: 0, waitedIndex: 0 }, 1000, []), { distance: 6.5, waitLeftMs: 0, waitedIndex: 0 });
  assert.deepEqual(step({ distance: 14.5, waitLeftMs: 0, waitedIndex: 0 }, 2000, []), { distance: 15, waitLeftMs: 0, waitedIndex: 0 });
});

test('AC14 edge: a big step over a wait sign still stops on it; two waits stop one at a time', () => {
  const path = findRoute(L3, []);
  const w = [{ col: 6, row: 5, type: 'wait' }, { col: 7, row: 5, type: 'wait' }];
  const a = stepWalk({ distance: 5.5, waitLeftMs: 0, waitedIndex: 0 }, 5000, 1, path, w, 3000);
  assert.deepEqual(a, { distance: 6, waitLeftMs: 3000, waitedIndex: 6 });
  const b = stepWalk({ distance: 6, waitLeftMs: 0, waitedIndex: 6 }, 5000, 1, path, w, 3000);
  assert.deepEqual(b, { distance: 7, waitLeftMs: 3000, waitedIndex: 7 });
});

test('AC15: pressKind', () => {
  assert.equal(pressKind(499, 500), 'tap');
  assert.equal(pressKind(500, 500), 'long');
  assert.equal(pressKind(0, 500), 'tap');
});

test('AC16: levelIdFromUrl', () => {
  const f = (s) => levelIdFromUrl(s, C.LEVEL_IDS, C.DEFAULT_LEVEL_ID);
  assert.equal(f('?level=3'), 'level-03');
  assert.equal(f('?level=1'), 'level-01');
  for (const s of ['', '?level=7', '?level=abc', '?level=', '?other=3']) assert.equal(f(s), 'level-01');
});

test('AC17: validateLevel signs', () => {
  assert.deepEqual(validateLevel(load('level-01')), []);
  assert.deepEqual(validateLevel(load('level-03')), []);
  for (const bad of [{ arrow: -1 }, { arrow: 1.5 }, { arrow: '2' }, { lantern: 1 }]) {
    assert.ok(validateLevel({ ...load('level-03'), signs: bad }).length > 0, JSON.stringify(bad));
  }
  assert.deepEqual(validateLevel({ ...load('level-03'), signs: { arrow: 0, wait: 0 } }), []);
});

test('level-03: details and sign counts', () => {
  assert.deepEqual(L3.start, t(0, 5));
  assert.deepEqual(L3.finish, t(15, 5));
  assert.deepEqual(load('level-03').signs, { arrow: 2, wait: 1 });
});

test('every level file loads, has a route start to finish, and signs are valid', () => {
  const files = readdirSync(new URL('../levels/', import.meta.url)).filter((f) => f.endsWith('.json'));
  assert.ok(files.length >= 2);
  for (const f of files) {
    const json = JSON.parse(readFileSync(new URL(`../levels/${f}`, import.meta.url), 'utf8'));
    assert.deepEqual(validateLevel(json), [], f);
    const lvl = parseLevel(json);
    const r = findPath(lvl);
    assert.deepEqual(r[0], lvl.start, f);
    assert.deepEqual(r[r.length - 1], lvl.finish, f);
    checkRoute(r);
    // Hazards are not in the game yet: every level must at least have a well-formed sign supply.
    for (const [k, n] of Object.entries(json.signs || {})) assert.ok(C.SIGN_TYPES.includes(k) && n >= 0, f);
  }
});

test('config: week 3 values and logic does not import Phaser', () => {
  assert.equal(C.WAIT_SIGN_MS, 3000);
  assert.equal(C.LONG_PRESS_MS, 500);
  assert.deepEqual(C.SIGN_TYPES, ['arrow', 'wait']);
  assert.deepEqual(C.ARROW_DIRECTIONS, ['up', 'right', 'down', 'left']);
  for (const f of readdirSync(new URL('../src/logic/', import.meta.url))) {
    assert.ok(!/phaser/i.test(readFileSync(new URL(`../src/logic/${f}`, import.meta.url), 'utf8')), f);
  }
});
