import { useEffect, useRef, useState } from 'react';
import { PORTAL_URL } from './config';
import fixtures from './fixtures.json';
import { connectWithViewerKey, hasVerifiedViewerKey } from './viewerKeys.mjs';

interface Props { data:any; refresh:()=>void|Promise<void>; }
interface Asset { name:string; uuid:string; }
const fileOrder=(name:string)=>Number(name.match(/^\s*(\d+)\s*[-_. ]/)?.[1]??Number.MAX_SAFE_INTEGER);

export default function ViewerKeyLesson({data,refresh}:Props) {
  const verified=hasVerifiedViewerKey(data);
  const [key,setKey]=useState(()=>verified?data.workshopAnswers.keys.viewerKey:'');
  const [found,setFound]=useState<{key:string;assets:Asset[];total:number}|null>(null);
  const [busy,setBusy]=useState<'find'|'save'|null>(null);
  const [error,setError]=useState(''),[message,setMessage]=useState('');
  const version=useRef(0),running=useRef(false);
  const display=data.previewSeries||data;
  const source=JSON.stringify([data.workshopPath,display.viewerKey,display.specimens?.map(s=>s.uuid)]);
  useEffect(()=>{
    version.current++;running.current=false;setFound(null);setBusy(null);setMessage('');
    return ()=>{version.current++;running.current=false;};
  },[source]);

  const editKey=(value:string)=>{
    version.current++;running.current=false;setKey(value);setFound(null);setBusy(null);setError('');setMessage('');
  };
  const find=async()=>{
    if(running.current)return;
    const viewerKey=key.trim();
    if(!viewerKey){setError('Paste a scoped viewer key, or use the workshop viewer key below.');return;}
    const request=++version.current;
    running.current=true;setBusy('find');setFound(null);setError('');setMessage('');
    let scene:import('@miris-inc/three').MirisScene|undefined;
    try {
      const {MirisScene}=await import('@miris-inc/three');
      if(request!==version.current)return;
      scene=new MirisScene({viewerKey});
      await scene.ready;
      if(request!==version.current)return;
      const assets=await scene.fetchAssets();
      if(request!==version.current)return;
      if(!Array.isArray(assets)||!assets.length)throw new Error('That key cannot see any assets. In Miris, scope the viewer key to your assets and wait for upload processing, then try again.');
      const ordered=assets.map(({name,uuid})=>({name,uuid})).sort((a,b)=>fileOrder(String(a.name))-fileOrder(String(b.name))||String(a.name).localeCompare(String(b.name)));
      const selected=ordered.slice(0,6);
      connectWithViewerKey({},viewerKey,selected,fixtures);
      setFound({key:viewerKey,assets:selected,total:assets.length});
    }catch(cause){
      if(request===version.current)setError(`${(cause as Error).message||'Could not discover assets.'} Check the scoped viewer key and try again.`);
    }finally{
      if(scene){
        // This SDK must settle initialization before its scene can be disposed.
        await scene.ready.catch(()=>{});
        try{scene.dispose();}catch(cause){console.warn('Viewer-key discovery scene cleanup failed.',cause);}
      }
      if(request===version.current){running.current=false;setBusy(null);}
    }
  };
  const connect=async()=>{
    if(running.current||!found||found.key!==key.trim())return;
    const request=++version.current;
    running.current=true;setBusy('save');setError('');setMessage('');
    try {
      const response=await fetch('/api/miris',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'workshop',op:'connectKey',viewerKey:found.key,assets:found.assets})});
      if(!response.headers.get('content-type')?.includes('json'))throw new Error('Open the workshop with npm run dev to connect these assets.');
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Could not connect these assets.');
      if(request!==version.current)return;
      await refresh();
      window.dispatchEvent(new Event('miris:refresh'));
      if(request===version.current)setMessage('Connected. Your scene can now stream the assets you inspected.');
    }catch(cause){if(request===version.current)setError((cause as Error).message||'Could not connect these assets.');}
    finally{if(request===version.current){running.current=false;setBusy(null);}}
  };

  return <>
    <p>A scoped viewer key lets the browser discover and stream only the assets it can access. Viewer keys are browser-readable; use a scoped viewer key here, never a private account or service token.</p>
    <p><a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">Open Miris to create and scope a viewer key ↗</a></p>
    <form onSubmit={event=>{event.preventDefault();void find();}}>
      <label className="mw-activity-field">Scoped viewer key<input value={key} onChange={event=>editKey(event.target.value)} disabled={busy==='save'} autoComplete="off" spellCheck={false} maxLength={2048} placeholder="Paste your viewer key" /></label>
      <div className="mw-activity-buttons">
        <button type="button" className="btn btn-secondary btn-sm" disabled={busy==='save'} onClick={()=>editKey(fixtures.viewerKey)}>Use workshop viewer key</button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={!!busy}>{busy==='find'?'Finding accessible assets…':'Find accessible assets'}</button>
      </div>
    </form>
    {found&&<div className="mw-activity-box">
      <p>{found.total>6?`${found.total} accessible assets found. The first six in file-name order are selected for the six capsules; the remaining ${found.total-6} will not be connected.`:`${found.total} accessible asset${found.total===1?'':'s'} found, in file-name order. Inspect the names and UUIDs before connecting.`}</p>
      <ol>{found.assets.map(asset=><li key={asset.uuid}><b>{asset.name}</b><br/><code style={{overflowWrap:'anywhere'}}>{asset.uuid}</code></li>)}</ol>
      <button type="button" className="btn btn-primary btn-sm" disabled={!!busy} onClick={()=>void connect()}>{busy==='save'?'Connecting…':'Connect these assets'}</button>
    </div>}
    {error&&<p role="alert" className="mw-activity-error">{error}</p>}
    {(message||verified)&&<p role="status" className="mw-activity-saved">{message||'Viewer-key exercise saved for the assets currently on display.'}</p>}
  </>;
}
