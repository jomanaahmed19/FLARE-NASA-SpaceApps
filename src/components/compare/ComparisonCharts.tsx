'use client'

import type { ComparisonResult, ParameterDiff } from '@/lib/comparison/comparisonEngine'

interface Props {
  result: ComparisonResult
}

// SVG bar chart for a single numeric parameter diff
function BarPair({ diff, leftColor, rightColor }: {
  diff: ParameterDiff
  leftColor: string
  rightColor: string
}) {
  const lv = diff.left.value
  const rv = diff.right.value
  if (lv === null && rv === null) return null

  const max = Math.max(Math.abs(lv ?? 0), Math.abs(rv ?? 0), 1e-9)
  const leftPct = lv !== null ? Math.min((Math.abs(lv) / max) * 100, 100) : 0
  const rightPct = rv !== null ? Math.min((Math.abs(rv) / max) * 100, 100) : 0

  const isSignificant = diff.significance === 'major' || diff.significance === 'moderate'

  return (
    <div className={`rounded-xl border p-4 ${isSignificant ? 'border-amber-500/20 bg-amber-500/3' : 'border-white/8 bg-white/2'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/70 font-medium">{diff.label}</span>
        <span className="text-xs text-white/30">{diff.left.unit || diff.right.unit}</span>
      </div>

      {/* Left bar */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: leftColor }} />
          <span className="text-xs text-white/50 truncate flex-1">A: {diff.left.display}</span>
          {diff.left.source === 'not-available' && (
            <span className="text-xs text-white/20">N/A</span>
          )}
        </div>
        <div className="h-5 bg-white/5 rounded overflow-hidden">
          {lv !== null ? (
            <div
              className="h-full rounded transition-all duration-700"
              style={{ width: `${leftPct}%`, backgroundColor: leftColor + '99' }}
            />
          ) : (
            <div className="h-full flex items-center pl-2">
              <span className="text-xs text-white/20 italic">Not available</span>
            </div>
          )}
        </div>
      </div>

      {/* Right bar */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rightColor }} />
          <span className="text-xs text-white/50 truncate flex-1">B: {diff.right.display}</span>
          {diff.right.source === 'not-available' && (
            <span className="text-xs text-white/20">N/A</span>
          )}
        </div>
        <div className="h-5 bg-white/5 rounded overflow-hidden">
          {rv !== null ? (
            <div
              className="h-full rounded transition-all duration-700"
              style={{ width: `${rightPct}%`, backgroundColor: rightColor + '99' }}
            />
          ) : (
            <div className="h-full flex items-center pl-2">
              <span className="text-xs text-white/20 italic">Not available</span>
            </div>
          )}
        </div>
      </div>

      {/* Explanation */}
      {diff.explanation && diff.significance !== 'incomparable' && (
        <p className="text-xs text-white/35 mt-3 leading-relaxed border-t border-white/5 pt-2">
          {diff.explanation}
        </p>
      )}
    </div>
  )
}

// Radar-like spider chart using SVG (for numeric params)
function RadarChart({ result }: { result: ComparisonResult }) {
  const params = ['oxygenPercent', 'pressureAtm', 'airflowVelocity', 'gravity', 'flameTemperature']
  const labels = ['O₂ %', 'Pressure', 'Airflow', 'Gravity', 'Temp']

  // Normalise each param to 0-1 relative to max of both sides
  const data = params.map(key => {
    const diff = result.diffs.find(d => d.paramKey === key)
    if (!diff) return { l: 0, r: 0 }
    const lv = diff.left.value
    const rv = diff.right.value
    const max = Math.max(Math.abs(lv ?? 0), Math.abs(rv ?? 0), 1e-9)
    return {
      l: lv !== null ? Math.min(Math.abs(lv) / max, 1) : 0,
      r: rv !== null ? Math.min(Math.abs(rv) / max, 1) : 0,
    }
  })

  const cx = 110
  const cy = 110
  const r = 80
  const n = params.length

  function point(val: number, i: number) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const dist = val * r
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    }
  }

  function polyPoints(vals: number[]) {
    return vals.map((v, i) => {
      const p = point(v, i)
      return `${p.x},${p.y}`
    }).join(' ')
  }

  const leftPts = polyPoints(data.map(d => d.l))
  const rightPts = polyPoints(data.map(d => d.r))

  // Grid circles at 0.33, 0.67, 1.0
  const gridLevels = [0.33, 0.67, 1.0]

  // Axes
  const axes = params.map((_, i) => {
    const p = point(1.0, i)
    return { x: p.x, y: p.y }
  })

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-5">
      <div className="text-sm text-white/70 font-medium mb-4">Condition Comparison — Radar</div>
      <div className="text-xs text-white/30 mb-4">
        Each axis is normalised to the larger of the two values. Use to quickly spot relative differences.
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <svg width="220" height="220" viewBox="0 0 220 220" className="flex-shrink-0">
          {/* Grid */}
          {gridLevels.map(lvl => (
            <polygon
              key={lvl}
              points={polyPoints(Array(n).fill(lvl))}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          ))}
          {/* Axes */}
          {axes.map((p, i) => (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          ))}
          {/* Right polygon */}
          <polygon points={rightPts} fill="rgba(249,115,22,0.15)" stroke="#f97316" strokeWidth="1.5" />
          {/* Left polygon */}
          <polygon points={leftPts} fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="1.5" />
          {/* Labels */}
          {params.map((_, i) => {
            const p = point(1.18, i)
            return (
              <text
                key={i}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.4)"
                fontSize="9"
                fontFamily="monospace"
              >
                {labels[i]}
              </text>
            )
          })}
        </svg>
        {/* Legend */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-500/50 border border-cyan-500" />
            <span className="text-white/60">A — {result.left.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500/50 border border-orange-500" />
            <span className="text-white/60">B — {result.right.name}</span>
          </div>
          <p className="text-white/25 leading-relaxed max-w-[200px]">
            Each axis is scaled to the max of both values. Overlap indicates similar conditions.
          </p>
        </div>
      </div>
    </div>
  )
}

// Significance summary bar
function SignificanceSummary({ result }: { result: ComparisonResult }) {
  const counts = {
    major: result.diffs.filter(d => d.significance === 'major').length,
    moderate: result.diffs.filter(d => d.significance === 'moderate').length,
    minor: result.diffs.filter(d => d.significance === 'minor').length,
    identical: result.diffs.filter(d => d.significance === 'identical').length,
  }

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-5">
      <div className="text-sm text-white/70 font-medium mb-4">Difference Summary</div>
      <div className="grid grid-cols-4 gap-3">
        {[
          { key: 'major', label: 'Major', color: 'text-red-400', bg: 'bg-red-500/10' },
          { key: 'moderate', label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { key: 'minor', label: 'Minor', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { key: 'identical', label: 'Identical', color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map(item => (
          <div key={item.key} className={`${item.bg} rounded-lg p-3 text-center`}>
            <div className={`text-2xl font-bold font-mono ${item.color}`}>
              {counts[item.key as keyof typeof counts]}
            </div>
            <div className={`text-xs mt-1 ${item.color}`}>{item.label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-3 leading-relaxed">
        Out of {result.diffs.length} compared parameters.
        {counts.major > 0
          ? ` ${counts.major} major difference${counts.major > 1 ? 's' : ''} indicate fundamentally different combustion conditions.`
          : ' No major differences found — conditions are broadly comparable.'}
      </p>
    </div>
  )
}

export default function ComparisonCharts({ result }: Props) {
  const leftColor = '#06b6d4'   // cyan for A
  const rightColor = '#f97316'  // orange for B

  const numericDiffs = result.diffs.filter(
    d => d.left.value !== null || d.right.value !== null
  ).filter(d => !['burnRate', 'flameShape', 'platform', 'fuel'].includes(d.paramKey as string))

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SignificanceSummary result={result} />
        <RadarChart result={result} />
      </div>

      {/* Bar pairs */}
      <div>
        <h3 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Numeric Parameter Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {numericDiffs.map(diff => (
            <BarPair
              key={diff.paramKey}
              diff={diff}
              leftColor={leftColor}
              rightColor={rightColor}
            />
          ))}
        </div>
      </div>

      {/* Qualitative differences */}
      {result.diffs.filter(d => d.left.value === null && d.right.value === null && d.significance !== 'incomparable').length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Qualitative Differences</h3>
          <div className="space-y-2">
            {result.diffs
              .filter(d => d.left.value === null && d.right.value === null && d.significance !== 'incomparable')
              .map(diff => (
                <div key={diff.paramKey} className="bg-white/3 border border-white/8 rounded-lg p-4">
                  <div className="text-sm text-white/70 font-medium mb-2">{diff.label}</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-cyan-400/60 mb-1">A: {result.left.name}</div>
                      <div className="text-white/60">{diff.left.display}</div>
                    </div>
                    <div>
                      <div className="text-orange-400/60 mb-1">B: {result.right.name}</div>
                      <div className="text-white/60">{diff.right.display}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <p className="text-xs text-white/20 text-center border-t border-white/5 pt-3">
        Chart axes are normalised per-parameter. Direct numeric comparison requires equal scales.
        All simulation values are D² Law model estimates.
      </p>
    </div>
  )
}

