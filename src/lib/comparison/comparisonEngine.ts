// ─────────────────────────────────────────────────────────────────────────────
// FLARE — Comparison Engine
// Phase 06: Scientific Comparison
//
// Extracts, normalises, and compares parameters from NASA experiments and
// simulation scenarios. Produces a structured diff with scientific context.
//
// DATA INTEGRITY:
// - NASA experiment values are "as reported" — string ranges preserved.
// - Simulation values are D² Law model estimates — labeled accordingly.
// - Incompatible comparisons are flagged, never silently equated.
// ─────────────────────────────────────────────────────────────────────────────

import type { NASAExperiment } from '@/data/nasaExperiments'
import type { SimulationScenario } from '@/data/simulationScenarios'

export type ComparisonItem = NASAExperiment | SimulationScenario

export type ItemType = 'nasa' | 'simulation'

export interface NormalisedParam {
  label: string
  unit: string
  /** Numeric value for chart/diff — null if not parseable */
  value: number | null
  /** Display string — always present */
  display: string
  /** Source label for the UI */
  source: 'measured' | 'model-estimate' | 'literature' | 'not-available'
}

export interface NormalisedItem {
  id: string
  name: string
  itemType: ItemType
  fuel: NormalisedParam
  oxygenPercent: NormalisedParam
  pressureAtm: NormalisedParam
  airflowVelocity: NormalisedParam
  gravity: NormalisedParam
  flameTemperature: NormalisedParam
  burnRate: NormalisedParam          // mm/s or qualitative
  flameShape: NormalisedParam
  platform: NormalisedParam
  dataAvailability: string
  warnings: string[]                  // compatibility / data quality warnings
}

export interface ParameterDiff {
  paramKey: keyof Omit<NormalisedItem, 'id' | 'name' | 'itemType' | 'dataAvailability' | 'warnings'>
  label: string
  left: NormalisedParam
  right: NormalisedParam
  /** null if values are non-numeric */
  relativeDiff: number | null
  /** true if the difference is scientifically significant */
  significant: boolean
  significance: 'identical' | 'minor' | 'moderate' | 'major' | 'incomparable'
  explanation: string
}

export interface CompatibilityAssessment {
  compatible: boolean
  level: 'direct' | 'cautious' | 'limited' | 'incompatible'
  reasons: string[]
  caveats: string[]
}

export interface ComparisonResult {
  left: NormalisedItem
  right: NormalisedItem
  diffs: ParameterDiff[]
  compatibility: CompatibilityAssessment
  summaryText: string
  exportData: Record<string, unknown>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFirstNumber(s: string): number | null {
  const m = s.match(/[\d.]+/)
  return m ? parseFloat(m[0]) : null
}

function gravityLabel(g: number): string {
  if (g < 0.01) return 'Microgravity'
  if (g < 2.0)  return 'Lunar (~0.17g)'
  if (g < 4.5)  return 'Mars (~0.38g)'
  if (g < 6.0)  return 'Partial gravity'
  return 'Earth (1g)'
}

// ─── Normalise ────────────────────────────────────────────────────────────────

function normaliseNASA(exp: NASAExperiment): NormalisedItem {
  const warnings: string[] = []

  // Fuel
  const fuelDisplay = exp.fuelMaterial.join(', ')

  // Oxygen
  const o2Raw = exp.conditions.oxygenRange ?? 'Not specified'
  const o2Num = parseFirstNumber(o2Raw)

  // Pressure
  const pressRaw = exp.conditions.pressure ?? 'Not specified'
  const pressNum = parseFirstNumber(pressRaw)

  // Airflow
  const flowRaw = exp.conditions.flowVelocity ?? 'Not specified'
  const flowNum = parseFirstNumber(flowRaw)

  // Gravity
  const gVal = exp.gravityValue
  const gDisplay = exp.gravityEnvironment

  // Temperature
  const tempRaw = exp.conditions.temperature ?? 'Not reported'
  const tempNum = parseFirstNumber(tempRaw)

  // Burn rate — not directly in NASAExperiment; pull from measurements text
  const burnRateText = exp.measurements.find(m =>
    m.toLowerCase().includes('burn') || m.toLowerCase().includes('spread') || m.toLowerCase().includes('rate')
  ) ?? 'Not reported'

  // Platform warning for Saffire
  if (exp.program === 'Saffire') {
    warnings.push('Saffire experiments were conducted aboard UNCREWED Cygnus — not crewed ISS habitat measurements.')
  }
  if (o2Raw === 'Not specified') warnings.push('Oxygen concentration not publicly specified for this experiment.')
  if (pressRaw === 'Not specified') warnings.push('Pressure not publicly specified for this experiment.')

  return {
    id: exp.id,
    name: exp.name,
    itemType: 'nasa',
    fuel: {
      label: 'Fuel / Material',
      unit: '',
      value: null,
      display: fuelDisplay,
      source: 'measured',
    },
    oxygenPercent: {
      label: 'O₂ Concentration',
      unit: 'vol%',
      value: o2Num,
      display: o2Raw,
      source: o2Num !== null ? 'measured' : 'not-available',
    },
    pressureAtm: {
      label: 'Pressure',
      unit: 'atm',
      value: pressNum,
      display: pressRaw,
      source: pressNum !== null ? 'measured' : 'not-available',
    },
    airflowVelocity: {
      label: 'Airflow',
      unit: 'm/s',
      value: flowNum,
      display: flowRaw,
      source: flowNum !== null ? 'measured' : 'not-available',
    },
    gravity: {
      label: 'Gravity',
      unit: 'm/s²',
      value: gVal,
      display: gDisplay,
      source: 'measured',
    },
    flameTemperature: {
      label: 'Flame Temperature',
      unit: 'K',
      value: tempNum,
      display: tempRaw,
      source: tempNum !== null ? 'measured' : 'not-available',
    },
    burnRate: {
      label: 'Burn / Spread Rate',
      unit: '',
      value: null,
      display: burnRateText,
      source: 'measured',
    },
    flameShape: {
      label: 'Flame Shape / Geometry',
      unit: '',
      value: null,
      display: exp.gravityValue < 0.01 ? 'Near-spherical (microgravity)' : 'Buoyancy-driven (1g)',
      source: 'literature',
    },
    platform: {
      label: 'Platform',
      unit: '',
      value: null,
      display: exp.platform,
      source: 'measured',
    },
    dataAvailability: exp.dataAvailability,
    warnings,
  }
}

function normaliseSimulation(sc: SimulationScenario): NormalisedItem {
  const tempMid = sc.estimatedFlameTemp
    ? Math.round((sc.estimatedFlameTemp.min + sc.estimatedFlameTemp.max) / 2)
    : null
  const tempDisplay = sc.estimatedFlameTemp
    ? `${sc.estimatedFlameTemp.min}–${sc.estimatedFlameTemp.max} K (model estimate)`
    : 'Not estimated'

  const burnDisplay = sc.estimatedBurnTime
    ? `${sc.estimatedBurnTime.min}–${sc.estimatedBurnTime.max} s burnout (model estimate)`
    : 'Not estimated'

  return {
    id: sc.id,
    name: sc.name,
    itemType: 'simulation',
    fuel: {
      label: 'Fuel / Material',
      unit: '',
      value: null,
      display: sc.fuelLabel,
      source: 'model-estimate',
    },
    oxygenPercent: {
      label: 'O₂ Concentration',
      unit: 'vol%',
      value: sc.oxygenPercent,
      display: `${sc.oxygenPercent}%`,
      source: 'model-estimate',
    },
    pressureAtm: {
      label: 'Pressure',
      unit: 'atm',
      value: sc.pressureAtm,
      display: `${sc.pressureAtm} atm`,
      source: 'model-estimate',
    },
    airflowVelocity: {
      label: 'Airflow',
      unit: 'm/s',
      value: sc.airflowVelocity,
      display: sc.airflowVelocity === 0 ? 'Quiescent (0 m/s)' : `${sc.airflowVelocity} m/s forced flow`,
      source: 'model-estimate',
    },
    gravity: {
      label: 'Gravity',
      unit: 'm/s²',
      value: sc.gravity,
      display: `${sc.gravityLabel} (${sc.gravity} m/s²)`,
      source: 'model-estimate',
    },
    flameTemperature: {
      label: 'Flame Temperature',
      unit: 'K',
      value: tempMid,
      display: tempDisplay,
      source: 'model-estimate',
    },
    burnRate: {
      label: 'Burn / Spread Rate',
      unit: '',
      value: null,
      display: burnDisplay,
      source: 'model-estimate',
    },
    flameShape: {
      label: 'Flame Shape / Geometry',
      unit: '',
      value: null,
      display: sc.flameShape,
      source: 'model-estimate',
    },
    platform: {
      label: 'Platform',
      unit: '',
      value: null,
      display: 'FLARE D² Law Simulation Model',
      source: 'model-estimate',
    },
    dataAvailability: 'model-estimate',
    warnings: sc.modelCaveats,
  }
}

export function normaliseItem(item: ComparisonItem): NormalisedItem {
  if ('type' in item && item.type === 'simulation') {
    return normaliseSimulation(item as SimulationScenario)
  }
  return normaliseNASA(item as NASAExperiment)
}

// ─── Diff logic ───────────────────────────────────────────────────────────────

function diffSignificance(
  key: string,
  a: number,
  b: number,
): { significance: ParameterDiff['significance']; explanation: string } {
  const rel = Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1e-9)

  if (key === 'oxygenPercent') {
    if (rel < 0.03) return { significance: 'identical', explanation: 'Oxygen concentrations are essentially equivalent (< 3% relative difference).' }
    if (rel < 0.15) return { significance: 'minor', explanation: 'Small O₂ difference — combustion behavior will be broadly similar, with minor changes to flame temperature and extinction threshold.' }
    if (rel < 0.40) return { significance: 'moderate', explanation: 'Meaningful O₂ difference — expect noticeable changes in flame temperature, burn rate, and extinction threshold.' }
    return { significance: 'major', explanation: 'Large O₂ difference — fundamentally different combustion regimes. Flame characteristics and extinction limits will differ substantially.' }
  }

  if (key === 'pressureAtm') {
    if (rel < 0.05) return { significance: 'identical', explanation: 'Pressures are essentially equivalent.' }
    if (rel < 0.20) return { significance: 'minor', explanation: 'Small pressure difference — minor effect on diffusion coefficients and flame structure.' }
    if (rel < 0.50) return { significance: 'moderate', explanation: 'Significant pressure difference — affects mass transport rates, extinction limits, and flame thickness.' }
    return { significance: 'major', explanation: 'Very different pressures — combustion physics change substantially. Direct comparison is limited.' }
  }

  if (key === 'airflowVelocity') {
    if (a === 0 && b === 0) return { significance: 'identical', explanation: 'Both conditions are quiescent — no forced airflow in either case.' }
    if (a === 0 || b === 0) return { significance: 'major', explanation: 'One condition is quiescent; the other has forced airflow. This fundamentally changes flame shape, oxygen supply, and spread rate.' }
    if (rel < 0.20) return { significance: 'minor', explanation: 'Similar airflow velocities — comparable forced convection regime.' }
    return { significance: 'moderate', explanation: 'Different airflow velocities — expect proportional changes in flame elongation and burn rate.' }
  }

  if (key === 'gravity') {
    const aµg = a < 0.1
    const bµg = b < 0.1
    if (aµg && bµg) return { significance: 'identical', explanation: 'Both are microgravity environments — buoyancy is negligible in both cases.' }
    if (aµg !== bµg) return { significance: 'major', explanation: 'One condition has buoyancy (gravity-driven convection), the other does not. This is the most fundamental difference in spacecraft vs. Earth combustion.' }
    if (rel < 0.20) return { significance: 'minor', explanation: 'Similar partial-gravity levels — comparable buoyancy effects.' }
    return { significance: 'moderate', explanation: 'Different gravity levels — buoyancy-driven convection will differ, affecting flame shape and oxygen transport.' }
  }

  if (key === 'flameTemperature') {
    if (rel < 0.03) return { significance: 'minor', explanation: 'Flame temperatures are very similar — comparable combustion intensity.' }
    if (rel < 0.10) return { significance: 'moderate', explanation: 'Noticeable temperature difference — reflects different combustion intensities and oxygen availability.' }
    return { significance: 'major', explanation: 'Large flame temperature difference — different combustion regimes with significantly different hazard potential.' }
  }

  if (rel < 0.03) return { significance: 'identical', explanation: 'Values are essentially equivalent.' }
  if (rel < 0.15) return { significance: 'minor', explanation: 'Small difference — minor effect expected.' }
  if (rel < 0.40) return { significance: 'moderate', explanation: 'Moderate difference — expect noticeable changes in behavior.' }
  return { significance: 'major', explanation: 'Large difference — substantially different conditions.' }
}

// ─── Compatibility ────────────────────────────────────────────────────────────

export function assessCompatibility(left: NormalisedItem, right: NormalisedItem): CompatibilityAssessment {
  const reasons: string[] = []
  const caveats: string[] = []
  let score = 0 // 0=incompatible, 1=limited, 2=cautious, 3=direct

  // Both simulation?
  if (left.itemType === 'simulation' && right.itemType === 'simulation') {
    score = 3
    reasons.push('Both are FLARE model simulations — parameters are directly comparable as model inputs.')
    caveats.push('All compared values are D² Law model estimates, not measured data.')
  }

  // Both NASA?
  if (left.itemType === 'nasa' && right.itemType === 'nasa') {
    score = 2
    reasons.push('Both are NASA experiments — experimental conditions can be compared, but measurement methodologies may differ.')
    caveats.push('Some conditions may not be publicly reported — gaps are noted as "Not available".')
  }

  // Mixed NASA + simulation
  if (left.itemType !== right.itemType) {
    score = 1
    reasons.push('Comparing a NASA experimental record with a simulation model output.')
    caveats.push('NASA measurements reflect real experimental results; simulation values are D² Law model estimates for a spherical sample — methodologies are fundamentally different.')
    caveats.push('Use this comparison to understand qualitative relationships, not to validate model accuracy.')
  }

  // Gravity regime mismatch
  const lG = left.gravity.value ?? 0
  const rG = right.gravity.value ?? 0
  const lMicro = lG < 0.1
  const rMicro = rG < 0.1
  if (lMicro !== rMicro) {
    score = Math.min(score, 1)
    reasons.push('Gravity regimes differ — buoyancy-driven vs. diffusion-dominated combustion are fundamentally different physical regimes.')
    caveats.push('Direct quantitative comparison of outcomes across gravity regimes is not appropriate without scaling corrections.')
  }

  // Fuel class mismatch
  const lFuel = left.fuel.display.toLowerCase()
  const rFuel = right.fuel.display.toLowerCase()
  const lLiquid = lFuel.includes('heptane') || lFuel.includes('methanol') || lFuel.includes('droplet')
  const rLiquid = rFuel.includes('heptane') || rFuel.includes('methanol') || rFuel.includes('droplet')
  if (lLiquid !== rLiquid) {
    score = Math.min(score, 1)
    reasons.push('Fuel types differ between liquid and solid — combustion mechanisms are distinct (evaporation vs. pyrolysis).')
  }

  // Large O₂ difference
  const lO2 = left.oxygenPercent.value
  const rO2 = right.oxygenPercent.value
  if (lO2 !== null && rO2 !== null && Math.abs(lO2 - rO2) > 10) {
    caveats.push(`O₂ difference of ${Math.abs(lO2 - rO2).toFixed(0)}% is large — extinction thresholds and flame temperatures will differ substantially.`)
  }

  const levels: CompatibilityAssessment['level'][] = ['incompatible', 'limited', 'cautious', 'direct']
  return {
    compatible: score >= 1,
    level: levels[Math.max(0, Math.min(score, 3))],
    reasons,
    caveats,
  }
}

// ─── Full comparison ──────────────────────────────────────────────────────────

export function compareItems(leftRaw: ComparisonItem, rightRaw: ComparisonItem): ComparisonResult {
  const left = normaliseItem(leftRaw)
  const right = normaliseItem(rightRaw)
  const compatibility = assessCompatibility(left, right)

  const paramKeys: Array<keyof Omit<NormalisedItem, 'id' | 'name' | 'itemType' | 'dataAvailability' | 'warnings'>> = [
    'fuel', 'oxygenPercent', 'pressureAtm', 'airflowVelocity',
    'gravity', 'flameTemperature', 'burnRate', 'flameShape', 'platform',
  ]

  const diffs: ParameterDiff[] = paramKeys.map(key => {
    const lp = left[key] as NormalisedParam
    const rp = right[key] as NormalisedParam

    let relDiff: number | null = null
    let sig: ParameterDiff['significance'] = 'incomparable'
    let explanation = 'Qualitative comparison only — numeric diff not applicable.'

    if (lp.value !== null && rp.value !== null) {
      relDiff = (rp.value - lp.value) / Math.max(Math.abs(lp.value), Math.abs(rp.value), 1e-9)
      const result = diffSignificance(key as string, lp.value, rp.value)
      sig = result.significance
      explanation = result.explanation
    } else if (lp.display === rp.display) {
      sig = 'identical'
      explanation = 'Values are identical.'
    } else if (lp.source === 'not-available' || rp.source === 'not-available') {
      sig = 'incomparable'
      explanation = 'One or both values are not publicly available — numeric comparison is not possible.'
    }

    return {
      paramKey: key,
      label: lp.label,
      left: lp,
      right: rp,
      relativeDiff: relDiff,
      significant: sig === 'major' || sig === 'moderate',
      significance: sig,
      explanation,
    }
  })

  // Build summary text
  const majorDiffs = diffs.filter(d => d.significance === 'major')
  const summaryText = [
    `Comparing "${left.name}" (${left.itemType === 'nasa' ? 'NASA Experiment' : 'Simulation'}) `,
    `with "${right.name}" (${right.itemType === 'nasa' ? 'NASA Experiment' : 'Simulation'}).`,
    compatibility.level === 'direct'
      ? ' Direct comparison is appropriate.'
      : compatibility.level === 'cautious'
      ? ' Comparison is possible with caveats.'
      : compatibility.level === 'limited'
      ? ' Comparison is limited — use results qualitatively only.'
      : ' Direct comparison is not appropriate — conditions are too dissimilar.',
    majorDiffs.length > 0
      ? ` Key differences: ${majorDiffs.map(d => d.label).join(', ')}.`
      : ' Conditions are broadly similar.',
  ].join('')

  // Export data
  const exportData = {
    generatedAt: new Date().toISOString(),
    tool: 'FLARE — Fire & Life-Safety Analysis and Risk Explorer',
    team: 'WUNDERBAO',
    disclaimer: 'Model outputs are D² Law educational estimates. NASA experiment data is from published sources. This is not a validated engineering tool.',
    left: { id: left.id, name: left.name, type: left.itemType },
    right: { id: right.id, name: right.name, type: right.itemType },
    compatibility: compatibility.level,
    compatibilityCaveats: compatibility.caveats,
    parameters: diffs.map(d => ({
      parameter: d.label,
      left: { value: d.left.display, source: d.left.source },
      right: { value: d.right.display, source: d.right.source },
      significance: d.significance,
      explanation: d.explanation,
    })),
  }

  return { left, right, diffs, compatibility, summaryText, exportData }
}

