import { useState } from 'react';
import type { Sub } from './curriculum';
import type { StepActions } from './Step';
import { RenderPathBadge } from './Step';
import { PARTS, MARKER_FOR } from './snippets.mjs';
import Code from './highlight';

export default function CodingLesson({ sub, data, actions, busy }: { sub:Sub; data:any; actions:StepActions; busy:boolean }) {
  const [copied, setCopied] = useState(false);
  const [observation, setObservation] = useState(data.workshopAnswers?.build?.[sub.evidence!] || '');
  const [saving, setSaving] = useState(false), [feedback, setFeedback] = useState('');
  const save = async (event:React.FormEvent) => {
    event.preventDefault(); setSaving(true); setFeedback('');
    try {
      const response = await fetch('/api/miris', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'workshop', op:'save', key:'build', value:{lesson:sub.evidence, observation}}) });
      if (!response.headers.get('content-type')?.includes('json')) throw new Error('Run the development server to check your code.');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save this exercise.');
      await actions.reload(); setFeedback('Code found and observation saved. You can continue.');
    } catch(error) { setFeedback((error as Error).message); }
    finally { setSaving(false); }
  };
  return <div className="mw-coding-lesson">
    <p className="mw-activity-caption">Edit <code>app/stage.tsx</code> · <code>miris:{MARKER_FOR[sub.fill!]}</code></p>
    <div className="mw-agent-prompt"><h4>Ask your agent</h4><p>{sub.prompt}</p>
      <button className="btn btn-secondary btn-sm" onClick={async()=>{try{await navigator.clipboard.writeText(sub.prompt!);setCopied(true);}catch{setCopied(false);}}}>{copied?'Prompt copied':'Copy agent prompt'}</button>
    </div>
    <div className="mw-activity-box"><h4>Make a change of your own</h4><p>{sub.variation}</p><h4>Run it and look for this</h4><p>{sub.observe}</p></div>
    {sub.renderPath && <RenderPathBadge />}
    <details className="mw-code-studio"><summary>Inspect reference code or recover this step</summary>
      <p>Read your agent’s changes first. This reference shows the addition for this exercise.</p>
      <pre><Code code={PARTS[sub.fill!] || ''}/></pre>
      <p className="mw-activity-caption">Recovery replaces the entire <code>miris:{MARKER_FOR[sub.fill!]}</code> block, including your edits there. Scene recovery includes earlier room layers. Copy anything you want to keep first.</p>
      <button className="btn btn-secondary btn-sm" disabled={busy} onClick={()=>actions.fill(sub.fill!, sub.num)}>{busy?'Writing…':'Restore this checkpoint'}</button>
    </details>
    <form className="mw-code-observation" onSubmit={save}>
      <label className="mw-activity-field">What code did you change, and what did you observe?<textarea required rows={3} minLength={8} maxLength={1200} value={observation} onChange={event=>setObservation(event.target.value)} placeholder="Name the value or method you changed and describe the result." /></label>
      <p className="mw-activity-caption">The check finds the code in your file. Your observation confirms what you saw when you ran it.</p>
      <button className="btn btn-primary btn-sm" disabled={saving}>{saving?'Checking…':'Check code and save observation'}</button>
      {feedback&&<p role="status" className="mw-activity-caption">{feedback}</p>}
    </form>
  </div>;
}
