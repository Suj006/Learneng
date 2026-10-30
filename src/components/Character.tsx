"use client";
import { motion, useReducedMotion } from "framer-motion";

export type CharacterName = "max" | "lexi" | "speaky" | "grammy" | "story";
export type Mood = "welcome" | "excited" | "thinking" | "explaining" | "celebrating" | "encouraging" | "surprised" | "hint";

export const CHARACTER_INFO: Record<CharacterName, { name: string; role: string; color: string; bio: string; voice: string }> = {
  max: { name: "MAX", role: "Adventure Companion", color: "#7047FF", bio: "A cheerful explorer with cat-ear headphones who hears the music of every kingdom. MAX guides your missions, levels and rewards.", voice: "Hype and friendly: “Let's GO, Explorer!”" },
  lexi: { name: "LEXI", role: "Vocabulary Explorer", color: "#39D5E8", bio: "A curious robot whose antennae catch floating letters. LEXI collects words from every corner of the universe and shares 10 new ones each day.", voice: "Curious and bubbly: “Ooh, a new word!”" },
  speaky: { name: "SPEAKY", role: "Speaking Champion", color: "#5BE3A8", bio: "A mint-green robot with a glowing screen face and super-sensitive ear speakers. SPEAKY helps you speak clearly and confidently.", voice: "Warm coach: “Let's try once more — you've got this!”" },
  grammy: { name: "GRAMMY", role: "Grammar Wizard", color: "#9B7BFF", bio: "A wise owl wizard with golden spectacles. Her wand fixes wobbly sentences and writes capital letters in the sky.", voice: "Kind and wise: “Let's fix that sentence together.”" },
  story: { name: "STORY", role: "Storytelling Explorer", color: "#FF6B6B", bio: "A clever coral fox with a glowing quill. STORY's tail draws maps of imaginary worlds and loves your wildest ideas.", voice: "Dreamy and playful: “Ooh, what happens next?”" },
};

function Eyes({ mood, cx = 100, cy = 96, gap = 26, r = 13, glow }: { mood: Mood; cx?: number; cy?: number; gap?: number; r?: number; glow?: string }) {
  const happy = mood === "celebrating" || mood === "excited";
  const wide = mood === "surprised";
  const look = mood === "thinking" ? { x: 3, y: -4 } : mood === "hint" ? { x: 4, y: 0 } : { x: 0, y: 1 };
  return (
    <g>
      {[-1, 1].map((s) => {
        const x = cx + s * gap;
        if (happy) return <path key={s} d={`M${x - r} ${cy + 2} Q${x} ${cy - r - 2} ${x + r} ${cy + 2}`} stroke={glow ?? "#1E1A3A"} strokeWidth={5} fill="none" strokeLinecap="round" />;
        if (glow) {
          return (
            <g key={s} className="animate-blink" style={{ transformOrigin: `${x}px ${cy}px` }}>
              <ellipse cx={x} cy={cy} rx={r} ry={wide ? r * 1.25 : r} fill={glow} opacity={0.25} />
              <ellipse cx={x + look.x * 0.6} cy={cy + look.y * 0.6} rx={r * 0.62} ry={(wide ? r * 0.85 : r * 0.7)} fill={glow} />
              <circle cx={x + look.x * 0.6 + 3} cy={cy - 4} r={2.6} fill="#fff" />
            </g>
          );
        }
        return (
          <g key={s} className="animate-blink" style={{ transformOrigin: `${x}px ${cy}px` }}>
            <ellipse cx={x} cy={cy} rx={r} ry={wide ? r * 1.25 : r * 1.08} fill="#fff" stroke="#1E1A3A" strokeOpacity={0.15} />
            <circle cx={x + look.x} cy={cy + look.y} r={r * 0.62} fill="#2A5BD7" />
            <circle cx={x + look.x} cy={cy + look.y} r={r * 0.36} fill="#10132B" />
            <circle cx={x + look.x + r * 0.25} cy={cy + look.y - r * 0.3} r={r * 0.2} fill="#fff" />
          </g>
        );
      })}
      {mood === "encouraging" && <>
        <path d={`M${cx - gap - 10} ${cy - r - 8} L${cx - gap + 9} ${cy - r - 4}`} stroke="#1E1A3A" strokeWidth={4} strokeLinecap="round" />
        <path d={`M${cx + gap + 10} ${cy - r - 8} L${cx + gap - 9} ${cy - r - 4}`} stroke="#1E1A3A" strokeWidth={4} strokeLinecap="round" />
      </>}
      {mood === "surprised" && <>
        <path d={`M${cx - gap - 9} ${cy - r - 12} Q${cx - gap} ${cy - r - 18} ${cx - gap + 9} ${cy - r - 12}`} stroke="#1E1A3A" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={`M${cx + gap - 9} ${cy - r - 12} Q${cx + gap} ${cy - r - 18} ${cx + gap + 9} ${cy - r - 12}`} stroke="#1E1A3A" strokeWidth={4} fill="none" strokeLinecap="round" />
      </>}
    </g>
  );
}

function Mouth({ mood, cx = 100, cy = 128, color = "#1E1A3A", w = 18 }: { mood: Mood; cx?: number; cy?: number; color?: string; w?: number }) {
  if (mood === "surprised") return <ellipse cx={cx} cy={cy + 3} rx={7} ry={9} fill={color} />;
  if (mood === "thinking") return <path d={`M${cx - w * 0.6} ${cy + 4} Q${cx} ${cy + 2} ${cx + w * 0.7} ${cy - 2}`} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />;
  if (mood === "excited" || mood === "celebrating")
    return <g><path d={`M${cx - w} ${cy - 2} Q${cx} ${cy + w * 1.3} ${cx + w} ${cy - 2} Z`} fill={color} /><path d={`M${cx - w * 0.55} ${cy + w * 0.55} Q${cx} ${cy + w * 0.95} ${cx + w * 0.55} ${cy + w * 0.55}`} fill="#FF7A8A" /></g>;
  return <path d={`M${cx - w * 0.8} ${cy} Q${cx} ${cy + w * 0.9} ${cx + w * 0.8} ${cy}`} stroke={color} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
}

function Extras({ mood, color }: { mood: Mood; color: string }) {
  if (mood === "celebrating" || mood === "excited")
    return <g fill="#FFD65A">{[[22, 40], [176, 52], [30, 150], [172, 160]].map(([x, y], i) => <path key={i} className="animate-twinkle" style={{ animationDelay: `${i * 0.4}s` }} d={`M${x} ${y - 8} L${x + 2.5} ${y - 2.5} L${x + 8} ${y} L${x + 2.5} ${y + 2.5} L${x} ${y + 8} L${x - 2.5} ${y + 2.5} L${x - 8} ${y} L${x - 2.5} ${y - 2.5} Z`} />)}</g>;
  if (mood === "thinking") return <g fill={color} opacity={0.8}><circle cx={160} cy={40} r={5} /><circle cx={172} cy={26} r={7} /><circle cx={186} cy={10} r={9} /></g>;
  if (mood === "hint") return <g transform="translate(160 22)"><circle r={14} fill="#FFD65A" className="animate-twinkle" /><rect x={-5} y={12} width={10} height={8} rx={2} fill="#C9A23A" /><path d="M-4 -2 L0 4 L4 -2" stroke="#fff" strokeWidth={2} fill="none" /></g>;
  if (mood === "explaining") return <g transform="translate(166 40)"><rect x={-18} y={-14} width={36} height={26} rx={8} fill="#fff" /><path d="M-8 12 L-14 22 L0 12 Z" fill="#fff" /><text x={0} y={5} textAnchor="middle" fontSize={16} fontWeight={800} fill={color}>Aa</text></g>;
  if (mood === "surprised") return <text x={164} y={44} fontSize={30} fontWeight={900} fill="#FFD65A">!</text>;
  return null;
}

function Max({ mood }: { mood: Mood }) {
  return (
    <g>
      <defs>
        <radialGradient id="maxHead" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#BDEBFF" /><stop offset="100%" stopColor="#4FA3EE" /></radialGradient>
        <linearGradient id="maxHood" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8A5CFF" /><stop offset="100%" stopColor="#5B34D6" /></linearGradient>
      </defs>
      <path d="M38 222 Q40 160 100 156 Q160 160 162 222 Z" fill="url(#maxHood)" />
      <path d="M62 168 Q100 190 138 168 Q130 158 100 158 Q70 158 62 168 Z" fill="#6E45F0" />
      <rect x={84} y={172} width={6} height={30} rx={3} fill="#fff" /><rect x={110} y={172} width={6} height={30} rx={3} fill="#fff" />
      <circle cx={87} cy={204} r={5} fill="#fff" /><circle cx={113} cy={204} r={5} fill="#fff" />
      <path d="M40 54 L54 12 L82 40 Z" fill="#2B2540" /><path d="M48 46 L56 22 L72 40 Z" fill="#FF8FA3" />
      <path d="M160 54 L146 12 L118 40 Z" fill="#2B2540" /><path d="M152 46 L144 22 L128 40 Z" fill="#FF8FA3" />
      <circle cx={100} cy={100} r={64} fill="url(#maxHead)" />
      <path d="M38 96 Q40 26 100 24 Q160 26 162 96" stroke="#FF6FA0" strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M44 86 Q48 36 100 34 Q152 36 156 86" stroke="#2B2540" strokeWidth={3} fill="none" opacity={0.35} />
      <ellipse cx={34} cy={106} rx={16} ry={22} fill="#FF6FA0" /><ellipse cx={34} cy={106} rx={7} ry={11} fill="#2B2540" />
      <ellipse cx={166} cy={106} rx={16} ry={22} fill="#FF6FA0" /><ellipse cx={166} cy={106} rx={7} ry={11} fill="#2B2540" />
      <Eyes mood={mood} cy={96} />
      <ellipse cx={100} cy={116} rx={7} ry={5} fill="#FF7FA8" />
      <ellipse cx={64} cy={122} rx={9} ry={6} fill="#FF8FB8" opacity={0.7} /><ellipse cx={136} cy={122} rx={9} ry={6} fill="#FF8FB8" opacity={0.7} />
      <Mouth mood={mood} cy={130} />
    </g>
  );
}

function Lexi({ mood }: { mood: Mood }) {
  return (
    <g>
      <defs>
        <linearGradient id="lexiHelm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9BF0FA" /><stop offset="100%" stopColor="#39C2DA" /></linearGradient>
      </defs>
      <g fill="#FFD65A" fontWeight={800} fontSize={16} opacity={0.9} className="animate-float-slow">
        <text x={14} y={70}>A</text><text x={176} y={64}>B</text><text x={22} y={150}>1</text><text x={172} y={146}>C</text>
      </g>
      <path d="M66 22 L74 46" stroke="#39C2DA" strokeWidth={5} strokeLinecap="round" /><circle cx={64} cy={18} r={8} fill="#FFD65A" />
      <path d="M134 22 L126 46" stroke="#39C2DA" strokeWidth={5} strokeLinecap="round" /><circle cx={136} cy={18} r={8} fill="#FFD65A" />
      <rect x={58} y={160} width={84} height={58} rx={26} fill="#F4F6FB" />
      <rect x={72} y={186} width={56} height={30} rx={14} fill="#7FE0EE" />
      <rect x={40} y={40} width={120} height={116} rx={50} fill="url(#lexiHelm)" />
      <path d="M78 42 Q100 30 122 42 L118 64 Q100 56 82 64 Z" fill="#FF7AC6" /><path d="M86 46 Q100 40 114 46" stroke="#fff" strokeWidth={3} fill="none" />
      <rect x={52} y={66} width={96} height={80} rx={36} fill="#F7F9FF" />
      <rect x={30} y={84} width={18} height={40} rx={9} fill="#FF7AC6" /><rect x={152} y={84} width={18} height={40} rx={9} fill="#FF7AC6" />
      <Eyes mood={mood} cy={100} gap={22} r={12} />
      <circle cx={100} cy={118} r={3} fill="#8C93A8" />
      <Mouth mood={mood} cy={128} color="#C2304A" w={13} />
    </g>
  );
}

function Speaky({ mood }: { mood: Mood }) {
  return (
    <g>
      <defs>
        <linearGradient id="spkBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B6F5D8" /><stop offset="100%" stopColor="#4CC9A0" /></linearGradient>
      </defs>
      <g stroke="#39D5E8" strokeWidth={4} fill="none" strokeLinecap="round" className="animate-twinkle">
        <path d="M14 82 Q4 100 14 118" /><path d="M24 88 Q18 100 24 112" /><path d="M186 82 Q196 100 186 118" /><path d="M176 88 Q182 100 176 112" />
      </g>
      <rect x={60} y={160} width={80} height={58} rx={26} fill="url(#spkBody)" />
      <circle cx={100} cy={188} r={14} fill="#3AAE88" /><circle cx={100} cy={188} r={6} fill="#B6F5D8" />
      <ellipse cx={100} cy={96} rx={70} ry={66} fill="url(#spkBody)" />
      <circle cx={34} cy={100} r={20} fill="#3AAE88" /><circle cx={34} cy={100} r={13} fill="none" stroke="#39D5E8" strokeWidth={4} />
      <circle cx={166} cy={100} r={20} fill="#3AAE88" /><circle cx={166} cy={100} r={13} fill="none" stroke="#39D5E8" strokeWidth={4} />
      <rect x={52} y={60} width={96} height={76} rx={34} fill="#1B2140" />
      <Eyes mood={mood} cy={94} gap={22} r={13} glow="#7FE9FF" />
      <ellipse cx={70} cy={118} rx={8} ry={5} fill="#FF8FB8" opacity={0.8} /><ellipse cx={130} cy={118} rx={8} ry={5} fill="#FF8FB8" opacity={0.8} />
      <Mouth mood={mood} cy={116} color="#7FE9FF" w={11} />
    </g>
  );
}

function Grammy({ mood }: { mood: Mood }) {
  return (
    <g>
      <defs>
        <radialGradient id="owl" cx="45%" cy="35%" r="75%"><stop offset="0%" stopColor="#B89CFF" /><stop offset="100%" stopColor="#6A44E8" /></radialGradient>
      </defs>
      <path d="M100 0 L136 50 L64 50 Z" fill="#3B238F" /><circle cx={100} cy={2} r={6} fill="#FFD65A" />
      <path d="M92 22 l3 6 6 1 -5 4 1 6 -5 -3 -5 3 1 -6 -5 -4 6 -1 Z" fill="#FFD65A" />
      <ellipse cx={100} cy={52} rx={50} ry={9} fill="#3B238F" />
      <ellipse cx={100} cy={128} rx={70} ry={86} fill="url(#owl)" />
      <ellipse cx={100} cy={160} rx={42} ry={50} fill="#EAE4FF" />
      <g stroke="#C9B8FF" strokeWidth={3} fill="none">{[148, 166, 184].map((y) => <path key={y} d={`M78 ${y} q6 6 12 0 q6 6 12 0 q6 6 12 0 q6 6 12 0`} />)}</g>
      <path d="M32 120 Q16 160 44 190 Q48 150 40 120 Z" fill="#5A36D0" /><path d="M168 120 Q184 160 156 190 Q152 150 160 120 Z" fill="#5A36D0" />
      <circle cx={74} cy={98} r={24} fill="#fff" /><circle cx={126} cy={98} r={24} fill="#fff" />
      <Eyes mood={mood} cy={98} gap={26} r={14} />
      <circle cx={74} cy={98} r={25} fill="none" stroke="#FFD65A" strokeWidth={4} /><circle cx={126} cy={98} r={25} fill="none" stroke="#FFD65A" strokeWidth={4} />
      <path d="M99 98 L101 98" stroke="#FFD65A" strokeWidth={4} />
      <path d="M92 118 L108 118 L100 132 Z" fill="#FFA94D" />
      {mood !== "welcome" && mood !== "explaining" ? <Mouth mood={mood} cy={138} w={9} /> : null}
    </g>
  );
}

function Story({ mood }: { mood: Mood }) {
  return (
    <g>
      <defs>
        <linearGradient id="fox" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF9A7A" /><stop offset="100%" stopColor="#F25C54" /></linearGradient>
      </defs>
      <path d="M150 200 Q200 170 186 120 Q176 150 140 170 Z" fill="url(#fox)" /><path d="M186 120 Q192 132 184 142 Q178 128 186 120 Z" fill="#fff" />
      <rect x={62} y={156} width={76} height={62} rx={28} fill="url(#fox)" />
      <path d="M58 158 Q100 182 142 158 L138 172 Q100 194 62 172 Z" fill="#39D5E8" />
      <path d="M42 70 L50 14 L90 50 Z" fill="url(#fox)" /><path d="M52 58 L56 28 L78 50 Z" fill="#2B2540" />
      <path d="M158 70 L150 14 L110 50 Z" fill="url(#fox)" /><path d="M148 58 L144 28 L122 50 Z" fill="#2B2540" />
      <path d="M30 96 Q34 36 100 34 Q166 36 170 96 Q166 150 100 156 Q34 150 30 96 Z" fill="url(#fox)" />
      <path d="M52 112 Q60 150 100 152 Q140 150 148 112 Q124 128 100 120 Q76 128 52 112 Z" fill="#FFF4EC" />
      <Eyes mood={mood} cy={96} gap={28} r={12} />
      <ellipse cx={100} cy={120} rx={9} ry={6} fill="#2B2540" />
      <Mouth mood={mood} cy={132} w={12} />
      <g transform="translate(150 150) rotate(30)"><rect x={-4} y={-30} width={8} height={40} rx={3} fill="#FFD65A" /><path d="M-4 -30 Q0 -52 12 -44 Q4 -38 4 -30 Z" fill="#fff" /></g>
    </g>
  );
}

const BODIES: Record<CharacterName, (p: { mood: Mood }) => React.ReactElement> = { max: Max, lexi: Lexi, speaky: Speaky, grammy: Grammy, story: Story };

export function Character({ name, mood = "welcome", size = 160, className = "", still = false }: { name: CharacterName; mood?: Mood; size?: number; className?: string; still?: boolean }) {
  const reduce = useReducedMotion();
  const Body = BODIES[name] ?? Max;
  const animate = still || reduce ? undefined
    : mood === "celebrating" || mood === "excited" ? { y: [0, -14, 0], rotate: [0, -3, 3, 0] }
    : mood === "thinking" ? { rotate: [0, -4, 0] }
    : mood === "surprised" ? { scale: [1, 1.06, 1] }
    : { y: [0, -6, 0] };
  return (
    <motion.svg
      viewBox="0 0 200 222" width={size} height={size * 1.11} className={className} role="img" aria-label={`${CHARACTER_INFO[name].name}, ${CHARACTER_INFO[name].role}`}
      animate={animate} transition={{ duration: mood === "celebrating" || mood === "excited" ? 1.1 : 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx={100} cy={218} rx={56} ry={5} fill="#000" opacity={0.18} />
      <Body mood={mood} />
      <Extras mood={mood} color={CHARACTER_INFO[name].color} />
    </motion.svg>
  );
}
