'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FlareLogo } from '@/components/ui/FlareLogo'
import AIAssistant from '@/components/science/AIAssistant'
import { AccessibilityTriggerButton } from '@/components/ui/AccessibilityControlModal'

export type ScientificRoute = 'science' | 'research' | 'library' | 'insights' | 'compare'

interface ScientificHeaderProps {
  activeRoute: ScientificRoute
  workspaceSubtitle?: string
  centerSlot?: React.ReactNode
  rightActionsSlot?: React.ReactNode
  pageContext?: Record<string, unknown>
}

const NAV_ITEMS: { id: ScientificRoute; label: string; shortLabel: string; href: string }[] = [
  { id: 'science',  label: 'Simulation Lab',      shortLabel: 'Sim Lab',  href: '/science' },
  { id: 'research', label: 'NASA Research',       shortLabel: 'Research', href: '/research' },
  { id: 'library',  label: 'Research Library',    shortLabel: 'Library',  href: '/library' },
  { id: 'insights', label: 'Scientific Insights', shortLabel: 'Insights', href: '/insights' },
  { id: 'compare',  label: 'Compare Data',        shortLabel: 'Compare',  href: '/compare' },
]

export function ScientificHeader({
  activeRoute,
  workspaceSubtitle,
  centerSlot,
  rightActionsSlot,
  pageContext,
}: ScientificHeaderProps) {
  const [showGlobalAI, setShowGlobalAI] = useState(false)

  return (
    <>
      <header className="shrink-0 z-30 border-b border-slate-800/80 bg-[#050914]/95 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 lg:px-6 h-13 sm:h-14 py-2 sm:py-0">
          {/* Left: Brand + Experience Badge + Workspace Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link href="/" className="shrink-0 focus:outline-none">
              <FlareLogo size="xs" />
            </Link>

            <div className="hidden xl:block h-4 w-px bg-slate-800 shrink-0" />

            <div className="hidden xl:flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Scientific
              </span>
              {workspaceSubtitle && (
                <span className="hidden 2xl:inline text-xs font-medium text-slate-400 truncate max-w-[200px]">
                  {workspaceSubtitle}
                </span>
              )}
            </div>
          </div>

          {/* Center: Primary Scientific Navigation (Desktop / Tablet >= md) */}
          <nav
            aria-label="Scientific Experience Navigation"
            className="hidden md:flex items-center gap-1 bg-[#0a1020] p-1 rounded-xl border border-slate-800/90 shrink-0"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeRoute === item.id
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-2.5 lg:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.shortLabel}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right: Contextual Slot + AI Agent Trigger + Experience Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {centerSlot && <div className="hidden 2xl:flex items-center">{centerSlot}</div>}
            {rightActionsSlot}

            <AccessibilityTriggerButton variant="science" />

            {activeRoute !== 'science' && (
              <button
                type="button"
                onClick={() => setShowGlobalAI((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  showGlobalAI
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-cyan-500/30'
                }`}
                title="Open FLARE Scientific AI Agent"
              >
                <span>🔬</span>
                <span className="hidden sm:inline">AI Agent</span>
              </button>
            )}

            <div className="hidden sm:block h-4 w-px bg-slate-800 mx-0.5" />

            {/* Direct Experience Switcher to Kids Universe & Dual Selector */}
            <Link
              href="/kids"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all whitespace-nowrap"
              title="Switch to FLARE Kids — The Little Science Universe"
            >
              <span className="text-amber-400">✦</span>
              <span className="hidden lg:inline">Kids Experience</span>
              <span className="lg:hidden">Kids</span>
            </Link>

            <Link
              href="/select"
              className="hidden xl:inline-flex items-center px-2.5 py-1.5 min-h-[38px] rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Open Experience Selector"
            >
              Switch Mode
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Row (< md) with touch-friendly pills */}
        <nav
          aria-label="Mobile Scientific Navigation"
          className="flex md:hidden items-center justify-between gap-1.5 px-3 py-2 border-t border-slate-800/80 bg-[#070c18] overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex-1 min-h-[38px] flex items-center justify-center text-center px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.shortLabel}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Global Slide-Over AI Agent Drawer for /research, /library, /insights, /compare */}
      {showGlobalAI && activeRoute !== 'science' && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/65 backdrop-blur-sm">
          <div className="w-full max-w-[560px] h-[100dvh] bg-[#060c18] border-l border-slate-800/90 shadow-2xl flex flex-col">
            <AIAssistant
              activeRoute={activeRoute}
              pageContext={pageContext}
              onClose={() => setShowGlobalAI(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
