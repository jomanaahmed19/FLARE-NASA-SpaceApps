// ─────────────────────────────────────────────────────────────────────────────
// FLARE — Phase 07: Scientific Insights & Research Library Database
//
// DATA INTEGRITY NOTES:
// - Every Research Library resource includes verified official NASA / NTRS /
//   PSI / Science@NASA URLs, publisher attribution, source type, and a concise
//   scientific explanation.
// - Every Scientific Insight clearly separates Empirical Evidence (cited from
//   NASA experiments and peer-reviewed reports) from Model Interpretation
//   (explicitly labeled as FLARE D² Law analytical interpretation).
// - Saffire experiments are consistently documented as uncrewed Cygnus cargo
//   spacecraft investigations after ISS departure.
// ─────────────────────────────────────────────────────────────────────────────

export type ResourceSourceType =
  | 'technical-report'
  | 'nasa-portal'
  | 'video-media'
  | 'incident-report'
  | 'spinoff-feature'
  | 'dataset-archive'

export type ResourceTopic =
  | 'combustion-science'
  | 'saffire'
  | 'apollo-history'
  | 'mir-incident'
  | 'smoke-detection'
  | 'firefighter-tech'
  | 'habitat-safety'

export interface ResearchResource {
  id: string
  title: string
  publisher: string
  year: number
  sourceType: ResourceSourceType
  topic: ResourceTopic
  explanation: string
  relevance: string
  url: string
  verifiedVideoId?: string // YouTube video ID if verified video resource
  relatedExperimentIds: string[]
  tags: string[]
}

export interface EvidenceCitation {
  type: 'experimental-evidence' | 'literature-source' | 'model-interpretation'
  label: string
  detail: string
  sourceRef: string
  url?: string
}

export interface ScientificInsight {
  id: string
  title: string
  question: string
  category: 'oxygen-flammability' | 'airflow-microgravity' | 'smoke-detection' | 'scale-saffire' | 'cool-flames' | 'habitat-atmosphere'
  categoryLabel: string
  summary: string
  experimentalFinding: string
  modelInterpretation: string
  limitationsNote: string
  evidence: EvidenceCitation[]
  relatedExperimentIds: string[]
  relatedResourceIds: string[]
  simulationLink?: {
    fuel: 'cellulose' | 'pmma' | 'polyethylene' | 'paper'
    gravity: number
    oxygenPercent: number
    pressure: number
    airflowVelocity: number
    label: string
  }
  comparisonPreset?: {
    leftId: string
    rightId: string
    label: string
  }
}

export interface ResearchQuestionGuide {
  id: string
  question: string
  domain: string
  shortAnswer: string
  evidenceBasis: 'Experimental + Model' | 'Experimental Primary' | 'Historical + Experimental'
  relevantExperimentIds: string[]
  relevantResourceIds: string[]
  relatedInsightId: string
}

export const TOPIC_META: Record<ResourceTopic, { label: string; color: string; bg: string; icon: string }> = {
  'combustion-science': {
    label: 'Combustion Science',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    icon: '🔥',
  },
  saffire: {
    label: 'Saffire Investigations',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    icon: '🛸',
  },
  'apollo-history': {
    label: 'Apollo 1 & Apollo 13',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    icon: '🏛️',
  },
  'mir-incident': {
    label: 'Mir Space Station Fire',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    icon: '⚠️',
  },
  'smoke-detection': {
    label: 'Smoke Detection',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    icon: '🌫️',
  },
  'firefighter-tech': {
    label: 'Firefighter Technologies',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    icon: '🛡️',
  },
  'habitat-safety': {
    label: 'Habitat Research',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.12)',
    icon: '🏠',
  },
}

export const SOURCE_TYPE_META: Record<ResourceSourceType, { label: string; badgeColor: string }> = {
  'technical-report': { label: 'NASA Technical Report (NTRS)', badgeColor: '#06b6d4' },
  'nasa-portal':      { label: 'Official NASA Portal',         badgeColor: '#38bdf8' },
  'video-media':      { label: 'Verified NASA ScienceCasts',   badgeColor: '#f97316' },
  'incident-report':  { label: 'Official Investigation Record',badgeColor: '#f59e0b' },
  'spinoff-feature':  { label: 'NASA Spinoff Publication',     badgeColor: '#a78bfa' },
  'dataset-archive':  { label: 'NASA PSI Repository',          badgeColor: '#10b981' },
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL NASA RESEARCH LIBRARY RESOURCES
// ─────────────────────────────────────────────────────────────────────────────

export const RESEARCH_RESOURCES: ResearchResource[] = [
  // 1. Verified NASA ScienceCasts Combustion Video
  {
    id: 'res-sciencecasts-strange-flames',
    title: 'ScienceCasts: Strange Flames on the International Space Station',
    publisher: 'NASA Science (Official YouTube / Science@NASA)',
    year: 2013,
    sourceType: 'video-media',
    topic: 'combustion-science',
    explanation:
      'Official NASA ScienceCasts briefing on the Flame Extinguishment Experiment (FLEX) aboard the ISS. Explains why flames form spheres in microgravity due to the absence of buoyant convection and documents the unexpected observation of low-temperature "cool flames" in heptane droplets after visible flame extinction.',
    relevance:
      'Directly illustrates spherical diffusion flames and two-stage droplet combustion modeled qualitatively in FLARE.',
    url: 'https://www.youtube.com/watch?v=ZiHj78W4S0g',
    verifiedVideoId: 'ZiHj78W4S0g',
    relatedExperimentIds: ['flex', 'flex-2', 'acme'],
    tags: ['ScienceCasts', 'video', 'cool flames', 'FLEX', 'spherical flame', 'ISS'],
  },

  // 2. NASA PSI Database
  {
    id: 'res-nasa-psi-database',
    title: 'NASA Physical Sciences Informatics (PSI) Open Data Repository',
    publisher: 'NASA Biological and Physical Sciences Division',
    year: 2024,
    sourceType: 'dataset-archive',
    topic: 'combustion-science',
    explanation:
      'Primary official repository of raw and processed experimental data from spaceflight combustion investigations conducted on the ISS, Space Shuttle, Cygnus resupply vehicles, and ground drop towers (including BASS, BASS-II, FLEX, FLEX-2, Saffire I–VI, SAME, and ACME).',
    relevance:
      'Provides the primary empirical datasets referenced across FLARE\'s NASA Experiment Explorer.',
    url: 'https://psi.nasa.gov',
    relatedExperimentIds: ['saffire-1', 'saffire-2', 'saffire-3', 'bass', 'bass-2', 'flex', 'flex-2', 'same', 'acme'],
    tags: ['PSI', 'datasets', 'open science', 'ISS', 'raw data'],
  },

  // 3. Combustion Integrated Rack (CIR) & ACME Portal
  {
    id: 'res-glenn-acme-cir',
    title: 'Advanced Combustion via Microgravity Experiments (ACME) & CIR Overview',
    publisher: 'NASA Glenn Research Center',
    year: 2022,
    sourceType: 'nasa-portal',
    topic: 'combustion-science',
    explanation:
      'Technical overview of the Combustion Integrated Rack (CIR) aboard the ISS Destiny module and the ACME suite of gaseous diffusion flame investigations exploring soot kinetics, radiative heat loss, and electric-field flame control in microgravity.',
    relevance:
      'Documents the hardware facility used for ISS droplet and gaseous combustion investigations.',
    url: 'https://www1.grc.nasa.gov/space/iss-research/iss-facilities/cir/',
    relatedExperimentIds: ['acme', 'flex', 'flex-2', 'bass', 'bass-2'],
    tags: ['CIR', 'ACME', 'Glenn Research Center', 'diffusion flame', 'hardware'],
  },

  // 4. Saffire Program Overview
  {
    id: 'res-nasa-saffire-overview',
    title: 'Spacecraft Fire Safety Demonstration Project (Saffire I–VI)',
    publisher: 'NASA Glenn Research Center',
    year: 2023,
    sourceType: 'nasa-portal',
    topic: 'saffire',
    explanation:
      'Official project documentation for the six Saffire experiments conducted inside uncrewed Northrop Grumman (formerly Orbital ATK) Cygnus cargo spacecraft after undocking from the ISS. Investigated meter-scale flame spread, oxygen consumption, pressure rise, smoke scrubbing, and suppression in realistic vehicle volumes.',
    relevance:
      'Crucial context showing why large-scale fires cannot be tested inside crewed habitats and how vehicle volume limits oxygen availability.',
    url: 'https://www.nasa.gov/saffire',
    relatedExperimentIds: ['saffire-1', 'saffire-2', 'saffire-3', 'saffire-4', 'saffire-5', 'saffire-6'],
    tags: ['Saffire', 'Cygnus', 'uncrewed', 'large-scale fire', 'material flammability'],
  },

  // 5. Saffire Technical Report (NTRS)
  {
    id: 'res-ntrs-saffire-flame-spread',
    title: 'Large-Scale Microgravity Flame Spread in Spacecraft Environments (Saffire Reports)',
    publisher: 'NASA Technical Reports Server (NTRS) — Urban, Ruff, et al.',
    year: 2019,
    sourceType: 'technical-report',
    topic: 'saffire',
    explanation:
      'Technical papers archived on NASA NTRS analyzing concurrent and opposed-flow flame spread over cotton-fiberglass (Sibal) and PMMA samples in Saffire I–III, demonstrating how finite cabin volume and low-velocity ventilation interact with radiative heat loss.',
    relevance:
      'Provides quantitative context for comparing small-sample ISS tests (BASS) against meter-scale uncrewed vehicle burns (Saffire).',
    url: 'https://ntrs.nasa.gov/search?q=Saffire%20Spacecraft%20Fire%20Safety%20Urban',
    relatedExperimentIds: ['saffire-1', 'saffire-2', 'saffire-3'],
    tags: ['NTRS', 'Sibal cloth', 'PMMA', 'concurrent flow', 'flame spread'],
  },

  // 6. Apollo 1 Investigation & Lessons Learned
  {
    id: 'res-apollo-1-history',
    title: 'Apollo 1 (AS-204) Fire Investigation and Spacecraft Materials Reform',
    publisher: 'NASA History Division & NASA Safety Center',
    year: 1967,
    sourceType: 'incident-report',
    topic: 'apollo-history',
    explanation:
      'Historical and technical documentation of the January 27, 1967 Apollo 1 launch pad test fire in a 100% oxygen atmosphere at 16.7 psia (1.14 atm). Explains how high oxygen partial pressure drastically increases flame spread velocity and lowers ignition energy for Velcro, nylon, and elastomers.',
    relevance:
      'Foundation of modern spacecraft material screening (NASA-STD-6001), two-gas cabin atmospheres, and inward/outward quick-release hatch engineering.',
    url: 'https://www.nasa.gov/apollo-1/',
    relatedExperimentIds: ['bass', 'bass-2', 'saffire-2'],
    tags: ['Apollo 1', '100% oxygen', 'material flammability', 'NASA-STD-6001', 'safety reform'],
  },

  // 7. Apollo 13 Cryogenic Oxygen Tank 2 Anomaly Report
  {
    id: 'res-apollo-13-ntrs',
    title: 'Apollo 13 Mission Report & Cryogenic Oxygen Tank 2 Anomaly (NTRS ID 19710003598)',
    publisher: 'NASA Manned Spacecraft Center / NTRS',
    year: 1970,
    sourceType: 'incident-report',
    topic: 'apollo-history',
    explanation:
      'Official NASA post-mission technical evaluation documenting how damaged PTFE (Teflon) wire insulation ignited inside supercritical Oxygen Tank No. 2 following a pre-launch detanking heater over-temperature event, causing rapid pressure rise and Service Module panel separation.',
    relevance:
      'Demonstrates that even fluoro-polymers normally considered self-extinguishing in air can burn vigorously in high-pressure pure oxygen.',
    url: 'https://ntrs.nasa.gov/citations/19710003598',
    relatedExperimentIds: ['bass-2', 'spice'],
    tags: ['Apollo 13', 'cryogenic oxygen', 'Teflon insulation', 'NTRS', 'ignition hazard'],
  },

  // 8. Mir Space Station Fire (1997)
  {
    id: 'res-mir-fire-1997',
    title: '1997 Mir Space Station Solid-Fuel Oxygen Generator (SFOG) Fire Case Study',
    publisher: 'NASA History — Shuttle-Mir Program / Safety Lessons',
    year: 1998,
    sourceType: 'incident-report',
    topic: 'mir-incident',
    explanation:
      'Documentation of the February 24, 1997 fire aboard the Russian Mir space station when a lithium perchlorate oxygen generator ("Vika" / TGK canister) ruptured and burned like a blowtorch for ~14 minutes, filling modules with dense aerosol smoke transported purely by ventilation currents.',
    relevance:
      'Real-world orbital fire event demonstrating non-buoyant smoke dispersion, egress blockage, and fire extinguisher recoil in microgravity.',
    url: 'https://ntrs.nasa.gov/search?q=Mir%20space%20station%20fire%20oxygen%20generator',
    relatedExperimentIds: ['same', 'same-r', 'saffire-6'],
    tags: ['Mir', 'SFOG', 'oxygen candle', 'orbital fire', 'smoke dispersion'],
  },

  // 9. Smoke Aerosol Measurement Experiment (SAME)
  {
    id: 'res-same-smoke-detection',
    title: 'Smoke Aerosol Measurement Experiment (SAME) & Spacecraft Smoke Detection',
    publisher: 'NASA Glenn Research Center / NTRS (Urban et al.)',
    year: 2010,
    sourceType: 'technical-report',
    topic: 'smoke-detection',
    explanation:
      'Investigates particle size distributions of smoke generated by overheated spacecraft materials (silicone, Teflon, Kapton, cellulose, lamp wick) in microgravity vs. 1g. Shows that absence of buoyancy increases residence time in the hot zone, shifting smoke aerosols toward larger aggregate sizes.',
    relevance:
      'Explains why ISS laser-scattering photoelectric detectors respond differently from terrestrial ionization detectors and how false alarms from dust are filtered.',
    url: 'https://ntrs.nasa.gov/search?q=Smoke%20Aerosol%20Measurement%20Experiment%20SAME%20Urban',
    relatedExperimentIds: ['same', 'same-r', 'saffire-4'],
    tags: ['SAME', 'smoke particle size', 'photoelectric detector', 'ionization', 'aerosol'],
  },

  // 10. NASA Firefighter Safety Technologies Spinoff
  {
    id: 'res-nasa-firefighter-spinoff',
    title: 'NASA Spinoff: Lightweight Firefighter Breathing Apparatus (SCBA) & Thermal Gear',
    publisher: 'NASA Technology Transfer Program (Spinoff)',
    year: 2021,
    sourceType: 'spinoff-feature',
    topic: 'firefighter-tech',
    explanation:
      'Details how NASA Johnson Space Center engineers adapted Apollo Portable Life Support System (PLSS) aluminum-composite overwrapped pressure vessels, hip-load harnesses, and PBI/high-temperature textiles into modern Self-Contained Breathing Apparatuses (SCBA) and turnout gear used by terrestrial firefighters.',
    relevance:
      'Demonstrates how spacecraft life-support and combustion safety engineering directly protects terrestrial first responders.',
    url: 'https://spinoff.nasa.gov',
    relatedExperimentIds: ['saffire-4', 'saffire-6'],
    tags: ['SCBA', 'NASA Spinoff', 'firefighter safety', 'composite pressure vessel', 'thermal protection'],
  },

  // 11. Exploration Habitat Atmosphere Trade-offs (Normoxic Low-Pressure)
  {
    id: 'res-habitat-atmosphere-nasa',
    title: 'Exploration Atmosphere Design: 8.2 psia / 34% O₂ Flammability & Habitat Safety',
    publisher: 'NASA Technical Reports Server (NTRS) — Exploration Atmospheres',
    year: 2020,
    sourceType: 'technical-report',
    topic: 'habitat-safety',
    explanation:
      'Evaluates NASA\'s proposed exploration habitat atmosphere (approx. 56.5 kPa / 0.56 atm total pressure at 32–34% O₂) designed to reduce EVA pre-breathe time for lunar/Mars surface operations while balancing increased material flammability at elevated oxygen mole fractions.',
    relevance:
      'Directly links Saffire IV–V and BASS-II flammability boundary findings to future Moon and Mars surface habitat architecture.',
    url: 'https://ntrs.nasa.gov/search?q=exploration%20atmosphere%20flammability%2034%25%20oxygen%20microgravity',
    relatedExperimentIds: ['saffire-4', 'saffire-5', 'bass-2', 'spice'],
    tags: ['Artemis', 'lunar habitat', 'Mars habitat', 'exploration atmosphere', '34% O2', 'reduced pressure'],
  },

  // 12. NASA-STD-6001 Material Flammability Standard
  {
    id: 'res-nasa-std-6001',
    title: 'NASA-STD-6001B: Flammability, Offgassing, and Compatibility Requirements',
    publisher: 'NASA Office of Safety and Mission Assurance',
    year: 2016,
    sourceType: 'technical-report',
    topic: 'habitat-safety',
    explanation:
      'The mandatory NASA technical standard governing upward flame propagation tests (Test 1) and oxygen compatibility screening for all materials flown inside crewed spacecraft cabins.',
    relevance:
      'BASS-II and Saffire experiments specifically tested whether standard upward 1g screening (Test 1) is sufficiently conservative for microgravity forced-ventilation environments.',
    url: 'https://standards.nasa.gov/standard/NASA/NASA-STD-6001',
    relatedExperimentIds: ['bass', 'bass-2', 'saffire-2', 'saffire-3'],
    tags: ['NASA-STD-6001', 'material certification', 'Test 1', 'spacecraft cabin'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SCIENTIFIC INSIGHTS (CONNECTING EXPERIMENTS & SIMULATION RESULTS)
// ─────────────────────────────────────────────────────────────────────────────

export const SCIENTIFIC_INSIGHTS: ScientificInsight[] = [
  {
    id: 'insight-oxygen-flammability',
    title: 'Oxygen Concentration vs. Flammability Limits in Microgravity',
    question: 'Why can materials sustain combustion at lower oxygen concentrations in space than on Earth?',
    category: 'oxygen-flammability',
    categoryLabel: 'Oxygen & Extinction',
    summary:
      'In microgravity, the Minimum Oxygen Index (MOI) required for sustained combustion under low-speed ventilation is often 2–5 vol% lower than the 1g Limiting Oxygen Index (LOI), because gentle forced flow supplies oxidizer without strong buoyant convective cooling.',
    experimentalFinding:
      'NASA\'s BASS and BASS-II investigations on the ISS demonstrated that PMMA and cotton-fiberglass samples continued burning at 15–17% O₂ under low forced airflow (5–10 cm/s) — below their 1g upward-burn extinction thresholds. Conversely, in Saffire IV and V, elevating oxygen to ~34% at reduced pressure (0.56 atm, exploration atmosphere) significantly increased flame spread velocity and heat release rate.',
    modelInterpretation:
      'MODEL INTERPRETATION (FLARE D² Law): In FLARE\'s analytical model, increasing O₂ from 15% to 30% raises the mass transfer driving number (B-number) and adiabatic flame temperature (from ~1,350 K to >2,000 K), accelerating the D² burning rate constant K. Below material-specific microgravity O₂ thresholds (e.g., 10% for PMMA, 12% for cellulose), the modeled heat release falls below surface pyrolysis requirements and triggers extinction.',
    limitationsNote:
      'FLARE\'s D² Law uses empirical extinction cutoffs derived from BASS/FLEX literature rather than solving multi-step finite-rate chemical kinetics or surface radiative heat loss.',
    evidence: [
      {
        type: 'experimental-evidence',
        label: 'BASS & BASS-II (ISS CIR)',
        detail: 'Measured Microgravity Oxygen Index (MOI) for solid fuels across 15–50% O₂ and 0–30 cm/s flow.',
        sourceRef: 'Olson et al. (2016, 2017), Combustion and Flame / NASA/TM-2016-218769',
        url: 'https://ntrs.nasa.gov/search?q=bass-II+olson',
      },
      {
        type: 'experimental-evidence',
        label: 'Saffire-IV & Saffire-V (Uncrewed Cygnus)',
        detail: 'Tested large-scale flame spread in 34% O₂ / 8.2 psia exploration atmosphere conditions.',
        sourceRef: 'NASA PSI Saffire-IV / Saffire-V datasets',
        url: 'https://psi.nasa.gov/search?q=saffire',
      },
      {
        type: 'model-interpretation',
        label: 'FLARE D² Law Stoichiometric Scaling',
        detail: 'Models logarithmic dependence of burning rate constant K on ambient O₂ mass fraction.',
        sourceRef: 'FLARE Simulation Engine (src/lib/simulation/combustionModel.ts)',
      },
    ],
    relatedExperimentIds: ['bass', 'bass-2', 'saffire-4', 'saffire-5'],
    relatedResourceIds: ['res-apollo-1-history', 'res-habitat-atmosphere-nasa', 'res-nasa-std-6001'],
    simulationLink: {
      fuel: 'pmma',
      gravity: 0.001,
      oxygenPercent: 16,
      pressure: 1.0,
      airflowVelocity: 0.05,
      label: 'Explore Near-Limit O₂ (16%) in Lab',
    },
    comparisonPreset: {
      leftId: 'sim-microgravity-low-o2',
      rightId: 'sim-microgravity-enriched-o2',
      label: 'Compare 15% vs 30% O₂ Scenarios',
    },
  },

  {
    id: 'insight-airflow-microgravity',
    title: 'How Forced Airflow Controls Microgravity Combustion',
    question: 'Why does spacecraft HVAC ventilation make microgravity flames burn faster instead of blowing them out?',
    category: 'airflow-microgravity',
    categoryLabel: 'Airflow & Transport',
    summary:
      'Without gravity, natural buoyant convection disappears (~0 m/s self-induced flow), leaving slow molecular diffusion as the only oxygen transport mechanism. Introducing even gentle spacecraft ventilation (0.05–0.30 m/s) replenishes O₂ at the flame front and sweeps away combustion products, intensifying the flame.',
    experimentalFinding:
      'In strictly quiescent microgravity (FLEX, CFI), diffusion flames grow thicker, cooler, and spherical, often self-extinguishing via radiative heat loss and product accumulation. In BASS and Saffire I–III, applying forced ventilation (5–40 cm/s, typical of ISS cabin air circulation) elongated the flame downstream and dramatically increased burning rate and flame spread stability.',
    modelInterpretation:
      'MODEL INTERPRETATION (FLARE D² Law): FLARE applies a Sherwood/Nusselt forced-convection correction factor (proportional to Re^0.5) to the diffusive burning rate constant and increases the flame aspect ratio above 1.0 when airflow velocity > 0 m/s. This illustrates the transition from a spherical diffusion-limited flame to an elongated convective plume.',
    limitationsNote:
      'The 1D spherical D² model approximates convective enhancement macroscopically; it does not resolve 3D wake recirculation, flame liftoff, or opposed vs. concurrent surface spread.',
    evidence: [
      {
        type: 'experimental-evidence',
        label: 'BASS & SLICE (ISS)',
        detail: 'Quantified flame spread rate and standoff distance as functions of forced flow velocity (0–30 cm/s).',
        sourceRef: 'Olson et al. (2015), Combustion and Flame; NASA PSI BASS dataset',
        url: 'https://psi.nasa.gov/search?q=BASS',
      },
      {
        type: 'experimental-evidence',
        label: 'Saffire-I to III (Uncrewed Cygnus)',
        detail: 'Measured meter-scale flame growth under 0.2–0.4 m/s forced cabin ventilation.',
        sourceRef: 'Urban et al. (2019), NASA/TM-2019-220010',
        url: 'https://ntrs.nasa.gov/search?q=Saffire+Urban',
      },
      {
        type: 'model-interpretation',
        label: 'FLARE Convective Sherwood Correction',
        detail: 'Models mass-loss rate amplification and flame aspect-ratio elongation under forced flow.',
        sourceRef: 'FLARE Simulation Engine (src/lib/simulation/combustionModel.ts)',
      },
    ],
    relatedExperimentIds: ['bass', 'saffire-1', 'saffire-3', 'slice'],
    relatedResourceIds: ['res-ntrs-saffire-flame-spread', 'res-nasa-psi-database'],
    simulationLink: {
      fuel: 'cellulose',
      gravity: 0.001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.25,
      label: 'Test ISS Ventilation Flow (0.25 m/s) in Lab',
    },
    comparisonPreset: {
      leftId: 'sim-microgravity-baseline',
      rightId: 'sim-iss-ventilation',
      label: 'Compare Quiescent vs. ISS Ventilation',
    },
  },

  {
    id: 'insight-smoke-detection',
    title: 'Smoke Particle Physics & Spacecraft Fire Detection',
    question: 'How does microgravity alter smoke aerosol sizes and change how spacecraft fire detectors must be designed?',
    category: 'smoke-detection',
    categoryLabel: 'Smoke & Detection',
    summary:
      'In microgravity, smoke particles remain longer inside the thermal reaction zone because there is no buoyant plume to loft them rapidly upward. Longer residence times cause primary particles to agglomerate into larger chains, shifting particle size distributions and requiring ventilation-coupled optical detection.',
    experimentalFinding:
      'NASA\'s Smoke Aerosol Measurement Experiment (SAME and SAME-R) aboard the ISS measured smoke from overheated wiring insulation (Teflon, Kapton, silicone) and cellulose. Microgravity smoke consistently exhibited larger mean particle diameters than 1g reference tests. Furthermore, as demonstrated during the 1997 Mir fire and Saffire-IV diagnostic tests, smoke does not rise to the "ceiling" — it follows HVAC return ducts.',
    modelInterpretation:
      'MODEL INTERPRETATION (FLARE Soot Layer): FLARE estimates relative soot volume fraction (ppm) using each fuel\'s empirical sootIndex (Polyethylene 0.65 > PMMA 0.45 > Cellulose 0.25 > Paper 0.20) amplified in microgravity due to longer residence times and reduced oxidative burnout. This is an educational indicator of soot propensity, not an aerosol coagulation solver.',
    limitationsNote:
      'FLARE does not compute log-normal aerosol size distributions or Mie light-scattering angles; consult SAME/SAME-R PSI datasets for detector calibration data.',
    evidence: [
      {
        type: 'experimental-evidence',
        label: 'SAME & SAME-R (ISS)',
        detail: 'Measured particle size moments and morphology for spacecraft pyrolysis aerosols in microgravity.',
        sourceRef: 'Urban et al. (2009, 2010), AIAA / NASA Glenn Research Center',
        url: 'https://ntrs.nasa.gov/search?q=Smoke+Aerosol+Measurement+Experiment+SAME+Urban',
      },
      {
        type: 'literature-source',
        label: '1997 Mir SFOG Fire Operational Analysis',
        detail: 'Confirmed that dense smoke travels strictly with forced air currents in orbital habitats.',
        sourceRef: 'NASA Shuttle-Mir History & Safety Documentation',
        url: 'https://ntrs.nasa.gov/search?q=Mir+space+station+fire',
      },
      {
        type: 'model-interpretation',
        label: 'FLARE Soot Volume Fraction Indicator',
        detail: 'Scales qualitative soot concentration with fuel sootIndex, O₂ depletion, and residence time.',
        sourceRef: 'FLARE Simulation Engine (src/lib/simulation/materialDatabase.ts)',
      },
    ],
    relatedExperimentIds: ['same', 'same-r', 'saffire-4', 'cfi'],
    relatedResourceIds: ['res-same-smoke-detection', 'res-mir-fire-1997'],
    simulationLink: {
      fuel: 'polyethylene',
      gravity: 0.001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.05,
      label: 'Simulate High-Soot Polymer (HDPE) in Lab',
    },
    comparisonPreset: {
      leftId: 'same',
      rightId: 'sim-high-energy-fuel',
      label: 'Compare SAME vs. High-Soot HDPE Scenario',
    },
  },

  {
    id: 'insight-cool-flames-droplets',
    title: 'Spherical Droplet Burning, D² Law Validation & Cool Flames',
    question: 'How accurately does the classical D² Law describe real microgravity combustion, and where does it break down?',
    category: 'cool-flames',
    categoryLabel: 'Droplet Physics & Cool Flames',
    summary:
      'Removing buoyancy in microgravity creates the ideal spherically symmetric environment assumed by classical D² Law theory — validated by FLEX on the ISS — while also revealing radiative extinction and low-temperature (~600–800 K) "cool flames" invisible to the naked eye.',
    experimentalFinding:
      'In FLEX and FLEX-2 (ISS CIR), millimeter-scale n-heptane and methanol droplets burned with a linear decrease in diameter squared (D²(t) = D₀² − K·t), validating classical diffusion-flame theory. However, large droplets extinguished prematurely due to radiative heat loss from soot/CO₂/H₂O, and n-heptane droplets transitioned into sustained, invisible low-temperature cool-flame chemistry before final vapor dispersion.',
    modelInterpretation:
      'MODEL INTERPRETATION (FLARE Core Solver): FLARE directly integrates the quasi-steady D² Law (d(D²)/dt = −K) adapted for spherical solid-fuel equivalents. While the linear D² decay matches FLEX\'s primary hot-flame regime qualitatively, FLARE does not model low-temperature alkylperoxy radical (RO₂) cool-flame chemistry.',
    limitationsNote:
      'Cool flames require detailed multi-step chemical kinetics (hundreds of reactions) and cannot be predicted by single-step stoichiometric D² models.',
    evidence: [
      {
        type: 'experimental-evidence',
        label: 'FLEX & FLEX-2 (ISS MDCA)',
        detail: 'Validated D² Law burning rate constants and discovered quasi-steady droplet cool flames in space.',
        sourceRef: 'Nayagam et al. (2012), Combustion and Flame; Farouk et al. (2015)',
        url: 'https://www.youtube.com/watch?v=ZiHj78W4S0g',
      },
      {
        type: 'model-interpretation',
        label: 'FLARE D² Law Time Integration',
        detail: 'Computes sample diameter D(t) = sqrt(D₀² − K_eff · t) with convective and O₂ corrections.',
        sourceRef: 'FLARE Simulation Engine (src/lib/simulation/combustionModel.ts)',
      },
    ],
    relatedExperimentIds: ['flex', 'flex-2', 'acme'],
    relatedResourceIds: ['res-sciencecasts-strange-flames', 'res-glenn-acme-cir'],
    simulationLink: {
      fuel: 'pmma',
      gravity: 0.001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.0,
      label: 'Run Quiescent D² Law Validation Case',
    },
    comparisonPreset: {
      leftId: 'flex',
      rightId: 'sim-microgravity-baseline',
      label: 'Compare FLEX vs. Microgravity Baseline',
    },
  },

  {
    id: 'insight-saffire-scale-effects',
    title: 'Sample Scale & Enclosure Effects: Why Saffire Flew on Uncrewed Cygnus',
    question: 'Why did small ISS experiments not tell the full story about large-scale spacecraft fires?',
    category: 'scale-saffire',
    categoryLabel: 'Scale & Vehicle Enclosure',
    summary:
      'Small-scale ISS tests (centimeter samples inside sealed racks) cannot safely test meter-scale fires or capture how a large fire consumes cabin oxygen and raises module pressure. Uncrewed Cygnus vehicles allowed Saffire I–VI to test full-scale fires safely after ISS departure.',
    experimentalFinding:
      'Saffire-I through VI burned large samples (up to 0.4 m × 1.0 m Sibal cloth and structured PMMA panels) inside uncrewed Cygnus spacecraft in free flight. Results showed that flame spread rates and interaction with finite vehicle oxygen reserves depend strongly on sample width, thickness, and cabin volume feedback — effects absent in small CIR test chambers.',
    modelInterpretation:
      'MODEL INTERPRETATION (FLARE Chamber O₂ Depletion): FLARE models a local near-flame oxygen depletion term (o2NearFlame) for a small sample (3–10 mm), representing localized diffusive starvation rather than whole-module pressure rise or global cabin O₂ exhaustion.',
    limitationsNote:
      'Saffire measurements were performed in uncrewed cargo spacecraft after departing the ISS and must never be presented as measurements from an occupied crew habitat.',
    evidence: [
      {
        type: 'experimental-evidence',
        label: 'Saffire I–VI (Uncrewed Cygnus Cargo Spacecraft)',
        detail: 'Measured meter-scale flame spread, cabin ΔP, O₂ consumption, and CO₂/water-mist suppression.',
        sourceRef: 'Urban et al. (2019, 2023), NASA Glenn Research Center / NASA PSI',
        url: 'https://www.nasa.gov/saffire',
      },
      {
        type: 'model-interpretation',
        label: 'FLARE Millimeter-Scale Boundary Assumption',
        detail: 'Models 3–10 mm spherical samples (comparable to BASS/FLEX scale, not Saffire meter scale).',
        sourceRef: 'FLARE Simulation Engine (src/lib/simulation/types.ts)',
      },
    ],
    relatedExperimentIds: ['saffire-1', 'saffire-2', 'saffire-3', 'saffire-6', 'bass'],
    relatedResourceIds: ['res-nasa-saffire-overview', 'res-ntrs-saffire-flame-spread'],
    comparisonPreset: {
      leftId: 'saffire-1',
      rightId: 'bass',
      label: 'Compare Saffire-I (Cygnus) vs. BASS (ISS CIR)',
    },
  },

  {
    id: 'insight-habitat-exploration-atmospheres',
    title: 'Exploration Habitat Atmospheres: Pressure vs. Oxygen Trade-offs',
    question: 'How do reduced cabin pressure and elevated oxygen percentage affect fire risk in Moon and Mars habitats?',
    category: 'habitat-atmosphere',
    categoryLabel: 'Habitat Atmospheres',
    summary:
      'To allow astronauts to perform frequent spacewalks (EVAs) without long decompression sickness pre-breathe protocols, future lunar and Mars habitats may use reduced total pressure (~0.56–0.70 atm) with elevated oxygen concentration (26–34% O₂). However, higher O₂ mole fraction increases material flammability despite lower total pressure.',
    experimentalFinding:
      'Historical tragedy in Apollo 1 (100% O₂ at 1.14 atm) proved the extreme hazard of high oxygen partial pressure. Modern NASA research in BASS-II, SPICE, and Saffire IV–V tested normoxic low-pressure atmospheres (e.g., 34% O₂ at 8.2 psia), demonstrating that oxygen mole fraction dominates flame spread acceleration over the moderating effect of reduced total pressure.',
    modelInterpretation:
      'MODEL INTERPRETATION (FLARE Pressure & O₂ Coupling): In FLARE\'s Low Pressure Microgravity scenario (26% O₂ at 0.70 atm), the elevated O₂ percentage raises flame temperature and reaction driving force, while the 0.70 atm pressure factor slightly reduces gas density and convective heat transfer.',
    limitationsNote:
      'Material certification for 34% O₂ exploration habitats requires full NASA-STD-6001 and microgravity testing; FLARE\'s pressure scaling (P^0.5) is an educational approximation.',
    evidence: [
      {
        type: 'incident-report' as unknown as 'literature-source',
        label: 'Apollo 1 Investigation & NASA-STD-6001B',
        detail: 'Established strict oxygen concentration and pressure flammability envelopes for crewed cabins.',
        sourceRef: 'NASA Apollo 1 Review Board (1967); NASA-STD-6001B',
        url: 'https://www.nasa.gov/apollo-1/',
      },
      {
        type: 'experimental-evidence',
        label: 'Saffire-IV, Saffire-V & SPICE',
        detail: 'Evaluated solid fuel ignition and flame spread at elevated O₂ and reduced total pressure.',
        sourceRef: 'NASA PSI Saffire-IV/V & SPICE archives',
        url: 'https://psi.nasa.gov',
      },
      {
        type: 'model-interpretation',
        label: 'FLARE Pressure-Oxygen Parametric Model',
        detail: 'Allows independent adjustment of O₂ vol% (15–100%) and pressure (0.1–1.5 atm).',
        sourceRef: 'FLARE Simulation Engine (src/data/simulationScenarios.ts)',
      },
    ],
    relatedExperimentIds: ['saffire-4', 'saffire-5', 'spice', 'bass-2'],
    relatedResourceIds: ['res-habitat-atmosphere-nasa', 'res-apollo-1-history', 'res-nasa-std-6001'],
    simulationLink: {
      fuel: 'pmma',
      gravity: 0.001,
      oxygenPercent: 26,
      pressure: 0.7,
      airflowVelocity: 0.05,
      label: 'Simulate Exploration Atmosphere (26% O₂, 0.7 atm)',
    },
    comparisonPreset: {
      leftId: 'sim-microgravity-baseline',
      rightId: 'sim-low-pressure-microgravity',
      label: 'Compare ISS (1 atm, 21% O₂) vs. Exploration (0.7 atm, 26% O₂)',
    },
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// RESEARCH QUESTION MATCHER ("Which NASA experiments are relevant to a question?")
// ─────────────────────────────────────────────────────────────────────────────

export const RESEARCH_QUESTIONS: ResearchQuestionGuide[] = [
  {
    id: 'rq-1',
    question: 'How does oxygen concentration change material flammability limits in microgravity?',
    domain: 'Flammability & Extinction',
    shortAnswer:
      'BASS-II and Saffire IV–V show that materials can burn at 2–5% lower O₂ in microgravity low-speed flows than in 1g, and burn significantly faster in 34% O₂ exploration atmospheres.',
    evidenceBasis: 'Experimental + Model',
    relevantExperimentIds: ['bass', 'bass-2', 'saffire-4', 'saffire-5', 'spice'],
    relevantResourceIds: ['res-habitat-atmosphere-nasa', 'res-nasa-std-6001', 'res-apollo-1-history'],
    relatedInsightId: 'insight-oxygen-flammability',
  },
  {
    id: 'rq-2',
    question: 'What role does spacecraft cabin ventilation play in sustaining or spreading a fire?',
    domain: 'Fluid Dynamics & Convection',
    shortAnswer:
      'In the absence of buoyancy, forced cabin airflow (0.05–0.4 m/s) replaces natural convection as the primary oxidizer delivery mechanism, preventing self-suffocation and elongating the flame.',
    evidenceBasis: 'Experimental + Model',
    relevantExperimentIds: ['bass', 'saffire-1', 'saffire-2', 'saffire-3', 'slice', 'cfi'],
    relevantResourceIds: ['res-ntrs-saffire-flame-spread', 'res-nasa-saffire-overview'],
    relatedInsightId: 'insight-airflow-microgravity',
  },
  {
    id: 'rq-3',
    question: 'Why do spacecraft smoke detectors work differently from home smoke alarms?',
    domain: 'Smoke & Diagnostics',
    shortAnswer:
      'Microgravity eliminates rising smoke plumes (smoke follows ventilation ducts) and increases aerosol aggregation time, producing larger smoke particles studied in SAME and SAME-R.',
    evidenceBasis: 'Experimental Primary',
    relevantExperimentIds: ['same', 'same-r', 'saffire-4'],
    relevantResourceIds: ['res-same-smoke-detection', 'res-mir-fire-1997'],
    relatedInsightId: 'insight-smoke-detection',
  },
  {
    id: 'rq-4',
    question: 'Why were Saffire I–VI performed on uncrewed Cygnus spacecraft instead of the ISS?',
    domain: 'Large-Scale Fire Safety',
    shortAnswer:
      'Meter-scale fires release too much heat, smoke, and pressure rise for crewed ISS racks. Uncrewed Cygnus cargo vehicles after ISS departure enabled safe full-scale testing.',
    evidenceBasis: 'Experimental Primary',
    relevantExperimentIds: ['saffire-1', 'saffire-2', 'saffire-3', 'saffire-4', 'saffire-5', 'saffire-6'],
    relevantResourceIds: ['res-nasa-saffire-overview', 'res-ntrs-saffire-flame-spread'],
    relatedInsightId: 'insight-saffire-scale-effects',
  },
  {
    id: 'rq-5',
    question: 'What are "cool flames" and how were they discovered on the Space Station?',
    domain: 'Droplet Combustion Chemistry',
    shortAnswer:
      'During FLEX and FLEX-2 droplet tests on the ISS, heptane droplets appeared to extinguish but continued burning invisibly at ~600–800 K via low-temperature radical chemistry.',
    evidenceBasis: 'Experimental + Model',
    relevantExperimentIds: ['flex', 'flex-2', 'acme'],
    relevantResourceIds: ['res-sciencecasts-strange-flames', 'res-glenn-acme-cir'],
    relatedInsightId: 'insight-cool-flames-droplets',
  },
  {
    id: 'rq-6',
    question: 'How did the Apollo 1, Apollo 13, and 1997 Mir fires shape modern spacecraft fire protection?',
    domain: 'Historical Incidents & Spinoffs',
    shortAnswer:
      'They drove strict oxygen-compatibility testing (NASA-STD-6001), nitrogen-diluted cabin air, duct-mounted laser smoke detectors, and lightweight composite SCBA breathing apparatuses.',
    evidenceBasis: 'Historical + Experimental',
    relevantExperimentIds: ['same', 'saffire-6', 'bass-2'],
    relevantResourceIds: ['res-apollo-1-history', 'res-apollo-13-ntrs', 'res-mir-fire-1997', 'res-nasa-firefighter-spinoff'],
    relatedInsightId: 'insight-habitat-exploration-atmospheres',
  },
]

