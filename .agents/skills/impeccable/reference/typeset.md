# Impeccable Reference — `typeset` Playbook

## Typographic Scale & Font Roles in FLARE
1. **Display (`font-display` / `Space Grotesk`)**:
   - Hero & Page Titles: `text-2xl` to `text-5xl font-bold tracking-tight`.
   - Section Headers: `text-xs font-mono uppercase tracking-[0.2em] text-slate-400`.
2. **Body (`font-sans` / `Inter`)**:
   - Scientific descriptions & NASA abstracts: `text-sm leading-relaxed text-slate-300 max-w-[68ch]`.
   - Kids explanations: `text-base leading-relaxed text-slate-200`.
3. **Telemetry & Equations (`font-mono` / `JetBrains Mono`)**:
   - Always apply `tabular-nums` (`font-variant-numeric: tabular-nums`) on sliders, timers, sensor readouts, and comparison tables.
   - Always include explicit physical units (`K`, `mm`, `mm²/s`, `W`, `%`, `atm`, `m/s`, `m/s²`).

