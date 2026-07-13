'use client';

import { useEffect, useState } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (y / height) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['#hero', 'Beranda'],
    ['#stats', 'Statistik'],
    ['#explore', 'Jelajahi'],
    ['#kelola', 'Kelola'],
    ['#peta', 'Peta'],
  ];

  return (
    <>
      <div className="scroll-progress" style={{ width: `${progress}%` }} />
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#hero" className="brand">
            <span className="brand-icon"><Logo size={34} /></span>
            <span className="brand-text">
              Pesona<span>Nusantara</span>
            </span>
          </a>
          <nav className={`nav-links ${open ? 'open' : ''}`}>
            {links.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            <a href="#kelola" className="nav-cta mobile-only" onClick={() => setOpen(false)}>
              Mulai Sekarang
            </a>
          </nav>
          <a href="#kelola" className="nav-cta">
            Mulai Sekarang <span aria-hidden>→</span>
          </a>
          <button className="nav-toggle" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
    </>
  );
}
