import { normaliseBank } from './specimens.mjs';

export const FLOW_VERSION = 2;
export const activeSeries = (data) => data.previewSeries || data;
const text = (value, min, max, label) => {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) throw new Error(`${label} needs ${min}–${max} characters.`);
  return value.trim();
};
const answer = (data, key, value) => ({ workshopAnswers: { ...data.workshopAnswers, [key]: value } });

function preparedSeries(fixtures) {
  const stages=fixtures.stages;
  if (!fixtures.viewerKey || stages?.length !== 6 || stages.some(s => !s.uuid)) throw new Error('The prepared series is not configured. Ask the presenter for a working scoped viewer key.');
  return { origin: 'prepared', concept: fixtures.concept, viewerKey: fixtures.viewerKey,
    specimens: normaliseBank(stages.map(s => ({ stage:s.stage, prompt:s.prompt, dossier:s.dossier, uuid:s.uuid, status:'live' }))) };
}

export function startWorkshop(data, fixtures, now = Date.now()) {
  if (data.flowVersion === FLOW_VERSION) return { track:'laboratory' };
  const existing = data.viewerKey && data.specimens?.some(s => s.uuid);
  return { track:'laboratory', flowVersion:FLOW_VERSION, step:'1.1', finished:false,
    workshopStartedAt:now, workshopPath:'', workshopAnswers:{},
    previewSeries:existing ? null : preparedSeries(fixtures) };
}

export function usePrepared(data, fixtures) {
  return { workshopPath:'prepared', previewSeries:data.previewSeries?.origin === 'prepared' ? data.previewSeries : preparedSeries(fixtures) };
}

export function chooseSource(data, value, fixtures) {
  if (!['prepared','generate','own'].includes(value)) throw new Error('Choose prepared specimens, generate, or your own uploads.');
  if (value === 'prepared') return usePrepared(data,fixtures);
  const current=activeSeries(data);
  return { workshopPath:value, previewSeries:data.previewSeries || { origin:'previous', concept:current.concept, specimens:current.specimens, viewerKey:current.viewerKey } };
}

export function saveWorkshop(data, key, value) {
  if (['firstStream','tradeoff'].includes(key)) return answer(data,key,text(value,8,1200,'Your observation'));
  if (key === 'attribution') {
    if (value !== 'streaming') throw new Error('Miris processes and streams the assets. Generation and the room interface are separate parts of the experience.');
    return answer(data,key,value);
  }
  if (key === 'design') {
    const title=text(value?.title,2,48,'Laboratory name');
    if (![0.04,0.08,0.16].includes(value?.rotationSpeed) || ![45,55,70].includes(value?.fov)) throw new Error('Choose one of the supplied rotation speeds and lens widths.');
    return { labDesign:{title,rotationSpeed:value.rotationSpeed,fov:value.fov},...answer(data,key,true) };
  }
  if (key === 'story') {
    const index=value?.index;
    if (!Number.isInteger(index) || index<0 || index>5) throw new Error('Choose a capsule from 1 to 6.');
    const name=text(value?.name,2,40,'Specimen name'),notes=text(value?.notes,12,420,'Field observation');
    const current=activeSeries(data),bank=normaliseBank(current.specimens);
    bank[index]={...bank[index],dossier:{ designation:`M-${String(index+1).padStart(2,'0')}`,series:'ARCHIVE',classification:'Workshop specimen',stats:[],...bank[index].dossier,name,notes }};
    return { ...(data.previewSeries ? {previewSeries:{...data.previewSeries,specimens:bank}} : {specimens:bank}),...answer(data,key,{index}) };
  }
  if (key === 'connected') {
    if (!activeSeries(data).viewerKey || !activeSeries(data).specimens?.some(s=>s.uuid)) throw new Error('Connect specimens or choose the prepared series first.');
    if (value !== true) throw new Error('Explore a capsule, then confirm that you could see it.');
    return answer(data,key,true);
  }
  if (key === 'publish') {
    let url;
    try {url=new URL(value?.url);} catch {throw new Error('Paste the full published link, starting with https://.');}
    if (!['https:','http:'].includes(url.protocol) || ['localhost','127.0.0.1','[::1]'].includes(url.hostname) || url.username || url.password) throw new Error('Use a public http or https link, without login details.');
    if (value?.opened !== true) throw new Error('Open your published link in a new tab and check the laboratory before continuing.');
    return { publishedUrl:url.href,...answer(data,key,true) };
  }
  if (key === 'reflection') return answer(data,key,{
    peer:text(value?.peer,8,600,'Your visitor’s observation'),
    miris:text(value?.miris,8,600,'Your explanation of Miris'),
    next:text(value?.next,8,600,'Your next project')
  });
  throw new Error('Unknown workshop activity.');
}

export function checkWorkshop(data, key) {
  if (key === 'source') return ['prepared','generate','own'].includes(data.workshopPath) ? null : 'Choose how you want to get your specimens.';
  if (key === 'publish' && !data.publishedUrl) return 'Publish your lab and save its public link.';
  if (key === 'reflection' && !data.workshopAnswers?.publish) return 'Save and verify your published link before finishing.';
  return data.workshopAnswers?.[key] ? null : 'Complete and save the activity above before continuing.';
}

export const escapeMarkup = (value) => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

export function publishSnapshot(data) {
  const display=activeSeries(data);
  return {track:data.track,concept:display.concept||'',viewerKey:display.viewerKey||'',labDesign:data.labDesign,
    specimens:normaliseBank(display.specimens).map(({id,stage,uuid,dossier})=>({id,stage,uuid,dossier}))};
}
