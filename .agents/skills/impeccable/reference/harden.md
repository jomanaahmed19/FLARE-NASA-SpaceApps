# Impeccable Reference — `harden` Playbook

- Clamp all numeric inputs and URL parameters (`fuel`, `gravity`, `o2`, `pressure`, `airflow`) to validated physical ranges.
- Handle missing NASA telemetry values explicitly with `N/A — Not Measured` or `Literature Reference`.
- Ensure `/api/ai-chat` operates cleanly in deterministic `DEMO MODE` when `GEMINI_API_KEY` is not set.
- Ensure keyboard focus (`focus-visible`) and ARIA labels are present on all interactive controls.

