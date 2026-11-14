'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useFlareAI, type AIMessage } from '@/hooks/useFlareAI'
import type { AgentClientAction, ExplanationLevel } from '@/lib/ai/flareAgentEngine'
import type {
  SimulationParams,
  SimulationResult,
  SimulationFrame,
  SimulationStatus,
  VisualizationLayer,
} from '@/lib/simulation/types'
import { DEFAULT_PARAMS } from '@/lib/simulation/types'
import { MATERIALS } from '@/lib/simulation/materialDatabase'
import { runSimulation } from '@/lib/simulation/combustionModel'
import {
  AgentStatusMark,
  LatticeLoader,
  type AgentActivityState,
} from '@/components/ui/reactbits/MotionPrimitives'

// ── Types ────────────────────────────────────────────────────────────────────

export interface AIAssistantProps {
  params?: SimulationParams
  result?: SimulationResult | null
  currentFrame?: SimulationFrame | null
  status?: SimulationStatus
  activeLayer?: VisualizationLayer
  activeRoute?: string
  pageContext?: Record<string, unknown>
  onApplyParams?: (patch: Partial<SimulationParams>, autoRun?: boolean) => void
  onLayerChange?: (layer: VisualizationLayer) => void
  onClose: () => void
}

// ── Context builder ───────────────────────────────────────────────────────────

function buildContext(
  params: SimulationParams,
  result: SimulationResult | null,
  currentFrame: SimulationFrame | null,
  status: SimulationStatus,
  activeLayer: VisualizationLayer,
  activeRoute: string,
  pageContext?: Record<string, unknown>
): Record<string, unknown> {
  const mat = MATERIALS[params.fuel]
  const gLabel =
    params.gravity < 0.01
      ? 'ISS microgravity (≈0 g)'
      : Math.abs(params.gravity - 1.62) < 0.5
      ? 'Lunar gravity (0.17 g)'
      : Math.abs(params.gravity - 3.72) < 0.5
      ? 'Martian gravity (0.38 g)'
      : 'Earth gravity (1 g)'

  return {
    activeRoute,
    activeLayer,
    fuel: params.fuel,
    fuelNote: mat ? `${mat.name} — ${mat.chemicalNote}` : params.fuel,
    gravity: Number(params.gravity.toFixed(4)),
    gravityLabel: gLabel,
    oxygenPercent: params.oxygenPercent,
    pressure: params.pressure,
    airflowVelocity: params.airflowVelocity,
    duration: params.duration,
    sampleDiameter: params.sampleDiameter,
    status,
    flameRadius: currentFrame?.flameRadius.toFixed(2) ?? null,
    flameTemperature: currentFrame?.flameTemperature.toFixed(0) ?? null,
    surfaceTemperature: currentFrame?.surfaceTemperature.toFixed(0) ?? null,
    o2NearFlame: currentFrame?.o2NearFlame.toFixed(1) ?? null,
    massLossRate: currentFrame?.massLossRate.toFixed(3) ?? null,
    heatReleaseRate: currentFrame?.heatReleaseRate.toFixed(3) ?? null,
    sootVolumeFraction: currentFrame?.sootVolumeFraction.toFixed(1) ?? null,
    flameAspectRatio: currentFrame?.flameAspectRatio.toFixed(2) ?? null,
    maxFlameTemp: result?.summary.maxFlameTemperature.toFixed(0) ?? null,
    burntFraction: result ? (result.summary.burntFraction * 100).toFixed(1) + '%' : null,
    extinguished: result?.summary.extinguished ?? null,
    ...(pageContext ?? {}),
  }
}

// ── Contextual suggestions (subtle, natural scientific prompts) ──────────────

function getSuggestions(
  params: SimulationParams,
  activeRoute: string
): Array<{ label: string; prompt: string }> {
  const isSpace = params.gravity < 0.1
  const matName = MATERIALS[params.fuel]?.name.split(' ')[0] ?? params.fuel

  if (activeRoute === 'research' || activeRoute === '/research') {
    return [
      {
        label: 'Find NASA experiments relevant to this scenario',
        prompt: 'Find NASA experiments relevant to this scenario and explain what they discovered.',
      },
      {
        label: 'Compare FLEX-2 droplet burn vs. Saffire I–VI',
        prompt:
          'Compare NASA FLEX-2 droplet combustion on the ISS with Saffire I–VI large-scale flame spread on uncrewed Cygnus spacecraft.',
      },
      {
        label: 'Generate a spacecraft fire-safety summary report',
        prompt: 'Generate a report using the current experiment data and NASA fire-safety benchmarks.',
      },
    ]
  }

  if (activeRoute === 'compare' || activeRoute === '/compare') {
    return [
      {
        label: `Compare ${matName} in 0g vs. Earth gravity`,
        prompt: 'Compare this experiment with the Earth gravity case.',
      },
      {
        label: 'What changes if I increase oxygen to 35%?',
        prompt: 'What changes if I increase oxygen to 35%?',
      },
      {
        label: 'Compare all 4 fuels (Cellulose, PMMA, PE, Paper)',
        prompt:
          'Compare the burning rate constant K, heat release, soot, and limiting oxygen index across all 4 fuels in the database.',
      },
    ]
  }

  return [
    {
      label: `Analyze my current ${matName} experiment`,
      prompt: `Analyze my current ${matName} experiment.`,
    },
    {
      label: isSpace
        ? 'Why is the flame behaving this way in zero gravity?'
        : 'Why does normal gravity stretch the flame upward?',
      prompt: isSpace
        ? 'Why is the flame behaving this way in zero gravity?'
        : 'Explain what I see in the flame visualization under Earth gravity compared to zero gravity.',
    },
    {
      label: 'What changes if I increase oxygen to 35%?',
      prompt: 'What changes if I increase oxygen to 35%?',
    },
    {
      label: isSpace
        ? 'Compare this experiment with the Earth gravity case'
        : 'Compare this experiment with the ISS microgravity case',
      prompt: isSpace
        ? 'Compare this experiment with the Earth gravity case.'
        : 'Compare this experiment with the ISS microgravity case (0.001 m/s²).',
    },
    {
      label: 'Find NASA experiments relevant to this scenario',
      prompt: 'Find NASA experiments relevant to this scenario.',
    },
    {
      label: 'Generate a report using the current experiment data',
      prompt: 'Generate a report using the current experiment data.',
    },
  ]
}

const EXPLANATION_LEVELS: Array<{
  id: ExplanationLevel
  label: string
  hint: string
}> = [
  { id: 'simple-analogy', label: 'Simple', hint: 'Accessible language & physical analogies' },
  { id: 'standard', label: 'Standard', hint: 'Balanced combustion physics & telemetry' },
  { id: 'deep-technical', label: 'Deep Math', hint: 'Full equations & dimensionless scaling' },
  { id: 'concise', label: 'Concise', hint: 'Rapid high-signal telemetry summary' },
]

// ── Markdown Renderer for Scientific Prose, Headings, Tables, and Lists ─────

function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n')
  const blocks: React.ReactNode[] = []
  let i = 0

  const renderInline = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700/80 font-mono text-xs text-cyan-200 tabular-nums"
          >
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={idx} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        )
      }
      return part
    })
  }

  while (i < lines.length) {
    const line = lines[i].trim()
    if (!line) {
      i++
      continue
    }

    // Markdown heading (### or ##)
    if (line.startsWith('### ') || line.startsWith('## ')) {
      const headingText = line.replace(/^#{2,3}\s+/, '')
      blocks.push(
        <h4
          key={`h-${i}`}
          className="font-display text-sm font-semibold text-white pt-2 pb-0.5 tracking-tight"
        >
          {renderInline(headingText)}
        </h4>
      )
      i++
      continue
    }

    // Markdown table block
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      const rows = tableLines
        .filter((r) => !/^\|[\s:-]+\|$/.test(r.replace(/\|/g, '|')))
        .filter((r) => !r.includes('---'))
        .map((r) =>
          r
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim())
        )
      if (rows.length > 0) {
        const header = rows[0]
        const body = rows.slice(1)
        blocks.push(
          <div
            key={`tbl-${i}`}
            className="my-2.5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70"
          >
            <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300">
                  {header.map((h, cIdx) => (
                    <th key={cIdx} className="px-3 py-2 font-semibold">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {body.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/40">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-slate-200">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    // Bullet list block
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
      ) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-4 list-disc text-slate-200">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered list block
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-4 list-decimal text-slate-200">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Standard paragraph
    blocks.push(
      <p key={`p-${i}`} className="text-sm text-slate-200 leading-relaxed my-1.5">
        {renderInline(line)}
      </p>
    )
    i++
  }

  return <div className="space-y-1.5">{blocks}</div>
}

// ── Message bubble (calm, readable scientific conversation card) ─────────────

function MessageBubble({
  msg,
  onExecuteAction,
  onFollowUp,
}: {
  msg: AIMessage
  onExecuteAction: (msgId: string, action: AgentClientAction) => void
  onFollowUp: (prompt: string) => void
}) {
  const [showTools, setShowTools] = useState(false)

  if (msg.from === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white bg-slate-800/90 border border-slate-700/80 leading-relaxed shadow-sm">
          {msg.text}
        </div>
      </div>
    )
  }

  if (msg.error) {
    return (
      <div className="rounded-xl px-4 py-3 text-sm text-red-200 bg-red-950/30 border border-red-500/30">
        {msg.text}
      </div>
    )
  }

  // Combine sections cleanly into one unified response card so the UI isn't fragmented into 4 colored boxes
  const hasSections = Boolean(msg.sections && msg.sections.length > 0)

  return (
    <div className="flex flex-col gap-2.5">
      {/* Subtle Tool Execution & Adaptation Indicator Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">FLARE Agent</span>
          {msg.toolCalls && msg.toolCalls.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTools((v) => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/25 transition-colors cursor-pointer"
              title="Inspect executed scientific tools and inputs"
            >
              <span className="text-emerald-400">✓</span>
              <span>
                {msg.toolCalls
                  .map((t) =>
                    t.name === 'run_combustion_simulation'
                      ? 'D² Law Solver'
                      : t.name === 'compare_combustion_states'
                      ? 'State Comparison'
                      : t.name === 'search_nasa_experiments'
                      ? 'NASA Archive'
                      : t.name === 'retrieve_research_library'
                      ? 'Research Library'
                      : t.name === 'analyze_material_properties'
                      ? 'Material Analysis'
                      : t.name === 'generate_research_report'
                      ? 'Report Generator'
                      : 'Lab Control'
                  )
                  .join(' · ')}
              </span>
              <span className="text-slate-400 text-[10px]">{showTools ? '▴' : '▾'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {msg.adaptation?.adaptedToConfusion && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
              Simplified explanation
            </span>
          )}
          {msg.adaptation?.handledCorrection && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              Updated parameters
            </span>
          )}
        </div>
      </div>

      {/* Collapsible Tool Execution Details */}
      {showTools && msg.toolCalls && msg.toolCalls.length > 0 && (
        <div className="rounded-xl px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 space-y-1.5">
          {msg.toolCalls.map((tc, idx) => (
            <div key={idx} className="text-xs font-mono text-slate-300 leading-relaxed">
              <span className="text-emerald-400 mr-1.5">✓</span>
              <span className="font-semibold text-slate-100">{tc.label}:</span>{' '}
              <span className="text-slate-400">{tc.summary}</span>
            </div>
          ))}
        </div>
      )}

      {/* Unified Agent Response Surface */}
      <div className="rounded-2xl rounded-tl-sm px-5 py-4 bg-slate-900/65 border border-slate-800/90 space-y-4">
        {hasSections ? (
          <div className="space-y-4 divide-y divide-slate-800/70">
            {msg.sections!.map((section, idx) => {
              const sectionHeading =
                section.id === 'observe'
                  ? 'Observation & Active State'
                  : section.id === 'explain'
                  ? 'Physical Mechanism'
                  : section.id === 'evidence'
                  ? 'NASA & Quantitative Evidence'
                  : section.id === 'limits'
                  ? 'Model Scope & Limitations'
                  : section.id === 'next'
                  ? 'Next Investigation'
                  : section.id
              return (
                <div key={section.id} className={idx > 0 ? 'pt-3.5' : ''}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300/90 mb-1.5">
                    {sectionHeading}
                  </h3>
                  <FormattedText text={section.text} />
                </div>
              )
            })}
          </div>
        ) : (
          <FormattedText text={msg.text ?? msg.reply ?? ''} />
        )}

        {/* Confirmation-First Experiment Action Card */}
        {msg.clientActions && msg.clientActions.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            {msg.clientActions.map((act, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{act.label}</span>
                    {act.requiresConfirmation && !act.executed && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                        Awaiting Confirmation
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>
                </div>

                {act.executed ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                    ✓ Applied to Experiment
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onExecuteAction(msg.id, act)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer shrink-0 shadow-sm"
                  >
                    <span>
                      {act.requiresConfirmation ? 'Confirm & Apply' : 'Apply to Lab'}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Inline Source References */}
        {msg.citations && msg.citations.length > 0 && (
          <div className="pt-3 border-t border-slate-800/70 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Sources:</span>
            {msg.citations.map((cit) => (
              <a
                key={cit.id}
                href={cit.url ?? 'https://psi.nasa.gov'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] text-slate-300 hover:text-cyan-200 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 transition-colors"
                title={cit.note ? `${cit.title} — ${cit.note}` : cit.title}
              >
                <span>{cit.title.split('—')[0].trim()}</span>
                <span className="text-slate-500 text-[10px]">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Follow-Up Suggestions */}
      {msg.followUps && msg.followUps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {msg.followUps.map((fu, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onFollowUp(fu)}
              className="text-left text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-full bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              {fu}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIAssistant({
  params = DEFAULT_PARAMS,
  result = null,
  currentFrame = null,
  status = 'idle',
  activeLayer = 'structure',
  activeRoute = 'science',
  pageContext,
  onApplyParams,
  onLayerChange,
  onClose,
}: AIAssistantProps) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [showWorkspaceTools, setShowWorkspaceTools] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const latestTurnRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Compute fallback preview frame if opened outside /science so the agent always has live D² telemetry
  const computedResult = useMemo(
    () => result ?? runSimulation(params),
    [result, params]
  )
  const computedFrame = currentFrame ?? computedResult.frames[0] ?? null

  const handleClientAction = useCallback(
    (action: AgentClientAction) => {
      const payload = action.payload ?? {}
      if (action.type === 'switch_visualization_layer' && payload.layer) {
        if (onLayerChange) {
          onLayerChange(payload.layer as VisualizationLayer)
        }
      } else if (
        action.type === 'apply_simulation_params' ||
        action.type === 'run_simulation'
      ) {
        const patch = payload as Partial<SimulationParams>
        if (onApplyParams) {
          onApplyParams(patch, action.type === 'run_simulation')
        } else {
          // If opened from /research, /library, /insights, or /compare, hand off to /science with URL params
          const merged = { ...params, ...patch }
          const sp = new URLSearchParams({
            fuel: merged.fuel,
            gravity: String(merged.gravity),
            o2: String(merged.oxygenPercent),
            pressure: String(merged.pressure),
            airflow: String(merged.airflowVelocity),
          })
          router.push(`/science?${sp.toString()}`)
          onClose()
        }
      } else if (action.type === 'navigate_route' && payload.href) {
        router.push(String(payload.href))
        onClose()
      }
    },
    [onLayerChange, onApplyParams, params, router, onClose]
  )

  const {
    messages,
    isLoading,
    isDemo,
    providerLabel,
    explanationLevel,
    setExplanationLevel,
    sendMessage,
    executeAction,
    clearMessages,
  } = useFlareAI({
    mode: 'science',
    onClientAction: handleClientAction,
  })

  const context = useMemo(
    () =>
      buildContext(
        params,
        computedResult,
        computedFrame,
        status,
        activeLayer,
        activeRoute,
        pageContext
      ),
    [params, computedResult, computedFrame, status, activeLayer, activeRoute, pageContext]
  )

  const suggestions = useMemo(
    () => getSuggestions(params, activeRoute),
    [params, activeRoute]
  )

  useEffect(() => {
    if (isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } else if (messages.length > 0) {
      latestTurnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [messages, isLoading])

  const handleSend = useCallback(
    (text: string, levelOverride?: ExplanationLevel) => {
      if (!text.trim() || isLoading) return
      sendMessage(text, context, levelOverride)
      setInput('')
      inputRef.current?.focus()
    },
    [sendMessage, context, isLoading]
  )

  const autoPromptSentRef = useRef(false)
  useEffect(() => {
    if (typeof window === 'undefined' || autoPromptSentRef.current) return
    const sp = new URLSearchParams(window.location.search)
    const promptParam = sp.get('ai_prompt')
    if (promptParam && promptParam.trim()) {
      autoPromptSentRef.current = true
      sendMessage(promptParam.trim(), context)
    }
  }, [sendMessage, context])

  const mat = MATERIALS[params.fuel]
  const matDisplayName = mat?.name.split('(')[0].trim() ?? params.fuel
  const gravityDisplay =
    params.gravity < 0.01
      ? `${params.gravity.toFixed(3)} m/s² (0g)`
      : `${params.gravity.toFixed(2)} m/s²`
  const gravityCompactDisplay =
    params.gravity < 0.01
      ? `0g · ${params.gravity.toFixed(3)}`
      : `${params.gravity.toFixed(2)} m/s²`

  const lastMessage = messages[messages.length - 1]
  const agentActivityState: AgentActivityState = isLoading
    ? 'executing_tools'
    : lastMessage?.error
    ? 'error'
    : messages.length > 0
    ? 'completed'
    : 'idle'

  return (
    <div className="flex flex-col h-full w-full bg-[#060c18] text-slate-100">
      {/* ── 1. Clean Workspace Header ── */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#080f1e] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-300 shrink-0">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
              <path d="M9 21h6" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-white tracking-tight">
              FLARE Scientific Agent
            </h2>
            <div className="mt-0.5">
              <AgentStatusMark
                state={agentActivityState}
                isLiveCloud={isDemo === false}
                variant="science"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowWorkspaceTools((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              showWorkspaceTools
                ? 'bg-slate-800 text-white border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border-slate-800'
            }`}
            title="Configure explanation depth and view connected scientific tools"
          >
            Tools &amp; Depth
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
              title="Start a new conversation"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close FLARE Scientific Agent"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer text-sm"
            title="Close workspace"
          >
            ✕
          </button>
        </div>
      </header>

      {/* ── Collapsible Tools & Explanation Depth Panel ── */}
      {showWorkspaceTools && (
        <div className="px-5 py-3.5 bg-slate-950/95 border-b border-slate-800/90 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-300">Explanation Style</span>
            <div className="flex items-center gap-1 flex-wrap">
              {EXPLANATION_LEVELS.map((lvl) => {
                const active = explanationLevel === lvl.id
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExplanationLevel(lvl.id)}
                    title={lvl.hint}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {lvl.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">
              Connected Scientific Tools
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-slate-300">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                ✓ D² Law Solver
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                ✓ NASA PSI/NTRS Archive
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                ✓ 4-Polymer Material DB
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                ✓ Live Chamber Control
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
              {providerLabel ??
                'Runs analytical D² Law calculations and NASA database lookups on every turn. Parameter changes always ask for confirmation before updating the chamber.'}
            </p>
          </div>
        </div>
      )}

      {/* ── 2. Cohesive Experiment Context Panel ── */}
      <section
        aria-label="Active Experiment Context"
        className="px-5 py-3 bg-slate-900/45 border-b border-slate-800/80 shrink-0"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Active Experiment Context
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {status === 'running'
              ? '● Live Burn'
              : status === 'completed'
              ? '● Burn Complete'
              : '● Ready'}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 rounded-xl bg-slate-950/70 border border-slate-800/80 px-3 py-2">
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 truncate">Material</div>
            <div className="text-xs font-mono font-semibold text-slate-100 truncate">
              {matDisplayName}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 truncate">Gravity</div>
            <div className="text-xs font-mono font-semibold tabular-nums text-slate-100 truncate">
              {gravityCompactDisplay}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 truncate">Oxygen</div>
            <div className="text-xs font-mono font-semibold tabular-nums text-slate-100 truncate">
              {params.oxygenPercent}% O₂
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 truncate">Airflow</div>
            <div className="text-xs font-mono font-semibold tabular-nums text-slate-100 truncate">
              {params.airflowVelocity.toFixed(2)} m/s
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 truncate">Temp</div>
            <div className="text-xs font-mono font-semibold tabular-nums text-slate-100 truncate">
              {computedFrame ? `${computedFrame.flameTemperature.toFixed(0)} K` : '—'}
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 truncate">HRR</div>
            <div className="text-xs font-mono font-semibold tabular-nums text-slate-100 truncate">
              {computedFrame ? `${computedFrame.heatReleaseRate.toFixed(1)} W` : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Main Agent Conversation Area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        {messages.length === 0 && (
          <div className="flex flex-col gap-5 my-auto py-2">
            {/* Conversational Agent Introduction */}
            <div className="rounded-2xl p-5 bg-slate-900/55 border border-slate-800/90 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-white">
                  Ready to analyze your {matDisplayName} experiment
                </h3>
                <span className="text-[11px] font-mono text-cyan-300/90 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                  D² Law Active
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your chamber is currently configured for{' '}
                <strong className="font-medium text-white">{matDisplayName}</strong> at{' '}
                <span className="font-mono text-xs text-cyan-200">{gravityDisplay}</span>,{' '}
                <span className="font-mono text-xs text-cyan-200">
                  {params.oxygenPercent}% O₂
                </span>
                , and{' '}
                <span className="font-mono text-xs text-cyan-200">
                  {params.airflowVelocity.toFixed(2)} m/s
                </span>{' '}
                ventilation. Ask me to explain the 3D flame behavior, run counterfactual oxygen
                or gravity comparisons, query NASA ISS &amp; Cygnus records, or generate a
                structured report.
              </p>
            </div>

            {/* Subtle Contextual Suggestions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 px-0.5">
                Suggested investigations
              </p>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(s.prompt)}
                    className="flex items-center justify-between gap-3 text-left rounded-xl px-4 py-3 text-sm text-slate-200 hover:text-white bg-slate-900/40 hover:bg-slate-900/85 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <span className="leading-snug">{s.label}</span>
                    <span className="text-slate-500 group-hover:text-cyan-300 transition-colors shrink-0 text-xs">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isLatestTurn = idx >= messages.length - 2 && msg.from === 'user'
          return (
            <div key={msg.id} ref={isLatestTurn ? latestTurnRef : undefined}>
              <MessageBubble
                msg={msg}
                onExecuteAction={executeAction}
                onFollowUp={(prompt) => handleSend(prompt)}
              />
            </div>
          )
        })}

        {isLoading && (
          <LatticeLoader
            label="Running D² Law combustion solver & synthesizing scientific analysis…"
            variant="science"
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Subtle Follow-Up Adaptation Bar (when conversation is active) ── */}
      {messages.length > 0 && !isLoading && (
        <div className="px-5 py-2 bg-[#070d1b] border-t border-slate-800/70 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] text-slate-400 shrink-0">Adapt response:</span>
          <button
            type="button"
            onClick={() =>
              handleSend('Explain these results in simpler language.', 'simple-analogy')
            }
            className="px-2.5 py-1 rounded-md text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 shrink-0 cursor-pointer transition-colors"
          >
            Simpler language
          </button>
          <button
            type="button"
            onClick={() =>
              handleSend(
                'Give me the deep technical equations and dimensionless scaling for this.',
                'deep-technical'
              )
            }
            className="px-2.5 py-1 rounded-md text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 shrink-0 cursor-pointer transition-colors"
          >
            Deep equations
          </button>
          <button
            type="button"
            onClick={() => handleSend('Compare this experiment with the Earth gravity case.')}
            className="px-2.5 py-1 rounded-md text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 shrink-0 cursor-pointer transition-colors"
          >
            Compare vs. 1g
          </button>
        </div>
      )}

      {/* ── 4. Prominent Conversational Message Input ── */}
      <div className="shrink-0 px-5 py-3.5 pb-safe border-t border-slate-800/90 bg-[#080f1e]">
        <div className="flex items-end gap-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 focus-within:border-cyan-400/70 px-3.5 py-2.5 transition-colors">
          <textarea
            ref={inputRef}
            rows={2}
            aria-label="Ask the FLARE Scientific Agent a question or research task"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(input)
              }
            }}
            placeholder="Ask about your active burn, compare 0g vs. 1g, query NASA experiments, or generate a report…"
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-slate-400 outline-none leading-relaxed"
          />
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="min-h-[40px] rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
