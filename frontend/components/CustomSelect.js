'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomSelect({
  value,
  onChange,
  options, // [{ value, label, icon? }]
  placeholder = 'Pilih...',
  icon,
  searchable = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = searchable && query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const choose = (val) => {
    onChange(val);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault();
      choose(filtered[highlight].value);
    }
  };

  return (
    <div className={`cselect ${open ? 'open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="cselect-trigger"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className="cselect-value">
          {icon && <span className="cselect-vicon">{icon}</span>}
          <span className={selected ? '' : 'cselect-placeholder'}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <span className="cselect-chevron">▾</span>
      </button>

      {open && (
        <div className="cselect-panel">
          {searchable && (
            <div className="cselect-search">
              <input
                autoFocus
                type="text"
                placeholder="Ketik untuk mencari..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(-1);
                }}
                onKeyDown={onKeyDown}
              />
            </div>
          )}
          <div className="cselect-list" ref={listRef}>
            {filtered.length === 0 ? (
              <div className="cselect-empty">Tidak ditemukan</div>
            ) : (
              filtered.map((o, i) => (
                <button
                  type="button"
                  key={o.value + o.label}
                  className={`cselect-option ${o.value === value ? 'selected' : ''} ${
                    i === highlight ? 'highlight' : ''
                  }`}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(o.value)}
                >
                  {o.icon && <span className="cselect-oicon">{o.icon}</span>}
                  <span className="cselect-olabel">{o.label}</span>
                  {o.value === value && <span className="cselect-check">✓</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
