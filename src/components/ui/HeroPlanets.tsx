'use client'

import { motion } from 'framer-motion'
import { useAccessibility } from '@/context/AccessibilityContext'

const planets = [
  {
    name: 'amber',
    position: { top: '32%', left: '6%' },
    size: 'clamp(48px, 6vw, 78px)',
    background:
      'radial-gradient(circle at 32% 27%, #fff0c2 0%, #e9b66f 24%, #9a5d42 61%, #152033 100%)',
    shadow: 'inset -12px -7px 18px rgba(1,7,16,.66), 0 0 24px rgba(251,191,36,.16)',
    ring: true,
    delay: 0,
  },
  {
    name: 'blue',
    position: { top: '20%', right: '9%' },
    size: 'clamp(38px, 4.8vw, 62px)',
    background:
      'radial-gradient(ellipse at 32% 42%, transparent 0 18%, rgba(115,211,197,.75) 19% 27%, transparent 28% 43%, rgba(96,172,195,.7) 44% 53%, transparent 54%), radial-gradient(circle at 32% 27%, #a7e5e5 0%, #318ca4 42%, #123b67 76%, #071323 100%)',
    shadow: 'inset -10px -5px 16px rgba(1,7,16,.68), 0 0 22px rgba(56,189,248,.17)',
    delay: 2,
  },
  {
    name: 'rust',
    position: { top: '57%', right: '5%' },
    size: 'clamp(30px, 3.8vw, 48px)',
    background:
      'radial-gradient(circle at 30% 27%, #ffd4a4 0%, #c76d47 38%, #783932 72%, #131d2c 100%)',
    shadow: 'inset -9px -5px 13px rgba(1,7,16,.68), 0 0 18px rgba(249,115,22,.16)',
    delay: 4,
  },
  {
    name: 'moon',
    position: { top: '69%', left: '17%' },
    size: 'clamp(25px, 3vw, 38px)',
    background:
      'radial-gradient(circle at 32% 27%, #e9f0f2 0%, #8a9aa7 43%, #3a4a5d 76%, #111a29 100%)',
    shadow: 'inset -8px -4px 11px rgba(1,7,16,.72), 0 0 16px rgba(148,163,184,.14)',
    delay: 1,
  },
  {
    name: 'teal',
    position: { top: '48%', right: '17%' },
    size: 'clamp(20px, 2.5vw, 30px)',
    background:
      'radial-gradient(circle at 33% 28%, #c2f5e7 0%, #48aa9e 45%, #153c4b 79%, #0a1220 100%)',
    shadow: 'inset -7px -4px 10px rgba(1,7,16,.72), 0 0 14px rgba(45,212,191,.15)',
    delay: 3,
  },
]

export function HeroPlanets() {
  const { effectiveReducedMotion } = useAccessibility()

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {planets.map((planet) => (
        <motion.span
          key={planet.name}
          className="absolute block rounded-full opacity-70 md:opacity-90"
          style={{
            ...planet.position,
            width: planet.size,
            height: planet.size,
            borderRadius: '50%',
            background: planet.background,
            boxShadow: planet.shadow,
          }}
          animate={effectiveReducedMotion ? undefined : { y: [0, -7, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 13 + planet.delay, delay: -planet.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {planet.ring && (
            <span
              className="absolute left-1/2 top-1/2 block rounded-[50%]"
              style={{
                width: '158%',
                height: '42%',
                border: '5px solid rgba(235,198,139,.48)',
                borderLeftColor: 'rgba(235,198,139,.16)',
                borderRightColor: 'rgba(245,215,170,.72)',
                transform: 'translate(-50%,-50%) rotate(-19deg) skewX(-10deg)',
              }}
            />
          )}
        </motion.span>
      ))}
    </div>
  )
}
