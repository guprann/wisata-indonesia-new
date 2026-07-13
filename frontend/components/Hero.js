'use client';

export default function Hero({ search, onSearch }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-layer layer-1"></div>
        <div className="hero-layer layer-2"></div>
        <div className="hero-layer layer-3"></div>
      </div>
      <div className="clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>
      <div className="hero-content">
        <p className="hero-tag">✨ Dari Sabang sampai Merauke</p>
        <h1 className="hero-title">
          Jelajahi <span className="gradient-text">Pesona</span>
          <br />
          Wisata <span className="gradient-text">Indonesia</span>
        </h1>
        <p className="hero-subtitle">
          Temukan ribuan wisata menakjubkan — pantai eksotis, gunung megah, candi bersejarah, dan
          budaya yang memukau di seluruh Nusantara.
        </p>
        <div className="hero-actions">
          <a href="#explore" className="btn btn-primary">
            🧭 Mulai Jelajah
          </a>
          <a href="#kelola" className="btn btn-ghost">
            ➕ Tambah Wisata
          </a>
        </div>
      </div>
      <div className="hero-search">
        <input
          type="text"
          value={search}
          placeholder="🔍 Cari wisata, provinsi, atau kategori..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <a href="#stats" className="scroll-down" aria-label="Scroll ke bawah">
        <span></span>
      </a>
    </section>
  );
}
