'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  KIDS_WORLDS,
  type KidsWorldId,
  type KidsWorld,
} from '@/data/kidsWorlds'
import { runSimulation } from '@/lib/simulation/combustionModel'
import SpaceFlame, { type GravityMode, type O2Level, type FuelType } from './SpaceFlame'

// Support legacy KidsTopicId values for smooth deep-linking across the app
export type KidsTopicId =
  | KidsWorldId
  | 'space-fire'
  | 'microgravity'
  | 'oxygen'
  | 'airflow'
  | 'astronaut-safety'

export function normalizeWorldId(id?: KidsTopicId): KidsWorldId {
  if (!id) return 'meet-the-flame'
  if (id === 'space-fire' || id === 'microgravity') return 'meet-the-flame'
  if (id === 'oxygen') return 'oxygen-mystery'
  if (id === 'airflow') return 'invisible-wind'
  if (id === 'astronaut-safety') return 'keeping-astronauts-safe'
  return id
}

interface KidsLearnCardsProps {
  initialTopic?: KidsTopicId
  onBackHome?: () => void
  onSelectWorld?: (worldId: KidsWorldId) => void
  onTryInLab?: (
    focus: 'gravity' | 'oxygen' | 'fuel',
    gravity?: 'space' | 'earth',
    o2?: 'low' | 'normal' | 'high'
  ) => void
}

/**
 * Step 4 — Dedicated Scientific Illustration / Comparative Physics Diagram
 * Tailored specifically to each of the 5 Educational Worlds.
 */
function WorldScientificDiagram({
  world,
  activeOptionIndex,
}: {
  world: KidsWorld
  activeOptionIndex: number
}) {
  const opt = world.options[activeOptionIndex] ?? world.options[0]

  if (world.id === 'meet-the-flame') {
    const g = opt.simParams.gravity
    const isEarth = g > 5
    const isLunar = g > 0.5 && g <= 5
    return (
      <svg
        viewBox="0 0 360 190"
        className="w-full h-auto rounded-2xl bg-[#061024] border border-sky-400/30 p-3"
        aria-label="Scientific diagram comparing buoyancy convection and microgravity molecular diffusion"
      >
        <defs>
          <radialGradient id="wd-sphere" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fde047" />
            <stop offset="68%" stopColor="#f97316" />
            <stop offset="92%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Left: Earth 1g reference */}
        <g transform="translate(88, 98)">
          <path
            d="M0 -55 C18 -26 20 2 16 18 C12 28 6 32 0 32 C-6 32 -12 28 -16 18 C-20 2 -18 -26 0 -55 Z"
            fill="#f97316"
            opacity={isEarth ? 1 : 0.45}
          />
          <circle cx="0" cy="16" r="7" fill="#fef08a" />
          <path
            d="M-28 24 L-28 -36 M-33 -28 L-28 -36 L-23 -28"
            stroke="#fdba74"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M28 24 L28 -36 M23 -28 L28 -36 L33 -28"
            stroke="#fdba74"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text x="0" y="54" textAnchor="middle" fill="#fed7aa" fontSize="10" fontFamily="monospace">
            1g EARTH BUOYANCY
          </text>
        </g>

        <line x1="180" y1="20" x2="180" y2="168" stroke="rgba(125,211,252,0.25)" strokeDasharray="4 4" />

        {/* Right: Active Microgravity / Lunar Sphere */}
        <g transform="translate(272, 95)">
          <ellipse
            cx="0"
            cy="-4"
            rx={isLunar ? 32 : 38}
            ry={isLunar ? 44 : 38}
            fill="url(#wd-sphere)"
          />
          <ellipse
            cx="0"
            cy="-4"
            rx={isLunar ? 25 : 30}
            ry={isLunar ? 35 : 30}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <circle cx="0" cy="-4" r="5" fill="#0f172a" stroke="#fde047" strokeWidth="1.5" />
          <text x="0" y="57" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontFamily="monospace">
            {isLunar ? '0.16g LUNAR OVAL' : '0g SPHERICAL DIFFUSION'}
          </text>
        </g>
      </svg>
    )
  }

  if (world.id === 'oxygen-mystery') {
    const o2 = opt.simParams.oxygenPercent
    const dotCount = o2 <= 16 ? 6 : o2 <= 21 ? 11 : 18
    return (
      <svg
        viewBox="0 0 360 190"
        className="w-full h-auto rounded-2xl bg-[#061024] border border-sky-400/30 p-3"
        aria-label="Diagram showing oxygen molecules colliding with the combustion reaction zone"
      >
        {/* Nitrogen inert molecules */}
        {[
          [42, 36],
          [75, 140],
          [118, 42],
          [245, 38],
          [295, 142],
          [318, 60],
        ].map(([x, y], i) => (
          <g key={`n2-${i}`} opacity="0.45">
            <circle cx={x} cy={y} r="5" fill="#94a3b8" />
            <circle cx={x + 6} cy={y} r="5" fill="#64748b" />
          </g>
        ))}

        {/* Active Oxygen O2 dimers */}
        {Array.from({ length: dotCount }).map((_, idx) => {
          const angle = (idx / dotCount) * Math.PI * 2
          const dist = 62 + (idx % 3) * 16
          const cx = 180 + Math.cos(angle) * dist
          const cy = 92 + Math.sin(angle) * (dist * 0.72)
          return (
            <g key={`o2-${idx}`}>
              <circle cx={cx} cy={cy} r="5.5" fill="#38bdf8" />
              <circle cx={cx + 6} cy={cy + 2} r="5.5" fill="#7dd3fc" />
            </g>
          )
        })}

        {/* Central Flame Core scaled by O2 */}
        <circle
          cx="180"
          cy="92"
          r={o2 <= 16 ? 26 : o2 <= 21 ? 36 : 46}
          fill={o2 >= 30 ? '#f97316' : '#0ea5e9'}
          opacity="0.32"
        />
        <circle
          cx="180"
          cy="92"
          r={o2 <= 16 ? 18 : o2 <= 21 ? 26 : 34}
          fill="#fb923c"
        />
        <circle
          cx="180"
          cy="92"
          r={o2 <= 16 ? 9 : o2 <= 21 ? 14 : 20}
          fill="#fef08a"
        />
        <text x="180" y="176" textAnchor="middle" fill="#bae6fd" fontSize="10" fontFamily="monospace">
          CABIN ATMOSPHERE: {o2}% O₂ · {100 - o2}% N₂ THERMAL DILUENT
        </text>
      </svg>
    )
  }

  if (world.id === 'invisible-wind') {
    const v = opt.simParams.airflowVelocity
    const stretch = v === 0 ? 34 : v < 0.2 ? 46 : 64
    return (
      <svg
        viewBox="0 0 360 190"
        className="w-full h-auto rounded-2xl bg-[#061024] border border-teal-400/30 p-3"
        aria-label="Diagram showing ventilation streamlines around a microgravity flame"
      >
        {/* Ventilation Streamlines */}
        {[46, 76, 106, 136].map((y, idx) => (
          <path
            key={y}
            d={
              v === 0
                ? `M 30 ${y} L 95 ${y}`
                : `M 24 ${y} Q 140 ${y + (idx < 2 ? -14 : 14)} 330 ${y}`
            }
            stroke={v === 0 ? '#475569' : '#2dd4bf'}
            strokeWidth={v === 0 ? '1.5' : '2.5'}
            strokeDasharray={v === 0 ? '4 4' : undefined}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {/* Flame Wake */}
        <ellipse
          cx={175 + (stretch - 34) * 0.6}
          cy="91"
          rx={stretch}
          ry={v > 0.3 ? 24 : 32}
          fill="#f97316"
          opacity="0.85"
          stroke="#38bdf8"
          strokeWidth="2"
        />
        <circle cx="165" cy="91" r="13" fill="#fef08a" />
        <circle cx="158" cy="91" r="5" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
        <text x="180" y="176" textAnchor="middle" fill="#99f6e4" fontSize="10" fontFamily="monospace">
          FORCED VENTILATION VELOCITY: {v.toFixed(2)} m/s
        </text>
      </svg>
    )
  }

  // Worlds 04 & 05: Sealed CIR Chamber & Safety Suppression Diagram
  const isSuppressed = opt.simParams.oxygenPercent <= 15
  return (
    <svg
      viewBox="0 0 360 190"
      className="w-full h-auto rounded-2xl bg-[#061024] border border-indigo-400/30 p-3"
      aria-label="Diagram of sealed orbital combustion chamber and optical sensors"
    >
      {/* Outer triple-sealed chamber cylinder */}
      <rect
        x="75"
        y="20"
        width="210"
        height="132"
        rx="24"
        fill="#0f172a"
        stroke="#6366f1"
        strokeWidth="2.5"
      />
      {/* Optical sensor beams */}
      <line x1="85" y1="52" x2="275" y2="52" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="180" cy="90" r={isSuppressed ? 14 : 32} fill={isSuppressed ? '#475569' : '#fb923c'} />
      {!isSuppressed && <circle cx="180" cy="90" r="16" fill="#fef08a" />}
      <text x="180" y="174" textAnchor="middle" fill="#c7d2fe" fontSize="10" fontFamily="monospace">
        {isSuppressed
          ? 'STATUS: BELOW LIMITING OXYGEN INDEX (EXTINGUISHED)'
          : 'STATUS: CONTAINED ORBITAL DIAGNOSTIC BURN'}
      </text>
    </svg>
  )
}

export default function KidsLearnCards({
  initialTopic = 'meet-the-flame',
  onBackHome,
  onSelectWorld,
  onTryInLab,
}: KidsLearnCardsProps) {
  const [activeWorldId, setActiveWorldId] = useState<KidsWorldId>(() =>
    normalizeWorldId(initialTopic)
  )
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number>(() =>
    normalizeWorldId(initialTopic) === 'meet-the-flame' ? 2 : 1
  )

  useEffect(() => {
    const normalized = normalizeWorldId(initialTopic)
    setActiveWorldId(normalized)
    setSelectedOptionIdx(normalized === 'meet-the-flame' ? 2 : 1)
  }, [initialTopic])

  const activeWorld = useMemo(
    () => KIDS_WORLDS.find((w) => w.id === activeWorldId) ?? KIDS_WORLDS[0],
    [activeWorldId]
  )

  const activeOption =
    activeWorld.options[selectedOptionIdx] ?? activeWorld.options[0]

  // Step 5: Compute real output from FLARE's shared D² Law scientific engine
  const simDemo = useMemo(() => {
    const res = runSimulation({
      ...activeOption.simParams,
      duration: 30,
      sampleDiameter: 6,
    })
    const mid =
      res.frames[Math.min(8, Math.floor(res.frames.length / 3))] ?? res.frames[0]
    return {
      frame: mid,
      summary: res.summary,
    }
  }, [activeOption])

  // Map active option to SpaceFlame canvas props for rich interactive visual feedback
  const flameVisualProps = useMemo(() => {
    const p = activeOption.simParams
    const gravity: GravityMode = p.gravity > 1.0 ? 'earth' : 'space'
    const o2Level: O2Level =
      p.oxygenPercent <= 17 ? 'low' : p.oxygenPercent >= 28 ? 'high' : 'normal'
    const fuel: FuelType =
      p.fuel === 'paper'
        ? 'paper'
        : p.fuel === 'pmma' || p.fuel === 'polyethylene'
        ? 'plastic'
        : 'cloth'
    const isOut =
      simDemo.frame.status === 'extinguished' || p.oxygenPercent <= 15
    return {
      gravity,
      o2Level,
      fuel,
      flameState: isOut ? ('out' as const) : ('burning' as const),
    }
  }, [activeOption, simDemo.frame.status])

  const currentWorldIndex = KIDS_WORLDS.findIndex((w) => w.id === activeWorld.id)
  const prevWorld =
    KIDS_WORLDS[(currentWorldIndex - 1 + KIDS_WORLDS.length) % KIDS_WORLDS.length]
  const nextWorld =
    KIDS_WORLDS[(currentWorldIndex + 1) % KIDS_WORLDS.length]

  const switchWorld = (id: KidsWorldId) => {
    setActiveWorldId(id)
    setSelectedOptionIdx(id === 'meet-the-flame' ? 2 : 1)
    onSelectWorld?.(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="w-full flex flex-col">
      {/* ════════════════════════════════════════════════════════════════════════
          WORLD SWITCHER BAR & STEP 1 + STEP 2 HERO BANNER (Deep Cosmic Navy #071126)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#071126] text-white pt-6 pb-14 px-4 sm:px-8 border-b border-sky-400/20">
        <div className="max-w-7xl mx-auto">
          {/* Top Breadcrumb + 5 Worlds Switcher Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-white/10">
            {onBackHome ? (
              <button
                type="button"
                onClick={onBackHome}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-xs font-extrabold text-sky-200 transition-colors cursor-pointer"
              >
                <span>←</span>
                <span>All 5 Science Worlds</span>
              </button>
            ) : (
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-300">
                FLARE KIDS · SCIENCE WORLD EXHIBITION
              </span>
            )}

            <div
              className="flex flex-wrap items-center gap-1.5"
              role="tablist"
              aria-label="Switch Educational World"
            >
              {KIDS_WORLDS.map((w) => {
                const isSelected = w.id === activeWorld.id
                return (
                  <button
                    key={w.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => switchWorld(w.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#fde047] text-[#071126] shadow-sm'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="font-mono mr-1.5 opacity-75">
                      0{KIDS_WORLDS.indexOf(w) + 1}
                    </span>
                    <span>{w.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── STEP 1 (Compelling Question) & STEP 2 (Visual Introduction with 3D Artwork) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left 6 Columns: Step 1 Question & Introduction */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 font-mono text-xs font-extrabold uppercase tracking-widest text-amber-300 mb-4">
                <span>{activeWorld.worldNumber}</span>
                <span>·</span>
                <span>{activeWorld.scientificSubject}</span>
              </div>

              <p className="font-mono text-xs font-extrabold uppercase tracking-widest text-sky-300 mb-2">
                {activeWorld.title} — {activeWorld.subtitle}
              </p>

              {/* Step 1: Compelling Scientific Question */}
              <h1 className="font-space-grotesk text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.03]">
                {activeWorld.compellingQuestion}
              </h1>

              {/* Step 2: Visual Introduction Lead */}
              <p className="mt-5 text-base sm:text-lg font-medium text-slate-200 leading-relaxed">
                {activeWorld.visualIntroLead}
              </p>

              {/* Key Questions Covered in This World */}
              <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-sky-300">
                  KEY QUESTIONS WE WILL EXPLORE:
                </span>
                {activeWorld.learningQuestions.map((q) => (
                  <div
                    key={q}
                    className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-white"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: activeWorld.theme.accent }}
                    />
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 6 Columns: Step 2 Custom 3D Visual Scene */}
            <div className="lg:col-span-6">
              <div className="relative rounded-[32px] overflow-hidden border-2 border-white/15 bg-[#050d1e] shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeWorld.imagePath}
                  alt={activeWorld.imageAlt}
                  className="w-full h-[280px] sm:h-[360px] object-cover object-center"
                />
                <div className="bg-[#09152b] px-5 py-3.5 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-200">
                    {activeWorld.nasaResearch.investigationTitle}
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {activeWorld.nasaResearch.investigationCode}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          STEP 3 & STEP 4 — VISUAL STORYTELLING EXPLANATION + SCIENTIFIC DIAGRAM
          (Warm White #faf8f5 Section)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#faf8f5] py-14 sm:py-20 px-4 sm:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <span
              className="font-mono text-xs font-extrabold uppercase tracking-widest"
              style={{ color: activeWorld.theme.accent }}
            >
              HOW THE SCIENCE WORKS · VISUAL STORYTELLING
            </span>
            <h2 className="mt-1 font-space-grotesk text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Three Steps to Understand {activeWorld.title}
            </h2>
          </div>

          {/* Step 3: 3 Visual Storytelling Steps + Step 4: Scientific Diagram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 grid grid-cols-1 gap-4">
              {activeWorld.storySteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="rounded-[26px] bg-white border-2 border-slate-200/90 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.04)] flex items-start gap-4"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-mono text-sm font-black text-white shadow-sm"
                    style={{ background: activeWorld.theme.accent }}
                  >
                    {step.stepNumber}
                  </div>
                  <div>
                    <h3 className="font-space-grotesk text-lg sm:text-xl font-black text-slate-900">
                      {step.heading}
                    </h3>
                    <p className="mt-1.5 text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 4: Scientific Diagram Card */}
            <div className="lg:col-span-5 rounded-[30px] bg-white border-2 border-slate-200 p-6 sm:p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    SCIENTIFIC DIAGRAM
                  </span>
                  <span
                    className="rounded-full px-3 py-0.5 font-mono text-[11px] font-bold"
                    style={{
                      background: activeWorld.theme.badgeBg,
                      color: activeWorld.theme.badgeText,
                    }}
                  >
                    {activeOption.label}
                  </span>
                </div>
                <h3 className="font-space-grotesk text-xl font-black text-slate-900 mb-4">
                  Visualizing the Physical Mechanism
                </h3>

                <WorldScientificDiagram
                  world={activeWorld}
                  activeOptionIndex={selectedOptionIdx}
                />

                <p className="mt-4 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                  {activeOption.whyItChangedScience}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>SIMPLIFIED EDUCATIONAL DIAGRAM</span>
                <span>D² LAW COUPLED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          STEP 5 & STEP 6 — MEANINGFUL INTERACTIVE DEMONSTRATION + WHAT & WHY IT CHANGED
          (Soft Sky Surface #f0f6fc)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#f0f6fc] py-14 sm:py-20 px-4 sm:px-8 border-b border-sky-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span
                className="font-mono text-xs font-extrabold uppercase tracking-widest"
                style={{ color: activeWorld.theme.accent }}
              >
                INTERACTIVE CHAMBER DEMONSTRATION · {activeWorld.interactiveParameterLabel.toUpperCase()}
              </span>
              <h2 className="mt-1 font-space-grotesk text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Change the Conditions &amp; Observe the Flame
              </h2>
              <p className="mt-2 text-sm sm:text-base font-medium text-slate-700 max-w-3xl">
                {activeWorld.interactivePrompt}
              </p>
            </div>
            <span className="rounded-full bg-white border border-sky-200 px-4 py-1.5 font-mono text-xs font-bold text-sky-900 shrink-0">
              Educational Model · D² Law Engine
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left 6 Columns: Interactive Parameter Selector + Step 6 What Changed & Why */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-6">
              {/* 3 Tactile Condition Selector Cards */}
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3.5"
                role="group"
                aria-label={activeWorld.interactiveParameterLabel}
              >
                {activeWorld.options.map((opt, idx) => {
                  const isSelected = idx === selectedOptionIdx
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOptionIdx(idx)}
                      className="rounded-3xl p-4 text-left transition-all cursor-pointer flex flex-col justify-between"
                      style={{
                        background: isSelected ? '#071126' : '#ffffff',
                        border: `2.5px solid ${
                          isSelected ? activeWorld.theme.accent : '#cbd5e1'
                        }`,
                        color: isSelected ? '#ffffff' : '#0f172a',
                        boxShadow: isSelected
                          ? '0 16px 36px rgba(7, 17, 38, 0.22)'
                          : '0 4px 12px rgba(15, 23, 42, 0.04)',
                        transform: isSelected ? 'translateY(-2px)' : 'none',
                      }}
                    >
                      <div>
                        <span
                          className="inline-block rounded-full px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider mb-2"
                          style={{
                            background: isSelected
                              ? activeWorld.theme.accent
                              : activeWorld.theme.badgeBg,
                            color: isSelected
                              ? '#ffffff'
                              : activeWorld.theme.badgeText,
                          }}
                        >
                          {opt.badge}
                        </span>
                        <span className="block font-space-grotesk text-base font-black leading-snug">
                          {opt.label}
                        </span>
                      </div>
                      <span
                        className={`mt-2 block font-mono text-xs font-bold ${
                          isSelected ? 'text-sky-200' : 'text-slate-500'
                        }`}
                      >
                        {opt.sublabel}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Step 6: Clear Explanation of What Changed & Why It Changed */}
              <div className="rounded-[30px] bg-white border-2 border-sky-200 p-6 sm:p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)] space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-3 py-1 font-mono text-xs font-black uppercase tracking-wider"
                    style={{
                      background: activeWorld.theme.badgeBg,
                      color: activeWorld.theme.badgeText,
                    }}
                  >
                    OBSERVED RESULT · {activeOption.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500 tabular-nums">
                    O₂: {activeOption.simParams.oxygenPercent}% · Flow:{' '}
                    {activeOption.simParams.airflowVelocity.toFixed(2)} m/s
                  </span>
                </div>

                <div>
                  <h3 className="font-space-grotesk text-xl sm:text-2xl font-black text-slate-900">
                    {activeOption.whatChangedHeadline}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">What changed: </strong>
                    {activeOption.whatChangedExplanation}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Why it changed: </strong>
                    {activeOption.whyItChangedScience}
                  </p>
                </div>

                {onTryInLab && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Want to test more combinations?
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onTryInLab(
                          activeWorld.id === 'oxygen-mystery' ||
                            activeWorld.id === 'invisible-wind'
                            ? 'oxygen'
                            : activeWorld.id === 'meet-the-flame'
                            ? 'gravity'
                            : 'fuel',
                          activeOption.simParams.gravity > 1 ? 'earth' : 'space',
                          activeOption.simParams.oxygenPercent <= 17
                            ? 'low'
                            : activeOption.simParams.oxygenPercent >= 28
                            ? 'high'
                            : 'normal'
                        )
                      }
                      className="text-xs sm:text-sm font-black text-sky-700 hover:text-sky-900 underline cursor-pointer"
                    >
                      Open in Full Multi-Parameter Sandbox →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right 6 Columns: Live Interactive Flame Observatory + D² Law Telemetry */}
            <div className="lg:col-span-6 rounded-[32px] bg-[#071126] border-2 border-sky-400/35 p-5 sm:p-6 text-white shadow-[0_24px_60px_rgba(2,6,23,0.3)] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-200">
                    LIVE CHAMBER OBSERVATORY
                  </span>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-0.5 font-mono text-[11px] font-bold text-amber-300">
                  {activeOption.label}
                </span>
              </div>

              {/* Interactive Canvas Stage */}
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/15 bg-[#040917]">
                {/* Deterministic SVG Chamber Backdrop behind live HTML5 Canvas */}
                <svg
                  viewBox="0 0 320 220"
                  className="pointer-events-none absolute inset-0 w-full h-full opacity-90"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="chamber-live-glow" cx="50%" cy="52%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="28%" stopColor="#fde047" />
                      <stop offset="62%" stopColor="#f97316" />
                      <stop offset="88%" stopColor="#38bdf8" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  {flameVisualProps.flameState === 'burning' && (
                    <g>
                      <ellipse
                        cx="160"
                        cy="114"
                        rx={
                          flameVisualProps.gravity === 'earth'
                            ? 28
                            : flameVisualProps.o2Level === 'high'
                            ? 58
                            : flameVisualProps.o2Level === 'low'
                            ? 34
                            : 46
                        }
                        ry={
                          flameVisualProps.gravity === 'earth'
                            ? 62
                            : flameVisualProps.o2Level === 'high'
                            ? 58
                            : flameVisualProps.o2Level === 'low'
                            ? 34
                            : 46
                        }
                        fill="url(#chamber-live-glow)"
                      />
                      <circle
                        cx="160"
                        cy="114"
                        r={
                          flameVisualProps.gravity === 'earth'
                            ? 32
                            : flameVisualProps.o2Level === 'high'
                            ? 48
                            : flameVisualProps.o2Level === 'low'
                            ? 26
                            : 38
                        }
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        opacity="0.7"
                      />
                    </g>
                  )}
                </svg>
                <SpaceFlame
                  gravity={flameVisualProps.gravity}
                  o2Level={flameVisualProps.o2Level}
                  fuel={flameVisualProps.fuel}
                  flameState={flameVisualProps.flameState}
                />
              </div>

              {/* Real Shared Engine Telemetry Readouts */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-sky-300">
                    Flame Temp
                  </span>
                  <span className="mt-0.5 block font-mono text-base sm:text-lg font-black text-amber-300 tabular-nums">
                    {flameVisualProps.flameState === 'out'
                      ? 'Extinguished'
                      : `${simDemo.frame.flameTemperature.toFixed(0)} K`}
                  </span>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-sky-300">
                    Aspect Ratio
                  </span>
                  <span className="mt-0.5 block font-mono text-base sm:text-lg font-black text-cyan-300 tabular-nums">
                    {simDemo.frame.flameAspectRatio.toFixed(2)}
                  </span>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-sky-300">
                    Flame Radius
                  </span>
                  <span className="mt-0.5 block font-mono text-base sm:text-lg font-black text-white tabular-nums">
                    {flameVisualProps.flameState === 'out'
                      ? '0.0 mm'
                      : `${simDemo.frame.flameRadius.toFixed(1)} mm`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          STEP 7 & STEP 8 — SCIENTIFIC TAKEAWAY + VERIFIED NASA RESEARCH CONNECTION
          (Warm White #faf8f5 Section + Next/Previous World Navigation)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#faf8f5] py-14 sm:py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Step 7: Short Scientific Takeaway */}
            <div
              className="lg:col-span-6 rounded-[32px] p-7 sm:p-9 flex flex-col justify-between border-2 shadow-sm"
              style={{
                background: activeWorld.theme.lightSurface,
                borderColor: activeWorld.theme.border,
              }}
            >
              <div>
                <span
                  className="inline-block rounded-full px-3.5 py-1 font-mono text-xs font-black uppercase tracking-widest mb-4"
                  style={{
                    background: activeWorld.theme.badgeBg,
                    color: activeWorld.theme.badgeText,
                  }}
                >
                  KEY TAKEAWAY TO REMEMBER
                </span>
                <p className="font-space-grotesk text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  &ldquo;{activeWorld.takeaway}&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-900/10 flex items-center justify-between text-xs font-mono font-bold text-slate-600">
                <span>{activeWorld.worldNumber} SUMMARY</span>
                <span>FLARE LITTLE SCIENCE UNIVERSE</span>
              </div>
            </div>

            {/* Step 8: Underlying NASA Research Link */}
            <div className="lg:col-span-6 rounded-[32px] bg-[#071126] text-white p-7 sm:p-9 flex flex-col justify-between border border-sky-400/30 shadow-lg">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-amber-300">
                    REAL NASA ORBITAL INVESTIGATION
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-0.5 font-mono text-xs font-bold text-sky-200">
                    {activeWorld.nasaResearch.investigationCode}
                  </span>
                </div>
                <h3 className="font-space-grotesk text-2xl font-black text-white">
                  {activeWorld.nasaResearch.investigationTitle}
                </h3>
                <p className="mt-1 font-mono text-xs text-sky-300">
                  Platform: {activeWorld.nasaResearch.platform}
                </p>
                <p className="mt-3 text-sm sm:text-base font-medium text-slate-300 leading-relaxed">
                  {activeWorld.nasaResearch.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={activeWorld.nasaResearch.researchHref}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#fde047] hover:bg-[#facc15] text-[#071126] px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all"
                >
                  <span>Inspect NASA Experiment in Research Explorer</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* World-to-World Continuity Navigation */}
          <div className="rounded-[28px] bg-white border-2 border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => switchWorld(prevWorld.id)}
              className="w-full sm:w-auto text-left rounded-2xl hover:bg-slate-50 px-4 py-2.5 transition-colors cursor-pointer"
            >
              <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                ← PREVIOUS WORLD ({prevWorld.worldNumber})
              </span>
              <span className="font-space-grotesk text-base font-black text-slate-900">
                {prevWorld.title}
              </span>
            </button>

            {onBackHome && (
              <button
                type="button"
                onClick={onBackHome}
                className="rounded-full border-2 border-slate-300 hover:border-slate-900 px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-800 transition-colors cursor-pointer"
              >
                All 5 Worlds Overview
              </button>
            )}

            <button
              type="button"
              onClick={() => switchWorld(nextWorld.id)}
              className="w-full sm:w-auto text-right rounded-2xl hover:bg-slate-50 px-4 py-2.5 transition-colors cursor-pointer"
            >
              <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-orange-600">
                NEXT WORLD ({nextWorld.worldNumber}) →
              </span>
              <span className="font-space-grotesk text-base font-black text-slate-900">
                {nextWorld.title}
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
