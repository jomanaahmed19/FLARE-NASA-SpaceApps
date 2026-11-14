# Impeccable Reference — `layout` Playbook

## Spatial Rhythm & Grid Architecture
- **Workstation Grids (`/science`)**: Fixed-width telemetry sidebars (`w-72` left, `w-60` right) on `lg+` screens with a flexible central viewport (`flex-1 min-w-0`).
- **Research & Comparison Views (`/research`, `/compare`, `/library`, `/insights`)**: Centered `max-w-[1440px] mx-auto px-4 sm:px-6` container with consistent `gap-4` / `gap-6` rhythm.
- **Overflow Protection**: Always place `min-w-0` on flex/grid children containing dynamic text or charts.

