'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { runSimulation } from '@/lib/simulation/combustionModel'
import type { FuelMaterial } from '@/lib/simulation/types'
import { useAccessibility } from '@/context/AccessibilityContext'

export type HeroRegimeId = 'iss' | 'moon' | 'earth'

interface HeroRegime {
  id: HeroRegimeId
  label: string
  sublabel: string
  gravity: number
  oxygenPercent: number
  pressure: number
  airflowVelocity: number
  fuel: FuelMaterial
  accent: string
}

export const HERO_REGIMES: HeroRegime[] = [
  {
    id: 'iss',
    label: '0.001 g · ISS Microgravity',
    sublabel: 'Spherical Molecular Diffusion Regime',
    gravity: 0.001,
    oxygenPercent: 21,
    pressure: 1.0,
    airflowVelocity: 0.02,
    fuel: 'cellulose',
    accent: '#f97316',
  },
  {
    id: 'moon',
    label: '1.62 m/s² · Lunar Habitat',
    sublabel: 'Partial-Buoyancy Enriched Atmosphere',
    gravity: 1.62,
    oxygenPercent: 30,
    pressure: 0.6,
    airflowVelocity: 0.08,
    fuel: 'pmma',
    accent: '#38bdf8',
  },
  {
    id: 'earth',
    label: '9.81 m/s² · Earth 1g Reference',
    sublabel: 'Buoyancy-Driven Convective Plume',
    gravity: 9.81,
    oxygenPercent: 21,
    pressure: 1.0,
    airflowVelocity: 0.1,
    fuel: 'cellulose',
    accent: '#ef4444',
  },
]

interface HeroCombustionSphereProps {
  activeRegime: HeroRegimeId
  onRegimeChange: (id: HeroRegimeId) => void
}

export default function HeroCombustionSphere({
  activeRegime,
  onRegimeChange,
}: HeroCombustionSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hovered, setHovered] = useState(false)
  const { effectiveReducedMotion } = useAccessibility()

  const regime = useMemo(
    () => HERO_REGIMES.find((r) => r.id === activeRegime) ?? HERO_REGIMES[0],
    [activeRegime]
  )

  // Compute real D² Law output for the selected hero regime
  const simSnapshot = useMemo(() => {
    const res = runSimulation({
      fuel: regime.fuel,
      gravity: regime.gravity,
      oxygenPercent: regime.oxygenPercent,
      pressure: regime.pressure,
      airflowVelocity: regime.airflowVelocity,
      duration: 30,
      sampleDiameter: 6,
    })
    const midFrame = res.frames[Math.min(10, Math.floor(res.frames.length / 3))] ?? res.frames[0]
    return {
      frame: midFrame,
      summary: res.summary,
    }
  }, [regime])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let t = 0
    const prefersReducedMotion =
      effectiveReducedMotion ||
      (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    const render = () => {
      t += prefersReducedMotion ? 0 : 0.022
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      // 1. Deep chamber viewport interior
      const bgGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, w * 0.48)
      if (regime.id === 'iss') {
        bgGrad.addColorStop(0, 'rgba(30, 58, 138, 0.35)')
        bgGrad.addColorStop(0.55, 'rgba(15, 23, 42, 0.88)')
        bgGrad.addColorStop(1, 'rgba(3, 5, 10, 0.98)')
      } else if (regime.id === 'moon') {
        bgGrad.addColorStop(0, 'rgba(14, 116, 144, 0.35)')
        bgGrad.addColorStop(0.55, 'rgba(12, 20, 38, 0.88)')
        bgGrad.addColorStop(1, 'rgba(3, 5, 10, 0.98)')
      } else {
        bgGrad.addColorStop(0, 'rgba(124, 45, 18, 0.38)')
        bgGrad.addColorStop(0.55, 'rgba(18, 13, 24, 0.9)')
        bgGrad.addColorStop(1, 'rgba(3, 5, 10, 0.98)')
      }
      ctx.fillStyle = bgGrad
      ctx.beginPath()
      ctx.arc(cx, cy, w * 0.45, 0, Math.PI * 2)
      ctx.fill()

      // 2. Subtle Schlieren optical interferometry rings inside chamber
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)'
      ctx.lineWidth = 1
      for (let r = 36; r < w * 0.43; r += 26) {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Crosshair axes
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)'
      ctx.beginPath()
      ctx.moveTo(cx - w * 0.42, cy)
      ctx.lineTo(cx + w * 0.42, cy)
      ctx.moveTo(cx, cy - h * 0.42)
      ctx.lineTo(cx, cy + h * 0.42)
      ctx.stroke()

      // 3. Physically-informed flame geometry driven by D² Law aspectRatio & flameRadius
      const ar = Math.min(Math.max(simSnapshot.frame.flameAspectRatio, 1.0), 2.5)
      const baseRadius = Math.min(Math.max(simSnapshot.frame.flameRadius * 5.8, 52), 92)
      const breath = Math.sin(t * 2.2) * 2.5
      const rx = (baseRadius + breath) / Math.sqrt(ar)
      const ry = (baseRadius + breath) * Math.sqrt(ar)
      const flameCy = cy - (ar - 1) * 22

      // Outer chemiluminescence reaction zone (blue-cyan in microgravity, amber-red in 1g)
      ctx.save()
      ctx.translate(cx, flameCy)

      const outerGlow = ctx.createRadialGradient(0, 0, rx * 0.15, 0, 0, Math.max(rx, ry) * 1.45)
      if (regime.id === 'iss') {
        outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
        outerGlow.addColorStop(0.28, 'rgba(251, 146, 60, 0.88)')
        outerGlow.addColorStop(0.58, 'rgba(234, 88, 12, 0.55)')
        outerGlow.addColorStop(0.82, 'rgba(56, 189, 248, 0.38)')
        outerGlow.addColorStop(1, 'rgba(6, 182, 212, 0)')
      } else if (regime.id === 'moon') {
        outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
        outerGlow.addColorStop(0.32, 'rgba(253, 224, 71, 0.85)')
        outerGlow.addColorStop(0.62, 'rgba(249, 115, 22, 0.55)')
        outerGlow.addColorStop(0.86, 'rgba(14, 165, 233, 0.35)')
        outerGlow.addColorStop(1, 'rgba(14, 165, 233, 0)')
      } else {
        outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
        outerGlow.addColorStop(0.25, 'rgba(253, 224, 71, 0.92)')
        outerGlow.addColorStop(0.58, 'rgba(249, 115, 22, 0.72)')
        outerGlow.addColorStop(0.85, 'rgba(220, 38, 38, 0.32)')
        outerGlow.addColorStop(1, 'rgba(220, 38, 38, 0)')
      }

      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 1.32, ry * 1.32, 0, 0, Math.PI * 2)
      ctx.fill()

      // Crisp reaction front boundary ring (characteristic of microgravity spherical flames)
      ctx.strokeStyle =
        regime.id === 'iss'
          ? 'rgba(56, 189, 248, 0.55)'
          : regime.id === 'moon'
          ? 'rgba(251, 191, 36, 0.5)'
          : 'rgba(249, 115, 22, 0.45)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Soot shell / glowing ember particles (inspired by NASA FLEX-2 imagery)
      const numSparks = 22
      for (let i = 0; i < numSparks; i++) {
        const angle = (i / numSparks) * Math.PI * 2 + t * 0.35
        const dist = rx * (0.52 + 0.22 * Math.sin(i * 1.7 + t))
        const px = Math.cos(angle) * dist
        const py = Math.sin(angle) * dist * (ry / rx)
        const sparkR = 1.3 + (i % 3) * 0.9
        ctx.fillStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.85)' : 'rgba(251, 146, 60, 0.75)'
        ctx.beginPath()
        ctx.arc(px, py, sparkR, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()

      // 4. Central solid/droplet fuel sample + silicon carbide needle sting
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx, cy + 12)
      ctx.lineTo(cx, cy + w * 0.44)
      ctx.stroke()

      const sampleR = Math.max(simSnapshot.frame.sampleDiameter * 2.2, 9)
      const sampleGrad = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, sampleR)
      sampleGrad.addColorStop(0, '#475569')
      sampleGrad.addColorStop(0.7, '#1e293b')
      sampleGrad.addColorStop(1, '#090d16')
      ctx.fillStyle = sampleGrad
      ctx.beginPath()
      ctx.arc(cx, cy, sampleR, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.65)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      // 5. Chamber metallic bezel rim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, w * 0.45, 0, Math.PI * 2)
      ctx.stroke()

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render)
      }
    }

    render()
    return () => cancelAnimationFrame(animId)
  }, [regime, simSnapshot, effectiveReducedMotion])

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none max-w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ambient radial illumination behind sphere (Ref 1 Mars glow) */}
      <div
        className="pointer-events-none absolute rounded-full blur-3xl transition-all duration-700"
        style={{
          width: 'clamp(220px, 34vw, 480px)',
          height: 'clamp(220px, 34vw, 480px)',
          background:
            regime.id === 'iss'
              ? 'radial-gradient(circle, rgba(249,115,22,0.34) 0%, rgba(6,182,212,0.16) 52%, transparent 75%)'
              : regime.id === 'moon'
              ? 'radial-gradient(circle, rgba(56,189,248,0.32) 0%, rgba(249,115,22,0.18) 52%, transparent 75%)'
              : 'radial-gradient(circle, rgba(239,68,68,0.36) 0%, rgba(249,115,22,0.2) 52%, transparent 75%)',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}
      />

      {/* Outer orbital diagnostic ring SVG */}
      <div className="relative flex items-center justify-center max-w-full">
        <svg
          className="pointer-events-none absolute w-[108%] sm:w-[118%] h-[108%] sm:h-[118%] max-w-[88vw] sm:max-w-none"
          viewBox="0 0 400 400"
          aria-hidden="true"
        >
          {/* Thin graduated outer circle (Ref 1 Mars ring) */}
          <circle
            cx="200"
            cy="200"
            r="186"
            fill="none"
            stroke="rgba(249, 115, 22, 0.28)"
            strokeWidth="0.9"
            strokeDasharray="6 4"
          />
          <circle
            cx="200"
            cy="200"
            r="172"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="0.75"
          />
          {/* Cardinal optical tick marks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180
            const x1 = 200 + Math.cos(rad) * 168
            const y1 = 200 + Math.sin(rad) * 168
            const x2 = 200 + Math.cos(rad) * 178
            const y2 = 200 + Math.sin(rad) * 178
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(249, 115, 22, 0.55)"
                strokeWidth="1.2"
              />
            )
          })}
          {/* Orbital node indicator */}
          <circle cx="200" cy="14" r="3.5" fill="#f97316" />
          <circle cx="386" cy="200" r="2.5" fill="#38bdf8" />
        </svg>

        {/* Live Combustion Chamber Canvas */}
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="relative z-10 rounded-full transition-transform duration-500"
          style={{
            width: 'clamp(195px, 24vw, 350px)',
            height: 'clamp(195px, 24vw, 350px)',
            boxShadow:
              '0 0 60px rgba(249, 115, 22, 0.22), inset 0 0 36px rgba(6, 182, 212, 0.18)',
          }}
          aria-label={`Interactive microgravity combustion chamber visualization in ${regime.label}`}
        />

        {/* Floating telemetry callouts attached to the sphere */}
        <div className="hidden md:flex flex-col items-end absolute -left-36 top-6 z-20 pointer-events-none text-right">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
            T_FLAME // D² EST.
          </span>
          <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
            {simSnapshot.frame.flameTemperature.toFixed(0)} K
          </span>
        </div>

        <div className="hidden md:flex flex-col items-start absolute -right-36 bottom-8 z-20 pointer-events-none text-left">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
            ASPECT RATIO // AR
          </span>
          <span className="font-mono text-sm font-bold text-cyan-400 tabular-nums">
            {simSnapshot.frame.flameAspectRatio.toFixed(2)} ({regime.id === 'iss' ? 'Spherical' : 'Buoyant'})
          </span>
        </div>
      </div>

      {/* Compact Mobile Telemetry Strip (< md) */}
      <div className="flex md:hidden items-center justify-center gap-4 mt-4 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 font-mono text-[11px] tabular-nums">
        <span className="text-amber-300 font-bold">
          T_f: {simSnapshot.frame.flameTemperature.toFixed(0)} K
        </span>
        <span className="h-3 w-px bg-white/15" />
        <span className="text-cyan-300 font-bold">
          AR: {simSnapshot.frame.flameAspectRatio.toFixed(2)} ({regime.id === 'iss' ? 'Spherical' : 'Buoyant'})
        </span>
      </div>

      {/* Interactive Regime Pill Selector directly below the sphere */}
      <div
        className="relative z-20 mt-4 md:mt-6 inline-flex flex-wrap items-center justify-center gap-1 rounded-full p-1 border border-white/10 bg-[#060a14]/90 backdrop-blur-md"
        role="group"
        aria-label="Select combustion gravity regime preview"
      >
        {HERO_REGIMES.map((r) => {
          const isSelected = r.id === activeRegime
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onRegimeChange(r.id)}
              className={`min-h-[38px] px-3 sm:px-3.5 py-1.5 rounded-full font-mono text-[10px] tracking-[0.12em] uppercase transition-all cursor-pointer ${
                isSelected
                  ? 'bg-orange-500/20 text-amber-300 border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.25)]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {r.id === 'iss' ? '0.001g ISS' : r.id === 'moon' ? '0.16g Moon' : '1.0g Earth'}
            </button>
          )
        })}
      </div>
    </div>
  )
}

