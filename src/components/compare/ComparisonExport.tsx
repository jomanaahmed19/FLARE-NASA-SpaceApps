'use client'

import { useState } from 'react'
import type { ComparisonResult } from '@/lib/comparison/comparisonEngine'

interface Props {
  result: ComparisonResult
}

export default function ComparisonExport({ result }: Props) {
  const [exported, setExported] = useState(false)

  function downloadJSON() {
    const json = JSON.stringify(result.exportData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flare-comparison-${result.left.id}-vs-${result.right.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  function downloadText() {
    const lines = [
      'FLARE — Fire & Life-Safety Analysis and Risk Explorer',
      'Scientific Comparison Summary',
      `Generated: ${new Date().toISOString()}`,
      `Team: WUNDERBAO`,
      '',
      '━'.repeat(60),
      '',
      `A: ${result.left.name} (${result.left.itemType === 'nasa' ? 'NASA Experiment' : 'FLARE Simulation'})`,
      `B: ${result.right.name} (${result.right.itemType === 'nasa' ? 'NASA Experiment' : 'FLARE Simulation'})`,
      '',
      `Compatibility: ${result.compatibility.level.toUpperCase()}`,
      '',
      ...result.compatibility.reasons.map(r => `  • ${r}`),
      '',
      '─'.repeat(60),
      'PARAMETER COMPARISON',
      '─'.repeat(60),
      '',
      ...result.diffs.map(d => [
        `${d.label}`,
        `  A: ${d.left.display} [${d.left.source}]`,
        `  B: ${d.right.display} [${d.right.source}]`,
        `  Significance: ${d.significance}`,
        d.explanation ? `  Note: ${d.explanation}` : '',
        '',
      ].join('\n')),
      '─'.repeat(60),
      'CAVEATS AND LIMITATIONS',
      '─'.repeat(60),
      '',
      ...result.compatibility.caveats.map(c => `• ${c}`),
      ...result.left.warnings.map(w => `• [A] ${w}`),
      ...result.right.warnings.map(w => `• [B] ${w}`),
      '',
      '─'.repeat(60),
      'DISCLAIMER',
      '─'.repeat(60),
      '',
      result.exportData.disclaimer as string,
    ]

    const text = lines.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flare-comparison-${result.left.id}-vs-${result.right.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={downloadText}
        className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-all"
      >
        📄 Export .txt
      </button>
      <button
        onClick={downloadJSON}
        className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-lg transition-all"
      >
        {exported ? '✅ Saved' : '💾 Export .json'}
      </button>
    </div>
  )
}

