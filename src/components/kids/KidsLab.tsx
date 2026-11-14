'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import KidsHome from './KidsHome'
import KidsExperiment from './KidsExperiment'
import KidsLearnCards, {
  type KidsTopicId,
  normalizeWorldId,
} from './KidsLearnCards'
import KidsAskSparky from './KidsAskSparky'
import type { KidsWorldId } from '@/data/kidsWorlds'
import { AccessibilityTriggerButton } from '@/components/ui/AccessibilityControlModal'

type Section = 'home' | 'world' | 'experiment' | 'ask'

const NAV_ITEMS: Array<{
  id: Section
  label: string
  sublabel: string
}> = [
  {
    id: 'home',
    label: 'Science Universe',
    sublabel: 'Overview',
  },
  {
    id: 'world',
    label: '5 Science Worlds',
    sublabel: 'Guided Stories',
  },
  {
    id: 'experiment',
    label: 'Chamber Sandbox',
    sublabel: 'Live Controls',
  },
  {
    id: 'ask',
    label: 'Ask Sparky',
    sublabel: 'Science Q&A',
  },
]

function KidsBrandMark({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 text-left group cursor-pointer"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-md transition-transform group-hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #ff6b4a 0%, #facc15 100%)',
        }}
      >
        <svg viewBox="0 0 20 24" width="18" height="22" aria-hidden="true">
          <path
            d="M10 2 C10 2 16 8 16 14 C16 18 13 22 10 22 C7 22 4 18 4 14 C4 8 10 2 10 2Z"
            fill="#071126"
          />
          <circle cx="10" cy="14.5" r="3.5" fill="#fde047" />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-space-grotesk text-base font-black tracking-tight text-white">
            FLARE
          </span>
          <span className="rounded-full bg-[#ff6b4a] px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest text-white">
            KIDS
          </span>
        </div>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-sky-300/80 hidden sm:inline">
          THE LITTLE SCIENCE UNIVERSE
        </span>
      </div>
    </button>
  )
}

export default function KidsLab() {
  const [section, setSection] = useState<Section>(() => {
    if (typeof window === 'undefined') return 'home'
    const params = new URLSearchParams(window.location.search)
    if (params.get('world')) return 'world'
    const viewParam = params.get('view') as Section | null
    if (
      viewParam === 'world' ||
      viewParam === 'experiment' ||
      viewParam === 'ask' ||
      viewParam === 'home'
    ) {
      return viewParam
    }
    return 'home'
  })
  const [selectedWorldId, setSelectedWorldId] = useState<KidsWorldId>(() => {
    if (typeof window === 'undefined') return 'meet-the-flame'
    const params = new URLSearchParams(window.location.search)
    const worldParam = params.get('world') as KidsWorldId | null
    return worldParam ? normalizeWorldId(worldParam) : 'meet-the-flame'
  })
  const [expFocus, setExpFocus] = useState<'gravity' | 'oxygen' | 'fuel'>(
    'gravity'
  )
  const [kidsGravity, setKidsGravity] = useState<'space' | 'earth'>('space')
  const [kidsO2, setKidsO2] = useState<'low' | 'normal' | 'high'>('normal')
  const [kidsFuel, setKidsFuel] = useState<'cloth' | 'paper' | 'plastic'>(
    'cloth'
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view') as Section | null
    if (
      !params.get('world') &&
      (viewParam === 'world' ||
        viewParam === 'experiment' ||
        viewParam === 'ask' ||
        viewParam === 'home')
    ) {
      setSection(viewParam)
    }
  }, [])

  const handleSelectWorld = (worldId: KidsWorldId) => {
    setSelectedWorldId(worldId)
    setSection('world')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenLab = (
    focus: 'gravity' | 'oxygen' | 'fuel' = 'gravity',
    gravity?: 'space' | 'earth',
    o2?: 'low' | 'normal' | 'high'
  ) => {
    setExpFocus(focus)
    if (gravity) setKidsGravity(gravity)
    if (o2) setKidsO2(o2)
    setSection('experiment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenTopics = (topicId?: KidsTopicId) => {
    setSelectedWorldId(normalizeWorldId(topicId))
    setSection('world')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-900 selection:bg-orange-200 selection:text-slate-900 max-w-full overflow-x-hidden">
      {/* ── Museum-Grade Cosmic Navigation Header (#071126) ── */}
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-white/10 bg-[#071126]/95 px-3 sm:px-8 py-2.5 sm:py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link
            href="/select"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors"
          >
            <span>←</span>
            <span className="hidden sm:inline">Switch Experience</span>
          </Link>
          <div className="h-5 w-px bg-white/15 hidden sm:block" />
          <KidsBrandMark onClick={() => setSection('home')} />
        </div>

        {/* Center Navigation Pills — scrollable on ultra-narrow screens */}
        <nav
          aria-label="FLARE Kids Universe navigation"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full py-1 scrollbar-none"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = section === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSection(item.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`shrink-0 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#fde047] text-[#071126] shadow-[0_4px_16px_rgba(250,204,21,0.3)]'
                    : 'bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right Actions: Accessibility + Cross-Link to Scientific Lab */}
        <div className="flex items-center gap-2">
          <AccessibilityTriggerButton variant="kids" />

          <Link
            href="/science"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 hover:bg-sky-500/20 px-4 py-2 min-h-[40px] font-mono text-xs font-bold text-sky-200 transition-colors"
          >
            <span>Scientific Lab</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* ── Main Content Stage ── */}
      <main className="flex-1 flex flex-col">
        {section === 'home' && (
          <KidsHome
            onSelectWorld={handleSelectWorld}
            onOpenLab={handleOpenLab}
            onOpenSparky={() => {
              setSection('ask')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}

        {section === 'world' && (
          <KidsLearnCards
            initialTopic={selectedWorldId}
            onBackHome={() => {
              setSection('home')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onSelectWorld={(id) => setSelectedWorldId(id)}
            onTryInLab={(focus, grav, o2Val) => handleOpenLab(focus, grav, o2Val)}
          />
        )}

        {section === 'experiment' && (
          <div className="bg-[#f0f6fc] flex-1 py-8 sm:py-12">
            <KidsExperiment
              initialSection={expFocus}
              gravity={kidsGravity}
              onGravityChange={setKidsGravity}
              o2={kidsO2}
              onO2Change={setKidsO2}
              fuel={kidsFuel}
              onFuelChange={setKidsFuel}
              onOpenTopics={handleOpenTopics}
            />
          </div>
        )}

        {section === 'ask' && (
          <div className="bg-[#faf8f5] flex-1 py-8 sm:py-12">
            <KidsAskSparky
              gravity={kidsGravity}
              o2Level={kidsO2}
              fuel={kidsFuel}
              selectedWorldId={selectedWorldId}
              onSelectWorld={handleSelectWorld}
              onOpenLab={handleOpenLab}
            />
          </div>
        )}
      </main>

      {/* ── Non-Intrusive Floating Sparky AI Guide Pill (when not on Ask tab) ── */}
      {section !== 'ask' && (
        <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 sm:right-5 z-40">
          <button
            type="button"
            onClick={() => {
              setSection('ask')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            aria-label="Open Sparky AI Science Guide"
            className="group flex items-center gap-2.5 rounded-full bg-[#071126] hover:bg-[#0f1f3d] text-white pl-3 pr-4 py-2.5 border-2 border-[#fde047] shadow-[0_14px_34px_rgba(7,17,38,0.45)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer animate-gentle-float min-h-[48px]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b4a] to-[#fde047] text-[#071126] text-base font-black shadow-sm">
              ✦
            </span>
            <span className="flex flex-col text-left">
              <span className="font-space-grotesk text-xs font-black tracking-wide text-[#fde047] leading-tight">
                Ask Sparky AI
              </span>
              <span className="font-mono text-[10px] font-bold text-sky-200 leading-tight">
                Space Science Guide
              </span>
            </span>
          </button>
        </div>
      )}

      {/* ── Museum-Grade Educational Footer (#071126) ── */}
      <footer className="bg-[#071126] border-t border-white/10 px-6 py-8 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="font-space-grotesk font-black text-white tracking-wide">
              FLARE KIDS — THE LITTLE SCIENCE UNIVERSE
            </span>
            <span className="hidden sm:inline text-white/25">|</span>
            <span className="text-slate-400">
              Powered by FLARE&apos;s D² Law Combustion Model &amp; Verified NASA ISS Research
            </span>
          </div>
          <div className="flex items-center gap-5 font-bold text-sky-300">
            <Link href="/research" className="hover:text-white transition-colors">
              NASA Research Archive →
            </Link>
            <Link href="/science" className="hover:text-white transition-colors">
              Scientific Lab →
            </Link>
            <Link href="/select" className="hover:text-white transition-colors">
              Experience Selector →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
