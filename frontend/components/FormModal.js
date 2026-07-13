'use client';

import { useEffect, useRef, useState } from 'react';

const EMPTY = {
  nama: '',
  provinsi: '',
  kategori: '',
  rating: '',
  hargaTiket: '',
  pengunjungPerBulan: '',
  gambar: '',
  latitude: '',
  longitude: '',
  fasilitas: '',
};

// Ubah File/Blob gambar menjadi data URL base64 yang sudah dikompres,
// supaya ukuran kecil & bisa langsung disimpan tanpa masalah hotlink.
function fileToCompressedDataUrl(file, maxSize = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width >= height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function FormModal({ open, mode, initial, meta, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setImgError('');
      setImgBusy(false);
      if (initial) {
        setForm({
          nama: initial.nama ?? '',
          provinsi: initial.provinsi ?? '',
          kategori: initial.kategori ?? '',
          rating: initial.rating ?? '',
          hargaTiket: initial.hargaTiket ?? '',
          pengunjungPerBulan: initial.pengunjungPerBulan ?? '',
          gambar: initial.gambar ?? '',
          latitude: initial.latitude ?? '',
          longitude: initial.longitude ?? '',
          fasilitas: (initial.fasilitas ?? []).join(', '),
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, initial]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Proses file gambar (dari tombol pilih, drag-drop, atau paste) → data URL
  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImgError('File yang dipilih bukan gambar.');
      return;
    }
    setImgBusy(true);
    setImgError('');
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setForm((f) => ({ ...f, gambar: dataUrl }));
    } catch (err) {
      setImgError(err.message || 'Gagal memproses gambar.');
    } finally {
      setImgBusy(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    handleImageFile(file);
  };

  // Paste gambar langsung dari clipboard (mis. hasil "Copy image" dari Google)
  const onPaste = (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const item of items) {
      if (item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleImageFile(file);
          return;
        }
      }
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = (v) => (v === '' ? null : Number(v));
    onSubmit({
      nama: form.nama.trim(),
      provinsi: form.provinsi.trim(),
      kategori: form.kategori.trim(),
      rating: num(form.rating),
      hargaTiket: num(form.hargaTiket),
      pengunjungPerBulan: num(form.pengunjungPerBulan),
      gambar: form.gambar.trim(),
      latitude: num(form.latitude),
      longitude: num(form.longitude),
      fasilitas: form.fasilitas
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal form-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h3>{mode === 'edit' ? '✏️ Edit Wisata' : '➕ Tambah Wisata Baru'}</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Nama Wisata *
            <input type="text" value={form.nama} onChange={set('nama')} required />
          </label>
          <div className="form-grid">
            <label>
              Provinsi *
              <input type="text" list="provinsiList" value={form.provinsi} onChange={set('provinsi')} required />
              <datalist id="provinsiList">
                {meta.provinsi.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </label>
            <label>
              Kategori *
              <input type="text" list="kategoriList" value={form.kategori} onChange={set('kategori')} required />
              <datalist id="kategoriList">
                {meta.kategori.map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
            </label>
            <label>
              Rating (0-5)
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={set('rating')} />
            </label>
            <label>
              Harga Tiket (IDR)
              <input type="number" min="0" value={form.hargaTiket} onChange={set('hargaTiket')} />
            </label>
            <label>
              Pengunjung / Bulan
              <input type="number" min="0" value={form.pengunjungPerBulan} onChange={set('pengunjungPerBulan')} />
            </label>
            <label>
              Latitude
              <input type="number" step="any" value={form.latitude} onChange={set('latitude')} />
            </label>
            <label>
              Longitude
              <input type="number" step="any" value={form.longitude} onChange={set('longitude')} />
            </label>
          </div>

          <label>
            Gambar Wisata
            <div
              className="img-uploader"
              onPaste={onPaste}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              tabIndex={0}
            >
              {form.gambar ? (
                <div className="img-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.gambar} alt="Pratinjau" onError={() => setImgError('Gambar tidak dapat ditampilkan. Coba unggah/paste ulang.')} />
                  <button
                    type="button"
                    className="img-remove"
                    title="Hapus gambar"
                    onClick={() => {
                      setForm((f) => ({ ...f, gambar: '' }));
                      setImgError('');
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="img-drop" onClick={() => fileInputRef.current?.click()}>
                  <span className="img-drop-icon">🖼️</span>
                  <span>{imgBusy ? 'Memproses gambar...' : 'Klik untuk pilih, atau tempel (Ctrl+V) / seret gambar ke sini'}</span>
                  <small>Salin gambar dari Google lalu tekan Ctrl+V di area ini</small>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              style={{ display: 'none' }}
            />
            <div className="img-actions">
              <button type="button" className="img-btn" onClick={() => fileInputRef.current?.click()} disabled={imgBusy}>
                📁 Pilih File
              </button>
              <input
                type="text"
                className="img-url-input"
                placeholder="atau tempel URL gambar (https://...)"
                value={/^data:/i.test(form.gambar) ? '' : form.gambar}
                onChange={(e) => {
                  setForm((f) => ({ ...f, gambar: e.target.value }));
                  setImgError('');
                }}
              />
            </div>
            {imgError && <span className="img-error">⚠️ {imgError}</span>}
          </label>

          <label>
            Fasilitas (pisahkan dengan koma)
            <input
              type="text"
              placeholder="Toilet, Area Parkir, Warung Makan"
              value={form.fasilitas}
              onChange={set('fasilitas')}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" style={{ color: 'var(--slate)', border: '1.5px solid #e2e8f0', background: 'transparent' }} onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              {mode === 'edit' ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
