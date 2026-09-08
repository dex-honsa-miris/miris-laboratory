import { useState, useSyncExternalStore } from 'react';
import { budgetVersion, getBudget, pinBudget, subscribeBudget } from './budget';
import { setSelected } from './labState';

export function BudgetExperiment() {
  useSyncExternalStore(subscribeBudget,budgetVersion,budgetVersion);
  const budget=getBudget();
  return <div className="mw-activity-box">
    <p className="mw-activity-label">Try it in the live scene</p>
    <div className="mw-activity-buttons">
      <button className="btn btn-secondary btn-sm" onClick={()=>setSelected(0)}>Approach capsule 1</button>
      <button className="btn btn-secondary btn-sm" onClick={()=>setSelected(3)}>Approach capsule 4</button>
      <button className="btn btn-ghost btn-sm" onClick={()=>setSelected(-1)}>Return to the room</button>
    </div>
    <div className="mw-activity-buttons">
      <button className="btn btn-secondary btn-sm" disabled={!budget.live} aria-pressed={budget.pinned===40000} onClick={()=>pinBudget(40000)}>Low detail · 40k</button>
      <button className="btn btn-secondary btn-sm" disabled={!budget.live} aria-pressed={budget.pinned===250000} onClick={()=>pinBudget(250000)}>More detail · 250k</button>
      <button className="btn btn-ghost btn-sm" disabled={!budget.live} onClick={()=>pinBudget(null)}>Let Miris adapt</button>
    </div>
    <p className="mw-activity-caption">{budget.live ? `${Math.round(budget.drawn/1000)}k splats drawn · ${budget.frameMs.toFixed(1)} ms per frame · ${budget.pinned===null?'adaptive':'pinned'}` : 'Waiting for the streams. The controls wake when the renderer reports its budget.'}</p>
    <p className="mw-activity-caption">This changes rendering detail, not connection speed. If a stream cannot load, use the film on the welcome page while the presenter helps reconnect.</p>
  </div>;
}

export function PublishedLink({url}:{url?:string}) {
  const [message,setMessage]=useState('');
  if(!url)return null;
  return <div className="mw-activity-box"><a className="mw-public-link" href={url} target="_blank" rel="noopener noreferrer">Open your published laboratory ↗</a>
    <button className="btn btn-secondary btn-sm" onClick={async()=>{try{await navigator.clipboard.writeText(url);setMessage('Link copied.');}catch{setMessage('Select and copy the address below.');}}}>Copy link</button>
    <p className="mw-link-address">{url}</p><span role="status" className="mw-activity-caption">{message}</span>
  </div>;
}
