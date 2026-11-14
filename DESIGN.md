# DESIGN.md — FLARE Dual-Universe Design System & Impeccable Specification

FLARE comprises **two intentionally distinct visual universes** united by one scientific engine, shared NASA provenance, and the FLARE brand identity:

1. **FLARE Scientific Experience (`/`, `/science`, `/research`, `/compare`, `/library`, `/insights`)** — *Cinematic Luxury Editorial + Orbital Research Instrumentation*
2. **FLARE Kids — The Little Science Universe (`/kids`)** — *World-Class Interactive Science Museum + Tactile 3D Editorial Storytelling*

They must **never** look like two color-swapped versions of the same dashboard.

---

## PART A — SCIENTIFIC EXPERIENCE DESIGN SYSTEM

### 1. Art Direction & Visual References
- **Reference 1 (Mars Planetary Typography)**: Monumental display typography (`F L [SPHERE] R E`) integrated directly with a central 3D/interactive microgravity combustion sphere and orbital diagnostic rings.
- **Reference 2 (Timeless Luxury Editorial)**: Deep monochromatic obsidian-black canvas (`#03050a`), high-contrast warm white display type (`#f8fafc`), precision corner metadata blocks (`// 01`, `// 02`), and generous editorial negative space.
- **Reference 3 (Deep-Space Exploration Horizons)**: Midnight-navy atmospheric horizon illumination (`#071022`), structured glassmorphic telemetry bars, and spherical regime orbs.

### 2. Scientific Color Tokens
- **Primary Canvas**: `#03050a` (Obsidian Black) & `#060a14` (Deep Charcoal Navy)
- **Elevated Instrument Panels**: `rgba(9, 14, 26, 0.84)` with `1px solid rgba(255, 255, 255, 0.08)` hairline borders
- **Primary Identity Accent**: Controlled Amber/Flame (`#f97316` / `#fb923c` / `#f59e0b`)
- **Critical Combustion / Extinction State**: Deep Crimson (`#ef4444`)
- **Scientific Telemetry & Microgravity Diffusion**: Restrained Cyan (`#06b6d4` / `#38bdf8`)
- **Typography Colors**: Warm White (`#f8fafc`) for headlines/values, Muted Slate (`#94a3b8`) for body copy, Technical Gray (`#64748b`) for metadata

---

## PART B — FLARE KIDS: THE LITTLE SCIENCE UNIVERSE (`/kids`)

### 1. Diagnosis of Previous Weaknesses (`impeccable critique`)
- **Rejected Anti-Patterns**:
  1. Single flat pastel background across the entire page with decorative CSS circles.
  2. Repetitive rows of identical rectangular cards (`grid-cols-3` and `grid-cols-5`) with emoji icons instead of art-directed 3D scientific compositions.
  3. Flat 2D clip-art SVG badges rather than volumetric, richly lit 3D scientific environments.
  4. Lack of alternating light/dark architectural sections and editorial rhythm.

### 2. New Creative Vision & Reference Synthesis ("Orbit Toys" Architectural Stage + Science Museum Publication)
- **Hero Architecture**:
  - **Outer Atmospheric Stage**: Deep Cosmic Navy & Ocean Blue architectural backdrop (`#071126` -> `#0c1d3d`) with subtle volumetric rim lighting and a reflective studio floor horizon.
  - **Split Asymmetric Hero Stage**:
    - **Left Editorial Color-Block Panel**: Warm Coral-Orange (`#ff6b4a` -> `#ff7e5f`) & Soft Golden Yellow (`#fde047`) typographic monument featuring stacked, high-contrast display type: **`BIG QUESTIONS. AMAZING SCIENCE.`**, concise supporting copy, and a dark cosmic-navy pill control bar (`05 WORLDS · LIVE D² ENGINE · ISS SCIENCE`) with a bright golden circular arrow CTA (`EXPLORE THE SCIENCE →`).
    - **Right 3D Scientific Stage**: A richly rendered, volumetric 3D microgravity combustion chamber & translucent golden-visor astronaut observatory scene coupled with live interactive gravity/oxygen switching.
- **Alternating Section Rhythm (Intentional Dark & Light Environments)**:
  - **Section 1 (Hero Stage)**: Deep Cosmic Navy (`#071126`) surrounding the Warm Coral (`#ff6b4a`) & Volumetric 3D Chamber stage.
  - **Section 2 (Editorial Introduction & Interactive Micro-Comparison)**: Soft Warm Alabaster/White (`#faf8f5`) with Deep Cosmic Navy (`#09152b`) typography and an interactive side-by-side Earth vs. Microgravity live physics comparison strip.
  - **Section 3 (The 5 Educational Worlds — Asymmetric Bento & Editorial Discovery)**: Light Atmospheric Sky (`#f0f6fc`) transitioning to Deep Ocean Blue (`#0a1931`) for World 4 & World 5 feature showcases — **zero identical 5-card rows**:
    - **World 01 — Meet the Flame**: Full-width 12-column asymmetric split feature showcase (7-col volumetric 3D transparent chamber artwork + 5-col editorial story).
    - **World 02 — The Oxygen Mystery** & **World 03 — The Invisible Wind**: Asymmetric 6-col + 6-col staggered editorial showcases with distinct image aspect ratios (`16:10` vs. `4:3`) and color-coded scientific identities (Atmospheric Cyan `#0ea5e9` vs. Mint/Teal `#14b8a6`).
    - **World 04 — Inside the Space Lab**: Immersive Deep Ocean Blue (`#09172e`) wide planetarium-style horizontal feature showcase (`5-col text + 7-col orbital laboratory Cutaway`).
    - **World 05 — Keeping Astronauts Safe**: Split architectural card pairing Warm Coral/Amber safety instrumentation with spacecraft detection systems.
  - **Section 4 (Interactive Science Sandbox & Ask Sparky Studio)**: Warm Cream (`#fffdf9`) & Deep Cosmic Observatory (`#08142c`) split studio.

### 3. Color Tokens (FLARE Kids)
- **Primary Environmental Colors**:
  - `kids-cosmos`: `#071126` (Deep Cosmic Navy)
  - `kids-ocean`: `#0c2348` (Deep Ocean Blue)
  - `kids-cyan`: `#0ea5e9` / `#38bdf8` (Atmospheric Cyan)
  - `kids-sky`: `#e8f3fc` (Soft Sky Blue)
- **Educational Subject Accents**:
  - **World 01 (Combustion & Flame)**: Flame Orange (`#f97316`) & Soft Golden Yellow (`#facc15`)
  - **World 02 (Oxygen & Molecules)**: Atmospheric Cyan (`#0284c7` / `#38bdf8`)
  - **World 03 (Airflow & Ventilation)**: Fresh Mint (`#0d9488` / `#2dd4bf`)
  - **World 04 (Inside the Space Lab)**: Cosmic Lavender/Indigo (`#6366f1` / `#a855f7`)
  - **World 05 (Astronaut Fire Safety)**: Warm Coral (`#ff6b4a` / `#f43f5e`)
- **Surface Backgrounds**:
  - `kids-warm-white`: `#faf8f5` (Soft Warm White)
  - `kids-light-blue`: `#f0f6fc` (Very Light Atmospheric Blue)
  - `kids-deep-scene`: `#08142c` (Deep Atmospheric Blue for immersive scenes)

### 4. Typography System (`typeset`)
- **Major Display Headlines**: `Space Grotesk` (`font-display` / `font-space-grotesk`), weight `700–900`, tight tracking (`-0.02em`), high-impact sentence or uppercase hierarchy.
- **Brand Wordmark & Monumental Hero Lockup Only**: `Orbitron` (`font-orbitron`) is strictly reserved for `<FlareLogo />` and the monumental `FL [SPHERE] RE` hero display. Never use `Orbitron` for small UI labels, buttons, sensor values, or table headers.
- **Primary UI & Body Copy**: `Plus Jakarta Sans` & `Inter` (`font-sans`), `12px–16px` (`text-xs` to `text-base`), `leading-relaxed`, high contrast (`#e2e8f0` / `#cbd5e1` on dark surfaces; `#0f172a` / `#334155` on light surfaces).
- **Telemetry, Equations & Badges**: `JetBrains Mono` (`font-mono`) with mandatory `tabular-nums`, explicit physical units (`K`, `mm`, `mm²`, `W`, `mg/s`, `vol%`, `atm`, `m/s`, `m/s²`).

---

## PART C — UNIFIED NAVIGATION & 6-STEP SCIENTIFIC SIMULATION LAB (`/science`)

### 1. Unified Scientific Header (`src/components/ui/ScientificHeader.tsx`)
- Shared across `/science`, `/research`, `/library`, `/insights`, and `/compare`.
- Displays `<FlareLogo size="xs" />`, an explicit **`Scientific Mode`** indicator pill, primary navigation tabs (`Simulation Lab`, `NASA Research`, `Research Library`, `Scientific Insights`, `Compare Data`), and a direct **Experience Switcher** (`✦ Kids Experience` -> `/kids` and `Switch Mode` -> `/select`).

### 2. Guided 6-Step Simulation Lab Workflow (`src/components/science/`)
1. **Step 1 — Choose a Reference Scenario**: 5 one-click orbital/planetary presets (*ISS Microgravity Baseline · FLEX-2*, *Earth 1g Buoyant Plume*, *Enriched O₂ Exploration Cabin · Saffire*, *Ventilated Microgravity Flow · BASS-II*, *Lunar Partial Gravity Habitat*) with inline scientific explanations.
2. **Step 2 — Fuel & Sample Geometry**: Solid polymer selector (`Cellulose/Cotton`, `PMMA Acrylic`, `Polyethylene`, `Thin Cellulose`) and visible `Sample Diameter (D₀)` slider (`3.0–10.0 mm`).
3. **Step 3 — Chamber Atmosphere & Gravity**: Logically grouped controls for `Gravitational Acceleration` (`0.001–9.81 m/s²`), `Oxygen Concentration` (`15–100 vol%`), `Ambient Pressure` (`0.1–1.5 atm`), `Forced Airflow Velocity` (`0.00–0.50 m/s`), and `Experiment Duration` (`10–120 s`), each with a 1-line physics explanation and safety/extinction warnings.
4. **Step 4 — Run the Simulation**: High-visibility primary CTA (`▶ Run Simulation`) plus timeline play/pause/reset controls and frame scrubber.
5. **Step 5 — Understand the Results**: Synchronized 3D chamber + calibrated CIR schematic underlay (`TC-1`, `IR-Plume`, `O₂-Probe`), 5 diagnostic layers (`Flame Structure`, `Temperature Field`, `Airflow & Convection`, `Oxygen Gradient`, `Soot Concentration`), human-readable `Chamber Telemetry` cards, and dual time-series charts (`D²(t) Burning Law` and `Heat Release & Flame Temp`).
6. **Step 6 — Explore Further**: Direct workflow handoff buttons in the results summary bar (`🤖 Explain Results with AI`, `⚖️ Compare Scenarios`, `🛸 NASA Experiments`).
