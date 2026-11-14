# Impeccable Reference — `audit` Playbook

Use this playbook to execute a systematic technical, accessibility, responsive, and anti-pattern audit across any FLARE screen or component.

## 1. Accessibility (a11y) & Semantics
- [ ] All interactive controls (`<button>`, `<input>`, `<select>`, custom tabs) are keyboard reachable (`Tab` / `Shift+Tab`).
- [ ] Visible focus ring (`focus-visible:outline-none focus-visible:ring-2`) is present on interactive elements.
- [ ] Icon-only buttons and range inputs (`<input type="range">`) include descriptive `aria-label` or `title` attributes.
- [ ] Heading levels (`h1` -> `h2` -> `h3`) follow a logical hierarchy without skipping levels.
- [ ] Color is never the sole indicator of scientific status; pair colors with badges (`Measured`, `Model Est.`, `Literature`, `Incompatible`).

## 2. Typography & Numeric Discipline
- [ ] All live sensor readouts, slider values, timers, and comparison table cells use `font-mono tabular-nums` so layout width never jitters.
- [ ] Every numeric parameter displays its physical unit (`K`, `mm`, `mm²/s`, `W`, `%`, `atm`, `m/s`, `m/s²`).
- [ ] Long prose explanations are constrained to a readable measure (`max-w-2xl` / `60–72ch`).

## 3. Responsive & Layout Stability
- [ ] Zero unintended horizontal page scrollbars at `375px` (mobile), `768px` (tablet), and `1440px` (desktop).
- [ ] 3D combustion viewport (`CombustionScene.tsx`) maintains usable aspect ratio and height on all screen sizes via the mobile/tablet pane switcher.
- [ ] Flex/Grid children with variable-length text include `min-w-0` so long scientific investigation names wrap or truncate cleanly without breaking grid columns.

## 4. Scientific & Data Provenance Integrity
- [ ] Every simulation output is explicitly labeled as a **D² Law Model Estimate**.
- [ ] Every Saffire I–VI reference states that the experiment took place on an **uncrewed Cygnus cargo vehicle after ISS departure**.
- [ ] External NASA links (`psi.nasa.gov`, `ntrs.nasa.gov`, `science.nasa.gov`, `nasa.gov`) use `target="_blank" rel="noopener noreferrer"`.
- [ ] AI Assistant displays `DEMO MODE` vs. `LIVE AI` transparently.

