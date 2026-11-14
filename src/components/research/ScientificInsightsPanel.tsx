'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  SCIENTIFIC_INSIGHTS,
  RESEARCH_QUESTIONS,
  RESEARCH_RESOURCES,
  type ScientificInsight,
  type ResearchQuestionGuide,
} from '@/data/researchLibrary'
import { NASA_EXPERIMENTS } from '@/data/nasaExperiments'

interface Props {
  onSelectExperiment?: (expId: string) => void
  onOpenLibraryResource?: (resId: string) => void
}

export default function ScientificInsightsPanel({
  onSelectExperiment,
}: Props) {
  const [selectedQuestion, setSelectedQuestion] = useState<ResearchQuestionGuide>(RESEARCH_QUESTIONS[0])
  const [selectedInsight, setSelectedInsight] = useState<ScientificInsight>(SCIENTIFIC_INSIGHTS[0])

  function handleSelectQuestion(rq: ResearchQuestionGuide) {
    setSelectedQuestion(rq)
    const linked = SCIENTIFIC_INSIGHTS.find(i => i.id === rq.relatedInsightId)
    if (linked) setSelectedInsight(linked)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#080e1a] p-6 space-y-8">
      {/* ── Top Banner: Integrity & Evidence Notice ── */}
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            background: 'rgba(6,182,212,0.06)',
            border: '1px solid rgba(6,182,212,0.22)',
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">💡</span>
              <span className="font-display text-xs font-bold uppercase tracking-wider text-cyan-400">
                Evidence-Backed Scientific Synthesis
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every insight below connects <strong className="text-emerald-400">Empirical NASA Investigation Findings</strong> with{' '}
              <strong className="text-purple-400">FLARE D² Law Model Interpretations</strong>. Model interpretations are analytical approximations and are always labeled distinctly from measured spacecraft or drop-tower data.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ✓ Empirical Evidence Cited
            </span>
            <span className="px-2.5 py-1 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
              ◈ Model Interpretation Labeled
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 1: Research Question Matcher ── */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
              1. Research Question Explorer
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Select a spacecraft fire safety question to identify relevant NASA investigations, literature sources, and physical relationships.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Question List (left 5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            {RESEARCH_QUESTIONS.map(rq => {
              const active = selectedQuestion.id === rq.id
              return (
                <button
                  key={rq.id}
                  onClick={() => handleSelectQuestion(rq)}
                  className="w-full text-left rounded-xl p-3.5 transition-all cursor-pointer"
                  style={{
                    background: active ? 'rgba(6,182,212,0.12)' : 'rgba(10,15,26,0.85)',
                    border: `1px solid ${active ? 'rgba(6,182,212,0.5)' : 'rgba(30,41,59,0.8)'}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">
                      {rq.domain}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                      {rq.evidenceBasis}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug">{rq.question}</p>
                </button>
              )
            })}
          </div>

          {/* Selected Question Breakdown (right 7 cols) */}
          <div className="lg:col-span-7 rounded-xl p-5 bg-[#0a0f1e] border border-[#1e293b] flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Selected Research Question
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Evidence Basis: <strong className="text-white">{selectedQuestion.evidenceBasis}</strong>
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-white leading-snug">
                {selectedQuestion.question}
              </h3>

              <div className="rounded-lg p-3.5 bg-[#080e1a] border border-slate-800">
                <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 mb-1">
                  Synthesis Answer
                </p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedQuestion.shortAnswer}
                </p>
              </div>

              {/* Relevant NASA Experiments */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-2">
                  Relevant NASA Investigations ({selectedQuestion.relevantExperimentIds.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedQuestion.relevantExperimentIds.map(expId => {
                    const exp = NASA_EXPERIMENTS.find(e => e.id === expId)
                    if (!exp) return null
                    return (
                      <button
                        key={expId}
                        onClick={() => onSelectExperiment?.(expId)}
                        className="text-left p-2.5 rounded-lg bg-[#080e1a] hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-xs font-bold text-white group-hover:text-cyan-300">
                            🛸 {exp.name}
                          </span>
                          <span className="font-mono text-[10px] text-cyan-400">Inspect →</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{exp.fullName}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {exp.platform.slice(0, 48)}…
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Relevant Library Sources */}
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mb-2">
                  Primary Literature &amp; NASA Sources
                </p>
                <div className="space-y-1.5">
                  {selectedQuestion.relevantResourceIds.map(resId => {
                    const res = RESEARCH_RESOURCES.find(r => r.id === resId)
                    if (!res) return null
                    return (
                      <div
                        key={resId}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#080e1a] border border-slate-800/80"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{res.title}</p>
                          <p className="text-[10px] font-mono text-slate-500 truncate">
                            {res.publisher} ({res.year})
                          </p>
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-2.5 py-1 rounded text-[10px] font-mono text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30"
                        >
                          Source ↗
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Deep-Dive Scientific Insights ── */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">
            2. Experiment–Simulation Synthesis Insights
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Explore how specific combustion parameters behave in real NASA experiments compared with FLARE&apos;s analytical D² Law model.
          </p>
        </div>

        {/* Insight Selector Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {SCIENTIFIC_INSIGHTS.map(item => {
            const active = selectedInsight.id === item.id
            return (
              <button
                key={item.id}
                onClick={() => setSelectedInsight(item)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  active
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50 shadow-lg'
                    : 'bg-[#0a0f1e] text-slate-400 border border-[#1e293b] hover:text-white'
                }`}
              >
                {item.categoryLabel}
              </button>
            )
          })}
        </div>

        {/* Selected Insight Full Detail Card */}
        <div className="rounded-2xl bg-[#0a0f1e] border border-[#1e293b] p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#1e293b] pb-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-orange-500/15 text-orange-400 border border-orange-500/30 mb-2">
                {selectedInsight.categoryLabel}
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                {selectedInsight.title}
              </h3>
              <p className="text-xs font-mono text-cyan-400 mt-1">
                Q: {selectedInsight.question}
              </p>
            </div>

            {/* Action links to Lab and Compare */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {selectedInsight.simulationLink && (
                <Link
                  href={`/science?fuel=${selectedInsight.simulationLink.fuel}&gravity=${selectedInsight.simulationLink.gravity}&o2=${selectedInsight.simulationLink.oxygenPercent}&pressure=${selectedInsight.simulationLink.pressure}&airflow=${selectedInsight.simulationLink.airflowVelocity}`}
                  className="px-3 py-2 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition-all"
                >
                  🔬 {selectedInsight.simulationLink.label}
                </Link>
              )}
              {selectedInsight.comparisonPreset && (
                <Link
                  href={`/compare?left=${selectedInsight.comparisonPreset.leftId}&right=${selectedInsight.comparisonPreset.rightId}`}
                  className="px-3 py-2 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/40 transition-all"
                >
                  ⚖️ {selectedInsight.comparisonPreset.label}
                </Link>
              )}
            </div>
          </div>

          {/* Core Summary */}
          <p className="text-sm text-slate-200 leading-relaxed">{selectedInsight.summary}</p>

          {/* Dual Comparison: Empirical NASA Evidence vs FLARE Model Interpretation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Empirical Evidence Box */}
            <div
              className="rounded-xl p-4 space-y-2"
              style={{
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.28)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  ✓ Measured NASA Experimental Findings
                </span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                  Empirical Source
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedInsight.experimentalFinding}
              </p>
            </div>

            {/* Model Interpretation Box */}
            <div
              className="rounded-xl p-4 space-y-2"
              style={{
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.28)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  ◈ FLARE Simulation Model Interpretation
                </span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">
                  D² Law Approximation
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedInsight.modelInterpretation}
              </p>
            </div>
          </div>

          {/* Limitations & Scope Boundary */}
          <div
            className="rounded-xl p-3.5 flex items-start gap-3"
            style={{
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.25)',
            }}
          >
            <span className="text-amber-400 text-sm shrink-0">⚠</span>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                Model Scope &amp; Limitations
              </span>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                {selectedInsight.limitationsNote}
              </p>
            </div>
          </div>

          {/* Evidence Citations Table */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-2.5">
              Supporting Evidence &amp; Source Attribution
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedInsight.evidence.map((ev, i) => {
                const isExp = ev.type === 'experimental-evidence'
                const isMod = ev.type === 'model-interpretation'
                const badgeColor = isExp ? '#10b981' : isMod ? '#c084fc' : '#38bdf8'
                const badgeText = isExp
                  ? 'NASA Experiment'
                  : isMod
                  ? 'Model Formulation'
                  : 'Literature / Report'

                return (
                  <div
                    key={i}
                    className="rounded-xl p-3.5 bg-[#080e1a] border border-slate-800 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[9px] font-mono mb-1.5"
                        style={{
                          background: `${badgeColor}15`,
                          color: badgeColor,
                          border: `1px solid ${badgeColor}35`,
                        }}
                      >
                        {badgeText}
                      </span>
                      <div className="text-xs font-semibold text-white mb-1">{ev.label}</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{ev.detail}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="font-mono text-[9px] text-slate-500 truncate">
                        {ev.sourceRef}
                      </span>
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 font-mono text-[9px] text-cyan-400 hover:underline"
                        >
                          Verify ↗
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

