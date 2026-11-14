// ══════════════════════════════════════════════════════════════════
//  FLARE — Simplified Solid Combustion Model
//  Phase 02: Scientific Combustion Simulation Lab
//
//  ⚠ MODEL DISCLAIMER
//  This is an educational simplified model based on the classical
//  D² (D-squared) burning law for spherical solid fuel combustion.
//  It is NOT a full CFD (Computational Fluid Dynamics) solver.
//
//  Physical basis:
//  — Law, C.K. (1982) "Recent advances in droplet vaporization and combustion"
//    Progress in Energy and Combustion Science, 8(3), 171-201
//  — Williams, F.A. (1985) "Combustion Theory" (2nd ed.), Chapter 3
//  — Friedman, R. (1999) NASA TM-1999-209285 "Fire Safety in Low-Gravity"
//
//  Assumptions documented in ModelMetadata below.
// ══════════════════════════════════════════════════════════════════

import type {
  SimulationParams,
  SimulationFrame,
  SimulationResult,
  ModelMetadata,
  BurnStatus,
} from './types'
import { MATERIALS } from './materialDatabase'

// ── Physical Constants ─────────────────────────────────────────────
const G_EARTH      = 9.81          // m/s²
const T_AMBIENT    = 300           // K   — assumed chamber ambient temperature
const RHO_GAS_STP  = 1.17         // kg/m³ — air at 1 atm, 300 K
const D_O2_STP     = 2.1e-5       // m²/s — O₂ diffusivity in N₂ at 300 K, 1 atm
const CP_PRODUCTS  = 1300         // J/(kg·K) — specific heat of combustion products
const MW_O2        = 32           // g/mol
const MW_N2        = 28           // g/mol
const DT           = 0.25         // s — integration timestep

// ── Model Metadata (shown in UI for scientific transparency) ───────
const MODEL_INFO: ModelMetadata = {
  name: 'Simplified D² Solid Combustion Model',
  version: '1.0.0',
  scope:
    'Predicts burning rate, flame dimensions, and heat release for a small spherical solid fuel sample under variable gravity and atmosphere.',
  assumptions: [
    'Spherical fuel sample with quasi-steady burning (D² law)',
    'Single-step global combustion chemistry (fuel + O₂ → products)',
    'Radiation loss modelled via fixed efficiency factor (η = 0.72)',
    'Gravity effect on burning rate from buoyancy-enhancement correlation (Law 1982)',
    'Closed chamber with finite O₂ inventory — depletion tracked linearly',
    'Uniform temperature field (no spatial temperature gradients within zones)',
    'Flame standoff ratio from classical diffusion flame theory',
    'Soot volume fraction estimated from empirical soot index (not a kinetic soot model)',
    'Flame extinction treated as instantaneous when O₂ or temperature drops below threshold',
  ],
  limitations: [
    'Not a spatial CFD — does not resolve internal flow structure',
    'Does not model soot particle dynamics, agglomeration, or oxidation kinetics',
    'Ignition transient is not modelled — simulation begins at quasi-steady burning',
    'Flame pulsation and instabilities in µg are not captured',
    'Valid primarily for small samples (D₀ ≤ 10 mm) in quiescent or low-velocity environments',
  ],
  references: [
    'Williams (1985) Combustion Theory, 2nd ed.',
    'Law (1982) Prog. Energy Combust. Sci. 8(3):171-201',
    'Friedman (1999) NASA TM-1999-209285',
    'FLEX-2 Experiment Data, ISS Expeditions 30-32 (NASA)',
    'Quintiere (2006) Fundamentals of Fire Phenomena, Wiley',
  ],
}

// ── Helper: O₂ mass fraction from volume percent ──────────────────
function o2MassFraction(o2VolPercent: number): number {
  const xO2 = o2VolPercent / 100
  const xN2 = 1 - xO2
  return (xO2 * MW_O2) / (xO2 * MW_O2 + xN2 * MW_N2)
}

// ── Helper: Spalding transfer number B ────────────────────────────
// B = (Y_O2_inf * ΔHc) / (s_O2 * L_v)
// Accounts for oxidizer concentration in mass-based Spalding number.
function spalding(o2MassFrac: number, dHc_Jkg: number, s_O2: number, Lv_Jkg: number): number {
  return Math.max(0.01, (o2MassFrac * dHc_Jkg) / (s_O2 * Lv_Jkg))
}

// ── Helper: Flame temperature (K) ─────────────────────────────────
// Adiabatic temperature from energy balance, corrected for radiation.
// T_f = T_amb + η_rad * (Y_O2 / s_O2 * ΔHc / Cp_products)
function flameTemp(
  o2MassFrac: number,
  dHc_Jkg: number,
  s_O2: number,
  radiationFactor: number,
  adiabaticCap: number,
): number {
  const dT_ad = (o2MassFrac / s_O2) * dHc_Jkg / CP_PRODUCTS
  return Math.min(
    T_AMBIENT + dT_ad * radiationFactor,
    adiabaticCap,
  )
}

// ── Helper: Flame standoff ratio r_f / r_s ────────────────────────
// From classical spherical diffusion flame (Seshadri & Williams 1978):
// r_f/r_s ≈ (1 + B)^0.38  scaled by relative O₂
// Accounts for the fact that higher O₂ brings flame closer to surface.
function standoffRatio(B: number, o2Frac: number, referenceO2Frac: number): number {
  const baseRatio = Math.pow(1 + B, 0.38)
  const o2Scale = Math.pow(referenceO2Frac / 0.233, 0.25) // 0.233 = mass frac at 21%
  return Math.max(1.05, baseRatio * o2Scale)
}

// ── Helper: Flame aspect ratio (shape) ────────────────────────────
// 1.0 = sphere (µg). Increases with gravity due to buoyancy-driven plume.
// Empirical: AR ≈ 1 + 0.6*(g/g_Earth)^0.5  (Altenkirch et al. correlation)
function aspectRatio(gravity: number): number {
  return 1.0 + 0.6 * Math.pow(gravity / G_EARTH, 0.5)
}

// ── Helper: Gravity enhancement on burning rate ───────────────────
// Buoyancy-driven convection increases O₂ supply to flame in higher gravity.
// K_g/K_µg ≈ 1 + 0.28*(g/g_Earth)^0.4  (Law 1982 correlation)
function gravityFactor(gravity: number): number {
  return 1.0 + 0.28 * Math.pow(Math.max(gravity / G_EARTH, 1e-5), 0.4)
}

// ── Helper: Pressure correction on diffusivity and gas density ────
// D_AB ~ 1/P  |  rho_g ~ P
// Net effect on K = D_AB * rho_g is pressure-independent to first order.
// But pressure affects ignition and extinction limits.
function pressureO2Correction(pressure: number): number {
  // Higher pressure increases O₂ partial pressure → slightly higher burning rate
  return Math.pow(pressure, 0.1)
}

// ══════════════════════════════════════════════════════════════════
//  MAIN SIMULATION FUNCTION
// ══════════════════════════════════════════════════════════════════

export function runSimulation(params: SimulationParams): SimulationResult {
  const mat = MATERIALS[params.fuel]
  if (!mat) throw new Error(`Unknown fuel material: ${params.fuel}`)

  // ── Derived material constants ─────────────────────────────────
  const dHc   = mat.heatOfCombustion * 1e6   // J/kg
  const Lv    = mat.latentHeat * 1e6          // J/kg
  const rhoS  = mat.density                  // kg/m³

  // ── Atmospheric parameters ────────────────────────────────────
  const o2MFrac0 = o2MassFraction(params.oxygenPercent)   // initial O₂ mass fraction
  const pCorr    = pressureO2Correction(params.pressure)
  const rhoGas   = RHO_GAS_STP * params.pressure          // kg/m³ (ideal gas)
  const D_AB     = D_O2_STP / params.pressure             // m²/s (scales as 1/P)

  // ── Spalding number and base burning rate constant ────────────
  const B    = spalding(o2MFrac0, dHc, mat.stoichO2Ratio, Lv)
  const lnB  = Math.log(1 + B)
  // K = 8 * rho_g * D_AB * ln(1+B) / rho_l  [m²/s]
  const K_m2s = (8 * rhoGas * D_AB * lnB) / rhoS * pCorr
  // Convert to mm²/s for practical calculations
  const K_base_mm2s = K_m2s * 1e6

  // Apply gravity enhancement
  const K_mm2s = K_base_mm2s * gravityFactor(params.gravity)

  // ── Flame temperature (corrected for radiation) ───────────────
  const T_flame_K = flameTemp(o2MFrac0, dHc, mat.stoichO2Ratio, 0.72, mat.adiabaticTempAirK)

  // ── Standoff ratio and shape ──────────────────────────────────
  const sfRatio0 = standoffRatio(B, o2MFrac0, o2MFrac0)
  const AR       = aspectRatio(params.gravity)

  // ── Extinction limits ─────────────────────────────────────────
  const minO2 = params.gravity < 0.1
    ? mat.minO2Microgravity
    : mat.minO2Earth + (mat.minO2Microgravity - mat.minO2Earth) * Math.exp(-params.gravity)

  // Blow-off velocity: strong airflow can extinguish the flame
  // Threshold ≈ 0.3-0.5 m/s (lower for high-gravity, same for µg)
  const blowoffThreshold = 0.35 + 0.1 * (params.gravity / G_EARTH)
  const isBlownOff = params.airflowVelocity > blowoffThreshold

  // ── Chamber O₂ inventory (simplified closed-chamber model) ───
  // Assume spherical chamber of radius 0.1 m (100 mm)
  const chamberVolume_m3 = (4 / 3) * Math.PI * Math.pow(0.10, 3)  // ~4.19×10⁻³ m³
  // O₂ mass in chamber at start
  const o2DensitySTP = 1.43  // kg/m³ at STP
  const o2MassTotal = chamberVolume_m3 * o2DensitySTP * params.pressure * (params.oxygenPercent / 21)

  // ── Integration state ─────────────────────────────────────────
  let D2 = Math.pow(params.sampleDiameter, 2)   // mm²
  let o2Remaining = o2MassTotal                  // kg
  let o2NearFlame = params.oxygenPercent         // vol%
  const frames: SimulationFrame[] = []

  let extinctionTime: number | null = null
  let burnoutTime: number | null = null

  // ── Time integration loop ─────────────────────────────────────
  const steps = Math.ceil(params.duration / DT) + 1

  for (let i = 0; i < steps; i++) {
    const t = Math.min(i * DT, params.duration)

    // Current geometry
    D2 = Math.max(0, Math.pow(params.sampleDiameter, 2) - K_mm2s * t)
    const D_mm    = Math.sqrt(D2)
    const r_s_mm  = D_mm / 2
    const r_s_m   = r_s_mm / 1000

    // O₂ tracking: deplete with mass consumed
    // dO2_mass/dt ≈ massLossRate * stoichO2Ratio
    // We track the fraction remaining relative to initial
    const o2Fraction = Math.max(0, o2Remaining / o2MassTotal)
    o2NearFlame = params.oxygenPercent * o2Fraction

    // Determine status
    let status: BurnStatus = 'burning'
    if (D2 <= 0.01) {
      status = 'burnout'
      if (!burnoutTime) burnoutTime = t
    } else if (
      o2NearFlame < minO2 ||
      isBlownOff ||
      T_flame_K * o2Fraction < mat.ignitionTempK
    ) {
      status = 'extinguished'
      if (!extinctionTime) extinctionTime = t
    }

    // Instantaneous burning rate from D² law:
    // m_dot = (π * rho_l * D²_m) / (2) * (K_m2s / D_m) ≈ π * r_s * rho_l * K_m2s / 2
    // Simplification: m_dot = rho_l * π * r_s_m² * K_m2s / r_s_m = rho_l * π * r_s_m * K_m2s
    const K_m2s_act = K_mm2s * 1e-6  // mm²/s → m²/s
    const massLossRate_kgs = status === 'burning'
      ? rhoS * Math.PI * r_s_m * K_m2s_act
      : 0
    const massLossRate_mgs = massLossRate_kgs * 1e6  // kg/s → mg/s

    // Heat release rate [W]
    const HRR = massLossRate_kgs * dHc  // W

    // Update O₂ inventory
    if (status === 'burning') {
      const o2Consumed_kg = massLossRate_kgs * mat.stoichO2Ratio * DT
      o2Remaining = Math.max(0, o2Remaining - o2Consumed_kg)
    }

    // Flame radius — scales with standoff ratio
    // Flame temperature also scales with available O₂
    const o2Scale = o2Fraction
    const sfR = standoffRatio(B * o2Scale, o2NearFlame / 100 * 32 / (o2NearFlame / 100 * 32 + (1 - o2NearFlame / 100) * 28), o2MFrac0)
    const flameR_mm = status === 'burning' ? r_s_mm * sfR : 0

    // Flame temperature (scales with O₂ availability)
    const T_f = status === 'burning'
      ? Math.max(mat.ignitionTempK, T_flame_K * Math.sqrt(o2Scale) * Math.sqrt(params.pressure))
      : T_AMBIENT

    // Surface temperature (pyrolysis front — between ambient and ignition temp)
    const T_surf = status === 'burning'
      ? mat.ignitionTempK + (T_f - mat.ignitionTempK) * 0.15
      : T_AMBIENT

    // Soot volume fraction [ppm]
    // Higher in high-gravity (soot oxidation suppressed in µg → less soot escapes)
    // Model: f_soot = sootIndex * HRR * g_factor / (soot_oxidation_rate)
    const gSootFactor = 0.3 + 0.7 * Math.min(params.gravity / G_EARTH, 1)
    const sootFraction = status === 'burning'
      ? mat.sootIndex * HRR * gSootFactor * 0.4
      : 0

    frames.push({
      time: t,
      sampleDiameter: D_mm,
      dSquared: D2,
      flameRadius: flameR_mm,
      flameTemperature: T_f,
      surfaceTemperature: T_surf,
      o2NearFlame,
      massLossRate: massLossRate_mgs,
      heatReleaseRate: HRR,
      sootVolumeFraction: sootFraction,
      flameAspectRatio: status === 'burning' ? AR : 1.0,
      status,
    })

    // Stop integration on burnout or extinction
    if (status !== 'burning') break
  }

  // ── Summary statistics ────────────────────────────────────────
  const burningFrames = frames.filter(f => f.status === 'burning')
  const totalMassLost =
    frames.reduce((acc, f) => acc + f.massLossRate * DT, 0)   // mg
  const avgHRR =
    burningFrames.length > 0
      ? burningFrames.reduce((a, f) => a + f.heatReleaseRate, 0) / burningFrames.length
      : 0
  const lastFrame = frames[frames.length - 1]
  const initMass = (4 / 3) * Math.PI * Math.pow((params.sampleDiameter / 2) / 1000, 3) * rhoS * 1e6  // mg
  const burntFraction = Math.min(1, totalMassLost / initMass)

  const summary = {
    burnoutTime,
    extinctionTime,
    extinguished: lastFrame.status === 'extinguished',
    maxFlameTemperature: Math.max(...frames.map(f => f.flameTemperature)),
    maxFlameRadius: Math.max(...frames.map(f => f.flameRadius)),
    totalMassLost,
    avgHeatReleaseRate: avgHRR,
    finalDiameter: lastFrame.sampleDiameter,
    burntFraction,
  }

  return { params, frames, summary, model: MODEL_INFO }
}

// ── Utility: interpolate a result to a specific time ───────────────
export function frameAtTime(result: SimulationResult, t: number): SimulationFrame {
  const { frames } = result
  if (frames.length === 0) throw new Error('Empty simulation result')
  if (t <= frames[0].time) return frames[0]
  if (t >= frames[frames.length - 1].time) return frames[frames.length - 1]

  const idx = frames.findIndex(f => f.time >= t)
  if (idx <= 0) return frames[0]

  const a = frames[idx - 1]
  const b = frames[idx]
  const alpha = (t - a.time) / (b.time - a.time)

  return {
    time: t,
    sampleDiameter:     a.sampleDiameter     + alpha * (b.sampleDiameter     - a.sampleDiameter),
    dSquared:           a.dSquared           + alpha * (b.dSquared           - a.dSquared),
    flameRadius:        a.flameRadius        + alpha * (b.flameRadius        - a.flameRadius),
    flameTemperature:   a.flameTemperature   + alpha * (b.flameTemperature   - a.flameTemperature),
    surfaceTemperature: a.surfaceTemperature + alpha * (b.surfaceTemperature - a.surfaceTemperature),
    o2NearFlame:        a.o2NearFlame        + alpha * (b.o2NearFlame        - a.o2NearFlame),
    massLossRate:       a.massLossRate       + alpha * (b.massLossRate       - a.massLossRate),
    heatReleaseRate:    a.heatReleaseRate    + alpha * (b.heatReleaseRate    - a.heatReleaseRate),
    sootVolumeFraction: a.sootVolumeFraction + alpha * (b.sootVolumeFraction - a.sootVolumeFraction),
    flameAspectRatio:   a.flameAspectRatio   + alpha * (b.flameAspectRatio   - a.flameAspectRatio),
    status: b.status,
  }
}

