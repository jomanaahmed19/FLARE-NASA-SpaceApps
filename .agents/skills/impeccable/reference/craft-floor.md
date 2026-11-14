# Impeccable Reference — `harden`, `adapt`, `clarify`, `optimize` & `craft-floor`

## `harden` — Edge Cases & Input Validation
- Clamp all numerical inputs and URL query parameters (`fuel`, `gravity`, `o2`, `pressure`, `airflow`) to validated physical ranges.
- Display explicit fallback badges when NASA experimental datasets are unavailable (`N/A` or `Literature Only`) or when `/api/ai-chat` runs in deterministic `DEMO MODE`.

## `adapt` — Responsive Breakpoints
- `< 768px` (Mobile) and `768px–1023px` (Tablet): Use the 3-pane switcher in `/science`, single-column stacked cards in `/research` and `/compare`, and touch-friendly controls in `/kids`.
- `>= 1024px` (Desktop): Full multi-column aerospace workstation layout.

## `clarify` — Copy & Attribution
- Distinguish **Measured (NASA PSI/NTRS)**, **Model Estimate (D² Law)**, **Literature**, and **Educational Model** on every screen.
- Explicitly note that **Saffire I–VI** operated on **uncrewed Cygnus cargo spacecraft after ISS departure**.

## `optimize` — Performance
- Lazy-load WebGL/Three.js scenes (`dynamic(..., { ssr: false })`) and memoize trajectory arrays.

