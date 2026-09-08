import ViewerKeyLesson from './ViewerKeyLesson';
import { useRef, useState } from 'react';
import type { Sub } from './curriculum';
import { CapsuleAuto, ConceptField, type HatchState } from './Build';
import { activeSeries } from './workshop.mjs';
import { BudgetExperiment, PublishedLink } from './WorkshopControls';
import { PORTAL_URL, FAL_KEYS_URL } from './config';

interface Props { sub:Sub; data:any; hatch:HatchState; refresh:()=>void | Promise<void>; }
function useAction(refresh:Props['refresh']) {
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
  const running=useRef(false);
  const run=async(payload:object)=>{
    if(running.current)return false;
    running.current=true;setBusy(true);setMessage('');setFailed(false);
    try {
      const res=await fetch('/api/miris',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'workshop',...payload})});
      if(!res.headers.get('content-type')?.includes('json'))throw new Error('Open the workshop under npm run dev to save your changes.');
      const result=await res.json();if(!res.ok)throw new Error(result.error||'Could not save the activity.');
      await refresh();window.dispatchEvent(new Event('miris:refresh'));setMessage('Saved. Explore the result, then continue.');return true;
    }catch(error){setFailed(true);setMessage((error as Error).message);return false;}
    finally{running.current=false;setBusy(false);}
  };
  return {run,busy,feedback:message?<p role="status" className={failed?'mw-activity-error':'mw-activity-saved'}>{message}</p>:null};
}

function Observation({sub,data,refresh}:Props) {
  const key=sub.activity==='tradeoff'?'tradeoff':'firstStream';
  const [prediction,setPrediction]=useState('');
  const [value,setValue]=useState(data.workshopAnswers?.[key]||'');
  const {run,busy,feedback}=useAction(refresh);
  return <><label className="mw-activity-field">Before you try: what do you predict?<input value={prediction} onChange={e=>setPrediction(e.target.value)} placeholder="Which specimen will keep useful detail?" /></label>
    <BudgetExperiment />
    <form onSubmit={e=>{e.preventDefault();void run({op:'save',key,value});}}>
      <label className="mw-activity-field">{key==='tradeoff'?'What changed, and where could you use this?':'What did you notice?'}<textarea value={value} onChange={e=>setValue(e.target.value)} minLength={8} maxLength={1200} rows={3} required placeholder="Describe your actual observation, even if the difference was small." /></label>
      <button className="btn btn-primary btn-sm" disabled={busy}>{busy?'Saving…':'Save observation'}</button>{feedback}
    </form></>;
}

function Attribution({data,refresh}:Props) {
  const [value,setValue]=useState(data.workshopAnswers?.attribution||'');
  const {run,busy,feedback}=useAction(refresh);
  return <><ol className="mw-pipeline"><li><b>Create assets</b><span>Generate with fal and its model providers, or bring existing work.</span></li><li><b>Process & stream</b><span>Miris prepares the assets for streaming and delivers detail to the scene.</span></li><li><b>Build the experience</b><span>React and three.js provide the room, interaction and presentation.</span></li></ol>
    <form onSubmit={e=>{e.preventDefault();void run({op:'save',key:'attribution',value});}}><fieldset className="mw-activity-options"><legend>Which part would Miris supply if you brought your own assets?</legend>
      {[['generation','Inventing the creature'],['streaming','Processing and streaming the assets'],['interface','Designing the room and its interface']].map(([id,label])=><label key={id}><input type="radio" name="miris-role" value={id} checked={value===id} onChange={()=>setValue(id)} required />{label}</label>)}
    </fieldset><button className="btn btn-primary btn-sm" disabled={busy}>Check my understanding</button>{feedback}</form></>;
}

function Source({data,hatch,refresh}:Props) {
  const {run,busy,feedback}=useAction(refresh);
  return <><div className="mw-source-options">
    {[
      ['prepared','Use the prepared series','Ready now. No generation account or payment. You will connect a scoped viewer key and build the integration in code.'],
      ['generate','Generate my own creature','Optional paid route. Allow roughly 12 minutes and a workshop estimate of $12; actual cost and time can vary.'],
      ['own','Connect my own uploads','Use assets already in Miris, or upload your own source files.'],
    ].map(([id,label,description])=><button key={id} className="mw-source-option" aria-pressed={data.workshopPath===id} disabled={busy} onClick={()=>run({op:'source',value:id})}><b>{label}</b><span>{description}</span></button>)}
  </div>{feedback}
    {data.workshopPath==='generate' && <div className="mw-activity-box">
      <p className="mw-activity-label">Optional generation setup</p><p>Use your own fal account with billing enabled. Put your key in <code>.env.local</code>, then describe one creature below. Pressing Grow starts a paid run; choosing this route does not.</p>
      <pre>FAL_KEY=your-key-here</pre><a href={FAL_KEYS_URL} target="_blank" rel="noopener noreferrer">Open fal keys ↗</a>
      <ConceptField hatch={hatch}/><p className="mw-activity-caption">Keep coding while it grows. You can switch to prepared specimens at any time; an already submitted paid job continues.</p>
    </div>}
    {data.workshopPath==='own' && <p className="mw-activity-caption">You’ll discover and connect your scoped viewer key in the next exercise. Open the reference laboratory while uploads process.</p>}
  </>;
}

function Design({data,refresh}:Props) {
  const [title,setTitle]=useState(data.labDesign?.title||'Sublevel 7');
  const [rotationSpeed,setSpeed]=useState(data.labDesign?.rotationSpeed??0.08),[fov,setFov]=useState(data.labDesign?.fov??55);
  const {run,busy,feedback}=useAction(refresh);
  return <form onSubmit={e=>{e.preventDefault();void run({op:'save',key:'design',value:{title,rotationSpeed,fov}});}}>
    <label className="mw-activity-field">Laboratory name<input value={title} onChange={e=>setTitle(e.target.value)} minLength={2} maxLength={48} required /></label>
    <label className="mw-activity-field">Specimen rotation<select value={rotationSpeed} onChange={e=>setSpeed(+e.target.value)}><option value={0.04}>Slow study · one turn in 157 seconds</option><option value={0.08}>Gentle orbit · one turn in 79 seconds</option><option value={0.16}>Lively display · one turn in 39 seconds</option></select></label>
    <label className="mw-activity-field">Camera lens<select value={fov} onChange={e=>setFov(+e.target.value)}><option value={45}>Close study · narrow</option><option value={55}>Natural view · balanced</option><option value={70}>Room survey · wide</option></select></label>
    <button className="btn btn-primary btn-sm" disabled={busy}>Apply my design</button>{feedback}
  </form>;
}

function Connect({data,hatch,refresh}:Props) {
  const {run,busy,feedback}=useAction(refresh);
  const display=activeSeries(data), count=display.specimens?.filter(s=>s.uuid).length||0;
  const needsOwn=data.workshopPath!=='prepared';
  return <>
    <p className="mw-activity-caption">Current display: {display.origin==='prepared'?'prepared deep-sea series':data.previewSeries?'previously connected specimens':'your connected specimens'} · {count} capsule connections. A connection is not a guarantee that an asset has loaded; check the scene.</p>
    {needsOwn && <div className="mw-activity-box">
      {data.workshopPath==='generate' && <p>{hatch.data?.zipReady?'Your generation archive is ready in the growth tray. Download it, upload the six files to Miris and wait for processing.':'Your generation may still be running. Use the growth tray to check progress; you can continue with the prepared display.'}</p>}
      <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">Open Miris to upload and scope your key ↗</a>
      <CapsuleAuto data={data.previewSeries?{...data,viewerKey:'',specimens:[]}:data} onDone={()=>{void refresh();window.dispatchEvent(new Event('miris:refresh'));}} />
    </div>}
    <div className="mw-activity-buttons"><button className="btn btn-secondary btn-sm" disabled={busy} onClick={()=>run({op:'prepared'})}>Use prepared specimens and keep going</button></div>
    <button className="btn btn-primary btn-sm" disabled={busy||!count} onClick={()=>run({op:'save',key:'connected',value:true})}>I explored a streamed specimen</button>{feedback}
  </>;
}

function Story({data,refresh}:Props) {
  const display=activeSeries(data),bank=display.specimens||[];
  const [index,setIndex]=useState(data.workshopAnswers?.story?.index??0);
  const [name,setName]=useState(bank[index]?.dossier?.name||'');
  const [notes,setNotes]=useState(bank[index]?.dossier?.notes||'');
  const {run,busy,feedback}=useAction(refresh);
  return <form onSubmit={e=>{e.preventDefault();void run({op:'save',key:'story',value:{index,name,notes}});}}>
    <label className="mw-activity-field">Capsule<select value={index} onChange={e=>{const i=+e.target.value;setIndex(i);setName(bank[i]?.dossier?.name||'');setNotes(bank[i]?.dossier?.notes||'');}}>{bank.map((s,i)=><option value={i} key={s.id}>{i+1} · {s.stage||'Specimen'}</option>)}</select></label>
    <label className="mw-activity-field">Specimen name<input value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={40} required /></label>
    <label className="mw-activity-field">Field observation<textarea value={notes} onChange={e=>setNotes(e.target.value)} minLength={12} maxLength={420} rows={5} required /></label>
    <p className="mw-activity-caption">Keep your observation short enough to read on the pedestal screen.</p><button className="btn btn-primary btn-sm" disabled={busy}>Save specimen story</button>{feedback}
  </form>;
}

function Publish({data,refresh}:Props) {
  const [url,setUrl]=useState(data.publishedUrl||''),[opened,setOpened]=useState(false);
  const {run,busy,feedback}=useAction(refresh);
  return <><div className="mw-activity-box"><b>Before you publish</b><ul><li>Explore one capsule and read your edited pedestal.</li><li>Release any pinned rendering budget.</li><li>Open the shared link on a phone. Test portrait and landscape, specimen navigation, Read file and Overview.</li><li>Publish the scene that is currently on display.</li></ul><p className="mw-activity-caption">If your new assets are still processing, publish with the prepared series. You can connect your own and publish again later.</p></div>
    <form onSubmit={e=>{e.preventDefault();void run({op:'save',key:'publish',value:{url,opened}});}}><label className="mw-activity-field">Published laboratory URL<input type="url" value={url} onChange={e=>{setUrl(e.target.value);setOpened(false);}} required placeholder="https://your-laboratory…" /></label>
      <label className="mw-activity-check"><input type="checkbox" checked={opened} onChange={e=>setOpened(e.target.checked)} required />I checked this public link on a phone, including a specimen, Read file and Overview.</label>
      <button className="btn btn-primary btn-sm" disabled={busy}>Save verified link</button>{feedback}</form><PublishedLink url={data.publishedUrl}/>
  </>;
}

function Reflection({data,refresh}:Props) {
  const previous=data.workshopAnswers?.reflection||{};
  const [peer,setPeer]=useState(previous.peer||''),[miris,setMiris]=useState(previous.miris||''),[next,setNext]=useState(previous.next||'');
  const {run,busy,feedback}=useAction(refresh);
  return <><PublishedLink url={data.publishedUrl}/><form onSubmit={e=>{e.preventDefault();void run({op:'save',key:'reflection',value:{peer,miris,next}});}}>
    <label className="mw-activity-field">What did your visitor notice?<textarea value={peer} onChange={e=>setPeer(e.target.value)} minLength={8} maxLength={600} rows={3} required placeholder="Or describe your own second-device check." /></label>
    <label className="mw-activity-field">What did Miris make possible?<textarea value={miris} onChange={e=>setMiris(e.target.value)} minLength={8} maxLength={600} rows={3} required /></label>
    <label className="mw-activity-field">What would you build next?<textarea value={next} onChange={e=>setNext(e.target.value)} minLength={8} maxLength={600} rows={3} required placeholder="Name an audience, some assets and an experience." /></label>
    <button className="btn btn-primary btn-sm" disabled={busy}>Save my takeaways</button>{feedback}
  </form></>;
}

const COMPONENTS={keys:ViewerKeyLesson,experiment:Observation,attribution:Attribution,source:Source,design:Design,connect:Connect,story:Story,tradeoff:Observation,publish:Publish,reflection:Reflection};
export default function WorkshopActivities(props:Props){const Activity=COMPONENTS[props.sub.activity!];return Activity?<div className="mw-activity"><Activity {...props}/></div>:null;}
