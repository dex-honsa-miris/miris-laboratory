import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { replaceMarker, readMarker } from '../miris/markers.mjs';
import { SNIPPETS, MARKER_FOR } from '../miris/snippets.mjs';
import { checkBuildCode, BUILD_LESSONS } from '../miris/buildChecks.mjs';

const starter = await readFile(new URL('../miris/stage.template.tsx', import.meta.url), 'utf8');

test('starter requires building; recovery checkpoints satisfy code checks only after installation', () => {
  let stage = starter;
  for (const id of BUILD_LESSONS) {
    assert.ok(checkBuildCode(starter, id), `${id} must not start completed`);
    stage = replaceMarker(stage, MARKER_FOR[id], SNIPPETS[id]);
    assert.equal(checkBuildCode(stage, id), null, `${id} checkpoint must be valid`);
  }
  assert.match(readMarker(stage, 'sdk'), /extends MirisScene/);
  assert.match(readMarker(stage, 'scene'), /scene.specimenPosition/);
  assert.doesNotMatch(readMarker(stage, 'scene'), /DEMO_KEY/);
});

test('imports and commented example code do not count as implementation', () => {
  const commented = replaceMarker(starter, 'sdk', '// class LaboratoryScene extends MirisScene {}');
  assert.ok(checkBuildCode(commented, 'sdk'));
  const imported = replaceMarker(starter, 'scene', '// <mirisStream args={[{uuid: s.uuid, viewerKey: data.viewerKey}]} />');
  assert.ok(checkBuildCode(imported, 'streams'));
});

test('repository starter and reset template remain identical', async () => {
  assert.equal(await readFile(new URL('../app/stage.tsx', import.meta.url), 'utf8'), starter);
});
