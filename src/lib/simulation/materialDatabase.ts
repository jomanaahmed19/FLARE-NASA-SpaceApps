// ══════════════════════════════════════════════════════════════════
//  FLARE — Material Properties Database
//  Phase 02: Scientific Combustion Simulation Lab
//
//  Values sourced from:
//  — Quintiere, J.G. (2006) "Fundamentals of Fire Phenomena"
//  — Williams, F.A. (1985) "Combustion Theory" (2nd ed.)
//  — NASA Technical Reports: FLEX-2 and BASS experiments (ISS)
//  — Friedman, R. (1999) "Fire Safety in the Low-Gravity Spacecraft Environment"
// ══════════════════════════════════════════════════════════════════

import type { MaterialProperties, GravityPreset } from './types'

export const MATERIALS: Record<string, MaterialProperties> = {

  cellulose: {
    id: 'cellulose',
    name: 'Cellulose / Cotton',
    chemicalNote: 'Cellulose polymer (C₆H₁₀O₅)ₙ — natural polysaccharide',
    heatOfCombustion: 17.5,       // MJ/kg  [Quintiere 2006, Table 3.1]
    density: 1500,                 // kg/m³  [Nominal for cotton fiber]
    stoichO2Ratio: 1.17,          // kg O₂/kg fuel  [Combustion stoichiometry]
    latentHeat: 1.5,              // MJ/kg  [Effective, includes endothermic pyrolysis]
    ignitionTempK: 573,            // K = 300°C  [Babrauskas 2003]
    adiabaticTempAirK: 1800,      // K  [In 21% O₂, 1 atm, 300 K ambient]
    minO2Earth: 15.0,             // vol%  [Friedman 1999, Table 1]
    minO2Microgravity: 12.0,      // vol%  [BASS ISS experiment — lower limit in µg]
    sootIndex: 0.25,
    colors: {
      sample: '#c4a265',
      sampleBurned: '#2d1a0a',
      flame: '#f97316',
    },
    missionNote: 'Represents spacecraft fabrics, wiring insulation, and paper documents. ' +
      'Cotton-based materials caused the Apollo 1 fire (1967).',
  },

  pmma: {
    id: 'pmma',
    name: 'PMMA (Acrylic)',
    chemicalNote: 'Polymethyl methacrylate (C₅H₈O₂)ₙ — transparent thermoplastic',
    heatOfCombustion: 25.2,       // MJ/kg  [Williams 1985, App. A]
    density: 1180,                 // kg/m³  [Standard PMMA]
    stoichO2Ratio: 1.92,          // kg O₂/kg fuel
    latentHeat: 1.6,              // MJ/kg
    ignitionTempK: 593,            // K = 320°C
    adiabaticTempAirK: 2170,      // K
    minO2Earth: 12.0,             // vol%
    minO2Microgravity: 10.0,      // vol%  [FLEX-2 experiment, ISS]
    sootIndex: 0.45,
    colors: {
      sample: '#e8e8f8',
      sampleBurned: '#4a3f3f',
      flame: '#fbbf24',
    },
    missionNote: 'Primary NASA benchmark material for microgravity combustion research. ' +
      'Used as reference in FLEX-2 (Flame Extinguishment Experiment) on ISS.',
  },

  polyethylene: {
    id: 'polyethylene',
    name: 'Polyethylene (HDPE)',
    chemicalNote: 'High-density polyethylene (CH₂CH₂)ₙ — common packaging polymer',
    heatOfCombustion: 46.4,       // MJ/kg  [Quintiere 2006 — highest of common plastics]
    density: 950,                  // kg/m³  [HDPE nominal]
    stoichO2Ratio: 3.14,          // kg O₂/kg fuel
    latentHeat: 2.0,              // MJ/kg
    ignitionTempK: 613,            // K = 340°C
    adiabaticTempAirK: 2300,      // K
    minO2Earth: 12.0,             // vol%
    minO2Microgravity: 9.5,       // vol%
    sootIndex: 0.65,
    colors: {
      sample: '#d4d4d4',
      sampleBurned: '#5a4a3a',
      flame: '#f59e0b',
    },
    missionNote: 'High energy density makes polyethylene a significant fire risk. ' +
      'Found in cable sheathing, food packaging, and equipment housings.',
  },

  paper: {
    id: 'paper',
    name: 'Paper (Cellulosic)',
    chemicalNote: 'Cellulose with mineral fillers — typical office/document paper',
    heatOfCombustion: 17.0,       // MJ/kg  [~Cellulose, slightly lower due to fillers]
    density: 1200,                 // kg/m³
    stoichO2Ratio: 1.13,          // kg O₂/kg fuel
    latentHeat: 1.4,              // MJ/kg  [Lower than cotton due to fillers acting as heat sink]
    ignitionTempK: 563,            // K = 290°C  [Lower than pure cellulose]
    adiabaticTempAirK: 1750,      // K
    minO2Earth: 16.0,             // vol%  [Higher than cotton — lower flame temperature]
    minO2Microgravity: 13.0,      // vol%
    sootIndex: 0.20,
    colors: {
      sample: '#f5f5dc',
      sampleBurned: '#1a1208',
      flame: '#fb923c',
    },
    missionNote: 'Common aboard spacecraft as documents, packaging, and labels. ' +
      'Lower ignition temperature makes paper a priority concern for fire prevention.',
  },

}

// ── Gravity Presets ────────────────────────────────────────────────

export const GRAVITY_PRESETS: GravityPreset[] = [
  {
    label: 'Microgravity (ISS)',
    value: 0.001,
    environment: 'International Space Station — near-weightless environment',
  },
  {
    label: 'Lunar Surface',
    value: 1.62,
    environment: 'Moon surface — 16.5% of Earth gravity',
  },
  {
    label: 'Mars Surface',
    value: 3.72,
    environment: 'Mars surface — 38% of Earth gravity',
  },
  {
    label: 'Earth (1g)',
    value: 9.81,
    environment: 'Standard Earth gravity — laboratory reference',
  },
]

// ── Visualization Layer Metadata ───────────────────────────────────

export const LAYER_METADATA = {
  structure: {
    label: 'Flame Structure',
    description: 'Natural emission colors — blue outer diffusion zone, orange reaction zone, white inner core.',
    colorScale: null,
    unit: null,
  },
  temperature: {
    label: 'Temperature Field',
    description: 'False-color temperature distribution. Blue = ambient (~300 K), red/white = flame zone.',
    colorScale: { min: 300, max: 2200, unit: 'K' },
    unit: 'K',
  },
  airflow: {
    label: 'Airflow / Convection',
    description: 'Velocity streamlines. In µg: diffusion-dominated (radial). In 1g: buoyancy plume (upward).',
    colorScale: { min: 0, max: 0.5, unit: 'm/s' },
    unit: 'm/s',
  },
  oxygen: {
    label: 'O₂ Distribution',
    description: 'Oxygen concentration gradient. Dark = depleted region, bright = fresh oxidizer.',
    colorScale: { min: 0, max: 21, unit: 'vol%' },
    unit: 'vol%',
  },
  soot: {
    label: 'Soot / Smoke',
    description: 'Soot volume fraction. Only meaningful for fuels with sootIndex > 0.3. Microgravity suppresses soot oxidation.',
    colorScale: { min: 0, max: 50, unit: 'ppm' },
    unit: 'ppm',
  },
} as const

