import dynamic from 'next/dynamic'

const KidsLab = dynamic(() => import('@/components/kids/KidsLab'), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg,#04070f 0%,#080d1a 50%,#060412 100%)' }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Animated FLARE logo */}
        <svg viewBox="0 0 40 48" width="48" height="58" aria-hidden="true">
          <defs>
            <linearGradient id="ll-fg" x1="0" y1="1" x2="0.5" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <path
            d="M20 4 C20 4 32 16 32 28 C32 36 26 44 20 44 C14 44 8 36 8 28 C8 16 20 4 20 4Z"
            fill="url(#ll-fg)"
            style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
          />
          <path
            d="M20 22 C20 22 26 28 26 34 C26 38.4 23.4 42 20 42 C16.6 42 14 38.4 14 34 C14 28 20 22 20 22Z"
            fill="white"
            opacity="0.4"
          />
        </svg>
        {/* Bouncing dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{
                background: ['#f97316', '#fbbf24', '#38bdf8'][i],
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        <p className="text-xs font-mono tracking-widest text-slate-500 uppercase">
          Launching Kids Lab…
        </p>
      </div>
    </div>
  ),
})

export default function KidsPage() {
  return <KidsLab />
}
