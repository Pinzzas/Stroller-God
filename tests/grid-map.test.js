import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseLevel } from '../src/logic/parseLevel.js';
import { validateLevel } from '../src/logic/validateLevel.js';
import { tileToPixel, pixelToTile } from '../src/logic/tileMath.js';
import { TILE_SIZE, TILE_GAP, GAME_WIDTH, GAME_HEIGHT, WALKABLE_TILES } from '../src/config.js';

const load = () => JSON.parse(readFileSync(new URL('../levels/level-01.json', import.meta.url), 'utf8'));
const withTiles = (tiles, extra = {}) => ({ ...load(), tiles, ...extra });
const blank = () => load().tiles.slice();
const edit = (row, text) => { const t = blank(); t[row] = text; return t; };

// AC2
test('AC2: level-01.json is valid JSON with the right size, start and finish', () => {
  const l = load();
  assert.equal(l.id, 'level-01');
  assert.equal(typeof l.name, 'string');
  assert.equal(l.cols, 16);
  assert.equal(l.rows, 9);
  assert.equal(l.tiles.length, 9);
  assert.ok(l.tiles.every((r) => r.length === 16));
  assert.equal(l.tiles[4][0], 'S');
  assert.equal(l.tiles[4][15], 'F');
});

// AC3
test('AC3: every walkable tile has at most 2 walkable neighbours', () => {
  const t = parseLevel(load()).tiles;
  const ok = (c, r) => t[r] && t[r][c] && WALKABLE_TILES.includes(t[r][c]);
  for (let r = 0; r < t.length; r++) for (let c = 0; c < t[r].length; c++) {
    if (!ok(c, r)) continue;
    const n = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dc, dr]) => ok(c + dc, r + dr)).length;
    assert.ok(n <= 2, `tile ${c},${r} has ${n} neighbours`);
  }
});
test('AC3: start connects to finish (validateLevel has no problems)', () => {
  assert.deepEqual(validateLevel(load()), []);
});
test('AC3 (spec text): level 1 has 22 path tiles', () => {
  const count = load().tiles.join('').split('#').length - 1;
  assert.equal(count, 22);
});
test('AC3 (spec text): rows 0, 1, 7, 8 are all grass', () => {
  const t = load().tiles;
  for (const r of [0, 1, 7, 8]) assert.equal(t[r], '.'.repeat(16));
});

// AC4
test('AC4: parseLevel returns size, 9x16 tile names and key tiles', () => {
  const p = parseLevel(load());
  assert.equal(p.cols, 16);
  assert.equal(p.rows, 9);
  assert.equal(p.tiles.length, 9);
  assert.ok(p.tiles.every((r) => r.length === 16));
  assert.equal(p.tiles[4][0], 'start');
  assert.equal(p.tiles[4][15], 'finish');
  assert.equal(p.tiles[0][0], 'grass');
  assert.equal(p.tiles[4][1], 'path');
  assert.deepEqual(p.start, { col: 0, row: 4 });
  assert.deepEqual(p.finish, { col: 15, row: 4 });
  assert.equal(p.id, 'level-01');
});
test('AC4/edge: parseLevel and validateLevel ignore unknown keys', () => {
  const l = { ...load(), extras: [{ a: 1 }], notes: [] };
  assert.deepEqual(validateLevel(l), []);
  assert.equal(parseLevel(l).cols, 16);
});

// AC5
test('AC5: validateLevel returns [] for level 1', () => assert.deepEqual(validateLevel(load()), []));
test('AC5: wrong number of rows is reported', () => {
  assert.ok(validateLevel(withTiles(blank().slice(0, 8))).length >= 1);
  assert.ok(validateLevel(withTiles([...blank(), '................'])).length >= 1);
});
test('AC5: a row of the wrong length is reported (short and long)', () => {
  assert.ok(validateLevel(withTiles(edit(0, '.'.repeat(15)))).length >= 1);
  assert.ok(validateLevel(withTiles(edit(0, '.'.repeat(17)))).length >= 1);
});
test('AC5: unknown character is reported', () => {
  const m = validateLevel(withTiles(edit(0, 'X...............')));
  assert.ok(m.length >= 1);
  assert.ok(m.some((s) => s.includes('X')));
});
test('AC5: no S is reported', () => {
  assert.ok(validateLevel(withTiles(edit(4, '.###...#...####F'))).length >= 1);
});
test('AC5: two Fs is reported', () => {
  assert.ok(validateLevel(withTiles(edit(0, 'F...............'))).length >= 1);
});
test('AC5: two Ss and no F are reported', () => {
  assert.ok(validateLevel(withTiles(edit(0, 'S...............'))).length >= 1);
  assert.ok(validateLevel(withTiles(edit(4, 'S###...#...####.'+''))).length >= 1);
});
test('AC5: start and finish not connected is reported', () => {
  const m = validateLevel(withTiles(edit(4, 'S###...#...#.##F')));
  assert.ok(m.length >= 1);
  const m2 = validateLevel(withTiles(edit(2, '...####.........')));
  assert.ok(m2.length >= 1);
});
test('AC5/edge: diagonal-only connection is not connected', () => {
  const tiles = ['S...', '.#..', '..#.', '...F'];
  assert.ok(validateLevel({ cols: 4, rows: 4, tiles }).length >= 1);
});
test('AC5/edge: tiny valid level and S next to F are fine', () => {
  assert.deepEqual(validateLevel({ cols: 2, rows: 1, tiles: ['SF'] }), []);
});
test('AC5/edge: missing tiles or null input gives a message, no crash', () => {
  assert.ok(validateLevel({}).length >= 1);
  assert.ok(validateLevel(null).length >= 1);
});
test('AC5/edge: validateLevel does not change its input', () => {
  const l = load();
  const copy = JSON.stringify(l);
  validateLevel(l);
  parseLevel(l);
  assert.equal(JSON.stringify(l), copy);
});

// AC6
test('AC6: tileToPixel gives tile centres', () => {
  assert.deepEqual(tileToPixel(0, 0, 64), { x: 32, y: 32 });
  assert.deepEqual(tileToPixel(15, 8, 64), { x: 992, y: 544 });
});

// AC7
test('AC7: pixelToTile examples from the spec', () => {
  assert.deepEqual(pixelToTile(10, 10, 64, 16, 9), { col: 0, row: 0 });
  assert.deepEqual(pixelToTile(1000, 570, 64, 16, 9), { col: 15, row: 8 });
  assert.equal(pixelToTile(1024, 0, 64, 16, 9), null);
  assert.equal(pixelToTile(-1, 5, 64, 16, 9), null);
});
test('AC7/edge: tile borders and grid edges', () => {
  assert.deepEqual(pixelToTile(0, 0, 64, 16, 9), { col: 0, row: 0 });
  assert.deepEqual(pixelToTile(63, 63, 64, 16, 9), { col: 0, row: 0 });
  assert.deepEqual(pixelToTile(64, 64, 64, 16, 9), { col: 1, row: 1 });
  assert.deepEqual(pixelToTile(1023, 575, 64, 16, 9), { col: 15, row: 8 });
  assert.equal(pixelToTile(0, 576, 64, 16, 9), null);
  assert.equal(pixelToTile(5, -1, 64, 16, 9), null);
  assert.equal(pixelToTile(1024, 576, 64, 16, 9), null);
});
test('AC7/edge: pixelToTile round-trips with tileToPixel for every tile', () => {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 16; c++) {
    const { x, y } = tileToPixel(c, r, 64);
    assert.deepEqual(pixelToTile(x, y, 64, 16, 9), { col: c, row: r });
  }
});

// AC8 / AC11 / AC12 (config and files, no Phaser)
test('AC8: tile square is 62 px and screen is 16x9 tiles', () => {
  assert.equal(TILE_SIZE - TILE_GAP, 62);
  assert.equal(GAME_WIDTH, 1024);
  assert.equal(GAME_HEIGHT, 576);
});
test('AC11: old placeholder files are gone', async () => {
  const { existsSync, readFileSync: rf } = await import('node:fs');
  assert.equal(existsSync(new URL('../src/scenes/SetupScene.js', import.meta.url)), false);
  assert.equal(existsSync(new URL('../src/logic/nextColourIndex.js', import.meta.url)), false);
  const cfg = rf(new URL('../src/config.js', import.meta.url), 'utf8');
  assert.doesNotMatch(cfg, /SQUARE_SIZE|SQUARE_COLOURS|TITLE_/);
  const main = rf(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.doesNotMatch(main, /SetupScene/);
  assert.match(main, /GridScene/);
});
