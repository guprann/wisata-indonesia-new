'use client';

// Kubus 3D dekoratif yang berputar perlahan. Murni CSS (6 sisi), ringan,
// dipakai sebagai aksen kedalaman di beberapa seksi. Tidak interaktif.
export default function Cube3D({ className = '', size = 90 }) {
  return (
    <div className={`cube3d ${className}`} style={{ '--cube': `${size}px` }} aria-hidden="true">
      <div className="cube3d-inner">
        <span className="cf cf-front" />
        <span className="cf cf-back" />
        <span className="cf cf-right" />
        <span className="cf cf-left" />
        <span className="cf cf-top" />
        <span className="cf cf-bottom" />
      </div>
    </div>
  );
}
