import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AccessibilityProvider } from '@/context/AccessibilityContext'
import { AccessibilityControlModal } from '@/components/ui/AccessibilityControlModal'

export const metadata: Metadata = {
  title: 'FLARE — Fire & Life-Safety Analysis and Risk Explorer',
  description:
    'Explore how fire behaves beyond Earth through interactive scientific simulations and NASA research. Created by Team WUNDERBAO for the NASA Space Apps Challenge 2026.',
  keywords: ['FLARE', 'fire safety', 'space', 'NASA', 'combustion', 'microgravity', 'WUNDERBAO'],
  authors: [{ name: 'Team WUNDERBAO' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#030712',
}

const A11Y_INIT_SCRIPT = `
(function() {
  try {
    var root = document.documentElement;
    var scaleMap = { small: 0.92, default: 1.0, large: 1.12, xlarge: 1.24 };
    var raw = localStorage.getItem('flare-a11y-prefs-v1');
    var sp = new URLSearchParams(window.location.search);
    var urlParam = sp.get('a11y');
    var prefs = urlParam ? JSON.parse(atob(urlParam)) : (raw ? JSON.parse(raw) : null);
    var osReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefs && typeof prefs === 'object') {
      var scale = scaleMap[prefs.fontScale] || 1.0;
      var effectiveReduced = prefs.reducedMotion === 'on' || (prefs.reducedMotion !== 'off' && osReduced);
      root.style.setProperty('--flare-font-scale', String(scale));
      root.setAttribute('data-a11y-font-scale', prefs.fontScale || 'default');
      root.setAttribute('data-a11y-high-contrast', prefs.highContrast ? 'true' : 'false');
      root.setAttribute('data-a11y-reduced-motion', effectiveReduced ? 'true' : 'false');
      root.setAttribute('data-a11y-enhanced-focus', prefs.enhancedFocus ? 'true' : 'false');
      root.setAttribute('data-a11y-large-controls', prefs.largeControls ? 'true' : 'false');
      root.setAttribute('data-a11y-readable-spacing', prefs.readableSpacing ? 'true' : 'false');
    } else if (osReduced) {
      root.setAttribute('data-a11y-reduced-motion', 'true');
    }
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_INIT_SCRIPT }} />
        {/* Google Fonts preconnect */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Orbitron:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#080e1a] text-[#f8fafc] font-sans antialiased">
        <AccessibilityProvider>
          <a
            href="#flare-main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-amber-400 focus:text-slate-950 focus:font-bold focus:text-sm focus:shadow-lg"
          >
            Skip to main content
          </a>
          <div id="flare-main-content" className="min-w-0 w-full">
            {children}
          </div>
          <AccessibilityControlModal />
        </AccessibilityProvider>
      </body>
    </html>
  )
}
