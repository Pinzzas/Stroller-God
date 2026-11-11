import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_WIDTH, GAME_HEIGHT } from '../src/config.js';

test('game size is 1024 x 576', () => {
  assert.equal(GAME_WIDTH, 1024);
  assert.equal(GAME_HEIGHT, 576);
});
