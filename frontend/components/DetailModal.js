'use client';

import { safeImg, formatNumber, formatRupiah, PLACEHOLDER } from '@/lib/api';

export default function DetailModal({ item, open, onClose, onEdit, onShowMap }) {
  if (!item) return null;
  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal detail-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-body">
          <div className="detail-hero">
            <img
              key={item.gambar}
              src={safeImg(item.gambar)}
              alt={item.nama}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PLACEHOLDER;
              }}
            />
            <div className="detail-hero-text">
              <h2>{item.nama}</h2>
              <p>
                📍 {item.provinsi || '-'} · {item.kategori || '-'}
              </p>
            </div>
          </div>
          <div className="detail-content">
            <div className="detail-grid">
              <div className="detail-box">
                <div className="d-icon">⭐</div>
                <div className="d-val">{item.rating ?? '-'}</div>
                <div className="d-lbl">Rating</div>
              </div>
              <div className="detail-box">
                <div className="d-icon">🎟️</div>
                <div className="d-val">{formatRupiah(item.hargaTiket)}</div>
                <div className="d-lbl">Tiket Masuk</div>
              </div>
              <div className="detail-box">
                <div className="d-icon">👥</div>
                <div className="d-val">
                  {item.pengunjungPerBulan ? formatNumber(item.pengunjungPerBulan) : '-'}
                </div>
                <div className="d-lbl">Pengunjung/bln</div>
              </div>
              <div className="detail-box">
                <div className="d-icon">🧭</div>
                <div className="d-val">
                  {item.latitude ?? '-'}, {item.longitude ?? '-'}
                </div>
                <div className="d-lbl">Koordinat</div>
              </div>
            </div>
            {item.fasilitas && item.fasilitas.length > 0 && (
              <div className="detail-fasilitas">
                <h4>🏖️ Fasilitas Utama</h4>
                <div className="fasilitas-tags">
                  {item.fasilitas.map((f, i) => (
                    <span className="f-tag" key={i}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => onShowMap(item)}>
                🗺️ Lihat di Peta
              </button>
              <button className="btn btn-primary" onClick={() => onEdit(item.id)}>
                ✏️ Edit Wisata
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
