'use client'

import { useState } from 'react'
import { MATERIALS } from '@/lib/simulation/materialDatabase'
import type { FuelMaterial, SimulationParams, SimulationStatus } from '@/lib/simulation/types'
import { ElasticSlider } from '@/components/ui/reactbits/MotionPrimitives'

export type LabMode = 'guided' | 'advanced'

interface ControlPanelProps {
  params: SimulationParams
  onParamsChange: (p: SimulationParams) => void
  status: SimulationStatus
  labMode: LabMode
  selectedPresetId: string
  onSelectPreset: (preset: LabScenarioPreset) => void
  onRun: () => void
  onPause: () => void
  onReset: () => void
}

export interface LabScenarioPreset {
  id: string
  name: string
  shortLabel: string
  badge: string
  headline: string
  question: string
  summary: string
  hypothesis: string
  nasaReference: string
  nasaExpId: string
  compareScenarioId: string
  params: SimulationParams
}

export const LAB_SCENARIO_PRESETS: LabScenarioPreset[] = [
  {
    id: 'iss-flex',
    name: 'ISS Microgravity (0g)',
    shortLabel: 'ISS 0g Sphere',
    badge: 'FLEX-2 · 0g',
    headline: 'Fire in Zero Gravity',
    question: 'Why does a flame form a calm, glowing sphere in orbit instead of rising upward?',
    summary:
      'On Earth, heated air rises and pulls flames into a teardrop. In orbit, gravity disappears—and fire transforms into a spherical diffusion shell fed only by slow molecular motion.',
    hypothesis:
      'Without gravity, hot gas cannot rise. Oxygen reaches the fuel equally from all directions, creating a spherical blue flame (aspect ratio 1.0 : 1).',
    nasaReference: 'NASA ISS · FLEX-2 & BASS Investigations',
    nasaExpId: 'flex-2',
    compareScenarioId: 'sim-microgravity-baseline',
    params: {
      fuel: 'cellulose',
      gravity: 0.001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.0,
      duration: 60,
      sampleDiameter: 5.0,
    },
  },
  {
    id: 'earth-1g',
    name: 'Earth Gravity (1g)',
    shortLabel: 'Earth 1g Plume',
    badge: 'Earth · 9.81 m/s²',
    headline: 'Buoyant Fire on Earth',
    question: 'How does Earth gravity stretch a flame upward and accelerate burning?',
    summary:
      'Under normal Earth gravity, hot combustion gases are lighter than cool room air. They rush upward, drawing fresh oxygen in from the bottom and stretching the flame into a bright teardrop plume.',
    hypothesis:
      'Natural buoyancy lifts hot gas upward and feeds fresh oxygen from below, elongating the flame (aspect ratio 1.6 : 1) and burning fuel nearly twice as fast.',
    nasaReference: 'NASA Glenn 1g Ground Reference Baseline',
    nasaExpId: 'bass',
    compareScenarioId: 'sim-earth-baseline',
    params: {
      fuel: 'cellulose',
      gravity: 9.81,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.0,
      duration: 60,
      sampleDiameter: 5.0,
    },
  },
  {
    id: 'lunar-partial',
    name: 'Lunar Habitat (0.16g)',
    shortLabel: 'Moon 0.16g',
    badge: 'Moon · 1.62 m/s²',
    headline: 'Fire on the Moon',
    question: 'How does fire behave inside a Lunar habitat at one-sixth of Earth gravity?',
    summary:
      'At lunar gravity (1.62 m/s²), gentle upward buoyancy coexists with molecular diffusion—producing a compact, weakly stretched plume that often burns more steadily than in 0g.',
    hypothesis:
      'Weak lunar buoyancy supplies fresh oxygen faster than pure 0g diffusion without blowing the flame out.',
    nasaReference: 'NASA Partial-Gravity Fire Safety Research',
    nasaExpId: 'sofe',
    compareScenarioId: 'sim-lunar-gravity',
    params: {
      fuel: 'cellulose',
      gravity: 1.62,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.05,
      duration: 60,
      sampleDiameter: 5.0,
    },
  },
  {
    id: 'saffire-cabin',
    name: 'Enriched Oxygen Cabin',
    shortLabel: '34% O₂ Cabin',
    badge: 'Saffire · 34% O₂',
    headline: 'Spacecraft Enriched-Oxygen Fire',
    question: 'Why does higher oxygen concentration make microgravity flames hotter and harder to extinguish?',
    summary:
      'Future exploration spacecraft often use 34% oxygen at reduced cabin pressure (0.6 atm) to shorten spacewalk prep. With less nitrogen to absorb heat, flames burn much hotter and brighter.',
    hypothesis:
      'Increasing oxygen from 21% to 34% raises peak flame temperature and expands the reaction zone.',
    nasaReference: 'NASA Saffire I–VI (Uncrewed Cygnus Spacecraft)',
    nasaExpId: 'saffire-1',
    compareScenarioId: 'sim-microgravity-enriched-o2',
    params: {
      fuel: 'pmma',
      gravity: 0.001,
      oxygenPercent: 34,
      pressure: 0.6,
      airflowVelocity: 0.2,
      duration: 60,
      sampleDiameter: 6.0,
    },
  },
  {
    id: 'bass-flow',
    name: 'Ventilated Space Cabin',
    shortLabel: 'Ventilated 0g',
    badge: 'BASS-II · 0.15 m/s',
    headline: 'How Air Conditioning Feeds Orbiting Flames',
    question: 'Can gentle spacecraft ventilation airflow keep a microgravity fire alive?',
    summary:
      'In still microgravity air, a flame can suffocate in its own exhaust. Turning on gentle cabin ventilation (0.15 m/s) brings a steady stream of fresh oxygen to the fuel.',
    hypothesis:
      'Gentle forced airflow replaces missing buoyancy, feeding fresh oxygen to the flame and preventing self-extinguishment.',
    nasaReference: 'NASA ISS · BASS-II Investigation',
    nasaExpId: 'bass-2',
    compareScenarioId: 'sim-iss-ventilation',
    params: {
      fuel: 'polyethylene',
      gravity: 0.001,
      oxygenPercent: 21,
      pressure: 1.0,
      airflowVelocity: 0.15,
      duration: 60,
      sampleDiameter: 5.0,
    },
  },
]

const GRAVITY_CHOICES = [
  { label: 'ISS 0g', sub: '0.001 m/s²', value: 0.001 },
  { label: 'Moon',   sub: '1.62 m/s²',  value: 1.62 },
  { label: 'Mars',   sub: '3.72 m/s²',  value: 3.72 },
  { label: 'Earth',  sub: '9.81 m/s²',  value: 9.81 },
]

const FUEL_CHOICES: { id: FuelMaterial; shortName: string; role: string }[] = [
  { id: 'cellulose',    shortName: 'Cotton / Cellulose', role: 'Clothing, wipes & cabin fabrics' },
  { id: 'pmma',         shortName: 'Acrylic (PMMA)',     role: 'NASA standard window & lab plastic' },
  { id: 'polyethylene', shortName: 'Polyethylene',       role: 'Wire insulation & cargo packaging' },
  { id: 'paper',        shortName: 'Thin Cellulose',     role: 'Fast-igniting checklists & notes' },
]

export default function ControlPanel({
  params,
  onParamsChange,
  status,
  labMode,
  onRun,
  onPause,
  onReset,
}: ControlPanelProps) {
  const [showMoreSettings, setShowMoreSettings] = useState(false)

  const update = (patch: Partial<SimulationParams>) => {
    onParamsChange({ ...params, ...patch })
  }

  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const showAll = labMode === 'advanced' || showMoreSettings

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="divide-y divide-slate-800/70">
        {/* 1. Gravity Environment */}
        <div className="pb-3">
          <div className="flex items-baseline justify-between mb-1">
            <label htmlFor="slider-gravity" className="text-sm font-medium text-white">
              Gravity Environment
            </label>
            <span className="font-mono text-xs text-cyan-300 tabular-nums">
              {params.gravity < 0.01
                ? '0.001 m/s² (0g)'
                : `${params.gravity.toFixed(2)} m/s²`}
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            Controls whether hot gas rises (Earth) or expands into a sphere (Space).
          </p>

          <div className="grid grid-cols-4 gap-1.5">
            {GRAVITY_CHOICES.map((g) => {
              const active = Math.abs(params.gravity - g.value) < 0.05
              return (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => update({ gravity: g.value })}
                  className={`py-1.5 px-1.5 rounded-xl text-center transition-all cursor-pointer border ${
                    active
                      ? 'bg-cyan-500/15 border-cyan-400/60 text-white shadow-sm'
                      : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold">{g.label}</div>
                  <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                    {g.sub}
                  </div>
                </button>
              )
            })}
          </div>

          {labMode === 'advanced' && (
            <div className="mt-3">
              <ElasticSlider
                id="slider-gravity"
                label="Fine Gravity Adjustment"
                value={params.gravity}
                min={0.001}
                max={9.81}
                step={0.01}
                displayValue={`${params.gravity.toFixed(3)} m/s²`}
                accentColor="cyan"
                onChange={(val) => update({ gravity: val })}
              />
            </div>
          )}
        </div>

        {/* 2. Solid Fuel Material */}
        <div className="py-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm font-medium text-white">Fuel Material</span>
            <span className="font-mono text-xs text-amber-300 tabular-nums">
              {MATERIALS[params.fuel].heatOfCombustion} MJ/kg
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            {FUEL_CHOICES.map((item) => {
              const active = params.fuel === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update({ fuel: item.id })}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                    active
                      ? 'bg-amber-500/12 border-amber-400/60 text-white'
                      : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{item.shortName}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.role}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. Oxygen Concentration */}
        <div className="py-3">
          <ElasticSlider
            id="slider-oxygen"
            label="Oxygen Level"
            value={params.oxygenPercent}
            min={15}
            max={100}
            step={1}
            displayValue={`${params.oxygenPercent}% O₂`}
            accentColor={params.oxygenPercent >= 30 ? 'amber' : 'cyan'}
            onChange={(val) => update({ oxygenPercent: Math.round(val) })}
          />

          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[
              { label: '16% Lean', value: 16 },
              { label: '21% Air', value: 21 },
              { label: '34% Cabin', value: 34 },
              { label: '50% Rich', value: 50 },
            ].map((chip) => {
              const active = params.oxygenPercent === chip.value
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => update({ oxygenPercent: chip.value })}
                  className={`py-1 px-1.5 rounded-lg text-[11px] text-center transition-colors cursor-pointer ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 font-medium'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Cabin Ventilation Airflow */}
        <div className="py-3">
          <ElasticSlider
            id="slider-airflow"
            label="Cabin Airflow Speed"
            value={params.airflowVelocity}
            min={0}
            max={0.5}
            step={0.01}
            displayValue={`${params.airflowVelocity.toFixed(2)} m/s`}
            accentColor="cyan"
            onChange={(val) => update({ airflowVelocity: val })}
          />

          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[
              { label: 'Still (0.0)', value: 0.0 },
              { label: 'Gentle', value: 0.15 },
              { label: 'Moderate', value: 0.25 },
              { label: 'High', value: 0.42 },
            ].map((chip) => {
              const active = Math.abs(params.airflowVelocity - chip.value) < 0.01
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => update({ airflowVelocity: chip.value })}
                  className={`py-1 px-1.5 rounded-lg text-[11px] text-center transition-colors cursor-pointer ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 font-medium'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 5. Progressive Disclosure: Chamber Pressure, Sample Size & Burn Duration */}
        <div className="pt-2.5">
          {labMode === 'guided' && (
            <button
              type="button"
              onClick={() => setShowMoreSettings((v) => !v)}
              className="w-full flex items-center justify-between gap-2 py-1 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>{showMoreSettings ? '▾ Hide extra settings' : '▸ More chamber settings'}</span>
              <span className="font-mono text-slate-400 tabular-nums shrink-0">
                {params.pressure.toFixed(1)} atm · {params.sampleDiameter.toFixed(1)} mm · {params.duration}s
              </span>
            </button>
          )}

          {showAll && (
            <div className="mt-3 space-y-4 pt-3 border-t border-slate-800/60">
              <ElasticSlider
                id="slider-pressure"
                label="Chamber Pressure"
                value={params.pressure}
                min={0.1}
                max={1.5}
                step={0.05}
                displayValue={`${params.pressure.toFixed(2)} atm`}
                accentColor="cyan"
                onChange={(val) => update({ pressure: val })}
              />

              <ElasticSlider
                id="slider-diameter"
                label="Fuel Sphere Diameter (D₀)"
                value={params.sampleDiameter}
                min={3.0}
                max={10.0}
                step={0.5}
                displayValue={`${params.sampleDiameter.toFixed(1)} mm`}
                accentColor="amber"
                onChange={(val) => update({ sampleDiameter: val })}
              />

              <ElasticSlider
                id="slider-duration"
                label="Experiment Duration"
                value={params.duration}
                min={10}
                max={120}
                step={5}
                displayValue={`${params.duration} s`}
                accentColor="emerald"
                onChange={(val) => update({ duration: Math.round(val) })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Bar */}
      <div className="pt-3.5 mt-3.5 border-t border-slate-800/80 flex items-center gap-2.5">
        <button
          type="button"
          onClick={isRunning ? onPause : onRun}
          className={`flex-1 py-3 px-4 rounded-xl font-display font-bold text-sm transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
            isRunning
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/50'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-orange-500/20'
          }`}
        >
          <span>{isRunning ? '⏸' : '▶'}</span>
          <span>
            {isRunning
              ? 'Pause Simulation'
              : isPaused
              ? 'Resume Simulation'
              : 'Start Burn Simulation'}
          </span>
        </button>

        {status !== 'idle' && (
          <button
            type="button"
            onClick={onReset}
            className="py-3 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-sm font-medium transition-colors cursor-pointer"
            title="Reset Chamber"
          >
            ↺ Reset
          </button>
        )}
      </div>
    </div>
  )
}
