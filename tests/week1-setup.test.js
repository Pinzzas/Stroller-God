import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { SQUARE_COLOURS, BG_COLOUR, SQUARE_SIZE } from '../src/config.js';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('vite base path is /Stroller-God/', () => {
  assert.match(read('vite.config.js'), /base:\s*'\/Stroller-God\/'/);
});

test('config colours and sizes match the spec', () => {
  assert.equal(BG_COLOUR, 0xf3ead8);
  assert.equal(SQUARE_SIZE, 128);
  assert.deepEqual(SQUARE_COLOURS, [0x7fb2e5, 0xf2a7a0, 0x9ccf8f, 0xf5d36b]);
});

test('src/logic does not import Phaser', () => {
  for (const f of readdirSync(new URL('../src/logic/', import.meta.url))) {
    if (f.endsWith('.js')) assert.doesNotMatch(read('src/logic/' + f), /phaser/i);
  }
});

test('scene file has no raw numbers other than 0, 1, 2', () => {
  const code = read('src/scenes/SetupScene.js').replace(/'[^']*'/g, '');
  const nums = code.match(/(?<![\w.])\d+(\.\d+)?(?![\w])/g) || [];
  for (const n of nums) assert.ok(['0', '1', '2'].includes(n), 'raw number ' + n);
});

test('workflow runs on main in order: ci, test, build, pages deploy', () => {
  const y = read('.github/workflows/deploy.yml');
  assert.match(y, /branches:\s*\[main\]/);
  const order = ['npm ci', 'npm test', 'npm run build', 'upload-pages-artifact', 'deploy-pages'].map((s) => y.indexOf(s));
  assert.ok(order.every((i) => i >= 0));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test('lockfile exists and .gitignore lists node_modules and dist', () => {
  assert.ok(existsSync(new URL('../package-lock.json', import.meta.url)));
  const g = read('.gitignore').split('\n').map((s) => s.trim());
  assert.ok(g.includes('node_modules/') && g.includes('dist/'));
});
