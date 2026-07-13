'use client';

import { useEffect } from 'react';

// Menyetel variabel CSS global --px / --py (kisaran -0.5..0.5) berdasarkan
// posisi mouse, dengan easing lembut (lerp) agar pergerakan parallax 3D
// terasa halus dan nyaman di mata. Menghormati prefers-reduced-motion.
export default function Parallax3D() {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf;

    const onMove = (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };

    const loop = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      root.style.setProperty('--px', cx.toFixed(4));
      root.style.setProperty('--py', cy.toFixed(4));
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
