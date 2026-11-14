# FLARE — Fire & Life-Safety Analysis and Risk Explorer
### Developed by Team WUNDERBAO · NASA Space Apps Challenge 2026

An interactive microgravity combustion research, life-safety risk analysis, and educational platform bridging analytical physics (D² Law droplet/solid sphere models) with verified NASA Physical Sciences Informatics (PSI) microgravity investigations.

---

## 🚀 Quick Start (Running on Your Laptop)

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ (Node v26 verified compatible)
- **Package Manager**: npm (bundled with Node)

### 2. Launch the Development Server
Open your terminal in this directory (`C:\Users\joman\Flare`) and run:

```bash
npm install
npm run dev
```

Open your browser and navigate to:
👉 **[Open Flare](https://flare-nasa-spaceapps.vercel.app)**

---

## 📁 Project Directory Structure

```text
C:\Users\joman\Flare\
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Cinematic Editorial Hero & Platform Portal (/)
│   │   ├── select/page.tsx     # Experience Selector (/select)
│   │   ├── science/page.tsx    # Interactive 3D Simulation Lab (/science)
│   │   ├── research/page.tsx   # NASA PSI & NTRS Investigation Explorer (/research)
│   │   ├── compare/page.tsx    # Multi-Scenario Scientific Comparison Workbench (/compare)
│   │   ├── library/page.tsx    # NASA Research Publications Library (/library)
│   │   ├── insights/page.tsx   # Scientific Insights & Case Studies (/insights)
│   │   ├── kids/page.tsx       # FLARE Kids Science Universe (/kids)
│   │   ├── api/ai-chat/        # Context-Aware AI Agent Backend (Gemini REST + Demo Mode)
│   │   ├── layout.tsx          # Root Layout with A11y Provider & Zero-FOUC Init Script
│   │   └── globals.css         # Design Tokens, Accessibility Scales, & Tailwind Reset
│   ├── components/
│   │   ├── science/            # 3D Combustion Scene, Sensor Readouts, AI Assistant Drawer
│   │   ├── kids/               # Sparky Guide, SpaceFlame 2D Canvas, 5 Learning Worlds
│   │   ├── research/           # Investigation List, Detail Cards, PSI Deep Links
│   │   ├── compare/            # Multi-parameter Matrix, Comparison Cards, Radar/Bar Charts
│   │   └── ui/                 # StarField, HeroCombustionSphere, AccessibilityControlModal
│   ├── context/
│   │   └── AccessibilityContext.tsx # Centralized A11y state, BroadcastChannel sync, URL profiles
│   ├── data/
│   │   ├── nasaExperiments.ts  # 16 verified NASA PSI investigations (Saffire, BASS, FLEX...)
│   │   ├── researchLibrary.ts  # 12 NASA technical publications & historical case studies
│   │   ├── scientificInsights.ts # 6 experiment-simulation synthesis insights
│   │   └── kidsWorlds.ts       # 5 guided educational science worlds for young explorers
│   └── lib/
│       ├── simulation/         # Analytical D² Law Droplet & Solid Sphere Engine
│       └── ai/                 # Scientific Prompts, Child-Safe Prompts, Tool Definitions
├── public/                     # High-resolution 3D science art assets & NASA diagrams
├── PRODUCT.md                  # Comprehensive Product Specification & Architecture
├── DESIGN.md                   # Visual Identity, Surface Tokens, & Design System
├── FLARE-QA-Report.md          # Complete QA, Verification & Space Apps Challenge Audit
└── package.json                # Project dependencies & build scripts
```

---

## 🌟 Key Features

1. **Cinematic Scientific Simulation Lab (`/science`)**:
   - Interactive 3D WebGL combustion chamber powered by Three.js / React Three Fiber.
   - Realistic microgravity diffusion flame physics with 5 diagnostic optical overlays (Flame Appearance, Temperature Map, Gas Flow & Diffusion, Oxygen Concentration Zone, Soot & Smoke Production).
   - Real-time analytical D² Law physics engine (`D²(t) = D₀² - K·t`) tracking burning rate ($K$), flame temperature ($T_f$), aspect ratio ($AR$), and heat release rate ($HRR$).
   - 4 fuel materials (Cellulose, PMMA, Polyethylene, Paper) and 5 orbital gravity regimes (ISS $0.001g$, Moon $0.16g$, Mars $0.38g$, Earth $1.0g$, High Gravity $2.0g$).

2. **FLARE Kids Science Universe (`/kids`)**:
   - Museum-grade educational discovery space for young learners, families, and classrooms.
   - 5 interactive guided worlds answering fundamental space science questions without gamified gimmicks.
   - 2D interactive `SpaceFlame` sandbox with live gravity, oxygen, and ventilation toggles.
   - **Sparky the Space Flame**: An encouraging, child-safe AI science companion.

3. **Context-Aware FLARE AI Agent (`/api/ai-chat`)**:
   - Real multi-turn conversational AI with context retention across messages and active experiments.
   - Autonomous scientific tool selection: `run_combustion_simulation`, `compare_combustion_states`, `search_nasa_experiments`, `retrieve_research_library`.
   - Dual-persona architecture: Rigorous Senior Combustion Research Scientist in `/science`, and Sparky the Space Guide in `/kids`.
   - Live Gemini API support with seamless, deterministic offline fallback ("Demo Mode").

4. **Universal Accessibility System**:
   - Dynamic proportional text scaling (92% to 124%) via root CSS variables.
   - High Contrast Mode (7:1+), Reduced Motion mode (stops dynamic particle loops), and enhanced 3px technical gold focus rings.
   - Live cross-tab synchronization and portable device profile sharing (`?a11y=<base64>`).

---

## 🏆 NASA Space Apps Challenge 2026 Compliance
- **Public & Unrestricted**: No login, sign-up, or authentication required.
- **Data Provenance**: Grounded in official NASA PSI (`psi.nasa.gov`) and NTRS (`ntrs.nasa.gov`) databases.
- **Model Transparency**: Droplet/solid sphere analytical models clearly distinguished from full 3D CFD solvers.

