'use client';

import { useEffect, useRef, useState } from 'react';

function useCountUp(target, decimals = 0, start) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || target == null) return;
    const duration = 1600;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, decimals, start]);
  return decimals ? value.toFixed(decimals) : Math.floor(value).toLocaleString('id-ID');
}

export default function Stats({ stats }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const destinasi = useCountUp(stats?.totalDestinasi ?? 0, 0, visible);
  const provinsi = useCountUp(stats?.totalProvinsi ?? 0, 0, visible);
  const kategori = useCountUp(stats?.totalKategori ?? 0, 0, visible);
  const rating = useCountUp(stats?.rataRating ?? 0, 1, visible);

  const cards = [
    ['🏝️', destinasi, 'Total Wisata'],
    ['🗺️', provinsi, 'Provinsi'],
    ['🎯', kategori, 'Kategori Wisata'],
    ['⭐', rating, 'Rata-rata Rating'],
  ];

  return (
    <section className="stats" id="stats" ref={ref}>
      <div className="section-head reveal">
        <span className="eyebrow">Data Terkini</span>
        <h2>Kekayaan Wisata dalam Angka</h2>
      </div>
      <div className="stats-grid">
        {cards.map(([icon, val, label], i) => (
          <div className={`stat-card reveal reveal-d${i + 1}`} key={label}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-num">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
