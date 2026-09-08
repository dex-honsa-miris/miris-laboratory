import { Component, useEffect, useState, type ReactNode } from "react";
import SceneControls from './SceneControls';
import { activeSeries } from './workshop.mjs';

function SceneUnavailable() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    let live = true;
    fetch(import.meta.env.PROD ? '/miris-scene.json' : '/api/miris')
      .then(response => response.json()).then(value => { if (live) setData(activeSeries(value)); }).catch(() => {});
    return () => { live = false; };
  }, []);
  return <>
    <main className="mw-scene-unavailable">
      <img src="/tracks/laboratory-poster.jpg" alt="The blue-lit laboratory with six specimen capsules" />
      <div><h1>The live 3D view couldn’t open</h1>
        <p>You can still browse the specimen records below. Reload to try the live view again.</p>
        {!import.meta.env.PROD && <p>If you were editing the scene, check the browser console. Your workshop progress is saved.</p>}
        <button type="button" onClick={() => location.reload()}>Reload scene</button>
      </div>
    </main>
    <SceneControls specimens={data?.specimens || []} recordsOnly />
  </>;
}

// Without this, a runtime error in the stage unmounts the guide too.
export default class StageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <SceneUnavailable />;
  }
}
