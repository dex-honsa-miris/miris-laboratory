import { useEffect, useId, useRef, useState } from 'react';

export function ControlIcon({ name }: { name: 'previous' | 'next' | 'chevron' | 'overview' | 'file' | 'check' | 'specimen' }) {
  const paths = {
    previous: <path d="m12 5-7 7 7 7M5 12h15" />,
    next: <path d="m12 5 7 7-7 7M19 12H4" />,
    chevron: <path d="m7 10 5 5 5-5" />,
    overview: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /><circle cx="12" cy="12" r="3" /></>,
    file: <><path d="M14 3H6v18h12V7l-4-4Z" /><path d="M14 3v5h4M9 12h6m-6 4h6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    specimen: <><ellipse cx="12" cy="12" rx="6" ry="9" /><path d="M6 12h12M12 3v18" /></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function SpecimenPicker({ specimens, selected, onSelect }: { specimens: any[]; selected: number; onSelect: (index: number) => void }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(0);
  const current = specimens.find(s => s.index === selected);
  const entries = [{ index: -1, label: 'Room overview', stage: 'Explore the whole laboratory' }, ...specimens.map(s => ({ index: s.index, label: s.dossier?.name || s.stage || 'Specimen', stage: s.stage || 'Specimen record' }))];
  const close = (restoreFocus = false) => { setOpen(false); if (restoreFocus) trigger.current?.focus(); };
  const choose = (index: number) => { onSelect(index); close(true); };
  const show = () => { setFocused(Math.max(0, entries.findIndex(s => s.index === selected))); setOpen(true); };

  useEffect(() => {
    if (!open) return;
    options.current[focused]?.focus();
  }, [open, focused]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  return <div ref={root} className="mw-specimen-picker" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(true); }
  }}>
    <button ref={trigger} type="button" className="mw-picker-trigger" aria-label={`Choose specimen: ${current?.dossier?.name || current?.stage || 'Room overview'}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined}
      onClick={() => open ? close() : show()} onKeyDown={event => { if (['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); show(); } }}>
      <span className="mw-picker-emblem"><ControlIcon name={current ? 'specimen' : 'overview'} /></span>
      <span className="mw-picker-identity"><strong>{current?.dossier?.name || current?.stage || 'Explore the laboratory'}</strong><span>{current ? `Capsule ${String(selected + 1).padStart(2, '0')} / ${current.stage || 'Specimen'}` : `${specimens.length} specimens to discover`}</span></span>
      <span className="mw-picker-chevron" data-open={open}><ControlIcon name="chevron" /></span>
    </button>
    {open && <div className="mw-picker-popover">
      <div className="mw-picker-heading">Specimen collection<span>{specimens.length} connected</span></div>
      <div id={id} role="listbox" aria-label="Specimen collection" className="mw-picker-options" onKeyDown={event => {
        const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
        if (keys.includes(event.key)) {
          event.preventDefault();
          setFocused(event.key === 'Home' ? 0 : event.key === 'End' ? entries.length - 1 : (focused + (event.key === 'ArrowDown' ? 1 : -1) + entries.length) % entries.length);
        } else if (event.key.length === 1 && event.key !== ' ') {
          const found = entries.findIndex((entry, index) => index > focused && entry.label.toLowerCase().startsWith(event.key.toLowerCase()));
          const next = found >= 0 ? found : entries.findIndex(entry => entry.label.toLowerCase().startsWith(event.key.toLowerCase()));
          if (next >= 0) { event.preventDefault(); setFocused(next); }
        }
      }}>
        {entries.map((entry, index) => <button key={entry.index} ref={element => { options.current[index] = element; }} type="button" role="option" aria-selected={entry.index === selected} tabIndex={focused === index ? 0 : -1} onFocus={() => setFocused(index)} onClick={() => choose(entry.index)}>
          <span className="mw-option-number">{entry.index < 0 ? <ControlIcon name="overview" /> : String(entry.index + 1).padStart(2, '0')}</span>
          <span className="mw-option-copy"><strong>{entry.label}</strong><span>{entry.stage}</span></span>
          {entry.index === selected && <ControlIcon name="check" />}
        </button>)}
      </div>
    </div>}
  </div>;
}
