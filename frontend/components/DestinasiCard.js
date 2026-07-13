'use client';

import { safeImg, formatNumber, formatRupiah, PLACEHOLDER } from '@/lib/api';

export default function DestinasiCard({ item, index, limit, onDetail, onEdit, onDelete }) {
  return (
    <article className="dest-card" style={{ animationDelay: `${(index % limit) * 60}ms` }}>
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
