'use client'

import type { ComparisonResult, NormalisedParam, ParameterDiff } from '@/lib/comparison/comparisonEngine'

const SOURCE_BADGE: Record<NormalisedParam['source'], { label: string; color: string }> = {
  measured:       { label: 'Measured',       color: 'text-green-400 border-green-500/30' },
  'model-estimate': { label: 'Model Est.',   color: 'text-purple-400 border-purple-500/30' },
  literature:     { label: 'Literature',     color: 'text-cyan-400 border-cyan-500/30' },
  'not-available': { label: 'N/A',           color: 'text-white/30 border-white/10' },
}

const SIG_COLOR: Record<ParameterDiff['significance'], string> = {
  identical:    'bg-green-500/10 text-green-400',
  minor:        'bg-cyan-500/10 text-cyan-400',
  moderate:     'bg-amber-500/10 text-amber-400',
  major:        'bg-red-500/10 text-red-400',
  incomparable: 'bg-white/5 text-white/30',
}

const SIG_LABEL: Record<ParameterDiff['significance'], string> = {
  identical:    '≡ Identical',
  minor:        '△ Minor diff',
  moderate:     '▲ Moderate',
  major:        '⚡ Major diff',
  incomparable: '— N/A',
}

interface Props {
  result: ComparisonResult
}

function SourceBadge({ source }: { source: NormalisedParam['source'] }) {
  const cfg = SOURCE_BADGE[source]
  return (
    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border ${cfg.color} font-medium`}>
      {cfg.label}
    </span>
  )
}

function ParamCell({ param }: { param: NormalisedParam }) {
  return (
    <div className="space-y-1">
      <div className={`text-sm font-medium ${param.source === 'not-available' ? 'text-white/30 italic' : 'text-white'}`}>
        {param.display}
      </div>
      <SourceBadge source={param.source} />
    </div>
  )
}

export default function ComparisonTable({ result }: Props) {
  const { left, right, diffs } = result

  const hiddenKeys = ['platform']

  const visibleDiffs = diffs.filter(d => !hiddenKeys.includes(d.paramKey as string))

  return (
    <div className="space-y-4">
      {/* Header row (Desktop / Tablet >= md) */}
      <div className="hidden md:grid grid-cols-[200px_1fr_60px_1fr] gap-3 items-center px-4 py-2 rounded-lg bg-white/3">
        <div className="text-xs text-white/30 font-medium uppercase tracking-wider">Parameter</div>
        <div className="flex items-center gap-2 text-xs font-medium min-w-0">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
          <span className="text-cyan-400 truncate">{left.name}</span>
          <span className="text-white/20 ml-1 shrink-0">
            {left.itemType === 'nasa' ? '(NASA)' : '(Sim)'}
          </span>
        </div>
        <div className="text-center text-xs text-white/20">diff</div>
        <div className="flex items-center gap-2 text-xs font-medium min-w-0">
          <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
          <span className="text-orange-400 truncate">{right.name}</span>
          <span className="text-white/20 ml-1 shrink-0">
            {right.itemType === 'nasa' ? '(NASA)' : '(Sim)'}
          </span>
        </div>
      </div>

      {/* Parameter items (Adaptive: Responsive Card on Mobile < md, Grid Row on >= md) */}
      <div className="space-y-2.5">
        {visibleDiffs.map(diff => (
          <div
            key={diff.paramKey}
            className={`rounded-xl border p-4 transition-all ${
              diff.significance === 'major'
                ? 'border-red-500/20 bg-red-500/5'
                : diff.significance === 'moderate'
                ? 'border-amber-500/20 bg-amber-500/5'
                : diff.significance === 'identical'
                ? 'border-green-500/10 bg-green-500/5'
                : 'border-white/5 bg-white/2'
            }`}
          >
            {/* Desktop Table Layout (>= md) */}
            <div className="hidden md:grid grid-cols-[200px_1fr_60px_1fr] gap-3 items-start">
              {/* Label col */}
              <div>
                <div className="text-sm text-white/80 font-medium">{diff.label}</div>
                <div className={`mt-1.5 inline-flex items-center text-xs px-2 py-0.5 rounded-full ${SIG_COLOR[diff.significance]}`}>
                  {SIG_LABEL[diff.significance]}
                </div>
              </div>

              {/* Left value */}
              <ParamCell param={diff.left} />

              {/* Diff indicator */}
              <div className="flex items-center justify-center">
                {diff.relativeDiff !== null ? (
                  <div className="text-center">
                    <div className={`text-xs font-mono font-bold ${
                      Math.abs(diff.relativeDiff) < 0.05 ? 'text-green-400' :
                      Math.abs(diff.relativeDiff) < 0.25 ? 'text-cyan-400' :
                      Math.abs(diff.relativeDiff) < 0.5 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {diff.relativeDiff > 0 ? '+' : ''}{(diff.relativeDiff * 100).toFixed(0)}%
                    </div>
                  </div>
                ) : (
                  <div className="text-white/20 text-xs">—</div>
                )}
              </div>

              {/* Right value */}
              <ParamCell param={diff.right} />
            </div>

            {/* Mobile Card Layout (< md) */}
            <div className="md:hidden space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-white">{diff.label}</div>
                  <div className={`mt-1 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full ${SIG_COLOR[diff.significance]}`}>
                    {SIG_LABEL[diff.significance]}
                  </div>
                </div>
                {diff.relativeDiff !== null && (
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5 ${
                    Math.abs(diff.relativeDiff) < 0.05 ? 'text-green-400' :
                    Math.abs(diff.relativeDiff) < 0.25 ? 'text-cyan-400' :
                    Math.abs(diff.relativeDiff) < 0.5 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {diff.relativeDiff > 0 ? '+' : ''}{(diff.relativeDiff * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1 truncate">
                    A: {left.name}
                  </div>
                  <ParamCell param={diff.left} />
                </div>
                <div className="p-2.5 rounded-lg bg-orange-950/20 border border-orange-500/20">
                  <div className="text-[10px] font-mono text-orange-400 uppercase tracking-wider mb-1 truncate">
                    B: {right.name}
                  </div>
                  <ParamCell param={diff.right} />
                </div>
              </div>
            </div>

            {/* Explanation — full width, below */}
            {diff.explanation && diff.significance !== 'incomparable' && diff.significance !== 'identical' && (
              <div className="mt-3 pt-2.5 border-t border-white/5 text-xs text-white/50 leading-relaxed">
                {diff.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Platform row */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
        <div className="bg-white/3 rounded-lg p-3">
          <div className="text-xs text-white/30 mb-1">Left Platform</div>
          <div className="text-sm text-white/70">{left.platform.display}</div>
        </div>
        <div className="bg-white/3 rounded-lg p-3">
          <div className="text-xs text-white/30 mb-1">Right Platform</div>
          <div className="text-sm text-white/70">{right.platform.display}</div>
        </div>
      </div>

      {/* Warnings */}
      {[...left.warnings, ...right.warnings].length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Data Quality Notices</div>
          {[...left.warnings, ...right.warnings].map((w, i) => (
            <p key={i} className="text-xs text-amber-200/60 leading-relaxed">⚠ {w}</p>
          ))}
        </div>
      )}

      {/* Source legend */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
        <span className="text-xs text-white/20">Data sources:</span>
        {Object.entries(SOURCE_BADGE).map(([k, v]) => (
          <span key={k} className={`text-[11px] px-2 py-0.5 rounded border ${v.color}`}>
            {v.label}
          </span>
        ))}
      </div>
    </div>
  )
}

