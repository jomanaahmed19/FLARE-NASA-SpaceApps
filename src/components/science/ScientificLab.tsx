'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ScientificHeader } from '@/components/ui/ScientificHeader'
import { runSimulation } from '@/lib/simulation/combustionModel'
import { MATERIALS } from '@/lib/simulation/materialDatabase'
import ControlPanel, {
  LAB_SCENARIO_PRESETS,
  type LabMode,
  type LabScenarioPreset,
} from './ControlPanel'
import VisualizationPanel from './VisualizationPanel'
import SensorReadouts from './SensorReadouts'
import ResultsPanel from './ResultsPanel'
import AIAssistant from './AIAssistant'
import type {
  SimulationParams,
  SimulationResult,
  SimulationFrame,
  VisualizationLayer,
  SimulationStatus,
} from '@/lib/simulation/types'
import { DEFAULT_PARAMS } from '@/lib/simulation/types'

// Dynamic import of 3D WebGL scene (no SSR)
const CombustionScene = dynamic(() => import('./CombustionScene'), {
  ssr: false,
})

// ─── Status Indicator ────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status: SimulationStatus }) {
  const configs: Record<SimulationStatus, { dot: string; label: string; badge: string }> = {
    idle:         { dot: 'bg-cyan-400',                  label: 'Live Preview',  badge: 'bg-slate-900/90 text-slate-200 border-slate-700/80' },
    running:      { dot: 'bg-emerald-400 animate-pulse', label: 'Simulating',    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    paused:       { dot: 'bg-amber-400',                 label: 'Paused',        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    completed:    { dot: 'bg-cyan-400',                  label: 'Burn Complete', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    extinguished: { dot: 'bg-blue-400',                  label: 'Extinguished',  badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  }
  const { dot, label, badge } = configs[status]
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${badge}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span>{label}</span>
    </div>
  )
}

function gravityEnvironmentTitle(g: number): string {
  if (g < 0.01) return 'ISS Microgravity (0.001 m/s²)'
  if (Math.abs(g - 1.62) < 0.1) return 'Lunar Gravity (1.62 m/s²)'
  if (Math.abs(g - 3.72) < 0.1) return 'Martian Gravity (3.72 m/s²)'
  if (Math.abs(g - 9.81) < 0.1) return 'Earth Gravity (9.81 m/s²)'
  return `Partial Gravity (${g.toFixed(2)} m/s²)`
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// ─── Physics-Inspired Volumetric Optical Flame Backdrop ───────────────────────
// Renders an authentic diffusion-flame optical cross-section synchronized with
// the simulation state:
// - Quiescent 0g: Hollow spherical CH* blue-cyan reaction sheet with a distinct
//   inner pyrolysis vapor stand-off ("dark") zone surrounding the solid sphere.
// - Buoyant (1g/Moon/Mars) & Ventilated 0g: Compressed upstream blue boundary
//   layer hugging the bottom of the fuel sphere, tapering upward into a warm
//   yellow-amber radiative soot plume.

function buildFlamePath(
  rx: number,
  topReach: number,
  bottomStandoff: number,
  conv: number
): string {
  if (rx <= 0) return ''
  // In pure 0g (conv ~ 0), topReach == bottomStandoff == rx (true sphere).
  // As conv increases, the upper hemisphere elongates and tapers to a natural plume tip.
  const tipPinch = Math.max(0.14, 1 - Math.min(0.82, conv * 0.62))
  const upperCtrlX = rx * tipPinch
  const equatorCtrlY = topReach * 0.34
  const upperCtrlY = topReach * 0.78
  const bottomCtrlX = rx * (1 - Math.min(0.12, conv * 0.08))

  return [
    `M 0 ${-topReach}`,
    `C ${upperCtrlX} ${-upperCtrlY}, ${rx} ${-equatorCtrlY}, ${rx} 0`,
    `C ${rx} ${bottomStandoff * 0.56}, ${bottomCtrlX * 0.58} ${bottomStandoff}, 0 ${bottomStandoff}`,
    `C ${-bottomCtrlX * 0.58} ${bottomStandoff}, ${-rx} ${bottomStandoff * 0.56}, ${-rx} 0`,
    `C ${-rx} ${-equatorCtrlY}, ${-upperCtrlX} ${-upperCtrlY}, 0 ${-topReach}`,
    'Z',
  ].join(' ')
}

function OpticalFlameBackdrop({
  params,
  currentFrame,
  activeLayer,
  burntFraction,
  hideSvgElements = false,
}: {
  params: SimulationParams
  currentFrame: SimulationFrame | null
  activeLayer: VisualizationLayer
  burntFraction: number
  hideSvgElements?: boolean
}) {
  const isExtinguished =
    currentFrame?.status === 'extinguished' || currentFrame?.status === 'burnout'
  const aspectRatio = currentFrame
    ? currentFrame.flameAspectRatio
    : 1 + Math.pow(params.gravity / 9.81, 0.55) * 1.45

  const conv = Math.min(
    1.6,
    Math.pow(params.gravity / 9.81, 0.52) * 1.15 +
      params.airflowVelocity * 2.2 +
      Math.max(0, (aspectRatio - 1) * 0.35)
  )

  const baseRadiusPx = currentFrame
    ? Math.max(66, Math.min(126, currentFrame.flameRadius * 21.5))
    : Math.max(76, Math.min(122, params.sampleDiameter * 17 * (0.85 + params.oxygenPercent / 100)))

  const rx = isExtinguished ? 0 : baseRadiusPx
  const topReach = isExtinguished ? 0 : Math.min(198, rx * (1 + conv * 0.72))
  const bottomStandoff = isExtinguished
    ? 0
    : rx * (1 - Math.min(0.38, conv * 0.25))

  const sampleRadiusPx = currentFrame
    ? Math.max(15, currentFrame.sampleDiameter * 5.2)
    : Math.max(17, params.sampleDiameter * 5.2 * (1 - burntFraction * 0.6))

  const sootWeight = Math.min(
    1,
    conv * 0.55 +
      Math.max(0, (params.oxygenPercent - 20) / 25) * 0.45 +
      (params.fuel === 'pmma' || params.fuel === 'polyethylene' ? 0.35 : 0.15)
  )

  const outerHaloPath = buildFlamePath(
    rx * 1.22,
    topReach * 1.18,
    bottomStandoff * 1.18,
    conv
  )
  const reactionSheetPath = buildFlamePath(rx, topReach, bottomStandoff, conv)
  const innerSootPath = buildFlamePath(
    rx * 0.78,
    topReach * 0.84,
    bottomStandoff * 0.74,
    conv
  )

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(circle at 50% 48%, rgba(12, 28, 58, 0.55) 0%, rgba(4, 8, 18, 0.98) 74%)',
      }}
    >
      {!hideSvgElements && (
        <svg viewBox="0 0 680 500" className="w-full h-full max-w-[760px] max-h-[540px]">
          <defs>
            {/* Hollow Reaction Sheet Radial Gradient: Dark pyrolysis stand-off core -> Warm inner soot -> Crisp Cyan-Blue CH* boundary */}
            <radialGradient id="hollowReactionShell" cx="50%" cy="54%" r="50%">
              <stop offset="0%" stopColor="rgba(5, 11, 24, 0.08)" />
              <stop offset="34%" stopColor="rgba(8, 20, 42, 0.18)" />
              <stop
                offset="58%"
                stopColor={
                  activeLayer === 'temperature'
                    ? 'rgba(245, 158, 11, 0.68)'
                    : activeLayer === 'oxygen'
                    ? 'rgba(220, 38, 38, 0.62)'
                    : activeLayer === 'airflow'
                    ? 'rgba(6, 182, 212, 0.42)'
                    : `rgba(245, 158, 11, ${(0.24 + sootWeight * 0.48).toFixed(2)})`
                }
              />
              <stop
                offset="80%"
                stopColor={
                  activeLayer === 'temperature'
                    ? 'rgba(253, 224, 71, 0.88)'
                    : activeLayer === 'soot'
                    ? 'rgba(251, 191, 36, 0.85)'
                    : 'rgba(56, 189, 248, 0.85)'
                }
              />
              <stop
                offset="93%"
                stopColor={
                  activeLayer === 'soot'
                    ? 'rgba(217, 119, 6, 0.45)'
                    : 'rgba(2, 132, 199, 0.52)'
                }
              />
              <stop offset="100%" stopColor="rgba(2, 6, 23, 0)" />
            </radialGradient>

            {/* Vertical Buoyant / Ventilated Plume Gradient (Warm yellow-amber upper soot cone, blue base) */}
            <linearGradient id="buoyantPlumeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(254, 249, 195, 0.92)" />
              <stop offset="38%" stopColor="rgba(251, 191, 36, 0.82)" />
              <stop offset="70%" stopColor="rgba(249, 115, 22, 0.42)" />
              <stop offset="92%" stopColor="rgba(56, 189, 248, 0.25)" />
              <stop offset="100%" stopColor="rgba(2, 132, 199, 0.08)" />
            </linearGradient>

            <filter id="softFlameBlur" x="-35%" y="-35%" width="170%" height="170%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>

          {/* Subtle chamber reference ring */}
          <circle
            cx="340"
            cy="265"
            r="190"
            fill="none"
            stroke="rgba(56, 189, 248, 0.07)"
            strokeWidth="1"
          />

          {/* Physics-Inspired Diffusion Flame Envelope */}
          {!isExtinguished && rx > 0 && (
            <g transform="translate(340, 265)">
              {/* 1. Soft Outer Thermal Diffusion Bloom */}
              <path
                d={outerHaloPath}
                fill="url(#hollowReactionShell)"
                filter="url(#softFlameBlur)"
                opacity="0.72"
              />

              {/* 2. Primary Hollow Reaction Sheet (Translucent Pyrolysis Interior + Luminous Boundary) */}
              <path d={reactionSheetPath} fill="url(#hollowReactionShell)" />

              {/* 3. Buoyant / Ventilated Upper Soot Plume Cone (Appears smoothly as gravity or O2/airflow increases) */}
              {activeLayer !== 'airflow' && (conv > 0.12 || sootWeight > 0.35) && (
                <path
                  d={innerSootPath}
                  fill="url(#buoyantPlumeGrad)"
                  opacity={Math.min(0.88, conv * 0.52 + sootWeight * 0.38)}
                />
              )}

              {/* 4. Soft Stoichiometric CH* Reaction Sheet Rim */}
              <path
                d={reactionSheetPath}
                fill="none"
                stroke={
                  activeLayer === 'soot'
                    ? 'rgba(251, 191, 36, 0.35)'
                    : activeLayer === 'temperature'
                    ? 'rgba(253, 224, 71, 0.38)'
                    : 'rgba(125, 211, 252, 0.38)'
                }
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* Fine Quartz Filament Sting Rod */}
          <line
            x1="340"
            y1="268"
            x2="340"
            y2="445"
            stroke="#64748b"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <rect
            x="314"
            y="438"
            width="52"
            height="10"
            rx="5"
            fill="#1e293b"
            stroke="rgba(56, 189, 248, 0.32)"
            strokeWidth="1"
          />

          {/* Solid Fuel Sphere at Center (Clearly visible inside the pyrolysis stand-off zone) */}
          <circle
            cx="340"
            cy="265"
            r={sampleRadiusPx}
            fill={burntFraction > 0.5 ? '#1e293b' : '#cbd5e1'}
            stroke="#fb923c"
            strokeWidth="2.2"
          />
        </svg>
      )}
    </div>
  )
}

// ─── Main Scientific Lab Component ────────────────────────────────────────────

export default function ScientificLab() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS)
  const [labMode, setLabMode] = useState<LabMode>('guided')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('iss-flex')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [status, setStatus] = useState<SimulationStatus>('idle')
  const [frameIndex, setFrameIndex] = useState(0)
  const [activeLayer, setActiveLayer] = useState<VisualizationLayer>('structure')
  const [showAI, setShowAI] = useState(false)
  const [webGLReady, setWebGLReady] = useState(false)
  const [cameraResetCount, setCameraResetCount] = useState(0)

  const animRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const elapsedSimRef = useRef<number>(0)
  const resultRef = useRef<SimulationResult | null>(null)
  const statusRef = useRef<SimulationStatus>('idle')

  // Synchronize URL query parameters (?fuel=&gravity=&o2=&pressure=&airflow=&exp=) on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams(window.location.search)
    const fuelParam = sp.get('fuel')
    const gravParam = sp.get('gravity')
    const o2Param = sp.get('o2')
    const pressParam = sp.get('pressure')
    const flowParam = sp.get('airflow')
    const expParam = sp.get('exp')
    const aiParam = sp.get('ai')

    if (aiParam === '1' || aiParam === 'true') {
      setShowAI(true)
    }

    if (!fuelParam && !gravParam && !o2Param && !pressParam && !flowParam) return

    const validFuels = ['cellulose', 'pmma', 'polyethylene', 'paper'] as const
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

    const nextParams: SimulationParams = {
      ...DEFAULT_PARAMS,
      fuel: validFuels.includes(fuelParam as (typeof validFuels)[number])
        ? (fuelParam as (typeof validFuels)[number])
        : DEFAULT_PARAMS.fuel,
      gravity:
        gravParam !== null && !Number.isNaN(Number(gravParam))
          ? clamp(Number(gravParam), 0.000001, 9.81)
          : DEFAULT_PARAMS.gravity,
      oxygenPercent:
        o2Param !== null && !Number.isNaN(Number(o2Param))
          ? clamp(Number(o2Param), 15, 100)
          : DEFAULT_PARAMS.oxygenPercent,
      pressure:
        pressParam !== null && !Number.isNaN(Number(pressParam))
          ? clamp(Number(pressParam), 0.1, 1.5)
          : DEFAULT_PARAMS.pressure,
      airflowVelocity:
        flowParam !== null && !Number.isNaN(Number(flowParam))
          ? clamp(Number(flowParam), 0, 0.5)
          : DEFAULT_PARAMS.airflowVelocity,
    }

    setParams(nextParams)
    const matchedById = expParam
      ? LAB_SCENARIO_PRESETS.find((p) => p.nasaExpId === expParam || p.id === expParam)
      : undefined
    if (matchedById) {
      setSelectedPresetId(matchedById.id)
    } else if (nextParams.gravity > 5) {
      setSelectedPresetId('earth-1g')
    } else if (nextParams.gravity > 0.5) {
      setSelectedPresetId('moon-partial')
    } else if (nextParams.airflowVelocity >= 0.08) {
      setSelectedPresetId('ventilated-wake')
    } else if (nextParams.oxygenPercent >= 30) {
      setSelectedPresetId('saffire-o2')
    }
  }, [])

  useEffect(() => {
    resultRef.current = result
  }, [result])
  useEffect(() => {
    statusRef.current = status
  }, [status])

  // ── Animation loop ──────────────────────────────────────────────────────────

  const startAnimation = useCallback((res: SimulationResult, startFrameIdx = 0) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    lastTimeRef.current = performance.now()
    elapsedSimRef.current = res.frames[startFrameIdx]?.time ?? 0

    const playbackSpeed = res.params.duration / 8

    const tick = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now
      elapsedSimRef.current += delta * playbackSpeed

      const frames = resultRef.current?.frames
      if (!frames) return

      let idx = frames.findIndex((f) => f.time >= elapsedSimRef.current)
      if (idx === -1) idx = frames.length - 1

      setFrameIndex(idx)

      if (idx >= frames.length - 1) {
        const lastFrame = frames[frames.length - 1]
        const finalStatus: SimulationStatus =
          lastFrame.status === 'extinguished' ? 'extinguished' : 'completed'
        setStatus(finalStatus)
        return
      }

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const executeSimulationWithParams = useCallback(
    (targetParams: SimulationParams) => {
      const res = runSimulation(targetParams)
      setResult(res)
      setFrameIndex(0)
      setStatus('running')
      elapsedSimRef.current = 0
      startAnimation(res, 0)
    },
    [startAnimation]
  )

  const handleRun = useCallback(() => {
    if (statusRef.current === 'paused' && resultRef.current) {
      setStatus('running')
      startAnimation(resultRef.current, frameIndex)
      return
    }
    executeSimulationWithParams(params)
  }, [params, frameIndex, startAnimation, executeSimulationWithParams])

  const handlePause = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
    setStatus('paused')
  }, [])

  const handleReset = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
    setResult(null)
    setFrameIndex(0)
    setStatus('idle')
    elapsedSimRef.current = 0
  }, [])

  const handleSelectPreset = useCallback((preset: LabScenarioPreset) => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
    setSelectedPresetId(preset.id)
    setParams({ ...preset.params })
    setResult(null)
    setFrameIndex(0)
    setStatus('idle')
    elapsedSimRef.current = 0
  }, [])

  const handleApplyCounterfactual = useCallback(
    (patch: Partial<SimulationParams>) => {
      const nextParams: SimulationParams = { ...params, ...patch }
      setParams(nextParams)
      executeSimulationWithParams(nextParams)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [params, executeSimulationWithParams]
  )

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        const s = statusRef.current
        if (s === 'running') handlePause()
        else if (s === 'idle' || s === 'paused') handleRun()
      }
      if (e.code === 'KeyR') {
        e.preventDefault()
        handleReset()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleRun, handlePause, handleReset])

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  // ── Derived state ───────────────────────────────────────────────────────────

  const previewResult = useMemo(() => runSimulation(params), [params])
  const previewFrame: SimulationFrame | null = previewResult.frames[0] ?? null

  const currentFrame: SimulationFrame | null = result
    ? result.frames[frameIndex] ?? result.frames[result.frames.length - 1]
    : null
  const displayFrame: SimulationFrame | null = currentFrame ?? previewFrame
  const currentTime = currentFrame?.time ?? 0
  const burntFraction = result
    ? 1 -
      Math.pow(
        (currentFrame?.sampleDiameter ?? params.sampleDiameter) / params.sampleDiameter,
        3
      )
    : 0
  const totalFrames = result?.frames.length ?? 0

  const material = MATERIALS[params.fuel]
  const activePreset =
    LAB_SCENARIO_PRESETS.find((p) => p.id === selectedPresetId) ?? LAB_SCENARIO_PRESETS[0]

  const handleSeek = (idx: number) => {
    if (!result) return
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
    if (status === 'running') setStatus('paused')
    setFrameIndex(idx)
    elapsedSimRef.current = result.frames[idx]?.time ?? 0
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030711] text-slate-100 overflow-x-hidden">
      {/* Unified Scientific Header */}
      <ScientificHeader
        activeRoute="science"
        centerSlot={<StatusIndicator status={status} />}
        rightActionsSlot={
          <div className="flex items-center gap-2">
            {/* Guided vs Advanced Experience Switcher */}
            <div
              role="group"
              aria-label="Experience Level"
              className="inline-flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
            >
              <button
                type="button"
                onClick={() => setLabMode('guided')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  labMode === 'guided'
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Guided
              </button>
              <button
                type="button"
                onClick={() => setLabMode('advanced')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  labMode === 'advanced'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Advanced
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAI((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                showAI
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title="Open AI Science Assistant"
            >
              <span>🤖</span>
              <span className="hidden md:inline">AI Assistant</span>
            </button>
          </div>
        }
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN OBSERVATORY WORKSPACE (Spacious, Calm, Flame-Centered)
         ═══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-5 space-y-6">
        {/* 1. Calm Editorial Header + 1-Click Scenario Pills */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2.5 text-xs font-mono text-cyan-300">
              <span>{activePreset.nasaReference}</span>
              <span className="text-slate-600">·</span>
              <span>{labMode === 'guided' ? 'Guided Exploration' : 'Advanced Research Mode'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
              {activePreset.headline}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {activePreset.summary}
            </p>
          </div>

          {/* Sleek Scenario Selector Pills */}
          <div className="flex flex-col items-start xl:items-end gap-1.5 shrink-0">
            <span className="text-xs text-slate-400">Choose an experiment scenario:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {LAB_SCENARIO_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPresetId
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-white shadow-sm'
                        : 'bg-[#081020] hover:bg-[#0d1830] border-slate-800 text-slate-300'
                    }`}
                  >
                    {preset.shortLabel}
                  </button>
                )
              })}
            </div>
          </div>
        </header>

        {/* 2. First Viewport Centerpiece: Large 3D Flame Stage + Calm Controls */}
        <section
          id="lab-chamber-stage"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Left / Main 8 Columns: The Commanding 3D Flame Stage */}
          <div className="lg:col-span-8 rounded-3xl bg-[#050b18] border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col">
            {/* Top Floating Stage Bar: View Modes */}
            <div className="px-5 py-3 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3 bg-[#060c1a]/80">
              <VisualizationPanel
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
                currentFrame={displayFrame}
                variant="toolbar"
              />

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  Drag to orbit 3D · Scroll to zoom
                </span>
                <button
                  type="button"
                  onClick={() => setCameraResetCount((c) => c + 1)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
                  title="Reset 3D camera orientation"
                >
                  ↺ Reset View
                </button>
              </div>
            </div>

            {/* Large, Unmistakable 3D Flame Viewport */}
            <div className="relative flex-1 min-h-[380px] sm:min-h-[410px] w-full bg-[#030711]">
              {/* Volumetric Optical Flame Backdrop (always synchronized with displayFrame) */}
              <OpticalFlameBackdrop
                params={params}
                currentFrame={displayFrame}
                activeLayer={activeLayer}
                burntFraction={burntFraction}
                hideSvgElements={webGLReady}
              />

              {/* Live Interactive 3D Three.js WebGL Scene (receives displayFrame & params so it reacts live!) */}
              <div className="relative z-10 w-full h-full">
                <CombustionScene
                  currentFrame={displayFrame}
                  params={params}
                  activeLayer={activeLayer}
                  isRunning={status === 'running'}
                  material={material}
                  burntFraction={burntFraction}
                  cameraResetTrigger={cameraResetCount}
                  onReady={() => setWebGLReady(true)}
                />
              </div>

              {/* Quiet Top-Left Context Pill */}
              <div className="absolute top-4 left-5 z-20 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#050b16]/85 border border-slate-800/80 backdrop-blur-md text-xs text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-medium">{material.name}</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-mono text-cyan-300">
                    {gravityEnvironmentTitle(params.gravity)}
                  </span>
                </div>
              </div>

              {/* Quiet Top-Right Scientific Model Provenance Pill */}
              <div className="absolute top-4 right-5 z-20 pointer-events-none hidden md:block">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#050b16]/75 border border-slate-800/70 backdrop-blur-md text-[11px] font-mono text-slate-400">
                  <span>3D Diffusion Model · D² Law</span>
                </div>
              </div>

              {/* Timeline Scrubber Overlay when simulation has been started */}
              {result && (
                <div className="absolute bottom-4 inset-x-5 z-20 px-4 py-2.5 rounded-2xl bg-[#060c1a]/90 border border-slate-800/90 backdrop-blur-md flex items-center gap-3">
                  <button
                    type="button"
                    onClick={status === 'running' ? handlePause : handleRun}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 text-xs font-medium cursor-pointer"
                  >
                    {status === 'running' ? '⏸ Pause' : '▶ Play'}
                  </button>
                  <span className="font-mono text-xs text-cyan-300 tabular-nums">
                    {formatTime(currentTime)} / {formatTime(params.duration)}
                  </span>
                  <input
                    type="range"
                    aria-label="Simulation timeline"
                    min={0}
                    max={Math.max(totalFrames - 1, 0)}
                    value={frameIndex}
                    onChange={(e) => handleSeek(parseInt(e.target.value, 10))}
                    className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* 1-Sentence View Explanation */}
            <div className="px-5 py-3.5 bg-[#060c1a] border-t border-slate-800/60">
              <VisualizationPanel
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
                currentFrame={displayFrame}
                variant="inspector"
              />
            </div>

            {/* 4 Essential Live Readouts */}
            <SensorReadouts
              frame={displayFrame}
              status={status}
              burntFraction={burntFraction}
              initialDiameter={params.sampleDiameter}
              variant="essential"
            />
          </div>

          {/* Right 4 Columns: Calm, Spacious Experiment Controls */}
          <div className="lg:col-span-4 rounded-3xl bg-[#070e1d] border border-slate-800/80 p-6 shadow-2xl flex flex-col justify-between">
            <div className="mb-4">
              <h2 className="text-lg font-display font-bold text-white">
                Experiment Controls
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust gravity, fuel, or oxygen—the 3D flame updates immediately.
              </p>
            </div>

            <ControlPanel
              params={params}
              onParamsChange={setParams}
              status={status}
              labMode={labMode}
              selectedPresetId={selectedPresetId}
              onSelectPreset={handleSelectPreset}
              onRun={handleRun}
              onPause={handlePause}
              onReset={handleReset}
            />
          </div>
        </section>

        {/* 3. Below the Fold: Understand the Science & Discover Next */}
        <ResultsPanel
          result={result ?? previewResult}
          currentFrame={displayFrame}
          currentTime={currentTime}
          params={params}
          status={status}
          labMode={labMode}
          activePreset={activePreset}
          isPreview={result === null}
          onOpenAI={() => setShowAI(true)}
          onApplyCounterfactual={handleApplyCounterfactual}
        />
      </main>

      {/* Slide-Over AI Assistant Drawer */}
      {showAI && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/65 backdrop-blur-sm">
          <div className="w-full max-w-[560px] h-[100dvh] bg-[#060c18] border-l border-slate-800/90 shadow-2xl flex flex-col">
            <AIAssistant
              params={params}
              result={result ?? previewResult}
              currentFrame={displayFrame}
              status={status}
              activeLayer={activeLayer}
              activeRoute="science"
              onApplyParams={(patch, autoRun) => {
                const nextParams: SimulationParams = { ...params, ...patch }
                setParams(nextParams)
                if (autoRun) {
                  executeSimulationWithParams(nextParams)
                } else {
                  setResult(null)
                  setFrameIndex(0)
                  setStatus('idle')
                }
              }}
              onLayerChange={(layer) => setActiveLayer(layer)}
              onClose={() => setShowAI(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
