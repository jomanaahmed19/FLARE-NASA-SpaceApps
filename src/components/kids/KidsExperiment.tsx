'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import KidsCompanion, { type CompanionMood } from './KidsCompanion'
import type { GravityMode, O2Level, FuelType, FlameState } from './SpaceFlame'
import type { KidsTopicId } from './KidsLearnCards'
import { runSimulation } from '@/lib/simulation/combustionModel'
import type { FuelMaterial } from '@/lib/simulation/types'

const SpaceFlame = dynamic(() => import('./SpaceFlame'), { ssr: false })

export type AirMovement = 'still' | 'moving'

interface Commentary {
  mood: CompanionMood
  title: string
  text: string
}

function getCommentary(
  gravity: GravityMode,
  o2: O2Level,
  fuel: FuelType,
  airMovement: AirMovement,
  flameOn: boolean,
  activeControl: string
): Commentary {
  if (!flameOn) {
    return {
      mood: 'explain',
      title: 'Flame Extinguished!',
      text: 'You turned off the flame! In space, astronauts put out fires by shutting off air vents and removing oxygen or heat.',
    }
  }

  if (activeControl === 'gravity') {
    if (gravity === 'space') {
      return {
        mood: 'excited',
        title: 'Spherical Microgravity Flame!',
        text: 'In space, hot air does not feel lighter than cool air, so it does not rise! Oxygen drifts in from every side equally, forming a round glowing ball.',
      }
    }
    return {
      mood: 'explain',
      title: 'Tall Earth Teardrop Flame!',
      text: 'On Earth, gravity pulls heavier cool air down and pushes lighter hot air up. That upward breeze stretches the flame into a tall teardrop!',
    }
  }

  if (activeControl === 'oxygen') {
    if (airMovement === 'moving') {
      return {
        mood: 'excited',
        title: 'Moving Air Feeds the Flame!',
        text: 'Gentle moving air brings fresh oxygen molecules right to the flame! Aboard the Space Station, ventilation fans keep air moving.',
      }
    }
    if (o2 === 'low') {
      return {
        mood: 'thinking',
        title: 'Low Oxygen = Smaller, Dimmer Flame',
        text: 'Fire needs oxygen just like we need air to breathe! With less oxygen, the flame becomes smaller, cooler, and closer to going out.',
      }
    }
    if (o2 === 'high') {
      return {
        mood: 'excited',
        title: 'Extra Oxygen = Bigger, Hotter Flame!',
        text: 'More oxygen makes the flame burn much hotter and faster! That is why NASA carefully controls oxygen inside spacecraft cabins.',
      }
    }
    return {
      mood: 'happy',
      title: 'Normal Cabin Air (21% Oxygen)',
      text: 'Earth and the International Space Station both have 21% oxygen — just right for astronauts to breathe safely!',
    }
  }

  if (activeControl === 'fuel') {
    if (fuel === 'cloth') {
      return {
        mood: 'explain',
        title: 'Cotton Cloth (Cellulose)',
        text: 'Cotton cloth is made of plant fibers called cellulose. NASA tested cotton fabrics in the BASS and Saffire space experiments!',
      }
    }
    if (fuel === 'paper') {
      return {
        mood: 'thinking',
        title: 'Thin Paper (Fast Burning)',
        text: 'Thin paper heats up and catches fire quickly! Astronauts on the Space Station use tablet computers instead of loose paper notebooks.',
      }
    }
    return {
      mood: 'explain',
      title: 'Spacecraft Plastic (PMMA)',
      text: 'Thick plastic stores lots of energy and burns hot, which is why spacecraft windows and cables use special fire-resistant polymers!',
    }
  }

  return {
    mood: 'excited',
    title: 'Welcome to the Kids Flame Lab!',
    text: 'Tap Gravity, Air & Oxygen, or Material on the right to see how fire changes between Earth and Space!',
  }
}

function BigControlButton({
  active,
  onClick,
  emoji,
  label,
  sublabel,
  accentColor,
  activeBg,
}: {
  active: boolean
  onClick: () => void
  emoji: string
  label: string
  sublabel: string
  accentColor: string
  activeBg: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-2xl px-3.5 py-3 font-extrabold transition-all duration-200 cursor-pointer flex-1 min-w-0"
      style={{
        background: active ? activeBg : '#ffffff',
        border: `2.5px solid ${active ? accentColor : '#cbd5e1'}`,
        color: active ? '#0f172a' : '#475569',
        boxShadow: active ? '0 8px 20px rgba(15, 23, 42, 0.08)' : 'none',
        transform: active ? 'translateY(-1px)' : 'none',
      }}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs sm:text-sm font-black text-slate-900">{label}</span>
      <span
        className="text-[11px] font-bold"
        style={{ color: active ? accentColor : '#64748b' }}
      >
        {sublabel}
      </span>
    </button>
  )
}

type ActiveSection = 'gravity' | 'oxygen' | 'fuel'

const SECTION_THEMES: Record<
  ActiveSection,
  { accent: string; bg: string; border: string; topicId: KidsTopicId }
> = {
  gravity: {
    accent: '#ea580c',
    bg: '#fff7ed',
    border: '#fdba74',
    topicId: 'space-fire',
  },
  oxygen: {
    accent: '#0284c7',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    topicId: 'oxygen',
  },
  fuel: {
    accent: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    topicId: 'astronaut-safety',
  },
}

interface KidsExperimentProps {
  initialSection?: ActiveSection
  gravity?: GravityMode
  onGravityChange?: (g: GravityMode) => void
  o2?: O2Level
  onO2Change?: (o: O2Level) => void
  fuel?: FuelType
  onFuelChange?: (f: FuelType) => void
  onOpenTopics?: (topicId?: KidsTopicId) => void
}

export default function KidsExperiment({
  initialSection = 'gravity',
  gravity: controlledGravity,
  onGravityChange,
  o2: controlledO2,
  onO2Change,
  fuel: controlledFuel,
  onFuelChange,
  onOpenTopics,
}: KidsExperimentProps = {}) {
  const [localGravity, setLocalGravity] = useState<GravityMode>('space')
  const [localO2, setLocalO2] = useState<O2Level>('normal')
  const [localFuel, setLocalFuel] = useState<FuelType>('cloth')
  const [airMovement, setAirMovement] = useState<AirMovement>('still')
  const [flameOn, setFlameOn] = useState(true)
  const [section, setSection] = useState<ActiveSection>(initialSection)

  useEffect(() => {
    setSection(initialSection)
  }, [initialSection])

  const gravity = controlledGravity ?? localGravity
  const o2 = controlledO2 ?? localO2
  const fuel = controlledFuel ?? localFuel

  const setGravity = (g: GravityMode) => {
    setLocalGravity(g)
    onGravityChange?.(g)
  }
  const setO2 = (o: O2Level) => {
    setLocalO2(o)
    onO2Change?.(o)
  }
  const setFuel = (f: FuelType) => {
    setLocalFuel(f)
    onFuelChange?.(f)
  }

  // Compute real shared D² Law metrics for the selected Kids Lab state
  const sharedEngineMetrics = useMemo(() => {
    const mappedFuel: FuelMaterial =
      fuel === 'cloth' ? 'cellulose' : fuel === 'paper' ? 'paper' : 'pmma'
    const mappedGravity = gravity === 'space' ? 0.001 : 9.81
    const mappedO2 = o2 === 'low' ? 16 : o2 === 'high' ? 32 : 21
    const mappedAirflow = airMovement === 'moving' ? 0.12 : 0.02

    const res = runSimulation({
      fuel: mappedFuel,
      gravity: mappedGravity,
      oxygenPercent: mappedO2,
      pressure: 1.0,
      airflowVelocity: mappedAirflow,
      duration: 30,
      sampleDiameter: 6,
    })
    const mid = res.frames[Math.min(8, Math.floor(res.frames.length / 3))] ?? res.frames[0]
    return {
      temperatureK: mid.flameTemperature,
      aspectRatio: mid.flameAspectRatio,
      burnRateK: mid.massLossRate,
    }
  }, [gravity, o2, fuel, airMovement])

  const flameState: FlameState = flameOn ? 'burning' : 'out'
  const commentary = getCommentary(
    gravity,
    o2,
    fuel,
    airMovement,
    flameOn,
    section
  )
  const theme = SECTION_THEMES[section]

  const switchSection = useCallback((s: ActiveSection) => setSection(s), [])

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-8">
      {/* Header Banner */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
            Interactive Space Observatory
          </span>
          <h1 className="font-space-grotesk text-2xl sm:text-3xl font-black text-slate-900">
            Kids Space Flame Lab
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {onOpenTopics && (
            <button
              type="button"
              onClick={() => onOpenTopics(theme.topicId)}
              className="rounded-2xl border-2 border-sky-300 bg-white hover:bg-sky-50 px-4 py-2 text-xs font-extrabold text-sky-900 transition-all cursor-pointer shadow-sm"
            >
              📚 Read Science Story for This Experiment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Starry Flame Observatory Window + Sparky Explanation ── */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Observatory Window Card */}
          <div className="rounded-[32px] border-4 border-sky-300 bg-[#081229] p-3 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
            <div className="relative rounded-3xl overflow-hidden" style={{ height: 320 }}>
              <SpaceFlame
                gravity={gravity}
                o2Level={o2}
                fuel={fuel}
                flameState={flameState}
              />

              {/* Top Status Pills inside Observatory Window */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-white/95 px-3.5 py-1 text-xs font-extrabold text-slate-900 shadow">
                    {gravity === 'space' ? '🚀 Space (Microgravity)' : '🌍 Earth (Normal Gravity)'}
                  </span>
                  <span className="rounded-full bg-sky-950/90 border border-sky-400/50 px-3 py-1 text-xs font-bold text-sky-200">
                    O₂: {o2 === 'low' ? '16% Low' : o2 === 'high' ? '32% High' : '21% Normal'}
                  </span>
                  <span className="rounded-full bg-sky-950/90 border border-sky-400/50 px-3 py-1 text-xs font-bold text-amber-200">
                    {airMovement === 'moving' ? '🌬️ Moving Air' : '🫧 Still Air'}
                  </span>
                </div>
              </div>

              {/* Bottom Shared Scientific Engine Telemetry Strip */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl bg-slate-950/85 border border-white/15 px-4 py-2 text-xs text-slate-200 backdrop-blur-md">
                <span className="font-bold text-sky-300">
                  🔬 Educational Model (D² Law)
                </span>
                <div className="flex items-center gap-4 font-mono text-[11px] tabular-nums">
                  <span>
                    Shape:{' '}
                    <strong className="text-amber-300">
                      {gravity === 'space' ? 'Sphere (AR 1.0)' : `Teardrop (AR ${sharedEngineMetrics.aspectRatio.toFixed(1)})`}
                    </strong>
                  </span>
                  <span className="hidden sm:inline">
                    Temp:{' '}
                    <strong className="text-orange-300">
                      {flameOn ? `${sharedEngineMetrics.temperatureK.toFixed(0)} K` : 'Off'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sparky Commentary Card (Warm Cream Surface) */}
          <div
            className="flex flex-col sm:flex-row items-center gap-4 rounded-3xl p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
            style={{
              background: '#fffdf7',
              border: `2.5px solid ${theme.border}`,
            }}
          >
            <div className="shrink-0">
              <KidsCompanion mood={commentary.mood} size={78} />
            </div>
            <div className="flex-1 text-left">
              <span
                className="inline-block rounded-full px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider mb-1"
                style={{ background: theme.bg, color: theme.accent }}
              >
                Sparky&apos;s Science Observation
              </span>
              <h2 className="font-space-grotesk text-lg font-black text-slate-900">
                {commentary.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-700 leading-relaxed">
                {commentary.text}
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Column: Bright, Tactile Experiment Controls ── */}
        <div className="lg:col-span-5 flex flex-col gap-4 rounded-[32px] border-2 border-sky-200 bg-white/95 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.07)]">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700">
              Control Panel
            </span>
            <h2 className="font-space-grotesk text-xl font-black text-slate-900">
              🧪 Choose What to Change
            </h2>
          </div>

          {/* 3 Category Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {(['gravity', 'oxygen', 'fuel'] as ActiveSection[]).map((s) => {
              const isSelected = section === s
              const t = SECTION_THEMES[s]
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => switchSection(s)}
                  className="rounded-2xl py-2.5 px-2 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                  style={{
                    background: isSelected ? t.bg : '#f8fafc',
                    border: `2px solid ${isSelected ? t.accent : '#cbd5e1'}`,
                    color: isSelected ? t.accent : '#475569',
                  }}
                >
                  {s === 'gravity'
                    ? '🌍 Gravity'
                    : s === 'oxygen'
                    ? '💨 Air & O₂'
                    : '🧵 Material'}
                </button>
              )
            })}
          </div>

          {/* Gravity Controls */}
          {section === 'gravity' && (
            <div className="flex flex-col gap-3.5">
              <div
                className="rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-center"
                style={{
                  background: theme.bg,
                  border: `1.5px solid ${theme.border}`,
                  color: theme.accent,
                }}
              >
                🤔 Question: What happens to a flame when there is no gravity?
              </div>

              <div className="flex gap-3">
                <BigControlButton
                  active={gravity === 'earth'}
                  onClick={() => setGravity('earth')}
                  emoji="🌍"
                  label="On Earth"
                  sublabel="Gravity pulls air"
                  accentColor={theme.accent}
                  activeBg={theme.bg}
                />
                <BigControlButton
                  active={gravity === 'space'}
                  onClick={() => setGravity('space')}
                  emoji="🚀"
                  label="In Space"
                  sublabel="Microgravity!"
                  accentColor={theme.accent}
                  activeBg={theme.bg}
                />
              </div>

              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-medium text-slate-700 leading-relaxed">
                <strong className="text-amber-900 font-extrabold">
                  Why did the shape change?
                </strong>{' '}
                On Earth, hot air rises and stretches the flame upward. In space, there is no upward pull, so the flame expands equally into a sphere!
              </div>
            </div>
          )}

          {/* Oxygen & Airflow Controls */}
          {section === 'oxygen' && (
            <div className="flex flex-col gap-3.5">
              <div
                className="rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-center"
                style={{
                  background: theme.bg,
                  border: `1.5px solid ${theme.border}`,
                  color: theme.accent,
                }}
              >
                🤔 Question: How do oxygen and airflow change a space flame?
              </div>

              <div className="flex gap-2">
                <BigControlButton
                  active={o2 === 'low'}
                  onClick={() => setO2('low')}
                  emoji="🫧"
                  label="Less O₂"
                  sublabel="16% Oxygen"
                  accentColor={theme.accent}
                  activeBg={theme.bg}
                />
                <BigControlButton
                  active={o2 === 'normal'}
                  onClick={() => setO2('normal')}
                  emoji="✅"
                  label="Normal"
                  sublabel="21% Oxygen"
                  accentColor={theme.accent}
                  activeBg={theme.bg}
                />
                <BigControlButton
                  active={o2 === 'high'}
                  onClick={() => setO2('high')}
                  emoji="⚡"
                  label="More O₂"
                  sublabel="32% Oxygen"
                  accentColor={theme.accent}
                  activeBg={theme.bg}
                />
              </div>

              <div className="flex gap-2">
                <BigControlButton
                  active={airMovement === 'still'}
                  onClick={() => setAirMovement('still')}
                  emoji="🛑"
                  label="Still Air"
                  sublabel="Vents Off"
                  accentColor={theme.accent}
                  activeBg={theme.bg}
                />
                <BigControlButton
                  active={airMovement === 'moving'}
                  onClick={() => setAirMovement('moving')}
                  emoji="🌬️"
                  label="Moving Air"
                  sublabel="Gentle Breeze"
                  accentColor={theme.accent}
                  activeBg={theme.bg}
                />
              </div>

              <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 text-xs font-medium text-slate-700 leading-relaxed">
                <strong className="text-sky-900 font-extrabold">
                  Why does air movement matter?
                </strong>{' '}
                In microgravity, a gentle breeze from spacecraft air vents brings fresh oxygen to the flame so it stays bright!
              </div>
            </div>
          )}

          {/* Fuel / Material Controls */}
          {section === 'fuel' && (
            <div className="flex flex-col gap-3.5">
              <div
                className="rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-center"
                style={{
                  background: theme.bg,
                  border: `1.5px solid ${theme.border}`,
                  color: theme.accent,
                }}
              >
                🤔 Question: Do different materials burn differently in space?
              </div>

              <div className="flex gap-2">
                <BigControlButton
                  active={fuel === 'cloth'}
                  onClick={() => setFuel('cloth')}
                  emoji="🧵"
                  label="Cloth"
                  sublabel="Cotton Fiber"
                  accentColor={theme.accent}
                  activeBg={theme.bg}
                />
                <BigControlButton
                  active={fuel === 'paper'}
                  onClick={() => setFuel('paper')}
                  emoji="📄"
                  label="Paper"
                  sublabel="Burns Fast"
                  accentColor={theme.accent}
                  activeBg={theme.bg}
                />
                <BigControlButton
                  active={fuel === 'plastic'}
                  onClick={() => setFuel('plastic')}
                  emoji="🛡️"
                  label="Plastic"
                  sublabel="Burns Hot"
                  accentColor={theme.accent}
                  activeBg={theme.bg}
                />
              </div>

              <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4 text-xs font-medium text-slate-700 leading-relaxed">
                <strong className="text-violet-900 font-extrabold">
                  Spacecraft Material Safety:
                </strong>{' '}
                NASA tests cloth, paper, and plastic inside sealed chambers so engineers know which materials are safest for astronauts!
              </div>
            </div>
          )}

          {/* Light / Extinguish Button */}
          <button
            type="button"
            onClick={() => setFlameOn((v) => !v)}
            className="w-full rounded-2xl py-3.5 font-extrabold text-sm tracking-wide transition-all cursor-pointer shadow-sm"
            style={
              flameOn
                ? {
                    background: '#fff1f2',
                    border: '2px solid #f43f5e',
                    color: '#be123c',
                  }
                : {
                    background: '#f97316',
                    border: '2px solid #ea580c',
                    color: '#ffffff',
                  }
            }
          >
            {flameOn ? '🧯 Put Out the Flame' : '🔥 Light the Flame Again'}
          </button>

          {/* Optional Link to Real NASA Research */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Connected to NASA ISS Research</span>
            <Link href="/research" className="text-sky-700 hover:underline font-extrabold">
              Explore NASA Experiments →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
