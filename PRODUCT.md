# PRODUCT.md — FLARE Product Context (Impeccable Context)

## Product Identity
- **Application Name:** FLARE (*Fire & Life-Safety Analysis and Risk Explorer*)
- **Tagline:** *"Understand Fire. Explore Space. Discover Science."*
- **Creator / Team Name:** Team WUNDERBAO (2026 NASA Space Apps Challenge)
  - *Strict Branding Rule:* **FLARE** is the application name; **WUNDERBAO** is solely the team name. Never swap or conflate them.

## Purpose & Core Value Proposition
FLARE is an interactive aerospace combustion science, spacecraft fire safety, and educational discovery platform that bridges real NASA microgravity combustion investigations with an analytical 3D simulation workspace and an accessible Kids Experience.

## Target Audiences & Dual Experience Architecture
FLARE serves two distinct audiences under one cohesive identity:

1. **01 — Scientific Experience (`/science`, `/research`, `/compare`, `/library`, `/insights`)**
   - **Audience:** Aerospace engineers, combustion researchers, university students, science educators, and NASA Space Apps judges.
   - **Primary Workflows:**
     - Configure and run analytical **D² Law** combustion simulations across gravity regimes (ISS Microgravity $0.0\text{ m/s}^2$, Lunar $1.62\text{ m/s}^2$, Martian $3.72\text{ m/s}^2$, Earth $9.81\text{ m/s}^2$), oxygen concentrations ($15\text{–}100\%$), ambient pressures ($0.1\text{–}1.5\text{ atm}$), and forced ventilation airflows ($0.0\text{–}0.5\text{ m/s}$).
     - Inspect 5-layer 3D combustion chamber visualizations (`Structure`, `Temperature`, `Airflow`, `Oxygen`, `Soot`) synchronized with real-time telemetry (`D²`, `HRR`, `T_flame`, `O₂`).
     - Explore 16 official NASA microgravity combustion investigations (**Saffire I–VI**, **BASS**, **BASS-II**, **FLEX**, **FLEX-2**, **SAME**, **SAME-R**, **ACME**, **CFI**, **SPICE**, **SLICE**) with verified NASA PSI and NTRS links.
     - Compare **NASA vs. NASA**, **Simulation vs. Simulation**, and **NASA vs. Simulation** scenarios side by side with explicit compatibility ratings (`Direct`, `Cautious`, `Limited`, `Incompatible`) and data provenance badges.
     - Query the contextual **FLARE AI Scientific Assistant** for structured 5-part analyses (*What We Observe*, *Scientific Explanation*, *Supporting Evidence*, *Model Limitations*, *Suggested Exploration*).

2. **02 — FLARE Kids Experience (`/kids`)**
   - **Audience:** Young learners (ages 7–13), K–8 classrooms, and families exploring space science.
   - **Primary Workflows:**
     - Guided exploration with **Sparky**, the friendly space flame companion.
     - Interactive 2D `SpaceFlame` experiment comparing **On Earth** (tall teardrop flame via buoyancy) vs. **In Space** (round glowing ball via diffusion), Oxygen levels (*Less*, *Normal*, *More*), Air movement (*Still Air* vs. *Moving Air*), and everyday materials (*Cloth*, *Paper*, *Plastic*).
     - 5 illustrated Learning Cards and safe, age-appropriate Q&A in **Ask Sparky**.

## Non-Negotiable Scientific & Engineering Constraints
- **Model Honesty:** The simulation engine (`src/lib/simulation/combustionModel.ts`) implements a simplified 0D/1D **D² Law analytical droplet/solid-sphere equivalent model** ($D^2(t) = D_0^2 - K_{\text{eff}}\cdot t$) with empirical Sherwood/Nusselt ventilation and oxygen-mole-fraction corrections. Never present model estimates as 3D Navier-Stokes CFD outputs or raw spacecraft telemetry.
- **Saffire Attribution:** **Saffire I–VI** experiments were conducted aboard **uncrewed Northrop Grumman Cygnus cargo spacecraft** after departing the ISS prior to destructive atmospheric reentry. Never present them as measurements inside an occupied ISS habitat.
- **Dataset Transparency:** Only claim downloadable datasets where verified in NASA PSI (`psi.nasa.gov`).
- **Zero-Key Demo Operation:** Every feature (including `/api/ai-chat` in clearly badged deterministic `DEMO MODE`) must operate reliably out of the box without requiring external API keys.

