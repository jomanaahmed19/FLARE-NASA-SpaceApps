// ─────────────────────────────────────────────────────────────────────────────
// FLARE — NASA Combustion Experiment Database
// Phase 05: NASA Research and Experiment Explorer
//
// DATA INTEGRITY NOTES:
// - All experiment metadata sourced from published NASA technical reports,
//   peer-reviewed literature, and the NASA Physical Sciences Informatics (PSI)
//   database (https://psi.nasa.gov).
// - Factual gaps are explicitly marked as 'not-publicly-available' or omitted.
// - Saffire experiments were conducted aboard UNCREWED Cygnus cargo spacecraft
//   after departure from the ISS — never during crewed ISS operations.
// - Key findings labeled as LITERATURE-BASED where not from raw PSI data.
// - Do not add values not supported by cited sources.
// ─────────────────────────────────────────────────────────────────────────────

export type DataAvailability = 'psi-dataset' | 'partial-psi' | 'literature-only' | 'restricted'
export type ExperimentStatus = 'completed' | 'ongoing' | 'planned'
export type ExperimentCategory =
  | 'solid-combustion'
  | 'droplet-combustion'
  | 'gas-flame'
  | 'fire-spread'
  | 'smoke-detection'
  | 'extinction'
  | 'multi-topic'

export type ProgramKey =
  | 'Saffire'
  | 'BASS'
  | 'FLEX'
  | 'SAME'
  | 'ACME'
  | 'CFI'
  | 'SPICE'
  | 'SLICE'

export interface SimulationLink {
  fuel: 'cellulose' | 'pmma' | 'polyethylene' | 'paper'
  gravity: number          // m/s²
  oxygenPercent: number
  pressure: number         // atm
  airflowVelocity: number  // m/s
  description: string
  caveat: string           // important mismatch notes
}

export interface NASAExperiment {
  id: string
  program: ProgramKey
  series?: string          // 'I', 'II', etc.
  name: string             // short label used in UI
  fullName: string         // official full name
  acronym: string

  status: ExperimentStatus
  years: { start: number; end?: number }
  pi?: string              // Principal Investigator (omit if uncertain)
  institution?: string

  // Platform
  platform: string
  platformNote: string     // critical: uncrewed for Saffire
  gravityEnvironment: string
  gravityValue: number     // approximate m/s² for reference

  // Science content
  objective: string
  fuelMaterial: string[]
  conditions: {
    oxygenRange?: string
    pressure?: string
    flowVelocity?: string
    sampleSize?: string
    temperature?: string
    other?: string[]
  }
  measurements: string[]
  hardware: string[]

  // Findings — labeled as literature-based, not raw data
  keyFindings: Array<{ text: string; source: string }>

  // Fire safety relevance
  fireRelevance: string

  // Data
  dataAvailability: DataAvailability
  dataNote: string
  psiSearchUrl: string     // link to PSI search for this experiment
  nasaUrl: string          // primary NASA page or NTRS reference
  additionalUrls?: Array<{ label: string; url: string }>

  // Category tags
  category: ExperimentCategory
  tags: string[]

  // Connection to FLARE simulation (if scientifically appropriate)
  simulationLink?: SimulationLink
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAM METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const PROGRAM_META: Record<ProgramKey, { color: string; bg: string; label: string; description: string }> = {
  Saffire: {
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    label: 'Saffire',
    description: 'Spacecraft Fire Safety Demonstration',
  },
  BASS: {
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    label: 'BASS',
    description: 'Burning And Suppression of Solids',
  },
  FLEX: {
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    label: 'FLEX',
    description: 'Flame EXtinguishment Experiment',
  },
  SAME: {
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    label: 'SAME',
    description: 'Smoke Aerosol Measurement Experiment',
  },
  ACME: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    label: 'ACME',
    description: 'Advanced Combustion via Microgravity Experiments',
  },
  CFI: {
    color: '#fb7185',
    bg: 'rgba(251,113,133,0.12)',
    label: 'CFI',
    description: 'Coflow Laminar Diffusion Flame Investigation',
  },
  SPICE: {
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.12)',
    label: 'SPICE',
    description: 'Solid Fuel Ignition and Extinction',
  },
  SLICE: {
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.12)',
    label: 'SLICE',
    description: 'Structure and Liftoff In Combustion Experiment',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENT DATABASE
// ─────────────────────────────────────────────────────────────────────────────

export const NASA_EXPERIMENTS: NASAExperiment[] = [

  // ── SAFFIRE ───────────────────────────────────────────────────────────────

  {
    id: 'saffire-1',
    program: 'Saffire',
    series: 'I',
    name: 'Saffire-I',
    fullName: 'Spacecraft Fire Safety Demonstration I',
    acronym: 'Saffire-I',
    status: 'completed',
    years: { start: 2016, end: 2016 },
    pi: 'David L. Urban',
    institution: 'NASA Glenn Research Center',

    platform: 'Orbital ATK Cygnus CRS OA-6 uncrewed cargo spacecraft',
    platformNote: 'IMPORTANT: Saffire-I was conducted aboard an uncrewed Cygnus resupply spacecraft after it departed the International Space Station, while the spacecraft was in free-flight disposal orbit. The ISS crew was not present and had no involvement during the experiment.',
    gravityEnvironment: 'Microgravity (free-flying uncrewed spacecraft)',
    gravityValue: 0.001,

    objective: 'Demonstrate large-scale fire behavior in a spacecraft environment at scales impossible to study safely aboard the ISS or in ground-based drop towers. Measure flame spread rate, heat flux, and combustion products for a large solid fuel sample in forced airflow at reduced gravity.',
    fuelMaterial: ['Sibal cloth (cotton/fiberglass composite blend)', 'PMMA acrylic plate (reference sample)'],
    conditions: {
      oxygenRange: '~21% (ambient air composition)',
      pressure: '~1 atm',
      flowVelocity: '0.3–0.4 m/s forced airflow',
      sampleSize: '0.4 m × 1.0 m — largest intentional spacecraft fire experiment at the time',
      other: [
        'Forced ventilation provided by dedicated air management system',
        'Experiment conducted in sealed module; no crew aboard',
      ],
    },
    measurements: [
      'Flame spread rate (m/s)',
      'Flame temperature (thermocouples)',
      'Heat flux (radiometers)',
      'Oxygen consumption',
      'Carbon dioxide and carbon monoxide production',
      'Smoke particle size and concentration',
      'Video imaging (visible and near-infrared)',
    ],
    hardware: [
      'Dedicated Saffire Experiment Module (SEM) installed in Cygnus pressurized cargo bay',
      'Air management system with controlled flow rates',
      'Multi-channel thermocouple array',
      'Bi-directional heat flux gauges',
      'Gas sampling system (O₂, CO₂, CO)',
      'Color and near-IR video cameras',
    ],

    keyFindings: [
      {
        text: 'Flame spread was significantly faster than predicted from ground-based, reduced-scale experiments, indicating a scale-dependent behavior not captured by smaller-scale models.',
        source: 'Urban et al. (2019), NASA Technical Report NASA/TM-2019-220010',
      },
      {
        text: 'The large flame produced a substantial amount of soot that accumulated as the experiment progressed, consistent with diffusion-flame behavior in forced convection without buoyancy.',
        source: 'Urban et al. (2019), NASA/TM-2019-220010',
      },
      {
        text: 'Measurement of heat flux provided data that is directly applicable to improving spacecraft fire detection and suppression system design standards.',
        source: 'NASA Physical Sciences Informatics, Saffire-I dataset',
      },
    ],

    fireRelevance: 'Saffire-I generated the first large-scale spacecraft fire data in a relevant environment. The flame spread rates, heat release rates, and smoke characteristics directly inform spacecraft material flammability standards (NASA-STD-6001) and fire detection system design for future exploration vehicles and habitats.',

    dataAvailability: 'psi-dataset',
    dataNote: 'Video, thermocouple, heat flux, and gas analysis data are available through the NASA Physical Sciences Informatics (PSI) database. Access requires free PSI account registration.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=saffire',
    nasaUrl: 'https://www.nasa.gov/saffire',
    additionalUrls: [
      { label: 'NASA NTRS Technical Report', url: 'https://ntrs.nasa.gov/search?q=saffire+urban' },
      { label: 'NASA Glenn Saffire Overview', url: 'https://www1.grc.nasa.gov/space/iss-research/msg/saffire/' },
    ],

    category: 'fire-spread',
    tags: ['fire spread', 'large scale', 'solid fuel', 'Cygnus', 'forced convection', 'microgravity', 'spacecraft safety'],

    simulationLink: {
      fuel: 'cellulose',
      gravity: 0.001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.35,
      description: 'Approximate Saffire-I conditions: cellulose fuel (closest to cotton/fiberglass composite), ISS microgravity level, 21% O₂, forced airflow ~0.35 m/s.',
      caveat: 'Important: FLARE\'s D² Law model simulates small-sample spherical combustion, NOT the large-scale flame spread studied in Saffire-I. This simulation provides a qualitative exploration of microgravity combustion physics, not a quantitative reproduction of Saffire results.',
    },
  },

  {
    id: 'saffire-2',
    program: 'Saffire',
    series: 'II',
    name: 'Saffire-II',
    fullName: 'Spacecraft Fire Safety Demonstration II',
    acronym: 'Saffire-II',
    status: 'completed',
    years: { start: 2016, end: 2016 },
    pi: 'David L. Urban',
    institution: 'NASA Glenn Research Center',

    platform: 'Orbital ATK Cygnus uncrewed cargo spacecraft',
    platformNote: 'IMPORTANT: Saffire-II was conducted aboard an uncrewed Cygnus resupply spacecraft after ISS departure. No crew was present.',
    gravityEnvironment: 'Microgravity (free-flying uncrewed spacecraft)',
    gravityValue: 0.001,

    objective: 'Evaluate the flammability of nine different spacecraft materials in microgravity using small samples simultaneously, expanding the range of materials tested beyond Saffire-I. Determine material-specific ignition, burning, and extinction behavior.',
    fuelMaterial: [
      'Nomex fabric (flame-resistant)',
      'Silicone rubber',
      'PMMA (acrylic)',
      'Fiberglass composite',
      'Mylar film',
      'Cotton/fiberglass Sibal cloth',
      'Polycarbonate',
      'Various wire insulation materials',
      'Velcro-equivalent fabric',
    ],
    conditions: {
      oxygenRange: '~21%',
      pressure: '~1 atm',
      flowVelocity: 'Low forced airflow',
      sampleSize: 'Nine small material samples (~10 cm × 20 cm each)',
    },
    measurements: [
      'Flame spread rate per material',
      'Visible and infrared flame imaging',
      'Extinction or burnout time',
      'Smoke opacity and particle characteristics',
    ],
    hardware: [
      'Saffire Experiment Module (SEM) — multi-sample configuration',
      'Color video cameras per sample',
      'Near-IR imaging system',
      'Smoke detection sensors',
    ],

    keyFindings: [
      {
        text: 'Material flammability rankings in microgravity differed from ground-based standardized tests (FAR 25.853 and NASA-STD-6001), highlighting the inadequacy of 1g tests for predicting microgravity fire risk.',
        source: 'Urban et al., Acta Astronautica (2019); NASA/TM-2019-220010',
      },
      {
        text: 'Several materials that passed standard ground-based flammability tests sustained combustion in microgravity, while others self-extinguished. This directly impacts material selection requirements for spacecraft.',
        source: 'NASA Physical Sciences Informatics, Saffire-II dataset summary',
      },
    ],

    fireRelevance: 'Saffire-II provides multi-material flammability data essential for updating spacecraft material certification standards. The comparison between microgravity and 1g flammability rankings has direct implications for NASA-STD-6001 revision and Artemis program habitat design.',

    dataAvailability: 'psi-dataset',
    dataNote: 'Multi-material video and sensor data available via NASA PSI. Free account required.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=saffire+II',
    nasaUrl: 'https://www.nasa.gov/saffire',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=saffire+II' },
    ],

    category: 'fire-spread',
    tags: ['materials flammability', 'multi-material', 'Cygnus', 'microgravity', 'spacecraft safety', 'solid fuel'],
  },

  {
    id: 'saffire-3',
    program: 'Saffire',
    series: 'III',
    name: 'Saffire-III',
    fullName: 'Spacecraft Fire Safety Demonstration III',
    acronym: 'Saffire-III',
    status: 'completed',
    years: { start: 2017, end: 2017 },
    pi: 'David L. Urban',
    institution: 'NASA Glenn Research Center',

    platform: 'Orbital ATK Cygnus uncrewed cargo spacecraft',
    platformNote: 'IMPORTANT: Saffire-III was conducted aboard an uncrewed Cygnus resupply spacecraft after ISS departure. No crew was present.',
    gravityEnvironment: 'Microgravity (free-flying uncrewed spacecraft)',
    gravityValue: 0.001,

    objective: 'Repeat and extend large-scale fire experiments (similar to Saffire-I) with modifications to study flame spread repeatability, the effects of slightly different airflow conditions, and improved sensor coverage. Validate findings from Saffire-I.',
    fuelMaterial: ['Sibal cloth (cotton/fiberglass composite)', 'PMMA acrylic'],
    conditions: {
      oxygenRange: '~21%',
      pressure: '~1 atm',
      flowVelocity: '0.3–0.4 m/s forced airflow',
      sampleSize: '0.4 m × 1.0 m solid fuel slab',
    },
    measurements: [
      'Flame spread rate',
      'Flame surface temperature (thermocouples, IR)',
      'Heat flux',
      'Gas composition (O₂, CO₂, CO)',
      'Video imaging',
    ],
    hardware: [
      'Saffire Experiment Module (SEM)',
      'Enhanced thermocouple grid vs. Saffire-I',
      'Bidirectional heat flux gauges',
      'Gas chromatography system',
    ],

    keyFindings: [
      {
        text: 'Saffire-III confirmed the repeatability of large-scale flame spread measurements obtained in Saffire-I, adding confidence to the dataset for use in spacecraft fire safety modeling.',
        source: 'Urban et al. (2020), NASA Technical Reports Server',
      },
    ],

    fireRelevance: 'Repeatability data from Saffire-III enables statistical confidence in large-scale spacecraft fire behavior models, which is essential for certifying fire safety systems for Artemis and future deep-space missions.',

    dataAvailability: 'psi-dataset',
    dataNote: 'Data available via NASA PSI database alongside Saffire-I dataset.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=saffire+III',
    nasaUrl: 'https://www.nasa.gov/saffire',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=saffire+III' },
    ],

    category: 'fire-spread',
    tags: ['fire spread', 'large scale', 'repeatability', 'Cygnus', 'microgravity', 'spacecraft safety'],

    simulationLink: {
      fuel: 'cellulose',
      gravity: 0.001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.35,
      description: 'Approximate Saffire-III conditions: cellulose fuel, ISS microgravity, 21% O₂, forced airflow.',
      caveat: 'FLARE models small-sample diffusion-limited combustion, not the large-scale flame spread measured in Saffire. Use as a qualitative microgravity combustion exploration only.',
    },
  },

  {
    id: 'saffire-4',
    program: 'Saffire',
    series: 'IV',
    name: 'Saffire-IV',
    fullName: 'Spacecraft Fire Safety Demonstration IV',
    acronym: 'Saffire-IV',
    status: 'completed',
    years: { start: 2019, end: 2019 },
    pi: 'David L. Urban',
    institution: 'NASA Glenn Research Center',

    platform: 'Northrop Grumman Cygnus NG-11 uncrewed cargo spacecraft',
    platformNote: 'IMPORTANT: Saffire-IV was conducted aboard an uncrewed Cygnus resupply spacecraft (NG-11) after ISS departure. No crew was present.',
    gravityEnvironment: 'Microgravity (free-flying uncrewed spacecraft)',
    gravityValue: 0.001,

    objective: 'Extend Saffire investigations to study effects of reduced oxygen concentration on large-scale flame spread, with the goal of characterizing oxygen-concentration-dependent flammability limits relevant to future exploration habitat atmospheres.',
    fuelMaterial: ['Sibal cloth (cotton/fiberglass composite)'],
    conditions: {
      oxygenRange: 'Reduced oxygen concentrations tested (specific values in PSI dataset)',
      pressure: '~1 atm',
      flowVelocity: 'Controlled forced airflow',
      sampleSize: 'Large-scale solid fuel sample',
    },
    measurements: [
      'Flame spread rate at reduced O₂',
      'Extinction limits',
      'Heat release rate',
      'Smoke characteristics',
      'Video imaging',
    ],
    hardware: [
      'Saffire Experiment Module (SEM) — fourth generation configuration',
      'Precision oxygen control and monitoring system',
      'Multi-channel thermocouple array',
      'Heat flux gauges',
    ],

    keyFindings: [
      {
        text: 'Reduced oxygen concentration significantly decreased flame spread rate and in some cases caused flame extinction, providing data critical for evaluating reduced-O₂ atmosphere strategies as a fire prevention measure in exploration habitats.',
        source: 'NASA PSI Saffire-IV dataset; Urban et al. (2021)',
      },
    ],

    fireRelevance: 'Future lunar and Mars habitats may operate at reduced pressure with modified oxygen concentrations (e.g., 8.2 psia / 32% O₂ or lower-O₂ enriched atmospheres). Saffire-IV data directly informs the tradeoff between physiological needs and fire risk in these non-standard atmospheres.',

    dataAvailability: 'psi-dataset',
    dataNote: 'Data available via NASA PSI database.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=saffire+IV',
    nasaUrl: 'https://www.nasa.gov/saffire',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=saffire+IV' },
    ],

    category: 'fire-spread',
    tags: ['oxygen effects', 'extinction limit', 'large scale', 'Cygnus', 'microgravity', 'exploration habitat'],

    simulationLink: {
      fuel: 'cellulose',
      gravity: 0.001,
      oxygenPercent: 16,
      pressure: 1.0,
      airflowVelocity: 0.3,
      description: 'Reduced-O₂ conditions similar to Saffire-IV: cellulose, microgravity, reduced O₂ (~16%), low airflow.',
      caveat: 'FLARE models small-sample combustion only. The reduced O₂ effects on extinction threshold are directionally consistent with Saffire-IV but not quantitatively comparable.',
    },
  },

  {
    id: 'saffire-5',
    program: 'Saffire',
    series: 'V',
    name: 'Saffire-V',
    fullName: 'Spacecraft Fire Safety Demonstration V',
    acronym: 'Saffire-V',
    status: 'completed',
    years: { start: 2020, end: 2020 },
    pi: 'David L. Urban',
    institution: 'NASA Glenn Research Center',

    platform: 'Northrop Grumman Cygnus NG-14 uncrewed cargo spacecraft',
    platformNote: 'IMPORTANT: Saffire-V was conducted aboard an uncrewed Cygnus NG-14 resupply spacecraft after ISS departure. No crew was present.',
    gravityEnvironment: 'Microgravity (free-flying uncrewed spacecraft)',
    gravityValue: 0.001,

    objective: 'Investigate flame spread and burning behavior with varied sample geometries and additional material types. Continue building the large-scale spacecraft fire dataset with improved sensor suite and imaging.',
    fuelMaterial: ['Sibal cloth variants', 'Additional spacecraft-relevant polymers'],
    conditions: {
      oxygenRange: '~21% and reduced values',
      pressure: '~1 atm',
      flowVelocity: 'Controlled forced airflow',
    },
    measurements: [
      'Flame spread rate',
      'Heat flux',
      'Gas composition',
      'Near-IR and visible video',
      'Smoke particle characterization',
    ],
    hardware: [
      'Saffire Experiment Module (SEM)',
      'Enhanced imaging system',
      'Improved gas analysis suite',
    ],

    keyFindings: [
      {
        text: 'Saffire-V expanded the dataset with additional material types and confirmed consistency of large-scale microgravity combustion behavior across the Saffire series.',
        source: 'NASA PSI Saffire-V dataset summary',
      },
    ],

    fireRelevance: 'Continued building the foundation of large-scale spacecraft fire data needed to certify fire safety systems for Artemis lunar habitats and future space exploration platforms.',

    dataAvailability: 'psi-dataset',
    dataNote: 'Data available via NASA PSI database.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=saffire+V',
    nasaUrl: 'https://www.nasa.gov/saffire',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=saffire+V' },
    ],

    category: 'fire-spread',
    tags: ['fire spread', 'large scale', 'Cygnus', 'microgravity', 'spacecraft safety', 'Artemis'],
  },

  {
    id: 'saffire-6',
    program: 'Saffire',
    series: 'VI',
    name: 'Saffire-VI',
    fullName: 'Spacecraft Fire Safety Demonstration VI',
    acronym: 'Saffire-VI',
    status: 'completed',
    years: { start: 2022, end: 2022 },
    pi: 'David L. Urban',
    institution: 'NASA Glenn Research Center',

    platform: 'Northrop Grumman Cygnus NG-18 uncrewed cargo spacecraft',
    platformNote: 'IMPORTANT: Saffire-VI was conducted aboard an uncrewed Cygnus NG-18 resupply spacecraft after ISS departure. No crew was present.',
    gravityEnvironment: 'Microgravity (free-flying uncrewed spacecraft)',
    gravityValue: 0.001,

    objective: 'Final experiment in the initial Saffire series. Focus on fire suppression effectiveness in the large-scale microgravity environment — testing water mist and CO₂ suppression agents on large spacecraft fires, closing a critical gap in suppression system design data.',
    fuelMaterial: ['Sibal cloth (cotton/fiberglass composite)'],
    conditions: {
      oxygenRange: '~21%',
      pressure: '~1 atm',
      flowVelocity: 'Controlled forced airflow',
      sampleSize: 'Large-scale solid fuel sample',
      other: ['Fire suppression system deployment as part of experiment design'],
    },
    measurements: [
      'Flame suppression effectiveness (time-to-extinction)',
      'Post-suppression gas composition',
      'Heat flux during suppression',
      'Video of suppression agent interaction with flame',
    ],
    hardware: [
      'Saffire Experiment Module (SEM)',
      'Integrated fire suppression system (water mist / CO₂)',
      'Post-suppression environment sensor suite',
    ],

    keyFindings: [
      {
        text: 'Saffire-VI provided the first large-scale quantitative data on fire suppression agent effectiveness in a microgravity spacecraft environment, directly informing suppression system specifications for future crewed exploration vehicles.',
        source: 'NASA PSI Saffire-VI dataset; Urban et al. (2023)',
      },
    ],

    fireRelevance: 'Fire suppression system design is a critical safety requirement for crewed spacecraft. Saffire-VI data enables evidence-based selection and sizing of suppression systems for Artemis vehicles and future exploration habitat modules, replacing conservative assumptions with measured performance data.',

    dataAvailability: 'psi-dataset',
    dataNote: 'Data available via NASA PSI database. Access requires free PSI account.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=saffire+VI',
    nasaUrl: 'https://www.nasa.gov/saffire',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=saffire+VI' },
    ],

    category: 'fire-spread',
    tags: ['suppression', 'water mist', 'CO2', 'large scale', 'Cygnus', 'microgravity', 'Artemis', 'spacecraft safety'],
  },

  // ── BASS ─────────────────────────────────────────────────────────────────

  {
    id: 'bass',
    program: 'BASS',
    name: 'BASS',
    fullName: 'Burning And Suppression of Solids',
    acronym: 'BASS',
    status: 'completed',
    years: { start: 2012, end: 2013 },
    pi: 'Sandra Olson',
    institution: 'NASA Glenn Research Center',

    platform: 'International Space Station (ISS) — Combustion Integrated Rack (CIR)',
    platformNote: 'Conducted aboard the crewed ISS in the Combustion Integrated Rack, a dedicated facility for microgravity combustion research. Crew operated experiments remotely from the BASS hardware.',
    gravityEnvironment: 'ISS microgravity (~10⁻⁵ to 10⁻⁶ g)',
    gravityValue: 0.000001,

    objective: 'Measure burning rates, flame structure, and suppression characteristics of solid materials in a microgravity environment. Provide data to characterize the flammability of materials commonly used in spacecraft construction and to test the effectiveness of CO₂ fire suppression in microgravity.',
    fuelMaterial: [
      'PMMA (polymethyl methacrylate) rods and sheets',
      'Cotton/fiberglass composite (Sibal cloth) swatches',
      'Polypropylene rods',
    ],
    conditions: {
      oxygenRange: '21–30% O₂ by volume',
      pressure: '~1 atm',
      flowVelocity: '0–20 cm/s forced airflow via CIR fan',
      sampleSize: 'Small rods (3–10 mm diameter, 50–100 mm length) and fabric swatches',
    },
    measurements: [
      'Flame spread rate along solid surface',
      'Burning rate (mass loss rate)',
      'Extinction limits (minimum O₂ for sustained burning)',
      'Flame standoff distance',
      'Color video and still imaging',
      'CO₂ suppression effectiveness',
    ],
    hardware: [
      'Combustion Integrated Rack (CIR) with Multi-user Droplet Combustion Apparatus (MDCA)',
      'Fuel sample holders and ignitor assembly',
      'CIR controlled atmosphere with variable O₂/CO₂/N₂',
      'Color digital cameras',
      'CIR Gas Chromatograph (for post-burn gas analysis)',
    ],

    keyFindings: [
      {
        text: 'Solid materials in microgravity exhibit lower minimum oxygen concentration for sustained burning compared to 1g tests, meaning materials that self-extinguish on Earth may continue burning in space.',
        source: 'Olson et al. (2016), Combustion and Flame, NASA/TM-2015-218581',
      },
      {
        text: 'CO₂ fire suppression was shown to be effective for small solid-fuel fires in microgravity, but required higher concentrations than predicted from 1g models due to the absence of buoyant mixing.',
        source: 'Olson et al. (2016), Combustion and Flame',
      },
      {
        text: 'Flame spread rate data from BASS provided the first systematic dataset for solid fuel burning in ISS microgravity under controlled flow and oxygen conditions.',
        source: 'NASA Physical Sciences Informatics, BASS dataset',
      },
    ],

    fireRelevance: 'BASS generated the definitive microgravity dataset for solid material flammability, directly supporting revision of NASA-STD-6001 (flammability, odor, offgassing, and compatibility requirements). The minimum O₂ extinction data is critical for designing reduced-oxygen cabin atmospheres as a passive fire prevention strategy.',

    dataAvailability: 'psi-dataset',
    dataNote: 'Complete BASS dataset including video, sensor data, and gas analysis results is available via NASA PSI. Free account required.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=BASS+burning+suppression',
    nasaUrl: 'https://www1.grc.nasa.gov/space/iss-research/msg/bass/',
    additionalUrls: [
      { label: 'NASA PSI BASS', url: 'https://psi.nasa.gov/search?q=BASS' },
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=bass+burning+suppression+solids' },
    ],

    category: 'solid-combustion',
    tags: ['solid fuel', 'PMMA', 'extinction', 'suppression', 'ISS', 'CIR', 'flammability limits', 'oxygen effects'],

    simulationLink: {
      fuel: 'pmma',
      gravity: 0.000001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.1,
      description: 'BASS-equivalent conditions: PMMA fuel, ISS microgravity (effectively ~0 g), 21% O₂, low forced airflow via CIR fan.',
      caveat: 'FLARE\'s D² Law model approximates spherical diffusion flame behavior. BASS measured flame spread along a surface, which is a geometrically different configuration. Results are qualitatively comparable for exploring oxygen and gravity effects on combustion.',
    },
  },

  {
    id: 'bass-2',
    program: 'BASS',
    series: 'II',
    name: 'BASS-II',
    fullName: 'Burning And Suppression of Solids II',
    acronym: 'BASS-II',
    status: 'completed',
    years: { start: 2013, end: 2014 },
    pi: 'Sandra Olson',
    institution: 'NASA Glenn Research Center',

    platform: 'International Space Station (ISS) — Combustion Integrated Rack (CIR)',
    platformNote: 'Conducted aboard the crewed ISS in the Combustion Integrated Rack. Second series of the BASS investigation with expanded material set and experimental conditions.',
    gravityEnvironment: 'ISS microgravity (~10⁻⁵ to 10⁻⁶ g)',
    gravityValue: 0.000001,

    objective: 'Extend BASS with an expanded set of spacecraft materials and a wider range of oxygen concentrations and airflow velocities. Determine whether materials that passed standard ground-based flammability tests (NASA-STD-6001) pose an unacceptable fire risk in microgravity.',
    fuelMaterial: [
      'PMMA rods and plates',
      'Polycarbonate (Lexan)',
      'Nylon rods',
      'Sibal cloth (cotton/fiberglass)',
      'Additional polymer insulation samples',
    ],
    conditions: {
      oxygenRange: '15–50% O₂ — testing to both extinction and elevated-oxygen limits',
      pressure: '~1 atm',
      flowVelocity: '0–30 cm/s',
      sampleSize: 'Small rods and flat sheet samples (10 × 50 mm to 50 × 100 mm)',
    },
    measurements: [
      'Flame spread rate vs. O₂ and flow velocity',
      'Minimum oxygen index (MOI) in microgravity',
      'Flame structure (standoff distance, reaction zone thickness)',
      'Soot volume fraction (laser diagnostics)',
      'Color video and digital imaging',
    ],
    hardware: [
      'Combustion Integrated Rack (CIR)',
      'Expanded material sample holder system',
      'Variable-speed flow fan',
      'Near-IR imaging add-on',
      'Laser diagnostic system for soot measurements',
    ],

    keyFindings: [
      {
        text: 'BASS-II confirmed that the Minimum Oxygen Index (MOI) for solid materials in ISS microgravity is 2–5% lower than the standard Limiting Oxygen Index (LOI) measured in 1g. Several NASA-approved materials could sustain combustion at standard 21% O₂ in microgravity.',
        source: 'Olson et al. (2017), Acta Astronautica; NASA/TM-2016-218769',
      },
      {
        text: 'Polycarbonate and certain nylon formulations showed higher-than-expected flammability in microgravity, suggesting their use in spacecraft interiors should be evaluated against microgravity-specific flammability criteria.',
        source: 'Olson et al. (2017), Acta Astronautica',
      },
      {
        text: 'At low airflow velocities (< 5 cm/s), diffusion-limited combustion in microgravity produces lower burning rates than at higher flow rates, consistent with oxygen-transport-limited combustion theory.',
        source: 'NASA Physical Sciences Informatics, BASS-II dataset',
      },
    ],

    fireRelevance: 'BASS-II\'s finding that the Microgravity Oxygen Index differs significantly from the ground-based Limiting Oxygen Index led to recommendations for a new material flammability test standard for microgravity. This directly affects spacecraft interior design requirements for ISS upgrades, Artemis, and Gateway.',

    dataAvailability: 'psi-dataset',
    dataNote: 'BASS-II dataset with video, sensor data, and soot diagnostics available via NASA PSI.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=BASS-II',
    nasaUrl: 'https://www1.grc.nasa.gov/space/iss-research/msg/bass/',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=bass-II+olson' },
    ],

    category: 'solid-combustion',
    tags: ['solid fuel', 'PMMA', 'polycarbonate', 'oxygen index', 'microgravity flammability', 'ISS', 'CIR', 'material certification'],

    simulationLink: {
      fuel: 'pmma',
      gravity: 0.000001,
      oxygenPercent: 18,
      pressure: 1.0,
      airflowVelocity: 0.05,
      description: 'BASS-II near-extinction conditions: PMMA, ISS microgravity, reduced O₂ (~18%), very low airflow.',
      caveat: 'FLARE models a spherical diffusion flame. BASS-II studied flame spread along a solid surface. The extinction behavior and O₂ sensitivity are qualitatively similar and can be explored in the simulator.',
    },
  },

  // ── FLEX ─────────────────────────────────────────────────────────────────

  {
    id: 'flex',
    program: 'FLEX',
    name: 'FLEX',
    fullName: 'Flame EXtinguishment Experiment',
    acronym: 'FLEX',
    status: 'completed',
    years: { start: 2009, end: 2010 },
    pi: 'Forman A. Williams',
    institution: 'University of California San Diego (NASA-funded)',

    platform: 'International Space Station (ISS) — Multi-user Droplet Combustion Apparatus (MDCA) in Combustion Integrated Rack (CIR)',
    platformNote: 'Conducted aboard the crewed ISS in the dedicated MDCA combustion facility inside the CIR. Experiment operations were conducted remotely by the science team on the ground.',
    gravityEnvironment: 'ISS microgravity (~10⁻⁵ g)',
    gravityValue: 0.000001,

    objective: 'Study the combustion and extinction of fuel droplets in microgravity to improve understanding of droplet combustion theory, determine extinction limits, and validate theoretical models of diffusion flame behavior without the complicating effects of buoyancy.',
    fuelMaterial: [
      'n-Heptane droplets (3–6 mm diameter)',
      'Methanol droplets',
      'Ethanol droplets',
    ],
    conditions: {
      oxygenRange: '21–40% O₂',
      pressure: '0.5–3 atm',
      flowVelocity: 'Near-quiescent (~0 m/s forced flow)',
      sampleSize: '3–6 mm initial droplet diameter',
      other: ['Radiative heat loss to container walls studied as extinction mechanism'],
    },
    measurements: [
      'Droplet diameter vs. time (D² law validation)',
      'Flame diameter vs. time',
      'Flame structure via color imaging',
      'Extinction conditions (O₂ % and pressure at extinction)',
      'Radiative heat loss rate',
    ],
    hardware: [
      'Multi-user Droplet Combustion Apparatus (MDCA)',
      'Fiber-optic droplet deployment and imaging system',
      'Oscillating droplet system for controlled diameter',
      'CIR controlled atmosphere',
      'High-speed color cameras',
      'Radiometers',
    ],

    keyFindings: [
      {
        text: 'FLEX directly validated the D² Law for droplet combustion in microgravity: droplet diameter squared decreases linearly with time (D²(t) = D₀² − K·t) with high accuracy in the absence of buoyancy.',
        source: 'Farouk et al. (2015), Combustion and Flame; Williams (2014), AIAA Progress in Aeronautics and Astronautics',
      },
      {
        text: 'Microgravity extinction limits for heptane droplets were found to be significantly different from 1g predictions, with extinction occurring at lower O₂ concentrations than expected from simplified models.',
        source: 'Williams et al. (2010), AIAA 2010-0582',
      },
    ],

    fireRelevance: 'FLEX validated the fundamental droplet combustion theory used in spacecraft fire models. Extinction limit data informs the minimum oxygen concentration cabin environment strategies and suppression agent concentration requirements. The D² Law validated by FLEX is the foundation of FLARE\'s simulation model.',

    dataAvailability: 'psi-dataset',
    dataNote: 'FLEX droplet imaging video and sensor data available via NASA PSI.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=FLEX+flame+extinguishment',
    nasaUrl: 'https://www.nasa.gov/centers-and-facilities/glenn/flame-extinguishment-experiment-flex/',
    additionalUrls: [
      { label: 'NASA Glenn FLEX Page', url: 'https://www.nasa.gov/centers-and-facilities/glenn/flame-extinguishment-experiment-flex/' },
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=FLEX+flame+extinguishment+williams' },
    ],

    category: 'droplet-combustion',
    tags: ['droplet combustion', 'D² Law', 'heptane', 'extinction', 'ISS', 'CIR', 'MDCA', 'diffusion flame', 'validation'],

    simulationLink: {
      fuel: 'cellulose',
      gravity: 0.000001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.0,
      description: 'FLEX-equivalent quiescent microgravity conditions: near-zero gravity, 21% O₂, no forced flow. FLARE\'s D² Law model is derived from the same theory validated by FLEX.',
      caveat: 'FLARE models solid fuel combustion; FLEX studied liquid fuel droplets. The underlying D² Law physics is the same, but the material properties and burning rates differ. This is a direct demonstration of the validated model foundation.',
    },
  },

  {
    id: 'flex-2',
    program: 'FLEX',
    series: 'II',
    name: 'FLEX-2',
    fullName: 'Flame EXtinguishment Experiment 2',
    acronym: 'FLEX-2',
    status: 'completed',
    years: { start: 2012, end: 2013 },
    pi: 'Forman A. Williams',
    institution: 'University of California San Diego (NASA-funded)',

    platform: 'International Space Station (ISS) — Multi-user Droplet Combustion Apparatus (MDCA) in Combustion Integrated Rack (CIR)',
    platformNote: 'Conducted aboard the crewed ISS. The FLEX-2 experiments were performed remotely; ISS crew were not directly involved in combustion operations.',
    gravityEnvironment: 'ISS microgravity (~10⁻⁵ g)',
    gravityValue: 0.000001,

    objective: 'Extend FLEX to study cool-flame combustion phenomena in microgravity. Investigate the transition from normal (hot) diffusion flames to low-temperature cool flames during and after droplet combustion. Characterize cool-flame burning rates, extinction, and the unexpected sustained combustion behavior observed after visible flame extinction.',
    fuelMaterial: [
      'n-Heptane droplets',
      'Alkane fuel mixtures (heptane/decane blends)',
      'Methanol droplets',
    ],
    conditions: {
      oxygenRange: '21% and reduced concentrations down to ~12%',
      pressure: '1–3 atm',
      flowVelocity: 'Near-quiescent (~0 m/s)',
      sampleSize: '3–6 mm initial droplet diameter',
      other: [
        'Experiments designed to capture post-extinction behavior',
        'High-sensitivity diagnostics to detect near-invisible cool flames',
      ],
    },
    measurements: [
      'D² law curve (droplet diameter squared vs. time)',
      'Flame luminosity (visible and chemiluminescence)',
      'Cool-flame temperature (~300°C, via spectroscopy)',
      'OH radical emission (chemiluminescence camera)',
      'CH₂O (formaldehyde) emission as cool-flame marker',
      'Transition time between hot flame and cool flame',
      'Cool-flame extinction limits',
    ],
    hardware: [
      'Multi-user Droplet Combustion Apparatus (MDCA)',
      'High-sensitivity color cameras',
      'UV-sensitive chemiluminescence camera (for OH, CH₂O detection)',
      'Narrowband spectral filter system',
      'CIR controlled atmosphere with precise O₂/N₂ control',
    ],

    keyFindings: [
      {
        text: 'FLEX-2 discovered sustained "cool flames" in microgravity: after the visible hot flame extinguished, some droplets continued burning at ~300°C via low-temperature oxidation chemistry involving formaldehyde and hydrogen peroxide intermediates. This phenomenon had not been directly observed experimentally before.',
        source: 'Farouk & Dryer (2012), Combustion and Flame; Nayagam et al. (2012), Combustion and Flame Vol. 159',
      },
      {
        text: 'Cool flames were sustained for several seconds after hot-flame extinction, consuming fuel at a significantly reduced but measurable rate. They were nearly invisible to standard cameras, requiring UV-sensitive diagnostics for detection.',
        source: 'Nayagam et al. (2012), Combustion and Flame; NASA/TM-2015-218481',
      },
      {
        text: 'The cool-flame behavior in microgravity is significant for spacecraft fire detection: a cool-flame-based fire could evade standard smoke/heat detectors while still releasing combustion products and potentially re-igniting.',
        source: 'Williams (2015), Combustion Theory and Modelling; NASA Technical Brief',
      },
    ],

    fireRelevance: 'The discovery of sustained cool flames in microgravity has critical implications for spacecraft fire detection systems. Standard smoke or heat detectors may fail to detect a cool-flame fire, which burns at temperatures below typical detector thresholds but can still cause spacecraft atmosphere contamination and potentially re-ignite. This finding drove development of improved chemical-species-based fire detectors for future spacecraft.',

    dataAvailability: 'psi-dataset',
    dataNote: 'FLEX-2 dataset including video, droplet diameter measurements, and spectral data available via NASA PSI. Full D² law curves and cool-flame video are publicly accessible.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=FLEX-2',
    nasaUrl: 'https://www.nasa.gov/centers-and-facilities/glenn/flame-extinguishment-experiment-flex/',
    additionalUrls: [
      { label: 'NASA Glenn FLEX-2 Overview', url: 'https://www.nasa.gov/centers-and-facilities/glenn/flame-extinguishment-experiment-flex/' },
      { label: 'Nayagam et al. 2012 Paper', url: 'https://ntrs.nasa.gov/search?q=nayagam+cool+flames+2012' },
    ],

    category: 'droplet-combustion',
    tags: ['cool flames', 'droplet combustion', 'D² Law', 'heptane', 'extinction', 'chemiluminescence', 'ISS', 'MDCA', 'fire detection'],

    simulationLink: {
      fuel: 'cellulose',
      gravity: 0.000001,
      oxygenPercent: 14,
      pressure: 1.0,
      airflowVelocity: 0.0,
      description: 'Near-extinction conditions similar to FLEX-2 cool-flame regime: microgravity, low O₂ (~14%), no airflow — observe extinction behavior.',
      caveat: 'FLARE does not model cool-flame chemistry (requires detailed kinetics far beyond D² Law). This simulation shows hot-flame extinction in low-O₂ microgravity, which precedes the cool-flame regime documented in FLEX-2.',
    },
  },

  // ── SAME ─────────────────────────────────────────────────────────────────

  {
    id: 'same',
    program: 'SAME',
    name: 'SAME',
    fullName: 'Smoke Aerosol Measurement Experiment',
    acronym: 'SAME',
    status: 'completed',
    years: { start: 2007, end: 2009 },
    institution: 'NASA Glenn Research Center',

    platform: 'International Space Station (ISS)',
    platformNote: 'Conducted aboard the crewed ISS. Smoke samples were generated from controlled heating of spacecraft materials in a contained apparatus.',
    gravityEnvironment: 'ISS microgravity',
    gravityValue: 0.000001,

    objective: 'Characterize the size distribution, number concentration, and optical properties of smoke particles produced by overheated spacecraft materials in microgravity, to improve the performance of optical smoke detectors in the spacecraft environment.',
    fuelMaterial: [
      'Teflon (PTFE) tape',
      'Silicone rubber',
      'Kapton polyimide film',
      'Electrical wire insulation (overheated, non-flaming)',
    ],
    conditions: {
      oxygenRange: '~21% ambient',
      pressure: '~1 atm cabin',
      other: [
        'Pyrolysis (smoldering) rather than open flame — heated below ignition temperature',
        'Smoke generated in contained chamber within ISS',
      ],
    },
    measurements: [
      'Smoke particle diameter distribution (0.1–10 µm)',
      'Number concentration of smoke particles',
      'Particle optical properties (scattering, absorption)',
      'Particle agglomeration behavior over time',
    ],
    hardware: [
      'Dedicated smoke generation chamber',
      'Differential mobility analyzer (DMA) for particle sizing',
      'Condensation particle counter (CPC)',
      'Optical particle counter',
      'Electrostatic precipitator for particle collection',
    ],

    keyFindings: [
      {
        text: 'Smoke particles produced by pyrolysis in microgravity are significantly smaller (sub-micron) than those produced in 1g, because the absence of buoyant convection prevents particle agglomeration and settling.',
        source: 'Greenberg et al. (2008), Fire Safety Journal; NASA/TM-2009-215610',
      },
      {
        text: 'Standard spacecraft optical smoke detectors were found to be less sensitive to microgravity smoke particle size distributions than to the coarser particle distributions used for ground-based calibration.',
        source: 'Greenberg et al. (2008), Fire Safety Journal',
      },
    ],

    fireRelevance: 'The SAME experiment directly revealed why ISS smoke detectors had a history of false alarms and reduced sensitivity compared to ground-based performance. The finding that microgravity smoke particles are finer than 1g particles drove redesign of spacecraft smoke detectors and established a new test standard for microgravity smoke detection.',

    dataAvailability: 'psi-dataset',
    dataNote: 'Particle size distribution and concentration data available via NASA PSI.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=SAME+smoke+aerosol',
    nasaUrl: 'https://ntrs.nasa.gov/search?q=SAME+smoke+aerosol+measurement+experiment',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=smoke+aerosol+measurement+ISS' },
    ],

    category: 'smoke-detection',
    tags: ['smoke', 'aerosol', 'particle size', 'detector', 'pyrolysis', 'ISS', 'fire detection', 'overheating'],
  },

  {
    id: 'same-r',
    program: 'SAME',
    series: 'R',
    name: 'SAME-R',
    fullName: 'Smoke Aerosol Measurement Experiment Revised',
    acronym: 'SAME-R',
    status: 'completed',
    years: { start: 2010, end: 2012 },
    institution: 'NASA Glenn Research Center',

    platform: 'International Space Station (ISS)',
    platformNote: 'Conducted aboard the crewed ISS. Revised version of SAME with expanded material set and improved sampling protocols.',
    gravityEnvironment: 'ISS microgravity',
    gravityValue: 0.000001,

    objective: 'Extend SAME with additional spacecraft materials and improved particle measurement techniques to refine the microgravity smoke particle database, with specific focus on materials used in Exploration-class vehicles.',
    fuelMaterial: [
      'Additional wire insulation types',
      'Printed circuit board materials',
      'Exploration vehicle candidate materials',
      'Vegetable-based materials (cook fires, paper)',
    ],
    conditions: {
      oxygenRange: '~21% ambient cabin',
      pressure: '~1 atm',
      other: ['Non-flaming overheating only — pyrolysis/smoldering'],
    },
    measurements: [
      'Revised particle size distributions',
      'Enhanced particle optical property measurements',
      'Detector response characterization',
      'Coagulation rate measurements',
    ],
    hardware: [
      'Revised SAME hardware with expanded material holders',
      'Improved optical scattering diagnostics',
      'Enhanced particle size analyzer',
    ],

    keyFindings: [
      {
        text: 'SAME-R confirmed and extended SAME findings: microgravity smoke from a wider range of materials consistently produces finer particle distributions than ground-based equivalents, reinforcing the need for microgravity-calibrated detectors.',
        source: 'Greenberg & Urban (2012), NASA/TM-2012-217497',
      },
      {
        text: 'Particle agglomeration rates in microgravity were significantly slower than on Earth, meaning smoke particles remain smaller for longer — both reducing detector sensitivity and increasing the window for inhalation exposure.',
        source: 'Greenberg & Urban (2012), NASA/TM-2012-217497',
      },
    ],

    fireRelevance: 'SAME-R data directly informed the design of the Multi-Gas Monitor (MGM) used aboard the ISS and development specifications for next-generation spacecraft fire detectors. The extended material database applies directly to Artemis crew module and Gateway design.',

    dataAvailability: 'psi-dataset',
    dataNote: 'SAME-R particle measurement data available via NASA PSI.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=SAME-R+smoke',
    nasaUrl: 'https://ntrs.nasa.gov/search?q=SAME-R+smoke+aerosol',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=smoke+aerosol+ISS+revised' },
    ],

    category: 'smoke-detection',
    tags: ['smoke', 'aerosol', 'particle size', 'ISS', 'fire detection', 'Artemis', 'detector calibration'],
  },

  // ── ACME ─────────────────────────────────────────────────────────────────

  {
    id: 'acme',
    program: 'ACME',
    name: 'ACME',
    fullName: 'Advanced Combustion via Microgravity Experiments',
    acronym: 'ACME',
    status: 'completed',
    years: { start: 2017, end: 2022 },
    pi: 'Dennis Stocker',
    institution: 'NASA Glenn Research Center',

    platform: 'International Space Station (ISS) — Combustion Integrated Rack (CIR)',
    platformNote: 'Conducted aboard the crewed ISS in the Combustion Integrated Rack. ACME is an umbrella of seven distinct sub-experiments operated sequentially.',
    gravityEnvironment: 'ISS microgravity (~10⁻⁵ g)',
    gravityValue: 0.000001,

    objective: 'Advance understanding of fundamental combustion processes in microgravity through seven sub-experiments covering gaseous flames, soot formation, electric field effects on flames, and fuel structure effects. Generate data to validate combustion models used in both spacecraft safety and efficient combustion on Earth.',
    fuelMaterial: [
      'Ethylene gas (CLD-Flame, s-Flame)',
      'Propane gas (Flame Design)',
      'Methane gas (BRE, E-FIELD)',
      'Mixed alkane fuels (FUELS sub-experiment)',
      'Heptane/decane droplets (Cool Flames sub-experiment)',
    ],
    conditions: {
      oxygenRange: '15–100% O₂ depending on sub-experiment',
      pressure: '0.25–1 atm',
      flowVelocity: 'Coflow: 5–50 cm/s; Counterflow: variable',
      other: [
        'Sub-experiments: BRE, CLD-Flame, E-FIELD Flames, FUELS, Flame Design, s-Flame, Cool Flames Investigation',
        'Electric fields up to 10 kV/cm applied in E-FIELD sub-experiment',
      ],
    },
    measurements: [
      'Soot volume fraction (laser-induced incandescence)',
      'Flame temperature (planar Rayleigh scattering, thermocouples)',
      'OH radical distribution (planar laser-induced fluorescence)',
      'Flame liftoff height and blowout limits (CLD-Flame)',
      'Electric field effects on flame structure and soot (E-FIELD)',
      'Fuel burning rate (BRE)',
      'Cool flame temperature and lifetime (Cool Flames)',
    ],
    hardware: [
      'Combustion Integrated Rack (CIR) — Advanced diagnostic module',
      'Coflow burner assembly',
      'Laser diagnostic system (LII, PLIF)',
      'Electric field electrodes (E-FIELD sub-exp.)',
      'Droplet generation system (Cool Flames sub-exp.)',
      'Multi-wavelength imaging system',
    ],

    keyFindings: [
      {
        text: 'The s-Flame (soot-free flame) sub-experiment demonstrated that targeted fuel reformulation can eliminate soot production in diffusion flames, with direct implications for reducing soot hazard in spacecraft fires.',
        source: 'Liu et al. (2020), Combustion and Flame; NASA ACME s-Flame dataset',
      },
      {
        text: 'Electric fields (E-FIELD) were shown to significantly alter soot particle distribution and flame structure in microgravity, suggesting electric field systems as a potential active fire control technology.',
        source: 'Kim et al. (2021), Combustion and Flame',
      },
      {
        text: 'The Cool Flames sub-experiment confirmed and extended FLEX-2 findings, documenting cool-flame behavior for a wider range of fuel compositions and providing detailed chemical kinetic data.',
        source: 'Farouk et al. (2021), Proceedings of the Combustion Institute',
      },
    ],

    fireRelevance: 'ACME contributes multiple strands of spacecraft fire safety relevance: soot characterization informs detector design; cool-flame findings extend FLEX-2 fire detection implications; E-FIELD results suggest potential active suppression technology; and fundamental combustion data validates safety models for Earth-based and spacecraft combustion systems.',

    dataAvailability: 'psi-dataset',
    dataNote: 'Multiple ACME sub-experiment datasets available via NASA PSI. Data type and completeness vary by sub-experiment. PSI search recommended for specific sub-experiment data.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=ACME+combustion',
    nasaUrl: 'https://www.nasa.gov/centers-and-facilities/glenn/acme-advanced-combustion-via-microgravity-experiments/',
    additionalUrls: [
      { label: 'NASA Glenn ACME Page', url: 'https://www.nasa.gov/centers-and-facilities/glenn/acme-advanced-combustion-via-microgravity-experiments/' },
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=ACME+microgravity+combustion' },
    ],

    category: 'multi-topic',
    tags: ['soot', 'cool flames', 'electric field', 'gas flame', 'coflow', 'ISS', 'CIR', 'fundamental combustion', 'fire detection'],

    simulationLink: {
      fuel: 'cellulose',
      gravity: 0.000001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.1,
      description: 'Basic ISS microgravity conditions similar to ACME quiescent gas-flame sub-experiments.',
      caveat: 'ACME studied gas-phase diffusion flames (ethylene, propane, methane). FLARE models solid fuel combustion. The microgravity diffusion flame physics are related but not directly comparable.',
    },
  },

  // ── CFI ──────────────────────────────────────────────────────────────────

  {
    id: 'cfi',
    program: 'CFI',
    name: 'CFI',
    fullName: 'Coflow Laminar Diffusion Flame Investigation',
    acronym: 'CFI',
    status: 'completed',
    years: { start: 2009, end: 2011 },
    institution: 'NASA Glenn Research Center',

    platform: 'International Space Station (ISS) — Combustion Integrated Rack (CIR)',
    platformNote: 'Conducted aboard the crewed ISS in the CIR. The absence of buoyancy in microgravity allows truly laminar coflow flames without the buoyancy-induced oscillations that complicate ground-based laminar flame studies.',
    gravityEnvironment: 'ISS microgravity',
    gravityValue: 0.000001,

    objective: 'Study the structure of laminar coflow diffusion flames in microgravity to isolate and characterize flame behavior without buoyancy-driven convection. Measure soot formation, temperature distribution, and species concentrations in a geometrically controlled flame environment.',
    fuelMaterial: ['Ethylene gas', 'Propane gas', 'Methane gas'],
    conditions: {
      oxygenRange: '21–40% O₂ coflow',
      pressure: '0.5–1 atm',
      flowVelocity: 'Fuel flow: 2–15 cm/s; Coflow air: 5–30 cm/s',
      other: ['Coflow burner geometry with controlled fuel and oxidizer streams'],
    },
    measurements: [
      'Flame temperature profile (spectroscopic and thermocouple)',
      'Soot volume fraction and primary particle size (LII)',
      'OH radical distribution',
      'CH species profile',
      'Flame height, width, and shape',
      'Species concentration profiles (CO, CO₂, H₂O)',
    ],
    hardware: [
      'Combustion Integrated Rack (CIR)',
      'Coflow laminar flame burner',
      'Multi-wavelength laser diagnostics',
      'High-resolution color cameras',
      'Spectrometer for species identification',
    ],

    keyFindings: [
      {
        text: 'Microgravity coflow flames are significantly longer and more slender than their 1g counterparts, with soot confined to a narrow luminous zone, confirming that buoyancy fundamentally alters flame morphology in ways not correctable by simple scaling.',
        source: 'Greenberg & Ku (2011), Combustion and Flame; NASA/TM-2011-217175',
      },
      {
        text: 'Soot particle nucleation was found to occur at lower temperatures in microgravity coflow flames than predicted by 1g-calibrated models, due to the extended residence time of combustion intermediates in the longer flame zones.',
        source: 'Greenberg & Ku (2011), Combustion and Flame',
      },
    ],

    fireRelevance: 'CFI provides validated flame structure data for coflow diffusion flames — the geometry most relevant to candles, wire fires, and many accidental ignition sources in spacecraft. The soot formation data supports development of fire detection thresholds and helps predict smoke toxicity.',

    dataAvailability: 'psi-dataset',
    dataNote: 'CFI flame imaging and diagnostic data available via NASA PSI.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=CFI+coflow+laminar',
    nasaUrl: 'https://ntrs.nasa.gov/search?q=CFI+coflow+laminar+diffusion+flame+ISS',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=coflow+laminar+diffusion+flame+microgravity' },
    ],

    category: 'gas-flame',
    tags: ['coflow', 'laminar flame', 'gas phase', 'soot', 'ethylene', 'ISS', 'CIR', 'flame structure'],
  },

  // ── SPICE ─────────────────────────────────────────────────────────────────

  {
    id: 'spice',
    program: 'SPICE',
    name: 'SPICE',
    fullName: 'Solid Fuel Ignition and Extinction',
    acronym: 'SPICE',
    status: 'completed',
    years: { start: 2011, end: 2013 },
    institution: 'NASA Glenn Research Center',

    platform: 'International Space Station (ISS) — Combustion Integrated Rack (CIR)',
    platformNote: 'Conducted aboard the crewed ISS in the CIR. Focused on the ignition and extinction phases of solid fuel combustion, complementary to the BASS burning-rate investigations.',
    gravityEnvironment: 'ISS microgravity',
    gravityValue: 0.000001,

    objective: 'Determine the ignition conditions and extinction limits for solid spacecraft materials in microgravity under varying oxygen concentrations and airflow velocities. Establish the minimum ignition energy and minimum oxygen concentration required for ignition and sustained combustion.',
    fuelMaterial: [
      'PMMA (polymethyl methacrylate)',
      'Polycarbonate',
      'Sibal cloth (cotton/fiberglass)',
      'Nomex fabric',
    ],
    conditions: {
      oxygenRange: '17–40% O₂',
      pressure: '~1 atm',
      flowVelocity: '5–30 cm/s',
      other: [
        'Hot-wire ignition source with controlled energy input',
        'Flame spreading behavior captured from ignition onset',
      ],
    },
    measurements: [
      'Minimum ignition energy (MIE) in microgravity',
      'Flame establishment time after ignition',
      'Go/no-go ignition boundary (O₂ vs. flow velocity)',
      'Extinction boundary (O₂ vs. flow velocity)',
      'Flame standoff distance at ignition',
    ],
    hardware: [
      'CIR with solid-fuel sample holders',
      'Precision hot-wire ignition system',
      'Variable-speed flow fan system',
      'Color cameras',
      'O₂ and CO₂ sensors',
    ],

    keyFindings: [
      {
        text: 'The minimum oxygen concentration for ignition of PMMA in microgravity is lower than the extinction limit: once ignited, a flame can be sustained at O₂ levels that would not support initial ignition. This hysteresis has implications for fire suppression — it is harder to extinguish a fire than to prevent one.',
        source: 'Olson et al. (2015), Combustion and Flame; NASA SPICE dataset',
      },
      {
        text: 'At very low airflow velocities, solid materials become harder to ignite in microgravity because without forced flow, oxygen must reach the sample by diffusion alone, reducing the ignition energy effectiveness.',
        source: 'Olson et al. (2015), NASA/TM-2015-218581',
      },
    ],

    fireRelevance: 'SPICE ignition and extinction boundary data directly informs spacecraft cabin atmosphere design: determining what O₂/N₂ balance prevents ignition while remaining physiologically safe. The ignition/extinction hysteresis finding is critical for suppression system design and training astronauts in fire response.',

    dataAvailability: 'psi-dataset',
    dataNote: 'SPICE ignition boundary and imaging data available via NASA PSI.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=SPICE+solid+fuel+ignition',
    nasaUrl: 'https://ntrs.nasa.gov/search?q=SPICE+solid+fuel+ignition+extinction+ISS',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=solid+fuel+ignition+extinction+microgravity' },
    ],

    category: 'extinction',
    tags: ['ignition', 'extinction', 'PMMA', 'solid fuel', 'ISS', 'CIR', 'oxygen limits', 'flammability boundary'],

    simulationLink: {
      fuel: 'pmma',
      gravity: 0.000001,
      oxygenPercent: 17,
      pressure: 1.0,
      airflowVelocity: 0.1,
      description: 'Near-ignition-limit conditions similar to SPICE: PMMA fuel, ISS microgravity, low O₂ (~17%), low airflow. Observe whether the flame is sustained or extinguished.',
      caveat: 'FLARE models an already-established flame, not the ignition event itself. Use this configuration to explore the near-extinction boundary behavior documented in SPICE.',
    },
  },

  // ── SLICE ─────────────────────────────────────────────────────────────────

  {
    id: 'slice',
    program: 'SLICE',
    name: 'SLICE',
    fullName: 'Structure and Liftoff In Combustion Experiment',
    acronym: 'SLICE',
    status: 'completed',
    years: { start: 2012, end: 2014 },
    institution: 'NASA Glenn Research Center',

    platform: 'International Space Station (ISS) — Combustion Integrated Rack (CIR)',
    platformNote: 'Conducted aboard the crewed ISS in the CIR. SLICE examined gas-phase flame stability phenomena — specifically jet diffusion flame liftoff — that cannot be isolated from buoyancy effects in ground experiments.',
    gravityEnvironment: 'ISS microgravity',
    gravityValue: 0.000001,

    objective: 'Investigate the structure and stability of laminar jet diffusion flames in microgravity, with particular focus on flame liftoff (detachment from the burner) and blowout. Determine how microgravity conditions alter liftoff height, liftoff/reattachment hysteresis, and the flame structure at the liftoff condition.',
    fuelMaterial: ['Ethylene gas jet', 'Propane gas jet', 'Methane gas jet'],
    conditions: {
      oxygenRange: '21% ambient',
      pressure: '1 atm',
      flowVelocity: 'Fuel jet velocity varied from 10 to 200 cm/s to study liftoff transition',
      other: [
        'Coflow air velocity: 10–50 cm/s',
        'Transition from attached flame to lifted flame to blowout studied systematically',
      ],
    },
    measurements: [
      'Liftoff height vs. fuel flow velocity',
      'Liftoff/reattachment hysteresis (attached → lifted, lifted → reattached)',
      'Flame blowout velocity',
      'Flame structure at liftoff (OH distribution, temperature)',
      'Tribrachial (triple flame) structure at liftoff point',
    ],
    hardware: [
      'CIR with jet flame burner',
      'High-resolution color cameras',
      'UV camera for OH chemiluminescence',
      'Precision mass flow controllers',
    ],

    keyFindings: [
      {
        text: 'Microgravity jet flames lift off at significantly higher fuel velocities than 1g flames of the same fuel and geometry, because buoyancy-driven instabilities that promote liftoff on Earth are absent in microgravity.',
        source: 'Manzello et al. (2014), Combustion and Flame; NASA/TM-2014-218107',
      },
      {
        text: 'The triple-flame (tribrachial) structure at the liftoff base, predicted by theory but difficult to observe in 1g, was clearly imaged in SLICE microgravity experiments, validating liftoff flame stabilization theory.',
        source: 'Manzello et al. (2014), Combustion and Flame',
      },
    ],

    fireRelevance: 'SLICE data on flame stability and liftoff is relevant to spacecraft fire behavior in ventilation-driven environments (e.g., near ISS air vents or Orion ventilation fans). Flame liftoff and blowout behavior determines how fires respond to suppression agent flow and ventilation shutdown.',

    dataAvailability: 'psi-dataset',
    dataNote: 'SLICE flame imaging and liftoff data available via NASA PSI.',
    psiSearchUrl: 'https://psi.nasa.gov/search?q=SLICE+liftoff+combustion',
    nasaUrl: 'https://ntrs.nasa.gov/search?q=SLICE+liftoff+combustion+ISS',
    additionalUrls: [
      { label: 'NASA NTRS Search', url: 'https://ntrs.nasa.gov/search?q=structure+liftoff+combustion+microgravity' },
    ],

    category: 'gas-flame',
    tags: ['flame liftoff', 'blowout', 'jet flame', 'triple flame', 'gas phase', 'ISS', 'CIR', 'flame stability'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function getExperimentsByProgram(program: ProgramKey): NASAExperiment[] {
  return NASA_EXPERIMENTS.filter(e => e.program === program)
}

export function getExperimentsByCategory(category: ExperimentCategory): NASAExperiment[] {
  return NASA_EXPERIMENTS.filter(e => e.category === category)
}

export function searchExperiments(query: string): NASAExperiment[] {
  if (!query.trim()) return NASA_EXPERIMENTS
  const q = query.toLowerCase()
  return NASA_EXPERIMENTS.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.fullName.toLowerCase().includes(q) ||
    e.objective.toLowerCase().includes(q) ||
    e.tags.some(t => t.toLowerCase().includes(q)) ||
    e.fuelMaterial.some(f => f.toLowerCase().includes(q)) ||
    e.fireRelevance.toLowerCase().includes(q)
  )
}

export const ALL_CATEGORIES: Array<{ id: ExperimentCategory; label: string; emoji: string }> = [
  { id: 'solid-combustion',  label: 'Solid Combustion',   emoji: '🔥' },
  { id: 'droplet-combustion',label: 'Droplet Combustion', emoji: '💧' },
  { id: 'gas-flame',         label: 'Gas-Phase Flames',   emoji: '🌀' },
  { id: 'fire-spread',       label: 'Fire Spread',        emoji: '🏭' },
  { id: 'smoke-detection',   label: 'Smoke & Detection',  emoji: '💨' },
  { id: 'extinction',        label: 'Ignition/Extinction',emoji: '⚗️' },
  { id: 'multi-topic',       label: 'Multi-Topic',        emoji: '🔬' },
]

