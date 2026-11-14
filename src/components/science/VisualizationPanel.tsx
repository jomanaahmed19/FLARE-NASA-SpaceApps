'use client'

import type { VisualizationLayer, SimulationFrame } from '@/lib/simulation/types'

interface VisualizationPanelProps {
  activeLayer: VisualizationLayer
  onLayerChange: (layer: VisualizationLayer) => void
  currentFrame: SimulationFrame | null
  variant?: 'toolbar' | 'inspector'
}

export const DIAGNOSTIC_LAYERS: {
  id: VisualizationLayer
  icon: string
  name: string
  shortBadge: string
  description: string
  note: string
  legend: { from: string; to: string; labelFrom: string; labelTo: string }
}[] = [
  {
    id: 'structure',
    icon: '🔵',
    name: 'Flame Appearance',
    shortBadge: 'Optical',
    description: 'Outer blue diffusion shell and warm inner reaction core',
    note: 'In microgravity, flames form a calm, glowing sphere with a blue outer shell because hot air cannot rise. Under Earth gravity, buoyancy stretches the flame upward into a teardrop plume.',
    legend: { from: '#fef3c7', to: '#38bdf8', labelFrom: 'Inner Fuel Core', labelTo: 'Blue Diffusion Edge' },
  },
  {
    id: 'temperature',
    icon: '🌡',
    name: 'Temperature Map',
    shortBadge: 'Thermal',
    description: 'Thermal gradient from cool chamber gas (300 K) to peak reaction sheet',
    note: 'The hottest zone sits along the thin reaction boundary where fuel vapor meets oxygen. Raising oxygen concentration reduces nitrogen cooling and pushes flame temperatures above 2,100 K.',
    legend: { from: '#1d4ed8', to: '#fffdf0', labelFrom: '300 K (Cool)', labelTo: '2,200+ K (Hot)' },
  },
  {
    id: 'airflow',
    icon: '💨',
    name: 'Airflow & Diffusion',
    shortBadge: 'Transport',
    description: 'How oxygen travels toward the flame in space vs. on Earth',
    note: 'Without gravity-driven buoyancy, oxygen drifts toward the flame slowly from all directions (molecular diffusion) unless spacecraft ventilation gently pushes air across the sample.',
    legend: { from: '#1d4ed8', to: '#22d3ee', labelFrom: 'Slow Diffusion', labelTo: 'Active Flow' },
  },
  {
    id: 'oxygen',
    icon: '💧',
    name: 'Oxygen Zone',
    shortBadge: 'O₂ Halo',
    description: 'Oxygen-depleted zone (red) surrounded by fresh cabin oxygen (blue)',
    note: 'As the flame burns, it consumes nearby oxygen. In still 0g air, an oxygen-depleted halo forms around the sphere and slows the burning rate.',
    legend: { from: '#dc2626', to: '#2563eb', labelFrom: 'Depleted O₂', labelTo: 'Fresh Cabin O₂' },
  },
  {
    id: 'soot',
    icon: '🌫',
    name: 'Soot & Smoke',
    shortBadge: 'Particles',
    description: 'Glowing carbon particles that spacecraft smoke detectors track',
    note: 'Because gases move slowly in microgravity, carbon particles stay inside the hot zone longer and form larger soot aggregates—changing how spacecraft smoke alarms must be calibrated.',
    legend: { from: '#0f172a', to: '#f59e0b', labelFrom: 'Clean Gas', labelTo: 'Glowing Soot' },
  },
]

export default function VisualizationPanel({
  activeLayer,
  onLayerChange,
  variant = 'toolbar',
}: VisualizationPanelProps) {
  const active = DIAGNOSTIC_LAYERS.find((l) => l.id === activeLayer) ?? DIAGNOSTIC_LAYERS[0]

  if (variant === 'toolbar') {
    return (
      <div
        role="tablist"
        aria-label="Flame visualization view mode"
        className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#070d1b]/90 border border-slate-800/80 backdrop-blur-md"
      >
        {DIAGNOSTIC_LAYERS.map((layer) => {
          const isSelected = layer.id === activeLayer
          return (
            <button
              key={layer.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onLayerChange(layer.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500/20 text-white border border-cyan-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span>{layer.icon}</span>
              <span>{layer.name}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
      <p className="text-slate-300 leading-relaxed max-w-3xl">
        <strong className="text-white font-medium">{active.name}:</strong> {active.note}
      </p>

      <div className="shrink-0 flex items-center gap-3">
        <span className="text-xs text-slate-400">{active.legend.labelFrom}</span>
        <div
          className="w-24 h-2 rounded-full"
          style={{
            background: `linear-gradient(to right, ${active.legend.from}, ${active.legend.to})`,
          }}
        />
        <span className="text-xs text-slate-300">{active.legend.labelTo}</span>
      </div>
    </div>
  )
}
