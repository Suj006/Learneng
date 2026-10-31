/**
 * The hero's living fantasy world, drawn in SVG + CSS (no images, no WebGL): drifting clouds, floating islands,
 * a rainbow pathway, a glowing portal, a distant castle and twinkling stars. Colours follow the active theme.
 * Animations are CSS only (cheap), fewer elements on phones, and all stop with reduced motion / "Still".
 */
export function HeroWorld() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* soft light */}
      <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-vibe-pink/20 blur-3xl" />
      <div className="absolute -right-32 top-10 h-[30rem] w-[30rem] rounded-full bg-vibe-aqua/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-vibe-sun/20 blur-3xl" />
      {/* stars */}
      {Array.from({ length: 18 }, (_, i) => (
        <span key={i} className={`absolute h-1.5 w-1.5 animate-twinkle rounded-full bg-vibe-sun ${i % 3 ? "hidden sm:block" : ""}`}
          style={{ left: `${(i * 53) % 97}%`, top: `${(i * 37) % 60}%`, animationDelay: `${(i % 6) * 0.5}s` }} />
      ))}
      {/* drifting clouds (two copies for a seamless loop) */}
      <div className="absolute inset-x-0 top-16 flex w-[200%] animate-drift opacity-80">
        {[0, 1].map((k) => (
          <svg key={k} viewBox="0 0 1200 120" className="h-20 w-1/2 sm:h-28">
            {[[80, 60, 1], [420, 40, 0.8], [760, 70, 1.1], [1060, 45, 0.7]].map(([x, y, s]) => (
              <g key={x} transform={`translate(${x} ${y}) scale(${s})`} fill="white" opacity="0.9">
                <ellipse cx="0" cy="0" rx="60" ry="22" /><ellipse cx="-34" cy="6" rx="34" ry="18" /><ellipse cx="36" cy="8" rx="38" ry="16" />
              </g>
            ))}
          </svg>
        ))}
      </div>
      {/* rainbow pathway + portal + islands + castle */}
      {/* Phones: the world sits low under the content. Desktop: it fills the right side, behind the characters. */}
      <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" className="absolute bottom-0 right-0 h-[38%] w-full opacity-80 sm:h-[50%] lg:h-[86%] lg:w-[64%] lg:opacity-100">
        <defs>
          <linearGradient id="pv-rainbow" x1="0" x2="1">
            <stop offset="0" stopColor="#F52F83" /><stop offset="0.2" stopColor="#FF9B24" /><stop offset="0.4" stopColor="#FFD33F" />
            <stop offset="0.6" stopColor="#55D934" /><stop offset="0.8" stopColor="#16B9E9" /><stop offset="1" stopColor="#852DEB" />
          </linearGradient>
          <radialGradient id="pv-portal"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.45" stopColor="#16B9E9" /><stop offset="1" stopColor="#852DEB" stopOpacity="0" /></radialGradient>
          <linearGradient id="pv-isle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FE08A" /><stop offset="0.25" stopColor="#55D934" /><stop offset="0.3" stopColor="#B07A4A" /><stop offset="1" stopColor="#6B4226" stopOpacity="0.9" /></linearGradient>
        </defs>
        {/* distant castle */}
        <g transform="translate(905 255)" opacity="0.55" className="hidden sm:block">
          <rect x="-60" y="0" width="120" height="90" rx="6" fill="#C9B8FF" /><rect x="-90" y="-30" width="30" height="120" fill="#B49CFF" /><rect x="60" y="-30" width="30" height="120" fill="#B49CFF" />
          <path d="M-96 -30 L-75 -70 L-54 -30 Z M54 -30 L75 -70 L96 -30 Z" fill="#852DEB" /><rect x="-12" y="40" width="24" height="50" rx="12" fill="#852DEB" />
        </g>
        {/* rainbow path */}
        <path d="M-40 640 C 220 420, 520 360, 640 330 S 1000 230, 1260 160" fill="none" stroke="url(#pv-rainbow)" strokeWidth="26" strokeLinecap="round" opacity="0.75" />
        <path d="M-40 640 C 220 420, 520 360, 640 330 S 1000 230, 1260 160" fill="none" stroke="white" strokeWidth="4" strokeDasharray="6 26" strokeLinecap="round" opacity="0.8" className="pv-dash" />
        {/* glowing portal */}
        <g transform="translate(640 318)"><ellipse rx="70" ry="88" fill="url(#pv-portal)" className="pv-pulse" /><ellipse rx="54" ry="70" fill="none" stroke="white" strokeWidth="3" opacity="0.8" /></g>
        {/* floating islands */}
        {[[170, 520, 1.1, 0], [430, 430, 0.75, 1], [1030, 470, 1, 2], [820, 560, 0.7, 3]].map(([x, y, s, d]) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${s})`} className={d === 3 ? "hidden sm:block" : ""}>
            <g className="pv-bob" style={{ animationDelay: `${d * 0.8}s` }}>
              <path d="M-110 0 Q0 -26 110 0 L60 70 Q0 120 -60 70 Z" fill="url(#pv-isle)" />
              <circle cx="-40" cy="-28" r="26" fill="#2FBF71" /><rect x="-44" y="-10" width="8" height="14" fill="#6B4226" />
              <circle cx="46" cy="-16" r="10" fill="#FFD33F" /><text x="10" y="-6" fontSize="26">{["🔤", "📚", "✨", "💎"][d]}</text>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
