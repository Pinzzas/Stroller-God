import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { parseLevel } from '../src/logic/parseLevel.js';
import { findPath } from '../src/logic/findPath.js';
import {
  walkProgress, pointOnPath, hasArrived, advanceTime, togglePause, toggleSpeed,
} from '../src/logic/walking.js';
import * as C from '../src/config.js';

const level = () => parseLevel(JSON.parse(readFileSync(new URL('../levels/level-01.json', import.meta.url), 'utf8')));
const path = () => findPath(level());
const key = (p) => `${p.col},${p.row}`;

// AC2
test('AC2: level-01 path has 24 tiles with the expected key tiles', () => {
  const p = path();
  assert.equal(p.length, 24);
  assert.deepEqual(p[0], { col: 0, row: 4 });
  assert.deepEqual(p[1], { col: 1, row: 4 });
  assert.deepEqual(p[4], { col: 3, row: 3 });
  assert.deepEqual(p[23], { col: 15, row: 4 });
});
test('AC2: every step is one tile up/down/left/right and no tile repeats', () => {
  const p = path();
  for (let i = 1; i < p.length; i++) {
    assert.equal(Math.abs(p[i].col - p[i - 1].col) + Math.abs(p[i].row - p[i - 1].row), 1, 'step ' + i);
  }
  assert.equal(new Set(p.map(key)).size, p.length);
});
test('AC2 edge: path only uses walkable tiles and ends on finish', () => {
  const l = level();
  const p = findPath(l);
  for (const t of p) assert.ok(C.WALKABLE_TILES.includes(l.tiles[t.row][t.col]));
  assert.deepEqual(p[p.length - 1], l.finish);
});
test('AC2 edge: findPath on a dead end stops instead of looping', () => {
  const l = { start: { col: 0, row: 0 }, finish: { col: 5, row: 0 },
    tiles: [['start', 'path', 'grass', 'grass', 'grass', 'finish']] };
  assert.deepEqual(findPath(l), [{ col: 0, row: 0 }, { col: 1, row: 0 }]);
});
test('AC2 edge: with a fork, findPath prefers up, right, down, left', () => {
  const l = { start: { col: 1, row: 1 }, finish: { col: 1, row: 0 },
    tiles: [['grass', 'finish', 'grass'], ['path', 'start', 'path'], ['grass', 'path', 'grass']] };
  assert.deepEqual(findPath(l)[1], { col: 1, row: 0 });
});

// AC3
test('AC3: walkProgress examples', () => {
  assert.equal(walkProgress(0, 1, 24), 0);
  assert.equal(walkProgress(1500, 1, 24), 1.5);
  assert.equal(walkProgress(2000, 0.5, 24), 1);
  assert.equal(walkProgress(30000, 1, 24), 23);
  assert.equal(walkProgress(-100, 1, 24), 0);
});
test('AC3 edge: walkProgress exactly at the end and at 2x speed', () => {
  assert.equal(walkProgress(23000, 1, 24), 23);
  assert.equal(walkProgress(11500, 2, 24), 23);
});

// AC4
test('AC4: pointOnPath examples on level 1', () => {
  const p = path();
  assert.deepEqual(pointOnPath(p, 0), { col: 0, row: 4 });
  assert.deepEqual(pointOnPath(p, 0.5), { col: 0.5, row: 4 });
  assert.deepEqual(pointOnPath(p, 4.5), { col: 3, row: 2.5 });
  assert.deepEqual(pointOnPath(p, 99), { col: 15, row: 4 });
  assert.deepEqual(pointOnPath(p, -1), { col: 0, row: 4 });
});
test('AC4 edge: pointOnPath exactly on the last tile, and parent trail at start', () => {
  const p = path();
  assert.deepEqual(pointOnPath(p, 23), { col: 15, row: 4 });
  assert.deepEqual(pointOnPath(p, 0 - C.PARENT_TRAIL_TILES), { col: 0, row: 4 });
});

// AC5
test('AC5: hasArrived', () => {
  assert.equal(hasArrived(22.9, 24), false);
  assert.equal(hasArrived(23, 24), true);
});
test('AC5 edge: hasArrived at 0 and past the end', () => {
  assert.equal(hasArrived(0, 24), false);
  assert.equal(hasArrived(100, 24), true);
});

// AC13
test('AC13: advanceTime examples', () => {
  assert.equal(advanceTime(1000, 16, 'walking', 1), 1016);
  assert.equal(advanceTime(1000, 16, 'walking', 2), 1032);
  assert.equal(advanceTime(1000, 16, 'paused', 2), 1000);
  assert.equal(advanceTime(1000, 16, 'ready', 1), 1000);
  assert.equal(advanceTime(1000, 16, 'won', 1), 1000);
});

// AC14
test('AC14: togglePause examples', () => {
  assert.equal(togglePause('walking'), 'paused');
  assert.equal(togglePause('paused'), 'walking');
  assert.equal(togglePause('ready'), 'ready');
  assert.equal(togglePause('won'), 'won');
});

// AC15
test('AC15: toggleSpeed examples', () => {
  assert.equal(toggleSpeed(1, 1, 2), 2);
  assert.equal(toggleSpeed(2, 1, 2), 1);
});

// AC16-18 as pure logic
test('AC16: a 5 s pause does not count, arrival at about 28 s', () => {
  let elapsed = 0, state = 'walking', t = 0, arrivedAt = null;
  const frame = 16;
  while (arrivedAt === null && t < 60000) {
    if (t === 8000) state = togglePause(state);
    if (t === 13008) state = togglePause(state); // 5 s later
    elapsed = advanceTime(elapsed, frame, state, 1);
    t += frame;
    if (hasArrived(walkProgress(elapsed, C.WALK_SPEED, 24), 24)) arrivedAt = t;
  }
  assert.ok(Math.abs(arrivedAt - 28000) < 100, 'arrived at ' + arrivedAt);
});
test('AC17: 2x from the start arrives in about 11.5 s', () => {
  let elapsed = 0, t = 0;
  while (!hasArrived(walkProgress(elapsed, C.WALK_SPEED, 24), 24) && t < 60000) {
    elapsed = advanceTime(elapsed, 16, 'walking', C.FAST_SPEED_MULTIPLIER);
    t += 16;
  }
  assert.ok(Math.abs(t - 11500) < 100, 't=' + t);
});
test('AC17 edge: switching speed mid-walk causes no jump in position', () => {
  const p = path();
  const before = walkProgress(5000, C.WALK_SPEED, 24);
  // the speed change itself leaves the walk-clock untouched; only later frames are scaled
  const after = walkProgress(advanceTime(5000, 0, 'walking', 2), C.WALK_SPEED, 24);
  assert.equal(before, after);
  assert.deepEqual(pointOnPath(p, before), pointOnPath(p, after));
});
test('AC18: toggling speed while paused moves nothing, resume uses new speed', () => {
  let m = 1;
  let e = advanceTime(0, 1000, 'walking', m);
  let s = togglePause('walking');
  m = toggleSpeed(m, C.NORMAL_SPEED_MULTIPLIER, C.FAST_SPEED_MULTIPLIER);
  assert.equal(m, 2);
  assert.equal(advanceTime(e, 1000, s, m), e);
  s = togglePause(s);
  assert.equal(s, 'walking');
  assert.equal(advanceTime(e, 1000, s, m), 3000);
});

// AC6/AC12 static checks and config values
test('AC12: week 2 config values match the spec', () => {
  assert.equal(C.WALK_SPEED, 1);
  assert.equal(C.NORMAL_SPEED_MULTIPLIER, 1);
  assert.equal(C.FAST_SPEED_MULTIPLIER, 2);
  assert.equal(C.PARENT_TRAIL_TILES, 0.5);
  assert.equal(C.STROLLER_SIZE, 32);
  assert.equal(C.STROLLER_COLOUR, 0xf2a7c3);
  assert.equal(C.PARENT_SIZE, 24);
  assert.equal(C.PARENT_COLOUR, 0x4a5a7a);
  assert.equal(C.MESSAGE_Y, 64);
  assert.equal(C.START_HINT_TEXT, 'Tap to start walking');
  assert.equal(C.WIN_TEXT, 'Made it to the park bench!');
  assert.equal(C.PAUSE_KEY, 'SPACE');
  assert.equal(C.SPEED_KEY, 'F');
  assert.equal(C.BUTTON_SIZE, 80);
  assert.equal(C.BUTTON_Y, 64);
  assert.equal(C.PAUSE_BUTTON_X, 864);
  assert.equal(C.SPEED_BUTTON_X, 960);
  assert.equal(C.BUTTON_COLOUR, 0xfff7e6);
  assert.equal(C.BUTTON_ACTIVE_COLOUR, 0xf5d36b);
  assert.deepEqual([C.PAUSE_LABEL, C.RESUME_LABEL, C.SPEED_LABEL_NORMAL, C.SPEED_LABEL_FAST], ['II', '>', '1x', '2x']);
});
test('AC12: buttons sit inside the top strip and clear of the path rows', () => {
  const half = C.BUTTON_SIZE / 2;
  assert.ok(C.BUTTON_Y + half <= 2 * C.TILE_SIZE);
  assert.ok(C.SPEED_BUTTON_X + half <= C.GAME_WIDTH);
  assert.ok(C.PAUSE_BUTTON_X + half < C.SPEED_BUTTON_X - half + 1);
});
test('AC12: no logic file imports Phaser', () => {
  for (const f of readdirSync(new URL('../src/logic/', import.meta.url))) {
    if (f.endsWith('.js')) {
      assert.doesNotMatch(readFileSync(new URL('../src/logic/' + f, import.meta.url), 'utf8'), /phaser/i);
    }
  }
});
