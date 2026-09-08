import type { StepPaneProps } from './Step';
import { subState, nextSub, indexOfSub } from './progress';
import WorkshopActivities from './WorkshopActivities';
import CodeStudio from './CodeStudio';

export default function WorkshopPane({step,currentSubNum,data,track,busy,problems,hatch,openSubNum,actions}:StepPaneProps){
  return <div className="mw-pane mw-core-pane">
    <p className="mw-workshop-time">{step.time} · core journey</p><h2 className="t20 mw-pane-title">{step.title}</h2><p className="mw-workshop-outcome">{step.outcome}</p>
    {step.subs.map(sub=>{
      const state=subState(sub.num,currentSubNum),open=sub.num===openSubNum,browsing=sub.num!==currentSubNum;
      if(!open)return <button key={sub.num} className="mw-line mw-core-line" data-state={state} onClick={()=>actions.view(sub.num===currentSubNum?'':sub.num)}><span className="l12 k">{sub.num}</span><span className="c14 ttl">{sub.title}</span>{state==='done'&&<span aria-label="Completed">✓</span>}</button>;
      return <article key={sub.num} className="mw-now"><p className="mw-activity-label">Activity {sub.num}</p><h3 className="mw-now-title">{sub.title}</h3><p className="c14">{sub.body}</p>
        <WorkshopActivities key={sub.num} sub={sub} data={data} hatch={hatch} refresh={actions.reload}/>
        {sub.explain&&<details className="mw-why"><summary>Why this matters</summary><p>{sub.explain}</p></details>}
        {sub.stretch&&<p className="mw-stretch c14">{sub.stretch}</p>}
        {problems[sub.num]&&<p className="mw-snag c14" role="status">{problems[sub.num]}</p>}
        <div className="mw-core-navigation">
          {browsing?<><button className="btn btn-secondary btn-sm" onClick={()=>actions.view('')}>Back to my current activity</button>{indexOfSub(sub.num)===indexOfSub(currentSubNum)-1&&<button className="btn btn-ghost btn-sm" onClick={()=>actions.undo(sub.num)}>Revisit this activity</button>}</>
          :nextSub(sub.num)?<button className="btn btn-primary btn-sm" disabled={busy===sub.num} onClick={()=>actions.done(sub)}>{busy===sub.num?'Checking…':'Continue →'}</button>
          :<button className="btn btn-primary btn-sm" disabled={busy===sub.num} onClick={()=>actions.finish()}>Finish the workshop</button>}
        </div>
      </article>;
    })}
    <CodeStudio/>
  </div>;
}
