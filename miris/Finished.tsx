import { activeSeries } from './workshop.mjs';
import { PublishedLink } from './WorkshopControls';
import { PORTAL_URL } from './config';

export default function Finished({data,onBack}:{data:any;onBack:()=>void}) {
  const display=activeSeries(data),answers=data.workshopAnswers||{},reflection=answers.reflection||{};
  const count=display.specimens?.filter(s=>s.uuid).length||0;
  return <div className="mw-pane mw-finished">
    <p className="mw-workshop-time">Your workshop takeaway</p><h2 className="t20 mw-pane-title">A world you can share.</h2>
    <p className="c14">{data.labDesign?.title||'Your laboratory'} connects {count} specimen capsules through Miris. {display.origin==='prepared'?'You used the prepared series as your content source.':'You connected your specimen assets to the supplied room.'} The scene, presentation and streaming each play a different part.</p>
    <PublishedLink url={data.publishedUrl}/>
    <h3 className="mw-finished-h">What you discovered</h3>
    <ul className="c14 mw-finished-list"><li><b>Miris:</b> processes and streams the assets into your experience.</li><li><b>Your scene:</b> uses familiar web and three.js components for cameras, transforms and interaction.</li><li><b>Your design:</b> gives that content context and a reason to explore.</li></ul>
    {answers.tradeoff&&<div className="mw-activity-box"><b>Your streaming observation</b><p>{answers.tradeoff}</p></div>}
    {reflection.peer&&<div className="mw-activity-box"><b>A visitor’s perspective</b><p>{reflection.peer}</p></div>}
    {reflection.miris&&<div className="mw-activity-box"><b>Miris, in your words</b><p>{reflection.miris}</p></div>}
    {reflection.next&&<div className="mw-activity-box"><b>Your next project</b><p>{reflection.next}</p></div>}
    <h3 className="mw-finished-h">Turn that idea into a small next step</h3>
    <p className="c14">Choose one asset and one thing a visitor should do with it. Upload it to Miris, scope a viewer key, and replace a specimen in this starter. Keep the first experiment small enough to share.</p>
    <p className="c14"><a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">Open Miris ↗</a> · <a href="https://www.npmjs.com/package/@miris-inc/three" target="_blank" rel="noopener noreferrer">Explore the SDK ↗</a></p>
    <p className="mw-activity-caption">Your reflection stays in the development project. The published snapshot includes only the displayed specimens and scene design.</p>
    <button className="btn btn-secondary btn-sm" onClick={onBack}>Back to the workshop</button>
  </div>;
}
