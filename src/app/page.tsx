'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FlareLogo } from '@/components/ui/FlareLogo'
import { StarField } from '@/components/ui/StarField'
import HeroCombustionSphere, {
  HERO_REGIMES,
  type HeroRegimeId,
} from '@/components/ui/HeroCombustionSphere'
import { StarBorder, SpotlightCard } from '@/components/ui/reactbits/MotionPrimitives'
import AIAssistant from '@/components/science/AIAssistant'
import { AccessibilityTriggerButton } from '@/components/ui/AccessibilityControlModal'

const ORBITAL_MODULES = [
  {
    index: '01',
    tag: 'INTERACTIVE 3D INSTRUMENT',
    title: 'COMBUSTION CHAMBER LAB',
    subtitle: 'D² Law Analytical Engine · 5 Diagnostic Layers',
    description:
      'Configure gravity (ISS 0.001g, Moon, Mars, Earth), oxygen mole fraction, ambient pressure, and forced ventilation inside an interactive 3D optical chamber.',
    href: '/science',
    cta: 'Launch Simulator',
    orbGradient:
      'radial-gradient(circle at 35% 35%, #fef08a 0%, #f97316 42%, #9a3412 78%, #090d16 100%)',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    spotlightColor: 'rgba(249, 115, 22, 0.14)',
    accentColor: '#fb923c',
  },
  {
    index: '02',
    tag: 'NASA PSI & NTRS ARCHIVE',
    title: 'ORBITAL INVESTIGATIONS',
    subtitle: 'Saffire I–VI · FLEX-2 · BASS-II · ACME · SAME',
    description:
      'Explore 16 verified NASA microgravity combustion investigations across the ISS Combustion Integrated Rack and uncrewed Cygnus cargo vehicles.',
    href: '/research',
    cta: 'Explore NASA Archive',
    orbGradient:
      'radial-gradient(circle at 35% 35%, #e0f2fe 0%, #38bdf8 40%, #0369a1 76%, #090d16 100%)',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    spotlightColor: 'rgba(56, 189, 248, 0.14)',
    accentColor: '#38bdf8',
  },
  {
    index: '03',
    tag: 'BENCHMARKING & AI SYNTHESIS',
    title: 'SCIENTIFIC COMPARISON',
    subtitle: 'NASA Experimental vs. D² Model Telemetry',
    description:
      'Compare NASA experiments and simulation scenarios side by side with automated compatibility evaluation, radar diagnostics, and AI scientific explanations.',
    href: '/compare',
    cta: 'Open Data Explorer',
    orbGradient:
      'radial-gradient(circle at 35% 35%, #fde68a 0%, #f59e0b 42%, #78350f 78%, #090d16 100%)',
    glowColor: 'rgba(245, 158, 11, 0.32)',
    spotlightColor: 'rgba(245, 158, 11, 0.14)',
    accentColor: '#fbbf24',
  },
  {
    index: '04',
    tag: 'LIVING EDUCATIONAL UNIVERSE',
    title: 'FLARE KIDS UNIVERSE',
    subtitle: 'Guided Space-Flame Discovery with Sparky',
    description:
      'A museum-grade, child-friendly science world where young explorers discover why flames form glowing spheres in space through 5 interactive worlds.',
    href: '/kids',
    cta: 'Enter Kids Universe',
    orbGradient:
      'radial-gradient(circle at 35% 35%, #fef08a 0%, #ff6b4a 42%, #0284c7 78%, #071126 100%)',
    glowColor: 'rgba(255, 107, 74, 0.35)',
    spotlightColor: 'rgba(255, 107, 74, 0.14)',
    accentColor: '#ff6b4a',
  },
]

export default function WelcomePage() {
  const [activeRegime, setActiveRegime] = useState<HeroRegimeId>('iss')
  const [showAI, setShowAI] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentRegime =
    HERO_REGIMES.find((r) => r.id === activeRegime) ?? HERO_REGIMES[0]

  return (
    <main className="relative min-h-screen flex flex-col bg-[#03050a] text-[#f8fafc] overflow-x-hidden selection:bg-orange-500/30 selection:text-amber-200">
      {/* Pinpoint deep-space starfield */}
      <StarField count={160} />

      {/* Subtle atmospheric horizon glow */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 44%, rgba(249, 115, 22, 0.08) 0%, rgba(6, 182, 212, 0.04) 45%, transparent 78%)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — CINEMATIC EDITORIAL HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col justify-between px-3.5 sm:px-6 md:px-12 py-4 sm:py-6 md:py-8">
        {/* ── Minimal Editorial Top Navigation ── */}
        <header className="flex items-center justify-between gap-2 sm:gap-4 border-b border-white/[0.06] pb-3 sm:pb-5">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/" aria-label="FLARE Home" className="shrink-0">
              <FlareLogo size="sm" />
            </Link>
            <div className="hidden lg:flex flex-col border-l border-white/10 pl-4">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400">
                {'// 01 — ORBITAL COMBUSTION PLATFORM'}
              </span>
              <span className="font-sans text-xs text-slate-300">
                Fire &amp; Life-Safety Analysis and Risk Explorer
              </span>
            </div>
          </div>

          {/* Primary platform links */}
          <nav
            aria-label="Primary platform navigation"
            className="hidden md:flex items-center gap-6 font-sans text-xs font-medium"
          >
            <Link
              href="/science"
              className="text-slate-200 hover:text-orange-400 transition-colors"
            >
              Simulation Lab
            </Link>
            <Link
              href="/research"
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              NASA Research
            </Link>
            <Link
              href="/compare"
              className="text-slate-300 hover:text-amber-300 transition-colors"
            >
              Compare Data
            </Link>
            <Link
              href="/library"
              className="text-slate-300 hover:text-emerald-300 transition-colors"
            >
              Research Library
            </Link>
            <Link
              href="/insights"
              className="text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Insights
            </Link>
            <Link
              href="/kids"
              className="rounded-full border border-amber-400/35 bg-amber-400/10 px-3.5 py-1.5 text-amber-300 hover:border-amber-300 hover:bg-amber-400/20 transition-all font-semibold"
            >
              ✦ Kids Experience
            </Link>
          </nav>

          {/* Right AI Agent + Accessibility + Experience Selector + Mobile Menu triggers */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <AccessibilityTriggerButton variant="science" compact />

            <button
              type="button"
              onClick={() => setShowAI(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-2.5 sm:px-3.5 py-1.5 min-h-[38px] font-sans text-xs font-medium text-cyan-200 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>AI</span>
              <span className="hidden sm:inline">Agent</span>
            </button>

            <Link
              href="/select"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 min-h-[38px] font-sans text-xs font-medium text-slate-200 hover:border-orange-400/60 hover:text-orange-300 transition-all"
            >
              <span>Choose Experience</span>
              <span aria-hidden="true">↗</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle platform navigation menu"
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-700 bg-slate-900/90 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer (< md) */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile platform navigation"
            className="md:hidden mt-3 rounded-2xl border border-slate-800 bg-[#070d1b]/95 backdrop-blur-md p-4 space-y-2 shadow-2xl"
          >
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/science"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-between rounded-xl bg-orange-500/15 border border-orange-500/35 px-3.5 py-2.5 text-xs font-semibold text-orange-200"
              >
                <span>🔥 Simulation Lab</span>
                <span>→</span>
              </Link>
              <Link
                href="/kids"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-between rounded-xl bg-amber-400/15 border border-amber-400/40 px-3.5 py-2.5 text-xs font-semibold text-amber-200"
              >
                <span>✦ Kids Universe</span>
                <span>→</span>
              </Link>
              <Link
                href="/research"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-200"
              >
                <span>🛸 NASA Research</span>
                <span>→</span>
              </Link>
              <Link
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-200"
              >
                <span>⚖️ Compare Data</span>
                <span>→</span>
              </Link>
              <Link
                href="/library"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-200"
              >
                <span>📚 Library</span>
                <span>→</span>
              </Link>
              <Link
                href="/insights"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-200"
              >
                <span>💡 Insights</span>
                <span>→</span>
              </Link>
            </div>
            <Link
              href="/select"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] border border-white/15 px-4 py-2.5 text-xs font-semibold text-white"
            >
              <span>Choose Experience (Scientific vs. Kids)</span>
              <span>↗</span>
            </Link>
          </nav>
        )}

        {/* ── Corner Editorial Metadata Row ── */}
        <div className="hidden sm:grid grid-cols-3 gap-4 pt-4 font-mono text-[11px] tracking-[0.16em] uppercase text-slate-400">
          <div>
            <p className="text-slate-500">{'// REGIME TELEMETRY'}</p>
            <p className="mt-0.5 text-orange-400/95 tabular-nums font-medium">
              {currentRegime.label}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500">{'// SOLVER ARCHITECTURE'}</p>
            <p className="mt-0.5 text-cyan-400/90 font-medium">
              D² LAW ANALYTICAL · 16 NASA PSI RECORDS
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">{'// MISSION ATTRIBUTION'}</p>
            <p className="mt-0.5 text-slate-300 font-medium">
              NASA SPACE APPS 2026 · TEAM WUNDERBAO
            </p>
          </div>
        </div>

        {/* ── Central Monumental Typography + Integrated 3D Combustion Sphere ── */}
        <div className="relative my-auto py-8 md:py-10 flex flex-col items-center justify-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-3 font-mono text-xs tracking-[0.32em] uppercase text-orange-400/90 text-center"
          >
            {currentRegime.sublabel}
          </motion.p>

          {/* Monumental Typographic Lockup: F L [SPHERE] R E */}
          <div className="relative w-full max-w-[1380px] mx-auto flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-2">
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block font-orbitron font-black select-none tracking-[0.16em] text-white/95 leading-none"
              style={{
                fontSize: 'clamp(4.5rem, 11.5vw, 10.5rem)',
                textShadow: '0 0 60px rgba(249, 115, 22, 0.18)',
              }}
              aria-hidden="true"
            >
              FL
            </motion.span>

            <h1
              className="lg:sr-only font-orbitron font-black tracking-[0.1em] sm:tracking-[0.22em] text-white text-center leading-none mb-2 flare-glow"
              style={{ fontSize: 'clamp(2.4rem, 12vw, 5.8rem)' }}
            >
              FLARE
            </h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.1 }}
              className="relative z-20 mx-2"
            >
              <HeroCombustionSphere
                activeRegime={activeRegime}
                onRegimeChange={setActiveRegime}
              />
            </motion.div>

            <motion.span
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block font-orbitron font-black select-none tracking-[0.16em] text-white/95 leading-none"
              style={{
                fontSize: 'clamp(4.5rem, 11.5vw, 10.5rem)',
                textShadow: '0 0 60px rgba(249, 115, 22, 0.18)',
              }}
              aria-hidden="true"
            >
              RE
            </motion.span>
          </div>
        </div>

        {/* ── Bottom Editorial Bar: Mission Statement + Telemetry + StarBorder Primary Action ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-end gap-8 border-t border-white/[0.07] pt-6">
          <div className="lg:col-span-5">
            <p className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              Understand Fire.{' '}
              <span className="text-orange-400">Explore Space.</span>{' '}
              Discover Science.
            </p>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-xl">
              An interactive orbital combustion research and spacecraft fire-safety platform coupling analytical D² Law physics with verified NASA Physical Sciences Informatics (PSI) investigations.
            </p>
          </div>

          <div className="lg:col-span-3 flex items-center justify-start lg:justify-center gap-6 font-mono text-xs">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                O₂ MOLE FRAC
              </span>
              <span className="text-cyan-400 font-bold tabular-nums text-sm">
                {currentRegime.oxygenPercent}.0 vol%
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                AMBIENT PRESS
              </span>
              <span className="text-slate-200 font-bold tabular-nums text-sm">
                {currentRegime.pressure.toFixed(1)} atm
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                VENTILATION
              </span>
              <span className="text-amber-300 font-bold tabular-nums text-sm">
                {currentRegime.airflowVelocity.toFixed(2)} m/s
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-wrap items-center justify-start lg:justify-end gap-3.5">
            <Link
              href="/select"
              className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 font-display text-xs font-semibold tracking-wider uppercase text-slate-200 hover:border-cyan-400/60 hover:text-cyan-300 transition-all"
            >
              Choose Experience
            </Link>

            <StarBorder color="rgba(249, 115, 22, 0.85)" speed="6.5s">
              <Link
                href={`/science?fuel=${currentRegime.fuel}&gravity=${currentRegime.gravity}&o2=${currentRegime.oxygenPercent}&pressure=${currentRegime.pressure}&airflow=${currentRegime.airflowVelocity}&exp=${encodeURIComponent(currentRegime.label)}`}
                className="group inline-flex items-center gap-3.5 rounded-full border border-orange-500/60 bg-[#0c1324] hover:bg-orange-500/20 pl-6 pr-3 py-2.5 font-display text-xs font-bold tracking-wider uppercase text-white transition-all"
              >
                <span>Enter Simulation Lab</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </StarBorder>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — WHY COMBUSTION IN SPACE MATTERS & EXPERIENCE GUIDE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-white/[0.06] bg-[#050914] px-6 py-20 md:px-12">
        <div className="max-w-[1360px] mx-auto space-y-14">
          {/* Why It Matters Header + 3 Scientific Pillars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <p className="font-mono text-xs tracking-widest uppercase text-orange-400">
                {'// 02 — SCIENTIFIC FOUNDATION'}
              </p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Why Fire Behaves Differently Beyond Earth
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                On Earth, gravity pulls cool air down and pushes hot combustion gases up, stretching flames into a rising teardrop. In orbit, buoyancy vanishes—transforming fire into a spherical diffusion reaction zone that challenges conventional spacecraft fire detection and suppression.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-[#080f1e] border border-slate-800/90 p-5 space-y-2">
                <span className="font-mono text-xs text-cyan-400 font-semibold">
                  01 · Spherical Diffusion
                </span>
                <h3 className="font-display text-base font-bold text-white">
                  Zero-Buoyancy Physics
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Without buoyant lift, oxygen reaches the fuel purely by slow molecular diffusion or cabin ventilation, forming a symmetric blue reaction shell.
                </p>
              </div>

              <div className="rounded-2xl bg-[#080f1e] border border-slate-800/90 p-5 space-y-2">
                <span className="font-mono text-xs text-amber-400 font-semibold">
                  02 · Spacecraft Life Safety
                </span>
                <h3 className="font-display text-base font-bold text-white">
                  ISS &amp; Exploration Cabins
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Exploration atmospheres (up to 34% O₂ at reduced pressure) and HVAC airflow directly govern material flammability and crew fire safety.
                </p>
              </div>

              <div className="rounded-2xl bg-[#080f1e] border border-slate-800/90 p-5 space-y-2">
                <span className="font-mono text-xs text-emerald-400 font-semibold">
                  03 · Verified NASA Data
                </span>
                <h3 className="font-display text-base font-bold text-white">
                  FLEX-2, BASS &amp; Saffire
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Ground every simulation in 16 official NASA investigations conducted inside the ISS Combustion Integrated Rack and uncrewed Cygnus vehicles.
                </p>
              </div>
            </div>
          </div>

          {/* Dual Experience Selector Preview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Experience 01: Scientific Experience */}
            <SpotlightCard
              spotlightColor="rgba(6, 182, 212, 0.14)"
              className="rounded-3xl border border-slate-800 bg-[#070d1b] p-7 sm:p-9 transition-all hover:border-cyan-500/40"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                    01 · For Researchers, Engineers, Students &amp; Judges
                  </span>
                  <span className="font-mono text-xs text-slate-400">D² Law + NASA PSI</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  FLARE Scientific Experience
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Interactive 3D combustion chamber with 5 diagnostic layers, analytical D² Law telemetry, 16 NASA investigations, side-by-side scenario benchmarking, and the context-aware FLARE Scientific AI Agent.
                </p>
              </div>
              <div className="mt-7 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-400">
                  <span>/science</span>
                  <span>·</span>
                  <span>/research</span>
                  <span>·</span>
                  <span>/compare</span>
                  <span>·</span>
                  <span>/library</span>
                </div>
                <Link
                  href="/science"
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-colors"
                >
                  <span>Enter Scientific Lab</span>
                  <span>→</span>
                </Link>
              </div>
            </SpotlightCard>

            {/* Experience 02: FLARE Kids Universe */}
            <SpotlightCard
              spotlightColor="rgba(255, 107, 74, 0.16)"
              className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#0a162e] via-[#0c1d3b] to-[#081226] p-7 sm:p-9 transition-all hover:border-amber-400/60"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                    02 · For Young Explorers, Classrooms &amp; Families
                  </span>
                  <span className="font-mono text-xs text-sky-300">5 Interactive Worlds</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  FLARE Kids — The Little Science Universe
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  A welcoming, museum-grade space science world where kids explore why fire forms a glowing ball in space, test gravity and oxygen in a safe sandbox, and ask Sparky the Space Flame Guide.
                </p>
              </div>
              <div className="mt-7 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs font-mono text-amber-200/80">
                  <span>5 Visual Worlds</span>
                  <span>·</span>
                  <span>Chamber Sandbox</span>
                  <span>·</span>
                  <span>Ask Sparky AI</span>
                </div>
                <Link
                  href="/kids"
                  className="inline-flex items-center gap-2 rounded-full bg-[#fde047] hover:bg-[#facc15] text-[#071126] font-display text-xs font-black uppercase tracking-wider px-5 py-2.5 transition-colors"
                >
                  <span>Enter Kids Universe</span>
                  <span>→</span>
                </Link>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — ORBITAL RESEARCH MODULES
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-white/[0.06] bg-gradient-to-b from-[#03050a] via-[#060c1a] to-[#03050a] px-6 py-20 md:px-12">
        <div className="max-w-[1360px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <p className="font-mono text-xs tracking-widest uppercase text-cyan-400 mb-2">
                {'// 03 — PLATFORM ARCHITECTURE'}
              </p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Explore Every FLARE Workspace
              </h2>
            </div>
            <p className="font-sans text-sm text-slate-300 max-w-md leading-relaxed">
              Navigate directly into FLARE&apos;s interactive 3D simulation chamber, verified NASA Physical Sciences Informatics archives, scenario comparison workbench, or Kids Science Universe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ORBITAL_MODULES.map((mod) => (
              <Link key={mod.index} href={mod.href} className="group block h-full">
                <SpotlightCard
                  spotlightColor={mod.spotlightColor}
                  className="h-full rounded-2xl border border-white/[0.08] bg-[#070c18]/90 p-6 pt-8 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-white/25"
                  style={{
                    boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-[11px] tracking-wider text-slate-400 mb-6">
                      <span style={{ color: mod.accentColor }}>{`// ${mod.index}`}</span>
                      <span>{mod.tag}</span>
                    </div>

                    <div className="relative my-4 flex items-center justify-center">
                      <div
                        className="h-28 w-28 rounded-full transition-transform duration-500 group-hover:scale-110"
                        style={{
                          background: mod.orbGradient,
                          boxShadow: `0 0 42px ${mod.glowColor}, inset -8px -8px 20px rgba(0,0,0,0.7)`,
                        }}
                      />
                      <div
                        className="pointer-events-none absolute h-36 w-36 rounded-full border border-white/10 transition-transform duration-500 group-hover:rotate-45"
                        style={{ borderTopColor: mod.accentColor }}
                      />
                    </div>

                    <div className="mt-6">
                      <h3 className="font-display text-lg font-bold tracking-tight text-white group-hover:text-orange-300 transition-colors">
                        {mod.title}
                      </h3>
                      <p
                        className="mt-1 font-mono text-xs"
                        style={{ color: mod.accentColor }}
                      >
                        {mod.subtitle}
                      </p>
                      <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between font-display text-xs font-semibold uppercase tracking-wider text-slate-200 group-hover:text-white">
                    <span>{mod.cta}</span>
                    <span
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      style={{ color: mod.accentColor }}
                    >
                      →
                    </span>
                  </div>
                </SpotlightCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer & NASA Space Apps Submission Provenance Disclosure ── */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#03050a] px-6 py-8 md:px-12 space-y-5 font-mono text-xs text-slate-400 pb-safe">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FlareLogo size="xs" />
            <span>
              FLARE — Fire &amp; Life-Safety Analysis and Risk Explorer · Developed by{' '}
              <strong className="text-slate-200 font-medium">Team WUNDERBAO</strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-[11px] tracking-widest uppercase">
            <Link href="/select" className="hover:text-orange-400 transition-colors py-1">
              Switch Experience
            </Link>
            <Link href="/science" className="hover:text-cyan-400 transition-colors py-1">
              Simulation Lab
            </Link>
            <Link href="/research" className="hover:text-cyan-400 transition-colors py-1">
              NASA PSI Archive
            </Link>
            <Link href="/compare" className="hover:text-amber-300 transition-colors py-1">
              Compare Data
            </Link>
            <Link href="/kids" className="hover:text-amber-300 transition-colors py-1">
              Kids Universe
            </Link>
          </div>
        </div>

        {/* NASA Space Apps Challenge 2026 Provenance & AI Content Disclosure */}
        <div className="pt-4 border-t border-white/[0.05] text-[11px] text-slate-400 leading-relaxed flex flex-col lg:flex-row lg:items-center justify-between gap-3 font-sans">
          <p>
            <strong className="text-slate-200 font-mono uppercase tracking-wider">NASA Data &amp; Branding Notice:</strong>{' '}
            Experiment records reference official publicly available NASA Physical Sciences Informatics (
            <a href="https://psi.nasa.gov" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              psi.nasa.gov
            </a>
            ) and NASA Technical Reports Server (
            <a href="https://ntrs.nasa.gov" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              ntrs.nasa.gov
            </a>
            ) archives. FLARE is an independent NASA Space Apps Challenge project by Team WUNDERBAO and is not an official NASA website.
          </p>
          <p className="lg:text-right shrink-0">
            <strong className="text-amber-300 font-mono uppercase tracking-wider">AI-Assisted Disclosure:</strong>{' '}
            Includes 3D educational illustrations in the Kids Universe and the FLARE AI Agent (powered by Gemini / local D² Law scientific engine).
          </p>
        </div>
      </footer>

      {/* Global Slide-Over AI Agent Drawer on Landing Page */}
      {showAI && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/65 backdrop-blur-sm">
          <div className="w-full max-w-[560px] h-[100dvh] bg-[#060c18] border-l border-slate-800/90 shadow-2xl flex flex-col">
            <AIAssistant
              activeRoute="home"
              pageContext={{
                selectedHeroRegime: currentRegime.label,
                gravity: currentRegime.gravity,
                oxygenPercent: currentRegime.oxygenPercent,
              }}
              onClose={() => setShowAI(false)}
            />
          </div>
        </div>
      )}
    </main>
  )
}
