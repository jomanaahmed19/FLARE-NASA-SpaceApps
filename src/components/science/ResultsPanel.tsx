'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MATERIALS } from '@/lib/simulation/materialDatabase'
import SensorReadouts from './SensorReadouts'
import type {
  SimulationParams,
  SimulationFrame,
  SimulationResult,
  SimulationStatus,
} from '@/lib/simulation/types'
import type { LabMode, LabScenarioPreset } from './ControlPanel'

interface ResultsPanelProps {
  result: SimulationResult | null
  currentFrame: SimulationFrame | null
  currentTime: number
  params?: SimulationParams
  status?: SimulationStatus
  labMode?: LabMode
  activePreset?: LabScenarioPreset
  isPreview?: boolean
  onOpenAI?: () => void
  onApplyCounterfactual?: (patch: Partial<SimulationParams>, label: string) => void
}

function framesToPolyline(
  frames: SimulationFrame[],
  getValue: (f: SimulationFrame) => number,
  maxTime: number,
  maxVal: number,
  chartW: number,
  chartH: number,
  padL: number,
  padB: number
): string {
  if (!frames.length) return ''
  const w = chartW - padL - 16
  const h = chartH - padB - 16
  return frames
    .map((f) => {
      const x = padL + (f.time / maxTime) * w
      const y = chartH - padB - (getValue(f) / maxVal) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function framesToAreaPath(
  frames: SimulationFrame[],
  getValue: (f: SimulationFrame) => number,
  maxTime: number,
  maxVal: number,
  chartW: number,
  chartH: number,
  padL: number,
  padB: number
): string {
  if (!frames.length) return ''
  const w = chartW - padL - 16
  const h = chartH - padB - 16
  const baseY = (chartH - padB).toFixed(1)

  const points = frames.map((f) => {
    const x = padL + (f.time / maxTime) * w
    const y = chartH - padB - (getValue(f) / maxVal) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const firstX = (padL + (frames[0].time / maxTime) * w).toFixed(1)
  const lastX = (padL + (frames[frames.length - 1].time / maxTime) * w).toFixed(1)

  return `M${firstX},${baseY} L${points.join(' L')} L${lastX},${baseY} Z`
}

const W = 580
const H = 195
const PAD_L = 52
const PAD_B = 28

export default function ResultsPanel({
  result,
  currentFrame,
  currentTime,
  params: liveParams,
  status = 'idle',
  labMode = 'guided',
  activePreset,
  isPreview = false,
  onOpenAI,
  onApplyCounterfactual,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<'d2' | 'thermal' | 'sensors' | 'physics'>('d2')

  const frames = result?.frames ?? []
  const params = result?.params ?? liveParams
  const summary = result?.summary
  const maxTime = params?.duration ?? 60
  const material = params ? MATERIALS[params.fuel] : MATERIALS.cellulose

  const initialD = params?.sampleDiameter ?? 5.0
  const initialD2 = initialD * initialD
  const maxD2 = initialD2 * 1.08

  const dSquaredPolyline = frames.length
    ? framesToPolyline(frames, (f) => f.dSquared, maxTime, maxD2, W, H, PAD_L, PAD_B)
    : ''

  const startY = (H - PAD_B - (initialD2 / maxD2) * (H - PAD_B - 16)).toFixed(1)
  const idealD2Points = `${PAD_L},${startY} ${W - 16},${(H - PAD_B).toFixed(1)}`

  const maxHRR = frames.length
    ? Math.max(...frames.map((f) => f.heatReleaseRate)) * 1.15 || 2.5
    : 2.5
  const maxTemp = frames.length
    ? Math.max(...frames.map((f) => f.flameTemperature)) * 1.1 || 2000
    : 2000

  const hrrArea = frames.length
    ? framesToAreaPath(frames, (f) => f.heatReleaseRate, maxTime, maxHRR, W, H, PAD_L, PAD_B)
    : ''
  const hrrPolyline = frames.length
    ? framesToPolyline(frames, (f) => f.heatReleaseRate, maxTime, maxHRR, W, H, PAD_L, PAD_B)
    : ''
  const tempPolyline = frames.length
    ? framesToPolyline(frames, (f) => f.flameTemperature, maxTime, maxTemp, W, H, PAD_L, PAD_B)
    : ''

  const activeDuration =
    summary?.extinctionTime ?? summary?.burnoutTime ?? (frames[frames.length - 1]?.time || maxTime)
  const finalD2 = summary ? summary.finalDiameter * summary.finalDiameter : initialD2
  const effectiveK =
    activeDuration > 0 ? Math.max(0, (initialD2 - finalD2) / activeDuration) : 0.16

  const markerX = PAD_L + (currentTime / maxTime) * (W - PAD_L - 16)
  const axisStyle = { fontSize: 11, fill: '#94a3b8', fontFamily: 'var(--font-mono)' }

  function AxisLabels({ maxVal, unit }: { maxVal: number; unit: string }) {
    return (
      <>
        <text x={PAD_L - 8} y={H - PAD_B} textAnchor="end" style={axisStyle}>
          0
        </text>
        <text x={PAD_L - 8} y={(H - PAD_B + 16) / 2} textAnchor="end" style={axisStyle}>
          {(maxVal / 2).toFixed(0)}
        </text>
        <text x={PAD_L - 8} y={20} textAnchor="end" style={axisStyle}>
          {maxVal.toFixed(0)} {unit}
        </text>
        <text x={PAD_L} y={H - 8} style={axisStyle}>
          0 s
        </text>
        <text x={(PAD_L + W - 16) / 2} y={H - 8} textAnchor="middle" style={axisStyle}>
          {(maxTime / 2).toFixed(0)} s
        </text>
        <text x={W - 16} y={H - 8} textAnchor="end" style={axisStyle}>
          {maxTime} s
        </text>
      </>
    )
  }

  function GridLines() {
    return (
      <>
        {[0.25, 0.5, 0.75].map((t) => {
          const y = 16 + t * (H - PAD_B - 16)
          return (
            <line
              key={t}
              x1={PAD_L}
              y1={y}
              x2={W - 16}
              y2={y}
              stroke="#1e293b"
              strokeDasharray="3 4"
              strokeWidth={1}
            />
          )
        })}
      </>
    )
  }

  // Scientific Story Generation
  const isMicrogravity = (params?.gravity ?? 0.001) < 0.05
  const isPartialGravity = !isMicrogravity && (params?.gravity ?? 0) < 5.0
  const isHighO2 = (params?.oxygenPercent ?? 21) >= 26
  const isLowO2 = (params?.oxygenPercent ?? 21) < 17

  const whatHappenedTitle = summary?.extinguished
    ? `The flame self-extinguished after ${summary.extinctionTime?.toFixed(1) ?? '—'} seconds`
    : summary?.burnoutTime !== null && summary?.burnoutTime !== undefined
    ? `The fuel sphere burned completely in ${summary.burnoutTime.toFixed(1)} seconds`
    : isMicrogravity
    ? 'A calm, spherical diffusion flame formed around the fuel'
    : isPartialGravity
    ? 'A gentle partial-gravity plume formed around the fuel'
    : 'A rising teardrop plume formed and accelerated burning'

  const whatWasObservedText = summary?.extinguished
    ? isLowO2
      ? `At ${params?.oxygenPercent}% O₂, the atmosphere could not supply enough heat to keep ${material.name} vaporizing (minimum limit: ${material.minO2Microgravity}% O₂ in space).`
      : (params?.airflowVelocity ?? 0) > 0.32
      ? `Fast cabin airflow (${params?.airflowVelocity.toFixed(2)} m/s) pushed heat away from the fuel faster than chemical reaction could replace it, blowing the flame out.`
      : `Without gravity or airflow, combustion exhaust gathered around the fuel sphere and cooled the flame below its survival temperature.`
    : isMicrogravity
    ? `Because gravity is near zero (${params?.gravity} m/s²), heated gas has no weight difference to rise. Fresh oxygen drifts in equally from every direction, wrapping the ${material.name} sphere in a round blue flame (aspect ratio ${(currentFrame?.flameAspectRatio ?? 1.01).toFixed(2)}:1) that shrinks the fuel at K = ${effectiveK.toFixed(2)} mm²/s.`
    : `Under ${params?.gravity.toFixed(2)} m/s² gravity, hot gas rises upward and pulls cool, oxygen-rich air in from below. This stretches the flame vertically (aspect ratio ${(currentFrame?.flameAspectRatio ?? 1.6).toFixed(2)}:1) and burns the fuel sphere at K = ${effectiveK.toFixed(2)} mm²/s.`

  const whyItMattersText = isHighO2
    ? `Spacecraft exploration habitats often use enriched oxygen (such as 34% O₂ at reduced pressure) to prepare astronauts for spacewalks. As seen here, higher oxygen raises peak flame temperature to ${summary?.maxFlameTemperature.toFixed(0) ?? 2100} K—making fire-resistant material selection critical.`
    : isMicrogravity
    ? `On Earth, fire alarms wait for hot smoke to rise to the ceiling. In orbit, smoke and flames do not rise—they stay spherical or drift with cabin air conditioning. NASA experiments like FLEX-2 and BASS use these exact measurements to design spacecraft fire detectors and extinguishers.`
    : `Comparing Earth and partial-gravity flames helps NASA engineers predict how fire behavior changes between the International Space Station (0g), the Moon (1.62 m/s²), and Mars (3.72 m/s²).`

  // Counterfactual "Explore Next" options
  const counterfactuals: {
    tag: string
    title: string
    description: string
    patch: Partial<SimulationParams>
  }[] = [
    isMicrogravity
      ? {
          tag: 'Compare Gravity',
          title: 'What if this burned on Earth (1g)?',
          description: 'See how gravity stretches the round sphere into a rising teardrop plume and speeds up burning.',
          patch: { gravity: 9.81 },
        }
      : {
          tag: 'Compare Gravity',
          title: 'What if gravity disappeared (ISS 0g)?',
          description: 'Watch the rising plume relax into a calm, spherical blue microgravity flame.',
          patch: { gravity: 0.001, airflowVelocity: 0.05 },
        },
    isHighO2
      ? {
          tag: 'Compare Atmosphere',
          title: 'Return to normal 21% O₂ cabin air',
          description: 'See how much cooler and slower the flame burns at standard Earth/ISS oxygen levels.',
          patch: { oxygenPercent: 21, pressure: 1.0 },
        }
      : {
          tag: 'Compare Atmosphere',
          title: 'Test a 34% O₂ Exploration Cabin',
          description: 'See how enriched spacecraft oxygen raises flame temperature and brightness.',
          patch: { oxygenPercent: 34, pressure: 0.7 },
        },
    (params?.airflowVelocity ?? 0) < 0.12
      ? {
          tag: 'Compare Ventilation',
          title: 'Turn on gentle cabin ventilation (0.18 m/s)',
          description: 'See how spacecraft air conditioning feeds fresh oxygen to a microgravity flame.',
          patch: { airflowVelocity: 0.18 },
        }
      : {
          tag: 'Compare Ventilation',
          title: 'Turn off cabin airflow (0.00 m/s)',
          description: 'Test whether the flame can survive purely on slow molecular diffusion in still air.',
          patch: { gravity: 0.001, airflowVelocity: 0.0 },
        },
  ]

  return (
    <div id="lab-analysis-studio" className="space-y-12 pt-4">
      {/* ═══════════════════════════════════════════════════════════════════════
          UNDERSTAND: THE SCIENTIFIC STORY
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-3xl bg-[#070e1d] border border-slate-800/80 p-6 sm:p-8 lg:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-300">
              Understand the Science · {isPreview ? 'Live Model Preview' : 'Completed Run Analysis'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
              {whatHappenedTitle}
            </h2>
          </div>

          <span className="text-xs font-mono text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
            Model: Analytical D² Law (D²(t) = D₀² − K·t)
          </span>
        </div>

        {/* 2-Column Narrative Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="space-y-2">
            <h3 className="text-base font-display font-semibold text-amber-300">
              What was observed in the chamber?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {whatWasObservedText}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-display font-semibold text-cyan-300">
              Why does this matter for spaceflight?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {whyItMattersText}
            </p>
          </div>
        </div>

        {/* 4 Key Summary Numbers — Clean, Spacious Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800/70">
          <div>
            <span className="text-xs text-slate-400">Burning Rate Constant (K)</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-cyan-300 tabular-nums">
                {effectiveK.toFixed(2)}
              </span>
              <span className="font-mono text-xs text-slate-400">mm²/s</span>
            </div>
            <span className="text-xs text-slate-400">Speed of surface area shrinkage</span>
          </div>

          <div>
            <span className="text-xs text-slate-400">Peak Flame Temperature</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
                {summary ? summary.maxFlameTemperature.toFixed(0) : '—'}
              </span>
              <span className="font-mono text-xs text-slate-400">K</span>
            </div>
            <span className="text-xs text-slate-400">
              {summary ? `${(summary.maxFlameTemperature - 273.15).toFixed(0)} °C reaction zone` : ''}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400">Average Heat Release</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-orange-400 tabular-nums">
                {summary ? summary.avgHeatReleaseRate.toFixed(1) : '—'}
              </span>
              <span className="font-mono text-xs text-slate-400">Watts</span>
            </div>
            <span className="text-xs text-slate-400">Mean thermal power output</span>
          </div>

          <div>
            <span className="text-xs text-slate-400">Total Fuel Consumed</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-emerald-300 tabular-nums">
                {summary ? summary.totalMassLost.toFixed(1) : '—'}
              </span>
              <span className="font-mono text-xs text-slate-400">mg</span>
            </div>
            <span className="text-xs text-slate-400">
              Final sphere size: {summary ? `${summary.finalDiameter.toFixed(2)} mm` : '—'}
            </span>
          </div>
        </div>

        {/* ── Progressive Disclosure for Charts & Detailed Measurements ── */}
        <div className="pt-6 border-t border-slate-800/70 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-display font-bold text-white">
              Detailed Charts &amp; Chamber Measurements
            </h3>

            {/* Tab Selector (Guided Mode shows one clean view at a time; Advanced Mode also lets users switch or view charts) */}
            <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
              {(
                [
                  { id: 'd2',      label: 'Fuel Burn Curve D²(t)' },
                  { id: 'thermal', label: 'Heat & Temperature' },
                  { id: 'sensors', label: 'All 6 Sensor Probes' },
                  { id: 'physics', label: 'Material & Model Scope' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: D²(t) Burning Law Chart */}
          {(activeTab === 'd2' || labMode === 'advanced') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#050a15] border border-slate-800/80 rounded-2xl p-5">
              <div className="lg:col-span-8 h-52">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <rect
                    x={PAD_L}
                    y={12}
                    width={W - PAD_L - 16}
                    height={H - PAD_B - 12}
                    fill="#040812"
                    rx={6}
                  />
                  <GridLines />
                  <line x1={PAD_L} y1={12} x2={PAD_L} y2={H - PAD_B} stroke="#334155" strokeWidth={1} />
                  <line x1={PAD_L} y1={H - PAD_B} x2={W - 16} y2={H - PAD_B} stroke="#334155" strokeWidth={1} />
                  <AxisLabels maxVal={initialD2} unit="mm²" />

                  <polyline
                    points={idealD2Points}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth={1.6}
                    strokeDasharray="5 4"
                    opacity={0.7}
                  />
                  {dSquaredPolyline && (
                    <polyline
                      points={dSquaredPolyline}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth={2.6}
                    />
                  )}
                  {frames.length > 0 && !isPreview && (
                    <line
                      x1={markerX}
                      y1={12}
                      x2={markerX}
                      y2={H - PAD_B}
                      stroke="#f8fafc"
                      strokeWidth={1.4}
                      opacity={0.8}
                    />
                  )}
                </svg>
              </div>

              <div className="lg:col-span-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-display font-bold text-cyan-300">
                    Why D²(t) is a straight line
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Because heat transfer into the fuel sphere is proportional to its surface area
                  (D²), a steady diffusion flame shrinks D² at a constant rate{' '}
                  <strong className="font-mono text-white">K = {effectiveK.toFixed(2)} mm²/s</strong>.
                </p>
                <div className="flex items-center gap-4 pt-1 text-xs font-mono text-slate-400">
                  <span className="inline-flex items-center gap-1.5 text-cyan-300">
                    <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Simulated D²(t)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-orange-300">
                    <span className="w-3 h-0.5 border-b border-dashed border-orange-400 inline-block" />{' '}
                    Ideal Slope
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Heat Release & Flame Temperature Chart */}
          {(activeTab === 'thermal' || labMode === 'advanced') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#050a15] border border-slate-800/80 rounded-2xl p-5">
              <div className="lg:col-span-8 h-52">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <rect
                    x={PAD_L}
                    y={12}
                    width={W - PAD_L - 16}
                    height={H - PAD_B - 12}
                    fill="#040812"
                    rx={6}
                  />
                  <GridLines />
                  <line x1={PAD_L} y1={12} x2={PAD_L} y2={H - PAD_B} stroke="#334155" strokeWidth={1} />
                  <line x1={PAD_L} y1={H - PAD_B} x2={W - 16} y2={H - PAD_B} stroke="#334155" strokeWidth={1} />
                  <AxisLabels maxVal={maxHRR} unit="W" />

                  {hrrArea && <path d={hrrArea} fill="#f97316" fillOpacity={0.18} />}
                  {hrrPolyline && (
                    <polyline points={hrrPolyline} fill="none" stroke="#f97316" strokeWidth={2.6} />
                  )}
                  {tempPolyline && (
                    <polyline
                      points={tempPolyline}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth={1.8}
                      strokeDasharray="5 3"
                      opacity={0.9}
                    />
                  )}
                  {frames.length > 0 && !isPreview && (
                    <line
                      x1={markerX}
                      y1={12}
                      x2={markerX}
                      y2={H - PAD_B}
                      stroke="#f8fafc"
                      strokeWidth={1.4}
                      opacity={0.8}
                    />
                  )}
                </svg>
              </div>

              <div className="lg:col-span-4 space-y-2.5">
                <span className="text-sm font-display font-bold text-amber-300">
                  Heat Release &amp; Temperature Over Time
                </span>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  As the solid sphere shrinks, less fuel vaporizes each second, so thermal power
                  (orange curve, W) gradually declines while flame temperature (dashed yellow, K)
                  stays steady until burnout.
                </p>
                <div className="flex items-center gap-4 pt-1 text-xs font-mono text-slate-400">
                  <span className="inline-flex items-center gap-1.5 text-orange-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Heat Release (W)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" /> Temp (K)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: All 6 Chamber Sensors */}
          {activeTab === 'sensors' && (
            <SensorReadouts
              frame={currentFrame}
              status={status}
              burntFraction={summary?.burntFraction ?? 0}
              initialDiameter={initialD}
              variant="detailed"
            />
          )}

          {/* Tab 4: Material Properties & Scientific Scope (Also shown in Advanced Mode) */}
          {(activeTab === 'physics' || labMode === 'advanced') && (
            <div className="bg-[#050a15] border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-display font-bold text-white">
                  {material.name} ({material.chemicalNote}) — Thermodynamic Constants &amp; Model Scope
                </h4>
                <span className="font-mono text-xs text-cyan-300">
                  0D/1D Analytical D² Law Solver (Not a 3D Navier-Stokes CFD Solver)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#091224] border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Density</span>
                  <strong className="text-white tabular-nums">{material.density} kg/m³</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#091224] border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Heat of Combustion</span>
                  <strong className="text-amber-300 tabular-nums">{material.heatOfCombustion} MJ/kg</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#091224] border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Ignition Temp</span>
                  <strong className="text-white tabular-nums">{material.ignitionTempK} K</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#091224] border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Min O₂ (Space / Earth)</span>
                  <strong className="text-cyan-300 tabular-nums">
                    {material.minO2Microgravity}% / {material.minO2Earth}%
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-[#091224] border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Stoich O₂ Ratio</span>
                  <strong className="text-white tabular-nums">{material.stoichO2Ratio} kg/kg</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#091224] border border-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Soot Tendency</span>
                  <strong className="text-slate-200 tabular-nums">{material.sootIndex} (0–1)</strong>
                </div>
              </div>

              {activePreset?.id === 'saffire-cabin' && (
                <p className="text-xs text-amber-300/90 font-mono">
                  Provenance Note: NASA Saffire I–VI experiments were conducted on uncrewed Cygnus
                  cargo spacecraft after departing the ISS, not inside an occupied crew cabin.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          DISCOVER NEXT: COUNTERFACTUAL EXPERIMENTS & CONNECTED PLATFORM TOOLS
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-3xl bg-[#070e1d] border border-slate-800/80 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-amber-300">Discover More Science</span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-0.5">
              What Should We Test Next?
            </h2>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {onOpenAI && (
              <button
                type="button"
                onClick={onOpenAI}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 transition-colors cursor-pointer"
              >
                <span>🤖</span>
                <span>Ask AI Science Assistant</span>
              </button>
            )}
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>⚖️</span>
              <span>Compare Scenarios</span>
            </Link>
            <Link
              href={
                activePreset?.nasaExpId
                  ? `/research?exp=${activePreset.nasaExpId}`
                  : '/research'
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>🛸</span>
              <span>NASA Experiment Archive</span>
            </Link>
          </div>
        </div>

        {onApplyCounterfactual && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {counterfactuals.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onApplyCounterfactual(item.patch, item.title)}
                className="text-left p-5 rounded-2xl bg-[#0a1428] hover:bg-[#0e1c36] border border-slate-800 hover:border-cyan-400/50 transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-cyan-300">{item.tag}</span>
                    <span className="text-xs font-mono text-amber-300 group-hover:translate-x-1 transition-transform">
                      Try this →
                    </span>
                  </div>
                  <h3 className="text-base font-display font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
