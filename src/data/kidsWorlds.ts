import type { FuelMaterial } from '@/lib/simulation/types'

export type KidsWorldId =
  | 'meet-the-flame'
  | 'oxygen-mystery'
  | 'invisible-wind'
  | 'inside-space-lab'
  | 'keeping-astronauts-safe'

export interface KidsWorldOption {
  id: string
  label: string
  sublabel: string
  badge: string
  simParams: {
    fuel: FuelMaterial
    gravity: number
    oxygenPercent: number
    pressure: number
    airflowVelocity: number
  }
  whatChangedHeadline: string
  whatChangedExplanation: string
  whyItChangedScience: string
}

export interface KidsWorld {
  id: KidsWorldId
  worldNumber: string
  title: string
  subtitle: string
  scientificSubject: string
  compellingQuestion: string
  visualIntroLead: string
  imagePath: string
  imageAlt: string
  theme: {
    accent: string
    accentSoft: string
    badgeBg: string
    badgeText: string
    darkSurface: string
    lightSurface: string
    border: string
  }
  learningQuestions: [string, string, string]
  storySteps: Array<{
    stepNumber: string
    heading: string
    body: string
  }>
  interactiveParameterLabel: string
  interactivePrompt: string
  options: [KidsWorldOption, KidsWorldOption, KidsWorldOption]
  takeaway: string
  nasaResearch: {
    investigationCode: string
    investigationTitle: string
    platform: string
    summary: string
    researchHref: string
  }
}

export const KIDS_WORLDS: KidsWorld[] = [
  {
    id: 'meet-the-flame',
    worldNumber: 'WORLD 01',
    title: 'Meet the Flame',
    subtitle: 'Combustion & Microgravity Flame Behavior',
    scientificSubject: 'Combustion & Buoyancy',
    compellingQuestion: 'WHY DOES FIRE LOOK DIFFERENT IN SPACE?',
    visualIntroLead:
      'On Earth, every candle flame stretches upward into a flickering teardrop. Inside an orbiting spacecraft, that upward pull nearly vanishes — transforming how a flame shapes itself.',
    imagePath: '/images/kids/world-1-flame-chamber.png',
    imageAlt:
      '3D illustration of a glowing spherical flame suspended inside a transparent experimental chamber with an astronaut observing',
    theme: {
      accent: '#f97316',
      accentSoft: '#ffedd5',
      badgeBg: '#fff7ed',
      badgeText: '#c2410c',
      darkSurface: '#09152b',
      lightSurface: '#fffaf5',
      border: '#fdba74',
    },
    learningQuestions: [
      'What makes a flame?',
      'Why does fire behave differently in microgravity?',
      'Why does a flame sometimes look more rounded in space?',
    ],
    storySteps: [
      {
        stepNumber: '01',
        heading: 'Three Partners Create a Flame',
        body: 'A flame is a glowing reaction zone where hot fuel vapor mixes with oxygen gas. As LONG as fuel, oxygen, and enough heat stay together, the chemical reaction releases light and warmth.',
      },
      {
        stepNumber: '02',
        heading: 'How Earth Gravity Shapes Fire',
        body: 'On Earth, gravity pulls denser, cooler air downward. That cooler air pushes hot, expanded combustion gases upward — a flow called buoyancy-driven convection. This upward rush stretches the flame into a tall teardrop.',
      },
      {
        stepNumber: '03',
        heading: 'What Changes in Microgravity',
        body: 'In orbit aboard the International Space Station, buoyancy-driven flow is greatly reduced. Without hot air rushing upward, oxygen molecules travel more slowly toward the fuel from all directions by molecular diffusion — often producing a much more rounded or spherical flame around small droplets and spheres.',
      },
    ],
    interactiveParameterLabel: 'Explore Gravity Regimes',
    interactivePrompt:
      'Switch the chamber gravity between Earth, the Moon, and ISS Microgravity to observe how the simplified D² Law model adjusts flame shape and temperature:',
    options: [
      {
        id: 'earth-1g',
        label: 'Earth Gravity',
        sublabel: '9.81 m/s² (1.0 g)',
        badge: 'Buoyant Plume',
        simParams: {
          fuel: 'cellulose',
          gravity: 9.81,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.05,
        },
        whatChangedHeadline: 'Elongated Upward Flame Plume',
        whatChangedExplanation:
          'The flame stretches vertically (aspect ratio > 1.8) and burns vigorously as rising hot gas draws fresh oxygen in from the base.',
        whyItChangedScience:
          'Strong gravitational acceleration drives buoyant natural convection, accelerating oxidizer transport to the reaction zone.',
      },
      {
        id: 'lunar-g',
        label: 'Lunar Gravity',
        sublabel: '1.62 m/s² (0.16 g)',
        badge: 'Partial Buoyancy',
        simParams: {
          fuel: 'cellulose',
          gravity: 1.62,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.03,
        },
        whatChangedHeadline: 'Shorter, Gently Rounded Oval Flame',
        whatChangedExplanation:
          'At one-sixth of Earth gravity, buoyant upward flow weakens noticeably. The flame envelope widens and its tip softens into a calm oval.',
        whyItChangedScience:
          'Reduced gravitational acceleration lowers the Grashof number, balancing gentle buoyancy with molecular diffusion.',
      },
      {
        id: 'iss-ug',
        label: 'ISS Microgravity',
        sublabel: '0.001 m/s² (~0 g)',
        badge: 'Spherical Diffusion',
        simParams: {
          fuel: 'cellulose',
          gravity: 0.001,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.01,
        },
        whatChangedHeadline: 'Symmetric Spherical Diffusion Flame',
        whatChangedExplanation:
          'With buoyant convection nearly absent, the reaction front forms a symmetric sphere (aspect ratio ≈ 1.00) around the spherical sample.',
        whyItChangedScience:
          'In quiescent microgravity, mass transport is governed by radial molecular diffusion rather than buoyant plumes.',
      },
    ],
    takeaway:
      'Gravity does not pull on the light of a flame directly — it pulls on the surrounding air! When buoyancy disappears in microgravity, diffusion takes over and small flames become remarkably round.',
    nasaResearch: {
      investigationCode: 'FLEX & FLEX-2',
      investigationTitle: 'Flame Extinguishment Experiment (ISS)',
      platform: 'ISS Combustion Integrated Rack (CIR)',
      summary:
        'NASA researchers studied over 200 burning fuel droplets in microgravity, measuring spherical flame diameters, soot shells, and low-temperature cool-flame chemistry.',
      researchHref: '/research',
    },
  },
  {
    id: 'oxygen-mystery',
    worldNumber: 'WORLD 02',
    title: 'The Oxygen Mystery',
    subtitle: 'Oxygen Concentration & Spacecraft Atmospheres',
    scientificSubject: 'Oxygen & Combustion Chemistry',
    compellingQuestion: 'WHY DOES OXYGEN CONCENTRATION CHANGE EVERYTHING?',
    visualIntroLead:
      'Air is mostly invisible nitrogen mixed with about 21% oxygen. Changing that balance by even a few percent dramatically alters how easily materials ignite and how hot they burn.',
    imagePath: '/images/kids/world-2-oxygen-mystery.png',
    imageAlt:
      '3D molecular visualization of glowing cyan oxygen molecules drifting toward a warm spherical space flame',
    theme: {
      accent: '#0284c7',
      accentSoft: '#e0f2fe',
      badgeBg: '#f0f9ff',
      badgeText: '#0369a1',
      darkSurface: '#071a33',
      lightSurface: '#f4faff',
      border: '#7dd3fc',
    },
    learningQuestions: [
      'Why does fire need oxygen?',
      'How does oxygen concentration influence combustion?',
      'Why is oxygen management important in spacecraft?',
    ],
    storySteps: [
      {
        stepNumber: '01',
        heading: 'Oxygen Is the Oxidizer',
        body: 'Burning is a fast chemical reaction between fuel molecules and oxygen molecules (O₂). Without enough oxygen molecules colliding with hot fuel vapor, the reaction cools down and stops.',
      },
      {
        stepNumber: '02',
        heading: 'Nitrogen Acts as a Thermal Cushion',
        body: 'In normal cabin air (21% O₂, 79% N₂), nitrogen molecules do not burn — they absorb heat and slow the reaction down. When oxygen concentration rises, less nitrogen is present to absorb that heat.',
      },
      {
        stepNumber: '03',
        heading: 'Designing Safe Spacecraft Air',
        body: 'Future Moon and Mars habitats may use lower cabin pressure with a slightly higher oxygen percentage (such as 30–34% O₂) to help astronauts prepare for spacewalks. Engineers must test every fabric and wire at those exact oxygen levels.',
      },
    ],
    interactiveParameterLabel: 'Explore Oxygen Concentration',
    interactivePrompt:
      'Adjust the chamber oxygen mole fraction in microgravity to see how flame temperature, heat release, and extinction limits respond:',
    options: [
      {
        id: 'o2-16',
        label: '16% Oxygen',
        sublabel: 'Low-O₂ Cabin Limit',
        badge: 'Near Extinction',
        simParams: {
          fuel: 'cellulose',
          gravity: 0.001,
          oxygenPercent: 16,
          pressure: 1.0,
          airflowVelocity: 0.03,
        },
        whatChangedHeadline: 'Cool, Fragile Flame Near Extinction',
        whatChangedExplanation:
          'At 16% O₂, the reaction rate drops sharply. Flame temperature falls and radiative heat loss can extinguish the flame.',
        whyItChangedScience:
          'Lower oxygen mole fraction reduces the mass transfer driving potential (B-number) and adiabatic flame temperature.',
      },
      {
        id: 'o2-21',
        label: '21% Oxygen',
        sublabel: 'Standard ISS Cabin Air',
        badge: 'ISS Baseline',
        simParams: {
          fuel: 'cellulose',
          gravity: 0.001,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.03,
        },
        whatChangedHeadline: 'Steady Microgravity Diffusion Flame',
        whatChangedExplanation:
          'At Earth-normal 21% O₂, the spherical flame maintains a stable reaction shell with moderate temperature and burn rate.',
        whyItChangedScience:
          'Standard atmospheric composition balances crew respiration needs with manageable material flammability.',
      },
      {
        id: 'o2-32',
        label: '32% Oxygen',
        sublabel: 'Enriched Exploration Air',
        badge: 'High Flammability',
        simParams: {
          fuel: 'cellulose',
          gravity: 0.001,
          oxygenPercent: 32,
          pressure: 0.7,
          airflowVelocity: 0.05,
        },
        whatChangedHeadline: 'Intense, High-Temperature Reaction Zone',
        whatChangedExplanation:
          'At 32% O₂, flame temperature and mass burning rate climb rapidly, demonstrating why enriched-oxygen cabins require strict material controls.',
        whyItChangedScience:
          'Higher oxygen fraction reduces inert nitrogen dilution and increases stoichiometric heat release per unit gas volume.',
      },
    ],
    takeaway:
      'Oxygen makes life in space possible, but higher oxygen percentages make materials burn hotter and faster. Balancing breathable air and fire safety is one of aerospace engineering’s greatest challenges.',
    nasaResearch: {
      investigationCode: 'SAFFIRE IV–VI',
      investigationTitle: 'Spacecraft Fire Safety Demonstration',
      platform: 'Uncrewed Cygnus Cargo Spacecraft (Post-ISS Departure)',
      summary:
        'Conducted safely on uncrewed Cygnus cargo vehicles after departing the ISS, Saffire tested how elevated oxygen and reduced pressure affect large-scale flame spread.',
      researchHref: '/research',
    },
  },
  {
    id: 'invisible-wind',
    worldNumber: 'WORLD 03',
    title: 'The Invisible Wind',
    subtitle: 'Forced Airflow & Ventilation in Microgravity',
    scientificSubject: 'Airflow & Oxidizer Transport',
    compellingQuestion: 'HOW DOES INVISIBLE AIRFLOW CONTROL A SPACE FLAME?',
    visualIntroLead:
      'In a weightless spacecraft cabin, air does not move on its own. Gentle ventilation fans keep astronauts comfortable — but that same gentle breeze can feed and steer a microgravity flame.',
    imagePath: '/images/kids/world-3-invisible-wind.png',
    imageAlt:
      '3D visualization of luminous mint and cyan airflow streams curving around an amber microgravity flame',
    theme: {
      accent: '#0d9488',
      accentSoft: '#ccfbf1',
      badgeBg: '#f0fdfa',
      badgeText: '#0f766e',
      darkSurface: '#062229',
      lightSurface: '#f4fbf9',
      border: '#5eead4',
    },
    learningQuestions: [
      'How does air move inside a spacecraft?',
      'How does airflow influence a flame?',
      'Why does ventilation matter for fire safety in space?',
    ],
    storySteps: [
      {
        stepNumber: '01',
        heading: 'Why Spacecraft Need Fans',
        body: 'Without gravity-driven convection, exhaled carbon dioxide would form a bubble around a sleeping astronaut’s head. Quiet ventilation fans continuously circulate air through the cabin at 5 to 20 cm/s.',
      },
      {
        stepNumber: '02',
        heading: 'Low Airflow Feeds Microgravity Flames',
        body: 'In completely still microgravity air, a flame can choke on its own combustion products. A very gentle ventilation breeze sweeps away exhaust and delivers fresh oxygen directly to the reaction front.',
      },
      {
        stepNumber: '03',
        heading: 'Shutting Down Ventilation in an Emergency',
        body: 'While a strong blast of wind on Earth can blow out a match, gentle spacecraft airflow strengthens a microgravity fire. That is why cutting cabin ventilation is a primary fire-response step in orbit!',
      },
    ],
    interactiveParameterLabel: 'Explore Ventilation Airflow',
    interactivePrompt:
      'Vary the forced airflow velocity across a microgravity sample to observe the transition from still-air diffusion to ventilated burning and high-flow stretching:',
    options: [
      {
        id: 'flow-quiescent',
        label: 'Still Air (0.00 m/s)',
        sublabel: 'Ventilation Fans Off',
        badge: 'Pure Diffusion',
        simParams: {
          fuel: 'cellulose',
          gravity: 0.001,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.0,
        },
        whatChangedHeadline: 'Slow, Oxygen-Limited Spherical Flame',
        whatChangedExplanation:
          'With zero forced flow in microgravity, oxygen reaches the fuel only by slow molecular diffusion, keeping the heat release rate low.',
        whyItChangedScience:
          'As Reynolds and Grashof numbers approach zero, the Sherwood number approaches its minimum diffusive limit (Sh ≈ 2).',
      },
      {
        id: 'flow-cabin',
        label: 'Cabin Breeze (0.12 m/s)',
        sublabel: 'Typical ISS Ventilation',
        badge: 'Convective Boost',
        simParams: {
          fuel: 'cellulose',
          gravity: 0.001,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.12,
        },
        whatChangedHeadline: 'Brighter, Faster-Burning Ventilated Flame',
        whatChangedExplanation:
          'Gentle 12 cm/s airflow replenishes oxygen at the flame front, increasing the burning rate and slightly elongating the flame downstream.',
        whyItChangedScience:
          'Forced laminar flow increases the convective mass transfer coefficient, raising the effective burning rate constant K.',
      },
      {
        id: 'flow-high',
        label: 'Strong Duct Flow (0.40 m/s)',
        sublabel: 'High-Velocity Stream',
        badge: 'Blow-Off Strain',
        simParams: {
          fuel: 'cellulose',
          gravity: 0.001,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.4,
        },
        whatChangedHeadline: 'Stretched Wake & Convective Cooling',
        whatChangedExplanation:
          'High airflow stretches the flame into a narrow wake and introduces blow-off strain that can cool the reaction zone.',
        whyItChangedScience:
          'When residence time (Damköhler number) drops too low under high flow velocity, heat loss can exceed chemical heat generation.',
      },
    ],
    takeaway:
      'In space, even a whisper of air movement acts like a bellows for a fire. Understanding ventilation airflow helps engineers design smarter spacecraft ducts and emergency shutoffs.',
    nasaResearch: {
      investigationCode: 'BASS & BASS-II',
      investigationTitle: 'Burning and Suppression of Solids',
      platform: 'ISS Microgravity Science Glovebox (MSG)',
      summary:
        'Astronauts tested solid fuels inside a miniature flow duct on the ISS, discovering that materials sometimes burn at lower oxygen levels in gentle microgravity airflow than on Earth.',
      researchHref: '/research',
    },
  },
  {
    id: 'inside-space-lab',
    worldNumber: 'WORLD 04',
    title: 'Inside the Space Lab',
    subtitle: 'How NASA Conducts Orbital Combustion Research',
    scientificSubject: 'Orbital Combustion Hardware & Diagnostics',
    compellingQuestion: 'HOW DO SCIENTISTS STUDY FIRE ABOARD A SPACECRAFT?',
    visualIntroLead:
      'Researchers cannot light open flames in a cabin shared with astronauts. Instead, NASA engineered specialized orbital laboratories that contain, film, and measure every millisecond of a burn.',
    imagePath: '/images/kids/world-4-space-lab.png',
    imageAlt:
      '3D cutaway illustration of an orbital combustion research rack with optical cameras and a sealed flame chamber',
    theme: {
      accent: '#6366f1',
      accentSoft: '#e0e7ff',
      badgeBg: '#eef2ff',
      badgeText: '#4338ca',
      darkSurface: '#081229',
      lightSurface: '#f5f7ff',
      border: '#a5b4fc',
    },
    learningQuestions: [
      'How do researchers study fire in space?',
      'What can orbital experiments teach us?',
      'Why do scientists need tightly controlled conditions?',
    ],
    storySteps: [
      {
        stepNumber: '01',
        heading: 'The Combustion Integrated Rack (CIR)',
        body: 'Aboard the ISS Destiny laboratory module stands a refrigerator-sized facility called the CIR. Inside its sealed stainless-steel chamber, scientists can set exact gas mixtures and pressures while triple containment protects the crew.',
      },
      {
        stepNumber: '02',
        heading: 'Cameras That See Invisible Chemistry',
        body: 'Because microgravity flames can be very dim or nearly invisible (like cool flames), the chamber is surrounded by ultraviolet and infrared radiometers, high-speed color cameras, and laser soot sensors.',
      },
      {
        stepNumber: '03',
        heading: 'Uncrewed Cargo Ships for Large-Scale Tests',
        body: 'To test meter-long fabrics without any risk to astronauts, NASA’s Saffire I–VI missions used uncrewed Northrop Grumman Cygnus cargo vehicles after they undocked from the ISS, transmitting data back to Earth before atmospheric reentry.',
      },
    ],
    interactiveParameterLabel: 'Explore Research Materials',
    interactivePrompt:
      'Test three spacecraft-relevant solid fuels studied in ISS experiments to compare their modeled flame temperatures and burning rates:',
    options: [
      {
        id: 'lab-cellulose',
        label: 'Cellulose / Cotton',
        sublabel: 'Sibal Cloth Reference',
        badge: 'Saffire & BASS Fuel',
        simParams: {
          fuel: 'cellulose',
          gravity: 0.001,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.05,
        },
        whatChangedHeadline: 'Steady Char-Forming Cellulose Burn',
        whatChangedExplanation:
          'Cellulose (cotton fabric) pyrolyzes at moderate temperatures and leaves a porous char layer while maintaining a stable diffusion flame.',
        whyItChangedScience:
          'Cotton-fiberglass blends (Sibal) serve as NASA’s standard reference material for solid flame spread benchmarks.',
      },
      {
        id: 'lab-pmma',
        label: 'Acrylic (PMMA)',
        sublabel: 'Cast Polymer Rod / Sphere',
        badge: 'BASS-II & SLICE Fuel',
        simParams: {
          fuel: 'pmma',
          gravity: 0.001,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.05,
        },
        whatChangedHeadline: 'High-Energy Non-Charring Polymer Melt',
        whatChangedExplanation:
          'PMMA melts and vaporizes cleanly into monomer gas without leaving char, burning longer due to its higher density and thermal inertia.',
        whyItChangedScience:
          'Because PMMA vaporizes predictably without ash, scientists use it to validate mathematical combustion models.',
      },
      {
        id: 'lab-pe',
        label: 'Polyethylene',
        sublabel: 'Wire Insulation Polymer',
        badge: 'Spacecraft Cable Test',
        simParams: {
          fuel: 'polyethylene',
          gravity: 0.001,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.05,
        },
        whatChangedHeadline: 'Hot, Soot-Rich Hydrocarbon Flame',
        whatChangedExplanation:
          'Polyethylene has a high heat of combustion and produces glowing yellow soot shells inside the blue microgravity reaction zone.',
        whyItChangedScience:
          'Testing wire-insulation polymers helps engineers prevent electrical overload fires inside avionics bays.',
      },
    ],
    takeaway:
      'Controlled orbital chambers let scientists isolate pure combustion physics without Earth’s buoyant turbulence — improving both spacecraft safety and cleaner combustion engines on Earth.',
    nasaResearch: {
      investigationCode: 'ACME & CIR',
      investigationTitle: 'Advanced Combustion via Microgravity Experiments',
      platform: 'ISS Combustion Integrated Rack (CIR)',
      summary:
        'A suite of six independent microgravity flame investigations operated remotely from NASA Glenn Research Center’s Telescience Support Center.',
      researchHref: '/research',
    },
  },
  {
    id: 'keeping-astronauts-safe',
    worldNumber: 'WORLD 05',
    title: 'Keeping Astronauts Safe',
    subtitle: 'Spacecraft Fire Prevention, Detection & Suppression',
    scientificSubject: 'Spacecraft Fire Safety Engineering',
    compellingQuestion: 'HOW DO ASTRONAUTS PREVENT AND DETECT FIRE IN SPACE?',
    visualIntroLead:
      'Aboard a spacecraft, you cannot step outside or wait for a fire truck. Every material, wire, smoke sensor, and extinguisher is engineered as part of a layered defense system.',
    imagePath: '/images/kids/world-5-astronaut-safety.png',
    imageAlt:
      '3D illustration of a spacecraft interior with laser smoke detection beams and an astronaut monitoring safety systems',
    theme: {
      accent: '#f43f5e',
      accentSoft: '#ffe4e6',
      badgeBg: '#fff1f2',
      badgeText: '#be123c',
      darkSurface: '#180b1e',
      lightSurface: '#fff8f9',
      border: '#fda4af',
    },
    learningQuestions: [
      'How can astronauts detect fire in microgravity?',
      'Why is fire prevention the first line of defense?',
      'How do scientists improve spacecraft safety for Moon and Mars missions?',
    ],
    storySteps: [
      {
        stepNumber: '01',
        heading: 'Prevention First: Strict Material Screening',
        body: 'Under NASA-STD-6001B, every fabric, panel, Velcro strip, and cable insulation must pass upward flame-propagation tests before it is allowed aboard a crewed spacecraft.',
      },
      {
        stepNumber: '02',
        heading: 'Detecting Microgravity Smoke (SAME)',
        body: 'Because smoke does not rise to the ceiling in zero gravity, smoke travels along ventilation streams. Worse, extra time inside a slow microgravity flame lets smoke particles clump into larger chains — requiring laser-scattering smoke detectors placed inside air return ducts.',
      },
      {
        stepNumber: '03',
        heading: 'Three-Step Orbital Suppression',
        body: 'If an alarm sounds, the spacecraft cuts power to the affected rack and turns off cabin ventilation fans to stop feeding oxygen to the fire, while crew members deploy portable CO₂ or fine-water-mist extinguishers.',
      },
    ],
    interactiveParameterLabel: 'Explore Fire Suppression Steps',
    interactivePrompt:
      'Simulate how a spacecraft emergency response suppresses an active microgravity fire by reducing airflow and oxygen availability:',
    options: [
      {
        id: 'safety-active',
        label: '1. Ventilated Cabin Fire',
        sublabel: '21% O₂ · 0.15 m/s Fan Flow',
        badge: 'Active Hazard',
        simParams: {
          fuel: 'paper',
          gravity: 0.001,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.15,
        },
        whatChangedHeadline: 'Sustained Flame Fed by Cabin Ventilation',
        whatChangedExplanation:
          'Active ventilation fans continuously supply fresh oxygen to the burning sample, sustaining a hot reaction zone.',
        whyItChangedScience:
          'Forced convective oxygen transport prevents the accumulation of self-extinguishing combustion products.',
      },
      {
        id: 'safety-fans-off',
        label: '2. Shut Off Cabin Fans',
        sublabel: '21% O₂ · 0.00 m/s Still Air',
        badge: 'Ventilation Cut',
        simParams: {
          fuel: 'paper',
          gravity: 0.001,
          oxygenPercent: 21,
          pressure: 1.0,
          airflowVelocity: 0.0,
        },
        whatChangedHeadline: 'Heat Release Drops as Airflow Stops',
        whatChangedExplanation:
          'Shutting off the ventilation fans immediately slows oxidizer delivery, shrinking the flame and reducing heat output.',
        whyItChangedScience:
          'Removing forced flow forces the flame back into a slower, diffusion-limited regime.',
      },
      {
        id: 'safety-suppress',
        label: '3. Deploy Suppressant',
        sublabel: '15% O₂ · Local CO₂ / Inerting',
        badge: 'Extinguished ✓',
        simParams: {
          fuel: 'paper',
          gravity: 0.001,
          oxygenPercent: 15,
          pressure: 1.0,
          airflowVelocity: 0.0,
        },
        whatChangedHeadline: 'Below Limiting Oxygen Index — Flame Extinguished',
        whatChangedExplanation:
          'When inert gas dilutions drop local oxygen to 15% in still air, heat generation falls below radiative loss and the flame extinguishes!',
        whyItChangedScience:
          'Below the microgravity Limiting Oxygen Index (LOI), chemical heat release cannot sustain pyrolysis.',
      },
    ],
    takeaway:
      'Spacecraft fire safety combines fire-resistant materials, ventilation-duct smoke sensors (tested in NASA’s SAME experiment), and rapid fan + power shutoffs.',
    nasaResearch: {
      investigationCode: 'SAME & SAME-R',
      investigationTitle: 'Smoke Aerosol Measurement Experiment',
      platform: 'ISS Microgravity Science Glovebox',
      summary:
        'Investigated how microgravity alters smoke particle size distributions so engineers could calibrate smoke detectors for the ISS, Orion, and Lunar Gateway.',
      researchHref: '/research',
    },
  },
]
