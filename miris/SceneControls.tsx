import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getSelected, getSelectedPart, setSelected, subscribeLab } from './labState';
import './lab.css';
import SpecimenPicker, { ControlIcon } from './SpecimenPicker';
import './sceneControls.css';

// The shared scene keeps its touch controls and readable records without the workshop guide.
export default function SceneControls({ specimens = [] as any[], recordsOnly = false }) {
  const selected = useSyncExternalStore(subscribeLab, getSelected, getSelected);
  const part = useSyncExternalStore(subscribeLab, getSelectedPart, getSelectedPart);
  const [reading, setReading] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const transcript = useRef<HTMLElement>(null);
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

  useEffect(() => {
    if (!recordsOnly && part === 'pedestal') transcript.current?.focus({ preventScroll: true });
  }, [part, selected, recordsOnly]);

  return <>
    <nav className="mw-scene-controls" aria-label="Explore the laboratory">
      <div className="mw-scene-toolbar">
        <SpecimenPicker specimens={available} selected={selected} onSelect={setSelected} />
        <div className="mw-scene-actions">
          <div className="mw-scene-stepper">
            <button type="button" onClick={() => choose(-1)} disabled={!available.length} aria-label="Previous specimen" title="Previous specimen"><ControlIcon name="previous" /></button>
            <button type="button" onClick={() => choose(1)} disabled={!available.length} aria-label="Next specimen" title="Next specimen"><ControlIcon name="next" /></button>
          </div>
          <button className="mw-scene-home" type="button" disabled={selected < 0} onClick={() => setSelected(-1)}><ControlIcon name="overview" /><span>Overview</span></button>
          <button className="mw-scene-read" type="button" disabled={!specimen} onClick={() => recordsOnly ? setReading(true) : setSelected(selected, part === 'pedestal' ? 'organism' : 'pedestal')}><ControlIcon name={part === 'pedestal' ? 'specimen' : 'file'} /><span>{part === 'pedestal' && !recordsOnly ? 'Specimen' : 'Read file'}</span></button>
        </div>
      </div>
      <p className="mw-scene-hint">{recordsOnly ? 'Choose a specimen to read its record' : selected < 0 ? 'Drag to look around' : 'Drag to orbit · pinch or scroll to zoom'}</p>
    </nav>
    {!recordsOnly && part === 'pedestal' && specimen && <section ref={transcript} tabIndex={-1} className="mw-terminal-transcript" aria-label={`${dossier?.name || specimen.stage || 'Specimen'} pedestal record`}>
      <h2>{dossier?.name || specimen.stage || 'Specimen'}</h2>
      <p>{dossier?.classification}</p>
      <h3>Field observations</h3>
      <p>{dossier?.notes || 'No field observation has been added yet.'}</p>
      {dossier?.stats?.length > 0 && <dl>{dossier.stats.map((stat: any, index: number) => <div key={index}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>}
    </section>}
    {recordsOnly && <dialog ref={dialog} className="mw-reader" aria-labelledby="mw-reader-title" onClose={() => setReading(false)} onClick={event => { if (event.target === dialog.current) setReading(false); }}>
      <header><span>Biological record / {String(selected + 1).padStart(2, '0')}</span><button type="button" autoFocus onClick={() => setReading(false)} aria-label="Close specimen file"><svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M5 15 15 5" stroke="currentColor" strokeWidth="1.5" /></svg></button></header>
      <div className="mw-reader-body">
        <p className="mw-reader-code">{dossier?.designation || 'Specimen archive'} · {specimen?.stage}</p>
        <h2 id="mw-reader-title">{dossier?.name || specimen?.stage || 'Specimen'}</h2>
        {dossier?.classification && <p>{dossier.classification}</p>}
        <h3>Field observations</h3>
        <p>{dossier?.notes || 'No field observation has been added for this specimen yet.'}</p>
        {dossier?.stats?.length > 0 && <dl>{dossier.stats.map((stat: any, index: number) => <div key={index}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>}
      </div>
    </dialog>}
  </>;
}
