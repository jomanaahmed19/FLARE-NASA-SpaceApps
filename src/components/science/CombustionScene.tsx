'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type {
  SimulationFrame,
  SimulationParams,
  VisualizationLayer,
  MaterialProperties,
} from '@/lib/simulation/types'

export interface CombustionSceneProps {
  currentFrame: SimulationFrame | null
  params?: SimulationParams
  activeLayer: VisualizationLayer
  isRunning: boolean
  material: MaterialProperties
  burntFraction: number
  cameraResetTrigger?: number
  onReady?: () => void
}

// ─── Unified Volumetric 3D Diffusion Flame Shaders ────────────────────────────
//
// Why this shader looks like a real physical flame instead of artificial nested rings:
// 1. Single Continuous Optical Field (NO nested concentric outlines):
//    - At the grazing edge of the 3D geometry (rim -> 1.0), opacity feathers
//      smoothly to ZERO (`smoothstep(0.98, 0.68, rim)`), eliminating hard geometric
//      shell edges.
//    - Just inside the soft outer edge (`rim ~ 0.52 - 0.78`) sits the single
//      stoichiometric CH* / OH* chemiluminescent reaction zone (cobalt-blue to
//      luminous cyan).
//    - Inside the reaction sheet (`rim < 0.52`), the optical profile transitions
//      smoothly and continuously (with zero dark band gaps):
//      • In quiescent microgravity (0g): into a semi-transparent pyrolysis vapor
//        stand-off zone ("dark zone") with a soft warm-cyan/amber inner glow so
//        the 3D solid fuel sphere remains clearly visible inside.
//      • In partial/Earth gravity (1g, Moon, Mars) or ventilated flow: the bottom
//        stagnation boundary layer stays a crisp translucent blue cradling the lower
//        hemisphere of the fuel sphere, while the upper plume fills with a continuous,
//        luminous yellow-amber-white blackbody soot core that tapers to a soft tip.

const VOLUMETRIC_FLAME_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uRadius;
  uniform float uBuoyancy;
  uniform float uAirflow;
  uniform float uScaleMult;
  uniform float uIsRunning;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLocalDir;
  varying float vHeightNorm;

  void main() {
    vec3 dir = normalize(position);
    vLocalDir = dir;

    // Combined convective stretch from gravity buoyancy + forced cabin airflow
    float conv = clamp(uBuoyancy + uAirflow * 1.25, 0.0, 1.55);
    float y = dir.y;
    float r = uRadius * uScaleMult;

    vec3 displaced = dir * r;

    if (y >= 0.0) {
      // Upper / downstream hemisphere: elongate upward and taper into a natural teardrop plume
      float stretchY = 1.0 + conv * 1.02;
      displaced.y = y * r * stretchY;

      // Smooth candle/plume tapering toward the upper tip
      float taper = mix(
        1.0,
        max(0.16, 1.0 - pow(y, 1.22) * min(0.84, conv * 0.62)),
        min(1.0, conv * 0.9)
      );
      displaced.x *= taper;
      displaced.z *= taper;
    } else {
      // Lower / upstream stagnation boundary layer: wraps closely beneath the fuel sphere
      float bottomCompress = 1.0 - min(0.44, conv * 0.32);
      displaced.y = y * r * bottomCompress;
      float lowerWidth = 1.0 - min(0.16, conv * 0.10) * abs(y);
      displaced.x *= lowerWidth;
      displaced.z *= lowerWidth;
    }

    // Subtle organic thermal & convective motion
    float speed = mix(0.6, 1.2, uIsRunning);
    float t = uTime * speed;

    // Gentle 0g acoustic/thermal breathing
    float breath = (
      sin(t * 2.0 + dir.x * 2.5 + dir.y * 2.0) * 0.010 +
      cos(t * 1.5 - dir.z * 2.5) * 0.008
    ) * uRadius;

    // Travelling buoyancy / shear waves along the upper plume
    float upperMask = smoothstep(-0.1, 0.9, y);
    float waveX = (
      sin(y * 5.5 - t * 3.8 + dir.z * 1.8) * 0.024 +
      sin(y * 9.5 - t * 5.6) * 0.010
    ) * conv * upperMask * uRadius;

    float waveZ = cos(y * 5.2 - t * 3.4 + dir.x * 1.8) * 0.020 * conv * upperMask * uRadius;

    displaced.x += waveX + dir.x * breath;
    displaced.z += waveZ + dir.z * breath;
    displaced.y += dir.y * breath * 0.7;

    vHeightNorm = clamp((y + 1.0) * 0.5, 0.0, 1.0);

    // Smooth surface normal for deformed teardrop (prevents pinch artifact at the upper pole)
    vec3 shapedNormal = normalize(vec3(
      dir.x,
      dir.y * mix(1.0, 0.52, step(0.0, y) * min(1.0, conv * 0.8)),
      dir.z
    ));

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * shapedNormal);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const VOLUMETRIC_FLAME_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uBuoyancy;
  uniform float uAirflow;
  uniform float uSootStrength;
  uniform float uOxygenNorm;
  uniform float uTempNorm;
  uniform float uOpacity;
  uniform int uLayerMode; // 0: structure, 1: temperature, 2: airflow, 3: oxygen, 4: soot

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vLocalDir;
  varying float vHeightNorm;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float ndotv = clamp(abs(dot(normal, viewDir)), 0.0, 1.0);

    // rim = 0.0 at the center of the sphere, 1.0 at the grazing outer edge
    float rim = 1.0 - ndotv;

    float conv = clamp(uBuoyancy + uAirflow * 1.25, 0.0, 1.55);
    float upperPlume = smoothstep(0.32, 0.86, vHeightNorm);
    float lowerBase = 1.0 - smoothstep(0.08, 0.50, vHeightNorm);

    // Feather the very top plume tip in convective regimes so there is never a sharp geometric point
    float tipFeather = mix(1.0, smoothstep(0.995, 0.86, vHeightNorm), min(1.0, conv * 0.85));

    // 1. Soft outer edge feathering: fades smoothly to 0 at rim -> 1.0
    float outerFade = smoothstep(0.99, 0.64, rim) * tipFeather;

    // 2. Single broad reaction zone profile (peaks smoothly around rim = 0.62, no narrow ring spikes!)
    float reactionZone = smoothstep(0.18, 0.62, rim) * outerFade;

    // 3. Volumetric interior fill (strongest in the core/plume, fading smoothly to the outer boundary)
    float coreVolume = pow(ndotv, 0.85) * smoothstep(0.98, 0.42, rim) * tipFeather;

    // 4. Pyrolysis stand-off window around the solid fuel sphere (lower-center region)
    //    Keeps the region immediately over the solid fuel sphere semi-transparent so the 3D sphere is visible inside
    float standOffTransparency = mix(
      smoothstep(0.0, 0.56, rim),
      1.0,
      upperPlume * min(0.92, conv * 0.78 + uSootStrength * 0.35)
    );

    vec3 color = vec3(0.0);
    float alpha = 0.0;

    if (uLayerMode == 0) {
      // ── MODE 0: Realistic Flame Appearance (CH* Chemiluminescence + Blackbody Soot) ──
      vec3 deepCobalt = vec3(0.02, 0.32, 0.78);
      vec3 luminousCyan = vec3(0.22, 0.76, 0.98);
      vec3 paleCyanRim = vec3(0.65, 0.92, 1.0);

      vec3 warmAmber = vec3(0.96, 0.44, 0.05);
      vec3 goldenSoot = vec3(0.99, 0.75, 0.16);
      vec3 incandescentWhite = vec3(1.0, 0.96, 0.82);

      // Base blue-cyan chemiluminescent reaction sheet
      vec3 blueSheet = mix(deepCobalt, luminousCyan, smoothstep(0.25, 0.68, rim));
      blueSheet = mix(blueSheet, paleCyanRim, smoothstep(0.55, 0.76, rim) * 0.55);

      // Inner warm pyrolysis / soot luminescence
      float innerSootFactor = clamp(
        upperPlume * min(1.0, conv * 0.92 + uSootStrength * 0.55 + uOxygenNorm * 0.35) +
        (1.0 - rim) * (uSootStrength * 0.42 + uOxygenNorm * 0.28 + 0.14),
        0.0,
        1.0
      );
      // Keep the bottom stagnation boundary layer crisp blue even in 1g
      innerSootFactor *= (1.0 - lowerBase * min(0.86, conv * 0.72));
      // In 0g, keep the outer stoichiometric shell blue-cyan; in 1g, let the upper plume glow warm amber to the edge
      float rimBlueCutoff = mix(0.80, 0.95, upperPlume * min(1.0, conv * 0.85));
      innerSootFactor *= smoothstep(rimBlueCutoff, 0.36, rim);

      vec3 sootColor = mix(warmAmber, goldenSoot, smoothstep(0.18, 0.62, upperPlume * 0.72 + (1.0 - rim) * 0.38));
      sootColor = mix(sootColor, incandescentWhite, smoothstep(0.52, 0.90, upperPlume * (0.58 + uTempNorm * 0.42) + uOxygenNorm * 0.4) * (1.0 - rim * 0.55));

      color = mix(blueSheet, sootColor, innerSootFactor);

      // Continuous volumetric opacity (no gaps!)
      float baseAlpha = reactionZone * 0.88 + coreVolume * (0.24 + upperPlume * min(0.72, conv * 0.58 + uSootStrength * 0.32));
      alpha = clamp(baseAlpha * mix(0.24, 1.0, standOffTransparency), 0.0, 0.95) * outerFade * uOpacity;

    } else if (uLayerMode == 1) {
      // ── MODE 1: Calibrated Temperature Map (Infrared Thermography) ──
      // Continuous thermal gradient from cool outer boundary (blue/teal) to peak reaction sheet & upper core (orange -> yellow-white)
      float tempIntensity = clamp(
        reactionZone * 0.78 + coreVolume * (0.35 + upperPlume * 0.55) * (0.7 + uTempNorm * 0.3),
        0.0,
        1.0
      );
      vec3 tLow = vec3(0.08, 0.28, 0.82);
      vec3 tMid = vec3(0.04, 0.72, 0.84);
      vec3 tHigh = vec3(0.98, 0.52, 0.08);
      vec3 tPeak = vec3(1.0, 0.97, 0.82);

      vec3 c1 = mix(tLow, tMid, smoothstep(0.05, 0.38, tempIntensity));
      vec3 c2 = mix(c1, tHigh, smoothstep(0.38, 0.68, tempIntensity));
      color = mix(c2, tPeak, smoothstep(0.68, 0.95, tempIntensity));
      alpha = clamp((reactionZone * 0.85 + coreVolume * 0.48) * mix(0.35, 1.0, standOffTransparency), 0.0, 0.92) * outerFade * uOpacity;

    } else if (uLayerMode == 2) {
      // ── MODE 2: Airflow & Diffusion Transport ──
      float wave = 0.5 + 0.5 * sin(vHeightNorm * 16.0 - uTime * (2.2 + conv * 2.8));
      vec3 flowDeep = vec3(0.02, 0.46, 0.72);
      vec3 flowBright = vec3(0.32, 0.88, 0.98);
      color = mix(flowDeep, flowBright, reactionZone * 0.65 + wave * 0.35);
      alpha = clamp((reactionZone * 0.72 + coreVolume * 0.24) * mix(0.25, 1.0, standOffTransparency), 0.0, 0.84) * outerFade * uOpacity;

    } else if (uLayerMode == 3) {
      // ── MODE 3: Oxygen Concentration Zone (Blue O2 Exterior -> Cyan Stoichiometric Sheet -> Red Anoxic Fuel Core) ──
      vec3 o2Rich = vec3(0.22, 0.55, 0.98);
      vec3 stoichCyan = vec3(0.55, 0.88, 1.0);
      vec3 anoxicRed = vec3(0.88, 0.20, 0.24);

      color = mix(anoxicRed, o2Rich, smoothstep(0.22, 0.70, rim));
      color = mix(color, stoichCyan, smoothstep(0.48, 0.68, rim) * (1.0 - smoothstep(0.68, 0.85, rim)) * 0.7);
      alpha = clamp((reactionZone * 0.80 + coreVolume * 0.42) * mix(0.38, 1.0, standOffTransparency), 0.0, 0.90) * outerFade * uOpacity;

    } else {
      // ── MODE 4: Soot & Radiative Particulates ──
      vec3 sootDeep = vec3(0.78, 0.34, 0.04);
      vec3 sootGold = vec3(0.99, 0.78, 0.20);
      float sootField = clamp(coreVolume * (0.45 + upperPlume * 0.55) + reactionZone * 0.35, 0.0, 1.0);
      color = mix(sootDeep, sootGold, sootField);
      alpha = clamp((coreVolume * 0.68 + reactionZone * 0.45) * (0.45 + uSootStrength * 0.55) * mix(0.32, 1.0, standOffTransparency), 0.0, 0.90) * outerFade * uOpacity;
    }

    gl_FragColor = vec4(color, alpha);
  }
`

// Soft Atmospheric Outer Glow Shader (Pure smooth radial falloff, ZERO ring edge)
const ATMOSPHERIC_GLOW_FRAGMENT_SHADER = /* glsl */ `
  uniform float uBuoyancy;
  uniform float uAirflow;
  uniform float uSootStrength;
  uniform float uOpacity;
  uniform int uLayerMode;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vHeightNorm;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float ndotv = clamp(abs(dot(normal, viewDir)), 0.0, 1.0);

    // Pure bell-shaped glow that is 0 at the outer mesh boundary (ndotv = 0) and soft inside
    float conv = clamp(uBuoyancy + uAirflow * 1.25, 0.0, 1.55);
    float tipFeather = mix(1.0, smoothstep(0.98, 0.82, vHeightNorm), min(1.0, conv * 0.85));
    float softBloom = pow(ndotv, 2.4) * (1.0 - pow(ndotv, 3.5) * 0.65) * tipFeather;

    float upperPlume = smoothstep(0.4, 0.9, vHeightNorm);

    vec3 glowBlue = vec3(0.04, 0.52, 0.88);
    vec3 glowAmber = vec3(0.95, 0.52, 0.12);
    vec3 col = mix(glowBlue, glowAmber, upperPlume * min(0.85, conv * 0.65 + uSootStrength * 0.4));

    if (uLayerMode == 1) col = vec3(0.15, 0.45, 0.92);
    if (uLayerMode == 4) col = vec3(0.92, 0.48, 0.08);

    float alpha = softBloom * 0.38 * uOpacity;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.35));
  }
`

// ─── Smooth Camera Controller & Reset Handler ────────────────────────────────

function CameraRig({ resetTrigger }: { resetTrigger?: number }) {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  useEffect(() => {
    if (resetTrigger === undefined || resetTrigger === 0) return
    camera.position.set(0, 0.06, 2.85)
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.04, 0)
      controlsRef.current.update()
    }
  }, [resetTrigger, camera])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.65}
      minDistance={1.55}
      maxDistance={5.2}
      target={[0, 0.04, 0]}
    />
  )
}

// ─── Convective & Diffusive Flow Streamlines (Airflow Layer) ─────────────────

function FlowStreamlines({
  radius,
  buoyancy,
  airflowVelocity,
  isRunning,
}: {
  radius: number
  buoyancy: number
  airflowVelocity: number
  isRunning: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const conv = Math.min(1.6, buoyancy + airflowVelocity * 2.8)

  const lines = useMemo(() => {
    const count = 10
    const result: { points: [number, number, number][]; color: string }[] = []

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const pts: [number, number, number][] = []

      if (conv < 0.12) {
        const elev = ((i % 3) - 1) * 0.42
        for (let s = 0; s <= 12; s++) {
          const frac = s / 12
          const dist = radius * (0.52 + frac * 0.88)
          pts.push([
            cosA * dist * Math.cos(elev),
            Math.sin(elev) * dist,
            sinA * dist * Math.cos(elev),
          ])
        }
        result.push({ points: pts, color: i % 2 === 0 ? '#38bdf8' : '#22d3ee' })
      } else {
        const radialOffset = radius * (0.64 + (i % 2) * 0.22)
        for (let s = 0; s <= 18; s++) {
          const t = (s / 18) * 2 - 1
          const y = t * radius * (1.05 + conv * 0.48)
          const deflection = Math.exp(-t * t * 2.4) * 0.38
          const wakeTaper = t > 0 ? Math.max(0.32, 1.0 - t * 0.45) : 1.0
          const rHoriz = radialOffset * (1.0 + deflection) * wakeTaper
          pts.push([cosA * rHoriz, y, sinA * rHoriz])
        }
        result.push({ points: pts, color: i % 2 === 0 ? '#22d3ee' : '#38bdf8' })
      }
    }
    return result
  }, [radius, conv])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (isRunning ? 0.22 : 0.06)
    }
  })

  return (
    <group ref={groupRef}>
      {lines.map((line, idx) => (
        <Line
          key={idx}
          points={line.points}
          color={line.color}
          lineWidth={1.5}
          transparent
          opacity={0.5}
        />
      ))}
    </group>
  )
}

// ─── Incandescent Soot & Thermal Micro-Particles ─────────────────────────────

interface SootFieldProps {
  count: number
  radius: number
  buoyancy: number
  airflowVelocity: number
  isRunning: boolean
  color: string
  opacity: number
}

function SootParticleField({
  count,
  radius,
  buoyancy,
  airflowVelocity,
  isRunning,
  color,
  opacity,
}: SootFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const seeds = useMemo(() => {
    const arr = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const u = Math.random() * 2 - 1
      const phi = Math.acos(u)
      const rFrac = 0.42 + Math.random() * 0.46
      arr[i * 4] = theta
      arr[i * 4 + 1] = phi
      arr[i * 4 + 2] = rFrac
      arr[i * 4 + 3] = Math.random() * 10
    }
    return arr
  }, [count])

  const positions = useMemo(() => new Float32Array(count * 3), [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime * (isRunning ? 1.0 : 0.35)
    const conv = Math.min(1.55, buoyancy + airflowVelocity * 2.5)
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array

    for (let i = 0; i < count; i++) {
      const theta = seeds[i * 4] + t * 0.16
      const phi = seeds[i * 4 + 1]
      const baseR = seeds[i * 4 + 2]
      const phase = seeds[i * 4 + 3]

      const cycle = (t * (0.25 + conv * 0.30) + phase) % 1.0
      const r = radius * (0.36 + baseR * 0.48)

      const sinPhi = Math.sin(phi)
      const cosPhi = Math.cos(phi)

      let x = r * sinPhi * Math.cos(theta)
      let y = r * cosPhi
      let z = r * sinPhi * Math.sin(theta)

      if (conv > 0.08) {
        y = y * 0.48 + cycle * radius * (0.85 + conv * 0.65)
        const heightFrac = Math.max(0, Math.min(1, y / (radius * (1.0 + conv * 0.7))))
        const taper = Math.max(0.20, 1.0 - heightFrac * 0.68)
        x *= taper
        z *= taper
      } else {
        const radialDrift = 0.88 + 0.14 * Math.sin(t * 1.4 + phase)
        x *= radialDrift
        y *= radialDrift
        z *= radialDrift
      }

      arr[i * 3] = x
      arr[i * 3 + 1] = y
      arr[i * 3 + 2] = z
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ─── Subtle Chamber Reference Ring ───────────────────────────────────────────

function ChamberReferenceGrid() {
  const ringPoints = useMemo(() => {
    const pts: [number, number, number][] = []
    const r = 1.32
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2
      pts.push([Math.cos(a) * r, -0.78, Math.sin(a) * r])
    }
    return pts
  }, [])

  return (
    <group>
      <Line points={ringPoints} color="#1e3a5f" lineWidth={1} transparent opacity={0.28} />
    </group>
  )
}

// ─── Main 3D Combustion Phenomenon Scene Contents ────────────────────────────

function SceneContents({
  currentFrame,
  params,
  activeLayer,
  isRunning,
  material,
  burntFraction,
  cameraResetTrigger,
}: CombustionSceneProps) {
  const assemblyGroupRef = useRef<THREE.Group>(null)
  const flameMatRef = useRef<THREE.ShaderMaterial>(null)
  const bloomMatRef = useRef<THREE.ShaderMaterial>(null)
  const fuelMeshRef = useRef<THREE.Mesh>(null)
  const flameLightRef = useRef<THREE.PointLight>(null)

  const isExtinguished =
    currentFrame?.status === 'extinguished' || currentFrame?.status === 'burnout'

  // Balanced physical scale so both 0g spheres and 1g plumes fit comfortably inside the viewport
  const targetSampleRadius = currentFrame
    ? Math.max(0.11, (currentFrame.sampleDiameter / 2) * 0.072)
    : Math.max(0.11, ((params?.sampleDiameter ?? 6) / 2) * 0.072 * (1 - burntFraction * 0.65))

  const targetFlameRadius =
    currentFrame && !isExtinguished
      ? Math.max(0.42, Math.min(0.76, currentFrame.flameRadius * 0.074))
      : isExtinguished
      ? 0.01
      : 0.56

  const targetAspectRatio = currentFrame ? currentFrame.flameAspectRatio : 1.02
  const targetGravity = params?.gravity ?? (targetAspectRatio > 1.15 ? 9.81 : 0.001)
  const targetAirflow = params?.airflowVelocity ?? 0.0
  const targetOxygen = params?.oxygenPercent ?? 21
  const targetTemp = currentFrame?.flameTemperature ?? 1550
  const targetSurfaceTemp = currentFrame?.surfaceTemperature ?? 620
  const targetSoot = currentFrame
    ? Math.min(1.0, currentFrame.sootVolumeFraction / 2.2 + material.sootIndex * 0.5)
    : material.sootIndex

  const lerped = useRef({
    sampleRadius: targetSampleRadius,
    flameRadius: targetFlameRadius,
    buoyancy: Math.max(0, Math.pow(targetGravity / 9.81, 0.52) * 0.95),
    airflow: targetAirflow * 2.0,
    oxygenNorm: Math.min(1, Math.max(0, (targetOxygen - 15) / 35)),
    tempNorm: Math.min(1, Math.max(0, (targetTemp - 1100) / 1100)),
    sootStrength: targetSoot,
    opacity: isExtinguished ? 0 : 1,
    groupOffsetY: 0,
  })

  const layerModeIndex = useMemo(() => {
    const map: Record<VisualizationLayer, number> = {
      structure: 0,
      temperature: 1,
      airflow: 2,
      oxygen: 3,
      soot: 4,
    }
    return map[activeLayer]
  }, [activeLayer])

  const flameUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRadius: { value: 0.56 },
      uBuoyancy: { value: 0 },
      uAirflow: { value: 0 },
      uScaleMult: { value: 1.0 },
      uIsRunning: { value: 1 },
      uSootStrength: { value: 0.25 },
      uOxygenNorm: { value: 0.2 },
      uTempNorm: { value: 0.5 },
      uOpacity: { value: 0.96 },
      uLayerMode: { value: 0 },
    }),
    []
  )

  const bloomUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRadius: { value: 0.56 },
      uBuoyancy: { value: 0 },
      uAirflow: { value: 0 },
      uScaleMult: { value: 1.32 },
      uIsRunning: { value: 1 },
      uSootStrength: { value: 0.25 },
      uOpacity: { value: 0.85 },
      uLayerMode: { value: 0 },
    }),
    []
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const speed = 5.5 * dt
    const s = lerped.current

    const desiredBuoyancy = Math.max(
      0,
      Math.pow(targetGravity / 9.81, 0.52) * 0.95 + (targetAspectRatio - 1) * 0.22
    )
    const desiredAirflow = targetAirflow * 2.0
    const desiredOpacity = isExtinguished ? 0.0 : 1.0
    const desiredOffsetY = -Math.min(0.22, (desiredBuoyancy + desiredAirflow) * 0.14)

    s.sampleRadius = THREE.MathUtils.lerp(s.sampleRadius, targetSampleRadius, speed)
    s.flameRadius = THREE.MathUtils.lerp(s.flameRadius, targetFlameRadius, speed)
    s.buoyancy = THREE.MathUtils.lerp(s.buoyancy, desiredBuoyancy, speed)
    s.airflow = THREE.MathUtils.lerp(s.airflow, desiredAirflow, speed)
    s.oxygenNorm = THREE.MathUtils.lerp(
      s.oxygenNorm,
      Math.min(1, Math.max(0, (targetOxygen - 15) / 35)),
      speed
    )
    s.tempNorm = THREE.MathUtils.lerp(
      s.tempNorm,
      Math.min(1, Math.max(0, (targetTemp - 1100) / 1100)),
      speed
    )
    s.sootStrength = THREE.MathUtils.lerp(s.sootStrength, targetSoot, speed)
    s.opacity = THREE.MathUtils.lerp(s.opacity, desiredOpacity, speed * 1.2)
    s.groupOffsetY = THREE.MathUtils.lerp(s.groupOffsetY, desiredOffsetY, speed)

    if (assemblyGroupRef.current) {
      assemblyGroupRef.current.position.y = s.groupOffsetY
    }

    const elapsed = state.clock.elapsedTime
    const runFlag = isRunning ? 1.0 : 0.45

    if (fuelMeshRef.current) {
      fuelMeshRef.current.scale.setScalar(s.sampleRadius)
    }

    if (flameMatRef.current) {
      const u = flameMatRef.current.uniforms
      u.uTime.value = elapsed
      u.uRadius.value = s.flameRadius
      u.uBuoyancy.value = s.buoyancy
      u.uAirflow.value = s.airflow
      u.uIsRunning.value = runFlag
      u.uSootStrength.value = s.sootStrength
      u.uOxygenNorm.value = s.oxygenNorm
      u.uTempNorm.value = s.tempNorm
      u.uOpacity.value = 0.96 * s.opacity
      u.uLayerMode.value = layerModeIndex
    }

    if (bloomMatRef.current) {
      const u = bloomMatRef.current.uniforms
      u.uTime.value = elapsed
      u.uRadius.value = s.flameRadius
      u.uBuoyancy.value = s.buoyancy
      u.uAirflow.value = s.airflow
      u.uIsRunning.value = runFlag
      u.uSootStrength.value = s.sootStrength
      u.uOpacity.value = 0.85 * s.opacity
      u.uLayerMode.value = layerModeIndex
    }

    if (flameLightRef.current) {
      const flicker = 1.0 + Math.sin(elapsed * 7.0) * 0.04 + Math.cos(elapsed * 4.1) * 0.03
      flameLightRef.current.intensity = (0.55 + s.tempNorm * 0.45) * s.opacity * flicker
    }
  })

  // Realistic 3D fuel sphere shading: clearly visible 3D curvature + subtle pyrolysis glow
  const fuelBaseColor = useMemo(() => {
    const raw = new THREE.Color('#1e293b').lerp(new THREE.Color(material.colors.sample), 0.34)
    const char = new THREE.Color(material.colors.sampleBurned || '#0f172a')
    return raw.lerp(char, Math.min(1, burntFraction * 0.85))
  }, [material.colors.sample, material.colors.sampleBurned, burntFraction])

  const pyrolysisGlowIntensity = isExtinguished
    ? 0.02
    : Math.min(0.24, Math.max(0.10, (targetSurfaceTemp - 380) / 950))

  const convForParticles = Math.max(
    0,
    Math.pow(targetGravity / 9.81, 0.52) * 0.95 + (targetAspectRatio - 1) * 0.22
  )

  return (
    <>
      <CameraRig resetTrigger={cameraResetTrigger} />

      {/* Balanced Scientific Chamber Lighting for Clear 3D Solid Sphere Curvature */}
      <ambientLight intensity={0.38} color="#94a3b8" />
      <directionalLight position={[2.4, 2.2, 2.8]} intensity={0.68} color="#e2e8f0" />
      <directionalLight position={[-2.5, -1.8, -2.0]} intensity={0.35} color="#38bdf8" />
      <pointLight
        ref={flameLightRef}
        position={[0, 0.45, 1.35]}
        intensity={0.65}
        color={targetGravity > 0.5 || targetOxygen > 26 ? '#fbbf24' : '#38bdf8'}
        distance={4.8}
      />

      <ChamberReferenceGrid />

      <group ref={assemblyGroupRef}>
        {/* Fine Quartz Filament Sting Holder (NASA FLEX-2 / BASS Sample Mount) */}
        <group position={[0, -0.52, 0]}>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.007, 0.011, 0.62, 16]} />
            <meshStandardMaterial
              color="#94a3b8"
              metalness={0.4}
              roughness={0.22}
              transparent
              opacity={0.75}
            />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.028, 0.042, 0.22, 20]} />
            <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.28} />
          </mesh>
        </group>

        {/* Solid 3D Fuel Sphere at Center (Shaded 3D sphere, NOT a flat bright sticker) */}
        <mesh ref={fuelMeshRef} scale={targetSampleRadius}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial
            color={fuelBaseColor}
            roughness={0.78 + burntFraction * 0.18}
            metalness={0.05}
            emissive="#c2410c"
            emissiveIntensity={pyrolysisGlowIntensity}
          />
        </mesh>

        {/* ── Unified Volumetric 3D Diffusion Flame (Continuous Optical Field) ── */}
        {!isExtinguished && (
          <group>
            {/* Soft Atmospheric Outer Glow (Pure smooth falloff, zero ring edge) */}
            <mesh renderOrder={1}>
              <sphereGeometry args={[1, 48, 48]} />
              <shaderMaterial
                ref={bloomMatRef}
                vertexShader={VOLUMETRIC_FLAME_VERTEX_SHADER}
                fragmentShader={ATMOSPHERIC_GLOW_FRAGMENT_SHADER}
                uniforms={bloomUniforms}
                transparent
                depthWrite={false}
                side={THREE.FrontSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Primary Unified Volumetric Flame Envelope */}
            <mesh renderOrder={2}>
              <sphereGeometry args={[1, 64, 64]} />
              <shaderMaterial
                ref={flameMatRef}
                vertexShader={VOLUMETRIC_FLAME_VERTEX_SHADER}
                fragmentShader={VOLUMETRIC_FLAME_FRAGMENT_SHADER}
                uniforms={flameUniforms}
                transparent
                depthWrite={false}
                side={THREE.FrontSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        )}

        {/* Convective / Diffusive Streamlines when "Airflow" diagnostic layer is selected */}
        {activeLayer === 'airflow' && !isExtinguished && (
          <FlowStreamlines
            radius={targetFlameRadius}
            buoyancy={convForParticles}
            airflowVelocity={targetAirflow}
            isRunning={isRunning}
          />
        )}

        {/* Fine Incandescent Soot & Thermal Micro-Particles */}
        {!isExtinguished && (
          <SootParticleField
            count={activeLayer === 'soot' ? 95 : 42}
            radius={targetFlameRadius}
            buoyancy={convForParticles}
            airflowVelocity={targetAirflow}
            isRunning={isRunning}
            color={
              activeLayer === 'airflow'
                ? '#38bdf8'
                : activeLayer === 'oxygen'
                ? '#60a5fa'
                : '#fbbf24'
            }
            opacity={activeLayer === 'soot' ? 0.72 : 0.36}
          />
        )}
      </group>
    </>
  )
}

// ─── Exported Canvas Component ──────────────────────────────────────────────

export default function CombustionScene(props: CombustionSceneProps) {
  return (
    <div
      className="w-full h-full relative select-none"
      role="region"
      aria-label="Interactive 3D Microgravity Combustion Visualization"
    >
      <Canvas
        camera={{ position: [0, 0.06, 2.85], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
        }}
        style={{ background: 'transparent' }}
        onCreated={() => {
          props.onReady?.()
        }}
      >
        <SceneContents {...props} />
      </Canvas>
    </div>
  )
}
