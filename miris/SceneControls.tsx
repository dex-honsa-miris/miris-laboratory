import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getSelected, setSelected, subscribeLab } from './labState';
import './lab.css';

// The shared scene keeps its touch controls and readable records without the workshop guide.
export default function SceneControls({ specimens = [] as any[], recordsOnly = false }) {
  const selected = useSyncExternalStore(subscribeLab, getSelected, getSelected);
  const [reading, setReading] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const available = specimens.map((s, index) => ({ ...s, index })).filter(s => s.uuid);
  const specimen = specimens[selected];
  const dossier = specimen?.dossier;
  const position = available.findIndex(s => s.index === selected);
  const choose = (offset: number) => {
    if (!available.length) return;
    const next = position < 0 ? (offset > 0 ? 0 : available.length - 1) : (position + offset + available.length) % available.length;
    setSelected(available[next].index);
  };

  useEffect(() => {
    if (reading) dialog.current?.showModal();
    else dialog.current?.close();
  }, [reading]);

  return <>
    <nav className="mw-scene-controls" aria-label="Explore the laboratory">
      <p>{recordsOnly ? 'Choose a specimen to read its record' : selected < 0 ? 'Drag to look around · choose a specimen' : 'Drag to orbit · pinch or scroll to zoom'}</p>
      <div className="mw-scene-picker">
        <button type="button" onClick={() => choose(-1)} disabled={!available.length} aria-label="Previous specimen">←</button>
        <select aria-label="Explore specimen" value={selected} onChange={event => setSelected(Number(event.target.value))}>
          <option value={-1}>Choose a specimen</option>
          {available.map(s => <option key={s.id} value={s.index}>{String(s.index + 1).padStart(2, '0')} · {s.dossier?.name || s.stage || 'Specimen'}</option>)}
        </select>
        <button type="button" onClick={() => choose(1)} disabled={!available.length} aria-label="Next specimen">→</button>
      </div>
      <div className="mw-scene-actions">
        <button type="button" disabled={selected < 0} onClick={() => setSelected(-1)}>Overview</button>
        <button type="button" disabled={!specimen} onClick={() => setReading(true)}>Read file</button>
      </div>
    </nav>
    <dialog ref={dialog} className="mw-reader" aria-labelledby="mw-reader-title" onClose={() => setReading(false)} onClick={event => { if (event.target === dialog.current) setReading(false); }}>
      <header><span>Biological record / {String(selected + 1).padStart(2, '0')}</span><button type="button" autoFocus onClick={() => setReading(false)} aria-label="Close specimen file">×</button></header>
      <div className="mw-reader-body">
        <p className="mw-reader-code">{dossier?.designation || 'Specimen archive'} · {specimen?.stage}</p>
        <h2 id="mw-reader-title">{dossier?.name || specimen?.stage || 'Specimen'}</h2>
        {dossier?.classification && <p>{dossier.classification}</p>}
        <h3>Field observations</h3>
        <p>{dossier?.notes || 'No field observation has been added for this specimen yet.'}</p>
        {dossier?.stats?.length > 0 && <dl>{dossier.stats.map((stat: any, index: number) => <div key={index}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>}
      </div>
    </dialog>
  </>;
}
