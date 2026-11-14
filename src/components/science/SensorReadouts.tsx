'use client'

import type { SimulationFrame, SimulationStatus } from '@/lib/simulation/types'

interface SensorReadoutsProps {
  frame: SimulationFrame | null
  status: SimulationStatus
  burntFraction: number
  initialDiameter?: number
  variant?: 'essential' | 'detailed'
}

export default function SensorReadouts({
  frame,
  burntFraction,
  initialDiameter = 5.0,
  variant = 'essential',
}: SensorReadoutsProps) {
  const aspectRatio = frame ? frame.flameAspectRatio : 1.0
  const shapeLabel =
    frame?.status === 'extinguished'
      ? 'Extinguished'
      : aspectRatio < 1.12
      ? 'Spherical (0g)'
      : aspectRatio < 1.35
      ? 'Rounded Plume'
      : 'Rising Teardrop (1g)'

  if (variant === 'essential') {
    return (
      <div className="px-5 py-4 border-t border-slate-800/70 bg-[#060c18]/90 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
        <div>
          <span className="text-xs text-slate-400 block">Flame Geometry</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-base font-display font-bold text-white">{shapeLabel}</span>
            <span className="font-mono text-xs text-cyan-300 tabular-nums">
              {aspectRatio.toFixed(2)}:1
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 block">Flame Temperature</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-amber-300 tabular-nums">
              {frame ? frame.flameTemperature.toFixed(0) : '—'}
            </span>
            <span className="font-mono text-xs text-slate-400">
              K ({frame ? (frame.flameTemperature - 273.15).toFixed(0) : '—'} °C)
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 block">Heat Release Power</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-xl font-bold text-orange-400 tabular-nums">
              {frame ? frame.heatReleaseRate.toFixed(1) : '—'}
            </span>
            <span className="font-mono text-xs text-slate-400">
              W · {frame ? frame.flameRadius.toFixed(1) : '—'} mm radius
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Fuel Sphere Remaining</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {frame ? `${frame.sampleDiameter.toFixed(2)} mm` : `${initialDiameter.toFixed(1)} mm`}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800/90 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(4, (1 - Math.min(burntFraction, 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Detailed 6-sensor view for deeper inspection
  const metrics = [
    {
      label: 'Flame Temperature',
      value: frame ? frame.flameTemperature.toFixed(0) : '—',
      unit: 'K',
      color: '#fbbf24',
      desc: 'Peak reaction sheet temperature after radiative heat loss',
    },
    {
      label: 'Flame Radius',
      value: frame ? frame.flameRadius.toFixed(1) : '—',
      unit: 'mm',
      color: '#22d3ee',
      desc: 'Distance from the fuel center to the outer blue reaction zone',
    },
    {
      label: 'Near-Flame Oxygen',
      value: frame ? frame.o2NearFlame.toFixed(1) : '—',
      unit: 'vol%',
      color: '#38bdf8',
      desc: 'Local oxygen concentration remaining just outside the flame',
    },
    {
      label: 'Heat Release Rate',
      value: frame ? frame.heatReleaseRate.toFixed(2) : '—',
      unit: 'W',
      color: '#f97316',
      desc: 'Thermal power released by the burning polymer sphere',
    },
    {
      label: 'Fuel Burn Rate',
      value: frame ? frame.massLossRate.toFixed(2) : '—',
      unit: 'mg/s',
      color: '#fb923c',
      desc: 'Rate at which solid fuel vaporizes into flammable gas',
    },
    {
      label: 'Soot Concentration',
      value: frame ? frame.sootVolumeFraction.toFixed(1) : '—',
      unit: 'ppm',
      color: '#cbd5e1',
      desc: 'Unburned carbon particles formed inside the reaction shell',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="p-4 rounded-2xl bg-[#091224] border border-slate-800/80 flex flex-col justify-between"
        >
          <span className="text-sm font-medium text-slate-200">{m.label}</span>
          <div className="my-2 flex items-baseline gap-1.5">
            <span
              className="font-mono text-2xl font-bold tabular-nums"
              style={{ color: m.color }}
            >
              {m.value}
            </span>
            <span className="font-mono text-xs text-slate-400">{m.unit}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
        </div>
      ))}
    </div>
  )
}
