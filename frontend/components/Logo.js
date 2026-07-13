export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pesona Nusantara"
    >
      <defs>
        <linearGradient id="logoSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3ba6d6" />
          <stop offset="100%" stopColor="#1f7a9c" />
        </linearGradient>
        <linearGradient id="logoLand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4caf50" />
          <stop offset="100%" stopColor="#2e7d32" />
        </linearGradient>
      </defs>

      {/* base circle */}
      <circle cx="24" cy="24" r="23" fill="url(#logoSky)" />

      {/* sun */}
      <circle cx="33" cy="15" r="5" fill="#ffd24a" />

      {/* mountains / islands */}
      <path
        d="M4 34 L16 18 L24 28 L31 20 L44 34 Z"
        fill="url(#logoLand)"
      />
      {/* mountain snow cap */}
      <path d="M16 18 L12 23 L20 23 Z" fill="#ffffff" fillOpacity="0.85" />

      {/* sea waves */}
      <path
        d="M4 34 H44 V44 A23 23 0 0 1 4 44 Z"
        fill="#1f7a9c"
      />
      <path
        d="M8 38 q3 -2 6 0 t6 0 t6 0 t6 0"
        stroke="#ffffff"
        strokeOpacity="0.6"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
