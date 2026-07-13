'use client';

import DestinasiCard from './DestinasiCard';
import CustomSelect from './CustomSelect';
import { formatNumber } from '@/lib/api';

const KATEGORI_ICON = {
  Pantai: '🏖️',
  'Pantai & Bahari': '🏖️',
  'Alam & Bahari': '🌊',
  'Alam & Pegunungan': '⛰️',
  'Alam & Danau': '🏞️',
  'Alam & Fauna': '🦎',
  'Alam & Flora': '🌸',
  Alam: '🌿',
  'Sejarah & Budaya': '🏛️',
  'Budaya & Religi': '🛕',
  'Budaya & Sejarah': '🏯',
  Religi: '🕌',
  Kuliner: '🍜',
  'Taman Hiburan': '🎡',
  'Taman & Rekreasi': '🎠',
  Edukasi: '📚',
};

function iconFor(kategori) {
  if (KATEGORI_ICON[kategori]) return KATEGORI_ICON[kategori];
  const k = (kategori || '').toLowerCase();
  if (k.includes('pantai') || k.includes('bahari')) return '🏖️';
  if (k.includes('gunung') || k.includes('pegunungan')) return '⛰️';
  if (k.includes('danau')) return '🏞️';
  if (k.includes('budaya') || k.includes('sejarah')) return '🏛️';
  if (k.includes('religi')) return '🕌';
  if (k.includes('kuliner')) return '🍜';
  if (k.includes('taman') || k.includes('hiburan')) return '🎡';
  if (k.includes('alam')) return '🌿';
  return '📍';
}

export default function Explore({
  items,
  total,
  loading,
  meta,
  filters,
  onFilterChange,
  onLoadMore,
  onDetail,
  onEdit,
  onDelete,
}) {
  const hasMore = items.length < total;

  return (
    <section className="explore" id="explore">
      <div className="section-head reveal">
        <span className="eyebrow">Katalog Wisata</span>
        <h2>Jelajahi Wisata Impianmu</h2>
        <p>Gunakan filter untuk menemukan tempat wisata yang sesuai seleramu.</p>
      </div>

      <div className="filter-panel reveal reveal-d1">
        <div className="filter-top">
          <div className="filter-search-box">
            <span className="fs-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari nama wisata, provinsi, atau kategori..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
            {filters.search && (
              <button className="fs-clear" onClick={() => onFilterChange('search', '')} title="Bersihkan">
                ✕
              </button>
            )}
          </div>
          <div className="result-badge">
            <span className="rb-num">{formatNumber(total)}</span>
            <span className="rb-lbl">wisata ditemukan</span>
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-field">
            <label>🗺️ Provinsi</label>
            <CustomSelect
              value={filters.provinsi}
              onChange={(v) => onFilterChange('provinsi', v)}
              placeholder="Semua Provinsi"
              searchable
              options={[
                { value: '', label: 'Semua Provinsi', icon: '🇮🇩' },
                ...meta.provinsi.map((p) => ({ value: p, label: p, icon: '📍' })),
              ]}
            />
          </div>
          <div className="filter-field">
            <label>🎯 Kategori</label>
            <CustomSelect
              value={filters.kategori}
              onChange={(v) => onFilterChange('kategori', v)}
              placeholder="Semua Kategori"
              searchable
              options={[
                { value: '', label: 'Semua Kategori', icon: '✨' },
                ...meta.kategori.map((k) => ({ value: k, label: k, icon: iconFor(k) })),
              ]}
            />
          </div>
          <div className="filter-field">
            <label>↕️ Urutkan</label>
            <CustomSelect
              value={filters.sortValue}
              onChange={(v) => onFilterChange('sortValue', v)}
              placeholder="Paling Relevan"
              options={[
                { value: '', label: 'Paling Relevan', icon: '🎲' },
                { value: 'rating|desc', label: 'Rating Tertinggi', icon: '⭐' },
                { value: 'rating|asc', label: 'Rating Terendah', icon: '⬇️' },
                { value: 'hargaTiket|asc', label: 'Harga Termurah', icon: '💰' },
                { value: 'hargaTiket|desc', label: 'Harga Termahal', icon: '💸' },
                { value: 'pengunjungPerBulan|desc', label: 'Paling Populer', icon: '🔥' },
                { value: 'nama|asc', label: 'Nama A-Z', icon: '🔤' },
              ]}
            />
          </div>
        </div>

        <div className="kategori-chips">
          <button
            className={`chip ${filters.kategori === '' ? 'active' : ''}`}
            onClick={() => onFilterChange('kategori', '')}
          >
            ✨ Semua
          </button>
          {meta.kategori.map((k) => (
            <button
              key={k}
              className={`chip ${filters.kategori === k ? 'active' : ''}`}
              onClick={() => onFilterChange('kategori', filters.kategori === k ? '' : k)}
            >
              <span>{iconFor(k)}</span> {k}
            </button>
          ))}
        </div>
      </div>

      <div className="result-info">
        <span>
          {loading && items.length === 0
            ? '⏳ Memuat wisata...'
            : `Menampilkan ${items.length} dari ${formatNumber(total)} wisata`}
        </span>
      </div>

      <div className="card-grid">
        {loading && items.length === 0
          ? Array.from({ length: 8 }).map((_, i) => <div className="skeleton-card" key={i} />)
          : items.length === 0
          ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--slate)', padding: 40 }}>
              😕 Tidak ada wisata yang cocok dengan pencarianmu.
            </p>
          )
          : items.map((item, i) => (
              <DestinasiCard
                key={item.id}
                item={item}
                index={i}
                limit={filters.limit}
                onDetail={onDetail}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
      </div>

      <div className="load-more-wrap">
        {hasMore && !loading && (
          <button className="btn btn-outline" onClick={onLoadMore}>
            Muat Lebih Banyak
          </button>
        )}
      </div>
    </section>
  );
}
