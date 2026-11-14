# Impeccable Reference — `polish`, `typeset`, `layout`, `harden`, `adapt`, `clarify`, `optimize`

## `typeset` — Typography & Numeric Precision
- Headings use `font-display` (`Space Grotesk`) with deliberate tracking.
- Body paragraphs use `font-sans` (`Inter`) with `leading-relaxed` and `60–72ch` line measure.
- Numeric telemetry, equations, coordinates, and sliders use `font-mono tabular-nums`.

## `layout` — Spatial Rhythm & Alignment
- Maintain consistent padding scales (`p-3`, `p-4`, `p-6`) and grid gaps (`gap-3`, `gap-4`, `gap-6`).
- Align control labels and numeric readouts along crisp vertical baselines.
- Use `min-w-0` on flex/grid containers holding long titles or URLs.

## `harden` — Edge Cases, Validation & Resilience
- Clamp all URL query parameters (`?fuel=&gravity=&o2=&pressure=&airflow=`) to safe physical bounds before running the simulation model.
- Handle missing/unavailable NASA dataset fields gracefully with explicit `N/A — Not Measured` or `Cataloged Metadata Only` states.
- Ensure `/api/ai-chat` never crashes when `GEMINI_API_KEY` is absent, falling back cleanly to deterministic `DEMO MODE`.

## `adapt` — Responsive Multi-Device Design
- Desktop (`>= 1024px`): Full multi-panel workstation layout.
- Tablet & Mobile (`< 1024px`): Segmented pane switcher in `/science`, stacked comparison selectors in `/compare`, and touch-friendly (`>= 44px`) controls in `/kids`.

## `clarify` — Precision Copywriting
- Replace vague labels with scientifically accurate terms (e.g., *"D² Law Analytical Model"* instead of *"CFD Simulation"*; *"Uncrewed Cygnus Cargo Spacecraft"* for Saffire).
- Keep Kids Experience copy encouraging, vivid, and jargon-free.

## `optimize` — Rendering & Performance
- Dynamically import heavy WebGL / Three.js components (`ssr: false`) with clean loading states.
- Memoize simulation output trajectories (`useMemo`) so UI interactions remain 60fps.

## `polish` — Final Pre-Ship Verification
- Check border hairlines (`border-white/[0.08]`), active tab indicators, hover transitions, and focus states across every route.

