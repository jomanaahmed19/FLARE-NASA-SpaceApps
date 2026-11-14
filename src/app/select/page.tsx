'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FlareLogo } from '@/components/ui/FlareLogo'
import { StarBorder } from '@/components/ui/reactbits/MotionPrimitives'
import AIAssistant from '@/components/science/AIAssistant'
import { AccessibilityTriggerButton } from '@/components/ui/AccessibilityControlModal'

export default function SelectPage() {
  const [showAI, setShowAI] = useState(false)

  return (
    <main className="relative flex min-h-screen flex-col bg-[#03050a] overflow-x-hidden">
      {/* ── Top Bar ── */}
      <header className="relative z-30 flex items-center justify-between border-b border-white/[0.08] bg-[#04070f]/90 backdrop-blur-md px-6 py-4 md:px-10">
        <Link href="/" aria-label="Back to FLARE home">
          <FlareLogo size="sm" />
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.22em] uppercase text-slate-300">
            {'// CHOOSE YOUR FLARE EXPERIENCE'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <AccessibilityTriggerButton variant="science" />

          <button
            type="button"
            onClick={() => setShowAI(true)}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 sm:px-3.5 py-1.5 min-h-[38px] font-sans text-xs font-medium text-cyan-200 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>AI Agent</span>
          </button>

          <Link
            href="/"
            className="font-mono text-xs tracking-[0.14em] uppercase text-slate-300 hover:text-white transition-colors py-1.5"
          >
            ← Overview
          </Link>
        </div>
      </header>

      {/* ── Split Dual-Universe Stage ── */}
      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">
        {/* ════════════════════════════════════════════════════════════════
            UNIVERSE 01 — SCIENTIFIC EXPERIENCE (Cinematic Obsidian Editorial)
        ════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65 }}
          aria-labelledby="sci-exp-heading"
          className="experience-panel relative flex flex-1 flex-col justify-between overflow-hidden bg-[#03050a] p-8 md:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/10 group"
        >
          {/* Subtle technical grid + radial combustion glow */}
          <div className="pointer-events-none absolute inset-0 scientific-grid opacity-30" />
          <div
            className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110"
            style={{
              background:
                'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(6,182,212,0.12) 55%, transparent 75%)',
            }}
          />

          {/* Top Telemetry Header */}
          <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="font-orbitron text-xs font-bold tracking-[0.25em] text-orange-400">
                {'// 01'}
              </span>
              <span className="h-px w-8 bg-orange-500/40" />
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-cyan-400">
                ORBITAL RESEARCH INSTRUMENTATION
              </span>
            </div>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-[11px] text-cyan-200">
              Researchers · Engineers · Students
            </span>
          </div>

          {/* Center Visual: Sculptural Microgravity Diffusion Sphere */}
          <div className="relative z-10 my-10 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="h-52 w-52 rounded-full border border-dashed border-orange-500/35 animate-slow-orbit" />
              <div className="absolute h-44 w-44 rounded-full border border-cyan-400/25" />
              <div
                className="absolute h-36 w-36 rounded-full transition-transform duration-500 group-hover:scale-105"
                style={{
                  background:
                    'radial-gradient(circle at 38% 38%, #ffffff 0%, #fb923c 35%, #ea580c 62%, #0284c7 85%, #03050a 100%)',
                  boxShadow:
                    '0 0 55px rgba(249, 115, 22, 0.38), inset 0 0 24px rgba(56, 189, 248, 0.45)',
                }}
              />
              <span className="absolute -left-28 top-4 hidden sm:block font-mono text-[11px] tracking-wider uppercase text-slate-300 tabular-nums">
                0.001g · SPHERICAL
              </span>
              <span className="absolute -right-28 bottom-4 hidden sm:block font-mono text-[11px] tracking-wider uppercase text-cyan-300 tabular-nums">
                T_MAX 1994 K
              </span>
            </div>
          </div>

          {/* Bottom Editorial Content */}
          <div className="relative z-10 max-w-xl">
            <h1
              id="sci-exp-heading"
              className="font-display text-3xl sm:text-5xl font-black tracking-tight uppercase text-white leading-[1.05]"
            >
              SCIENTIFIC
              <br />
              <span className="text-orange-400">EXPERIENCE</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              An advanced space-fire research workstation combining a 5-layer 3D combustion chamber, analytical D² Law physics, 16 official NASA investigations, multi-scenario benchmarking, and the context-aware FLARE Scientific AI Agent.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs text-slate-300">
              <span className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1">
                3D Chamber &amp; Telemetry
              </span>
              <span className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1">
                Saffire I–VI · FLEX-2 · BASS
              </span>
              <span className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1">
                Side-by-Side Comparison
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StarBorder color="rgba(249, 115, 22, 0.85)" speed="6s">
                <Link
                  href="/science"
                  className="inline-flex items-center gap-3 rounded-full border border-orange-500/60 bg-[#0c1324] hover:bg-orange-500/25 px-7 py-3.5 font-display text-xs sm:text-sm font-bold tracking-wider uppercase text-white transition-all"
                >
                  <span>Enter Simulation Lab</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </StarBorder>
              <Link
                href="/research"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3.5 font-display text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-200 hover:border-cyan-400/60 hover:text-cyan-300 transition-all"
              >
                <span>NASA Archive</span>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ════════════════════════════════════════════════════════════════
            UNIVERSE 02 — FLARE KIDS: THE LITTLE SCIENCE UNIVERSE
        ════════════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          aria-labelledby="kids-exp-heading"
          className="experience-panel relative flex flex-1 flex-col justify-between overflow-hidden bg-[#faf8f5] p-8 md:p-12 lg:p-14 group text-slate-900"
        >
          {/* Top Badge Row */}
          <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6b4a] font-mono text-xs font-black text-white shadow-sm">
                02
              </span>
              <span className="font-mono text-xs font-extrabold tracking-widest uppercase text-slate-800">
                THE LITTLE SCIENCE UNIVERSE
              </span>
            </div>
            <span className="rounded-full bg-[#071126] px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#fde047] shadow-sm">
              Kids · Classrooms · Families
            </span>
          </div>

          {/* Center Visual: Architectural Mini-Preview of the 3D Chamber & Astronaut */}
          <div className="relative z-10 my-8">
            <div className="grid grid-cols-1 sm:grid-cols-12 rounded-[28px] overflow-hidden border-2 border-slate-900/10 bg-[#071126] shadow-[0_24px_60px_rgba(7,17,38,0.18)]">
              <div
                className="sm:col-span-5 p-6 flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(155deg, #ff6b4a 0%, #f97316 100%)',
                }}
              >
                <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#071126]">
                  FLARE KIDS
                </span>
                <div className="my-2">
                  <p className="font-space-grotesk text-2xl font-black uppercase leading-[0.95] text-[#fef08a]">
                    BIG QUESTIONS.
                  </p>
                  <p className="font-space-grotesk text-2xl font-black uppercase leading-[0.95] text-[#071126] mt-0.5">
                    AMAZING SCIENCE.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#071126] px-3 py-1 font-mono text-[11px] font-bold text-[#fde047] w-fit">
                  <span>0g CHAMBER</span>
                  <span>→</span>
                </span>
              </div>

              <div className="sm:col-span-7 relative h-52 sm:h-auto overflow-hidden bg-[#08152e]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/kids/world-1-flame-chamber.png"
                  alt="3D illustration of a glowing spherical flame inside a transparent combustion chamber with an astronaut observer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 max-w-xl">
            <h2
              id="kids-exp-heading"
              className="font-space-grotesk text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.05]"
            >
              FLARE KIDS
              <br />
              <span className="text-[#f97316]">SCIENCE UNIVERSE</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
              A museum-grade interactive science education universe where curious minds explore 5 visual worlds — flames, oxygen, invisible airflow, orbital laboratories, and astronaut safety with Sparky the Space Flame Guide.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs font-bold">
              <span className="rounded-full bg-white border border-orange-300 px-3.5 py-1 text-orange-900">
                01 · Meet the Flame
              </span>
              <span className="rounded-full bg-white border border-sky-300 px-3.5 py-1 text-sky-900">
                02 · Oxygen Mystery
              </span>
              <span className="rounded-full bg-white border border-teal-300 px-3.5 py-1 text-teal-900">
                03 · Invisible Wind
              </span>
            </div>

            <div className="mt-8">
              <Link
                href="/kids"
                className="inline-flex items-center gap-3 rounded-full bg-[#071126] hover:bg-slate-900 px-7 py-4 font-space-grotesk text-xs sm:text-sm font-black uppercase tracking-wider text-[#fde047] shadow-[0_14px_34px_rgba(7,17,38,0.22)] transition-all"
              >
                <span>Explore the Science Universe</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fde047] text-[#071126] text-xs">
                  →
                </span>
              </Link>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-30 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] bg-[#04070f] px-6 md:px-10 py-4 font-mono text-xs text-slate-400">
        <p className="tracking-wider">
          FLARE — Fire &amp; Life-Safety Analysis and Risk Explorer · Team WUNDERBAO
        </p>
        <div className="flex flex-wrap items-center gap-5 tracking-widest uppercase text-[11px]">
          <Link href="/research" className="hover:text-cyan-400 transition-colors">
            Research Hub
          </Link>
          <Link href="/library" className="hover:text-emerald-400 transition-colors">
            Library
          </Link>
          <Link href="/insights" className="hover:text-amber-400 transition-colors">
            Insights
          </Link>
          <Link href="/compare" className="hover:text-orange-400 transition-colors">
            Compare
          </Link>
        </div>
      </footer>

      {/* Global Slide-Over AI Agent Drawer on Select Page */}
      {showAI && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/65 backdrop-blur-sm">
          <div className="w-full max-w-[560px] h-full bg-[#060c18] border-l border-slate-800/90 shadow-2xl flex flex-col">
            <AIAssistant
              activeRoute="select"
              onClose={() => setShowAI(false)}
            />
          </div>
        </div>
      )}
    </main>
  )
}
