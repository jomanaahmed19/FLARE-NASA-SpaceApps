'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'

export type FontScaleStep = 'small' | 'default' | 'large' | 'xlarge'
export type ReducedMotionPref = 'system' | 'on' | 'off'

export interface AccessibilityPreferences {
  fontScale: FontScaleStep
  highContrast: boolean
  reducedMotion: ReducedMotionPref
  enhancedFocus: boolean
  largeControls: boolean
  readableSpacing: boolean
  updatedAt: number
}

export const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPreferences = {
  fontScale: 'default',
  highContrast: false,
  reducedMotion: 'system',
  enhancedFocus: false,
  largeControls: false,
  readableSpacing: false,
  updatedAt: 0,
}

export const ACCESSIBILITY_STORAGE_KEY = 'flare-a11y-prefs-v1'
const BROADCAST_CHANNEL_NAME = 'flare-a11y-sync'

export const FONT_SCALE_MAP: Record<FontScaleStep, { scale: number; label: string; percent: string }> = {
  small:   { scale: 0.92, label: 'Compact',     percent: '92%' },
  default: { scale: 1.0,  label: 'Standard',    percent: '100%' },
  large:   { scale: 1.12, label: 'Large',       percent: '112%' },
  xlarge:  { scale: 1.24, label: 'Extra Large', percent: '124%' },
}

const FONT_SCALE_ORDER: FontScaleStep[] = ['small', 'default', 'large', 'xlarge']

interface AccessibilityContextValue {
  prefs: AccessibilityPreferences
  effectiveReducedMotion: boolean
  hasCustomPrefs: boolean
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
  toggleModal: () => void
  updatePrefs: (patch: Partial<Omit<AccessibilityPreferences, 'updatedAt'>>) => void
  increaseTextSize: () => void
  decreaseTextSize: () => void
  resetTextSize: () => void
  resetAllPreferences: () => void
  getShareableUrl: () => string
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

function sanitizePrefs(raw: unknown): AccessibilityPreferences {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_ACCESSIBILITY_PREFS }
  const obj = raw as Record<string, unknown>
  const fontScale: FontScaleStep =
    obj.fontScale === 'small' ||
    obj.fontScale === 'default' ||
    obj.fontScale === 'large' ||
    obj.fontScale === 'xlarge'
      ? obj.fontScale
      : 'default'

  const reducedMotion: ReducedMotionPref =
    obj.reducedMotion === 'system' || obj.reducedMotion === 'on' || obj.reducedMotion === 'off'
      ? obj.reducedMotion
      : 'system'

  return {
    fontScale,
    highContrast: Boolean(obj.highContrast),
    reducedMotion,
    enhancedFocus: Boolean(obj.enhancedFocus),
    largeControls: Boolean(obj.largeControls),
    readableSpacing: Boolean(obj.readableSpacing),
    updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now(),
  }
}

export function applyAccessibilityAttributesToDocument(
  prefs: AccessibilityPreferences,
  osPrefersReducedMotion: boolean
) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const scaleObj = FONT_SCALE_MAP[prefs.fontScale] ?? FONT_SCALE_MAP.default
  const effectiveReduced =
    prefs.reducedMotion === 'on' ||
    (prefs.reducedMotion === 'system' && osPrefersReducedMotion)

  root.style.setProperty('--flare-font-scale', String(scaleObj.scale))
  root.setAttribute('data-a11y-font-scale', prefs.fontScale)
  root.setAttribute('data-a11y-high-contrast', prefs.highContrast ? 'true' : 'false')
  root.setAttribute('data-a11y-reduced-motion', effectiveReduced ? 'true' : 'false')
  root.setAttribute('data-a11y-enhanced-focus', prefs.enhancedFocus ? 'true' : 'false')
  root.setAttribute('data-a11y-large-controls', prefs.largeControls ? 'true' : 'false')
  root.setAttribute('data-a11y-readable-spacing', prefs.readableSpacing ? 'true' : 'false')
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_ACCESSIBILITY_PREFS
    try {
      // 1. Check if URL contains ?a11y= portable cross-device profile parameter
      const sp = new URLSearchParams(window.location.search)
      const urlParam = sp.get('a11y')
      if (urlParam) {
        const decoded = JSON.parse(atob(urlParam))
        const clean = sanitizePrefs(decoded)
        window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(clean))
        return clean
      }
      // 2. Otherwise load from persistent localStorage
      const saved = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)
      if (saved) {
        return sanitizePrefs(JSON.parse(saved))
      }
    } catch {
      // Ignore storage or parse errors in private browsing
    }
    return DEFAULT_ACCESSIBILITY_PREFS
  })

  const [osReducedMotion, setOsReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  const [isModalOpen, setIsModalOpen] = useState(false)

  // Listen to OS prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => setOsReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Apply attributes to <html> immediately whenever preferences or OS setting change
  useEffect(() => {
    applyAccessibilityAttributesToDocument(prefs, osReducedMotion)
  }, [prefs, osReducedMotion])

  // Synchronize across tabs/windows on the same device via storage event + BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorage = (e: StorageEvent) => {
      if (e.key === ACCESSIBILITY_STORAGE_KEY && e.newValue) {
        try {
          setPrefs(sanitizePrefs(JSON.parse(e.newValue)))
        } catch {
          // Ignore malformed storage payload
        }
      }
    }
    window.addEventListener('storage', handleStorage)

    let bc: BroadcastChannel | null = null
    if ('BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
        bc.onmessage = (ev) => {
          if (ev.data && typeof ev.data === 'object') {
            setPrefs(sanitizePrefs(ev.data))
          }
        }
      } catch {
        bc = null
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorage)
      if (bc) bc.close()
    }
  }, [])

  const persistAndBroadcast = useCallback((next: AccessibilityPreferences) => {
    setPrefs(next)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore quota errors
      }
      if ('BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
          bc.postMessage(next)
          bc.close()
        } catch {
          // Ignore broadcast errors
        }
      }
    }
  }, [])

  const updatePrefs = useCallback(
    (patch: Partial<Omit<AccessibilityPreferences, 'updatedAt'>>) => {
      setPrefs((prev) => {
        const next: AccessibilityPreferences = {
          ...prev,
          ...patch,
          updatedAt: Date.now(),
        }
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(next))
          } catch {
            // Ignore
          }
          if ('BroadcastChannel' in window) {
            try {
              const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
              bc.postMessage(next)
              bc.close()
            } catch {
              // Ignore
            }
          }
        }
        return next
      })
    },
    []
  )

  const increaseTextSize = useCallback(() => {
    const idx = FONT_SCALE_ORDER.indexOf(prefs.fontScale)
    if (idx < FONT_SCALE_ORDER.length - 1) {
      updatePrefs({ fontScale: FONT_SCALE_ORDER[idx + 1] })
    }
  }, [prefs.fontScale, updatePrefs])

  const decreaseTextSize = useCallback(() => {
    const idx = FONT_SCALE_ORDER.indexOf(prefs.fontScale)
    if (idx > 0) {
      updatePrefs({ fontScale: FONT_SCALE_ORDER[idx - 1] })
    }
  }, [prefs.fontScale, updatePrefs])

  const resetTextSize = useCallback(() => {
    updatePrefs({ fontScale: 'default' })
  }, [updatePrefs])

  const resetAllPreferences = useCallback(() => {
    persistAndBroadcast({ ...DEFAULT_ACCESSIBILITY_PREFS, updatedAt: Date.now() })
  }, [persistAndBroadcast])

  const getShareableUrl = useCallback(() => {
    if (typeof window === 'undefined') return ''
    const url = new URL(window.location.href)
    const payload = btoa(
      JSON.stringify({
        fontScale: prefs.fontScale,
        highContrast: prefs.highContrast,
        reducedMotion: prefs.reducedMotion,
        enhancedFocus: prefs.enhancedFocus,
        largeControls: prefs.largeControls,
        readableSpacing: prefs.readableSpacing,
      })
    )
    url.searchParams.set('a11y', payload)
    return url.toString()
  }, [prefs])

  const effectiveReducedMotion =
    prefs.reducedMotion === 'on' ||
    (prefs.reducedMotion === 'system' && osReducedMotion)

  const hasCustomPrefs =
    prefs.fontScale !== 'default' ||
    prefs.highContrast ||
    prefs.reducedMotion !== 'system' ||
    prefs.enhancedFocus ||
    prefs.largeControls ||
    prefs.readableSpacing

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      prefs,
      effectiveReducedMotion,
      hasCustomPrefs,
      isModalOpen,
      openModal: () => setIsModalOpen(true),
      closeModal: () => setIsModalOpen(false),
      toggleModal: () => setIsModalOpen((v) => !v),
      updatePrefs,
      increaseTextSize,
      decreaseTextSize,
      resetTextSize,
      resetAllPreferences,
      getShareableUrl,
    }),
    [
      prefs,
      effectiveReducedMotion,
      hasCustomPrefs,
      isModalOpen,
      updatePrefs,
      increaseTextSize,
      decreaseTextSize,
      resetTextSize,
      resetAllPreferences,
      getShareableUrl,
    ]
  )

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) {
    return {
      prefs: DEFAULT_ACCESSIBILITY_PREFS,
      effectiveReducedMotion: false,
      hasCustomPrefs: false,
      isModalOpen: false,
      openModal: () => {},
      closeModal: () => {},
      toggleModal: () => {},
      updatePrefs: () => {},
      increaseTextSize: () => {},
      decreaseTextSize: () => {},
      resetTextSize: () => {},
      resetAllPreferences: () => {},
      getShareableUrl: () => '',
    }
  }
  return ctx
}

