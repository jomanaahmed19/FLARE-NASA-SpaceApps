'use client'

import { useState, useMemo } from 'react'
import {
  RESEARCH_RESOURCES,
  TOPIC_META,
  SOURCE_TYPE_META,
  type ResearchResource,
  type ResourceTopic,
  type ResourceSourceType,
} from '@/data/researchLibrary'
import { NASA_EXPERIMENTS } from '@/data/nasaExperiments'

interface Props {
  onSelectExperiment?: (expId: string) => void
}

export default function ResearchLibraryPanel({ onSelectExperiment }: Props) {
  const [query, setQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<ResourceTopic | 'all'>('all')
  const [selectedSourceType, setSelectedSourceType] = useState<ResourceSourceType | 'all'>('all')
  const [selectedRes, setSelectedRes] = useState<ResearchResource>(RESEARCH_RESOURCES[0])

  const topics = Object.keys(TOPIC_META) as ResourceTopic[]
  const sourceTypes = Object.keys(SOURCE_TYPE_META) as ResourceSourceType[]

  const filtered = useMemo(() => {
    return RESEARCH_RESOURCES.filter(r => {
      if (selectedTopic !== 'all' && r.topic !== selectedTopic) return false
      if (selectedSourceType !== 'all' && r.sourceType !== selectedSourceType) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        return (
          r.title.toLowerCase().includes(q) ||
          r.publisher.toLowerCase().includes(q) ||
          r.explanation.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [query, selectedTopic, selectedSourceType])

  return (
    <div className="flex flex-1 overflow-hidden bg-[#080e1a]">
      {/* ── Left Sidebar: Topics & Source Types (Literature Workbench Style) ── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-[#1e293b] bg-[#0a0f1e] overflow-y-auto p-4 gap-6">
        {/* Quick Actions / Featured Video */}
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 mb-2.5">
            Featured Multimedia
          </p>
          <button
            onClick={() => {
              const vid = RESEARCH_RESOURCES.find(r => r.id === 'res-sciencecasts-strange-flames')
              if (vid) setSelectedRes(vid)
            }}
            className="w-full text-left rounded-xl p-3 transition-all cursor-pointer"
            style={{
              background:
                selectedRes.id === 'res-sciencecasts-strange-flames'
                  ? 'rgba(249,115,22,0.16)'
                  : 'rgba(15,23,42,0.7)',
              border: `1px solid ${
                selectedRes.id === 'res-sciencecasts-strange-flames'
                  ? 'rgba(249,115,22,0.5)'
                  : 'rgba(30,41,59,0.8)'
              }`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🎬</span>
              <span className="font-mono text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                NASA ScienceCasts
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium leading-snug">
              Strange Flames on the ISS
            </p>
            <p className="text-[9px] font-mono text-emerald-400 mt-1">
              ✓ Verified Official Video
            </p>
          </button>
        </div>

        {/* Research Topics */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
              Research Topics
            </p>
            {selectedTopic !== 'all' && (
              <button
                onClick={() => setSelectedTopic('all')}
                className="font-mono text-[9px] text-cyan-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedTopic('all')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                selectedTopic === 'all'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>All Topics</span>
              <span className="font-mono text-[10px] opacity-60">{RESEARCH_RESOURCES.length}</span>
            </button>
            {topics.map(t => {
              const meta = TOPIC_META[t]
              const count = RESEARCH_RESOURCES.filter(r => r.topic === t).length
              const active = selectedTopic === t
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                  style={{
                    background: active ? meta.bg : 'transparent',
                    color: active ? meta.color : '#94a3b8',
                    border: active ? `1px solid ${meta.color}40` : '1px solid transparent',
                  }}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{meta.icon}</span>
                    <span className="truncate">{meta.label}</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-70">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Source Types */}
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 mb-2">
            Source Classification
          </p>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedSourceType('all')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                selectedSourceType === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All Source Types
            </button>
            {sourceTypes.map(st => {
              const meta = SOURCE_TYPE_META[st]
              const active = selectedSourceType === st
              return (
                <button
                  key={st}
                  onClick={() => setSelectedSourceType(st)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer flex items-center gap-2"
                  style={{
                    background: active ? `${meta.badgeColor}18` : 'transparent',
                    color: active ? meta.badgeColor : '#64748b',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: meta.badgeColor }}
                  />
                  <span className="truncate">{meta.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* ── Center Pane: Search & Structured Literature List ── */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-[#1e293b]">
        {/* Search & mobile topic filter bar */}
        <div className="p-3 border-b border-[#1e293b] bg-[#0a0f1e]/60 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search NASA reports, Apollo, Mir, Saffire, smoke detection, spinoffs…"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono text-white placeholder-slate-600 bg-[#080e1a] border border-[#1e293b] focus:border-cyan-500/50 outline-none"
              />
            </div>
            {(query || selectedTopic !== 'all' || selectedSourceType !== 'all') && (
              <button
                onClick={() => {
                  setQuery('')
                  setSelectedTopic('all')
                  setSelectedSourceType('all')
                }}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Mobile topic pills */}
          <div className="flex lg:hidden gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedTopic('all')}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono ${
                selectedTopic === 'all' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-500'
              }`}
            >
              All ({RESEARCH_RESOURCES.length})
            </button>
            {topics.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono ${
                  selectedTopic === t ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-900 text-slate-500'
                }`}
              >
                {TOPIC_META[t].icon} {TOPIC_META[t].label}
              </button>
            ))}
          </div>
        </div>

        {/* Column Header */}
        <div className="grid grid-cols-[1fr_90px_130px] gap-3 px-4 py-2 border-b border-[#1e293b] bg-[#0a0f1e]/90 font-mono text-[9px] uppercase tracking-widest text-slate-500">
          <span>Title &amp; Publisher</span>
          <span>Year</span>
          <span>Source Type</span>
        </div>

        {/* Resource Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1e293b]/60">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs">
              No verified resources match your current filters.
            </div>
          ) : (
            filtered.map(res => {
              const active = selectedRes.id === res.id
              const tMeta = TOPIC_META[res.topic]
              const sMeta = SOURCE_TYPE_META[res.sourceType]
              return (
                <button
                  key={res.id}
                  onClick={() => setSelectedRes(res)}
                  className="w-full text-left grid grid-cols-[1fr_90px_130px] gap-3 items-center px-4 py-3.5 transition-all cursor-pointer"
                  style={{
                    background: active ? 'rgba(6,182,212,0.09)' : 'transparent',
                    borderLeft: active ? `3px solid ${tMeta.color}` : '3px solid transparent',
                  }}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono"
                        style={{ background: tMeta.bg, color: tMeta.color }}
                      >
                        {tMeta.icon} {tMeta.label}
                      </span>
                      {res.verifiedVideoId && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-orange-500/15 text-orange-400 border border-orange-500/30">
                          ▶ Video
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{res.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{res.publisher}</div>
                  </div>

                  <div className="font-mono text-xs text-slate-400">{res.year}</div>

                  <div>
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[9px] font-mono truncate max-w-full"
                      style={{
                        background: `${sMeta.badgeColor}15`,
                        color: sMeta.badgeColor,
                        border: `1px solid ${sMeta.badgeColor}35`,
                      }}
                    >
                      {sMeta.label}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="px-4 py-2 border-t border-[#1e293b] bg-[#0a0f1e] flex items-center justify-between font-mono text-[10px] text-slate-500">
          <span>
            Showing <strong className="text-cyan-400">{filtered.length}</strong> of{' '}
            {RESEARCH_RESOURCES.length} verified NASA resources
          </span>
          <span className="text-emerald-400">● All URLs &amp; citations verified</span>
        </div>
      </div>

      {/* ── Right Pane: Resource Inspection Detail ── */}
      <div className="w-full md:w-[420px] xl:w-[460px] shrink-0 overflow-y-auto bg-[#0a0f1e] p-5 space-y-5">
        {selectedRes && (
          <>
            {/* Topic + Source Type Badges */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider"
                style={{
                  background: TOPIC_META[selectedRes.topic].bg,
                  color: TOPIC_META[selectedRes.topic].color,
                  border: `1px solid ${TOPIC_META[selectedRes.topic].color}40`,
                }}
              >
                {TOPIC_META[selectedRes.topic].icon} {TOPIC_META[selectedRes.topic].label}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono"
                style={{
                  background: `${SOURCE_TYPE_META[selectedRes.sourceType].badgeColor}15`,
                  color: SOURCE_TYPE_META[selectedRes.sourceType].badgeColor,
                  border: `1px solid ${SOURCE_TYPE_META[selectedRes.sourceType].badgeColor}35`,
                }}
              >
                {SOURCE_TYPE_META[selectedRes.sourceType].label}
              </span>
            </div>

            {/* Title & Publisher */}
            <div>
              <h2 className="font-orbitron text-base font-bold text-white leading-snug mb-1.5">
                {selectedRes.title}
              </h2>
              <p className="font-mono text-xs text-cyan-400/90">{selectedRes.publisher}</p>
              <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                Publication / Archive Year: {selectedRes.year}
              </p>
            </div>

            {/* Verified NASA ScienceCasts Video Embed (if applicable) */}
            {selectedRes.verifiedVideoId && (
              <div className="rounded-xl overflow-hidden border border-orange-500/30 bg-black/50">
                <div className="px-3 py-1.5 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-orange-300 font-semibold">
                    🎬 Verified NASA ScienceCasts Video
                  </span>
                  <span className="font-mono text-[9px] text-emerald-400">
                    ID: {selectedRes.verifiedVideoId}
                  </span>
                </div>
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${selectedRes.verifiedVideoId}`}
                    title={selectedRes.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Scientific Explanation */}
            <div className="rounded-xl p-4 bg-[#080e1a] border border-[#1e293b]">
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">
                Scientific Summary
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedRes.explanation}</p>
            </div>

            {/* Relevance to Spacecraft Safety & FLARE */}
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(6,182,212,0.06)',
                border: '1px solid rgba(6,182,212,0.2)',
              }}
            >
              <p className="font-mono text-[9px] uppercase tracking-widest text-cyan-400 mb-1.5">
                Relevance to Spacecraft Fire Safety
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedRes.relevance}</p>
            </div>

            {/* Related NASA Experiments in FLARE */}
            {selectedRes.relatedExperimentIds.length > 0 && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 mb-2">
                  Connected NASA Investigations in FLARE
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRes.relatedExperimentIds.map(expId => {
                    const exp = NASA_EXPERIMENTS.find(e => e.id === expId)
                    if (!exp) return null
                    return (
                      <button
                        key={expId}
                        onClick={() => onSelectExperiment?.(expId)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/5 hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer"
                      >
                        🛸 {exp.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {selectedRes.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-500 border border-slate-800"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Verified External Link CTA */}
            <div className="pt-2">
              <a
                href={selectedRes.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 transition-all"
              >
                <span>Open Verified Source</span>
                <span>↗</span>
              </a>
              <p className="font-mono text-[9px] text-slate-600 mt-1.5 break-all text-center">
                {selectedRes.url}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

