import { normaliseBank } from './specimens.mjs';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidOf=value=>typeof value==='string'?value.trim().toLowerCase():'';
const titleOf=name=>name.replace(/\.glb$/i,'').replace(/^\d+[-_. ]+/,'').trim()||name;
const archiveName=(stage,index)=>`${String(index+1).padStart(2,'0')}-${stage.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'stage'}`;

export function connectWithViewerKey(data,viewerKey,assets,fixtures) {
  if(typeof viewerKey!=='string'||!viewerKey.trim()||viewerKey.trim().length>2048)throw new Error('Paste a scoped viewer key, then find its accessible assets.');
  if(!Array.isArray(assets)||assets.length<1||assets.length>6)throw new Error('Connect between one and six discovered assets.');
  const key=viewerKey.trim(),seen=new Set();
  const selected=assets.map(asset=>{
    const uuid=uuidOf(asset?.uuid),name=typeof asset?.name==='string'?asset.name.trim():'';
    if(!UUID.test(uuid)||!name||name.length>512)throw new Error('Each discovered asset needs a valid UUID and file name. Find the accessible assets again.');
    if(seen.has(uuid))throw new Error('Each capsule needs a distinct asset UUID. Find the accessible assets again.');
    seen.add(uuid);return {uuid,name};
  });
  const current=data.previewSeries||data;
  const known=[...(Array.isArray(current.specimens)?current.specimens:[]),...(Array.isArray(data.specimens)?data.specimens:[])];
  const recorded=Array.isArray(fixtures?.stages)?fixtures.stages:[];
  const isPrepared=key===fixtures?.viewerKey&&selected.every(asset=>recorded.some(s=>uuidOf(s.uuid)===asset.uuid));
  const specimens=normaliseBank(selected.map(({uuid,name},index)=>{
    const existing=known.find(s=>uuidOf(s?.uuid)===uuid&&s.dossier);
    const fixture=recorded.find(s=>uuidOf(s.uuid)===uuid);
    const generated=data.workshopPath==='generate'&&Array.isArray(data.specimens)
      ?data.specimens.find((s,i)=>!s?.uuid&&s?.dossier&&typeof s.stage==='string'&&name.replace(/\.glb$/i,'')===archiveName(s.stage,i)):null;
    const source=existing||fixture||generated;
    const title=titleOf(name);
    return {uuid,status:'live',stage:source?.stage||title,prompt:source?.prompt||'',dossier:source?.dossier||{
      designation:`M-${String(index+1).padStart(2,'0')}`,series:'ARCHIVE',name:title,classification:'Workshop specimen',status:'STABLE',generation:1,viability:0,stats:[],traits:[],notes:'Add your field observation after exploring this specimen.',
    }};
  }));
  return {previewSeries:{origin:isPrepared?'prepared':'connected',concept:isPrepared?fixtures.concept:(data.workshopPath==='generate'?data.concept||'Connected assets':'Connected assets'),viewerKey:key,specimens},
    workshopAnswers:{...data.workshopAnswers,keys:{viewerKey:key,uuids:selected.map(asset=>asset.uuid)}}};
}

export function hasVerifiedViewerKey(data) {
  const current=data.previewSeries||data,proof=data.workshopAnswers?.keys;
  if(!proof||typeof proof.viewerKey!=='string'||!proof.viewerKey.trim()||proof.viewerKey!==current.viewerKey||!Array.isArray(proof.uuids)||!Array.isArray(current.specimens))return false;
  const uuids=current.specimens.map(s=>s?.uuid).filter(Boolean);
  return uuids.length>0&&uuids.length<=6&&new Set(uuids).size===uuids.length&&uuids.length===proof.uuids.length&&uuids.every((uuid,i)=>typeof uuid==='string'&&UUID.test(uuid)&&uuid===proof.uuids[i]);
}
