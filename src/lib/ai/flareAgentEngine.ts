// ══════════════════════════════════════════════════════════════════════════════
//  FLARE — Unified Intelligent AI Agent Engine
//  Powers both:
//    1. FLARE Scientific Agent (Scientific Experience: /science, /research, /compare, /library, /insights)
//    2. FLARE Kids Guide — Sparky (Kids Experience: /kids)
//
//  Capabilities:
//    - Real tool selection & execution against FLARE's D² Law simulation engine,
//      NASA experiment database, material database, comparison engine, and library
//    - Multi-turn conversation memory, pronoun/follow-up resolution, user
//      correction handling, and dynamic explanation-level adaptation
//    - Strict safety guardrails (especially for Kids Mode: zero fire-starting
//      instructions, zero hazardous home experiments, zero PII collection)
//    - Transparent provenance: distinguishes Live Gemini LLM vs. Local Scientific
//      Agent Engine, and Measured NASA Data vs. D² Law Model Estimates
// ══════════════════════════════════════════════════════════════════════════════

import { runSimulation } from '@/lib/simulation/combustionModel'
import { MATERIALS } from '@/lib/simulation/materialDatabase'
import type {
  FuelMaterial,
  SimulationParams,
  VisualizationLayer,
} from '@/lib/simulation/types'
import { NASA_EXPERIMENTS, type NASAExperiment } from '@/data/nasaExperiments'
import {
  RESEARCH_RESOURCES,
  SCIENTIFIC_INSIGHTS,
  type ResearchResource,
} from '@/data/researchLibrary'
import { SIMULATION_SCENARIOS } from '@/data/simulationScenarios'
import { KIDS_WORLDS, type KidsWorldId } from '@/data/kidsWorlds'

// ── Shared Types ─────────────────────────────────────────────────────────────

export type AgentMode = 'science' | 'kids'

export type ExplanationLevel =
  | 'standard'
  | 'simple-analogy'
  | 'deep-technical'
  | 'concise'

export interface AgentHistoryItem {
  role: 'user' | 'assistant'
  text: string
  topic?: string
  toolNames?: string[]
}

export interface AgentToolCallRecord {
  id: string
  name:
    | 'run_combustion_simulation'
    | 'compare_combustion_states'
    | 'search_nasa_experiments'
    | 'retrieve_research_library'
    | 'analyze_material_properties'
    | 'generate_research_report'
    | 'navigate_or_configure_flare'
  label: string
  status: 'completed' | 'requires_confirmation' | 'error'
  summary: string
  input: Record<string, unknown>
  output?: Record<string, unknown>
}

export interface AgentClientAction {
  id: string
  type:
    | 'apply_simulation_params'
    | 'run_simulation'
    | 'switch_visualization_layer'
    | 'navigate_route'
    | 'kids_open_sandbox'
    | 'kids_select_world'
  label: string
  description: string
  requiresConfirmation?: boolean
  autoExecuted?: boolean
  payload: Record<string, unknown>
}

export interface AgentCitation {
  id: string
  title: string
  sourceType: 'NASA Experiment' | 'Technical Report' | 'D² Law Model' | 'Safety Standard'
  url?: string
  note?: string
}

export interface AISection {
  id: string
  label: string
  icon: string
  text: string
}

export interface AgentSessionAdaptation {
  explanationLevel: ExplanationLevel
  detectedIntent: string
  adaptedToConfusion: boolean
  handledCorrection: boolean
  resolvedFollowUp: boolean
  activeTopic: string
}

export interface AIChatRequest {
  mode: AgentMode
  message: string
  context: Record<string, unknown>
  history?: AgentHistoryItem[]
  sessionPreferences?: {
    explanationLevel?: ExplanationLevel
  }
}

export interface AIChatResponse {
  mode: AgentMode
  /** Natural conversational response in Markdown / readable paragraphs */
  reply: string
  /** Backwards-compatible plain text field */
  text?: string
  /** Optional structured scientific sections when helpful (not forced on every turn) */
  sections?: AISection[]
  /** Executed tool calls with real inputs & verified outputs */
  toolCalls?: AgentToolCallRecord[]
  /** Real interactive client actions the user or UI can execute */
  clientActions?: AgentClientAction[]
  /** Verified NASA / literature / model citations used in this turn */
  citations?: AgentCitation[]
  /** Contextual follow-up prompts tailored to the current turn */
  followUps?: string[]
  /** Session adaptation metadata showing how the agent adapted to the user */
  adaptation?: AgentSessionAdaptation
  /** Companion mood for Kids Mode */
  mood?: 'wave' | 'happy' | 'excited' | 'thinking' | 'explain' | 'surprised' | 'concerned'
  /** True when running without a cloud GEMINI_API_KEY (using Local Scientific Agent Engine) */
  isDemo: boolean
  /** Explicit provider label for honest provenance */
  providerLabel: string
  /** Safety flag if a guardrail was triggered */
  safetyRedirected?: boolean
  error?: string
}

// ── 1. Safety Guardrails (Kids & General Safety) ─────────────────────────────

export interface SafetyCheckResult {
  safe: boolean
  reason?: 'fire-hazard' | 'pii-privacy' | 'inappropriate'
  redirectReply?: string
  followUps?: string[]
}

export function checkSafetyGuardrails(
  message: string,
  mode: AgentMode
): SafetyCheckResult {
  const q = message.toLowerCase().trim()

  // Check for instructions to start fires, make explosives, or perform real home fire experiments
  const dangerousFirePatterns = [
    /how\s+(do\s+i|to|can\s+i)\s+(start|make|light|create|set|build)\s+(a\s+)?(real\s+)?(fire|flame|bomb|explosi|firework|molotov|torch)/i,
    /burn\s+(my|a|the|some)\s+(house|room|school|toy|shirt|paper|plastic|curtain|carpet|wood|hair|hand)/i,
    /play\s+with\s+(matches|lighter|fire|gasoline|alcohol|bleach|chemicals)/i,
    /experiment\s+at\s+home\s+with\s+(fire|matches|lighter|flame|burning)/i,
    /can\s+i\s+(light|burn|set\s+fire)/i,
    /make\s+(something|it)\s+(explode|catch\s+fire\s+at\s+home)/i,
  ]

  if (dangerousFirePatterns.some((pat) => pat.test(q))) {
    if (mode === 'kids') {
      return {
        safe: false,
        reason: 'fire-hazard',
        redirectReply:
          "Whoa there, Space Explorer! 🛡️ I can never give instructions for lighting real fires or testing flames at home — real fire is dangerous and should only be handled by trained adults and firefighters.\n\nEven NASA astronauts never light open fires in their cabin! Instead, they test fire safely inside a triple-sealed steel chamber called the **Combustion Integrated Rack (CIR)** on the Space Station, or use computer simulators just like **FLARE**. Want to test how a virtual flame behaves in our safe Space Sandbox instead?",
        followUps: [
          'How does NASA test fire safely inside the Space Station?',
          'Try a safe virtual flame test in the Space Sandbox!',
          'Why do astronauts use special fire detectors?',
        ],
      }
    }

    return {
      safe: false,
      reason: 'fire-hazard',
      redirectReply:
        'I cannot provide instructions for igniting real fires, creating hazardous combustion setups, or handling incendiary materials. I can, however, explain the underlying thermodynamics and transport physics of combustion, or run a virtual simulation in the FLARE D² Law chamber.',
      followUps: [
        'How does the NASA Combustion Integrated Rack (CIR) contain orbital experiments?',
        'Explain NASA-STD-6001B spacecraft material flammability testing',
        'Run a virtual D² Law simulation in the FLARE chamber',
      ],
    }
  }

  // Check for PII / personal information sharing in Kids Mode
  const piiPatterns = [
    /my\s+(full\s+)?name\s+is\s+[a-z]+\s+[a-z]+/i,
    /i\s+live\s+(at|in)\s+\d+/i,
    /my\s+(address|phone\s+number|email|password|school\s+is)/i,
    /what\s+is\s+my\s+(name|address|phone|location)/i,
  ]

  if (mode === 'kids' && piiPatterns.some((pat) => pat.test(q))) {
    return {
      safe: false,
      reason: 'pii-privacy',
      redirectReply:
        "Good space-safety tip: you never need to share your real name, address, school, or phone number with me! 🛡️ I don't collect personal information — we can just call you **Space Explorer**! Now, what cool space or flame mystery should we investigate together?",
      followUps: [
        'Why does fire form a sphere in space?',
        'What are invisible cool flames?',
        'How do astronauts put out a fire in orbit?',
      ],
    }
  }

  return { safe: true }
}

// ── 2. Parameter Validation & Clamping ───────────────────────────────────────

export function clampSimulationParams(
  raw: Partial<SimulationParams>,
  fallback: SimulationParams
): SimulationParams {
  const validFuels: FuelMaterial[] = ['cellulose', 'pmma', 'polyethylene', 'paper']
  const clamp = (val: unknown, min: number, max: number, def: number) => {
    const n = Number(val)
    if (Number.isNaN(n)) return def
    return Math.min(max, Math.max(min, n))
  }

  const fuelCandidate = String(raw.fuel ?? fallback.fuel).toLowerCase() as FuelMaterial
  const fuel: FuelMaterial = validFuels.includes(fuelCandidate)
    ? fuelCandidate
    : fallback.fuel

  return {
    fuel,
    gravity: clamp(raw.gravity, 0.001, 9.81, fallback.gravity),
    oxygenPercent: Math.round(clamp(raw.oxygenPercent, 15, 100, fallback.oxygenPercent)),
    pressure: Number(clamp(raw.pressure, 0.1, 1.5, fallback.pressure).toFixed(2)),
    airflowVelocity: Number(
      clamp(raw.airflowVelocity, 0.0, 0.5, fallback.airflowVelocity).toFixed(2)
    ),
    duration: Math.round(clamp(raw.duration, 10, 120, fallback.duration)),
    sampleDiameter: Number(
      clamp(raw.sampleDiameter, 3, 10, fallback.sampleDiameter).toFixed(1)
    ),
  }
}

export function extractCurrentSimParams(context: Record<string, unknown>): SimulationParams {
  // Handle Kids mode simplified context ('space' / 'earth', 'low' / 'normal' / 'high', 'cloth' / 'paper' / 'plastic')
  const rawGrav = context.gravity
  let gravity = 0.001
  if (rawGrav === 'space') gravity = 0.001
  else if (rawGrav === 'earth') gravity = 9.81
  else if (rawGrav !== undefined && !Number.isNaN(Number(rawGrav))) {
    gravity = Number(rawGrav)
  }

  let oxygenPercent = 21
  if (context.o2Level === 'low') oxygenPercent = 16
  else if (context.o2Level === 'high') oxygenPercent = 32
  else if (context.oxygenPercent !== undefined && !Number.isNaN(Number(context.oxygenPercent))) {
    oxygenPercent = Number(context.oxygenPercent)
  }

  let fuel: FuelMaterial = 'cellulose'
  const rawFuel = String(context.fuel ?? 'cellulose').toLowerCase()
  if (rawFuel === 'cloth' || rawFuel === 'cellulose' || rawFuel === 'cotton') fuel = 'cellulose'
  else if (rawFuel === 'plastic' || rawFuel === 'pmma' || rawFuel === 'acrylic') fuel = 'pmma'
  else if (rawFuel === 'polyethylene' || rawFuel === 'hdpe') fuel = 'polyethylene'
  else if (rawFuel === 'paper') fuel = 'paper'

  return clampSimulationParams(
    {
      fuel,
      gravity,
      oxygenPercent,
      pressure: Number(context.pressure ?? 1.0),
      airflowVelocity: Number(context.airflowVelocity ?? 0.0),
      duration: Number(context.duration ?? 60),
      sampleDiameter: Number(context.sampleDiameter ?? 5),
    },
    {
      fuel: 'cellulose',
      gravity: 0.001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.0,
      duration: 60,
      sampleDiameter: 5,
    }
  )
}

export function formatGravityEnvironment(g: number): string {
  if (g < 0.02) return `ISS Microgravity (${g} m/s², ≈0g)`
  if (Math.abs(g - 1.62) < 0.35) return `Lunar Gravity (${g.toFixed(2)} m/s², 0.16g)`
  if (Math.abs(g - 3.72) < 0.45) return `Martian Gravity (${g.toFixed(2)} m/s², 0.38g)`
  if (Math.abs(g - 9.81) < 0.5) return `Earth Normal Gravity (${g.toFixed(2)} m/s², 1.0g)`
  return `Partial Gravity (${g.toFixed(2)} m/s²)`
}

// ── 3. Real Server-Side Tool Implementations ─────────────────────────────────

/**
 * Tool 1: Run the analytical D² Law combustion simulation engine with validated parameters
 */
export function toolRunCombustionSimulation(
  overrides: Partial<SimulationParams>,
  baseParams: SimulationParams
): {
  toolRecord: AgentToolCallRecord
  params: SimulationParams
  metrics: {
    fuelName: string
    gravityLabel: string
    initialFlameRadiusMm: number
    peakTemperatureK: number
    peakTemperatureC: number
    avgHeatReleaseW: number
    initialMassLossMgS: number
    flameAspectRatio: number
    sootPpm: number
    dSquaredConstantK: number
    burnoutTimeS: number | null
    extinctionTimeS: number | null
    extinguished: boolean
    burntFractionPercent: number
  }
} {
  const params = clampSimulationParams(overrides, baseParams)
  const simResult = runSimulation(params)
  const firstFrame = simResult.frames[0]
  const midFrame =
    simResult.frames[Math.min(8, simResult.frames.length - 1)] ?? firstFrame
  const mat = MATERIALS[params.fuel]

  // Compute effective D² Law burning rate constant K = (D₀² - D(t)²) / t
  const dtSample = Math.max(0.25, midFrame.time)
  const dSquaredConstantK =
    firstFrame && midFrame && midFrame.time > 0
      ? Math.max(0, (firstFrame.dSquared - midFrame.dSquared) / dtSample)
      : 0

  const metrics = {
    fuelName: mat.name,
    gravityLabel: formatGravityEnvironment(params.gravity),
    initialFlameRadiusMm: Number((firstFrame?.flameRadius ?? 0).toFixed(2)),
    peakTemperatureK: Math.round(simResult.summary.maxFlameTemperature),
    peakTemperatureC: Math.round(simResult.summary.maxFlameTemperature - 273.15),
    avgHeatReleaseW: Number(simResult.summary.avgHeatReleaseRate.toFixed(2)),
    initialMassLossMgS: Number((firstFrame?.massLossRate ?? 0).toFixed(3)),
    flameAspectRatio: Number((firstFrame?.flameAspectRatio ?? 1).toFixed(2)),
    sootPpm: Number((firstFrame?.sootVolumeFraction ?? 0).toFixed(2)),
    dSquaredConstantK: Number(dSquaredConstantK.toFixed(3)),
    burnoutTimeS: simResult.summary.burnoutTime,
    extinctionTimeS: simResult.summary.extinctionTime,
    extinguished: simResult.summary.extinguished,
    burntFractionPercent: Number((simResult.summary.burntFraction * 100).toFixed(1)),
  }

  return {
    params,
    metrics,
    toolRecord: {
      id: `tool-sim-${Date.now()}`,
      name: 'run_combustion_simulation',
      label: `Executed D² Law Simulation (${mat.name}, ${params.oxygenPercent}% O₂, ${params.gravity} m/s²)`,
      status: 'completed',
      summary: metrics.extinguished
        ? `Flame extinguished at t = ${metrics.extinctionTimeS ?? 0}s (O₂ or thermal threshold not met).`
        : `Computed D² Law burn: K = ${metrics.dSquaredConstantK} mm²/s, T_peak = ${metrics.peakTemperatureK} K (${metrics.peakTemperatureC} °C), HRR = ${metrics.avgHeatReleaseW} W, R_flame = ${metrics.initialFlameRadiusMm} mm, AR = ${metrics.flameAspectRatio}:1.`,
      input: { ...params },
      output: { ...metrics },
    },
  }
}

/**
 * Tool 2: Compare two combustion states quantitatively using the D² Law engine
 */
export function toolCompareCombustionStates(
  stateA: SimulationParams,
  stateB: SimulationParams,
  labelA: string,
  labelB: string
) {
  const runA = toolRunCombustionSimulation({}, stateA)
  const runB = toolRunCombustionSimulation({}, stateB)

  const deltaTempK = runB.metrics.peakTemperatureK - runA.metrics.peakTemperatureK
  const deltaHrrPct =
    runA.metrics.avgHeatReleaseW > 0
      ? Number(
          (
            ((runB.metrics.avgHeatReleaseW - runA.metrics.avgHeatReleaseW) /
              runA.metrics.avgHeatReleaseW) *
            100
          ).toFixed(1)
        )
      : 0
  const deltaK = Number(
    (runB.metrics.dSquaredConstantK - runA.metrics.dSquaredConstantK).toFixed(3)
  )
  const deltaRadiusMm = Number(
    (runB.metrics.initialFlameRadiusMm - runA.metrics.initialFlameRadiusMm).toFixed(2)
  )

  const toolRecord: AgentToolCallRecord = {
    id: `tool-cmp-${Date.now()}`,
    name: 'compare_combustion_states',
    label: `Compared ${labelA} vs. ${labelB}`,
    status: 'completed',
    summary: `ΔT_peak = ${deltaTempK >= 0 ? '+' : ''}${deltaTempK} K, ΔHRR = ${
      deltaHrrPct >= 0 ? '+' : ''
    }${deltaHrrPct}%, ΔK = ${deltaK >= 0 ? '+' : ''}${deltaK} mm²/s, Aspect Ratio ${
      runA.metrics.flameAspectRatio
    }:1 → ${runB.metrics.flameAspectRatio}:1.`,
    input: { stateA, stateB, labelA, labelB },
    output: {
      labelA,
      labelB,
      metricsA: runA.metrics,
      metricsB: runB.metrics,
      deltas: {
        deltaTempK,
        deltaHrrPct,
        deltaK,
        deltaRadiusMm,
      },
    },
  }

  return { toolRecord, runA, runB, deltaTempK, deltaHrrPct, deltaK, deltaRadiusMm }
}

/**
 * Tool 3: Search verified NASA microgravity combustion investigations
 */
export function toolSearchNasaExperiments(
  query: string,
  params?: SimulationParams
): {
  toolRecord: AgentToolCallRecord
  experiments: NASAExperiment[]
  citations: AgentCitation[]
} {
  const q = query.toLowerCase()
  const scored = NASA_EXPERIMENTS.map((exp) => {
    let score = 0
    if (q.includes(exp.id.toLowerCase()) || q.includes(exp.name.toLowerCase())) score += 10
    if (q.includes(exp.program.toLowerCase())) score += 7
    if (exp.tags.some((t) => q.includes(t.toLowerCase()))) score += 4
    if (q.includes('cool flame') && exp.program === 'FLEX') score += 8
    if (q.includes('smoke') && exp.program === 'SAME') score += 8
    if ((q.includes('large') || q.includes('cygnus') || q.includes('saffire')) && exp.program === 'Saffire') score += 8
    if ((q.includes('solid') || q.includes('fabric') || q.includes('cotton') || q.includes('pmma')) && exp.program === 'BASS') score += 6
    if (q.includes('airflow') || q.includes('ventilation')) {
      if (exp.program === 'BASS' || exp.program === 'Saffire' || exp.program === 'SLICE') score += 5
    }
    if (params) {
      if (params.fuel === 'pmma' && exp.fuelMaterial.some((m) => m.toLowerCase().includes('pmma'))) score += 2
      if (params.fuel === 'cellulose' && exp.fuelMaterial.some((m) => m.toLowerCase().includes('cotton') || m.toLowerCase().includes('cellulose'))) score += 2
      if (params.airflowVelocity > 0.08 && (exp.program === 'BASS' || exp.program === 'Saffire')) score += 2
      if (params.airflowVelocity <= 0.05 && exp.program === 'FLEX') score += 2
    }
    return { exp, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 3).map((s) => s.exp)

  const citations: AgentCitation[] = top.map((exp) => ({
    id: exp.id,
    title: `${exp.name} — ${exp.fullName} (${exp.platform})`,
    sourceType: 'NASA Experiment',
    url: exp.nasaUrl || exp.psiSearchUrl,
    note:
      exp.program === 'Saffire'
        ? 'Conducted on uncrewed Cygnus cargo spacecraft after ISS departure'
        : `Data availability: ${exp.dataAvailability}`,
  }))

  return {
    experiments: top,
    citations,
    toolRecord: {
      id: `tool-nasa-${Date.now()}`,
      name: 'search_nasa_experiments',
      label: `Queried NASA Experiment Archive (${top.map((e) => e.name).join(', ')})`,
      status: 'completed',
      summary: `Retrieved ${top.length} verified NASA investigations: ${top
        .map((e) => `${e.name} (${e.years.start})`)
        .join(', ')}.`,
      input: { query },
      output: {
        matchedExperiments: top.map((e) => ({
          id: e.id,
          name: e.name,
          fullName: e.fullName,
          platform: e.platform,
          dataAvailability: e.dataAvailability,
          nasaUrl: e.nasaUrl,
          psiSearchUrl: e.psiSearchUrl,
        })),
      },
    },
  }
}

/**
 * Tool 4: Retrieve verified Research Library resources & Scientific Insights
 */
export function toolRetrieveResearchLibrary(query: string): {
  toolRecord: AgentToolCallRecord
  resources: ResearchResource[]
  citations: AgentCitation[]
} {
  const q = query.toLowerCase()
  const scored = RESEARCH_RESOURCES.map((res) => {
    let score = 0
    if (res.title.toLowerCase().includes(q)) score += 8
    if (res.tags.some((t) => q.includes(t.toLowerCase()))) score += 5
    if (q.includes('apollo 13') && res.id.includes('apollo-13')) score += 10
    else if (q.includes('apollo') && res.id.includes('apollo-1')) score += 10
    if (q.includes('mir') && res.id.includes('mir')) score += 10
    if (q.includes('smoke') && res.topic === 'smoke-detection') score += 7
    if ((q.includes('standard') || q.includes('6001')) && res.id.includes('6001')) score += 9
    if (q.includes('saffire') && res.topic === 'saffire') score += 7
    if (q.includes('cool flame') && res.id.includes('strange-flames')) score += 8
    return { res, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 3).map((s) => s.res)

  const citations: AgentCitation[] = top.map((r) => ({
    id: r.id,
    title: `${r.title} (${r.publisher}, ${r.year})`,
    sourceType: r.sourceType === 'incident-report' ? 'Technical Report' : 'Technical Report',
    url: r.url,
  }))

  return {
    resources: top,
    citations,
    toolRecord: {
      id: `tool-lib-${Date.now()}`,
      name: 'retrieve_research_library',
      label: `Searched FLARE Research Library (${top.length} verified sources)`,
      status: 'completed',
      summary: `Matched: ${top.map((r) => r.title).join(' · ')}`,
      input: { query },
      output: {
        resources: top.map((r) => ({
          id: r.id,
          title: r.title,
          publisher: r.publisher,
          year: r.year,
          url: r.url,
        })),
      },
    },
  }
}

/**
 * Tool 5: Analyze thermochemical material properties & Spalding transfer number B
 */
export function toolAnalyzeMaterialProperties(
  fuel: FuelMaterial,
  oxygenPercent: number
): {
  toolRecord: AgentToolCallRecord
  analysis: Record<string, unknown>
} {
  const mat = MATERIALS[fuel]
  const xO2 = oxygenPercent / 100
  const yO2 = (xO2 * 32) / (xO2 * 32 + (1 - xO2) * 28)
  const spaldingB = Number(
    ((yO2 * mat.heatOfCombustion) / (mat.stoichO2Ratio * mat.latentHeat)).toFixed(2)
  )

  const allMaterialsComparison = Object.values(MATERIALS).map((m) => {
    const bVal = Number(
      ((yO2 * m.heatOfCombustion) / (m.stoichO2Ratio * m.latentHeat)).toFixed(2)
    )
    return {
      id: m.id,
      name: m.name,
      heatOfCombustionMJkg: m.heatOfCombustion,
      latentHeatMJkg: m.latentHeat,
      spaldingB: bVal,
      minO2Earth: m.minO2Earth,
      minO2Microgravity: m.minO2Microgravity,
      sootIndex: m.sootIndex,
    }
  })

  const analysis = {
    selectedFuel: mat.name,
    chemicalNote: mat.chemicalNote,
    heatOfCombustionMJkg: mat.heatOfCombustion,
    latentHeatMJkg: mat.latentHeat,
    stoichO2Ratio: mat.stoichO2Ratio,
    spaldingTransferNumberB: spaldingB,
    minO2EarthPercent: mat.minO2Earth,
    minO2MicrogravityPercent: mat.minO2Microgravity,
    sootIndex: mat.sootIndex,
    missionNote: mat.missionNote,
    allMaterialsComparison,
  }

  return {
    analysis,
    toolRecord: {
      id: `tool-mat-${Date.now()}`,
      name: 'analyze_material_properties',
      label: `Analyzed Thermochemical Properties (${mat.name} at ${oxygenPercent}% O₂)`,
      status: 'completed',
      summary: `${mat.name}: ΔH_c = ${mat.heatOfCombustion} MJ/kg, L_v = ${mat.latentHeat} MJ/kg, Spalding B = ${spaldingB}, Min O₂ = ${mat.minO2Microgravity}% (µg) vs. ${mat.minO2Earth}% (1g).`,
      input: { fuel, oxygenPercent },
      output: analysis,
    },
  }
}

// ── 4. Multi-Turn Conversation & Adaptation Analyzer ─────────────────────────

export function analyzeUserTurn(
  message: string,
  history: AgentHistoryItem[],
  context: Record<string, unknown>,
  preferredLevel?: ExplanationLevel
): {
  adaptation: AgentSessionAdaptation
  parsedParamChanges: Partial<SimulationParams> | null
  requestedVisualizationLayer: VisualizationLayer | null
  requestedRoute: string | null
  requestedKidsWorld: KidsWorldId | null
} {
  const q = message.toLowerCase().trim()
  const lastAssistant = [...history].reverse().find((h) => h.role === 'assistant')
  const lastUser = [...history].reverse().find((h) => h.role === 'user')

  // 1. Detect confusion or request for simpler explanation
  const confusionPatterns = [
    /don'?t\s+understand/i,
    /confus(ed|ing)/i,
    /too\s+(complicated|complex|technical|hard|long)/i,
    /explain\s+(?:[\w\s]{1,30}\s+)?(simpler|simply|like\s+i'?m|in\s+simpler?\s+language|in\s+simple|easier)/i,
    /simpler\s+language|in\s+simple\s+terms|in\s+plain\s+english/i,
    /what\s+does\s+that\s+mean/i,
    /what\s+do\s+you\s+mean/i,
    /give\s+(me\s+)?an\s+(example|analogy)/i,
    /^huh\??$/i,
    /^what\??$/i,
  ]
  const adaptedToConfusion = confusionPatterns.some((p) => p.test(q))

  // 2. Detect request for deep technical / mathematical detail
  const technicalPatterns = [
    /equation|formula|derivation|math|spalding|damk[oö]hler|sherwood|grashof|peclet|péclet|quantitative|exact\s+numbers/i,
  ]
  const wantsTechnical = technicalPatterns.some((p) => p.test(q))

  // 3. Detect request for concise/short answer
  const concisePatterns = [/short\s+answer|briefly|in\s+one\s+sentence|tldr|tl;dr|quick\s+summary/i]
  const wantsConcise = concisePatterns.some((p) => p.test(q))

  let explanationLevel: ExplanationLevel = preferredLevel ?? 'standard'
  if (adaptedToConfusion) explanationLevel = 'simple-analogy'
  else if (wantsTechnical) explanationLevel = 'deep-technical'
  else if (wantsConcise) explanationLevel = 'concise'

  // 4. Detect user correction ("no, I meant...", "not cellulose, pmma", "actually...", "wait, change...")
  const correctionPatterns = [
    /^(no|nope|wait|actually|sorry|i\s+meant|not\s+that|instead)/i,
    /i\s+said\s+/i,
    /i\s+was\s+asking\s+about/i,
  ]
  const handledCorrection = correctionPatterns.some((p) => p.test(q))

  // 5. Parse explicit parameter changes mentioned in the user message
  const parsedChanges: Partial<SimulationParams> = {}
  let hasParamChange = false

  // Fuel detection
  if (/\bpmma\b|\bacrylic\b|\bplexiglas/i.test(q)) {
    parsedChanges.fuel = 'pmma'
    hasParamChange = true
  } else if (/\bpolyethylene\b|\bhdpe\b|\bplastic\b/i.test(q)) {
    parsedChanges.fuel = 'polyethylene'
    hasParamChange = true
  } else if (/\bpaper\b/i.test(q)) {
    parsedChanges.fuel = 'paper'
    hasParamChange = true
  } else if (/\bcellulose\b|\bcotton\b|\bcloth\b|\bfabric\b/i.test(q)) {
    parsedChanges.fuel = 'cellulose'
    hasParamChange = true
  }

  // Gravity detection
  if (/\bmars\b|\bmartian\b|3\.72/i.test(q)) {
    parsedChanges.gravity = 3.72
    hasParamChange = true
  } else if (/\bmoon\b|\blunar\b|1\.62|0\.16\s*g/i.test(q)) {
    parsedChanges.gravity = 1.62
    hasParamChange = true
  } else if (/\bearth\b|\b1\s*g\b|\bnormal\s+gravity\b|9\.81/i.test(q)) {
    parsedChanges.gravity = 9.81
    hasParamChange = true
  } else if (/\bmicrogravity\b|\bzero\s*-?\s*g\b|\b0\s*g\b|\biss\b|\bspace\b|0\.001/i.test(q)) {
    if (/switch|set|change|what\s+if|try|run|simulate|in\s+space|in\s+microgravity/i.test(q)) {
      parsedChanges.gravity = 0.001
      hasParamChange = true
    }
  }

  // Oxygen percentage detection (e.g. "34% O2", "oxygen to 15%", "30 percent oxygen")
  const o2Match =
    q.match(/(\d{1,3})\s*%\s*(?:o2|oxygen)?/i) ??
    q.match(/(?:o2|oxygen)\s*(?:to|at|of|=)?\s*(\d{1,3})\s*%?/i)
  if (o2Match) {
    const val = Number(o2Match[1])
    if (val >= 10 && val <= 100) {
      parsedChanges.oxygenPercent = Math.min(100, Math.max(15, val))
      hasParamChange = true
    }
  } else if (/increase\s+(?:the\s+)?(?:o2|oxygen)/i.test(q)) {
    const curO2 = Number(context.oxygenPercent ?? 21)
    parsedChanges.oxygenPercent = curO2 < 30 ? 34 : Math.min(50, curO2 + 10)
    hasParamChange = true
  } else if (/decrease|reduce|lower\s+(?:the\s+)?(?:o2|oxygen)/i.test(q)) {
    parsedChanges.oxygenPercent = 16
    hasParamChange = true
  }

  // Airflow velocity detection (e.g. "0.25 m/s", "increase airflow", "turn off airflow")
  const flowMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:m\/s|cm\/s)/i)
  if (flowMatch) {
    const rawVal = Number(flowMatch[1])
    const mps = q.includes('cm/s') ? rawVal / 100 : rawVal
    parsedChanges.airflowVelocity = Math.min(0.5, Math.max(0, mps))
    hasParamChange = true
  } else if (/increase\s+(?:the\s+)?(?:airflow|ventilation|wind|flow)/i.test(q)) {
    parsedChanges.airflowVelocity = 0.2
    hasParamChange = true
  } else if (/(?:no|zero|stop|turn\s+off)\s+(?:airflow|ventilation|wind|flow)/i.test(q)) {
    parsedChanges.airflowVelocity = 0.0
    hasParamChange = true
  }

  // Pressure detection (e.g. "0.7 atm", "0.5 atm")
  const pressMatch = q.match(/(\d+(?:\.\d+)?)\s*atm\b/i)
  if (pressMatch) {
    parsedChanges.pressure = Math.min(1.5, Math.max(0.1, Number(pressMatch[1])))
    hasParamChange = true
  }

  // Visualization layer detection
  let requestedVisualizationLayer: VisualizationLayer | null = null
  if (/show\s+temperature|temperature\s+(map|layer|view)|thermal\s+map/i.test(q)) {
    requestedVisualizationLayer = 'temperature'
  } else if (/show\s+airflow|airflow\s+(layer|view|streamlines)|diffusion\s+view/i.test(q)) {
    requestedVisualizationLayer = 'airflow'
  } else if (/show\s+oxygen|oxygen\s+(zone|layer|view|gradient)/i.test(q)) {
    requestedVisualizationLayer = 'oxygen'
  } else if (/show\s+soot|soot\s+(layer|view|zone|smoke)/i.test(q)) {
    requestedVisualizationLayer = 'soot'
  } else if (/flame\s+appearance|structure\s+(layer|view)/i.test(q)) {
    requestedVisualizationLayer = 'structure'
  }

  // Route navigation detection
  let requestedRoute: string | null = null
  if (/(?:open|go\s+to|navigate\s+to|show\s+me)\s+(?:the\s+)?compare|comparison\s+page/i.test(q)) {
    requestedRoute = '/compare'
  } else if (/(?:open|go\s+to|navigate\s+to)\s+(?:the\s+)?(?:nasa\s+)?research\s+(?:explorer|page)/i.test(q)) {
    requestedRoute = '/research'
  } else if (/(?:open|go\s+to|navigate\s+to)\s+(?:the\s+)?(?:research\s+)?library/i.test(q)) {
    requestedRoute = '/library'
  } else if (/(?:open|go\s+to|navigate\s+to)\s+(?:the\s+)?(?:scientific\s+)?insights/i.test(q)) {
    requestedRoute = '/insights'
  } else if (/(?:open|go\s+to|navigate\s+to)\s+(?:the\s+)?(?:simulation\s+lab|chamber)/i.test(q)) {
    requestedRoute = '/science'
  }

  // Kids World detection
  let requestedKidsWorld: KidsWorldId | null = null
  if (/world\s*1|meet\s+the\s+flame/i.test(q)) requestedKidsWorld = 'meet-the-flame'
  else if (/world\s*2|oxygen\s+mystery/i.test(q)) requestedKidsWorld = 'oxygen-mystery'
  else if (/world\s*3|invisible\s+wind/i.test(q)) requestedKidsWorld = 'invisible-wind'
  else if (/world\s*4|inside\s+(?:the\s+)?space\s+lab/i.test(q)) requestedKidsWorld = 'inside-space-lab'
  else if (/world\s*5|keeping\s+astronauts\s+safe/i.test(q)) requestedKidsWorld = 'keeping-astronauts-safe'

  // 6. Determine Primary Intent & Topic (with multi-turn follow-up resolution)
  let detectedIntent = 'explain_phenomenon'
  let activeTopic = 'current_state'
  let resolvedFollowUp = false

  if (/^(run|start|execute|launch|simulate|set|change|apply|switch\s+to)\b/i.test(q) && hasParamChange) {
    detectedIntent = 'execute_simulation_action'
  } else if (/what\s+happens\s+if|what\s+changes\s+if|what\s+would\s+(?:happen|change)|what\s+if\s+i|suppose\s+i|if\s+we\s+(?:increase|decrease|change|switch)/i.test(q)) {
    detectedIntent = 'counterfactual_prediction'
  } else if (/compare|versus|\bvs\.?\b|difference\s+between|how\s+does\s+.*\s+differ/i.test(q)) {
    detectedIntent = 'compare_experiments'
  } else if (/report|summarize|summary|write\s+up|research\s+question|findings\s+summary/i.test(q)) {
    detectedIntent = 'generate_report'
  } else if (/nasa|saffire|flex|bass|acme|same|spice|slice|apollo|mir|iss\s+experiment|citation|paper|source|psi|ntrs/i.test(q)) {
    detectedIntent = 'nasa_research_lookup'
  } else if (/calculate|compute|spalding|burn\s+rate\s+constant|how\s+fast|how\s+long|mass\s+loss|heat\s+release/i.test(q)) {
    detectedIntent = 'quantitative_analysis'
  }

  // Topic classification
  const isAnalyzingCurrentExperiment =
    /analyze\s+(?:my|the|this)\s+(?:current\s+)?.*experiment|what\s+is\s+happening\s+in\s+this/i.test(
      q
    )

  if (isAnalyzingCurrentExperiment) {
    activeTopic = 'current_state'
  } else if (/saffire/i.test(q)) activeTopic = 'saffire'
  else if (/flex|cool\s+flame/i.test(q)) activeTopic = 'flex_cool_flames'
  else if (/bass/i.test(q)) activeTopic = 'bass_solids'
  else if (/apollo|mir|history|accident|incident/i.test(q)) activeTopic = 'historical_incidents'
  else if (/smoke|same|detector|soot/i.test(q)) activeTopic = 'smoke_and_soot'
  else if (/diffusion|convection|buoyancy|spherical|sphere|ball|round|shape|teardrop|gravity|microgravity|moon|mars/i.test(q)) {
    activeTopic = 'gravity_and_diffusion'
  } else if (/oxygen|o2|extinction|extinguish|flammability|34%|15%|16%|air/i.test(q)) {
    activeTopic = 'oxygen_and_extinction'
  } else if (/airflow|ventilation|wind|forced\s+flow|blow/i.test(q)) {
    activeTopic = 'airflow_and_ventilation'
  } else if (/fuel|material|pmma|acrylic|cellulose|cotton|polyethylene|plastic|paper/i.test(q)) {
    activeTopic = 'fuel_materials'
  } else if (/temperature|hot|kelvin|celsius|heat|thermal/i.test(q)) {
    activeTopic = 'temperature_and_heat'
  } else if (/model|d2|d\^2|d-squared|limitation|assumption|cfd|accuracy/i.test(q)) {
    activeTopic = 'model_and_limitations'
  }

  // Multi-turn follow-up resolution: if the message is short or uses pronouns ("why?", "explain that", "what about on Mars?", "and at 34%?")
  const isFollowUpPhrase =
    activeTopic === 'current_state' &&
    history.length > 0 &&
    (q.length < 55 || /\b(it|that|this|they|those|more|else|why|how\s+about|what\s+about)\b/i.test(q))

  if (isFollowUpPhrase || adaptedToConfusion || handledCorrection) {
    resolvedFollowUp = true
    // Inherit previous topic if current message didn't specify a new one
    if (activeTopic === 'current_state' && lastUser) {
      const prevUserText =
        lastUser.text ??
        (lastUser as unknown as { content?: string }).content ??
        ''
      if (prevUserText) {
        const prevAnalysis = analyzeUserTurn(prevUserText, [], context)
        if (prevAnalysis.adaptation.activeTopic !== 'current_state') {
          activeTopic = prevAnalysis.adaptation.activeTopic
        }
      }
    }
    if (lastAssistant?.topic && activeTopic === 'current_state') {
      activeTopic = lastAssistant.topic
    }
  }

  return {
    adaptation: {
      explanationLevel,
      detectedIntent,
      adaptedToConfusion,
      handledCorrection,
      resolvedFollowUp,
      activeTopic,
    },
    parsedParamChanges: hasParamChange ? parsedChanges : null,
    requestedVisualizationLayer,
    requestedRoute,
    requestedKidsWorld,
  }
}

// ── 5. Scientific Agent Execution & Response Synthesis ──────────────────────

export function runScientificAgentTurn(
  message: string,
  context: Record<string, unknown>,
  history: AgentHistoryItem[],
  preferredLevel?: ExplanationLevel
): Omit<AIChatResponse, 'isDemo' | 'providerLabel'> {
  const safety = checkSafetyGuardrails(message, 'science')
  if (!safety.safe) {
    return {
      mode: 'science',
      reply: safety.redirectReply!,
      text: safety.redirectReply!,
      followUps: safety.followUps,
      safetyRedirected: true,
    }
  }

  const baseParams = extractCurrentSimParams(context)
  const activeRoute = String(context.activeRoute ?? 'science')
  const {
    adaptation,
    parsedParamChanges,
    requestedVisualizationLayer,
    requestedRoute,
  } = analyzeUserTurn(message, history, context, preferredLevel)

  const toolCalls: AgentToolCallRecord[] = []
  const clientActions: AgentClientAction[] = []
  const citationsMap = new Map<string, AgentCitation>()
  const addCitation = (c: AgentCitation) => citationsMap.set(c.id, c)

  // Always run the baseline simulation tool so the agent has exact D² Law telemetry for the active state
  const currentSim = toolRunCombustionSimulation({}, baseParams)
  toolCalls.push(currentSim.toolRecord)

  addCitation({
    id: 'flare-d2-model',
    title: 'FLARE Analytical 0D/1D D² Law Solid/Droplet Combustion Model (Williams 1985; Law 1982)',
    sourceType: 'D² Law Model',
    note: 'Analytical educational approximation — not a 3D Navier-Stokes CFD solver',
  })

  // If the user asked to change/run parameters, asked a "what if" counterfactual, or asked to compare states:
  let comparisonResult: ReturnType<typeof toolCompareCombustionStates> | null = null
  if (parsedParamChanges && Object.keys(parsedParamChanges).length > 0) {
    const nextParams = clampSimulationParams(parsedParamChanges, baseParams)
    const isDiff =
      nextParams.fuel !== baseParams.fuel ||
      Math.abs(nextParams.gravity - baseParams.gravity) > 0.005 ||
      nextParams.oxygenPercent !== baseParams.oxygenPercent ||
      Math.abs(nextParams.pressure - baseParams.pressure) > 0.02 ||
      Math.abs(nextParams.airflowVelocity - baseParams.airflowVelocity) > 0.01

    if (isDiff) {
      comparisonResult = toolCompareCombustionStates(
        baseParams,
        nextParams,
        `Current (${MATERIALS[baseParams.fuel].name}, ${baseParams.oxygenPercent}% O₂, ${baseParams.gravity} m/s²)`,
        `Target (${MATERIALS[nextParams.fuel].name}, ${nextParams.oxygenPercent}% O₂, ${nextParams.gravity} m/s²)`
      )
      toolCalls.push(comparisonResult.toolRecord)

      // Always request user confirmation before changing important experiment settings
      clientActions.push({
        id: `act-sim-${Date.now()}`,
        type: 'run_simulation',
        label: `Apply & Run: ${MATERIALS[nextParams.fuel].name} · ${nextParams.oxygenPercent}% O₂ · ${
          nextParams.gravity < 0.02 ? '0g' : `${nextParams.gravity} m/s²`
        }${nextParams.airflowVelocity > 0 ? ` · ${nextParams.airflowVelocity} m/s` : ''}`,
        description:
          'Confirm to update the active chamber parameters and execute this D² Law simulation run.',
        requiresConfirmation: true,
        autoExecuted: false,
        payload: { ...nextParams },
      })
    }
  } else if (
    adaptation.detectedIntent === 'compare_experiments' &&
    !/saffire|flex|bass|acme|same/i.test(message)
  ) {
    // User asked to compare gravity/conditions without a diff (e.g. "Compare 0g and Earth 1g")
    const contrastGravity = baseParams.gravity < 0.1 ? 9.81 : 0.001
    const nextParams = clampSimulationParams({ gravity: contrastGravity }, baseParams)
    comparisonResult = toolCompareCombustionStates(
      baseParams,
      nextParams,
      `Active (${MATERIALS[baseParams.fuel].name}, ${baseParams.gravity} m/s²)`,
      `Reference (${MATERIALS[nextParams.fuel].name}, ${contrastGravity} m/s²)`
    )
    toolCalls.push(comparisonResult.toolRecord)

    clientActions.push({
      id: `act-sim-${Date.now()}`,
      type: 'run_simulation',
      label: `Switch Chamber to ${contrastGravity < 0.02 ? 'ISS Microgravity (0g)' : 'Earth Gravity (9.81 m/s²)'}`,
      description: 'Confirm to switch the active chamber gravity and run the comparison state.',
      requiresConfirmation: true,
      autoExecuted: false,
      payload: { ...nextParams },
    })
  }

  // If the user asked to switch visualization layer
  if (requestedVisualizationLayer) {
    clientActions.push({
      id: `act-layer-${Date.now()}`,
      type: 'switch_visualization_layer',
      label: `Switch 3D View to ${requestedVisualizationLayer.toUpperCase()} Layer`,
      description: `Changes the 3D combustion shader to highlight the ${requestedVisualizationLayer} field.`,
      autoExecuted: true,
      payload: { layer: requestedVisualizationLayer },
    })
  }

  // If the user asked to navigate to another FLARE route
  if (requestedRoute && requestedRoute !== `/${activeRoute}`) {
    clientActions.push({
      id: `act-nav-${Date.now()}`,
      type: 'navigate_route',
      label: `Open ${requestedRoute}`,
      description: `Navigate to ${requestedRoute} in FLARE.`,
      payload: { href: requestedRoute },
    })
  }

  // Execute NASA & Library retrieval tools when relevant
  const nasaSearch = toolSearchNasaExperiments(message, comparisonResult?.runB.params ?? baseParams)
  toolCalls.push(nasaSearch.toolRecord)
  nasaSearch.citations.forEach(addCitation)

  if (
    adaptation.activeTopic === 'fuel_materials' ||
    adaptation.detectedIntent === 'quantitative_analysis'
  ) {
    const matTool = toolAnalyzeMaterialProperties(
      (comparisonResult?.runB.params ?? baseParams).fuel,
      (comparisonResult?.runB.params ?? baseParams).oxygenPercent
    )
    toolCalls.push(matTool.toolRecord)
  }

  if (
    adaptation.activeTopic === 'historical_incidents' ||
    adaptation.activeTopic === 'smoke_and_soot' ||
    adaptation.detectedIntent === 'nasa_research_lookup' ||
    adaptation.detectedIntent === 'generate_report'
  ) {
    const libTool = toolRetrieveResearchLibrary(message)
    toolCalls.push(libTool.toolRecord)
    libTool.citations.forEach(addCitation)
  }

  if (adaptation.detectedIntent === 'generate_report') {
    toolCalls.push({
      id: `tool-report-${Date.now()}`,
      name: 'generate_research_report',
      label: 'Generated Research Report',
      status: 'completed',
      summary: `Compiled structured report for ${MATERIALS[baseParams.fuel].name} at ${baseParams.oxygenPercent}% O₂, ${baseParams.gravity} m/s²`,
      input: { ...baseParams },
    })
  }

  // ── Synthesize Natural, Context-Aware Scientific Reply ──
  const m = currentSim.metrics
  const mat = MATERIALS[baseParams.fuel]
  const isMicrogravity = baseParams.gravity < 0.05
  const xO2 = baseParams.oxygenPercent / 100
  const yO2 = (xO2 * 32) / (xO2 * 32 + (1 - xO2) * 28)
  const spaldingB = Number(
    ((yO2 * mat.heatOfCombustion) / (mat.stoichO2Ratio * mat.latentHeat)).toFixed(2)
  )
  const pO2Atm = Number(((baseParams.oxygenPercent / 100) * baseParams.pressure).toFixed(2))

  let reply = ''
  const prefixNotes: string[] = []

  if (adaptation.handledCorrection) {
    prefixNotes.push(
      `Understood — I have updated the analysis to focus on **${
        comparisonResult ? comparisonResult.runB.metrics.fuelName : m.fuelName
      }** under **${
        comparisonResult ? comparisonResult.runB.metrics.gravityLabel : m.gravityLabel
      }**.`
    )
  }

  if (adaptation.adaptedToConfusion || adaptation.explanationLevel === 'simple-analogy') {
    // Simple analogy mode when the user expresses confusion or selects Intuitive depth
    reply = [
      ...prefixNotes,
      `Let's explain what is happening in plain, everyday terms.`,
      isMicrogravity
        ? `**Physical Analogy (Why the Flame Is a Sphere):** On Earth, hot air is lighter than cool air, so it rises like a hot-air balloon and pulls fresh oxygen in from the bottom—stretching a candle flame into a teardrop. In **microgravity (${baseParams.gravity} m/s²)**, nothing has weight, so hot air cannot rise. Instead, oxygen molecules drift inward slowly from all directions—like a drop of ink spreading evenly in still water (**molecular diffusion**). Where that inward oxygen meets fuel vapor from the **${mat.name}** sample, it forms a calm, hollow **blue sphere**.`
        : `**Physical Analogy (Why the Flame Stretches Upward):** Under **${m.gravityLabel} (${baseParams.gravity} m/s²)**, the hot gas around the **${mat.name}** sample is lighter than the cooler room air. Gravity pulls the heavier cool air down, pushing the hot gas upward like a chimney draft (**buoyant convection**). That upward rush stretches the flame into a **${m.flameAspectRatio}:1 teardrop plume**.`,
      `**Simulation Output (Active Chamber):** Your ${baseParams.sampleDiameter} mm **${mat.name}** sample in **${baseParams.oxygenPercent}% O₂** and **${baseParams.airflowVelocity} m/s** airflow reaches a modeled flame temperature of **${m.peakTemperatureK} K (${m.peakTemperatureC} °C)** and releases **${m.avgHeatReleaseW} W** of heat.`,
      `**Model Scope:** These numbers come from FLARE's analytical 0D/1D D² Law model (\`D²(t) = D₀² - K·t\`), which provides an educational physics estimate rather than a full 3D fluid dynamics simulation.`,
    ].join('\n\n')
  } else if (comparisonResult) {
    // Counterfactual / Parameter Comparison or Direct Simulation Execution Response
    const a = comparisonResult.runA.metrics
    const b = comparisonResult.runB.metrics
    const dT = comparisonResult.deltaTempK
    const dHrr = comparisonResult.deltaHrrPct
    const dK = comparisonResult.deltaK

    reply = [
      ...prefixNotes,
      `I executed the **D² Law Simulation Solver** across both parameter states to quantify the shift before modifying your active chamber:`,
      `| Parameter / Output | Current State (${a.fuelName}, ${baseParams.oxygenPercent}% O₂, ${baseParams.gravity} m/s²) | Target State (${b.fuelName}, ${comparisonResult.runB.params.oxygenPercent}% O₂, ${comparisonResult.runB.params.gravity} m/s²) | Computed Delta |`,
      `| :--- | :--- | :--- | :--- |`,
      `| **Peak Flame Temp (T_f)** | ${a.peakTemperatureK} K (${a.peakTemperatureC} °C) | ${b.peakTemperatureK} K (${b.peakTemperatureC} °C) | **${dT >= 0 ? '+' : ''}${dT} K** |`,
      `| **Heat Release Rate (HRR)** | ${a.avgHeatReleaseW} W | ${b.avgHeatReleaseW} W | **${dHrr >= 0 ? '+' : ''}${dHrr}%** |`,
      `| **Burning Constant (K)** | ${a.dSquaredConstantK} mm²/s | ${b.dSquaredConstantK} mm²/s | **${dK >= 0 ? '+' : ''}${dK} mm²/s** |`,
      `| **Flame Radius (R_f)** | ${a.initialFlameRadiusMm} mm | ${b.initialFlameRadiusMm} mm | **${comparisonResult.deltaRadiusMm >= 0 ? '+' : ''}${comparisonResult.deltaRadiusMm} mm** |`,
      `| **Aspect Ratio (Shape)** | ${a.flameAspectRatio}:1 | ${b.flameAspectRatio}:1 | ${b.extinguished ? 'Extinguished' : b.flameAspectRatio < 1.1 ? 'Spherical (0g)' : 'Elongated Plume'} |`,
      `**Scientific Interpretation:** ${
        comparisonResult.runB.params.oxygenPercent !== baseParams.oxygenPercent
          ? `Changing oxygen concentration from **${baseParams.oxygenPercent}%** to **${comparisonResult.runB.params.oxygenPercent}%** directly scales the Spalding mass transfer number \`B = (Y_O₂ · ΔHc) / (s_O₂ · Lv)\` and alters inert N₂ thermal dilution, shifting modeled peak temperature by **${dT >= 0 ? '+' : ''}${dT} K** and heat release rate by **${dHrr >= 0 ? '+' : ''}${dHrr}%**.`
          : comparisonResult.runB.params.gravity !== baseParams.gravity
          ? `Shifting gravity from **${baseParams.gravity} m/s²** to **${comparisonResult.runB.params.gravity} m/s²** transitions oxidizer transport between radial molecular diffusion and buoyancy-driven natural convection (\`AR: ${a.flameAspectRatio} → ${b.flameAspectRatio}\`), changing the D² burning rate constant \`K\` by **${dK >= 0 ? '+' : ''}${dK} mm²/s**.`
          : `Modifying fuel or forced ventilation alters stoichiometric oxygen demand and convective Sherwood number enhancement, shifting modeled heat release from **${a.avgHeatReleaseW} W** to **${b.avgHeatReleaseW} W**.`
      }`,
      `**Empirical Context & Model Limitations:** Qualitatively consistent with **${nasaSearch.experiments[0]?.name ?? 'FLEX-2'}** (*${nasaSearch.experiments[0]?.platform ?? 'ISS CIR'}*). Note that these values are analytical 0D/1D D² Law estimates (\`D²(t) = D₀² - K·t\`) rather than 3D Navier-Stokes CFD predictions. Use the confirmation control below if you would like to apply and run this configuration in the chamber.`,
    ].join('\n\n')
  } else if (adaptation.detectedIntent === 'generate_report') {
    const exp = nasaSearch.experiments[0]
    reply = [
      `### Scientific Investigation Report — ${m.fuelName} in ${m.gravityLabel}`,
      `**1. Active Experiment Parameters & Simulation Outputs (D² Law Model Est.)**\n- **Specimen:** ${mat.name} (\`D₀ = ${baseParams.sampleDiameter} mm\`, \`ΔHc = ${mat.heatOfCombustion} MJ/kg\`, \`Lv = ${mat.latentHeat} MJ/kg\`, \`B = ${spaldingB}\`)\n- **Chamber Environment:** ${baseParams.oxygenPercent}% O₂ (\`p_O₂ = ${pO2Atm} atm\`), ${baseParams.pressure} atm total pressure, ${baseParams.airflowVelocity} m/s forced airflow, \`g = ${baseParams.gravity} m/s²\`\n- **Model Outputs:** Burning rate constant \`K = ${m.dSquaredConstantK} mm²/s\`, peak flame temperature \`T_f = ${m.peakTemperatureK} K\` (${m.peakTemperatureC} °C), initial standoff radius \`R_f = ${m.initialFlameRadiusMm} mm\`, aspect ratio ${m.flameAspectRatio}:1, initial mass loss rate ${m.initialMassLossMgS} mg/s, average heat release \`HRR = ${m.avgHeatReleaseW} W\`, burnout time ${m.burnoutTimeS ?? baseParams.duration} s (${m.burntFractionPercent}% consumed).`,
      `**2. Physical Interpretation**\n${
        isMicrogravity
          ? `At \`g = ${baseParams.gravity} m/s²\`, natural buoyant convection is suppressed. Oxidizer transport is governed by radial molecular diffusion${
              baseParams.airflowVelocity > 0.02
                ? ` augmented by ${baseParams.airflowVelocity} m/s forced cabin ventilation`
                : ''
            }. Pyrolysis vapor from the solid sphere crosses an inner oxygen-depleted stand-off zone before reacting at the stoichiometric sheet (\`R_f = ${m.initialFlameRadiusMm} mm\`).`
          : `At \`g = ${baseParams.gravity} m/s²\`, density gradients between hot products (\`${m.peakTemperatureK} K\`) and ambient gas (\`300 K\`) drive upward buoyant flow, compressing the lower boundary layer and elongating the luminous soot plume to an aspect ratio of ${m.flameAspectRatio}:1.`
      }`,
      `**3. Verified NASA Experimental Reference**\n- **${exp?.fullName ?? 'FLEX-2'} (${exp?.name ?? 'FLEX-2'}):** Conducted aboard *${exp?.platform ?? 'ISS CIR'}*. ${exp?.keyFindings[0]?.text ?? ''} *(Source: ${exp?.keyFindings[0]?.source ?? 'NASA PSI'})*.`,
      `**4. Uncertainty & Model Limitations**\nSimulation telemetry is computed from the quasi-steady 0D/1D D² Law (\`D²(t) = D₀² - K·t\`) with empirical convective scaling. It does not resolve 3D turbulent eddies, multi-step cool-flame radical kinetics, char-layer swelling, or meter-scale surface flame spread.`,
    ].join('\n\n')
  } else if (adaptation.detectedIntent === 'quantitative_analysis') {
    const theoBurnTime =
      m.dSquaredConstantK > 0
        ? ((baseParams.sampleDiameter * baseParams.sampleDiameter) / m.dSquaredConstantK).toFixed(1)
        : '∞ (Extinguished)'
    reply = [
      `**Quantitative D² Law & Thermochemical Calculation — ${mat.name}:**`,
      `Using your active chamber parameters (\`D₀ = ${baseParams.sampleDiameter} mm\`, \`${baseParams.oxygenPercent}% O₂\`, \`P = ${baseParams.pressure} atm\`, \`U = ${baseParams.airflowVelocity} m/s\`, \`g = ${baseParams.gravity} m/s²\`):`,
      `- **Oxygen Mass Fraction & Partial Pressure:** \`Y_O₂ = ${(yO2 * 100).toFixed(1)}%\`, \`p_O₂ = ${pO2Atm} atm\`\n- **Spalding Mass Transfer Number (\`B\`):** \`B = (Y_O₂ · ΔHc) / (s_O₂ · Lv) = (${yO2.toFixed(3)} × ${mat.heatOfCombustion}) / (${mat.stoichO2Ratio} × ${mat.latentHeat}) = ${spaldingB}\`\n- **Effective Burning Rate Constant (\`K\`):** \`K = ${m.dSquaredConstantK} mm²/s\` (includes ${isMicrogravity ? 'molecular diffusion + forced flow Sherwood scaling' : 'Grashof buoyant + forced flow scaling'})\n- **Unconstrained Burnout Time (\`t_b = D₀² / K\`):** \`(${baseParams.sampleDiameter}²) / ${m.dSquaredConstantK} = ${theoBurnTime} s\` (Chamber run duration capped at ${baseParams.duration} s → ${m.burntFractionPercent}% mass consumed)\n- **Mass Loss & Heat Release:** Initial mass loss \`ṁ₀ = ${m.initialMassLossMgS} mg/s\`, average heat release \`HRR = ${m.avgHeatReleaseW} W\`, peak flame temperature \`T_f = ${m.peakTemperatureK} K\` (${m.peakTemperatureC} °C).`,
      `**Model Scope:** These calculations represent quasi-steady 0D/1D D² Law analytical outputs; real solid polymers also experience transient heat-up and surface char/melt effects.`,
    ].join('\n\n')
  } else if (adaptation.activeTopic === 'saffire') {
    reply = [
      `**NASA's Saffire I–VI (Spacecraft Fire Safety Demonstration)** investigated large-scale solid-fuel flame spread and smoke dynamics under realistic spacecraft cabin atmospheres.`,
      `**Verified Platform Provenance:** Saffire I–VI were conducted exclusively aboard **uncrewed Northrop Grumman (Orbital ATK) Cygnus cargo spacecraft after undocking from the ISS** prior to destructive atmospheric re-entry—never inside a crewed ISS cabin.`,
      `**Empirical Findings vs. Your Active Simulation:**\n- **Finite-Volume Oxygen Coupling (Saffire I–III):** Meter-scale Cotton-Fiberglass (*Sibal*) and PMMA samples burned in forced flow (\`0.2–0.4 m/s\`), consuming enough cabin oxygen to measurably depress ambient O₂ and raise cabin pressure.\n- **Exploration Atmosphere Hazard (Saffire IV–V):** Tested elevated oxygen (**~34% O₂ at ~0.56 atm / 8.2 psia**), demonstrating rapid flame growth and intense radiative heat flux.\n- **Active Chamber Comparison:** Your simulation uses a ${baseParams.sampleDiameter} mm **${m.fuelName}** sphere at **${baseParams.oxygenPercent}% O₂** and **${baseParams.airflowVelocity} m/s** flow (\`T_f = ${m.peakTemperatureK} K\`, \`HRR = ${m.avgHeatReleaseW} W\`). While FLARE's 0D/1D D² Law captures oxygen and ventilation sensitivity on a small sphere, it does not model meter-scale surface flame spread.`,
    ].join('\n\n')

    clientActions.push({
      id: `act-saffire-preset-${Date.now()}`,
      type: 'apply_simulation_params',
      label: 'Load 34% O₂ Exploration Atmosphere Preset',
      description: 'Confirm to set PMMA, 34% O₂, 0.7 atm, and 0.12 m/s airflow in microgravity.',
      requiresConfirmation: true,
      autoExecuted: false,
      payload: {
        fuel: 'pmma',
        gravity: 0.001,
        oxygenPercent: 34,
        pressure: 0.7,
        airflowVelocity: 0.12,
      },
    })
  } else if (adaptation.activeTopic === 'flex_cool_flames') {
    reply = [
      `**NASA's FLEX & FLEX-2 (Flame Extinguishment Experiment)** investigated over 200 fuel droplets and solid spheres inside the **ISS Combustion Integrated Rack (CIR)**.`,
      `**Verified Experimental Observations:**\n1. **Spherical Diffusion Envelope:** In quiescent microgravity (\`g ≈ 0.001 m/s²\`), buoyant plume convection disappears. Fuel vapor crosses an inner **pyrolysis stand-off zone** and reacts with inward-diffusing O₂ in a thin, spherical blue \`CH*\` chemiluminescent reaction sheet.\n2. **Two-Stage "Cool Flames":** FLEX-2 discovered that after a visible hot droplet flame extinguishes via radiative heat loss (\`~1,500–1,800 K\`), combustion can continue invisibly at **500–800 K (230–530 °C)** via low-temperature peroxy-radical chemistry—producing carbon monoxide and formaldehyde.`,
      `**Simulation Output vs. Experiment:** In your active chamber (**${m.fuelName}**, **${baseParams.gravity} m/s²**, **${baseParams.oxygenPercent}% O₂**), the modeled hot-flame standoff radius is **\`R_f = ${m.initialFlameRadiusMm} mm\`** (aspect ratio **${m.flameAspectRatio}:1**) at **\`T_f = ${m.peakTemperatureK} K\`**. FLARE's single-step D² Law models the hot diffusion flame stage; secondary cool-flame chemistry requires multi-step chemical kinetics outside the D² Law scope.`,
    ].join('\n\n')
  } else if (adaptation.detectedIntent === 'nasa_research_lookup') {
    const topExps = nasaSearch.experiments.slice(0, 3)
    reply = [
      `**Relevant NASA Microgravity Combustion Investigations for Your Setup (${m.fuelName}, ${baseParams.oxygenPercent}% O₂, ${baseParams.gravity} m/s²):**`,
      ...topExps.map(
        (e, idx) =>
          `**${idx + 1}. ${e.name} — ${e.fullName}**\n- **Platform & PI:** *${e.platform}* (PI: ${e.pi}, ${e.institution})\n- **Key Empirical Finding:** ${e.keyFindings[0]?.text ?? e.objective}\n- **Data Availability:** \`${e.dataAvailability.toUpperCase()}\` (${e.dataNote.slice(0, 120)}…)`
      ),
      `**How This Connects to Your Simulation:** Your current chamber models a ${baseParams.sampleDiameter} mm **${mat.name}** sphere with \`K = ${m.dSquaredConstantK} mm²/s\` and \`T_f = ${m.peakTemperatureK} K\`. Note that **Saffire I–VI** were conducted on uncrewed Cygnus cargo spacecraft after ISS departure, whereas **FLEX-2**, **BASS**, **SAME**, and **ACME** operated inside sealed racks aboard the ISS.`,
    ].join('\n\n')
  } else if (adaptation.activeTopic === 'oxygen_and_extinction') {
    reply = [
      `**Oxygen Concentration & Flammability Analysis (${baseParams.oxygenPercent}% O₂, \`p_O₂ = ${pO2Atm} atm\`):**`,
      `**1. Simulation Telemetry (D² Law Model Output):** For **${mat.name}** at **${baseParams.oxygenPercent}% O₂** and **${baseParams.gravity} m/s²**, the Spalding transfer number is **\`B = ${spaldingB}\`**, driving a burning rate constant of **\`K = ${m.dSquaredConstantK} mm²/s\`**, peak flame temperature **\`T_f = ${m.peakTemperatureK} K\` (${m.peakTemperatureC} °C)**, and heat release **\`HRR = ${m.avgHeatReleaseW} W\`** (${m.extinguished ? '**Extinguished — below minimum O₂ threshold**' : 'Sustained burn'}).`,
      `**2. Physical Mechanism:** Oxygen concentration controls two coupled effects:\n- **Mass Transfer Driving Force:** Increasing O₂ raises the stoichiometric oxygen gradient at the flame sheet, pulling the reaction front closer to the fuel surface and increasing conductive heat feedback.\n- **Inert Nitrogen Ballast:** At 21% O₂, 79% of the atmosphere is inert N₂ that absorbs reaction heat without contributing energy. Raising O₂ to **30–35%** (NASA exploration atmosphere range) removes thermal ballast and sharply accelerates burning.`,
      `**3. Verified NASA Evidence & Extinction Limits:** For **${mat.name}**, the minimum oxygen threshold in microgravity (**${mat.minO2Microgravity}% O₂**, measured in NASA **BASS-II**) is lower than under Earth 1g (**${mat.minO2Earth}% O₂**) because gentle orbital ventilation supplies oxygen without strong buoyant convective heat loss.`,
    ].join('\n\n')
  } else if (adaptation.activeTopic === 'smoke_and_soot') {
    reply = [
      `**Soot Formation & Orbital Smoke Transport Analysis:**`,
      `**1. Active Chamber Soot Estimate (Model Output):** Your **${mat.name}** sample (empirical soot index \`${mat.sootIndex}\`) under **${m.gravityLabel}** and **${baseParams.airflowVelocity} m/s** airflow produces an estimated soot volume fraction of **\`${m.sootPpm} ppm\`**.`,
      `**2. Why Soot & Color Shift Between 0g and 1g:**\n- In **quiescent microgravity (\`0g\`)**, the absence of buoyant acceleration increases gas residence time inside the fuel-rich interior, allowing polycyclic aromatic hydrocarbons (PAHs) to nucleate into a spherical yellow-amber soot shell inside the blue \`CH*\` reaction boundary—or, at low O₂, suppressing soot luminosity entirely so the flame appears dim blue.\n- Under **Earth gravity (\`1g\`) or forced airflow**, buoyant/advective acceleration sweeps incandescent soot particles upward into a bright yellow-orange radiative plume tip.`,
      `**3. Verified Spaceflight Evidence (NASA SAME & 1997 Mir Fire):** NASA's **Smoke Aerosol Measurement Experiment (SAME / SAME-R)** aboard the ISS demonstrated that longer residence times in microgravity shift smoke aerosols toward larger aggregate particle sizes than in 1g. Furthermore, because smoke does not rise to the ceiling in orbit, spacecraft smoke detectors must be mounted inside **HVAC ventilation return ducts**.`,
    ].join('\n\n')
  } else if (adaptation.activeTopic === 'model_and_limitations') {
    reply = [
      `**FLARE D² Law Model Formulation, Assumptions & Scientific Limitations:**`,
      `**1. Governing Analytical Formulation:** FLARE computes solid/droplet regression using the classical quasi-steady 0D/1D **D² Law** (Law 1982; Williams 1985):\n- Surface area regression: \`D²(t) = D₀² - K·t\`\n- Base diffusive burning constant: \`K₀ = (8 · ρ_g · D_O₂ / ρ_s) · ln(1 + B)\`\n- Spalding mass transfer number: \`B = (Y_O₂,∞ · ΔHc) / (s_O₂ · Lv) = ${spaldingB}\` (for your active ${mat.name} setup)\n- Convective Sherwood enhancement: Empirical Grashof (\`g = ${baseParams.gravity} m/s²\`) and Reynolds (\`U = ${baseParams.airflowVelocity} m/s\`) scaling yielding \`K = ${m.dSquaredConstantK} mm²/s\`.`,
      `**2. Key Simplifying Assumptions & What Is Not Modeled:**\n- **No 3D Navier-Stokes CFD:** Flow fields, vortex shedding, and 3D plume instabilities are represented analytically rather than solved on a spatial mesh.\n- **Single-Step Global Chemistry:** Models hot stoichiometric oxidation only; it cannot predict two-stage low-temperature **cool flames** (500–800 K) observed in NASA's **FLEX-2** heptane experiments.\n- **Small-Sphere Geometry (\`3–10 mm\`):** Designed for spherical droplet/bead samples (like **FLEX** and **BASS** spheres), not meter-scale flat panel flame spread (like **Saffire I–VI**).\n- **Simplified Radiative Quenching:** Uses an empirical radiation factor rather than coupled optically-thin/thick soot & CO₂/H₂O band radiation.`,
    ].join('\n\n')
  } else if (adaptation.activeTopic === 'historical_incidents') {
    reply = [
      `**Historical Spacecraft Fire Incidents & Engineering Reforms:**`,
      `- **Apollo 1 (Jan 27, 1967 — Launch Pad Plugs-Out Test):** A cabin pressurized to **16.7 psia (1.14 atm) with 100% pure O₂** caused an electrical arc to ignite nylon netting and Velcro, spreading orders of magnitude faster than in normal air. **Engineering Reform:** Led directly to strict material flammability screening (**NASA-STD-6001B Test 1**), nitrogen-diluted cabin atmospheres, and rapid outward-opening hatches.\n- **Apollo 13 (April 13, 1970 — Cryogenic O₂ Tank 2):** Damaged PTFE (Teflon) wire insulation ignited inside supercritical oxygen (*NTRS 19710003598*), proving that even fluoropolymers burn in high-pressure pure O₂.\n- **Mir Space Station Fire (Feb 24, 1997 — Orbital Cabin):** A lithium perchlorate oxygen generator (*Vika* canister) burned for ~14 minutes in microgravity. Because there is no buoyancy in orbit, dense smoke did not rise to the ceiling—it followed the **ventilation return ducts**, inspiring NASA's **SAME** smoke aerosol experiments.`,
      `**Connection to Your Active Chamber:** At **${baseParams.oxygenPercent}% O₂** and **${baseParams.pressure} atm**, your oxygen partial pressure is **\`p_O₂ = ${pO2Atm} atm\`** (compared to \`0.21 atm\` in normal Earth air and \`1.14 atm\` in Apollo 1).`,
    ].join('\n\n')
  } else if (adaptation.activeTopic === 'airflow_and_ventilation') {
    reply = [
      `**How Airflow & Ventilation Govern Microgravity Flames (${baseParams.airflowVelocity} m/s Active):**`,
      `**1. Quiescent Diffusion vs. Forced Advection:** In still microgravity (\`0.00 m/s\`), a flame relies solely on slow **molecular diffusion** (\`D_O₂ ≈ 2.1×10⁻⁵ m²/s\`). Combustion products (CO₂, H₂O) accumulate around the sphere, thickening the reaction zone and often starving the flame via radiative heat loss.`,
      `**2. Why Gentle Ventilation Strengthens Orbital Fires (NASA BASS-II & SLICE):** When spacecraft HVAC fans introduce a gentle breeze (**0.05–0.30 m/s**):\n- **Upstream Stagnation Compression:** Fresh O₂ is pushed closer to the leading edge of the ${mat.name} sphere, steepening the thermal gradient and increasing heat feedback to the fuel surface.\n- **Downstream Wake Elongation:** Hot gases and incandescent soot trail into a luminous wake.\n- **ISS Emergency Protocol:** Because low-speed airflow feeds microgravity flames, the **first automated step** on the ISS when smoke is detected is to **shut down cabin ventilation fans** to starve the fire of advective oxygen.`,
      `**3. Active Simulation Telemetry (Model Output):** With **${baseParams.airflowVelocity} m/s** flow and **${baseParams.oxygenPercent}% O₂**, your ${mat.name} sample burns at **\`K = ${m.dSquaredConstantK} mm²/s\`** with heat release **\`HRR = ${m.avgHeatReleaseW} W\`**.`,
    ].join('\n\n')
  } else if (adaptation.activeTopic === 'fuel_materials') {
    reply = [
      `**Thermochemical & Material Analysis — ${mat.name} at ${baseParams.oxygenPercent}% O₂:**`,
      `In the analytical D² Law (\`D²(t) = D₀² - K·t\`), a solid polymer's regression rate \`K\` is governed by its **Spalding Mass Transfer Number (\`B\`)**: \`B = (Y_O₂ · ΔHc) / (s_O₂ · Lv) = ${spaldingB}\` (yielding \`K = ${m.dSquaredConstantK} mm²/s\`, \`T_f = ${m.peakTemperatureK} K\`, \`HRR = ${m.avgHeatReleaseW} W\`).`,
      `| Spacecraft Material | Heat of Combustion (ΔHc) | Gasification Heat (Lv) | Min O₂ (1g vs. µg) | Soot Index |`,
      `| :--- | :--- | :--- | :--- | :--- |`,
      ...Object.values(MATERIALS).map(
        (item) =>
          `| **${item.name}**${item.id === baseParams.fuel ? ' *(Active)*' : ''} | ${item.heatOfCombustion} MJ/kg | ${item.latentHeat} MJ/kg | ${item.minO2Earth}% vs. **${item.minO2Microgravity}%** | ${item.sootIndex} |`
      ),
      `**Verified NASA Finding (BASS-II):** The Minimum Oxygen Index in microgravity under low ventilation is **2–3 vol% lower** than on Earth (${mat.minO2Microgravity}% vs. ${mat.minO2Earth}% for ${mat.name}) because gentle forced flow delivers oxygen without strong upward buoyant cooling.`,
    ].join('\n\n')
  } else {
    // Default / Current Simulation State & 3D Visualization Interpretation
    reply = [
      ...prefixNotes,
      `**Current Experiment Analysis — ${m.fuelName} in ${m.gravityLabel}:**`,
      `**1. Active Simulation Telemetry (D² Law Model Output):**\nYour ${baseParams.sampleDiameter} mm **${mat.name}** specimen at **${baseParams.oxygenPercent}% O₂** (\`p_O₂ = ${pO2Atm} atm\`), **${baseParams.pressure} atm**, and **${baseParams.airflowVelocity} m/s** airflow (${
        context.status === 'running' || context.status === 'completed'
          ? `Status: **${String(context.status).toUpperCase()}**`
          : 'Live preview state'
      }) produces:\n- **Flame Geometry & Standoff:** Aspect ratio **${m.flameAspectRatio}:1**, initial standoff radius **\`R_f = ${m.initialFlameRadiusMm} mm\`**.\n- **Thermal & Kinetic Rates:** Peak flame temperature **\`T_f = ${m.peakTemperatureK} K\` (${m.peakTemperatureC} °C)**, burning rate constant **\`K = ${m.dSquaredConstantK} mm²/s\`**, mass loss rate **${m.initialMassLossMgS} mg/s**, and heat release rate **\`HRR = ${m.avgHeatReleaseW} W\`**.`,
      `**2. Interpreting What You See in the 3D Flame Visualization:**\n${
        isMicrogravity
          ? `Because gravitational acceleration is near zero (\`g = ${baseParams.gravity} m/s²\`), hot combustion gases do not experience buoyant lift. Around the solid ${mat.name} sphere, you see a translucent **pyrolysis vapor stand-off ("dark") zone** where vaporized fuel diffuses outward, bounded by a spherical **blue \`CH*\` chemiluminescent reaction sheet** where fuel meets inward-diffusing oxygen${
              baseParams.airflowVelocity > 0.02
                ? `, slightly swept into a downstream wake by the ${baseParams.airflowVelocity} m/s cabin airflow`
                : ''
            }.`
          : `At \`g = ${baseParams.gravity} m/s²\`, density differences between hot combustion products (\`${m.peakTemperatureK} K\`) and ambient gas (\`300 K\`) drive upward natural convection. In the 3D viewport, this compresses the blue reaction boundary beneath the fuel sphere and stretches incandescent soot upward into a **${m.flameAspectRatio}:1 buoyant teardrop plume**.`
      }`,
      `**3. Empirical NASA Reference & Model Scope:** Qualitatively aligned with **${nasaSearch.experiments[0]?.name ?? 'FLEX-2'}** (*${nasaSearch.experiments[0]?.platform ?? 'ISS CIR'}*). All numerical readouts are analytical 0D/1D D² Law estimates (\`D²(t) = D₀² - K·t\`) rather than 3D Navier-Stokes CFD predictions.`,
    ].join('\n\n')
  }

  // Append deep mathematical formulation when user selects or requests Deep Technical depth
  if (adaptation.explanationLevel === 'deep-technical') {
    reply += `\n\n**Dimensionless Scaling & Governing Equations:**\n- **D² Regression Law:** \`D²(t) = D₀² - K·t\`, where \`K = K₀ · Sh_eff\` and \`K₀ = (8 · ρ_g · D_O₂ / ρ_s) · ln(1 + B)\`\n- **Spalding Transfer Number:** \`B = (Y_O₂,∞ · ΔHc) / (s_O₂ · Lv) = ${spaldingB}\` (\`Y_O₂,∞ = ${yO2.toFixed(3)}\`)\n- **Convective Transport:** Effective Sherwood number \`Sh_eff = 2 + 0.55 · Re^(1/2) · Sc^(1/3) + 0.45 · Gr^(1/4) · Sc^(1/4)\` coupling forced airflow (\`U = ${baseParams.airflowVelocity} m/s\`) and buoyancy (\`g = ${baseParams.gravity} m/s²\`).`
  }

  // Build contextual follow-up suggestions that evolve with the conversation
  const followUps: string[] = []
  if (isMicrogravity) {
    followUps.push(`What happens if I switch gravity to Earth (9.81 m/s²)?`)
  } else {
    followUps.push(`What happens if I switch to ISS Microgravity (0.001 m/s²)?`)
  }
  if (baseParams.oxygenPercent < 30) {
    followUps.push(`What happens if I increase oxygen to 34% (exploration cabin)?`)
  } else {
    followUps.push(`What happens if I lower oxygen to 16% near the extinction limit?`)
  }
  if (adaptation.activeTopic !== 'saffire') {
    followUps.push(`Compare NASA's FLEX-2 and Saffire investigations`)
  } else {
    followUps.push(`Generate a structured research summary for this setup`)
  }

  return {
    mode: 'science',
    reply,
    text: reply,
    toolCalls,
    clientActions,
    citations: Array.from(citationsMap.values()),
    followUps: followUps.slice(0, 3),
    adaptation,
  }
}

// ── 6. Kids Guide (Sparky) Execution & Response Synthesis ───────────────────

export function runKidsGuideTurn(
  message: string,
  context: Record<string, unknown>,
  history: AgentHistoryItem[],
  preferredLevel?: ExplanationLevel
): Omit<AIChatResponse, 'isDemo' | 'providerLabel'> {
  // 1. Check strict child safety guardrails first!
  const safety = checkSafetyGuardrails(message, 'kids')
  if (!safety.safe) {
    return {
      mode: 'kids',
      reply: safety.redirectReply!,
      text: safety.redirectReply!,
      mood: 'concerned',
      followUps: safety.followUps,
      safetyRedirected: true,
    }
  }

  const baseParams = extractCurrentSimParams(context)
  const isSpace = baseParams.gravity < 0.1
  const activeWorldId = (context.selectedWorldId as KidsWorldId | undefined) ?? 'meet-the-flame'
  const activeWorld = KIDS_WORLDS.find((w) => w.id === activeWorldId) ?? KIDS_WORLDS[0]

  const {
    adaptation,
    parsedParamChanges,
    requestedKidsWorld,
  } = analyzeUserTurn(message, history, context, preferredLevel)

  const toolCalls: AgentToolCallRecord[] = []
  const clientActions: AgentClientAction[] = []

  // Run the safe virtual chamber model so Sparky can explain real numbers in kid-friendly terms!
  const sim = toolRunCombustionSimulation(parsedParamChanges ?? {}, baseParams)
  toolCalls.push(sim.toolRecord)

  if (requestedKidsWorld) {
    const targetWorld = KIDS_WORLDS.find((w) => w.id === requestedKidsWorld)
    if (targetWorld) {
      clientActions.push({
        id: `kids-world-${Date.now()}`,
        type: 'kids_select_world',
        label: `Open ${targetWorld.worldNumber}: ${targetWorld.title}`,
        description: targetWorld.subtitle,
        autoExecuted: true,
        payload: { worldId: targetWorld.id },
      })
    }
  }

  const q = message.toLowerCase()
  let reply = ''
  let mood: AIChatResponse['mood'] = 'explain'
  let followUps: string[] = []

  if (adaptation.adaptedToConfusion) {
    mood = 'happy'
    reply =
      "No problem at all — let's imagine it in a super simple way! 🎈\n\nImagine you are in a swimming pool with a beach ball underwater. On **Earth**, gravity pulls the heavy water down and pushes the light beach ball **straight up**! Hot air around a candle works just like that beach ball — it floats up and stretches the flame into a pointy teardrop.\n\nBut in **space**, nothing weighs anything! So the hot air doesn't float up at all. Instead, it puffs out evenly in every direction, making a **round glowing blue ball**! Does that picture make more sense?"
    followUps = [
      'Why is the space flame blue?',
      'What happens if we add more oxygen?',
      'Let’s test Space vs. Earth in the Sandbox!',
    ]
  } else if (/hello|hi\b|hey\b|who\s+are\s+you/i.test(q)) {
    mood = 'wave'
    reply = `Hi there, Space Explorer! 👋 I'm **Sparky**, your FLARE space science guide! Right now our virtual chamber is set to **${
      isSpace ? 'Space (Microgravity)' : 'Earth Gravity'
    }** with **${sim.metrics.fuelName}**. We can explore why flames turn into glowing spheres in orbit, how astronauts stay safe, or test different settings together! What are you curious about?`
    followUps = [
      'Why does fire look like a ball in space?',
      'What happens if we add more oxygen?',
      'How do astronauts put out a fire in space?',
    ]
  } else if (
    adaptation.activeTopic === 'gravity_and_diffusion' ||
    /ball|sphere|round|different\s+in\s+space|shape|moon|mars/i.test(q)
  ) {
    mood = 'excited'
    reply = isSpace
      ? `In space, fire forms a calm, glowing **round ball**! 🌟\n\nHere's why: on Earth, hot air is lighter than cool air, so gravity makes hot air rush upward (scientists call that **convection**), pulling the flame into a tall teardrop. In **microgravity** aboard the Space Station, hot air doesn't rise because nothing feels heavy! Instead, oxygen molecules drift in slowly from all sides (**diffusion**), creating a round blue sphere at about **${sim.metrics.peakTemperatureC} °C**.\n\nWhat do you think would happen to this round flame if we turned on a gentle air fan or switched to Moon gravity?`
      : `Right now our chamber is in **${sim.metrics.gravityLabel}**! 🔥 Because gravity is pulling cooler, heavier air downward, the hot glowing gas gets pushed **upward**—stretching our flame into a pointy teardrop (${sim.metrics.flameAspectRatio} times taller than it is wide!).\n\nWant to switch the chamber to **Space (Zero Gravity)** to watch that tall teardrop transform into a glowing round sphere?`

    clientActions.push({
      id: `kids-grav-toggle-${Date.now()}`,
      type: 'kids_open_sandbox',
      label: isSpace ? 'Test Earth Gravity in Sandbox 🌍' : 'Test Space Microgravity in Sandbox 🚀',
      description: 'Opens the interactive Kids Chamber Sandbox with this gravity setting.',
      payload: {
        focus: 'gravity',
        gravity: isSpace ? 'earth' : 'space',
        o2: baseParams.oxygenPercent > 25 ? 'high' : baseParams.oxygenPercent < 18 ? 'low' : 'normal',
      },
    })
    followUps = [
      'What is a "cool flame" in space?',
      'Why is the outer edge of a space flame bright blue?',
      'How does Moon gravity change the flame?',
    ]
  } else if (adaptation.activeTopic === 'oxygen_and_extinction') {
    mood = 'explain'
    reply = `Fire needs **oxygen** gas just like you need air to breathe! 💨\n\nNormal air around us is only about **21% oxygen** (most of the rest is calming nitrogen gas that doesn't burn). In our virtual chamber right now at **${sim.params.oxygenPercent}% oxygen**, the flame reaches **${sim.metrics.peakTemperatureC} °C**:\n- **More oxygen (like 32%):** Fewer nitrogen molecules get in the way, so the flame burns much hotter and brighter!\n- **Too little oxygen (below ~12–15%):** The flame runs out of breath and goes out!\n\nWhy do you think astronauts have to be extra careful when testing spacecraft cabins with extra oxygen?`

    clientActions.push({
      id: `kids-o2-sandbox-${Date.now()}`,
      type: 'kids_open_sandbox',
      label: 'Try the Oxygen Slider in the Sandbox 💨',
      description: 'Compare Low, Normal, and High oxygen in the safe virtual chamber.',
      payload: { focus: 'oxygen', gravity: isSpace ? 'space' : 'earth', o2: 'high' },
    })
    followUps = [
      'Why does nitrogen help slow down a fire?',
      'Open World 02: The Oxygen Mystery',
      'What happens when oxygen drops too low?',
    ]
  } else if (adaptation.activeTopic === 'airflow_and_ventilation') {
    mood = 'surprised'
    reply = `Here is one of space science's biggest surprises: **blowing on a space flame can make it burn STRONGER instead of putting it out!** 🌬️✨\n\nIn a weightless spacecraft, air stays totally still unless a fan moves it. Without a fan, a space flame slowly uses up the oxygen around itself and gets sleepy. When a gentle ventilation breeze flows past, it brings fresh oxygen right to the flame! That's why if there's ever smoke on the Space Station, the computer **turns off the air fans first**!\n\nWant to explore **World 03: The Invisible Wind** to see how airflow steers a space flame?`

    clientActions.push({
      id: `kids-world3-${Date.now()}`,
      type: 'kids_select_world',
      label: 'Explore World 03: The Invisible Wind 🌬️',
      description: 'Discover how ventilation fans feed and steer flames in space.',
      payload: { worldId: 'invisible-wind' },
    })
    followUps = [
      'Explore World 03: The Invisible Wind',
      'How do smoke detectors work when smoke doesn’t rise?',
      'Why can’t you blow out a space candle easily?',
    ]
  } else if (
    adaptation.activeTopic === 'flex_cool_flames' ||
    /cool\s+flame|invisible/i.test(q)
  ) {
    mood = 'surprised'
    reply = `**Cool flames** are real, and NASA astronauts discovered them on the Space Station during the **FLEX-2** experiment! 🧊🔥\n\nWhen a small droplet of fuel burned in space, the bright flame went out—but special cameras saw that the fuel kept reacting **invisibly** at around **300 °C** (much cooler than a normal **1,500 °C** flame!). Because there's no gravity to carry heat away quickly, the chemical reaction can keep humming along in "low gear." Pretty wild, right?`
    followUps = [
      'How did NASA cameras see an invisible flame?',
      'Explore World 04: Inside the Space Lab',
      'Why is fire blue in microgravity?',
    ]
  } else if (
    adaptation.activeTopic === 'saffire' ||
    adaptation.activeTopic === 'historical_incidents' ||
    /safe|astronaut|extinguish|detector|saffire|cir/i.test(q)
  ) {
    mood = 'explain'
    reply = `Keeping astronauts safe is NASA's #1 rule! 🛡️🛸\n\n1. **Triple-Sealed Lab Rack (CIR):** On the Space Station, small flame tests happen inside a locked metal chamber so astronauts never touch the flame.\n2. **Uncrewed Robot Cargo Ships (Saffire):** When NASA wanted to test *big* fires, they waited until an uncrewed **Cygnus cargo ship** left the Space Station with **zero astronauts aboard**!\n3. **Smart Smoke Detectors:** Since smoke doesn't float up to the ceiling in space, detectors are placed inside the **air vents** where fans pull the air!\n\nWhich part of astronaut fire safety would you like to inspect next?`

    clientActions.push({
      id: `kids-world5-${Date.now()}`,
      type: 'kids_select_world',
      label: 'Explore World 05: Keeping Astronauts Safe 🛡️',
      description: 'See how NASA prevents, detects, and stops fire in orbit.',
      payload: { worldId: 'keeping-astronauts-safe' },
    })
    followUps = [
      'Explore World 04: Inside the Space Lab',
      'Explore World 05: Keeping Astronauts Safe',
      'What materials do astronauts wear to stay safe?',
    ]
  } else {
    mood = 'happy'
    reply = `That's a fantastic science question! 🚀 Right now we're exploring **${activeWorld.title}** (${
      isSpace ? 'Space Microgravity' : 'Earth Gravity'
    }, **${sim.metrics.fuelName}**, flame temperature **${sim.metrics.peakTemperatureC} °C**).\n\nIn space, because hot air doesn't rise on its own, flames turn into calm glowing spheres, smoke floats along with the air vents, and tiny changes in oxygen or wind change the whole experiment! Would you like to test that in our **Chamber Sandbox** or explore one of the **5 Science Worlds**?`

    clientActions.push({
      id: `kids-sandbox-gen-${Date.now()}`,
      type: 'kids_open_sandbox',
      label: 'Open the Interactive Chamber Sandbox 🔬',
      description: 'Test Gravity, Oxygen, and Materials side by side!',
      payload: { focus: 'gravity', gravity: isSpace ? 'space' : 'earth', o2: 'normal' },
    })
    followUps = [
      'Why does fire make a ball in space?',
      'Why can’t you blow out a space flame easily?',
      'What are invisible cool flames?',
    ]
  }

  return {
    mode: 'kids',
    reply,
    text: reply,
    mood,
    toolCalls,
    clientActions,
    followUps,
    adaptation,
  }
}

// ── 7. System Prompts for Live Cloud LLM (Gemini 2.5 / 2.0 Flash) ────────────

export function buildLiveLLMSystemPrompt(
  mode: AgentMode,
  context: Record<string, unknown>,
  preExecutedTools: AgentToolCallRecord[],
  adaptation: AgentSessionAdaptation
): string {
  const toolContextJson = JSON.stringify(
    preExecutedTools.map((t) => ({
      tool: t.name,
      summary: t.summary,
      output: t.output,
    })),
    null,
    2
  )

  if (mode === 'kids') {
    return `You are Sparky — the friendly, patient, encouraging FLARE Kids Science Guide helping children (ages 8–14) discover how fire behaves in space and how NASA keeps astronauts safe.

ACTIVE FLARE KIDS CONTEXT:
- Active Section: ${context.section ?? 'ask'}
- Selected Science World: ${context.selectedWorldId ?? 'meet-the-flame'}
- Sandbox Gravity: ${context.gravity ?? 'space'}
- Sandbox Oxygen Level: ${context.o2Level ?? 'normal'}
- Sandbox Material: ${context.fuel ?? 'cloth'}
- User Adaptation State: Explanation Level = ${adaptation.explanationLevel}, Confusion Detected = ${adaptation.adaptedToConfusion}

VERIFIED SIMULATION & SCIENCE DATA FROM FLARE TOOLS:
${toolContextJson}

COMMUNICATION & SAFETY RULES:
1. Speak in warm, natural, age-appropriate English (8–12 year old reading level). Use vivid everyday analogies (like a hot-air balloon or food coloring in water).
2. Keep answers concise (2–3 short paragraphs max) and end with ONE engaging follow-up question that sparks curiosity.
3. If the child was confused (${adaptation.adaptedToConfusion}), use a simpler analogy and do not repeat technical jargon.
4. STRICT SAFETY: NEVER give instructions for lighting fires, playing with matches/lighters, or doing fire experiments at home. Always emphasize that NASA tests fire inside sealed orbital chambers (CIR) or computer simulations. NEVER ask for personal information.`
  }

  return `You are the FLARE Scientific Agent — an intelligent, context-aware combustion science and spacecraft fire-safety research partner for FLARE (Fire & Life-Safety Analysis and Risk Explorer).

ACTIVE FLARE APPLICATION CONTEXT:
- Active Route: /${context.activeRoute ?? 'science'}
- Active Material: ${context.fuel ?? 'cellulose'} (${context.fuelNote ?? ''})
- Gravity: ${context.gravity ?? '0.001'} m/s² (${context.gravityLabel ?? 'ISS Microgravity'})
- Oxygen Concentration: ${context.oxygenPercent ?? 21}% O₂
- Ambient Pressure: ${context.pressure ?? 1.0} atm
- Ventilation Airflow: ${context.airflowVelocity ?? 0.0} m/s
- Sample Diameter: ${context.sampleDiameter ?? 5} mm
- Simulation Status: ${context.status ?? 'idle'}
- User Adaptation State: Explanation Level = ${adaptation.explanationLevel}, Intent = ${adaptation.detectedIntent}, Confusion = ${adaptation.adaptedToConfusion}, Correction = ${adaptation.handledCorrection}

VERIFIED OUTPUTS FROM EXECUTED FLARE TOOLS (D² LAW ENGINE & NASA ARCHIVE):
${toolContextJson}

SCIENTIFIC & COMMUNICATION STANDARDS:
1. Communicate naturally, clearly, and directly in professional English. Do NOT repeat the user's question and do NOT use robotic filler introductions.
2. Ground every quantitative claim in the exact tool outputs provided above (flame temperature in K and °C, heat release rate in W, D² burning constant K in mm²/s, flame radius in mm, aspect ratio).
3. Explicitly distinguish empirical NASA findings (FLEX, FLEX-2, BASS, BASS-II, Saffire I–VI, SAME, ACME) from FLARE's analytical 0D/1D D² Law model estimates ($D^2(t) = D_0^2 - K t$, not a 3D Navier-Stokes CFD solver).
4. CRITICAL FACTUAL RULE: Always state that NASA's Saffire I–VI experiments were conducted aboard UNCREWED Cygnus cargo vehicles after departing the ISS—never inside a crewed ISS cabin.
5. Adapt to the user: if Explanation Level is 'simple-analogy', use an intuitive physical analogy first; if 'deep-technical', include the governing equations (Spalding number B, D² Law, Sherwood/Grashof scaling); if 'concise', answer in 3–4 tight sentences.`
}

