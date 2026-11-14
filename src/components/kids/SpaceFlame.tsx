'use client'

import { useEffect, useRef } from 'react'

export type GravityMode = 'space' | 'earth'
export type O2Level = 'low' | 'normal' | 'high'
export type FuelType = 'cloth' | 'paper' | 'plastic'
export type FlameState = 'burning' | 'out'

interface SpaceFlameProps {
  gravity: GravityMode
  o2Level: O2Level
  fuel: FuelType
  flameState: FlameState
  className?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
  sat: number
  alpha: number
}

interface Star {
  x: number
  y: number
  r: number
  twinkle: number
  phase: number
}

const O2_SCALE: Record<O2Level, number> = { low: 0.65, normal: 1.0, high: 1.4 }

export default function SpaceFlame({ gravity, o2Level, fuel, flameState, className = '' }: SpaceFlameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({ gravity, o2Level, fuel, flameState })
  const rafRef = useRef<number>(0)
  const starsRef = useRef<Star[]>([])
  const particlesRef = useRef<Particle[]>([])
  const transitionRef = useRef<number>(gravity === 'space' ? 1 : 0) // 0 = earth, 1 = space
  const timeRef = useRef<number>(0)

  // Keep state in ref so the animation loop always reads fresh values
  useEffect(() => {
    stateRef.current = { gravity, o2Level, fuel, flameState }
  }, [gravity, o2Level, fuel, flameState])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      initStars()
    }

    const initStars = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      starsRef.current = Array.from({ length: 120 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        twinkle: Math.random() * 0.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const spawnParticle = (cx: number, cy: number, o2Scale: number, isSpace: boolean, fuelType: FuelType) => {
      const count = isSpace ? 2 : 3
      for (let i = 0; i < count; i++) {
        const angle = isSpace
          ? Math.random() * Math.PI * 2
          : (Math.random() - 0.5) * 0.9 - Math.PI / 2
        const speed = (Math.random() * 0.8 + 0.3) * o2Scale
        const baseHue = fuelType === 'plastic' ? 190 : fuelType === 'cloth' ? 20 : 30
        const hueVar = isSpace ? (fuelType === 'plastic' ? 30 : 40) : 20
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 10,
          y: cy + (Math.random() - 0.5) * 10,
          vx: Math.cos(angle) * speed * (isSpace ? 0.6 : 0.3),
          vy: Math.sin(angle) * speed * (isSpace ? 0.6 : 1.0),
          life: 0,
          maxLife: (Math.random() * 40 + 30) * o2Scale,
          size: (Math.random() * 6 + 3) * o2Scale,
          hue: baseHue + Math.random() * hueVar - hueVar / 2,
          sat: 90 + Math.random() * 10,
          alpha: 0,
        })
      }
    }

    let frame = 0

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      frame++
      timeRef.current += 0.016

      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      const { gravity: g, o2Level: o2, fuel: f, flameState: fs } = stateRef.current

      // Transition
      const targetT = g === 'space' ? 1 : 0
      const currentT = transitionRef.current
      const speed = 0.025
      transitionRef.current = currentT + (targetT - currentT) * speed

      const t = transitionRef.current
      const o2Scale = O2_SCALE[o2]
      const isBurning = fs === 'burning'

      ctx.clearRect(0, 0, W, H)

      // Deep space background
      const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7)
      bgGrad.addColorStop(0, '#080e1a')
      bgGrad.addColorStop(1, '#020408')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      // Stars
      const t2 = timeRef.current
      starsRef.current.forEach(s => {
        const alpha = s.twinkle * (0.5 + 0.5 * Math.sin(t2 * 1.2 + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,220,255,${alpha})`
        ctx.fill()
      })

      // Centre of flame
      const cx = W / 2
      const cy = H / 2 + H * 0.05

      if (isBurning) {
        // Spawn particles
        if (frame % 2 === 0) spawnParticle(cx, cy, o2Scale, t > 0.5, f)

        // Update & draw particles
        particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife)
        particlesRef.current.forEach(p => {
          p.life++
          const progress = p.life / p.maxLife
          p.alpha = progress < 0.2
            ? progress / 0.2
            : progress < 0.7
              ? 1
              : 1 - (progress - 0.7) / 0.3

          // Gravity pull
          if (t < 0.5) p.vy -= 0.04 * (1 - t) // earth: upward buoyancy
          p.x += p.vx
          p.y += p.vy

          const brightness = 50 + (1 - progress) * 40
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${p.hue},${p.sat}%,${brightness}%,${p.alpha * 0.6})`
          ctx.fill()
        })

        // ---- Core flame glow ----
        const wobble = Math.sin(t2 * 4) * 4 * o2Scale
        const wobble2 = Math.cos(t2 * 3.1) * 3 * o2Scale

        if (t > 0.3) {
          // Space flame — spherical ball
          const baseR = 55 * o2Scale
          const r = baseR + wobble

          // Outer blue halo
          const outerGrad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.6)
          outerGrad.addColorStop(0, `rgba(60,120,255,${0.18 * t})`)
          outerGrad.addColorStop(0.5, `rgba(30,60,180,${0.1 * t})`)
          outerGrad.addColorStop(1, 'rgba(0,0,80,0)')
          ctx.beginPath()
          ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2)
          ctx.fillStyle = outerGrad
          ctx.fill()

          // Mid magenta/pink ring
          const midGrad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r)
          midGrad.addColorStop(0, `rgba(255,255,255,${0.95 * t})`)
          midGrad.addColorStop(0.3, `rgba(255,100,200,${0.9 * t})`)
          midGrad.addColorStop(0.7, `rgba(180,60,255,${0.6 * t})`)
          midGrad.addColorStop(1, `rgba(60,80,255,${0.1 * t})`)
          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.fillStyle = midGrad
          ctx.fill()
        }

        if (t < 0.7) {
          // Earth flame — teardrop pointing up
          const flameH = (100 + wobble * 2) * o2Scale
          const flameW = (28 + wobble2) * o2Scale
          const alpha = 1 - t * 0.8

          // Orange outer
          const earthGrad = ctx.createRadialGradient(cx, cy - flameH * 0.3, flameW * 0.1, cx, cy, flameH * 0.9)
          earthGrad.addColorStop(0, `rgba(255,255,180,${alpha})`)
          earthGrad.addColorStop(0.3, `rgba(255,160,20,${alpha * 0.9})`)
          earthGrad.addColorStop(0.7, `rgba(255,60,0,${alpha * 0.7})`)
          earthGrad.addColorStop(1, `rgba(200,20,0,0)`)

          ctx.save()
          ctx.translate(cx, cy)
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.bezierCurveTo(-flameW, -flameH * 0.4, -flameW * 0.6, -flameH * 0.8, 0, -flameH)
          ctx.bezierCurveTo(flameW * 0.6, -flameH * 0.8, flameW, -flameH * 0.4, 0, 0)
          ctx.closePath()
          ctx.fillStyle = earthGrad
          ctx.fill()
          ctx.restore()
        }

        // Central bright core (always present)
        const coreR = 14 * o2Scale
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR)
        coreGrad.addColorStop(0, 'rgba(255,255,255,1)')
        coreGrad.addColorStop(0.4, 'rgba(255,220,100,0.9)')
        coreGrad.addColorStop(1, 'rgba(255,100,30,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
        ctx.fillStyle = coreGrad
        ctx.fill()

      } else {
        // Flame out — fade residual glow
        particlesRef.current = []
        const smokeR = 30
        const smokeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, smokeR)
        smokeGrad.addColorStop(0, 'rgba(100,100,110,0.15)')
        smokeGrad.addColorStop(1, 'rgba(60,60,70,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, smokeR, 0, Math.PI * 2)
        ctx.fillStyle = smokeGrad
        ctx.fill()
      }

      // Fuel sample base
      const sampleColors: Record<FuelType, string> = {
        cloth: '#c8a06e',
        paper: '#e8d8b0',
        plastic: '#6888b8',
      }
      ctx.save()
      ctx.translate(cx, cy + 2)
      ctx.scale(1, 0.35)
      ctx.beginPath()
      ctx.arc(0, 0, 18, 0, Math.PI * 2)
      ctx.fillStyle = sampleColors[f]
      ctx.fill()
      ctx.restore()

      // Label — gravity mode indicator
      ctx.font = '11px monospace'
      ctx.fillStyle = 'rgba(100,180,255,0.6)'
      ctx.textAlign = 'center'
      ctx.fillText(g === 'space' ? '⬤ MICROGRAVITY' : '⬤ 1g EARTH', W / 2, H - 16)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: 'block' }}
    />
  )
}

