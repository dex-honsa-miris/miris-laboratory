import { activeSeries } from './workshop.mjs';
import { PublishedLink } from './WorkshopControls';
import { PORTAL_URL } from './config';

export default function Finished({data,onBack}:{data:any;onBack:()=>void}) {
  const display=activeSeries(data),answers=data.workshopAnswers||{},reflection=answers.reflection||{};
  const count=display.specimens?.filter(s=>s.uuid).length||0;
  return <div className="mw-pane mw-finished">
    <p className="mw-workshop-time">Your workshop takeaway</p><h2 className="t20 mw-pane-title">An SDK integration you built.</h2>
    <p className="c14">{data.labDesign?.title||'Your laboratory'} connects {count} specimen capsules through Miris. {display.origin==='prepared'?'You used the prepared series as your content source.':'You connected your own specimen assets.'} You built the scene integration, physical dossiers and screen effect in app/stage.tsx.</p>
    <PublishedLink url={data.publishedUrl}/>
    <h3 className="mw-finished-h">What you can build again</h3>
    <ul className="c14 mw-finished-list"><li><b>Discovery:</b> initialize MirisScene with a scoped viewer key, await ready, and inspect fetchAssets.</li><li><b>Your SDK extension:</b> LaboratoryScene extends MirisScene and adds specimenPosition, used by your stream map.</li><li><b>Streaming:</b> connect each MirisStream with an asset ID and viewer key, then fit its reported bounds.</li><li><b>HTML in the scene:</b> write fileMarkup, paint it with useHtmlTexture, and mount the texture on a pedestal.</li><li><b>TSL:</b> build a graph from UVs, time and the screen texture, then apply it to the selected terminal.</li></ul>
    {answers.tradeoff&&<div className="mw-activity-box"><b>Your streaming observation</b><p>{answers.tradeoff}</p></div>}
    {reflection.peer&&<div className="mw-activity-box"><b>A visitor’s perspective</b><p>{reflection.peer}</p></div>}
    {reflection.miris&&<div className="mw-activity-box"><b>Miris, in your words</b><p>{reflection.miris}</p></div>}
    {reflection.next&&<div className="mw-activity-box"><b>Your next project</b><p>{reflection.next}</p></div>}
    <h3 className="mw-finished-h">Turn that idea into a small next step</h3>
    <p className="c14">Choose one asset and one thing a visitor should do with it. Reuse your scene factory and stream connection, add one method to your subclass, and make a surface that helps the visitor understand the asset. Keep the first experiment small enough to share.</p>
    <p className="c14"><a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">Open Miris ↗</a> · <a href="https://www.npmjs.com/package/@miris-inc/three" target="_blank" rel="noopener noreferrer">Explore the SDK ↗</a></p>
    <p className="mw-activity-caption">Your reflection stays in the development project. The published snapshot includes only the displayed specimens and scene design.</p>
    <button className="btn btn-secondary btn-sm" onClick={onBack}>Back to the workshop</button>
  </div>;
}
