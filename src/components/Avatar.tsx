"use client";
import { motion } from "framer-motion";

export interface AvatarLook {
  skin: string; hair: string; hair_color: string; outfit: string; shoes: string; accessory: string | null; background: string; expression: string; magic_object: string | null;
}
/** Art lookups resolved from the rewards catalogue (slug → art string / emoji). */
export interface AvatarArt { [slug: string]: { art: string | null; emoji: string } }

export const SKIN: Record<string, string> = { "tone-1": "#FFE0C7", "tone-2": "#F6C9A0", "tone-3": "#D9A066", "tone-4": "#B57A4A", "tone-5": "#8D5524", "tone-6": "#5C3A1E" };

function Hair({ style, color, behind }: { style: string; color: string; behind: boolean }) {
  // `behind` = layer drawn before the head (long hair, braids).
  switch (style) {
    case "long": case "ponytail":
      return behind
        ? <path d={style === "long" ? "M58 60 Q50 130 66 150 L134 150 Q150 130 142 60 Z" : "M136 70 Q176 90 160 140 Q150 110 132 92 Z"} fill={color} />
        : <path d="M60 70 Q62 30 100 30 Q138 30 140 70 Q124 52 100 50 Q76 52 60 70 Z" fill={color} />;
    case "braids":
      return behind
        ? <g fill={color}>{[60, 140].map((x) => <g key={x}>{[96, 112, 128, 144].map((y) => <circle key={y} cx={x} cy={y} r={8} />)}</g>)}</g>
        : <path d="M60 70 Q62 30 100 30 Q138 30 140 70 Q120 48 100 48 Q80 48 60 70 Z" fill={color} />;
    case "curly":
      return behind ? null : <g fill={color}>{[[66, 56], [80, 40], [100, 34], [120, 40], [134, 56], [60, 74], [140, 74]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} />)}</g>;
    case "afro":
      return behind ? <circle cx={100} cy={66} r={50} fill={color} /> : null;
    case "bun":
      return behind ? null : <g fill={color}><circle cx={100} cy={22} r={15} /><path d="M60 70 Q62 32 100 32 Q138 32 140 70 Q122 50 100 50 Q78 50 60 70 Z" /></g>;
    case "spiky":
      return behind ? null : <path d="M58 70 L64 34 L76 48 L84 24 L96 44 L106 20 L114 44 L126 26 L132 48 L142 36 L142 70 Q120 52 100 52 Q80 52 58 70 Z" fill={color} />;
    case "patka":
      return behind ? null : <g><path d="M58 72 Q58 28 100 26 Q142 28 142 72 Q120 56 100 56 Q80 56 58 72 Z" fill="#FF8A3D" /><circle cx={100} cy={30} r={11} fill="#FF8A3D" /><path d="M66 60 Q100 44 134 60" stroke="#E66A1E" strokeWidth={3} fill="none" /></g>;
    case "hijab":
      return behind
        ? <path d="M48 80 Q46 26 100 22 Q154 26 152 80 L156 150 Q100 166 44 150 Z" fill={color === "#2B1B12" ? "#7047FF" : color} />
        : <path d="M62 78 Q64 40 100 38 Q136 40 138 78" stroke="#ffffff40" strokeWidth={3} fill="none" />;
    default: // short
      return behind ? null : <path d="M60 72 Q60 30 100 30 Q140 30 140 72 Q132 50 112 48 Q96 56 74 52 Q64 58 60 72 Z" fill={color} />;
  }
}

function Face({ expr, skin }: { expr: string; skin: string }) {
  const eye = (x: number) => {
    if (expr === "wink" && x > 100) return <path key={x} d={`M${x - 6} 84 Q${x} 79 ${x + 6} 84`} stroke="#1E1A3A" strokeWidth={3} fill="none" strokeLinecap="round" />;
    if (expr === "cool") return null;
    if (expr === "star") return <text key={x} x={x} y={89} fontSize={14} textAnchor="middle">⭐</text>;
    if (expr === "grin") return <path key={x} d={`M${x - 6} 85 Q${x} 78 ${x + 6} 85`} stroke="#1E1A3A" strokeWidth={3.2} fill="none" strokeLinecap="round" />;
    return <g key={x} className="animate-blink" style={{ transformOrigin: `${x}px 84px` }}><ellipse cx={x} cy={84} rx={5} ry={6} fill="#1E1A3A" /><circle cx={x + 1.6} cy={82} r={1.6} fill="#fff" /></g>;
  };
  return (
    <g>
      {eye(86)}{eye(114)}
      {expr === "cool" && <g><rect x={74} y={78} width={22} height={11} rx={5} fill="#1E1A3A" /><rect x={104} y={78} width={22} height={11} rx={5} fill="#1E1A3A" /><path d="M96 82 L104 82" stroke="#1E1A3A" strokeWidth={3} /></g>}
      <ellipse cx={76} cy={98} rx={6} ry={4} fill="#FF8FB8" opacity={0.6} /><ellipse cx={124} cy={98} rx={6} ry={4} fill="#FF8FB8" opacity={0.6} />
      {expr === "grin" || expr === "star"
        ? <path d="M88 100 Q100 116 112 100 Z" fill="#7A2335" />
        : <path d="M90 102 Q100 110 110 102" stroke="#7A2335" strokeWidth={3.2} fill="none" strokeLinecap="round" />}
      <path d="M99 92 Q101 95 99 96" stroke={skin} strokeWidth={2} fill="none" style={{ filter: "brightness(0.8)" }} />
    </g>
  );
}

function Outfit({ art, skin }: { art: string; skin: string }) {
  const [style, color = "#7047FF"] = art.split(":");
  const sleeve = <g fill={color}><rect x={46} y={128} width={18} height={44} rx={9} /><rect x={136} y={128} width={18} height={44} rx={9} /></g>;
  const hands = <g fill={skin}><circle cx={55} cy={176} r={8} /><circle cx={145} cy={176} r={8} /></g>;
  return (
    <g>
      {style === "dress"
        ? <path d="M66 124 Q100 116 134 124 L150 196 Q100 206 50 196 Z" fill={color} />
        : style === "robe" || style === "hero"
          ? <path d="M64 122 Q100 114 136 122 L146 206 Q100 212 54 206 Z" fill={color} />
          : <rect x={62} y={120} width={76} height={style === "kurta" ? 82 : 64} rx={22} fill={color} />}
      {sleeve}{hands}
      {style === "hoodie" && <g><path d="M72 122 Q100 142 128 122" stroke="#00000030" strokeWidth={6} fill="none" /><rect x={92} y={130} width={4} height={18} rx={2} fill="#fff" /><rect x={104} y={130} width={4} height={18} rx={2} fill="#fff" /><rect x={80} y={160} width={40} height={16} rx={8} fill="#00000025" /></g>}
      {style === "tee" && <circle cx={100} cy={150} r={10} fill="#ffffff55" />}
      {style === "kurta" && <g fill="#FFD65A">{[136, 150, 164].map((y) => <circle key={y} cx={100} cy={y} r={2.6} />)}<path d="M62 196 L138 196" stroke="#FFD65A" strokeWidth={4} /></g>}
      {style === "vest" && <g><rect x={62} y={120} width={76} height={64} rx={22} fill="#E8E1D0" /><path d="M62 130 L86 184 L62 184 Z M138 130 L114 184 L138 184 Z" fill={color} /><rect x={66} y={150} width={14} height={12} rx={3} fill="#00000025" /></g>}
      {style === "robe" && <g fill="#FFD65A"><path d="M100 122 L100 206" stroke="#FFD65A" strokeWidth={3} /><text x={118} y={170} fontSize={14}>✦</text><text x={70} y={190} fontSize={10}>✦</text></g>}
      {style === "suit" && <g><rect x={82} y={134} width={36} height={22} rx={6} fill="#39D5E8" /><circle cx={90} cy={170} r={4} fill="#FF6B6B" /><circle cx={110} cy={170} r={4} fill="#FFD65A" /></g>}
      {style === "hero" && <g><path d="M64 122 Q40 170 46 214 L64 206 Z M136 122 Q160 170 154 214 L136 206 Z" fill="#7047FF" /><path d="M100 136 l6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2 Z" fill="#FFD65A" /></g>}
    </g>
  );
}

export function Avatar({ look, art, size = 160, pet, className = "", celebrate = false }: { look: AvatarLook; art: AvatarArt; size?: number; pet?: string | null; className?: string; celebrate?: boolean }) {
  const skin = SKIN[look.skin] ?? SKIN["tone-3"];
  const hairStyle = art[look.hair]?.art ?? "short";
  const outfitArt = art[look.outfit]?.art ?? "hoodie:#7047FF";
  const shoe = art[look.shoes]?.art ?? "#FFFFFF";
  const bg = art[look.background]?.art ?? "linear-gradient(180deg,#8EE3F5,#EAE4FF)";
  const expr = art[look.expression]?.art ?? "smile";
  const legs = look.outfit.includes("dress") ? skin : outfitArt.includes("kurta") ? "#F4F4F4" : "#3B3561";
  return (
    <div className={`relative overflow-hidden rounded-[28%] ${className}`} style={{ width: size, height: size, background: bg }}>
      <motion.svg viewBox="0 0 200 240" width="100%" height="100%" aria-label="Your avatar" role="img"
        animate={celebrate ? { y: [0, -12, 0] } : { y: [0, -3, 0] }} transition={{ duration: celebrate ? 0.8 : 3, repeat: Infinity }}>
        <ellipse cx={100} cy={232} rx={54} ry={6} fill="#000" opacity={0.15} />
        <rect x={78} y={184} width={18} height={34} rx={8} fill={legs} /><rect x={104} y={184} width={18} height={34} rx={8} fill={legs} />
        <ellipse cx={86} cy={222} rx={16} ry={8} fill={shoe} stroke="#00000020" /><ellipse cx={114} cy={222} rx={16} ry={8} fill={shoe} stroke="#00000020" />
        {art[look.shoes]?.emoji === "🚀" && <g fill="#FF6B6B"><path d="M72 226 l-8 6 8 0 Z" /><path d="M128 226 l8 6 -8 0 Z" /></g>}
        <Outfit art={outfitArt} skin={skin} />
        <Hair style={hairStyle} color={look.hair_color} behind />
        <rect x={92} y={104} width={16} height={18} rx={6} fill={skin} />
        <ellipse cx={100} cy={80} rx={40} ry={42} fill={skin} />
        <ellipse cx={60} cy={84} rx={6} ry={9} fill={skin} /><ellipse cx={140} cy={84} rx={6} ry={9} fill={skin} />
        <Hair style={hairStyle} color={look.hair_color} behind={false} />
        <Face expr={expr} skin={skin} />
        {look.accessory && <text x={100} y={38} fontSize={34} textAnchor="middle">{art[look.accessory]?.emoji}</text>}
        {look.magic_object && <text x={150} y={182} fontSize={26} textAnchor="middle">{art[look.magic_object]?.emoji}</text>}
      </motion.svg>
      {pet && <span className="absolute bottom-1 left-1 text-[min(26px,22%)] drop-shadow" aria-label="pet">{pet}</span>}
    </div>
  );
}
