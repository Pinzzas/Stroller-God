import test from 'node:test';
import assert from 'node:assert/strict';
import { nextColourIndex } from '../src/logic/nextColourIndex.js';

test('moves to the next colour', () => {
  assert.equal(nextColourIndex(0, 4), 1);
});

test('wraps back to the first colour after the last', () => {
  assert.equal(nextColourIndex(3, 4), 0);
});

test('a single colour stays at 0', () => {
  assert.equal(nextColourIndex(0, 1), 0);
});
