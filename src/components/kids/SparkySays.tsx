'use client'

export type SparkMood = 'happy' | 'surprised' | 'concerned' | 'excited'

interface SparkySaysProps {
  message: string
  mood: SparkMood
  className?: string
}

const MOOD_COLORS: Record<SparkMood, { eye: string; glow: string; antenna: string }> = {
  happy:     { eye: '#06b6d4', glow: '#06b6d4', antenna: '#f97316' },
  surprised: { eye: '#f59e0b', glow: '#f59e0b', antenna: '#a855f7' },
  concerned: { eye: '#ef4444', glow: '#ef4444', antenna: '#06b6d4' },
  excited:   { eye: '#10b981', glow: '#10b981', antenna: '#f97316' },
}

const MOOD_EXPRESSIONS: Record<SparkMood, string> = {
  happy:     '◡',
  surprised: '○',
  concerned: '︵',
  excited:   '◉',
}

const MOOD_LABEL: Record<SparkMood, string> = {
  happy:     'SPARKY says:',
  surprised: 'WOW! SPARKY says:',
  concerned: 'SPARKY warns:',
  excited:   'AMAZING! SPARKY says:',
}

export default function SparkySays({ message, mood, className = '' }: SparkySaysProps) {
  const c = MOOD_COLORS[mood]

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {/* Robot SVG */}
      <div className="flex-shrink-0 relative" style={{ width: 72, height: 80 }}>
        <svg viewBox="0 0 72 80" width="72" height="80" aria-hidden="true">
          {/* Glow behind head */}
          <ellipse cx="36" cy="34" rx="28" ry="26" fill={c.glow} opacity="0.12" />

          {/* Antenna */}
          <line x1="36" y1="10" x2="36" y2="20" stroke={c.antenna} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="36" cy="8" r="4" fill={c.antenna} opacity="0.95" />
          <circle cx="36" cy="8" r="6" fill={c.glow} opacity="0.25" />

          {/* Head */}
          <rect x="12" y="20" width="48" height="38" rx="12" fill="#1e293b" stroke={c.glow} strokeWidth="1.5" />

          {/* Eyes */}
          <ellipse cx="24" cy="35" rx="6" ry="6" fill={c.eye} opacity="0.9" />
          <ellipse cx="48" cy="35" rx="6" ry="6" fill={c.eye} opacity="0.9" />
          <ellipse cx="24" cy="35" rx="2.5" ry="2.5" fill="white" opacity="0.8" />
          <ellipse cx="48" cy="35" rx="2.5" ry="2.5" fill="white" opacity="0.8" />

          {/* Eye glow */}
          <ellipse cx="24" cy="35" rx="8" ry="8" fill={c.glow} opacity="0.2" />
          <ellipse cx="48" cy="35" rx="8" ry="8" fill={c.glow} opacity="0.2" />

          {/* Mouth / expression */}
          <text
            x="36" y="51"
            textAnchor="middle"
            fontSize="10"
            fill={c.eye}
            fontFamily="monospace"
            opacity="0.9"
          >
            {MOOD_EXPRESSIONS[mood]}
          </text>

          {/* Body */}
          <rect x="20" y="60" width="32" height="18" rx="8" fill="#0f172a" stroke={c.glow} strokeWidth="1" />
          {/* Chest detail */}
          <rect x="27" y="65" width="8" height="4" rx="2" fill={c.antenna} opacity="0.6" />
          <rect x="37" y="65" width="8" height="4" rx="2" fill={c.eye} opacity="0.6" />
        </svg>
      </div>

      {/* Speech bubble */}
      <div className="flex-1 relative">
        {/* Bubble tail pointing left */}
        <div
          className="absolute left-0 top-5"
          style={{
            width: 0, height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: `12px solid ${c.glow}22`,
            transform: 'translateX(-11px)',
          }}
        />
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: 'rgba(15,23,42,0.85)',
            borderColor: `${c.glow}44`,
            boxShadow: `0 0 20px ${c.glow}18`,
          }}
        >
          <p
            className="text-xs font-mono uppercase tracking-widest mb-1"
            style={{ color: c.glow }}
          >
            {MOOD_LABEL[mood]}
          </p>
          <p className="text-sm leading-relaxed text-slate-100 font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

