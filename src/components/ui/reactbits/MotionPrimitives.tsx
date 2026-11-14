'use client'

import React, { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// ═════════════════════════════════════════════════════════════════════════════
// 1. StarBorder — Subtle orbiting starlight trace for primary CTAs
//    Adapted from ReactBits Star Border (https://www.reactbits.dev/animations/star-border)
//    Honors prefers-reduced-motion and avoids distracting neon glow.
// ═════════════════════════════════════════════════════════════════════════════

interface StarBorderProps {
  children: React.ReactNode
  color?: string
  speed?: string
  className?: string
}

export function StarBorder({
  children,
  color = 'rgba(249, 115, 22, 0.75)',
  speed = '6s',
  className = '',
}: StarBorderProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className={`relative inline-flex overflow-hidden rounded-full p-[1px] ${className}`}
    >
      {!prefersReducedMotion && (
        <>
          <div
            className="pointer-events-none absolute w-[260%] h-[55%] opacity-75 bottom-[-12px] right-[-180%] rounded-full animate-star-movement-bottom z-0"
            style={{
              background: `radial-gradient(circle, ${color}, transparent 14%)`,
              animationDuration: speed,
            }}
          />
          <div
            className="pointer-events-none absolute w-[260%] h-[55%] opacity-75 top-[-12px] left-[-180%] rounded-full animate-star-movement-top z-0"
            style={{
              background: `radial-gradient(circle, ${color}, transparent 14%)`,
              animationDuration: speed,
            }}
          />
        </>
      )}
      <div className="relative z-10 inline-flex items-center w-full h-full rounded-full">
        {children}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. ElasticSlider — Tactile spring-responsive scientific parameter control
//    Adapted from ReactBits Elastic Slider (https://www.reactbits.dev/components/elastic-slider)
//    Provides smooth visual progress fill, elastic scale feedback on interaction,
//    keyboard accessibility, and tabular-nums readout.
// ═════════════════════════════════════════════════════════════════════════════

interface ElasticSliderProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  displayValue: string
  accentColor?: 'cyan' | 'amber' | 'orange' | 'emerald'
  hint?: string
  onChange: (nextVal: number) => void
}

export function ElasticSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  displayValue,
  accentColor = 'cyan',
  hint,
  onChange,
}: ElasticSliderProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isDragging, setIsDragging] = useState(false)
  const [overflowDir, setOverflowDir] = useState<-1 | 0 | 1>(0)

  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  const palette = {
    cyan: {
      text: 'text-cyan-300',
      fill: 'linear-gradient(90deg, rgba(6,182,212,0.55) 0%, rgba(56,189,248,0.95) 100%)',
      thumbBorder: 'rgba(56, 189, 248, 0.9)',
      glow: 'rgba(6, 182, 212, 0.35)',
    },
    amber: {
      text: 'text-amber-300',
      fill: 'linear-gradient(90deg, rgba(245,158,11,0.55) 0%, rgba(251,191,36,0.95) 100%)',
      thumbBorder: 'rgba(251, 191, 36, 0.9)',
      glow: 'rgba(245, 158, 11, 0.35)',
    },
    orange: {
      text: 'text-orange-300',
      fill: 'linear-gradient(90deg, rgba(234,88,12,0.55) 0%, rgba(251,146,60,0.95) 100%)',
      thumbBorder: 'rgba(251, 146, 60, 0.9)',
      glow: 'rgba(249, 115, 22, 0.35)',
    },
    emerald: {
      text: 'text-emerald-300',
      fill: 'linear-gradient(90deg, rgba(16,185,129,0.55) 0%, rgba(52,211,153,0.95) 100%)',
      thumbBorder: 'rgba(52, 211, 153, 0.9)',
      glow: 'rgba(16, 185, 129, 0.35)',
    },
  }[accentColor]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value)
    if (raw <= min) setOverflowDir(-1)
    else if (raw >= max) setOverflowDir(1)
    else setOverflowDir(0)
    onChange(raw)
  }

  return (
    <div className="select-none">
      <div className="flex items-baseline justify-between mb-1.5">
        <label htmlFor={id} className="text-sm font-medium text-white cursor-pointer">
          {label}
        </label>
        <motion.span
          animate={
            !prefersReducedMotion && isDragging
              ? { scale: 1.06 }
              : { scale: 1.0 }
          }
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          className={`font-mono text-xs sm:text-sm font-semibold tabular-nums px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 ${palette.text}`}
        >
          {displayValue}
        </motion.span>
      </div>

      {hint && <p className="text-xs text-slate-400 mb-2 leading-snug">{hint}</p>}

      <motion.div
        animate={
          !prefersReducedMotion && isDragging
            ? {
                scaleX: 1.015,
                scaleY: 1.12,
                x: overflowDir * 3,
              }
            : { scaleX: 1, scaleY: 1, x: 0 }
        }
        transition={{ type: 'spring', stiffness: 360, damping: 25 }}
        className="relative flex items-center h-6"
      >
        {/* Track Background */}
        <div className="pointer-events-none absolute inset-x-0 h-2 rounded-full bg-slate-800/90 border border-slate-700/60 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${pct}%`,
              background: palette.fill,
              boxShadow: isDragging ? `0 0 12px ${palette.glow}` : 'none',
            }}
          />
        </div>

        {/* Native Range Input for 100% Keyboard, Screen Reader & Touch Support */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => {
            setIsDragging(false)
            setOverflowDir(0)
          }}
          onPointerCancel={() => {
            setIsDragging(false)
            setOverflowDir(0)
          }}
          onBlur={() => {
            setIsDragging(false)
            setOverflowDir(0)
          }}
          onChange={handleChange}
          aria-label={label}
          className="relative z-10 w-full h-6 opacity-0 cursor-pointer"
        />

        {/* Custom Tactile Thumb Indicator */}
        <div
          className="pointer-events-none absolute h-4 w-4 rounded-full bg-slate-950 transition-transform duration-75"
          style={{
            left: `calc(${pct}% - 8px)`,
            border: `2px solid ${palette.thumbBorder}`,
            boxShadow: isDragging
              ? `0 0 14px ${palette.glow}`
              : '0 2px 6px rgba(0,0,0,0.6)',
            transform: isDragging ? 'scale(1.18)' : 'scale(1)',
          }}
        />
      </motion.div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. SpotlightCard — Cursor-aware subtle radial illumination & gentle elevation
//    Adapted from ReactBits Spotlight / Card patterns
// ═════════════════════════════════════════════════════════════════════════════

interface SpotlightCardProps {
  children: React.ReactNode
  spotlightColor?: string
  className?: string
  style?: React.CSSProperties
}

export function SpotlightCard({
  children,
  spotlightColor = 'rgba(249, 115, 22, 0.14)',
  className = '',
  style,
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(380px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 65%)`,
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. AgentStatusMark & LatticeLoader — Authentic AI Agent state indicators
//    Reflects real application states: idle, executing_tools, synthesizing, error
// ═════════════════════════════════════════════════════════════════════════════

export type AgentActivityState =
  | 'idle'
  | 'executing_tools'
  | 'retrieving_nasa'
  | 'synthesizing'
  | 'completed'
  | 'error'

export function AgentStatusMark({
  state,
  isLiveCloud,
  variant = 'science',
}: {
  state: AgentActivityState
  isLiveCloud?: boolean
  variant?: 'science' | 'kids'
}) {
  const config: Record<
    AgentActivityState,
    { dot: string; label: string; kidsLabel: string; pulse: boolean }
  > = {
    idle: {
      dot: isLiveCloud ? 'bg-emerald-400' : 'bg-cyan-400',
      label: isLiveCloud
        ? 'Connected · Live Gemini AI'
        : 'Connected · Local Agent Engine',
      kidsLabel: 'Sparky Ready · Space Science Guide',
      pulse: false,
    },
    executing_tools: {
      dot: 'bg-amber-400',
      label: 'Running D² Law Solver & NASA Tools…',
      kidsLabel: 'Testing the Space Flame Chamber…',
      pulse: true,
    },
    retrieving_nasa: {
      dot: 'bg-cyan-400',
      label: 'Querying NASA PSI & NTRS Records…',
      kidsLabel: 'Checking NASA Space Station Facts…',
      pulse: true,
    },
    synthesizing: {
      dot: 'bg-emerald-400',
      label: 'Synthesizing Scientific Analysis…',
      kidsLabel: 'Sparky is writing your answer…',
      pulse: true,
    },
    completed: {
      dot: 'bg-emerald-400',
      label: 'Analysis Complete · Tools Verified',
      kidsLabel: 'Science Discovery Ready!',
      pulse: false,
    },
    error: {
      dot: 'bg-red-400',
      label: 'Connection Interrupted · Retry Ready',
      kidsLabel: 'Oops! Let’s try asking again',
      pulse: false,
    },
  }

  const cur = config[state]

  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {cur.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cur.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cur.dot}`} />
      </span>
      <span
        className={
          variant === 'kids'
            ? 'text-xs font-bold text-sky-200'
            : 'text-xs text-slate-400'
        }
      >
        {variant === 'kids' ? cur.kidsLabel : cur.label}
      </span>
    </div>
  )
}

export function LatticeLoader({
  label = 'Executing D² Law combustion solver & querying NASA archive…',
  variant = 'science',
}: {
  label?: string
  variant?: 'science' | 'kids'
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        variant === 'kids'
          ? 'flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-sky-50 border-2 border-sky-200 text-slate-800'
          : 'flex items-center gap-3.5 px-4 py-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 text-slate-200'
      }
    >
      {/* 3x3 Scientific Lattice Pulse */}
      <div className="grid grid-cols-3 gap-1 shrink-0" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
          <span
            key={idx}
            className={`w-1.5 h-1.5 rounded-sm animate-pulse ${
              variant === 'kids'
                ? idx % 2 === 0
                  ? 'bg-orange-500'
                  : 'bg-sky-500'
                : idx % 2 === 0
                ? 'bg-cyan-400'
                : 'bg-amber-400'
            }`}
            style={{ animationDelay: `${(idx % 3) * 140}ms` }}
          />
        ))}
      </div>
      <span
        className={
          variant === 'kids'
            ? 'text-xs sm:text-sm font-bold text-slate-700'
            : 'text-xs text-slate-300 font-medium'
        }
      >
        {label}
      </span>
    </div>
  )
}

