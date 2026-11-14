// ─────────────────────────────────────────────────────────────────────────────
// FLARE — Simulation Scenario Presets
// Phase 06: Scientific Comparison
//
// These are pre-defined simulation parameter sets that represent scientifically
// meaningful combustion conditions. They are model outputs based on the D² Law
// implementation — NOT measured experimental data.
//
// All values are labeled as MODEL ESTIMATES. No scenario claims to replicate
// any specific NASA experiment exactly.
// ─────────────────────────────────────────────────────────────────────────────

import type { FuelMaterial } from '@/lib/simulation/types'

export interface SimulationScenario {
  id: string
  type: 'simulation'
  name: string
  shortDescription: string
  fullDescription: string
  fuel: FuelMaterial
  fuelLabel: string
  oxygenPercent: number
  pressureAtm: number
  airflowVelocity: number   // m/s
  gravity: number           // m/s²
  gravityLabel: string
  sampleDiameter: number    // mm
  duration: number          // s
  // Model-estimated output ranges (from D² Law — clearly labeled)
  estimatedFlameTemp: { min: number; max: number } | null   // K
  estimatedBurnTime: { min: number; max: number } | null    // s
  estimatedFlameRadius: { min: number; max: number } | null // mm
  flameShape: string
  combustionNotes: string[]
  modelCaveats: string[]
  relatedNasaPrograms: string[]
  tags: string[]
}

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'sim-microgravity-baseline',
    type: 'simulation',
    name: 'Microgravity Baseline',
    shortDescription: 'ISS-like quiescent microgravity with standard air',
    fullDescription:
      'A quiescent microgravity environment with 21% O₂ at standard pressure. ' +
      'Represents the baseline condition relevant to spacecraft interior fire research. ' +
      'Without buoyancy, the flame spreads spherically and oxygen must diffuse inward.',
    fuel: 'pmma',
    fuelLabel: 'PMMA (Acrylic)',
    oxygenPercent: 21,
    pressureAtm: 1.0,
    airflowVelocity: 0.0,
    gravity: 0.001,
    gravityLabel: 'Microgravity (ISS)',
    sampleDiameter: 5,
    duration: 60,
    estimatedFlameTemp: { min: 1600, max: 1900 },
    estimatedBurnTime: { min: 40, max: 70 },
    estimatedFlameRadius: { min: 8, max: 18 },
    flameShape: 'Near-spherical / slightly oblate',
    combustionNotes: [
      'Flame approaches spherical symmetry in quiescent microgravity.',
      'Oxygen supply is diffusion-limited — no buoyant convection.',
      'Flame temperature lower than 1g equivalent due to reduced oxidizer transport.',
      'Cool flame phenomena possible at late burn stages (not modeled here).',
    ],
    modelCaveats: [
      'D² Law assumes spherically symmetric combustion — valid for droplet/small sample models.',
      'Real microgravity flames may extinguish at different thresholds than predicted.',
      'Cool flames and radiative extinction are not captured by this model.',
    ],
    relatedNasaPrograms: ['FLEX', 'FLEX-2', 'ACME', 'BASS'],
    tags: ['microgravity', 'quiescent', 'baseline', 'pmma'],
  },

  {
    id: 'sim-microgravity-low-o2',
    type: 'simulation',
    name: 'Microgravity Low O₂',
    shortDescription: 'Microgravity with reduced oxygen — near extinction boundary',
    fullDescription:
      'Microgravity environment with 15% O₂ — below the nominal Earth extinction limit ' +
      'but above the typical microgravity limit for PMMA. Tests the reduced extinction ' +
      'threshold that NASA experiments have documented in space.',
    fuel: 'pmma',
    fuelLabel: 'PMMA (Acrylic)',
    oxygenPercent: 15,
    pressureAtm: 1.0,
    airflowVelocity: 0.0,
    gravity: 0.001,
    gravityLabel: 'Microgravity (ISS)',
    sampleDiameter: 5,
    duration: 60,
    estimatedFlameTemp: { min: 1200, max: 1500 },
    estimatedBurnTime: { min: 20, max: 50 },
    estimatedFlameRadius: { min: 5, max: 12 },
    flameShape: 'Spherical — small and dim',
    combustionNotes: [
      'Flame burns close to extinction limit — small, cool, and dim.',
      'Significantly lower heat release rate than 21% O₂ baseline.',
      'Model may predict extinction earlier than observed in real microgravity experiments.',
      'Real FLEX-2 results showed burning continuation at 10% O₂ (not captured here).',
    ],
    modelCaveats: [
      'D² Law does not model cool flames or radiative extinction accurately at low O₂.',
      'Actual PMMA microgravity extinction limit (~10%) is lower than the model predicts.',
      'Near-limit behavior requires detailed chemistry — beyond D² Law scope.',
    ],
    relatedNasaPrograms: ['FLEX', 'FLEX-2', 'ACME'],
    tags: ['microgravity', 'low-oxygen', 'extinction', 'pmma'],
  },

  {
    id: 'sim-microgravity-enriched-o2',
    type: 'simulation',
    name: 'Microgravity Enriched O₂',
    shortDescription: 'Microgravity with elevated oxygen — enhanced fire hazard scenario',
    fullDescription:
      'Elevated oxygen at 30% in a microgravity environment — representing scenarios ' +
      'where oxygen management systems could fail and produce enriched atmospheres. ' +
      'Significantly more vigorous combustion than the 21% baseline.',
    fuel: 'cellulose',
    fuelLabel: 'Cellulose / Cotton',
    oxygenPercent: 30,
    pressureAtm: 1.0,
    airflowVelocity: 0.0,
    gravity: 0.001,
    gravityLabel: 'Microgravity (ISS)',
    sampleDiameter: 5,
    duration: 60,
    estimatedFlameTemp: { min: 1900, max: 2100 },
    estimatedBurnTime: { min: 25, max: 45 },
    estimatedFlameRadius: { min: 12, max: 24 },
    flameShape: 'Spherical — large and luminous',
    combustionNotes: [
      'Significantly higher flame temperature and heat release rate than air baseline.',
      'Faster mass loss rate — material consumed more quickly.',
      'Enhanced soot production possible due to richer combustion zone.',
      'Represents a credible spacecraft fire hazard from O₂ system failure.',
    ],
    modelCaveats: [
      'D² Law overestimates burn rate at very high O₂ concentrations.',
      'Soot production modeling is simplified — sootIndex-based only.',
      'Real behavior may include secondary ignition and flame spread not captured here.',
    ],
    relatedNasaPrograms: ['BASS', 'Saffire', 'SPICE'],
    tags: ['microgravity', 'enriched-oxygen', 'fire-hazard', 'cellulose'],
  },

  {
    id: 'sim-iss-ventilation',
    type: 'simulation',
    name: 'ISS Ventilation Flow',
    shortDescription: 'Microgravity with forced ventilation — ISS cabin air current',
    fullDescription:
      'Simulates the ISS cabin environment where CDRA (Carbon Dioxide Removal Assembly) ' +
      'and other systems create a persistent air current of approximately 0.2–0.3 m/s. ' +
      'Forced airflow in microgravity changes flame behavior significantly from quiescent conditions.',
    fuel: 'cellulose',
    fuelLabel: 'Cellulose / Cotton',
    oxygenPercent: 21,
    pressureAtm: 1.0,
    airflowVelocity: 0.2,
    gravity: 0.001,
    gravityLabel: 'Microgravity (ISS)',
    sampleDiameter: 5,
    duration: 60,
    estimatedFlameTemp: { min: 1700, max: 1950 },
    estimatedBurnTime: { min: 30, max: 55 },
    estimatedFlameRadius: { min: 7, max: 16 },
    flameShape: 'Elongated downstream — forced convection plume',
    combustionNotes: [
      'Forced convection replaces buoyancy as the primary oxidizer transport mechanism.',
      'Flame elongates in the direction of airflow.',
      'Better oxygen supply than quiescent microgravity — more vigorous burn.',
      'Represents the dominant flame spread mode aboard the ISS.',
    ],
    modelCaveats: [
      'D² Law assumes spherical geometry — forced flow asymmetry is not fully captured.',
      'Flame elongation and downstream convection are approximated, not calculated from first principles.',
      'Real ISS flame spread experiments (BASS, BASS-II) used flat samples — different geometry.',
    ],
    relatedNasaPrograms: ['BASS', 'BASS-II', 'SAME', 'Saffire'],
    tags: ['microgravity', 'forced-flow', 'iss-conditions', 'cellulose'],
  },

  {
    id: 'sim-earth-baseline',
    type: 'simulation',
    name: 'Earth Gravity Baseline',
    shortDescription: 'Standard Earth gravity — laboratory reference condition',
    fullDescription:
      'Standard laboratory combustion in 1g with 21% O₂ at sea level pressure. ' +
      'The reference condition for all comparisons. Buoyancy-driven convection ' +
      'creates the characteristic upward-pointing teardrop flame.',
    fuel: 'cellulose',
    fuelLabel: 'Cellulose / Cotton',
    oxygenPercent: 21,
    pressureAtm: 1.0,
    airflowVelocity: 0.0,
    gravity: 9.81,
    gravityLabel: 'Earth (1g)',
    sampleDiameter: 5,
    duration: 60,
    estimatedFlameTemp: { min: 1700, max: 1900 },
    estimatedBurnTime: { min: 25, max: 50 },
    estimatedFlameRadius: { min: 6, max: 14 },
    flameShape: 'Teardrop — buoyancy-driven upward plume',
    combustionNotes: [
      'Buoyancy creates natural convection that continuously supplies fresh oxygen.',
      'Flame has classic teardrop shape with blue base and orange tip.',
      'Higher oxygen transport rate compared to quiescent microgravity.',
      'Faster mass loss rate than microgravity equivalent.',
    ],
    modelCaveats: [
      'D² Law was originally developed for droplet combustion — 1g solid fuel application is approximate.',
      'Buoyancy-induced convection changes the effective transport coefficients.',
      'Real solid fuel flames in 1g are substantially more complex than the D² Law predicts.',
    ],
    relatedNasaPrograms: [],
    tags: ['earth-gravity', 'reference', 'buoyancy', 'cellulose'],
  },

  {
    id: 'sim-low-pressure-microgravity',
    type: 'simulation',
    name: 'Low Pressure Microgravity',
    shortDescription: 'Reduced pressure in microgravity — Orion/exploration vehicle scenario',
    fullDescription:
      'Represents a potential future exploration vehicle atmosphere at reduced total pressure ' +
      'with slightly elevated O₂ percentage to maintain equivalent partial pressure of oxygen. ' +
      'Lower total pressure reduces heat transfer and flame stability.',
    fuel: 'pmma',
    fuelLabel: 'PMMA (Acrylic)',
    oxygenPercent: 26,
    pressureAtm: 0.7,
    airflowVelocity: 0.0,
    gravity: 0.001,
    gravityLabel: 'Microgravity',
    sampleDiameter: 5,
    duration: 60,
    estimatedFlameTemp: { min: 1400, max: 1750 },
    estimatedBurnTime: { min: 30, max: 60 },
    estimatedFlameRadius: { min: 7, max: 15 },
    flameShape: 'Spherical — reduced pressure elongates diffusion zone',
    combustionNotes: [
      'Reduced total pressure lowers flame stability and heat release rates.',
      'Higher O₂ fraction partially compensates for lower total pressure.',
      'Extinction limits differ from standard pressure conditions.',
      'Relevant to exploration vehicle atmosphere design trade-offs.',
    ],
    modelCaveats: [
      'Pressure dependence in D² Law is simplified — real behavior is more complex.',
      'Extinction prediction at reduced pressure is particularly uncertain.',
      'Model does not account for changed diffusion coefficients at reduced pressure.',
    ],
    relatedNasaPrograms: ['ACME', 'FLEX', 'SPICE'],
    tags: ['microgravity', 'low-pressure', 'exploration', 'pmma'],
  },

  {
    id: 'sim-high-energy-fuel',
    type: 'simulation',
    name: 'High-Energy Fuel (Polyethylene)',
    shortDescription: 'Polyethylene in microgravity — high fire risk polymer',
    fullDescription:
      'Polyethylene (HDPE) is one of the most energy-dense common spacecraft materials ' +
      '(46.4 MJ/kg). This scenario models its behavior in a microgravity environment, ' +
      'relevant to cable sheathing and equipment housing fire risk.',
    fuel: 'polyethylene',
    fuelLabel: 'Polyethylene (HDPE)',
    oxygenPercent: 21,
    pressureAtm: 1.0,
    airflowVelocity: 0.0,
    gravity: 0.001,
    gravityLabel: 'Microgravity (ISS)',
    sampleDiameter: 5,
    duration: 60,
    estimatedFlameTemp: { min: 1800, max: 2100 },
    estimatedBurnTime: { min: 35, max: 65 },
    estimatedFlameRadius: { min: 9, max: 20 },
    flameShape: 'Spherical — bright and sooty',
    combustionNotes: [
      'Highest heat of combustion of the available materials (46.4 MJ/kg).',
      'Significant soot production — polyethylene has high sootIndex.',
      'Harder to extinguish than cellulose — requires lower O₂ for extinction.',
      'Represents cable insulation and equipment housing fire hazards.',
    ],
    modelCaveats: [
      'High soot production changes flame opacity — optical diagnostics would be affected.',
      'D² Law does not model the interaction between soot and radiation accurately.',
      'Melting and dripping behavior of HDPE is not captured in this solid-sample model.',
    ],
    relatedNasaPrograms: ['BASS', 'BASS-II', 'Saffire'],
    tags: ['microgravity', 'polyethylene', 'high-energy', 'soot'],
  },

  {
    id: 'sim-mars-surface',
    type: 'simulation',
    name: 'Mars Surface Gravity',
    shortDescription: 'Mars surface gravity — partial gravity fire behavior',
    fullDescription:
      'Mars surface gravity (3.72 m/s² = 0.38g) represents an intermediate case ' +
      'between microgravity and Earth. Buoyancy effects are reduced but present. ' +
      'Important for future Mars habitat fire safety design.',
    fuel: 'paper',
    fuelLabel: 'Paper (Cellulosic)',
    oxygenPercent: 21,
    pressureAtm: 1.0,
    airflowVelocity: 0.0,
    gravity: 3.72,
    gravityLabel: 'Mars Surface (0.38g)',
    sampleDiameter: 5,
    duration: 60,
    estimatedFlameTemp: { min: 1550, max: 1800 },
    estimatedBurnTime: { min: 30, max: 60 },
    estimatedFlameRadius: { min: 6, max: 15 },
    flameShape: 'Intermediate — weak buoyant plume, broader than 1g',
    combustionNotes: [
      'Intermediate buoyancy produces a broader, less elongated flame than 1g.',
      'Oxygen transport is slower than Earth — flame behavior closer to microgravity.',
      'Paper has the lowest ignition temperature of the available materials.',
      'Relevant to future Mars habitat and surface vehicle fire safety.',
    ],
    modelCaveats: [
      'D² Law does not natively model partial gravity flame shape transitions.',
      'The gravity scaling used is a simplified approximation.',
      'Real partial-gravity flame behavior is an active NASA research area.',
    ],
    relatedNasaPrograms: [],
    tags: ['partial-gravity', 'mars', 'paper', 'exploration'],
  },
]

// Helper to get a scenario by id
export function getScenarioById(id: string): SimulationScenario | undefined {
  return SIMULATION_SCENARIOS.find(s => s.id === id)
}

