'use client';

// Pulau tropis melayang dengan CSS 3D murni: lempeng tanah bertumpuk,
// gunung, pohon kelapa, air terjun, awan mengorbit, burung & matahari.
export default function FloatingIsland() {
  return (
    <div className="island-scene" aria-hidden="true">
      {/* Matahari + sinar berputar */}
      <div className="island-sun">
        <span className="sun-core" />
        <span className="sun-rays" />
      </div>

      {/* Pulau utama */}
      <div className="island">
        {/* lempeng tanah 3D bertumpuk */}
        <div className="island-slab slab-1" />
        <div className="island-slab slab-2" />
        <div className="island-slab slab-3" />

        {/* gunung */}
        <div className="island-mount">
          <span className="mount-peak" />
          <span className="mount-snow" />
        </div>

        {/* pohon kelapa */}
        <div className="palm palm-1">
          <span className="palm-trunk" />
          <span className="palm-leaves">🌴</span>
        </div>
        <div className="palm palm-2">
          <span className="palm-trunk" />
          <span className="palm-leaves">🌴</span>
        </div>

        {/* air terjun jatuh dari sisi pulau */}
        <div className="waterfall">
          <span className="wf-stream" />
          <span className="wf-drop d1" />
          <span className="wf-drop d2" />
          <span className="wf-drop d3" />
        </div>

        {/* bayangan lembut di bawah pulau */}
        <div className="island-shadow" />
      </div>

      {/* awan mengorbit pulau (kedalaman 3D) */}
      <div className="cloud-orbit co-1"><span className="cloud3d">☁️</span></div>
      <div className="cloud-orbit co-2"><span className="cloud3d">☁️</span></div>
      <div className="cloud-orbit co-3"><span className="cloud3d">☁️</span></div>

      {/* burung terbang */}
      <span className="bird b1">🕊️</span>
      <span className="bird b2">🕊️</span>

      {/* batu kecil melayang di sekitar pulau */}
      <span className="float-rock r1" />
      <span className="float-rock r2" />
      <span className="float-rock r3" />
    </div>
  );
}
