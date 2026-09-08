import test from 'node:test';
import assert from 'node:assert/strict';
import { connectWithViewerKey, hasVerifiedViewerKey } from '../miris/viewerKeys.mjs';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const fixtures={viewerKey:'prepared-key',concept:'Recorded creature',stages:[{uuid:A,stage:'egg',prompt:'Recorded egg',dossier:{name:'Recorded',classification:'Crustacean',notes:'Recorded notes',stats:[]}}]};
const asset=(uuid=A,name='01-egg.glb')=>({uuid,name});

test('connecting returns only a preview/proof patch and preserves paid root data',()=>{
  const data={viewerKey:'paid-key',concept:'Paid creature',specimens:[{uuid:B,glb:'paid.glb',dossier:{name:'Paid'}}],zipReady:true,hatchedAt:123,generation:{request:'paid'},workshopAnswers:{design:true}};
  const before=structuredClone(data);
  const patch=connectWithViewerKey(data,' prepared-key ',[asset()],fixtures);
  assert.deepEqual(Object.keys(patch).sort(),['previewSeries','workshopAnswers']);
  assert.deepEqual(data,before);
  const merged={...data,...patch};
  for(const key of ['viewerKey','concept','specimens','zipReady','hatchedAt','generation'])assert.deepEqual(merged[key],before[key]);
  assert.equal(patch.previewSeries.viewerKey,'prepared-key');
  assert.equal(patch.previewSeries.specimens.length,6);
  assert.equal(patch.previewSeries.specimens[0].uuid,A);
  assert.equal(patch.previewSeries.specimens[1].uuid,'');
  assert.deepEqual(patch.workshopAnswers,{design:true,keys:{viewerKey:'prepared-key',uuids:[A]}});
  assert.equal(hasVerifiedViewerKey(merged),true);
});

test('proof requires the exact displayed key and ordered nonempty asset list',()=>{
  const data=connectWithViewerKey({},'key',[asset(),asset(B,'02-larva.glb')],fixtures);
  assert.equal(hasVerifiedViewerKey(data),true);
  assert.equal(hasVerifiedViewerKey({...data,previewSeries:{...data.previewSeries,viewerKey:'other'}}),false);
  assert.equal(hasVerifiedViewerKey({...data,previewSeries:{...data.previewSeries,specimens:[{uuid:B},{uuid:A}]}}),false);
  assert.equal(hasVerifiedViewerKey({...data,previewSeries:{...data.previewSeries,specimens:[{uuid:A}]}}),false);
  assert.equal(hasVerifiedViewerKey({...data,previewSeries:null,viewerKey:'key',specimens:[{uuid:B}]}),false);
  assert.equal(hasVerifiedViewerKey({viewerKey:'key',specimens:[{uuid:A}],workshopAnswers:{keys:true}}),false);
  assert.equal(hasVerifiedViewerKey({viewerKey:'key',specimens:[],workshopAnswers:{keys:{viewerKey:'key',uuids:[]}}}),false);
});

test('invalid keys and malformed, empty, duplicate or excessive asset payloads are rejected',()=>{
  for(const key of ['', '  ', null,42,{},'x'.repeat(2049)])assert.throws(()=>connectWithViewerKey({},key,[asset()],fixtures));
  for(const assets of [null,{},[],[null],[{}],[{uuid:A}],[{uuid:A,name:2}],[{uuid:'not-a-uuid',name:'x'}],[{uuid:A,name:' '}],[asset(),asset()],[asset(),asset(A.toUpperCase())],Array.from({length:7},(_,i)=>asset(`0000000${i}-1111-4111-8111-111111111111`))])assert.throws(()=>connectWithViewerKey({},'key',assets,fixtures));
});

test('UUID matching preserves an existing dossier before borrowing fixture metadata',()=>{
  const dossier={name:'My edited name',classification:'My classification',notes:'My notes',stats:[]};
  const data={specimens:[{uuid:A,stage:'edited stage',prompt:'edited prompt',dossier,glb:'paid.glb'}]};
  const {previewSeries}=connectWithViewerKey(data,'key',[asset()],fixtures);
  assert.deepEqual(previewSeries.specimens[0].dossier,dossier);
  assert.equal(previewSeries.specimens[0].stage,'edited stage');
  assert.equal(previewSeries.specimens[0].glb,'');
});

test('fixture dossiers follow matching UUIDs instead of list position',()=>{
  const {previewSeries}=connectWithViewerKey({},'key',[asset(B,'Unrelated upload'),asset(A,'Renamed egg')],fixtures);
  assert.equal(previewSeries.specimens[1].dossier.name,'Recorded');
  assert.equal(previewSeries.specimens[1].stage,'egg');
  assert.equal(previewSeries.specimens[0].dossier.name,'Unrelated upload');
  assert.notEqual(previewSeries.specimens[0].dossier.classification,'Crustacean');
});

test('own uploads get a usable minimal dossier and client metadata is ignored',()=>{
  const {previewSeries}=connectWithViewerKey({},'key',[{...asset(B,'Copper heron.glb'),dossier:{name:'Injected'},glb:'injected.glb',stage:'Injected'}],fixtures);
  const specimen=previewSeries.specimens[0];
  assert.equal(specimen.dossier.name,'Copper heron');
  assert.equal(typeof specimen.dossier.classification,'string');
  assert.equal(typeof specimen.dossier.notes,'string');
  assert.ok(Array.isArray(specimen.dossier.stats));
  assert.equal(specimen.glb,'');
  assert.notEqual(specimen.stage,'Injected');
});

test('generation dossiers require both the archive index and exact stage filename',()=>{
  const dossier={name:'Generated bird',notes:'Generated notes',stats:[]};
  const data={workshopPath:'generate',specimens:[{uuid:'',stage:'Young bird',dossier,glb:'paid.glb'}]};
  assert.deepEqual(connectWithViewerKey(data,'key',[asset(B,'01-young-bird.glb')],fixtures).previewSeries.specimens[0].dossier,dossier);
  for(const name of ['02-young-bird.glb','01-unrelated.glb','Young bird'])assert.notEqual(connectWithViewerKey(data,'key',[asset(B,name)],fixtures).previewSeries.specimens[0].dossier.name,'Generated bird');
  assert.notEqual(connectWithViewerKey({...data,workshopPath:'own'},'key',[asset(B,'01-young-bird.glb')],fixtures).previewSeries.specimens[0].dossier.name,'Generated bird');
});
