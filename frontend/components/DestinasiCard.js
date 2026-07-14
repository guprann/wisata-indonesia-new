'use client';

import { useCallback, useRef } from 'react';
import { safeImg, formatNumber, formatRupiah, PLACEHOLDER } from '@/lib/api';

export default function DestinasiCard({ item, index, limit, onDetail, onEdit, onDelete }) {
  const cardRef = useRef(null);

  // Tilt 3D interaktif mengikuti posisi kursor di atas kartu
  const handleMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-10px) rotateX(${-py * 10}deg) rotateY(${px * 12}deg) scale(1.02)`;
    el.style.setProperty('--gx', `${(px + 0.5) * 100}%`);
    el.style.setProperty('--gy', `${(py + 0.5) * 100}%`);
  }, []);

  const handleLeave = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transform = '';
  }, []);

  return (
    <article
      className="dest-card"
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ animationDelay: `${(index % limit) * 60}ms` }}
    >
      <span className="card-glare" aria-hidden="true" />
      <div className="card-img">
        <img
          key={item.gambar}
          src={safeImg(item.gambar)}
          alt={item.nama}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        <span className="card-badge">{item.kategori || 'Wisata'}</span>
        {item.rating ? <span className="card-rating">⭐ {item.rating}</span> : null}
      </div>
      <div className="card-body">
        <h3 className="card-title">{item.nama}</h3>
        <p className="card-loc">📍 {item.provinsi || '-'}</p>
        <div className="card-meta">
          <div>
            <div className="m-val">{formatRupiah(item.hargaTiket)}</div>
            <div className="m-lbl">Tiket Masuk</div>
          </div>
          <div>
            <div className="m-val">
              {item.pengunjungPerBulan ? formatNumber(item.pengunjungPerBulan) : '-'}
            </div>
            <div className="m-lbl">Pengunjung/bln</div>
          </div>
        </div>
        <div className="card-actions">
          <button className="act-detail" onClick={() => onDetail(item.id)}>
            Lihat Detail
          </button>
          <button className="act-edit" title="Edit" onClick={() => onEdit(item.id)}>
            ✏️
          </button>
          <button className="act-delete" title="Hapus" onClick={() => onDelete(item)}>
            🗑️
          </button>
        </div>
      </div>
    </article>
  );
}
