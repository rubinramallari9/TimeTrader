"use client";

export default function WatchSVG() {
  const cx = 140, cy = 250;

  // Static 10:10 position (classic watch advertising angle)
  const hourDeg   = 305; // 10h 10m
  const minuteDeg =  60; // 10 min

  const bezelMarks = Array.from({ length: 60 }, (_, i) => {
    const a = (i * 6 - 90) * (Math.PI / 180);
    const isMaj = i % 5 === 0;
    return {
      x1: cx + (isMaj ? 100 : 105) * Math.cos(a),
      y1: cy + (isMaj ? 100 : 105) * Math.sin(a),
      x2: cx + 109 * Math.cos(a),
      y2: cy + 109 * Math.sin(a),
      isMaj, i,
    };
  });

  const dialMarks = Array.from({ length: 60 }, (_, i) => {
    const a = (i * 6 - 90) * (Math.PI / 180);
    const isMaj = i % 5 === 0;
    return {
      x1: cx + (isMaj ? 82 : 85) * Math.cos(a),
      y1: cy + (isMaj ? 82 : 85) * Math.sin(a),
      x2: cx + 87 * Math.cos(a),
      y2: cy + 87 * Math.sin(a),
      isMaj,
    };
  });

  const hourIndices = Array.from({ length: 11 }, (_, j) => {
    const i = j + 1;
    const a = (i * 30 - 90) * (Math.PI / 180);
    const r = 72;
    return { i, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), deg: i * 30 };
  });

  return (
    <div
      className="relative w-72 xl:w-80"
      style={{ transform: "perspective(600px) rotateY(-18deg) rotateX(4deg)" }}
    >
      <svg
        viewBox="0 0 280 490"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        style={{ filter: "drop-shadow(0 24px 60px rgba(0,0,0,0.95))" }}
      >
        <defs>
          {/* ── Gold monochrome palette ── */}
          <linearGradient id="g-strap" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#070503" />
            <stop offset="50%"  stopColor="#141008" />
            <stop offset="100%" stopColor="#070503" />
          </linearGradient>

          <linearGradient id="g-case" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#5A4212" />
            <stop offset="40%"  stopColor="#8A6520" />
            <stop offset="70%"  stopColor="#6A4E15" />
            <stop offset="100%" stopColor="#3A2A0C" />
          </linearGradient>

          <linearGradient id="g-bezel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#3A2A0C" />
            <stop offset="50%"  stopColor="#1A1206" />
            <stop offset="100%" stopColor="#3A2A0C" />
          </linearGradient>

          <radialGradient id="g-dial" cx="40%" cy="35%">
            <stop offset="0%"   stopColor="#161008" />
            <stop offset="100%" stopColor="#060402" />
          </radialGradient>

          <linearGradient id="g-gold-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#8A6520" />
            <stop offset="35%"  stopColor="#D4AA58" />
            <stop offset="55%"  stopColor="#F0C860" />
            <stop offset="100%" stopColor="#8A6520" />
          </linearGradient>

          <linearGradient id="g-gold-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#8A6520" />
            <stop offset="40%"  stopColor="#D4AA58" />
            <stop offset="60%"  stopColor="#F0C860" />
            <stop offset="100%" stopColor="#8A6520" />
          </linearGradient>

          {/* ── Horizontal scan lines ── */}
          <pattern id="g-lines" x="0" y="0" width="280" height="5" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="280" y2="0" stroke="#C8A96E" strokeWidth="0.5" opacity="0.2" />
          </pattern>

          <filter id="g-lume" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ═══════════════════════════════════════
            STRAP TOP — wider, longer
        ═══════════════════════════════════════ */}
        <rect x="105" y="0" width="70" height="138" rx="10"
          fill="url(#g-strap)" stroke="#1A1206" strokeWidth="1.2" />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1="111" y1={7 + i * 10} x2="169" y2={7 + i * 10}
            stroke="#0C0A05" strokeWidth="1.5" strokeLinecap="round" />
        ))}
        {/* Buckle */}
        <rect x="117" y="96" width="46" height="20" rx="5"
          fill="#1A1206" stroke="#3A2A10" strokeWidth="1.2" />
        <rect x="122" y="100" width="36" height="12" rx="2.5"
          fill="none" stroke="#B09145" strokeWidth="1" />
        <rect x="138.5" y="93" width="3" height="26" rx="1.5" fill="#B09145" />

        {/* ═══════════════════════════════════════
            TOP LUGS
        ═══════════════════════════════════════ */}
        <path d="M111 137 Q88 137 83 154 L83 164 Q95 158 106 154 L111 145 Z"
          fill="url(#g-case)" stroke="#3A2A10" strokeWidth="0.6" />
        <path d="M169 137 Q192 137 197 154 L197 164 Q185 158 174 154 L169 145 Z"
          fill="url(#g-case)" stroke="#3A2A10" strokeWidth="0.6" />

        {/* ═══════════════════════════════════════
            CASE
        ═══════════════════════════════════════ */}
        <circle cx={cx} cy={cy} r="113" fill="url(#g-case)" />
        <circle cx={cx} cy={cy} r="113" fill="none" stroke="#6A5018" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="111" fill="none" stroke="#241A08" strokeWidth="0.5" />

        {/* ═══════════════════════════════════════
            BEZEL — Submariner style
        ═══════════════════════════════════════ */}
        <circle cx={cx} cy={cy} r="110" fill="url(#g-bezel)" />
        <circle cx={cx} cy={cy} r="110" fill="none" stroke="#B09145" strokeWidth="1.2" opacity="0.65" />

        {/* Bezel triangle at 12 */}
        <polygon
          points={`${cx},${cy - 99} ${cx - 5.5},${cy - 109} ${cx + 5.5},${cy - 109}`}
          fill="#C8A96E"
        />

        {/* Bezel minute marks */}
        {bezelMarks.map(({ x1, y1, x2, y2, isMaj, i }) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={i <= 15 ? "#C8A96E" : "#4A3810"}
            strokeWidth={isMaj ? 2.5 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* Bezel numbers */}
        {[
          { n: "5",  ai: -60, hi: true  },
          { n: "10", ai: -30, hi: true  },
          { n: "15", ai:   0, hi: true  },
          { n: "20", ai:  30, hi: false },
          { n: "25", ai:  60, hi: false },
          { n: "30", ai:  90, hi: false },
          { n: "35", ai: 120, hi: false },
          { n: "40", ai: 150, hi: false },
          { n: "45", ai: 180, hi: false },
          { n: "50", ai: 210, hi: false },
          { n: "55", ai: 240, hi: false },
        ].map(({ n, ai, hi }) => {
          const rad = (ai - 90) * (Math.PI / 180);
          const r   = 93;
          const x   = cx + r * Math.cos(rad);
          const y   = cy + r * Math.sin(rad);
          return (
            <text key={n} x={x} y={y}
              textAnchor="middle" dominantBaseline="middle"
              fill={hi ? "#C8A96E" : "#3A2A10"}
              fontSize="6.5" fontFamily="Arial, sans-serif" fontWeight="800"
              transform={`rotate(${ai}, ${x}, ${y})`}
            >{n}</text>
          );
        })}

        {/* ═══════════════════════════════════════
            CHAPTER RING + DIAL
        ═══════════════════════════════════════ */}
        <circle cx={cx} cy={cy} r="90" fill="#0C0A05" />
        <circle cx={cx} cy={cy} r="90" fill="none" stroke="#2A1E08" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r="88" fill="url(#g-dial)" />

        {/* Inner minute track */}
        {dialMarks.map(({ x1, y1, x2, y2, isMaj }, i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isMaj ? "#3A2A10" : "#1E1508"}
            strokeWidth={isMaj ? 1.2 : 0.6}
            strokeLinecap="round"
          />
        ))}

        {/* ═══════════════════════════════════════
            HOUR INDICES
        ═══════════════════════════════════════ */}
        {/* 12 o'clock: double baton */}
        <rect x={cx - 4.5} y={cy - 87} width="9" height="16" rx="1.5"
          fill="url(#g-gold-h)" filter="url(#g-lume)" />

        {hourIndices.map(({ i, x, y, deg }) => {
          if (i === 3) return null; // date window
          const isLarge = i === 6 || i === 9;
          const w = isLarge ? 12 : 8;
          return (
            <rect key={i}
              x={x - w / 2} y={y - 1.75} width={w} height="3.5" rx="1.5"
              fill="url(#g-gold-h)"
              transform={`rotate(${deg}, ${x}, ${y})`}
              filter="url(#g-lume)"
            />
          );
        })}

        {/* 6 o'clock dot */}
        <circle cx={cx} cy={cy + 72} r="2.8" fill="url(#g-gold-h)" filter="url(#g-lume)" />

        {/* ═══════════════════════════════════════
            DATE WINDOW @ 3
        ═══════════════════════════════════════ */}
        <rect x="193" y="243" width="22" height="14" rx="2"
          fill="#1A1006" stroke="#C8A96E" strokeWidth="1" />
        <rect x="193" y="243" width="22" height="14" rx="2"
          fill="none" stroke="#D4AA58" strokeWidth="0.3" opacity="0.5" />
        <text x="204" y="250.5"
          textAnchor="middle" dominantBaseline="middle"
          fill="#C8A96E" fontSize="7.5" fontWeight="800" fontFamily="Arial, sans-serif"
        >21</text>

        {/* ═══════════════════════════════════════
            DIAL TEXT
        ═══════════════════════════════════════ */}
        <text x={cx} y={cy - 26}
          textAnchor="middle" fill="#C8A96E"
          fontSize="10.5" fontFamily="Georgia, serif" fontStyle="italic"
          fontWeight="bold" letterSpacing="1.5"
        >TimeTrader</text>
        <line x1={cx - 30} y1={cy - 19} x2={cx + 30} y2={cy - 19}
          stroke="#B09145" strokeWidth="0.5" opacity="0.4" />
        <text x={cx} y={cy - 12}
          textAnchor="middle" fill="#3A2A10"
          fontSize="5" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="3.5"
        >SUBMARINER DATE</text>

        {/* ═══════════════════════════════════════
            CROWN @ 3
        ═══════════════════════════════════════ */}
        <rect x="254" y="243" width="18" height="14" rx="5"
          fill="url(#g-case)" stroke="#3A2A10" strokeWidth="1.2" />
        {[246.5, 250, 253.5].map((y, i) => (
          <line key={i} x1="258" y1={y} x2="268" y2={y}
            stroke="#B09145" strokeWidth="0.9" opacity="0.6" />
        ))}

        {/* ═══════════════════════════════════════
            MINUTE HAND — static at 10:10
        ═══════════════════════════════════════ */}
        <g transform={`rotate(${minuteDeg}, ${cx}, ${cy})`}>
          <rect x={cx - 2.8} y={cy - 80} width="5.6" height="98" rx="2.8"
            fill="url(#g-gold-v)" />
          <rect x={cx - 1} y={cy - 76} width="2" height="62" rx="1"
            fill="#F0C860" opacity="0.12" />
        </g>

        {/* ═══════════════════════════════════════
            HOUR HAND — Mercedes style, static at 10:10
        ═══════════════════════════════════════ */}
        <g transform={`rotate(${hourDeg}, ${cx}, ${cy})`}>
          <rect x={cx - 5.5} y={cy - 54} width="11" height="70" rx="5.5"
            fill="url(#g-gold-v)" />
          <circle cx={cx} cy={cy - 50} r="11" fill="url(#g-gold-v)" />
          <circle cx={cx} cy={cy - 50} r="6.5" fill="#060402" />
          <rect x={cx - 1.5} y={cy - 40} width="3" height="28" rx="1.5"
            fill="#F0C860" opacity="0.1" />
          <rect x={cx - 3.5} y={cy + 16} width="7" height="10" rx="3.5"
            fill="url(#g-gold-v)" />
        </g>

        {/* ═══════════════════════════════════════
            CENTER CAP
        ═══════════════════════════════════════ */}
        <circle cx={cx} cy={cy} r="6.5" fill="#C8A96E" />
        <circle cx={cx} cy={cy} r="3"   fill="#060402" />
        <circle cx={cx} cy={cy} r="1.5" fill="#C8A96E" opacity="0.8" />

        {/* ═══════════════════════════════════════
            BOTTOM LUGS
        ═══════════════════════════════════════ */}
        <path d="M111 363 Q88 363 83 346 L83 336 Q95 342 106 346 L111 355 Z"
          fill="url(#g-case)" stroke="#3A2A10" strokeWidth="0.6" />
        <path d="M169 363 Q192 363 197 346 L197 336 Q185 342 174 346 L169 355 Z"
          fill="url(#g-case)" stroke="#3A2A10" strokeWidth="0.6" />

        {/* ═══════════════════════════════════════
            STRAP BOTTOM — wider, longer
        ═══════════════════════════════════════ */}
        <rect x="105" y="362" width="70" height="128" rx="10"
          fill="url(#g-strap)" stroke="#1A1206" strokeWidth="1.2" />
        {/* Keeper loop */}
        <rect x="105" y="376" width="70" height="12" rx="6"
          fill="none" stroke="#1A1206" strokeWidth="1.8" />
        {[395, 405, 415, 425, 435, 445, 455, 465, 475].map((y) => (
          <line key={y} x1="111" y1={y} x2="169" y2={y}
            stroke="#0C0A05" strokeWidth="1.5" strokeLinecap="round" />
        ))}

        {/* ═══════════════════════════════════════
            SCAN LINES OVERLAY — through entire watch
        ═══════════════════════════════════════ */}
        <rect x="0" y="0" width="280" height="490" fill="url(#g-lines)" />
      </svg>
    </div>
  );
}
