import { useState } from 'react';
import { TECHNICAL_STEPS } from './technicalCurriculum';
import { PARTS } from './snippets.mjs';
import Code from './highlight';
const lessons=TECHNICAL_STEPS.flatMap(step=>step.subs).filter(sub=>sub.fill||sub.num==='2.6');
export default function CodeStudio(){
  const [id,setId]=useState('2.4'),[copied,setCopied]=useState(false);
  const lesson=lessons.find(item=>item.num===id)!;
  const code=lesson.fill?PARTS[lesson.fill]:lesson.code;
  return <details className="mw-code-studio"><summary>Optional code studio</summary>
    <p>Explore the implementation when you have time. These examples are references; the core journey already supplies the working scene. Editing marker blocks changes that scene, so keep time to check it before publishing.</p>
    <label className="mw-activity-field">Choose a topic<select value={id} onChange={e=>{setId(e.target.value);setCopied(false);}}>{lessons.map(sub=><option key={sub.num} value={sub.num}>{sub.title}</option>)}</select></label>
    <p>{lesson.explain||lesson.body}</p>
    {code&&<><pre><Code code={code}/></pre><button className="btn btn-secondary btn-sm" onClick={async()=>{try{await navigator.clipboard.writeText(code);setCopied(true);}catch{setCopied(false);}}}>{copied?'Copied':'Copy reference code'}</button></>}
    {lesson.stretch&&<p className="mw-activity-caption">Try a variation: {lesson.stretch}</p>}
    <p className="mw-activity-caption">The room and transforms use three.js. HTML-in-Canvas and the CRT shader are optional web-platform experiments. Miris supplies the streaming assets.</p>
  </details>;
}
