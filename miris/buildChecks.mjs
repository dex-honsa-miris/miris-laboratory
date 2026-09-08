import ts from 'typescript';
import { readMarker } from './markers.mjs';
import { BUILD_LESSONS, MARKER_FOR } from './snippets.mjs';
export { BUILD_LESSONS } from './snippets.mjs';

const proof = {
  sdk: ['class LaboratoryScene extends MirisScene', 'super', 'viewerKey', 'specimenPosition', 'new LaboratoryScene'],
  room: ['VaultFloor', 'VaultWalkway'],
  capsules: ['VaultCapsule'],
  singleStream: ['mirisStream', 'uuid', 'viewerKey', 'scene . specimenPosition'],
  streams: ['mirisStream', 'uuid', 'viewerKey', 'specimens . map', 'scene . specimenPosition'],
  fit: ['getBounds', 'useFrame', 'multiplyScalar'],
  markup: ['fileMarkup', 'mw-dossier'],
  file: ['useHtmlTexture', 'meshBasicMaterial', 'texture'],
  card: ['Pedestals', 'File', 'fileMarkup'],
  field: ['Fn', 'texture', 'screen', 'time', 'uv'],
  effect: ['ScreenFx', 'glitch'],
  hud: ['LabHud'],
};

// These are source checks; the attendee separately records what they saw after running the change.
export function checkBuildCode(stage, lesson) {
  if (!proof[lesson]) return 'Unknown code exercise.';
  const block = readMarker(stage, MARKER_FOR[lesson]);
  const jsx = ['scene', 'card', 'effect', 'hud'].includes(MARKER_FOR[lesson]);
  const source = ts.createSourceFile('lesson.tsx', jsx ? `const lesson = <>${block}</>;` : block, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const code = ts.createPrinter({ removeComments: true }).printFile(source).replace(/\s+/g, '');
  return proof[lesson].every(part => code.includes(part.replace(/\s+/g, ""))) ? null
    : `Complete the ${lesson} exercise in the miris:${MARKER_FOR[lesson]} block of app/stage.tsx. Imports and commented examples do not count.`;
}

export function checkBuild(stage, lesson, data) {
  return checkBuildCode(stage, lesson) || (data.workshopAnswers?.build?.[lesson] ? null
    : 'Run your change, try the variation, and save what you observed before continuing.');
}

export function checkCompleteBuild(stage, data) {
  for (const lesson of BUILD_LESSONS) {
    const problem = checkBuild(stage, lesson, data);
    if (problem) return problem;
  }
  return null;
}
