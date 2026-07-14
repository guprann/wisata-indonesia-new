'use client';

// Lapisan ambient alam yang menutupi seluruh halaman (fixed, pointer-events none):
// daun berguguran dengan rotasi 3D dan kupu-kupu yang terbang melayang.
// Konfigurasi statis (bukan Math.random) agar aman dari hydration mismatch.

const LEAVES = [
  { x: '4%', size: 20, dur: 14, delay: 0, e: '🍃' },
  { x: '13%', size: 26, dur: 18, delay: 3, e: '🍂' },
  { x: '25%', size: 17, dur: 15, delay: 6.5, e: '🍃' },
  { x: '37%', size: 23, dur: 20, delay: 1.5, e: '🌿' },
  { x: '51%', size: 19, dur: 14, delay: 8, e: '🍂' },
  { x: '63%', size: 27, dur: 19, delay: 4.2, e: '🍃' },
  { x: '75%', size: 17, dur: 16, delay: 10, e: '🌿' },
  { x: '86%', size: 22, dur: 21, delay: 2.2, e: '🍂' },
  { x: '94%', size: 16, dur: 15, delay: 7, e: '🍃' },
];

const BUTTERFLIES = [
  { x: '10%', y: '28%', dur: 12, delay: 0 },
  { x: '72%', y: '52%', dur: 14, delay: 3 },
  { x: '42%', y: '74%', dur: 16, delay: 6 },
];

export default function NatureScene() {
  return (
    <div className="nature-scene" aria-hidden="true">
      {LEAVES.map((l, i) => (
        <span
          key={`leaf-${i}`}
          className="leaf"
          style={{
            '--lx': l.x,
            '--lsize': `${l.size}px`,
            '--ldur': `${l.dur}s`,
            '--ldelay': `${l.delay}s`,
          }}
        >
          {l.e}
        </span>
      ))}
      {BUTTERFLIES.map((b, i) => (
        <span
          key={`bf-${i}`}
          className="butterfly"
          style={{ left: b.x, top: b.y, '--bdur': `${b.dur}s`, animationDelay: `${b.delay}s` }}
        >
          🦋
        </span>
      ))}
    </div>
  );
}
