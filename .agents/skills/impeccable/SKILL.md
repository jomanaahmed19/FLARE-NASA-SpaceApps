---
name: impeccable
description: >-
  Impeccable frontend design vocabulary, anti-pattern guardrails, and review playbooks
  (https://github.com/pbakaus/impeccable). Mandatory for all FLARE frontend design,
  implementation, review, refactoring, typography, layout, responsiveness, and accessibility work.
---

# Impeccable — Frontend Design Vocabulary & Quality System (`pbakaus/impeccable`)

Impeccable is the mandatory frontend design and quality enforcement skill for **FLARE**. It prevents generic "AI slop" and guides planning, steering, reviewing, and finishing user interfaces using structured playbooks and persistent project context (`PRODUCT.md` and `DESIGN.md`).

---

## 1. Required Context Before Any Frontend Work

Before designing, modifying, or reviewing any UI in FLARE, always read:
1. [`PRODUCT.md`](../../../PRODUCT.md) — Target audiences (Scientific Experience vs. Kids Experience), workflows, and non-negotiable scientific/NASA constraints.
2. [`DESIGN.md`](../../../DESIGN.md) — Surface tokens, semantic palette, typography rules (`Space Grotesk`, `Inter`, `JetBrains Mono` with `tabular-nums`), responsive grid architecture, and anti-patterns.

---

## 2. Impeccable Command Vocabulary & Playbooks

Use the following Impeccable playbooks depending on the phase of frontend work:

### A. Plan & Set Up
- **`init`**: Initialize or update [`PRODUCT.md`](../../../PRODUCT.md) with audience, purpose, workflows, and scientific constraints.
- **`document`**: Scan and document design tokens, typography, color hierarchy, and layout patterns in [`DESIGN.md`](../../../DESIGN.md).
- **`shape`**: Plan information architecture, user flows, and responsive layout structure before writing UI code.
- **`extract`**: Extract repeated UI patterns into reusable, consistent components or tokens.

### B. Steer (Adjusting Tone, Hierarchy & Craft)
- **`bolder`**: Amplify timid or generic layouts with confident aerospace instrumentation hierarchy and purposeful contrast.
- **`quieter`**: Tone down visual noise, competing borders, excessive badges, or distracting background effects.
- **`distill`**: Strip away redundant containers, nested cards, or non-essential chrome so the primary scientific or educational workflow shines.
- **`colorize`**: Apply intentional, physically meaningful color coding (flame thermal amber/orange, microgravity diffusion cyan, provenance status badges).
- **`typeset`** ([`reference/typeset.md`](./reference/typeset.md)): Fix typographic scale, reading measure (`60–72ch`), line height, and mandatory `tabular-nums` on all numeric telemetry.
- **`layout`** ([`reference/layout.md`](./reference/layout.md)): Fix spatial rhythm, grid alignment, optical balance, and panel proportions.
- **`animate`**: Use purposeful, physics-informed transitions and respect `prefers-reduced-motion`.
- **`delight`**: Add subtle, high-craft instrumentation details (e.g., live coordinate crosshairs, crisp provenance pills, tactile Kids controls).

### C. Review (Evaluating UX & Technical Quality)
- **`critique`** ([`reference/critique.md`](./reference/critique.md)): Perform a heuristic UX and visual design review across hierarchy, clarity, brand fidelity, and scientific credibility.
- **`audit`** ([`reference/audit.md`](./reference/audit.md)): Run a technical quality, accessibility (a11y), responsive layout, keyboard navigation, and anti-pattern check.

### D. Finish (Polishing & Hardening for Production)
- **`polish`** ([`reference/polish.md`](./reference/polish.md)): Final pass on optical alignment, border consistency, hover/focus states, and micro-spacing before shipping.
- **`harden`** ([`reference/harden.md`](./reference/harden.md)): Verify edge cases, parameter clamping, empty states, fallback/demo states, long scientific titles, and ARIA attributes.
- **`clarify`** ([`reference/clarify.md`](./reference/clarify.md)): Rewrite unclear, robotic, or scientifically ambiguous UI copy and labels.
- **`adapt`** ([`reference/adapt.md`](./reference/adapt.md)): Ensure seamless responsive behavior across desktop workstations (`>=1024px`), tablets (`768–1023px`), and mobile (`<768px`).
- **`optimize`** ([`reference/optimize.md`](./reference/optimize.md)): Ensure smooth rendering, lazy WebGL loading, and zero layout shift.
- **`onboard`**: Ensure first-run welcome screens (`/`, `/select`) and empty states guide users immediately into productive exploration.

---

## 3. Mandatory Craft Floor (`reference/craft-floor.md`)

Every screen in FLARE must satisfy the Impeccable Craft Floor:
1. **No Generic AI Slop**: No random purple/pink gradients, unmotivated glowing orbs, or generic SaaS marketing cards.
2. **Tabular Numerics**: Every changing number, slider value, timer, and table cell must use `font-mono tabular-nums`.
3. **Explicit Scientific Provenance**: Every metric, chart, and insight must distinguish `Measured`, `Model Est.`, `Literature`, or `Educational Model`.
4. **Responsive Integrity**: No horizontal page overflow and no crushed 3D canvas on tablet/mobile viewports.
5. **Accessible Controls**: Semantic buttons/tabs, visible keyboard focus rings, and discernible labels.

