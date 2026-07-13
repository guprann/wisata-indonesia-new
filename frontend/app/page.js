'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Explore from '@/components/Explore';
import DetailModal from '@/components/DetailModal';
import FormModal from '@/components/FormModal';
import Peta from '@/components/Peta';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import Parallax3D from '@/components/Parallax3D';
import Cube3D from '@/components/Cube3D';
import { useToast } from '@/components/ToastProvider';
import { api } from '@/lib/api';

const LIMIT = 12;

export default function Home() {
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState({ provinsi: [], kategori: [] });

  const [filters, setFilters] = useState({
    search: '',
    provinsi: '',
    kategori: '',
    sortValue: '',
    limit: LIMIT,
  });
  const [page, setPage] = useState(1);

  const [detailItem, setDetailItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formInitial, setFormInitial] = useState(null);
  const [mapMarker, setMapMarker] = useState(null);

  const searchTimer = useRef(null);

  const buildParams = useCallback(
    (pageNum) => {
      const [sort, order] = filters.sortValue ? filters.sortValue.split('|') : ['', 'asc'];
      return {
        search: filters.search,
        provinsi: filters.provinsi,
        kategori: filters.kategori,
        sort,
        order,
        page: pageNum,
        limit: LIMIT,
      };
    },
    [filters]
  );

  const loadData = useCallback(
    async (reset = true, pageNum = 1) => {
      setLoading(true);
      try {
        const res = await api.list(buildParams(pageNum));
        setTotal(res.total);
        setItems((prev) => (reset ? res.data : [...prev, ...res.data]));
      } catch (e) {
        toast(e.message, 'error');
      } finally {
        setLoading(false);
      }
    },
    [buildParams, toast]
  );

  // initial load
  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    api.meta().then(setMeta).catch(() => {});
  }, []);

  // reload when filters change (debounce search)
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadData(true, 1);
    }, 300);
    return () => clearTimeout(searchTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const refreshStats = () => api.stats().then(setStats).catch(() => {});

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadData(false, next);
  };

  // ---- Detail ----
  const openDetail = async (id) => {
    try {
      const item = await api.getOne(id);
      setDetailItem(item);
      setDetailOpen(true);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  // ---- Create / Edit ----
  const openCreate = () => {
    setFormMode('create');
    setFormInitial(null);
    setFormOpen(true);
  };

  const openEdit = async (id) => {
    try {
      const item = await api.getOne(id);
      setFormMode('edit');
      setFormInitial(item);
      setDetailOpen(false);
      setFormOpen(true);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleSubmit = async (payload) => {
    try {
      if (formMode === 'edit' && formInitial) {
        const res = await api.replace(formInitial.id, payload); // PUT
        // Perbarui item langsung di daftar & detail agar perubahan terlihat seketika
        setItems((prev) => prev.map((it) => (it.id === formInitial.id ? res.data : it)));
        setDetailItem((prev) => (prev && prev.id === formInitial.id ? res.data : prev));
        toast('Wisata berhasil diperbarui (PUT).');
      } else {
        const res = await api.create(payload); // POST
        setItems((prev) => [res.data, ...prev]); // tampilkan di paling atas
        setTotal((t) => t + 1);
        toast('Wisata baru berhasil ditambahkan (POST).');
      }
      setFormOpen(false);
      await refreshStats();
      api.meta().then(setMeta).catch(() => {});
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  // ---- Delete ----
  const handleDelete = async (item) => {
    if (!confirm(`Hapus wisata "${item.nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.remove(item.id); // DELETE
      setItems((prev) => prev.filter((it) => it.id !== item.id)); // hapus dari daftar seketika
      setTotal((t) => Math.max(0, t - 1));
      toast(`"${item.nama}" berhasil dihapus (DELETE).`);
      await refreshStats();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  // ---- Peta ----
  const showOnMap = (item) => {
    if (!item.latitude || !item.longitude) {
      toast('Koordinat lokasi tidak tersedia.', 'info');
      return;
    }
    setMapMarker(item);
    setDetailOpen(false);
    toast(`Menampilkan lokasi ${item.nama} di peta`, 'info');
    setTimeout(() => document.getElementById('peta')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <>
      <ScrollReveal />
      <Parallax3D />
      <Navbar />
      <Hero search={filters.search} onSearch={(v) => handleFilterChange('search', v)} />
      <Stats stats={stats} />
      <Explore
        items={items}
        total={total}
        loading={loading}
        meta={meta}
        filters={filters}
        onFilterChange={handleFilterChange}
        onLoadMore={handleLoadMore}
        onDetail={openDetail}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <section className="kelola" id="kelola">
        <Cube3D className="decor-cube decor-cube-a" size={80} />
        <Cube3D className="decor-cube decor-cube-b" size={54} />
        <div className="section-head reveal">
          <span className="eyebrow">Manajemen Data</span>
          <h2>Kelola Data Wisata</h2>
          <p>Tambah, ubah, dan hapus wisata dengan mudah.</p>
        </div>
        <div className="kelola-inner reveal reveal-scale reveal-d1">
          <button className="btn btn-primary" onClick={openCreate}>
            ➕ Tambah Wisata Baru
          </button>
          <p className="kelola-hint">
            Klik tombol edit / hapus pada setiap kartu wisata di atas untuk mengelola data.
          </p>
        </div>
      </section>

      <Peta marker={mapMarker} />
      <Footer />

      <DetailModal
        item={detailItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
        onShowMap={showOnMap}
      />
      <FormModal
        open={formOpen}
        mode={formMode}
        initial={formInitial}
        meta={meta}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
