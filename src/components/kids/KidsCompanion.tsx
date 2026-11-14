'use client'

// Shared companion robot SVG — inspired by the blue rounded robot reference.
// Used across all Kids Experience sections.

export type CompanionMood = 'wave' | 'happy' | 'thinking' | 'excited' | 'explain' | 'concerned' | 'surprised'

interface KidsCompanionProps {
  mood?: CompanionMood
  size?: number
  className?: string
  label?: string
}

// Mouth paths per mood
const MOUTHS: Record<CompanionMood, string> = {
  wave:      'M 28 46 Q 36 52 44 46',
  happy:     'M 26 44 Q 36 54 46 44',
  thinking:  'M 30 47 Q 36 46 42 47',
  excited:   'M 24 43 Q 36 56 48 43',
  explain:   'M 28 46 Q 36 50 44 46',
  concerned: 'M 28 50 Q 36 44 44 50',
  surprised: 'M 34 44 Q 36 52 38 44',
}

const EYEBROW_OFFSET: Record<CompanionMood, number> = {
  wave: 0, happy: -1, thinking: 1, excited: -2, explain: 0, concerned: 2, surprised: -3,
}

export default function KidsCompanion({ mood = 'wave', size = 100, className = '', label }: KidsCompanionProps) {
  const eyeOff = EYEBROW_OFFSET[mood]

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`} style={{ width: size }}>
      <svg
        viewBox="0 0 100 120"
        width={size}
        height={size * 1.2}
        aria-label={label ?? 'Sparky the robot companion'}
        role="img"
      >
        <defs>
          <radialGradient id="bodyGrad" cx="45%" cy="40%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </radialGradient>
          <radialGradient id="headGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1a2e" />
            <stop offset="100%" stopColor="#071020" />
          </linearGradient>
        </defs>

        {/* Antenna left */}
        <line x1="30" y1="6" x2="38" y2="17" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
        <circle cx="29" cy="5" r="3" fill="#f97316" />
        {/* Antenna right */}
        <line x1="70" y1="6" x2="62" y2="17" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
        <circle cx="71" cy="5" r="3" fill="#38bdf8" />

        {/* Head */}
        <rect x="18" y="12" width="64" height="52" rx="20" fill="url(#headGrad)" />
        {/* Head shadow */}
        <rect x="18" y="12" width="64" height="52" rx="20" fill="rgba(0,0,0,0.06)" />

        {/* Face screen */}
        <rect x="22" y="17" width="56" height="42" rx="14" fill="url(#screenGrad)" />
        {/* Screen rim */}
        <rect x="22" y="17" width="56" height="42" rx="14" fill="none" stroke="rgba(56,189,248,0.3)" strokeWidth="1" />

        {/* Eyebrows */}
        <path d={`M 28 ${29 + eyeOff} Q 34 ${26 + eyeOff} 40 ${29 + eyeOff}`} stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d={`M 60 ${29 + eyeOff} Q 66 ${26 + eyeOff} 72 ${29 + eyeOff}`} stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Eyes — big cyan circles */}
        <circle cx="34" cy="36" r="8" fill="#0f2744" />
        <circle cx="66" cy="36" r="8" fill="#0f2744" />
        {/* Iris */}
        <circle cx="34" cy="36" r="6" fill="#06b6d4" filter="url(#glow)" />
        <circle cx="66" cy="36" r="6" fill="#06b6d4" filter="url(#glow)" />
        {/* Pupils */}
        <circle cx="34" cy="36" r="3" fill="#0a1a2e" />
        <circle cx="66" cy="36" r="3" fill="#0a1a2e" />
        {/* Eye shine */}
        <circle cx="31" cy="33" r="1.5" fill="white" opacity="0.9" />
        <circle cx="63" cy="33" r="1.5" fill="white" opacity="0.9" />

        {/* Mouth */}
        <path d={MOUTHS[mood]} stroke="#38bdf8" strokeWidth="2.2" fill="none" strokeLinecap="round" />

        {/* Cheek dots */}
        <circle cx="25" cy="48" r="3" fill="#f97316" opacity="0.4" />
        <circle cx="75" cy="48" r="3" fill="#f97316" opacity="0.4" />

        {/* Neck */}
        <rect x="42" y="62" width="16" height="8" rx="4" fill="#7dd3fc" />

        {/* Body */}
        <rect x="22" y="68" width="56" height="38" rx="16" fill="url(#bodyGrad)" />
        {/* Body highlight */}
        <rect x="26" y="70" width="48" height="16" rx="10" fill="rgba(255,255,255,0.15)" />
        {/* Chest button */}
        <circle cx="50" cy="88" r="7" fill="#0f2744" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="50" cy="88" r="4" fill="#fbbf24" opacity="0.9" />

        {/* Left arm — waving for 'wave' mood */}
        {mood === 'wave' ? (
          <>
            <rect x="6" y="58" width="16" height="30" rx="8" fill="#7dd3fc" transform="rotate(-25 14 73)" />
            {/* Hand */}
            <circle cx="6" cy="52" r="8" fill="#bae6fd" />
            <line x1="2" y1="48" x2="2" y2="43" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="6" y1="46" x2="6" y2="40" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="10" y1="47" x2="10" y2="41" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <rect x="6" y="68" width="16" height="30" rx="8" fill="#7dd3fc" />
        )}

        {/* Right arm */}
        <rect x="78" y="68" width="16" height="30" rx="8" fill="#7dd3fc" />

        {/* Feet */}
        <rect x="30" y="102" width="16" height="12" rx="6" fill="#60a5fa" />
        <rect x="54" y="102" width="16" height="12" rx="6" fill="#60a5fa" />
      </svg>
    </div>
  )
}

