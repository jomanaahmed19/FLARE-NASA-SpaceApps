'use client'

import { useEffect, useRef } from 'react'
import { useAccessibility } from '@/context/AccessibilityContext'

interface Star {
  x: number
  y: number
  r: number
  baseOpacity: number
  speed: number
  phase: number
}

/**
 * StarField — animated canvas of twinkling stars.
 * Renders behind all content (z-index: 0, pointer-events: none).
 * Automatically reduces star density on mobile viewports to conserve battery
 * and pauses continuous animation when Reduced Motion is active.
 */
export function StarField({ count = 180 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { effectiveReducedMotion } = useAccessibility()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let W = window.innerWidth
    let H = window.innerHeight
    const isMobile = W < 768
    const actualCount = isMobile ? Math.min(count, 90) : count

    // Deterministic seed so stars don't jump on resize
    const stars: Star[] = Array.from({ length: actualCount }, (_, i) => ({
      x:           (((i * 1327) % 1000) / 1000) * W,
      y:           (((i * 2731) % 1000) / 1000) * H,
      r:           0.3 + (((i * 491)  % 100) / 100) * 1.4,
      baseOpacity: 0.08 + (((i * 613) % 100) / 100) * 0.55,
      speed:       0.004 + (((i * 317) % 100) / 100) * 0.018,
      phase:       ((i * 1033) % 628) / 100,
    }))

    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      canvas!.width  = W
      canvas!.height = H
      if (effectiveReducedMotion) {
        drawFrame(0)
      }
    }

    function drawFrame(t: number) {
      ctx!.clearRect(0, 0, W, H)

      for (const s of stars) {
        const opacity = effectiveReducedMotion
          ? s.baseOpacity * 0.75
          : s.baseOpacity * (0.4 + 0.6 * Math.sin(t * s.speed + s.phase))
        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(255,255,255,${opacity.toFixed(3)})`
        ctx!.fill()
      }
    }

    function loop(t: number) {
      drawFrame(t)
      if (!effectiveReducedMotion) {
        raf = requestAnimationFrame(loop)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    if (effectiveReducedMotion) {
      drawFrame(0)
    } else {
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [count, effectiveReducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
