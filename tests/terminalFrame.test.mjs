import assert from 'node:assert/strict';
import { test } from 'node:test';
import { terminalFrames } from '../miris/terminalFrames.mjs';

test('only a completed frame for the current record can replace the painted terminal', () => {
  const frames = terminalFrames();
  const first = {}, edited = {}, texture = {};
  assert.equal(frames.get(first, 0), null);
  frames.commit(texture, first, 0);
  assert.equal(frames.get(first, 0), texture);
  assert.equal(frames.get(first, 1), null);
  assert.equal(frames.get(edited, 0), null);
  frames.clear();
  assert.equal(frames.get(first, 0), null);
});
