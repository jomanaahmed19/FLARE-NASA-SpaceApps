'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

/* ────────────────────────────────────────────────────────────
   FLARE Logo — Flame icon + optional wordmark
   ──────────────────────────────────────────────────────────── */

interface FlareLogoProps {
  /** Visual size of the logo */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Show the FLARE text wordmark alongside the flame */
  showWordmark?: boolean
  /** Animate the flame icon */
  animated?: boolean
  className?: string
}

const SIZE_MAP = {
  xs: { icon: 18,  text: 'text-sm',  gap: 'gap-1.5' },
  sm: { icon: 26,  text: 'text-xl',  gap: 'gap-2'   },
  md: { icon: 34,  text: 'text-2xl', gap: 'gap-2.5' },
  lg: { icon: 60,  text: 'text-5xl', gap: 'gap-3.5' },
  xl: { icon: 90,  text: 'text-7xl', gap: 'gap-5'   },
}

export function FlareLogo({
  size = 'md',
  showWordmark = true,
  animated = true,
  className,
}: FlareLogoProps) {
  const { icon, text, gap } = SIZE_MAP[size]
  const id = useId()

  return (
    <div className={cn('flex items-center', gap, className)}>
      <div className={animated ? 'animate-flame-flicker' : undefined}>
        <FlameIconSVG size={icon} uid={id} />
      </div>

      {showWordmark && (
        <span
          className={cn('font-orbitron font-black tracking-wider text-white select-none', text)}
          style={{ textShadow: '0 0 24px rgba(249,115,22,0.35)' }}
        >
          FLARE
        </span>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Standalone flame icon (hero usage)
   ──────────────────────────────────────────────────────────── */
export function FlareFlameIcon({
  size = 64,
  animated = true,
  className,
}: {
  size?: number
  animated?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <div className={cn(animated ? 'animate-flame-flicker' : undefined, className)}>
      <FlameIconSVG size={size} uid={id} />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Internal SVG — multi-layer realistic flame
   uid keeps gradient IDs unique per instance
   ──────────────────────────────────────────────────────────── */
function FlameIconSVG({ size, uid }: { size: number; uid: string }) {
  const h = Math.round(size * 1.3)
  const og = `outerG-${uid}`
  const mg = `midG-${uid}`
  const ig = `innerG-${uid}`

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 40 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── Outer flame ── */}
      <path
        d="M20 3
           C20 3, 10 11, 7 20
           C4 29, 6 37, 11 42
           C14 45, 17 48, 20 49
           C23 48, 26 45, 29 42
           C34 37, 36 29, 33 20
           C30 11, 20 3, 20 3Z"
        fill={`url(#${og})`}
        opacity="0.95"
      />

      {/* ── Mid flame ── */}
      <path
        d="M20 11
           C20 11, 13 18, 11 25
           C9.5 31, 11 37, 15 41
           C17 43, 18.5 44.5, 20 45
           C21.5 44.5, 23 43, 25 41
           C29 37, 30.5 31, 29 25
           C27 18, 20 11, 20 11Z"
        fill={`url(#${mg})`}
      />

      {/* ── Inner flame ── */}
      <path
        d="M20 20
           C20 20, 15.5 25, 15 30
           C14.5 35, 16.5 39, 19 41.5
           C19.5 42, 20 42.5, 20 42.5
           C20 42.5, 20.5 42, 21 41.5
           C23.5 39, 25.5 35, 25 30
           C24.5 25, 20 20, 20 20Z"
        fill={`url(#${ig})`}
      />

      {/* ── Core glow ── */}
      <ellipse cx="20" cy="39" rx="2.8" ry="3.2" fill="#fffdf0" opacity="0.92" />

      <defs>
        <linearGradient id={og} x1="20" y1="3" x2="20" y2="49" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#c2410c" />
          <stop offset="55%"  stopColor="#ea580c" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id={mg} x1="20" y1="11" x2="20" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fb923c" />
          <stop offset="50%"  stopColor="#f97316" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>

        <linearGradient id={ig} x1="20" y1="20" x2="20" y2="42.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fde68a" />
          <stop offset="55%"  stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  )
}
