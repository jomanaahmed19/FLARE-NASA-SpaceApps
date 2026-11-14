# FLARE — Permanent Project Instructions & Impeccable Enforcement

These are permanent instructions for all work on **FLARE** (*Fire & Life-Safety Analysis and Risk Explorer*, developed by **Team WUNDERBAO**). They apply to every development session, feature, page, component, refactor, and redesign.

---

## 1. Mandatory Impeccable Skill (`pbakaus/impeccable`)

The official **Impeccable** skill (`https://github.com/pbakaus/impeccable`) is a mandatory part of FLARE's frontend development workflow:

- Always check that Impeccable is installed and available (`.agents/skills/impeccable/SKILL.md` and/or `.gemini/skills/impeccable/SKILL.md`, plus `PRODUCT.md` and `DESIGN.md`) before frontend design work.
- Read and follow its actual `SKILL.md`, reference playbooks (`reference/audit.md`, `reference/critique.md`, `reference/polish.md`, `reference/typeset.md`, `reference/layout.md`, `reference/harden.md`, `reference/adapt.md`, `reference/clarify.md`, `reference/optimize.md`), and project context (`PRODUCT.md`, `DESIGN.md`).
- Use its relevant commands and playbooks when designing, implementing, reviewing, or improving frontend interfaces.
- Never claim to have used a command unless it was actually executed or its playbook was rigorously applied and verified.
- Never invent commands or assume every command exists. Follow the installed version's actual documentation.
- Use Impeccable to review existing work, not only newly created screens.
- Re-run appropriate audits and critiques after significant frontend changes.
- Visually inspect the actual running application and fix the issues found.

---

## 2. Apply Across the Entire FLARE Product

Impeccable and these quality standards must inform the design and UX of:

- **Welcome & Experience Selection** (`/` and `/select`)
- **Scientific Experience & Simulation Lab** (`/science`)
- **3D Scientific Workspace** (`CombustionScene.tsx`, `VisualizationPanel.tsx`, `SensorReadouts.tsx`, `ResultsPanel.tsx`)
- **Kids Experience** (`/kids` — `KidsHome`, `KidsExperiment`, `SpaceFlame`, `KidsLearnCards`, `KidsAskSparky`)
- **NASA Research & Experiment Explorer** (`/research`)
- **Research Library** (`/library` and unified tab)
- **Scientific Insights** (`/insights` and unified tab)
- **Scientific Comparison & Data Explorer** (`/compare`)
- **FLARE AI Assistant** (`/api/ai-chat`, `AIAssistant.tsx`, `KidsAskSparky.tsx`)
- **Navigation and shared components** (`FlareLogo`, `StarField`, headers, footers, modals, tabs)
- **Forms, dialogs, charts, controls, loading and error states**
- **Responsive layouts and accessibility**

Do not allow new features to introduce inconsistent visual styles or generic AI-generated UI patterns ("AI slop").

---

## 3. Permanent Design Quality Standards

Every new or modified interface must be:

- **Visually distinctive and consistent with FLARE's brand**: Aerospace dark laboratory aesthetic (`#030712` / `#070d19` obsidian-slate surfaces, technical amber/flame accents `#f97316` / `#fbbf24`, telemetry cyan `#06b6d4` / `#38bdf8`) for the Scientific Experience; warm, high-clarity, approachable cosmic explorer aesthetic for the Kids Experience.
- **Scientifically appropriate**: High data-ink ratio, monospace numeric telemetry (`tabular-nums`), explicit units on every axis and readout (`K`, `mm`, `mm²/s`, `W`, `%`, `atm`, `m/s`, `m/s²`).
- **Intuitive and easy to navigate**: Clear active route indicators, bidirectional return paths, zero dead routes or broken buttons.
- **Responsive**: Usable across desktop workstations (`>=1024px`), tablets (`768px–1023px`), and mobile viewports (`<768px`) without horizontal overflow or crushed 3D viewports.
- **Accessible**: Semantic landmarks, keyboard focus visibility (`focus-visible`), ARIA labels on icon/slider controls, sufficient contrast ratios, and `prefers-reduced-motion` respect.
- **Carefully typeset**: Clear hierarchy (`font-display` for headings, `font-sans` for readable body copy with 60–75ch measure, `font-mono` with `tabular-nums` for parameters, equations, and telemetry).
- **Performance-conscious**: Lazy-loaded WebGL/Three.js canvas where appropriate, stable React references, no layout thrashing.
- **Designed around the user's actual workflow**: Seamless handoffs between NASA Research (`/research`), Simulation Lab (`/science`), Scientific Comparison (`/compare`), and AI Assistant (`/api/ai-chat`).

Avoid generic dashboard patterns, excessive nested cards, unnecessary purple/indigo AI gradients, random decorative animations without purpose, and inconsistent spacing or typography.

---

## 4. AI, ML & Data Science Standards

Impeccable is mandatory for frontend design, but it must **never** replace engineering and scientific validation.

For every AI, ML, Data Science, or simulation feature:

- **Use real available data whenever possible**: Prioritize verified NASA Physical Sciences Informatics (PSI) metadata, NTRS technical reports, and published microgravity combustion literature.
- **Preserve source provenance**: Every NASA experiment, resource, and insight must carry its official investigation title, platform, and verified URL (`psi.nasa.gov`, `ntrs.nasa.gov`, `science.nasa.gov`, `nasa.gov`).
- **Validate inputs and outputs**: Clamp and validate all physical parameters (Oxygen `15–100%`, Pressure `0.1–1.5 atm`, Gravity `0.0–9.81 m/s²`, Airflow `0.0–0.5 m/s`, Diameter `3–10 mm`, Duration `10–120 s`).
- **Explain model assumptions**: Explicitly state that the interactive simulation uses a simplified 0D/1D **D² Law analytical droplet/solid-sphere model** (`D²(t) = D₀² - K·t`) with empirical convective and oxygen-mole-fraction corrections — never claim it is a full 3D Navier-Stokes CFD solver.
- **Evaluate ML/AI models honestly**: Clearly badge whether the AI Assistant is running with a live LLM (`GEMINI_API_KEY`) or in deterministic `DEMO MODE`.
- **Never fabricate training results, metrics, predictions, or NASA integrations**: Never claim all NASA investigations have downloadable raw datasets when some are cataloged metadata/publications only. Never present **Saffire I–VI** (conducted on uncrewed Cygnus cargo vehicles after ISS departure) as measurements inside an occupied spacecraft cabin.
- **Clearly distinguish measured data, derived calculations, model outputs, and demonstrations**: Use explicit provenance badges (`Measured`, `Model Est.`, `Literature`, `Educational Model`, `Demo Mode`).
- **Make scientific uncertainty and limitations visible**: Always include model limitation disclosures in simulation panels, comparisons, and AI explanations.

Every visualization must represent meaningful data or explicitly labeled illustrative content.

---

## 5. Continuous Quality Enforcement Checklist

Before considering any feature complete:

1. Check its scientific and functional correctness.
2. Review its UX and visual design using Impeccable (`audit`, `critique`, `polish`, `typeset`, `layout`, `harden`, `adapt`).
3. Check responsive behavior and accessibility.
4. Run relevant tests and build verification.
5. Inspect the actual rendered interface in the browser.
6. Fix all identified issues before finishing.
7. Report what was genuinely tested and completed.

Do not treat a successful build alone as proof of product quality.

---

## 6. Preserve Project Integrity

- Always work within the existing FLARE architecture (`src/app`, `src/components`, `src/lib`, `src/data`, `src/hooks`).
- Preserve working features, URL parameter handoffs, and integrations.
- Avoid unnecessary rewrites.
- Do not remove functionality to simplify implementation.
- Make changes incrementally and verify them.
- Keep documentation (`PRODUCT.md`, `DESIGN.md`, `GEMINI.md`, `AGENTS.md`, `FLARE-QA-Report.md`) updated.

