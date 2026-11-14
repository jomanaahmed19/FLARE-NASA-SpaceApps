// ══════════════════════════════════════════════════════════════════
//  FLARE — Shared TypeScript Types
//  Phase 02: Scientific Combustion Simulation Lab
// ══════════════════════════════════════════════════════════════════

/** Available solid fuel materials for simulation */
export type FuelMaterial = 'cellulose' | 'pmma' | 'polyethylene' | 'paper'

/** Visualization layer modes for the 3D scene */
export type VisualizationLayer = 'structure' | 'temperature' | 'airflow' | 'oxygen' | 'soot'

/** Current simulation execution state */
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'extinguished'

/** Frame-level status during burn */
export type BurnStatus = 'burning' | 'extinguished' | 'burnout'

// ── Input Parameters ───────────────────────────────────────────────

export interface SimulationParams {
  fuel: FuelMaterial
  /** m/s² — 0.001 (µg) to 9.81 (1g) */
  gravity: number
  /** vol% — 15 to 100 */
  oxygenPercent: number
  /** atm — 0.1 to 1.5 */
  pressure: number
  /** m/s — 0.00 to 0.50 */
  airflowVelocity: number
  /** seconds — 10 to 120 */
  duration: number
  /** mm — 3 to 10 */
  sampleDiameter: number
}

export const DEFAULT_PARAMS: SimulationParams = {
  fuel: 'cellulose',
  gravity: 0.001,
  oxygenPercent: 21,
  pressure: 1.0,
  airflowVelocity: 0.0,
  duration: 60,
  sampleDiameter: 5,
}

// ── Simulation Output ──────────────────────────────────────────────

/** State of the combustion system at a single timestep */
export interface SimulationFrame {
  /** seconds since ignition */
  time: number
  /** mm — current sample diameter (D² law) */
  sampleDiameter: number
  /** mm² — D²(t) for D² law validation chart */
  dSquared: number
  /** mm — outer edge of diffusion flame */
  flameRadius: number
  /** K — adiabatic flame temperature (corrected) */
  flameTemperature: number
  /** K — pyrolyzing surface temperature */
  surfaceTemperature: number
  /** vol% — O₂ remaining in chamber near flame */
  o2NearFlame: number
  /** mg/s — instantaneous mass loss rate */
  massLossRate: number
  /** W — heat release rate */
  heatReleaseRate: number
  /** ppm v/v — soot volume fraction */
  sootVolumeFraction: number
  /**
   * Dimensionless aspect ratio of flame:
   * 1.0 = perfect sphere (µg), >1 = elongated upward (buoyancy)
   */
  flameAspectRatio: number
  status: BurnStatus
}

export interface SimulationSummary {
  /** seconds — null if burnout did not occur within duration */
  burnoutTime: number | null
  /** seconds — null if no extinction occurred */
  extinctionTime: number | null
  extinguished: boolean
  maxFlameTemperature: number   // K
  maxFlameRadius: number        // mm
  totalMassLost: number         // mg
  avgHeatReleaseRate: number    // W
  finalDiameter: number         // mm
  /** fraction of original mass consumed (0–1) */
  burntFraction: number
}

export interface SimulationResult {
  params: SimulationParams
  frames: SimulationFrame[]
  summary: SimulationSummary
  /** Model metadata for scientific transparency */
  model: ModelMetadata
}

// ── Material Properties ────────────────────────────────────────────

export interface MaterialProperties {
  id: FuelMaterial
  name: string
  /** Brief chemical description shown in UI */
  chemicalNote: string
  /** MJ/kg */
  heatOfCombustion: number
  /** kg/m³ */
  density: number
  /** kg_O₂ / kg_fuel — stoichiometric O₂ requirement */
  stoichO2Ratio: number
  /** MJ/kg — effective heat of gasification */
  latentHeat: number
  /** K — minimum surface temperature for sustained burning */
  ignitionTempK: number
  /** K — adiabatic flame temperature in air at STP */
  adiabaticTempAirK: number
  /** vol% — O₂ extinction limit at 1g */
  minO2Earth: number
  /** vol% — O₂ extinction limit in µg */
  minO2Microgravity: number
  /** 0–1: soot production tendency (0 = no soot, 1 = very sooty) */
  sootIndex: number
  colors: {
    /** hex — fresh unburned sample */
    sample: string
    /** hex — charred/burned sample */
    sampleBurned: string
    /** hex — dominant flame emission color */
    flame: string
  }
  /** Short mission-relevance description */
  missionNote: string
}

// ── Scientific Model Documentation ────────────────────────────────

export interface ModelMetadata {
  name: string
  version: string
  /** What this model computes */
  scope: string
  assumptions: string[]
  limitations: string[]
  references: string[]
}

// ── UI State ────────────────────────────────────────────────────────

export interface GravityPreset {
  label: string
  value: number   // m/s²
  environment: string
}

export interface LabState {
  params: SimulationParams
  status: SimulationStatus
  currentFrameIndex: number
  result: SimulationResult | null
  activeLayer: VisualizationLayer
  savedRuns: Array<{ label: string; result: SimulationResult }>
}

