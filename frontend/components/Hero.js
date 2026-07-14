'use client';

import { useCallback, useRef, useState } from 'react';
import FloatingIsland from './FloatingIsland';

export default function Hero({ search, onSearch }) {
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMove = useCallback((e) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 6, ry: px * 8 });
  }, []);

  const resetTilt = useCallback(() => setTilt({ rx: 0, ry: 0 }), []);

  return (
    <section
      className="hero"
      id="hero"
      ref={stageRef}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
    >
      <div className="hero-photo" />
      <div className="hero-overlay" />

      {/* Lapisan gunung 3D parallax di dasar hero */}
      <div className="hero-mountains" aria-hidden="true">
        <div className="mtn mtn-far" />
        <div className="mtn mtn-mid" />
        <div className="mtn mtn-near" />
        <div className="hero-mist" />
      </div>

      {/* 3D interactive scene */}
      <div
        className="hero-scene"
        style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      >
        <FloatingIsland />

        <div className="float-card fc-1">
          <span className="fc-emoji">🏝️</span>
          <div>
            <strong>1000+</strong>
            <small>Destinasi</small>
          </div>
        </div>
        <div className="float-card fc-2">
          <span className="fc-emoji">🗺️</span>
          <div>
            <strong>34</strong>
            <small>Provinsi</small>
          </div>
        </div>
        <div className="float-card fc-3">
          <span className="fc-emoji">⭐</span>
          <div>
            <strong>4.9</strong>
            <small>Rating</small>
          </div>
        </div>
      </div>

      <div className="hero-inner">
        <div
          className="hero-content"
          style={{ transform: `rotateX(${tilt.rx * 0.35}deg) rotateY(${tilt.ry * 0.35}deg)` }}
        >
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            Dari Sabang sampai Merauke
          </span>

          <h1 className="hero-title">
            Jelajahi Pesona
            <br />
            Wisata <span className="hero-accent">Indonesia</span>
          </h1>

          <p className="hero-subtitle">
            Temukan ribuan destinasi menakjubkan — pantai eksotis, gunung megah, candi bersejarah,
            dan budaya yang memukau di seluruh Nusantara. Rencanakan petualanganmu berikutnya
            bersama kami.
          </p>

          <div className="hero-search">
            <span className="hero-search-icon">🔍</span>
            <input
              type="text"
              value={search}
              placeholder="Cari wisata, provinsi, atau kategori..."
              onChange={(e) => onSearch(e.target.value)}
            />
            <a href="#explore" className="hero-search-btn">
              Cari
            </a>
          </div>

          <div className="hero-actions">
            <a href="#explore" className="btn btn-primary">
              Mulai Jelajah <span aria-hidden>→</span>
            </a>
            <a href="#kelola" className="btn btn-outline-light">
              ➕ Tambah Wisata
            </a>
          </div>
        </div>
      </div>

      <a href="#stats" className="scroll-down" aria-label="Scroll ke bawah">
        <span></span>
      </a>
    </section>
  );
}
