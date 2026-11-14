'use client'

import type { GravityMode, O2Level, FuelType } from './SpaceFlame'

interface ExperimentPanelProps {
  gravity: GravityMode
  o2Level: O2Level
  fuel: FuelType
  flameActive: boolean
  onGravityChange: (v: GravityMode) => void
  onO2Change: (v: O2Level) => void
  onFuelChange: (v: FuelType) => void
  onToggleFlame: () => void
}

function ChoiceButton({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-300 cursor-pointer select-none w-full"
      style={{
        background: active ? `${color}22` : 'rgba(15,23,42,0.6)',
        border: `2px solid ${active ? color : 'rgba(100,120,160,0.3)'}`,
        color: active ? color : 'rgba(180,200,230,0.7)',
        boxShadow: active ? `0 0 18px ${color}44, inset 0 0 10px ${color}11` : 'none',
        transform: active ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {children}
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-widest font-mono text-slate-400 mb-2">
      {children}
    </p>
  )
}

export default function ExperimentPanel({
  gravity,
  o2Level,
  fuel,
  flameActive,
  onGravityChange,
  onO2Change,
  onFuelChange,
  onToggleFlame,
}: ExperimentPanelProps) {
  return (
    <div className="flex flex-col gap-5">

      {/* ── Gravity ── */}
      <div>
        <SectionLabel>🌍 Gravity Experiment</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceButton active={gravity === 'earth'} onClick={() => onGravityChange('earth')} color="#f97316">
            <span className="text-2xl">🌍</span>
            <span>On Earth</span>
            <span className="text-xs font-normal opacity-70">9.8 m/s²</span>
          </ChoiceButton>
          <ChoiceButton active={gravity === 'space'} onClick={() => onGravityChange('space')} color="#06b6d4">
            <span className="text-2xl">🚀</span>
            <span>In Space</span>
            <span className="text-xs font-normal opacity-70">~0 g</span>
          </ChoiceButton>
        </div>
      </div>

      {/* ── Oxygen ── */}
      <div>
        <SectionLabel>💨 Oxygen Experiment</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <ChoiceButton active={o2Level === 'low'} onClick={() => onO2Change('low')} color="#818cf8">
            <span className="text-xl">💨</span>
            <span className="text-xs">Less Air</span>
            <span className="text-xs font-normal opacity-70">~10% O₂</span>
          </ChoiceButton>
          <ChoiceButton active={o2Level === 'normal'} onClick={() => onO2Change('normal')} color="#06b6d4">
            <span className="text-xl">✓</span>
            <span className="text-xs">Normal Air</span>
            <span className="text-xs font-normal opacity-70">21% O₂</span>
          </ChoiceButton>
          <ChoiceButton active={o2Level === 'high'} onClick={() => onO2Change('high')} color="#f59e0b">
            <span className="text-xl">⚡</span>
            <span className="text-xs">More Air</span>
            <span className="text-xs font-normal opacity-70">~35% O₂</span>
          </ChoiceButton>
        </div>
      </div>

      {/* ── Material ── */}
      <div>
        <SectionLabel>🧪 Material Experiment</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <ChoiceButton active={fuel === 'cloth'} onClick={() => onFuelChange('cloth')} color="#f97316">
            <span className="text-xl">🧵</span>
            <span className="text-xs">Cloth</span>
            <span className="text-xs font-normal opacity-70">cellulose</span>
          </ChoiceButton>
          <ChoiceButton active={fuel === 'paper'} onClick={() => onFuelChange('paper')} color="#fde68a">
            <span className="text-xl">📄</span>
            <span className="text-xs">Paper</span>
            <span className="text-xs font-normal opacity-70">easy burn</span>
          </ChoiceButton>
          <ChoiceButton active={fuel === 'plastic'} onClick={() => onFuelChange('plastic')} color="#818cf8">
            <span className="text-xl">🔩</span>
            <span className="text-xs">Plastic</span>
            <span className="text-xs font-normal opacity-70">hot burn</span>
          </ChoiceButton>
        </div>
      </div>

      {/* ── Fire button ── */}
      <button
        onClick={onToggleFlame}
        className="w-full rounded-2xl py-4 font-bold text-base tracking-wider transition-all duration-300 cursor-pointer"
        style={
          flameActive
            ? {
                background: 'rgba(239,68,68,0.15)',
                border: '2px solid #ef4444',
                color: '#fca5a5',
                boxShadow: '0 0 24px #ef444444',
              }
            : {
                background: 'rgba(249,115,22,0.18)',
                border: '2px solid #f97316',
                color: '#fed7aa',
                boxShadow: '0 0 24px #f9731644',
              }
        }
      >
        {flameActive ? '🔴 EXTINGUISH FLAME' : '🔥 IGNITE FLAME'}
      </button>

      {/* Science fact ribbon */}
      <div
        className="rounded-xl p-3 text-xs text-center leading-relaxed"
        style={{
          background: 'rgba(6,182,212,0.08)',
          border: '1px solid rgba(6,182,212,0.2)',
          color: 'rgba(103,232,249,0.8)',
        }}
      >
        🛸 Based on NASA FLEX-2 ISS experiments · Simplified for learning
      </div>
    </div>
  )
}

