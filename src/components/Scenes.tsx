"use client";
import { useId } from "react";
/** Original illustrated scenes for PING VIBE kingdoms (pure SVG, no external assets). */
export type SceneName = "forest" | "galaxy" | "castle" | "mountains" | "ocean" | "arena" | "islands";

const Stars = ({ n = 24, seed = 1 }: { n?: number; seed?: number }) => (
  <g fill="#fff">
    {Array.from({ length: n }, (_, i) => {
      const x = (i * 73 * seed) % 400, y = (i * 37 * seed) % 140;
      return <circle key={i} cx={x} cy={y} r={(i % 3) * 0.6 + 0.6} className="animate-twinkle" style={{ animationDelay: `${(i % 7) * 0.4}s` }} />;
    })}
  </g>
);

function Island({ x, y, s = 1, top = "#5BE3A8", children }: { x: number; y: number; s?: number; top?: string; children?: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-50 0 Q0 -14 50 0 L30 22 L10 54 L-6 30 L-26 40 Z" fill="#8B5E3C" />
      <path d="M-50 0 Q0 -14 50 0 Q0 10 -50 0 Z" fill={top} />
      <path d="M-20 20 L-24 60" stroke="#8EE3F5" strokeWidth={5} opacity={0.8} />
      {children}
    </g>
  );
}

export function Scene({ name, className = "" }: { name: SceneName; className?: string }) {
  // Unique gradient ids per drawing: the same scene often appears twice on a page (desktop + mobile layouts), and a
  // gradient defined inside a hidden copy does not paint, which left the visible copy without its sky.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const common = { viewBox: "0 0 400 220", preserveAspectRatio: "xMidYMid slice", className: `h-full w-full ${className}`, "aria-hidden": true } as const;
  switch (name) {
    case "forest":
      return (
        <svg {...common}>
          <defs><linearGradient id={`sf${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E3B2E" /><stop offset="1" stopColor="#1F7A57" /></linearGradient></defs>
          <rect width="400" height="220" fill={`url(#sf${uid})`} />
          <circle cx="320" cy="50" r="26" fill="#FFD65A" opacity="0.85" />
          {[[30, 1.1], [90, 0.8], [150, 1.3], [230, 0.9], [300, 1.2], [370, 0.85]].map(([x, s], i) => (
            <g key={i} transform={`translate(${x} 200) scale(${s})`}><rect x="-6" y="-40" width="12" height="40" fill="#6B4226" /><path d="M0 -130 L40 -40 L-40 -40 Z" fill={i % 2 ? "#2FBF71" : "#5BE3A8"} /><path d="M0 -150 L30 -80 L-30 -80 Z" fill="#7FF0B6" /></g>
          ))}
          {[[60, 150], [200, 120], [330, 160], [120, 90]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#FFF59D" className="animate-twinkle" style={{ animationDelay: `${i * 0.6}s` }} />)}
          <g transform="translate(250 190)"><rect x="-4" y="-18" width="8" height="18" fill="#fff" /><ellipse cx="0" cy="-20" rx="16" ry="10" fill="#FF6B6B" /><circle cx="-6" cy="-22" r="3" fill="#fff" /><circle cx="6" cy="-18" r="2" fill="#fff" /></g>
        </svg>
      );
    case "galaxy":
      return (
        <svg {...common}>
          <defs><radialGradient id={`sg${uid}`} cx="50%" cy="40%" r="80%"><stop offset="0" stopColor="#4F2BD9" /><stop offset="1" stopColor="#0B0820" /></radialGradient></defs>
          <rect width="400" height="220" fill={`url(#sg${uid})`} /><Stars n={40} seed={3} />
          <circle cx="110" cy="110" r="44" fill="#FF7AC6" /><ellipse cx="110" cy="110" rx="76" ry="14" fill="none" stroke="#FFD65A" strokeWidth="5" transform="rotate(-15 110 110)" />
          <circle cx="300" cy="70" r="22" fill="#39D5E8" /><circle cx="292" cy="64" r="6" fill="#ffffff70" />
          <circle cx="340" cy="170" r="12" fill="#FFD65A" />
          <path d="M210 160 l10 -26 10 26 -10 -6 Z" fill="#fff" /><path d="M215 162 l5 14 5 -14" fill="#FF6B6B" />
        </svg>
      );
    case "castle":
      return (
        <svg {...common}>
          <defs><linearGradient id={`sc${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF9A8B" /><stop offset="1" stopColor="#FFD65A" /></linearGradient></defs>
          <rect width="400" height="220" fill={`url(#sc${uid})`} />
          <path d="M0 190 Q200 160 400 190 L400 220 L0 220 Z" fill="#5BE3A8" />
          <g transform="translate(200 190)">
            <rect x="-70" y="-90" width="140" height="90" fill="#EAE4FF" />
            {[-70, -10, 50].map((x) => <rect key={x} x={x} y="-130" width="20" height="40" fill="#D7CCFF" />)}
            {[-80, 60].map((x) => <g key={x}><rect x={x} y="-140" width="22" height="140" fill="#C9B8FF" /><path d={`M${x - 4} -140 L${x + 11} -175 L${x + 26} -140 Z`} fill="#7047FF" /><path d={`M${x + 11} -175 l0 -14 l12 5 l-12 5`} fill="#FF6B6B" /></g>)}
            <path d="M-16 0 L-16 -36 Q0 -54 16 -36 L16 0 Z" fill="#7047FF" />
            {[-46, 32].map((x) => <rect key={x} x={x} y="-70" width="14" height="18" rx="7" fill="#FFD65A" />)}
          </g>
          <ellipse cx="60" cy="50" rx="34" ry="12" fill="#fff" opacity="0.8" /><ellipse cx="330" cy="40" rx="40" ry="13" fill="#fff" opacity="0.8" />
        </svg>
      );
    case "mountains":
      return (
        <svg {...common}>
          <defs><linearGradient id={`sm${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E8BFF" /><stop offset="1" stopColor="#BDEBFF" /></linearGradient></defs>
          <rect width="400" height="220" fill={`url(#sm${uid})`} />
          <path d="M-20 220 L90 60 L200 220 Z" fill="#6B6FD9" /><path d="M90 60 L118 100 L100 96 L84 110 L70 92 Z" fill="#fff" />
          <path d="M120 220 L260 40 L400 220 Z" fill="#5A54C7" /><path d="M260 40 L296 86 L272 80 L254 96 L238 70 Z" fill="#fff" />
          <path d="M260 220 L360 110 L460 220 Z" fill="#7C79E0" />
          <g stroke="#FFD65A" strokeWidth="3" fill="none" className="animate-twinkle"><path d="M300 30 q10 10 0 20" /><path d="M312 24 q16 16 0 32" /></g>
        </svg>
      );
    case "ocean":
      return (
        <svg {...common}>
          <defs><linearGradient id={`so${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#39D5E8" /><stop offset="1" stopColor="#0B3D91" /></linearGradient></defs>
          <rect width="400" height="220" fill={`url(#so${uid})`} />
          {[60, 140, 260, 330].map((x, i) => <path key={x} d={`M${x} 220 Q${x - 14} 180 ${x} 160 Q${x + 14} 180 ${x} 220`} fill={["#FF6B6B", "#FFD65A", "#FF7AC6", "#5BE3A8"][i]} />)}
          {[[120, 80], [220, 120], [300, 70]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><ellipse rx="14" ry="8" fill="#FFA94D" /><path d="M12 0 l10 -7 0 14 Z" fill="#FFA94D" /><circle cx="-6" cy="-2" r="2" fill="#1E1A3A" /></g>)}
          {[40, 180, 360].map((x, i) => <circle key={x} cx={x} cy={60 + i * 20} r="5" fill="none" stroke="#fff" opacity="0.6" />)}
          <path d="M0 210 Q200 190 400 210 L400 220 L0 220 Z" fill="#F4E1B5" />
        </svg>
      );
    case "arena":
      return (
        <svg {...common}>
          <defs><radialGradient id={`sa${uid}`} cx="50%" cy="100%" r="90%"><stop offset="0" stopColor="#FF6B6B" /><stop offset="1" stopColor="#2C2452" /></radialGradient></defs>
          <rect width="400" height="220" fill={`url(#sa${uid})`} />
          <ellipse cx="200" cy="230" rx="230" ry="90" fill="#4F2BD9" /><ellipse cx="200" cy="232" rx="180" ry="60" fill="#7047FF" />
          {[-60, -20, 20, 60].map((a) => <rect key={a} x="196" y="0" width="8" height="220" fill="#FFD65A" opacity="0.15" transform={`rotate(${a} 200 220)`} />)}
          <g transform="translate(200 120)"><path d="M-26 -30 h52 v20 q0 30 -26 34 q-26 -4 -26 -34 Z" fill="#FFD65A" /><rect x="-8" y="4" width="16" height="16" fill="#FFD65A" /><rect x="-20" y="20" width="40" height="8" rx="3" fill="#FFB43A" /></g>
          <Stars n={18} seed={5} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <defs><linearGradient id={`si${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C2452" /><stop offset="0.6" stopColor="#7047FF" /><stop offset="1" stopColor="#FF9A8B" /></linearGradient></defs>
          <rect width="400" height="220" fill={`url(#si${uid})`} /><Stars n={30} seed={7} />
          <Island x={80} y={130} s={0.9}><path d="M-10 -2 L0 -40 L10 -2 Z" fill="#2FBF71" /><rect x="14" y="-22" width="16" height="20" fill="#FFD65A" /><path d="M10 -22 L22 -34 L34 -22 Z" fill="#FF6B6B" /></Island>
          <Island x={220} y={90} s={1.2} top="#7FF0B6"><g transform="translate(0 -4)"><rect x="-18" y="-36" width="36" height="34" fill="#EAE4FF" /><path d="M-22 -36 L0 -58 L22 -36 Z" fill="#7047FF" /><rect x="-5" y="-16" width="10" height="14" fill="#7047FF" /></g></Island>
          <Island x={340} y={140} s={0.8} top="#FFD65A"><circle cx="0" cy="-20" r="16" fill="#FF7AC6" /><rect x="-2" y="-6" width="4" height="8" fill="#8B5E3C" /></Island>
          <g className="animate-float"><ellipse cx="150" cy="40" rx="12" ry="15" fill="#FF6B6B" /><path d="M144 54 L156 54 L153 62 L147 62 Z" fill="#8B5E3C" /></g>
        </svg>
      );
  }
}
