import dynamic from 'next/dynamic'

// ScientificLab is the full client-side lab experience.
// It is loaded via dynamic import to avoid SSR issues with Three.js.
const ScientificLab = dynamic(
  () => import('@/components/science/ScientificLab'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#080e1a]">
        <div className="mb-6 animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500" />
        <p className="font-orbitron text-sm tracking-widest text-cyan-500/60 uppercase">
          Loading Scientific Lab...
        </p>
        <p className="mt-2 font-mono text-xs text-slate-600">
          Initializing combustion simulation engine
        </p>
      </div>
    ),
  }
)

export default function SciencePage() {
  return <ScientificLab />
}
