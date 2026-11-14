'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScientificHeader } from '@/components/ui/ScientificHeader'
import { NASA_EXPERIMENTS } from '@/data/nasaExperiments'
import { SIMULATION_SCENARIOS } from '@/data/simulationScenarios'
import { compareItems, type ComparisonItem, type ComparisonResult } from '@/lib/comparison/comparisonEngine'
import type { AISection } from '@/app/api/ai-chat/route'
import ComparisonSelector from './ComparisonSelector'
import ComparisonTable from './ComparisonTable'
import ComparisonCharts from './ComparisonCharts'
import ComparisonExport from './ComparisonExport'

type ViewMode = 'table' | 'charts'

const PRESET_COMPARISONS = [
  {
    label: 'NASA vs NASA: Saffire-I vs BASS',
    tag: 'Scale & Platform',
    leftId: 'saffire-1',
    rightId: 'bass',
  },
  {
    label: 'Sim vs Sim: Microgravity vs Earth (1g)',
    tag: 'Gravity Regime',
    leftId: 'sim-microgravity-baseline',
    rightId: 'sim-earth-baseline',
  },
  {
    label: 'NASA vs Sim: BASS vs ISS Ventilation',
    tag: 'Exp vs Model',
    leftId: 'bass',
    rightId: 'sim-iss-ventilation',
  },
  {
    label: 'Sim vs Sim: 21% O₂ vs 30% Enriched O₂',
    tag: 'O₂ Hazard',
    leftId: 'sim-microgravity-baseline',
    rightId: 'sim-microgravity-enriched-o2',
  },
]

export default function ComparisonExplorer() {
  const [leftId, setLeftId] = useState<string | null>('sim-microgravity-baseline')
  const [rightId, setRightId] = useState<string | null>('sim-earth-baseline')
  const [view, setView] = useState<ViewMode>('table')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiSections, setAiSections] = useState<AISection[] | null>(null)
  const [aiIsDemo, setAiIsDemo] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)

  const allItems: ComparisonItem[] = useMemo(() => [
    ...NASA_EXPERIMENTS,
    ...SIMULATION_SCENARIOS,
  ], [])

  // Synchronize with URL query parameters (?left=...&right=...) on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams(window.location.search)
    const l = sp.get('left')
    const r = sp.get('right')
    if (l && allItems.some(i => i.id === l)) setLeftId(l)
    if (r && allItems.some(i => i.id === r)) setRightId(r)
  }, [allItems])

  const findItem = (id: string | null) =>
    id ? allItems.find(i => i.id === id) ?? null : null

  const leftItem = findItem(leftId)
  const rightItem = findItem(rightId)

  const result: ComparisonResult | null = useMemo(() => {
    if (!leftItem || !rightItem) return null
    return compareItems(leftItem, rightItem)
  }, [leftItem, rightItem])

  function applyPreset(l: string, r: string) {
    setLeftId(l)
    setRightId(r)
    setAiOpen(false)
    setAiSections(null)
  }

  function buildDeterministicComparisonSections(res: ComparisonResult): AISection[] {
    const sigDiffs = res.diffs.filter(d => d.significant)
    const diffList = sigDiffs.length > 0
      ? sigDiffs.map(d => `${d.label} (${d.left.display} vs. ${d.right.display})`).join('; ')
      : 'Both configurations share broadly comparable boundary conditions'

    return [
      {
        id: 'observe',
        label: 'What We Observe',
        icon: '👁',
        text: `${res.summaryText} Primary parameter differences include: ${diffList}.`,
      },
      {
        id: 'explain',
        label: 'Scientific Explanation',
        icon: '🔬',
        text: sigDiffs.length > 0
          ? sigDiffs.map(d => `${d.label}: ${d.explanation}`).join(' ')
          : 'When gravity, oxygen concentration, pressure, and airflow match closely, oxidizer transport and Stoichiometric heat release follow similar regimes.',
      },
      {
        id: 'evidence',
        label: 'Supporting Evidence',
        icon: '📊',
        text: `${res.left.name} (${res.left.itemType === 'nasa' ? 'NASA experimental record' : 'FLARE D² Law model'}) is compared against ${res.right.name} (${res.right.itemType === 'nasa' ? 'NASA experimental record' : 'FLARE D² Law model'}). ${res.compatibility.reasons.join(' ')}`,
      },
      {
        id: 'limits',
        label: 'Uncertainty & Limitations',
        icon: '⚠',
        text: [
          ...res.compatibility.caveats,
          ...res.left.warnings.slice(0, 1),
          ...res.right.warnings.slice(0, 1),
        ].join(' ') || 'FLARE simulation values are D² Law spherical approximations and cannot directly replace multi-dimensional CFD or full-scale hardware tests.',
      },
      {
        id: 'next',
        label: 'Suggested Next Exploration',
        icon: '🚀',
        text: 'Switch to the Charts tab to inspect relative parameter scaling, or export the comparison report (.json / .txt) to document boundary condition differences and caveats.',
      },
    ]
  }

  async function askAI() {
    if (!result) return
    setAiLoading(true)
    setAiOpen(true)
    setAiSections(null)

    const ctxPrompt = `Compare these two combustion scenarios in FLARE:
LEFT: "${result.left.name}" (${result.left.itemType === 'nasa' ? 'NASA Experiment' : 'FLARE D² Law Simulation'}) — Fuel: ${result.left.fuel.display}, O₂: ${result.left.oxygenPercent.display}, Pressure: ${result.left.pressureAtm.display}, Airflow: ${result.left.airflowVelocity.display}, Gravity: ${result.left.gravity.display}.
RIGHT: "${result.right.name}" (${result.right.itemType === 'nasa' ? 'NASA Experiment' : 'FLARE D² Law Simulation'}) — Fuel: ${result.right.fuel.display}, O₂: ${result.right.oxygenPercent.display}, Pressure: ${result.right.pressureAtm.display}, Airflow: ${result.right.airflowVelocity.display}, Gravity: ${result.right.gravity.display}.
Compatibility: ${result.compatibility.level}. Key differences: ${result.diffs.filter(d => d.significant).map(d => d.label).join(', ') || 'Minimal'}. Caveats: ${result.compatibility.caveats.join(' | ')}`

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: ctxPrompt,
          mode: 'science',
          context: {
            fuel: result.left.fuel.display,
            gravity: result.left.gravity.value ?? 0.001,
            gravityLabel: result.left.gravity.display,
            oxygenPercent: result.left.oxygenPercent.value ?? 21,
            pressure: result.left.pressureAtm.value ?? 1.0,
            airflowVelocity: result.left.airflowVelocity.value ?? 0,
            status: 'comparison',
          },
        }),
      })
      const data = await res.json()
      setAiIsDemo(Boolean(data.isDemo))
      if (data.isDemo) {
        // Use deterministic comparison-specific sections so demo mode explicitly references both selected items
        setAiSections(buildDeterministicComparisonSections(result))
      } else if (Array.isArray(data.sections) && data.sections.length > 0) {
        setAiSections(data.sections)
      } else {
        setAiSections(buildDeterministicComparisonSections(result))
      }
    } catch {
      setAiIsDemo(true)
      setAiSections(buildDeterministicComparisonSections(result))
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 font-sans">
      {/* Unified Scientific Header */}
      <div className="sticky top-0 z-30">
        <ScientificHeader
          activeRoute="compare"
          workspaceSubtitle="Multi-Scenario Benchmarking & Provenance Analysis"
          pageContext={{
            leftScenario: leftItem?.name ?? null,
            rightScenario: rightItem?.name ?? null,
            compatibility: result?.compatibility.level ?? null,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {/* Page intro */}
        <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs font-semibold tracking-wider uppercase text-cyan-400 mb-1.5">
              Experimental vs. Analytical Telemetry
            </p>
            <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight text-white mb-2">
              Scientific Scenario Comparison
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Benchmark two NASA microgravity experiments, two D² Law simulation scenarios, or a NASA investigation alongside a compatible analytical scenario.
            </p>
          </div>
          <div className="inline-flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-200 text-xs max-w-md leading-relaxed">
            <svg className="w-4 h-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Measured NASA data, D² Law model estimates, and literature values carry explicit provenance badges.
            </span>
          </div>
        </div>

        {/* Quick Preset Comparisons */}
        <div className="mb-6">
          <div className="text-xs font-mono uppercase tracking-wider text-white/40 mb-2">
            Quick Comparison Presets:
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_COMPARISONS.map(preset => {
              const active = leftId === preset.leftId && rightId === preset.rightId
              return (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.leftId, preset.rightId)}
                  className={`min-h-[38px] flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
                    active
                      ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-sm'
                      : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/25'
                  }`}
                >
                  <span className="font-medium">{preset.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                    {preset.tag}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ComparisonSelector
            side="left"
            selectedId={leftId}
            onSelect={id => { setLeftId(id); setAiOpen(false) }}
            allItems={allItems}
            otherId={rightId}
          />
          <ComparisonSelector
            side="right"
            selectedId={rightId}
            onSelect={id => { setRightId(id); setAiOpen(false) }}
            allItems={allItems}
            otherId={leftId}
          />
        </div>

        {/* Result area */}
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-white/30 border border-dashed border-white/10 rounded-2xl"
            >
              <div className="text-5xl mb-4">⚖️</div>
              <p className="font-space-grotesk text-lg text-white/50">Select items on both sides or choose a preset above to begin</p>
              <p className="text-sm mt-2">Compare NASA experiments, FLARE simulation scenarios, or a compatible experiment-simulation pair</p>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Compatibility banner */}
              <CompatibilityBanner result={result} />

              {/* Controls bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                  {(['table', 'charts'] as ViewMode[]).map(v => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                        view === v
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {v === 'table' ? '📋 Parameter Table' : '📊 Visual Charts'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={askAI}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/40 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  <span>🤖</span>
                  {aiLoading ? 'Analyzing Comparison…' : 'Explain Comparison with AI'}
                </button>
                <div className="ml-auto">
                  <ComparisonExport result={result} />
                </div>
              </div>

              {/* AI Answer */}
              <AnimatePresence>
                {aiOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-orange-400 font-medium text-sm">
                          <span>🤖</span> FLARE Scientific Assistant — Comparison Analysis
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              aiIsDemo
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            }`}
                          >
                            {aiIsDemo ? 'DEMO MODE (DETERMINISTIC)' : 'LIVE AI'}
                          </span>
                        </div>
                        <button onClick={() => setAiOpen(false)} className="text-white/30 hover:text-white text-xs">✕ close</button>
                      </div>
                      {aiLoading ? (
                        <div className="flex items-center gap-3 text-white/50 text-sm">
                          <div className="w-4 h-4 border-2 border-orange-500/50 border-t-orange-500 rounded-full animate-spin" />
                          Generating scientific comparison analysis…
                        </div>
                      ) : aiSections ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {aiSections.map(sec => (
                            <div key={sec.id} className="bg-[#080e1a]/70 border border-white/10 rounded-lg p-3.5">
                              <div className="text-xs font-mono uppercase tracking-wider text-orange-300 mb-1.5 flex items-center gap-1.5">
                                <span>{sec.icon}</span>
                                <span>{sec.label}</span>
                              </div>
                              <p className="text-white/80 text-xs leading-relaxed">{sec.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main content */}
              {view === 'table' ? (
                <ComparisonTable result={result} />
              ) : (
                <ComparisonCharts result={result} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Compatibility Banner ──────────────────────────────────────────────────────

function CompatibilityBanner({ result }: { result: ComparisonResult }) {
  const { compatibility } = result
  const cfg = {
    direct: { icon: '✅', label: 'Direct Comparison', border: 'border-green-500/30', bg: 'bg-green-500/5', text: 'text-green-400' },
    cautious: { icon: 'ℹ️', label: 'Comparable with Caveats', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5', text: 'text-cyan-400' },
    limited: { icon: '⚠️', label: 'Limited Comparison — Do Not Treat as Equivalent', border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400' },
    incompatible: { icon: '🚫', label: 'Incompatible Conditions — Do Not Equate', border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-400' },
  }[compatibility.level]

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm ${cfg.text} mb-1`}>{cfg.label}</div>
          <div className="text-white/70 text-sm space-y-1">
            {compatibility.reasons.map((r, i) => <p key={i}>{r}</p>)}
          </div>
          {compatibility.caveats.length > 0 && (
            <div className="mt-2 space-y-1">
              {compatibility.caveats.map((c, i) => (
                <p key={i} className="text-white/40 text-xs">• {c}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
