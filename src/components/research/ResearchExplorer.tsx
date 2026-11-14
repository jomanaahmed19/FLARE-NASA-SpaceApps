'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ScientificHeader } from '@/components/ui/ScientificHeader'
import {
  NASA_EXPERIMENTS,
  PROGRAM_META,
  ALL_CATEGORIES,
  searchExperiments,
  type NASAExperiment,
  type ProgramKey,
  type ExperimentCategory,
  type DataAvailability,
} from '@/data/nasaExperiments'
import { RESEARCH_RESOURCES, SCIENTIFIC_INSIGHTS } from '@/data/researchLibrary'
import ResearchLibraryPanel from './ResearchLibraryPanel'
import ScientificInsightsPanel from './ScientificInsightsPanel'

export type ResearchTab = 'experiments' | 'library' | 'insights'

// ─── Badge Components ─────────────────────────────────────────────────────────

function ProgramBadge({ program }: { program: ProgramKey }) {
  const meta = PROGRAM_META[program]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest"
      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30` }}
    >
      {meta.label}
    </span>
  )
}

function DataBadge({ availability }: { availability: DataAvailability }) {
  const configs: Record<DataAvailability, { label: string; color: string; bg: string; icon: string }> = {
    'psi-dataset':      { label: 'NASA PSI Dataset', color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '✓' },
    'partial-psi':      { label: 'Partial PSI Data', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '◑' },
    'literature-only':  { label: 'Literature Only',  color: '#6b7280', bg: 'rgba(107,114,128,0.1)',icon: '📄' },
    'restricted':       { label: 'Restricted Data',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: '🔒' },
  }
  const c = configs[availability]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono tracking-wide"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}
    >
      <span>{c.icon}</span>
      {c.label}
    </span>
  )
}

function StatusDot({ status }: { status: NASAExperiment['status'] }) {
  const c = status === 'completed' ? '#64748b' : status === 'ongoing' ? '#10b981' : '#f59e0b'
  return (
    <span className="flex items-center gap-1 text-[9px] font-mono" style={{ color: c }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: c }} />
      {status.toUpperCase()}
    </span>
  )
}

// ─── Experiment Card ──────────────────────────────────────────────────────────

function ExperimentCard({
  exp,
  selected,
  onClick,
}: {
  exp: NASAExperiment
  selected: boolean
  onClick: () => void
}) {
  const meta = PROGRAM_META[exp.program]
  const categoryInfo = ALL_CATEGORIES.find(c => c.id === exp.category)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-4 transition-all duration-200 cursor-pointer group"
      style={{
        background: selected ? `${meta.color}10` : 'rgba(10,15,26,0.8)',
        border: `1px solid ${selected ? meta.color + '50' : 'rgba(30,41,59,0.8)'}`,
        boxShadow: selected ? `0 0 20px ${meta.color}15` : 'none',
      }}
      onMouseEnter={e => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.borderColor = meta.color + '35'
          ;(e.currentTarget as HTMLElement).style.background = `${meta.color}08`
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.8)'
          ;(e.currentTarget as HTMLElement).style.background = 'rgba(10,15,26,0.8)'
        }
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <ProgramBadge program={exp.program} />
          {exp.series && (
            <span className="text-[9px] font-mono text-slate-500">Series {exp.series}</span>
          )}
        </div>
        <StatusDot status={exp.status} />
      </div>

      {/* Name */}
      <h3 className="font-display text-base font-bold text-white mb-1 leading-snug">
        {exp.name}
      </h3>
      <p className="text-xs font-medium text-slate-400 mb-2 leading-snug">
        {exp.fullName}
      </p>

      {/* Objective excerpt */}
      <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
        {exp.objective.slice(0, 130)}…
      </p>

      {/* Meta chips */}
      <div className="flex items-center flex-wrap gap-1.5">
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 tabular-nums">
          {exp.years.start}{exp.years.end && exp.years.end !== exp.years.start ? `–${exp.years.end}` : ''}
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
          {categoryInfo?.emoji} {categoryInfo?.label}
        </span>
        <DataBadge availability={exp.dataAvailability} />
        {exp.simulationLink && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(6,182,212,0.12)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)' }}>
            🔬 Simulable
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Experiment Detail Panel ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">{children}</p>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </div>
  )
}

function ExperimentDetail({ exp, onClose }: { exp: NASAExperiment; onClose: () => void }) {
  const meta = PROGRAM_META[exp.program]
  const categoryInfo = ALL_CATEGORIES.find(c => c.id === exp.category)

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: '#060c18' }}>
      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10 px-4 sm:px-5 py-3.5 sm:py-4 shrink-0"
        style={{ background: '#080f1c', borderBottom: `1px solid ${meta.color}20` }}
      >
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:text-white mb-2 cursor-pointer"
        >
          <span>←</span>
          <span>Back to Investigations</span>
        </button>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <ProgramBadge program={exp.program} />
              <StatusDot status={exp.status} />
              <DataBadge availability={exp.dataAvailability} />
            </div>
            <h2 className="font-display text-lg font-bold text-white leading-snug mb-1">
              {exp.fullName}
            </h2>
            <p className="font-mono text-xs text-slate-400">
              {exp.acronym} · {exp.years.start}
              {exp.years.end && exp.years.end !== exp.years.start ? `–${exp.years.end}` : ''}
              {exp.pi ? ` · PI: ${exp.pi}` : ''}
              {exp.institution ? `, ${exp.institution}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Scroll body ── */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">

        {/* Platform Warning (Saffire) */}
        {exp.platformNote.startsWith('IMPORTANT') && (
          <div
            className="rounded-xl px-4 py-3 mb-5"
            style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.3)' }}
          >
            <p className="text-[10px] font-mono uppercase tracking-widest text-orange-400 mb-1">⚠ Platform Note</p>
            <p className="text-[11px] text-orange-200/80 leading-relaxed">{exp.platformNote}</p>
          </div>
        )}

        {/* Objective */}
        <DetailSection title="Research Objective">
          <p className="text-sm text-slate-300 leading-relaxed">{exp.objective}</p>
        </DetailSection>

        {/* Platform & Environment */}
        <DetailSection title="Platform & Environment">
          <div className="rounded-lg overflow-hidden border border-slate-800">
            <table className="w-full text-[11px]">
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="py-2 px-3 font-mono text-slate-500 w-32">Platform</td>
                  <td className="py-2 px-3 text-slate-300">{exp.platform}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 px-3 font-mono text-slate-500">Gravity</td>
                  <td className="py-2 px-3 text-slate-300">{exp.gravityEnvironment}</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 px-3 font-mono text-slate-500">Years</td>
                  <td className="py-2 px-3 text-slate-300">
                    {exp.years.start}{exp.years.end ? `–${exp.years.end}` : ''}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-slate-500">Category</td>
                  <td className="py-2 px-3 text-slate-300">
                    {categoryInfo?.emoji} {categoryInfo?.label}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {!exp.platformNote.startsWith('IMPORTANT') && (
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{exp.platformNote}</p>
          )}
        </DetailSection>

        {/* Fuel & Materials */}
        <DetailSection title="Fuel & Experimental Materials">
          <ul className="space-y-1">
            {exp.fuelMaterial.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="text-slate-600 mt-0.5">▸</span>
                {f}
              </li>
            ))}
          </ul>
        </DetailSection>

        {/* Experimental Conditions */}
        <DetailSection title="Experimental Conditions">
          <div className="rounded-lg overflow-hidden border border-slate-800">
            <table className="w-full text-[11px]">
              <tbody>
                {exp.conditions.oxygenRange && (
                  <tr className="border-b border-slate-800">
                    <td className="py-2 px-3 font-mono text-slate-500 w-28">O₂ Range</td>
                    <td className="py-2 px-3 text-slate-300">{exp.conditions.oxygenRange}</td>
                  </tr>
                )}
                {exp.conditions.pressure && (
                  <tr className="border-b border-slate-800">
                    <td className="py-2 px-3 font-mono text-slate-500">Pressure</td>
                    <td className="py-2 px-3 text-slate-300">{exp.conditions.pressure}</td>
                  </tr>
                )}
                {exp.conditions.flowVelocity && (
                  <tr className="border-b border-slate-800">
                    <td className="py-2 px-3 font-mono text-slate-500">Airflow</td>
                    <td className="py-2 px-3 text-slate-300">{exp.conditions.flowVelocity}</td>
                  </tr>
                )}
                {exp.conditions.sampleSize && (
                  <tr className="border-b border-slate-800">
                    <td className="py-2 px-3 font-mono text-slate-500">Sample</td>
                    <td className="py-2 px-3 text-slate-300">{exp.conditions.sampleSize}</td>
                  </tr>
                )}
                {exp.conditions.temperature && (
                  <tr className="border-b border-slate-800">
                    <td className="py-2 px-3 font-mono text-slate-500">Temperature</td>
                    <td className="py-2 px-3 text-slate-300">{exp.conditions.temperature}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {exp.conditions.other && exp.conditions.other.length > 0 && (
            <ul className="mt-2 space-y-1">
              {exp.conditions.other.map((o, i) => (
                <li key={i} className="text-[10px] text-slate-500 flex items-start gap-1.5">
                  <span className="text-slate-700 mt-0.5">•</span>
                  {o}
                </li>
              ))}
            </ul>
          )}
        </DetailSection>

        {/* Measurements */}
        <DetailSection title="Measurements & Sensors">
          <ul className="space-y-1">
            {exp.measurements.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="text-cyan-700 mt-0.5">▸</span>
                {m}
              </li>
            ))}
          </ul>
        </DetailSection>

        {/* Hardware */}
        <DetailSection title="Experimental Hardware">
          <ul className="space-y-1">
            {exp.hardware.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="text-slate-600 mt-0.5">▸</span>
                {h}
              </li>
            ))}
          </ul>
        </DetailSection>

        {/* Key Findings */}
        <DetailSection title="Key Findings">
          <div
            className="rounded-lg px-3 py-2 mb-3"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <p className="text-[9px] font-mono text-amber-500/80 uppercase tracking-widest">
              ⚠ Literature-based summary — not raw dataset output. Always cite original sources.
            </p>
          </div>
          <div className="space-y-3">
            {exp.keyFindings.map((f, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(30,41,59,0.8)' }}>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-1.5">{f.text}</p>
                <p className="text-[9px] font-mono text-slate-600">Source: {f.source}</p>
              </div>
            ))}
          </div>
        </DetailSection>

        {/* Fire Safety Relevance */}
        <DetailSection title="Spacecraft Fire Safety Relevance">
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}
          >
            <p className="text-[11px] text-orange-200/80 leading-relaxed">{exp.fireRelevance}</p>
          </div>
        </DetailSection>

        {/* Data Availability */}
        <DetailSection title="Data Availability">
          <div
            className="rounded-xl px-4 py-3 mb-3"
            style={{ background: 'rgba(10,15,26,0.8)', border: '1px solid rgba(30,41,59,0.8)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <DataBadge availability={exp.dataAvailability} />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{exp.dataNote}</p>
          </div>
        </DetailSection>

        {/* Sources & Links */}
        <DetailSection title="NASA Sources & Links">
          <div className="space-y-2">
            <a
              href={exp.psiSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg px-3 py-2.5 group transition-all duration-200"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <div>
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-0.5">NASA PSI Database</p>
                <p className="text-[11px] text-slate-400">Physical Sciences Informatics — search datasets</p>
              </div>
              <span className="text-emerald-500/60 text-xs group-hover:translate-x-1 transition-transform">↗</span>
            </a>

            <a
              href={exp.nasaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg px-3 py-2.5 group transition-all duration-200"
              style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}
            >
              <div>
                <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-0.5">NASA Primary Source</p>
                <p className="text-[11px] text-slate-400 truncate max-w-xs">{exp.nasaUrl}</p>
              </div>
              <span className="text-cyan-500/60 text-xs group-hover:translate-x-1 transition-transform">↗</span>
            </a>

            {exp.additionalUrls?.map((url, i) => (
              <a
                key={i}
                href={url.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg px-3 py-2.5 group transition-all duration-200"
                style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(30,41,59,0.8)' }}
              >
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-0.5">{url.label}</p>
                  <p className="text-[11px] text-slate-500 truncate max-w-xs">{url.url}</p>
                </div>
                <span className="text-slate-600 text-xs group-hover:translate-x-1 transition-transform">↗</span>
              </a>
            ))}
          </div>
        </DetailSection>

        {/* Simulation Connection */}
        {exp.simulationLink && (
          <DetailSection title="Explore in Simulation">
            <div
              className="rounded-xl px-4 py-4"
              style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.25)' }}
            >
              <p className="text-[9px] font-mono text-cyan-500/70 uppercase tracking-widest mb-2">Suggested FLARE Parameters</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Fuel', value: exp.simulationLink.fuel },
                  { label: 'Gravity', value: `${exp.simulationLink.gravity} m/s²` },
                  { label: 'O₂', value: `${exp.simulationLink.oxygenPercent}%` },
                  { label: 'Pressure', value: `${exp.simulationLink.pressure} atm` },
                  { label: 'Airflow', value: `${exp.simulationLink.airflowVelocity} m/s` },
                ].map(p => (
                  <div key={p.label} className="rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' }}>
                    <p className="text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest">{p.label}</p>
                    <p className="text-[11px] font-mono text-cyan-300">{p.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{exp.simulationLink.description}</p>
              <div
                className="rounded-lg px-3 py-2 mb-3"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <p className="text-[9px] font-mono text-amber-500/80 leading-relaxed">⚠ {exp.simulationLink.caveat}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/science?fuel=${exp.simulationLink.fuel}&gravity=${exp.simulationLink.gravity}&o2=${exp.simulationLink.oxygenPercent}&pressure=${exp.simulationLink.pressure}&airflow=${exp.simulationLink.airflowVelocity}&exp=${encodeURIComponent(exp.name)}`}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[11px] font-mono font-bold uppercase tracking-widest transition-all duration-200"
                  style={{
                    background: 'rgba(6,182,212,0.15)',
                    border: '1px solid rgba(6,182,212,0.4)',
                    color: '#06b6d4',
                  }}
                >
                  Open Simulation Lab →
                </Link>
                <Link
                  href={`/compare?left=${exp.id}&right=sim-microgravity-baseline`}
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[11px] font-mono font-bold uppercase tracking-widest transition-all duration-200"
                  style={{
                    background: 'rgba(249,115,22,0.12)',
                    border: '1px solid rgba(249,115,22,0.35)',
                    color: '#f97316',
                  }}
                >
                  ⚖️ Compare Investigation
                </Link>
              </div>
            </div>
          </DetailSection>
        )}

        {/* Attribution footer */}
        <div
          className="rounded-xl px-4 py-3 mt-2"
          style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(30,41,59,0.6)' }}
        >
          <p className="text-[9px] font-mono text-slate-600 leading-relaxed">
            FLARE Phase 05 — NASA Research Explorer · Team WUNDERBAO · NASA Space Apps Challenge 2026
            <br />
            All experiment metadata sourced from published NASA technical reports and the NASA Physical Sciences Informatics (PSI) database.
            Factual gaps are explicitly noted. Literature-based findings are labeled. Original sources are cited.
          </p>
        </div>

      </div>
    </div>
  )
}

// ─── Main Research Explorer ───────────────────────────────────────────────────

export default function ResearchExplorer({
  initialTab = 'experiments',
}: {
  initialTab?: ResearchTab
}) {
  const [activeTab, setActiveTab] = useState<ResearchTab>(initialTab)
  const [query, setQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<ExperimentCategory[]>([])
  const [selectedPrograms, setSelectedPrograms] = useState<ProgramKey[]>([])
  const [selectedExp, setSelectedExp] = useState<NASAExperiment | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const handleJumpToExperiment = useCallback((expId: string) => {
    const found = NASA_EXPERIMENTS.find(e => e.id === expId)
    if (found) {
      setSelectedExp(found)
      setActiveTab('experiments')
    }
  }, [])

  const programs = Array.from(new Set(NASA_EXPERIMENTS.map(e => e.program))) as ProgramKey[]

  const filtered = useMemo(() => {
    let results = searchExperiments(query)
    if (selectedCategories.length > 0) {
      results = results.filter(e => selectedCategories.includes(e.category))
    }
    if (selectedPrograms.length > 0) {
      results = results.filter(e => selectedPrograms.includes(e.program))
    }
    return results
  }, [query, selectedCategories, selectedPrograms])

  const toggleCategory = useCallback((cat: ExperimentCategory) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }, [])

  const toggleProgram = useCallback((prog: ProgramKey) => {
    setSelectedPrograms(prev =>
      prev.includes(prog) ? prev.filter(p => p !== prog) : [...prev, prog]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedCategories([])
    setSelectedPrograms([])
    setQuery('')
  }, [])

  const hasFilters = selectedCategories.length > 0 || selectedPrograms.length > 0 || query.length > 0

  const headerRoute =
    activeTab === 'library' ? 'library' : activeTab === 'insights' ? 'insights' : 'research'

  return (
    <div className="flex flex-col h-screen bg-[#040812] text-slate-100 overflow-hidden">
      {/* Unified Scientific Header */}
      <ScientificHeader
        activeRoute={headerRoute}
        workspaceSubtitle="NASA PSI & NTRS Microgravity Combustion Archive"
        pageContext={{
          activeTab,
          selectedExperiment: selectedExp?.name ?? null,
          selectedProgram: selectedExp?.program ?? null,
          selectedPlatform: selectedExp?.platform ?? null,
          filteredExperimentsCount: filtered.length,
        }}
        rightActionsSlot={
          <a
            href="https://psi.nasa.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
          >
            NASA PSI ↗
          </a>
        }
      />

      {/* Unified Research Sub-Navigation Bar */}
      <div className="shrink-0 border-b border-slate-800/90 bg-[#070c18] px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#040812] p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('experiments')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'experiments'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <span>🛸 NASA Investigations</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono tabular-nums">
              {NASA_EXPERIMENTS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/35'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <span>📚 Research Library</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono tabular-nums">
              {RESEARCH_RESOURCES.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/35'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <span>💡 Scientific Insights</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono tabular-nums">
              {SCIENTIFIC_INSIGHTS.length}
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-5 font-mono text-xs text-slate-400 tabular-nums">
          <span>
            Platforms: <strong className="text-slate-200">ISS CIR · MSG · Cygnus</strong>
          </span>
          <span className="h-3.5 w-px bg-slate-800" />
          <span>
            Provenance: <strong className="text-emerald-400">Verified NASA PSI &amp; NTRS</strong>
          </span>
        </div>
      </div>

      {/* ── Tab 2: Research Library ── */}
      {activeTab === 'library' && (
        <ResearchLibraryPanel onSelectExperiment={handleJumpToExperiment} />
      )}

      {/* ── Tab 3: Scientific Insights ── */}
      {activeTab === 'insights' && (
        <ScientificInsightsPanel onSelectExperiment={handleJumpToExperiment} />
      )}

      {/* ── Tab 1: NASA Investigations (Search + Grid + Detail) ── */}
      {activeTab === 'experiments' && (
        <>
      {/* ── Search Bar ── */}
      <div className="shrink-0 px-6 py-3 border-b border-[#1e293b] bg-[#080e1a]">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">🔍</span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search experiments, fuels, keywords…"
              className="w-full pl-8 pr-4 py-2 rounded-lg text-sm text-white placeholder-slate-600 outline-none transition-all duration-200 font-mono"
              style={{
                background: 'rgba(10,15,26,0.8)',
                border: '1px solid rgba(30,41,59,0.8)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(30,41,59,0.8)' }}
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-mono uppercase tracking-widest transition-all duration-200 cursor-pointer"
            style={{
              background: showFilters ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.6)',
              border: `1px solid ${showFilters ? 'rgba(6,182,212,0.4)' : 'rgba(30,41,59,0.8)'}`,
              color: showFilters ? '#06b6d4' : '#475569',
            }}
          >
            Filters {hasFilters ? `(${selectedCategories.length + selectedPrograms.length})` : ''}
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter chips */}
        {showFilters && (
          <div className="mt-3 flex flex-col gap-3">
            {/* Programs */}
            <div>
              <p className="font-mono text-[8px] uppercase tracking-widest text-slate-600 mb-1.5">Program</p>
              <div className="flex flex-wrap gap-1.5">
                {programs.map(prog => {
                  const meta = PROGRAM_META[prog]
                  const active = selectedPrograms.includes(prog)
                  return (
                    <button
                      key={prog}
                      onClick={() => toggleProgram(prog)}
                      className="rounded-full px-3 py-1 text-[9px] font-mono uppercase tracking-widest cursor-pointer transition-all duration-150"
                      style={{
                        background: active ? meta.bg : 'rgba(15,23,42,0.6)',
                        border: `1px solid ${active ? meta.color + '60' : 'rgba(30,41,59,0.8)'}`,
                        color: active ? meta.color : '#475569',
                      }}
                    >
                      {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>
            {/* Categories */}
            <div>
              <p className="font-mono text-[8px] uppercase tracking-widest text-slate-600 mb-1.5">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CATEGORIES.map(cat => {
                  const active = selectedCategories.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className="rounded-full px-3 py-1 text-[9px] font-mono cursor-pointer transition-all duration-150"
                      style={{
                        background: active ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.6)',
                        border: `1px solid ${active ? 'rgba(6,182,212,0.4)' : 'rgba(30,41,59,0.8)'}`,
                        color: active ? '#06b6d4' : '#475569',
                      }}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Card grid */}
        <div className={`overflow-y-auto transition-all duration-300 ${selectedExp ? 'hidden lg:block lg:w-96 lg:shrink-0' : 'flex-1'}`}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-8">
              <span className="text-3xl mb-3">🔭</span>
              <p className="font-mono text-sm text-slate-500 mb-1">No experiments match your search</p>
              <button onClick={clearFilters} className="text-xs text-cyan-500 hover:text-cyan-400 font-mono mt-2 cursor-pointer">
                Clear filters
              </button>
            </div>
          ) : (
            <div className={`p-4 grid gap-3 ${selectedExp ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
              {filtered.map(exp => (
                <ExperimentCard
                  key={exp.id}
                  exp={exp}
                  selected={selectedExp?.id === exp.id}
                  onClick={() => setSelectedExp(prev => prev?.id === exp.id ? null : exp)}
                />
              ))}
            </div>
          )}

          {/* PSI Attribution */}
          <div className="px-4 pb-6">
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(10,15,26,0.6)', border: '1px solid rgba(30,41,59,0.6)' }}>
              <p className="font-mono text-[9px] text-slate-600 leading-relaxed">
                <span className="text-slate-500 font-bold">Data Sources: </span>
                NASA Physical Sciences Informatics (PSI) database — psi.nasa.gov ·
                NASA Technical Reports Server (NTRS) — ntrs.nasa.gov ·
                Published peer-reviewed literature as cited per experiment.
                All metadata verified against original NASA sources.
                Factual gaps are explicitly marked. Do not cite FLARE as a primary research source.
              </p>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selectedExp && (
          <div className="flex-1 w-full border-l border-[#1e293b] overflow-hidden">
            <ExperimentDetail exp={selectedExp} onClose={() => setSelectedExp(null)} />
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}

