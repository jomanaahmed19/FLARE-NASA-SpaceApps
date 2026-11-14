'use client'

import { useState, useMemo } from 'react'
import type { ComparisonItem } from '@/lib/comparison/comparisonEngine'
import type { NASAExperiment } from '@/data/nasaExperiments'
import type { SimulationScenario } from '@/data/simulationScenarios'
import { PROGRAM_META } from '@/data/nasaExperiments'

type FilterType = 'all' | 'nasa' | 'simulation'

interface Props {
  side: 'left' | 'right'
  selectedId: string | null
  onSelect: (id: string | null) => void
  allItems: ComparisonItem[]
  otherId: string | null
}

function isNASA(item: ComparisonItem): item is NASAExperiment {
  return !('type' in item) || (item as SimulationScenario).type !== 'simulation'
}

function isSim(item: ComparisonItem): item is SimulationScenario {
  return 'type' in item && (item as SimulationScenario).type === 'simulation'
}

export default function ComparisonSelector({ side, selectedId, onSelect, allItems, otherId }: Props) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [query, setQuery] = useState('')

  const selected = useMemo(() => allItems.find(i => i.id === selectedId), [allItems, selectedId])

  const filtered = useMemo(() => {
    return allItems.filter(item => {
      if (item.id === otherId) return false // hide the other side's selection
      if (filter === 'nasa' && isSim(item)) return false
      if (filter === 'simulation' && isNASA(item)) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        const name = item.name.toLowerCase()
        const fuel = isNASA(item)
          ? item.fuelMaterial.join(' ').toLowerCase()
          : (item as SimulationScenario).fuelLabel.toLowerCase()
        return name.includes(q) || fuel.includes(q)
      }
      return true
    })
  }, [allItems, filter, query, otherId])

  const nasaItems = filtered.filter(isNASA)
  const simItems = filtered.filter(isSim)

  const color = side === 'left' ? 'cyan' : 'orange'
  const colorClass = side === 'left'
    ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
    : 'border-orange-500/40 text-orange-400 bg-orange-500/10'
  const hoverClass = side === 'left'
    ? 'hover:border-cyan-500/40 hover:bg-cyan-500/5'
    : 'hover:border-orange-500/40 hover:bg-orange-500/5'

  const selectedClass = side === 'left'
    ? 'border-cyan-500/30 bg-cyan-500/5'
    : 'border-orange-500/30 bg-orange-500/5'

  return (
    <div className="relative">
      {/* Selector trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full text-left rounded-xl border transition-all ${
          selectedId
            ? selectedClass
            : 'border-white/10 bg-white/5 hover:border-white/20'
        } p-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${side === 'left' ? 'bg-cyan-500' : 'bg-orange-500'}`} />
            <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
              {side === 'left' ? 'Left / A' : 'Right / B'}
            </span>
          </div>
          <span className="text-white/30 text-xs">{open ? '▲' : '▼'}</span>
        </div>

        {selected ? (
          <div className="mt-2">
            <div className="font-space-grotesk font-semibold text-white text-sm">{selected.name}</div>
            <div className="text-white/50 text-xs mt-0.5">
              {isNASA(selected)
                ? `NASA · ${selected.gravityEnvironment}`
                : `Simulation · ${(selected as SimulationScenario).gravityLabel}`}
            </div>
            <div className="mt-2 flex gap-1.5 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${colorClass}`}>
                {isNASA(selected) ? 'NASA Experiment' : 'D² Model'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/40">
                {isNASA(selected)
                  ? (selected as NASAExperiment).fuelMaterial.slice(0, 2).join(', ')
                  : (selected as SimulationScenario).fuelLabel}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-white/40 text-sm">Click to select an experiment or scenario…</div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-[#0d1526] border border-white/15 rounded-xl shadow-2xl max-h-[480px] flex flex-col overflow-hidden">
          {/* Search + filter */}
          <div className="p-3 border-b border-white/10 space-y-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search experiments and scenarios…"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              autoFocus
            />
            <div className="flex gap-1.5">
              {(['all', 'nasa', 'simulation'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filter === f
                      ? `${colorClass} border`
                      : 'text-white/40 hover:text-white/70 border border-white/10'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'nasa' ? 'NASA' : 'Simulations'}
                </button>
              ))}
              {selectedId && (
                <button
                  onClick={() => { onSelect(null); setOpen(false) }}
                  className="ml-auto px-3 py-1 rounded-full text-xs text-red-400 hover:text-red-300 border border-red-500/20"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 p-2">
            {/* NASA section */}
            {nasaItems.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-white/30 px-2 py-1 font-medium">NASA EXPERIMENTS</div>
                {nasaItems.map(item => {
                  const exp = item as NASAExperiment
                  const prog = PROGRAM_META[exp.program]
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onSelect(item.id); setOpen(false); setQuery('') }}
                      className={`w-full text-left rounded-lg px-3 py-2.5 transition-all ${hoverClass} border border-transparent ${
                        selectedId === item.id ? colorClass + ' border' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: prog.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm text-white font-medium truncate">{exp.name}</div>
                          <div className="text-xs text-white/40 mt-0.5 truncate">
                            {exp.fuelMaterial.join(', ')} · {exp.gravityEnvironment}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Simulation section */}
            {simItems.length > 0 && (
              <div>
                <div className="text-xs text-white/30 px-2 py-1 font-medium">FLARE SIMULATIONS</div>
                {simItems.map(item => {
                  const sc = item as SimulationScenario
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onSelect(item.id); setOpen(false); setQuery('') }}
                      className={`w-full text-left rounded-lg px-3 py-2.5 transition-all ${hoverClass} border border-transparent ${
                        selectedId === item.id ? colorClass + ' border' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-purple-400" />
                        <div className="min-w-0">
                          <div className="text-sm text-white font-medium truncate">{sc.name}</div>
                          <div className="text-xs text-white/40 mt-0.5 truncate">
                            {sc.fuelLabel} · {sc.gravityLabel} · O₂ {sc.oxygenPercent}%
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-8 text-white/30 text-sm">No items match your search.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

