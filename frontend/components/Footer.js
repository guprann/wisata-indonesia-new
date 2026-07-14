import Logo from './Logo';

const FIREFLIES = [
  { x: '8%', y: '30%', d: 0 },
  { x: '22%', y: '62%', d: 1.2 },
  { x: '38%', y: '25%', d: 2.4 },
  { x: '55%', y: '55%', d: 0.6 },
  { x: '70%', y: '35%', d: 1.8 },
  { x: '84%', y: '60%', d: 3 },
  { x: '93%', y: '28%', d: 2.1 },
];

export default function Footer() {
  return (
    <footer className="footer">
      {/* Ombak 3D di puncak footer */}
      <div className="footer-waves" aria-hidden="true">
        <span className="wave w1" />
        <span className="wave w2" />
        <span className="wave w3" />
      </div>

      {/* Kunang-kunang melayang */}
      <div className="fireflies" aria-hidden="true">
        {FIREFLIES.map((f, i) => (
          <span key={i} className="firefly" style={{ left: f.x, top: f.y, animationDelay: `${f.d}s` }} />
        ))}
      </div>

      {/* Siluet pohon kelapa bergoyang */}
      <span className="footer-palm fp-left" aria-hidden="true">🌴</span>
      <span className="footer-palm fp-right" aria-hidden="true">🌴</span>

      <div className="footer-inner">
        <div className="footer-brand reveal reveal-left">
          <span className="brand-icon"><Logo size={52} /></span>
          <h3>Pesona Nusantara</h3>
          <p>Menjelajahi keindahan Indonesia, satu wisata dalam satu waktu.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Pesona Nusantara · Dibuat dengan ❤️ untuk Indonesia</p>
      </div>
    </footer>
  );
}
