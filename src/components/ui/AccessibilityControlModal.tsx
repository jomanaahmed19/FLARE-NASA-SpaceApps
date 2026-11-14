'use client'

import React, { useEffect, useState } from 'react'
import {
  useAccessibility,
  FONT_SCALE_MAP,
  type FontScaleStep,
  type ReducedMotionPref,
} from '@/context/AccessibilityContext'

export function AccessibilityTriggerButton({
  variant = 'science',
  compact = false,
}: {
  variant?: 'science' | 'kids'
  compact?: boolean
}) {
  const { openModal, hasCustomPrefs } = useAccessibility()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (variant === 'kids') {
    return (
      <button
        type="button"
        onClick={openModal}
        aria-label="Open Accessibility and Display Preferences"
        title="Accessibility & Display Preferences"
        className="relative inline-flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-2 min-h-[40px] text-xs font-extrabold text-white transition-colors cursor-pointer"
      >
        <svg
          className="w-4 h-4 text-[#fde047] shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          aria-hidden="true"
        >
          <circle cx="12" cy="4.5" r="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8.5h14M12 8.5v5m0 0l-3 6m3-6l3 6" />
        </svg>
        <span className={compact ? 'sr-only sm:not-sr-only' : 'hidden md:inline'}>
          Accessibility
        </span>
        {isHydrated && hasCustomPrefs && (
          <span
            className="h-2 w-2 rounded-full bg-[#fde047] ring-2 ring-[#071126]"
            aria-label="Custom accessibility settings active"
          />
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={openModal}
      aria-label="Open Accessibility and Display Preferences"
      title="Accessibility & Display Preferences"
      className="relative inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/90 bg-slate-900/90 hover:bg-slate-800 hover:border-cyan-400/50 px-2.5 sm:px-3 py-1.5 min-h-[38px] text-xs font-medium text-slate-200 transition-all cursor-pointer"
    >
      <svg
        className="w-4 h-4 text-cyan-400 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <circle cx="12" cy="4.5" r="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8.5h14M12 8.5v5m0 0l-3 6m3-6l3 6" />
      </svg>
      <span className={compact ? 'sr-only' : 'hidden xl:inline'}>A11y</span>
      {isHydrated && hasCustomPrefs && (
        <span
          className="h-2 w-2 rounded-full bg-amber-400"
          aria-label="Custom accessibility settings active"
        />
      )}
    </button>
  )
}

export function AccessibilityControlModal() {
  const {
    prefs,
    effectiveReducedMotion,
    hasCustomPrefs,
    isModalOpen,
    closeModal,
    updatePrefs,
    increaseTextSize,
    decreaseTextSize,
    resetTextSize,
    resetAllPreferences,
    getShareableUrl,
  } = useAccessibility()

  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!isModalOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isModalOpen, closeModal])

  if (!isModalOpen) return null

  const currentScaleInfo = FONT_SCALE_MAP[prefs.fontScale] ?? FONT_SCALE_MAP.default

  const handleCopyShareLink = async () => {
    const url = getShareableUrl()
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2600)
    } catch {
      // Fallback
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flare-a11y-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal()
      }}
    >
      <div className="w-full sm:max-w-xl max-h-[92dvh] sm:max-h-[88dvh] rounded-t-3xl sm:rounded-3xl bg-[#070d19] border border-slate-700/90 text-slate-100 shadow-[0_28px_90px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* ── Modal Header ── */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-[#091224]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                aria-hidden="true"
              >
                <circle cx="12" cy="4.5" r="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8.5h14M12 8.5v5m0 0l-3 6m3-6l3 6" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2
                id="flare-a11y-modal-title"
                className="font-display text-base sm:text-lg font-bold text-white truncate"
              >
                Global Accessibility &amp; Display Preferences
              </h2>
              <p className="text-xs text-slate-400">
                Applied immediately across Scientific Lab, NASA Archive, Kids Universe &amp; AI Agent
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close Accessibility Preferences"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable Controls Body ── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
          {/* 1. Text Size Scaling */}
          <section
            aria-labelledby="a11y-text-size-heading"
            className="rounded-2xl bg-[#0b1528] border border-slate-800 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3
                  id="a11y-text-size-heading"
                  className="font-display text-sm font-bold text-white"
                >
                  1. Global Text Size ({currentScaleInfo.label} · {currentScaleInfo.percent})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scales headings, body copy, scientific telemetry, and AI responses proportionally.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={decreaseTextSize}
                  disabled={prefs.fontScale === 'small'}
                  aria-label="Decrease text size"
                  className="min-h-[42px] px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 font-mono text-xs font-bold text-slate-200 cursor-pointer transition-colors"
                >
                  A−
                </button>
                <button
                  type="button"
                  onClick={resetTextSize}
                  aria-label="Reset text size to 100%"
                  className="min-h-[42px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 font-mono text-xs font-medium text-slate-300 cursor-pointer transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={increaseTextSize}
                  disabled={prefs.fontScale === 'xlarge'}
                  aria-label="Increase text size"
                  className="min-h-[42px] px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 font-mono text-xs font-bold text-cyan-300 cursor-pointer transition-colors"
                >
                  A+
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {(['small', 'default', 'large', 'xlarge'] as FontScaleStep[]).map((step) => {
                const info = FONT_SCALE_MAP[step]
                const active = prefs.fontScale === step
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => updatePrefs({ fontScale: step })}
                    aria-pressed={active}
                    className={`min-h-[44px] rounded-xl px-3 py-2 text-xs font-medium border transition-all cursor-pointer flex flex-col items-center justify-center ${
                      active
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold">{info.label}</span>
                    <span className="font-mono text-[10px] text-cyan-300">{info.percent}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* 2. Reduced Motion Control */}
          <section
            aria-labelledby="a11y-motion-heading"
            className="rounded-2xl bg-[#0b1528] border border-slate-800 p-4 space-y-3"
          >
            <div>
              <h3 id="a11y-motion-heading" className="font-display text-sm font-bold text-white">
                2. Motion &amp; Animation Control ({effectiveReducedMotion ? 'Reduced Motion Active' : 'Standard Motion'})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Controls decorative starfields, ReactBits motion borders, floating astronaut motion, and continuous 3D camera drift while preserving interactive simulation controls.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'system', label: 'System Default', desc: 'Follows OS setting' },
                  { id: 'on', label: 'Reduce Motion', desc: 'Calm static interface' },
                  { id: 'off', label: 'Full Motion', desc: 'All animations active' },
                ] as Array<{ id: ReducedMotionPref; label: string; desc: string }>
              ).map((opt) => {
                const active = prefs.reducedMotion === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updatePrefs({ reducedMotion: opt.id })}
                    aria-pressed={active}
                    className={`min-h-[48px] rounded-xl px-3.5 py-2.5 text-left border transition-all cursor-pointer ${
                      active
                        ? 'bg-cyan-500/20 border-cyan-400 text-white'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-[11px] text-slate-400">{opt.desc}</div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* 3. Visual & Interaction Toggle Cards */}
          <section
            aria-label="Visual and interaction accessibility toggles"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {/* High Contrast Mode */}
            <button
              type="button"
              onClick={() => updatePrefs({ highContrast: !prefs.highContrast })}
              aria-pressed={prefs.highContrast}
              className={`min-h-[76px] rounded-2xl p-4 text-left border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                prefs.highContrast
                  ? 'bg-amber-500/15 border-amber-400 text-white'
                  : 'bg-[#0b1528] border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="font-display text-sm font-bold">High Contrast Mode</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Sharpens text contrast, strengthens control borders, and underlines links without inverting scientific colors.
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                  prefs.highContrast
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {prefs.highContrast ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Enhanced Focus Visibility */}
            <button
              type="button"
              onClick={() => updatePrefs({ enhancedFocus: !prefs.enhancedFocus })}
              aria-pressed={prefs.enhancedFocus}
              className={`min-h-[76px] rounded-2xl p-4 text-left border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                prefs.enhancedFocus
                  ? 'bg-cyan-500/15 border-cyan-400 text-white'
                  : 'bg-[#0b1528] border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="font-display text-sm font-bold">Enhanced Focus Ring</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Adds a high-visibility 3px golden-yellow focus ring around active buttons, sliders, and links for keyboard navigation.
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                  prefs.enhancedFocus
                    ? 'bg-cyan-400 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {prefs.enhancedFocus ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Larger Interactive Controls */}
            <button
              type="button"
              onClick={() => updatePrefs({ largeControls: !prefs.largeControls })}
              aria-pressed={prefs.largeControls}
              className={`min-h-[76px] rounded-2xl p-4 text-left border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                prefs.largeControls
                  ? 'bg-emerald-500/15 border-emerald-400 text-white'
                  : 'bg-[#0b1528] border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="font-display text-sm font-bold">Larger Touch Controls</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Expands interactive buttons, tabs, and parameter sliders to 48px+ targets for easier tapping on mobile screens.
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                  prefs.largeControls
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {prefs.largeControls ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Reading-Friendly Spacing */}
            <button
              type="button"
              onClick={() => updatePrefs({ readableSpacing: !prefs.readableSpacing })}
              aria-pressed={prefs.readableSpacing}
              className={`min-h-[76px] rounded-2xl p-4 text-left border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                prefs.readableSpacing
                  ? 'bg-purple-500/15 border-purple-400 text-white'
                  : 'bg-[#0b1528] border-slate-800 text-slate-200 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="font-display text-sm font-bold">Reading-Friendly Spacing</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Increases line height, letter spacing, and word spacing across NASA research cards, kids stories, and AI reports.
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                  prefs.readableSpacing
                    ? 'bg-purple-400 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {prefs.readableSpacing ? 'ON' : 'OFF'}
              </span>
            </button>
          </section>

          {/* 4. Synchronization & Portable Cross-Device Link */}
          <section className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-xs font-semibold text-emerald-300">
                  Instant Cross-Tab Sync Active
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Preferences save automatically in this browser and sync live across open FLARE tabs. Since FLARE requires no user login, use a portable profile link to open your exact settings on another phone or computer.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="shrink-0 min-h-[42px] px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 font-mono text-xs font-semibold text-cyan-200 transition-colors cursor-pointer"
            >
              {copiedLink ? '✓ Profile Link Copied' : '🔗 Copy Portable Link'}
            </button>
          </section>
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#091224] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetAllPreferences}
            disabled={!hasCustomPrefs}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            ↺ Reset All to Default
          </button>

          <button
            type="button"
            onClick={closeModal}
            className="min-h-[42px] px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Done · Apply Everywhere
          </button>
        </div>
      </div>
    </div>
  )
}

