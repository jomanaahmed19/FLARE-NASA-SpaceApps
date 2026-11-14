'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { KIDS_WORLDS, type KidsWorldId } from '@/data/kidsWorlds'
import { runSimulation } from '@/lib/simulation/combustionModel'

interface KidsHomeProps {
  onSelectWorld: (worldId: KidsWorldId) => void
  onOpenLab: (focus?: 'gravity' | 'oxygen' | 'fuel', gravity?: 'space' | 'earth', o2?: 'low' | 'normal' | 'high') => void
  onOpenSparky: () => void
}

/**
 * Interactive Earth vs. Microgravity Flame Physics Diagram
 * Renders inside the Homepage Hero & Section 2 so children can toggle gravity
 * and immediately see how buoyancy convection (1g) vs. molecular diffusion (0g)
 * reshapes a flame using FLARE's actual D² Law engine.
 */
function HeroInteractiveFlameComparison({
  mode,
  onModeChange,
}: {
  mode: 'space' | 'earth'
  onModeChange: (m: 'space' | 'earth') => void
}) {
  const sim = useMemo(() => {
    const res = runSimulation({
      fuel: 'cellulose',
      gravity: mode === 'space' ? 0.001 : 9.81,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: mode === 'space' ? 0.01 : 0.05,
      duration: 30,
      sampleDiameter: 6,
    })
    const mid = res.frames[Math.min(8, Math.floor(res.frames.length / 3))] ?? res.frames[0]
    return mid
  }, [mode])

  return (
    <div className="flex flex-col justify-between rounded-[24px] bg-[#061024]/90 border border-sky-400/30 p-4 sm:p-5 backdrop-blur-md text-white shadow-[0_20px_50px_rgba(2,6,23,0.55)]">
      {/* Top Bar: Live Chamber Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-sky-300">
            LIVE CHAMBER · D² LAW ENGINE
          </span>
        </div>

        <div
          className="inline-flex rounded-full bg-[#0c1d3d] p-1 border border-sky-400/30"
          role="group"
          aria-label="Toggle chamber gravity"
        >
          <button
            type="button"
            onClick={() => onModeChange('space')}
            className={`rounded-full px-3 py-1 text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'space'
                ? 'bg-[#ff6b4a] text-white shadow-sm'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            0g Space
          </button>
          <button
            type="button"
            onClick={() => onModeChange('earth')}
            className={`rounded-full px-3 py-1 text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'earth'
                ? 'bg-[#facc15] text-slate-950 shadow-sm'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            1g Earth
          </button>
        </div>
      </div>

      {/* Live Telemetry & Explanation Strip */}
      <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-3 text-left">
        <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-sky-300/80">
            Flame Shape
          </span>
          <span className="font-space-grotesk text-sm sm:text-base font-black text-white tabular-nums">
            {mode === 'space' ? 'Sphere (1.00)' : `Teardrop (${sim.flameAspectRatio.toFixed(2)})`}
          </span>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-sky-300/80">
            Reaction Temp
          </span>
          <span className="font-mono text-sm sm:text-base font-extrabold text-amber-300 tabular-nums">
            {sim.flameTemperature.toFixed(0)} K
          </span>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-sky-300/80">
            Gas Flow
          </span>
          <span className="font-space-grotesk text-xs sm:text-sm font-extrabold text-cyan-300">
            {mode === 'space' ? 'All-Side Diffusion' : 'Upward Buoyancy'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function KidsHome({
  onSelectWorld,
  onOpenLab,
  onOpenSparky,
}: KidsHomeProps) {
  const [heroGravity, setHeroGravity] = useState<'space' | 'earth'>('space')

  const world1 = KIDS_WORLDS[0]
  const world2 = KIDS_WORLDS[1]
  const world3 = KIDS_WORLDS[2]
  const world4 = KIDS_WORLDS[3]
  const world5 = KIDS_WORLDS[4]

  return (
    <div className="w-full flex flex-col">
      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 01 — ARCHITECTURAL SPLIT HERO STAGE (Deep Cosmic Navy #071126)
          Inspired by the art-directed ORBIT TOYS composition:
          Left: Bold warm-coral/golden architectural typography block + dark pill CTA
          Right: 3D studio-rendered transparent microgravity combustion chamber & astronaut
      ════════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full bg-[#071126] pt-6 pb-16 sm:py-14 px-4 sm:px-8 border-b border-sky-500/20 overflow-hidden"
        aria-labelledby="kids-hero-headline"
      >
        {/* Subtle volumetric studio lighting accents */}
        <div
          className="pointer-events-none absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #ff6b4a 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 right-10 h-[460px] w-[460px] rounded-full opacity-25 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Main Architectural Split Frame */}
          <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[36px] overflow-hidden border-2 border-white/15 bg-[#0c1d3b] shadow-[0_32px_90px_rgba(2,6,23,0.65)]">
            {/* LEFT ARCHITECTURAL TYPOGRAPHY BLOCK (5 Columns) */}
            <div
              className="lg:col-span-5 p-7 sm:p-10 lg:p-11 flex flex-col justify-between relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(160deg, #ff6b4a 0%, #f97316 58%, #ea580c 100%)',
              }}
            >
              <div>
                {/* Top Eyebrow Pill */}
                <div className="inline-flex items-center gap-2 rounded-full bg-[#071126]/90 px-3.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-widest text-[#fde047] mb-6 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#fde047]" />
                  <span>FLARE KIDS · LITTLE SCIENCE UNIVERSE</span>
                </div>

                {/* Stacked Display Headline */}
                <h1
                  id="kids-hero-headline"
                  className="font-space-grotesk font-black uppercase tracking-tight leading-[0.95] text-[2.15rem] sm:text-[3.35rem] xl:text-[3.7rem] break-words"
                >
                  <span className="block text-[#fef08a] drop-shadow-[0_2px_0_rgba(7,17,38,0.25)]">
                    BIG QUESTIONS.
                  </span>
                  <span className="block text-[#071126] mt-1">
                    AMAZING SCIENCE.
                  </span>
                </h1>

                {/* Supporting Editorial Lead */}
                <p className="mt-5 text-base sm:text-lg font-bold text-[#071126]/95 leading-snug max-w-[38ch]">
                  Discover the secrets of fire in space. Explore flames, oxygen, airflow, and the science that helps keep astronauts safe.
                </p>
              </div>

              {/* Bottom Dark Cosmic Pill Bar + Primary & Secondary Actions */}
              <div className="mt-8 pt-6 border-t border-[#071126]/15 flex flex-col gap-3.5">
                {/* Signature Dark Pill Bar with Golden Circular Arrow CTA */}
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-3xl sm:rounded-full bg-[#071126] p-2.5 sm:p-2 sm:pl-5 text-white shadow-[0_14px_34px_rgba(7,17,38,0.45)]">
                  <div className="flex items-center gap-3 sm:gap-4 font-mono pl-2 sm:pl-0">
                    <div>
                      <span className="block text-sm sm:text-base font-black text-[#fde047] tabular-nums leading-none">
                        05
                      </span>
                      <span className="block text-[9px] uppercase tracking-widest text-sky-200/80 mt-0.5">
                        WORLDS
                      </span>
                    </div>
                    <div className="h-6 w-px bg-white/15" />
                    <div>
                      <span className="block text-sm sm:text-base font-black text-cyan-300 tabular-nums leading-none">
                        21%
                      </span>
                      <span className="block text-[9px] uppercase tracking-widest text-sky-200/80 mt-0.5">
                        ISS O₂
                      </span>
                    </div>
                    <div className="h-6 w-px bg-white/15" />
                    <div>
                      <span className="block text-sm sm:text-base font-black text-orange-300 tabular-nums leading-none">
                        ~0g
                      </span>
                      <span className="block text-[9px] uppercase tracking-widest text-sky-200/80 mt-0.5">
                        ORBIT
                      </span>
                    </div>
                  </div>

                  <a
                    href="#kids-worlds-showcase"
                    className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2.5 rounded-full bg-[#fde047] hover:bg-[#facc15] text-[#071126] pl-4 pr-3 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider transition-transform hover:scale-[1.02] shadow-md"
                  >
                    <span>EXPLORE THE SCIENCE</span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#071126] text-[#fde047] text-sm">
                      →
                    </span>
                  </a>
                </div>

                {/* Secondary Action Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <button
                    type="button"
                    onClick={() => onOpenLab('gravity', heroGravity, 'normal')}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-[#071126] hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Open Interactive Chamber Sandbox</span>
                    <span>→</span>
                  </button>
                  <span className="font-mono text-[11px] font-bold text-[#071126]/80">
                    NASA ISS &amp; SAFFIRE SCIENCE
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT 3D SCIENTIFIC STAGE (7 Columns) */}
            <div className="lg:col-span-7 relative flex flex-col justify-between p-5 sm:p-8 bg-[#08152e]">
              {/* Top Scientific Stage Header */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 text-xs font-bold text-sky-100 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span>ISS Combustion Integrated Rack · Spherical Microgravity Flame</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectWorld('meet-the-flame')}
                  className="rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 px-3.5 py-1 text-xs font-extrabold text-sky-200 transition-colors cursor-pointer"
                >
                  Enter World 01 →
                </button>
              </div>

              {/* Central 3D Artwork Stage with Live Gravity Comparison Overlay */}
              <div className="relative rounded-[28px] overflow-hidden border border-sky-400/25 bg-[#050d1e] shadow-inner group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/kids/world-1-flame-chamber.png"
                  alt="3D studio illustration of a transparent cylindrical combustion chamber containing a glowing spherical microgravity flame observed by an astronaut"
                  className="w-full h-[290px] sm:h-[360px] object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                />

                {/* Subtle bottom gradient for telemetry readability */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(5,13,30,0.15) 0%, rgba(5,13,30,0.0) 45%, rgba(5,13,30,0.82) 100%)',
                  }}
                />

                {/* Floating Scientific Annotation Callout */}
                <div className="absolute top-3.5 left-3.5 rounded-2xl bg-[#071126]/85 border border-cyan-400/40 px-3.5 py-2 backdrop-blur-md max-w-[250px] animate-gentle-float">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    {heroGravity === 'space'
                      ? 'WHY IS IT ROUND IN SPACE?'
                      : 'WHY IS IT TALL ON EARTH?'}
                  </span>
                  <p className="mt-0.5 text-xs font-medium text-slate-200 leading-snug">
                    {heroGravity === 'space'
                      ? 'Without buoyancy pulling hot gas up, oxygen diffuses inward equally from all sides!'
                      : 'On Earth (9.81 m/s²), cool air sinks and pushes hot gas upward into a tall teardrop plume.'}
                  </p>
                </div>
              </div>

              {/* Interactive Live D² Law Gravity Switcher Bar */}
              <div className="mt-4">
                <HeroInteractiveFlameComparison
                  mode={heroGravity}
                  onModeChange={setHeroGravity}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 02 — WARM EDITORIAL SCIENCE PRIMER (#faf8f5 Light Surface)
          Visual explanation of Earth Buoyancy vs. Space Molecular Diffusion
          before entering the 5 Educational Worlds.
      ════════════════════════════════════════════════════════════════════════ */}
      <section
        className="w-full bg-[#faf8f5] py-14 sm:py-20 px-4 sm:px-8 border-b border-slate-200/80"
        aria-labelledby="science-primer-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 5 Columns: Editorial Story */}
            <div className="lg:col-span-5">
              <span className="inline-block font-mono text-xs font-extrabold uppercase tracking-widest text-[#ea580c] mb-2">
                THE CORE DISCOVERY · EARTH VS. ORBIT
              </span>
              <h2
                id="science-primer-heading"
                className="font-space-grotesk text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.08]"
              >
                Why does a flame change shape when it leaves Earth?
              </h2>
              <p className="mt-4 text-base font-medium text-slate-700 leading-relaxed">
                Gravity does not pull on the light of a flame directly — it pulls on the air around it. On Earth, cooler, denser air sinks and pushes lighter hot gas upward. In microgravity aboard the International Space Station, that upward buoyant flow nearly disappears.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectWorld('meet-the-flame')}
                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
                >
                  Read the Full Story in World 01 →
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLab('gravity', 'space', 'normal')}
                  className="rounded-full border-2 border-slate-300 bg-white hover:border-slate-900 text-slate-900 px-4 py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
                >
                  Test in Live Sandbox
                </button>
              </div>
            </div>

            {/* Right 7 Columns: Two-Panel Architectural Diagram (1g Buoyancy vs 0g Diffusion) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Panel A: Earth 1g */}
              <div className="rounded-[28px] bg-white border-2 border-amber-200 p-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-mono text-xs font-extrabold text-amber-900">
                      EARTH · 9.81 m/s²
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500 tabular-nums">
                      AR ≈ 2.25
                    </span>
                  </div>

                  {/* Clean Technical SVG Diagram */}
                  <div className="h-40 rounded-2xl bg-[#09152b] flex items-center justify-center p-3 mb-4">
                    <svg viewBox="0 0 200 130" className="w-full h-full max-w-[190px]" aria-label="Earth buoyancy teardrop flame diagram">
                      <defs>
                        <linearGradient id="earth-plume" x1="0.5" y1="1" x2="0.5" y2="0">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="35%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#fde047" />
                        </linearGradient>
                      </defs>
                      {/* Upward buoyant airflow arrows */}
                      <path d="M52 105 L52 30 M46 38 L52 30 L58 38" stroke="#fb923c" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M148 105 L148 30 M142 38 L148 30 L154 38" stroke="#fb923c" strokeWidth="2.2" strokeLinecap="round" />
                      {/* Tall teardrop flame */}
                      <path
                        d="M100 16 C122 48 126 78 122 95 C118 108 110 114 100 114 C90 114 82 108 78 95 C74 78 78 48 100 16 Z"
                        fill="url(#earth-plume)"
                      />
                      <circle cx="100" cy="96" r="8" fill="#ffffff" />
                      <text x="100" y="126" textAnchor="middle" fill="#fed7aa" fontSize="9" fontFamily="monospace">
                        BUOYANT UPWARD CONVECTION
                      </text>
                    </svg>
                  </div>

                  <h3 className="font-space-grotesk text-xl font-black text-slate-900">
                    Buoyancy Stretches the Flame Upward
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-slate-600 leading-relaxed">
                    Hot exhaust gas is less dense than cool room air, so it rushes upward and pulls fresh oxygen in from the bottom.
                  </p>
                </div>
              </div>

              {/* Panel B: Space ~0g */}
              <div className="rounded-[28px] bg-white border-2 border-sky-200 p-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-sky-100 px-3 py-1 font-mono text-xs font-extrabold text-sky-900">
                      ORBIT · ~0.001 m/s²
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500 tabular-nums">
                      AR ≈ 1.00
                    </span>
                  </div>

                  {/* Clean Technical SVG Diagram */}
                  <div className="h-40 rounded-2xl bg-[#09152b] flex items-center justify-center p-3 mb-4">
                    <svg viewBox="0 0 200 130" className="w-full h-full max-w-[190px]" aria-label="Space spherical diffusion flame diagram">
                      <defs>
                        <radialGradient id="space-sphere" cx="50%" cy="50%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="38%" stopColor="#fde047" />
                          <stop offset="68%" stopColor="#fb923c" />
                          <stop offset="92%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <circle cx="100" cy="60" r="42" fill="url(#space-sphere)" />
                      <circle cx="100" cy="60" r="33" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" />
                      <circle cx="100" cy="60" r="6" fill="#0f172a" stroke="#fde047" strokeWidth="1.5" />
                      {/* Radial inward diffusion arrows */}
                      {[0, 60, 120, 180, 240, 300].map((deg) => {
                        const rad = (deg * Math.PI) / 180
                        const x1 = 100 + Math.cos(rad) * 48
                        const y1 = 60 + Math.sin(rad) * 48
                        const x2 = 100 + Math.cos(rad) * 37
                        const y2 = 60 + Math.sin(rad) * 37
                        return (
                          <line
                            key={deg}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#7dd3fc"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        )
                      })}
                      <text x="100" y="126" textAnchor="middle" fill="#bae6fd" fontSize="9" fontFamily="monospace">
                        RADIAL MOLECULAR DIFFUSION
                      </text>
                    </svg>
                  </div>

                  <h3 className="font-space-grotesk text-xl font-black text-slate-900">
                    Diffusion Forms a Glowing Sphere
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-slate-600 leading-relaxed">
                    Without buoyancy, oxygen molecules drift inward from every direction equally, creating a rounded reaction shell.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 03 — THE 5 EDUCATIONAL WORLDS (EDITORIAL DISCOVERY SHOWCASE)
          Strictly avoids 5 identical cards! Uses varied architectural compositions:
          1. World 01: Full-width 12-col flagship split feature (Warm Cream #faf8f5)
          2. World 02 & World 03: Asymmetric 7:5 and 5:7 staggered editorial showcase (Sky #f0f6fc)
          3. World 04: Full-bleed Deep Ocean Blue (#09172e) planetarium cutaway showcase
          4. World 05: Wide architectural safety engineering showcase (Warm Cream #faf8f5)
      ════════════════════════════════════════════════════════════════════════ */}
      <div id="kids-worlds-showcase" className="scroll-mt-20">
        {/* ── WORLD 01 FLAGSHIP SHOWCASE (Light Surface #f0f6fc) ── */}
        <section
          className="w-full bg-[#f0f6fc] py-14 sm:py-20 px-4 sm:px-8 border-b border-sky-200/80"
          aria-labelledby="world-01-heading"
        >
          <div className="max-w-7xl mx-auto">
            {/* Section Title Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-sky-700">
                  INTERACTIVE SCIENCE EXHIBITION · 05 WORLDS TO EXPLORE
                </span>
                <h2 className="mt-1 font-space-grotesk text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  Choose a Science World to Enter
                </h2>
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-600 max-w-md">
                Each world combines 3D scientific artwork, visual storytelling, and a live interactive combustion demonstration.
              </p>
            </div>

            {/* WORLD 01 — Full-Width 12-Column Split Feature */}
            <article className="grid grid-cols-1 lg:grid-cols-12 rounded-[36px] overflow-hidden bg-white border-2 border-orange-200 shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
              {/* Left 7 Columns: 3D Visual Scene */}
              <div className="lg:col-span-7 relative bg-[#08152c] min-h-[300px] sm:min-h-[380px] overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={world1.imagePath}
                  alt={world1.imageAlt}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span className="rounded-full bg-[#ff6b4a] px-4 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-white shadow">
                    {world1.worldNumber}
                  </span>
                  <span className="rounded-full bg-[#071126]/85 border border-white/20 px-3.5 py-1.5 font-mono text-xs font-bold text-amber-300 backdrop-blur-md">
                    {world1.nasaResearch.investigationCode}
                  </span>
                </div>
              </div>

              {/* Right 5 Columns: Editorial Story & Learning Questions */}
              <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-[#fffaf5] to-white">
                <div>
                  <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-orange-600">
                    {world1.scientificSubject}
                  </span>
                  <h3
                    id="world-01-heading"
                    className="mt-1 font-space-grotesk text-3xl sm:text-4xl font-black text-slate-900 tracking-tight"
                  >
                    {world1.title}
                  </h3>
                  <p className="mt-2 font-space-grotesk text-sm sm:text-base font-extrabold text-orange-700">
                    {world1.compellingQuestion}
                  </p>
                  <p className="mt-3 text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                    {world1.visualIntroLead}
                  </p>

                  {/* 3 Key Questions Children Will Answer */}
                  <div className="mt-6 space-y-2 border-t border-orange-200/70 pt-4">
                    <span className="block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      WHAT YOU WILL DISCOVER:
                    </span>
                    {world1.learningQuestions.map((q) => (
                      <div key={q} className="flex items-start gap-2.5 text-sm font-bold text-slate-800">
                        <span className="text-orange-500 font-black">→</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectWorld(world1.id)}
                    className="w-full rounded-2xl bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-4 text-sm font-black uppercase tracking-wider shadow-[0_12px_28px_rgba(249,115,22,0.3)] transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>Explore World 01: Meet the Flame</span>
                    <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            </article>

            {/* ── WORLD 02 & WORLD 03 — ASYMMETRIC EDITORIAL PAIR (7:5 Mix) ── */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* WORLD 02: THE OXYGEN MYSTERY (7 Columns) */}
              <article className="lg:col-span-7 rounded-[34px] overflow-hidden bg-white border-2 border-sky-200 shadow-[0_20px_50px_rgba(15,23,42,0.06)] flex flex-col justify-between">
                <div className="relative h-64 sm:h-72 bg-[#071a33] overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={world2.imagePath}
                    alt={world2.imageAlt}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="rounded-full bg-[#0284c7] px-3.5 py-1 font-mono text-xs font-black uppercase tracking-wider text-white shadow">
                      {world2.worldNumber}
                    </span>
                    <span className="rounded-full bg-[#071126]/85 border border-sky-400/30 px-3 py-1 font-mono text-xs font-bold text-sky-200 backdrop-blur-md">
                      {world2.nasaResearch.investigationCode}
                    </span>
                  </div>
                </div>

                <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-sky-700">
                      {world2.scientificSubject}
                    </span>
                    <h3 className="mt-1 font-space-grotesk text-2xl sm:text-3xl font-black text-slate-900">
                      {world2.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                      {world2.visualIntroLead}
                    </p>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {world2.learningQuestions.map((q) => (
                        <div
                          key={q}
                          className="rounded-2xl bg-sky-50/90 border border-sky-200 p-3 text-xs font-bold text-sky-950 leading-snug"
                        >
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      Interactive O₂ Range: 16% – 32%
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectWorld(world2.id)}
                      className="rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Enter World 02 →
                    </button>
                  </div>
                </div>
              </article>

              {/* WORLD 03: THE INVISIBLE WIND (5 Columns) */}
              <article className="lg:col-span-5 rounded-[34px] overflow-hidden bg-white border-2 border-teal-200 shadow-[0_20px_50px_rgba(15,23,42,0.06)] flex flex-col justify-between">
                <div className="relative h-64 sm:h-72 bg-[#062229] overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={world3.imagePath}
                    alt={world3.imageAlt}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="rounded-full bg-[#0d9488] px-3.5 py-1 font-mono text-xs font-black uppercase tracking-wider text-white shadow">
                      {world3.worldNumber}
                    </span>
                    <span className="rounded-full bg-[#071126]/85 border border-teal-400/30 px-3 py-1 font-mono text-xs font-bold text-teal-200 backdrop-blur-md">
                      {world3.nasaResearch.investigationCode}
                    </span>
                  </div>
                </div>

                <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-teal-700">
                      {world3.scientificSubject}
                    </span>
                    <h3 className="mt-1 font-space-grotesk text-2xl sm:text-3xl font-black text-slate-900">
                      {world3.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                      {world3.visualIntroLead}
                    </p>

                    <div className="mt-4 space-y-1.5">
                      {world3.learningQuestions.map((q) => (
                        <div key={q} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                          <span className="text-teal-600 font-black">•</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      0.00 – 0.40 m/s Flow
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectWorld(world3.id)}
                      className="rounded-2xl bg-[#0d9488] hover:bg-[#0f766e] text-white px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Enter World 03 →
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ── WORLD 04 — FULL-BLEED PLANETARIUM SPACE LAB SHOWCASE (Dark Navy #09172e) ── */}
        <section
          className="w-full bg-[#09172e] py-16 sm:py-24 px-4 sm:px-8 border-b border-indigo-400/20 text-white"
          aria-labelledby="world-04-heading"
        >
          <div className="max-w-7xl mx-auto">
            <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left 5 Columns: Planetarium Dark Editorial Narrative */}
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-400/40 px-3.5 py-1 font-mono text-xs font-black uppercase tracking-wider text-indigo-200 mb-4">
                  <span>{world4.worldNumber}</span>
                  <span>·</span>
                  <span>{world4.nasaResearch.platform}</span>
                </div>

                <h2
                  id="world-04-heading"
                  className="font-space-grotesk text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.05]"
                >
                  {world4.title}
                </h2>

                <p className="mt-3 font-space-grotesk text-base sm:text-lg font-bold text-amber-300">
                  {world4.compellingQuestion}
                </p>

                <p className="mt-4 text-sm sm:text-base font-medium text-slate-200 leading-relaxed">
                  {world4.visualIntroLead}
                </p>

                <div className="mt-6 space-y-2.5 border-t border-white/15 pt-5">
                  {world4.learningQuestions.map((q) => (
                    <div key={q} className="flex items-center gap-3 text-sm font-bold text-sky-100">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 border border-indigo-400/50 text-xs text-indigo-200">
                        ✓
                      </span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onSelectWorld(world4.id)}
                    className="rounded-2xl bg-[#fde047] hover:bg-[#facc15] text-[#071126] px-6 py-4 text-sm font-black uppercase tracking-wider shadow-[0_14px_34px_rgba(250,204,21,0.25)] transition-all cursor-pointer"
                  >
                    Explore World 04: Inside the Space Lab →
                  </button>
                  <Link
                    href="/research"
                    className="rounded-2xl border border-white/25 bg-white/5 hover:bg-white/10 px-5 py-4 text-xs sm:text-sm font-extrabold text-white transition-all"
                  >
                    View NASA CIR &amp; Saffire Archive
                  </Link>
                </div>
              </div>

              {/* Right 7 Columns: 3D Orbital Lab Cutaway */}
              <div className="lg:col-span-7">
                <div className="relative rounded-[34px] overflow-hidden border-2 border-indigo-400/35 bg-[#050d1e] shadow-[0_28px_80px_rgba(0,0,0,0.55)] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={world4.imagePath}
                    alt={world4.imageAlt}
                    className="w-full h-[320px] sm:h-[420px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-[#071126]/90 border border-white/15 p-4 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                        ORBITAL HARDWARE CONTAINMENT
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        Triple-sealed ISS Combustion Integrated Rack &amp; uncrewed Cygnus Saffire flights
                      </span>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-amber-300 shrink-0">
                      ZERO CREW RISK
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ── WORLD 05 — SPACECRAFT SAFETY ENGINEERING & SPARKY CONCIERGE (Warm Light #faf8f5) ── */}
        <section
          className="w-full bg-[#faf8f5] py-16 sm:py-24 px-4 sm:px-8"
          aria-labelledby="world-05-heading"
        >
          <div className="max-w-7xl mx-auto space-y-14">
            {/* WORLD 05 Split Showcase */}
            <article className="grid grid-cols-1 lg:grid-cols-12 rounded-[36px] overflow-hidden bg-white border-2 border-rose-200 shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
              {/* Left 6 Columns: 3D Safety Cutaway */}
              <div className="lg:col-span-6 relative bg-[#180b1e] min-h-[300px] sm:min-h-[380px] overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={world5.imagePath}
                  alt={world5.imageAlt}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span className="rounded-full bg-[#f43f5e] px-4 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-white shadow">
                    {world5.worldNumber}
                  </span>
                  <span className="rounded-full bg-[#071126]/85 border border-rose-300/30 px-3.5 py-1.5 font-mono text-xs font-bold text-rose-200 backdrop-blur-md">
                    {world5.nasaResearch.investigationCode}
                  </span>
                </div>
              </div>

              {/* Right 6 Columns: Safety Story */}
              <div className="lg:col-span-6 p-7 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-[#fff8f9] to-white">
                <div>
                  <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-rose-600">
                    {world5.scientificSubject}
                  </span>
                  <h3
                    id="world-05-heading"
                    className="mt-1 font-space-grotesk text-3xl sm:text-4xl font-black text-slate-900 tracking-tight"
                  >
                    {world5.title}
                  </h3>
                  <p className="mt-2 font-space-grotesk text-sm sm:text-base font-extrabold text-rose-700">
                    {world5.compellingQuestion}
                  </p>
                  <p className="mt-3 text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                    {world5.visualIntroLead}
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3">
                      <span className="block font-mono text-[10px] font-black uppercase text-rose-700">
                        01 · PREVENT
                      </span>
                      <span className="mt-1 block text-xs font-bold text-slate-900">
                        Fire-resistant materials (NASA-STD-6001B)
                      </span>
                    </div>
                    <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3">
                      <span className="block font-mono text-[10px] font-black uppercase text-rose-700">
                        02 · DETECT
                      </span>
                      <span className="mt-1 block text-xs font-bold text-slate-900">
                        Laser duct smoke sensors (SAME)
                      </span>
                    </div>
                    <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3">
                      <span className="block font-mono text-[10px] font-black uppercase text-rose-700">
                        03 · SUPPRESS
                      </span>
                      <span className="mt-1 block text-xs font-bold text-slate-900">
                        Cut ventilation airflow &amp; deploy CO₂
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => onSelectWorld(world5.id)}
                    className="w-full rounded-2xl bg-[#f43f5e] hover:bg-[#e11d48] text-white px-6 py-4 text-sm font-black uppercase tracking-wider shadow-[0_12px_28px_rgba(244,63,94,0.28)] transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>Explore World 05: Keeping Astronauts Safe</span>
                    <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            </article>

            {/* ── INTERACTIVE SANDBOX & SCIENCE Q&A INVITATION BAR ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 rounded-[32px] bg-[#071126] text-white p-7 sm:p-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-sky-400/30 shadow-lg">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-300">
                    HANDS-ON MULTI-PARAMETER CHAMBER
                  </span>
                  <h3 className="mt-1 font-space-grotesk text-2xl sm:text-3xl font-black text-white">
                    Open the Full Interactive Flame Sandbox
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-300 max-w-xl">
                    Combine gravity, oxygen concentration, ventilation airflow, and spacecraft materials in one live observatory.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenLab('gravity', 'space', 'normal')}
                  className="shrink-0 rounded-2xl bg-[#ff6b4a] hover:bg-[#f97316] text-white px-6 py-4 text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Launch Sandbox →
                </button>
              </div>

              <div className="lg:col-span-5 rounded-[32px] bg-white border-2 border-indigo-200 p-7 sm:p-9 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-indigo-600">
                    CURIOUS MINDS Q&amp;A
                  </span>
                  <h3 className="mt-1 font-space-grotesk text-2xl font-black text-slate-900">
                    Have Your Own Question About Fire in Space?
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-slate-600">
                    Ask our child-friendly science guide about cool flames, astronauts, or how NASA tests spacecraft.
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={onOpenSparky}
                    className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Ask a Space Science Question →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
