'use client';

import Cube3D from './Cube3D';

export default function Peta({ marker }) {
  let src = null;
  if (marker && marker.latitude && marker.longitude) {
    const { latitude: lat, longitude: lng } = marker;
    const bbox = `${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}`;
    src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  }

  return (
    <section className="peta" id="peta">
      <Cube3D className="decor-cube decor-cube-a" size={70} />
      <Cube3D className="decor-cube decor-cube-b" size={50} />
      <div className="section-head reveal">
        <span className="eyebrow">Sebaran Lokasi</span>
        <h2>Peta Wisata Nusantara</h2>
      </div>
      <div className="peta-embed reveal reveal-scale reveal-d1">
        {src ? (
          <iframe src={src} title={`Peta ${marker.nama}`} />
        ) : (
          <div className="peta-placeholder">Pilih sebuah wisata untuk melihat lokasinya di peta 📍</div>
        )}
      </div>
    </section>
  );
}
